import React from 'react';
import { Users, Award, Settings, Handshake, TrendingUp, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { getLangText } from '../../utils/translation-helper';
import companyProfile from '../../constants/company_profile.json';

interface WhyChooseUsProps {
  onOpenModal: (title: string, desc: string, details: string) => void;
}

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onOpenModal }) => {
  const { language } = useLanguage();
  const { ref: whyRef, isInView } = useInView(0.1);

  const items = [
    {
      icon: Users,
      title: getLangText(language, { vi: 'ĐỘI NGŨ NHÂN SỰ GIỎI', en: 'TALENTED HUMAN RESOURCES', ko: '우수한 우수 인력', ja: '優秀な人材・技術チーム', zh: '优秀的人才团队', de: 'HOCHQUALIFIZIERTES TEAM' }),
      desc: getLangText(language, {
        vi: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung tự hào có đội ngũ nhân sự giàu kinh nghiệm và tài năng, cung cấp các giải pháp tùy chỉnh tiên tiến và phù hợp với nhu cầu của khách hàng; đồng thời, đem lại sự thành công và hiệu quả cho mọi dự án.',
        en: 'CTC is proud to have a team of highly experienced and talented staff, providing advanced customized solutions tailored to clients\' needs, while ensuring success and efficiency for every project.',
        ko: 'CTC는 풍부한 경험과 재능을 갖춘 전문 인력을 보유하고 있으며, 고객의 요구에 맞춘 첨단 맞춤형 솔루션을 제공하여 모든 프로젝트의 성공과 효율성을 보장합니다.',
        ja: 'CTCは、経験豊富で優秀なスタッフチームを擁し、お客様のニーズに合わせた高度なカスタマイズソリューションを提供し、すべてのプロジェクトの成功と効率性を保証します。',
        zh: 'CTC拥有经验丰富的高素质人才团队，提供符合客户需求的先进定制解决方案，保障项目的成功与高效。',
        de: 'CTC verfügt über ein hochqualifiziertes Team, das maßgeschneiderte Lösungen für den Erfolg jedes Projekts bietet.'
      }),
      details: getLangText(language, {
        vi: 'CTC tự hào sở hữu đội ngũ cán bộ, kỹ sư và công nhân lành nghề, giàu kinh nghiệm thực chiến. Chúng tôi thường xuyên tổ chức đào tạo nội bộ và nâng cao tay nghề, tiếp cận các công nghệ mới nhất trên thế giới. Sự chuyên nghiệp, tinh thần trách nhiệm cao và am hiểu kỹ thuật chuyên sâu là chìa khóa giúp CTC luôn vượt qua mọi thách thức kỹ thuật khó khăn.',
        en: 'CTC is proud to own a team of skilled, experienced, and highly dedicated engineers and staff. We frequently organize internal training to upgrade skills and adapt to the latest global technologies.',
        ko: 'CTC는 실전 경험이 풍부한 숙련된 엔지니어와 직원들을 보유하고 있습니다. 최신 기술에 맞춰 정기적인 내부 교육을 실시합니다.',
        ja: 'CTCは、実戦経験豊かな熟練エンジニアチームを所有しています。最新技術に対応するため定期的な社内研修を実施しています。',
        zh: 'CTC拥有富有实战经验的技术骨干与工程师团队，定期进行内部培训，对接全球最新技术。',
        de: 'CTC verfügt über hochqualifizierte Ingenieure und führt regelmäßige Schulungen zu neuesten Technologien durch.'
      }),
      color: 'from-blue-500 to-blue-700',
      shadow: 'shadow-blue-500/10'
    },
    {
      icon: Award,
      title: getLangText(language, { vi: 'CHẤT LƯỢNG VÀ DỊCH VỤ', en: 'QUALITY & SERVICE', ko: '품질 및 서비스', ja: '品質とサービス', zh: '质量与服务', de: 'QUALITÄT & SERVICE' }),
      desc: getLangText(language, {
        vi: 'Sản phẩm và dịch vụ do Công ty Cổ phần Xây lắp Bưu điện Miền Trung cung cấp được kiểm tra nghiêm ngặt theo tiêu chuẩn quốc tế. Đi kèm theo đó là dịch vụ hỗ trợ tư vấn, kỹ thuật và bảo hành toàn diện cho các dự án.',
        en: 'Products and services supplied by CTC are strictly verified under international standards, accompanied by comprehensive consultation, technical assistance, and warranty.',
        ko: 'CTC가 제공하는 제품과 서비스는 국제 표준에 따라 엄격하게 검증되며, 종합적인 상담, 기술 지원 및 보증 서비스가 제공됩니다.',
        ja: 'CTCが提供する製品とサービスは、国際基準に準拠して厳格に検証されており、包括的なコンサルティング、技術支援、保証サービスが提供されます。',
        zh: 'CTC提供的产品和服务均经过国际标准的严格检验，并附带全方位的咨询、技术支持与售后质保。',
        de: 'Alle von CTC gelieferten Produkte und Dienstleistungen entsprechen strengen internationalen Standards.'
      }),
      details: getLangText(language, {
        vi: 'Chúng tôi áp dụng quy trình kiểm soát chất lượng chuẩn ISO nghiêm ngặt trên toàn bộ quy trình thiết kế, mua sắm vật tư và thi công. Tất cả trang thiết bị do CTC cung cấp đều đạt tiêu chuẩn quốc tế và đi kèm gói bảo hành lâu dài, dịch vụ bảo trì định kỳ chu đáo.',
        en: 'We apply strict ISO quality control processes throughout the engineering, procurement, and construction phases. All equipment supplied by CTC complies with international standards.',
        ko: '설계, 자재 조달 및 시공 전 과정에 걸쳐 엄격한 ISO 품질 관리 프로세스를 적용합니다.',
        ja: '設計、資材調達、施工の全工程において厳格なISO品質管理プロセスを適用しています。',
        zh: '我们在设计、采购和施工全过程执行严格的ISO质量控制流程。',
        de: 'Wir wenden strengste ISO-Qualitätskontrollverfahren in allen Projektphasen an.'
      }),
      color: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/10'
    },
    {
      icon: Settings,
      title: getLangText(language, { vi: 'CÔNG NGHỆ HIỆN ĐẠI', en: 'MODERN TECHNOLOGY', ko: '현대적인 기술', ja: '最新・現代テクノロジー', zh: '现代先进技术', de: 'MODERNE TECHNOLOGIE' }),
      desc: getLangText(language, {
        vi: 'Ứng dụng công nghệ tiên tiến trong thiết kế, thi công và quản lý dự án. Sử dụng máy móc, thiết bị hiện đại để đảm bảo tiến độ và chất lượng công trình.',
        en: 'Applying state-of-the-art technology in engineering design, construction, and project management. Utilizing advanced machinery to ensure deadlines and quality.',
        ko: '설계, 시공 및 프로젝트 관리에 최첨단 기술을 적용합니다. 공기 준수와 품질 보장을 위해 최신 장비를 활용합니다.',
        ja: '設計、施工、プロジェクト管理において最先端技術を応用。納期と品質を保証するため最新の機械設備を活用。',
        zh: '在设计、施工与项目管理中应用先进技术，使用现代化机械设备确保工期与工程质量。',
        de: 'Einsatz modernster Technologie in Planung, Bau und Projektmanagement.'
      }),
      details: getLangText(language, {
        vi: 'Không ngừng đầu tư vào máy móc thi công hiện đại, thiết bị đo kiểm chuyên dụng thế hệ mới và các phần mềm quản lý tiên tiến. Việc ứng dụng công nghệ số và tự động hóa giúp tăng năng suất thi công, kiểm soát rủi ro tối đa và đảm bảo tiến độ bàn giao xuất sắc.',
        en: 'Constantly investing in state-of-the-art construction machinery, specialized testing equipment, and advanced management software.',
        ko: '최첨단 시공 기계, 전문 측정 장비 및 고급 관리 소프트웨어에 지속적으로 투자하고 있습니다.',
        ja: '最先端の施工機械、専門的な測定機器、先進的な管理ソフトウェアに継続的に投資しています。',
        zh: '持续投资引进行业领先的施工机械、专用检测仪器与数字化管理软件。',
        de: 'Kontinuierliche Investition in modernste Baumaschinen und Prüfgeräte.'
      }),
      color: 'from-pink-400 to-rose-500',
      shadow: 'shadow-pink-500/10'
    },
    {
      icon: Handshake,
      title: getLangText(language, { vi: 'ĐỐI TÁC CHIẾN LƯỢC', en: 'STRATEGIC PARTNERS', ko: '전략적 파트너', ja: '戦略的パートナー', zh: '战略合作伙伴', de: 'STRATEGISCHE PARTNER' }),
      desc: getLangText(language, {
        vi: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung là đối tác chiến lược của nhiều thương hiệu hàng đầu trong và ngoài nước, cung cấp giải pháp đa dạng đáp ứng nhu cầu khách hàng.',
        en: 'CTC is a strategic partner of many leading domestic and international brands, delivering diverse solutions to meet the demands of our clients.',
        ko: 'CTC는 국내외 유수의 브랜드들의 전략적 파트너로서 고객의 다양한 니즈를 충족시키는 솔루션을 제공합니다.',
        ja: 'CTCは国内外の多くの top ブランドの戦略的パートナーであり、お客様の要望に応える多様なソリューションを提供します。',
        zh: 'CTC是国内外众多知名品牌的战略合作伙伴，提供多样化的解决方案满足客户需求。',
        de: 'CTC ist ein strategischer Partner führender nationaler und internationaler Marken.'
      }),
      details: getLangText(language, {
        vi: 'Với thế mạnh và uy tín lâu năm, CTC là đối tác chiến lược của các thương hiệu công nghệ, thiết bị toàn cầu (như Huawei, Longi, Canadian Solar và các nhà mạng viễn thông lớn Viettel, VNPT, Mobifone). Điều này giúp chúng tôi đảm bảo nguồn thiết bị chính hãng chất lượng cao, giá thành tối ưu và sự hỗ trợ kỹ thuật trực tiếp.',
        en: 'With strong status and reputation, CTC is a long-term strategic partner of major global technology brands (Huawei, Longi, Canadian Solar, VNPT, Viettel, Mobifone).',
        ko: 'CTC는 글로벌 기술 브랜드(Huawei, Longi, Canadian Solar, Viettel, VNPT 등)의 장기 전략적 파트너입니다.',
        ja: 'CTCは、グローバル技術ブランド（Huawei、Longi、Canadian Solar、Viettel、VNPTなど）の長期的な戦略的パートナーです。',
        zh: '凭借多年口碑，CTC与全球顶级品牌（Huawei、Longi、Canadian Solar及Viettel、VNPT等）建立长期战略合作。',
        de: 'CTC ist langjähriger strategischer Partner von Huawei, Longi, Canadian Solar, VNPT, Viettel.'
      }),
      color: 'from-amber-400 to-amber-600',
      shadow: 'shadow-amber-500/10'
    },
    {
      icon: TrendingUp,
      title: getLangText(language, {
        vi: 'PHÁT TRIỂN BỀN VỮNG',
        en: 'SUSTAINABLE DEVELOPMENT',
        ko: '지속 가능한 발전',
        ja: '持続可能な発展',
        zh: '可持续发展',
        de: 'NACHHALTIGE ENTWICKLUNG'
      }),
      desc: getLangText(language, {
        vi: 'Cam kết phát triển bền vững, tăng trưởng ổn định và tạo giá trị lâu dài cho khách hàng và đối tác.',
        en: 'Committed to sustainable development, stable growth, and generating long-term values for clients and partners.',
        ko: '지속 가능한 발전, 안정적인 성장, 그리고 고객과 파트너를 위한 장기적 가치 창출에 헌신합니다.',
        ja: '持続可能な発展、安定した成長、そしてお客様とパートナーのための長期的な価値創造にコミットします。',
        zh: '致力于可持续发展、稳定增长，为客户和合作伙伴创造长期价值。',
        de: 'Engagement für nachhaltige Entwicklung, stabiles Wachstum und langfristige Werte.'
      }),
      details: getLangText(language, {
        vi: 'CTC cam kết gắn liền hoạt động kinh doanh với bảo vệ môi trường và đóng góp cho cộng đồng. Chúng tôi đi đầu trong việc thúc đẩy các giải pháp năng lượng xanh (điện mặt trời, điện gió), giảm thiểu lượng phát thải carbon, hướng tới một tương lai phát triển bền vững và thịnh vượng.',
        en: 'CTC commits to linking business operations with environmental protection and social responsibility. We are pioneers in promoting clean energy solutions.',
        ko: 'CTC는 사업 운영을 환경 보호 및 사회적 책임과 연계할 것을 약속합니다. 청정 에너지 솔루션을 적극 추진합니다.',
        ja: 'CTCは事業活動と環境保護・社会貢献を結びつけることを約束します。クリーンエネルギーソリューションの推進をリードします。',
        zh: 'CTC承诺将企业运营与环境保护及社会责任相结合，积极推动绿色能源解决方案。',
        de: 'CTC verbindet Geschäftstätigkeit mit Umweltschutz und gesellschaftlicher Verantwortung.'
      }),
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10'
    }
  ];

  return (
    <section ref={whyRef} className="py-24 bg-slate-50 dark:bg-[#060d1d] relative overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        .why-blueprint-lines {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
            background-size: 80px 80px;
            z-index: 1;
            opacity: 0.5;
            pointer-events: none;
        }
        .dark .why-blueprint-lines {
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }

        .why-aura-glow {
            position: absolute;
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, rgba(14, 165, 233, 0.16) 0%, transparent 70%);
            filter: blur(90px);
            z-index: 1;
            pointer-events: none;
        }
        .dark .why-aura-glow {
            background: radial-gradient(circle, rgba(14, 165, 233, 0.04) 0%, transparent 70%);
        }
        .w-aura-1 { top: -10%; left: -5%; }
        .w-aura-2 { bottom: -10%; right: -5%; }

        .why-glass-badge {
            background: rgba(255, 255, 255, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.7);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
        }
        .dark .why-glass-badge {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .why-glass-card {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.65);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.02), inset 0 1px 2px rgba(255, 255, 255, 0.5);
            z-index: 10;
        }
        .dark .why-glass-card {
            background: rgba(255, 255, 255, 0.015);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .why-glass-card:hover {
            transform: translateY(-4px);
            background: rgba(255, 255, 255, 0.45);
            border-color: rgba(14, 165, 233, 0.4);
            box-shadow: 0 15px 35px -10px rgba(14, 165, 233, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.6);
        }
        .dark .why-glass-card:hover {
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(56, 189, 248, 0.3);
            box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .why-glass-row {
            background: rgba(255, 255, 255, 0.22);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.65);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 4px 15px -5px rgba(0,0,0,0.01), inset 0 1px 1px rgba(255, 255, 255, 0.4);
        }
        .dark .why-glass-row {
            background: rgba(255, 255, 255, 0.01);
            border: 1px solid rgba(255, 255, 255, 0.06);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.02);
        }
        .why-glass-row:hover {
            transform: translateX(8px);
            background: rgba(255, 255, 255, 0.45);
            border-color: rgba(14, 165, 233, 0.35);
            box-shadow: 0 10px 25px -10px rgba(14, 165, 233, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.5);
        }
        .dark .why-glass-row:hover {
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(56, 189, 248, 0.25);
            box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.08);
        }

        .pulse-glow-icon::before {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            background: inherit;
            opacity: 0;
            z-index: -1;
            transition: all 0.4s ease;
        }
        .why-glass-row:hover .pulse-glow-icon::before {
            opacity: 0.25;
            animation: pulseIcon 2s infinite;
        }
        @keyframes pulseIcon {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.3); opacity: 0.1; }
            100% { transform: scale(1); opacity: 0.3; }
        }

        @keyframes floatNormal {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-float-normal {
            animation: floatNormal 6s ease-in-out infinite;
        }
      `}} />

      <div className="why-blueprint-lines"></div>
      <div className="why-aura-glow w-aura-1"></div>
      <div className="why-aura-glow w-aura-2"></div>

      <div className="container max-w-[1440px] mx-auto px-4 sm:px-6 relative z-10">
        <div className={`flex flex-col lg:flex-row gap-16 items-center transition-all duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Left Column: Premium Visual Collage */}
          <div className="w-full lg:w-1/2 relative">
            {/* Decorative background blur glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/10 to-blue-600/10 rounded-[2.5rem] blur-3xl opacity-70"></div>
            
            {/* Main Image in Glass Frame */}
            <div className="relative why-glass-card p-3.5 rounded-[2.8rem] overflow-hidden shadow-2xl z-10">
              <div className="relative aspect-[4/3] rounded-[2.2rem] overflow-hidden">
                <img 
                  src="/images/why_choose_us_visual.webp"
                  alt="Why Choose CTC" 
                  width="1024"
                  height="1024"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[1200ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                
                {/* Visual overlay title - shifted right to prevent overlapping with bottom-left floating badge */}
                <div className="absolute bottom-7 left-28 sm:left-32 right-7 text-white">
                  <span className="text-[9px] font-black uppercase tracking-widest text-sky-400 bg-sky-950/40 px-2.5 py-1 rounded-md backdrop-blur-sm inline-block mb-2">CTC CO., LTD</span>
                  <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black leading-tight">
                    {getLangText(language, {
                      vi: 'Tiên phong giải pháp xây lắp bền vững',
                      en: 'Pioneering Sustainable Engineering Solutions',
                      ko: '지속 가능한 엔지니어링 솔루션 개척',
                      ja: '持続可能なエンジニアリングソリューションを開拓',
                      zh: '开创可持续工程解决方案',
                      de: 'Pionierarbeit für nachhaltige Ingenieurlösungen'
                    })}
                  </h4>
                </div>
              </div>
            </div>

            {/* Floating Badge 1: Years of Service */}
            <div 
              className="absolute -top-8 -right-4 sm:-right-8 why-glass-card w-32 h-32 sm:w-36 sm:h-36 rounded-[2rem] flex flex-col items-center justify-center p-4 shadow-2xl z-20 animate-float-normal cursor-default select-none" 
              style={{ animationDelay: '0s' }}
            >
              <span className="text-3xl sm:text-4xl font-black text-sky-500 dark:text-sky-400 tracking-tight leading-none">
                {companyProfile.hero_statistics.experience_years || "32+"}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 dark:text-slate-200 tracking-wider text-center uppercase mt-2.5 leading-tight max-w-[85px]">
                {getLangText(language, {
                  vi: 'NĂM KINH NGHIỆM',
                  en: 'YEARS EXPERIENCE',
                  ko: '년 경력',
                  ja: '年事業実績',
                  zh: '年行业经验',
                  de: 'JAHRE ERFAHRUNG'
                })}
              </span>
            </div>

            {/* Floating Badge 2: Success Projects Rate */}
            <div 
              className="absolute -bottom-8 -left-4 sm:-left-8 why-glass-card w-32 h-32 sm:w-36 sm:h-36 rounded-[2rem] flex flex-col items-center justify-center p-4 shadow-2xl z-20 animate-float-normal cursor-default select-none" 
              style={{ animationDelay: '3s' }}
            >
              <span className="text-3xl sm:text-4xl font-black text-sky-500 dark:text-sky-400 tracking-tight leading-none">
                {companyProfile.hero_statistics.similar_projects || "500+"}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 dark:text-slate-200 tracking-wider text-center uppercase mt-2.5 leading-tight max-w-[90px]">
                {getLangText(language, {
                  vi: 'DỰ ÁN HOÀN THÀNH',
                  en: 'PROJECTS COMPLETED',
                  ko: '프로젝트 완료',
                  ja: 'プロジェクト完了',
                  zh: '项目完成',
                  de: 'PROJEKTE ABGESCHLOSSEN'
                })}
              </span>
            </div>
          </div>

          {/* Right Column: High-tech List Content */}
          <div className="w-full lg:w-1/2 space-y-8 flex flex-col justify-center">
            
            {/* Header Area */}
            <div className="space-y-4 text-center lg:text-left">
              <div className="why-glass-badge inline-flex items-center gap-2 px-5 py-1.5 rounded-full">
                <Award size={18} className="text-sky-500" />
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                  {getLangText(language, {
                    vi: 'Tại sao chọn chúng tôi?',
                    en: 'Why Choose Us',
                    ko: '왜 CTC인가?',
                    ja: 'CTCが選ばれる理由',
                    zh: '为什么选择我们',
                    de: 'Warum CTC wählen?'
                  })}
                </span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight uppercase tracking-wide">
                {getLangText(language, {
                  vi: 'TẠI SAO CHỌN CHÚNG TÔI?',
                  en: 'WHY CHOOSE CTC?',
                  ko: '왜 CTC를 선택해야 할까요?',
                  ja: 'CTCが選ばれる理由',
                  zh: '为什么选择 CTC？',
                  de: 'WARUM CTC WÄHLEN?'
                })}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                {getLangText(language, {
                  vi: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung – Đối tác tin cậy với bề dày kinh nghiệm, đội ngũ chuyên gia giàu chuyên môn, được đào tạo bài bản và đã thực hiện nhiều dự án lớn cho doanh nghiệp trong và ngoài nước. Chúng tôi cam kết mang đến giải pháp tối ưu, đáp ứng mọi nhu cầu của khách hàng một cách chuyên nghiệp và hiệu quả.',
                  en: 'Central Vietnam Posts and Telecommunications Construction Joint-Stock Company (CTC) – A trusted partner with rich experience and a team of highly-trained, expert professionals who have executed major projects for domestic and foreign enterprises.',
                  ko: '중부 포스트 및 통신 건설 주식 회사 (CTC) – 풍부한 경험과 고도로 훈련된 전문 인력을 갖춘 신뢰할 수 있는 파트너로서, 국내외 기업의 대형 프로젝트를 성공적으로 수행해 왔습니다.',
                  ja: '中部ポスト＆電気通信建設株式会社（CTC）– 豊富な経験と高度に訓練された専門家チームを擁する信頼できるパートナー。',
                  zh: '越南中部邮电建设股份有限公司（CTC）– 经验丰富、专业扎实、深受信赖的合作伙伴。',
                  de: 'Zentralvietnam Posts und Telekommunikation Bau-AG (CTC) – Ein vertrauenswürdiger Partner mit reichhaltiger Erfahrung.'
                })}
              </p>
            </div>

            {/* Vertical glass rows stack */}
            <div className="space-y-4">
              {items.map((item, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => onOpenModal(item.title, item.desc, item.details)}
                  className="why-glass-row p-4 sm:p-5 rounded-2xl cursor-pointer flex items-center gap-4 sm:gap-5 w-full text-left"
                >
                  <div className="flex-shrink-0 relative">
                    <div className={`float-icon pulse-glow-icon w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md relative z-10`}>
                      <item.icon size={20} />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider transition-colors duration-200">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                  
                  <div className="text-slate-400 hover:text-sky-500 flex-shrink-0 self-center transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
