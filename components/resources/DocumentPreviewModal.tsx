import React, { useState } from 'react';
import { ResourceItem } from './ResourceCard';
import { X, Download, ExternalLink, FileText, Maximize2, Minimize2, Printer, Copy, Check } from 'lucide-react';

interface DocumentPreviewModalProps {
  resource: ResourceItem | null;
  onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ resource, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!resource) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resource.fileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to determine viewer URL
  const getViewerUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    // If it's a PDF, render directly or use Google Docs viewer for Office files
    const lower = fileUrl.toLowerCase();
    if (lower.endsWith('.pdf') || lower.includes('.pdf')) {
      return fileUrl;
    }
    // Fallback to Google Docs viewer for doc, docx, xlsx, pptx
    return `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 md:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div 
        className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative z-10 border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-5xl h-[88vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/20 text-primary rounded-xl flex-shrink-0">
              <FileText size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base md:text-lg text-white truncate drop-shadow-sm">
                {resource.title}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {resource.categoryName || 'Tài liệu kỹ thuật CTC'} {resource.size ? ` • ${resource.size}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5"
              title="Sao chép liên kết"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? 'Đã chép' : 'Link'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              title="In tài liệu"
            >
              <Printer size={18} />
            </button>

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Direct Download Button */}
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Tải về</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors ml-2"
              title="Đóng xem trước"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* In-Browser Document Viewer Frame */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-950 relative overflow-hidden">
          {resource.fileUrl ? (
            <iframe
              src={getViewerUrl(resource.fileUrl)}
              className="w-full h-full border-0"
              title={resource.title}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
              <FileText size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-lg font-bold">Không thể tải bản xem trước trực tiếp</p>
              <p className="text-sm mt-1 mb-6">Bạn có thể tải tài liệu về máy để xem nội dung chi tiết.</p>
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
              >
                <Download size={18} /> Tải file về máy
              </a>
            </div>
          )}
        </div>

        {/* Bottom Info Status Bar */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          <p className="truncate max-w-xl">
            {resource.description || 'Hồ sơ tài liệu kỹ thuật thuộc bản quyền Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC).'}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
              ✓ Đã kiểm duyệt an toàn
            </span>
            <a 
              href={resource.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-bold flex items-center gap-1"
            >
              Mở trong cửa sổ mới <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
