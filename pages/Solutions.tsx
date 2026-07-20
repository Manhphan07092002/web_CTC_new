
import React from 'react';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';
import { SolutionsHero, SolutionsOverview, SolutionsCTA } from '../components/solutions';

const Solutions: React.FC = () => {
  const { t } = useLanguage();

  const solutionsSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Lắp đặt hệ thống điện mặt trời",
    "provider": {
      "@type": "Organization",
      "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
      "url": "https://www.ctcdn.vn",
      "telephone": "+84-915-059-666"
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

      <SolutionsHero />
      <SolutionsOverview />
      <SolutionsCTA />
    </div>
  );
};

export default Solutions;
