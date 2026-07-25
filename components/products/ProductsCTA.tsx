import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Phone, Award, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

const ProductsCTA: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section className="py-20 sm:py-24 relative overflow-hidden bg-slate-50 dark:bg-[#060d1d] transition-colors">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Match the Solutions CTA/Contact style but tailored for Products */
        .prod-cta-section-blueprint {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
          background-size: 80px 80px; pointer-events: none;
        }
        .dark .prod-cta-section-blueprint {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
        }

        /* Inner CTA card */
        .prod-cta-card {
          position: relative;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 30px 80px -20px rgba(234,88,12,0.15);
        }
        .prod-cta-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent);
        }

        /* Badge button */
        .prod-cta-primary {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, rgba(234,88,12,0.95) 0%, rgba(194,65,12,0.95) 100%);
          border: 1px solid rgba(249,115,22,0.45);
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 12px 30px -10px rgba(234,88,12,0.4);
        }
        .prod-cta-primary::before {
          content: '';
          position: absolute; top: 0; left: -130%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-20deg);
          transition: transform 0.75s ease;
        }
        .prod-cta-primary:hover::before { transform: translateX(260%) skewX(-20deg); }
        .prod-cta-primary:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 20px 40px -10px rgba(234,88,12,0.55); }

        .prod-cta-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(20px);
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .prod-cta-secondary:hover { background: rgba(255,255,255,0.09); transform: translateY(-2px); border-color: rgba(249,115,22,0.3); }

        /* Trust badge pill */
        .prod-trust-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          padding: 7px 14px;
          font-size: 0.72rem; font-weight: 700;
          color: #cbd5e1;
        }
      `}} />

      <div className="prod-cta-section-blueprint" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="prod-cta-card px-8 py-14 md:px-14 md:py-16">
          {/* Glow blobs */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />

          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(rgba(249,115,22,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }} />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-12 justify-between">

            {/* Left: content */}
            <div className="max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-xs font-black text-orange-400 uppercase tracking-widest">
                <Zap size={12} />
                {getLangText(language, {
                  vi: 'CTC – Phân phối & Hỗ trợ kỹ thuật',
                  en: 'CTC – Distribution & Technical Support',
                  ko: 'CTC – 유통 및 기술 지원',
                  ja: 'CTC – 流通・技術サポート',
                  zh: 'CTC – 分销与技术支持',
                  de: 'CTC – Vertrieb & Technische Unterstützung'
                })}
              </div>

              {/* Headline */}
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight uppercase tracking-wide">
                {getLangText(language, {
                  vi: 'Bạn cần tìm thiết bị Năng lượng phù hợp?',
                  en: 'Looking for Suitable Energy Equipment?',
                  ko: '적합한 에너지 장비를 찾고 계십니까?',
                  ja: '適切なエネルギー機器をお探しですか？',
                  zh: '您正在寻找合适的能源设备吗？',
                  de: 'Suchen Sie nach passenden Energiegeräten?'
                })}
              </h3>
              <div className="w-14 h-1 rounded-full bg-orange-500 mb-5 opacity-70" />

              <p className="text-slate-300 text-base font-light leading-relaxed mb-7">
                {getLangText(language, {
                  vi: 'CTC cung cấp báo giá sỉ tốt nhất cho các dự án điện mặt trời, cùng sự hỗ trợ kỹ thuật chuyên sâu từ đội ngũ 53+ kỹ sư chủ chốt. Chúng tôi đồng hành cùng các đại lý và nhà thầu trên toàn quốc.',
                  en: 'CTC provides the best wholesale quotation for solar energy projects, along with deep technical support from our team of 53+ key engineers.',
                  ko: 'CTC는 53명 이상의 핵심 엔지니어 팀의 심도 있는 기술 지원과 함께 태양광 프로젝트에 대한 최적의 도매 견적을 제공합니다.',
                  ja: 'CTCは、53名以上の主要エンジニアチームによる高度な技術サポートとともに、太陽光発電プロジェクトに最適な卸売見積もりを提供します。',
                  zh: 'CTC为您提供太阳能项目的最佳批发报价，并由53多名核心工程师团队提供深度技术支持。',
                  de: 'CTC bietet das beste Großhandelsangebot für Solarprojekte sowie fundierte technische Unterstützung durch unser Team aus über 53 Hauptingenieuren.'
                })}
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <Award size={13} />, text: getLangText(language, { vi: 'Phân phối Tier 1 chính hãng', en: 'Tier 1 Genuine Distribution', ko: 'Tier 1 정품 유통', ja: 'Tier 1 正規ディストリビューション', zh: 'Tier 1 正品分销', de: 'Tier 1 Originalvertrieb' }) },
                  { icon: <Zap size={13} />, text: getLangText(language, { vi: 'Giá sỉ tốt nhất thị trường', en: 'Best Wholesale Prices', ko: '최고의 도매가', ja: '市場最高値の卸売価格', zh: '市场最佳批发价', de: 'Beste Großhandelspreise' }) },
                  { icon: <Phone size={13} />, text: getLangText(language, { vi: 'Tư vấn O&M 24/7', en: '24/7 O&M Consultation', ko: '24/7 O&M 상담', ja: '24/7 O&Mコンサルティング', zh: '24/7 O&M 咨询', de: '24/7 O&M Beratung' }) },
                ].map((b, i) => (
                  <div key={i} className="prod-trust-pill">
                    <span className="text-orange-400">{b.icon}</span>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex flex-col gap-4 w-full max-w-xs flex-shrink-0">
              <Link
                to="/contact"
                className="prod-cta-primary inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white"
              >
                <Zap size={16} />
                {getLangText(language, {
                  vi: 'Nhận báo giá đại lý',
                  en: 'Get Wholesale Quote',
                  ko: '대리점 견적 받기',
                  ja: '卸売見積もりを取得',
                  zh: '获取代理商报价',
                  de: 'Großhandelsangebot anfordern'
                })}
                <ArrowRight size={14} />
              </Link>
              <a
                href="tel:0915059666"
                className="prod-cta-secondary inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white"
              >
                <Phone size={16} /> 0915 059 666
              </a>
              <a
                href="https://zalo.me/0915059666"
                target="_blank"
                rel="noreferrer"
                className="text-center text-slate-400 text-xs hover:text-orange-400 transition-colors"
              >
                {getLangText(language, {
                  vi: 'Zalo hỗ trợ: ',
                  en: 'Zalo support: ',
                  ko: 'Zalo 지원: ',
                  ja: 'Zaloサポート: ',
                  zh: 'Zalo 客服: ',
                  de: 'Zalo Support: '
                })}
                <strong className="text-orange-400">0915 059 666</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsCTA;
