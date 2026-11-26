// Firebase Web App identifiers are public and are bundled into every frontend build.
// This Browser key is restricted to Firebase APIs. Authorization is enforced by
// Firebase Auth and Firestore Rules, not by hiding these identifiers.
export const publicFirebaseConfig = Object.freeze({
  apiKey: 'AIzaSyDRhKJX9ZHcpmfKgk4OKNFguHIpOVb0oZU',
  authDomain: 'adena-dfd60.firebaseapp.com',
  projectId: 'adena-dfd60',
  appId: '1:906833003301:web:f871f1ffc28724f8e150cc',
});

export function resolveFirebaseConfig(env = {}) {
  const overrides = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  const normalized = Object.fromEntries(Object.entries(overrides).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]));
  const configured = Object.entries(normalized).filter(([, value]) => value);
  const registeredApp = configured.every(([key, value]) => value === publicFirebaseConfig[key]);
  // Fill missing values only for the known registered app. A different project,
  // rotated key or emulator mode must supply its own complete configuration.
  return env.VITE_FIREBASE_EMULATORS !== 'true' && registeredApp ? publicFirebaseConfig : normalized;
}
