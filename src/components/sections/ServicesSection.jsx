import { useState, useEffect, useRef } from 'react';
import { CodeIcon, ReactIcon, ApiIcon, RefreshIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../translations';

const iconMap = {
  code: <CodeIcon />,
  react: <ReactIcon />,
  api: <ApiIcon />,
  refresh: <RefreshIcon />,
};

const ServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { language } = useLanguage();
  const t = translations[language].services;

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

  const services = [
    { icon: 'code', titleKey: 'webDev', descKey: 'webDevDesc' },
    { icon: 'react', titleKey: 'frontend', descKey: 'frontendDesc' },
    { icon: 'api', titleKey: 'backend', descKey: 'backendDesc' },
    { icon: 'refresh', titleKey: 'fullstack', descKey: 'fullstackDesc' },
  ];

  return (
    <section ref={sectionRef} id="services" className="py-20 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            {t.title}
          </h2>
          <p className="text-slate-600">
            {t.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group bg-white p-8 rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all">
                {iconMap[service.icon]}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {t[service.titleKey]}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t[service.descKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;