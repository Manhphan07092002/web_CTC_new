import React from 'react';
import { NewsItem } from '../../types';
import { Link } from 'react-router-dom';
import { Phone, Calendar } from 'lucide-react';

interface NewsDetailSidebarProps {
  relatedNews: NewsItem[];
}

const NewsDetailSidebar: React.FC<NewsDetailSidebarProps> = ({ relatedNews }) => {
  return (
    <div className="space-y-6">
      {/* Latest News Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
          Tin tức liên quan
        </h3>
        <div className="space-y-4">
          {relatedNews.map((item, index) => (
            <Link 
              key={`sidebar-news-${item.id || (item as any)._id}-${index}`} 
              to={`/news/${item.id || (item as any)._id}`} 
              className="block group"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                    <Calendar size={12} />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-br from-primary to-orange-500 rounded-2xl p-6 text-white shadow-xl">
        <h3 className="text-xl font-bold mb-3">Cần tư vấn giải pháp?</h3>
        <p className="text-sm mb-6 opacity-90 leading-relaxed">
          Liên hệ với các chuyên gia CTC để được tư vấn chi tiết về hệ thống điện mặt trời tối ưu nhất.
        </p>
        <div className="space-y-3">
          <Link 
            to="/contact" 
            className="w-full bg-white text-primary py-3 rounded-xl font-bold text-center block hover:bg-gray-100 transition-colors shadow-md"
          >
            Liên hệ tư vấn
          </Link>
          <a 
            href="tel:0915059666" 
            className="w-full border border-white/40 text-white py-3 rounded-xl font-bold text-center block hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Phone size={16} /> Gọi 0915 059 666
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailSidebar;
