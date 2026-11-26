import { Link } from 'react-router-dom';
import { useLatestPosts } from '../../hooks/useBlog';
import { useLanguage } from '../../contexts/useLanguage';
import { blogCopy } from './blogCopy';
import PostList from './PostList';

export default function BlogSection() {
  const { language } = useLanguage();
  const t = blogCopy[language];
  const { posts, loading, error, retry } = useLatestPosts();
  return <section className="blog-section section-space frame" id="blog" aria-labelledby="blog-title">
    <div className="section-heading"><h2 id="blog-title">{t.title}</h2><p>{t.intro}</p></div>
    {loading ? <p role="status" className="blog-state">{t.loading}</p> : error ? <div className="blog-state" role="status"><p>{t.error}</p><button className="text-link" onClick={retry}>{t.retry}</button></div> : posts.length ? <PostList posts={posts} /> : <div className="blog-state"><p>{t.empty}</p><p>{t.emptyDescription}</p></div>}
    <Link className="text-link blog-view-all" to="/blog">{t.all}</Link>
  </section>;
}
