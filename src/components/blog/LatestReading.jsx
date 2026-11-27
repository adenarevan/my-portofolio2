import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { articleOutline } from '../../lib/articleReading';
import { defaultArticleImage } from '../../lib/articleMedia';
import { readingMinutes } from '../../lib/blog';
import ArticleImage from './ArticleImage';

export default function LatestReading({ posts, t, minutes }) {
  if (!posts.length) return null;
  return <section className="article-latest" aria-labelledby="article-latest-heading"><h2 id="article-latest-heading">{t.recent}</h2><ul>{posts.map(post => <li key={post.id}><Link to={`/blog/${post.id}`} aria-label={post.title} title={post.title}><ArticleImage image={articleOutline(post.body).cover || defaultArticleImage(post)} compact /><div><h3>{post.title}</h3><span>{readingMinutes(post.body)} {minutes}</span></div></Link></li>)}</ul><Link className="text-link" to="/blog">{t.archive}</Link></section>;
}
LatestReading.propTypes = { posts: PropTypes.array.isRequired, t: PropTypes.object.isRequired, minutes: PropTypes.string.isRequired };
