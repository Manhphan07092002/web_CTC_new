
import React, { useState } from 'react';
import { Facebook, Linkedin, Mail, MapPin, Phone, Youtube, Send, Instagram } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [email, setEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:4000/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Đăng ký nhận tin',
          phone: 'N/A',
          email: email,
          service: 'Newsletter - Đăng ký nhận tin tức',
          message: 'Khách hàng đăng ký nhận bản tin qua email từ Footer'
        })
      });

      const result = await response.json();

      if (response.ok) {
        showToast('✅ Đăng ký nhận tin thành công! Cảm ơn bạn.', 'success');
        setEmail('');
      } else {
        throw new Error(result.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      showToast('❌ Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-corporate text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <img 
                src={settings.logoFooter || settings.logo} 
                alt={settings.siteName} 
                className="h-16 sm:h-20 w-auto object-contain rounded-lg" 
              />
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="flex gap-4">
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors">
                  <Facebook size={18} />
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors">
                  <Instagram size={18} />
                </a>
              )}
              {settings.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors">
                  <Youtube size={18} />
                </a>
              )}
              {settings.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors">
                  <Linkedin size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-l-4 border-primary pl-3">{t('footer.quick_links')}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#/about" className="hover:text-primary transition-colors">{t('nav.about')}</a></li>
              <li><a href="#/products" className="hover:text-primary transition-colors">{t('nav.products')}</a></li>
              <li><a href="#/projects" className="hover:text-primary transition-colors">{t('nav.projects')}</a></li>
              <li><a href="#/news" className="hover:text-primary transition-colors">{t('nav.news')}</a></li>
              <li><a href="#/contact" className="hover:text-primary transition-colors">{t('nav.contact')}</a></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-l-4 border-primary pl-3">{t('footer.solutions_title')}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#/solutions/rooftop" className="hover:text-primary transition-colors">{t('solutions.rooftop')}</a></li>
              <li><a href="#/solutions/farm" className="hover:text-primary transition-colors">{t('solutions.farm')}</a></li>
              <li><a href="#/solutions/floating" className="hover:text-primary transition-colors">{t('solutions.floating')}</a></li>
              <li><a href="#/solutions" className="hover:text-primary transition-colors">{t('solutions.hero_subtitle')}</a></li>
            </ul>
          </div>

          {/* Contact Info & Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-l-4 border-primary pl-3">{t('footer.contact_title')}</h3>
            <ul className="space-y-3 text-sm text-gray-300 mb-6">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">{settings.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-primary transition-colors">{settings.email}</a>
              </li>
            </ul>
            
            {/* Newsletter Form */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
               <h5 className="text-xs font-bold text-gray-300 uppercase mb-2">Đăng ký nhận tin</h5>
               <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Email..." 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  />
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className={`bg-primary hover:bg-secondary text-white p-1.5 rounded transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? (
                      <div className="animate-spin">⏳</div>
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
               </form>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
