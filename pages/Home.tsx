import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product, Project, NewsItem, Testimonial } from '../types';
import PartnerSlider from '../components/PartnerSlider';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';
import analyticsTracking from '../services/analytics-tracking';
import companyProfile from '../constants/company_profile.json';

// Home sub-components
import Hero from '../components/home/Hero';
import Stats from '../components/home/Stats';
import About from '../components/home/About';
import Features from '../components/home/Features';
import Team from '../components/home/Team';
import WhyChooseUs from '../components/home/WhyChooseUs';
import CalculatorWrapper from '../components/home/CalculatorWrapper';
import FeaturedProjects from '../components/home/FeaturedProjects';
import FeaturedProducts from '../components/home/FeaturedProducts';
import FAQ from '../components/home/FAQ';
import Testimonials from '../components/home/Testimonials';
import News from '../components/home/News';
import CTA from '../components/home/CTA';
import { DetailModal } from '../components/home/Modals';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState({
    products: true,
    projects: true,
    news: true,
    testimonials: true,
    team: true
  });

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; desc: string; details: string } | null>(null);
  
  const { t, language } = useLanguage();
  const profileLanguage = language === 'en' ? 'en' : 'vi';
  const profileIntro = companyProfile.intro[profileLanguage];

  const openModal = (title: string, desc: string, details: string) => {
    setModalContent({ title, desc, details });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  useEffect(() => {
    // Track page view
    analyticsTracking.trackPageView('/', { title: 'Home Page' });

    let cancelled = false;

    const fetchData = async () => {
      setLoadingSections({ products: true, projects: true, news: true, testimonials: true, team: true });

      const markLoaded = (section: keyof typeof loadingSections) => {
        if (!cancelled) {
          setLoadingSections(current => ({ ...current, [section]: false }));
        }
      };

      await Promise.allSettled([
        api.products.getFeatured(4)
          .then(data => { if (!cancelled) setFeaturedProducts(data); })
          .finally(() => markLoaded('products')),
        api.projects.getFeatured(2)
          .then(data => { if (!cancelled) setFeaturedProjects(data); })
          .finally(() => markLoaded('projects')),
        api.news.getLatest(3)
          .then(data => { if (!cancelled) setLatestNews(data); })
          .finally(() => markLoaded('news')),
        api.testimonials.getAll()
          .then(data => { if (!cancelled) setTestimonials(data); })
          .finally(() => markLoaded('testimonials')),
        api.team.getAll()
          .then(data => { if (!cancelled) setTeamMembers(data); })
          .finally(() => markLoaded('team'))
      ]);
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [language]);

  const faqs = [
    { q: t('home.faq_1_q'), a: t('home.faq_1_a') },
    { q: t('home.faq_2_q'), a: t('home.faq_2_a') },
    { q: t('home.faq_3_q'), a: t('home.faq_3_a') },
    { q: t('home.faq_4_q'), a: t('home.faq_4_a') }
  ];

  // Combined Schema: Organization + LocalBusiness + WebSite + FAQ + Services + Products
  const homePageSchema = [
    // 1. Organization Schema
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${window.location.origin}/#organization`,
      "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
      "alternateName": ["CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS CONSTRUCTION JOINT - STOCK COMPANY", "CTC", "CTC"],
      "url": "https://www.ctcdn.vn",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/uploads/images/logo/logo.png`,
        "width": 220,
        "height": 60
      },
      "image": `${window.location.origin}/images/why_choose_us_visual.webp`,
      "taxID": "0400458940",
      "foundingDate": "2004-01-30",
      "description": "Công ty chuyên thi công lắp đặt hệ thống điện mặt trời, inverter, tấm pin năng lượng mặt trời tại Đà Nẵng và toàn quốc. Hotline: 0915 059 666",
      "slogan": "Đối tác tin cậy trong lĩnh vực năng lượng mặt trời",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "50B Nguyễn Du",
        "addressLocality": "Hải Châu",
        "addressRegion": "Đà Nẵng",
        "postalCode": "550000",
        "addressCountry": "VN"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+84-915-059-666",
          "contactType": "customer service",
          "areaServed": "VN",
          "availableLanguage": ["Vietnamese", "English"],
          "contactOption": "TollFree"
        },
        {
          "@type": "ContactPoint",
          "telephone": "+84-915-059-666",
          "contactType": "sales",
          "areaServed": "VN"
        }
      ],
      "founder": {
        "@type": "Person",
        "name": "Nguyễn Văn Duy",
        "jobTitle": "CEO / Tổng Giám Đốc"
      },
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "minValue": 10,
        "maxValue": 50
      },
      "sameAs": [
        "https://www.facebook.com/tranleelectricity",
        "https://www.youtube.com/@tranleelectricity",
        "https://zalo.me/0915059666"
      ],
      "knowsAbout": ["Solar Energy", "Điện mặt trời", "Inverter", "Tấm pin năng lượng mặt trời", "Năng lượng tái tạo"]
    },
    // 2. LocalBusiness Schema
    {
      "@context": "https://schema.org",
      "@type": "ElectricalContractor",
      "@id": `${window.location.origin}/#localbusiness`,
      "name": "CTC - Điện Mặt Trời Đà Nẵng",
      "image": `${window.location.origin}/images/why_choose_us_visual.webp`,
      "telephone": "+84-236-3745-555",
      "email": "info@ctcdn.vn",
      "url": "https://www.ctcdn.vn",
      "priceRange": "$$",
      "currenciesAccepted": "VND",
      "paymentAccepted": "Cash, Bank Transfer, Credit Card",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "50B Nguyễn Du",
        "addressLocality": "Hải Châu",
        "addressRegion": "Đà Nẵng",
        "postalCode": "550000",
        "addressCountry": "VN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 16.0759,
        "longitude": 108.2201
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:00",
          "closes": "17:30"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "08:00",
          "closes": "12:00"
        }
      ],
      "aggregateRating": testimonials.length > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": testimonials.length.toString(),
        "bestRating": "5",
        "worstRating": "1"
      } : undefined,
      "areaServed": [
        { "@type": "City", "name": "Đà Nẵng" },
        { "@type": "State", "name": "Quảng Nam" },
        { "@type": "State", "name": "Thừa Thiên Huế" },
        { "@type": "Country", "name": "Vietnam" }
      ]
    },
    // 3. WebSite Schema
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${window.location.origin}/#website`,
      "url": window.location.origin,
      "name": "CTC",
      "alternateName": "CTC",
      "description": "Website chính thức của Công ty Cổ phần Xây lắp Bưu điện Miền Trung - Giải pháp điện mặt trời hàng đầu Việt Nam",
      "publisher": { "@id": `${window.location.origin}/#organization` },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${window.location.origin}/products?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "inLanguage": ["vi", "en"]
    },
    // 4. Service Schema
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Lắp đặt hệ thống điện mặt trời",
      "name": "Dịch vụ lắp đặt điện mặt trời",
      "description": "Tư vấn, thiết kế và thi công lắp đặt hệ thống điện mặt trời cho hộ gia đình và doanh nghiệp",
      "provider": { "@id": `${window.location.origin}/#organization` },
      "areaServed": { "@type": "Country", "name": "Vietnam" },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Dịch vụ điện mặt trời",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Điện mặt trời áp mái hộ gia đình" }},
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Điện mặt trời cho doanh nghiệp" }},
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Trang trại điện mặt trời" }},
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Điện mặt trời nổi" }}
        ]
      }
    },
    // 5. FAQ Schema
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    },
    // 6. ItemList Schema
    ...(featuredProducts.length > 0 ? [{
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Sản phẩm nổi bật - CTC",
      "description": "Các sản phẩm điện mặt trời được khách hàng ưa chuộng",
      "numberOfItems": featuredProducts.length,
      "itemListElement": featuredProducts.slice(0, 6).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${window.location.origin}/products/${product.id || (product as any)._id}`,
        "item": {
          "@type": "Product",
          "name": product.name,
          "image": product.image,
          "description": product.shortDescription || product.description?.substring(0, 150),
          "offers": {
            "@type": "Offer",
            "price": product.price || 0,
            "priceCurrency": "VND",
            "availability": "https://schema.org/InStock"
          }
        }
      }))
    }] : [])
  ];

  // Keep structured data aligned with the official company profile.
  const organizationSchema = homePageSchema[0] as Record<string, any>;
  organizationSchema.description = profileIntro;
  organizationSchema.foundingDate = companyProfile.incorporation_date;
  organizationSchema.founder = {
    '@type': 'Person',
    name: companyProfile.representative,
    jobTitle: 'CEO / Tổng Giám đốc'
  };
  organizationSchema.slogan = companyProfile.slogan[profileLanguage];
  organizationSchema.address = {
    '@type': 'PostalAddress',
    streetAddress: '50B Nguyễn Du',
    addressLocality: 'Phường Thạch Thang, Hải Châu',
    addressRegion: 'Đà Nẵng',
    postalCode: '550000',
    addressCountry: 'VN'
  };
  delete organizationSchema.numberOfEmployees;
  delete organizationSchema.sameAs;

  const localBusinessSchema = homePageSchema[1] as Record<string, any>;
  localBusinessSchema.telephone = '+84-236-374-5555';
  localBusinessSchema.email = 'info@ctcdn.vn';
  localBusinessSchema.address = organizationSchema.address;
  delete localBusinessSchema.aggregateRating;

  return (
    <div className="flex flex-col w-full font-sans text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-900 overflow-hidden">
      <SEO
        title="CTC – Niềm tin, Chất lượng"
        description={profileIntro}
        schema={homePageSchema}
      />

      <Hero />
      <Stats />
      <About onOpenModal={openModal} />
      <Features />
      <FeaturedProjects featuredProjects={featuredProjects} isLoading={loadingSections.projects} />
      <FeaturedProducts featuredProducts={featuredProducts} isLoading={loadingSections.products} />
      <WhyChooseUs onOpenModal={openModal} />
      <CalculatorWrapper />
      <Testimonials testimonials={testimonials} isLoading={loadingSections.testimonials} />
      <Team teamMembers={teamMembers} isLoading={loadingSections.team} />
      <News latestNews={latestNews} isLoading={loadingSections.news} />
      <PartnerSlider />
      <FAQ />
      <CTA />

      <DetailModal 
        isOpen={modalOpen} 
        content={modalContent} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default Home;
