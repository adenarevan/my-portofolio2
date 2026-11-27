import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/useLanguage';
import { usePageMeta } from '../hooks/usePageMeta';
import { loadBlogTopics, loadPublishedPosts } from '../lib/blog';
import { decodePostCursor, searchWords } from '../lib/blogSearch';
import { blogCopy } from '../components/blog/blogCopy';
import { archiveCopy } from '../components/blog/archiveCopy';
import BlogShell from '../components/blog/BlogShell';
import PostList from '../components/blog/PostList';

export default function BlogPage() {
  const { language } = useLanguage();
  const t = blogCopy[language], a = archiveCopy[language];
  const [params, setParams] = useSearchParams();
  const search = (params.get('q') || '').slice(0, 80), tag = (params.get('tag') || '').slice(0, 40);
  const before = params.get('before') || '', after = params.get('after') || '';
  const boundary = decodePostCursor(before || after) ? before || after : '';
  const pageNumber = boundary ? Math.min(100000, Math.max(1, Math.floor(Number(params.get('page')) || 1))) : 1;
  const [input, setInput] = useState(search);
  const [topics, setTopics] = useState([]);
  const [state, setState] = useState({ posts: [], loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  const resultsRef = useRef(null), changed = useRef(false);
  const invalidSearch = Boolean(search.trim()) && !searchWords(search).length;
  usePageMeta('Blog', t.intro);
  useEffect(() => { setInput(search); }, [search]);
  useEffect(() => { let active = true; loadBlogTopics().then(tags => { if (active) setTopics(tags); }).catch(() => {}); return () => { active = false; }; }, []);
  useEffect(() => {
    let active = true;
    setState({ posts: [], loading: true, error: false });
    const pending = invalidSearch ? Promise.resolve({ posts: [], hasMore: false, hasPrevious: false }) : loadPublishedPosts(boundary || null, { tag, search, before: Boolean(before && boundary) });
    pending.then(page => { if (active) { setState({ ...page, loading: false, error: false }); if (changed.current) resultsRef.current?.focus({ preventScroll: true }); } }, () => { if (active) setState({ posts: [], loading: false, error: true }); });
    return () => { active = false; };
  }, [search, tag, boundary, before, attempt, invalidSearch]);
  function update(next, scroll = false) { changed.current = true; setParams(next); if (scroll) resultsRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); }
  function filter(nextTag, nextSearch = input.trim()) { const next = new URLSearchParams(); if (nextSearch) next.set('q', nextSearch); if (nextTag) next.set('tag', nextTag); update(next); }
  function move(direction) {
    const next = new URLSearchParams(); if (search) next.set('q', search); if (tag) next.set('tag', tag);
    const number = pageNumber + (direction === 'next' ? 1 : -1);
    if (number > 1) { next.set('page', String(number)); next.set(direction === 'next' ? 'after' : 'before', direction === 'next' ? state.lastCursor : state.firstCursor); }
    update(next, true);
  }
  const availableTopics = [...new Set([...topics, ...state.posts.map(post => post.tag).filter(Boolean), ...(tag ? [tag] : [])])];
  return <BlogShell><div className="blog-page frame">
    <div className="blog-page-heading"><h1>{t.title}</h1><p>{t.intro}</p></div>
    <form className="blog-discovery" role="search" onSubmit={event => { event.preventDefault(); filter(tag); }}>
      <div className="blog-search-field"><label htmlFor="blog-search">{a.search}</label><div><input id="blog-search" type="search" value={input} maxLength={80} placeholder={a.placeholder} onChange={event => setInput(event.target.value)} aria-describedby="blog-search-help" /><button className="blog-primary" type="submit">{a.submit}</button></div><p id="blog-search-help">{a.help}</p></div>
      <div className="blog-topic-field"><label htmlFor="blog-topic">{a.topic}</label><select id="blog-topic" value={tag} onChange={event => filter(event.target.value)}><option value="">{a.allTopics}</option>{availableTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}</select></div>
      {(search || tag) && <button className="text-link blog-clear" type="button" onClick={() => { setInput(''); update(new URLSearchParams()); }}>{a.clear}</button>}
    </form>
    <section className="blog-results" aria-labelledby="blog-results-heading" aria-busy={state.loading}>
      <div className="blog-results-heading"><h2 id="blog-results-heading" ref={resultsRef} tabIndex={-1}>{search ? a.searchResults : tag || a.latest}</h2><p aria-live="polite">{state.loading ? t.loading : `${a.page} ${pageNumber} · ${state.posts.length} ${a.articles}`}</p></div>
      {!state.error && <PostList posts={state.posts} />}
      {state.error && <div className="blog-state" role="alert"><p>{t.error}</p><button className="text-link" onClick={() => setAttempt(value => value + 1)}>{t.retry}</button></div>}
      {!state.loading && !state.error && !state.posts.length && <div className="blog-empty"><p>{invalidSearch ? a.tooShort : search || tag || boundary ? a.noResults : t.empty}</p><p>{search || tag || boundary ? a.tryAnother : t.emptyDescription}</p></div>}
      {!state.loading && !state.error && (state.hasMore || state.hasPrevious || boundary) && <nav className="blog-pagination" aria-label={a.pagination}><button className="blog-secondary" onClick={() => move('previous')} disabled={!state.hasPrevious}>{a.previous}</button><span>{a.page} {pageNumber}</span><button className="blog-secondary" onClick={() => move('next')} disabled={!state.hasMore}>{a.next}</button></nav>}
    </section>
  </div></BlogShell>;
}
