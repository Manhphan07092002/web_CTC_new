
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Globe, ChevronDown, ChevronUp, Moon, Sun, Monitor } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { api } from '../services/api';
import { Category } from '../types';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, themeMode, toggleTheme } = useTheme();
  const { settings } = useSettings();

  // Load categories from database (with language support)
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

  // Build dynamic nav links with categories from database
  const getDynamicNavLinks = () => {
    return NAV_LINKS.map(link => {
      if (link.key === 'products' && categories.length > 0) {
        // Replace hardcoded submenu with dynamic categories
        return {
          ...link,
          submenu: categories.map(cat => ({
            name: cat.name.toUpperCase(),
            path: `/products?cat=${cat.name.toLowerCase()}`
          }))
        };
      }
      return link;
    });
  };

  const navLinks = getDynamicNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-md font-sans transition-colors duration-300">
      {/* Top Bar */}
      <div className="bg-corporate dark:bg-slate-900 text-white py-2 px-4 text-xs md:text-sm transition-colors duration-300 border-b border-transparent dark:border-slate-800">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <span className="text-center sm:text-left hidden md:block">{settings.siteDescription || t('header.slogan')}</span>
          <div className="flex items-center gap-4 justify-between w-full sm:w-auto">
            <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="flex items-center hover:text-primary transition-colors">
              <Phone size={14} className="mr-1" /> <span className="hidden sm:inline">{t('header.hotline')}:</span> {settings.phone}
            </a>
            <div className="h-3 w-px bg-white/30 hidden sm:block"></div>

            {/* Theme Toggle - Cycles through: Light → Dark → System */}
            <button 
              onClick={toggleTheme} 
              className="flex items-center gap-2 hover:text-primary transition-colors focus:outline-none"
              title={
                themeMode === 'light' ? t('common.theme_light') : 
                themeMode === 'dark' ? t('common.theme_dark') : 
                t('common.theme_auto')
              }
            >
              {themeMode === 'light' && <Sun size={16} className="text-yellow-500" />}
              {themeMode === 'dark' && <Moon size={16} className="text-blue-400" />}
              {themeMode === 'system' && <Monitor size={16} className="text-green-400" />}
              <span className="hidden sm:inline text-xs opacity-80">
                {themeMode === 'system' ? 'Auto' : themeMode === 'dark' ? t('common.dark') : t('common.light')}
              </span>
            </button>
            
            <div className="h-3 w-px bg-white/30"></div>
            
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={toggleLangMenu}
                className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none"
              >
                <span className="text-base">{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.label}</span>
                <Globe size={14} className="ml-1 opacity-70"/>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${language === lang.code ? 'bg-blue-50 dark:bg-gray-700 text-primary font-bold' : 'text-gray-700 dark:text-gray-200'}`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-3 w-px bg-white/30 hidden sm:block"></div>
            <Link to="/admin" className="hover:text-primary transition-colors hidden sm:block">{t('header.admin')}</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={settings.logoHeader || settings.logo} 
              alt={settings.siteName} 
              className="h-10 sm:h-12 w-auto object-contain" 
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <div key={link.path} className="relative group h-full flex items-center py-3">
                <Link
                  to={link.path}
                  className={`flex items-center text-sm font-bold uppercase tracking-wide transition-colors duration-200 ${
                    isActive(link.path) 
                      ? 'text-primary' 
                      : 'text-corporate dark:text-gray-200 hover:text-primary dark:hover:text-primary'
                  }`}
                >
                  {t(`nav.${link.key}`)}
                  {link.submenu && (
                    <ChevronDown size={14} className="ml-1 group-hover:rotate-180 transition-transform duration-300" />
                  )}
                </Link>
                
                {isActive(link.path) && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}

                {/* Desktop Dropdown Submenu */}
                {link.submenu && (
                  <div className="absolute left-0 top-full w-72 bg-white dark:bg-gray-800 shadow-xl rounded-b-lg border-t-4 border-primary opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-50">
                    <div className="py-2">
                      {link.submenu.map((sub, index) => (
                        <Link 
                          key={index}
                          to={sub.path}
                          className="block px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary hover:pl-8 transition-all duration-200 border-b border-gray-50 dark:border-gray-700 last:border-0 uppercase"
                        >
                          {t(`nav.${sub.name}`)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="lg:hidden text-corporate dark:text-white p-2">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 absolute w-full shadow-xl z-[60] max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => (
              <div key={link.path} className="border-b border-gray-100 dark:border-gray-800 last:border-none">
                <div className="flex justify-between items-center">
                   <Link
                    to={link.path}
                    onClick={() => !link.submenu && setIsMenuOpen(false)}
                    className={`flex-1 py-3 text-base font-semibold ${
                      isActive(link.path) ? 'text-primary' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                  {link.submenu && (
                    <button 
                      onClick={() => toggleMobileSubmenu(link.key)}
                      className="p-3 text-gray-500 dark:text-gray-400"
                    >
                      {expandedMobileMenu === link.key ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  )}
                </div>

                {/* Mobile Submenu */}
                {link.submenu && expandedMobileMenu === link.key && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg mb-2 overflow-hidden">
                    {link.submenu.map((sub, subIdx) => (
                      <Link
                        key={subIdx}
                        to={sub.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:text-primary border-b border-gray-100 dark:border-gray-700 last:border-0 pl-8"
                      >
                        • {t(`nav.${sub.name}`)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 flex justify-center">
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-gray-500 dark:text-gray-400 text-sm hover:text-primary">
                   {t('header.admin')}
                </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
