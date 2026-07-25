import React from 'react';
import { Zap, ShieldCheck, TrendingUp, Calculator } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';
import { useInView } from '../../hooks/useInView';
import SolarCalculator from '../SolarCalculator';

const CalculatorWrapper: React.FC = () => {
  const { t, language } = useLanguage();
  const { ref, isInView } = useInView(0.1);

  const features = [
    {
      icon: Zap,
      title: getLangText(language, {
        vi: 'Chính xác đến 95%',
        en: '95% Accuracy',
        ko: '95% 정확도',
        ja: '95%の精度',
        zh: '95% 准确度',
        de: '95% Genauigkeit'
      }),
      desc: getLangText(language, {
        vi: 'Dựa trên dữ liệu bức xạ thực tế tại Việt Nam.',
        en: 'Based on real radiation data in Vietnam.',
        ko: '베트남의 실제 방사선 데이터를 기반으로 합니다.',
        ja: 'ベトナムの実際の日照量データに基づいています。',
        zh: '基于越南真实的日照辐射数据。',
        de: 'Basiert auf realen Strahlungsdaten in Vietnam.'
      }),
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    {
      icon: ShieldCheck,
      title: getLangText(language, {
        vi: 'Cập nhật giá thị trường',
        en: 'Market Price Update',
        ko: '시장 가격 업데이트',
        ja: '市場価格の更新',
        zh: '市场价格更新',
        de: 'Marktpreisaktualisierung'
      }),
      desc: getLangText(language, {
        vi: 'Đơn giá thiết bị được cập nhật hàng tuần.',
        en: 'Equipment unit prices updated weekly.',
        ko: '장비 단가는 매주 업데이트됩니다.',
        ja: '機器の単価は毎週更新されます。',
        zh: '设备单价每周更新。',
        de: 'Gerätepreise werden wöchentlich aktualisiert.'
      }),
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
    },
    {
      icon: TrendingUp,
      title: getLangText(language, {
        vi: 'Tự động tính ROI',
        en: 'Automated ROI Calculation',
        ko: '자동 ROI 계산',
        ja: 'ROI自動計算',
        zh: '自动计算 ROI',
        de: 'Automatische ROI-Berechnung'
      }),
      desc: getLangText(language, {
        vi: 'Dự toán thời gian hoàn vốn và mức tiết kiệm điện theo thời gian thực.',
        en: 'Real-time estimated payback period and electricity savings.',
        ko: '실시간으로 회수 기간 및 전기 요금 절감액을 예측합니다.',
        ja: 'リアルタイムの回収期間と節電額を予測します。',
        zh: '实时预测投资回收期与节电金额。',
        de: 'Echtzeit-Schätzung der Amortisationszeit und Stromeinsparungen.'
      }),
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
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
              {getLangText(language, {
                vi: 'Công cụ miễn phí',
                en: 'Free Tool',
                ko: '무료 도구',
                ja: '無料ツール',
                zh: '免费计算工具',
                de: 'Kostenloses Tool'
              })}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            {getLangText(language, {
              vi: 'Dự toán chi phí & Lợi nhuận đầu tư',
              en: 'Cost Estimation & Investment ROI',
              ko: '비용 견적 및 ROI',
              ja: '費用見積もりとROI',
              zh: '成本估算与投资回报',
              de: 'Kostenschätzung & ROI'
            })}
          </h2>
          <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-primary/30 rounded-full mx-auto mb-5" />
          <p className="text-gray-500 dark:text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            {getLangText(language, {
              vi: 'Bạn muốn lắp đặt điện mặt trời nhưng chưa biết chi phí bao nhiêu? Sử dụng công cụ tính toán nhanh của chúng tôi để có cái nhìn tổng quan nhất về hệ thống phù hợp với hóa đơn tiền điện của bạn.',
              en: 'Want to install solar power but unsure of the cost? Use our quick calculator for a tailored overview based on your electricity bill.',
              ko: '태양광을 설치하고 싶지만 비용을 모르십니까? 빠른 계산기를 사용하여 전기 요금에 적합한 시스템의 개요를 확인하세요.',
              ja: '太陽光発電の導入費用がわかりませんか？当社の簡単計算ツールで電気代に応じた最適なシステムをご案内します。',
              zh: '想要安装太阳能但不清楚费用？使用我们的快速计算工具，根据您的电费获得最匹配的系统方案。',
              de: 'Möchten Sie Solarstrom installieren, kennen aber die Kosten nicht? Nutzen Sie unseren Schnellrechner.'
            })}
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
