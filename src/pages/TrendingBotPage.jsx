import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useBeforeUnload, useBlocker } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, firebaseApp, firebaseConfigured } from '../lib/firebase';
import { useBlogSession } from '../hooks/useBlog';
import { usePageMeta } from '../hooks/usePageMeta';
import { BOT_CATEGORIES, BOT_REGIONS, DEFAULT_BOT_SETTINGS, RSS_SOURCES, runBotNow, saveBotSettings, subscribeBotDaily, subscribeBotRequest, subscribeBotRuns, subscribeBotSettings, subscribeBotStatus, triggerBotRunner } from '../lib/trendingBot';
import BlogShell from '../components/blog/BlogShell';
import AdminNav from '../components/blog/AdminNav';

const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const statusLabels = { running: 'Berjalan', created: 'Draf dibuat', published: 'Terbit otomatis', complete: 'Target tercapai', skipped: 'Dilewati', failed: 'Gagal', partial: 'Selesai sebagian', busy: 'Sedang digunakan' };
const extract = data => Object.fromEntries(Object.keys(DEFAULT_BOT_SETTINGS).map(key => [key, data?.[key] ?? DEFAULT_BOT_SETTINGS[key]]));
const dateLabel = timestamp => timestamp?.toDate ? new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }).format(timestamp.toDate()) + ' WIB' : '';

export default function TrendingBotPage() {
  const session = useBlogSession();
  const [form, setForm] = useState(DEFAULT_BOT_SETTINGS);
  const [revision, setRevision] = useState(0);
  const [runs, setRuns] = useState([]);
  const [requestState, setRequestState] = useState(null);
  const [runnerStatus, setRunnerStatus] = useState(null);
  const [daily, setDaily] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const latest = useRef(null);
  const settingsPanel = useRef(null);
  const pendingRequest = useRef(null);
  const [remoteChanged, setRemoteChanged] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [dispatchNotice, setDispatchNotice] = useState(null);
  const [failed, setFailed] = useState(false);
  const [readErrors, setReadErrors] = useState({});
  const readError = Object.values(readErrors).join(' ');
  const [attempt, setAttempt] = useState(0);
  usePageMeta('Bot Artikel Trending', 'Kelola publikasi artikel harian dari liputan beberapa sumber.', true);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirtyRef.current && currentLocation.pathname !== nextLocation.pathname);
  useBeforeUnload(useCallback(event => { if (dirtyRef.current) { event.preventDefault(); event.returnValue = ''; } }, []));
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('Pengaturan belum disimpan. Tinggalkan perubahan ini?')) blocker.proceed(); else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    if (!session.admin) return;
    setReadErrors({}); setLoadingSettings(true); setLoadingRuns(true);
    const error = section => failure => {
      const name = { settings: 'pengaturan', runs: 'riwayat', request: 'antrean', runner: 'status runner', daily: 'target harian' }[section];
      const message = failure.code === 'permission-denied'
        ? `Firestore menolak akses ${name} bot. Rules bot perlu diaktifkan untuk akun admin pada project ${firebaseApp.options.projectId}.`
        : failure.code === 'unauthenticated'
          ? `Sesi login berakhir. Masuk kembali untuk membaca ${name} bot.`
          : `Belum dapat membaca ${name} bot. Periksa koneksi dan coba lagi (${failure.code || 'unknown'}).`;
      setReadErrors(current => ({ ...current, [section]: message }));
      if (section === 'settings') { setLoadingSettings(false); setLoaded(false); } else if (section === 'runs') setLoadingRuns(false);
    };
    const settingsOff = subscribeBotSettings(data => {
      latest.current = data;
      if (dirtyRef.current) setRemoteChanged(true);
      else { setForm(extract(data)); setRevision(data?.revision || 0); setRemoteChanged(false); }
      setLoaded(true); setLoadingSettings(false);
    }, error('settings'));
    const runsOff = subscribeBotRuns(data => { setRuns(data); setLoadingRuns(false); }, error('runs'));
    const requestOff = subscribeBotRequest(session.user.uid, setRequestState, error('request'));
    const statusOff = subscribeBotStatus(setRunnerStatus, error('runner'));
    const dailyOff = subscribeBotDaily(setDaily, error('daily'));
    return () => { settingsOff(); runsOff(); requestOff(); statusOff(); dailyOff(); };
  }, [session.admin, session.user?.uid, attempt]);
  useEffect(() => {
    const panel = settingsPanel.current;
    if (!panel) return;
    const observer = new ResizeObserver(() => panel.parentElement.style.setProperty('--bot-panel-height', `${panel.getBoundingClientRect().height}px`));
    observer.observe(panel);
    return () => observer.disconnect();
  }, [session.admin, loaded]);
  function change(key, value) { setForm(current => ({ ...current, [key]: value })); dirtyRef.current = true; setDirty(true); setMessage(''); }
  function toggle(key, value) {
    if (key === 'categories' && value === 'all') { change(key, form.categories.includes('all') ? [] : ['all']); return; }
    const values = key === 'categories' ? form[key].filter(item => item !== 'all') : form[key];
    change(key, values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
  }
  function errorMessage(error) {
    return error.code === 'permission-denied'
      ? 'Firestore menolak perubahan. Rules bot gratis belum dipasang atau akun ini tidak berizin.'
      : error.message || 'Permintaan gagal. Coba lagi.';
  }
  async function save(event) {
    event.preventDefault(); setBusy('save'); setMessage(''); setFailed(false);
    try {
      const result = await saveBotSettings(form, revision);
      dirtyRef.current = false; setDirty(false); setRemoteChanged(false); setRevision(result.revision);
      setMessage(form.enabled ? 'Pengaturan tersimpan. Jadwal bot aktif.' : 'Pengaturan tersimpan. Jadwal bot nonaktif.');
    } catch (error) { setFailed(true); setMessage(errorMessage(error)); }
    finally { setBusy(''); }
  }
  async function run() {
    setBusy('run'); setMessage(''); setFailed(false); setDispatchNotice(null);
    pendingRequest.current ||= crypto.randomUUID();
    let timer;
    try {
      const result = await Promise.race([
        runBotNow(pendingRequest.current),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Antrean belum mendapat konfirmasi Firebase. Periksa koneksi lalu coba lagi; permintaan yang sama tidak akan digandakan.')), 12000); }),
      ]);
      clearTimeout(timer); pendingRequest.current = null;
      setBusy('dispatch');
      const dispatch = await triggerBotRunner(result.requestId);
      setDispatchNotice({ requestId: result.requestId, message: dispatch.message }); setFailed(false);
    } catch (error) { setFailed(true); setMessage(errorMessage(error)); }
    finally { clearTimeout(timer); setBusy(''); }
  }
  async function startQueuedRunner() {
    setBusy('dispatch'); setMessage(''); setFailed(false);
    try { setDispatchNotice({ requestId: requestState.requestId, message: (await triggerBotRunner(requestState.requestId)).message }); }
    catch (error) { setFailed(true); setMessage(errorMessage(error)); }
    finally { setBusy(''); }
  }
  if (!firebaseConfigured || !session.loading && !session.user) return <Navigate to="/login" replace />;
  if (session.loading) return <BlogShell editor><p className="frame editor-loading" role="status">Memeriksa akses…</p></BlogShell>;
  if (session.error) return <BlogShell editor><div className="frame editor-loading" role="alert"><p>Akses admin belum dapat diperiksa.</p><button className="text-link" onClick={session.retry}>Coba lagi</button><Link to="/login">Login</Link></div></BlogShell>;
  if (!session.admin) return <Navigate to="/login" replace />;
  const activeRun = runs.find(run => run.status === 'running' && (run.startedAt?.toMillis?.() || 0) > Date.now() - 12 * 60000);
  const queued = requestState && ['queued', 'processing'].includes(requestState.status);
  const resultRun = runs.find(run => run.id === requestState?.resultRunId);
  const showDispatchNotice = dispatchNotice && (requestState?.requestId !== dispatchNotice.requestId || queued);
  const existingArticle = resultRun?.status === 'skipped' && resultRun.items?.some(item => item.postId);
  const savedSettings = extract(latest.current);
  const requestLabel = requestState?.status === 'queued' ? 'Menunggu runner' : requestState?.status === 'processing' ? 'Bot sedang bekerja' : requestState?.status === 'failed' ? 'Eksekusi gagal' : existingArticle ? 'Artikel sudah ada — buka hasilnya' : resultRun?.status === 'published' ? 'Artikel sudah terbit' : resultRun?.status === 'skipped' ? 'Pencarian selesai — belum ada artikel baru' : ['created', 'partial'].includes(resultRun?.status) ? 'Draf siap ditinjau' : 'Permintaan selesai';
  return <BlogShell editor><div className="admin-layout bot-layout frame">
    <aside className="editor-sidebar"><div className="editor-account"><h2>Editor blog</h2><p>{session.user.email}</p></div><AdminNav /><div className="editor-sidebar-footer"><Link className="text-link" to="/blog">Blog</Link><button className="text-link" onClick={() => {
      if (dirtyRef.current && !window.confirm('Pengaturan belum disimpan. Tetap keluar?')) return;
      signOut(auth).catch(() => { setFailed(true); setMessage('Belum dapat keluar. Coba lagi.'); });
    }}>Keluar</button></div></aside>
    <div className="editor-workspace"><header className="bot-heading"><div><h1>Bot Artikel Trending</h1><p>Cari berita lintas kategori dan kelola target publikasi harian.</p></div><button className="blog-primary" onClick={run} disabled={!loaded || dirty || Boolean(busy) || Boolean(activeRun) || Boolean(queued) || Boolean(readError)}>{busy === 'run' ? 'Menyimpan antrean…' : busy === 'dispatch' ? 'Memicu runner…' : requestState?.status === 'queued' ? 'Permintaan dalam antrean' : activeRun || requestState?.status === 'processing' ? 'Bot sedang berjalan…' : 'Jalankan Sekarang'}</button></header>
      <p className="bot-mode-note">Tombol manual menyimpan antrean lalu memicu runner GitHub. Pencarian sumber dan penulisan berlangsung di server; halaman ini boleh ditutup. Runner diperiksa sekitar setiap 15 menit. Mode otomatis mencoba lagi setiap jam setelah waktu mulai sampai target harian tercapai.</p>
      <p className="bot-runner-status">{runnerStatus?.lastCheckAt ? `Runner terakhir terhubung: ${dateLabel(runnerStatus.lastCheckAt)}.` : 'Runner belum terhubung. Selesaikan konfigurasi GitHub Actions dan secret Gemini terlebih dahulu.'} <a className="text-link" href="https://github.com/adenarevan/my-portofolio2/actions/workflows/trending-bot.yml" target="_blank" rel="noopener noreferrer">Buka GitHub Actions</a></p>
      {readError && <div className="editor-message is-error" role="alert"><p>{readError}</p><button className="text-link" onClick={() => setAttempt(value => value + 1)}>Coba lagi</button></div>}
      {message && <p className={failed ? 'editor-message is-error' : 'editor-message'} role={failed ? 'alert' : 'status'}>{message}</p>}
      {showDispatchNotice && <p className="editor-message" role="status">{dispatchNotice.message}</p>}
      {requestState && <div className="editor-message" role="status"><strong>{requestLabel}</strong><p>{requestState.message}</p>
        {resultRun?.status === 'skipped' && resultRun.filterStats && <p className="editor-help">{resultRun.filterStats.total ?? resultRun.diagnostics?.filter(item => item.stage === 'rss' && item.status === 'ok').reduce((sum, item) => sum + (item.count || 0), 0)} entri diperiksa · {resultRun.filterStats.stale || 0} di luar rentang waktu · {resultRun.filterStats.category || 0} tidak cocok kategori · {resultRun.filterStats.singlePublisher || 0} kelompok topik belum didukung dua penerbit independen.</p>}
        {resultRun?.status === 'skipped' && !existingArticle && resultRun.settings?.region === 'ID' && <p className="editor-help">Untuk memperluas pilihan, ubah Wilayah liputan ke Global, simpan pengaturan, lalu jalankan lagi. Artikel tetap ditulis dalam bahasa Indonesia.</p>}
        {resultRun?.items?.filter(item => item.postId).map((item, index) => <p key={`${item.postId}-${index}`}><Link className="text-link" to={`/admin?post=${encodeURIComponent(item.postId)}`}>{item.status === 'published' || item.existingStatus === 'published' ? 'Buka artikel' : 'Buka draf'}: {item.title}</Link></p>)}
      </div>}
      {requestState?.status === 'queued' && <div className="editor-save-actions"><button type="button" className="blog-secondary" onClick={startQueuedRunner} disabled={Boolean(busy) || Boolean(readError)}>Mulai runner sekarang</button><a className="text-link" href="https://github.com/adenarevan/my-portofolio2/actions/workflows/trending-bot.yml" target="_blank" rel="noopener noreferrer">Jalankan lewat GitHub Actions</a></div>}
      <section className="editor-message" aria-label="Publikasi bot hari ini"><strong>{daily?.postIds?.length || 0} / {savedSettings.dailyTarget} artikel bot terbit hari ini · WIB</strong><p>{savedSettings.enabled && savedSettings.autoPublish ? 'Publikasi otomatis aktif. Artikel tetap harus memiliki bahan dari dua grup penerbit, referensi yang valid, dan lolos pemeriksaan duplikasi.' : 'Publikasi otomatis nonaktif. Hasil baru tetap berupa draf.'}</p>{(daily?.postIds || []).map((id, index) => <p key={id}><Link className="text-link" to={`/blog/${encodeURIComponent(id)}`}>Lihat artikel terbit {index + 1}</Link></p>)}</section>
      <div className="bot-panels"><form ref={settingsPanel} className="bot-settings editor-form" onSubmit={save}>
        <div className="bot-section-heading"><h2>Pengaturan</h2><span>{dirty ? 'Belum disimpan' : form.enabled ? 'Jadwal aktif' : 'Jadwal nonaktif'}</span></div>
        {!loaded ? <p role={loadingSettings ? 'status' : undefined}>{loadingSettings ? 'Memuat pengaturan…' : 'Pengaturan belum dapat dibaca.'}</p> : <fieldset disabled={Boolean(busy) || Boolean(readError) || loadingSettings}>
          <label className="bot-check bot-enabled"><input type="checkbox" checked={form.enabled} onChange={event => change('enabled', event.target.checked)} /><span>Aktifkan eksekusi terjadwal</span></label>
          <label className="bot-check"><input id="bot-auto-publish" type="checkbox" checked={form.autoPublish} onChange={event => change('autoPublish', event.target.checked)} /><span>Terbitkan otomatis setelah validasi sumber</span></label>
          <p className="editor-help">Jika jadwal dan publikasi otomatis aktif, hasil langsung tampil di blog. Matikan publikasi otomatis untuk menyimpan hasil sebagai draf.</p>
          <div><label htmlFor="bot-daily-target">Target artikel otomatis per hari (WIB)</label><select id="bot-daily-target" value={form.dailyTarget} onChange={event => change('dailyTarget', Number(event.target.value))}>{[1, 2, 3].map(count => <option value={count} key={count}>{count} artikel</option>)}</select></div>
          <fieldset className="bot-options"><legend>Kategori topik</legend>{Object.entries(BOT_CATEGORIES).map(([key, label]) => <label className="bot-check" key={key}><input type="checkbox" checked={form.categories.includes(key)} onChange={() => toggle('categories', key)} /><span>{label}</span></label>)}</fieldset>
          <div className="bot-field-pair"><div><label htmlFor="bot-region">Wilayah liputan</label><select id="bot-region" value={form.region} onChange={event => change('region', event.target.value)}>{Object.entries(BOT_REGIONS).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></div><div><label htmlFor="bot-window">Rentang tren</label><select id="bot-window" value={form.windowHours} onChange={event => change('windowHours', Number(event.target.value))}>{[6, 12, 24, 72, 168].map(hours => <option key={hours} value={hours}>{hours} jam terakhir</option>)}</select></div></div>
          <div className="bot-field-pair"><div><label htmlFor="bot-time">Mulai mencari (WIB)</label><input id="bot-time" type="time" required value={form.time} onChange={event => change('time', event.target.value)} /></div><div><label htmlFor="bot-max">Maksimum artikel per eksekusi</label><select id="bot-max" value={form.maxArticles} onChange={event => change('maxArticles', Number(event.target.value))}>{[1, 2, 3].map(count => <option value={count} key={count}>{count} artikel</option>)}</select></div></div>
          <fieldset className="bot-options bot-days"><legend>Hari eksekusi · Asia/Jakarta</legend>{days.map((day, index) => <label className="bot-check" key={day}><input type="checkbox" checked={form.days.includes(index)} onChange={() => toggle('days', index)} /><span>{day}</span></label>)}</fieldset>
          <details className="bot-feed-options"><summary>Sumber RSS pilihan</summary><p>Indonesia memakai media Indonesia. CNN dan CNBC dihitung sebagai satu grup penerbit.</p>{RSS_SOURCES.map(source => <label className="bot-check" key={source.id}><input type="checkbox" checked={form.sourceIds.includes(source.id)} onChange={() => toggle('sourceIds', source.id)} /><span>{source.name}{source.region === 'GLOBAL' ? ' · Global' : ''}</span></label>)}</details>
          {remoteChanged && <div className="editor-message" role="status"><p>Pengaturan di server telah berubah.</p><button className="text-link" type="button" onClick={() => { if (!window.confirm('Buang perubahan lokal dan muat pengaturan terbaru?')) return; setForm(extract(latest.current)); setRevision(latest.current?.revision || 0); dirtyRef.current = false; setDirty(false); setRemoteChanged(false); }}>Muat versi terbaru</button></div>}
          <button className="blog-secondary" type="submit" disabled={!dirty || Boolean(readError)}>{busy === 'save' ? 'Menyimpan…' : 'Simpan pengaturan'}</button>
          <p className="editor-help">{dirty ? 'Simpan pengaturan sebelum menjalankan bot.' : form.enabled && form.autoPublish ? 'Publikasi otomatis aktif. Percobaan terjadwal dan manual berbagi batas harian yang sama.' : 'Hasil disimpan sebagai draf untuk ditinjau di editor.'}</p>
        </fieldset>}
      </form><section className="bot-history" aria-labelledby="bot-history-heading"><h2 id="bot-history-heading">Hasil eksekusi</h2>
        {loadingRuns ? <p role="status">Memuat riwayat…</p> : readErrors.runs ? <p>Riwayat belum dapat dibaca.</p> : !runs.length ? <p className="bot-empty">Belum ada eksekusi. Bot nonaktif sampai jadwal diaktifkan atau dijalankan secara manual.</p> : <ol className="bot-run-list">{runs.map(run => <li key={run.id} className="bot-run"><div className="bot-run-heading"><strong>{statusLabels[run.status] || run.status}</strong><time dateTime={run.startedAt?.toDate?.().toISOString()}>{dateLabel(run.startedAt)}</time></div><p role={run.status === 'running' ? 'status' : undefined}>{run.message}</p><p className="bot-run-trigger">{run.trigger === 'manual' ? 'Manual' : 'Terjadwal'}</p>
          {!!run.items?.length && <ul className="bot-result-list">{run.items.map((item, index) => <li key={index}><strong>{item.title}</strong><span>{statusLabels[item.status]} · {item.reason}</span>{item.status === 'published' && item.postId && <Link className="text-link" to={`/blog/${encodeURIComponent(item.postId)}`}>Lihat di blog</Link>}{item.postId && <Link className="text-link" to={`/admin?post=${encodeURIComponent(item.postId)}`}>{item.status === 'created' ? 'Buka draf di editor' : 'Edit artikel'}</Link>}</li>)}</ul>}
          {(run.diagnostics?.length > 0 || run.filterStats) && <details className="bot-diagnostics"><summary>Rincian sumber dan filter</summary>{run.filterStats && <p>Kedaluwarsa: {run.filterStats.stale || 0} · Kategori tidak cocok: {run.filterStats.category || 0} · Satu penerbit: {run.filterStats.singlePublisher || 0}</p>}<ul>{run.diagnostics?.map((item, index) => <li key={index}>{item.source} · {item.stage} · {item.status === 'ok' ? `${item.count} entri terbaca${item.recentCount !== undefined ? `, ${item.recentCount} dalam rentang waktu` : ''}` : item.message}{item.status === 'ok' && item.message ? ` · ${item.message}` : ''}</li>)}</ul><p>ID: {run.id} · Percobaan: {run.attempt || 1}</p></details>}
        </li>)}</ol>}
      </section></div>
    </div>
  </div></BlogShell>;
}
