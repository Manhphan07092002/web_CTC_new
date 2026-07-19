import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ArrowRight, Phone, MessageCircle, Sparkles, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';

const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const { ref: faqRef, isInView } = useInView(0.1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    { q: t('home.faq_1_q'), a: t('home.faq_1_a') },
    { q: t('home.faq_2_q'), a: t('home.faq_2_a') },
    { q: t('home.faq_3_q'), a: t('home.faq_3_a') },
    { q: t('home.faq_4_q'), a: t('home.faq_4_a') }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section ref={faqRef} className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Dynamic Styling Tag for Glassmorphism & Animations */}
      <style>{`
        .faq-bg-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
        }
        .dark .faq-bg-grid {
          background-image: radial-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px);
        }
        
        .faq-glow-orb-1 {
          position: absolute;
          width: 500px;
          height: 500px;
          top: -10%;
          left: -10%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }
        .dark .faq-glow-orb-1 {
          background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
        }

        .faq-glow-orb-2 {
          position: absolute;
          width: 500px;
          height: 500px;
          bottom: -10%;
          right: -10%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }
        .dark .faq-glow-orb-2 {
          background: radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%);
        }

        /* Glassmorphism item design */
        .faq-glass-item {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 246, 255, 0.6) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 15px -5px rgba(0, 0, 0, 0.02), inset 0 1px 2px rgba(255, 255, 255, 0.8);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dark .faq-glass-item {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.03);
        }

        .faq-glass-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px -8px rgba(0, 0, 0, 0.05);
          border-color: rgba(59, 130, 246, 0.3);
        }
        .dark .faq-glass-item:hover {
          box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.4);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .faq-active-item {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(219, 234, 254, 0.85) 100%) !important;
          border-color: rgba(59, 130, 246, 0.5) !important;
          box-shadow: 0 20px 40px -15px rgba(59, 130, 246, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9) !important;
        }
        .dark .faq-active-item {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(30, 41, 59, 0.7) 100%) !important;
          border-color: rgba(59, 130, 246, 0.4) !important;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3) !important;
        }

        /* Floating support card */
        .faq-support-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(225, 235, 250, 0.7) 100%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.9);
        }
        .dark .faq-support-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
        }

        /* Modern clip-path layout */
        .faq-img-mask {
          clip-path: polygon(0 0, 100% 0, 100% 88%, 0% 100%);
        }
      `}</style>

      {/* Background decorations */}
      <div className="faq-bg-grid" />
      <div className="faq-glow-orb-1" />
      <div className="faq-glow-orb-2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Title area - Left-aligned with Modern Gradient Text & Left Accent Dot Line */}
        <div className={`text-left mb-16 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100/80 dark:border-blue-800/30 px-5 py-2 rounded-full mb-5 shadow-sm">
            <HelpCircle size={15} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t('home.support_badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white tracking-tight mb-5 py-2 leading-normal">
            {t('home.faq_title')}
          </h2>
          
          {/* Accent Separator: centered pulsing blue dot with symmetric fading lines */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-blue-500/60" />
            <div className="relative w-2.5 h-2.5">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
              <div className="relative w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            </div>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-blue-500/60" />
          </div>
          
          <p className="text-gray-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl font-medium leading-relaxed">
            {t('home.faq_desc')}
          </p>
        </div>

        {/* Grid Content */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ── Left Column: Interactive High-Tech Support Dashboard (Col 5) ── */}
          <div className={`lg:col-span-5 flex flex-col justify-between faq-support-card rounded-[2rem] overflow-hidden transition-all duration-700 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            
            {/* Edge-to-edge bleed visual header */}
            <div className="relative aspect-[16/10] overflow-hidden group">
              <img
                src="/images/faq-support.webp"
                alt="CTC Technical Team"
                width="1024"
                height="1024"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
              {/* Soft overlay gradient to melt image into the card */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-900 via-transparent to-black/35" />
              
              {/* Floating glass overlay tag */}
              <div className="absolute top-4 left-4 bg-black/45 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Shield size={12} className="text-blue-400" />
                <span>Năng lực Bộ Xây dựng cấp</span>
              </div>
            </div>

            {/* Inner details with proper padding */}
            <div className="p-8 flex-grow flex flex-col justify-between">
              {/* Support Message */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:text-blue-400 animate-ping" />
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 tracking-widest uppercase">TRUNG TÂM HỖ TRỢ CTC</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-3">
                  {t('home.need_help')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                  Hãy trao đổi trực tiếp với đội ngũ kỹ sư của CTC để có giải pháp tối ưu cho hạ tầng của bạn.
                </p>
              </div>

              {/* Quick action buttons - side-by-side 1 row layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Hotline Action - Premium glass gradient */}
                <a
                  href="tel:0915059666"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md transition-all duration-300 hover:scale-[1.02] border border-blue-400/20 group"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Phone size={16} className="text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[9px] text-blue-100 font-bold uppercase tracking-wider truncate">Hotline 24/7</p>
                    <p className="font-extrabold text-sm sm:text-base truncate">0915.059.666</p>
                  </div>
                </a>

                {/* Consultation Online - Translucent frosted glass */}
                <Link
                  to="/contact"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/40 dark:bg-slate-800/40 hover:bg-white/70 dark:hover:bg-slate-800/70 border border-gray-200/60 dark:border-slate-700/60 text-gray-800 dark:text-white transition-all duration-300 hover:scale-[1.02] group"
                >
                  <div className="w-10 h-10 bg-blue-600/10 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <MessageCircle size={16} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold truncate">Tư vấn trực tiếp</p>
                    <p className="font-bold text-xs sm:text-sm truncate">{t('home.contact_advisor')}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Right Column: High-tech Glassmorphism Accordion List (Col 7) ── */}
          <div className={`lg:col-span-7 space-y-4 transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {faqs.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`faq-glass-item rounded-2xl ${isOpen ? 'faq-active-item' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`home-faq-answer-${idx}`}
                    className="w-full flex justify-between items-center gap-4 p-5 sm:p-6 text-left"
                  >
                    <span className="flex items-center gap-4">
                      {/* Premium Number Badge */}
                      <span className={`flex-shrink-0 text-xl font-black italic select-none ${
                        isOpen ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-gray-300 dark:text-slate-600'
                      } transition-all duration-300`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      
                      {/* Question Text */}
                      <span className={`font-bold text-sm sm:text-base transition-colors duration-300 ${
                        isOpen ? 'text-blue-900 dark:text-blue-300' : 'text-gray-800 dark:text-slate-200'
                      }`}>
                        {item.q}
                      </span>
                    </span>
                    
                    {/* Toggle Icon wrapper */}
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isOpen
                        ? 'border-blue-400/40 bg-blue-100/50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rotate-180'
                        : 'border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500'
                    }`}>
                      <ChevronDown size={16} />
                    </span>
                  </button>

                  {/* Expandable answer panel */}
                  <div id={`home-faq-answer-${idx}`} className={`overflow-hidden transition-all duration-400 ease-in-out ${
                    isOpen ? 'max-h-[500px] border-t border-blue-100/40 dark:border-slate-700/30' : 'max-h-0'
                  }`}>
                    <div className="p-5 sm:p-6 bg-blue-50/20 dark:bg-slate-900/10">
                      <div className="pl-6 border-l-2 border-blue-500/50">
                        <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQ;
