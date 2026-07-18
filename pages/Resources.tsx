import React, { useState, useEffect } from 'react';
import { FileText, Download, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';

interface Resource {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  categoryId: string | { _id: string; name: string; isActive: boolean };
  size: string;
  isActive: boolean;
}

interface DocumentCategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const Resources: React.FC = () => {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchCategories();
      await fetchResources();
      setLoading(false);
    };
    initData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/document-categories');
      const data = await response.json();
      if (Array.isArray(data)) {
        // Chỉ hiển thị các thể loại đang hoạt động
        const activeCategories = data.filter(c => c.isActive !== false);
        setCategories(activeCategories);
        if (activeCategories.length > 0) {
          setActiveTab(activeCategories[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching document categories:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      if (Array.isArray(data)) {
        setResources(data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const renderContent = () => {
    const currentResources = resources.filter(r => {
      const catId = typeof r.categoryId === 'object' && r.categoryId ? r.categoryId._id : r.categoryId;
      return catId === activeTab;
    });

    if (currentResources.length === 0) {
      return (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Hiện tại chưa có tài liệu nào trong mục này.</p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
        {currentResources.map(resource => (
          <div 
            key={resource._id} 
            className="flex items-start gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all duration-300"
          >
            <div className="bg-blue-50 dark:bg-blue-950/50 text-corporate dark:text-blue-400 p-3.5 rounded-xl flex-shrink-0">
              <FileText size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1.5 line-clamp-1 text-base">{resource.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 h-10">{resource.description || 'Không có mô tả ngắn.'}</p>
              <a 
                href={resource.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:text-primary-dark text-sm font-bold flex items-center gap-1.5 hover:underline"
              >
                <Download size={16} /> 
                {t('resources.download') || 'Tải xuống'}
                {resource.size ? ` (${resource.size})` : ''}
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full animate-fade-in pb-20">
      <SEO 
        title={t('resources.title') || 'Tài liệu'} 
        description="Thư viện tài liệu kỹ thuật, hướng dẫn sử dụng và chính sách bảo hành sản phẩm điện mặt trời của CTC."
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Tài liệu kỹ thuật - CTC",
          "description": "Catalogue, hướng dẫn sử dụng và chính sách bảo hành sản phẩm điện mặt trời của CTC",
          "publisher": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn"
          }
        }}
      />

      <div className="bg-gray-50 dark:bg-gray-900/45 py-16 mb-12 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-corporate dark:text-white mb-4">{t('resources.title') || 'Tài liệu kỹ thuật'}</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t('resources.subtitle') || 'Tra cứu và tải xuống các tài liệu mới nhất'}</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải tài liệu...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Không tìm thấy thể loại tài liệu nào đang hoạt động.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Menu */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-2">
              {categories.map(cat => (
                <button 
                  key={cat._id}
                  onClick={() => setActiveTab(cat._id)}
                  className={`w-full text-left px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-3 ${
                    activeTab === cat._id 
                      ? 'bg-corporate text-white shadow-md' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-650 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <FileText size={18} /> 
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
