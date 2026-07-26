import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { NewsItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import Loading from '../components/Loading';
import analyticsTracking from '../services/analytics-tracking';
import { getNewsUrl } from '../utils/news-url-helper';

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Default view mode: 'list' (1 hàng 1 tin tức)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const { t, language } = useLanguage();

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

  const handleNewsClick = (item: NewsItem) => {
    if (item) {
      navigate(getNewsUrl(item));
    }
  };

  // Available unique tags for cloud widget
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    news.forEach(item => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach(t => { if (t && t.trim()) tagSet.add(t.trim()); });
      }
    });
    if (tagSet.size === 0) {
      return ['SolarEPC', 'WindPower', '110kV', 'DataCenter', 'CTC', 'QuyChuẩnViễnThông'];
    }
    return Array.from(tagSet);
  }, [news]);

  // Filter news by category, tag & search query
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // Category filter
      const matchesCategory = selectedCategoryId
        ? item.categoryId === selectedCategoryId || item.category === selectedCategoryId
        : true;

      // Tag filter
      const matchesTag = selectedTag
        ? Array.isArray(item.tags) && item.tags.includes(selectedTag)
        : true;

      // Search query filter
      const matchesSearch = searchQuery.trim()
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [news, selectedCategoryId, selectedTag, searchQuery]);

  // Featured news items for sidebar widget
  const featuredNews = useMemo(() => {
    return news.filter(n => n.isFeatured);
  }, [news]);

  // Reset page when filter or search or viewMode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, selectedTag, searchQuery, viewMode]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage) || 1;
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNews.slice(start, start + itemsPerPage);
  }, [filteredNews, currentPage, itemsPerPage]);

  // Top 1 Featured Banner Article
  const spotlightArticle = useMemo(() => {
    return news.find(n => n.isFeatured) || news[0] || null;
  }, [news]);

  // Top 3 Most Viewed Articles
  const topViewedNews = useMemo(() => {
    return [...news].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 3);
  }, [news]);

  const handleResetFilters = () => {
    setSelectedCategoryId(null);
    setSelectedTag(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading) return <Loading fullScreen={false} className="h-[60vh]" />;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Tin tức điện mặt trời - CTC",
    "description": "Tin tức mới nhất về năng lượng mặt trời, công nghệ solar và các dự án của CTC",
    "itemListElement": paginatedNews.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "NewsArticle",
        "url": `${window.location.origin}/news/${(item as any)._id || item.id}`,
        "name": item.title,
        "image": item.image,
        "datePublished": item.date
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <SEO 
        title="Tin tức & Sự kiện CTC | Năng lượng mặt trời & Viễn thông Miền Trung"
        description="Cập nhật tin tức mới nhất về ngành năng lượng mặt trời, điện gió, đường dây & trạm biến áp, hạ tầng viễn thông và các hoạt động của Công ty CTC."
        keywords="tin tức CTC, tin tức solar, tin tức điện mặt trời, hạ tầng viễn thông, trạm biến áp 110kv, năng lượng tái tạo"
        url="/news"
        schema={itemListSchema}
      />

      {/* Hero Banner Section */}
      <NewsHero 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        latestArticleTitle={spotlightArticle?.title}
        onLatestClick={() => spotlightArticle && handleNewsClick(spotlightArticle)}
        totalArticles={news.length}
      />

      {/* Top Spotlight Article Banner (Only on page 1 without filters) */}
      {!selectedCategoryId && !selectedTag && !searchQuery && currentPage === 1 && spotlightArticle && (
        <div className="container mx-auto px-4 pt-10 pb-2">
          <div 
            onClick={() => handleNewsClick(spotlightArticle)}
            className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 cursor-pointer group flex flex-col lg:flex-row min-h-[340px]"
          >
            {/* Image */}
            <div className="lg:w-3/5 relative overflow-hidden h-64 lg:h-auto">
              <img 
                src={spotlightArticle.image} 
                alt={spotlightArticle.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent lg:hidden" />
              <span className="absolute top-4 left-4 px-3.5 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-md shadow-lg flex items-center gap-1">
                ⚡ BÀI VIẾT TIÊU ĐIỂM
              </span>
            </div>

            {/* Content */}
            <div className="lg:w-2/5 p-6 sm:p-10 flex flex-col justify-between text-white bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="px-2.5 py-0.5 bg-primary/20 text-cyan-300 border border-primary/30 font-bold rounded-full">
                    {spotlightArticle.category || 'TIN CHUYÊN NGÀNH'}
                  </span>
                  <span>•</span>
                  <span>{spotlightArticle.date}</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-3">
                  {spotlightArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                  {spotlightArticle.excerpt}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                <span>Khám phá ngay bài viết →</span>
                <span className="text-slate-400 font-normal">👁️ {(spotlightArticle.viewCount || 1).toLocaleString('vi-VN')} lượt xem</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container with Left Sidebar & Right News Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar (w-full lg:w-1/4) */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <NewsFilterSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={setSelectedCategoryId}
              selectedTag={selectedTag}
              onTagChange={setSelectedTag}
              availableTags={availableTags}
              totalNews={news.length}
              filteredCount={filteredNews.length}
              featuredNews={featuredNews}
              onNewsClick={handleNewsClick}
              onReset={handleResetFilters}
            />
          </div>

          {/* Right Main Content (w-full lg:w-3/4) */}
          <div className="w-full lg:w-3/4">
            <NewsGrid 
              news={paginatedNews}
              onNewsClick={handleNewsClick}
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
