import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../translations';
import { useEffect, useRef, useState } from 'react';

const AboutSection = () => {
  const { language } = useLanguage();
  const t = translations[language].about;
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="about" className="py-20 lg:py-32 bg-white" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              {t.title}
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                {t.description1}
              </p>
              <p>
                {t.description2}
              </p>
              <p>
                {t.description3}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 stagger-children">
              <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                JavaScript / TypeScript
              </div>
              <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                Laravel/CI3
              </div>
              <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                React / Next.js
              </div>
              <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                Node.js
              </div>
              <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                MySQL / PostgreSQL
              </div>
              <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                GCP / Docker
              </div>
            </div>
          </div>
          <div className={`relative transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-500">
              <img
                src="/assets/gua.jpeg"
                alt="Professional headshot"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-emerald-500 text-white p-6 rounded-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300">
              <div className="text-3xl font-bold">5+</div>
              <div className="text-emerald-100 text-sm">{t.yearsExperience}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
