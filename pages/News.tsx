import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { NewsItem } from '../types';
import { Calendar, User, ArrowRight, ChevronRight, Home, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import CategoryFilter from '../components/CategoryFilter';
import { useNewsCategories } from '../hooks/useCategories';
import analyticsTracking from '../services/analytics-tracking';

const News: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { getCategoryById } = useNewsCategories();

  useEffect(() => {
    // Track page view
    analyticsTracking.trackPageView('/news', { title: 'News Page' });
    
    const fetchNews = async () => {
      setLoading(true);
      let data = await api.news.getAll();
      
      // Filter by category if selected
      if (selectedCategoryId) {
        data = data.filter(item => item.categoryId === selectedCategoryId);
      }
      
      // Sort: Featured first (by featuredOrder), then by date
      const sorted = data.sort((a, b) => {
        // Featured items first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        // If both featured, sort by featuredOrder
        if (a.isFeatured && b.isFeatured) {
          return (a.featuredOrder || 0) - (b.featuredOrder || 0);
        }
        // If both not featured, sort by date (newest first)
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      });
      setNews(sorted);
      setLoading(false);
    };
    fetchNews();
  }, [selectedCategoryId, language]);

  if (loading) return <div className="w-full py-20 text-center">{t('common.loading')}</div>;

  const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Tin tức điện mặt trời - CTC",
      "description": "Tin tức mới nhất về năng lượng mặt trời, công nghệ solar và các dự án của CTC",
      "itemListElement": news.slice(0, 10).map((item, index) => ({
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
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <SEO 
        title={t('news.title')}
        description={t('news.subtitle')}
        schema={itemListSchema}
      />

      <h1 className="text-3xl font-bold text-corporate mb-8 border-l-4 border-primary pl-4">{t('news.title')}</h1>
      
      {/* Category Filter */}
      <div className="mb-8">
        <CategoryFilter
          type="news"
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          showAll={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {news.map((item, idx) => (
          <div 
            key={`news-item-${item.id}-${idx}`} 
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer hover:-translate-y-1 transition-all duration-300"
            onClick={() => navigate(`/news/${item.id}`)}
          >
            <div className="relative">
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" />
              {item.isFeatured && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  ⭐ Nổi bật
                </div>
              )}
            </div>
            <div className="p-6">
              <span className="text-xs text-gray-500 block mb-2">{item.date}</span>
              <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-primary cursor-pointer">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.excerpt}</p>
            </div>
          </div>
        ))}
        {news.length === 0 && (
             <div className="col-span-full text-center py-12 text-gray-500">{t('news.no_news')}</div>
        )}
      </div>
    </div>
  );
};

export default News;
