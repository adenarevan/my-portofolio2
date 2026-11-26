import { useState } from 'react';
import PropTypes from 'prop-types';
import { normalizeArticleImage } from '../../lib/articleMedia';

function ImageContent({ image, cover, compact, fallback }) {
  const [failed, setFailed] = useState(false);
  if (failed) return cover && fallback && fallback.src !== image.src ? <ArticleImage image={fallback} cover /> : null;
  return <figure className={cover ? 'article-image article-cover' : compact ? 'article-image article-thumbnail' : 'article-image'}>
    <img src={image.src} alt={compact ? '' : image.alt} width="1280" height="853" loading={cover ? 'eager' : 'lazy'} fetchPriority={cover ? 'high' : undefined} decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    {!compact && (image.caption || image.credit) && <figcaption>{image.caption && <span>{image.caption}</span>}{image.credit && (image.creditUrl ? <a href={image.creditUrl} target="_blank" rel="noopener noreferrer">{image.credit}</a> : <span>{image.credit}</span>)}</figcaption>}
  </figure>;
}
ImageContent.propTypes = { image: PropTypes.object.isRequired, cover: PropTypes.bool, compact: PropTypes.bool, fallback: PropTypes.object };
export default function ArticleImage({ image, cover = false, compact = false, fallback }) {
  const safe = normalizeArticleImage(image);
  return safe ? <ImageContent key={safe.src} image={safe} cover={cover} compact={compact} fallback={normalizeArticleImage(fallback)} /> : null;
}
ArticleImage.propTypes = { image: PropTypes.object, cover: PropTypes.bool, compact: PropTypes.bool, fallback: PropTypes.object };
