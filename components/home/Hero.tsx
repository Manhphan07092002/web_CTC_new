import React, { useEffect, useRef, useState } from 'react';
import { Building2, MessageSquare, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';
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

  // Multi-language data dictionary for the telemetry command center
  const heroData = {
    vi: {
      badge: 'Doanh nghiệp hàng đầu',
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
      telemetryTitle: 'MẠNG LƯỚI QUỐC GIA',
      telemetryStatus: 'Đang hoạt động ổn định',
      telemetryStat1: 'Hạ tầng viễn thông',
      telemetryStat1Val: '5,280+',
      telemetryStat2: 'Năng lượng tái tạo',
      telemetryStat2Val: '850+ MW',
      telemetryStat3: 'Đối tác chiến lược',
      telemetryStat3Val: 'Viettel, VNPT, Mobi, EVN'
    },
    en: {
      badge: 'Leading Enterprise',
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
      telemetryTitle: 'NATIONAL GRID STATUS',
      telemetryStatus: 'SYSTEM OPERATING STABLY',
      telemetryStat1: 'Telecom Infrastructure',
      telemetryStat1Val: '5,280+',
      telemetryStat2: 'Renewable Energy',
      telemetryStat2Val: '850+ MW',
      telemetryStat3: 'Strategic Partners',
      telemetryStat3Val: 'Viettel, VNPT, Mobi, EVN'
    },
    ko: {
      badge: '선도 기업',
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
      telemetryTitle: '국가 네트워크 상태',
      telemetryStatus: '시스템 안정 운영 중',
      telemetryStat1: '통신 인프라',
      telemetryStat1Val: '5,280+',
      telemetryStat2: '신재생 에너지',
      telemetryStat2Val: '850+ MW',
      telemetryStat3: '주요 파트너',
      telemetryStat3Val: 'Viettel, VNPT, Mobi, EVN'
    },
    ja: {
      badge: 'リーディング企業',
      titleOutline: '建設株式会社',
      titleFilled: '中部ポスト＆電気通信',
      titleGradient: '建設',
      slogans: [
        { text: '"未来を繋ぐ - 信頼を築く"', isBold: true },
        { text: '通信インフラ建設のプロフェッショナル' },
        { text: 'デジタル技術と通信のパイオニア' },
        { text: '主要企業の信頼できるパートナー' },
        { text: '30年以上の顧客サービスの経験' }
      ],
      ctaPrimary: '詳細を見る',
      ctaSecondary: 'Zaloでお問い合わせ',
      telemetryTitle: '国家ネットワーク監視',
      telemetryStatus: 'システム稼働中 - 安定',
      telemetryStat1: '通信インフラ実績',
      telemetryStat1Val: '5,280+',
      telemetryStat2: '再生可能エネルギー',
      telemetryStat2Val: '850+ MW',
      telemetryStat3: '主要パートナー',
      telemetryStat3Val: 'Viettel, VNPT, Mobi, EVN'
    },
    zh: {
      badge: '领先企业',
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
      telemetryTitle: '国家网路监控',
      telemetryStatus: '系统运行稳定',
      telemetryStat1: '通信基础设施',
      telemetryStat1Val: '5,280+',
      telemetryStat2: '可再生能源',
      telemetryStat2Val: '850+ MW',
      telemetryStat3: '战略合作伙伴',
      telemetryStat3Val: 'Viettel, VNPT, Mobi, EVN'
    },
    de: {
      badge: 'Führendes Unternehmen',
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
      telemetryTitle: 'NETZWERKSTATUS',
      telemetryStatus: 'SYSTEM LÄUFT STABIL',
      telemetryStat1: 'Telekom-Infrastruktur',
      telemetryStat1Val: '5,280+',
      telemetryStat2: 'Erneuerbare Energie',
      telemetryStat2Val: '850+ MW',
      telemetryStat3: 'Strategische Partner',
      telemetryStat3Val: 'Viettel, VNPT, Mobi, EVN'
    }
  };

  const currentLang = language as keyof typeof heroData;
  const currentHero = heroData[currentLang] || heroData.vi;

  // React State for slogan rotation
  const [sloganIdx, setSloganIdx] = useState(0);
  const [animClass, setAnimClass] = useState('slogan-enter');

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimClass('slogan-exit');
      setTimeout(() => {
        setSloganIdx((prev) => (prev + 1) % currentHero.slogans.length);
        setAnimClass('slogan-enter');
      }, 500);
    }, 4500);
    
    return () => clearInterval(interval);
  }, [currentHero.slogans.length]);

  const handleScrollToNext = () => {
    const nextSection = document.querySelector('#home-stats') || document.querySelector('.py-20');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Video performance control
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
        /* === 2027 BREAKTHROUGH ASYMMETRIC COMMAND CENTER HERO === */
        .hero-breakthrough {
            position: relative;
            width: 100%;
            height: 100vh;
            min-height: 700px;
            overflow: hidden;
            background-color: #020617;
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
            opacity: 0.78;
        }

        .dark-grad-mask {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 30% 30%, rgba(15, 23, 42, 0.4) 0%, #020617 80%);
            z-index: 2;
        }

        .gradient-dark-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to bottom,
                rgba(2, 6, 23, 0.5) 0%,
                rgba(2, 6, 23, 0.8) 50%,
                #020617 100%
            );
            z-index: 2;
        }

        /* Perspective 3D Neon Grid */
        .perspective-neon-grid {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 50%;
            background-image: 
                linear-gradient(rgba(14, 165, 233, 0.08) 1.5px, transparent 1.5px),
                linear-gradient(90deg, rgba(14, 165, 233, 0.08) 1.5px, transparent 1.5px);
            background-size: 50px 50px;
            transform: perspective(400px) rotateX(75deg);
            transform-origin: bottom;
            z-index: 3;
            opacity: 0.6;
            pointer-events: none;
            mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
            -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
        }

        /* Neon cyber pulses on floor */
        .grid-cyber-glow {
            position: absolute;
            bottom: -50px;
            left: 50%;
            transform: translateX(-50%);
            width: 1200px;
            height: 350px;
            background: radial-gradient(ellipse at center, rgba(14, 165, 233, 0.12) 0%, transparent 60%);
            filter: blur(50px);
            z-index: 2;
            pointer-events: none;
        }

        /* Double glow meshes */
        .cyber-mesh-glow-left {
            position: absolute;
            top: -10%;
            left: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%);
            filter: blur(80px);
            z-index: 2;
            pointer-events: none;
            animation: breatheLight 10s ease-in-out infinite alternate;
        }
        .cyber-mesh-glow-right {
            position: absolute;
            bottom: 10%;
            right: -10%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
            filter: blur(100px);
            z-index: 2;
            pointer-events: none;
            animation: breatheLight 14s ease-in-out infinite alternate-reverse;
        }

        /* Container & Asymmetric Split Layout */
        .command-center-layout {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 32px;
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 60px;
            align-items: center;
        }

        /* LEFT PANEL: Typographic Core */
        .left-center-panel {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        /* Futuristic Capsule Badge */
        .futuristic-capsule {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(56, 189, 248, 0.25);
            border-radius: 100px;
            padding: 10px 24px;
            margin-bottom: 30px;
            box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.6), 
                        inset 0 1px 1px rgba(255, 255, 255, 0.05),
                        0 0 12px rgba(14, 165, 233, 0.1);
            transform: scale(0.95);
            animation: badgeEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .futuristic-capsule:hover {
            transform: scale(0.98) translateY(-2px);
            border-color: rgba(56, 189, 248, 0.5);
            box-shadow: 0 15px 30px -10px rgba(14, 165, 233, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }
        .radar-pulse-ring {
            width: 8px;
            height: 8px;
            background-color: #10b981;
            border-radius: 50%;
            position: relative;
        }
        .radar-pulse-ring::after {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 1.5px solid #10b981;
            animation: pulseWaveAnim 2s infinite ease-out;
        }
        .capsule-badge-text {
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #f1f5f9;
        }

        /* 3D architectural Outlined + Filled Text mix */
        .cyber-outline-text {
            font-family: 'Montserrat', sans-serif;
            font-size: clamp(0.9rem, 2.5vw, 1.45rem);
            font-weight: 600;
            letter-spacing: 8px;
            text-transform: uppercase;
            margin-bottom: 8px;
            color: transparent;
            -webkit-text-stroke: 1.2px rgba(255, 255, 255, 0.4);
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
            animation: slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        
        .cyber-filled-text {
            font-family: 'Montserrat', sans-serif;
            font-size: clamp(2.2rem, 5.2vw, 4.4rem);
            font-weight: 900;
            line-height: 1.1;
            text-transform: uppercase;
            letter-spacing: -2px;
            color: #ffffff;
            margin-bottom: 6px;
            text-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            animation: slideUpFade 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        .cyber-gradient-text {
            font-family: 'Montserrat', sans-serif;
            font-size: clamp(2.2rem, 5.2vw, 4.4rem);
            font-weight: 900;
            line-height: 1.1;
            text-transform: uppercase;
            letter-spacing: -2px;
            background: linear-gradient(135deg, #38bdf8 0%, #0284c7 60%, #6366f1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 35px;
            filter: drop-shadow(0 15px 30px rgba(14, 165, 233, 0.3));
            animation: slideUpFade 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }

        /* Interactive slogan display */
        .creative-slogan-wrapper {
            min-height: 70px;
            margin-bottom: 45px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            border-left: 2px solid rgba(56, 189, 248, 0.3);
            padding-left: 24px;
        }
        .slogan-anim-card {
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .slogan-fade-in {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
        }
        .slogan-fade-out {
            opacity: 0;
            transform: translateX(-15px);
            filter: blur(5px);
            position: absolute;
        }
        .slogan-bold-line {
            font-size: clamp(1.2rem, 2.2vw, 1.65rem);
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.2px;
            margin-bottom: 4px;
        }
        .slogan-desc-line {
            font-size: clamp(0.9rem, 1.8vw, 1.05rem);
            font-weight: 500;
            color: #94a3b8;
        }

        /* Glass buttons styling */
        .cta-center-group {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            width: 100%;
            animation: slideUpFade 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }

        .btn-futuristic {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 16px 36px;
            border-radius: 14px; /* Squircle style */
            font-size: 0.95rem;
            font-weight: 700;
            letter-spacing: 0.8px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
            text-transform: uppercase;
        }

        .btn-futuristic-primary {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%);
            color: #ffffff;
            border: 1px solid rgba(56, 189, 248, 0.35);
            box-shadow: 0 12px 30px -10px rgba(14, 165, 233, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }
        .btn-futuristic-primary::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transform: translateX(-150%) skewX(-20deg);
            transition: transform 0.8s ease;
        }
        .btn-futuristic-primary:hover {
            transform: translateY(-4px) scale(1.04);
            box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.7), 0 0 15px rgba(56, 189, 248, 0.4);
            border-color: rgba(56, 189, 248, 0.6);
        }
        .btn-futuristic-primary:hover::before {
            transform: translateX(150%) skewX(-20deg);
        }
        .btn-futuristic-primary:hover .slide-arrow {
            transform: translateX(6px);
        }
        .slide-arrow {
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-futuristic-secondary {
            background: rgba(255, 255, 255, 0.02);
            color: #f1f5f9;
            border: 1.5px solid rgba(56, 189, 248, 0.25);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08);
        }
        .btn-futuristic-secondary:hover {
            transform: translateY(-4px) scale(1.04);
            background: rgba(14, 165, 233, 0.1);
            border-color: rgba(56, 189, 248, 0.6);
            color: #ffffff;
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
        }
        .btn-futuristic-secondary:hover .spin-chat {
            transform: scale(1.2);
            filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.8));
        }
        .spin-chat {
            transition: all 0.3s ease;
        }

        /* RIGHT PANEL: Command Center Telemetry Board */
        .right-telemetry-panel {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: slideInRightBlur 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .telemetry-card {
            width: 100%;
            max-width: 440px;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(3, 7, 18, 0.75) 100%);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(56, 189, 248, 0.18);
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 
                        inset 0 1px 1px rgba(255, 255, 255, 0.05),
                        0 0 40px rgba(14, 165, 233, 0.05);
            position: relative;
            overflow: hidden;
            transition: all 0.4s ease;
        }
        .telemetry-card:hover {
            border-color: rgba(56, 189, 248, 0.35);
            box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.85), 
                        inset 0 1px 1px rgba(255, 255, 255, 0.1),
                        0 0 40px rgba(14, 165, 233, 0.15);
            transform: translateY(-5px);
        }

        /* Card glowing corners */
        .card-corner-glow {
            position: absolute;
            top: 0;
            right: 0;
            width: 80px;
            height: 80px;
            background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.25) 0%, transparent 70%);
            pointer-events: none;
        }

        /* Card Header & Radar sweep */
        .telemetry-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 16px;
            margin-bottom: 24px;
        }
        .system-status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .telemetry-radar-dot {
            width: 6px;
            height: 6px;
            background-color: #38bdf8;
            border-radius: 50%;
            animation: radarPing 1.5s infinite;
        }

        /* Interactive Oscilloscope Waveform */
        .oscilloscope-wave-container {
            margin-bottom: 24px;
            background: rgba(3, 7, 18, 0.5);
            border-radius: 12px;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .wave-grid-line {
            stroke-dasharray: 2 4;
        }
        .oscilloscope-path {
            stroke-dasharray: 120;
            animation: waveMotion 2.5s linear infinite;
        }

        /* Telemetry Stats Rows */
        .telemetry-stats-list {
            display: flex;
            flex-direction: column;
            gap: 18px;
        }
        .telemetry-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .telemetry-row-label {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.88rem;
            color: #94a3b8;
            font-weight: 500;
        }
        .telemetry-row-value {
            font-size: 1.05rem;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.2px;
        }

        /* Scrolling partners logo track inside telemetry */
        .telemetry-partners-scroller {
            margin-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .partner-scroller-track {
            display: flex;
            gap: 16px;
            overflow: hidden;
            position: relative;
            white-space: nowrap;
            mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
        }
        .partner-scroller-items {
            display: inline-flex;
            gap: 20px;
            animation: infiniteTicker 15s linear infinite;
        }
        .scroller-item {
            font-size: 0.78rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Mouse Scroll Icon 2027 */
        .scroll-indicator-breakthrough {
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
        .scroller-mouse-shell {
            width: 22px;
            height: 36px;
            border: 2px solid rgba(255, 255, 255, 0.35);
            border-radius: 100px;
            display: flex;
            justify-content: center;
            padding-top: 6px;
        }
        .scroller-mouse-wheel {
            width: 4px;
            height: 8px;
            background-color: #38bdf8;
            border-radius: 100px;
            animation: scrollWheelAnim 2s infinite;
        }

        /* Animation Keyframes definitions */
        @keyframes pulseWaveAnim {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes radarPing {
            0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.6); }
            70% { box-shadow: 0 0 0 10px rgba(56, 189, 248, 0); }
            100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
        }
        @keyframes breatheLight {
            0% { transform: scale(1) translate(0, 0); opacity: 0.5; }
            100% { transform: scale(1.1) translate(30px, -20px); opacity: 0.7; }
        }
        @keyframes waveMotion {
            0% { stroke-dashoffset: 120; }
            100% { stroke-dashoffset: 0; }
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

        /* === CROSS-PLATFORM RESPONSIVENESS OVERRIDES === */

        /* Laptop / Small Desktop (1025px - 1200px) */
        @media (max-width: 1200px) {
            .command-center-layout {
                gap: 30px;
                padding: 0 24px;
            }
            .cyber-filled-text, .cyber-gradient-text {
                font-size: 3.5rem;
            }
            .telemetry-card {
                padding: 24px;
            }
        }

        /* Tablets & Large Phones (768px - 1024px) */
        @media (max-width: 1024px) {
            .hero-breakthrough {
                height: auto;
                min-height: 100vh;
                padding: 100px 0 60px;
            }
            .command-center-layout {
                grid-template-columns: 1fr;
                gap: 50px;
                text-align: center;
                justify-items: center;
            }
            .left-center-panel {
                align-items: center;
            }
            .creative-slogan-wrapper {
                align-items: center;
                border-left: none;
                border-bottom: 2px solid rgba(56, 189, 248, 0.3);
                padding-left: 0;
                padding-bottom: 20px;
            }
            .cta-center-group {
                justify-content: center;
            }
            .telemetry-card {
                max-width: 480px;
            }
        }

        /* Small Phones (320px - 767px) */
        @media (max-width: 767px) {
            .hero-breakthrough {
                padding: 90px 0 40px;
            }
            .command-center-layout {
                padding: 0 16px;
                gap: 40px;
            }
            .futuristic-capsule {
                padding: 8px 18px;
                margin-bottom: 24px;
            }
            .capsule-badge-text {
                font-size: 0.75rem;
                letter-spacing: 2px;
            }
            .cyber-outline-text {
                letter-spacing: 4px;
                font-size: 0.85rem;
            }
            .cyber-filled-text, .cyber-gradient-text {
                font-size: 2rem;
                letter-spacing: -0.5px;
            }
            .cyber-gradient-text {
                margin-bottom: 24px;
            }
            .creative-slogan-wrapper {
                margin-bottom: 30px;
            }
            .slogan-bold-line {
                font-size: 1.15rem;
            }
            .slogan-desc-line {
                font-size: 0.82rem;
                padding: 0 8px;
            }
            .cta-center-group {
                flex-direction: column;
                align-items: center;
                gap: 12px;
            }
            .btn-futuristic {
                width: 100%;
                max-width: 280px;
                padding: 14px 28px;
            }
            .telemetry-card {
                padding: 20px;
                border-radius: 18px;
            }
            .telemetry-header {
                margin-bottom: 16px;
                padding-bottom: 12px;
            }
            .telemetry-row-label {
                font-size: 0.8rem;
            }
            .telemetry-row-value {
                font-size: 0.95rem;
            }
            .scroll-indicator-breakthrough {
                display: none;
            }
        }
      `}} />

      <section className="hero-breakthrough">
        {/* Telecommunication & Infrastructure Background Video */}
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

        {/* Ambient Overlay Masks */}
        <div className="dark-grad-mask"></div>
        <div className="gradient-dark-overlay"></div>
        <div className="perspective-neon-grid"></div>
        <div className="grid-cyber-glow"></div>
        
        {/* Glow Spheres */}
        <div className="cyber-mesh-glow-left"></div>
        <div className="cyber-mesh-glow-right"></div>

        {/* Dynamic Command Layout */}
        <div className="command-center-layout">
          
          {/* LEFT COMMAND PANEL: Typography & Brand info */}
          <div className="left-center-panel">
            {/* Interactive Status Badge */}
            <div className="futuristic-capsule">
              <span className="radar-pulse-ring"></span>
              <Building2 size={14} className="text-sky-400" />
              <span className="capsule-badge-text">{currentHero.badge}</span>
            </div>

            {/* Architectural Outline & Solid Typography */}
            <div className="cyber-outline-text">{currentHero.titleOutline}</div>
            <h1 className="cyber-filled-text">{currentHero.titleFilled}</h1>
            <h1 className="cyber-gradient-text">{currentHero.titleGradient}</h1>

            {/* Slogan ticker */}
            <div className="creative-slogan-wrapper">
              <div className={`slogan-anim-card ${animClass === 'slogan-enter' ? 'slogan-fade-in' : 'slogan-fade-out'}`}>
                <div className="slogan-bold-line">
                  {currentHero.slogans[sloganIdx].text}
                </div>
                {currentHero.slogans[sloganIdx].text !== currentHero.slogans[0].text && (
                  <div className="slogan-desc-line">
                    Chuyên gia hạ tầng mạng - CTC Telecom
                  </div>
                )}
              </div>
            </div>

            {/* Modern Interactive Buttons */}
            <div className="cta-center-group">
              <button onClick={handleScrollToNext} className="btn-futuristic btn-futuristic-primary">
                <span>{currentHero.ctaPrimary}</span>
                <ArrowRight size={18} className="slide-arrow" />
              </button>

              <a 
                href="https://zalo.me/0915059666" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-futuristic btn-futuristic-secondary"
              >
                <MessageSquare size={18} className="spin-chat text-sky-400" />
                <span>{currentHero.ctaSecondary}</span>
              </a>
            </div>
          </div>

          {/* RIGHT COMMAND PANEL: High-Tech Telemetry Dashboard */}
          <div className="right-telemetry-panel">
            <div className="telemetry-card">
              <div className="card-corner-glow"></div>
              
              {/* Telemetry Title */}
              <div className="telemetry-header">
                <div className="system-status-indicator">
                  <span className="telemetry-radar-dot"></span>
                  <span className="text-xs font-bold tracking-wider text-sky-400 uppercase">
                    {currentHero.telemetryTitle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-full">
                  <ShieldCheck size={12} className="text-sky-400" />
                  <span className="text-[10px] font-bold tracking-wider text-sky-300 uppercase">
                    ONLINE
                  </span>
                </div>
              </div>

              {/* Oscilloscope Electric Grid Wave */}
              <div className="oscilloscope-wave-container">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-1">
                    <Activity size={12} className="text-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Oscilloscope Feed
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400/80 animate-pulse">
                    {currentHero.telemetryStatus}
                  </span>
                </div>
                
                {/* SVG Oscilloscope wave */}
                <svg viewBox="0 0 100 25" className="w-full h-10">
                  <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="0.5" />
                  <path 
                    d="M0,12.5 H25 L27,6 L29,19 L31,3 L33,21 L35,10 L37,14 L39,12.5 H100" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="1.2" 
                    className="oscilloscope-path"
                  />
                </svg>
              </div>

              {/* Telemetry parameters */}
              <div className="telemetry-stats-list">
                <div className="telemetry-row">
                  <div className="telemetry-row-label">
                    <Building2 size={16} className="text-sky-400" />
                    <span>{currentHero.telemetryStat1}</span>
                  </div>
                  <div className="telemetry-row-value text-sky-300">
                    {currentHero.telemetryStat1Val}
                  </div>
                </div>

                <div className="telemetry-row">
                  <div className="telemetry-row-label">
                    <Zap size={16} className="text-amber-400" />
                    <span>{currentHero.telemetryStat2}</span>
                  </div>
                  <div className="telemetry-row-value text-amber-300">
                    {currentHero.telemetryStat2Val}
                  </div>
                </div>
              </div>

              {/* Infinite Partners scrolling logo loop */}
              <div className="telemetry-partners-scroller">
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  {currentHero.telemetryStat3}
                </div>
                
                <div className="partner-scroller-track">
                  <div className="partner-scroller-items">
                    <span className="scroller-item">VIETTEL</span>
                    <span className="scroller-item">VNPT</span>
                    <span className="scroller-item">MOBIFONE</span>
                    <span className="scroller-item">EVN</span>
                    {/* Repeat for seamless loop */}
                    <span className="scroller-item">VIETTEL</span>
                    <span className="scroller-item">VNPT</span>
                    <span className="scroller-item">MOBIFONE</span>
                    <span className="scroller-item">EVN</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator-breakthrough" onClick={handleScrollToNext}>
          <div className="scroller-mouse-shell">
            <div className="scroller-mouse-wheel"></div>
          </div>
          <span className="text-[9px] font-bold tracking-widest text-sky-400/50 uppercase">SCROLL</span>
        </div>
      </section>
    </>
  );
};

export default Hero;
