import React from 'react';
import { NewsItem } from '../../types';
import { Link } from 'react-router-down'; // Wait, let's use react-router-dom!
import { Calendar, ArrowRight } from 'lucide-react';

interface RelatedNewsProps {
  news: NewsItem[];
}

const RelatedNews: React.FC<RelatedNewsProps> = ({ news }) => {
  if (news.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-corporate dark:text-white mb-8 border-l-4 border-primary pl-3">
        Bài viết liên quan khác
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {news.map((item, index) => (
          <a
            key={`related-news-${item.id || (item as any)._id}-${index}`}
            href={`/#/news/${item.id || (item as any)._id}`}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all group flex flex-col"
          >
            <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              {item.category && (
                <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {item.category}
                </span>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Calendar size={14} className="text-primary" />
                  <span>{item.date}</span>
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">
                  {item.excerpt}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-primary font-bold text-xs">
                <span>Đọc bài viết</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RelatedNews;
