import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../translations';

const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { language } = useLanguage();
  const t = translations[language].testimonials;

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

  const testimonials = [
    { nameKey: 'client1Name', roleKey: 'client1Role', contentKey: 'client1Content' },
    { nameKey: 'client2Name', roleKey: 'client2Role', contentKey: 'client2Content' },
  ];

  const trustedBy = ['TechCorp', 'StartupHub', 'DigitalWave', 'InnovateLab'];

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            {t.title}
          </h2>
          <p className="text-slate-600">
            {t.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-6 italic">&ldquo;{t[testimonial.contentKey]}&rdquo;</p>
              <div>
                <div className="font-semibold text-slate-900">{t[testimonial.nameKey]}</div>
                <div className="text-slate-500 text-sm">{t[testimonial.roleKey]}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={`text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-slate-500 text-sm mb-6">{t.trustedBy}</p>
          <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
            {trustedBy.map((company, index) => (
              <div key={index} className="text-slate-400 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
