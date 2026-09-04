import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, ChevronDown, Check, X, Folder, FolderOpen, 
  Layers, ExternalLink
} from 'lucide-react';
import { Category } from '../../types';
import { buildCategoryTree, CategoryNode } from '../../utils/categoryTreeHelper';
import { Link } from 'react-router-dom';

interface FlattenedCategoryItem {
  id: string;
  name: string;
  slug: string;
  level: number;
  path: string;
  parentNames: string[];
  category: Category;
}

interface SearchableCategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string, selectedCategory?: Category) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

/**
 * Remove Vietnamese accents for fast diacritics-insensitive searching
 */
function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim();
}

export const SearchableCategorySelect: React.FC<SearchableCategorySelectProps> = ({
  categories = [],
  value,
  onChange,
  placeholder = '-- Chọn hoặc tìm kiếm danh mục sản phẩm --',
  required = false,
  disabled = false,
  className = '',
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 1. Flatten the tree into an ordered list with path breadcrumbs
  const flatCategoryList = useMemo<FlattenedCategoryItem[]>(() => {
    if (!categories || categories.length === 0) return [];
    const tree = buildCategoryTree(categories);
    const result: FlattenedCategoryItem[] = [];

    function traverse(nodes: CategoryNode[], parentNames: string[] = []) {
      nodes.forEach(node => {
        const currentPath = [...parentNames, node.name];
        result.push({
          id: node.id || (node as any)._id,
          name: node.name,
          slug: node.slug || '',
          level: node.level,
          path: currentPath.join(' › '),
          parentNames,
          category: node
        });

        if (node.children && node.children.length > 0) {
          traverse(node.children, currentPath);
        }
      });
    }

    traverse(tree);
    return result;
  }, [categories]);

  // 2. Real-time search filter
  const filteredCategories = useMemo(() => {
    const rawSearch = searchTerm.trim();
    if (!rawSearch) return flatCategoryList;

    const normalizedSearch = removeVietnameseTones(rawSearch);
    return flatCategoryList.filter(item => {
      const matchName = removeVietnameseTones(item.name).includes(normalizedSearch);
      const matchPath = removeVietnameseTones(item.path).includes(normalizedSearch);
      const matchSlug = item.slug.toLowerCase().includes(normalizedSearch);
      return matchName || matchPath || matchSlug;
    });
  }, [flatCategoryList, searchTerm]);

  // Find currently selected item
  const selectedItem = useMemo(() => {
    if (!value) return null;
    return flatCategoryList.find(c => c.id === value) || null;
  }, [flatCategoryList, value]);

  // Reset highlight index on filter change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCategories]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCategories.length - 1 ? prev + 1 : 0
        );
        scrollHighlightedIntoView(highlightedIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCategories.length - 1
        );
        scrollHighlightedIntoView(highlightedIndex - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCategories[highlightedIndex]) {
          handleSelect(filteredCategories[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const scrollHighlightedIntoView = (index: number) => {
    if (!listRef.current) return;
    const elements = listRef.current.querySelectorAll('[data-category-item]');
    if (elements[index]) {
      (elements[index] as HTMLElement).scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  };

  const handleSelect = (item: FlattenedCategoryItem) => {
    onChange(item.id, item.category);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button / Input Display */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
          error 
            ? 'border-rose-500 ring-1 ring-rose-500' 
            : isOpen 
            ? 'border-primary-500 ring-2 ring-primary-500/20' 
            : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600'
        } rounded-xl text-gray-900 dark:text-white cursor-pointer transition-all duration-200 select-none ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 shrink-0">
            {selectedItem ? (
              <FolderOpen size={16} />
            ) : (
              <Folder size={16} />
            )}
          </div>

          {selectedItem ? (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {selectedItem.name}
                </span>
                {selectedItem.level > 1 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded shrink-0">
                    Cấp {selectedItem.level}
                  </span>
                )}
              </div>
              {selectedItem.parentNames.length > 0 && (
                <p className="text-[11px] text-gray-400 dark:text-gray-400 truncate leading-tight">
                  {selectedItem.path}
                </p>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-400 truncate">
              {placeholder}
            </span>
          )}
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {selectedItem && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Xóa lựa chọn"
              className="p-1 text-gray-400 hover:text-rose-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} 
          />
        </div>
      </div>

      {/* Hidden input to support HTML5 form validation if needed */}
      {required && (
        <input
          type="text"
          value={value || ''}
          onChange={() => {}}
          required={required}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-3 border-b border-gray-100 dark:border-slate-700/80 bg-gray-50/70 dark:bg-slate-800/70">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Gõ để tìm kiếm danh mục (VD: Switch, Camera, Pin...)"
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-gray-400">
              <span>
                {searchTerm 
                  ? `Tìm thấy ${filteredCategories.length} danh mục phù hợp`
                  : `Tổng cộng ${flatCategoryList.length} danh mục`}
              </span>
              <span className="text-[10px] bg-gray-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                Dùng phím ↑ ↓ Enter để chọn
              </span>
            </div>
          </div>

          {/* Categories List */}
          <div 
            ref={listRef}
            className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-transparent"
          >
            {filteredCategories.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Layers className="mx-auto text-gray-300 dark:text-slate-600 mb-2" size={32} />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Không tìm thấy danh mục phù hợp
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Không có danh mục nào chứa từ khóa "{searchTerm}"
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 rounded-lg"
                  >
                    Xóa từ khóa
                  </button>
                  <Link
                    to="/admin/categories"
                    target="_blank"
                    className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 rounded-lg flex items-center gap-1"
                  >
                    <span>+ Tạo danh mục mới</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            ) : (
              filteredCategories.map((item, idx) => {
                const isSelected = item.id === value;
                const isHighlighted = idx === highlightedIndex;

                // Level Indentation styling
                const indentPadding = !searchTerm ? `${(item.level - 1) * 16}px` : '0px';

                return (
                  <div
                    key={item.id}
                    data-category-item
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{ paddingLeft: !searchTerm ? `calc(0.5rem + ${indentPadding})` : '0.5rem' }}
                    className={`group relative flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-semibold'
                        : isHighlighted
                        ? 'bg-gray-100 dark:bg-slate-700/60 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      {/* Tree Indent Markers */}
                      {!searchTerm && item.level > 1 && (
                        <span className="text-gray-300 dark:text-slate-600 select-none font-mono text-xs">
                          {item.level === 2 ? '├─' : '└─'}
                        </span>
                      )}

                      {/* Icon */}
                      <span className={`shrink-0 ${
                        isSelected 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : item.level === 1 
                          ? 'text-amber-500' 
                          : 'text-gray-400 group-hover:text-gray-600'
                      }`}>
                        {item.level === 1 ? (
                          <Folder size={15} />
                        ) : (
                          <FolderOpen size={14} />
                        )}
                      </span>

                      {/* Title & Path */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs truncate ${
                            item.level === 1 ? 'font-bold text-gray-900 dark:text-white' : 'font-medium'
                          }`}>
                            {item.name}
                          </span>
                          {item.level === 1 && !searchTerm && (
                            <span className="px-1 py-0.2 text-[9px] bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded">
                              Gốc
                            </span>
                          )}
                        </div>

                        {/* If searching, show full path so the user knows where this item is */}
                        {searchTerm && item.parentNames.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-400 truncate mt-0.5">
                            <span>{item.path}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="p-0.5 rounded-full bg-primary-600 text-white shrink-0 shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="p-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
            <Link
              to="/admin/categories"
              target="_blank"
              className="text-[11px] font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 hover:underline"
            >
              <span>+ Mở trang Quản lý Danh mục</span>
              <ExternalLink size={11} />
            </Link>

            <span className="text-[10px] text-gray-400">
              Nhấn Esc để đóng
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableCategorySelect;
