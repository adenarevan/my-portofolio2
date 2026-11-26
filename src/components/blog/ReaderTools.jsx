import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export default function ReaderTools({ post, size, onSize, t }) {
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function share() {
    const url = `${window.location.origin}/blog/${encodeURIComponent(post.id)}`;
    setCopied(false); setManual('');
    try {
      if (navigator.share) await navigator.share({ title: post.title, url });
      else {
        await navigator.clipboard.writeText(url); setCopied(true);
        clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) { if (error.name !== 'AbortError') setManual(url); }
  }
  return <div className="reader-utilities"><div className="reader-tools">
    <div className="reader-text-size" role="group" aria-label={t.textSize}><span>{t.textSize}</span>{[[18, 'A−', t.small], [20, 'A', t.normal], [22, 'A+', t.large]].map(([value, label, title]) => <button key={value} type="button" title={title} aria-label={title} aria-pressed={size === value} onClick={() => onSize(value)}>{label}</button>)}</div>
    <button type="button" className="reader-share" onClick={share}>{t.share} <span aria-hidden="true">↗</span></button>
  </div><span className="reader-share-status" role="status">{copied ? t.copied : ''}</span>{manual && <label className="reader-share-fallback">{t.copyHelp}<input readOnly value={manual} onFocus={event => event.target.select()} /></label>}</div>;
}
ReaderTools.propTypes = { post: PropTypes.object.isRequired, size: PropTypes.number.isRequired, onSize: PropTypes.func.isRequired, t: PropTypes.object.isRequired };
