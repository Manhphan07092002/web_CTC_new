import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, List } from 'lucide-react';
import { Category } from '../../types';
import { 
  buildCategoryTree, 
  CategoryNode, 
  getCategoryDescendantIdsOnly, 
  getCategorySiblingIds, 
  getCategoryAncestorIds 
} from '../../utils/categoryTreeHelper';

interface MobileCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  activeCategoryKey: string;
  onSelectCategory: (key: string) => void;
  t: (key: string) => any;
}

const RecursiveDrawerCategoryItem: React.FC<{
  node: CategoryNode;
  activeCategoryKey: string;
  openCatIds: string[];
  toggleCat: (id: string, e: React.MouseEvent) => void;
  onSelectCategory: (key: string) => void;
  onClose: () => void;
}> = ({
  node,
  activeCategoryKey,
  openCatIds,
  toggleCat,
  onSelectCategory,
  onClose
}) => {
  const categoryKey = node.slug || node.name.toLowerCase();
  const isActive = activeCategoryKey.toLowerCase() === categoryKey.toLowerCase() || activeCategoryKey === node.id;
  const isExpanded = openCatIds.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  // Indentation levels for clear visual hierarchy
  const indentClass = 
    node.level === 1 ? 'pl-4' :
    node.level === 2 ? 'pl-8' :
    node.level === 3 ? 'pl-12' : 'pl-16';

  const fontClass = 
    node.level === 1 ? 'font-bold text-sm text-gray-800 dark:text-gray-100 uppercase tracking-wide' :
    node.level === 2 ? 'font-semibold text-xs text-gray-700 dark:text-gray-200' :
    'font-medium text-[11px] text-gray-600 dark:text-gray-300';

  const handleItemClick = (e: React.MouseEvent) => {
    onSelectCategory(categoryKey);
    onClose();
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800/60 last:border-none">
      <div 
        className={`w-full min-h-[48px] py-2.5 pr-3 flex items-center justify-between transition-colors ${indentClass} ${
          isActive 
            ? 'bg-sky-50 dark:bg-sky-950/40 text-primary dark:text-sky-400 font-bold border-l-4 border-primary' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-200'
        }`}
      >
        {/* Category Name Click -> Filter products & close */}
        <button
          type="button"
          onClick={handleItemClick}
          className={`flex-1 text-left truncate flex items-center gap-2 cursor-pointer py-1 ${fontClass}`}
          title={node.name}
        >
          {node.level > 1 && <span className="opacity-40 font-mono text-xs">└</span>}
          <span className="truncate">{node.name}</span>
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {/* Badge count */}
          {node.productCount !== undefined && node.productCount >= 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
              isActive 
                ? 'bg-primary/20 text-primary dark:text-sky-300' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-400'
            }`}>
              {node.productCount}
            </span>
          )}

          {/* Toggle Expand Arrow */}
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => toggleCat(node.id, e)}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 hover:text-primary dark:hover:text-sky-400 transition-transform active:scale-95"
              aria-label={`Toggle subcategories of ${node.name}`}
            >
              <ChevronRight 
                size={18} 
                className={`transition-transform duration-250 ${isExpanded ? 'rotate-90 text-primary dark:text-sky-400' : 'text-gray-400'}`} 
              />
            </button>
          )}
        </div>
      </div>

      {/* Accordion Sub-level */}
      {hasChildren && (
        <div 
          className={`grid transition-all duration-250 ease-in-out ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden bg-gray-50/50 dark:bg-gray-900/30">
            {node.children.map(child => (
              <RecursiveDrawerCategoryItem
                key={child.id}
                node={child}
                activeCategoryKey={activeCategoryKey}
                openCatIds={openCatIds}
                toggleCat={toggleCat}
                onSelectCategory={onSelectCategory}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MobileCategoryDrawer: React.FC<MobileCategoryDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategoryKey,
  onSelectCategory,
  t
}) => {
  const [openCatIds, setOpenCatIds] = useState<string[]>([]);
  const categoryTree = buildCategoryTree(categories);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key press to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Expand active category ancestors on mount/change
  useEffect(() => {
    if (categories.length > 0 && activeCategoryKey && activeCategoryKey !== 'all') {
      const activeCat = categories.find(c => 
        (c.slug || c.name.toLowerCase()) === activeCategoryKey.toLowerCase() || c.id === activeCategoryKey
      );
      if (activeCat) {
        const ancestors = getCategoryAncestorIds(activeCat.id, categories);
        setOpenCatIds(prev => Array.from(new Set([...prev, ...ancestors])));
      }
    }
  }, [activeCategoryKey, categories]);

  const toggleCat = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setOpenCatIds(prev => {
      if (prev.includes(id)) {
        const descendants = getCategoryDescendantIdsOnly(id, categories);
        const toRemove = new Set([id, ...descendants]);
        return prev.filter(item => !toRemove.has(item));
      } else {
        const siblings = getCategorySiblingIds(id, categories);
        const siblingDescendants = siblings.flatMap(sId => [sId, ...getCategoryDescendantIdsOnly(sId, categories)]);
        const toRemove = new Set(siblingDescendants);
        return [...prev.filter(item => !toRemove.has(item)), id];
      }
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* 1. Backdrop Overlay */}
      <div 
        className="menu-overlay fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity duration-250 opacity-100 pointer-events-auto"
        style={{ zIndex: 9998 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Off-canvas Drawer Panel */}
      <aside 
        className="mobile-category-drawer fixed top-0 left-0 h-[100dvh] w-[82%] max-w-[320px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-transform duration-250 ease-in-out translate-x-0"
        style={{ zIndex: 9999 }}
        aria-label="Danh mục sản phẩm mobile"
      >
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-sky-600 to-blue-800 text-white flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
            <List size={20} />
            <span>DANH MỤC SẢN PHẨM</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Đóng danh mục"
          >
            <X size={22} />
          </button>
        </div>

        {/* Category List Items Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 pb-20">
          {/* All Products Option */}
          <button
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
            className={`w-full min-h-[48px] px-4 py-3 text-left font-bold text-sm flex items-center justify-between uppercase tracking-wider transition-colors ${
              activeCategoryKey === 'all'
                ? 'bg-sky-50 dark:bg-sky-950/40 text-primary dark:text-sky-400 border-l-4 border-primary'
                : 'text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span>TẤT CẢ SẢN PHẨM</span>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          {/* Recursive Category Tree */}
          {categoryTree.map(node => (
            <RecursiveDrawerCategoryItem
              key={node.id}
              node={node}
              activeCategoryKey={activeCategoryKey}
              openCatIds={openCatIds}
              toggleCat={toggleCat}
              onSelectCategory={onSelectCategory}
              onClose={onClose}
            />
          ))}
        </div>
      </aside>
    </>,
    document.body
  );
};

export default MobileCategoryDrawer;
