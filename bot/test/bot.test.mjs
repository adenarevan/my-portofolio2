import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { FirestoreStore, FieldValue } from '../src/store.js';
import { DEFAULT_BOT_SETTINGS, jakartaDay, scheduledSlot, validateSettings, RSS_SOURCES } from '../src/botConfig.js';
import { canonicalUrl, parseFeed, selectCandidates, sameTopic, titleTokens, collectCandidates, readableSources, noCandidateMessage } from '../src/sources.js';
import { articleToPost, validateArticle, writeArticle } from '../src/writer.js';
import { BOT_COLLECTIONS, createBotRunner, updateBotSettings } from '../src/engine.js';
import { processBotTick } from '../src/queue.js';

const date = new Date('2026-11-26T01:05:00Z');
const sourceItems = [
  { id: 'S1', sourceId: 'antara', sourceName: 'ANTARA', publisher: 'antara', region: 'ID', title: 'OpenAI rilis GPT-5.2 untuk pengembang', url: 'https://www.antaranews.com/berita/123/openai', publishedAt: date.toISOString(), tokens: titleTokens('OpenAI rilis GPT-5.2 untuk pengembang'), summary: 'Kecerdasan buatan untuk pengembang. '.repeat(20), text: 'Bahan sumber pertama. '.repeat(20), material: 'rss-summary' },
  { id: 'S2', sourceId: 'cnn', sourceName: 'CNN', publisher: 'ctcorp', region: 'ID', title: 'GPT-5.2 diluncurkan OpenAI bagi pengembang', url: 'https://www.cnnindonesia.com/teknologi/123/openai', publishedAt: date.toISOString(), tokens: titleTokens('GPT-5.2 diluncurkan OpenAI bagi pengembang'), summary: 'OpenAI mengembangkan kecerdasan buatan. '.repeat(20), text: 'Bahan sumber kedua. '.repeat(20), material: 'rss-summary' },
];
const article = { title: 'Memahami GPT-5.2 dari OpenAI', slug: 'memahami-gpt-5-2-openai', excerpt: 'Ringkasan uji.', metaDescription: 'Meta description artikel uji.', sections: [{ heading: 'Perkembangan', paragraphs: ['Bahan sumber menjelaskan perkembangan kecerdasan buatan untuk pengembang. Ini merupakan paragraf uji.'], sourceIds: ['S1'] }, { heading: 'Konteks', paragraphs: ['Liputan lain memberi konteks tambahan untuk dibaca dan ditinjau kembali sebelum dipublikasikan.'], sourceIds: ['S2'] }] };
const candidate = { title: sourceItems[0].title, tokens: sourceItems[0].tokens, items: sourceItems, categories: ['ai'] };

test('Defaults are disabled and Jakarta schedule reads changes without redeploy', () => {
  assert.equal(DEFAULT_BOT_SETTINGS.enabled, false);
  assert.equal(scheduledSlot(DEFAULT_BOT_SETTINGS, date), null);
  const settings = { ...DEFAULT_BOT_SETTINGS, enabled: true };
  assert.equal(scheduledSlot(settings, date), 'scheduled-2026-11-26');
  assert.equal(scheduledSlot({ ...settings, time: '09:00' }, date), null);
  assert.equal(scheduledSlot({ ...settings, days: [4] }, date), 'scheduled-2026-11-26');
  assert.equal(scheduledSlot({ ...settings, days: [5] }, date), null);
  assert.equal(scheduledSlot(settings, new Date('2026-11-26T02:01:00Z')), null);
});
test('All categories admit general news; auto schedule catches up after the old one-hour window in WIB', () => {
  assert.deepEqual(DEFAULT_BOT_SETTINGS.categories, ['all']);
  assert.equal(DEFAULT_BOT_SETTINGS.autoPublish, false);
  assert.equal(DEFAULT_BOT_SETTINGS.dailyTarget, 2);
  const items = sourceItems.map(item => ({ ...item, title: 'Juventus menang atas Omonia Nicosia', summary: 'Hasil pertandingan liga.', tokens: titleTokens('Juventus menang atas Omonia Nicosia') }));
  assert.equal(selectCandidates(items, DEFAULT_BOT_SETTINGS, date).candidates.length, 1);
  assert.equal(selectCandidates(items, { ...DEFAULT_BOT_SETTINGS, categories: ['ai'] }, date).candidates.length, 0);
  const settings = { ...DEFAULT_BOT_SETTINGS, enabled: true, autoPublish: true };
  assert.equal(scheduledSlot(settings, new Date('2026-11-26T00:59:00Z')), null);
  assert.equal(scheduledSlot(settings, new Date('2026-11-26T10:05:00Z')), 'scheduled-2026-11-26-17');
  assert.equal(scheduledSlot(settings, new Date('2026-11-26T16:59:00Z')), 'scheduled-2026-11-26-23');
  assert.equal(scheduledSlot(settings, new Date('2026-11-26T17:00:00Z')), null);
  assert.equal(jakartaDay(new Date('2026-12-31T17:00:00Z')), '2027-1-1');
});
test('ANTARA post-content is readable and another article from a failed publisher can be tried', async () => {
  const logs = [];
  const first = { ...sourceItems[0], summary: '', url: sourceItems[0].url + '-unavailable' };
  const sources = await readableSources({ ...candidate, items: [first, ...sourceItems] }, logs, async url => {
    if (url.endsWith('-unavailable')) throw new Error('HTTP 503');
    return { text: `<html><div class="post-content"><p>${'Bahan artikel independen yang dapat dibaca. '.repeat(12)}</p></div></html>` };
  });
  assert.equal(sources.length, 2);
  assert.ok(sources.every(s => s.material === 'article'));
});
test('Rotating feeds retain recent candidates across ticks, apply freshness and keep publishers independent', async () => {
  const saved = new Map();
  const cache = { read: async id => saved.get(id), write: async (id, items) => saved.set(id, items) };
  const settings = { ...DEFAULT_BOT_SETTINGS, sourceIds: ['antara-news', 'cnn-news'] };
  const rss = item => `<rss><channel><item><title>${item.title}</title><link>${item.url}</link><pubDate>${date.toUTCString()}</pubDate><description>${item.summary}</description></item></channel></rss>`;
  const empty = { text: '<rss><channel></channel></rss>' };
  const a = await collectCandidates(settings, [], date, async (_, s) => s.id === 'antara-news' ? { text: rss(sourceItems[0]) } : empty, cache);
  assert.equal(a.candidates.length, 0);
  const b = await collectCandidates(settings, [], date, async (_, s) => s.id === 'cnn-news' ? { text: rss(sourceItems[1]) } : empty, cache);
  assert.equal(b.candidates.length, 1);
  const expired = await collectCandidates(settings, [], new Date(date.getTime() + 25 * 3600000), async () => empty, cache);
  assert.equal(expired.candidates.length, 0);
  assert.ok([...saved.values()].every(items => items.length <= 150));
});
test('Settings validate category, region, timezone, article bound and independent publishers', () => {
  assert.deepEqual(validateSettings(DEFAULT_BOT_SETTINGS), DEFAULT_BOT_SETTINGS);
  for (const override of [{ categories: [] }, { region: 'bogus' }, { timeZone: 'UTC' }, { time: '25:00' }, { maxArticles: 50 }, { sourceIds: ['cnn', 'cnbc'] }, { apiKey: 'forbidden' }]) assert.throws(() => validateSettings({ ...DEFAULT_BOT_SETTINGS, ...override }));
});
test('RSS and Atom are parsed; unsafe URLs, XML entities and invalid dates are rejected', () => {
  const xml = `<rss><channel><item><title>OpenAI GPT-5.2</title><link>${sourceItems[0].url}?utm_source=x</link><pubDate>${date.toUTCString()}</pubDate><description><![CDATA[<p>Isi sumber</p>]]></description></item></channel></rss>`;
  const [entry] = parseFeed(xml, RSS_SOURCES[0]);
  assert.equal(entry.url, sourceItems[0].url); assert.equal(entry.summary, 'Isi sumber');
  const atom = `<feed><entry><title>OpenAI GPT</title><link rel="alternate" href="https://www.theverge.com/news/test"/><published>${date.toISOString()}</published><summary>Ringkasan</summary></entry></feed>`;
  assert.equal(parseFeed(atom, RSS_SOURCES[4]).length, 1);
  assert.throws(() => parseFeed('<!DOCTYPE rss><rss/>', RSS_SOURCES[0]));
  for (const url of ['http://127.0.0.1/', 'https://metadata.google.internal/', 'https://www.antaranews.com.evil.test/', 'https://www.antaranews.com:8080/x', 'https://user:pass@www.antaranews.com/x']) assert.equal(canonicalUrl(url, RSS_SOURCES[0]), null);
});
test('RSS consensus filters category, region, recency and publisher ownership', () => {
  assert.equal(selectCandidates(sourceItems, DEFAULT_BOT_SETTINGS, date).candidates.length, 1);
  assert.equal(selectCandidates(sourceItems, { ...DEFAULT_BOT_SETTINGS, categories: ['programming'] }, date).candidates.length, 1); // pengembang
  assert.equal(selectCandidates(sourceItems.map(item => ({ ...item, title: 'Skor sepak bola', summary: 'Pertandingan liga nasional', tokens: ['liga', 'nasional'] })), { ...DEFAULT_BOT_SETTINGS, categories: ['ai'] }, date).candidates.length, 0);
  assert.equal(selectCandidates(sourceItems.map(item => ({ ...item, region: 'GLOBAL' })), { ...DEFAULT_BOT_SETTINGS, region: 'ID' }, date).candidates.length, 0);
  assert.equal(selectCandidates(sourceItems.map(item => ({ ...item, publisher: 'ctcorp' })), DEFAULT_BOT_SETTINGS, date).candidates.length, 0);
  assert.equal(selectCandidates(sourceItems, DEFAULT_BOT_SETTINGS, new Date(date.getTime() + 25 * 3600000)).candidates.length, 0);
  assert.ok(sameTopic(sourceItems[0].tokens, sourceItems[1].tokens));
  assert.equal(sameTopic(titleTokens('OpenAI GPT-5.1 pengembang'), titleTokens('OpenAI GPT-5.2 pengembang')), false);
});
test('A failing feed is logged and a readable RSS summary can back up an unavailable article', async () => {
  const diagnostics = [];
  await collectCandidates(DEFAULT_BOT_SETTINGS, diagnostics, date, async () => { throw new Error('HTTP 503'); });
  assert.equal(new Set(diagnostics.filter(item => item.status === 'failed').map(item => item.source)).size, RSS_SOURCES.length);
  const sources = await readableSources(candidate, diagnostics, async () => { throw new Error('HTTP 403'); });
  assert.equal(sources.length, 2); assert.equal(sources[0].material, 'rss-summary');
});

test('Stale ANTARA feed falls back to its official latest feed and reports freshness', async () => {
  const logs = [], urls = [];
  const xml = (item, time) => `<rss><channel><item><title>${item.title}</title><link>${item.url}</link><pubDate>${time.toUTCString()}</pubDate><description>${item.summary}</description></item></channel></rss>`;
  const result = await collectCandidates({ ...DEFAULT_BOT_SETTINGS, region: 'ID', sourceIds: ['antara', 'cnn', 'cnbc'] }, logs, date, async url => {
    urls.push(url);
    if (url.includes('antaranews.com/rss/tekno.xml')) return { text: xml(sourceItems[0], new Date(date.getTime() - 4 * 86400000)) };
    if (url.includes('antaranews.com/rss/terkini.xml')) return { text: xml(sourceItems[0], date) };
    return { text: xml(sourceItems[1], date) };
  });
  assert.ok(urls.includes('https://www.antaranews.com/rss/terkini.xml'));
  assert.equal(logs.find(item => item.feedUrl.endsWith('/tekno.xml')).recentCount, 0);
  assert.equal(logs.find(item => item.feedUrl.endsWith('/terkini.xml')).recentCount, 1);
  assert.equal(result.candidates.length, 1); assert.equal(result.stats.independentPublishers, 2);
  assert.equal(result.stats.eligible, 2); assert.equal(result.stats.total, 3);
});

test('Skip explanations distinguish no fresh match, one publisher, and unrelated events', () => {
  const one = selectCandidates(sourceItems.map(item => ({ ...item, publisher: 'ctcorp' })), DEFAULT_BOT_SETTINGS, date);
  assert.match(noCandidateMessage(one.stats, DEFAULT_BOT_SETTINGS), /hanya dari 1 grup penerbit/);
  assert.match(noCandidateMessage({ eligible: 0 }, DEFAULT_BOT_SETTINGS), /24 jam terakhir/);
  assert.match(noCandidateMessage({ eligible: 3, independentPublishers: 2 }, { ...DEFAULT_BOT_SETTINGS, region: 'GLOBAL' }), /satu kejadian/);
});
test('AI contract uses server-only structured responses and rejects fabricated source IDs or URLs', async () => {
  let request;
  const generated = await writeArticle(candidate, sourceItems, { apiKey: 'test-key', fetchImpl: async (url, options) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent'); request = JSON.parse(options.body);
    assert.equal(options.headers['x-goog-api-key'], 'test-key');
    return new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(article) }] } }] }));
  } });
  assert.equal(request.generationConfig.responseMimeType, 'application/json'); assert.ok(request.generationConfig.responseJsonSchema);
  assert.deepEqual(generated, article);
  assert.throws(() => validateArticle({ ...article, sections: [{ ...article.sections[0], sourceIds: ['invented'] }, article.sections[1]] }, sourceItems));
  assert.throws(() => validateArticle({ ...article, sections: [{ ...article.sections[0], paragraphs: ['Claim https://invented.example.org/ with a made-up link.'] }, article.sections[1]] }, sourceItems));
  const post = articleToPost(article, sourceItems, 'ai');
  assert.equal(post.status, 'draft'); assert.equal(post.publishedAt, null); assert.match(post.body, /^tiptap:v1:/); assert.equal(post.sources.length, 2);
  const image = JSON.parse(post.body.slice('tiptap:v1:'.length)).content[0];
  assert.equal(image.type, 'image'); assert.equal(image.attrs.src, '/blog-media/computing.jpg'); assert.ok(image.attrs.alt); assert.ok(image.attrs.creditUrl.startsWith('https://commons.wikimedia.org/'));
  await assert.rejects(writeArticle(candidate, sourceItems, { apiKey: 'test', fetchImpl: async () => new Response('no', { status: 429 }) }), /HTTP 429/);
});

test('Temporary Gemini failures retry with bounded backoff; quota errors never loop', async () => {
  let calls = 0; const waits = [];
  const result = await writeArticle(candidate, sourceItems, { apiKey: 'test', wait: async ms => waits.push(ms), fetchImpl: async () => {
    calls++;
    return calls < 3 ? new Response('unavailable', { status: 503 }) : new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(article) }] } }] }));
  } });
  assert.deepEqual(result, article); assert.equal(calls, 3); assert.deepEqual(waits, [1000, 2000]);
  calls = 0;
  await assert.rejects(writeArticle(candidate, sourceItems, { apiKey: 'test', wait: async () => {}, fetchImpl: async () => { calls++; return new Response('unavailable', { status: 503 }); } }), /503.*3 kali/);
  assert.equal(calls, 3); calls = 0;
  await assert.rejects(writeArticle(candidate, sourceItems, { apiKey: 'test', wait: async () => { throw Error('must not wait'); }, fetchImpl: async () => { calls++; return new Response('quota', { status: 429 }); } }), /429/);
  assert.equal(calls, 1);
});

const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const testProject = 'demo-portfolio-bot-tests';
let environment, db, adminDb;
before(async () => {
  if (!emulator) return;
  assert.match(testProject, /^demo-/);
  environment = await initializeTestEnvironment({ projectId: testProject, firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('../firestore.rules', 'utf8') } });
  db = new FirestoreStore(environment.authenticatedContext('worker').firestore());
  adminDb = new FirestoreStore(environment.authenticatedContext('owner').firestore());
});
beforeEach(async () => {
  if (!emulator) return;
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async context => {
    const bypass = new FirestoreStore(context.firestore());
    await bypass.collection('portfolioBlogAdmins').doc('owner').set({ enabled: true });
    await bypass.collection('portfolioBotWorkers').doc('worker').set({ enabled: true });
  });
});
after(async () => { await environment?.cleanup(); });
const fixtureRunner = options => createBotRunner({ db, workerId: 'worker', now: () => date, collect: async (settings, diagnostics) => { diagnostics.push({ stage: 'rss', status: 'ok' }); return { candidates: [candidate], stats: {} }; }, readSources: async () => sourceItems, generate: async () => article, ...options });
const manual = id => ({ trigger: 'manual', uid: 'owner', requestId: id || 'manual-request-123456' });

test('Backend denies non-admin settings and execution', { skip: !emulator }, async () => {
  await assert.rejects(updateBotSettings(adminDb, 'reader', DEFAULT_BOT_SETTINGS, 0));
  await assert.rejects(fixtureRunner()({ ...manual(), uid: 'reader' }), /admin/);
  await assert.rejects(fixtureRunner()({ trigger: 'manual' }), /admin/);
});
test('Manual and scheduled executions share a lock, create editable drafts, and prevent duplicates', { skip: !emulator }, async () => {
  await updateBotSettings(adminDb, 'owner', { ...DEFAULT_BOT_SETTINGS, enabled: true }, 0);
  let calls = 0;
  const run = fixtureRunner({ generate: async () => { calls++; await new Promise(resolve => setTimeout(resolve, 120)); return article; } });
  const results = await Promise.all([run(manual()), run({ trigger: 'scheduled' })]);
  assert.equal(calls, 1); assert.ok(results.some(result => result.status === 'created'));
  const posts = await db.collection('portfolioPosts').get(); assert.equal(posts.size, 1);
  const post = posts.docs[0].data(); assert.equal(post.status, 'draft'); assert.equal(post.authorId, 'owner'); assert.ok(post.bot.selectionReason);
  const repeated = await run(manual('manual-repeat-123456'));
  assert.equal(repeated.status, 'skipped'); assert.equal((await db.collection('portfolioPosts').get()).size, 1);
  const duplicateLog = (await db.collection(BOT_COLLECTIONS.runs).doc(repeated.runId).get()).data();
  assert.equal(duplicateLog.items[0].postId, posts.docs[0].id); assert.equal(duplicateLog.items[0].existingStatus, 'draft');
  // Existing run requests replay their result without generating again.
  await run(manual()); assert.equal(calls, 1);
});
test('No matching trend skips cleanly and provider failures stay traceable/retryable', { skip: !emulator }, async () => {
  const none = fixtureRunner({ collect: async (_, logs) => { logs.push({ stage: 'rss', status: 'ok' }); return { candidates: [], stats: { category: 2 } }; } });
  assert.equal((await none(manual())).status, 'skipped');
  const failure = fixtureRunner({ generate: async () => { throw new Error('HTTP 429 fixture'); } });
  const failed = await failure(manual('failed-request-123456'));
  assert.equal(failed.status, 'failed');
  const log = (await db.collection(BOT_COLLECTIONS.runs).doc(failed.runId).get()).data(); assert.match(log.items[0].reason, /429/);
  assert.equal((await fixtureRunner()(manual('retry-request-123456'))).status, 'created');
});
test('Schedule edits apply immediately; runs are once per Jakarta date, retries capped', { skip: !emulator }, async () => {
  await updateBotSettings(adminDb, 'owner', { ...DEFAULT_BOT_SETTINGS, enabled: true, time: '09:00' }, 0);
  assert.equal((await fixtureRunner()({ trigger: 'scheduled' })).status, 'skipped');
  await updateBotSettings(adminDb, 'owner', { ...DEFAULT_BOT_SETTINGS, enabled: true }, 1);
  assert.equal((await fixtureRunner()({ trigger: 'scheduled' })).status, 'created');
  assert.equal((await fixtureRunner()({ trigger: 'scheduled' })).status, 'created');
  assert.equal((await db.collection('portfolioPosts').get()).size, 1);
  await assert.rejects(updateBotSettings(adminDb, 'owner', DEFAULT_BOT_SETTINGS, 0), /sesi lain/);
});

test('Scheduled AI failures retry at most three times for a daily slot', { skip: !emulator }, async () => {
  await updateBotSettings(adminDb, 'owner', { ...DEFAULT_BOT_SETTINGS, enabled: true }, 0);
  let calls = 0;
  const run = fixtureRunner({ generate: async () => { calls++; throw new Error('API fixture unavailable'); } });
  for (let i = 0; i < 4; i++) assert.equal((await run({ trigger: 'scheduled' })).status, 'failed');
  assert.equal(calls, 3);
  assert.equal((await db.collection(BOT_COLLECTIONS.runs).doc('scheduled-2026-11-26').get()).data().attempt, 3);
});

test('Crash recovery preserves atomically committed drafts and durable history survives deletion', { skip: !emulator }, async () => {
  const result = await fixtureRunner()(manual());
  await db.collection(BOT_COLLECTIONS.runs).doc(result.runId).update({ status: 'running' });
  const recovered = await fixtureRunner({ generate: async () => { throw new Error('Must not generate again'); } })(manual());
  assert.equal(recovered.status, 'created');
  const posts = await db.collection('portfolioPosts').get(); assert.equal(posts.size, 1);
  await adminDb.collection('portfolioPosts').doc(posts.docs[0].id).delete();
  const deletedRetry = await fixtureRunner()(manual('deleted-draft-retry-1234'));
  assert.equal(deletedRetry.status, 'skipped');
  assert.equal((await db.collection(BOT_COLLECTIONS.runs).doc(deletedRetry.runId).get()).data().items[0].postId, undefined);
  assert.equal((await db.collection('portfolioPosts').get()).size, 0);
});

test('Revoking admin access during generation prevents committing a bot draft', { skip: !emulator }, async () => {
  const result = await fixtureRunner({ generate: async () => { await environment.withSecurityRulesDisabled(async context => new FirestoreStore(context.firestore()).collection('portfolioBlogAdmins').doc('owner').update({ enabled: false })); return article; } })(manual());
  assert.equal(result.status, 'failed');
  assert.equal((await db.collection('portfolioPosts').get()).size, 0);
});

test('Maximum articles bounds both generated drafts and paid AI calls', { skip: !emulator }, async () => {
  await updateBotSettings(adminDb, 'owner', { ...DEFAULT_BOT_SETTINGS, maxArticles: 2 }, 0);
  const candidates = ['OpenAI GPT-5.2 developer tools', 'Google Gemini-3.1 coding tools', 'Anthropic Claude-4.5 developer tools'].map((title, index) => ({ title, tokens: titleTokens(title), categories: ['ai'], items: sourceItems.map(source => ({ ...source, title, url: `${source.url}-${index}` })) }));
  let calls = 0;
  const result = await fixtureRunner({ collect: async (_, logs) => { logs.push({ stage: 'rss', status: 'ok' }); return { candidates, stats: {} }; }, readSources: async candidate => candidate.items, generate: async topic => { calls++; return { ...article, title: topic.title, slug: `topic-${calls}` }; } })(manual());
  assert.equal(result.status, 'created'); assert.equal(calls, 2);
  assert.equal((await db.collection('portfolioPosts').get()).size, 2);
});

test('GitHub tick claims an admin request, runs the same engine and completes the queue idempotently', { skip: !emulator }, async () => {
  const ref = adminDb.collection(BOT_COLLECTIONS.requests).doc('owner');
  await ref.set({ requestedBy: 'owner', requestId: 'queued-request-123456789', status: 'queued', createdAt: FieldValue.serverTimestamp(), completedAt: null, resultRunId: null, message: 'Menunggu' });
  const run = fixtureRunner();
  const results = await processBotTick({ db, workerId: 'worker', run });
  assert.ok(results.some(result => result.status === 'created'));
  const request = (await ref.get()).data(); assert.equal(request.status, 'done'); assert.ok(request.resultRunId);
  assert.equal((await db.collection('portfolioPosts').get()).size, 1);
  await processBotTick({ db, workerId: 'worker', run });
  assert.equal((await db.collection('portfolioPosts').get()).size, 1);
  assert.equal((await db.collection(BOT_COLLECTIONS.status).doc('runner').get()).data().scheduler, 'github-actions');
});

const broadCandidates = ['Juventus menang atas Omonia Nicosia', 'Tim Freeport temukan kepiting Papua', 'Emas Antam menguat Jumat pagi'].map((title, index) => ({ title, tokens: titleTokens(title), categories: [index === 0 ? 'sports' : 'news'], items: sourceItems.map(s => ({ ...s, title, url: `${s.url}-daily-${index}` })) }));
const autoOptions = (extra = {}) => ({ now: () => new Date(), collect: async (_, logs) => { logs.push({ stage: 'rss', status: 'ok' }); return { candidates: broadCandidates, stats: {} }; }, readSources: async c => c.items, generate: async c => ({ ...article, title: c.title, slug: c.title.toLowerCase().replaceAll(' ', '-') }), ...extra });
const enableAuto = () => updateBotSettings(adminDb, 'owner', { ...DEFAULT_BOT_SETTINGS, enabled: true, autoPublish: true, time: '00:00' }, 0);

test('Auto mode publishes exactly two readable public articles, caps manual/scheduled overlap and replays', { skip: !emulator }, async () => {
  await enableAuto(); let calls = 0;
  const options = autoOptions();
  const run = fixtureRunner({ ...options, generate: async c => { calls++; return options.generate(c); } });
  const results = await Promise.all([run(manual()), run({ trigger: 'scheduled' })]);
  assert.ok(results.some(r => r.status === 'published'), JSON.stringify(results));
  assert.equal(calls, 2);
  const posts = await db.collection('portfolioPosts').get(); assert.equal(posts.size, 2);
  for (const p of posts.docs) {
    assert.equal(p.data().status, 'published'); assert.ok(p.data().publishedAt);
    assert.equal(p.data().bot.publicationDay, jakartaDay());
    assert.ok((await new FirestoreStore(environment.unauthenticatedContext().firestore()).collection('portfolioPosts').doc(p.id).get()).exists);
  }
  assert.equal((await db.collection(BOT_COLLECTIONS.daily).doc(jakartaDay()).get()).data().postIds.length, 2);
  assert.equal((await run(manual('manual-another-123456'))).status, 'complete');
  assert.equal((await run({ trigger: 'scheduled' })).status, 'complete'); assert.equal(calls, 2);
});

test('An empty morning or partial publication catches up in the next hourly slot without duplicating saved posts', { skip: !emulator }, async () => {
  await enableAuto();
  const current = new Date();
  let hour = new Date(current.getTime()); hour.setUTCHours(2, 0, 0, 0);
  const options = autoOptions(); let available = [];
  const run = fixtureRunner({ ...options, now: () => hour, collect: async (_, logs) => { logs.push({ stage: 'rss', status: 'ok' }); return { candidates: available, stats: {} }; } });
  assert.equal((await run({ trigger: 'scheduled' })).status, 'skipped');
  available = broadCandidates.slice(0, 1); hour = new Date(hour.getTime() + 3600000);
  assert.equal((await run({ trigger: 'scheduled' })).status, 'published');
  assert.equal((await db.collection('portfolioPosts').get()).size, 1);
  available = broadCandidates; hour = new Date(hour.getTime() + 3600000);
  assert.equal((await run({ trigger: 'scheduled' })).status, 'published');
  assert.equal((await db.collection('portfolioPosts').get()).size, 2);
});

test('Disabling automatic publication during generation prevents publication; manual drafts remain unchanged', { skip: !emulator }, async () => {
  await enableAuto();
  const result = await fixtureRunner(autoOptions({ generate: async c => { await updateBotSettings(adminDb, 'owner', { ...DEFAULT_BOT_SETTINGS, enabled: true, autoPublish: false, time: '00:00' }, 1); return { ...article, title: c.title }; } }))(manual());
  assert.equal(result.status, 'failed'); assert.equal((await db.collection('portfolioPosts').get()).size, 0);
  const draft = await fixtureRunner()(manual('draft-after-disable-123456'));
  assert.equal(draft.status, 'created');
  assert.equal((await db.collection('portfolioPosts').get()).docs[0].data().status, 'draft');
});
