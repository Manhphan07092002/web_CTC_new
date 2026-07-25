import React from 'react';
import { Project } from '../../types';
import ProjectCard from './ProjectCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {getLangText(language, { vi: 'Hiển thị ', en: 'Showing ', ko: '표시 중 ', ja: '表示中 ', zh: '显示 ', de: 'Angezeigt ' })}
            <span className="font-bold text-gray-800 dark:text-white">{startItem}-{endItem}</span>
            {getLangText(language, { vi: ' trên tổng số ', en: ' of ', ko: ' / 총 ', ja: ' / 全 ', zh: ' / 共 ', de: ' von ' })}
            <span className="font-bold text-primary">{totalItems}</span>
            {getLangText(language, { vi: ' dự án', en: ' projects', ko: ' 개 프로젝트', ja: ' 件', zh: ' 个项目', de: ' Projekten' })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title={getLangText(language, { vi: 'Trang trước', en: 'Previous page', ko: '이전 페이지', ja: '前へ', zh: '上一页', de: 'Vorherige Seite' })}
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 text-sm font-bold rounded-lg transition-all ${
                  currentPage === page
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title={getLangText(language, { vi: 'Trang sau', en: 'Next page', ko: '다음 페이지', ja: '次へ', zh: '下一页', de: 'Nächste Seite' })}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGrid;
