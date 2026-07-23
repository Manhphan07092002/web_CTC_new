import React from 'react';
import { Link } from 'react-router-dom';
import { List, ChevronRight, SlidersHorizontal, Zap, Activity, DollarSign, Tag } from 'lucide-react';
import { Category } from '../../types';

interface FilterSidebarProps {
  activeCategoryKey: string;
  handleCategoryChange: (key: string) => void;
  productCategories: Category[];
  categoriesLoading: boolean;
  getActiveCategories: () => Category[];
  techFilters: {
    minPrice?: string;
    maxPrice?: string;
    minPower: string;
    maxPower: string;
    minEff: string;
    maxEff: string;
  };
  setTechFilters: React.Dispatch<React.SetStateAction<{
    minPrice?: string;
    maxPrice?: string;
    minPower: string;
    maxPower: string;
    minEff: string;
    maxEff: string;
  }>>;
  filteredProductsCount: number;
  handleClearFilters: () => void;
  t: (key: string) => any;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  activeCategoryKey,
  handleCategoryChange,
  productCategories,
  categoriesLoading,
  getActiveCategories,
  techFilters,
  setTechFilters,
  filteredProductsCount,
  handleClearFilters,
  t
}) => {
  const isFilterActive = techFilters.minPrice || techFilters.maxPrice || techFilters.minPower || techFilters.maxPower || techFilters.minEff || techFilters.maxEff;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-32">
      {/* Categories */}
      <h3 className="font-bold text-lg text-corporate dark:text-sky-400 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
        <List size={20} className="text-primary" /> {t('products.category_list')}
      </h3>
      <nav className="space-y-1 mb-8">
        {/* All categories button */}
        <button
          onClick={() => handleCategoryChange('all')}
          className={`w-full text-left py-2.5 rounded-r-lg text-sm font-bold transition-all flex items-center justify-between group border-l-4 ${
            activeCategoryKey === 'all'
              ? 'border-primary bg-gradient-to-r from-primary/8 to-transparent text-primary'
              : 'border-transparent text-gray-600 dark:text-gray-300 hover:border-primary/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 hover:text-primary'
          }`}
          style={{ paddingLeft: '12px', paddingRight: '12px' }}
        >
          <span>{t('common.all_categories')}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
            activeCategoryKey === 'all'
              ? 'bg-primary/15 text-primary'
              : 'bg-gray-100 dark:bg-gray-750 text-gray-400 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'
          }`}>
            {t('common.all')}
          </span>
        </button>

        {/* Categories from database */}
        {categoriesLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full pl-3 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-750 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))
        ) : (
          getActiveCategories().map((category) => {
            const categoryKey = category.slug || category.name.toLowerCase();
            const isActive = activeCategoryKey === categoryKey;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(categoryKey)}
                className={`w-full text-left py-2.5 rounded-r-lg text-sm font-bold transition-all flex items-center justify-between group border-l-4 ${
                  isActive
                    ? 'border-primary bg-gradient-to-r from-primary/8 to-transparent text-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:border-primary/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 hover:text-primary'
                }`}
                style={{ paddingLeft: '12px', paddingRight: '12px' }}
              >
                <span className="truncate pr-2">{category.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'bg-gray-100 dark:bg-gray-750 text-gray-400 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'
                }`}>
                  {category.productCount || 0}
                </span>
              </button>
            );
          })
        )}
      </nav>

      {/* Technical & Price Filters */}
      <h3 className="font-bold text-lg text-corporate dark:text-sky-400 mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
        <SlidersHorizontal size={20} className="text-primary" /> {t('products.filter_tech')}
      </h3>

      <div className="space-y-6">
        {/* Price Filter (VNĐ) */}
        <div>
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-500" /> Khoảng Giá (VNĐ)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Giá từ"
              min="0"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-primary dark:focus:border-primary text-gray-800 dark:text-gray-100 transition-colors"
              value={techFilters.minPrice || ''}
              onChange={(e) => {
                setTechFilters({ ...techFilters, minPrice: e.target.value });
              }}
            />
            <span className="text-gray-400 font-bold">-</span>
            <input
              type="number"
              placeholder="Đến giá"
              min="0"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-primary dark:focus:border-primary text-gray-800 dark:text-gray-100 transition-colors"
              value={techFilters.maxPrice || ''}
              onChange={(e) => {
                setTechFilters({ ...techFilters, maxPrice: e.target.value });
              }}
            />
          </div>
          {/* Quick Price Hints */}
          <div className="mt-2 flex flex-wrap gap-1">
            {[
              { label: '< 5 triệu', min: '', max: '5000000' },
              { label: '5 - 15 triệu', min: '5000000', max: '15000000' },
              { label: '15 - 30 triệu', min: '15000000', max: '30000000' },
              { label: '> 30 triệu', min: '30000000', max: '' }
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => setTechFilters({ ...techFilters, minPrice: range.min, maxPrice: range.max })}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  techFilters.minPrice === range.min && techFilters.maxPrice === range.max
                    ? 'bg-primary text-white font-bold'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        {/* Power Filter */}
        <div>
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <Zap size={14} className="text-yellow-500" /> {t('products.power')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={t('products.min')}
              min="0"
              max="100000"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-primary dark:focus:border-primary text-gray-800 dark:text-gray-100 transition-colors"
              value={techFilters.minPower}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (Number(value) >= 0 && Number(value) <= 100000)) {
                  setTechFilters({ ...techFilters, minPower: value });
                }
              }}
            />
            <span className="text-gray-400 font-bold">-</span>
            <input
              type="number"
              placeholder={t('products.max')}
              min="0"
              max="100000"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-primary dark:focus:border-primary text-gray-800 dark:text-gray-100 transition-colors"
              value={techFilters.maxPower}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (Number(value) >= 0 && Number(value) <= 100000)) {
                  setTechFilters({ ...techFilters, maxPower: value });
                }
              }}
            />
          </div>
          {/* Power range hints */}
          <div className="mt-2 flex flex-wrap gap-1">
            {[
              { label: '< 1kW', min: '', max: '1000' },
              { label: '1-5kW', min: '1000', max: '5000' },
              { label: '5-10kW', min: '5000', max: '10000' },
              { label: '> 10kW', min: '10000', max: '' }
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => setTechFilters({ ...techFilters, minPower: range.min, maxPower: range.max })}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white rounded-md transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Efficiency Filter */}
        <div>
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <Activity size={14} className="text-blue-500" /> {t('products.efficiency')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={t('products.min')}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-primary dark:focus:border-primary text-gray-800 dark:text-gray-100 transition-colors"
              value={techFilters.minEff}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                  setTechFilters({ ...techFilters, minEff: value });
                }
              }}
            />
            <span className="text-gray-400 font-bold">-</span>
            <input
              type="number"
              placeholder={t('products.max')}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-primary dark:focus:border-primary text-gray-800 dark:text-gray-100 transition-colors"
              value={techFilters.maxEff}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                  setTechFilters({ ...techFilters, maxEff: value });
                }
              }}
            />
          </div>
          {/* Efficiency range hints */}
          <div className="mt-2 flex flex-wrap gap-1">
            {[
              { label: t('products.eff_basic'), min: '', max: '90' },
              { label: t('products.eff_good'), min: '90', max: '95' },
              { label: t('products.eff_high'), min: '95', max: '' },
              { label: t('products.eff_optimal'), min: '98', max: '' }
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => setTechFilters({ ...techFilters, minEff: range.min, maxEff: range.max })}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white rounded-md transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Results Counter */}
        {isFilterActive && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700 dark:text-blue-300">
                🔍 {t('products.found')} <strong>{filteredProductsCount}</strong> {t('products.products')}
              </span>
              <button
                onClick={handleClearFilters}
                className="text-[10px] text-red-500 hover:text-red-600 hover:underline font-bold"
              >
                {t('products.clear_filter')}
              </button>
            </div>
            
            {/* Active filters display */}
            <div className="mt-2 flex flex-wrap gap-1">
              {techFilters.minPrice && (
                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-200 text-[10px] rounded">
                  Giá ≥ {Number(techFilters.minPrice).toLocaleString('vi-VN')}đ
                </span>
              )}
              {techFilters.maxPrice && (
                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-200 text-[10px] rounded">
                  Giá ≤ {Number(techFilters.maxPrice).toLocaleString('vi-VN')}đ
                </span>
              )}
              {techFilters.minPower && (
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-200 text-[10px] rounded">
                  {t('products.power').split(' (')[0]} ≥ {techFilters.minPower}W
                </span>
              )}
              {techFilters.maxPower && (
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-200 text-[10px] rounded">
                  {t('products.power').split(' (')[0]} ≤ {techFilters.maxPower}W
                </span>
              )}
              {techFilters.minEff && (
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-200 text-[10px] rounded">
                  {t('products.efficiency').split(' (')[0]} ≥ {techFilters.minEff}%
                </span>
              )}
              {techFilters.maxEff && (
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-200 text-[10px] rounded">
                  {t('products.efficiency').split(' (')[0]} ≤ {techFilters.maxEff}%
                </span>
              )}
            </div>
          </div>
        )}


        <button
          onClick={handleClearFilters}
          className="w-full text-center text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:underline font-medium transition-colors"
        >
          {t('products.clear_filter')}
        </button>
      </div>

      {/* Support Box */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 p-5 rounded-xl border border-blue-100 dark:border-blue-900/50">
        <h4 className="font-bold text-corporate dark:text-sky-400 text-sm mb-2">{t('products.tech_support')}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('products.tech_support_desc')}</p>
        <Link to="/contact" className="text-primary text-xs font-bold hover:underline">
          {t('products.contact_now')} &rarr;
        </Link>
      </div>
    </div>
  );
};

export default FilterSidebar;
