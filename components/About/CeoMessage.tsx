import React from 'react';
import { Calendar, Award, Quote, CheckCircle2, Zap, ShieldCheck, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';
import { useInView } from '../../hooks/useInView';
import { useMouseParallax } from '../../hooks/useMouseParallax';


const CeoMessage: React.FC = () => {
  const { t, language } = useLanguage();
  const parallax = useMouseParallax();
  const { ref, isInView } = useInView(0.1);


  return (
    <div 
      ref={ref}
      className="py-20 lg:py-28 bg-slate-50 dark:bg-[#060d1d] relative overflow-hidden transition-colors duration-300"
    >
      {/* Blueprint grid lines */}
      <div className="absolute inset-0 opacity-40 pointer-events-none z-1" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px'
      }}></div>
      
      {/* CSS Animations for lines and signature reveal */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dark .about-lines-ceo {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }

        .signature-animated {
          animation: writeSignature 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: left center;
        }

        @keyframes writeSignature {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0.1;
          }
          10% {
            opacity: 1;
          }
          100% {
            clip-path: inset(0 0 0 0);
            opacity: 1;
          }
        }
      `}} />
      <div className="absolute inset-0 about-lines-ceo z-1 opacity-40 pointer-events-none"></div>

      {/* Glowing radial auras */}
      <div className="absolute -top-10 right-1/4 w-[700px] h-[700px] rounded-full bg-sky-500/5 dark:bg-sky-500/3 blur-[100px] pointer-events-none z-1"></div>
      <div className="absolute bottom-10 left-10 w-[700px] h-[700px] rounded-full bg-blue-600/5 dark:bg-blue-600/3 blur-[100px] pointer-events-none z-1"></div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* SECTION 1: CEO LETTER & IMAGE (Perfectly Balanced 2-Column Height) */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch mb-24">
          
          {/* LEFT: CEO Image & Premium Glassmorphic Stats Card */}
          <div 
            className={`w-full lg:w-5/12 flex flex-col justify-between transition-all duration-1000 transform ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            {/* CEO Image Card */}
            <div 
              className="relative rounded-3xl overflow-hidden shadow-2xl border-[10px] border-white dark:border-slate-800/80 transition-all duration-700 bg-slate-100 dark:bg-slate-900 group mb-6"
              style={{ transform: `translateY(${parallax.y * 0.15}px) translateX(${parallax.x * 0.15}px)` }}
            >
              <img 
                src="/images/why_choose_us_visual.webp"
                alt={t('about.ceo_title')} 
                className="w-full h-[320px] lg:h-[350px] object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#060d1d] via-[#060d1d]/70 to-transparent p-6 pt-16 text-white">
                <h3 className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" }}>
                  {t('about.ceo_title')}
                </h3>
                <p className="text-sky-400 font-semibold uppercase text-xs tracking-widest mt-1">
                  {t('about.ceo_role')}
                </p>
              </div>
            </div>

            {/* Glassmorphic Container matching Image 2 style */}
            <div className="p-6 md:p-7 border border-white/80 dark:border-white/15 bg-gradient-to-b from-white/90 via-white/80 to-slate-50/70 dark:from-white/10 dark:via-white/5 dark:to-[#0f172a]/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-3xl flex-1 flex flex-col justify-between relative overflow-hidden group">
              
              {/* Soft ambient sheen overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-70 pointer-events-none"></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-3.5 mb-4 border-slate-200/60 dark:border-white/10">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2.5" style={{ fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" }}>
                    <div className="p-1.5 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                      <Award size={18} />
                    </div>
                    <span>{getLangText(language, { vi: "Năng lực Nổi bật CTC", en: "CTC Highlights", ko: "CTC 주요 역량", ja: "CTCハイライト", zh: "CTC核心优势", de: "CTC-Highlights" })}</span>
                  </h4>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                    PROFILE
                  </span>
                </div>

                {/* 2x2 Glassmorphic Stats Grid (Matching Image 2 Style) */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* Card 1 */}
                  <div className="relative group/card overflow-hidden rounded-2xl p-3.5 text-center transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-b from-white/90 via-white/70 to-sky-50/40 dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-xl border border-white/80 dark:border-white/15 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                    <span className="block text-xl font-black text-sky-500 dark:text-sky-400 tracking-tight">
                      {getLangText(language, { vi: "32+ NĂM", en: "32+ YEARS", ko: "32+년", ja: "32年以上", zh: "32+年", de: "32+ JAHRE" })}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-300 font-bold mt-0.5 block">
                      {getLangText(language, { vi: "Kinh nghiệm phát triển", en: "Development Experience", ko: "개발 및 운영 경력", ja: "開発経験", zh: "发展经验", de: "Entwicklungserfahrung" })}
                    </span>
                  </div>

                  {/* Card 2 */}
                  <div className="relative group/card overflow-hidden rounded-2xl p-3.5 text-center transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-b from-white/90 via-white/70 to-blue-50/40 dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-xl border border-white/80 dark:border-white/15 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                    <span className="block text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                      500+
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-300 font-bold mt-0.5 block">
                      {getLangText(language, { vi: "Dự án hoàn thành", en: "Projects Completed", ko: "완료된 프로젝트", ja: "完了プロジェクト", zh: "完成项目", de: "Abgeschlossene Projekte" })}
                    </span>
                  </div>

                  {/* Card 3 */}
                  <div className="relative group/card overflow-hidden rounded-2xl p-3.5 text-center transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-b from-white/90 via-white/70 to-emerald-50/40 dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-xl border border-white/80 dark:border-white/15 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                    <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                      {getLangText(language, { vi: "288+ TỶ", en: "$12M+", ko: "1200만 달러+", ja: "1200万ドル+", zh: "1200万美元+", de: "12 Mio. $" })}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-300 font-bold mt-0.5 block">
                      {getLangText(language, { vi: "Doanh thu ấn tượng", en: "Impressive Revenue", ko: "인상적인 매출", ja: "印象的な収益", zh: "令人印象深刻的营收", de: "Beeindruckender Umsatz" })}
                    </span>
                  </div>

                  {/* Card 4 */}
                  <div className="relative group/card overflow-hidden rounded-2xl p-3.5 text-center transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-b from-white/90 via-white/70 to-indigo-50/40 dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-xl border border-white/80 dark:border-white/15 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                    <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                      100%
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-300 font-bold mt-0.5 block">
                      {getLangText(language, { vi: "Đạt chuẩn ISO & BXD", en: "ISO & Ministry Standard", ko: "ISO 및 국토부 표준 달성", ja: "ISOおよびBXD規格準拠", zh: "符合ISO及建设部标准", de: "ISO- & BXD-Standard" })}
                    </span>
                  </div>
                </div>

                {/* Detailed Advantage List */}
                <div className="space-y-5">
                  <div className="flex items-start gap-2.5 group/item">
                    <div className="p-1.5 rounded-xl bg-sky-500/10 text-sky-500 mt-0.5 border border-sky-500/20 group-hover/item:scale-110 transition-transform">
                      <Zap size={14} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-200 text-xs">{getLangText(language, { vi: "Tổng thầu EPC Năng lượng xanh", en: "Green Energy EPC Contractor", ko: "친환경 에너지 EPC 총괄", ja: "グリーンエネルギーEPC", zh: "绿色能源EPC总承包", de: "Grüne Energie EPC Generalunternehmer" })}</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-snug">
                        {getLangText(language, { vi: "Chuyên nghiệp trong thiết kế, vật tư chính hãng & thi công Điện mặt trời C&I, Điện gió.", en: "Professional in design, genuine equipment supply & construction of C&I Solar, Wind Power.", ko: "C&I 태양광 및 풍력 발전의 설계, 정품 자재 공급 및 시공 전문.", ja: "C&I太陽光・風力発電の設計・資材調達・施工をプロフェッショナルに実施。", zh: "专业从事C&I工商业光伏、风电的设计、正品设备供应及施工。", de: "Professionell in Planung, Ausrüstung und Bau von C&I-Solar und Windenergie." })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 group/item">
                    <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500 mt-0.5 border border-blue-500/20 group-hover/item:scale-110 transition-transform">
                      <ShieldCheck size={14} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-200 text-xs">{getLangText(language, { vi: "Hạ tầng Viễn thông & Công nghiệp", en: "Telecom & Industrial Infrastructure", ko: "통신 및 산업 인프라", ja: "通信・産業インフラ", zh: "通信与工业基础设施", de: "Telekommunikations- & Industrieinfrastruktur" })}</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-snug">
                        {getLangText(language, { vi: "Tuyến cáp quang Bộ Công an, Metro Mobifone, trạm BTS & Data Center tiêu chuẩn.", en: "Fiber optic lines for Ministry of Public Security, Metro Mobifone, BTS stations & Data Center standards.", ko: "공안부 광케이블 노선, 전국의 메트로 모비폰, BTS 기지국 및 데이터 센터 표준.", ja: "公安部光ファイバー、全国メトロMobifone、BTS局およびデータセンター規格。", zh: "公安部光缆专线、全国Mobifone Metro、BTS基站及标准数据中心。", de: "Glasfaserleitungen für das Ministerium für öffentliche Sicherheit, Metro Mobifone, BTS-Stationen & Rechenzentren." })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 group/item">
                    <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 mt-0.5 border border-emerald-500/20 group-hover/item:scale-110 transition-transform">
                      <Users size={14} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-200 text-xs">{getLangText(language, { vi: "Đội ngũ Kỹ sư Chuyên môn cao", en: "Highly Qualified Engineering Team", ko: "고도로 전문화된 엔지니어 팀", ja: "高度な専門エンジニアチーム", zh: "高素质专业工程师团队", de: "Hochqualifiziertes Ingenieurteam" })}</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-snug">
                        {getLangText(language, { vi: "100% nhân sự có chứng chỉ hành nghề, giàu kinh nghiệm thực chiến quy mô lớn.", en: "100% staff certified with extensive experience in large-scale projects.", ko: "100% 자격증 보유 인력, 대규모 실전 프로젝트 경험 풍부.", ja: "100%のスタッフが資格を保有し、大規模な実戦経験が豊富。", zh: "100%员工持有执业证书，具备丰富的大型项目实战经验。", de: "100% zertifiziertes Personal mit umfassender Praxiserfahrung." })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee Bar */}
              <div className="relative z-10 mt-5 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {getLangText(language, { vi: "Cam kết Chất lượng & Tiến độ", en: "Quality & Schedule Commitment", ko: "품질 및 일정 준수 약속", ja: "品質および納期保証", zh: "质量与进度承诺", de: "Qualitäts- & Termingarantie" })}
                </span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">CTC EPC</span>
              </div>
            </div>
          </div>

          {/* RIGHT: CEO Letter & Details */}
          <div 
            className={`w-full lg:w-7/12 relative transition-all duration-1000 delay-200 transform ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Absolute decorative background quote block icon */}
            <Quote size={130} className="absolute -top-12 -left-12 text-slate-200/40 dark:text-white/5 opacity-60 pointer-events-none select-none z-0" />
            
            {/* Glass-card container for the letter */}
            <div className="about-glass-card p-8 md:p-12 shadow-lg border border-slate-200/60 dark:border-white/10 z-10 relative bg-white/60 dark:bg-[#0f172a]/40 h-full flex flex-col justify-between">
              <div>
                {/* Outline style styled title */}
                <div className="mb-8">
                  <span className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-extrabold block mb-2">
                    CTC PROFILE
                  </span>
                  <h2 
                    className="text-3xl md:text-4xl font-extrabold tracking-tight"
                    style={{ fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" }}
                  >
                    <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 dark:from-sky-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent">
                      {t('about.letter_title')}
                    </span>
                  </h2>
                </div>
                
                <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed space-y-6">
                  
                  {/* Greeting Blockquote */}
                  <div className="relative border-l-4 border-sky-500 bg-sky-500/[0.03] dark:bg-sky-500/[0.06] p-6 rounded-r-2xl my-6">
                    <p className="font-extrabold text-slate-900 dark:text-white italic text-lg lg:text-xl leading-relaxed">
                      {t('about.letter_greeting')}
                    </p>
                  </div>

                  <p className="text-justify font-light text-base leading-relaxed" style={{ textIndent: '28px' }}>
                    {t('about.letter_p1')}
                  </p>
                  
                  <p className="text-justify font-light text-base leading-relaxed" style={{ textIndent: '28px' }}>
                    {t('about.letter_p2')}
                  </p>
                  
                  {/* Core Values Card with thick left border */}
                  <div className="about-glass-card border-l-4 border-l-sky-500 p-6 rounded-r-2xl flex items-start gap-4 my-6 hover:-translate-y-0.5 transition-all duration-300 shadow-md bg-white/40 dark:bg-[#0f172a]/20 border border-slate-200/50 dark:border-white/5">
                    <Award className="text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" size={26} />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-lg mb-1" style={{ fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" }}>
                        {t('about.core_val_title')}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                        {t('about.core_val_desc')}
                      </p>
                    </div>
                  </div>

                  <p className="text-justify font-light text-base leading-relaxed" style={{ textIndent: '28px' }}>
                    Trong tương lai gần, Việt Nam sẽ chính thức tham gia các hiệp định quốc tế về giảm phát thải năng lượng, thể hiện quyết tâm và cam kết mạnh mẽ của Chính phủ Việt Nam trong việc phát triển năng lượng tái tạo.
                  </p>

                  <p className="text-justify font-light text-base leading-relaxed" style={{ textIndent: '28px' }}>
                    Chúng tôi rất hân hạnh được đồng hành cùng quý khách hàng trên hành trình phát triển bền vững.
                  </p>
                </div>
              </div>

              {/* Fixed Leadership Signature block */}
              <div className="mt-10 flex justify-end">
                <div className="about-glass-card p-5 text-center w-72 shadow-md bg-white/80 dark:bg-slate-950/80 border border-slate-200/50 dark:border-white/5 rounded-2xl hover:border-sky-500/20 transition-all duration-300">
                  <p className="text-slate-400 dark:text-slate-500 text-xxs uppercase tracking-widest font-bold mb-1">
                    {t('about.ceo_role')}
                  </p>
                  <div className="h-14 flex items-center justify-center my-1 select-none">
                    <span 
                      className={`text-2xl text-sky-600 dark:text-sky-400 rotate-[-1deg] tracking-wider whitespace-nowrap font-bold ${
                        isInView ? 'signature-animated' : 'opacity-0'
                      }`}
                      style={{ fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" }}
                    >
                      CTC LEADERSHIP
                    </span>
                  </div>
                  <h4 
                    className="font-extrabold text-slate-800 dark:text-slate-200 border-t border-slate-200/60 dark:border-white/10 pt-2 text-sm"
                    style={{ fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" }}
                  >
                    {t('about.ceo_title')}
                  </h4>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CeoMessage;
