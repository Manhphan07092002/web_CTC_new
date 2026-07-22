import React from 'react';
import { Zap, ShieldCheck, TrendingUp, Calculator } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import SolarCalculator from '../SolarCalculator';

const CalculatorWrapper: React.FC = () => {
  const { t } = useLanguage();
  const { ref, isInView } = useInView(0.1);

  const features = [
    {
      icon: Zap,
      title: t('calculator.feature_1_title'),
      desc: t('calculator.feature_1_desc'),
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    {
      icon: ShieldCheck,
      title: t('calculator.feature_2_title'),
      desc: t('calculator.feature_2_desc'),
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Cập nhật giá thị trường',
      desc: 'Đơn giá thiết bị được cập nhật hàng tuần.',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .calc-glass-card {
            background: rgba(255, 255, 255, 0.28);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.72);
            box-shadow: 0 8px 24px -8px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,0.6);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark .calc-glass-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.07);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.04);
        }
        .calc-glass-card:hover {
            transform: translateY(-4px);
            background: rgba(255, 255, 255, 0.45);
            border-color: rgba(14, 165, 233, 0.35);
            box-shadow: 0 16px 36px -10px rgba(14, 165, 233, 0.14), inset 0 1px 2px rgba(255,255,255,0.65);
        }
        .dark .calc-glass-card:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(56, 189, 248, 0.25);
            box-shadow: 0 16px 36px -10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.08);
        }
      `}} />

    <section ref={ref} className="py-28 bg-gray-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      {/* Glow accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-primary/5 blur-3xl rounded-full pointer-events-none" />

      <div className="container max-w-[1280px] mx-auto px-6 relative z-10">

        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full mb-4">
            <Calculator size={13} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('calculator.intro_badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            {t('calculator.intro_title')}
          </h2>
          <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-primary/30 rounded-full mx-auto mb-5" />
          <p className="text-gray-500 dark:text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            {t('calculator.intro_desc')}
          </p>
        </div>

        {/* Main layout: features left, calculator right */}
        <div className={`flex flex-col xl:flex-row gap-10 items-start transition-all duration-700 delay-150 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

          {/* Feature list — left column, glassmorphism style */}
          <div className="xl:w-[300px] flex-shrink-0 flex flex-col gap-4">
            {features.map(({ icon: Icon, title, desc, iconColor, iconBg }, index) => (
              <div
                key={`${title}-${index}`}
                className="calc-glass-card group flex items-start gap-4 rounded-2xl p-5 cursor-default"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className={`font-black text-sm mb-1 leading-tight text-gray-800 dark:text-white group-hover:${iconColor} transition-colors`}>{title}</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Calculator — right column */}
          <div className="flex-1 min-w-0">
            <SolarCalculator />
          </div>

        </div>
      </div>
    </section>
    </>
  );
};

export default CalculatorWrapper;
