import React from 'react';
import { Briefcase, Check, Zap, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';

const Stats: React.FC = () => {
  const { t } = useLanguage();
  const { ref: statsRef, isInView } = useInView(0.1);

  const statsList = [
    { icon: Briefcase, value: '22+', label: t('home.stat_exp'), color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { icon: Check, value: '500+', label: t('home.stat_projects'), color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
    { icon: Zap, value: '50MW', label: t('home.stat_capacity'), color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50' },
    { icon: Users, value: '98%', label: t('home.stat_satisfaction'), color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* === UNIFIED CORPORATE STATS CLASS === */
        .glass-stat-card {
            border-radius: 16px; /* Matched 16px squircle radius from Hero.tsx */
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
        }

        /* Light Mode Frosted White Glass */
        .glass-stat-card {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 15px 35px -10px rgba(0, 30, 80, 0.08), 
                        inset 0 1px 1px rgba(255, 255, 255, 0.5);
        }

        .glass-stat-card:hover {
            transform: translateY(-8px) scale(1.03);
            background: rgba(255, 255, 255, 0.85);
            border-color: rgba(14, 165, 233, 0.25);
            box-shadow: 0 25px 50px -12px rgba(0, 30, 80, 0.15),
                        0 0 15px rgba(14, 165, 233, 0.1);
        }

        /* Dark Mode Frosted Dark Glass */
        .dark .glass-stat-card {
            background: rgba(15, 23, 42, 0.45) !important;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.5) !important;
        }

        .dark .glass-stat-card:hover {
            background: rgba(15, 23, 42, 0.65) !important;
            border-color: rgba(56, 189, 248, 0.3) !important;
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7),
                        0 0 20px rgba(56, 189, 248, 0.15) !important;
        }

        /* Ticker text styling inside cards */
        .stat-value-text {
            background-clip: text;
            -webkit-background-clip: text;
            transition: all 0.3s ease;
        }

        .glass-stat-card:hover .stat-value-text {
            transform: scale(1.05);
        }
      `}} />

      <section ref={statsRef} className="py-12 relative z-20 -mt-16 container mx-auto px-4 bg-transparent">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {statsList.map((stat, idx) => (
            <div key={idx} className="glass-stat-card group text-center p-6 sm:p-8">
              
              {/* Icon Holder with Pulse Ring */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <stat.icon size={26} className="text-white relative z-10" />
              </div>

              {/* Statistic Numbers */}
              <div className="stat-value-text text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">
                {stat.value}
              </div>

              {/* Statistic Label */}
              <div className="text-xxs sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                {stat.label}
              </div>

            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Stats;
