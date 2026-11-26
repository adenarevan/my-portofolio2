import { execFile } from 'node:child_process';

const workflowUrl = 'https://api.github.com/repos/adenarevan/my-portofolio2/actions/workflows/trending-bot.yml/dispatches';
const identifier = /^[a-zA-Z0-9_-]{1,128}$/;

// Used only by Vite on the developer's machine. Credentials never reach the browser.
export function localGitHubCredential() {
  return new Promise(resolve => {
    const child = execFile('git', ['credential', 'fill'], {
      timeout: 5000, maxBuffer: 65536, windowsHide: true,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
    }, (error, stdout) => resolve(error ? null : stdout.split(/\r?\n/).find(line => line.startsWith('password='))?.slice(9) || null));
    child.stdin?.on('error', () => {});
    child.stdin?.end('protocol=https\nhost=github.com\n\n');
  });
}

export function createBotDispatchHandler({ projectId, getToken = async () => process.env.GITHUB_BOT_TOKEN, fetchImpl = fetch, now = Date.now }) {
  let lastDispatchAt = -Infinity;
  return async function handle(request, response) {
    const reply = (status, body) => {
      response.statusCode = status;
      response.setHeader('Content-Type', 'application/json');
      response.setHeader('Cache-Control', 'no-store');
      response.end(JSON.stringify(body));
    };
    if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return reply(405, { message: 'Gunakan POST.' }); }
    if (!projectId || projectId.startsWith('demo-') || !/^[a-z][a-z0-9-]{4,62}$/.test(projectId)) return reply(503, { message: 'Pemicu runner belum dikonfigurasi.' });
    const token = /^Bearer ([^\s]{1,8192})$/.exec(request.headers.authorization || '')?.[1];
    if (!token) return reply(401, { message: 'Masuk sebagai admin terlebih dahulu.' });
    let uid, body;
    try {
      // The decoded UID is only a lookup path. Firestore itself validates the token,
      // its project and Security Rules before this endpoint trusts any identity.
      uid = JSON.parse(Buffer.from(token.split('.')[1], 'base64url')).sub;
      if (typeof uid !== 'string' || !identifier.test(uid)) throw new Error('invalid uid');
      if (request.body) body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      else {
        let raw = '';
        for await (const chunk of request) { raw += chunk; if (raw.length > 1024) return reply(413, { message: 'Permintaan terlalu besar.' }); }
        body = JSON.parse(raw);
      }
      if (typeof body?.requestId !== 'string' || !identifier.test(body.requestId) || Object.keys(body).length !== 1) throw new Error('invalid request');
    } catch { return reply(400, { message: 'Permintaan tidak valid.' }); }
    const root = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    const options = () => ({ headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) });
    try {
      const member = await fetchImpl(`${root}/portfolioBlogAdmins/${uid}`, options());
      if (!member.ok || (await member.json()).fields?.enabled?.booleanValue !== true) return reply(403, { message: 'Akses khusus admin blog.' });
      const queued = await fetchImpl(`${root}/portfolioBotRequests/${uid}`, options());
      if (!queued.ok) return reply(409, { message: 'Simpan permintaan ke antrean terlebih dahulu.' });
      const fields = (await queued.json()).fields;
      if (fields?.requestedBy?.stringValue !== uid || fields?.requestId?.stringValue !== body.requestId) return reply(409, { message: 'Permintaan antrean sudah berubah.' });
      const status = fields?.status?.stringValue;
      if (status === 'processing') return reply(202, { status: 'processing', message: 'Runner sudah memproses permintaan ini.' });
      if (status !== 'queued') return reply(409, { message: 'Permintaan ini sudah selesai.' });
      if (now() - lastDispatchAt < 30000) return reply(202, { status: 'dispatched', message: 'Runner sudah dipicu. Menunggu GitHub memulai proses.' });
      const githubToken = await getToken();
      if (!githubToken) return reply(503, { message: 'Pemicu langsung belum dikonfigurasi. Antrean tetap diproses oleh jadwal GitHub.' });
      // Reserve before awaiting GitHub so simultaneous requests share one dispatch.
      if (now() - lastDispatchAt < 30000) return reply(202, { status: 'dispatched', message: 'Runner sudah dipicu. Menunggu GitHub memulai proses.' });
      lastDispatchAt = now();
      try {
        const dispatched = await fetchImpl(workflowUrl, {
          method: 'POST', headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
          body: JSON.stringify({ ref: 'main' }), signal: AbortSignal.timeout(5000),
        });
        if (dispatched.status !== 204) throw new Error('dispatch failed');
      } catch { lastDispatchAt = -Infinity; return reply(502, { message: 'GitHub belum menerima pemicu. Antrean tetap tersimpan.' }); }
      return reply(202, { status: 'dispatched', message: 'Runner dipicu sekarang. Menunggu GitHub memulai proses; tidak perlu menunggu jadwal 15 menit.' });
    } catch { return reply(503, { message: 'Koneksi pemicu belum tersedia. Antrean tetap tersimpan.' }); }
  };
}
