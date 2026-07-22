import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { NewsItem } from '../../types';

interface NewsProps {
  latestNews: NewsItem[];
  isLoading?: boolean;
}

const News: React.FC<NewsProps> = ({ latestNews, isLoading = false }) => {
  const { t } = useLanguage();
  const { ref: newsRef, isInView } = useInView(0.1);

  const displayNews = [...latestNews].slice(0, 3);

  return (
    <section ref={newsRef} className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="container max-w-[1440px] mx-auto px-6">
        <div className={`flex flex-col md:flex-row justify-between items-center mb-16 gap-6 transition-all duration-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Mail size={18} className="text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.news_badge')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">{t('home.news_events')}</h2>
          </div>
          <Link to="/news" className="bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 hover:border-primary hover:text-primary text-gray-700 dark:text-slate-200 px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 hover:-translate-y-1 hover:shadow-lg group">
            {t('common.view_details')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div aria-busy={isLoading} className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-300 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {isLoading ? Array.from({ length: 3 }, (_, index) => (
            <div key={`news-skeleton-${index}`} className="bg-white dark:bg-slate-950 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-slate-800 animate-pulse">
              <div className="h-64 bg-slate-200 dark:bg-slate-800" />
              <div className="p-8 space-y-4">
                <div className="h-6 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          )) : displayNews.map((news, index) => (
            <Link
              key={`news-${index}-${news.id}`} 
              to={`/news/${news.id}`}
              className="group bg-white dark:bg-slate-950 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-200 border border-gray-100 dark:border-slate-800 hover:border-primary/20 hover:-translate-y-2 flex flex-col h-full"
            >
              <div className="overflow-hidden h-64 relative">
                <img src={news.image} alt={news.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-md">
                  {news.date}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h4 className="font-bold text-xl text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors mb-4 line-clamp-2">{news.title}</h4>
                <p className="text-gray-500 dark:text-slate-400 text-base line-clamp-3 mb-6 flex-1 leading-relaxed">{news.excerpt}</p>
                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-medium">{t('home.news_badge')}</span>
                  <span className="text-primary font-bold text-sm group-hover:underline flex items-center gap-1">
                    {t('home.read_more')} <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
