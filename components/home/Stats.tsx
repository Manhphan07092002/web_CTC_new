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
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
            z-index: 10;
        }

        /* Subtle glowing gradient on hover */
        .glass-stat-card-dark::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, rgba(56, 189, 248, 0.08) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.4s ease;
            z-index: 0;
            pointer-events: none;
        }

        .glass-stat-card-dark:hover::before {
            opacity: 1;
        }

        .glass-stat-card-dark:hover {
            transform: translateY(-4px);
            background: rgba(15, 23, 42, 0.6);
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7);
        }

        /* Outlined Cyan Icon Frame */
        .outlined-icon-frame {
            width: 60px;
            height: 60px;
            background: rgba(14, 165, 233, 0.08);
            border: 1px solid rgba(14, 165, 233, 0.2);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #38bdf8;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            z-index: 1;
        }

        .glass-stat-card-dark:hover .outlined-icon-frame {
            transform: scale(1.05);
            background: rgba(14, 165, 233, 0.15);
            border-color: rgba(14, 165, 233, 0.4);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
        }

        .stat-value-text-white {
            color: #ffffff;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
        }

        .glass-stat-card-dark:hover .stat-value-text-white {
            color: #f8fafc;
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
