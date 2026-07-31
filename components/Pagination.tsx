import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLangText } from '../utils/translation-helper';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemLabel?: {
    vi: string;
    en: string;
    ko?: string;
    ja?: string;
    zh?: string;
    de?: string;
  };
  showSummary?: boolean;
}

export function getPaginationRange(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const delta = 1;
  const range: (number | string)[] = [];

  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      range.push(i);
    } else if (range[range.length - 1] !== '...') {
      range.push('...');
    }
  }

  return range;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemLabel,
  showSummary = true,
}) => {
  const { language } = useLanguage();

  if (totalPages <= 1) return null;

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : undefined;

  const pageRange = getPaginationRange(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border max-w-full overflow-hidden">
      {/* Summary Text on the Left */}
      {showSummary && totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap shrink-0">
          {getLangText(language, { vi: 'Hiển thị ', en: 'Showing ', ko: '표시 중 ', ja: '表示中 ', zh: '显示 ', de: 'Angezeigt ' })}
          <span className="font-bold text-gray-800 dark:text-white">{startItem}-{endItem}</span>
          {getLangText(language, { vi: ' trên tổng số ', en: ' of ', ko: ' / 총 ', ja: ' / 全 ', zh: ' / 共 ', de: ' von ' })}
          <span className="font-bold text-primary">{totalItems}</span>
          {itemLabel ? getLangText(language, itemLabel) : ''}
        </div>
      ) : (
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap shrink-0">
          {getLangText(language, { vi: 'Trang ', en: 'Page ', ko: '페이지 ', ja: 'ページ ', zh: '页 ', de: 'Seite ' })}
          <span className="font-bold text-gray-800 dark:text-white">{currentPage}</span> / <span className="font-bold text-primary">{totalPages}</span>
        </div>
      )}

      {/* Pagination Button List */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-end max-w-full overflow-x-auto py-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 sm:p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          title={getLangText(language, { vi: 'Trang trước', en: 'Previous page', ko: '이전 페이지', ja: '前へ', zh: '上一页', de: 'Vorherige Seite' })}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page Buttons */}
        {pageRange.map((page, idx) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${idx}`}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs font-bold text-gray-400 dark:text-gray-500 select-none shrink-0"
              >
                •••
              </span>
            );
          }

          const pageNum = Number(page);
          const isActive = currentPage === pageNum;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-bold rounded-lg transition-all shrink-0 ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 sm:p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          title={getLangText(language, { vi: 'Trang sau', en: 'Next page', ko: '다음 페이지', ja: '次へ', zh: '下一页', de: 'Nächste Seite' })}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
