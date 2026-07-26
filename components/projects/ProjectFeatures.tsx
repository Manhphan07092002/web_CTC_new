import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface ProjectFeaturesProps {
  features?: string[];
}

export const ProjectFeatures: React.FC<ProjectFeaturesProps> = ({ features }) => {
  if (!features || features.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 space-y-6">
      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
        <ShieldCheck className="text-emerald-500" size={24} />
        Đặc điểm nổi bật & Giải pháp kỹ thuật
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:scale-[1.01]"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 size={18} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectFeatures;
