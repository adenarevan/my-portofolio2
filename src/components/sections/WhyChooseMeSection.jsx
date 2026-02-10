import { useState, useEffect, useRef } from 'react';
import { CheckIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../translations';

const WhyChooseMeSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { language } = useLanguage();
  const t = translations[language].whyChooseMe;

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

  const reasons = [
    { titleKey: 'reason1Title', descKey: 'reason1Desc' },
    { titleKey: 'reason2Title', descKey: 'reason2Desc' },
    { titleKey: 'reason3Title', descKey: 'reason3Desc' },
    { titleKey: 'reason4Title', descKey: 'reason4Desc' },
  ];

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              {t.title}
            </h2>
            <p className="text-slate-400 mb-10 max-w-lg">
              {t.subtitle}
            </p>
            <div className="space-y-6">
              {reasons.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex gap-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                  style={{ transitionDelay: `${(index + 1) * 150}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                    <CheckIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{t[item.titleKey]}</h3>
                    <p className="text-slate-400 text-sm">{t[item.descKey]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`bg-slate-800 rounded-2xl p-8 lg:p-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-emerald-400 mb-2">50+</div>
                <div className="text-slate-400 text-sm">{t.projectsCompleted}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-emerald-400 mb-2">30+</div>
                <div className="text-slate-400 text-sm">{t.happyClients}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-emerald-400 mb-2">5+</div>
                <div className="text-slate-400 text-sm">{t.yearsExperience}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-emerald-400 mb-2">99%</div>
                <div className="text-slate-400 text-sm">{t.satisfaction}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseMeSection;
