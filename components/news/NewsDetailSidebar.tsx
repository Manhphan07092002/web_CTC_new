import React, { useState, useEffect } from 'react';
import { NewsItem } from '../../types';
import { Link } from 'react-router-dom';
import { Phone, Calendar, Flame, ArrowRight, TrendingUp, Mail, CheckCircle2, ChevronRight } from 'lucide-react';

import { api } from '../../services/api';
import { getNewsUrl } from '../../utils/news-url-helper';

interface NewsDetailSidebarProps {
  relatedNews: NewsItem[];
}

interface CategoryItem {
  id: string;
  name: string;
  count: number;
}

export const NewsDetailSidebar: React.FC<NewsDetailSidebarProps> = ({ relatedNews }) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'latest'>('trending');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [catsData, allNewsData] = await Promise.all([
          api.newsCategories.getAll(),
          api.news.getAll()
        ]);

        const newsList = allNewsData || [];
        const catsList = catsData || [];

        if (catsList.length > 0) {
          const list = catsList.map(cat => {
            const catName = cat.name || cat.title || '';
            const catId = cat.id || cat._id || cat.slug;
            const count = newsList.filter((item: any) => 
              item.category === catName || item.category === catId || item.categoryId === catId
            ).length;

            return {
              id: catId,
              name: catName,
              count
            };
          });
          setCategories(list);
        } else {
          // If newsCategories collection is empty, compute unique categories directly from news items
          const countMap: { [key: string]: number } = {};
          newsList.forEach((item: any) => {
            if (item.category) {
              countMap[item.category] = (countMap[item.category] || 0) + 1;
            }
          });
          const list = Object.keys(countMap).map(name => ({
            id: name,
            name,
            count: countMap[name]
          }));
          setCategories(list);
        }
      } catch (error) {
        console.error('Error fetching categories for news sidebar:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="space-y-6 sticky top-32">
      
      {/* Newspaper Tabbed Trending & Latest News Box */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/80 overflow-hidden">
        
        {/* Tab Headers */}
        <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-700/60 p-1 rounded-t-3xl border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('trending')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'trending'
                ? 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm rounded-2xl'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Flame size={14} className="text-red-500" />
            Xem nhiều nhất
          </button>
          <button
            onClick={() => setActiveTab('latest')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'latest'
                ? 'bg-white dark:bg-gray-800 text-primary shadow-sm rounded-2xl'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={14} className="text-primary" />
            Bài viết mới
          </button>
        </div>

        {/* Tab Content List */}
        <div className="p-5 space-y-4">
          {(() => {
            const sortedList = [...relatedNews].sort((a, b) => {
              if (activeTab === 'trending') {
                return (b.viewCount || 0) - (a.viewCount || 0);
              } else {
                return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
              }
            }).slice(0, 5);

            return sortedList.map((item, index) => {
              const targetId = (item as any)._id || item.id;
              return (
                <Link 
                  key={`sidebar-news-${targetId}-${index}`} 
                  to={getNewsUrl(item)} 
                  className="block group"
                >
                <div className="flex gap-3.5 items-start">
                  {/* Ranking Badge */}
                  <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                    index === 0 ? 'bg-red-600 text-white' : 
                    index === 1 ? 'bg-amber-500 text-white' : 
                    index === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                  }`}>
                    {index + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1.5">
                      <Calendar size={12} className="text-amber-500" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          });
        })()}
        </div>

      </div>

      {/* Newspaper Categories Index */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/80 p-6 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
          Chuyên mục báo chí
        </h3>
        <div className="space-y-2">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              to={`/news?category=${encodeURIComponent(cat.name)}`}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all group"
            >
              <div className="flex items-center gap-2">
                <ChevronRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
                <span>{cat.name}</span>
              </div>
              <span className="text-[11px] font-bold text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-0.5 rounded-md">
                {cat.count} bài
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Newspaper Newsletter Subscription Box */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4 border border-slate-700/80">
        <div className="flex items-center gap-2 text-amber-400">
          <Mail size={18} />
          <span className="text-xs font-black uppercase tracking-wider">Đăng ký nhận bản tin</span>
        </div>
        <h4 className="font-extrabold text-base text-white leading-snug">
          Nhận phân tích & báo cáo năng lượng CTC hàng tuần
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Cập nhật quy định chính sách mới nhất và xu hướng công nghệ solar.
        </p>

        {subscribed ? (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} /> Đã đăng ký thành công!
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2.5">
            <input 
              type="email" 
              required 
              placeholder="Nhập email của bạn..." 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button 
              type="submit"
              className="w-full py-2.5 px-4 bg-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-secondary transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              Đăng ký ngay <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>

      {/* Corporate Ocean Blue Consultation Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-blue-800 to-slate-950 p-6 text-white shadow-2xl space-y-4 border border-sky-400/20 group">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-sky-500/20 blur-xl group-hover:scale-125 transition-transform" />

        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 border border-white/10">
          Tư vấn giải pháp điện mặt trời
        </span>

        <h3 className="text-lg font-black leading-tight">Bạn cần báo giá & dự toán công suất?</h3>
        <p className="text-xs text-slate-200 leading-relaxed opacity-90">
          Kỹ sư CTC Solar hỗ trợ tính toán phương án tài chính & hoàn vốn chi tiết cho công trình của bạn.
        </p>

        <div className="space-y-2.5 pt-1">
          <Link 
            to="/contact" 
            className="w-full py-3 px-4 bg-white text-blue-800 font-black text-xs uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-2 hover:bg-amber-300 hover:text-slate-900 transition-all shadow-xl"
          >
            Nhận Báo Giá Miễn Phí <ArrowRight size={14} />
          </Link>
          <a 
            href="tel:0915059666" 
            className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-2 transition-all backdrop-blur-md"
          >
            <Phone size={15} className="text-amber-400 animate-pulse" /> Hotline: 0915 059 666
          </a>
        </div>
      </div>

    </div>
  );
};

export default NewsDetailSidebar;
