import React from 'react';
import SEO from '../components/SEO';
import { DataCenterHero, DataCenterContent } from '../components/solutions';

const SolutionDataCenter: React.FC = () => {
  return (
    <div className="flex flex-col w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20">
      <SEO 
        title="Data Center & Hạ Tầng Số – CTC" 
        description="Giải pháp xây dựng Trung tâm dữ liệu Data Center Tier III, hệ thống mạng, bảo mật, CCTV cho các cơ quan nhà nước và doanh nghiệp." 
      />
      <DataCenterHero />
      <DataCenterContent />
    </div>
  );
};

export default SolutionDataCenter;
