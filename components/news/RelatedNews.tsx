import React from 'react';
import { NewsItem } from '../../types';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

interface RelatedNewsProps {
  news: NewsItem[];
}

export const RelatedNews: React.FC<RelatedNewsProps> = ({ news }) => {
  if (news.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-primary">Tin tức & Khuyến nghị</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Bài viết liên quan khác
          </h2>
        </div>
        <Link 
          to="/news" 
          className="text-xs font-extrabold text-primary hover:text-secondary flex items-center gap-1 hover:underline"
        >
          Xem tất cả tin tức <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {news.map((item, index) => {
          const targetId = (item as any)._id || item.id;
          return (
            <Link
              key={`related-news-${targetId}-${index}`}
              to={`/news/${targetId}`}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/80 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col"
            >
            <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              {item.category && (
                <span className="absolute top-3 left-3 bg-primary text-white text-xs font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                  {item.category}
                </span>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Calendar size={13} className="text-amber-500" />
                  <span>{item.date}</span>
                </div>
                <h4 className="font-extrabold text-gray-900 dark:text-white text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed mt-2">
                  {item.excerpt}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-primary font-bold text-xs">
                <span>Đọc bài viết ngay</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedNews;
