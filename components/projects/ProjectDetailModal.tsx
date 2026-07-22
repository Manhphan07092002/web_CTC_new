import React from 'react';
import { Project } from '../../types';
import { MapPin, X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const { t } = useLanguage();

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 bg-white/20 hover:bg-black/10 p-2 rounded-full z-20 transition-colors"
        >
          <X size={24} className="text-gray-800 md:text-white drop-shadow-md" />
        </button>
        
        <div className="relative h-64 md:h-80">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{project.title}</h2>
            <p className="flex items-center gap-2 opacity-90"><MapPin size={18} /> {project.location}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
              <div className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">{t('projects.capacity')}</div>
              <div className="text-xl font-bold text-corporate dark:text-primary">{project.capacity}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
              <div className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">{t('projects.completion')}</div>
              <div className="text-xl font-bold text-gray-800 dark:text-gray-200">{project.completionDate || project.date}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
              <div className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">{t('projects.type')}</div>
              <div className="text-xl font-bold text-gray-800 dark:text-gray-200">{project.category || t('solutions.rooftop')}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
              <div className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">{t('projects.status')}</div>
              <div className="text-xl font-bold text-green-600">Operating</div>
            </div>
          </div>

          <div className="prose max-w-none text-gray-600 dark:text-gray-300">
            <h3 className="text-xl font-bold text-corporate dark:text-white mb-4">{t('common.view_details')}</h3>
            <p className="mb-4">{project.description}</p>
            <p className="mb-4">
              {t('home.why_choose_desc')}
            </p>
            
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Scope of Work:</h4>
            <ul className="grid md:grid-cols-2 gap-2">
              {['EPC', 'Design', 'Installation', 'Grid Connection', 'O&M'].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" /> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button 
              onClick={onClose} 
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
