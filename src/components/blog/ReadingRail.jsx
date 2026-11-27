import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function ReadingRail({ headings, bodyRef, t, children }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('');
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const sections = [...body.querySelectorAll('[data-article-heading]')];
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = body.getBoundingClientRect();
      const distance = rect.height - window.innerHeight + 192;
      const value = distance > 0 ? (96 - rect.top) / distance : rect.top < 96 ? 1 : 0;
      setProgress(Math.round(Math.max(0, Math.min(1, value)) * 100));
      const current = sections.filter(section => section.getBoundingClientRect().top <= 160).at(-1) || sections[0];
      setActive(current?.id || '');
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule); observer.observe(body);
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule);
    measure();
    return () => { observer.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); cancelAnimationFrame(frame); };
  }, [bodyRef, headings]);
  const links = <ol>{headings.map(heading => <li key={heading.id} className={heading.level > 2 ? 'is-subheading' : undefined}><a href={`#${heading.id}`} aria-current={heading.id === active ? 'location' : undefined}>{heading.text}</a></li>)}</ol>;
  return <aside className="article-rail">
    <div className="reading-progress" role="progressbar" aria-label={t.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
    {headings.length > 1 && <><nav className="article-contents-desktop" aria-label={t.contents}><p>{t.contents}</p>{links}</nav><details className="article-contents-mobile"><summary>{t.contents}</summary><nav aria-label={t.contents}>{links}</nav></details></>}
    <div className="article-rail-extras">{children}</div>
  </aside>;
}
ReadingRail.propTypes = { headings: PropTypes.array.isRequired, bodyRef: PropTypes.object.isRequired, t: PropTypes.object.isRequired, children: PropTypes.node };
