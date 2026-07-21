import React from 'react';
import SEO from '../components/SEO';
import { ElectricalHero, ElectricalContent } from '../components/solutions';

const SolutionElectrical: React.FC = () => {
  return (
    <div className="flex flex-col w-full animate-fade-in font-sans text-gray-700 dark:text-gray-200 pb-20">
      <SEO 
        title="Đường Dây & Trạm Biến Áp 110kV – CTC" 
        description="Giải pháp xây dựng trạm biến áp 110kV, đường dây tải điện và tiếp địa chống sét chuyên nghiệp, đạt chứng chỉ năng lực xây dựng." 
      />
      <ElectricalHero />
      <ElectricalContent />
    </div>
  );
};

export default SolutionElectrical;
