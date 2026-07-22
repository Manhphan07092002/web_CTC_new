import React from 'react';
import { NewsItem } from '../../types';
import { Calendar, Tag, Share2 } from 'lucide-react';

interface NewsArticleViewProps {
  news: NewsItem;
}

const NewsArticleView: React.FC<NewsArticleViewProps> = ({ news }) => {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Featured Image */}
      <div className="h-[400px] overflow-hidden relative">
        <img 
          src={news.image} 
          alt={news.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="p-8 md:p-12">
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span>{news.date}</span>
          </div>
          {news.category && (
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-primary" />
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                {news.category}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          {news.title}
        </h1>

        {/* Excerpt */}
        {news.excerpt && (
          <div className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 p-6 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border-l-4 border-primary leading-relaxed font-medium">
            {news.excerpt}
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
          <div className="whitespace-pre-line leading-relaxed space-y-4">
            {news.content || news.excerpt}
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Chia sẻ bài viết:</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Đã sao chép liên kết bài viết!');
                  }}
                  className="p-2.5 bg-primary text-white rounded-xl hover:bg-secondary transition-colors shadow-md flex items-center gap-2 text-xs font-bold"
                >
                  <Share2 size={16} /> Chia sẻ ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsArticleView;
