import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, ChevronDown, Check, X, Tag, ExternalLink, Plus, Globe
} from 'lucide-react';
import { Brand } from '../../types';
import { Link } from 'react-router-dom';

interface SearchableBrandSelectProps {
  brands: Brand[];
  value: string;
  brandName?: string;
  onChange: (brandId: string, brandName: string, origin?: string) => void;
  onCustomBrandChange?: (customName: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim();
}

export const SearchableBrandSelect: React.FC<SearchableBrandSelectProps> = ({
  brands = [],
  value,
  brandName = '',
  onChange,
  onCustomBrandChange,
  placeholder = '-- Chọn hoặc tìm thương hiệu chính hãng --',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredBrands = useMemo(() => {
    const raw = searchTerm.trim();
    if (!raw) return brands;
    const normalized = removeVietnameseTones(raw);
    return brands.filter(b => {
      const matchName = removeVietnameseTones(b.name || '').includes(normalized);
      const matchCountry = removeVietnameseTones(b.country || b.origin || '').includes(normalized);
      return matchName || matchCountry;
    });
  }, [brands, searchTerm]);

  const selectedBrand = useMemo(() => {
    if (!value) return null;
    return brands.find(b => (b.id || (b as any)._id) === value) || null;
  }, [brands, value]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredBrands]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          prev < filteredBrands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredBrands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredBrands[highlightedIndex]) {
          handleSelect(filteredBrands[highlightedIndex]);
        } else if (searchTerm.trim() && onCustomBrandChange) {
          onCustomBrandChange(searchTerm.trim());
          onChange('', searchTerm.trim());
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (brand: Brand) => {
    const bId = brand.id || (brand as any)._id;
    onChange(bId, brand.name, brand.country || brand.origin);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', '');
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
          isOpen 
            ? 'border-primary-500 ring-2 ring-primary-500/20' 
            : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600'
        } rounded-xl text-gray-900 dark:text-white cursor-pointer transition-all duration-200 select-none ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-900/40 overflow-hidden">
            {selectedBrand?.logo ? (
              <img src={selectedBrand.logo} alt={selectedBrand.name} className="w-full h-full object-contain" />
            ) : (
              <Tag size={13} />
            )}
          </div>

          {selectedBrand ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {selectedBrand.name}
              </span>
              {(selectedBrand.country || selectedBrand.origin) && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded shrink-0 flex items-center gap-1">
                  <Globe size={10} />
                  <span>{selectedBrand.country || selectedBrand.origin}</span>
                </span>
              )}
            </div>
          ) : brandName ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {brandName}
              </span>
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded shrink-0">
                Tự nhập
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-400 truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {(selectedBrand || brandName) && !disabled && (
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

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="p-3 border-b border-gray-100 dark:border-slate-700/80 bg-gray-50/70 dark:bg-slate-800/70">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm hãng theo tên, quốc gia (Dahua, Cisco, Dell...)"
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
                  ? `Tìm thấy ${filteredBrands.length} thương hiệu`
                  : `Tổng cộng ${brands.length} thương hiệu trong hệ thống`}
              </span>
              <span className="text-[10px] bg-gray-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                Dùng ↑ ↓ Enter
              </span>
            </div>
          </div>

          <div 
            ref={listRef}
            className="max-h-60 overflow-y-auto p-1.5 space-y-0.5"
          >
            {filteredBrands.length === 0 ? (
              <div className="py-6 text-center px-4">
                <Tag className="mx-auto text-gray-300 dark:text-slate-600 mb-2" size={28} />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Không tìm thấy hãng "{searchTerm}"
                </p>
                {searchTerm && onCustomBrandChange && (
                  <button
                    type="button"
                    onClick={() => {
                      onCustomBrandChange(searchTerm.trim());
                      onChange('', searchTerm.trim());
                      setIsOpen(false);
                    }}
                    className="mt-2.5 px-3 py-1.5 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 rounded-xl text-xs font-medium hover:bg-primary-100 flex items-center gap-1.5 mx-auto"
                  >
                    <Plus size={13} />
                    <span>Dùng tên hãng: "{searchTerm}"</span>
                  </button>
                )}
              </div>
            ) : (
              filteredBrands.map((b, idx) => {
                const bId = b.id || (b as any)._id;
                const isSelected = bId === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={bId}
                    onClick={() => handleSelect(b)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-semibold'
                        : isHighlighted
                        ? 'bg-gray-100 dark:bg-slate-700/60 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                        {b.logo ? (
                          <img src={b.logo} alt={b.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-bold text-[10px] text-gray-500">
                            {b.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {b.name}
                          </span>
                          {(b.featured || (b as any).isFeatured) && (
                            <span className="px-1.5 py-0.2 text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded font-medium">
                              Nổi bật
                            </span>
                          )}
                        </div>
                        {(b.country || b.origin) && (
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Globe size={10} />
                            <span>{b.country || b.origin}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="p-0.5 rounded-full bg-primary-600 text-white shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
            <Link
              to="/admin/brands"
              target="_blank"
              className="text-[11px] font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1 hover:underline"
            >
              <span>+ Quản lý danh sách Hãng</span>
              <ExternalLink size={11} />
            </Link>

            <span className="text-[10px] text-gray-400">
              Esc để đóng
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableBrandSelect;
