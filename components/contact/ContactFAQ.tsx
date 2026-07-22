import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const ContactFAQ: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { number: '01', q: t('home.faq_1_q'), a: t('home.faq_1_a') },
    { number: '02', q: t('home.faq_2_q'), a: t('home.faq_2_a') },
    { number: '03', q: t('home.faq_3_q'), a: t('home.faq_3_a') },
    { number: '04', q: t('home.faq_4_q'), a: t('home.faq_4_a') }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mb-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="px-3.5 py-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-300 text-xs font-black rounded-full uppercase tracking-widest border border-amber-500/30 backdrop-blur-md">
          {t('home.support_badge') || 'GIẢI ĐÁP THẮC MẮC'}
        </span>
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-3 mb-2">
          {t('home.faq_title') || 'Câu Hỏi Thường Gặp (FAQ)'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t('home.faq_desc') || 'Giải đáp những thắc mắc phổ biến của khách hàng về dịch vụ EPC, viễn thông và năng lượng tái tạo của CTC.'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={`contact-faq-exact-${idx}`}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-gray-700/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-gray-900 dark:text-white hover:text-amber-500 transition-colors text-base"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300 text-xs font-black flex items-center justify-center flex-shrink-0 border border-amber-500/30 backdrop-blur-md">
                    {faq.number}
                  </span>
                  <span className="leading-snug">{faq.q}</span>
                </div>
                {isOpen ? (
                  <ChevronUp size={20} className="text-amber-500 flex-shrink-0" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-200/60 dark:border-gray-700/60 pt-4 animate-fade-in pl-16 whitespace-pre-line">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactFAQ;
