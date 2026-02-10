import { useState, useEffect, useRef } from 'react';
import { ExternalLinkIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../translations';

const PortfolioSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { language } = useLanguage();
  const t = translations[language].portfolio;

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

  const projects = [
    {
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      titleKey: 'project1Title',
      descKey: 'project1Desc',
      techStack: ['React', 'Node.js', 'MongoDB'],
    },
    {
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
      titleKey: 'project2Title',
      descKey: 'project2Desc',
      techStack: ['Next.js', 'TypeScript', 'PostgreSQL'],
    },
  ];

  return (
    <section ref={sectionRef} id="portfolio" className="py-20 lg:py-32 bg-white">
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

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ 
                transitionDelay: `${index * 200}ms`,
                animationDelay: `${index * 200}ms`
              }}
            >
              <div className="aspect-video overflow-hidden bg-slate-100">
                <img
                  src={project.image}
                  alt={t[project.titleKey]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {t[project.titleKey]}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {t[project.descKey]}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.techStack.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors group-hover:gap-3"
                >
                  {t.viewProject} <ExternalLinkIcon />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
