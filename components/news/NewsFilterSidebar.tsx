import React from 'react';
import { Search, Filter, RotateCcw, Folder, Check, Newspaper } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNewsCategories } from '../../hooks/useCategories';
import { NewsItem } from '../../types';

interface NewsFilterSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  totalNews: number;
  filteredCount: number;
  featuredNews?: NewsItem[];
  onNewsClick?: (item: NewsItem) => void;
  onReset: () => void;
}

const NewsFilterSidebar: React.FC<NewsFilterSidebarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  totalNews,
  filteredCount,
  featuredNews = [],
  onNewsClick,
  onReset,
}) => {
  const { t } = useLanguage();
  const { categories, loading } = useNewsCategories();

  return (
    <aside className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
        <h3 className="font-bold text-lg text-corporate dark:text-white flex items-center gap-2">
          <Filter size={20} className="text-primary" /> Bộ lọc tin tức
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
          Tìm kiếm bài viết
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tên bài viết, chủ đề..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Danh mục tin tức
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
              <Folder size={16} /> Tất cả tin tức
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

      {/* Featured News Widget */}
      {featuredNews.length > 0 && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Newspaper size={14} className="text-primary" /> Tin nổi bật
          </label>
          <div className="space-y-3">
            {featuredNews.slice(0, 3).map((item, idx) => (
              <div 
                key={`feat-news-sidebar-${item.id}-${idx}`}
                onClick={() => onNewsClick && onNewsClick(item)}
                className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-xl transition-all"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-gray-400 mt-1 block">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
        <p className="flex justify-between">
          <span>Tổng số bài viết:</span>
          <strong className="text-corporate dark:text-primary font-bold">{totalNews}</strong>
        </p>
        <p className="flex justify-between">
          <span>Kết quả tìm thấy:</span>
          <strong className="text-green-600 dark:text-green-400 font-bold">{filteredCount}</strong>
        </p>
      </div>
    </aside>
  );
};

export default NewsFilterSidebar;
