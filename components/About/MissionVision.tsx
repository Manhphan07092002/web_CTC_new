import React from 'react';
import { Target, Eye, Award, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';

const MissionVision: React.FC = () => {
  const { t } = useLanguage();
  const { ref, isInView } = useInView(0.1);

  return (
    <div 
      ref={ref}
      className="bg-slate-100 dark:bg-[#0b1329]/30 py-24 relative overflow-hidden transition-colors duration-300"
    >
      {/* Blueprint grid lines */}
      <div className="absolute inset-0 opacity-40 pointer-events-none z-1" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px'
      }}></div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .dark .about-lines-mv {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
      `}} />
      <div className="absolute inset-0 about-lines-mv z-1 opacity-40 pointer-events-none"></div>

      {/* Decorative glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[100px] pointer-events-none z-1"></div>
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none z-1"></div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Title Block */}
        <div className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 transform ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 
            className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {t('about.vision_title')}
          </h2>
          <div className="w-16 h-1 bg-sky-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-slate-500 dark:text-slate-400 font-light text-lg">
            {t('about.vision_subtitle')}
          </p>
        </div>

        {/* 3 Grid Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
          
          {/* Card 1: Mission (Sứ mệnh) */}
          <div className={`about-glass-card p-8 md:p-10 flex flex-col items-center text-center transition-all duration-1000 transform ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`} style={{ transitionDelay: '150ms' }}>
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-8 text-sky-600 dark:text-sky-400 group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700 border border-sky-500/20">
              <Target size={28} />
            </div>
            <h3 
              className="text-xl font-bold mb-4 text-slate-800 dark:text-white uppercase tracking-wide"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('about.mission')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-light text-sm leading-relaxed text-justify">
              {t('about.mission_desc')}
            </p>
          </div>

          {/* Card 2: Vision (Tầm nhìn) - Emphasized dark gradient card */}
          <div className={`bg-gradient-to-br from-[#060d1d] to-[#0c1e3d] text-white p-8 md:p-10 rounded-[20px] shadow-2xl hover:shadow-sky-500/10 border border-white/10 transition-all duration-500 transform hover:-translate-y-3 md:-mt-6 relative overflow-hidden flex flex-col items-center text-center transition-all duration-1000 ${
            isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
          }`} style={{ transitionDelay: '300ms' }}>
            {/* Glowing backdrop overlay */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 bg-sky-500 rounded-full opacity-10 blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
            
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 text-sky-400 group-hover:bg-white group-hover:text-sky-600 group-hover:rotate-[360deg] transition-all duration-700 shadow-md border border-white/10">
              <Eye size={28} />
            </div>
            <h3 
              className="text-xl font-bold mb-4 tracking-wide uppercase"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('about.vision')}
            </h3>
            <p className="text-slate-300 font-light text-sm leading-relaxed text-justify">
              {t('about.vision_desc')}
            </p>
          </div>

          {/* Card 3: Core Values (Giá trị cốt lõi) */}
          <div className={`about-glass-card p-8 md:p-10 flex flex-col transition-all duration-1000 transform ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`} style={{ transitionDelay: '450ms' }}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700 border border-emerald-500/20">
              <Award size={28} />
            </div>
            <h3 
              className="text-xl font-bold mb-6 text-center text-slate-800 dark:text-white uppercase tracking-wide"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {t('about.core_values')}
            </h3>
            
            <ul className="space-y-4 flex-grow flex flex-col justify-center">
              <li className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 shadow-sm">
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{t('about.core_trust')}</span>
              </li>
              <li className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 shadow-sm">
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{t('about.core_quality')}</span>
              </li>
              <li className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 shadow-sm">
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{t('about.core_portfolio')}</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MissionVision;
