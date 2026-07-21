import React from 'react';
import SEO from '../components/SEO';
import { ConstructionHero, ConstructionContent } from '../components/solutions';

const SolutionConstruction: React.FC = () => {
  return (
    <div className="flex flex-col w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20">
      <SEO 
        title="Xây Dựng Dân Dụng & Công Nghiệp – CTC" 
        description="Tổng thầu thi công xây dựng nhà xưởng, hạ tầng công nghiệp, dân dụng và công trình quốc phòng với hơn 500+ dự án hoàn thành." 
      />
      <ConstructionHero />
      <ConstructionContent />
    </div>
  );
};

export default SolutionConstruction;
