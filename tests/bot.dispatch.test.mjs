import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createBotDispatchHandler } from '../server/trendingBotDispatch.js';

const idToken = 'header.' + Buffer.from(JSON.stringify({ sub: 'admin-1' })).toString('base64url') + '.signature';
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });
async function fixture(t, overrides = {}) {
  const calls = [];
  const handler = createBotDispatchHandler({
    projectId: 'adena-dfd60', getToken: async () => 'server-only-github-token',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      if (url.includes('portfolioBlogAdmins/')) return json({ fields: { enabled: { booleanValue: true } } });
      if (url.includes('portfolioBotRequests/')) return json({ fields: { requestedBy: { stringValue: 'admin-1' }, requestId: { stringValue: 'request-1' }, status: { stringValue: 'queued' } } });
      return new Response(null, { status: 204 });
    }, ...overrides,
  });
  const server = createServer(handler); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  const request = (body = { requestId: 'request-1' }, headers = {}, method = 'POST') => fetch(url, { method, headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json', ...headers }, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
  return { calls, request };
}

test('Dispatch requires POST, a token and a valid existing request identifier', async t => {
  const f = await fixture(t);
  assert.equal((await f.request(null, {}, 'GET')).status, 405);
  assert.equal((await f.request({}, { Authorization: '' })).status, 401);
  assert.equal((await f.request({}, { Authorization: 'Bearer not-a-token' })).status, 400);
  assert.equal((await f.request({})).status, 400);
  assert.equal((await f.request({ requestId: 'request-1', repo: 'someone/else' })).status, 400);
  assert.equal((await f.request('x'.repeat(1025))).status, 413);
  assert.equal(f.calls.length, 0);
});

test('A decoded JWT is never trusted without Firestore authentication and enabled admin membership', async t => {
  for (const response of [() => json({}, 403), () => json({ fields: { enabled: { booleanValue: false } } })]) {
    let credentialReads = 0;
    const f = await fixture(t, { fetchImpl: async () => response(), getToken: async () => { credentialReads++; return 'secret'; } });
    assert.equal((await f.request()).status, 403); assert.equal(credentialReads, 0);
  }
});

test('Request ownership, request ID and pending status must match before dispatch', async t => {
  for (const patch of [{ requestedBy: { stringValue: 'other-user' } }, { requestId: { stringValue: 'other-request' } }, { status: { stringValue: 'done' } }]) {
    let dispatches = 0;
    const f = await fixture(t, { fetchImpl: async url => {
      if (url.includes('portfolioBlogAdmins/')) return json({ fields: { enabled: { booleanValue: true } } });
      if (url.includes('portfolioBotRequests/')) return json({ fields: { requestedBy: { stringValue: 'admin-1' }, requestId: { stringValue: 'request-1' }, status: { stringValue: 'queued' }, ...patch } });
      dispatches++; return new Response(null, { status: 204 });
    } });
    assert.equal((await f.request()).status, 409); assert.equal(dispatches, 0);
  }
});

test('Admin dispatches only the fixed main workflow; repeat clicks share its cooldown', async t => {
  const f = await fixture(t);
  for (let i = 0; i < 2; i++) {
    const response = await f.request(); assert.equal(response.status, 202);
    const body = await response.text(); assert.ok(body.includes('dispatched')); assert.ok(!body.includes('server-only-github-token'));
  }
  const calls = f.calls.filter(c => c.url.includes('api.github.com'));
  assert.equal(calls.length, 1); assert.ok(calls[0].url.endsWith('/adenarevan/my-portofolio2/actions/workflows/trending-bot.yml/dispatches'));
  assert.deepEqual(JSON.parse(calls[0].options.body), { ref: 'main' });
  assert.equal(calls[0].options.headers.Authorization, 'Bearer server-only-github-token');
  assert.ok(f.calls.filter(c => c.url.includes('firestore.googleapis.com')).every(c => c.options.headers.Authorization === `Bearer ${idToken}`));
});

test('Simultaneous clicks cannot dispatch two workflow runs', async t => {
  const f = await fixture(t, { getToken: async () => { await new Promise(r => setTimeout(r, 20)); return 'secret'; } });
  const responses = await Promise.all([f.request(), f.request()]);
  assert.ok(responses.every(r => r.status === 202)); assert.equal(f.calls.filter(c => c.url.includes('api.github.com')).length, 1);
});

test('A missing server token returns a queued fallback without exposing credentials', async t => {
  const f = await fixture(t, { getToken: async () => null });
  assert.equal((await f.request()).status, 503); assert.equal(f.calls.filter(c => c.url.includes('api.github.com')).length, 0);
});

test('Firestore connection failures return promptly and preserve the durable queue', async t => {
  const f = await fixture(t, { fetchImpl: async () => { throw new Error('private connection details'); } });
  const r = await f.request(); assert.equal(r.status, 503); const body = await r.text(); assert.ok(body.includes('Antrean tetap tersimpan')); assert.ok(!body.includes('private connection'));
});

test('Failed GitHub dispatch can be retried; provider error details never reach the client', async t => {
  let attempts = 0;
  const f = await fixture(t, { fetchImpl: async url => {
    if (url.includes('api.github.com')) return ++attempts === 1 ? json({ message: 'secret-provider-detail' }, 401) : new Response(null, { status: 204 });
    return url.includes('portfolioBlogAdmins/') ? json({ fields: { enabled: { booleanValue: true } } }) : json({ fields: { requestedBy: { stringValue: 'admin-1' }, requestId: { stringValue: 'request-1' }, status: { stringValue: 'queued' } } });
  } });
  const failure = await f.request(); assert.equal(failure.status, 502); assert.ok(!(await failure.text()).includes('secret-provider-detail'));
  assert.equal((await f.request()).status, 202); assert.equal(attempts, 2);
});
