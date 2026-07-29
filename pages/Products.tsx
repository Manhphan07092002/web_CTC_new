
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product } from '../types';
import { Search, Filter, ChevronRight, SlidersHorizontal, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import CategoryFilter from '../components/CategoryFilter';
import { useProductCategories } from '../hooks/useCategories';
import analyticsTracking from '../services/analytics-tracking';
import { ProductsHero, FilterSidebar, ProductGrid, ProductsCTA } from '../components/products';
import { useCart } from '../contexts/CartContext';
import { getProductUrl } from '../utils/news-url-helper';

import { calculatePriceWithVat, parseNumericPrice } from '../utils/priceUtils';

const Products: React.FC = () => {
  const { addToCart, openCartModal } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Use MongoDB categories
  const { categories: productCategories, loading: categoriesLoading, getActiveCategories } = useProductCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Filter States
  const [activeCategoryKey, setActiveCategoryKey] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');

  // Technical Filters States
  const [techFilters, setTechFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minPower: '',
    maxPower: '',
    minEff: '',
    maxEff: ''
  });

  // UI States
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 3x4 grid

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

    // Filter by Category System (Parent + Sub-category aware)
    if (selectedCategoryId) {
      const selectedCat = productCategories.find(c => c.id === selectedCategoryId);
      if (selectedCat) {
        if (!selectedCat.parentId) {
          // It's a parent category: include products in parent AND all its sub-categories
          const subCatIds = productCategories.filter(c => c.parentId === selectedCat.id).map(c => c.id);
          const subCatNames = productCategories.filter(c => c.parentId === selectedCat.id).map(c => c.name.toLowerCase());
          
          filtered = filtered.filter(p => 
            p.categoryId === selectedCat.id || 
            (p.categoryId && subCatIds.includes(p.categoryId)) ||
            p.category?.toLowerCase() === selectedCat.name.toLowerCase() ||
            (p.category && subCatNames.includes(p.category.toLowerCase()))
          );
        } else {
          // It's a specific sub-category
          filtered = filtered.filter(p => 
            p.categoryId === selectedCat.id || 
            p.category?.toLowerCase() === selectedCat.name.toLowerCase()
          );
        }
      }
    }
    // Fallback via activeCategoryKey
    else if (activeCategoryKey !== 'all') {
      const selectedCat = productCategories.find(c => 
        (c.slug || c.name.toLowerCase()) === activeCategoryKey.toLowerCase()
      );
      if (selectedCat) {
        if (!selectedCat.parentId) {
          const subCatIds = productCategories.filter(c => c.parentId === selectedCat.id).map(c => c.id);
          const subCatNames = productCategories.filter(c => c.parentId === selectedCat.id).map(c => c.name.toLowerCase());
          filtered = filtered.filter(p => 
            p.categoryId === selectedCat.id || 
            (p.categoryId && subCatIds.includes(p.categoryId)) ||
            p.category?.toLowerCase() === selectedCat.name.toLowerCase() ||
            (p.category && subCatNames.includes(p.category.toLowerCase()))
          );
        } else {
          filtered = filtered.filter(p => 
            p.categoryId === selectedCat.id || 
            p.category?.toLowerCase() === selectedCat.name.toLowerCase()
          );
        }
      }
    }

    // Filter by Search
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by Price with VAT (VNĐ)
    if (techFilters.minPrice && !isNaN(Number(techFilters.minPrice))) {
      const minP = Number(techFilters.minPrice);
      filtered = filtered.filter(p => calculatePriceWithVat(p.price, p.vat) >= minP);
    }
    if (techFilters.maxPrice && !isNaN(Number(techFilters.maxPrice))) {
      const maxP = Number(techFilters.maxPrice);
      filtered = filtered.filter(p => calculatePriceWithVat(p.price, p.vat) <= maxP);
    }

    // Filter by Technical Specs (Power)
    if (techFilters.minPower && !isNaN(Number(techFilters.minPower))) {
      const minPower = Number(techFilters.minPower);
      filtered = filtered.filter(p => (p.power || 0) >= minPower);
    }
    if (techFilters.maxPower && !isNaN(Number(techFilters.maxPower))) {
      const maxPower = Number(techFilters.maxPower);
      filtered = filtered.filter(p => (p.power || 0) <= maxPower);
    }

    // Filter by Technical Specs (Efficiency)
    if (techFilters.minEff && !isNaN(Number(techFilters.minEff))) {
      const minEff = Number(techFilters.minEff);
      filtered = filtered.filter(p => (p.efficiency || 0) >= minEff);
    }
    if (techFilters.maxEff && !isNaN(Number(techFilters.maxEff))) {
      const maxEff = Number(techFilters.maxEff);
      filtered = filtered.filter(p => (p.efficiency || 0) <= maxEff);
    }

    // Sort by Final Price with VAT or Name
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => calculatePriceWithVat(a.price, a.vat) - calculatePriceWithVat(b.price, b.vat));
        break;
      case 'price-desc':
        filtered.sort((a, b) => calculatePriceWithVat(b.price, b.vat) - calculatePriceWithVat(a.price, a.vat));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategoryKey, selectedCategoryId, techFilters]);

  const filteredProducts = getFilteredProducts();

  // Paginated Products calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll down to catalog header when changing pages
    const catalogHeader = document.getElementById('product-catalog');
    if (catalogHeader) {
      catalogHeader.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handlers
  const handleCategoryChange = (key: string) => {
    setActiveCategoryKey(key);
    setSearchParams(key === 'all' ? {} : { cat: key });
    setShowMobileFilter(false);
    
    // Smooth scroll down to catalog header when changing categories
    const catalogHeader = document.getElementById('product-catalog');
    if (catalogHeader) {
      catalogHeader.scrollIntoView({ behavior: 'smooth' });
    }

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
    setTechFilters({
      minPrice: '',
      maxPrice: '',
      minPower: '',
      maxPower: '',
      minEff: '',
      maxEff: ''
    });
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

  const handleProductClick = (id: string, product?: Product) => {
    if (product) {
      navigate(getProductUrl(product));
    } else {
      const found = products.find(p => (p._id || p.id) === id);
      if (found) {
        navigate(getProductUrl(found));
      } else {
        navigate(`/products/${id}`);
      }
    }
  };

  const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent('<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#F3F4F6"/><g transform="translate(110, 60)"><path d="M160 120L110 60L80 95L30 30L0 120H160Z" fill="#D1D5DB"/><circle cx="130" cy="35" r="20" fill="#D1D5DB"/></g><text x="200" y="220" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="500" fill="#9CA3AF">No Image</text></svg>');

  // Get current category name for display
  const getCurrentCategoryName = () => {
    if (activeCategoryKey === 'all') {
      return t('common.all_categories');
    }
    const category = productCategories.find(c => c.slug === activeCategoryKey || c.name.toLowerCase() === activeCategoryKey.toLowerCase());
    return category ? category.name : t('nav.products');
  };

  return (
    <div className="w-full pb-0 animate-fade-in bg-gray-50 dark:bg-gray-900 font-sans text-gray-700 dark:text-gray-300 transition-colors duration-300 pt-28 md:pt-36">
      <SEO
        title={`${getCurrentCategoryName()} - Thiết Bị Điện Mặt Trời | CTC`}
        description={`Cung cấp ${getCurrentCategoryName()} chính hãng, hiệu suất cao, đạt chứng chỉ CO/CQ. Bảo hành dài hạn 12-25 năm, tư vấn & báo giá ưu đãi tại CTC.`}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${getCurrentCategoryName()} - Thiết Bị Điện Mặt Trời CTC`,
          "description": `Danh mục ${getCurrentCategoryName()} chính hãng do CTC phân phối.`,
          "url": window.location.href,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": window.location.origin },
              { "@type": "ListItem", "position": 2, "name": "Sản phẩm", "item": `${window.location.origin}/products` },
              { "@type": "ListItem", "position": 3, "name": getCurrentCategoryName(), "item": window.location.href }
            ]
          }
        }}
      />

      {/* Breadcrumb / Toolbar Header */}
      <div id="product-catalog" className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[108px] md:top-[120px] z-30 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Link to="/" className="hover:text-primary transition-colors">{t('nav.home')}</Link>
              <ChevronRight size={14} className="mx-2" />
              <Link to="/products" className="hover:text-primary transition-colors">{t('nav.products')}</Link>
              <ChevronRight size={14} className="mx-2" />
              <span className="text-primary font-bold uppercase">{getCurrentCategoryName()}</span>
            </div>

            <button
              className="md:hidden flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg font-bold text-gray-700 dark:text-gray-200"
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
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 p-6 overflow-y-auto shadow-2xl animate-slide-in-right transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{t('products.filter')}</h3>
              <button onClick={() => setShowMobileFilter(false)} className="text-gray-700 dark:text-gray-300">
                <ChevronRight size={24} />
              </button>
            </div>
            <FilterSidebar
              activeCategoryKey={activeCategoryKey}
              handleCategoryChange={handleCategoryChange}
              productCategories={productCategories}
              categoriesLoading={categoriesLoading}
              getActiveCategories={getActiveCategories}
              techFilters={techFilters}
              setTechFilters={setTechFilters}
              filteredProductsCount={filteredProducts.length}
              handleClearFilters={handleClearFilters}
              t={t}
            />
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT SIDEBAR - DESKTOP */}
          <aside className="lg:w-1/4 flex-shrink-0 hidden lg:block">
            <FilterSidebar
              activeCategoryKey={activeCategoryKey}
              handleCategoryChange={handleCategoryChange}
              productCategories={productCategories}
              categoriesLoading={categoriesLoading}
              getActiveCategories={getActiveCategories}
              techFilters={techFilters}
              setTechFilters={setTechFilters}
              filteredProductsCount={filteredProducts.length}
              handleClearFilters={handleClearFilters}
              t={t}
            />
          </aside>

          {/* RIGHT CONTENT - PRODUCT LIST */}
          <div className="flex-1">
            {/* Horizontal Category Tabs Filter - Hidden on Desktop to avoid duplicate filters */}
            <div className="mb-6 lg:hidden">
              <CategoryFilter
                type="product"
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryFilterChange}
                showAll={true}
              />
            </div>

            {/* Toolbar Search / Sort */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors duration-300">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder={t('products.search_placeholder')}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-800 dark:text-gray-100 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{t('products.sort')}:</span>
                <div className="relative flex-1 sm:flex-none">
                  <select
                    className="w-full sm:w-48 appearance-none bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:border-primary cursor-pointer text-sm font-medium transition-colors duration-300"
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

            {/* Product Grid Wrapper */}
            <ProductGrid
              loading={loading}
              categoriesLoading={categoriesLoading}
              filteredProducts={currentProducts} // Pass sliced products
              handleProductClick={handleProductClick}
              onAddToCart={openCartModal}
              handleClearFilters={handleClearFilters}
              t={t}
              placeholderImage={PLACEHOLDER_IMAGE}
            />

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-650 dark:disabled:hover:border-gray-700 dark:disabled:hover:text-gray-350 transition-all flex items-center justify-center active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg border font-bold text-sm transition-all active:scale-95 ${
                        currentPage === page
                          ? 'bg-primary border-primary text-white shadow-md'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-650 dark:disabled:hover:border-gray-700 dark:disabled:hover:text-gray-350 transition-all flex items-center justify-center active:scale-95"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <ProductsCTA />
    </div>
  );
};

export default Products;
