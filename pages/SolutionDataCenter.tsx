import React from 'react';
import SEO from '../components/SEO';
import { DataCenterHero, DataCenterContent } from '../components/solutions';

const SolutionDataCenter: React.FC = () => {
  return (
    <div className="flex flex-col w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20">
      <SEO 
        title="Data Center & Hạ Tầng Số Tier III | Giải Pháp Tổng Thể CTC" 
        description="Giải pháp thiết kế & xây dựng Trung tâm dữ liệu Data Center Tier III, hệ thống mạng viễn thông, bảo mật thông tin & CCTV chuyên nghiệp cho doanh nghiệp & cơ quan." 
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Xây dựng Trung tâm dữ liệu Data Center Tier III",
          "description": "Tư vấn, thiết kế, triển khai hạ tầng Data Center, phòng Server room, hệ thống làm mát precision cooling và phòng cháy chữa cháy chuyên dụng.",
          "provider": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn",
            "telephone": "+84-915-059-666"
          },
          "areaServed": "Vietnam",
          "serviceType": "Hạ tầng công nghệ thông tin & Viễn thông"
        }}
      />
      <DataCenterHero />
      <DataCenterContent />
    </div>
  );
};

export default SolutionDataCenter;
