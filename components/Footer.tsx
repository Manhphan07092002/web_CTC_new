import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Youtube,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { getLangText } from '../utils/translation-helper';

const getApiBase = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  if (!port || port === '80' || port === '443') {
    return '/api';
  }
  return `${protocol}//${hostname}:4000/api`;
};

const API_BASE = getApiBase();

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Đăng ký nhận tin',
          phone: 'N/A',
          email,
          service: 'Newsletter - Đăng ký nhận tin tức',
          message: 'Khách hàng đăng ký nhận bản tin qua email từ Footer',
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to subscribe');

      showToast(getLangText(language, { vi: 'Đăng ký nhận tin thành công! Cảm ơn bạn.', en: 'Subscribed successfully! Thank you.', ko: '구독 성공! 감사합니다.', ja: '購読ありがとうございます！', zh: '订阅成功！感谢您。', de: 'Erfolgreich abonniert! Danke.' }), 'success');
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
      showToast(getLangText(language, { vi: 'Có lỗi xảy ra. Vui lòng thử lại!', en: 'An error occurred. Please try again!', ko: '오류가 발생했습니다. 다시 시도해주세요!', ja: 'エラーが発生しました。もう一度お試しください！', zh: '发生错误，请重试！', de: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut!' }), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const footerLinkClass = 'group flex items-center gap-1.5 text-sm text-slate-300 transition-all duration-300 hover:translate-x-1 hover:text-sky-400';
  const socialClass = 'flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:bg-sky-500/15 hover:text-sky-300 hover:shadow-lg hover:shadow-sky-950/30';

  const quickLinks = [
    ['/about', t('nav.about')],
    ['/products', t('nav.products')],
    ['/projects', t('nav.projects')],
    ['/news', t('nav.news')],
    ['/contact', t('nav.contact')],
    ['/track-order', getLangText(language, { vi: 'Tra cứu đơn hàng', en: 'Order Lookup', ko: '주문 조회', ja: '注文検索', zh: '订单查询', de: 'Bestellabfrage' })],
  ];

  const solutionLinks: [string, string][] = [
    ['/solutions', getLangText(language, { vi: 'Giải pháp toàn diện', en: 'Comprehensive Solutions', ko: '종합 솔루션', ja: '総合ソリューション', zh: '综合解决方案', de: 'Umfassende Lösungen' })],
    ['/solutions/floating', getLangText(language, { vi: 'Hạ tầng Viễn thông & CNTT', en: 'Telecom & IT Infrastructure', ko: '통신 및 IT 인프라', ja: '通信・ITインフラ', zh: '电信与 IT 基础设施', de: 'Telekom & IT-Infrastruktur' })],
    ['/solutions/rooftop', getLangText(language, { vi: 'Điện mặt trời (Solar EPC)', en: 'Solar Power (Solar EPC)', ko: '태양광 발전 (Solar EPC)', ja: '太陽光発電 (Solar EPC)', zh: '太阳能发电 (Solar EPC)', de: 'Solarstrom (Solar EPC)' })],
    ['/solutions/farm', getLangText(language, { vi: 'Điện gió (Wind Power EPC)', en: 'Wind Power (Wind Power EPC)', ko: '풍력 발전 (Wind EPC)', ja: '風力発電 (Wind EPC)', zh: '风力发电 (Wind EPC)', de: 'Windenergie (Wind EPC)' })],
    ['/solutions/electrical', getLangText(language, { vi: 'Đường dây & Trạm biến áp 110kV', en: 'Power Lines & 110kV Substation', ko: '110kV 송전선 및 변전소', ja: '110kV送電線・変電所', zh: '110kV输电线路与变电站', de: '110kV Stromleitungen & Umspannwerke' })],
    ['/solutions/datacenter', getLangText(language, { vi: 'Data Center & Hạ tầng số', en: 'Data Center & Digital Infrastructure', ko: '데이터 센터 및 디지털 인프라', ja: 'データセンター・デジタルインフラ', zh: '数据中心与数字基础设施', de: 'Rechenzentrum & Digitale Infrastruktur' })],
    ['/solutions/construction', getLangText(language, { vi: 'Xây dựng Dân dụng & Công nghiệp', en: 'Civil & Industrial Construction', ko: '민간 및 산업 건설', ja: '土木・産業建設', zh: '民用与工业建筑', de: 'Zivil- & Industriebau' })],
  ];

  return (
    <footer className="relative overflow-hidden border-t border-sky-400/15 bg-slate-950 text-white">
      <style>{`
        .footer-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(to bottom, black, transparent 88%);
        }
        .footer-glow-blue {
          position: absolute; top: -280px; left: -180px; width: 620px; height: 620px;
          border-radius: 999px; background: rgba(14,165,233,.12); filter: blur(100px); pointer-events: none;
        }
        .footer-glow-indigo {
          position: absolute; right: -220px; bottom: -320px; width: 680px; height: 680px;
          border-radius: 999px; background: rgba(37,99,235,.10); filter: blur(110px); pointer-events: none;
        }
        .footer-heading::after {
          content: ''; display: block; width: 38px; height: 2px; margin-top: 10px;
          border-radius: 99px; background: linear-gradient(90deg, #0ea5e9, #2563eb);
        }
      `}</style>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
      <div className="footer-grid" />
      <div className="footer-glow-blue" />
      <div className="footer-glow-indigo" />

      <div className="container relative z-10 mx-auto px-4 pb-6 pt-14 sm:pt-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4 lg:pr-8">
            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-2.5 pr-4 backdrop-blur-md transition-all duration-300 hover:border-sky-400/35 hover:bg-white/[0.08]"
            >
              <img
                src={settings.logoFooter || settings.logo}
                alt={settings.siteName}
                className="h-11 w-auto rounded-lg border border-white/10 bg-white object-contain shadow-sm sm:h-12"
              />
              <span className="min-w-0">
                <span className="block text-sm font-black uppercase tracking-wider text-white">CTC</span>
                <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">
                  {getLangText(language, { vi: 'Niềm tin · Chất lượng', en: 'Trust · Quality', ko: '신뢰 · 품질', ja: '信頼 · 品質', zh: '信任 · 品质', de: 'Vertrauen · Qualität' })}
                </span>
              </span>
            </Link>

            <p className="max-w-md text-sm leading-7 text-slate-300/90">{getLangText(language, { vi: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC). Doanh nghiệp hàng đầu trong lĩnh vực xây lắp và năng lượng tái tạo.', en: 'Central Vietnam Posts and Telecommunications Construction JSC (CTC). Pioneering in renewable energy.', ko: 'CTC 전기 건설 및 컨설팅 주식회사(CTC). 재생 에너지 분야의 선구자.', ja: 'CTC電気建設コンサルティング株式会社。再生可能エネルギー分野のパイオニア。', zh: 'CTC中部越南邮电建筑股份公司。可再生能源领域的先驱。', de: 'CTC Mittel-Vietnam Post- und Telekommunikationsbau AG. Pionier im Bereich erneuerbare Energien.' })}</p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {settings.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialClass}><Facebook size={17} /></a>}
              {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialClass}><Instagram size={17} /></a>}
              {settings.youtube && <a href={settings.youtube} target="_blank" rel="noopener noreferrer" aria-label="Youtube" className={socialClass}><Youtube size={17} /></a>}
              {settings.linkedin && <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={socialClass}><Linkedin size={17} /></a>}
            </div>
          </div>

          <FooterLinkColumn title={getLangText(language, { vi: 'Liên kết nhanh', en: 'Quick Links', ko: '빠른 링크', ja: 'クイックリンク', zh: '快速链接', de: 'Schnelllinks' })} links={quickLinks} className="lg:col-span-2" linkClass={footerLinkClass} />
          <FooterLinkColumn title={getLangText(language, { vi: 'Giải pháp', en: 'Solutions', ko: '솔루션', ja: 'ソリューション', zh: '解决方案', de: 'Lösungen' })} links={solutionLinks} className="lg:col-span-3" linkClass={footerLinkClass} />

          <div className="lg:col-span-3">
            <h3 className="footer-heading mb-5 text-xs font-black uppercase tracking-[0.16em] text-white">{getLangText(language, { vi: 'Liên hệ', en: 'Contact Info', ko: '연락처', ja: '連絡先', zh: '联系方式', de: 'Kontaktinfo' })}</h3>
            <ul className="mb-5 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-sky-400/15 bg-sky-500/10 text-sky-400"><MapPin size={15} /></span>
                <span className="pt-1 leading-6">{settings.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-sky-400/15 bg-sky-500/10 text-sky-400"><Phone size={15} /></span>
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-sky-400">{settings.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-sky-400/15 bg-sky-500/10 text-sky-400"><Mail size={15} /></span>
                <a href={`mailto:${settings.email}`} className="break-all transition-colors hover:text-sky-400">{settings.email}</a>
              </li>
            </ul>

            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/10 backdrop-blur-md">
              <h5 className="mb-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-200">
                {getLangText(language, { vi: 'Đăng ký nhận tin', en: 'Subscribe to Newsletter', ko: '뉴스레터 구독', ja: 'ニュースレター登録', zh: '订阅资讯', de: 'Newsletter abonnieren' })}
              </h5>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <label htmlFor="footer-email" className="sr-only">Email</label>
                <input
                  id="footer-email"
                  type="email"
                  placeholder={getLangText(language, { vi: 'Email của bạn...', en: 'Your email...', ko: '이메일을 입력하세요...', ja: 'メールアドレス...', zh: '您的邮箱...', de: 'Ihre E-Mail...' })}
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/55 px-3.5 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/15"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label={getLangText(language, { vi: 'Đăng ký nhận tin', en: 'Subscribe', ko: '구독', ja: '登録', zh: '订阅', de: 'Abonnieren' })}
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-blue-800 text-white shadow-lg shadow-sky-950/40 transition-all hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-400/50 ${submitting ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Send size={16} />}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>{getLangText(language, { vi: '© 2026 CTC. Bảo lưu mọi quyền.', en: '© 2026 CTC. All rights reserved.', ko: '© 2026 CTC. 모든 권리 보유.', ja: '© 2026 CTC. 全著作権所有。', zh: '© 2026 CTC. 版权所有。', de: '© 2026 CTC. Alle Rechte vorbehalten.' })}</p>
          <p className="font-semibold uppercase tracking-[0.14em]">
            {getLangText(language, { vi: 'CTC · Niềm tin, Chất lượng', en: 'CTC · Trust, Quality', ko: 'CTC · 신뢰, 품질', ja: 'CTC · 信頼, 品質', zh: 'CTC · 信任, 品质', de: 'CTC · Vertrauen, Qualität' })}
          </p>
        </div>
      </div>
    </footer>
  );
};

interface FooterLinkColumnProps {
  title: string;
  links: string[][];
  className: string;
  linkClass: string;
}

const FooterLinkColumn: React.FC<FooterLinkColumnProps> = ({ title, links, className, linkClass }) => (
  <div className={className}>
    <h3 className="footer-heading mb-5 text-xs font-black uppercase tracking-[0.16em] text-white">{title}</h3>
    <ul className="space-y-3">
      {links.map(([path, label]) => (
        <li key={path}>
          <Link to={path} className={linkClass}>
            <ChevronRight size={13} className="text-sky-500/70" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
