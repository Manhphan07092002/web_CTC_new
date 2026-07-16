import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbSchema } from '../utils/seoSchemas';
import { useLanguage } from '../contexts/LanguageContext';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Default route names mapping
const routeNames: Record<string, Record<string, string>> = {
  vi: {
    '/': 'Trang chủ',
    '/about': 'Giới thiệu',
    '/products': 'Sản phẩm',
    '/projects': 'Dự án',
    '/news': 'Tin tức',
    '/contact': 'Liên hệ',
    '/resources': 'Tài liệu',
    '/solutions': 'Giải pháp',
  },
  en: {
    '/': 'Home',
    '/about': 'About',
    '/products': 'Products',
    '/projects': 'Projects',
    '/news': 'News',
    '/contact': 'Contact',
    '/resources': 'Resources',
    '/solutions': 'Solutions',
  }
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const location = useLocation();
  const { language } = useLanguage();

  // Auto-generate breadcrumbs from URL if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const autoItems: BreadcrumbItem[] = [
      { name: routeNames[language]?.['/'] || 'Trang chủ', url: '/' }
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const name = routeNames[language]?.[currentPath] || 
                   path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      
      // Don't add link for last item (current page)
      autoItems.push({
        name,
        url: index === paths.length - 1 ? '' : currentPath
      });
    });

    return autoItems;
  })();

  // Don't show breadcrumb on home page
  if (location.pathname === '/') return null;

  // Generate schema
  const schemaItems = breadcrumbItems.filter(item => item.url).map(item => ({
    name: item.name,
    url: item.url || location.pathname
  }));

  return (
    <>
      {/* JSON-LD Schema */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema(schemaItems))}
        </script>
      </Helmet>

      {/* Visual Breadcrumb */}
      <nav 
        aria-label="Breadcrumb" 
        className={`py-3 px-4 bg-gray-50 dark:bg-slate-800/50 ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400 dark:text-slate-500" />
              )}
              
              {index === 0 ? (
                // Home icon for first item
                <Link
                  to={item.url}
                  className="flex items-center text-gray-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span className="sr-only">{item.name}</span>
                </Link>
              ) : item.url ? (
                // Link for middle items
                <Link
                  to={item.url}
                  className="text-gray-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                // Current page (no link)
                <span className="text-gray-900 dark:text-white font-medium">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;
