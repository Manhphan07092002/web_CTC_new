import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product } from '../types';
import { Search, Filter, ChevronRight, SlidersHorizontal, ChevronLeft, List } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import CategoryFilter from '../components/CategoryFilter';
import { useProductCategories } from '../hooks/useCategories';
import analyticsTracking from '../services/analytics-tracking';
import { ProductsHero, FilterSidebar, ProductGrid, ProductsCTA, MobileCategoryDrawer } from '../components/products';
import { useCart } from '../contexts/CartContext';
import { getProductUrl } from '../utils/news-url-helper';

import { calculatePriceWithVat, parseNumericPrice } from '../utils/priceUtils';
import { getCategoryDescendantIds, getCategoryParentChain } from '../utils/categoryTreeHelper';
import Pagination from '../components/Pagination';


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

  // UI States
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileCatDrawer, setShowMobileCatDrawer] = useState(false);

  // Technical Filters States
  const [techFilters, setTechFilters] = useState<{
    minPrice?: string;
    maxPrice?: string;
    minPower: string;
    maxPower: string;
    minEff: string;
    maxEff: string;
  }>({
    minPower: '',
    maxPower: '',
    minEff: '',
    maxEff: ''
  });
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'name_asc'>('default');

  // Drawer mobile state
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
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

    // Filter by Category System (Parent + Sub-category aware & Brand sub-category aware)
    let selectedCat = null;
    if (selectedCategoryId) {
      selectedCat = productCategories.find(c => c.id === selectedCategoryId);
    } else if (activeCategoryKey !== 'all') {
      selectedCat = productCategories.find(c => 
        c.id === activeCategoryKey ||
        (c.slug || c.name.toLowerCase()) === activeCategoryKey.toLowerCase()
      );
    }

    if (selectedCat) {
      const descendantIds = getCategoryDescendantIds(selectedCat.id, productCategories);
      const descendantNames = productCategories
        .filter(c => descendantIds.includes(c.id))
        .map(c => c.name.toLowerCase());

      const parentChain = getCategoryParentChain(selectedCat.id, productCategories);
      const parentCatNames = parentChain
        .filter(c => c.id !== selectedCat!.id)
        .map(c => c.name.toLowerCase());
      const parentCatIds = parentChain
        .filter(c => c.id !== selectedCat!.id)
        .map(c => c.id);

      const targetCatNameLower = selectedCat.name.toLowerCase().trim();

      filtered = filtered.filter(p => {
        const pCatIdStr = p.categoryId ? String(p.categoryId) : '';
        const pCatIdsStr = Array.isArray((p as any).categoryIds) ? (p as any).categoryIds.map(String) : [];
        const pCatNameLower = (p.category || '').toLowerCase();
        const pCatPathLower = Array.isArray((p as any).categoryPath) ? (p as any).categoryPath.map((cp: any) => String(cp).toLowerCase()) : [];
        const pBrandLower = (p.brand || '').toLowerCase().trim();

        // 1. Explicit ID match with selectedCat or its descendants
        if (pCatIdStr && descendantIds.includes(pCatIdStr)) return true;
        if (pCatIdsStr.some((id: string) => descendantIds.includes(id))) return true;

        // 2. Explicit Category Name or CategoryPath match with selectedCat
        if (pCatNameLower && descendantNames.includes(pCatNameLower) && pCatNameLower === targetCatNameLower) return true;
        if (pCatPathLower.includes(targetCatNameLower)) {
          if (parentCatNames.length === 0 || pCatPathLower.some((cp: string) => parentCatNames.includes(cp))) return true;
        }

        // 3. Brand + Parent Category Match
        // (For Brand sub-categories under a category, e.g. Cisco under Switch, Belden under Cáp mạng)
        if (pBrandLower === targetCatNameLower) {
          if (parentCatNames.length === 0) return true; // Top-level brand page

          const matchesParentCategory = 
            (pCatIdStr && parentCatIds.includes(pCatIdStr)) ||
            pCatIdsStr.some((id: string) => parentCatIds.includes(id)) ||
            (pCatNameLower && parentCatNames.includes(pCatNameLower)) ||
            pCatPathLower.some((cp: string) => parentCatNames.includes(cp));

          if (matchesParentCategory) return true;
        }

        return false;
      });
    }


    // Filter by Search
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by Brand / Thương hiệu
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      const bLower = brandParam.toLowerCase().trim();
      filtered = filtered.filter(p => 
        (p.brand && p.brand.toLowerCase().includes(bLower)) ||
        (p.name && p.name.toLowerCase().includes(bLower))
      );
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
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page));
      return next;
    });
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
        title={`${getCurrentCategoryName()} - Thiết Bị Viễn Thông, CNTT & Solar | CTC`}
        description={`Cung cấp ${getCurrentCategoryName()} chính hãng, hiệu suất cao, đạt chứng chỉ CO/CQ. Bảo hành dài hạn 12-36 tháng, tư vấn & báo giá ưu đãi tại CTC Telecom.`}
        keywords={`${getCurrentCategoryName()}, router MikroTik, router DrayTek, switch PoE, Wi-Fi 6, SFP, ODF, VoIP Gateway Dinstar, inverter Huawei, inverter Sungrow, tấm pin Canadian Solar, LONGI TOPCon, ắc quy Lithium 48V-100Ah, ắc quy viễn thông, UPS APC, thiết bị mạng Đà Nẵng, CTC Telecom`}
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

      {/* Off-Canvas Mobile Category Drawer */}
      <MobileCategoryDrawer
        isOpen={showMobileCatDrawer}
        onClose={() => setShowMobileCatDrawer(false)}
        categories={productCategories}
        activeCategoryKey={activeCategoryKey}
        onSelectCategory={handleCategoryChange}
        t={t}
      />

      {/* Breadcrumb / Toolbar Header */}
      <div id="product-catalog" className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[60px] sm:top-[70px] md:top-[120px] z-30 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 overflow-x-auto whitespace-nowrap py-1">
              <Link to="/" className="hover:text-primary transition-colors flex-shrink-0">{t('nav.home')}</Link>
              <ChevronRight size={14} className="mx-1.5 flex-shrink-0" />
              <Link to="/products" className="hover:text-primary transition-colors flex-shrink-0">{t('nav.products')}</Link>
              <ChevronRight size={14} className="mx-1.5 flex-shrink-0" />
              <span className="text-primary font-bold uppercase truncate max-w-[200px] sm:max-w-none">{getCurrentCategoryName()}</span>
            </div>

            <div className="lg:hidden flex items-center gap-2">
              <button
                type="button"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wide shadow-md active:scale-95 transition-all cursor-pointer min-h-[40px]"
                onClick={() => setShowMobileCatDrawer(true)}
              >
                <List size={16} /> Danh mục sản phẩm
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-200 transition-colors cursor-pointer min-h-[40px]"
                onClick={() => setShowMobileFilter(!showMobileFilter)}
              >
                <Filter size={16} /> {t('products.filter')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer (Technical Filters) */}
      {showMobileFilter && createPortal(
        <div className="fixed inset-0 z-[9998] lg:hidden">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-xs" onClick={() => setShowMobileFilter(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white dark:bg-gray-800 p-5 overflow-y-auto shadow-2xl animate-slide-in-right transition-colors duration-300 z-[9999]">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-base text-gray-800 dark:text-gray-100 uppercase tracking-wider">{t('products.filter')}</h3>
              <button onClick={() => setShowMobileFilter(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300">
                <ChevronRight size={22} />
              </button>
            </div>
            <FilterSidebar
              hideCategories={true}
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
        </div>,
        document.body
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
          <div className="flex-1 min-w-0">

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
            {!loading && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={filteredProducts.length}
                  itemsPerPage={itemsPerPage}
                  itemLabel={{
                    vi: ' sản phẩm',
                    en: ' products',
                    ko: ' 제품',
                    ja: ' 製品',
                    zh: ' 产品',
                    de: ' Produkte'
                  }}
                />
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
