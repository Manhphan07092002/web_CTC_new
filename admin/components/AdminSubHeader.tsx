import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export const AdminSubHeader: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  // Check if we are in content section or files section
  if (!location.pathname.includes('/admin/content') && !location.pathname.includes('/admin/files')) {
    return null;
  }

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'products';

  const contentTabs = [
    { id: 'products', label: t('admin.products') },
    { id: 'projects', label: t('admin.projects') },
    { id: 'news', label: t('admin.news') },
    { id: 'partners', label: t('admin.partners') },
    { id: 'testimonials', label: t('admin.testimonials') },
    { id: 'resources', label: 'Tài liệu' },
  ];

  return (
    <div className="h-12 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center px-4 sm:px-8 gap-6 text-sm font-medium overflow-x-auto scrollbar-hide flex-shrink-0">
      {contentTabs.map(tab => {
        const to = `/admin/content?tab=${tab.id}`;
        const isActive = currentTab === tab.id && location.pathname.includes('/admin/content');

        return (
          <Link
            key={tab.id}
            to={to}
            className={`flex items-center h-full border-b-2 px-1 transition-colors whitespace-nowrap ${
              isActive
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default AdminSubHeader;
