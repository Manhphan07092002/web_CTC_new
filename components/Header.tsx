import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Globe, ChevronDown, ChevronUp, Moon, Sun, Monitor, MessageSquare, ShoppingCart, Search, RefreshCw } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import { Category } from '../types';
import { getLangText } from '../utils/translation-helper';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Debounced search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveResults(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.search.live(searchQuery);
        if (res.success) {
          setLiveResults(res.data);
        }
      } catch (err) {
        console.error('Error in live search:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Listen for Esc key to close search or menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseSearch();
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setLiveResults(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      handleCloseSearch();
    }
  };
  const { language, setLanguage, t } = useLanguage();
  const { theme, themeMode, toggleTheme, setThemeMode } = useTheme();
  const { settings } = useSettings();
  const { totalItems } = useCart();

  // Scroll handler with hysteresis deadband (50px / 10px) to eliminate header flickering chatter
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > 20) {
            setIsScrolled(true);
          } else if (currentScrollY <= 5) {
            setIsScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.productCategories.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, [language]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleLangMenu = () => setIsLangMenuOpen(!isLangMenuOpen);

  const isActive = (path: string) => location.pathname === path;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const handleLanguageChange = (code: Language) => {
    setLanguage(code);
    setIsLangMenuOpen(false);
  };

  const toggleMobileSubmenu = (key: string) => {
    setExpandedMobileMenu(expandedMobileMenu === key ? null : key);
  };

  const getDynamicNavLinks = () => {
    const rawLinks = settings.headerNavLinks && settings.headerNavLinks.length > 0 
      ? settings.headerNavLinks 
      : NAV_LINKS.map((link, idx) => ({ 
          id: `nav-${idx}`, 
          name: link.name, 
          path: link.path, 
          key: link.key, 
          order: idx + 1, 
          submenu: link.submenu?.map((s, sidx) => ({ id: `sub-${sidx}`, name: s.name, path: s.path })) 
        }));

    return rawLinks.map(link => {
      const displayName = link.key && t(`nav.${link.key}`) !== `nav.${link.key}` 
        ? t(`nav.${link.key}`) 
        : link.name;

      if (link.key === 'products' && categories.length > 0) {
        // Always override products submenu with live categories from DB
        return {
          ...link,
          displayName,
          submenu: categories.map(cat => ({
            id: cat.id,
            name: cat.name.toUpperCase(),
            path: `/products?cat=${encodeURIComponent(cat.name.toLowerCase())}`
          }))
        };
      }
      return {
        ...link,
        displayName
      };
    });
  };

  const getSubmenuDisplayName = (sub: { name: string; path: string }, lang: Language): string => {
    const p = (sub.path || '').toLowerCase();
    const n = (sub.name || '').toLowerCase();

    // Solutions submenus
    if (p === '/solutions') {
      return getLangText(lang, {
        vi: 'GIẢI PHÁP TOÀN DIỆN',
        en: 'ALL SOLUTIONS',
        ko: '종합 솔루션',
        ja: '総合ソリューション',
        zh: '全流程解决方案',
        de: 'GESAMTLÖSUNGEN'
      });
    }
    if (p.includes('floating') || p.includes('telecom') || n.includes('viễn thông')) {
      return getLangText(lang, {
        vi: 'HẠ TẦNG VIỄN THÔNG & CNTT',
        en: 'TELECOM & IT INFRASTRUCTURE',
        ko: '통신 및 IT 인프라',
        ja: '通信 & ITインフラ',
        zh: '电信与IT基础设施',
        de: 'TELEKOM & IT-INFRASTRUKTUR'
      });
    }
    if (p.includes('rooftop') || p.includes('solar') || n.includes('mặt trời')) {
      return getLangText(lang, {
        vi: 'ĐIỆN MẶT TRỜI (SOLAR EPC)',
        en: 'SOLAR POWER (SOLAR EPC)',
        ko: '태양광 발전 (SOLAR EPC)',
        ja: '太陽光発電 (SOLAR EPC)',
        zh: '光伏发电 (SOLAR EPC)',
        de: 'SOLARENERGIE (SOLAR EPC)'
      });
    }
    if (p.includes('farm') || p.includes('wind') || n.includes('điện gió')) {
      return getLangText(lang, {
        vi: 'ĐIỆN GIÓ (WIND POWER EPC)',
        en: 'WIND POWER (WIND EPC)',
        ko: '풍력 발전 (WIND EPC)',
        ja: '風力発電 (WIND EPC)',
        zh: '风力发电 (WIND EPC)',
        de: 'WINDKRAFT (WIND EPC)'
      });
    }
    if (p.includes('electrical') || n.includes('đường dây') || n.includes('110kv')) {
      return getLangText(lang, {
        vi: 'ĐƯỜNG DÂY & TRẠM BIẾN ÁP 110KV',
        en: 'TRANSMISSION LINE & 110KV SUBSTATION',
        ko: '송전선 및 110KV 변전소',
        ja: '送電線 & 110KV変電所',
        zh: '输电线路与110kV变电站',
        de: 'STROMLEITUNGEN & 110KV UMSPANNWERKE'
      });
    }
    if (p.includes('datacenter') || n.includes('data center') || n.includes('hạ tầng số')) {
      return getLangText(lang, {
        vi: 'DATA CENTER & HẠ TẦNG SỐ',
        en: 'DATA CENTER & DIGITAL INFRASTRUCTURE',
        ko: '데이터 센터 및 디지털 인프라',
        ja: 'データセンター & デジタルインフラ',
        zh: '数据中心与数字基础设施',
        de: 'RECHENZENTRUM & DIGITALE INFRASTRUKTUR'
      });
    }
    if (p.includes('construction') || n.includes('xây dựng')) {
      return getLangText(lang, {
        vi: 'XÂY DỰNG DÂN DỤNG & CÔNG NGHIỆP',
        en: 'CIVIL & INDUSTRIAL CONSTRUCTION',
        ko: '민간 및 산업 건설',
        ja: '民生 & 産業建設',
        zh: '民用与工业建筑',
        de: 'ZIVIL- & INDUSTRIEBAU'
      });
    }

    // Products submenus
    if (p.includes('panels') || n.includes('pin') || n.includes('panels')) {
      return getLangText(lang, {
        vi: 'TẤM PIN NĂNG LƯỢNG MẶT TRỜI',
        en: 'SOLAR PANELS',
        ko: '태양광 패널',
        ja: '太陽光パネル',
        zh: '太阳能组件',
        de: 'SOLARMODULE'
      });
    }
    if (p.includes('inverter') || n.includes('biến tần') || n.includes('hòa lưới')) {
      return getLangText(lang, {
        vi: 'BỘ HÒA LƯỚI (INVERTER)',
        en: 'SOLAR INVERTERS',
        ko: '인버터 (INVERTER)',
        ja: 'パワコン (INVERTER)',
        zh: '光伏逆变器',
        de: 'WECHSELRICHTER'
      });
    }
    if (p.includes('storage') || n.includes('lưu trữ')) {
      return getLangText(lang, {
        vi: 'HỆ THỐNG LƯU TRỮ ĐIỆN',
        en: 'ENERGY STORAGE SYSTEMS (ESS)',
        ko: '에너지 저장 시스템 (ESS)',
        ja: '蓄電システム (ESS)',
        zh: '储能系统 (ESS)',
        de: 'ENERGIESPEICHERSYSTEME (ESS)'
      });
    }
    if (p.includes('accessories') || n.includes('phụ kiện')) {
      return getLangText(lang, {
        vi: 'PHỤ KIỆN LẮP ĐẶT',
        en: 'MOUNTING & ACCESSORIES',
        ko: '설치 자재 및 악세서리',
        ja: '架台・架線・アクセサリー',
        zh: '安装配件与辅材',
        de: 'MONTAGEMATERIAL & ZUBEHÖR'
      });
    }

    return sub.name;
  };

  const navLinks = getDynamicNavLinks();

  const getHeaderContainerClass = () => {
    const base = "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ";
    if (isScrolled) {
      return base + "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border-b border-gray-200/50 dark:border-slate-800/80 py-1.5 sm:py-2";
    }
    // Transparent style at Y=0 (always slightly dark tinted for optimal white text contrast over video)
    return base + "bg-slate-950/40 backdrop-blur-md border-b border-white/10 py-3 sm:py-4";
  };

  const getTopBarClass = () => {
    const base = "transition-all duration-300 ease-in-out ";
    if (isScrolled) {
      return base + "max-h-0 opacity-0 py-0 border-none pointer-events-none overflow-hidden";
    }
    return base + "max-h-[40px] opacity-100 py-2 border-b border-white/5 text-white/90 text-xs md:text-sm overflow-visible";
  };

  const getNavLinkClass = (path: string) => {
    const activeColor = "text-sky-500 dark:text-sky-400";
    if (isActive(path)) return activeColor;

    if (isScrolled) {
      return "text-slate-800 dark:text-slate-200 hover:text-sky-500 dark:hover:text-sky-400";
    }
    // Transparent state: force light readable link color
    return "text-slate-100 hover:text-sky-400";
  };

  const getLogoClass = () => {
    return "h-11 sm:h-13 md:h-14 w-auto object-contain transition-all duration-300 rounded-xl shadow-md border border-white/20 hover:scale-105";
  };

  return (
    <>
      <header className={getHeaderContainerClass()}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Premium Header Contact Button Effects */
        .btn-header-contact {
            position: relative;
            overflow: hidden;
            border: 1.5px solid rgba(56, 189, 248, 0.25) !important;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        
        .btn-header-contact-shimmer {
            position: absolute;
            top: 0;
            left: -150%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
            transform: skewX(-20deg);
            pointer-events: none;
            animation: headerBtnShimmer 5s infinite ease-in-out;
        }
        
        @keyframes headerBtnShimmer {
            0% { left: -150%; }
            15% { left: 150%; }
            100% { left: 150%; }
        }
        
        .btn-header-contact:hover {
            box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.45), 
                        0 0 15px rgba(56, 189, 248, 0.35),
                        inset 0 1px 1px rgba(255, 255, 255, 0.25) !important;
            border-color: rgba(56, 189, 248, 0.6) !important;
            transform: scale(1.05) translateY(-1.5px) !important;
        }
        
        /* Manual hover shimmer sweep override */
        .btn-header-contact:hover .btn-header-contact-shimmer {
            animation: none;
            left: 150%;
            transition: left 0.75s ease;
        }
        
        /* Phone vibrating ring animation */
        @keyframes phoneRingVibe {
            0%, 100% { transform: rotate(0deg); }
            12% { transform: rotate(-18deg); }
            24% { transform: rotate(16deg); }
            36% { transform: rotate(-14deg); }
            48% { transform: rotate(12deg); }
            60% { transform: rotate(-10deg); }
            72% { transform: rotate(8deg); }
            84% { transform: rotate(-5deg); }
        }
        
        .phone-vibe-icon {
            display: inline-block;
            transform-origin: center;
        }
        
        .btn-header-contact:hover .phone-vibe-icon {
            animation: phoneRingVibe 0.7s ease-in-out;
        }
      `}} />
      
      {/* Top Bar (Collapses dynamically when scrolling down) */}
      {(settings.headerShowTopbar ?? true) && (
        <div className={getTopBarClass()}>
          <div className="container mx-auto px-4 flex justify-between items-center">
            <span className="hidden xl:block font-sans font-medium tracking-wide">
              {getLangText(language, {
                vi: settings.headerSlogan || settings.siteDescription || t('header.slogan'),
                en: 'CTC – EPC Contractor, Electrical Construction & Renewable Energy Solutions in Vietnam',
                ko: 'CTC – 베트남 최고의 EPC 시공 및 재생 에너지 솔루션',
                ja: 'CTC – ベトナムにおけるEPC施工・電気工事・再生可能エネルギーソリューション',
                zh: 'CTC – 越南领先的EPC总承包、电力建设与可再生能源解决方案',
                de: 'CTC – EPC-Generalunternehmer, Elektroinstallation & Erneuerbare Energien in Vietnam'
              })}
            </span>
            <div className="flex items-center gap-2 sm:gap-4 justify-between md:justify-end w-full md:w-auto text-[11px] sm:text-xs">
              <a href={`tel:${(settings.headerHotlinePhone || settings.phone).replace(/\s/g, '')}`} className="flex items-center hover:text-sky-400 transition-colors font-semibold">
                <Phone size={12} className="mr-1 flex-shrink-0" />
                <span className="hidden sm:inline mr-1">{settings.headerHotlineLabel || t('header.hotline')}:</span>
                <span className="truncate">{settings.headerHotlinePhone || settings.phone}</span>
              </a>

              <div className="h-3 w-px bg-white/20"></div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="flex items-center gap-1.5 hover:text-sky-400 transition-colors focus:outline-none"
              title={
                themeMode === 'light' ? t('common.theme_light') : 
                themeMode === 'dark' ? t('common.theme_dark') : 
                t('common.theme_auto')
              }
            >
              {themeMode === 'light' && <Sun size={14} className="text-yellow-400" />}
              {themeMode === 'dark' && <Moon size={14} className="text-sky-300" />}
              {themeMode === 'system' && <Monitor size={14} className="text-emerald-400" />}
              <span className="hidden sm:inline text-xs font-medium">
                {themeMode === 'system' ? 'Auto' : themeMode === 'dark' ? t('common.dark') : t('common.light')}
              </span>
            </button>
            
            <div className="h-3 w-px bg-white/20"></div>
            
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button 
                onClick={toggleLangMenu}
                className="flex items-center gap-1 hover:text-sky-400 transition-colors focus:outline-none font-medium"
              >
                <span className="text-sm">{currentLang.flag}</span>
                <span className="hidden sm:inline ml-0.5 text-xs">{currentLang.label}</span>
                <Globe size={13} className="ml-1 opacity-80"/>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-36 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 hover:bg-white/10 transition-colors ${language === lang.code ? 'bg-white/15 text-sky-400 font-bold' : 'text-slate-200'}`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-3 w-px bg-white/20 hidden sm:block"></div>
            <Link to="/admin" className="hover:text-sky-400 transition-colors hidden lg:block font-medium">{t('header.admin')}</Link>
          </div>
        </div>
      </div>
      )}

      {/* Main Navigation Row */}
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex justify-between items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center group">
            <img 
              src={settings.logoHeader || settings.logo} 
              alt={settings.siteName} 
              className={getLogoClass()} 
            />
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 h-full">
            {navLinks.map((link) => (
              <div key={link.path} className="relative group h-full flex items-center py-2">
                <Link
                  to={link.path}
                  className={`flex items-center text-xs xl:text-sm font-bold uppercase tracking-wider transition-colors duration-200 ${getNavLinkClass(link.path)}`}
                >
                  {(link as any).displayName || link.name}
                  {link.submenu && (
                    <ChevronDown size={13} className="ml-1 group-hover:rotate-180 transition-transform duration-300" />
                  )}
                </Link>

                {/* Submenu Dropdown */}
                {link.submenu && (
                  <div className="absolute left-0 top-full pt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 z-50">
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden py-2">
                      {link.submenu.map((sub, index) => (
                        <Link 
                          key={index}
                          to={sub.path}
                          className="flex items-center gap-3 px-5 py-2.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200 border-b border-gray-50 dark:border-slate-800/70 last:border-0 uppercase tracking-wide group/sub"
                        >
                          <span className="w-1 h-4 rounded-full bg-sky-500/30 group-hover/sub:bg-sky-500 flex-shrink-0 transition-colors duration-200" />
                          {getSubmenuDisplayName(sub, language)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Action Button (Blue capsule button matching website theme) */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 text-slate-800 dark:text-white hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
              style={{ color: isScrolled ? undefined : 'white' }}
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
            >
              <Search size={20} />
              <span className="sr-only">Tìm kiếm</span>
            </button>

            <Link 
              to="/cart" 
              className="relative p-2.5 text-slate-800 dark:text-white hover:text-primary transition-colors flex items-center gap-1.5 font-bold"
              style={{ color: isScrolled ? undefined : 'white' }}
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={20} />
              <span className="sr-only">Giỏ hàng</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>

            <a 
              href={settings.headerCtaLink || "https://zalo.me/0915059666"} 
              target={settings.headerCtaLink?.startsWith('http') ? "_blank" : undefined} 
              rel="noopener noreferrer"
              aria-label="Liên hệ Zalo"
              className="btn-header-contact inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-800 hover:from-sky-700 hover:to-blue-900 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg transition-all active:scale-95"
            >
              <span className="btn-header-contact-shimmer"></span>
              <Phone size={14} className="phone-vibe-icon" />
              <span>
                {getLangText(language, {
                  vi: settings.headerCtaText || t('header.contact_now'),
                  en: 'CONTACT US',
                  ko: '문의하기',
                  ja: 'お問い合わせ',
                  zh: '联系我们',
                  de: 'KONTAKT'
                })}
              </span>
            </a>
          </div>

          {/* Mobile Menu & Cart Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-800 dark:text-white hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
              style={{ color: isScrolled ? undefined : 'white' }}
              aria-label="Tìm kiếm"
            >
              <Search size={24} />
              <span className="sr-only">Tìm kiếm</span>
            </button>

            <Link 
              to="/cart" 
              className="relative p-2"
              style={{ color: isScrolled ? undefined : 'white' }}
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={24} />
              <span className="sr-only">Giỏ hàng</span>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>

            <button 
              onClick={toggleMenu} 
              className={`p-2 rounded-xl transition-colors ${
                isScrolled 
                  ? 'text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>
      </div>

      {/* Live Search Panel Dropdown */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800 shadow-xl z-50 animate-slide-down select-none">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-3">
              <Search className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={22} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm (sản phẩm, giải pháp, dự án, tin tức, tài liệu...)"
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 dark:text-white text-base py-2 placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                autoFocus
              />
              <button
                type="button"
                onClick={handleCloseSearch}
                className="p-1.5 rounded-full hover:bg-gray-150 dark:hover:bg-slate-850 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </form>

            {searchQuery.trim() && (
              <div className="mt-4 border-t border-gray-100 dark:border-slate-850 pt-4 max-h-[70vh] overflow-y-auto">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2.5 text-gray-500 dark:text-gray-400 text-sm">
                    <RefreshCw className="animate-spin text-primary" size={18} />
                    <span>Đang tìm kiếm gợi ý...</span>
                  </div>
                ) : liveResults && (
                  Object.values(liveResults).every((arr: any) => arr.length === 0) ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Không tìm thấy gợi ý nào khớp với từ khóa "{searchQuery}"
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                      {/* Products */}
                      {liveResults.products?.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-widest pl-1">Sản phẩm</h3>
                          <div className="space-y-2">
                            {liveResults.products.map((p: any) => (
                              <Link
                                key={p._id}
                                to={`/products/${p._id}`}
                                onClick={handleCloseSearch}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                              >
                                <img src={p.image} className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-gray-700" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary truncate transition-colors">{p.name}</h4>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-semibold uppercase">{p.code || p.category}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Solutions */}
                      {liveResults.solutions?.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-gray-455 dark:text-gray-500 uppercase tracking-widest pl-1">Giải pháp</h3>
                          <div className="space-y-2">
                            {liveResults.solutions.map((s: any) => (
                              <Link
                                key={s.slug}
                                to={s.path}
                                onClick={handleCloseSearch}
                                className="block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                              >
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{s.title}</h4>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 leading-relaxed">{s.description}</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {liveResults.projects?.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-widest pl-1">Dự án</h3>
                          <div className="space-y-2">
                            {liveResults.projects.map((pr: any) => (
                              <Link
                                key={pr._id}
                                to={`/projects/${pr._id}`}
                                onClick={handleCloseSearch}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                              >
                                <img src={pr.image} className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-gray-700" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary truncate transition-colors">{pr.title}</h4>
                                  <p className="text-[10px] text-gray-455 dark:text-gray-500 mt-0.5 truncate">{pr.location || pr.category}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      {liveResults.resources?.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-widest pl-1">Tài liệu</h3>
                          <div className="space-y-2">
                            {liveResults.resources.map((r: any) => (
                              <a
                                key={r._id}
                                href={r.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                              >
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary truncate transition-colors">{r.title}</h4>
                                <p className="text-[10px] text-gray-455 dark:text-gray-500 mt-0.5 font-bold uppercase">{r.size || 'PDF'}</p>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* News */}
                      {liveResults.news?.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-widest pl-1">Tin tức</h3>
                          <div className="space-y-2">
                            {liveResults.news.map((n: any) => (
                              <Link
                                key={n._id}
                                to={`/news/${n._id}`}
                                onClick={handleCloseSearch}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                              >
                                <img src={n.image} className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-gray-700" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary truncate transition-colors">{n.title}</h4>
                                  <p className="text-[10px] text-gray-455 dark:text-gray-500 mt-0.5">{new Date(n.date).toLocaleDateString('vi-VN')}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* View all results */}
                {!searchLoading && searchQuery.trim() && (
                  <div className="mt-6 border-t border-gray-100 dark:border-slate-855 pt-4 text-center">
                    <button
                      type="submit"
                      onClick={handleSearchSubmit}
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-all active:scale-[0.98]"
                    >
                      <Search size={14} />
                      <span>Xem tất cả kết quả tìm kiếm</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>

    {/* Mobile Menu Dropdown Panel & Backdrop (Rendered outside header to escape backdrop-filter containing block) */}
    {isMenuOpen && (
      <>
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99] lg:hidden transition-opacity duration-300" 
          onClick={() => setIsMenuOpen(false)}
        />
        
        <div className="lg:hidden fixed inset-x-0 top-[56px] sm:top-[68px] bottom-0 bg-white dark:bg-slate-950 border-t border-gray-200/60 dark:border-slate-800 shadow-2xl z-[100] overflow-y-auto animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-5 gap-1.5 pb-24">
            {navLinks.map((link) => (
              <div key={link.path} className="border-b border-gray-100 dark:border-slate-800/60 last:border-none">
                <div className="flex justify-between items-center">
                  <Link
                    to={link.path}
                    onClick={() => !link.submenu && setIsMenuOpen(false)}
                    className={`flex-1 py-3.5 text-sm font-bold uppercase tracking-wider ${
                      isActive(link.path) ? 'text-sky-500 dark:text-sky-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {(link as any).displayName || link.name}
                  </Link>
                  {link.submenu && (
                    <button 
                      onClick={() => toggleMobileSubmenu(link.key)}
                      className="p-3 text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Toggle submenu"
                    >
                      {expandedMobileMenu === link.key ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  )}
                </div>

                {/* Mobile Dropdown Sublinks */}
                {link.submenu && expandedMobileMenu === link.key && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl mb-3 overflow-hidden border border-gray-100/50 dark:border-slate-800">
                    {link.submenu.map((sub, subIdx) => (
                      <Link
                        key={subIdx}
                        to={sub.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 border-b border-gray-100/30 dark:border-slate-800 last:border-0 uppercase tracking-wide"
                      >
                        <span className="w-1 h-3.5 rounded-full bg-sky-400/40 flex-shrink-0" />
                        {getSubmenuDisplayName(sub, language)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Mobile Contact Action Button */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3">
              <a 
                href="https://zalo.me/0915059666"
                className="btn-header-contact flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-800 hover:from-sky-700 hover:to-blue-900 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-full shadow-lg min-h-[44px]"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="btn-header-contact-shimmer"></span>
                <Phone size={14} className="phone-vibe-icon" />
                <span>{getLangText(language, { vi: 'Liên hệ Zalo', en: 'Zalo Support', ko: 'Zalo 문의', ja: 'Zaloサポート', zh: 'Zalo客服', de: 'Zalo Support' })}</span>
              </a>
              {/* Mobile Language Selector */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 text-center">
                  Ngôn ngữ / Language
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        language === lang.code
                          ? 'bg-sky-500 text-white border-sky-500 shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-sky-400'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Theme Mode Selector */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 text-center">
                  Giao diện / Theme Mode
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                      themeMode === 'light'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                    }`}
                  >
                    <Sun size={14} />
                    <span>{t('common.light')}</span>
                  </button>
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                      themeMode === 'dark'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                    }`}
                  >
                    <Moon size={14} />
                    <span>{t('common.dark')}</span>
                  </button>
                  <button
                    onClick={() => setThemeMode('system')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                      themeMode === 'system'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                    }`}
                  >
                    <Monitor size={14} />
                    <span>Auto</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-center gap-6 text-xs text-slate-400 mt-2 pb-2">
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="hover:text-sky-500 font-semibold uppercase tracking-wider p-2">
                  {t('header.admin')}
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </>
    )}
  </>
  );
};

export default Header;
