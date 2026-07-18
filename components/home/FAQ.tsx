import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';
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
    <section ref={faqRef} className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className={`transition-all duration-300 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
              <HelpCircle size={18} className="text-blue-600" />
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{t('home.support_badge')}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">{t('home.faq_title')}</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">{t('home.faq_desc')}</p>
            
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl group">
              <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="FAQ" className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="font-bold text-xl mb-2">{t('home.need_help')}</p>
                <Link to="/contact" className="inline-flex items-center gap-2 text-white/90 hover:text-white hover:underline">
                  {t('home.contact_advisor')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
          
          <div className={`space-y-6 transition-all duration-300 delay-100 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {faqs.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-6 text-left font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-4 text-lg">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${openFaqIndex === idx ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'} transition-colors`}>
                      {idx + 1}
                    </span>
                    {item.q}
                  </span>
                  <div className={`transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180 text-primary' : 'text-gray-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div className={`px-6 text-gray-600 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${openFaqIndex === idx ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pl-12 border-l-2 border-gray-100 ml-4">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
