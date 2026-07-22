import React from 'react';
import { Search, Filter, RotateCcw, FolderGrid, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProjectCategories } from '../../hooks/useCategories';

interface ProjectFilterSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  totalProjects: number;
  filteredCount: number;
  onReset: () => void;
}

const ProjectFilterSidebar: React.FC<ProjectFilterSidebarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  totalProjects,
  filteredCount,
  onReset,
}) => {
  const { t } = useLanguage();
  const { categories, loading } = useProjectCategories();

  return (
    <aside className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
        <h3 className="font-bold text-lg text-corporate dark:text-white flex items-center gap-2">
          <Filter size={20} className="text-primary" /> Bộ lọc dự án
        </h3>
        {(selectedCategoryId || searchQuery) && (
          <button
            onClick={onReset}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium hover:underline transition-all"
          >
            <RotateCcw size={14} /> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Tìm kiếm dự án
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tên dự án, địa điểm..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Danh mục
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              selectedCategoryId === null
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <FolderGrid size={16} /> Tất cả dự án
            </span>
            {selectedCategoryId === null && <Check size={16} />}
          </button>

          {!loading &&
            categories.map((cat) => (
              <button
                key={cat.id || cat._id}
                onClick={() => onCategoryChange(cat.id || cat._id || null)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  selectedCategoryId === (cat.id || cat._id)
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span>{cat.name}</span>
                {selectedCategoryId === (cat.id || cat._id) && <Check size={16} />}
              </button>
            ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
        <p className="flex justify-between">
          <span>Tổng dự án:</span>
          <strong className="text-corporate dark:text-primary font-bold">{totalProjects}</strong>
        </p>
        <p className="flex justify-between">
          <span>Kết quả tìm kiếm:</span>
          <strong className="text-green-600 dark:text-green-400 font-bold">{filteredCount}</strong>
        </p>
      </div>
    </aside>
  );
};

export default ProjectFilterSidebar;
