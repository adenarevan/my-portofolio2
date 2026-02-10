import { useState, useEffect } from 'react';
import { MenuIcon, CloseIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from './translations';
import LanguageToggle from './LanguageToggle';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language].nav;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className={`text-xl font-bold transition-colors ${
            isScrolled ? 'text-slate-900' : 'text-white'
          }`}>
            DevPortfolio
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#about"
              className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                isScrolled ? 'text-slate-600' : 'text-white/90'
              }`}
            >
              {t.about}
            </a>
            <a
              href="#services"
              className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                isScrolled ? 'text-slate-600' : 'text-white/90'
              }`}
            >
              {t.services}
            </a>
            <a
              href="#portfolio"
              className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                isScrolled ? 'text-slate-600' : 'text-white/90'
              }`}
            >
              {t.portfolio}
            </a>
            <a
              href="#contact"
              className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                isScrolled ? 'text-slate-600' : 'text-white/90'
              }`}
            >
              {t.contact}
            </a>
            <LanguageToggle isScrolled={isScrolled} />
            <a
              href="#contact"
              className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
            >
              {t.hireMe}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${isScrolled ? 'text-slate-900' : 'text-white'}`}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-slate-600 hover:text-emerald-500 font-medium"
              >
                {t.about}
              </a>
              <a
                href="#services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-slate-600 hover:text-emerald-500 font-medium"
              >
                {t.services}
              </a>
              <a
                href="#portfolio"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-slate-600 hover:text-emerald-500 font-medium"
              >
                {t.portfolio}
              </a>
              <a
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-slate-600 hover:text-emerald-500 font-medium"
              >
                {t.contact}
              </a>
              <div className="pt-2">
                <LanguageToggle isScrolled={true} />
              </div>
              <a
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
              >
                {t.hireMe}
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

