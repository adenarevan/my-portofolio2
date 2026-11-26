import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { postDate, readingMinutes } from '../../lib/blog';
import { useLanguage } from '../../contexts/useLanguage';
import { blogCopy } from './blogCopy';

export default function PostList({ posts }) {
  const { language } = useLanguage();
  const t = blogCopy[language];
  return <div className="post-list">{posts.map(post => <article className="post-row" key={post.id}>
    <div className="post-meta"><time dateTime={post.publishedAt?.toDate?.().toISOString()}>{postDate(post.publishedAt, language)}</time><span>{readingMinutes(post.body)} {t.minutes}</span></div>
    <div className="post-summary"><h3><Link to={`/blog/${post.id}`}>{post.title}</Link></h3><p>{post.excerpt}</p><div className="post-row-bottom">{post.tag && <span>{post.tag}</span>}<Link className="text-link" to={`/blog/${post.id}`} aria-label={`${t.read}: ${post.title}`}>{t.read}</Link></div></div>
  </article>)}</div>;
}
PostList.propTypes = { posts: PropTypes.array.isRequired };
