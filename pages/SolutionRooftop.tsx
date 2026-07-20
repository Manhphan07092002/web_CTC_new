
import React from 'react';
import SEO from '../components/SEO';
import { RooftopHero, RooftopContent } from '../components/solutions';

const SolutionRooftop: React.FC = () => {
  return (
    <div className="w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20">
      <SEO 
        title="Điện Mặt Trời Áp Mái" 
        description="Giải pháp điện mặt trời áp mái cho hộ gia đình và doanh nghiệp. Tiết kiệm chi phí, bảo vệ môi trường. CTC - 0915 059 666"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Lắp đặt điện mặt trời áp mái",
          "description": "Giải pháp điện mặt trời áp mái cho hộ gia đình và doanh nghiệp",
          "provider": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn",
            "telephone": "+84-915-059-666"
          },
          "areaServed": "Vietnam",
          "serviceType": "Lắp đặt hệ thống điện mặt trời"
        }}
      />

      <RooftopHero />
      <RooftopContent />
    </div>
  );
};

export default SolutionRooftop;
