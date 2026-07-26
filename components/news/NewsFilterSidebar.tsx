import React from 'react';
import { Search, Filter, RotateCcw, Folder, Check, Newspaper, Tag as TagIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';
import { useNewsCategories } from '../../hooks/useCategories';
import { NewsItem } from '../../types';

interface NewsFilterSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  selectedTag?: string | null;
  onTagChange?: (tag: string | null) => void;
  availableTags?: string[];
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
  selectedTag = null,
  onTagChange,
  availableTags = [],
  totalNews,
  filteredCount,
  featuredNews = [],
  onNewsClick,
  onReset,
}) => {
  const { language } = useLanguage();
  const { categories, loading } = useNewsCategories();

  return (
    <aside className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
        <h3 className="font-bold text-lg text-corporate dark:text-white flex items-center gap-2">
          <Filter size={20} className="text-primary" /> {getLangText(language, { vi: 'Bộ lọc tin tức', en: 'News Filters', ko: '뉴스 필터', ja: 'ニュースフィルター', zh: '新闻筛选', de: 'Nachrichtenfilter' })}
        </h3>
        {(selectedCategoryId || searchQuery || selectedTag) && (
          <button
            onClick={onReset}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium hover:underline transition-all"
          >
            <RotateCcw size={14} /> {getLangText(language, { vi: 'Xóa bộ lọc', en: 'Clear filters', ko: '필터 초기화', ja: 'フィルターをクリア', zh: '清除筛选', de: 'Filter zurücksetzen' })}
          </button>
        )}
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {getLangText(language, { vi: 'Tìm kiếm bài viết', en: 'Search Articles', ko: '기사 검색', ja: '記事検索', zh: '搜索文章', de: 'Artikel suchen' })}
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getLangText(language, { vi: 'Tên bài viết, chủ đề...', en: 'Article title, topic...', ko: '기사 제목, 주제...', ja: '記事タイトル、トピック...', zh: '文章标题、主题...', de: 'Artikeltitel, Thema...' })}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          {getLangText(language, { vi: 'Danh mục tin tức', en: 'News Categories', ko: '뉴스 카테고리', ja: 'ニュースカテゴリー', zh: '新闻分类', de: 'Nachrichtenkategorien' })}
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
              <Folder size={16} /> {getLangText(language, { vi: 'Tất cả tin tức', en: 'All News', ko: '모든 뉴스', ja: 'すべてのニュース', zh: '全部新闻', de: 'Alle Nachrichten' })}
            </span>
            {selectedCategoryId === null && <Check size={16} />}
          </button>

          {!loading &&
            categories.map((cat, idx) => {
              const catId = cat.id || (cat as any)._id || cat.slug || `cat-${idx}`;
              const isSelected = selectedCategoryId === cat.id || selectedCategoryId === (cat as any)._id || selectedCategoryId === cat.name;
              return (
                <button
                  key={`news-cat-btn-${catId}-${idx}`}
                  onClick={() => onCategoryChange(cat.id || (cat as any)._id || cat.name || null)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && <Check size={16} />}
                </button>
              );
            })}
        </div>
      </div>

      {/* Tag Cloud Widget */}
      {availableTags.length > 0 && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TagIcon size={14} className="text-primary" /> {getLangText(language, { vi: 'Thẻ chủ đề nổi bật', en: 'Popular Tags', ko: '인기 태그', ja: '人気タグ', zh: '热门标签', de: 'Beliebte Tags' })}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => {
              const isTagSelected = selectedTag === tag;
              return (
                <button
                  key={`tag-btn-${tag}`}
                  onClick={() => onTagChange && onTagChange(isTagSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isTagSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Featured News Widget */}
      {featuredNews.length > 0 && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Newspaper size={14} className="text-primary" /> {getLangText(language, { vi: 'Tin nổi bật', en: 'Featured News', ko: '주요 뉴스', ja: '注目ニュース', zh: '精选新闻', de: 'Ausgewählte Nachrichten' })}
          </label>
          <div className="space-y-3">
            {featuredNews.slice(0, 3).map((item, idx) => {
              const itemId = item.id || (item as any)._id || `feat-${idx}`;
              return (
                <div 
                  key={`feat-news-sidebar-${itemId}-${idx}`}
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
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
        <p className="flex justify-between">
          <span>{getLangText(language, { vi: 'Tổng số bài viết:', en: 'Total articles:', ko: '총 기사 수:', ja: '全記事数:', zh: '文章总数:', de: 'Gesamte Artikel:' })}</span>
          <strong className="text-corporate dark:text-primary font-bold">{totalNews}</strong>
        </p>
        <p className="flex justify-between">
          <span>{getLangText(language, { vi: 'Kết quả tìm thấy:', en: 'Search results:', ko: '검색 결과:', ja: '検索結果:', zh: '搜索结果:', de: 'Suchergebnisse:' })}</span>
          <strong className="text-green-600 dark:text-green-400 font-bold">{filteredCount}</strong>
        </p>
      </div>
    </aside>
  );
};

export default NewsFilterSidebar;
