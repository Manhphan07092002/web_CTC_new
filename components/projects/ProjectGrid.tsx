import React from 'react';
import { Project } from '../../types';
import ProjectCard from './ProjectCard';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onProjectClick }) => {
  const { t } = useLanguage();

  if (projects.length === 0) {
    return (
      <div className="col-span-full text-center py-16 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <p className="text-lg font-semibold">{t('projects.no_projects') || 'Không tìm thấy dự án nào'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {projects.map((project, idx) => (
        <ProjectCard
          key={`${project._id || project.id}-${idx}`}
          project={project}
          onClick={() => onProjectClick(project)}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
