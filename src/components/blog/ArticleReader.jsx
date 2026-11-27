import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { loadBlogTopics, loadPublishedPosts, postDate, readingMinutes } from '../../lib/blog';
import { articleOutline } from '../../lib/articleReading';
import { defaultArticleImage } from '../../lib/articleMedia';
import { useLanguage } from '../../contexts/useLanguage';
import PostBody from './PostBody';
import ArticleImage from './ArticleImage';
import ReadingRail from './ReadingRail';
import ReaderTools from './ReaderTools';
import { blogCopy } from './blogCopy';
import { readerCopy } from './readerCopy';
import { archiveCopy } from './archiveCopy';
import ArticleContext from './ArticleContext';
import LatestReading from './LatestReading';

export default function ArticleReader({ post }) {
  const { language } = useLanguage(); const t = readerCopy[language], a = archiveCopy[language];
  const structure = useMemo(() => articleOutline(post.body), [post.body]);
  const image = structure.cover || defaultArticleImage(post);
  const bodyRef = useRef(null);
  const [size, setSize] = useState(() => { try { const saved = Number(localStorage.getItem('portfolio-reader-size')); return [18, 20, 22].includes(saved) ? saved : 20; } catch { return 20; } });
  const [related, setRelated] = useState([]);
  const [recent, setRecent] = useState([]);
  const [topics, setTopics] = useState([]);
  useEffect(() => {
    let current = true;
    loadPublishedPosts().then(({ posts }) => {
      if (current) {
        const available = posts.filter(other => other.id !== post.id && !/^(kebijakan privasi|privacy policy|syarat dan ketentuan|terms of (use|service))$/i.test(other.title.trim()));
        setRecent(available.slice(0, 3));
        setRelated([...available].sort((a, b) => Number(b.tag === post.tag) - Number(a.tag === post.tag)).slice(0, 3));
      }
    }).catch(() => { if (current) setRelated([]); });
    return () => { current = false; };
  }, [post.id, post.tag]);
  useEffect(() => { let current = true; loadBlogTopics().then(tags => { if (current) setTopics(tags); }).catch(() => {}); return () => { current = false; }; }, []);
  function resize(value) { setSize(value); try { localStorage.setItem('portfolio-reader-size', String(value)); } catch { /* Reading stays usable without storage. */ } }
  return <article className="article-reader" style={{ '--article-font-size': `${size}px` }}>
    <header className="article-heading"><h1>{post.title}</h1><div className="article-meta"><time dateTime={post.publishedAt?.toDate?.().toISOString()}>{postDate(post.publishedAt, language)}</time><span>{readingMinutes(post.body)} {blogCopy[language].minutes}</span>{post.tag && <Link to={`/blog?tag=${encodeURIComponent(post.tag)}`}>{post.tag}</Link>}</div>{post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}<ReaderTools post={post} size={size} onSize={resize} t={t} /></header>
    <div className="article-reading-layout has-sidebars"><ReadingRail headings={structure.headings} bodyRef={bodyRef} t={t}><LatestReading posts={recent} t={a} minutes={blogCopy[language].minutes} /></ReadingRail><div className="article-main"><ArticleImage image={image} fallback={defaultArticleImage(post)} cover /><div ref={bodyRef} className="article-text"><PostBody body={post.body} omitCover anchors /></div></div><ArticleContext topics={[...new Set([...(post.tag ? [post.tag] : []), ...topics])]} tag={post.tag} t={a} /></div>
    {related.length > 0 && <section className="related-reading" aria-labelledby="related-heading"><h2 id="related-heading">{t.related}</h2><div className="related-reading-list" data-count={related.length} style={{ '--related-count': related.length }}>{related.map(other => <article key={other.id}><Link className="related-story" to={`/blog/${other.id}`} aria-label={`${t.read}: ${other.title}`}><ArticleImage image={articleOutline(other.body).cover || defaultArticleImage(other)} compact /><div><h3>{other.title}</h3><p>{readingMinutes(other.body)} {blogCopy[language].minutes}{other.tag ? ` · ${other.tag}` : ''}</p></div></Link></article>)}</div></section>}
  </article>;
}
ArticleReader.propTypes = { post: PropTypes.object.isRequired };
