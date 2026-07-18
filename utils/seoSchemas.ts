/**
 * SEO Schema Generators - JSON-LD Structured Data
 * Helps Google understand and display rich snippets
 */

// Site configuration - Thông tin công ty CTC
const SITE_URL = 'https://www.ctcdn.vn';
const SITE_NAME = 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung';
const SITE_SHORT_NAME = 'CTC';
const COMPANY_PHONE = '+84 236 3745 555';
const COMPANY_EMAIL = 'info@ctcdn.vn';
const COMPANY_ADDRESS = {
  street: '50B Nguyễn Du',
  ward: '',
  district: 'Hải Châu', 
  city: 'Đà Nẵng',
  postalCode: '550000',
  country: 'VN',
  full: '50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng'
};

// ==================== LOCAL BUSINESS SCHEMA ====================
export interface LocalBusinessData {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  geo?: {
    latitude?: number;
    longitude?: number;
  };
  openingHours?: string[];
  priceRange?: string;
  image?: string;
  logo?: string;
}

export function generateLocalBusinessSchema(data: LocalBusinessData = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: data.name || SITE_NAME,
    description: data.description || 'Thi công và lắp đặt hệ thống pin năng lượng mặt trời, máy phát điện năng lượng mặt trời, inverter, thiết bị năng lượng mặt trời tại Đà Nẵng và toàn quốc.',
    url: SITE_URL,
    telephone: data.phone || COMPANY_PHONE,
    email: data.email || COMPANY_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address?.street || COMPANY_ADDRESS.street,
      addressLocality: data.address?.city || COMPANY_ADDRESS.city,
      addressRegion: data.address?.region || COMPANY_ADDRESS.city,
      postalCode: data.address?.postalCode || COMPANY_ADDRESS.postalCode,
      addressCountry: data.address?.country || COMPANY_ADDRESS.country
    },
    geo: data.geo ? {
      '@type': 'GeoCoordinates',
      latitude: data.geo.latitude,
      longitude: data.geo.longitude
    } : {
      '@type': 'GeoCoordinates',
      latitude: 16.0759,
      longitude: 108.2201
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:30'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '12:00'
      }
    ],
    priceRange: data.priceRange || '$$',
    image: data.image || `${SITE_URL}/uploads/images/logo/tran-le-og.jpg`,
    logo: data.logo || `${SITE_URL}/uploads/images/logo/logo.png`,
    sameAs: [
      'https://www.facebook.com/ctcdn',
      'https://www.youtube.com/@ctcdn',
      'https://zalo.me/0915059666'
    ]
  };
}

// ==================== PRODUCT SCHEMA ====================
export interface ProductSchemaData {
  id: string;
  name: string;
  description: string;
  image: string;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  category?: string;
  sku?: string;
  rating?: {
    value: number;
    count: number;
  };
  reviews?: Array<{
    author: string;
    rating: number;
    content: string;
    date: string;
  }>;
}

export function generateProductSchema(product: ProductSchemaData) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/products/${product.id}`,
    name: product.name,
    description: product.description,
    image: product.image.startsWith('http') ? product.image : `${SITE_URL}${product.image}`,
    url: `${SITE_URL}/products/${product.id}`,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_NAME
    },
    category: product.category,
    sku: product.sku || product.id,
  };

  // Add offers if price available
  if (product.price) {
    schema.offers = {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.id}`,
      priceCurrency: product.currency || 'VND',
      price: product.price,
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME
      }
    };
  }

  // Add aggregate rating if available
  if (product.rating && product.rating.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value,
      reviewCount: product.rating.count,
      bestRating: 5,
      worstRating: 1
    };
  }

  // Add reviews if available
  if (product.reviews && product.reviews.length > 0) {
    schema.review = product.reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      },
      reviewBody: review.content,
      datePublished: review.date
    }));
  }

  return schema;
}

// ==================== FAQ SCHEMA ====================
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// ==================== BREADCRUMB SCHEMA ====================
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
    }))
  };
}

// ==================== ORGANIZATION SCHEMA ====================
export function generateOrganizationSchema(data: LocalBusinessData = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: data.name || SITE_NAME,
    alternateName: 'CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS  CONSTRUCTION JOINT - STOCK COMPANY',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: data.logo || `${SITE_URL}/uploads/images/logo/logo.png`
    },
    taxID: '0400458940',
    foundingDate: '2004-02-11',
    founder: {
      '@type': 'Person',
      name: 'Nguyễn Văn Duy'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_ADDRESS.street,
      addressLocality: COMPANY_ADDRESS.district,
      addressRegion: COMPANY_ADDRESS.city,
      postalCode: COMPANY_ADDRESS.postalCode,
      addressCountry: COMPANY_ADDRESS.country
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: data.phone || COMPANY_PHONE,
      email: COMPANY_EMAIL,
      contactType: 'customer service',
      areaServed: 'VN',
      availableLanguage: ['Vietnamese', 'English']
    },
    sameAs: [
      'https://www.facebook.com/ctcdn',
      'https://www.youtube.com/@ctcdn',
      'https://zalo.me/0915059666'
    ]
  };
}

// ==================== ARTICLE/NEWS SCHEMA ====================
export interface ArticleSchemaData {
  id: string;
  title: string;
  description: string;
  image: string;
  author?: string;
  datePublished: string;
  dateModified?: string;
  category?: string;
}

export function generateArticleSchema(article: ArticleSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/news/${article.id}`,
    headline: article.title,
    description: article.description,
    image: article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`,
    author: {
      '@type': 'Person',
      name: article.author || 'CTC Team'
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/uploads/images/logo/logo.png`
      }
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/news/${article.id}`
    }
  };
}

// ==================== WEBSITE SCHEMA ====================
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_SHORT_NAME,
    alternateName: SITE_NAME,
    description: 'Thi công lắp đặt hệ thống điện mặt trời, inverter, tấm pin năng lượng mặt trời tại Đà Nẵng và toàn quốc. Hotline: 0915 059 666',
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

// ==================== COMBINED SCHEMA FOR HOME PAGE ====================
export function generateHomePageSchema(businessData: LocalBusinessData = {}) {
  return [
    generateWebsiteSchema(),
    generateOrganizationSchema(businessData),
    generateLocalBusinessSchema(businessData)
  ];
}
