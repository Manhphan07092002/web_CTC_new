import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { useMouseParallax } from '../../hooks/useMouseParallax';

import { getLangText } from '../../utils/translation-helper';

// Load company profile data
import companyProfile from '../../constants/company_profile.json';

interface AboutProps {
  onOpenModal: (title: string, desc: string, details: string) => void;
}

const About: React.FC<AboutProps> = ({ onOpenModal }) => {
  const { t, language } = useLanguage();
  const parallax = useMouseParallax();
  const { ref: aboutRef, isInView } = useInView(0.1);
  
  const introText = getLangText(language, {
    vi: companyProfile.intro.vi,
    en: companyProfile.intro.en,
    ko: '중부 포스트 및 통신 건설 주식 회사 (CTC)는 기술 인프라 건설, 통신, 산업, 토목 공학 및 재생 에너지 분야에서 활동하는 기업입니다.',
    ja: '中部ポスト＆電気通信建設株式会社（CTC）は、技術インフラ建設、通信、産業・土木工事、再生可能エネルギー分野で事業を展開する企業です。',
    zh: '越南中部邮电建设股份有限公司（CTC）是一家从事工程基础设施建设、电信、工业及民用工程、可再生能源领域的专业企业。',
    de: 'Zentralvietnam Posts und Telekommunikation Bau-AG (CTC) ist ein Unternehmen in den Bereichen technische Infrastruktur, Telekommunikation, Industrie- und Zivilbau sowie erneuerbare Energien.'
  });

  const visionText = getLangText(language, {
    vi: companyProfile.vision.vi,
    en: companyProfile.vision.en,
    ko: '통신 인프라, 기술 인프라, 재생 에너지(태양광, 풍력), 산업 EPC 및 디지털 인프라 분야에서 베트남을 선도하는 기업이 되는 것입니다.',
    ja: '通信インフラ、技術インフラ、再生可能エネルギー、デジタルインフラの分野でベトナムをリードする企業を目指します。',
    zh: '成为越南在电信基础设施、工程基础设施、可再生能源及数字基础设施领域的领先企业。',
    de: 'Ein führendes Unternehmen in Vietnam in den Bereichen Telekommunikation, Infrastruktur und erneuerbare Energien zu werden.'
  });

  const missionText = getLangText(language, {
    vi: 'Mang đến những công trình chất lượng vượt trội, giải pháp tối ưu và dịch vụ chuyên nghiệp, tận tâm cho khách hàng và đối tác.',
    en: 'Deliver outstanding installations, optimal solutions, and highly professional, devoted services to clients and partners.',
    ko: '고객과 파트너에게 우수한 품질의 공사, 최적의 솔루션 및 전문적이고 헌신적인 서비스를 제공합니다.',
    ja: 'お客様とパートナーに優れた品質の工事、最適なソリューション、そして専門的で献身的なサービスを提供します。',
    zh: '为客户和合作伙伴提供卓越品质的工程、最佳解决方案以及专业敬业的服务。',
    de: 'Bereitstellung hervorragender Bauqualität, optimaler Lösungen und professioneller Dienstleistungen.'
  });
  
  const sectionBadge = getLangText(language, { vi: 'VỀ CHÚNG TÔI', en: 'ABOUT US', ko: '회사 소개', ja: '会社概要', zh: '关于我们', de: 'ÜBER UNS' });
  
  const aboutTitle = getLangText(language, { vi: 'CTC - Đối tác tin cậy của bạn', en: 'CTC - Your Trusted Partner', ko: 'CTC - 신뢰할 수 있는 파트너', ja: 'CTC - 信頼できるパートナー', zh: 'CTC - 您值得信赖的合作伙伴', de: 'CTC - Ihr vertrauenswürdiger Partner' });
  const titleParts = aboutTitle.split(' - ');
  const titlePart1 = titleParts[0]; 
  const titlePart2 = titleParts.slice(1).join(' - ') || "";
  
  const btnMore = getLangText(language, { vi: 'Tìm hiểu thêm', en: 'Learn More', ko: '자세히 보기', ja: '詳細を見る', zh: '了解更多', de: 'Mehr erfahren' });
  const btnProfile = getLangText(language, { vi: 'Xem hồ sơ năng lực', en: 'Company Profile', ko: '회사 프로필', ja: '会社概要', zh: '公司简介', de: 'Unternehmensprofil' });
  const btnContact = getLangText(language, { vi: 'Liên hệ ngay', en: 'Contact Us', ko: '문의하기', ja: 'お問い合わせ', zh: '联系我们', de: 'Kontakt' });
  const yearsExp = getLangText(language, { vi: 'Năm\nKinh Nghiệm', en: 'Years\nExperience', ko: '년\n경력', ja: '年\n事業実績', zh: '年\n行业经验', de: 'Jahre\nErfahrung' });
  
  const coreValues = getLangText(language, {
    vi: 'Uy tín - Chất lượng - Chuyên nghiệp - Đổi mới - Trách nhiệm - Đồng hành',
    en: 'Trust - Quality - Professionalism - Innovation - Responsibility - Partnership',
    ko: '신뢰 - 품질 - 전문성 - 혁신 - 책임 - 파트너십',
    ja: '信頼 - 品質 - 専門性 - 革新 - 責任 - パートナーシップ',
    zh: '诚信 - 质量 - 专业 - 创新 - 责任 - 合作',
    de: 'Vertrauen - Qualität - Professionalität - Innovation - Verantwortung - Partnerschaft'
  });
  const valuesTitle = getLangText(language, { vi: 'Giá trị cốt lõi', en: 'Core Values', ko: '핵심 가치', ja: '核心価値', zh: '核心价值', de: 'Kernwerte' });

  return (
    <section ref={aboutRef} className="py-16 lg:py-32 relative overflow-hidden bg-slate-50 dark:bg-[#060d1d] transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        .about-blueprint-lines {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
            background-size: 80px 80px;
            z-index: 1;
            opacity: 0.5;
            pointer-events: none;
        }
        .dark .about-blueprint-lines {
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }

        .about-aura-glow {
            position: absolute;
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(14, 165, 233, 0.28) 0%, transparent 70%);
            filter: blur(100px);
            z-index: 1;
            pointer-events: none;
        }
        .dark .about-aura-glow {
            background: radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, transparent 70%);
        }
        .aura-top-right { top: -20%; right: -10%; }
        .aura-bottom-left { bottom: -20%; left: -10%; }

        .about-title-outline {
            font-family: 'Be Vietnam Pro', 'Montserrat', sans-serif;
            font-size: clamp(1.2rem, 3vw, 1.8rem);
            font-weight: 800;
            letter-spacing: 5px;
            text-transform: uppercase;
            color: transparent;
            -webkit-text-stroke: 1px rgba(0, 0, 0, 0.2);
            margin-bottom: 8px;
            display: inline-block;
        }
        .dark .about-title-outline {
            -webkit-text-stroke: 1px rgba(255, 255, 255, 0.4);
        }

        .about-title-main {
            font-family: 'Be Vietnam Pro', 'Montserrat', sans-serif;
            font-size: clamp(1.5rem, 2.8vw, 2.2rem);
            font-weight: 900;
            line-height: 1.2;
            text-transform: uppercase;
            letter-spacing: -1px;
            margin-bottom: 24px;
            color: #0f172a;
        }
        .dark .about-title-main {
            color: #ffffff;
        }

        .about-title-gradient {
            background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .dark .about-title-gradient {
            background: linear-gradient(135deg, #38bdf8 0%, #0284c7 60%, #38bdf8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .about-glass-card {
            background: rgba(255, 255, 255, 0.35);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 20px;
            transition: all 0.4s ease;
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255, 255, 255, 0.5);
        }
        .dark .about-glass-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .about-glass-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.5);
            border-color: rgba(14, 165, 233, 0.4);
            box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.6);
        }
        .dark .about-glass-card:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(56, 189, 248, 0.3);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .about-badge {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 100px;
            padding: 10px 24px;
            margin-bottom: 20px;
            box-shadow: 0 10px 20px -10px rgba(0,0,0,0.1);
        }
        .dark .about-badge {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.4);
        }

        .about-badge-text {
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #0f172a;
        }
        .dark .about-badge-text {
            color: #e2e8f0;
        }

        .about-image-wrapper {
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .dark .about-image-wrapper {
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .about-floating-stat {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            width: 160px;
            height: 160px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.08), inset 0 0 10px rgba(255, 255, 255, 0.15);
            z-index: 20;
        }
        .dark .about-floating-stat {
            background: rgba(6, 13, 29, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 50px rgba(0,0,0,0.4), inset 0 0 20px rgba(255, 255, 255, 0.05);
        }

        @keyframes pulseGlow {
            0% {
                box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.5);
            }
            70% {
                box-shadow: 0 0 0 15px rgba(14, 165, 233, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
            }
        }

        .btn-pulse-glow {
            background: rgba(14, 165, 233, 0.12);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: #007cb9 !important;
            border: 2px solid rgba(14, 165, 233, 0.4);
            border-radius: 16px;
            padding: 16px 36px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.4s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            box-shadow: 0 4px 20px rgba(14, 165, 233, 0.15);
            animation: pulseGlow 2s infinite;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }
        .btn-pulse-glow:hover {
            transform: translateY(-3px) scale(1.02);
            background: rgba(14, 165, 233, 0.22);
            border-color: rgba(14, 165, 233, 0.6);
            box-shadow: 0 10px 25px rgba(14, 165, 233, 0.3);
        }
        .btn-pulse-glow::before {
            content: '';
            position: absolute;
            top: 0;
            left: -150%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
            transform: skewX(-20deg);
            transition: transform 0.8s ease;
        }
        .btn-pulse-glow:hover::before {
            transform: translateX(150%);
        }
        .dark .btn-pulse-glow {
            background: rgba(56, 189, 248, 0.08);
            color: #38bdf8 !important;
            border-color: rgba(56, 189, 248, 0.45);
            box-shadow: 0 4px 20px rgba(14, 165, 233, 0.25);
        }
        .dark .btn-pulse-glow:hover {
            background: rgba(56, 189, 248, 0.18);
            border-color: rgba(56, 189, 248, 0.6);
        }
      `}} />

      <div className="about-blueprint-lines"></div>
      <div className="about-aura-glow aura-top-right"></div>
      <div className="about-aura-glow aura-bottom-left"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* LEFT: Images */}
          <div className={`relative transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="grid grid-cols-2 gap-6 relative">
              <div className="space-y-6" style={{ transform: `translateY(${parallax.y * 0.3}px)` }}>
                <div className="about-image-wrapper h-64 lg:h-80 translate-y-12">
                  <img src="/images/about_solar_install.webp" alt="Installation" width="1024" height="1024" loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="about-image-wrapper h-48 lg:h-64 translate-y-12">
                  <img src="/images/about_telecom.webp" alt="Engineers" width="1024" height="1024" loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                </div>
              </div>
              <div className="space-y-6" style={{ transform: `translateY(${parallax.y * -0.3}px)` }}>
                <div className="about-image-wrapper h-48 lg:h-64">
                  <img src="/images/about_datacenter.webp" alt="Office" width="1024" height="1024" loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="about-image-wrapper h-64 lg:h-80">
                  <img src="/images/about_renewable.webp" alt="Panels" width="1024" height="1024" loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                </div>
              </div>

              {/* Floating Stat */}
              <div className="about-floating-stat animate-float">
                <div className="text-4xl font-black about-title-gradient">{companyProfile.hero_statistics.experience_years}</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-widest uppercase mt-2 text-center whitespace-pre-line">{yearsExp}</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className={`transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="about-badge">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
              <span className="about-badge-text">{sectionBadge}</span>
            </div>

            <h2 className="about-title-main">
              <span className="about-title-outline block">{titlePart1}</span>
              <span className="block mt-2">
                <span className="about-title-gradient">{titlePart2}</span>
              </span>
            </h2>

            <div className="space-y-6 mb-12">
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-light text-justify border-l-2 border-sky-500/30 pl-6">
                {introText}
              </p>
            </div>

            {/* Core Values Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="about-glass-card p-5 group cursor-pointer" onClick={() => onOpenModal(getLangText(language, { vi: 'Tầm nhìn', en: 'Vision', ko: '비전', ja: 'ビジョン', zh: '愿景', de: 'Vision' }), visionText, '')}>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-sky-500/20">
                  <Eye className="text-sky-500 dark:text-sky-400" size={20} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">
                  {getLangText(language, { vi: 'Tầm nhìn', en: 'Vision', ko: '비전', ja: 'ビジョン', zh: '愿景', de: 'Vision' })}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">{visionText}</p>
                <div className="mt-4 flex items-center text-sky-600 dark:text-sky-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {btnMore} <ArrowRight size={14} className="ml-1" />
                </div>
              </div>

              <div className="about-glass-card p-5 group cursor-pointer" onClick={() => onOpenModal(getLangText(language, { vi: 'Sứ mệnh', en: 'Mission', ko: '사명', ja: '使命', zh: '使命', de: 'Mission' }), getLangText(language, { vi: 'Sứ mệnh của chúng tôi:', en: 'Our Mission:', ko: '우리의 사명:', ja: '私たちの使命:', zh: '我们的使命:', de: 'Unsere Mission:' }), missionText)}>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-blue-500/20">
                  <Target className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">
                  {getLangText(language, { vi: 'Sứ mệnh', en: 'Mission', ko: '사명', ja: '使命', zh: '使命', de: 'Mission' })}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">{missionText}</p>
                <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {btnMore} <ArrowRight size={14} className="ml-1" />
                </div>
              </div>

              <div className="about-glass-card p-5 group cursor-pointer" onClick={() => onOpenModal(valuesTitle, coreValues, '')}>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-red-500/20">
                  <Heart className="text-red-500 dark:text-red-400" size={20} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">{valuesTitle}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">{coreValues}</p>
                <div className="mt-4 flex items-center text-red-600 dark:text-red-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {btnMore} <ArrowRight size={14} className="ml-1" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Link to="/contact" className="btn-pulse-glow">
                {btnContact}
              </Link>
              <Link to="/about" className="about-glass-card px-8 py-4 font-bold text-slate-800 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 uppercase tracking-wide text-sm flex items-center gap-2 group">
                {btnProfile} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
