import React, { useEffect, useRef, useState } from 'react';
import { Building2, Info, MessageSquare, ArrowDown, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Hero: React.FC = () => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Preload video and load futuristic Google Fonts dynamically
  useEffect(() => {
    // Preload video
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = '/Videos/video_bgr.mp4';
    link.type = 'video/mp4';
    link.media = '(min-width: 768px)';
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);

    // Load Montserrat and Be Vietnam Pro fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontLink);
    };
  }, []);

  // Multi-language corporate data mapping
  const heroData = {
    vi: {
      badge: 'Doanh nghiệp hàng đầu',
      titlePrimary: 'CÔNG TY CỔ PHẦN',
      titleSecondary: 'XÂY LẮP BƯU ĐIỆN MIỀN TRUNG',
      slogans: [
        { text: '"Kết nối tương lai - Xây dựng niềm tin"', isBold: true, isMain: true },
        { text: 'Chuyên nghiệp trong xây dựng hạ tầng viễn thông', description: 'Kiến tạo mạng lưới kết nối số hiện đại trên khắp cả nước.' },
        { text: 'Tiên phong trong công nghệ số và truyền thông', description: 'Đột phá giải pháp công nghệ thông minh thời đại mới.' },
        { text: 'Đối tác tin cậy của các doanh nghiệp hàng đầu', description: 'Đồng hành bền vững cùng các đơn vị viễn thông lớn tại Việt Nam.' },
        { text: 'Hơn 30 năm kinh nghiệm phục vụ khách hàng', description: 'Uy tín tạo dựng từ chất lượng công trình và dịch vụ tận tâm.' }
      ],
      ctaPrimary: 'Tìm hiểu thêm',
      ctaSecondary: 'Liên hệ Zalo'
    },
    en: {
      badge: 'Leading Enterprise',
      titlePrimary: 'CENTRAL VIETNAM POSTS & TELECOMMUNICATIONS',
      titleSecondary: 'CONSTRUCTION JOINT STOCK COMPANY',
      slogans: [
        { text: '"Connecting the future - Building trust"', isBold: true, isMain: true },
        { text: 'Professional in telecommunications infrastructure construction', description: 'Creating modern digital connectivity networks nationwide.' },
        { text: 'Pioneering in digital technology and communications', description: 'Breaking through smart technology solutions for the new era.' },
        { text: 'Reliable partner of leading enterprises', description: 'Long-term partnership with major telecom operators in Vietnam.' },
        { text: 'Over 30 years of experience serving customers', description: 'Trust built from superior project quality and dedicated services.' }
      ],
      ctaPrimary: 'Learn More',
      ctaSecondary: 'Contact Zalo'
    },
    ko: {
      badge: '선도 기업',
      titlePrimary: '중부 포스트 및 통신',
      titleSecondary: '건설 주식 회사',
      slogans: [
        { text: '"미래를 연결하고 신뢰를 구축합니다"', isBold: true, isMain: true },
        { text: '통신 인프라 건설 전문', description: '전국에 현대적인 디지털 연결 네트워크 구축.' },
        { text: '디지털 기술 및 통신 개척자', description: '새로운 시대를 위한 스마트 기술 솔루션 돌파.' },
        { text: '주요 기업의 신뢰할 수 있는 파트너', description: '베트남 대형 통신사들과의 지속 가능한 파트너십.' },
        { text: '고객 서비스 분야 30년 이상의 경험', description: '우수한 공사 품질과 헌신적인 서비스로 다져진 신뢰.' }
      ],
      ctaPrimary: '더 알아보기',
      ctaSecondary: 'Zalo 문의'
    },
    ja: {
      badge: 'リーディング企業',
      titlePrimary: '中部ポスト＆電気通信',
      titleSecondary: '建設株式会社',
      slogans: [
        { text: '"未来を繋ぐ - 信頼を築く"', isBold: true, isMain: true },
        { text: '通信インフラ建設のプロフェッショナル', description: '全国に最先端のデジタル接続ネットワークを敷設します。' },
        { text: 'デジタル技術と通信のパイオニア', description: '新時代に向けたスマート技術ソリューションの開発。' },
        { text: '主要企業の信頼できるパートナー', description: 'ベ트ナムの主要通信キャリアとの揺るぎない信頼関係。' },
        { text: '30年以上の顧客サービスの経験', description: '優れた施工品質と真摯なサービスから生まれた信頼。' }
      ],
      ctaPrimary: '詳細を見る',
      ctaSecondary: 'Zaloでお問い合わせ'
    },
    zh: {
      badge: '领先企业',
      titlePrimary: '越南中部邮电',
      titleSecondary: '建设股份有限公司',
      slogans: [
        { text: '"连接未来 - 建立信任"', isBold: true, isMain: true },
        { text: '通信基础设施建设专业化', description: '在全国范围内构建现代化的数字互联网络。' },
        { text: '数字技术与通信领域的先锋', description: '突破新时代的智能科技解决方案。' },
        { text: '各大企业信赖的合作伙伴', description: '与越南大型电信运营商长期携手合作。' },
        { text: '超过 30 年服务客户经验', description: '卓越工程品质和悉心服务铸就的信任。' }
      ],
      ctaPrimary: '了解更多',
      ctaSecondary: '联系 Zalo'
    },
    de: {
      badge: 'Führendes Unternehmen',
      titlePrimary: 'CENTRAL VIETNAM POSTS & TELECOMMUNICATIONS',
      titleSecondary: 'CONSTRUCTION AKTIENGESELLSCHAFT',
      slogans: [
        { text: '"Zukunft verbinden - Vertrauen aufbauen"', isBold: true, isMain: true },
        { text: 'Professionell im Bau von Telekommunikationsinfrastruktur', description: 'Aufbau moderner digitaler Verbindungsnetze im ganzen Land.' },
        { text: 'Wegweisend in digitaler Technologie und Kommunikation', description: 'Durchbruch smarter Technologielösungen für das neue Zeitalter.' },
        { text: 'Zuverlässiger Partner führender Unternehmen', description: 'Langfristige Partnerschaft mit großen Telekommunikationsbetreibern in Vietnam.' },
        { text: 'Über 30 Jahre Erfahrung im Kundendienst', description: 'Vertrauen gewachsen aus erstklassiger Bauqualität und engagiertem Service.' }
      ],
      ctaPrimary: 'Mehr erfahren',
      ctaSecondary: 'Zalo Kontakt'
    }
  };

  const currentLang = language as keyof typeof heroData;
  const currentHero = heroData[currentLang] || heroData.vi;

  // React State for Smooth Slogan Slider (eliminates absolute layout bugs on mobile)
  const [sloganIdx, setSloganIdx] = useState(0);
  const [animClass, setAnimClass] = useState('slogan-enter');

  useEffect(() => {
    const interval = setInterval(() => {
      // Exit animation
      setAnimClass('slogan-exit');
      
      // Change index after exit transition finishes
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

  // Video performance optimizations
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
        /* === 2027 TRENDSETTING HERO STYLES === */
        .hero-2027-wrapper {
            position: relative;
            width: 100%;
            height: 100vh;
            min-height: 650px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #030712; /* Fallback dark bg */
        }

        /* 100% screen video background */
        .hero-video-bg {
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
            opacity: 0.85;
            transition: opacity 1s ease;
        }

        /* Gradient mask for extreme depth and contrast */
        .hero-overlay-mask {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                135deg,
                rgba(15, 23, 42, 0.9) 0%,
                rgba(8, 47, 73, 0.75) 35%,
                rgba(3, 7, 18, 0.85) 70%,
                rgba(15, 23, 42, 0.95) 100%
            );
            z-index: 2;
        }

        /* Cyber mesh grid overlays */
        .cyber-grid {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1.5px, transparent 1.5px);
            background-size: 40px 40px;
            z-index: 3;
            opacity: 0.4;
            pointer-events: none;
        }

        /* Ambient Glow Spheres */
        .glowing-glow {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
            z-index: 2;
            pointer-events: none;
            opacity: 0.6;
        }
        .glow-1 {
            top: 15%;
            left: 10%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, transparent 70%);
            animation: pulseGlow 12s ease-in-out infinite alternate;
        }
        .glow-2 {
            bottom: 10%;
            right: 15%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
            animation: pulseGlow 16s ease-in-out infinite alternate-reverse;
        }

        /* Content layer */
        .hero-content-inner {
            position: relative;
            z-index: 10;
            text-align: center;
            color: #f3f4f6;
            max-width: 1100px;
            width: 100%;
            padding: 0 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        /* Glassmorphic Brand Badge */
        .brand-badge-wrapper {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 100px;
            padding: 10px 24px;
            margin-bottom: 28px;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
            transform: scale(0.95);
            animation: scaleInBadge 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .brand-badge-wrapper:hover {
            transform: scale(1) translateY(-3px);
            border-color: rgba(56, 189, 248, 0.3);
            box-shadow: 0 15px 35px -10px rgba(56, 189, 248, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15);
        }
        .pulse-dot {
            width: 8px;
            height: 8px;
            background-color: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 10px #10b981;
            animation: badgeDotPulse 2s infinite;
        }
        .badge-text {
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            background: linear-gradient(to right, #ffffff, #e2e8f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* 2027 Typography: Giant text gradients & text outlines */
        .brand-title-upper {
            font-family: 'Montserrat', 'Be Vietnam Pro', sans-serif;
            font-size: clamp(0.85rem, 2vw, 1.15rem);
            font-weight: 600;
            letter-spacing: 6px;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 12px;
            animation: revealUpBlur 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        .brand-title-main {
            font-family: 'Montserrat', 'Be Vietnam Pro', sans-serif;
            font-size: clamp(1.5rem, 3.2vw, 2.8rem); /* Giảm kích thước */
            font-weight: 800;
            line-height: 1.2;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 40%, #bae6fd 75%, #38bdf8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4));
            animation: revealUpBlur 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
            transition: all 0.5s ease;
            white-space: nowrap; /* Giữ chữ trên một dòng trên màn hình lớn */
        }

        /* Dynamic slogan container */
        .slogan-slider-container {
            min-height: 100px;
            margin-bottom: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 800px;
        }

        /* Fluid typography slide transitions */
        .slogan-slide {
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .slogan-enter {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
            filter: blur(8px);
        }
        .slogan-exit {
            opacity: 0;
            transform: translateY(-24px) scale(0.96);
            filter: blur(8px);
            position: absolute;
        }
        .slogan-active {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
        }

        .slogan-text-heading {
            font-size: clamp(1.25rem, 2.5vw, 1.85rem);
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 8px;
            text-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
            letter-spacing: -0.2px;
        }
        .slogan-text-desc {
            font-size: clamp(0.9rem, 1.8vw, 1.15rem);
            font-weight: 450;
            color: #94a3b8;
            max-width: 650px;
            line-height: 1.5;
        }

        /* High-end CTA buttons */
        .cta-buttons-container {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            width: 100%;
            animation: revealUpBlur 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }

        .btn-modern {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 16px 36px;
            border-radius: 14px; /* Sleek Squircle geometry */
            font-size: 0.95rem;
            font-weight: 700;
            letter-spacing: 0.8px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
            box-shadow: 0 8px 25px -10px rgba(0, 0, 0, 0.4);
            text-transform: uppercase;
        }

        /* Glowing blue gradient CTA */
        .btn-modern-primary {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0c4a6e 100%);
            color: #ffffff;
            border: 1px solid rgba(56, 189, 248, 0.35);
            box-shadow: 0 12px 30px -10px rgba(14, 165, 233, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }
        
        /* Gloss glare shine sweep animation */
        .btn-modern-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -150%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
            transform: skewX(-25deg);
            transition: 0.75s ease;
        }
        
        .btn-modern-primary:hover {
            transform: translateY(-4px) scale(1.04);
            box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.65), 0 0 15px rgba(56, 189, 248, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.35);
            border-color: rgba(56, 189, 248, 0.6);
        }
        
        .btn-modern-primary:hover::before {
            left: 150%;
        }

        .btn-modern-primary:hover .arrow-icon {
            transform: translateX(6px);
        }

        .arrow-icon {
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Glassmorphic border CTA */
        .btn-modern-secondary {
            background: rgba(255, 255, 255, 0.02);
            color: #f1f5f9;
            border: 1.5px solid rgba(56, 189, 248, 0.25);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08);
        }
        
        .btn-modern-secondary:hover {
            transform: translateY(-4px) scale(1.04);
            background: rgba(14, 165, 233, 0.1);
            border-color: rgba(56, 189, 248, 0.6);
            color: #ffffff;
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15);
        }

        .btn-modern-secondary:hover .chat-icon {
            transform: scale(1.2);
            filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.8));
        }

        .chat-icon {
            transition: all 0.3s ease;
        }

        /* Pulsing indicator loop */
        .scroll-indicator-2027 {
            position: absolute;
            bottom: 35px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            animation: bounceScroll 2.4s infinite;
        }
        .indicator-mouse {
            width: 24px;
            height: 38px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 100px;
            display: flex;
            justify-content: center;
            padding-top: 6px;
        }
        .indicator-dot {
            width: 4px;
            height: 8px;
            background-color: #38bdf8;
            border-radius: 100px;
            animation: scrollDotAnim 2s infinite;
        }

        /* Particles Layer */
        .cyber-particles {
            position: absolute;
            inset: 0;
            z-index: 3;
            pointer-events: none;
            overflow: hidden;
        }
        .cyber-particle {
            position: absolute;
            background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 80%);
            border-radius: 50%;
            animation: particleFloatUp 12s linear infinite;
        }
        .cyber-particle:nth-child(1) { width: 120px; height: 120px; left: 15%; animation-delay: 0s; animation-duration: 15s; }
        .cyber-particle:nth-child(2) { width: 80px; height: 80px; left: 45%; animation-delay: 3s; animation-duration: 12s; }
        .cyber-particle:nth-child(3) { width: 140px; height: 140px; left: 75%; animation-delay: 6s; animation-duration: 18s; }

        /* Animation Declarations */
        @keyframes scaleInBadge {
            0% { opacity: 0; transform: scale(0.85) translateY(10px); }
            100% { opacity: 1; transform: scale(0.95) translateY(0); }
        }
        @keyframes revealUpBlur {
            0% { opacity: 0; transform: translateY(30px); filter: blur(12px); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes badgeDotPulse {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes pulseGlow {
            0% { transform: scale(1) translate(0, 0); opacity: 0.5; }
            100% { transform: scale(1.15) translate(30px, -30px); opacity: 0.7; }
        }
        @keyframes bounceScroll {
            0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
            40% { transform: translateX(-50%) translateY(-6px); }
            60% { transform: translateX(-50%) translateY(-3px); }
        }
        @keyframes scrollDotAnim {
            0% { transform: translateY(0); opacity: 1; }
            80% { transform: translateY(12px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes particleFloatUp {
            0% { transform: translateY(105vh) scale(0.9); }
            100% { transform: translateY(-150px) scale(1.1); }
        }

        /* === ULTIMATE CROSS-PLATFORM RESPONSIVENESS === */
        
        /* Ultra Widescreen Displays (1600px+) */
        @media (min-width: 1600px) {
            .hero-content-inner {
                max-width: 1300px;
            }
            .brand-title-main {
                font-size: 3.4rem; /* Giảm size để tránh xuống dòng */
                margin-bottom: 35px;
            }
            .btn-modern {
                padding: 20px 48px;
                font-size: 1.1rem;
            }
        }

        /* Medium Tablets (768px - 1024px) */
        @media (max-width: 1024px) {
            .hero-2027-wrapper {
                min-height: 600px;
            }
            .brand-title-main {
                font-size: 2.3rem; /* Giảm size để tránh xuống dòng */
                margin-bottom: 24px;
            }
            .slogan-slider-container {
                min-height: 80px;
                margin-bottom: 30px;
            }
            .btn-modern {
                padding: 16px 36px;
                font-size: 0.95rem;
            }
        }

        /* Small Tablets & Large Phones (576px - 767px) */
        @media (max-width: 767px) {
            .hero-2027-wrapper {
                height: 100vh;
                padding-top: 60px;
            }
            .brand-badge-wrapper {
                padding: 8px 18px;
                margin-bottom: 20px;
            }
            .brand-title-upper {
                letter-spacing: 5px;
                font-size: 0.85rem;
            }
            .brand-title-main {
                font-size: 2rem;
                line-height: 1.25;
                margin-bottom: 24px;
                letter-spacing: -0.5px;
                white-space: normal; /* Cho phép xuống dòng tự nhiên trên mobile */
            }
            .slogan-slider-container {
                min-height: 90px;
                margin-bottom: 32px;
            }
            .slogan-text-heading {
                font-size: 1.2rem;
                margin-bottom: 6px;
            }
            .slogan-text-desc {
                font-size: 0.85rem;
                padding: 0 10px;
            }
            .cta-buttons-container {
                gap: 12px;
                flex-direction: column;
                align-items: center;
            }
            .btn-modern {
                width: 100%;
                max-width: 280px;
                padding: 14px 28px;
            }
            .glowing-glow {
                display: none;
            }
        }

        /* Extra Small Phones (320px - 575px) */
        @media (max-width: 575px) {
            .hero-2027-wrapper {
                min-height: 520px;
            }
            .brand-badge-wrapper {
                padding: 6px 14px;
                margin-bottom: 16px;
            }
            .badge-text {
                font-size: 0.75rem;
                letter-spacing: 1.5px;
            }
            .brand-title-upper {
                letter-spacing: 4px;
                font-size: 0.75rem;
            }
            .brand-title-main {
                font-size: 1.85rem;
                margin-bottom: 20px;
            }
            .slogan-slider-container {
                min-height: 100px;
                margin-bottom: 24px;
            }
            .slogan-text-heading {
                font-size: 1.05rem;
            }
            .slogan-text-desc {
                font-size: 0.8rem;
                line-clamp: 2;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            .btn-modern {
                max-width: 250px;
                padding: 12px 24px;
                font-size: 0.85rem;
            }
            .scroll-indicator-2027 {
                display: none;
            }
        }

        /* Landscape Mobile Devices (Height <= 480px) */
        @media (orientation: landscape) and (max-height: 480px) {
            .hero-2027-wrapper {
                height: auto;
                min-height: 100vh;
                padding: 80px 0 40px;
            }
            .brand-badge-wrapper {
                margin-bottom: 12px;
            }
            .brand-title-main {
                font-size: 1.8rem;
                margin-bottom: 16px;
            }
            .slogan-slider-container {
                min-height: 60px;
                margin-bottom: 20px;
            }
            .cta-buttons-container {
                flex-direction: row;
            }
            .btn-modern {
                width: auto;
                padding: 10px 24px;
            }
            .scroll-indicator-2027 {
                display: none;
            }
        }
      `}} />

      <section className="hero-2027-wrapper">
        {/* Optimized Video Tag */}
        <video 
          ref={videoRef}
          className="hero-video-bg" 
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

        {/* Ambient Overlays */}
        <div className="hero-overlay-mask"></div>
        <div className="cyber-grid"></div>
        <div className="glowing-glow glow-1"></div>
        <div className="glowing-glow glow-2"></div>

        {/* Floating cyber particles */}
        <div className="cyber-particles">
          <div className="cyber-particle"></div>
          <div className="cyber-particle"></div>
          <div className="cyber-particle"></div>
        </div>

        {/* Main Content Node */}
        <div className="hero-content-inner">
          {/* Futuristic Badge */}
          <div className="brand-badge-wrapper">
            <span className="pulse-dot"></span>
            <Building2 size={15} className="text-sky-400" />
            <span className="badge-text">{currentHero.badge}</span>
          </div>

          {/* Core Brand Title */}
          <div className="brand-title-upper">{currentHero.titlePrimary}</div>
          <h1 className="brand-title-main">
            {currentHero.titleSecondary}
          </h1>

          {/* Slogan Slider Node */}
          <div className="slogan-slider-container">
            <div className={`slogan-slide ${animClass === 'slogan-enter' ? 'slogan-active' : 'slogan-exit'}`}>
              <div className="slogan-text-heading">
                {currentHero.slogans[sloganIdx].text}
              </div>
              {currentHero.slogans[sloganIdx].description && (
                <div className="slogan-text-desc">
                  {currentHero.slogans[sloganIdx].description}
                </div>
              )}
            </div>
          </div>

          {/* 2027 Custom Buttons */}
          <div className="cta-buttons-container">
            <button onClick={handleScrollToNext} className="btn-modern btn-modern-primary">
              <span>{currentHero.ctaPrimary}</span>
              <ArrowRight size={18} className="arrow-icon ml-1" />
            </button>
            
            <a 
              href="https://zalo.me/0915059666" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-modern btn-modern-secondary"
            >
              <MessageSquare size={18} className="chat-icon text-sky-400" />
              <span>{currentHero.ctaSecondary}</span>
            </a>
          </div>
        </div>

        {/* Mouse/Scroll Indicator */}
        <div className="scroll-indicator-2027" onClick={handleScrollToNext}>
          <div className="indicator-mouse">
            <div className="indicator-dot"></div>
          </div>
          <ArrowDown size={14} className="text-sky-400/70" />
        </div>
      </section>
    </>
  );
};

export default Hero;
