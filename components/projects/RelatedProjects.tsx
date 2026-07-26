import React from 'react';
import { Project } from '../../types';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

interface RelatedProjectsProps {
  projects: Project[];
}

export const RelatedProjects: React.FC<RelatedProjectsProps> = ({ projects }) => {
  const { language } = useLanguage();

  if (projects.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-primary">Khám phá thêm</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
            {getLangText(language, { vi: 'Dự án liên quan khác', en: 'Related Projects', ko: '관련 프로젝트', ja: '関連プロジェクト', zh: '相关项目', de: 'Ähnliche Projekte' })}
          </h2>
        </div>
        <Link 
          to="/projects" 
          className="text-xs font-extrabold text-primary hover:text-secondary flex items-center gap-1 hover:underline"
        >
          Xem tất cả <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {projects.map((item, index) => (
          <Link 
            key={`related-project-${item._id || item.id}-${index}`} 
            to={`/projects/${item._id || item.id}`} 
            className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/80 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col"
          >
            <div className="h-52 bg-gray-100 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              
              {item.capacity && (
                <div className="absolute top-4 left-4">
                  <span className="bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-black px-3 py-1 rounded-full shadow-md border border-amber-400/30 flex items-center gap-1">
                    <Zap size={13} className="fill-amber-400" /> {item.capacity}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <h4 className="font-extrabold text-gray-900 dark:text-white text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                <div className="flex items-center gap-1 truncate max-w-[140px]">
                  <MapPin size={13} className="text-primary flex-shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={13} className="text-amber-500 flex-shrink-0" />
                  <span>{(item as any).date || item.completionDate}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProjects;
