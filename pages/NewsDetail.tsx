import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { NewsItem } from '../types';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import Loading from '../components/Loading';

import {
  NewsArticleView,
  NewsDetailSidebar,
  RelatedNews
} from '../components/news';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchNews = async () => {
      if (id) {
        setLoading(true);
        try {
          const newsData = await api.news.getById(id);
          setNews(newsData);
          
          if (newsData) {
            const allNews = await api.news.getAll();
            const related = allNews.filter(n => n.category === newsData.category && n.id !== newsData.id).slice(0, 3);
            setRelatedNews(related);
          }
        } catch (error) {
          console.error('Error fetching news:', error);
        }
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    fetchNews();
  }, [id]);

  if (loading) return <Loading fullScreen={false} className="h-[60vh]" />;

  if (!news) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Không tìm thấy bài viết</h2>
      <Link to="/news" className="text-primary hover:underline mt-4 block font-bold">Xem tất cả tin tức</Link>
    </div>
  );

  const getNewsSchema = (n: NewsItem) => ({
    "@context": "https://schema.org/",
    "@type": "NewsArticle",
    "@id": `${window.location.origin}/news/${id}`,
    "headline": n.title,
    "image": n.image?.startsWith('http') ? n.image : `${window.location.origin}${n.image}`,
    "description": n.excerpt,
    "datePublished": n.date,
    "dateModified": n.date,
    "author": {
      "@type": "Organization",
      "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
      "url": "https://www.ctcdn.vn"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CTC",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/uploads/images/logo/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${window.location.origin}/news/${id}`
    }
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 font-sans text-gray-700 dark:text-gray-300 pb-20 animate-fade-in pt-24">
      <SEO 
        title={news.title}
        description={news.excerpt?.substring(0, 160) || ''}
        image={news.image}
        schema={getNewsSchema(news)}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-primary flex items-center gap-1"><Home size={14}/> {t('nav.home')}</Link>
            <ChevronRight size={14} className="mx-2"/>
            <Link to="/news" className="hover:text-primary">Tin tức</Link>
            <ChevronRight size={14} className="mx-2"/>
            <span className="text-corporate dark:text-primary font-semibold truncate">{news.title}</span>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Article Content (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <NewsArticleView news={news} />
          </div>

          {/* Right Sidebar (lg:col-span-1) */}
          <div className="lg:col-span-1">
            <NewsDetailSidebar relatedNews={relatedNews} />
          </div>
        </div>

        {/* Bottom Related News */}
        <RelatedNews news={relatedNews} />
      </div>
    </div>
  );
};

export default NewsDetail;
