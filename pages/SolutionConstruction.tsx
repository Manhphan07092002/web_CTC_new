import React from 'react';
import SEO from '../components/SEO';
import { ConstructionHero, ConstructionContent } from '../components/solutions';

const SolutionConstruction: React.FC = () => {
  return (
    <div className="flex flex-col w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20">
      <SEO 
        title="Xây Dựng Dân Dụng & Công Nghiệp | Tổng Thầu Thi Công CTC" 
        description="Tổng thầu thi công xây dựng nhà xưởng, hạ tầng công nghiệp, tòa nhà văn phòng & công trình chuyên dụng với hơn 20 năm kinh nghiệm & 500+ dự án." 
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Thi công xây dựng dân dụng & công nghiệp",
          "description": "Dịch vụ tổng thầu xây dựng nhà xưởng công nghiệp, hạ tầng cơ sở, công trình dân dụng và viễn thông.",
          "provider": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn",
            "telephone": "+84-915-059-666"
          },
          "areaServed": "Vietnam",
          "serviceType": "Tổng thầu thi công xây dựng"
        }}
      />
      <ConstructionHero />
      <ConstructionContent />
    </div>
  );
};

export default SolutionConstruction;
