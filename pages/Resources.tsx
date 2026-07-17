
import React, { useState, useEffect } from 'react';
import { FileText, Download, BookOpen, Shield, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';

interface Resource {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  type: 'catalogue' | 'manual' | 'policy';
  size: string;
  isActive: boolean;
}

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalogue' | 'manual' | 'policy'>('catalogue');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-12 text-gray-500">Đang tải tài liệu...</div>;
    }

    const currentResources = resources.filter(r => r.type === activeTab);

    if (currentResources.length === 0) {
      return <div className="text-center py-12 text-gray-500">Hiện tại chưa có tài liệu nào trong mục này.</div>;
    }

    switch (activeTab) {
      case 'catalogue':
        return (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
             {currentResources.map(resource => (
               <div key={resource._id} className="flex items-start gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary transition-colors">
                 <div className="bg-blue-100 text-corporate p-4 rounded-lg">
                   <BookOpen size={32} />
                 </div>
                 <div className="flex-1">
                   <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">{resource.title}</h4>
                   <p className="text-sm text-gray-500 mb-3">{resource.description}</p>
                   <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                     <Download size={16} /> {t('resources.download')} {resource.size ? `(${resource.size})` : ''}
                   </a>
                 </div>
               </div>
             ))}
          </div>
        );
      case 'manual':
        return (
          <div className="space-y-4 animate-fade-in">
             {currentResources.map(resource => (
               <div key={resource._id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded text-gray-600 dark:text-gray-400"><SettingsIcon size={20} /></div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 block">{resource.title}</span>
                      {resource.description && <span className="text-sm text-gray-500 block">{resource.description}</span>}
                    </div>
                  </div>
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm">
                    <Download size={18}/> {resource.size}
                  </a>
               </div>
             ))}
          </div>
        );
      case 'policy':
        return (
          <div className="space-y-6 animate-fade-in">
             {currentResources.map(resource => (
               <div key={resource._id} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <h3 className="text-xl font-bold text-corporate mb-4 flex items-center gap-2">
                   <Shield size={24}/> {resource.title}
                 </h3>
                 <p className="text-gray-600 dark:text-gray-400 mb-4">{resource.description}</p>
                 <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
                    <Download size={18}/> Xem chính sách {resource.size ? `(${resource.size})` : ''}
                 </a>
               </div>
             ))}
          </div>
        );
      default: return null;
    }
  }

  const SettingsIcon = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

  return (
    <div className="w-full animate-fade-in pb-20">
      <SEO 
        title={t('resources.title')} 
        description="Thư viện tài liệu kỹ thuật, hướng dẫn sử dụng và chính sách bảo hành sản phẩm điện mặt trời của CTC."
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Tài liệu kỹ thuật - CTC",
          "description": "Catalogue, hướng dẫn sử dụng và chính sách bảo hành sản phẩm điện mặt trời",
          "publisher": {
            "@type": "Organization",
            "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "url": "https://www.ctcdn.vn"
          }
        }}
      />

       <div className="bg-gray-50 py-16 mb-12 border-b border-gray-200 dark:border-gray-700">
         <div className="container mx-auto px-4 text-center">
           <h1 className="text-3xl font-bold text-corporate mb-4">{t('resources.title')}</h1>
           <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t('resources.subtitle')}</p>
         </div>
       </div>

       <div className="container mx-auto px-4">
         <div className="flex flex-col md:flex-row gap-8">
           {/* Sidebar Menu */}
           <div className="w-full md:w-64 flex-shrink-0 space-y-2">
              <button 
                onClick={() => setActiveTab('catalogue')}
                className={`w-full text-left px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${activeTab === 'catalogue' ? 'bg-corporate text-white shadow-md' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 text-gray-600 dark:text-gray-400'}`}
              >
                <FileText size={18} /> {t('resources.catalogue')}
              </button>
              <button 
                onClick={() => setActiveTab('manual')}
                className={`w-full text-left px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${activeTab === 'manual' ? 'bg-corporate text-white shadow-md' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 text-gray-600 dark:text-gray-400'}`}
              >
                <BookOpen size={18} /> {t('resources.manual')}
              </button>
              <button 
                onClick={() => setActiveTab('policy')}
                className={`w-full text-left px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${activeTab === 'policy' ? 'bg-corporate text-white shadow-md' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 text-gray-600 dark:text-gray-400'}`}
              >
                <Shield size={18} /> {t('resources.policy')}
              </button>
           </div>

           {/* Main Content */}
           <div className="flex-1">
              {renderContent()}
           </div>
         </div>
       </div>
    </div>
  );
};

export default Resources;
