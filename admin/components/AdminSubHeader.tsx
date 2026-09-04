import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { FileText, TrendingUp, Building2 } from 'lucide-react';

export const AdminSubHeader: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const isProfileSection = 
    location.pathname.includes('/admin/company-profiles') || 
    location.pathname.includes('/admin/financial-reports') || 
    location.pathname.includes('/admin/business-sectors');

  const isContentSection = 
    location.pathname.includes('/admin/content') || 
    location.pathname.includes('/admin/files');

  if (!isContentSection && !isProfileSection) {
    return null;
  }

  if (isProfileSection) {
    const profileTabs = [
      { to: '/admin/company-profiles', label: 'Hồ sơ năng lực', icon: FileText, active: location.pathname.includes('/admin/company-profiles') },
      { to: '/admin/financial-reports', label: 'Báo cáo tài chính', icon: TrendingUp, active: location.pathname.includes('/admin/financial-reports') },
      { to: '/admin/business-sectors', label: 'Lĩnh vực hoạt động', icon: Building2, active: location.pathname.includes('/admin/business-sectors') },
    ];

    return (
      <div className="h-12 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center px-4 sm:px-8 gap-6 text-sm font-medium overflow-x-auto scrollbar-hide flex-shrink-0">
        {profileTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex items-center gap-1.5 h-full border-b-2 px-1 transition-colors whitespace-nowrap ${
                tab.active
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'products';

  const contentTabs = [
    { id: 'products', to: '/admin/content?tab=products', label: t('admin.products') },
    { id: 'projects', to: '/admin/content?tab=projects', label: t('admin.projects') },
    { id: 'news', to: '/admin/content?tab=news', label: t('admin.news') },
    { id: 'partners', to: '/admin/content?tab=partners', label: t('admin.partners') },
    { id: 'testimonials', to: '/admin/content?tab=testimonials', label: t('admin.testimonials') },
    { id: 'resources', to: '/admin/content?tab=resources', label: 'Tài liệu' },
    { id: 'files', to: '/admin/files', label: 'Quản lý File & Media' },
  ];

  return (
    <div className="h-12 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center px-4 sm:px-8 gap-6 text-sm font-medium overflow-x-auto scrollbar-hide flex-shrink-0">
      {contentTabs.map(tab => {
        const isFilesTab = tab.id === 'files';
        const isActive = isFilesTab 
          ? location.pathname.includes('/admin/files')
          : (currentTab === tab.id && location.pathname.includes('/admin/content'));

        return (
          <Link
            key={tab.id}
            to={tab.to}
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

