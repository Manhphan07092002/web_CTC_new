import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: string;
  schema?: object;
  noindex?: boolean;
  // For multilingual SEO
  alternateLanguages?: { lang: string; url: string }[];
}

// Company Information - Export để dùng ở các component khác
export const COMPANY_INFO = {
  name: 'CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN TRẦN LÊ',
  nameEn: 'TRAN LE ELECTRICAL EQUIPMENT CORPORATION',
  shortName: 'TRAN LE Electricity',
  taxId: '0402055834',
  phone: '02366562020',
  phoneFormatted: '+84 236 656 2020',
  email: 'info@tranle.vn',
  website: 'https://tranle.vn',
  address: {
    street: '275-279 Diên Hồng',
    ward: 'Phường Hòa Xuân',
    district: 'Quận Cẩm Lệ',
    city: 'Đà Nẵng',
    postalCode: '550000',
    country: 'VN',
    full: '275-279 Diên Hồng, Phường Hòa Xuân, Quận Cẩm Lệ, Đà Nẵng'
  },
  geo: {
    latitude: 16.0190,
    longitude: 108.2208
  },
  founder: 'TRẦN THANH XUÂN',
  foundingDate: '2020-07-28',
  social: {
    facebook: 'https://www.facebook.com/tranleelectricity',
    youtube: 'https://www.youtube.com/@tranleelectricity',
    zalo: 'https://zalo.me/0236656202'
  }
};

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = "điện mặt trời, solar energy, năng lượng mặt trời, tấm pin mặt trời, inverter, TRAN LE, lắp đặt điện mặt trời Đà Nẵng, hệ thống điện mặt trời, pin năng lượng mặt trời, điện năng lượng tái tạo", 
  image = "/uploads/images/logo/tran-le-og.jpg",
  type = 'website',
  schema,
  noindex = false,
  alternateLanguages
}) => {
  const location = useLocation();
  const { settings } = useSettings();
  const { language } = useLanguage();
  
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : COMPANY_INFO.website;
  const url = `${siteUrl}${location.pathname}`;
  const fullTitle = `${title} | ${settings.siteName || COMPANY_INFO.shortName}`;
  
  // Favicon URLs
  const faviconUrl = settings.favicon || settings.logo || '/favicon.ico';
  const appleIconUrl = settings.appleTouchIcon || settings.favicon || settings.logo;

  return (
    <Helmet>
      {/* Basic Meta */}
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={url} />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href={faviconUrl} />
      <link rel="shortcut icon" href={faviconUrl} />
      {appleIconUrl && <link rel="apple-touch-icon" href={appleIconUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `${siteUrl}${image}`} />
      <meta property="og:site_name" content={settings.siteName || COMPANY_INFO.shortName} />
      <meta property="og:locale" content={language === 'vi' ? 'vi_VN' : language === 'en' ? 'en_US' : language} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `${siteUrl}${image}`} />
      
      {/* Alternate Languages for SEO */}
      {alternateLanguages?.map(({ lang, url: altUrl }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={altUrl} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={url} />
      
      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
