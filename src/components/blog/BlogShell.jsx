import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/useLanguage';
import { blogCopy } from './blogCopy';

export default function BlogShell({ children, editor = false }) {
  const { language, setLanguage } = useLanguage();
  const t = blogCopy[language];
  return <div className={editor ? 'blog-shell editor-shell' : 'blog-shell'}>
    <a className="skip-link" href="#blog-main">{language === 'id' ? 'Langsung ke konten' : 'Skip to content'}</a>
    <header className="blog-header frame">
      <Link className="wordmark" to="/" aria-label="Adena Reis Vanrika">arv<span>.</span></Link>
      <nav aria-label={language === 'id' ? 'Navigasi blog' : 'Blog navigation'}><Link to="/">{t.home}</Link><Link to="/blog">{t.blog}</Link></nav>
      <div className="blog-header-actions"><div className="language-switch" aria-label={language === 'id' ? 'Bahasa' : 'Language'}><button type="button" aria-pressed={language === 'id'} onClick={() => setLanguage('id')}>ID</button><span aria-hidden="true">/</span><button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button></div>{!editor && <Link className="text-link" to="/login">{t.login}</Link>}</div>
    </header>
    <main id="blog-main">{children}</main>
    {!editor && <footer className="blog-footer frame"><span>© {new Date().getFullYear()} Adena Reis Vanrika</span><Link to="/">{t.home}</Link></footer>}
  </div>;
}
BlogShell.propTypes = { children: PropTypes.node.isRequired, editor: PropTypes.bool };
