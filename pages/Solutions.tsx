
import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Home, Droplets, ArrowRight, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

const Solutions: React.FC = () => {
  const { t } = useLanguage();

  const solutionsSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Lắp đặt hệ thống điện mặt trời",
    "provider": {
      "@type": "Organization",
      "name": "CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN TRẦN LÊ",
      "url": "https://tranle.vn",
      "telephone": "+84-236-656-2020"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Vietnam"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Giải pháp điện mặt trời",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Điện mặt trời mái nhà",
            "description": "Hệ thống điện mặt trời áp mái cho hộ gia đình và doanh nghiệp"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Điện mặt trời nông trại",
            "description": "Hệ thống điện mặt trời cho nông nghiệp và trang trại"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Điện mặt trời nổi",
            "description": "Hệ thống điện mặt trời lắp đặt trên mặt nước"
          }
        }
      ]
    }
  };

  return (
    <div className="w-full animate-fade-in font-sans text-gray-700">
       <SEO 
        title={t('solutions.hero_title')} 
        description={t('solutions.hero_desc')}
        schema={solutionsSchema}
      />

       {/* Hero Banner */}
       <div className="relative py-32 bg-corporate text-white overflow-hidden">
         <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1920&auto=format&fit=crop" 
              alt="Solar Solutions" 
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-corporate/90 to-corporate/60"></div>
         </div>
         <div className="container mx-auto px-4 text-center relative z-10">
           <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">{t('solutions.hero_title')} <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">{t('solutions.hero_subtitle')}</span></h1>
           <p className="max-w-3xl mx-auto text-lg text-gray-300 font-light animate-fade-in-up delay-100">
             {t('solutions.hero_desc')}
           </p>
         </div>
       </div>

       {/* Overview Section */}
       <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-corporate mb-4">{t('solutions.category_title')}</h2>
             <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Rooftop Card */}
             <Link to="/solutions/rooftop" className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full flex flex-col">
                <div className="h-60 overflow-hidden relative">
                   <img src="https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Rooftop"/>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <span className="text-white font-bold flex items-center gap-2">{t('common.view_details')} <ArrowRight size={18}/></span>
                   </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                   <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Home size={32}/>
                   </div>
                   <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">{t('solutions.rooftop')}</h3>
                   <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                      {t('solutions.rooftop_desc')}
                   </p>
                   <span className="mt-auto text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">{t('solutions.discover')} <ArrowRight size={16}/></span>
                </div>
             </Link>

             {/* Farm Card */}
             <Link to="/solutions/farm" className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full flex flex-col">
                <div className="h-60 overflow-hidden relative">
                   <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Farm"/>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <span className="text-white font-bold flex items-center gap-2">{t('common.view_details')} <ArrowRight size={18}/></span>
                   </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                   <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 mb-6 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                      <Sun size={32}/>
                   </div>
                   <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-yellow-600 transition-colors">{t('solutions.farm')}</h3>
                   <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                      {t('solutions.farm_desc')}
                   </p>
                   <span className="mt-auto text-yellow-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">{t('solutions.discover')} <ArrowRight size={16}/></span>
                </div>
             </Link>

             {/* Floating Card */}
             <Link to="/solutions/floating" className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full flex flex-col">
                <div className="h-60 overflow-hidden relative">
                   <img src="https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Floating"/>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <span className="text-white font-bold flex items-center gap-2">{t('common.view_details')} <ArrowRight size={18}/></span>
                   </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                   <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Droplets size={32}/>
                   </div>
                   <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">{t('solutions.floating')}</h3>
                   <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                      {t('solutions.floating_desc')}
                   </p>
                   <span className="mt-auto text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">{t('solutions.discover')} <ArrowRight size={16}/></span>
                </div>
             </Link>
          </div>
       </div>

       {/* CTA */}
       <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
             <h3 className="text-2xl font-bold text-corporate mb-4">{t('solutions.cta_title')}</h3>
             <p className="text-gray-600 mb-8 max-w-2xl mx-auto">{t('solutions.cta_desc')}</p>
             <Link to="/contact" className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-primary/40">
                <Zap size={18} /> {t('solutions.cta_btn')}
             </Link>
          </div>
       </div>
    </div>
  );
};

export default Solutions;
