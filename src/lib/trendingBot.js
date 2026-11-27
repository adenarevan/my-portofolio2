import { collection, doc, limit, onSnapshot, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db, firebaseApp } from './firebase';
import { jakartaDay, validateSettings } from '../../bot/src/botConfig';
export { BOT_CATEGORIES, BOT_REGIONS, DEFAULT_BOT_SETTINGS, RSS_SOURCES } from '../../bot/src/botConfig';
export const subscribeBotSettings = (onData, onError) => onSnapshot(doc(db, 'portfolioBotSettings', 'main'), snapshot => onData(snapshot.data() || null), onError);
export const subscribeBotRuns = (onData, onError) => onSnapshot(query(collection(db, 'portfolioBotRuns'), orderBy('startedAt', 'desc'), limit(10)), snapshot => onData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), onError);
export const subscribeBotRequest = (uid, onData, onError) => onSnapshot(doc(db, 'portfolioBotRequests', uid), snapshot => onData(snapshot.data() || null), onError);
export const subscribeBotStatus = (onData, onError) => onSnapshot(doc(db, 'portfolioBotStatus', 'runner'), snapshot => onData(snapshot.data() || null), onError);
export function subscribeBotDaily(onData, onError) {
  let day = jakartaDay();
  const listen = () => onSnapshot(doc(db, 'portfolioBotDaily', day), snapshot => onData(snapshot.data() || null), onError);
  let off = listen();
  const timer = setInterval(() => { const next = jakartaDay(); if (next !== day) { day = next; off(); onData(null); off = listen(); } }, 60000);
  return () => { clearInterval(timer); off(); };
}
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
    const data = { requestedBy: uid, requestId, status: 'queued', createdAt: serverTimestamp(), completedAt: null, resultRunId: null, message: 'Permintaan tersimpan. Menunggu runner memproses antrean.' };
    transaction.set(ref, data); return data;
  });
}

export async function triggerBotRunner(requestId) {
  if (!auth.currentUser) throw new Error('Masuk sebagai admin terlebih dahulu.');
  if (firebaseApp.options.projectId.startsWith('demo-')) return { status: 'emulator', message: 'Antrean emulator tersimpan. Jalankan worker emulator untuk memprosesnya.' };
  const controller = new AbortController();
  let timer;
  try {
    const result = await Promise.race([
      (async () => {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch('/api/bot/dispatch', {
          method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId }), signal: controller.signal,
        });
        const result = await response.json();
        return response.ok && ['dispatched', 'processing'].includes(result.status) ? result : null;
      })(),
      new Promise(resolve => { timer = setTimeout(() => { controller.abort(); resolve(null); }, 15000); }),
    ]);
    if (result) return result;
  } catch { /* The durable queue remains available to the scheduled worker. */ }
  finally { clearTimeout(timer); }
  return { status: 'queued', message: 'Antrean tersimpan, tetapi pemicu langsung belum tersedia. Mulai runner dari GitHub Actions atau tunggu jadwal sekitar 15 menit.' };
}
