import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product, Project, NewsItem, Testimonial } from '../types';
import PartnerSlider from '../components/PartnerSlider';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';
import analyticsTracking from '../services/analytics-tracking';

// Home sub-components
import Hero from '../components/home/Hero';
import Stats from '../components/home/Stats';
import About from '../components/home/About';
import Team from '../components/home/Team';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Workflow from '../components/home/Workflow';
import CalculatorWrapper from '../components/home/CalculatorWrapper';
import FeaturedProjects from '../components/home/FeaturedProjects';
import FeaturedProducts from '../components/home/FeaturedProducts';
import FAQ from '../components/home/FAQ';
import Testimonials from '../components/home/Testimonials';
import News from '../components/home/News';
import CTA from '../components/home/CTA';
import { DetailModal, WorkflowModal } from '../components/home/Modals';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; desc: string; details: string } | null>(null);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<{ step: string; title: string; desc: string; details: string; color: string } | null>(null);
  
  const { t, language } = useLanguage();

  const openModal = (title: string, desc: string, details: string) => {
    setModalContent({ title, desc, details });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const openWorkflowModal = (step: string, title: string, desc: string, details: string, color: string) => {
    setSelectedStep({ step, title, desc, details, color });
    setWorkflowModalOpen(true);
  };

  const closeWorkflowModal = () => {
    setWorkflowModalOpen(false);
    setSelectedStep(null);
  };

  useEffect(() => {
    // Track page view
    analyticsTracking.trackPageView('/', { title: 'Home Page' });

    const fetchData = async () => {
      try {
        const [products, projects, news, testims, team] = await Promise.all([
          api.products.getFeatured(4),
          api.projects.getFeatured(2),
          api.news.getLatest(3),
          api.testimonials.getAll(),
          api.team.getAll()
        ]);
        setFeaturedProducts(products);
        setFeaturedProjects(projects);
        setLatestNews(news);
        setTestimonials(testims);
        setTeamMembers(team);
      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };
    fetchData();
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
      "image": `${window.location.origin}/uploads/images/logo/tran-le-og.jpg`,
      "taxID": "0400458940",
      "foundingDate": "2004-02-11",
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
      "image": `${window.location.origin}/uploads/images/logo/tran-le-og.jpg`,
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

  return (
    <div className="flex flex-col w-full font-sans text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-900 overflow-hidden">
      <SEO
        title="CTC - ĐỐI TÁC TIN CẬY CỦA BẠN"
        description={t('home.hero_desc')}
        schema={homePageSchema}
      />

      <Hero />
      <Stats />
      <About onOpenModal={openModal} />
      <Team teamMembers={teamMembers} />
      <WhyChooseUs onOpenModal={openModal} />
      <Workflow onOpenWorkflowModal={openWorkflowModal} />
      <CalculatorWrapper />
      <FeaturedProjects featuredProjects={featuredProjects} />
      <FeaturedProducts featuredProducts={featuredProducts} />
      <FAQ />
      <Testimonials testimonials={testimonials} />
      <News latestNews={latestNews} />
      <PartnerSlider />
      <CTA />

      <DetailModal 
        isOpen={modalOpen} 
        content={modalContent} 
        onClose={closeModal} 
      />

      <WorkflowModal 
        isOpen={workflowModalOpen} 
        selectedStep={selectedStep} 
        onClose={closeWorkflowModal} 
      />
    </div>
  );
};

export default Home;
