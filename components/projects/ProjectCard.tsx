import React from 'react';
import { Project } from '../../types';
import { MapPin, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { t } = useLanguage();

  return (
    <div 
      className="flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group border border-gray-100 dark:border-gray-700"
      onClick={onClick}
    >
      <div className="h-64 overflow-hidden relative">
        <img 
          src={project.image} 
          alt={project.title} 
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
        {project.isFeatured && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            ⭐ Nổi bật
          </div>
        )}
      </div>
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-primary font-bold text-sm tracking-wider uppercase">
            <MapPin size={14} className="mr-1"/> {project.location}
          </div>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded text-xs font-bold">
            {project.completionDate || project.date}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-corporate dark:text-white mb-3 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 flex-1 line-clamp-2">
          {project.description}
        </p>
        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Zap size={16} className="text-yellow-500"/> {t('projects.capacity')}: <span className="text-corporate dark:text-primary">{project.capacity}</span>
          </div>
          <span className="text-primary font-bold hover:text-secondary text-sm">
            {t('projects.view_detail')} &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
