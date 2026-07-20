import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';

const AboutHero: React.FC = () => {
  const { t } = useLanguage();
  const { ref, isInView } = useInView(0.1);

  return (
    <div 
      ref={ref}
      className="relative h-[55vh] min-h-[480px] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#060d1d] transition-colors duration-300"
    >
      {/* Blueprint grid lines overlay */}
      <div className="absolute inset-0 opacity-40 pointer-events-none z-1" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px'
      }}></div>
      
      {/* Dark mode blueprint override */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dark div[ref] {
          background-color: #060d1d;
        }
        .dark .hero-blueprint-lines {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
      `}} />

      {/* Blueprint container for dark mode selector */}
      <div className="absolute inset-0 hero-blueprint-lines z-1 opacity-50 pointer-events-none"></div>

      {/* Glowing radial auras */}
      <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-sky-500/10 dark:bg-sky-500/5 blur-[120px] pointer-events-none z-1"></div>
      <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-[120px] pointer-events-none z-1"></div>

      {/* Background Image / Banner Parallax */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop" 
          alt="Office Background" 
          className="w-full h-full object-cover opacity-10 dark:opacity-20 scale-105 animate-[pulse_25s_ease-in-out_infinite]"
        />
        {/* Sleek bottom mask transitioning to page content */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-[#060d1d]/80 dark:to-[#060d1d] transition-colors duration-300"></div>
      </div>

      {/* Hero Content with top padding to push past the sticky menu */}
      <div className={`relative z-10 container mx-auto px-6 text-center pt-[100px] md:pt-[120px] transition-all duration-1000 transform ${
        isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      }`}>
        {/* Category-style Badge Capsule */}
        <div className="inline-flex items-center gap-2.5 bg-white dark:bg-white/5 backdrop-blur-md px-5 py-2 rounded-full border border-slate-200/50 dark:border-white/10 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] mb-6 transform hover:scale-102 transition-transform duration-300 select-none">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
          <span className="text-xxs font-bold text-slate-800 dark:text-slate-200 tracking-[0.2em] uppercase font-sans">
            {t('about.hero_badge')}
          </span>
        </div>
        
        {/* Main Header - py-2 added to spans to prevent browser diacritic clipping */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 text-slate-900 dark:text-white font-sans leading-tight">
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-900 dark:from-white dark:to-slate-300 font-black py-2" style={{
            fontFamily: "'Montserrat', 'Be Vietnam Pro', sans-serif"
          }}>
            {t('nav.about')}
          </span>
          <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 dark:from-sky-400 dark:via-sky-300 dark:to-blue-500 drop-shadow-[0_2px_10px_rgba(14,165,233,0.12)] font-black py-2" style={{
            fontFamily: "'Montserrat', 'Be Vietnam Pro', sans-serif"
          }}>
            {t('about.hero_title')}
          </span>
        </h1>
        
        {/* Dynamic separator */}
        <div className="w-20 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto mb-6 rounded-full shadow-[0_2px_10px_rgba(14,165,233,0.25)]"></div>
        
        {/* Subtitle */}
        <p className="text-sm md:text-base font-light leading-relaxed max-w-3xl mx-auto text-slate-600 dark:text-slate-300 tracking-wide">
          {t('about.hero_subtitle')}
        </p>
      </div>
    </div>
  );
};

export default AboutHero;
