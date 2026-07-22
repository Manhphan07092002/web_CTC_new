import React from 'react';
import { Project } from '../../types';
import ProjectCard from './ProjectCard';
import { useLanguage } from '../../contexts/LanguageContext';
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
  const { t } = useLanguage();

  if (projects.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <p className="text-lg font-semibold">{t('projects.no_projects') || 'Không tìm thấy dự án nào'}</p>
        <p className="text-sm text-gray-400 mt-2">Vui lòng thử thay đổi từ khóa hoặc bộ lọc danh mục.</p>
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
            Hiển thị <span className="font-bold text-gray-800 dark:text-white">{startItem}-{endItem}</span> trên tổng số <span className="font-bold text-primary">{totalItems}</span> dự án
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Trang trước"
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
              title="Trang sau"
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
