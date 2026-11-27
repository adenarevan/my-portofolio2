import { randomUUID } from 'node:crypto';
import { FieldValue, Timestamp } from './store.js';
import { collectCandidates, readableSources, hash, sameTopic, titleTokens, noCandidateMessage } from './sources.js';
import { DEFAULT_BOT_SETTINGS, jakartaDay, scheduledSlot, validateSettings } from './botConfig.js';
import { articleToPost } from './writer.js';

export const BOT_COLLECTIONS = { settings: 'portfolioBotSettings', runs: 'portfolioBotRuns', locks: 'portfolioBotLocks', topics: 'portfolioBotTopics', requests: 'portfolioBotRequests', status: 'portfolioBotStatus', daily: 'portfolioBotDaily' };
const committed = item => ['created', 'published'].includes(item.status);
export async function requireAdmin(db, uid) {
  if (!uid || (await db.collection('portfolioBlogAdmins').doc(uid).get()).data()?.enabled !== true) throw Object.assign(new Error('Akses khusus admin blog.'), { code: 'permission-denied' });
}
export async function updateBotSettings(db, uid, input, revision) {
  await requireAdmin(db, uid);
  const settings = validateSettings(input);
  const reference = db.collection(BOT_COLLECTIONS.settings).doc('main');
  return db.runTransaction(async tx => {
    const current = (await tx.get(reference)).data();
    if ((current?.revision || 0) !== revision) throw Object.assign(new Error('Pengaturan berubah di sesi lain. Muat ulang sebelum menyimpan.'), { code: 'aborted' });
    const next = { ...settings, authorId: uid, revision: revision + 1, updatedBy: uid, updatedAt: FieldValue.serverTimestamp() };
    tx.set(reference, next);
    return { revision: next.revision };
  });
}

export function createBotRunner({ db, workerId, generate, collect = collectCandidates, readSources = readableSources, now = () => new Date(), model = 'gemini-3.1-flash-lite' }) {
  return async function runBot({ trigger, uid, requestId }) {
    if (!workerId || (await db.collection('portfolioBotWorkers').doc(workerId).get()).data()?.enabled !== true) throw new Error('Akun runner belum diberi izin bot.');
    if (trigger === 'manual') await requireAdmin(db, uid);
    const settingsSnapshot = await db.collection(BOT_COLLECTIONS.settings).doc('main').get();
    const stored = settingsSnapshot.data();
    const settings = validateSettings(Object.fromEntries(Object.keys(DEFAULT_BOT_SETTINGS).map(key => [key, stored?.[key] ?? DEFAULT_BOT_SETTINGS[key]])));
    const autoPublish = settings.enabled && settings.autoPublish;
    const day = jakartaDay(now());
    const dailyRef = db.collection(BOT_COLLECTIONS.daily).doc(day);
    let dailyIds = autoPublish ? (await dailyRef.get()).data()?.postIds || [] : [];
    const slot = trigger === 'scheduled' ? scheduledSlot(settings, now()) : null;
    if (trigger === 'scheduled' && !slot) return { status: 'skipped', message: 'Bot nonaktif atau belum waktunya.' };
    if (autoPublish && dailyIds.length >= settings.dailyTarget) return { status: 'complete', message: `Target harian tercapai: ${dailyIds.length}/${settings.dailyTarget} artikel bot terbit hari ini (WIB).` };
    const runId = slot || `manual-${hash(`${uid}:${requestId}`)}`;
    const runRef = db.collection(BOT_COLLECTIONS.runs).doc(runId);
    const lockRef = db.collection(BOT_COLLECTIONS.locks).doc('runner');
    const leaseId = randomUUID();
    const started = now();
    const acquired = await db.runTransaction(async tx => {
      const [runSnapshot, lockSnapshot, dailySnapshot] = await Promise.all([tx.get(runRef), tx.get(lockRef), ...(autoPublish ? [tx.get(dailyRef)] : [Promise.resolve(null)])]);
      const ids = dailySnapshot?.data()?.postIds || [];
      if (autoPublish && ids.length >= settings.dailyTarget) return { existing: { status: 'complete', message: `Target harian tercapai: ${ids.length}/${settings.dailyTarget} artikel bot terbit hari ini (WIB).` } };
      const previous = runSnapshot.data(); const lock = lockSnapshot.data();
      if (previous && ['created', 'published', 'skipped', 'partial'].includes(previous.status)) return { existing: previous };
      if (autoPublish && trigger === 'scheduled' && previous?.status === 'failed') return { existing: previous };
      if (previous?.status === 'failed' && (trigger === 'manual' || previous.attempt >= 3)) return { existing: previous };
      if (lock?.expiresAt?.toMillis() > started.getTime()) {
        if (previous?.status === 'running') return { existing: previous };
        return { existing: { status: 'busy', message: 'Eksekusi lain masih berjalan; antrean akan dicoba lagi.' } };
      }
      tx.set(lockRef, { leaseId, runId, expiresAt: Timestamp.fromMillis(started.getTime() + 12 * 60000) });
      const carried = previous?.items?.filter(committed) || [];
      tx.set(runRef, { status: 'running', message: 'Mencari liputan dari beberapa sumber…', trigger, requestedBy: uid || stored?.authorId || '', startedAt: FieldValue.serverTimestamp(), finishedAt: null, attempt: (previous?.attempt || 0) + 1, items: carried, diagnostics: [], settings });
      return { acquired: true, carried, dailyIds: ids };
    });
    if (!acquired.acquired) return { runId, status: acquired.existing.status, message: acquired.existing.message };
    dailyIds = acquired.dailyIds;

    const items = [...acquired.carried]; const diagnostics = []; let stats = {}; let status = 'skipped'; let message = '';
    try {
      const authorId = autoPublish ? stored?.authorId : trigger === 'manual' ? uid : stored?.authorId;
      await requireAdmin(db, authorId);
      const cache = {
        read: async id => (await db.collection('portfolioBotSourceCache').doc(id).get()).data()?.items || [],
        write: (id, entries) => db.collection('portfolioBotSourceCache').doc(id).set({ items: entries, updatedAt: FieldValue.serverTimestamp() }),
      };
      const discovery = await collect(settings, diagnostics, started, undefined, cache); stats = discovery.stats;
      const [historySnapshot, postsSnapshot] = await Promise.all([
        db.collection(BOT_COLLECTIONS.topics).get(), db.collection('portfolioPosts').select('title', 'slug', 'sources').get(),
      ]);
      const history = historySnapshot.docs.map(doc => doc.data());
      const posts = postsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      const usedUrls = new Set([...history.flatMap(topic => topic.urls || []), ...posts.flatMap(post => (post.sources || []).map(source => source.url))]);
      let created = acquired.carried.length; let attempted = 0; let generated = 0;
      const capacity = autoPublish ? Math.min(settings.maxArticles, settings.dailyTarget - dailyIds.length + acquired.carried.length) : settings.maxArticles;
      for (const candidate of discovery.candidates) {
        if (created >= capacity || generated >= capacity || attempted >= settings.maxArticles + 6) break;
        const historyMatch = history.find(topic => sameTopic(topic.tokens, candidate.tokens) || candidate.items.some(item => topic.urls?.includes(item.url)));
        const existingPost = posts.find(post => post.id === historyMatch?.postId || sameTopic(titleTokens(post.title), candidate.tokens) || candidate.items.some(item => post.sources?.some(source => source.url === item.url)));
        const duplicate = existingPost || historyMatch || candidate.items.some(item => usedUrls.has(item.url));
        if (duplicate) { items.push({ status: 'skipped', title: existingPost?.title || candidate.title, reason: 'Topik atau sumber sudah pernah dibuat.', ...(existingPost ? { postId: existingPost.id, existingStatus: existingPost.status } : {}) }); continue; }
        attempted++;
        const sources = await readSources(candidate, diagnostics);
        if (new Set(sources.map(source => source.publisher)).size < 2) { items.push({ status: 'skipped', title: candidate.title, reason: 'Kurang dari dua penerbit independen dengan bahan yang dapat dibaca.' }); continue; }
        const reason = `Dibahas oleh ${sources.map(source => source.sourceName).join(', ')} dalam ${settings.windowHours} jam terakhir, sesuai kategori dan wilayah ${settings.region}. Sinyal RSS, bukan volume pencarian Google.`;
        await runRef.update({ message: `Menulis draf: ${candidate.title.slice(0, 100)}`, diagnostics });
        try {
          generated++;
          const article = await generate({ ...candidate, reason }, sources);
          if (posts.some(post => post.slug === article.slug || sameTopic(titleTokens(post.title), titleTokens(article.title)))) { items.push({ status: 'skipped', title: candidate.title, reason: 'Judul atau slug hasil AI sudah ada.' }); continue; }
          const data = articleToPost(article, sources, candidate.categories[0]);
          if (autoPublish) { data.status = 'published'; data.publishedAt = FieldValue.serverTimestamp(); }
          const topicKey = hash(candidate.tokens.join('|')); const postId = `bot_${topicKey}`;
          const topicRef = db.collection(BOT_COLLECTIONS.topics).doc(topicKey);
          const postRef = db.collection('portfolioPosts').doc(postId);
          await db.runTransaction(async tx => {
            const [lock, topic, existing, admin, currentSettings, daily] = await Promise.all([tx.get(lockRef), tx.get(topicRef), tx.get(postRef), tx.get(db.collection('portfolioBlogAdmins').doc(authorId)), tx.get(db.collection(BOT_COLLECTIONS.settings).doc('main')), ...(autoPublish ? [tx.get(dailyRef)] : [Promise.resolve(null)])]);
            if (lock.data()?.leaseId !== leaseId || lock.data()?.expiresAt?.toMillis() <= now().getTime()) throw new Error('Eksekusi kehilangan kunci; hasil tidak disimpan.');
            if (admin.data()?.enabled !== true) throw new Error('Izin admin telah dicabut; hasil tidak disimpan.');
            if (trigger === 'scheduled' && !currentSettings.data()?.enabled) throw new Error('Jadwal telah dinonaktifkan; hasil tidak disimpan.');
            if (autoPublish) {
              const current = currentSettings.data(); const ids = daily?.data()?.postIds || [];
              if (!current?.enabled || !current.autoPublish || current.authorId !== authorId) throw new Error('Publikasi otomatis dinonaktifkan; hasil tidak diterbitkan.');
              if (day !== jakartaDay(now())) throw new Error('Tanggal WIB berganti; hasil akan dicoba pada hari berikutnya.');
              if (ids.length >= current.dailyTarget) throw new Error('Target harian sudah tercapai; hasil tidak diterbitkan lagi.');
              tx.set(dailyRef, { postIds: [...ids, postId], updatedAt: FieldValue.serverTimestamp() });
            }
            if (topic.exists || existing.exists) throw new Error('Draf topik ini sudah ada; tidak dibuat ulang.');
            tx.create(postRef, { ...data, authorId, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), bot: { runId, topicKey, workerId, selectionReason: reason, provider: 'rss', model, generatedAt: FieldValue.serverTimestamp(), ...(autoPublish ? { publicationDay: day } : {}) } });
            tx.create(topicRef, { tokens: candidate.tokens, urls: sources.map(source => source.url), postId, runId, createdAt: FieldValue.serverTimestamp() });
            // Persist result atomically with the draft so a crash still leaves a trace.
            tx.update(runRef, { items: FieldValue.arrayUnion({ status: autoPublish ? 'published' : 'created', title: data.title, postId, reason }) });
          });
          created++; sources.forEach(source => usedUrls.add(source.url)); history.push({ tokens: candidate.tokens, urls: sources.map(source => source.url), postId }); posts.push({ ...data, id: postId });
          items.push({ status: autoPublish ? 'published' : 'created', title: data.title, postId, reason });
        } catch (error) { items.push({ status: 'failed', title: candidate.title, reason: error.message.slice(0, 240) }); }
      }
      const failures = items.filter(item => item.status === 'failed').length;
      if (created) { status = failures ? 'partial' : autoPublish ? 'published' : 'created'; message = autoPublish ? `${created} artikel terbit otomatis. Hari ini ${dailyIds.length + created - acquired.carried.length}/${settings.dailyTarget} artikel bot (WIB).` : `${created} draf dibuat. Tinjau di editor sebelum diterbitkan.`; }
      else if (failures || diagnostics.filter(item => item.stage === 'rss' && item.status === 'ok').length === 0) { status = 'failed'; message = failures ? `Penulisan gagal: ${items.find(item => item.status === 'failed').reason}`.slice(0, 320) : 'Semua feed gagal dibaca. Coba lagi nanti.'; }
      else message = items.some(item => item.postId) ? 'Topik yang cocok sudah memiliki artikel. Buka hasil yang sudah ada di editor.' : discovery.candidates.length ? 'Tidak ada topik baru dengan bahan sumber yang cukup.' : noCandidateMessage(stats, settings);
    } catch (error) { status = 'failed'; message = error.message.slice(0, 240); }
    await db.runTransaction(async tx => {
      const [lock, record] = await Promise.all([tx.get(lockRef), tx.get(runRef)]);
      if (lock.data()?.leaseId !== leaseId) return;
      // Preserve drafts committed just before an interrupted attempt.
      const saved = record.data()?.items?.filter(committed) || [];
      for (const item of saved) if (!items.some(result => result.postId === item.postId)) items.push(item);
      if (saved.length && status === 'failed') { status = 'partial'; message = `${saved.length} artikel ${autoPublish ? 'terbit' : 'tersimpan'}; eksekusi juga mengalami kegagalan.`; }
      tx.update(runRef, { status, message, items, diagnostics, filterStats: stats, finishedAt: FieldValue.serverTimestamp() });
      tx.delete(lockRef);
    });
    return { runId, status, message };
  };
}
