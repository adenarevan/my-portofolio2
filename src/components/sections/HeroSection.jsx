import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../translations';

const HeroSection = () => {
  const { language } = useLanguage();
  const t = translations[language].hero;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: `url('/hero_bg_developer.png')` }}
      />

      {/* Gradient Overlays for Vercel/Apple vibe */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/90 via-slate-900/40 to-slate-950/90" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/90 via-slate-950/20 to-slate-950/90" />

      {/* Subtle Glows (Orange/Blue) */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-start pt-20">

        {/* Subtitle Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-sm sm:text-base font-semibold tracking-[0.2em] text-slate-200 uppercase">{t.subtitle}</span>
        </div>

        {/* Elegant Typography */}
        <div className="animate-fade-in-up animation-delay-200 mb-6">
          <h1 className="animate-float-tilt inline-block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 leading-tight drop-shadow-xl transform -rotate-2 origin-bottom-left">
            {t.nameLine1}
            <br />
            {t.nameLine2}
          </h1>
        </div>

        {/* Glassmorphism Card for Tagline */}
        <div className="animate-fade-in-up animation-delay-400 mt-6 max-w-3xl" style={{ perspective: '1200px' }}>
          <div 
            className="animate-float-tilt-reverse p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group transition-all duration-700"
            style={{
              transform: 'rotateX(15deg) rotateY(-10deg) rotateZ(1deg)',
              transformStyle: 'preserve-3d',
              boxShadow: '-15px 25px 50px -10px rgba(0,0,0,0.6), inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.4)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* 3D Elevated Text */}
            <p 
              className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-200 leading-relaxed relative z-10"
              style={{
                transform: 'translateZ(30px)',
                textShadow: '2px 4px 8px rgba(0,0,0,0.5)'
              }}
            >
              {t.tagline}
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up animation-delay-600 mt-12 flex flex-wrap gap-6">
          <a
            href="#portfolio"
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-slate-950 font-semibold rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2 text-lg">
              {t.viewPortfolio}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-4 border border-white/20 bg-white/5 backdrop-blur-md text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/40 transition-all hover:scale-105 text-lg shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
          >
            {t.hireMe}
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border border-white/30 rounded-full flex justify-center pt-2 bg-black/20 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
