import React from 'react';
import CategoryFilter from '../CategoryFilter';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProjectsHeroProps {
  selectedCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
}

const ProjectsHero: React.FC<ProjectsHeroProps> = ({
  selectedCategoryId,
  onCategoryChange
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-corporate py-12 text-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter
            type="project"
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={onCategoryChange}
            showAll={true}
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{t('projects.title')}</h1>
        <p className="opacity-80 mt-2 text-base md:text-lg">{t('projects.subtitle')}</p>
      </div>
    </div>
  );
};

export default ProjectsHero;
