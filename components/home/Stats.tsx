import React from 'react';
import { Wallet, Users, Zap, Handshake } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';

const Stats: React.FC = () => {
  const { t, language } = useLanguage();
  const { ref: statsRef, isInView } = useInView(0.1);

  const statsList = [
    { icon: Wallet, value: language === 'vi' ? '181+ Tỷ' : '181+B', label: t('home.stat_assets') },
    { icon: Users, value: '1000+', label: t('home.stat_partners') },
    { icon: Zap, value: '50+ MW', label: t('home.stat_capacity') },
    { icon: Handshake, value: '50+', label: t('home.stat_satisfaction') }
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
            border-radius: 16px;
            transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            position: relative;
            overflow: hidden;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
            z-index: 10;
        }

        /* Ánh sáng lướt qua khi hover */
        .glass-stat-card-dark::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, transparent, rgba(56, 189, 248, 0.15), transparent);
            transform: translateX(-100%) skewX(-15deg);
            transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
            z-index: 0;
        }

        .glass-stat-card-dark:hover::before {
            transform: translateX(100%) skewX(-15deg);
        }

        .glass-stat-card-dark:hover {
            transform: translateY(-12px);
            background: rgba(15, 23, 42, 0.75);
            border-color: rgba(56, 189, 248, 0.4);
            box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.8),
                        0 0 30px rgba(56, 189, 248, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
            transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            box-shadow: inset 0 1px 1px rgba(56, 189, 248, 0.05);
            position: relative;
            z-index: 1;
        }

        .glass-stat-card-dark:hover .outlined-icon-frame {
            transform: translateY(-5px) scale(1.15) rotate(10deg);
            background: rgba(14, 165, 233, 0.25);
            border-color: rgba(56, 189, 248, 0.7);
            color: #ffffff;
            box-shadow: 0 10px 20px rgba(56, 189, 248, 0.3), 
                        inset 0 0 12px rgba(56, 189, 248, 0.4);
        }

        .stat-value-text-white {
            color: #ffffff;
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            position: relative;
            z-index: 1;
        }

        .glass-stat-card-dark:hover .stat-value-text-white {
            transform: scale(1.08) translateY(-2px);
            color: #38bdf8;
            text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
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
