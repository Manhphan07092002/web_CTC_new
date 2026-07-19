import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Loader2, Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import analyticsTracking from '../../services/analytics-tracking';

const getContactApiUrl = () => {
  const viteEnv = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env;
  if (viteEnv?.VITE_API_URL) return `${viteEnv.VITE_API_URL.replace(/\/+$/, '')}/contact/submit`;
  return `${window.location.protocol}//${window.location.hostname}:4000/api/contact/submit`;
};

const CTA: React.FC = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const isEn = language === 'en';
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: isEn ? 'EPC consultation' : 'Tư vấn giải pháp EPC',
    message: ''
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch(getContactApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(result.error || 'Failed to submit contact request');

      setStatus('success');
      showToast('✅ ' + (result.message || (isEn ? 'Your request has been sent.' : 'Đã gửi yêu cầu liên hệ.')), 'success');
      analyticsTracking.trackContactRequest(formData.service, { name: formData.name, email: formData.email });
      setFormData({ name: '', phone: '', email: '', service: isEn ? 'EPC consultation' : 'Tư vấn giải pháp EPC', message: '' });
      window.setTimeout(() => setStatus('idle'), 3500);
    } catch (error) {
      console.error('Error submitting CTA contact form:', error);
      showToast(isEn ? 'Unable to send. Please try again.' : 'Không thể gửi liên hệ. Vui lòng thử lại.', 'error');
      setStatus('idle');
    }
  };

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-slate-50 dark:bg-[#060d1d] transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        .cta-contact-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .cta-contact-card {
          box-shadow: 0 30px 80px -30px rgba(0, 59, 92, .35);
        }
        .cta-contact-input {
          background: rgba(255,255,255,.98);
          color: #172033;
          border: 1px solid rgba(255,255,255,.78);
          box-shadow: 0 8px 18px -14px rgba(0,0,0,.35);
        }
        .cta-contact-input:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56,189,248,.2);
        }
      `}} />

      <div className="absolute inset-0 opacity-40 cta-contact-grid pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="cta-contact-card max-w-6xl mx-auto overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#003b5c] via-[#0069ad] to-[#007cb9]">
          <div className="grid lg:grid-cols-[1.08fr_.92fr] min-h-[560px]">
            <div className="relative p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
              <div className="absolute inset-0 opacity-50 cta-contact-grid pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sky-100 text-xs font-black uppercase tracking-widest mb-6">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  {isEn ? 'CTC CONTACT CENTER' : 'TRUNG TÂM LIÊN HỆ CTC'}
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                  {isEn ? 'Let’s build a better solution' : 'Liên Hệ Hợp Tác'}
                </h2>
                <p className="text-sky-100/85 text-sm sm:text-base leading-relaxed max-w-xl mb-8">
                  {isEn ? 'Tell us about your project. Our technical team will contact you with a suitable EPC or renewable-energy solution.' : 'Hãy chia sẻ nhu cầu của bạn. Đội ngũ kỹ thuật CTC sẽ liên hệ để tư vấn giải pháp EPC và năng lượng tái tạo phù hợp.'}
                </p>

                {status === 'success' ? (
                  <div className="rounded-2xl bg-white/10 border border-emerald-300/30 p-6 text-white" role="status">
                    <CheckCircle size={32} className="text-emerald-300 mb-3" />
                    <h3 className="font-black text-xl mb-2">{t('contact.success')}</h3>
                    <p className="text-sky-100/80">{isEn ? 'We will contact you shortly.' : 'CTC sẽ liên hệ với bạn trong thời gian sớm nhất.'}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="cta-name" className="block text-xs font-bold text-white mb-1.5">{t('contact.name')} *</label>
                      <input id="cta-name" required type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className="cta-contact-input w-full rounded-xl px-4 py-3 text-sm" placeholder={isEn ? 'Your full name' : 'Họ và tên'} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cta-phone" className="block text-xs font-bold text-white mb-1.5">{t('contact.phone')} *</label>
                        <input id="cta-phone" required type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className="cta-contact-input w-full rounded-xl px-4 py-3 text-sm" placeholder="0915 059 666" />
                      </div>
                      <div>
                        <label htmlFor="cta-email" className="block text-xs font-bold text-white mb-1.5">{t('contact.email')} *</label>
                        <input id="cta-email" required type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className="cta-contact-input w-full rounded-xl px-4 py-3 text-sm" placeholder="email@example.com" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cta-message" className="block text-xs font-bold text-white mb-1.5">{t('contact.message')} *</label>
                      <textarea id="cta-message" required rows={4} value={formData.message} onChange={(e) => updateField('message', e.target.value)} className="cta-contact-input w-full rounded-xl px-4 py-3 text-sm resize-y" placeholder={isEn ? 'Tell us about your project...' : 'Nội dung cần tư vấn...'} />
                    </div>

                    <button type="submit" disabled={status === 'submitting'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 font-black transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-950/20 disabled:opacity-70 disabled:cursor-not-allowed">
                      {status === 'submitting' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      {status === 'submitting' ? (isEn ? 'Sending...' : 'Đang gửi...') : (t('contact.submit') || (isEn ? 'Send request' : 'Gửi liên hệ'))}
                      <ArrowRight size={17} />
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="relative min-h-[300px] lg:min-h-full overflow-hidden">
              <img src="/images/about_solar_install.webp" alt={isEn ? 'CTC solar installation team' : 'Đội ngũ CTC thi công điện mặt trời'} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0069ad] via-[#0069ad]/50 to-transparent lg:from-[#0069ad] lg:via-[#0069ad]/15 lg:to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-slate-950/35 backdrop-blur-md border border-white/20 p-5 text-white">
                <div className="text-xs uppercase tracking-widest text-sky-100 mb-2">CTC EPC</div>
                <div className="text-xl font-black">{isEn ? 'Total solutions. Sustainable value.' : 'Giải pháp tổng thể – Giá trị bền vững.'}</div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-sky-100/90">
                  <span>32+ {isEn ? 'years' : 'năm'}</span>
                  <span>500+ {isEn ? 'projects' : 'dự án'}</span>
                  <span>0915 059 666</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
