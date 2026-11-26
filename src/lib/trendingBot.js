import { collection, doc, limit, onSnapshot, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { validateSettings } from '../../bot/src/botConfig';
export { BOT_CATEGORIES, BOT_REGIONS, DEFAULT_BOT_SETTINGS, RSS_SOURCES } from '../../bot/src/botConfig';
export const subscribeBotSettings = (onData, onError) => onSnapshot(doc(db, 'portfolioBotSettings', 'main'), snapshot => onData(snapshot.data() || null), onError);
export const subscribeBotRuns = (onData, onError) => onSnapshot(query(collection(db, 'portfolioBotRuns'), orderBy('startedAt', 'desc'), limit(10)), snapshot => onData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), onError);
export const subscribeBotRequest = (uid, onData, onError) => onSnapshot(doc(db, 'portfolioBotRequests', uid), snapshot => onData(snapshot.data() || null), onError);
export const subscribeBotStatus = (onData, onError) => onSnapshot(doc(db, 'portfolioBotStatus', 'runner'), snapshot => onData(snapshot.data() || null), onError);
export async function saveBotSettings(input, revision) {
  if (!auth.currentUser) throw new Error('Masuk sebagai admin terlebih dahulu.');
  const settings = validateSettings(input); const uid = auth.currentUser.uid;
  const ref = doc(db, 'portfolioBotSettings', 'main');
  return runTransaction(db, async transaction => {
    const previous = (await transaction.get(ref)).data();
    if ((previous?.revision || 0) !== revision) throw new Error('Pengaturan berubah di sesi lain. Muat ulang sebelum menyimpan.');
    transaction.set(ref, { ...settings, authorId: uid, updatedBy: uid, revision: revision + 1, updatedAt: serverTimestamp() });
    return { revision: revision + 1 };
  });
}
export async function runBotNow(requestId) {
  if (!auth.currentUser) throw new Error('Masuk sebagai admin terlebih dahulu.');
  const uid = auth.currentUser.uid; const ref = doc(db, 'portfolioBotRequests', uid);
  return runTransaction(db, async transaction => {
    const current = (await transaction.get(ref)).data();
    if (current && ['queued', 'processing'].includes(current.status)) return current;
    const data = { requestedBy: uid, requestId, status: 'queued', createdAt: serverTimestamp(), completedAt: null, resultRunId: null, message: 'Permintaan masuk antrean. Diproses saat runner GitHub berikutnya berjalan.' };
    transaction.set(ref, data); return { status: 'queued', message: data.message };
  });
}
