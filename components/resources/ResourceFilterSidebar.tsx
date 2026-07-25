import React from 'react';
import { Search, Filter, RotateCcw, Folder, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

export interface DocumentCategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  docCount?: number;
}

interface ResourceFilterSidebarProps {
  categories: DocumentCategory[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  totalResources: number;
  filteredCount: number;
  onReset: () => void;
}

const ResourceFilterSidebar: React.FC<ResourceFilterSidebarProps> = ({
  categories,
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  totalResources,
  filteredCount,
  onReset,
}) => {
  const { language } = useLanguage();

  return (
    <aside className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
        <h3 className="font-bold text-lg text-corporate dark:text-white flex items-center gap-2">
          <Filter size={20} className="text-primary" /> {getLangText(language, { vi: 'Bộ lọc tài liệu', en: 'Document Filters', ko: '문서 필터', ja: 'ドキュメントフィルター', zh: '文档筛选', de: 'Dokumentenfilter' })}
        </h3>
        {(selectedCategoryId || searchQuery) && (
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
          {getLangText(language, { vi: 'Tìm kiếm tài liệu', en: 'Search Documents', ko: '문서 검색', ja: 'ドキュメント検索', zh: '搜索文档', de: 'Dokumente suchen' })}
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getLangText(language, { vi: 'Tên tài liệu, Catalogue...', en: 'Document title, Catalogue...', ko: '문서 제목, 카탈로그...', ja: 'ドキュメントタイトル、カタログ...', zh: '文档名称、产品手册...', de: 'Dokumententitel, Katalog...' })}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      {/* Categories List */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          {getLangText(language, { vi: 'Danh mục tài liệu', en: 'Document Categories', ko: '문서 카테고리', ja: 'ドキュメントカテゴリー', zh: '文档分类', de: 'Dokumentenkategorien' })}
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
              <Folder size={16} /> {getLangText(language, { vi: 'Tất cả tài liệu', en: 'All Documents', ko: '모든 문서', ja: 'すべてのドキュメント', zh: '全部文档', de: 'Alle Dokumente' })}
            </span>
            {selectedCategoryId === null && <Check size={16} />}
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategoryChange(cat._id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                selectedCategoryId === cat._id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {selectedCategoryId === cat._id && <Check size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
        <p className="flex justify-between">
          <span>{getLangText(language, { vi: 'Tổng số tài liệu:', en: 'Total documents:', ko: '총 문서 수:', ja: '全ドキュメント数:', zh: '文档总数:', de: 'Gesamte Dokumente:' })}</span>
          <strong className="text-corporate dark:text-primary font-bold">{totalResources}</strong>
        </p>
        <p className="flex justify-between">
          <span>{getLangText(language, { vi: 'Kết quả tìm thấy:', en: 'Search results:', ko: '검색 결과:', ja: '検索結果:', zh: '搜索结果:', de: 'Suchergebnisse:' })}</span>
          <strong className="text-green-600 dark:text-green-400 font-bold">{filteredCount}</strong>
        </p>
      </div>
    </aside>
  );
};

export default ResourceFilterSidebar;
