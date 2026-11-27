import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { DEFAULT_BOT_SETTINGS, jakartaDay } from '../bot/src/botConfig.js';

let environment;
const date = Timestamp.fromDate(new Date('2026-11-26T00:00:00Z'));
const fixture = (overrides = {}) => ({ title: 'Catatan pengembangan web', excerpt: 'Sebuah ringkasan singkat.', body: 'Paragraf pertama.\n\nParagraf kedua.', tag: 'Web', status: 'published', authorId: 'owner', createdAt: date, updatedAt: date, publishedAt: date, ...overrides });
const createPayload = overrides => fixture({ createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: serverTimestamp(), ...overrides });

before(async () => {
  environment = await initializeTestEnvironment({ projectId: 'demo-portfolio-blog', firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') } });
});
beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'portfolioBlogAdmins', 'owner'), { enabled: true });
    await setDoc(doc(db, 'portfolioBlogAdmins', 'disabled'), { enabled: false });
    await setDoc(doc(db, 'portfolioBotWorkers', 'worker'), { enabled: true });
    await setDoc(doc(db, 'portfolioPosts', 'public'), fixture());
    await setDoc(doc(db, 'portfolioPosts', 'draft'), fixture({ status: 'draft', publishedAt: null }));
  });
});
after(async () => { await environment?.cleanup(); });

test('Bot configuration and logs are admin-readable but never writable from the browser', async () => {
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'portfolioBotSettings', 'main'), { enabled: false });
    await setDoc(doc(context.firestore(), 'portfolioBotRuns', 'run1'), { status: 'skipped', startedAt: date });
  });
  const owner = environment.authenticatedContext('owner').firestore();
  await assertSucceeds(getDoc(doc(owner, 'portfolioBotSettings', 'main')));
  await assertSucceeds(getDocs(query(collection(owner, 'portfolioBotRuns'), orderBy('startedAt', 'desc'), limit(10))));
  await assertFails(setDoc(doc(owner, 'portfolioBotSettings', 'main'), { enabled: true }));
  await assertFails(setDoc(doc(owner, 'portfolioBotRuns', 'forged'), { status: 'created' }));
  await assertFails(getDocs(collection(owner, 'portfolioBotRuns')));
  await assertFails(getDoc(doc(owner, 'portfolioBotLocks', 'runner')));
  for (const context of [environment.unauthenticatedContext(), environment.authenticatedContext('reader')]) {
    await assertFails(getDoc(doc(context.firestore(), 'portfolioBotSettings', 'main')));
    await assertFails(getDocs(query(collection(context.firestore(), 'portfolioBotRuns'), limit(10))));
  }
});

test('Bot drafts stay private and can be edited/published without changing server provenance', async () => {
  const bot = { runId: 'run1', selectionReason: 'Dua sumber', generatedAt: date };
  const sources = [{ title: 'Sumber', url: 'https://www.antaranews.com/berita/test' }];
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'portfolioPosts', 'bot-draft'), fixture({ status: 'draft', publishedAt: null, slug: 'artikel-bot', metaDescription: 'Deskripsi', bot, sources }));
  });
  await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), 'portfolioPosts', 'bot-draft')));
  const owner = environment.authenticatedContext('owner').firestore();
  const ref = doc(owner, 'portfolioPosts', 'bot-draft');
  await assertSucceeds(updateDoc(ref, { title: 'Draf bot ditinjau', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(ref, { bot: { runId: 'forged' }, updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(ref, { sources: [], updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref, { status: 'published', updatedAt: serverTimestamp(), publishedAt: serverTimestamp() }));
  await assertSucceeds(getDoc(doc(environment.unauthenticatedContext().firestore(), 'portfolioPosts', 'bot-draft')));
  await assertSucceeds(setDoc(doc(owner, 'portfolioPosts', 'manual-with-meta'), createPayload({ slug: 'manual-post', metaDescription: 'Catatan manual' })));
  await assertFails(setDoc(doc(owner, 'portfolioPosts', 'forged-bot'), createPayload({ bot, sources })));
});

test('Admins can save validated settings and enqueue one manual request without Functions', async () => {
  const owner = environment.authenticatedContext('owner').firestore();
  const settings = doc(owner, 'portfolioBotSettings', 'main');
  const payload = { ...DEFAULT_BOT_SETTINGS, authorId: 'owner', updatedBy: 'owner', revision: 1, updatedAt: serverTimestamp() };
  await assertSucceeds(setDoc(settings, payload));
  await assertFails(updateDoc(settings, { maxArticles: 99, revision: 2, updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(settings, { sourceIds: ['cnn', 'cnbc'], revision: 2, updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(settings, { revision: 1, updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(settings, { time: '09:15', revision: 2, updatedAt: serverTimestamp() }));
  const queued = { requestedBy: 'owner', requestId: 'request-1234567890', status: 'queued', createdAt: serverTimestamp(), completedAt: null, resultRunId: null, message: 'Menunggu runner' };
  const request = doc(owner, 'portfolioBotRequests', 'owner');
  await assertSucceeds(setDoc(request, queued));
  await assertFails(setDoc(request, { ...queued, requestId: 'overwritten-123456789' }));
  await assertFails(setDoc(doc(owner, 'portfolioBotRequests', 'reader'), queued));
  await assertFails(setDoc(doc(owner, 'portfolioBotWorkers', 'owner'), { enabled: true }));
  await assertFails(setDoc(doc(environment.authenticatedContext('reader').firestore(), 'portfolioBotSettings', 'main'), payload));
});

test('Worker defaults to drafts and cannot publish without opt-in, edit manual posts, or access BTC', async () => {
  const worker = environment.authenticatedContext('worker').firestore();
  const topicKey = 'a'.repeat(32);
  const data = createPayload({ status: 'draft', publishedAt: null, sources: [{ title: 'S1' }, { title: 'S2' }], bot: { workerId: 'worker', topicKey, generatedAt: serverTimestamp() } });
  const ref = doc(worker, 'portfolioPosts', `bot_${topicKey}`);
  await assertSucceeds(setDoc(ref, data));
  await assertFails(updateDoc(ref, { status: 'published', publishedAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(worker, 'portfolioPosts', 'public'), { title: 'Forged', updatedAt: serverTimestamp() }));
  await assertFails(deleteDoc(ref));
  await assertFails(setDoc(doc(worker, 'portfolioPosts', 'ordinary-id'), data));
  await assertFails(setDoc(doc(worker, 'portfolioPosts', `bot_${'b'.repeat(32)}`), { ...data, status: 'published', publishedAt: serverTimestamp() }));
  await assertFails(getDoc(doc(worker, 'journal', 'btc-private')));
  await assertFails(setDoc(doc(worker, 'portfolioBlogAdmins', 'worker'), { enabled: true }));
  await assertFails(setDoc(doc(worker, 'portfolioBotSettings', 'main'), { enabled: true }));
  await assertFails(getDoc(doc(environment.authenticatedContext('reader').firestore(), 'portfolioPosts', `bot_${topicKey}`)));
});

test('Automatic publication requires admin opt-in and an atomic current-WIB-day ledger capped at two posts', async () => {
  const owner = environment.authenticatedContext('owner').firestore();
  const worker = environment.authenticatedContext('worker').firestore();
  const day = jakartaDay();
  const makePost = (key, publicationDay = day) => createPayload({ sources: [{ title: 'S1' }, { title: 'S2' }], bot: { workerId: 'worker', topicKey: key, generatedAt: serverTimestamp(), publicationDay } });
  await assertSucceeds(setDoc(doc(owner, 'portfolioBotSettings', 'main'), { ...DEFAULT_BOT_SETTINGS, enabled: true, autoPublish: true, authorId: 'owner', updatedBy: 'owner', revision: 1, updatedAt: serverTimestamp() }));
  const firstKey = 'c'.repeat(32), secondKey = 'd'.repeat(32), thirdKey = 'e'.repeat(32);
  const first = `bot_${firstKey}`, second = `bot_${secondKey}`, third = `bot_${thirdKey}`;
  await assertFails(setDoc(doc(worker, 'portfolioPosts', first), makePost(firstKey)));
  const publish = (key, ids, publicationDay = day) => {
    const batch = writeBatch(worker);
    batch.set(doc(worker, 'portfolioPosts', `bot_${key}`), makePost(key, publicationDay));
    batch.set(doc(worker, 'portfolioBotDaily', publicationDay), { postIds: ids, updatedAt: serverTimestamp() });
    return batch.commit();
  };
  await assertFails(publish(firstKey, [first], '2000-1-1'));
  await assertSucceeds(publish(firstKey, [first]));
  await assertSucceeds(publish(secondKey, [first, second]));
  await assertFails(publish(thirdKey, [first, second, third]));
  await assertFails(publish(thirdKey, [third]));
  await assertFails(setDoc(doc(worker, 'portfolioBotDaily', day), { postIds: [], updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(worker, 'portfolioPosts', first), { title: 'Worker rewrite', updatedAt: serverTimestamp() }));
  await assertSucceeds(getDoc(doc(environment.unauthenticatedContext().firestore(), 'portfolioPosts', first)));
  await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), 'portfolioBotDaily', day)));
  await assertSucceeds(updateDoc(doc(owner, 'portfolioBotSettings', 'main'), { autoPublish: false, revision: 2, updatedAt: serverTimestamp() }));
  await assertFails(publish(thirdKey, [first, second, third]));
});

test('Visitors can read only published posts and bounded published queries', async () => {
  const db = environment.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, 'portfolioPosts', 'public')));
  await assertFails(getDoc(doc(db, 'portfolioPosts', 'draft')));
  const result = await assertSucceeds(getDocs(query(collection(db, 'portfolioPosts'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(9))));
  assert.equal(result.size, 1);
  await assertFails(getDocs(query(collection(db, 'portfolioPosts'), limit(9))));
  await assertFails(getDocs(query(collection(db, 'portfolioPosts'), where('status', '==', 'published'), limit(21))));
});

test('Visitors and ordinary signed-in users cannot write, delete, or grant editor access', async () => {
  for (const context of [environment.unauthenticatedContext(), environment.authenticatedContext('reader'), environment.authenticatedContext('disabled')]) {
    const db = context.firestore();
    await assertFails(setDoc(doc(db, 'portfolioPosts', 'attack'), createPayload()));
    await assertFails(updateDoc(doc(db, 'portfolioPosts', 'public'), { title: 'Changed', updatedAt: serverTimestamp() }));
    await assertFails(deleteDoc(doc(db, 'portfolioPosts', 'public')));
    await assertFails(setDoc(doc(db, 'portfolioBlogAdmins', 'reader'), { enabled: true }));
    await assertFails(getDoc(doc(db, 'portfolioPosts', 'draft')));
  }
});

test('Editor memberships are readable only by the corresponding account and cannot be enumerated', async () => {
  const db = environment.authenticatedContext('owner').firestore();
  await assertSucceeds(getDoc(doc(db, 'portfolioBlogAdmins', 'owner')));
  await assertFails(getDoc(doc(db, 'portfolioBlogAdmins', 'disabled')));
  await assertFails(getDocs(collection(db, 'portfolioBlogAdmins')));
  await assertFails(updateDoc(doc(db, 'portfolioBlogAdmins', 'owner'), { enabled: false }));
});

test('An authorized owner can create drafts, publish, edit, unpublish, and delete', async () => {
  const db = environment.authenticatedContext('owner').firestore();
  const reference = doc(db, 'portfolioPosts', 'new');
  await assertSucceeds(setDoc(reference, createPayload({ status: 'draft', publishedAt: null })));
  await assertSucceeds(getDocs(collection(db, 'portfolioPosts')));
  await assertSucceeds(updateDoc(reference, { status: 'published', publishedAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  const published = (await getDoc(reference)).data().publishedAt;
  await assertSucceeds(updateDoc(reference, { body: 'Revised content', updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(reference, { status: 'draft', updatedAt: serverTimestamp() }));
  await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), 'portfolioPosts', 'new')));
  await assertSucceeds(updateDoc(reference, { status: 'published', updatedAt: serverTimestamp() }));
  assert.equal((await getDoc(reference)).data().publishedAt.toMillis(), published.toMillis());
  await assertSucceeds(deleteDoc(reference));
});

test('Rules reject forged ownership, timestamps, invalid status, extra fields, and oversized data', async () => {
  const db = environment.authenticatedContext('owner').firestore();
  for (const invalid of [
    { authorId: 'other' }, { title: '' }, { title: 'x'.repeat(141) }, { body: '' }, { body: 'x'.repeat(50001) },
    { excerpt: 'x'.repeat(321) }, { tag: 'x'.repeat(41) }, { status: 'hidden' }, { status: 'published', publishedAt: null },
    { updatedAt: date }, { createdAt: date }, { secret: 'unexpected' },
  ]) await assertFails(setDoc(doc(db, 'portfolioPosts', 'invalid'), createPayload(invalid)));
  const existing = doc(db, 'portfolioPosts', 'public');
  await assertFails(updateDoc(existing, { authorId: 'other', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(existing, { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(existing, { publishedAt: serverTimestamp(), updatedAt: serverTimestamp() }));
});

test('Rules do not grant access to any unrelated collection', async () => {
  const db = environment.authenticatedContext('owner').firestore();
  await assertFails(setDoc(doc(db, 'unrelated', 'data'), { value: true }));
  await assertFails(getDoc(doc(db, 'unrelated', 'data')));
  await assertFails(getDoc(doc(db, 'portfolioBotSourceCache', 'antara-news')));
  await assertFails(setDoc(doc(db, 'portfolioBotSourceCache', 'antara-news'), { items: [], updatedAt: serverTimestamp() }));
  const worker = environment.authenticatedContext('worker').firestore();
  await assertSucceeds(setDoc(doc(worker, 'portfolioBotSourceCache', 'antara-news'), { items: [], updatedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(worker, 'portfolioBotSourceCache', 'arbitrary-host'), { items: [], updatedAt: serverTimestamp() }));
});
