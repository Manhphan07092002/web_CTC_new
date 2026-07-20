
import React from 'react';
import SEO from '../components/SEO';
import { FloatingHero, FloatingContent } from '../components/solutions';

const SolutionFloating: React.FC = () => {
  return (
    <div className="w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20 bg-gray-50 dark:bg-gray-900">
      <SEO 
        title="Hệ Thống Năng Lượng Mặt Trời Nổi" 
        description="Công nghệ điện mặt trời nổi trên hồ chứa, đập thủy điện. Xu hướng mới giúp tiết kiệm đất và tăng hiệu suất. CTC - 0915 059 666"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Điện mặt trời nổi (Floating Solar)",
          "description": "Công nghệ điện mặt trời nổi trên hồ chứa, đập thủy điện, tiết kiệm đất và tăng hiệu suất",
          "provider": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn",
            "telephone": "+84-915-059-666"
          },
          "areaServed": "Vietnam",
          "serviceType": "Lắp đặt hệ thống điện mặt trời nổi"
        }}
      />

      <FloatingHero />
      <FloatingContent />
    </div>
  );
};

export default SolutionFloating;
