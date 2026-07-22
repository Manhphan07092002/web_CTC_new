import React from 'react';
import { FileText, Download, ExternalLink, HardDrive } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface ResourceItem {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  categoryId: string | { _id: string; name: string; isActive: boolean };
  size?: string;
  categoryName?: string;
  fileType?: string;
  isActive?: boolean;
}

interface ResourceCardProps {
  resource: ResourceItem;
  viewMode?: 'list' | 'grid';
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, viewMode = 'list' }) => {
  const { t } = useLanguage();

  if (viewMode === 'list') {
    // 1 Hàng 1 Tài Liệu (List Mode)
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="bg-blue-50 dark:bg-blue-950/60 text-corporate dark:text-blue-400 p-4 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg group-hover:text-primary transition-colors line-clamp-1">
                {resource.title}
              </h4>
              {resource.categoryName && (
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                  {resource.categoryName}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
              {resource.description || 'Tài liệu hướng dẫn kỹ thuật và thông số sản phẩm chính hãng.'}
            </p>
            {resource.size && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <HardDrive size={13} />
                <span>Kích thước: {resource.size}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 bg-primary hover:bg-secondary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <Download size={18} />
            <span>Tải xuống</span>
          </a>
        </div>
      </div>
    );
  }

  // Lưới 3 Cột (Grid Mode)
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-xl transition-all duration-300 group justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="bg-blue-50 dark:bg-blue-950/60 text-corporate dark:text-blue-400 p-3.5 rounded-2xl group-hover:scale-105 transition-transform">
            <FileText size={28} />
          </div>
          {resource.categoryName && (
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
              {resource.categoryName}
            </span>
          )}
        </div>

        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 text-base group-hover:text-primary transition-colors leading-snug">
          {resource.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
          {resource.description || 'Tài liệu kỹ thuật chính thức từ nhà sản xuất.'}
        </p>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">
          {resource.size ? `Dung lượng: ${resource.size}` : 'Tệp PDF'}
        </span>
        <a
          href={resource.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Download size={14} />
          <span>Tải tệp</span>
        </a>
      </div>
    </div>
  );
};

export default ResourceCard;
