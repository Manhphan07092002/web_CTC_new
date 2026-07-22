import React from 'react';
import { FileText, Download, Eye, HardDrive, FileCheck, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface ResourceItem {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  categoryId: string | { _id: string; name: string; isActive: boolean };
  size?: string;
  categoryName?: string;
  fileType?: string; // pdf, docx, dwg, xlsx
  isActive?: boolean;
}

interface ResourceCardProps {
  resource: ResourceItem;
  viewMode?: 'list' | 'grid';
  onPreview?: (resource: ResourceItem) => void;
}

const getFileTypeBadge = (fileUrl: string, fileType?: string) => {
  const ext = fileType || fileUrl?.split('.').pop()?.toLowerCase() || 'pdf';
  if (ext.includes('pdf')) {
    return { label: 'PDF', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' };
  }
  if (ext.includes('doc')) {
    return { label: 'DOCX', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' };
  }
  if (ext.includes('xls') || ext.includes('csv')) {
    return { label: 'EXCEL', bg: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' };
  }
  if (ext.includes('dwg') || ext.includes('cad')) {
    return { label: 'CAD/DWG', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' };
  }
  return { label: 'TÀI LIỆU', bg: 'bg-primary/10 text-primary border-primary/20' };
};

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, viewMode = 'list', onPreview }) => {
  const { t } = useLanguage();
  const badge = getFileTypeBadge(resource.fileUrl, resource.fileType);

  if (viewMode === 'list') {
    // 1 Hàng 1 Tài Liệu (Horizontal Knowledge Base Card)
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-xl transition-all duration-300 group">
        
        {/* Document Meta Information */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 text-corporate dark:text-blue-400 p-4 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform border border-blue-100 dark:border-gray-600">
            <FileText size={32} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-md border ${badge.bg}`}>
                {badge.label}
              </span>
              {resource.categoryName && (
                <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-md">
                  {resource.categoryName}
                </span>
              )}
              <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <ShieldCheck size={14} /> Chính thức CTC
              </span>
            </div>

            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg group-hover:text-primary transition-colors line-clamp-1 mb-1">
              {resource.title}
            </h4>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed">
              {resource.description || 'Tài liệu thông số kỹ thuật và catalogue hướng dẫn chính thức từ CTC.'}
            </p>

            {resource.size && (
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <HardDrive size={13} />
                <span>Dung lượng: {resource.size}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dual Action Buttons: Preview & Download */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700 flex-shrink-0">
          {/* Preview On Web Button */}
          {onPreview && (
            <button
              onClick={() => onPreview(resource)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              title="Xem trực tiếp trên trình duyệt"
            >
              <Eye size={16} className="text-primary" />
              <span>Xem trực tiếp</span>
            </button>
          )}

          {/* Download Button */}
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex-1 sm:flex-none px-5 py-2.5 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg"
            title="Tải về máy tính / thiết bị"
          >
            <Download size={16} />
            <span>Tải về</span>
          </a>
        </div>
      </div>
    );
  }

  // Lưới 3 Cột (Grid Portal Card)
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-xl transition-all duration-300 group justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 text-corporate dark:text-blue-400 p-3.5 rounded-2xl group-hover:scale-105 transition-transform border border-blue-100 dark:border-gray-600">
            <FileText size={28} />
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        {resource.categoryName && (
          <span className="text-[11px] font-bold text-primary block mb-1 uppercase tracking-wider">
            {resource.categoryName}
          </span>
        )}

        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 text-base group-hover:text-primary transition-colors leading-snug">
          {resource.title}
        </h4>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
          {resource.description || 'Tài liệu kỹ thuật và hướng dẫn chính thức từ nhà sản xuất.'}
        </p>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>{resource.size ? `Size: ${resource.size}` : 'Tệp kỹ thuật'}</span>
          <span className="text-green-600 dark:text-green-400 font-semibold text-[11px] flex items-center gap-0.5">
            <FileCheck size={12} /> Đã kiểm duyệt
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {onPreview && (
            <button
              onClick={() => onPreview(resource)}
              className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              <Eye size={14} className="text-primary" /> Xem
            </button>
          )}

          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="w-full py-2 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <Download size={14} /> Tải về
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
