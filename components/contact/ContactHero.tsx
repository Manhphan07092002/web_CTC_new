import React from 'react';
import companyProfile from '../../constants/company_profile.json';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

const ContactHero: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-br from-corporate via-[#0f2447] to-[#071328] text-white overflow-hidden">
      {/* Background Decorative Mesh & Light Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs md:text-sm font-semibold text-amber-300 border border-white/15 mb-6 shadow-xl">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span>
              {getLangText(language, {
                vi: companyProfile.slogan.vi,
                en: companyProfile.slogan.en,
                ko: 'CTC – 신뢰, 품질',
                ja: 'CTC – 信頼、品質',
                zh: 'CTC – 信任与品质',
                de: 'CTC – Vertrauen, Qualität'
              })}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-6 drop-shadow-md">
            {getLangText(language, { vi: 'Liên Hệ ', en: 'Contact ', ko: '문의하기 ', ja: 'お問い合わせ ', zh: '联系我们 ', de: 'Kontakt ' })}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">{companyProfile.company_name.short}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-200/90 font-normal leading-relaxed max-w-3xl mx-auto mb-10">
            {getLangText(language, {
              vi: companyProfile.company_name.vi,
              en: companyProfile.company_name.en,
              ko: '중부 우정 통신 건설 주식회사',
              ja: '中部ベトナム郵政通信建設株式會社',
              zh: '中部越南邮电建筑股份有限公司',
              de: 'Zentralvietnam Post- und Telekommunikationsbau AG'
            })} (Tax: {companyProfile.tax_code}) - {getLangText(language, { vi: 'Đại diện pháp luật:', en: 'Legal Representative:', ko: '법정 대리인:', ja: '法的代表者:', zh: '法定代表人:', de: 'Gesetzlicher Vertreter:' })} {companyProfile.representative} ({getLangText(language, { vi: 'Tổng Giám Đốc', en: 'General Director', ko: '대표이사', ja: '取締役社長', zh: '总经理', de: 'Generaldirektor' })}).
          </p>

          {/* Stats Ticker Grid - From Official Company Profile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-xl md:text-2xl font-black text-amber-400">
                {companyProfile.hero_statistics.experience_years} {getLangText(language, { vi: 'năm', en: 'years', ko: '년', ja: '年', zh: '年', de: 'Jahre' })}
              </div>
              <div className="text-[11px] md:text-xs text-gray-300 font-medium">
                {getLangText(language, { vi: 'Kinh Nghiệm (từ 1993)', en: 'Experience (since 1993)', ko: '경력 (1993년부터)', ja: '実績 (1993年〜)', zh: '行业经验 (始于1993)', de: 'Erfahrung (seit 1993)' })}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-xl md:text-2xl font-black text-amber-400">
                288+ {getLangText(language, { vi: 'Tỷ VNĐ', en: 'Billion VND', ko: '십억 동', ja: '十億ドン', zh: '十亿越南盾', de: 'Mrd. VND' })}
              </div>
              <div className="text-[11px] md:text-xs text-gray-300 font-medium">
                {getLangText(language, { vi: 'Doanh Thu Năm 2025', en: '2025 Revenue', ko: '2025년 매출', ja: '2025年売上高', zh: '2025年营业收入', de: 'Umsatz 2025' })}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-xl md:text-2xl font-black text-amber-400">
                {companyProfile.hero_statistics.key_technical_officers}
              </div>
              <div className="text-[11px] md:text-xs text-gray-300 font-medium">
                {getLangText(language, { vi: 'Kỹ Sư Chủ Chốt', en: 'Key Engineers', ko: '핵심 엔지니어', ja: '主要エンジニア', zh: '核心工程师', de: 'Leitende Ingenieure' })}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-xl md:text-2xl font-black text-amber-400">
                {companyProfile.hero_statistics.similar_projects}
              </div>
              <div className="text-[11px] md:text-xs text-gray-300 font-medium">
                {getLangText(language, { vi: 'Công Trình Đã Thực Hiện', en: 'Projects Completed', ko: '완공된 프로젝트', ja: '施工完了プロジェクト', zh: '已竣工工程', de: 'Abgeschlossene Projekte' })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactHero;
