import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { NewsItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import Loading from '../components/Loading';
import analyticsTracking from '../services/analytics-tracking';

import {
  NewsHero,
  NewsGrid,
  NewsFilterSidebar
} from '../components/news';

const News: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Default view mode: 'list' (1 hàng 1 tin tức)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { t, language } = useLanguage();

  const itemsPerPage = viewMode === 'list' ? 6 : 9;

  useEffect(() => {
    // Track page view
    analyticsTracking.trackPageView('/news', { title: 'News Page' });
    
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await api.news.getAll();
        // Sort: Featured first, then by date
        const sorted = data.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isFeatured && b.isFeatured) {
            return (a.featuredOrder || 0) - (b.featuredOrder || 0);
          }
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        });
        setNews(sorted);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [language]);

  // Filter news by category & search query
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // Category filter
      const matchesCategory = selectedCategoryId
        ? item.categoryId === selectedCategoryId || item.category === selectedCategoryId
        : true;

      // Search query filter
      const matchesSearch = searchQuery.trim()
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [news, selectedCategoryId, searchQuery]);

  // Featured news items for sidebar widget
  const featuredNews = useMemo(() => {
    return news.filter(n => n.isFeatured);
  }, [news]);

  // Reset page when filter or search or viewMode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchQuery, viewMode]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage) || 1;
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNews.slice(start, start + itemsPerPage);
  }, [filteredNews, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSelectedCategoryId(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading) return <Loading fullScreen={false} className="h-[60vh]" />;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Tin tức điện mặt trời - CTC",
    "description": "Tin tức mới nhất về năng lượng mặt trời, công nghệ solar và các dự án của CTC",
    "itemListElement": filteredNews.slice(0, 10).map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${window.location.origin}/news/${item.id || (item as any)._id}`,
      "item": {
        "@type": "NewsArticle",
        "headline": item.title,
        "datePublished": item.date,
        "image": item.image?.startsWith('http') ? item.image : `${window.location.origin}${item.image}`,
        "description": item.excerpt,
        "publisher": {
          "@type": "Organization",
          "name": "CTC",
          "url": "https://ctcdn.vn"
        }
      }
    }))
  };

  return (
    <div className="w-full pb-20 animate-fade-in relative bg-gray-50 dark:bg-gray-900 min-h-screen">
      <SEO 
        title={t('news.title')}
        description={t('news.subtitle')}
        schema={itemListSchema}
      />

      {/* Hero Banner Header */}
      <NewsHero />

      {/* Main Container with Left Sidebar & Right News Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar (w-full lg:w-1/4) */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <NewsFilterSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={setSelectedCategoryId}
              totalNews={news.length}
              filteredCount={filteredNews.length}
              featuredNews={featuredNews}
              onNewsClick={(item) => navigate(`/news/${item.id || (item as any)._id}`)}
              onReset={handleResetFilters}
            />
          </div>

          {/* Right Main Content (w-full lg:w-3/4) */}
          <div className="w-full lg:w-3/4">
            <NewsGrid 
              news={paginatedNews}
              onNewsClick={(item) => navigate(`/news/${item.id || (item as any)._id}`)}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              totalItems={filteredNews.length}
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

export default News;
