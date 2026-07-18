import React, { useEffect, useRef, useState } from 'react';
import { Building2, MessageSquare, ArrowRight, Trophy, Briefcase, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Hero: React.FC = () => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load Montserrat and Be Vietnam Pro fonts dynamically
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(fontLink);
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  // Multi-language corporate data dictionary
  const heroData = {
    vi: {
      badge: 'Doanh nghiệp xây lắp hàng đầu',
      titleOutline: 'CÔNG TY CỔ PHẦN',
      titleFilled: 'XÂY LẮP BƯU ĐIỆN',
      titleGradient: 'MIỀN TRUNG',
      slogans: [
        { text: '"Kết nối tương lai - Xây dựng niềm tin"', isBold: true },
        { text: 'Chuyên nghiệp trong xây dựng hạ tầng viễn thông' },
        { text: 'Tiên phong trong công nghệ số và truyền thông' },
        { text: 'Đối tác tin cậy của các doanh nghiệp hàng đầu' },
        { text: 'Hơn 30 năm kinh nghiệm phục vụ khách hàng' }
      ],
      ctaPrimary: 'Tìm hiểu thêm',
      ctaSecondary: 'Liên hệ Zalo',
      panelTitle: 'NĂNG LỰC DOANH NGHIỆP',
      stat1Title: 'Kinh nghiệm',
      stat1Val: '32+ Năm',
      stat1Desc: 'Phát triển vững mạnh',
      stat2Title: 'Dự án thực hiện',
      stat2Val: '500+ Dự án',
      stat2Desc: 'Đạt chuẩn chất lượng',
      stat3Title: 'Phạm vi hoạt động',
      stat3Val: '34 Tỉnh thành',
      stat3Desc: 'Mạng lưới phủ rộng',
      partnerTitle: 'ĐỐI TÁC CHIẾN LƯỢC VIỄN THÔNG'
    },
    en: {
      badge: 'Leading Construction Enterprise',
      titleOutline: 'CONSTRUCTION J.S.C',
      titleFilled: 'CENTRAL TELECOM',
      titleGradient: 'CONSTRUCTION',
      slogans: [
        { text: '"Connecting the future - Building trust"', isBold: true },
        { text: 'Professional in telecommunications infrastructure' },
        { text: 'Pioneering in digital technology and communications' },
        { text: 'Reliable partner of leading enterprises' },
        { text: 'Over 30 years of experience serving customers' }
      ],
      ctaPrimary: 'Explore More',
      ctaSecondary: 'Contact Zalo',
      panelTitle: 'CORPORATE CAPABILITIES',
      stat1Title: 'Experience',
      stat1Val: '32+ Years',
      stat1Desc: 'Sustainable growth',
      stat2Title: 'Projects Completed',
      stat2Val: '500+ Projects',
      stat2Desc: 'International standards',
      stat3Title: 'Network Coverage',
      stat3Val: '34 Provinces',
      stat3Desc: 'Nationwide operation',
      partnerTitle: 'TELECOM STRATEGIC PARTNERS'
    },
    ko: {
      badge: '선도적인 건설 기업',
      titleOutline: '주식 회사',
      titleFilled: '중부 포스트 및 통신',
      titleGradient: '건설',
      slogans: [
        { text: '"미래를 연결하고 신뢰를 구축합니다"', isBold: true },
        { text: '통신 인프라 건설 전문' },
        { text: '디지털 기술 및 통신 개척자' },
        { text: '주요 기업의 신뢰할 수 있는 파트너' },
        { text: '고객 서비스 분야 30년 이상의 경험' }
      ],
      ctaPrimary: '자세히 보기',
      ctaSecondary: 'Zalo 문의',
      panelTitle: '기업 핵심 역량',
      stat1Title: '경력',
      stat1Val: '32+ 년',
      stat1Desc: '지속 가능한 성장',
      stat2Title: '완료된 프로젝트',
      stat2Val: '500+ 프로젝트',
      stat2Desc: '국제 표준 준수',
      stat3Title: '네트워크 범위',
      stat3Val: '34개 성·시',
      stat3Desc: '전국적인 운영망',
      partnerTitle: '통신 전략적 파트너'
    },
    ja: {
      badge: '総合建設リーディング企業',
      titleOutline: '建設株式会社',
      titleFilled: '中部ポスト＆電気通信',
      titleGradient: '建設',
      slogans: [
        { text: '"未来を繋ぐ - 信頼を築く"', isBold: true },
        { text: '通信インフラ建設のプロフェッショナル' },
        { text: 'デジタル技術と通信의パイオニア' },
        { text: '主要企業の信頼できるパートナー' },
        { text: '30年以上の顧客サービスの経験' }
      ],
      ctaPrimary: '詳細を見る',
      ctaSecondary: 'Zaloでお問い合わせ',
      panelTitle: '企業実績・能力',
      stat1Title: '事業経験',
      stat1Val: '32年以上',
      stat1Desc: '持続的な発展と信頼',
      stat2Title: '完工プロジェクト',
      stat2Val: '500件以上',
      stat2Desc: '高品質規格の達成',
      stat3Title: '活動範囲',
      stat3Val: '34省・市',
      stat3Desc: '全国をカバーするネットワーク',
      partnerTitle: '通信戦略パートナー'
    },
    zh: {
      badge: '领先建设工程企业',
      titleOutline: '股份有限公司',
      titleFilled: '越南中部邮电',
      titleGradient: '建设',
      slogans: [
        { text: '"连接未来 - 建立信任"', isBold: true },
        { text: '通信基础设施建设专业化' },
        { text: '数字技术与通信领域的先锋' },
        { text: '各大企业信赖的合作伙伴' },
        { text: '超过 30 年服务客户经验' }
      ],
      ctaPrimary: '了解更多',
      ctaSecondary: '联系 Zalo',
      panelTitle: '企业核心能力',
      stat1Title: '行业经验',
      stat1Val: '32+ 年',
      stat1Desc: '稳健持续发展',
      stat2Title: '已完成项目',
      stat2Val: '500+ 项目',
      stat2Desc: '符合国际标准',
      stat3Title: '业务覆盖',
      stat3Val: '34 省市',
      stat3Desc: '全国服务网络',
      partnerTitle: '电信战略合作伙伴'
    },
    de: {
      badge: 'Führendes Bauunternehmen',
      titleOutline: 'CONSTRUCTION AKTIENGESELLSCHAFT',
      titleFilled: 'CENTRAL TELECOM',
      titleGradient: 'INFRASTRUKTUR',
      slogans: [
        { text: '"Zukunft verbinden - Vertrauen aufbauen"', isBold: true },
        { text: 'Professionell im Bau von Telekommunikationsinfrastruktur' },
        { text: 'Wegweisend in digitaler Technologie und Kommunikation' },
        { text: 'Zuverlässiger Partner führender Unternehmen' },
        { text: 'Über 30 Jahre Erfahrung im Kundendienst' }
      ],
      ctaPrimary: 'Mehr erfahren',
      ctaSecondary: 'Zalo Kontakt',
      panelTitle: 'UNTERNEHMENSKOMPETENZEN',
      stat1Title: 'Erfahrung',
      stat1Val: '32+ Jahre',
      stat1Desc: 'Nachhaltiges Wachstum',
      stat2Title: 'Fertiggestellte Projekte',
      stat2Val: '500+ Projekte',
      stat2Desc: 'Höchste Qualitätsstandards',
      stat3Title: 'Netzabdeckung',
      stat3Val: '34 Provinzen',
      stat3Desc: 'Landesweite Präsenz',
      partnerTitle: 'STRATEGISCHE PARTNER'
    }
  };

  const currentLang = language as keyof typeof heroData;
  const currentHero = heroData[currentLang] || heroData.vi;

  const [sloganIdx, setSloganIdx] = useState(0);
  const [animClass, setAnimClass] = useState('slogan-enter');

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimClass('slogan-exit');
      setTimeout(() => {
        setSloganIdx((prev) => (prev + 1) % currentHero.slogans.length);
        setAnimClass('slogan-enter');
      }, 500);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentHero.slogans.length]);

  const handleScrollToNext = () => {
    const nextSection = document.querySelector('#home-stats') || document.querySelector('.py-20');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Video performance adjustments
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isLowPowerMode = false;
    let videoLoaded = false;

    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.saveData)) {
        isLowPowerMode = true;
        video.preload = 'none';
      }
    }

    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((battery: any) => {
        if (battery.level < 0.2) {
          isLowPowerMode = true;
          video.pause();
        }
      });
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isLowPowerMode) {
              if (!videoLoaded && video.readyState === 0) {
                video.load();
                videoLoaded = true;
              }
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );
      observer.observe(video);
      return () => observer.disconnect();
    } else {
      video.load();
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* === ELEGANT & PROFESSIONAL CORPORATE HERO === */
        .hero-corporate {
            position: relative;
            width: 100%;
            height: 100vh;
            min-height: 700px;
            overflow: hidden;
            background-color: #060d1d; /* Deep professional navy */
            font-family: 'Montserrat', 'Be Vietnam Pro', sans-serif;
            display: flex;
            align-items: center;
        }

        /* Ambient video overlay */
        .hero-video-render {
            position: absolute;
            top: 50%;
            left: 50%;
            min-width: 100%;
            min-height: 100%;
            width: auto;
            height: auto;
            transform: translate(-50%, -50%);
            z-index: 1;
            object-fit: cover;
            opacity: 0.88; /* Brightened from 0.7 to show the video clearly */
        }

        .dark-grad-mask {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 30% 30%, rgba(6, 13, 29, 0.2) 0%, rgba(6, 13, 29, 0.65) 90%);
            z-index: 2;
        }

        .gradient-dark-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to bottom,
                rgba(6, 13, 29, 0.2) 0%,
                rgba(6, 13, 29, 0.55) 60%,
                #060d1d 100%
            );
            z-index: 2;
        }

        /* Subtle Blueprint grid layout lines (represents engineering & construction) */
        .blueprint-lines {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 80px 80px;
            z-index: 3;
            opacity: 0.5;
            pointer-events: none;
        }

        /* Soft corporate glowing aura (not flashy neon) */
        .corporate-aura-glow {
            position: absolute;
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 75%);
            filter: blur(120px);
            z-index: 2;
            pointer-events: none;
        }
        .aura-left { top: -10%; left: -5%; }
        .aura-right { bottom: -10%; right: -5%; }

        /* Container & Asymmetric Split Layout */
        .corporate-layout {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 32px;
            display: grid;
            grid-template-columns: 1.15fr 0.85fr;
            gap: 70px;
            align-items: center;
        }

        /* LEFT PANEL: Typographic Core */
        .left-corporate-panel {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        /* Elegant Capsule Badge */
        .corporate-badge-capsule {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 100px;
            padding: 10px 24px;
            margin-bottom: 28px;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05);
            transform: scale(0.95);
            animation: badgeEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
            transition: all 0.3s ease;
        }
        .corporate-badge-capsule:hover {
            transform: scale(0.98) translateY(-2px);
            border-color: rgba(56, 189, 248, 0.4);
            background: rgba(255, 255, 255, 0.06);
        }
        .green-pulse-dot {
            width: 7px;
            height: 7px;
            background-color: #10b981;
            border-radius: 50%;
            position: relative;
        }
        .green-pulse-dot::after {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 1.5px solid #10b981;
            animation: pulseWaveAnim 2s infinite ease-out;
        }
        .badge-capsule-text {
            font-size: 0.78rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2.5px;
            color: #e2e8f0;
        }

        /* Clean Architectural Typography */
        .title-upper-outline {
            font-family: 'Montserrat', sans-serif;
            font-size: clamp(0.95rem, 2.5vw, 1.35rem);
            font-weight: 600;
            letter-spacing: 7px;
            text-transform: uppercase;
            margin-bottom: 10px;
            color: transparent;
            -webkit-text-stroke: 1px rgba(255, 255, 255, 0.35);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.05);
            animation: slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        
        .title-main-bold {
            font-family: 'Montserrat', sans-serif;
            font-size: clamp(2rem, 4.8vw, 3.8rem);
            font-weight: 900;
            line-height: 1.15;
            text-transform: uppercase;
            letter-spacing: -1.5px;
            color: #ffffff;
            margin-bottom: 6px;
            text-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            animation: slideUpFade 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        .title-main-gradient {
            font-family: 'Montserrat', sans-serif;
            font-size: clamp(2rem, 4.8vw, 3.8rem);
            font-weight: 900;
            line-height: 1.15;
            text-transform: uppercase;
            letter-spacing: -1.5px;
            background: linear-gradient(135deg, #38bdf8 0%, #0284c7 60%, #1e40af 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 35px;
            filter: drop-shadow(0 10px 20px rgba(14, 165, 233, 0.25));
            animation: slideUpFade 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
            white-space: nowrap; /* Keep central identity on a single line */
        }

        /* Slogan Display */
        .corporate-slogan-box {
            min-height: 70px;
            margin-bottom: 45px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            border-left: 2px solid rgba(14, 165, 233, 0.3);
            padding-left: 24px;
        }
        .slogan-card-body {
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .slogan-show {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
        }
        .slogan-hide {
            opacity: 0;
            transform: translateX(-15px);
            filter: blur(5px);
            position: absolute;
        }
        .slogan-strong {
            font-size: clamp(1.2rem, 2.2vw, 1.55rem);
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.2px;
            margin-bottom: 6px;
        }
        .slogan-desc {
            font-size: clamp(0.9rem, 1.8vw, 1rem);
            font-weight: 500;
            color: #94a3b8;
        }

        /* Premium Buttons */
        .cta-corporate-group {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            width: 100%;
            animation: slideUpFade 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }

        .btn-corporate {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 16px 36px;
            border-radius: 16px; /* Matched to 16px rounded-2xl of the cards in Image 2 */
            font-size: 0.95rem;
            font-weight: 700;
            letter-spacing: 0.8px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
            text-transform: uppercase;
        }

        .btn-corporate-primary {
            background: linear-gradient(135deg, rgba(2, 132, 199, 0.85) 0%, rgba(3, 105, 161, 0.85) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            color: #ffffff;
            border: 1px solid rgba(56, 189, 248, 0.45);
            box-shadow: 0 12px 30px -10px rgba(14, 165, 233, 0.4), inset 0 1px 1.5px rgba(255, 255, 255, 0.25);
        }
        .btn-corporate-primary::before {
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
        .btn-corporate-primary:hover {
            transform: translateY(-3px) scale(1.03);
            background: linear-gradient(135deg, rgba(2, 132, 199, 0.95) 0%, rgba(3, 105, 161, 0.95) 100%);
            box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.35);
            border-color: rgba(56, 189, 248, 0.65);
        }
        .btn-corporate-primary:hover::before {
            transform: translateX(150%);
        }
        .btn-corporate-primary:hover .slide-arrow {
            transform: translateX(6px);
        }
        .slide-arrow {
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-corporate-secondary {
            background: rgba(255, 255, 255, 0.02);
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.03);
        }
        .btn-corporate-secondary:hover {
            transform: translateY(-3px) scale(1.03);
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(56, 189, 248, 0.35);
            color: #ffffff;
            box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.3);
        }
        .btn-corporate-secondary:hover .spin-chat {
            transform: scale(1.15);
        }
        .spin-chat {
            transition: all 0.3s ease;
        }

        /* RIGHT PANEL: Professional Corporate Achievements Board */
        .right-corporate-panel {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: slideInRightBlur 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .achievement-dashboard {
            width: 100%;
            max-width: 440px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.5), 
                        inset 0 1px 1px rgba(255, 255, 255, 0.05);
            position: relative;
        }
        .achievement-dashboard::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.3), transparent);
        }

        .dashboard-header {
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 18px;
            margin-bottom: 24px;
        }
        .dashboard-header-text {
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 2px;
            color: #38bdf8;
            text-transform: uppercase;
        }

        /* Corporate Stats Grid */
        .corporate-stats-rows {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .stat-card-row {
            display: flex;
            align-items: center;
            gap: 18px;
            background: rgba(255, 255, 255, 0.015);
            border: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            padding: 16px;
            transition: all 0.3s ease;
        }
        .stat-card-row:hover {
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(56, 189, 248, 0.2);
            transform: translateX(5px);
        }
        .icon-circle {
            width: 44px;
            height: 44px;
            background: rgba(14, 165, 233, 0.1);
            border: 1px solid rgba(14, 165, 233, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #38bdf8;
        }
        .stat-card-data {
            display: flex;
            flex-direction: column;
        }
        .stat-card-val {
            font-size: 1.3rem;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.2;
            letter-spacing: -0.5px;
        }
        .stat-card-title {
            font-size: 0.75rem;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2px;
        }
        .stat-card-desc {
            font-size: 0.78rem;
            color: #64748b;
        }

        /* Partner Ticker */
        .partner-ticker-section {
            margin-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 18px;
        }
        .partner-ticker-label {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 1.5px;
            color: #475569;
            text-transform: uppercase;
            margin-bottom: 12px;
        }
        .partner-ticker-track {
            display: flex;
            gap: 16px;
            overflow: hidden;
            position: relative;
            white-space: nowrap;
            mask-image: linear-gradient(to right, transparent, white 8%, white 92%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, white 8%, white 92%, transparent);
        }
        .partner-ticker-items {
            display: inline-flex;
            gap: 24px;
            animation: infiniteTicker 15s linear infinite;
        }
        .ticker-brand-name {
            font-size: 0.8rem;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 1px;
        }

        /* Mouse Scroll Icon */
        .scroll-indicator-corporate {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            animation: bounceScroll 2.4s infinite;
        }
        .mouse-shell {
            width: 22px;
            height: 36px;
            border: 2px solid rgba(255, 255, 255, 0.35);
            border-radius: 100px;
            display: flex;
            justify-content: center;
            padding-top: 6px;
        }
        .mouse-wheel {
            width: 4px;
            height: 8px;
            background-color: #38bdf8;
            border-radius: 100px;
            animation: scrollWheelAnim 2s infinite;
        }

        /* Animation Keyframes */
        @keyframes pulseWaveAnim {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes infiniteTicker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        @keyframes badgeEntrance {
            0% { opacity: 0; transform: scale(0.85) translateY(10px); }
            100% { opacity: 1; transform: scale(0.95) translateY(0); }
        }
        @keyframes slideUpFade {
            0% { opacity: 0; transform: translateY(30px); filter: blur(12px); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes slideInRightBlur {
            0% { opacity: 0; transform: translateX(50px); filter: blur(12px); }
            100% { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        @keyframes bounceScroll {
            0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
            40% { transform: translateX(-50%) translateY(-6px); }
            60% { transform: translateX(-50%) translateY(-3px); }
        }
        @keyframes scrollWheelAnim {
            0% { transform: translateY(0); opacity: 1; }
            80% { transform: translateY(10px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }

        /* === CROSS-PLATFORM RESPONSIVENESS === */

        /* Laptop / Small Desktop (1025px - 1200px) */
        @media (max-width: 1200px) {
            .corporate-layout {
                gap: 40px;
                padding: 0 24px;
                grid-template-columns: 1.1fr 0.9fr;
            }
            .title-main-bold, .title-main-gradient {
                font-size: 3.2rem;
            }
        }

        /* Tablets & Large Phones (768px - 1024px) */
        @media (max-width: 1024px) {
            .hero-corporate {
                height: auto;
                min-height: 100vh;
                padding: 110px 0 60px;
            }
            .corporate-layout {
                grid-template-columns: 1fr;
                gap: 50px;
                text-align: center;
                justify-items: center;
            }
            .left-corporate-panel {
                align-items: center;
            }
            .corporate-slogan-box {
                align-items: center;
                border-left: none;
                border-bottom: 2px solid rgba(14, 165, 233, 0.3);
                padding-left: 0;
                padding-bottom: 20px;
            }
            .cta-corporate-group {
                justify-content: center;
            }
            .achievement-dashboard {
                max-width: 480px;
            }
        }

        /* Small Phones (320px - 767px) */
        @media (max-width: 767px) {
            .hero-corporate {
                padding: 100px 0 40px;
            }
            .corporate-layout {
                padding: 0 16px;
                gap: 40px;
            }
            .corporate-badge-capsule {
                padding: 8px 18px;
                margin-bottom: 24px;
            }
            .badge-capsule-text {
                font-size: 0.75rem;
                letter-spacing: 2px;
            }
            .title-upper-outline {
                letter-spacing: 4px;
                font-size: 0.85rem;
            }
            .title-main-bold, .title-main-gradient {
                font-size: 1.85rem;
                letter-spacing: -0.5px;
            }
            .title-main-gradient {
                margin-bottom: 24px;
                white-space: normal; /* Wrap text nicely on mobile */
            }
            .corporate-slogan-box {
                margin-bottom: 30px;
            }
            .slogan-strong {
                font-size: 1.15rem;
            }
            .slogan-desc {
                font-size: 0.82rem;
                padding: 0 8px;
            }
            .cta-corporate-group {
                flex-direction: column;
                align-items: center;
                gap: 12px;
            }
            .btn-corporate {
                width: 100%;
                max-width: 280px;
                padding: 14px 28px;
            }
            .achievement-dashboard {
                padding: 20px;
                border-radius: 18px;
            }
            .dashboard-header {
                margin-bottom: 16px;
                padding-bottom: 12px;
            }
            .stat-card-row {
                padding: 12px;
                gap: 12px;
            }
            .icon-circle {
                width: 38px;
                height: 38px;
                border-radius: 10px;
            }
            .stat-card-val {
                font-size: 1.1rem;
            }
            .stat-card-title {
                font-size: 0.7rem;
            }
            .scroll-indicator-corporate {
                display: none;
            }
        }
      `}} />

      <section className="hero-corporate">
        {/* Core Corporate Video Background */}
        <video 
          ref={videoRef}
          className="hero-video-render" 
          autoPlay 
          muted 
          loop 
          playsInline 
          preload="metadata"
          style={{ pointerEvents: 'none' }}
        >
          <source src="/Videos/video_bgr.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dynamic Dark Masks */}
        <div className="dark-grad-mask"></div>
        <div className="gradient-dark-overlay"></div>
        <div className="blueprint-lines"></div>
        
        {/* Soft Corporate Glow Spheres */}
        <div className="corporate-aura-glow aura-left"></div>
        <div className="corporate-aura-glow aura-right"></div>

        {/* Corporate Grid Layout */}
        <div className="corporate-layout">
          
          {/* LEFT PANEL: Branding & Slogans */}
          <div className="left-corporate-panel">
            {/* National Brand Verification Badge */}
            <div className="corporate-badge-capsule">
              <span className="green-pulse-dot"></span>
              <Building2 size={14} className="text-sky-400" />
              <span className="badge-capsule-text">{currentHero.badge}</span>
            </div>

            {/* Typography Stack */}
            <div className="title-upper-outline">{currentHero.titleOutline}</div>
            <h1 className="title-main-bold">{currentHero.titleFilled}</h1>
            <h1 className="title-main-gradient">{currentHero.titleGradient}</h1>

            {/* Slogans Container */}
            <div className="corporate-slogan-box">
              <div className={`slogan-card-body ${animClass === 'slogan-enter' ? 'slogan-show' : 'slogan-hide'}`}>
                <div className="slogan-strong">
                  {currentHero.slogans[sloganIdx].text}
                </div>
                {currentHero.slogans[sloganIdx].text !== currentHero.slogans[0].text && (
                  <div className="slogan-desc">
                    Hạ tầng kỹ thuật & Công trình viễn thông - CTC
                  </div>
                )}
              </div>
            </div>

            {/* Premium Corporate Actions */}
            <div className="cta-corporate-group">
              <button onClick={handleScrollToNext} className="btn-corporate btn-corporate-primary">
                <span>{currentHero.ctaPrimary}</span>
                <ArrowRight size={18} className="slide-arrow" />
              </button>

              <a 
                href="https://zalo.me/0915059666" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-corporate btn-corporate-secondary"
              >
                <MessageSquare size={18} className="spin-chat text-sky-400" />
                <span>{currentHero.ctaSecondary}</span>
              </a>
            </div>
          </div>

          {/* RIGHT PANEL: Elegant Achievements Dashboard */}
          <div className="right-corporate-panel">
            <div className="achievement-dashboard">
              
              {/* Dashboard Header */}
              <div className="dashboard-header">
                <Trophy size={16} className="text-sky-400 animate-pulse" />
                <span className="dashboard-header-text">
                  {currentHero.panelTitle}
                </span>
              </div>

              {/* Achievements Rows */}
              <div className="corporate-stats-rows">
                {/* Row 1 */}
                <div className="stat-card-row">
                  <div className="icon-circle">
                    <Trophy size={18} />
                  </div>
                  <div className="stat-card-data">
                    <div className="stat-card-title">{currentHero.stat1Title}</div>
                    <div className="stat-card-val">{currentHero.stat1Val}</div>
                    <div className="stat-card-desc">{currentHero.stat1Desc}</div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="stat-card-row">
                  <div className="icon-circle">
                    <Briefcase size={18} />
                  </div>
                  <div className="stat-card-data">
                    <div className="stat-card-title">{currentHero.stat2Title}</div>
                    <div className="stat-card-val">{currentHero.stat2Val}</div>
                    <div className="stat-card-desc">{currentHero.stat2Desc}</div>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="stat-card-row">
                  <div className="icon-circle">
                    <Globe size={18} />
                  </div>
                  <div className="stat-card-data">
                    <div className="stat-card-title">{currentHero.stat3Title}</div>
                    <div className="stat-card-val">{currentHero.stat3Val}</div>
                    <div className="stat-card-desc">{currentHero.stat3Desc}</div>
                  </div>
                </div>
              </div>

              {/* Corporate Partners Ticker */}
              <div className="partner-ticker-section">
                <div className="partner-ticker-label">
                  {currentHero.partnerTitle}
                </div>
                
                <div className="partner-ticker-track">
                  <div className="partner-ticker-items">
                    <span className="ticker-brand-name">VIETTEL</span>
                    <span className="ticker-brand-name">VNPT</span>
                    <span className="ticker-brand-name">MOBIFONE</span>
                    <span className="ticker-brand-name">EVN</span>
                    {/* Repeat for seamless infinite loop */}
                    <span className="ticker-brand-name">VIETTEL</span>
                    <span className="ticker-brand-name">VNPT</span>
                    <span className="ticker-brand-name">MOBIFONE</span>
                    <span className="ticker-brand-name">EVN</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator-corporate" onClick={handleScrollToNext}>
          <div className="mouse-shell">
            <div className="mouse-wheel"></div>
          </div>
          <span className="text-[9px] font-bold tracking-widest text-sky-400/50 uppercase mt-1">SCROLL</span>
        </div>
      </section>
    </>
  );
};

export default Hero;
