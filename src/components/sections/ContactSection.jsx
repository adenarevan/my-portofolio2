import { useState, useEffect, useRef } from 'react';
import { EmailIcon, WhatsAppIcon, LinkedInIcon, GitHubIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../translations';

const ContactSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { language } = useLanguage();
  const t = translations[language].contact;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              {t.title}
            </h2>
            <p className="text-slate-600 mb-8 max-w-lg">
              {t.subtitle}
            </p>

            <div className="space-y-4">
              <a
                href="mailto:adeanrevan@gmail.com"
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:translate-x-2 group"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <EmailIcon />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{t.email}</div>
                  <div className="text-slate-500 text-sm">adenarevan@gmail.com</div>
                </div>
              </a>

              <a
                href="https://wa.me/089612142465"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:translate-x-2 group"
              >
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <WhatsAppIcon />
                </div>
                <div>
                  <div className="font-medium text-slate-900">WhatsApp</div>
                  <div className="text-slate-500 text-sm">089612142465</div>
                </div>
              </a>

              <a
                href="https://linkedin.com/in/adena-reis-vanrika-0bb104187/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:translate-x-2 group"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <LinkedInIcon />
                </div>
                <div>
                  <div className="font-medium text-slate-900">LinkedIn</div>
                  <div className="text-slate-500 text-sm">linkedin.com/in/adena-reis-vanrika-0bb104187/</div>
                </div>
              </a>

              <a
                href="https://github.com/adenarevan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:translate-x-2 group"
              >
                <div className="w-12 h-12 bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <GitHubIcon />
                </div>
                <div>
                  <div className="font-medium text-slate-900">GitHub</div>
                  <div className="text-slate-500 text-sm">github.com/adenarevan</div>
                </div>
              </a>
            </div>
          </div>

          <div className={`bg-slate-50 rounded-2xl p-8 lg:p-10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              {t.sendMessage}
            </h3>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.yourName}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder={t.namePlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.emailAddress}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder={t.emailPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.message}
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                  placeholder={t.messagePlaceholder}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 hover:shadow-lg transition-all"
              >
                {t.sendButton}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
