import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import portrait from '../assets/gua.jpeg';
import { copy, projects } from './portfolioContent';

export default function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const t = copy[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [expandedProject, setExpandedProject] = useState(null);
  const [service, setService] = useState('web');
  const [copied, setCopied] = useState(false);
  const [formStatus, setFormStatus] = useState('');
  const pageRef = useRef(null);
  const menuButtonRef = useRef(null);
  const copyTimer = useRef(null);

  useEffect(() => {
    document.documentElement.lang = language;
    try { window.localStorage.setItem('portfolio-language', language); } catch { /* Storage may be disabled. */ }
  }, [language]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    pageRef.current.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => { observer.disconnect(); window.clearTimeout(copyTimer.current); };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText('adenarevan@gmail.com');
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2400);
    } catch { setFormStatus(t.copyFallback); }
  }

  function submitBrief(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = `${t.formGreeting}\n\n${data.get('message')}\n\n${t.serviceLabel}: ${t.services.find(item => item.id === service).title}\n${t.nameLabel}: ${data.get('name')}\nEmail: ${data.get('email')}`;
    const subject = `${t.mailSubject} — ${data.get('name')}`;
    window.location.href = `mailto:adenarevan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormStatus(t.mailStatus);
  }

  return (
    <div ref={pageRef}>
      <a className="skip-link" href="#main">{t.skip}</a>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Adena Reis Vanrika, home">arv<span>.</span></a>
        <nav className={menuOpen ? 'navigation is-open' : 'navigation'} id="main-navigation" aria-label={t.navigation}>
          {t.nav.map(link => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
        </nav>
        <div className="header-actions">
          <div className="language-switch" aria-label={t.language}>
            <button type="button" aria-pressed={language === 'id'} onClick={() => setLanguage('id')}>ID</button><span aria-hidden="true">/</span><button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
          </div>
          <a className="header-contact" href="#contact">{t.talk}</a>
          <button ref={menuButtonRef} className="menu-toggle" type="button" aria-controls="main-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? t.close : 'Menu'}</button>
        </div>
      </header>
      <main id="main">
        <section className="hero frame" id="home" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-name"><span className="name-mask"><span>ADENA</span></span><span className="name-mask"><span>REIS VANRIKA</span></span></h1>
          <div className="hero-portrait"><img src={portrait} width="863" height="1083" alt="Adena Reis Vanrika" fetchPriority="high" /></div>
          <div className="hero-bottom"><div className="hero-intro"><p className="hero-role">Software engineer</p><p>{t.heroDescription}</p></div><div className="hero-actions"><a className="button" href="#portfolio">{t.seeWork}<span aria-hidden="true">+</span></a><a className="text-link" href="https://github.com/adenarevan" target="_blank" rel="noreferrer">GitHub</a></div></div>
        </section>
        <section className="work section-space frame" id="portfolio" aria-labelledby="work-title">
          <div className="section-heading" data-reveal><h2 id="work-title">{t.workTitle}</h2><p>{t.workIntro}</p></div>
          <div className="project-layout"><div className="project-index">
            {projects.map((project, index) => <article key={project.id} className={`project-item ${activeProject === index ? 'is-active' : ''}`} data-reveal>
              <div className="mobile-project-preview"><img src={`/projects/${project.id}.png`} alt={`${project.title} — ${t.interfaceStudy}`} width="559" height="472" loading="lazy" /></div>
              <button className="project-select" type="button" aria-expanded={expandedProject === index} aria-controls={`project-detail-${project.id}`} onMouseEnter={() => setActiveProject(index)} onFocus={() => setActiveProject(index)} onClick={() => { setActiveProject(index); setExpandedProject(expandedProject === index ? null : index); }}><span className="project-category">{project.category[language]}</span><span className="project-title">{project.title}</span><span className="project-toggle" aria-hidden="true">{expandedProject === index ? '−' : '+'}</span></button>
              <div className="project-details" id={`project-detail-${project.id}`} hidden={expandedProject !== index}><p>{project.description[language]}</p><ul className="tech-list" aria-label="Technology">{project.tech.map(tech => <li key={tech}>{tech}</li>)}</ul><p className="project-note">{t.projectNote}</p></div>
            </article>)}
            <a className="work-github text-link" href="https://github.com/adenarevan" target="_blank" rel="noreferrer">{t.exploreCode}</a>
          </div><div className="project-stage"><div className="project-screen"><img key={projects[activeProject].id} src={`/projects/${projects[activeProject].id}.png`} alt={`${projects[activeProject].title} — ${t.interfaceStudy}`} width="559" height="472" loading="lazy" /></div><div className="project-caption"><span>{projects[activeProject].title}</span><span>{t.interfaceStudy}</span></div><div className="project-thumbnails" aria-label={t.workTitle}>{projects.map((project, index) => <button type="button" key={project.id} aria-label={project.title} aria-pressed={activeProject === index} onClick={() => setActiveProject(index)}><img src={`/projects/${project.id}.png`} alt="" width="559" height="472" loading="lazy" /></button>)}</div></div></div>
        </section>
        <section className="about frame section-space" id="about" aria-labelledby="about-title">
          <div className="about-photo" data-reveal><img src={portrait} alt={t.portraitAlt} width="863" height="1083" loading="lazy" /></div>
          <div className="about-copy"><h2 id="about-title" data-reveal>{t.aboutTitle}</h2><p className="statement" data-reveal>{t.aboutStatement}</p><p data-reveal>{t.aboutDescription}</p><dl className="about-facts" data-reveal><div><dt>{t.focus}</dt><dd>{t.focusValue}</dd></div><div><dt>{t.approach}</dt><dd>{t.approachValue}</dd></div></dl><a className="text-link" href="https://linkedin.com/in/adena-reis-vanrika-0bb104187/" target="_blank" rel="noreferrer">{t.linkedin}</a></div>
        </section>
        <section className="services frame section-space" id="services" aria-labelledby="services-title">
          <div className="section-heading" data-reveal><h2 id="services-title">{t.servicesTitle}</h2><p>{t.servicesIntro}</p></div>
          <div className="services-body"><div className="service-list">{t.services.map(item => <button type="button" key={item.id} className={service === item.id ? 'service-choice selected' : 'service-choice'} aria-pressed={service === item.id} onClick={() => setService(item.id)} data-reveal>{item.title}<span aria-hidden="true">{service === item.id ? '−' : '+'}</span></button>)}</div><div className="service-description" aria-live="polite" data-reveal><h3>{t.services.find(item => item.id === service).title}</h3><p>{t.services.find(item => item.id === service).description}</p><ul>{t.services.find(item => item.id === service).items.map(item => <li key={item}>{item}</li>)}</ul><a className="text-link" href="#contact">{t.discussService}</a></div></div>
          <div className="stack" data-reveal><span>{t.stack}</span><p>React<span>Laravel</span>JavaScript<span>Node.js</span>PostgreSQL<span>Docker</span></p></div>
        </section>
        <section className="contact frame section-space" id="contact" aria-labelledby="contact-title">
          <div className="contact-intro"><h2 id="contact-title" data-reveal>{t.contactTitle}</h2><p data-reveal>{t.contactDescription}</p><a className="contact-email" href="mailto:adenarevan@gmail.com">adenarevan<span>@gmail.com</span></a><button className="text-link copy-email" type="button" onClick={copyEmail} aria-live="polite">{copied ? t.copied : t.copyEmail}</button><div className="contact-socials"><a href="https://wa.me/6289612142465" target="_blank" rel="noreferrer">WhatsApp</a><a href="https://github.com/adenarevan" target="_blank" rel="noreferrer">GitHub</a><a href="https://linkedin.com/in/adena-reis-vanrika-0bb104187/" target="_blank" rel="noreferrer">LinkedIn</a></div></div>
          <form className="contact-form" onSubmit={submitBrief} data-reveal><p className="form-title">{t.briefTitle}</p><div className="form-row"><div><label htmlFor="name">{t.nameLabel}</label><input id="name" name="name" autoComplete="name" placeholder={t.namePlaceholder} required maxLength={100} /></div><div><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength={200} /></div></div><label htmlFor="service">{t.serviceLabel}</label><select id="service" name="service" value={service} onChange={event => setService(event.target.value)}>{t.services.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select><label htmlFor="message">{t.messageLabel}</label><textarea id="message" name="message" placeholder={t.messagePlaceholder} rows={4} required maxLength={5000} /><button className="button" type="submit">{t.sendBrief}<span aria-hidden="true">+</span></button><p className="form-note">{t.formNote}</p><p className="form-status" role="status">{formStatus}</p></form>
        </section>
      </main>
      <footer className="footer frame"><div className="footer-top"><p>{t.footerLine}</p><a className="text-link" href="#home">{t.backTop}</a></div><p className="footer-name" aria-hidden="true">ADENA.</p><div className="footer-bottom"><span>© {new Date().getFullYear()} Adena Reis Vanrika</span><span>{t.footerCredit}</span></div></footer>
    </div>
  );
}
