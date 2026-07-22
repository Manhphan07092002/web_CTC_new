import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import Loading from '../components/Loading';

import {
  ResourcesHero,
  ResourceGrid,
  ResourceFilterSidebar,
  ResourceItem,
  DocumentCategory
} from '../components/resources';

const Resources: React.FC = () => {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const itemsPerPage = viewMode === 'list' ? 6 : 9;

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchCategories();
      await fetchResources();
      setLoading(false);
    };
    initData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/document-categories');
      const data = await response.json();
      if (Array.isArray(data)) {
        const activeCategories = data.filter(c => c.isActive !== false);
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error fetching document categories:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      if (Array.isArray(data)) {
        setResources(data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  // Map categoryName onto resources for display
  const enrichedResources = useMemo(() => {
    const catMap = new Map<string, string>();
    categories.forEach(c => catMap.set(c._id, c.name));

    return resources.map(r => {
      const catId = typeof r.categoryId === 'object' && r.categoryId ? r.categoryId._id : r.categoryId;
      return {
        ...r,
        categoryName: catMap.get(catId as string) || ''
      };
    });
  }, [resources, categories]);

  // Filter resources by category & search query
  const filteredResources = useMemo(() => {
    return enrichedResources.filter((item) => {
      const itemCatId = typeof item.categoryId === 'object' && item.categoryId ? item.categoryId._id : item.categoryId;
      
      const matchesCategory = selectedCategoryId
        ? itemCatId === selectedCategoryId
        : true;

      const matchesSearch = searchQuery.trim()
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [enrichedResources, selectedCategoryId, searchQuery]);

  // Reset page when filter/search/viewMode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchQuery, viewMode]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage) || 1;
  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(start, start + itemsPerPage);
  }, [filteredResources, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSelectedCategoryId(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading) return <Loading fullScreen={false} className="h-[60vh]" />;

  return (
    <div className="w-full pb-20 animate-fade-in relative bg-gray-50 dark:bg-gray-900 min-h-screen">
      <SEO 
        title={t('resources.title') || 'Tài liệu kỹ thuật'} 
        description="Thư viện tài liệu kỹ thuật, catalogue sản phẩm, hướng dẫn sử dụng và chính sách bảo hành điện mặt trời của CTC."
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Tài liệu kỹ thuật - CTC",
          "description": "Catalogue, hướng dẫn sử dụng và chứng nhận chất lượng sản phẩm điện mặt trời của CTC",
          "publisher": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn"
          }
        }}
      />

      {/* Hero Banner Header */}
      <ResourcesHero />

      {/* Main Container with Left Sidebar & Right Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar (w-full lg:w-1/4) */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <ResourceFilterSidebar
              categories={categories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={setSelectedCategoryId}
              totalResources={resources.length}
              filteredCount={filteredResources.length}
              onReset={handleResetFilters}
            />
          </div>

          {/* Right Main Content (w-full lg:w-3/4) */}
          <div className="w-full lg:w-3/4">
            <ResourceGrid 
              resources={paginatedResources}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              totalItems={filteredResources.length}
              itemsPerPage={itemsPerPage}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
