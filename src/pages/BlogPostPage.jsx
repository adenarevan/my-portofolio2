import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/useLanguage';
import { usePageMeta } from '../hooks/usePageMeta';
import { loadPost, postDate, readingMinutes } from '../lib/blog';
import { blogCopy } from '../components/blog/blogCopy';
import BlogShell from '../components/blog/BlogShell';
import PostBody from '../components/blog/PostBody';

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
  return <BlogShell><div className="article-page frame"><Link className="text-link" to="/blog">{t.back}</Link>
    {loading ? <p className="blog-state" role="status">{t.loading}</p> : error ? <div className="blog-state" role="alert"><p>{t.error}</p><button className="text-link" onClick={() => setAttempt(n => n + 1)}>{t.retry}</button></div> : post ? <article className="reading-column"><header className="article-heading"><h1>{post.title}</h1><div className="article-meta"><time dateTime={post.publishedAt?.toDate?.().toISOString()}>{postDate(post.publishedAt, language)}</time><span>{readingMinutes(post.body)} {t.minutes}</span>{post.tag && <span>{post.tag}</span>}</div>{post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}</header><PostBody body={post.body} /><p className="article-author">{t.by} Adena Reis Vanrika</p></article> : <div className="blog-empty"><h1>{t.notFound}</h1><p>{t.notFoundText}</p></div>}
  </div></BlogShell>;
}
