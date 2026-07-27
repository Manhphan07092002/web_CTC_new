import React from 'react';
import SEO from '../components/SEO';
import { ElectricalHero, ElectricalContent } from '../components/solutions';

const SolutionElectrical: React.FC = () => {
  return (
    <div className="flex flex-col w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20">
      <SEO 
        title="Đường Dây & Trạm Biến Áp 110kV | Thiết Kế & Thi Công CTC" 
        description="Giải pháp thiết kế & xây dựng trạm biến áp 110kV, đường dây tải điện, hệ thống tiếp địa chống sét chuyên nghiệp, đạt chứng chỉ năng lực xây dựng Hạng I." 
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Thi công đường dây & Trạm biến áp 110kV",
          "description": "Dịch vụ tư vấn, thiết kế, cung cấp vật tư và thi công trạm biến áp 110kV, đường dây truyền tải điện công nghiệp.",
          "provider": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn",
            "telephone": "+84-915-059-666"
          },
          "areaServed": "Vietnam",
          "serviceType": "Thi công công trình điện công nghiệp"
        }}
      />
      <ElectricalHero />
      <ElectricalContent />
    </div>
  );
};

export default SolutionElectrical;
