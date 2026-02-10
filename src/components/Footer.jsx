import { GitHubIcon, LinkedInIcon, EmailIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from './translations';

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language].footer;

  return (
    <footer className="bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-xl font-bold text-white mb-1">DevPortfolio</div>
            <p className="text-slate-400 text-sm">
              {t.tagline}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/adenarevan"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:text-white hover:scale-110 transition-all"
            >
              <GitHubIcon />
            </a>
            <a
              href="https://linkedin.com/in/adenarevan"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:text-white hover:scale-110 transition-all"
            >
              <LinkedInIcon />
            </a>
            <a
              href="mailto:adenarevan@gmail.com"
              className="w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:text-white hover:scale-110 transition-all"
            >
              <EmailIcon />
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} DevPortfolio. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
