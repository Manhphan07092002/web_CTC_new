import React from 'react';
import SEO from '../components/SEO';
import { FarmHero, FarmContent } from '../components/solutions';

const SolutionFarm: React.FC = () => {
  return (
    <div className="w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20">
      <SEO 
        title="Trang Trại Điện Mặt Trời" 
        description="Giải pháp đầu tư trang trại năng lượng mặt trời quy mô lớn (Solar Farm). Kết nối lưới điện quốc gia. CTC - 0915 059 666"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Trang trại điện mặt trời (Solar Farm)",
          "description": "Giải pháp đầu tư trang trại năng lượng mặt trời quy mô lớn, kết nối lưới điện quốc gia",
          "provider": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn",
            "telephone": "+84-915-059-666"
          },
          "areaServed": "Vietnam",
          "serviceType": "Tư vấn và xây dựng trang trại điện mặt trời"
        }}
      />

      <FarmHero />
      <FarmContent />
    </div>
  );
};

export default SolutionFarm;
