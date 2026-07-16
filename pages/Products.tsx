
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { Search, ShoppingCart, Filter, Package, Eye, ChevronRight, List, SlidersHorizontal, Zap, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import ProductSkeleton from '../components/ProductSkeleton';
import CategoryFilter from '../components/CategoryFilter';
import PriceDisplay from '../components/PriceDisplay';
import { useProductCategories } from '../hooks/useCategories';
import analyticsTracking from '../services/analytics-tracking';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Use MongoDB categories
  const { categories: productCategories, loading: categoriesLoading, getCategoryById, getActiveCategories } = useProductCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Filter States
  const [activeCategoryKey, setActiveCategoryKey] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');

  // Technical Filters States
  const [techFilters, setTechFilters] = useState({
    minPower: '',
    maxPower: '',
    minEff: '',
    maxEff: ''
  });

  // UI States
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // 1. Load Data
  useEffect(() => {
    // Track page view
    analyticsTracking.trackPageView('/products', { title: 'Products Page' });

    const fetchData = async () => {
      setLoading(true);
      try {
        // Load products from database
        const productsData = await api.products.getAll();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [language]);

  // 2. Sync URL param to State
  useEffect(() => {
    const catParam = searchParams.get('cat');
    if (catParam) {
      setActiveCategoryKey(catParam);
    } else {
      setActiveCategoryKey('all');
    }
  }, [searchParams]);

  // 3. Filter & Sort Logic
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Filter by New Category System (priority)
    if (selectedCategoryId) {
      filtered = filtered.filter(p => p.categoryId === selectedCategoryId);
    }
    // Fallback to old category system
    else if (activeCategoryKey !== 'all') {
      const selectedCategory = productCategories.find(c => c.name.toLowerCase() === activeCategoryKey.toLowerCase());
      if (selectedCategory) {
        filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.name.toLowerCase());
      }
    }

    // Filter by Search
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by Technical Specs (Power)
    if (techFilters.minPower && !isNaN(Number(techFilters.minPower))) {
      const minPower = Number(techFilters.minPower);
      filtered = filtered.filter(p => {
        const productPower = p.power || 0;
        return productPower >= minPower;
      });
    }
    if (techFilters.maxPower && !isNaN(Number(techFilters.maxPower))) {
      const maxPower = Number(techFilters.maxPower);
      filtered = filtered.filter(p => {
        const productPower = p.power || 0;
        return productPower <= maxPower;
      });
    }

    // Filter by Technical Specs (Efficiency)
    if (techFilters.minEff && !isNaN(Number(techFilters.minEff))) {
      const minEff = Number(techFilters.minEff);
      filtered = filtered.filter(p => {
        const productEff = p.efficiency || 0;
        return productEff >= minEff;
      });
    }
    if (techFilters.maxEff && !isNaN(Number(techFilters.maxEff))) {
      const maxEff = Number(techFilters.maxEff);
      filtered = filtered.filter(p => {
        const productEff = p.efficiency || 0;
        return productEff <= maxEff;
      });
    }

    // Sort
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => (a.price || '').localeCompare(b.price || ''));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.price || '').localeCompare(a.price || ''));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Handlers
  const handleCategoryChange = (key: string) => {
    setActiveCategoryKey(key);
    setSearchParams(key === 'all' ? {} : { cat: key });
    setShowMobileFilter(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Also update selectedCategoryId for new system
    if (key === 'all') {
      setSelectedCategoryId(null);
    } else {
      const category = productCategories.find(c => 
        (c.slug || c.name.toLowerCase()) === key
      );
      setSelectedCategoryId(category?.id || null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    handleCategoryChange('all');
    setTechFilters({ minPower: '', maxPower: '', minEff: '', maxEff: '' });
  };

  // Handler for CategoryFilter component (tabs)
  const handleCategoryFilterChange = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    
    // Also update old system for sidebar sync
    if (!categoryId) {
      setActiveCategoryKey('all');
      setSearchParams({});
    } else {
      const category = productCategories.find(c => c.id === categoryId);
      if (category) {
        const key = category.slug || category.name.toLowerCase();
        setActiveCategoryKey(key);
        setSearchParams({ cat: key });
      }
    }
  };

  const handleProductClick = (id: string) => {
    navigate(`/products/${id}`);
  };

  const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent('<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#F3F4F6"/><g transform="translate(110, 60)"><path d="M160 120L110 60L80 95L30 30L0 120H160Z" fill="#D1D5DB"/><circle cx="130" cy="35" r="20" fill="#D1D5DB"/></g><text x="200" y="220" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="500" fill="#9CA3AF">No Image</text></svg>');

  // Sidebar Filters Component (Reusable for desktop and mobile)
  const FilterSidebarContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-32">
      {/* Categories */}
      <h3 className="font-bold text-lg text-corporate mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
        <List size={20} /> {t('products.category_list')}
      </h3>
      <nav className="space-y-2 mb-8">
        {/* All categories button */}
        <button
          onClick={() => handleCategoryChange('all')}
          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-between group ${activeCategoryKey === 'all'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 hover:bg-orange-50 hover:text-primary'
            }`}
        >
          {t('common.all_categories')}
          {activeCategoryKey === 'all' && <ChevronRight size={16} />}
        </button>

        {/* Categories from database */}
        {categoriesLoading ? (
          // Loading skeleton for categories
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full px-4 py-3 rounded-lg bg-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))
        ) : (
          getActiveCategories().map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug || category.name.toLowerCase())}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-between group ${activeCategoryKey === (category.slug || category.name.toLowerCase())
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-orange-50 hover:text-primary'
                }`}
            >
              <span>{category.name}</span>
              <span className="text-xs opacity-70">({category.productCount || 0})</span>
              {activeCategoryKey === (category.slug || category.name.toLowerCase()) && <ChevronRight size={16} />}
            </button>
          ))
        )}
      </nav>

      {/* Technical Filters */}
      <h3 className="font-bold text-lg text-corporate mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
        <SlidersHorizontal size={20} /> {t('products.filter_tech')}
      </h3>

      <div className="space-y-6">
        {/* Power Filter */}
        <div>
          <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
            <Zap size={14} className="text-yellow-500" /> {t('products.power')} (W)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={t('products.min')}
              min="0"
              max="100000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
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
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Efficiency Filter */}
        <div>
          <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
            <Activity size={14} className="text-blue-500" /> {t('products.efficiency')} (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={t('products.min')}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
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
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Results Counter */}
        {(techFilters.minPower || techFilters.maxPower || techFilters.minEff || techFilters.maxEff) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                🔍 {t('products.found')} <strong>{filteredProducts.length}</strong> {t('products.products')}
              </span>
              <button
                onClick={handleClearFilters}
                className="text-xs text-red-500 hover:text-red-600 hover:underline font-medium"
              >
                {t('products.clear_filter')}
              </button>
            </div>
            
            {/* Active filters display */}
            <div className="mt-2 flex flex-wrap gap-1">
              {techFilters.minPower && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                  {t('products.power')} ≥ {techFilters.minPower}W
                </span>
              )}
              {techFilters.maxPower && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                  {t('products.power')} ≤ {techFilters.maxPower}W
                </span>
              )}
              {techFilters.minEff && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                  {t('products.efficiency')} ≥ {techFilters.minEff}%
                </span>
              )}
              {techFilters.maxEff && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                  {t('products.efficiency')} ≤ {techFilters.maxEff}%
                </span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleClearFilters}
          className="w-full text-center text-sm text-red-500 hover:text-red-600 hover:underline font-medium transition-colors"
        >
          {t('products.clear_filter')}
        </button>
      </div>

      {/* Support Box */}
      <div className="mt-8 bg-blue-50 p-5 rounded-xl border border-blue-100">
        <h4 className="font-bold text-corporate text-sm mb-2">{t('products.tech_support')}</h4>
        <p className="text-xs text-gray-600 mb-3">{t('products.tech_support_desc')}</p>
        <Link to="/contact" className="text-primary text-xs font-bold hover:underline">{t('products.contact_now')} &rarr;</Link>
      </div>
    </div>
  );

  // Get current category name for display
  const getCurrentCategoryName = () => {
    if (activeCategoryKey === 'all') {
      return t('common.all_categories');
    }
    const category = productCategories.find(c => c.slug === activeCategoryKey || c.name.toLowerCase() === activeCategoryKey.toLowerCase());
    return category ? category.name : t('nav.products');
  };

  return (
    <div className="w-full pb-20 animate-fade-in bg-gray-50 font-sans text-gray-700">
      <SEO
        title={getCurrentCategoryName()}
        description="Danh mục sản phẩm điện năng lượng mặt trời chính hãng."
      />

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <Link to="/" className="hover:text-primary transition-colors">{t('nav.home')}</Link>
              <ChevronRight size={14} className="mx-2" />
              <span className="font-semibold text-corporate">{t('nav.products')}</span
              ><ChevronRight size={14} className="mx-2" />
              <span className="text-primary font-bold uppercase">{getCurrentCategoryName()}</span>
            </div>

            <button
              className="md:hidden flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg font-bold text-gray-700"
              onClick={() => setShowMobileFilter(!showMobileFilter)}
            >
              <Filter size={18} /> {t('products.filter')}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilter(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto shadow-2xl animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">{t('products.filter')}</h3>
              <button onClick={() => setShowMobileFilter(false)}><ChevronRight size={24} /></button>
            </div>
            <FilterSidebarContent />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT SIDEBAR - DESKTOP */}
          <aside className="lg:w-1/4 flex-shrink-0 hidden lg:block">
            <FilterSidebarContent />
          </aside>

          {/* RIGHT CONTENT - PRODUCT GRID */}
          <div className="flex-1">
            {/* New Category Filter */}
            <div className="mb-6">
              <CategoryFilter
                type="product"
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryFilterChange}
                showAll={true}
              />
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={t('products.search_placeholder')}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm text-gray-500 hidden sm:inline">{t('products.sort')}:</span>
                <div className="relative flex-1 sm:flex-none">
                  <select
                    className="w-full sm:w-48 appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:border-primary cursor-pointer text-sm font-medium"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="default">{t('products.sort_default')}</option>
                    <option value="price-asc">{t('products.sort_price_asc')}</option>
                    <option value="price-desc">{t('products.sort_price_desc')}</option>
                    <option value="name-asc">{t('products.sort_name_asc')}</option>
                  </select>
                  <SlidersHorizontal size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(loading || categoriesLoading) ? (
                // Render Skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => (
                  <div key={`${product.id}-${idx}`} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group h-full cursor-pointer" onClick={() => handleProductClick(product.id)}>
                    <div className="h-56 relative bg-gray-200 overflow-hidden">
                      <img
                        src={product.image || PLACEHOLDER_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className="bg-white/90 backdrop-blur text-corporate text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                          {product.category}
                        </span>
                        {product.stock === 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">{t('common.out_of_stock')}</span>}
                      </div>

                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          className="bg-white text-corporate px-5 py-2 rounded-full hover:bg-primary hover:text-white transition-colors shadow-lg transform hover:scale-105 font-bold flex items-center gap-2"
                        >
                          <Eye size={18} /> {t('common.view_details')}
                        </button>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors h-12">{product.name}</h3>

                      {/* Specs Preview */}
                      {(product.power || product.efficiency) && (
                        <div className="flex gap-3 mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          {product.power && <span className="bg-gray-100 px-2 py-1 rounded">{product.power}W</span>}
                          {product.efficiency && <span className="bg-gray-100 px-2 py-1 rounded">Eff: {product.efficiency}%</span>}
                        </div>
                      )}

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <PriceDisplay 
                          price={product.price || 0}
                          originalPrice={product.originalPrice}
                          contactPrice={product.contactPrice}
                          size="lg"
                          layout="vertical"
                          className="flex-1"
                        />
                        <button className="text-gray-400 hover:text-primary transition-colors ml-2">
                          <ShoppingCart size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-xl border border-gray-100 border-dashed">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-500">{t('products.no_result')}</h3>
                  <p className="text-gray-400 text-sm">{t('products.no_result_desc')}</p>
                  <button onClick={handleClearFilters} className="mt-4 text-primary font-bold text-sm hover:underline">{t('products.clear_filter')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
