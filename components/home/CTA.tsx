import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Phone, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const CTA: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-32 bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-l from-blue-500/5 to-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container max-w-[1440px] mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-orange-500/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.cta_badge')}</span>
          </div>
          
          {/* Main Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-6 sm:mb-8 leading-[1.3] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent max-w-4xl mx-auto text-balance py-2 sm:py-4 px-4 sm:px-0">
            <span className="block">{t('home.cta_title_1')}</span>
            <span className="block">{t('home.cta_title_2')}</span>
          </h2>
          
          {/* Description */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-slate-300 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto font-light px-4 sm:px-0">
            {t('home.ready_desc')}
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
            <Link to="/contact" className="group relative inline-flex bg-gradient-to-r from-primary via-orange-500 to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-200 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl hover:shadow-primary/30 items-center gap-3 sm:gap-4 text-base sm:text-lg overflow-hidden w-full sm:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <Zap size={24} className="group-hover:animate-pulse relative z-10" />
              <span className="relative z-10">{t('home.contact_consult')}</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
            </Link>
            
            <a href="tel:0915059666" className="group inline-flex items-center gap-3 text-gray-700 dark:text-slate-300 hover:text-primary font-semibold transition-colors duration-300 w-full sm:w-auto justify-center sm:justify-start">
              <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 group-hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors duration-300">
                <Phone size={20} className="group-hover:animate-bounce" />
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500 dark:text-slate-400">{t('home.call_now')}</div>
                <div className="font-bold text-base sm:text-lg dark:text-white">0915 059 666</div>
              </div>
            </a>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>{t('home.free_consult')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>{t('home.warranty_25')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>{t('home.save_70')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
