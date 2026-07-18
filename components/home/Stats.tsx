import React from 'react';
import { Trophy, Building2, Zap, Handshake } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';

const Stats: React.FC = () => {
  const { t, language } = useLanguage();
  const { ref: statsRef, isInView } = useInView(0.1);

  const statsList = [
    { icon: Trophy, value: '32+', label: t('home.stat_exp') },
    { icon: Building2, value: '200+', label: t('home.stat_projects') },
    { icon: Zap, value: language === 'vi' ? '288+ Tỷ' : '288+B', label: t('home.stat_capacity') },
    { icon: Handshake, value: '53+', label: t('home.stat_satisfaction') }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Seamless blueprint grid layout matching Hero.tsx top lines */
        .blueprint-grid-stats {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 80px 80px;
            background-position: center top;
            z-index: 1;
            pointer-events: none;
            opacity: 0.8;
        }

        /* === UNIFIED CORPORATE DARK STATS CARD === */
        .glass-stat-card-dark {
            border-radius: 16px; /* Matched 16px squircle radius from Hero.tsx */
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.5);
            z-index: 10;
        }

        .glass-stat-card-dark:hover {
            transform: translateY(-8px) scale(1.03);
            background: rgba(15, 23, 42, 0.65);
            border-color: rgba(56, 189, 248, 0.35);
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7),
                        0 0 20px rgba(56, 189, 248, 0.15);
        }

        /* Outlined Cyan Icon Frame matching Hero dashboard exactly */
        .outlined-icon-frame {
            width: 60px;
            height: 60px;
            background: rgba(14, 165, 233, 0.1);
            border: 1px solid rgba(14, 165, 233, 0.25);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #38bdf8;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: inset 0 1px 1px rgba(56, 189, 248, 0.05);
        }

        .glass-stat-card-dark:hover .outlined-icon-frame {
            transform: scale(1.1) rotate(6deg);
            background: rgba(14, 165, 233, 0.2);
            border-color: rgba(56, 189, 248, 0.6);
            color: #38bdf8;
            box-shadow: 0 0 15px rgba(56, 189, 248, 0.25), 
                        inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .stat-value-text-white {
            color: #ffffff;
            transition: all 0.3s ease;
        }

        .glass-stat-card-dark:hover .stat-value-text-white {
            transform: scale(1.04);
            text-shadow: 0 0 12px rgba(255, 255, 255, 0.15);
        }
      `}} />

      <section 
        ref={statsRef} 
        className="py-16 bg-[#060d1d] relative z-20 -mt-12 border-b border-white/5"
      >
        {/* Continuous Grid lines background to bridge with Hero seamlessly */}
        <div className="blueprint-grid-stats"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {statsList.map((stat, idx) => (
              <div key={idx} className="glass-stat-card-dark group text-center p-6 sm:p-8">
                
                {/* Outlined Icon Container (Identical to Hero Dashboard icon style) */}
                <div className="outlined-icon-frame mx-auto mb-6">
                  <stat.icon size={24} />
                </div>

                {/* Statistic Value (Always White) */}
                <div className="stat-value-text-white text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
                  {stat.value}
                </div>

                {/* Statistic Label (Always Light Slate-400) */}
                <div className="text-xxs sm:text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-sky-400 transition-colors">
                  {stat.label}
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Stats;
