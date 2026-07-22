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
  const { t } = useLanguage();
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

      showToast('Đăng ký nhận tin thành công! Cảm ơn bạn.', 'success');
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
      showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
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
    ['/track-order', 'Tra cứu đơn hàng'],
  ];

  const solutionLinks: [string, string][] = [
    ['/solutions/rooftop', 'Điện mặt trời Áp mái'],
    ['/solutions/farm', 'Trang trại Điện mặt trời'],
    ['/solutions/floating', 'Điện mặt trời Nổi'],
    ['/solutions/electrical', 'Trạm biến áp & Đường dây'],
    ['/solutions/datacenter', 'Hạ tầng CNTT & Data Center'],
    ['/solutions/construction', 'Xây lắp Hạ tầng kỹ thuật'],
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
                <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">Niềm tin · Chất lượng</span>
              </span>
            </Link>

            <p className="max-w-md text-sm leading-7 text-slate-300/90">{t('footer.desc')}</p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {settings.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialClass}><Facebook size={17} /></a>}
              {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialClass}><Instagram size={17} /></a>}
              {settings.youtube && <a href={settings.youtube} target="_blank" rel="noopener noreferrer" aria-label="Youtube" className={socialClass}><Youtube size={17} /></a>}
              {settings.linkedin && <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={socialClass}><Linkedin size={17} /></a>}
            </div>
          </div>

          <FooterLinkColumn title={t('footer.quick_links')} links={quickLinks} className="lg:col-span-2" linkClass={footerLinkClass} />
          <FooterLinkColumn title={t('footer.solutions_title')} links={solutionLinks} className="lg:col-span-3" linkClass={footerLinkClass} />

          <div className="lg:col-span-3">
            <h3 className="footer-heading mb-5 text-xs font-black uppercase tracking-[0.16em] text-white">{t('footer.contact_title')}</h3>
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
              <h5 className="mb-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-200">Đăng ký nhận tin</h5>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <label htmlFor="footer-email" className="sr-only">Email</label>
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Email của bạn..."
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/55 px-3.5 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/15"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="Đăng ký nhận tin"
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-blue-800 text-white shadow-lg shadow-sky-950/40 transition-all hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-400/50 ${submitting ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Send size={16} />}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>{t('footer.copyright')}</p>
          <p className="font-semibold uppercase tracking-[0.14em]">CTC · Niềm tin, Chất lượng</p>
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
