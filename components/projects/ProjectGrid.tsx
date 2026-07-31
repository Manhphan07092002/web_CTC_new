import React from 'react';
import { Project } from '../../types';
import ProjectCard from './ProjectCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';
import Pagination from '../Pagination';

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onProjectClick,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  const { t, language } = useLanguage();

  if (projects.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <p className="text-lg font-semibold">{t('projects.no_projects') || getLangText(language, { vi: 'Không tìm thấy dự án nào', en: 'No projects found', ko: '프로젝트를 찾을 수 없습니다', ja: 'プロジェクトが見つかりません', zh: '未找到项目', de: 'Keine Projekte gefunden' })}</p>
        <p className="text-sm text-gray-400 mt-2">{getLangText(language, { vi: 'Vui lòng thử thay đổi từ khóa hoặc bộ lọc danh mục.', en: 'Please try changing keywords or category filters.', ko: '키워드나 카테고리 필터를 변경해 보세요.', ja: 'キーワードまたはフィルターを変更してみてください。', zh: '请尝试更改关键字或分类筛选。', de: 'Bitte versuchen Sie, Suchbegriffe oder Filter zu ändern.' })}</p>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-8">
      {/* 3 Columns Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <ProjectCard
            key={`${project._id || project.id}-${idx}`}
            project={project}
            onClick={() => onProjectClick(project)}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        itemLabel={{
          vi: ' dự án',
          en: ' projects',
          ko: ' 개 프로젝트',
          ja: ' 件',
          zh: ' 个项目',
          de: ' Projekten'
        }}
      />
    </div>
  );
};

export default ProjectGrid;
