// Run --check first. --apply requires explicit approval for shared-project rules and worker access.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { randomBytes } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { getGlobalDefaultAccount, setActiveAccount } = require('firebase-tools/lib/auth');
const { requireAuth } = require('firebase-tools/lib/requireAuth');
const { Client } = require('firebase-tools/lib/apiv2');
const project = 'adena-dfd60', repo = 'adenarevan/my-portofolio2', email = 'portfolio-bot@adena.invalid';
const root = resolve(__dirname, '..');
const quiet = { skipLog: { body: true, resBody: true } };
const normalize = value => value.replace(/\r\n/g, '\n').trim();

async function main() {
  process.env.DEBUG = '';
  const apply = process.argv.includes('--apply');
  if (apply && !process.argv.includes('--confirm-production-rules-and-worker')) throw new Error('Persetujuan rules production dan akun bot diperlukan. Gunakan --check untuk inspeksi saja.');
  const account = getGlobalDefaultAccount();
  assert.equal(account?.user.email, 'adenarevan@gmail.com', 'Gunakan akun Firebase pemilik ADENA.');
  const options = { project, projectId: project, nonInteractive: true };
  setActiveAccount(options, account); await requireAuth(options);
  const credential = spawnSync('git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', cwd: root, env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' } });
  if (credential.status !== 0) throw new Error('Login GitHub lewat Git Credential Manager terlebih dahulu.');
  const token = credential.stdout.split(/\r?\n/).find(line => line.startsWith('password='))?.slice(9);
  if (!token) throw new Error('Kredensial GitHub tidak tersedia.');
  async function github(path, method = 'GET', body) {
    const response = await fetch(`https://api.github.com/repos/${repo}${path}`, { method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (!response.ok) throw new Error(`GitHub ${method} ${path}: HTTP ${response.status}.`);
    return response.status === 204 ? null : response.json();
  }
  const [repository, secrets, publicKey] = await Promise.all([github(''), github('/actions/secrets'), github('/actions/secrets/public-key')]);
  assert.equal(repository.private, false, 'Konfigurasi gratis ini memerlukan repo publik.');
  assert.equal(repository.permissions?.admin, true, 'Akses admin repository diperlukan.');
  const rules = new Client({ urlPrefix: 'https://firebaserules.googleapis.com', apiVersion: 'v1' });
  const identity = new Client({ urlPrefix: 'https://identitytoolkit.googleapis.com', apiVersion: 'v1' });
  const firestore = new Client({ urlPrefix: 'https://firestore.googleapis.com', apiVersion: 'v1' });
  const releasePath = `/projects/${project}/releases/cloud.firestore`;
  const release = (await rules.get(releasePath, { ...quiet })).body;
  const original = (await rules.get(`/${release.rulesetName}`, { ...quiet })).body.source.files;
  assert.equal(original.length, 1);
  const candidate = readFileSync(resolve(root, 'firestore.rules'), 'utf8');
  const baseline = readFileSync(resolve(root, 'bot/setup/initial-blog.rules'), 'utf8');
  assert.ok([normalize(candidate), normalize(baseline)].includes(normalize(original[0].content)), 'Rules aktif berubah di luar baseline yang ditinjau. Gabungkan perubahan project lain terlebih dahulu.');
  const files = [{ name: 'firestore.rules', content: candidate }];
  const compile = (await rules.post(`/projects/${project}:test`, { source: { files } }, { ...quiet })).body;
  assert.equal((compile.issues || []).filter(issue => issue.severity === 'ERROR').length, 0, 'Rules bot gagal dikompilasi.');
  const hasGemini = secrets.secrets.some(secret => secret.name === 'GEMINI_API_KEY');
  console.log(JSON.stringify({ project, repository: repo, publicRepository: true, geminiSecretPresent: hasGemini, rulesCompile: 'passed', applyRequested: apply }));
  if (!apply) return;
  assert.ok(hasGemini, 'Tambahkan repository secret GEMINI_API_KEY terlebih dahulu.');
  await github('/contents/.github/workflows/trending-bot.yml');
  const env = Object.fromEntries(readFileSync(resolve(root, '.env.local'), 'utf8').split(/\r?\n/).filter(line => line.includes('=')).map(line => { const at = line.indexOf('='); return [line.slice(0, at), line.slice(at + 1).trim()]; }));
  assert.equal(env.VITE_FIREBASE_PROJECT_ID, project);
  assert.ok(env.VITE_FIREBASE_API_KEY, 'Konfigurasi Web App lokal diperlukan.');
  const lookup = (await identity.post(`/projects/${project}/accounts:lookup`, { email: [email] }, { ...quiet, queryParams: { fields: 'users(localId,email)' } })).body;
  let uid = lookup.users?.[0]?.localId;
  if (uid) {
    let admin = null;
    try { admin = (await firestore.get(`/projects/${project}/databases/(default)/documents/portfolioBlogAdmins/${uid}`, { ...quiet })).body; }
    catch (error) { if (error.status !== 404 && !error.message.includes('404')) throw error; }
    assert.equal(admin, null, 'Akun ini terdaftar sebagai admin; script tidak akan mengganti passwordnya.');
  }
  const password = randomBytes(32).toString('base64url') + '!aA7';
  if (uid) await identity.post(`/projects/${project}/accounts:update`, { localId: uid, password }, { ...quiet, queryParams: { fields: 'localId' } });
  else uid = (await identity.post(`/projects/${project}/accounts`, { email, password, displayName: 'Portfolio Trending Bot', emailVerified: false }, { ...quiet, queryParams: { fields: 'localId' } })).body.localId;
  assert.ok(uid);
  const sodium = require('../bot/node_modules/libsodium-wrappers'); await sodium.ready;
  const encrypted = sodium.crypto_box_seal(sodium.from_string(password), sodium.from_base64(publicKey.key, sodium.base64_variants.ORIGINAL));
  await github('/actions/secrets/FIREBASE_BOT_PASSWORD', 'PUT', { encrypted_value: sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL), key_id: publicKey.key_id });
  // Membership and rules are the only production access changes; no billing or IAM role is enabled.
  await firestore.patch(`/projects/${project}/databases/(default)/documents/portfolioBotWorkers/${uid}`, { fields: { enabled: { booleanValue: true } } }, { ...quiet, queryParams: { 'updateMask.fieldPaths': 'enabled' } });
  const latest = (await rules.get(releasePath, { ...quiet })).body;
  assert.equal(latest.rulesetName, release.rulesetName, 'Rules berubah saat setup; berhenti untuk ditinjau.');
  if (normalize(candidate) !== normalize(original[0].content)) {
    const ruleset = (await rules.post(`/projects/${project}/rulesets`, { source: { files } }, { ...quiet })).body;
    await rules.patch(releasePath, { release: { name: releasePath.slice(1), rulesetName: ruleset.name } }, { ...quiet });
  }
  const variables = { FIREBASE_PROJECT_ID: project, FIREBASE_API_KEY: env.VITE_FIREBASE_API_KEY, FIREBASE_BOT_EMAIL: email, GEMINI_MODEL: 'gemini-3.1-flash-lite', TRENDING_BOT_CONFIGURED: 'true' };
  const existing = (await github('/actions/variables')).variables.map(variable => variable.name);
  for (const [name, value] of Object.entries(variables)) await github(existing.includes(name) ? `/actions/variables/${name}` : '/actions/variables', existing.includes(name) ? 'PATCH' : 'POST', { name, value });
  console.log('Setup selesai. Password bot tersimpan terenkripsi di GitHub Secrets; tidak dicetak atau disimpan ke file. Jadwal tetap mengikuti pengaturan admin (default nonaktif).');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
