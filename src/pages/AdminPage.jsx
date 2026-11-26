import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useBeforeUnload, useBlocker, useSearchParams } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, firebaseConfigured } from '../lib/firebase';
import { useBlogSession } from '../hooks/useBlog';
import { usePageMeta } from '../hooks/usePageMeta';
import { loadEditorPost, postDate, subscribeAdminPosts } from '../lib/blog';
import { useLanguage } from '../contexts/useLanguage';
import { blogCopy } from '../components/blog/blogCopy';
import BlogShell from '../components/blog/BlogShell';
import PostEditor from '../components/blog/PostEditor';
import AdminNav from '../components/blog/AdminNav';

export default function AdminPage() {
  const { language } = useLanguage();
  const t = blogCopy[language];
  const session = useBlogSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPost = searchParams.get('post');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState(null);
  const selectedId = useRef(null);
  const [editorKey, setEditorKey] = useState(0);
  const dirty = useRef(false);
  const markDirty = useCallback(value => { dirty.current = value; }, []);
  const [filter, setFilter] = useState('all');
  const [count, setCount] = useState(50);
  const [hasMore, setHasMore] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(() => window.matchMedia('(min-width: 651px)').matches);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty.current && currentLocation.pathname + currentLocation.search !== nextLocation.pathname + nextLocation.search);
  usePageMeta(t.admin, t.editorIntro, true);
  useBeforeUnload(useCallback(event => { if (dirty.current) { event.preventDefault(); event.returnValue = ''; } }, []));
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm(t.discard)) blocker.proceed(); else blocker.reset();
    }
  }, [blocker, t.discard]);
  useEffect(() => {
    if (!session.admin) { setPosts([]); return; }
    setLoading(true); setError(false);
    return subscribeAdminPosts(count, result => { setPosts(result.posts); setHasMore(result.hasMore); setLoading(false); }, () => { setError(true); setLoading(false); });
  }, [session.admin, count, attempt]);
  useEffect(() => {
    if (!session.admin || requestedPost === selectedId.current) return;
    if (!requestedPost) {
      if (selectedId.current) { selectedId.current = null; setSelected(null); markDirty(false); setEditorKey(key => key + 1); }
      return;
    }
    let cancelled = false;
    loadEditorPost(requestedPost).then(post => {
      if (!cancelled) {
        if (!post) { setError(true); return; }
        selectedId.current = post.id; setSelected(post); markDirty(false); setEditorKey(key => key + 1);
      }
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [requestedPost, session.admin, markDirty]);
  function choose(post) {
    if (dirty.current && !window.confirm(t.discard)) return;
    selectedId.current = post?.id || null; setSelected(post); markDirty(false); setEditorKey(key => key + 1);
    setSearchParams(post ? { post: post.id } : {});
  }
  async function logout() {
    if (dirty.current && !window.confirm(t.discard)) return;
    setLogoutBusy(true);
    try { await signOut(auth); markDirty(false); }
    catch { setError(true); setLogoutBusy(false); }
  }
  if (!firebaseConfigured) return <Navigate to="/login" replace />;
  if (session.loading) return <BlogShell editor><p className="editor-loading frame" role="status">{t.checking}</p></BlogShell>;
  if (session.error) return <BlogShell editor><div className="editor-loading frame" role="alert"><p>{session.error === 'permission-denied' ? t.permissionError : t.sessionError}</p><button className="text-link" onClick={session.retry}>{t.retry}</button><Link className="text-link" to="/login">{t.login}</Link></div></BlogShell>;
  if (!session.user || !session.admin) return <Navigate to="/login" replace />;
  const visiblePosts = posts.filter(post => filter === 'all' || post.status === filter);
  return <BlogShell editor><div className="admin-layout frame">
    <aside className="editor-sidebar"><div className="editor-account"><h1>{t.admin}</h1><p>{session.user.email}</p></div><button className="blog-secondary new-post" onClick={() => choose(null)}>{t.newPost}</button><AdminNav />
      <button className="editor-list-heading" type="button" aria-expanded={libraryOpen} aria-controls="editor-library" onClick={() => setLibraryOpen(open => !open)}><span>{t.posts}</span><span>{posts.length} {libraryOpen ? '−' : '+'}</span></button>
      <div id="editor-library" hidden={!libraryOpen}>
      <div className="editor-filters" aria-label={t.posts}>{[['all', t.allPosts], ['draft', t.draft], ['published', t.published]].map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
      {loading && <p role="status" className="editor-help">{t.loading}</p>}
      {error && <div role="alert"><p>{t.error}</p><button className="text-link" onClick={() => setAttempt(n => n + 1)}>{t.retry}</button></div>}
      {!loading && !error && !visiblePosts.length && <p className="editor-help">{posts.length ? t.noMatches : t.noPosts}</p>}
      <ul className="editor-post-list">{visiblePosts.map(post => <li key={post.id}><button aria-pressed={selected?.id === post.id} onClick={() => choose(post)}><span className="editor-post-title">{post.title}</span><span className="editor-post-meta"><span className={post.status === 'published' ? 'post-status published' : 'post-status'}>{post.status === 'published' ? t.published : t.draft}</span><span>{postDate(post.updatedAt, language)}</span></span></button></li>)}</ul>
      {hasMore && <button className="text-link" disabled={loading} onClick={() => setCount(n => n + 50)}>{t.more}</button>}
      </div>
      <div className="editor-sidebar-footer"><Link className="text-link" to="/blog">{t.blog}</Link><button className="text-link" onClick={logout} disabled={logoutBusy}>{t.logout}</button></div>
    </aside>
    <div className="editor-workspace"><div className="editor-workspace-heading"><h2>{selected ? selected.title : t.newPost}</h2><p>{t.editorIntro}</p></div><PostEditor key={editorKey} initialPost={selected} user={session.user} onDirty={markDirty} onSaved={post => { selectedId.current = post.id; setSelected(post); setSearchParams({ post: post.id }, { replace: true }); }} onDeleted={() => { selectedId.current = null; setSelected(null); markDirty(false); setEditorKey(n => n + 1); setSearchParams({}); }} /></div>
  </div></BlogShell>;
}
