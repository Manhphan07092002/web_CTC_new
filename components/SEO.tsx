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
  url?: string;
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
  keywords = "thi công điện mặt trời áp mái, điện mặt trời nhà xưởng, EPC Solar C&I, nhà thầu cáp quang, thiết kế mạng doanh nghiệp, Data Center, trạm 110kV, chứng chỉ viễn thông Hạng I, chứng chỉ trạm biến áp Hạng II, router MikroTik, router DrayTek, switch PoE, Wi-Fi 6, SFP, ODF, VoIP Gateway Dinstar, inverter hòa lưới Huawei, Sungrow, ắc quy Lithium 48V-100Ah, ắc quy viễn thông, pin lưu trữ điện mặt trời, UPS phòng server, PoE Budget, VLAN, VPN Site-to-Site, suy hao quang, đo OTDR, FXS và FXO, bảo trì điện mặt trời O&M, thiết bị mạng Đà Nẵng, điện mặt trời Đà Nẵng, thi công cáp quang miền Trung, điện mặt trời Quảng Trị, thiết bị viễn thông Đắk Lắk, CTC Telecom", 
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
  const siteBrand = settings.siteName || COMPANY_INFO.shortName;
  const fullTitle = title.includes(siteBrand) ? title : `${title} | ${siteBrand}`;
  
  // Favicon URLs & Dynamic Rounded Favicon from Admin Settings
  const rawFavicon = settings.favicon || settings.logoHeader || settings.logo || settings.logoFooter || '/favicon.svg';
  const [processedFavicon, setProcessedFavicon] = useState<string>(rawFavicon);

  useEffect(() => {
    let isMounted = true;
    const targetUrl = rawFavicon.startsWith('http') 
      ? rawFavicon 
      : `${siteUrl}${rawFavicon.startsWith('/') ? '' : '/'}${rawFavicon}`;

    getRoundedFaviconUrl(targetUrl).then((roundedUrl) => {
      if (isMounted) {
        const finalFavicon = roundedUrl || targetUrl;
        setProcessedFavicon(finalFavicon);
        
        // Cập nhật trực tiếp lên các thẻ link icon trong DOM để trình duyệt đổi biểu tượng tab ngay lập tức
        try {
          const existingLinks = document.querySelectorAll("link[rel*='icon']");
          if (existingLinks.length > 0) {
            existingLinks.forEach((link: any) => {
              link.href = finalFavicon;
            });
          }
        } catch (e) {}
      }
    });

    return () => {
      isMounted = false;
    };
  }, [rawFavicon, siteUrl]);

  return (
    <Helmet>
      {/* Basic Meta */}
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="msvalidate.01" content="83836E53859E9433C6450A20F7053C0F" />
      <meta name="google-site-verification" content="JnGNV8fGgZMWP35KAI8XN6bY-rrsqhMd14fVdTgHqec" />
      <meta name="geo.region" content="VN-DN" />
      <meta name="geo.placename" content="Đà Nẵng" />
      <meta name="geo.position" content="16.0759;108.2201" />
      <meta name="ICBM" content="16.0759, 108.2201" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
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
