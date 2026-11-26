import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { loadPublishedPosts, postDate, readingMinutes } from '../../lib/blog';
import { articleOutline } from '../../lib/articleReading';
import { defaultArticleImage } from '../../lib/articleMedia';
import { useLanguage } from '../../contexts/useLanguage';
import portrait from '../../assets/gua.jpeg';
import PostBody from './PostBody';
import ArticleImage from './ArticleImage';
import ReadingRail from './ReadingRail';
import ReaderTools from './ReaderTools';
import { blogCopy } from './blogCopy';
import { readerCopy } from './readerCopy';

export default function ArticleReader({ post }) {
  const { language } = useLanguage(); const t = readerCopy[language];
  const structure = useMemo(() => articleOutline(post.body), [post.body]);
  const image = structure.cover || defaultArticleImage(post);
  const bodyRef = useRef(null);
  const [size, setSize] = useState(() => { try { const saved = Number(localStorage.getItem('portfolio-reader-size')); return [18, 20, 22].includes(saved) ? saved : 20; } catch { return 20; } });
  const [related, setRelated] = useState([]);
  useEffect(() => {
    let current = true;
    loadPublishedPosts().then(({ posts }) => {
      if (current) setRelated(posts.filter(other => other.id !== post.id).sort((a, b) => Number(b.tag === post.tag) - Number(a.tag === post.tag)).slice(0, 3));
    }).catch(() => { if (current) setRelated([]); });
    return () => { current = false; };
  }, [post.id, post.tag]);
  function resize(value) { setSize(value); try { localStorage.setItem('portfolio-reader-size', String(value)); } catch { /* Reading stays usable without storage. */ } }
  return <article className="article-reader" style={{ '--article-font-size': `${size}px` }}>
    <header className="article-heading"><h1>{post.title}</h1><div className="article-meta"><time dateTime={post.publishedAt?.toDate?.().toISOString()}>{postDate(post.publishedAt, language)}</time><span>{readingMinutes(post.body)} {blogCopy[language].minutes}</span>{post.tag && <span>{post.tag}</span>}</div>{post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}<ReaderTools post={post} size={size} onSize={resize} t={t} /></header>
    <ArticleImage image={image} fallback={defaultArticleImage(post)} cover />
    <div className={`article-reading-layout${structure.headings.length > 1 ? ' has-outline' : ''}`}><ReadingRail headings={structure.headings} bodyRef={bodyRef} t={t} /><div ref={bodyRef} className="article-text"><PostBody body={post.body} omitCover anchors /></div></div>
    <section className="article-author-panel" aria-labelledby="article-author-heading"><img src={portrait} alt="Adena Reis Vanrika" width="88" height="88" loading="lazy" decoding="async" /><div><p>{t.by}</p><h2 id="article-author-heading">Adena Reis Vanrika</h2><p>{t.bio}</p><div className="article-author-links"><Link className="text-link" to="/#portfolio">{t.portfolio}</Link><Link className="text-link" to="/blog">{t.allPosts}</Link></div></div></section>
    {related.length > 0 && <section className="related-reading" aria-labelledby="related-heading"><h2 id="related-heading">{t.related}</h2><div className="related-reading-list" data-count={related.length} style={{ '--related-count': related.length }}>{related.map(other => <article key={other.id}><Link className="related-story" to={`/blog/${other.id}`} aria-label={`${t.read}: ${other.title}`}><ArticleImage image={articleOutline(other.body).cover || defaultArticleImage(other)} compact /><div><h3>{other.title}</h3><p>{readingMinutes(other.body)} {blogCopy[language].minutes}{other.tag ? ` · ${other.tag}` : ''}</p></div></Link></article>)}</div></section>}
  </article>;
}
ArticleReader.propTypes = { post: PropTypes.object.isRequired };
