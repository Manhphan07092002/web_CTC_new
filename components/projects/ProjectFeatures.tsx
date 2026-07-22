import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProjectFeaturesProps {
  features?: string[];
}

const ProjectFeatures: React.FC<ProjectFeaturesProps> = ({ features }) => {
  if (!features || features.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tính năng nổi bật</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-800/40">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectFeatures;
