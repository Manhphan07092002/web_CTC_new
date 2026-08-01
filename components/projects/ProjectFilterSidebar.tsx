import React from 'react';
import { Search, Filter, RotateCcw, Folder, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';
import { useProjectCategories } from '../../hooks/useCategories';
import { Category } from '../../types';

interface ProjectFilterSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  totalProjects: number;
  filteredCount: number;
  onReset: () => void;
  categories?: Category[];
}

const ProjectFilterSidebar: React.FC<ProjectFilterSidebarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  totalProjects,
  filteredCount,
  onReset,
  categories: propCategories,
}) => {
  const { language } = useLanguage();
  const { categories: fetchedCategories, loading } = useProjectCategories();

  const categories = propCategories && propCategories.length > 0 ? propCategories : fetchedCategories;

  return (
    <aside className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
        <h3 className="font-bold text-lg text-corporate dark:text-white flex items-center gap-2">
          <Filter size={20} className="text-primary" /> {getLangText(language, { vi: 'Bộ lọc dự án', en: 'Project Filters', ko: '프로젝트 필터', ja: 'プロジェクトフィルター', zh: '项目筛选', de: 'Projektfilter' })}
        </h3>
        {(selectedCategoryId || searchQuery) && (
          <button
            onClick={onReset}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium hover:underline transition-all cursor-pointer"
          >
            <RotateCcw size={14} /> {getLangText(language, { vi: 'Xóa bộ lọc', en: 'Clear filters', ko: '필터 초기화', ja: 'フィルターをクリア', zh: '清除筛选', de: 'Filter zurücksetzen' })}
          </button>
        )}
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {getLangText(language, { vi: 'Tìm kiếm dự án', en: 'Search Projects', ko: '프로젝트 검색', ja: 'プロジェクト検索', zh: '搜索项目', de: 'Projekte suchen' })}
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getLangText(language, { vi: 'Tên dự án, địa điểm...', en: 'Project name, location...', ko: '프로젝트 이름, 위치...', ja: 'プロジェクト名、所在地...', zh: '项目名称、地点...', de: 'Projektname, Standort...' })}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          {getLangText(language, { vi: 'Danh mục dự án', en: 'Project Categories', ko: '프로젝트 카테고리', ja: 'プロジェクトカテゴリー', zh: '项目分类', de: 'Projektkategorien' })}
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              selectedCategoryId === null
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Folder size={16} /> {getLangText(language, { vi: 'Tất cả dự án', en: 'All Projects', ko: '모든 프로젝트', ja: 'すべてのプロジェクト', zh: '全部项目', de: 'Alle Projekte' })}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                selectedCategoryId === null ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {totalProjects}
              </span>
              {selectedCategoryId === null && <Check size={16} />}
            </div>
          </button>

          {loading && categories.length === 0 && (
            <div className="py-4 text-center text-xs text-gray-400">
              {getLangText(language, { vi: 'Đang tải danh mục...', en: 'Loading categories...', ko: '카테고리 로드 중...', ja: 'カテゴリーを読み込み中...', zh: '正在加载分类...', de: 'Kategorien werden geladen...' })}
            </div>
          )}

          {categories.map((cat, idx) => {
            const catId = cat.id || cat._id || cat.slug || `proj-cat-${idx}`;
            const isSelected = selectedCategoryId === cat.id ||
              selectedCategoryId === cat._id ||
              selectedCategoryId === cat.slug ||
              selectedCategoryId === cat.name;

            const count = cat.projectCount !== undefined ? cat.projectCount : undefined;

            return (
              <button
                key={`project-cat-${catId}`}
                onClick={() => onCategoryChange(isSelected ? null : (cat.id || cat._id || cat.slug || cat.name))}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {count !== undefined && count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {count}
                    </span>
                  )}
                  {isSelected && <Check size={16} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
        <p className="flex justify-between">
          <span>{getLangText(language, { vi: 'Tổng dự án:', en: 'Total projects:', ko: '총 프로젝트:', ja: '全プロジェクト:', zh: '项目总数:', de: 'Gesamtprojekte:' })}</span>
          <strong className="text-corporate dark:text-primary font-bold">{totalProjects}</strong>
        </p>
        <p className="flex justify-between">
          <span>{getLangText(language, { vi: 'Kết quả tìm kiếm:', en: 'Search results:', ko: '검색 결과:', ja: '検索結果:', zh: '搜索结果:', de: 'Suchergebnisse:' })}</span>
          <strong className="text-green-600 dark:text-green-400 font-bold">{filteredCount}</strong>
        </p>
      </div>
    </aside>
  );
};

export default ProjectFilterSidebar;
