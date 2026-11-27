import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import portrait from '../../assets/gua.jpeg';

export default function ArticleContext({ topics, tag, t }) {
  return <aside className="article-context" aria-label={t.about}>
    <section className="article-author-panel" aria-labelledby="article-author-heading"><img src={portrait} alt="Adena Reis Vanrika" width="88" height="88" loading="lazy" decoding="async" /><div><h2 id="article-author-heading">Adena Reis Vanrika</h2><p>{t.author}</p><Link className="text-link" to="/#portfolio">{t.explore}</Link></div></section>
    {topics.length > 0 && <nav className="article-topic-nav" aria-label={t.browse}><h2>{t.browse}</h2>{topics.slice(0, 8).map(topic => <Link key={topic} to={`/blog?tag=${encodeURIComponent(topic)}`} aria-current={topic === tag ? 'true' : undefined}>{topic}<span aria-hidden="true">↗</span></Link>)}<Link className="article-archive-link" to="/blog">{t.archive}</Link></nav>}
  </aside>;
}
ArticleContext.propTypes = { topics: PropTypes.array.isRequired, tag: PropTypes.string, t: PropTypes.object.isRequired };
