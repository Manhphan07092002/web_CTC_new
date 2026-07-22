import React from 'react';
import { ResourceItem } from './ResourceCard';
import { ShieldCheck, Download, Eye, Sparkles, FileText, ArrowUpRight } from 'lucide-react';

interface FeaturedResourcesProps {
  resources: ResourceItem[];
  onPreview: (resource: ResourceItem) => void;
}

const FeaturedResources: React.FC<FeaturedResourcesProps> = ({ resources, onPreview }) => {
  if (resources.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={20} className="text-yellow-500 animate-bounce" />
        <h2 className="text-xl md:text-2xl font-extrabold text-corporate dark:text-white tracking-tight">
          Hồ Sơ Năng Lực & Tài Liệu Nổi Bật CTC
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.slice(0, 3).map((item, idx) => (
          <div 
            key={`featured-doc-${item._id}-${idx}`}
            className="bg-gradient-to-br from-corporate via-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group border border-white/10 hover:border-yellow-400/50 transition-all duration-300"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-black rounded-full uppercase tracking-wider shadow-md">
                  ★ NỔI BẬT
                </span>
                <span className="text-xs text-white/70 font-medium">CTC Official</span>
              </div>

              <h3 className="text-lg font-extrabold mb-2 line-clamp-2 leading-snug group-hover:text-yellow-300 transition-colors">
                {item.title}
              </h3>

              <p className="text-xs text-white/80 line-clamp-2 mb-6 leading-relaxed font-light">
                {item.description || 'Hồ sơ tài liệu chính thức phục vụ tra cứu thông số kỹ thuật & năng lực thực thi dự án.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
              <button
                onClick={() => onPreview(item)}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all backdrop-blur-sm"
              >
                <Eye size={14} className="text-yellow-400" /> Xem trực tiếp
              </button>

              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="py-2.5 px-3 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Download size={14} /> Tải file ngay
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedResources;
