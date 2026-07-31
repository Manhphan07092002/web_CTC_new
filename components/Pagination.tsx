import React, { useMemo } from 'react';
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Kept for backward compat if any file imports this helper
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

const GROUP_SIZE = 15;

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

  // Which group (0-indexed) is currentPage in?
  const currentGroup = useMemo(() => Math.floor((currentPage - 1) / GROUP_SIZE), [currentPage]);
  const totalGroups = useMemo(() => Math.ceil(totalPages / GROUP_SIZE), [totalPages]);

  // Pages in current group
  const pagesInGroup = useMemo(() => {
    const start = currentGroup * GROUP_SIZE + 1;
    const end = Math.min(start + GROUP_SIZE - 1, totalPages);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentGroup, totalPages]);

  const isFirstGroup = currentGroup === 0;
  const isLastGroup = currentGroup === totalGroups - 1;

  const goToPrevGroup = () => {
    if (!isFirstGroup) {
      const prevGroupLastPage = currentGroup * GROUP_SIZE;
      onPageChange(prevGroupLastPage);
    }
  };

  const goToNextGroup = () => {
    if (!isLastGroup) {
      const nextGroupFirstPage = (currentGroup + 1) * GROUP_SIZE + 1;
      onPageChange(nextGroupFirstPage);
    }
  };

  if (totalPages <= 1) return null;

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : undefined;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 rounded-2xl shadow-sm border max-w-full overflow-hidden">

      {/* ── Summary Text ── */}
      {showSummary && totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap shrink-0 m-0">
          {getLangText(language, { vi: 'Hiển thị ', en: 'Showing ', ko: '표시 중 ', ja: '表示中 ', zh: '显示 ', de: 'Angezeigt ' })}
          <span className="font-bold text-gray-800 dark:text-white">{startItem}–{endItem}</span>
          {getLangText(language, { vi: ' trên tổng số ', en: ' of ', ko: ' / 총 ', ja: ' / 全 ', zh: ' / 共 ', de: ' von ' })}
          <span className="font-bold text-primary">{totalItems}</span>
          {itemLabel ? ` ${getLangText(language, itemLabel)}` : ''}
        </p>
      ) : (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap shrink-0 m-0">
          {getLangText(language, { vi: 'Trang ', en: 'Page ', ko: '페이지 ', ja: 'ページ ', zh: '页 ', de: 'Seite ' })}
          <span className="font-bold text-gray-800 dark:text-white">{currentPage}</span>
          {' / '}
          <span className="font-bold text-primary">{totalPages}</span>
        </p>
      )}

      {/* ── Pagination Controls ── */}
      <div className="flex items-center gap-1 flex-nowrap justify-center overflow-hidden max-w-full">

        {/* ← Prev page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label={getLangText(language, { vi: 'Trang trước', en: 'Previous page', ko: '이전 페이지', ja: '前へ', zh: '上一页', de: 'Vorherige' })}
          className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <ChevronLeft size={16} />
        </button>

        {/* << Prev group */}
        <button
          onClick={goToPrevGroup}
          disabled={isFirstGroup}
          title={getLangText(language, { vi: 'Nhóm trang trước', en: 'Previous group', ko: '이전 그룹', ja: '前のグループ', zh: '上一组', de: 'Vorherige Gruppe' })}
          aria-label="Previous page group"
          className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Page number buttons */}
        <div className="flex items-center gap-1 flex-nowrap overflow-hidden">
          {pagesInGroup.map((pageNum) => {
            const isActive = currentPage === pageNum;
            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30 scale-110'
                    : 'border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-300 dark:hover:border-sky-600'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* >> Next group */}
        <button
          onClick={goToNextGroup}
          disabled={isLastGroup}
          title={getLangText(language, { vi: 'Nhóm trang sau', en: 'Next group', ko: '다음 그룹', ja: '次のグループ', zh: '下一组', de: 'Nächste Gruppe' })}
          aria-label="Next page group"
          className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <ChevronsRight size={16} />
        </button>

        {/* → Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label={getLangText(language, { vi: 'Trang sau', en: 'Next page', ko: '다음 페이지', ja: '次へ', zh: '下一页', de: 'Nächste' })}
          className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
