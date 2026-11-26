import { initializeApp, deleteApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, terminate } from 'firebase/firestore';
import { FirestoreStore } from './store.js';
import { createBotRunner } from './engine.js';
import { processBotTick } from './queue.js';
import { writeArticle } from './writer.js';
import { developmentProviders } from './localFixtures.js';

const projectId = process.env.FIREBASE_PROJECT_ID;
const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_API_KEY', 'FIREBASE_BOT_EMAIL', 'FIREBASE_BOT_PASSWORD'];
if (required.some(name => !process.env[name])) throw new Error(`Isi konfigurasi runner: ${required.join(', ')}.`);
const app = initializeApp({ projectId, apiKey: process.env.FIREBASE_API_KEY, authDomain: `${projectId}.firebaseapp.com` });
const auth = getAuth(app); const firestore = getFirestore(app);
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST, authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (emulatorHost || authHost) {
  if (!projectId.startsWith('demo-') || !/^(127\.0\.0\.1|localhost):\d+$/.test(emulatorHost || '') || !/^(127\.0\.0\.1|localhost):\d+$/.test(authHost || '')) throw new Error('Emulator runner hanya boleh memakai project demo dan kedua host loopback.');
  const [host, port] = emulatorHost.split(':');
  connectFirestoreEmulator(firestore, host, Number(port)); connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
}
try {
  const { user } = await signInWithEmailAndPassword(auth, process.env.FIREBASE_BOT_EMAIL, process.env.FIREBASE_BOT_PASSWORD);
  const db = new FirestoreStore(firestore);
  if ((await db.collection('portfolioBotWorkers').doc(user.uid).get()).data()?.enabled !== true) throw new Error('UID akun bot belum diaktifkan pada portfolioBotWorkers.');
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const run = createBotRunner({ db, workerId: user.uid, model, generate: (topic, sources) => writeArticle(topic, sources, { model, apiKey: process.env.GEMINI_API_KEY }), ...developmentProviders() });
  const results = await processBotTick({ db, workerId: user.uid, run });
  console.log(JSON.stringify({ scheduler: 'github-actions', results: results.map(({ runId, status, message }) => ({ runId, status, message })) }));
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await signOut(auth); await terminate(firestore); await deleteApp(app); }
