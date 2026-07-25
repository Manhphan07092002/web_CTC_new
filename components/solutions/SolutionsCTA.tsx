import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Phone, Award, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

const SolutionsCTA: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section className="py-20 sm:py-24 relative overflow-hidden bg-slate-50 dark:bg-[#060d1d] transition-colors">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Match the Home CTA/Contact style */
        .sol-cta-section-blueprint {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
          background-size: 80px 80px; pointer-events: none;
        }
        .dark .sol-cta-section-blueprint {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
        }

        /* Inner CTA card */
        .sol-cta-card {
          position: relative;
          background: linear-gradient(135deg, #0c1a3a 0%, #0e2a4d 60%, #1a3a5c 100%);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 30px 80px -20px rgba(14,165,233,0.2);
        }
        .sol-cta-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent);
        }

        /* Badge button */
        .sol-cta-primary {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, rgba(2,132,199,0.9) 0%, rgba(3,105,161,0.9) 100%);
          border: 1px solid rgba(56,189,248,0.45);
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 12px 30px -10px rgba(14,165,233,0.4);
        }
        .sol-cta-primary::before {
          content: '';
          position: absolute; top: 0; left: -130%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-20deg);
          transition: transform 0.75s ease;
        }
        .sol-cta-primary:hover::before { transform: translateX(260%) skewX(-20deg); }
        .sol-cta-primary:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 20px 40px -10px rgba(14,165,233,0.55); }

        .sol-cta-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(20px);
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .sol-cta-secondary:hover { background: rgba(255,255,255,0.09); transform: translateY(-2px); border-color: rgba(56,189,248,0.3); }

        /* Trust badge pill */
        .sol-trust-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          padding: 7px 14px;
          font-size: 0.72rem; font-weight: 700;
          color: #cbd5e1;
        }
      `}} />

      <div className="sol-cta-section-blueprint" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="sol-cta-card px-8 py-14 md:px-14 md:py-16">
          {/* Glow blobs */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(rgba(56,189,248,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }} />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-12 justify-between">

            {/* Left: content */}
            <div className="max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-xs font-black text-sky-300 uppercase tracking-widest">
                <Zap size={12} /> {getLangText(language, { vi: 'CTC – Niềm tin, Chất lượng', en: 'CTC – Trust & Quality', ko: 'CTC – 신뢰, 품질', ja: 'CTC – 信頼・品質', zh: 'CTC – 信任与品质', de: 'CTC – Vertrauen & Qualität' })}
              </div>

              {/* Headline */}
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight uppercase tracking-wide">
                {getLangText(language, { vi: 'Sẵn sàng triển khai', en: 'Ready to Deploy', ko: '배포 준비 완료', ja: '次期プロジェクトの', zh: '准备好实施', de: 'Bereit zur Umsetzung' })}<br/>
                <span className="text-transparent bg-clip-text" style={{
                  backgroundImage: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)'
                }}>{getLangText(language, { vi: 'dự án của bạn?', en: 'your next project?', ko: '다음 프로젝트?', ja: '準備はできていますか？', zh: '您的下一个项目了吗？', de: 'Ihres nächsten Projekts?' })}</span>
              </h3>
              <div className="w-14 h-1 rounded-full bg-sky-500 mb-5 opacity-70" />

              <p className="text-slate-300 text-base font-light leading-relaxed mb-7">
                {getLangText(language, { vi: 'Với đội ngũ ', en: 'With ', ko: '경험 풍부한 ', ja: '実績豊富な ', zh: '凭借拥有 ', de: 'Mit ' })}
                <strong className="text-white">
                  {getLangText(language, { vi: '53+ kỹ sư chủ chốt', en: '53+ key engineers', ko: '53명 이상의 핵심 엔지니어', ja: '53名以上の主要エンジニア', zh: '53+名核心工程师', de: '53+ leitenden Ingenieuren' })}
                </strong>
                {getLangText(language, { vi: ' và kinh nghiệm thi công ', en: ' and proven experience in ', ko: ' 및 ', ja: 'と ', zh: ' 以及 ', de: ' und bewährter Erfahrung in ' })}
                <strong className="text-white">
                  {getLangText(language, { vi: '500+ công trình', en: '500+ projects', ko: '500개 이상의 프로젝트', ja: '500件以上の施工実績', zh: '500+个工程', de: '500+ Projekten' })}
                </strong>
                {getLangText(language, { vi: ', CTC cam kết: ', en: ', CTC guarantees: ', ko: '를 바탕으로 CTC는 약속합니다: ', ja: 'で、CTCは保証します：', zh: '，CTC承诺：', de: ' garantiert CTC: ' })}
                <em className="text-sky-300">
                  {getLangText(language, { vi: 'Chất lượng – An toàn – Tiến độ – Hiệu quả.', en: 'Quality – Safety – Schedule – Efficiency.', ko: '품질 – 안전 – 일정 – 효율.', ja: '品質 – 安全 – 納期 – 効率。', zh: '质量 – 安全 – 进度 – 高效。', de: 'Qualität – Sicherheit – Zeitplan – Effizienz.' })}
                </em>
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <Award size={13} />, text: getLangText(language, { vi: 'Chứng chỉ Bộ Xây dựng', en: 'Ministry Certified', ko: '국토부 인증', ja: '建設省認定', zh: '建设部认证', de: 'Ministeriumszertifiziert' }) },
                  { icon: <Zap size={13} />, text: getLangText(language, { vi: 'EPC Tổng thầu', en: 'General EPC', ko: 'EPC 총괄', ja: 'EPC一括', zh: 'EPC总承包', de: 'General EPC' }) },
                  { icon: <Phone size={13} />, text: getLangText(language, { vi: 'Hỗ trợ 24/7', en: '24/7 Support', ko: '24/7 지원', ja: '24/7サポート', zh: '24/7支持', de: '24/7 Support' }) },
                ].map((b, i) => (
                  <div key={i} className="sol-trust-pill">
                    <span className="text-sky-400">{b.icon}</span>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex flex-col gap-4 w-full max-w-xs flex-shrink-0">
              <Link
                to="/contact"
                className="sol-cta-primary inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white"
              >
                <Zap size={16} /> {getLangText(language, { vi: 'Nhận tư vấn miễn phí', en: 'Get Free Consultation', ko: '무료 상담 받기', ja: '無料相談を受ける', zh: '获取免费咨询', de: 'Kostenlose Beratung anfordern' })} <ArrowRight size={14} />
              </Link>
              <a
                href="tel:02363745555"
                className="sol-cta-secondary inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white"
              >
                <Phone size={16} /> 0236 374 5555
              </a>
              <a
                href="https://zalo.me/0915059666"
                target="_blank"
                rel="noreferrer"
                className="text-center text-slate-400 text-xs hover:text-sky-400 transition-colors"
              >
                {getLangText(language, { vi: 'Zalo hỗ trợ:', en: 'Zalo Support:', ko: 'Zalo 지원:', ja: 'Zaloサポート:', zh: 'Zalo在线客服:', de: 'Zalo Support:' })} <strong className="text-sky-400">0915 059 666</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsCTA;
