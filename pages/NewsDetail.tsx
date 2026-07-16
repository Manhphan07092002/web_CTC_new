import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { NewsItem } from '../types';
import { ArrowLeft, Calendar, User, Eye, Share2, ChevronRight, Home, Tag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';

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

  if (loading) return <div className="w-full h-[60vh] flex items-center justify-center"><div className="animate-spin-slow text-primary text-4xl">☀️</div></div>;

  if (!news) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Không tìm thấy bài viết</h2>
      <Link to="/news" className="text-primary hover:underline mt-4 block">Xem tất cả tin tức</Link>
    </div>
  );

  const getNewsSchema = (news: NewsItem) => ({
    "@context": "https://schema.org/",
    "@type": "NewsArticle",
    "@id": `${window.location.origin}/news/${id}`,
    "headline": news.title,
    "image": news.image?.startsWith('http') ? news.image : `${window.location.origin}${news.image}`,
    "description": news.excerpt,
    "datePublished": news.date,
    "dateModified": news.date,
    "author": {
      "@type": "Organization",
      "name": "CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN TRẦN LÊ",
      "url": "https://tranle.vn"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TRAN LE Electricity",
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
    <div className="bg-gray-50 font-sans text-gray-700 dark:text-gray-300 pb-20 animate-fade-in">
      <SEO 
        title={news.title}
        description={news.excerpt?.substring(0, 160) || ''}
        image={news.image}
        schema={getNewsSchema(news)}
      />

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-primary flex items-center gap-1"><Home size={14}/> {t('nav.home')}</Link>
            <ChevronRight size={14} className="mx-2"/>
            <Link to="/news" className="hover:text-primary">Tin tức</Link>
            <ChevronRight size={14} className="mx-2"/>
            <span className="text-corporate font-semibold truncate">{news.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Content */}
          <div className="lg:col-span-3">
            <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Featured Image */}
              <div className="h-[400px] overflow-hidden">
                <img 
                  src={news.image} 
                  alt={news.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 md:p-12">
                {/* Meta Info */}
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{news.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={16} />
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {news.category}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {news.title}
                </h1>

                {/* Excerpt */}
                {news.excerpt && (
                  <div className="text-xl text-gray-600 dark:text-gray-400 mb-8 p-6 bg-gray-50 rounded-xl border-l-4 border-primary">
                    {news.excerpt}
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                  <div className="whitespace-pre-line leading-relaxed">
                    {news.content || news.excerpt}
                  </div>
                </div>

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Chia sẻ bài viết:</span>
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Latest News */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tin tức mới nhất</h3>
              <div className="space-y-4">
                {relatedNews.map((item, index) => (
                  <Link key={`sidebar-news-${item.id}-${index}`} to={`/news/${item.id}`} className="block group">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-gradient-to-br from-primary to-orange-500 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Cần tư vấn?</h3>
              <p className="text-sm mb-6 opacity-90">Liên hệ với chúng tôi để được tư vấn chi tiết về giải pháp năng lượng mặt trời.</p>
              <Link 
                to="/contact" 
                className="w-full bg-white dark:bg-gray-900 text-primary py-3 rounded-lg font-bold text-center block hover:bg-gray-100 transition-colors"
              >
                Liên hệ ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-corporate mb-8 border-l-4 border-primary pl-3">Tin tức liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedNews.map((item, index) => (
                <Link key={`related-news-${item.id}-${index}`} to={`/news/${item.id}`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group">
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white dark:bg-gray-800/90 backdrop-blur text-gray-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full">
                        {item.date}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;
