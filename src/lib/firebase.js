import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { resolveFirebaseConfig } from './firebaseConfig';

const config = resolveFirebaseConfig(import.meta.env);

export const firebaseConfigured = Object.values(config).every(value => typeof value === 'string' && value.trim());
export const firebaseApp = firebaseConfigured ? (getApps().length ? getApp() : initializeApp(config)) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

// Emulator connections are restricted to a local development server.
if (firebaseApp && import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATORS === 'true' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
