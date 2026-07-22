import React from 'react';
import { NewsItem } from '../../types';
import { Calendar, ArrowRight, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface NewsCardProps {
  item: NewsItem;
  onClick: () => void;
  viewMode?: 'list' | 'grid';
}

const NewsCard: React.FC<NewsCardProps> = ({ item, onClick, viewMode = 'list' }) => {
  const { t } = useLanguage();

  if (viewMode === 'list') {
    // 1 Hàng 1 Tin Tức (List View Mode - Horizontal Layout)
    return (
      <div 
        className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
        onClick={onClick}
      >
        {/* Image Container on Left */}
        <div className="w-full md:w-72 lg:w-80 h-52 md:h-auto flex-shrink-0 relative overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          {item.isFeatured && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
              ⭐ Nổi bật
            </div>
          )}
          {item.category && (
            <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {item.category}
            </div>
          )}
        </div>

        {/* Content Container on Right */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                <span>{item.date}</span>
              </div>
              {item.author && (
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-primary" />
                  <span>{item.author}</span>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-primary transition-colors leading-snug">
              {item.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed mb-6">
              {item.excerpt}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-primary font-bold text-sm flex items-center gap-2 group-hover:text-secondary">
              Đọc bài viết đầy đủ
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 3 Cột (Grid View Mode - Vertical Layout)
  return (
    <div 
      className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
      onClick={onClick}
    >
      <div className="h-48 overflow-hidden relative">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
        {item.isFeatured && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
            ⭐ Nổi bật
          </div>
        )}
        {item.category && (
          <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {item.category}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <Calendar size={14} className="text-primary" />
            <span>{item.date}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed mb-4">
            {item.excerpt}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-primary font-bold text-sm">
          <span>Xem chi tiết</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
