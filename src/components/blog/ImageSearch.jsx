import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { searchArticleImages } from '../../lib/articleImageSearch';

export default function ImageSearch({ selected, onSelect, disabled, t }) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ images: [], loading: false, searched: false, error: false });
  const request = useRef(null);
  const input = useRef(null);
  useEffect(() => { input.current?.focus(); return () => request.current?.abort(); }, []);
  async function search() {
    if (disabled || query.trim().length < 2) return;
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setState({ images: [], loading: true, searched: true, error: false });
    try {
      const images = await searchArticleImages(query, { signal: controller.signal });
      if (!controller.signal.aborted) setState({ images, loading: false, searched: true, error: false });
    } catch {
      if (!controller.signal.aborted) setState({ images: [], loading: false, searched: true, error: true });
    }
  }
  return <div className="image-search">
    <label htmlFor="article-image-query">{t.imageSearchLabel}</label>
    <div className="image-search-controls"><input ref={input} id="article-image-query" value={query} maxLength={100} disabled={disabled}
      placeholder={t.imageSearchPlaceholder} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); search(); } }} />
      <button type="button" className="blog-secondary" disabled={disabled || state.loading || query.trim().length < 2} onClick={search}>{state.loading ? t.imageSearching : t.imageSearch}</button></div>
    <p className="editor-help">{t.imageSearchHelp}</p>
    <div aria-live="polite" aria-busy={state.loading}>
      {state.error ? <p role="alert">{t.imageSearchError}</p> : state.searched && !state.loading && !state.images.length ? <p>{t.imageSearchEmpty}</p> : null}
    </div>
    {state.images.length > 0 && <div className="rich-image-gallery image-search-results" role="group" aria-label={t.imageSearchResults}>{state.images.map(image =>
      <button type="button" key={image.src} title={`${image.alt} — ${image.credit}`} disabled={disabled} aria-pressed={selected === image.src} onClick={() => onSelect(image)}>
        <img src={image.previewSrc || image.src} alt="" width="240" height="150" loading="lazy" referrerPolicy="no-referrer" onError={event => {
          if (event.currentTarget.src !== image.src) event.currentTarget.src = image.src;
          else setState(current => ({ ...current, images: current.images.filter(candidate => candidate.src !== image.src) }));
        }} />
        <span>{image.alt}</span><small>{image.credit}</small>
      </button>)}</div>}
  </div>;
}
ImageSearch.propTypes = { selected: PropTypes.string, onSelect: PropTypes.func.isRequired, disabled: PropTypes.bool, t: PropTypes.object.isRequired };
