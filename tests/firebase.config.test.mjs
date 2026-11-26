import test from 'node:test';
import assert from 'node:assert/strict';
import { publicFirebaseConfig, resolveFirebaseConfig } from '../src/lib/firebaseConfig.js';

test('A deployment without local env files uses the registered ADENA Web App', () => {
  const config = resolveFirebaseConfig({});
  assert.equal(config.projectId, 'adena-dfd60');
  assert.equal(config.authDomain, 'adena-dfd60.firebaseapp.com');
  assert.equal(config.appId, '1:906833003301:web:f871f1ffc28724f8e150cc');
  assert.ok(Object.values(config).every(value => typeof value === 'string' && value.trim()));
  assert.equal(resolveFirebaseConfig({ VITE_FIREBASE_API_KEY: '', VITE_FIREBASE_PROJECT_ID: '' }), publicFirebaseConfig);
  assert.equal(resolveFirebaseConfig({ VITE_FIREBASE_PROJECT_ID: 'adena-dfd60' }), publicFirebaseConfig);
});

test('A complete custom or demo project overrides ADENA without mixing identifiers', () => {
  const config = resolveFirebaseConfig({ VITE_FIREBASE_API_KEY: ' demo-api-key ', VITE_FIREBASE_PROJECT_ID: 'demo-blog', VITE_FIREBASE_AUTH_DOMAIN: 'demo-blog.firebaseapp.com', VITE_FIREBASE_APP_ID: 'demo-app', VITE_FIREBASE_EMULATORS: 'true' });
  assert.deepEqual(config, { apiKey: 'demo-api-key', projectId: 'demo-blog', authDomain: 'demo-blog.firebaseapp.com', appId: 'demo-app' });
});

test('An incomplete override or emulator configuration cannot fall back to the production project', () => {
  const partial = resolveFirebaseConfig({ VITE_FIREBASE_PROJECT_ID: 'other-project' });
  assert.equal(partial.projectId, 'other-project'); assert.equal(partial.apiKey, undefined); assert.equal(partial.appId, undefined);
  const emulator = resolveFirebaseConfig({ VITE_FIREBASE_EMULATORS: 'true' });
  assert.equal(emulator.projectId, undefined); assert.equal(emulator.apiKey, undefined);
});
