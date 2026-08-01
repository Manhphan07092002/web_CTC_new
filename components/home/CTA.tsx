import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Loader2, Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import analyticsTracking from '../../services/analytics-tracking';
import { getLangText } from '../../utils/translation-helper';

const getContactApiUrl = () => {
  const viteEnv = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env;
  if (viteEnv?.VITE_API_URL) return `${viteEnv.VITE_API_URL.replace(/\/+$/, '')}/contact/submit`;
  const port = window.location.port;
  if (!port || port === '80' || port === '443') {
    return '/api/contact/submit';
  }
  return `${window.location.protocol}//${window.location.hostname}:4000/api/contact/submit`;
};

const CTA: React.FC = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: getLangText(language, { vi: 'Tư vấn giải pháp EPC', en: 'EPC consultation', ko: 'EPC 솔루션 상담', ja: 'EPCソリューションコンサルティング', zh: 'EPC 解决方案咨询', de: 'EPC-Lösungsberatung' }),
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
      showToast('✅ ' + (result.message || getLangText(language, { vi: 'Đã gửi yêu cầu liên hệ.', en: 'Your request has been sent.', ko: '요청이 전송되었습니다.', ja: 'リクエストが送信されました。', zh: '您的请求已发送。', de: 'Ihre Anfrage wurde gesendet.' })), 'success');
      analyticsTracking.trackContactRequest(formData.service, { name: formData.name, email: formData.email });
      setFormData({ name: '', phone: '', email: '', service: getLangText(language, { vi: 'Tư vấn giải pháp EPC', en: 'EPC consultation', ko: 'EPC 솔루션 상담', ja: 'EPCソリューションコンサルティング', zh: 'EPC 解决方案咋议', de: 'EPC-Lösungsberatung' }), message: '' });
      window.setTimeout(() => setStatus('idle'), 3500);
    } catch (error) {
      console.error('Error submitting CTA contact form:', error);
      showToast(getLangText(language, { vi: 'Không thể gửi liên hệ. Vui lòng thử lại.', en: 'Unable to send. Please try again.', ko: '전송할 수 없습니다. 다시 시도해주세요.', ja: '送信できませんでした。もう一度お試しください。', zh: '无法发送，请重试。', de: 'Senden nicht möglich. Bitte versuchen Sie es erneut.' }), 'error');
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
                  {getLangText(language, {
                    vi: 'TRUNG TÂM LIÊN HỆ CTC',
                    en: 'CTC CONTACT CENTER',
                    ko: 'CTC 문의 센터',
                    ja: 'CTCコンタクトセンター',
                    zh: 'CTC 联系中心',
                    de: 'CTC KONTAKTZENTRUM'
                  })}
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                  {getLangText(language, {
                    vi: 'Liên Hệ Hợp Tác',
                    en: 'Let’s build a better solution',
                    ko: '더 우수한 솔루션을 함께 구축합시다',
                    ja: 'より優れたソリューションを共に構築しましょう',
                    zh: '共创更优解决方案',
                    de: 'Lassen Sie uns eine bessere Lösung bauen'
                  })}
                </h2>
                <p className="text-sky-100/85 text-sm sm:text-base leading-relaxed max-w-xl mb-8">
                  {getLangText(language, {
                    vi: 'Hãy chia sẻ nhu cầu của bạn. Đội ngũ kỹ thuật CTC sẽ liên hệ để tư vấn giải pháp EPC và năng lượng tái tạo phù hợp.',
                    en: 'Tell us about your project. Our technical team will contact you with a suitable EPC or renewable-energy solution.',
                    ko: '프로젝트에 대해 알려주세요. CTC 기술팀이 적합한 EPC 및 재생 에너지 솔루션을 가지고 연락드리겠습니다.',
                    ja: 'プロジェクトについてお聞かせください。CTCの技術チームが最適なEPCおよび再生可能エネルギーソリューションをご提案いたします。',
                    zh: '请告知您的项目需求。CTC技术团队将即刻为您 matches 最适合的EPC与可再生能源解决方案。',
                    de: 'Teilen Sie uns Ihr Projekt mit. Unser Technikerteam wird Sie umgehend kontaktieren.'
                  })}
                </p>

                {status === 'success' ? (
                  <div className="rounded-2xl bg-white/10 border border-emerald-300/30 p-6 text-white" role="status">
                    <CheckCircle size={32} className="text-emerald-300 mb-3" />
                    <h3 className="font-black text-xl mb-2">{t('contact.success')}</h3>
                    <p className="text-sky-100/80">
                      {getLangText(language, {
                        vi: 'CTC sẽ liên hệ với bạn trong thời gian sớm nhất.',
                        en: 'We will contact you shortly.',
                        ko: 'CTC에서 빠른 시일 내에 연락드리겠습니다.',
                        ja: 'CTCより折り返しご連絡いたします。',
                        zh: 'CTC 将尽快与您取得联系。',
                        de: 'Wir werden Sie in Kürze kontaktieren.'
                      })}
                    </p>
                  </div>
                ) : (
                  <form 
                    onSubmit={handleSubmit} 
                    toolname="quick_ctc_consultation"
                    tooldescription="Form đăng ký nhận tư vấn giải pháp nhanh từ đội ngũ kỹ sư CTC"
                    className="space-y-4" 
                    noValidate
                  >
                    <div>
                      <label htmlFor="cta-name" className="block text-xs font-bold text-white mb-1.5">{getLangText(language, { vi: 'Họ và tên', en: 'Full Name', ko: '성명', ja: 'お名前', zh: '姓名', de: 'Vollständiger Name' })} *</label>
                      <input
                        id="cta-name"
                        required
                        type="text"
                        name="name"
                        toolparamdescription="Họ và tên người dùng"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="cta-contact-input w-full rounded-xl px-4 py-3 text-sm"
                        placeholder={getLangText(language, {
                          vi: 'Họ và tên',
                          en: 'Your full name',
                          ko: '성함을 입력하세요',
                          ja: 'お名前を入力してください',
                          zh: '请输入您的姓名',
                          de: 'Ihr vollständiger Name'
                        })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cta-phone" className="block text-xs font-bold text-white mb-1.5">{getLangText(language, { vi: 'Số điện thoại', en: 'Phone Number', ko: '전화번호', ja: '電話番号', zh: '电话号码', de: 'Telefonnummer' })} *</label>
                        <input id="cta-phone" required type="tel" name="phone" toolparamdescription="Số điện thoại liên hệ" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className="cta-contact-input w-full rounded-xl px-4 py-3 text-sm" placeholder="0915 059 666" />
                      </div>
                      <div>
                        <label htmlFor="cta-email" className="block text-xs font-bold text-white mb-1.5">{t('contact.email')} *</label>
                        <input id="cta-email" required type="email" name="email" toolparamdescription="Địa chỉ Email nhận thông tin" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className="cta-contact-input w-full rounded-xl px-4 py-3 text-sm" placeholder="email@example.com" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cta-message" className="block text-xs font-bold text-white mb-1.5">{getLangText(language, { vi: 'Nội dung', en: 'Message', ko: '메시지', ja: '内容', zh: '内容', de: 'Nachricht' })} *</label>
                      <textarea
                        id="cta-message"
                        required
                        rows={4}
                        name="message"
                        toolparamdescription="Nội dung nhu cầu cần tư vấn kỹ thuật"
                        value={formData.message}
                        onChange={(e) => updateField('message', e.target.value)}
                        className="cta-contact-input w-full rounded-xl px-4 py-3 text-sm resize-y"
                        placeholder={getLangText(language, {
                          vi: 'Nội dung cần tư vấn...',
                          en: 'Tell us about your project...',
                          ko: '프로젝트 내용을 입력하세요...',
                          ja: 'プロジェクトの詳細をご記入ください...',
                          zh: '请输入项目需求或咨询内容...',
                          de: 'Beschreiben Sie Ihr Projekt...'
                        })}
                      />
                    </div>

                    <button type="submit" disabled={status === 'submitting'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 font-black transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-950/20 disabled:opacity-70 disabled:cursor-not-allowed">
                      {status === 'submitting' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      {status === 'submitting'
                        ? getLangText(language, { vi: 'Đang gửi...', en: 'Sending...', ko: '전송 중...', ja: '送信中...', zh: '发送中...', de: 'Wird gesendet...' })
                        : getLangText(language, { vi: 'Gửi yêu cầu', en: 'Send request', ko: '요청 보내기', ja: 'リクエストを送信', zh: '发送请求', de: 'Anfrage senden' })
                      }
                      <ArrowRight size={17} />
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="relative min-h-[300px] lg:min-h-full overflow-hidden">
              <img src="/images/about_solar_install.webp" alt="CTC solar installation team" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0069ad] via-[#0069ad]/50 to-transparent lg:from-[#0069ad] lg:via-[#0069ad]/15 lg:to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-slate-950/35 backdrop-blur-md border border-white/20 p-5 text-white">
                <div className="text-xs uppercase tracking-widest text-sky-100 mb-2">CTC EPC</div>
                <div className="text-xl font-black">
                  {getLangText(language, {
                    vi: 'Giải pháp tổng thể – Giá trị bền vững.',
                    en: 'Total solutions. Sustainable value.',
                    ko: '종합 솔루션. 지속 가능한 가치.',
                    ja: '総合ソリューション・持続可能な価値。',
                    zh: '综合解决方案 - 可持续价值。',
                    de: 'Gesamtlösungen. Nachhaltiger Wert.'
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-sky-100/90">
                  <span>32+ {getLangText(language, { vi: 'năm', en: 'years', ko: '년', ja: '年', zh: '年', de: 'Jahre' })}</span>
                  <span>500+ {getLangText(language, { vi: 'dự án', en: 'projects', ko: '프로젝트', ja: 'プロジェクト', zh: '项目', de: 'Projekte' })}</span>
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
