import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

// Helper to convert any favicon image into a PNG data URL with smooth rounded corners
function getRoundedFaviconUrl(src: string, borderRadiusRatio = 0.22): Promise<string> {
  return new Promise((resolve) => {
    if (!src || typeof window === 'undefined') {
      return resolve(src);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(src);

        const radius = size * borderRadiusRatio; // 14px radius for 64px image
        
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

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
  name: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung',
  nameEn: 'CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS  CONSTRUCTION JOINT - STOCK COMPANY',
  shortName: 'CTC',
  taxId: '0400458940',
  phone: '02363745555',
  phoneFormatted: '+84 236 3745 555',
  email: 'info@ctcdn.vn',
  website: 'https://www.ctcdn.vn',
  address: {
    street: '50B Nguyễn Du',
    ward: 'Phường Thạch Thang',
    district: 'Hải Châu',
    city: 'Đà Nẵng',
    postalCode: '550000',
    country: 'VN',
    full: '50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng'
  },
  geo: {
    latitude: 16.0759,
    longitude: 108.2201
  },
  founder: 'Nguyễn Văn Duy',
  foundingDate: '2004-01-30',
  social: {
    facebook: 'https://www.facebook.com/ctcdn',
    youtube: 'https://www.youtube.com/@ctcdn',
    zalo: 'https://zalo.me/0915059666'
  }
};

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = "điện mặt trời, solar energy, năng lượng mặt trời, tấm pin mặt trời, inverter, CTC, lắp đặt điện mặt trời Đà Nẵng, hệ thống điện mặt trời, pin năng lượng mặt trời, điện năng lượng tái tạo", 
  image = "/images/why_choose_us_visual.webp",
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
  
  // Favicon URLs & Dynamic Rounded Favicon
  const faviconUrl = settings.favicon || settings.logo || '/favicon.ico';
  const [processedFavicon, setProcessedFavicon] = useState<string>(faviconUrl);

  useEffect(() => {
    let isMounted = true;
    if (faviconUrl) {
      getRoundedFaviconUrl(faviconUrl).then((roundedUrl) => {
        if (isMounted) {
          setProcessedFavicon(roundedUrl);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [faviconUrl]);

  return (
    <Helmet>
      {/* Basic Meta */}
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={url} />
      
      {/* Favicon with smooth rounded corners */}
      <link rel="icon" type="image/png" href={processedFavicon} />
      <link rel="shortcut icon" href={processedFavicon} />
      <link rel="apple-touch-icon" href={processedFavicon} />
      
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
