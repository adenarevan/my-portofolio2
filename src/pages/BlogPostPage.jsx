import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/useLanguage';
import { usePageMeta } from '../hooks/usePageMeta';
import { loadPost } from '../lib/blog';
import { blogCopy } from '../components/blog/blogCopy';
import BlogShell from '../components/blog/BlogShell';
import ArticleReader from '../components/blog/ArticleReader';

export default function BlogPostPage() {
  const { postId } = useParams();
  const { language } = useLanguage();
  const t = blogCopy[language];
  const [state, setState] = useState({ post: null, loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  usePageMeta(state.post?.title || t.blog, state.post?.metaDescription || state.post?.excerpt || t.intro);
  useEffect(() => {
    let cancelled = false;
    setState({ post: null, loading: true, error: false });
    loadPost(postId).then(post => { if (!cancelled) setState({ post, loading: false, error: false }); }, error => {
      if (!cancelled) setState({ post: null, loading: false, error: !['permission-denied', 'not-found', 'invalid-argument'].includes(error.code) });
    });
    return () => { cancelled = true; };
  }, [postId, attempt]);
  const { post, loading, error } = state;
  return <BlogShell><div className="article-page frame">
    {loading ? <p className="blog-state" role="status">{t.loading}</p> : error ? <div className="blog-state" role="alert"><p>{t.error}</p><button className="text-link" onClick={() => setAttempt(n => n + 1)}>{t.retry}</button></div> : post ? <ArticleReader key={post.id} post={post} /> : <div className="blog-empty"><h1>{t.notFound}</h1><p>{t.notFoundText}</p></div>}
  </div></BlogShell>;
}
