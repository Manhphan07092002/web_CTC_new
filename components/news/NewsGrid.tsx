import React from 'react';
import { NewsItem } from '../../types';
import NewsCard from './NewsCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, LayoutList, LayoutGrid } from 'lucide-react';

interface NewsGridProps {
  news: NewsItem[];
  onNewsClick: (item: NewsItem) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
}

const NewsGrid: React.FC<NewsGridProps> = ({
  news,
  onNewsClick,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  viewMode = 'list',
  onViewModeChange
}) => {
  const { t } = useLanguage();

  if (news.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <p className="text-lg font-semibold">{t('news.no_news') || 'Không tìm thấy tin tức nào'}</p>
        <p className="text-sm text-gray-400 mt-2">Vui lòng thử thay đổi từ khóa hoặc danh mục tìm kiếm.</p>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar: View Toggle Switch & Count */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          Hiển thị <span className="font-bold text-gray-900 dark:text-white">{startItem}-{endItem}</span> trên tổng số <span className="font-bold text-primary">{totalItems}</span> bài viết
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
              title="Xem dạng 1 hàng 1 tin tức (Danh sách)"
            >
              <LayoutList size={16} />
              <span className="hidden sm:inline">1 hàng / tin</span>
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

      {/* Main Content Layout based on viewMode */}
      {viewMode === 'list' ? (
        /* List Mode: 1 Hàng 1 Tin Tức */
        <div className="space-y-6">
          {news.map((item, idx) => (
            <NewsCard
              key={`${item.id || (item as any)._id}-${idx}`}
              item={item}
              onClick={() => onNewsClick(item)}
              viewMode="list"
            />
          ))}
        </div>
      ) : (
        /* Grid Mode: Lưới 3 Cột */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, idx) => (
            <NewsCard
              key={`${item.id || (item as any)._id}-${idx}`}
              item={item}
              onClick={() => onNewsClick(item)}
              viewMode="grid"
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Trang <span className="font-bold text-gray-800 dark:text-white">{currentPage}</span> / <span className="font-bold text-corporate dark:text-primary">{totalPages}</span>
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
                key={`news-page-${page}`}
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

export default NewsGrid;
