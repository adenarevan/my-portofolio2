import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, firebaseConfigured } from '../lib/firebase';
import { useBlogSession } from '../hooks/useBlog';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../contexts/useLanguage';
import { blogCopy } from '../components/blog/blogCopy';
import BlogShell from '../components/blog/BlogShell';

export default function LoginPage() {
  const { language } = useLanguage();
  const t = blogCopy[language];
  const session = useBlogSession();
  const email = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  usePageMeta(t.loginTitle, t.loginIntro, true);

  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setMessage(''); setFailed(false);
    try { await signInWithEmailAndPassword(auth, data.get('email').trim(), data.get('password')); }
    catch (error) {
      setFailed(true);
      setMessage(error.code === 'auth/too-many-requests' ? t.tooMany : ['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password', 'auth/invalid-email'].includes(error.code) ? t.loginFailed : t.authFailed);
    } finally { setBusy(false); }
  }
  async function resetPassword() {
    if (!email.current.reportValidity()) return;
    setBusy(true); setMessage(''); setFailed(false);
    try { await sendPasswordResetEmail(auth, email.current.value.trim()); setMessage(t.resetSent); }
    catch (error) {
      if (error.code === 'auth/user-not-found') setMessage(t.resetSent);
      else { setFailed(true); setMessage(error.code === 'auth/too-many-requests' ? t.tooMany : t.authFailed); }
    } finally { setBusy(false); }
  }
  if (!session.loading && session.admin) return <Navigate to="/admin" replace />;
  return <BlogShell editor><div className="login-layout frame">
    <div className="login-intro"><h1>{t.loginTitle}</h1><p>{t.loginIntro}</p><p className="login-owner">Adena Reis Vanrika</p></div>
    <div className="login-panel">
      {!firebaseConfigured ? <div className="editor-notice"><h2>{t.setupTitle}</h2><p>{t.setupText}</p></div> : session.loading ? <p role="status">{t.checking}</p> : session.error ? <div className="editor-notice" role="alert"><p>{session.error === 'permission-denied' ? t.permissionError : t.sessionError}</p>{session.user && <p>{t.signedInAs}: {session.user.email}</p>}<div className="editor-save-actions"><button className="blog-secondary" onClick={session.retry}>{t.retry}</button>{session.user && <button className="text-link" onClick={() => signOut(auth).catch(() => { setFailed(true); setMessage(t.authFailed); })}>{t.logout}</button>}</div></div> : session.user ? <div className="editor-notice"><h2>{t.denied}</h2><p>{t.deniedText}</p><button className="blog-secondary" onClick={() => signOut(auth).catch(() => { setFailed(true); setMessage(t.authFailed); })}>{t.logout}</button></div> : <form className="editor-form login-form" onSubmit={submit}>
        <label htmlFor="login-email">{t.email}</label><input ref={email} id="login-email" name="email" type="email" autoComplete="username" required maxLength={254} placeholder="you@example.com" disabled={busy} />
        <label htmlFor="login-password">{t.password}</label><input id="login-password" name="password" type="password" autoComplete="current-password" required maxLength={4096} disabled={busy} />
        <button className="blog-primary" disabled={busy}>{busy ? t.signingIn : t.signIn}</button>
        <button className="text-link" type="button" onClick={resetPassword} disabled={busy}>{t.forgot}</button><p className="editor-help">{t.ownerOnly}</p>
      </form>}
      {message && <p className={failed ? 'editor-message is-error' : 'editor-message'} role={failed ? 'alert' : 'status'}>{message}</p>}
    </div>
  </div></BlogShell>;
}
