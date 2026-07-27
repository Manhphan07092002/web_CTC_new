import React from 'react';
import { Search, Flame, Newspaper, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

interface NewsHeroProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  latestArticleTitle?: string;
  onLatestClick?: () => void;
  totalArticles?: number;
}

const NewsHero: React.FC<NewsHeroProps> = ({
  searchQuery = '',
  onSearchChange,
  latestArticleTitle = 'CTC hoàn thành xuất sắc dự án Trạm biến áp 110kV & Điện gió trọng điểm Miền Trung',
  onLatestClick,
  totalArticles = 200
}) => {
  const { language } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden border-b border-slate-800">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 space-y-8">
        
        {/* Top Ticker: Breaking News */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 p-2 px-4 rounded-full max-w-4xl mx-auto shadow-xl">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white font-black text-[11px] uppercase tracking-wider rounded-full shadow-md flex-shrink-0 animate-pulse">
            <Flame size={13} /> TIN MỚI
          </span>
          <div 
            onClick={onLatestClick}
            className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-amber-300 truncate cursor-pointer transition-colors flex-1"
          >
            {latestArticleTitle}
          </div>
        </div>

        {/* Hero Title & Intro */}
        <div className="text-center max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-xs font-bold text-cyan-300 shadow-inner">
            <ShieldCheck size={14} />
            <span>TẠP CHÍ ĐIỆN TỬ CTC NEWS & EVENT</span>
          </div>

          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[2.4rem] xl:text-[2.75rem] font-black tracking-tight text-white leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Tin Tức &amp; Thông Tin{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-primary to-amber-300 bg-clip-text text-transparent">
              Chuyên Ngành Năng Lượng
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Cập nhật liên tục tin tức, quy chuẩn kỹ thuật, báo cáo phân tích về Điện mặt trời, Điện gió, Trạm biến áp 110kV và Hạ tầng số Miền Trung.
          </p>
        </div>

        {/* Search Bar inside Hero */}
        {onSearchChange && (
          <div className="max-w-xl mx-auto relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nhập tên bài viết, quy chuẩn kỹ thuật, chủ đề solar..."
              className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-slate-900/80 transition-all shadow-2xl"
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
        )}

        {/* Quick Stats Counter Badges */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 pt-4 text-xs sm:text-sm text-slate-300 border-t border-slate-800/80 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Newspaper size={16} className="text-primary" />
            <span><strong className="text-white font-extrabold">{totalArticles}+</strong> Bài viết chuyên sâu</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span><strong className="text-white font-extrabold">10+</strong> Danh mục chuyên ngành</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span><strong className="text-white font-extrabold">24/7</strong> Cập nhật liên tục</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsHero;
