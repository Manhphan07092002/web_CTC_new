import React from 'react';
import ResourceCard, { ResourceItem } from './ResourceCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, LayoutList, LayoutGrid, BookOpen } from 'lucide-react';
import Pagination from '../Pagination';

interface ResourceGridProps {
  resources: ResourceItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  onPreview?: (resource: ResourceItem) => void;
}

const ResourceGrid: React.FC<ResourceGridProps> = ({
  resources,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  viewMode = 'list',
  onViewModeChange,
  onPreview
}) => {
  const { t } = useLanguage();

  if (resources.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-lg font-semibold">Hiện chưa có tài liệu nào trong mục này</p>
        <p className="text-sm text-gray-400 mt-2">Vui lòng thử chọn danh mục khác hoặc thay đổi từ khóa tìm kiếm.</p>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      {/* Top Bar: View Mode Switcher & Stats */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          Hiển thị <span className="font-bold text-gray-900 dark:text-white">{startItem}-{endItem}</span> trên tổng số <span className="font-bold text-primary">{totalItems}</span> tài liệu
        </div>

        {/* View Mode Toggle Buttons */}
        {onViewModeChange && (
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
              title="Xem dạng 1 hàng 1 tài liệu (Danh sách)"
            >
              <LayoutList size={16} />
              <span className="hidden sm:inline">1 hàng / tài liệu</span>
            </button>

            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
              title="Xem dạng Lưới 3 cột"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Lưới 3 cột</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      {viewMode === 'list' ? (
        /* List Mode: 1 Hàng 1 Tài Liệu */
        <div className="space-y-4">
          {resources.map((item, idx) => (
            <ResourceCard
              key={`${item._id}-${idx}`}
              resource={item}
              viewMode="list"
              onPreview={onPreview}
            />
          ))}
        </div>
      ) : (
        /* Grid Mode: Lưới 3 Cột */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item, idx) => (
            <ResourceCard
              key={`${item._id}-${idx}`}
              resource={item}
              viewMode="grid"
              onPreview={onPreview}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        itemLabel={{
          vi: ' tài liệu',
          en: ' documents',
          ko: ' 문서',
          ja: ' ドキュメント',
          zh: ' 文档',
          de: ' Dokumente'
        }}
      />
    </div>
  );
};

export default ResourceGrid;
