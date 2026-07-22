import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const ProjectsHero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-corporate py-12 text-white shadow-md">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold">{t('projects.title')}</h1>
        <p className="opacity-80 mt-2 text-base md:text-lg">{t('projects.subtitle')}</p>
      </div>
    </div>
  );
};

export default ProjectsHero;
