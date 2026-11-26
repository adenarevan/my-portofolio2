import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/useLanguage';
import { usePageMeta } from '../hooks/usePageMeta';
import { loadPublishedPosts } from '../lib/blog';
import { blogCopy } from '../components/blog/blogCopy';
import BlogShell from '../components/blog/BlogShell';
import PostList from '../components/blog/PostList';

export default function BlogPage() {
  const { language } = useLanguage();
  const t = blogCopy[language];
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const cursor = useRef(null);
  const mounted = useRef(false);
  const busy = useRef(false);
  usePageMeta('Blog', t.intro);

  async function load(next = false) {
    if (busy.current) return;
    busy.current = true;
    setLoading(true); setError(false);
    try {
      const page = await loadPublishedPosts(next ? cursor.current : null);
      if (!mounted.current) return;
      setPosts(previous => [...new Map([...(next ? previous : []), ...page.posts].map(post => [post.id, post])).values()]);
      cursor.current = page.cursor; setHasMore(page.hasMore);
    } catch { if (mounted.current) setError(true); }
    finally { busy.current = false; if (mounted.current) setLoading(false); }
  }
  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, []);

  return <BlogShell><div className="blog-page frame">
    <div className="blog-page-heading"><h1>{t.title}</h1><p>{t.intro}</p></div>
    <PostList posts={posts} />
    {loading && <p className="blog-state" role="status">{t.loading}</p>}
    {error && <div className="blog-state" role="alert"><p>{t.error}</p><button className="text-link" onClick={() => load(posts.length > 0)}>{t.retry}</button></div>}
    {!loading && !error && !posts.length && <div className="blog-empty"><p>{t.empty}</p><p>{t.emptyDescription}</p></div>}
    {hasMore && !error && <button className="blog-secondary" disabled={loading} onClick={() => load(true)}>{t.more}</button>}
  </div></BlogShell>;
}
