import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, BatteryCharging, Users, Award, Leaf, PlayCircle, DollarSign, ChevronDown, Check, HelpCircle, Plus, Minus, Briefcase, PenTool, HardHat, Target, Eye, Heart, Mail, Phone, Linkedin, Star, Sun, Battery, CheckCircle, X } from 'lucide-react';

// Custom hook for scroll animations
const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsInView(true);
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isInView };
};

// Custom hook for mouse parallax
const useMouseParallax = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return mousePosition;
};

import { api } from '../services/api';
import { Product, Project, NewsItem, Testimonial } from '../types';
import SolarCalculator from '../components/SolarCalculator';
import PartnerSlider from '../components/PartnerSlider';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';
import analyticsTracking from '../services/analytics-tracking';
import ImageWithFallback from '../components/ImageWithFallback';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [sloganIndex, setSloganIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, desc: string, details: string} | null>(null);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<{step: string, title: string, desc: string, details: string, color: string} | null>(null);
  
  // Hooks must be called before using their values
  const { t, language } = useLanguage();

  // 🤖 AI-Generated Slogans - fetch from API
  const [slogans, setSlogans] = useState([
    { title: 'Năng lượng sạch', subtitle: 'Đầu tư bền vững' },
    { title: 'Tiết kiệm 90%', subtitle: 'Chi phí điện năng' },
    { title: 'Công nghệ Tier 1', subtitle: 'Chuẩn quốc tế' },
    { title: 'Bảo hành 25 năm', subtitle: 'An tâm tuyệt đối' },
    { title: 'Miễn phí lắp đặt', subtitle: 'Tư vấn tận nơi' },
    { title: 'Hoàn vốn 3 năm', subtitle: 'Lợi nhuận 22 năm' },
    { title: 'Xanh cho hôm nay', subtitle: 'Bền cho tương lai' },
    { title: 'Điện mặt trời', subtitle: 'Giải pháp thông minh' },
  ]);

  // Fetch AI-generated slogans from API - supports multi-language
  useEffect(() => {
    const fetchSlogans = async () => {
      try {
        const response = await fetch(`/api/slogans?count=12&shuffle=true&lang=${language}`);
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          setSlogans(data.data);
          console.log(`🤖 AI Slogans loaded (${language}):`, data.data.length);
        }
      } catch (error) {
        console.log('Using default slogans');
      }
    };
    fetchSlogans();
  }, [language]); // Re-fetch when language changes

  // Auto change slogan every 3 seconds
  useEffect(() => {
    if (slogans.length === 0) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setSloganIndex((prev) => (prev + 1) % slogans.length);
        setIsAnimating(false);
      }, 500); // Half of animation duration
    }, 3000);
    return () => clearInterval(interval);
  }, [slogans.length]);
  const parallax = useMouseParallax();

  // Animation refs for each section
  const heroRef = useInView();
  const statsRef = useInView();
  const aboutRef = useInView();
  const teamRef = useInView();
  const whyRef = useInView();
  const calcSection = useInView();
  const projectsRef = useInView();
  const productsRef = useInView();
  const faqRef = useInView();
  const testimonialsSection = useInView();
  const newsRef = useInView();

  // Function to open modal with details
  const openModal = (title: string, desc: string, details: string) => {
    setModalContent({ title, desc, details });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  // Function to open workflow modal with mind map
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
    };
    fetchData();
  }, [language]);

  const faqs = [
    { q: t('home.faq_1_q'), a: t('home.faq_1_a') },
    { q: t('home.faq_2_q'), a: t('home.faq_2_a') },
    { q: t('home.faq_3_q'), a: t('home.faq_3_a') },
    { q: t('home.faq_4_q'), a: t('home.faq_4_a') }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Combined Schema: Organization + LocalBusiness + WebSite + FAQ + Services + Products
  const homePageSchema = [
    // 1. Organization Schema
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${window.location.origin}/#organization`,
      "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
      "alternateName": ["Central Vietnam Posts and Telecommunications Construction Joint Stock Company", "CTC", "CTC"],
      "url": "https://www.ctcdn.vn",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/uploads/images/logo/logo.png`,
        "width": 220,
        "height": 60
      },
      "image": `${window.location.origin}/uploads/images/logo/tran-le-og.jpg`,
      "taxID": "0400458940",
      "foundingDate": "1992-01-01",
      "description": "Công ty chuyên thi công lắp đặt hệ thống điện mặt trời, inverter, tấm pin năng lượng mặt trời tại Đà Nẵng và toàn quốc. Hotline: 0915 059 666",
      "slogan": "Đối tác tin cậy trong lĩnh vực năng lượng mặt trời",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "50B Nguyễn Du, Quận Hải Châu",
        "addressLocality": "Đà Nẵng",
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
        "https://zalo.me/0236656202"
      ],
      "knowsAbout": ["Solar Energy", "Điện mặt trời", "Inverter", "Tấm pin năng lượng mặt trời", "Năng lượng tái tạo"]
    },
    // 2. LocalBusiness Schema (cho Google Maps & Local Search)
    {
      "@context": "https://schema.org",
      "@type": "ElectricalContractor",
      "@id": `${window.location.origin}/#localbusiness`,
      "name": "CTC - Điện Mặt Trời Đà Nẵng",
      "image": `${window.location.origin}/uploads/images/logo/tran-le-og.jpg`,
      "telephone": "+84-915-059-666",
      "email": "info@ctcdn.vn",
      "url": "https://www.ctcdn.vn",
      "priceRange": "$$",
      "currenciesAccepted": "VND",
      "paymentAccepted": "Cash, Bank Transfer, Credit Card",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "50B Nguyễn Du, Quận Hải Châu",
        "addressLocality": "Đà Nẵng",
        "addressRegion": "Đà Nẵng",
        "postalCode": "550000",
        "addressCountry": "VN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 16.0190,
        "longitude": 108.2208
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
    // 3. WebSite Schema (cho Sitelinks Search Box)
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
    // 4. Service Schema (cho dịch vụ chính)
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
    // 5. FAQ Schema (hiển thị trên Google Search)
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
    // 6. ItemList Schema cho Featured Products
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
        title="CTC ELECTRICITY - ĐỐI TÁC TIN CẬY CỦA BẠN"
        description={t('home.hero_desc')}
        schema={homePageSchema}
      />

      {/* ===== HERO SECTION - Modern White Design ===== */}
      <section ref={heroRef.ref} className="relative min-h-screen w-full bg-white dark:bg-slate-900 overflow-hidden -mt-4">
        {/* Animated Background Elements with Parallax */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ transform: `translate(${parallax.x * 2}px, ${parallax.y * 2}px)` }}></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.4s', transform: `translate(${parallax.x * -2}px, ${parallax.y * -2}px)` }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/3 to-orange-500/3 rounded-full blur-3xl" style={{ transform: `translate(-50%, -50%) scale(${1 + parallax.y * 0.01})` }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        </div>

        <div className="relative container max-w-[1440px] mx-auto px-4 sm:px-6 pt-0 sm:pt-2 lg:pt-4 pb-8 sm:pb-12 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh]">
            {/* Left Content */}
            <div className={`space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left transition-all duration-300 ${heroRef.isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-orange-500/10 px-5 py-2.5 rounded-full border border-primary/20 hover:scale-105 transition-transform cursor-default">
                <Sun size={18} className="text-primary animate-spin-slow" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.hero_badge')}</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.6] text-gray-900 dark:text-white mb-4 sm:mb-6 min-h-[160px] sm:min-h-[200px] lg:min-h-[240px] w-full overflow-visible">
                {/* Animated Slogan - đổi mỗi 3 giây */}
                <span className="block py-1 sm:py-2 relative">
                  <span 
                    key={`title-${sloganIndex}`}
                    className={`block transition-all duration-500 ease-out ${
                      isAnimating 
                        ? 'opacity-0 -translate-y-8 blur-sm scale-95' 
                        : 'opacity-100 translate-y-0 blur-0 scale-100'
                    }`}
                  >
                    {slogans[sloganIndex].title}
                  </span>
                </span>
                <span className="block mt-4 sm:mt-5 pt-2 pb-[30px] relative overflow-visible">
                  <span 
                    key={`subtitle-${sloganIndex}`}
                    className={`block text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-primary bg-[length:200%_auto] animate-gradient transition-all duration-500 ease-out delay-75 leading-[1.5] ${
                      isAnimating 
                        ? 'opacity-0 translate-y-8 blur-sm scale-95' 
                        : 'opacity-100 translate-y-0 blur-0 scale-100'
                    }`}
                  >
                    {slogans[sloganIndex].subtitle}
                  </span>
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-slate-300 max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fade-in-up px-2 sm:px-0" style={{ animationDelay: '0.2s' }}>{t('home.hero_desc')}</p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 animate-fade-in-up justify-center lg:justify-start px-4 sm:px-0" style={{ animationDelay: '0.3s' }}>
                <Link to="/contact" className="group relative bg-gradient-to-r from-primary to-orange-500 text-white px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 flex items-center justify-center gap-3 overflow-hidden text-base sm:text-lg">
                  <span className="relative z-10">{t('home.get_quote')}</span>
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rotate-12 scale-150"></div>
                </Link>
                <Link to="/projects" className="group bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 hover:border-primary text-gray-700 dark:text-slate-200 hover:text-primary px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-lg text-base sm:text-lg">
                  <PlayCircle size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  {t('home.view_projects')}
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-8 pt-8 border-t border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="flex -space-x-3 transition-all duration-300 group-hover:space-x-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-white border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600 shadow-md hover:scale-110 transition-transform z-10">{i}</div>
                    ))}
                  </div>
                  <div className="text-sm pl-2">
                    <div className="font-bold text-gray-900">500+</div>
                    <div className="text-gray-500">{t('home.stat_projects')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 group">
                  <div className="flex transition-transform group-hover:scale-110 duration-300">
                    {[1,2,3,4,5].map(i => (<Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />))}
                  </div>
                  <span className="ml-2 text-sm font-bold text-gray-900">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Right - Hero Image with Modern Glass Morphism Design */}
            <div className={`relative transition-all duration-700 delay-200 ${heroRef.isInView ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-20 scale-95'}`}>
              <div className="relative group">
                {/* Animated Glow Background */}
                <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-orange-500/20 to-primary/30 rounded-[2.5rem] blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 animate-pulse"></div>
                
                {/* Main Image Container - Larger */}
                <div className="relative rounded-[2rem] overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] transform transition-all duration-700 group-hover:shadow-[0_40px_90px_-15px_rgba(255,127,0,0.35)] group-hover:-translate-y-3" 
                  style={{ 
                    transformStyle: 'preserve-3d', 
                    transform: `perspective(1200px) rotateX(${parallax.y * 0.3}deg) rotateY(${parallax.x * 0.3}deg)` 
                  }}>
                  {/* Modern Solar Panel Image - Wider & Shorter */}
                  <img 
                    src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop" 
                    alt="Modern Solar Installation" 
                    className="w-full min-w-[500px] h-[550px] object-cover transform transition-transform duration-1000 group-hover:scale-105" 
                  />
                  
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-orange-500/10 opacity-70"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"></div>
                  
                  {/* Animated Light Streak */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-out"></div>
                  </div>
                  
                  {/* Bottom Info Bar - Compact */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                        <span className="text-white/90 font-medium">Đang hoạt động</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/80">
                        <Sun size={14} className="text-yellow-400" />
                        <span>Tối ưu</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats Cards - Modern Glass Style */}
                {/* Card 1 - Top Left - Capacity -> Dự án */}
                <div 
                  className="absolute -left-6 top-10 group/card"
                  style={{ transform: `translate(${parallax.x * -1}px, ${parallax.y * -1}px)` }}
                  onClick={() => navigate('/projects')}
                >
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-[0_20px_50px_-15px_rgba(16,185,129,0.6)] px-5 py-4 transition-all duration-500 hover:scale-110 hover:-rotate-2 hover:shadow-[0_25px_60px_-15px_rgba(16,185,129,0.7)] animate-float cursor-pointer">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Leaf size={22} className="text-white drop-shadow-lg" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white drop-shadow-md tracking-tight">500 MW</div>
                        <div className="text-[11px] text-white/80 font-bold uppercase tracking-widest">Công suất</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Right - Satisfaction -> Liên hệ */}
                <div 
                  className="absolute -right-4 top-1/3 group/card"
                  style={{ transform: `translate(${parallax.x * -0.8}px, ${parallax.y * -0.8}px)` }}
                  onClick={() => navigate('/contact')}
                >
                  <div className="relative overflow-hidden bg-gradient-to-br from-primary to-orange-600 rounded-2xl shadow-[0_20px_50px_-15px_rgba(255,127,0,0.6)] px-5 py-4 transition-all duration-500 hover:scale-110 hover:rotate-2 hover:shadow-[0_25px_60px_-15px_rgba(255,127,0,0.7)] animate-float cursor-pointer" style={{ animationDelay: '0.5s' }}>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" style={{ animationDelay: '0.3s' }}></div>
                    <div className="relative flex items-center gap-3">
                      <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Battery size={22} className="text-white drop-shadow-lg" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white drop-shadow-md tracking-tight">98%</div>
                        <div className="text-[11px] text-white/80 font-bold uppercase tracking-widest">Hài lòng</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Bottom - Experience -> Giới thiệu */}
                <div 
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2"
                  style={{ transform: `translateX(-50%) translate(${parallax.x * -0.5}px, ${parallax.y * -0.5}px)` }}
                  onClick={() => navigate('/about')}
                >
                  <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] px-6 py-4 transition-all duration-500 hover:scale-110 hover:shadow-[0_25px_60px_-15px_rgba(255,127,0,0.4)] animate-float cursor-pointer group/exp" style={{ animationDelay: '0.8s' }}>
                    {/* Animated border */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-primary bg-[length:200%_auto] animate-gradient opacity-0 group-hover/exp:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
                      <div className="w-full h-full bg-slate-900 rounded-2xl"></div>
                    </div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" style={{ animationDelay: '0.6s' }}></div>
                    <div className="relative flex items-center gap-4">
                      <Zap size={24} className="text-primary animate-pulse drop-shadow-[0_0_10px_rgba(255,127,0,0.8)]" />
                      <span className="text-xl font-black text-white tracking-tight">10+ Năm</span>
                      <ArrowRight size={18} className="text-primary animate-bounce-x" />
                    </div>
                  </div>
                </div>

                {/* Decorative Glow */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-yellow-400/40 to-orange-500/40 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-green-400/30 to-emerald-500/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer hover:text-primary transition-colors">
          <div className="w-8 h-12 border-2 border-gray-300 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section ref={statsRef.ref} className="py-20 bg-white relative z-20 -mt-20 container mx-auto px-4">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 transition-all duration-300 ${statsRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {[
            { icon: Briefcase, value: '10+', label: t('home.stat_exp'), color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
            { icon: Check, value: '500+', label: t('home.stat_projects'), color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
            { icon: Zap, value: '50MW', label: t('home.stat_capacity'), color: 'from-primary to-orange-500', bg: 'bg-orange-50' },
            { icon: Users, value: '98%', label: t('home.stat_satisfaction'), color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' }
          ].map((stat, idx) => (
            <div key={idx} className="group text-center p-8 rounded-3xl bg-white hover:bg-gray-50/50 transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:-translate-y-2 perspective-1000 animate-card-hover">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <stat.icon size={28} className="text-white relative z-10" />
              </div>
              <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{stat.value}</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest group-hover:text-primary transition-colors">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT COMPANY SECTION ===== */}
      <section ref={aboutRef.ref} className="py-12 sm:py-20 lg:py-32 bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] lg:w-[600px] h-[300px] sm:h-[500px] lg:h-[600px] bg-gray-50/80 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ transform: `translate(${parallax.x * -1}px, ${parallax.y * -1}px)` }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            {/* Left: Images Grid with Parallax */}
            <div className={`relative transition-all duration-300 ${aboutRef.isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6 translate-y-12" style={{ transform: `translateY(${48 + parallax.y * 0.5}px)` }}>
                  <img
                    src="/uploads/images/Images_web/1764042731577-57377200.jpg"
                    alt="Solar Installation Team"
                    className="rounded-3xl shadow-2xl w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <img
                    src="/uploads/images/Images_web/1764042848653-118772669.jpg"
                    alt="Engineers Meeting"
                    className="rounded-3xl shadow-xl w-full h-56 object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="space-y-6" style={{ transform: `translateY(${parallax.y * -0.5}px)` }}>
                  <img
                    src="/uploads/images/Images_web/1764042848656-866298623.jpg"
                    alt="Modern Office"
                    className="rounded-3xl shadow-xl w-full h-56 object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <img
                    src="/uploads/images/Images_web/1764042848644-300262289.png"
                    alt="Solar Panels"
                    className="rounded-3xl shadow-2xl w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl p-8 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white text-center w-48 h-48 flex flex-col justify-center items-center z-20 animate-float hover:scale-110 transition-transform duration-300">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 mb-1">10+</div>
                <div className="text-sm font-bold text-gray-600 uppercase tracking-widest">{t('home.stat_exp')}</div>
              </div>
            </div>

            {/* Right: Content */}
            <div className={`space-y-10 transition-all duration-300 delay-100 ${aboutRef.isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full mb-6 hover:bg-orange-100 transition-colors">
                  <Target size={18} className="text-primary animate-spin-slow" />
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.about_badge')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-8 leading-[1.4] py-2">
                  <span className="block overflow-visible">
                    <span className={`block transition-transform duration-700 ${aboutRef.isInView ? 'translate-y-0' : 'translate-y-full'}`}>{t('home.about_title')}</span>
                  </span>
                </h2>
                <p className="text-xl text-gray-600 dark:text-slate-300 leading-relaxed mb-6 text-justify indent-8">
                  {t('home.about_desc')}
                </p>
                <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed font-light text-justify indent-8">
                  {t('home.about_desc_2')}
                </p>
              </div>

              {/* Mission, Vision, Values Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
                {[
                  { 
                    icon: Target, 
                    title: t('home.mission'), 
                    desc: t('home.mission_desc'), 
                    color: 'text-blue-500', 
                    bg: 'bg-blue-50',
                    details: 'Chúng tôi cam kết mang đến giải pháp năng lượng tái tạo chất lượng cao, giúp khách hàng tiết kiệm chi phí và bảo vệ môi trường. Với đội ngũ kỹ sư giàu kinh nghiệm và công nghệ tiên tiến, chúng tôi đảm bảo hệ thống hoạt động hiệu quả tối đa.'
                  },
                  { 
                    icon: Eye, 
                    title: t('home.vision'), 
                    desc: t('home.vision_desc'), 
                    color: 'text-orange-500', 
                    bg: 'bg-orange-50',
                    details: 'Trở thành công ty hàng đầu Việt Nam trong lĩnh vực năng lượng tái tạo, góp phần xây dựng một tương lai xanh và bền vững. Chúng tôi hướng tới việc phổ cập năng lượng mặt trời đến mọi gia đình và doanh nghiệp.'
                  },
                  { 
                    icon: Heart, 
                    title: t('home.values'), 
                    desc: t('home.values_desc'), 
                    color: 'text-red-500', 
                    bg: 'bg-red-50',
                    details: 'Chất lượng - Uy tín - Trách nhiệm. Chúng tôi đặt lợi ích khách hàng lên hàng đầu, cam kết cung cấp sản phẩm chất lượng cao với dịch vụ hậu mãi tận tâm. Mọi dự án đều được thực hiện với tinh thần trách nhiệm cao nhất.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-primary/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group perspective-1000">
                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300`}>
                      <item.icon size={24} className={item.color} />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                    <button 
                      onClick={() => openModal(item.title, item.desc, item.details)}
                      className="text-primary font-semibold text-sm hover:text-orange-600 transition-colors flex items-center gap-1 group-hover:gap-2 duration-300"
                    >
                      Tìm hiểu thêm 
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/about" className="group bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-primary transition-all duration-300 flex items-center gap-3 hover:-translate-y-1 hover:shadow-lg overflow-hidden relative">
                  <span className="relative z-10 flex items-center gap-2">
                    {t('home.learn_more')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
                <Link to="/contact" className="bg-white border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-full font-bold hover:border-primary hover:text-primary transition-all duration-300 hover:-translate-y-1">
                  {t('home.contact_us')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TEAM SECTION ===== */}
      <section ref={teamRef.ref} className="py-24 bg-gray-50 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" style={{ transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)` }}></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" style={{ transform: `translate(${parallax.x * -0.5}px, ${parallax.y * -0.5}px)` }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-20 max-w-3xl mx-auto transition-all duration-300 ${teamRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full mb-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <Users size={20} className="text-primary animate-bounce-once" />
              <span className="text-sm font-bold text-primary uppercase tracking-widest">{t('home.team_badge')}</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              {t('home.team_title')}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">{t('home.team_desc')}</p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 transition-all duration-300 delay-100 ${teamRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {teamMembers.map((member, index) => {
                const colors = [
                  { gradient: 'from-orange-500 to-red-500', text: 'text-orange-600', bg: 'bg-orange-50' },
                  { gradient: 'from-blue-500 to-cyan-500', text: 'text-blue-600', bg: 'bg-blue-50' },
                  { gradient: 'from-green-500 to-emerald-500', text: 'text-green-600', bg: 'bg-green-50' },
                  { gradient: 'from-purple-500 to-pink-500', text: 'text-purple-600', bg: 'bg-purple-50' }
                ];
                const colorScheme = colors[index % colors.length];

                return (
                  <div
                    key={`team-${index}-${member._id || member.id}`}
                    className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-200 hover:-translate-y-2 perspective-1000"
                  >
                    <div className="relative h-80 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}></div>
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Social Links Overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-20 flex justify-center gap-3">
                        {[
                          { icon: Mail, href: `mailto:${member.email}`, title: "Email" },
                          { icon: Phone, href: `tel:${member.phone}`, title: "Phone" },
                          { icon: Linkedin, href: member.linkedin || '#', title: "LinkedIn" }
                        ].map((social, i) => (
                          <a 
                            key={i}
                            href={social.href} 
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-primary hover:scale-110 transition-all shadow-lg delay-[${i * 50}ms]"
                            title={social.title}
                          >
                            <social.icon size={18} />
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 text-center relative">
                      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-white p-1.5 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                        <div className={`w-10 h-10 ${colorScheme.bg} rounded-lg flex items-center justify-center text-lg font-bold ${colorScheme.text}`}>
                          {index + 1}
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1 mt-4 group-hover:text-primary transition-colors">
                        {member.name}
                      </h4>
                      <p className={`text-sm font-bold uppercase tracking-wider ${colorScheme.text}`}>
                        {member.role}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Join Team CTA - Boundless Minimalist Design */}
          <div className={`relative max-w-5xl mx-auto mt-24 transition-all duration-300 delay-500 ${teamRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              {/* Left Content */}
              <div className="flex-1 text-center md:text-left space-y-6">
                <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
                  <Briefcase size={18} className="text-primary animate-bounce-once" />
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.join_team')}</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.4] py-2">
                  {t('home.join_team_title')} <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">{t('home.join_team_highlight')}</span>
                </h3>
                
                <p className="text-gray-500 text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
                  {t('home.join_team_desc')}
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    {t('home.apply_now')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="mailto:hr@tranle.com"
                    className="inline-flex items-center gap-3 bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-full font-bold hover:border-primary hover:text-primary transition-all duration-300 hover:-translate-y-1"
                  >
                    <Mail size={20} /> hr@tranle.com
                  </a>
                </div>
              </div>

              {/* Right Decorative/Visual */}
              <div className="relative w-full md:w-1/2 lg:w-5/12 aspect-square md:aspect-auto md:h-80">
                {/* Decorative Circles */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                
                {/* Floating Cards Composition */}
                <div className="relative h-full w-full flex items-center justify-center">
                  <div className="absolute top-0 right-10 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-float" style={{ animationDelay: '0s' }}>
                    <Users size={32} className="text-blue-500" />
                  </div>
                  <div className="absolute bottom-10 left-10 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
                    <Target size={28} className="text-orange-500" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center border border-gray-50 z-10 animate-float" style={{ animationDelay: '0.3s' }}>
                    <div className="text-5xl font-black text-gray-900 mb-1">100%</div>
                    <div className="text-xs font-bold text-gray-400 uppercase">{t('home.opportunity')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section ref={whyRef.ref} className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Award size={18} className="text-primary animate-bounce-once" />
              <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.why_choose')}</span>
            </div>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">{t('home.why_choose_title')}</h3>
            <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">{t('home.why_choose_desc')}</p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-all duration-300 delay-100 ${whyRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {[
              { 
                icon: Zap, 
                title: t('home.why_1_title'), 
                desc: t('home.why_1_desc'), 
                color: 'from-yellow-400 to-orange-500', 
                shadow: 'shadow-orange-200',
                details: 'Hệ thống điện mặt trời của chúng tôi được thiết kế tối ưu với công nghệ inverter AI thế hệ mới, đảm bảo hiệu suất chuyển đổi năng lượng đạt trên 80%. Sử dụng tấm pin Tier 1 từ các thương hiệu hàng đầu thế giới như Longi, Canadian Solar với hiệu suất cao và độ bền vượt trội.'
              },
              { 
                icon: ShieldCheck, 
                title: t('home.why_2_title'), 
                desc: t('home.why_2_desc'), 
                color: 'from-blue-500 to-cyan-500', 
                shadow: 'shadow-blue-200',
                details: 'Chính sách bảo hành toàn diện với cam kết 1 đổi 1 cho tấm pin trong 12 năm đầu và bảo hành hiệu suất 25 năm. Đội ngũ kỹ thuật 24/7 sẵn sàng hỗ trợ bảo trì và sửa chữa. Bảo hiểm thiết bị từ các công ty uy tín.'
              },
              { 
                icon: Users, 
                title: t('home.why_3_title'), 
                desc: t('home.why_3_desc'), 
                color: 'from-green-500 to-emerald-500', 
                shadow: 'shadow-green-200',
                details: 'Đội ngũ kỹ sư được đào tạo bài bản với chứng chỉ hành nghề và kinh nghiệm thực chiến. Quy trình thi công chuẩn quốc tế, giám sát chất lượng nghiêm ngặt. Đã hoàn thành hơn 1000+ dự án trên toàn quốc với tỷ lệ hài lòng 99%.'
              },
              { 
                icon: BatteryCharging, 
                title: t('home.why_4_title'), 
                desc: t('home.why_4_desc'), 
                color: 'from-purple-500 to-pink-500', 
                shadow: 'shadow-purple-200',
                details: 'Hệ thống lưu trữ năng lượng thông minh với công nghệ Hybrid/ESS, tự động chuyển đổi giữa điện lưới và điện tích trữ. Ứng dụng giám sát từ xa 24/7, cảnh báo sự cố tức thì. Tối ưu hóa việc sử dụng điện và tiết kiệm tối đa chi phí.'
              },
              { 
                icon: Award, 
                title: t('home.why_5_title'), 
                desc: t('home.why_5_desc'), 
                color: 'from-red-500 to-rose-500', 
                shadow: 'shadow-red-200',
                details: 'Đối tác chiến lược độc quyền của Huawei, Canadian Solar, Longi tại thị trường Việt Nam. Nhận được nhiều giải thưởng uy tín về chất lượng dịch vụ và công nghệ. Được khách hàng tin tưởng và đánh giá cao về độ uy tín và chuyên nghiệp.'
              },
              { 
                icon: Leaf, 
                title: t('home.why_6_title'), 
                desc: t('home.why_6_desc'), 
                color: 'from-teal-500 to-green-500', 
                shadow: 'shadow-teal-200',
                details: 'Mỗi hệ thống điện mặt trời lắp đặt giúp giảm thiểu hàng tấn CO2 thải ra môi trường mỗi năm. Góp phần xây dựng tương lai xanh, bền vững cho thế hệ tương lai. Tuân thủ các tiêu chuẩn môi trường quốc tế và cam kết phát triển bền vững.'
              },
            ].map((item, index) => (
              <div key={index} className="group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-transparent hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] transition-all duration-700 ease-in-out hover:-translate-y-2 hover:scale-102 relative overflow-hidden z-10 hover:z-20 cursor-default">
                {/* Background Glow on Hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-3 bg-gradient-to-br ${item.color} transition-opacity duration-700 ease-in-out`}></div>
                
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-5 rounded-bl-full transition-transform duration-700 ease-in-out group-hover:scale-125`}></div>
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg ${item.shadow} group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 ease-in-out`}>
                  <item.icon size={28} className="text-white" />
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors duration-200 ease-in-out">{item.title}</h4>
                
                <p className="text-gray-600 leading-relaxed transition-colors duration-200 ease-in-out group-hover:text-gray-800">
                  {item.desc}
                </p>
                
                {/* Learn more link appearing on hover */}
                <button 
                  onClick={() => openModal(item.title, item.desc, item.details)}
                  className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-in-out delay-100 flex items-center gap-2 text-sm font-bold text-primary hover:text-orange-600 w-full text-left"
                >
                  <span>Tìm hiểu thêm</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW STEPS ===== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-900">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Target size={18} className="text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.workflow_badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">{t('home.workflow_title')}</h2>
          </div>

          <div className="relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary via-orange-500 to-primary"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
              {[
                { 
                  step: "01", 
                  title: t('home.step_1'), 
                  icon: Briefcase, 
                  desc: t('home.step_1_desc'), 
                  color: 'from-blue-500 to-cyan-500',
                  details: 'Đội ngũ kỹ sư chuyên nghiệp sẽ đến tận nơi để khảo sát thực tế mái nhà, đánh giá khả năng chịu tải, hướng nắng và các yếu tố ảnh hưởng. Tư vấn miễn phí về giải pháp tối ưu nhất, tính toán công suất phù hợp với nhu cầu sử dụng điện và ngân sách của gia đình.'
                },
                { 
                  step: "02", 
                  title: t('home.step_2'), 
                  icon: PenTool, 
                  desc: t('home.step_2_desc'), 
                  color: 'from-purple-500 to-pink-500',
                  details: 'Lên bản vẽ chi tiết về mô phỏng sản lượng điện, bố trí tấm pin tối ưu trên mái nhà. Tính toán chính xác chi phí đầu tư, thời gian hoàn vốn và lợi nhuận dự kiến. Thiết kế hệ thống phù hợp với tiêu chuẩn kỹ thuật và quy định pháp luật hiện hành.'
                },
                { 
                  step: "03", 
                  title: t('home.step_3'), 
                  icon: HardHat, 
                  desc: t('home.step_3_desc'), 
                  color: 'from-primary to-orange-500',
                  details: 'Thi công lắp đặt nhanh chóng, an toàn với đội ngũ kỹ thuật viên được đào tạo chuyên nghiệp. Sử dụng thiết bị và vật liệu chất lượng cao, tuân thủ nghiêm ngặt quy trình kỹ thuật. Hoàn thành trong 1-3 ngày tùy theo quy mô dự án.'
                },
                { 
                  step: "04", 
                  title: t('home.step_4'), 
                  icon: ShieldCheck, 
                  desc: t('home.step_4_desc'), 
                  color: 'from-green-500 to-emerald-500',
                  details: 'Giám sát hệ thống 24/7 qua ứng dụng thông minh, cảnh báo sự cố tức thì. Bảo trì định kỳ miễn phí, vệ sinh tấm pin để đảm bảo hiệu suất tối đa. Đội ngũ kỹ thuật sẵn sàng hỗ trợ và sửa chữa trong thời gian bảo hành.'
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => openWorkflowModal(item.step, item.title, item.desc, item.details, item.color)}
                  className="group bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 hover:border-transparent hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] transition-all duration-700 ease-in-out text-center hover:-translate-y-2 hover:scale-102 relative overflow-hidden z-10 hover:z-20 cursor-pointer"
                >
                  {/* Background Glow on Hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-3 bg-gradient-to-br ${item.color} transition-opacity duration-700 ease-in-out`}></div>
                  
                  {/* Step Number */}
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center text-2xl font-black mb-6 shadow-xl group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 ease-in-out relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"></div>
                    <span className="relative z-10">{item.step}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-200 ease-in-out group-hover:scale-105">
                    <item.icon size={28} className="text-gray-600 dark:text-slate-300 group-hover:text-primary transition-colors duration-200 ease-in-out" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors duration-200 ease-in-out">{item.title}</h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed transition-colors duration-200 ease-in-out group-hover:text-gray-800 dark:group-hover:text-slate-200">{item.desc}</p>
                  
                  {/* Progress indicator appearing on hover */}
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-in-out delay-100">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">Bước {item.step}</span>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CALCULATOR SECTION ===== */}
      <section ref={calcSection.ref} className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-5/12">
              <div className="inline-block bg-orange-100 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">{t('calculator.intro_badge')}</div>
              <h2 className="text-4xl font-bold text-corporate mb-6 leading-tight">{t('calculator.intro_title')}</h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                {t('calculator.intro_desc')}
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-corporate border border-gray-100"><Zap size={20} /></div>
                  <div>
                    <h4 className="font-bold text-gray-800">{t('calculator.feature_1_title')}</h4>
                    <p className="text-sm text-gray-500">{t('calculator.feature_1_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-corporate border border-gray-100"><DollarSign size={20} /></div>
                  <div>
                    <h4 className="font-bold text-gray-800">{t('calculator.feature_2_title')}</h4>
                    <p className="text-sm text-gray-500">{t('calculator.feature_2_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-7/12 w-full">
              <div className="transform hover:scale-[1.01] transition-transform duration-200">
                <SolarCalculator />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section ref={projectsRef.ref} className="py-24 bg-white relative overflow-hidden">
        <div className="container max-w-[1440px] mx-auto px-6">
          <div className={`flex flex-col md:flex-row justify-between items-center mb-16 transition-all duration-300 ${projectsRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4 hover:bg-primary/20 transition-colors">
                <Zap size={18} className="text-primary animate-pulse" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.projects_badge')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">{t('home.featured_projects')}</h2>
              <p className="text-gray-600">{t('home.featured_projects_sub')}</p>
            </div>
            <Link to="/projects" className="mt-4 md:mt-0 group bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 flex items-center gap-2 hover:-translate-y-1 overflow-hidden relative">
              <span className="relative z-10 flex items-center gap-2">
                {t('home.view_projects')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 delay-100 ${projectsRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {featuredProjects.slice(0, 3).map((project, index) => (
              <div 
                key={`project-${index}-${project._id || project.id}`} 
                className="group relative rounded-[2rem] overflow-hidden h-[350px] cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-700 border border-gray-100"
                onClick={() => navigate(`/projects/${project._id || project.id}`)}
              >
                <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-gray-900/10 transition-colors z-10"></div>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity z-20"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200 z-30">
                  <div className="flex items-center gap-3 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                    <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">{project.capacity}</span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30">{project.location}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3 leading-tight group-hover:text-primary transition-colors duration-300">{project.title}</h3>
                  <p className="text-gray-300 line-clamp-2 text-sm leading-relaxed max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-200">{project.description}</p>
                  
                  <div className="mt-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 delay-100 hover:bg-primary hover:border-primary">
                    <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section ref={productsRef.ref} className="py-24 bg-gray-50">
        <div className="container max-w-[1440px] mx-auto px-6">
          <div className={`flex flex-col md:flex-row justify-between items-end mb-12 gap-4 transition-all duration-300 ${productsRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <Battery size={18} className="text-primary animate-pulse" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Sản phẩm</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{t('home.latest_products')}</h2>
              <p className="text-gray-600 text-lg">{t('home.latest_products_desc')}</p>
            </div>
            <Link to="/products" className="bg-white border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-700 px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 hover:-translate-y-1 hover:shadow-lg group">
              {t('home.view_all_products')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-300 delay-100 ${productsRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {featuredProducts.map((product, index) => (
              <div 
                key={`product-${index}-${product._id || product.id}`} 
                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-200 border border-gray-100 hover:border-primary/20 flex flex-col hover:-translate-y-2 cursor-pointer"
                onClick={() => navigate(`/products/${product._id || product.id}`)}
              >
                <div className="h-64 overflow-hidden relative bg-gray-50">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-gray-100">
                    {product.category}
                  </span>
                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:bg-primary hover:text-white">
                      Xem chi tiết
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-xs font-medium text-gray-600">{t('common.stock')}: {product.stock || 0}</span>
                    </div>
                    <span className="text-primary font-bold text-sm hover:underline flex items-center gap-1 group-hover/link:translate-x-1 transition-transform">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section ref={faqRef.ref} className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className={`transition-all duration-300 ${faqRef.isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
                <HelpCircle size={18} className="text-blue-600" />
                <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{t('home.support_badge')}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">{t('home.faq_title')}</h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">{t('home.faq_desc')}</p>
              
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl group">
                <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="FAQ" className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="font-bold text-xl mb-2">{t('home.need_help')}</p>
                  <Link to="/contact" className="inline-flex items-center gap-2 text-white/90 hover:text-white hover:underline">
                    {t('home.contact_advisor')} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className={`space-y-6 transition-all duration-300 delay-100 ${faqRef.isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              {faqs.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-6 text-left font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-4 text-lg">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${openFaqIndex === idx ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'} transition-colors`}>
                        {idx + 1}
                      </span>
                      {item.q}
                    </span>
                    <div className={`transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180 text-primary' : 'text-gray-400'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </button>
                  <div className={`px-6 text-gray-600 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${openFaqIndex === idx ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-12 border-l-2 border-gray-100 ml-4">
                      {item.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section ref={testimonialsSection.ref} className="py-24 bg-gradient-to-br from-primary/5 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 dark:opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 transition-all duration-300 ${testimonialsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-2 rounded-full mb-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <Heart size={18} className="text-red-500 animate-pulse" />
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">{t('home.testimonials')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">{t('home.testimonials_title')}</h2>
          </div>

          <div className={`relative overflow-hidden transition-all duration-300 delay-100 ${testimonialsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Auto-scrolling container */}
              <div 
                className="flex gap-8 hover:pause-animation"
                style={{
                  animation: 'scroll 15s linear infinite',
                  animationFillMode: 'forwards'
                }}
              >
                {/* First set of testimonials */}
                {testimonials.map((item, index) => (
                  <div key={`testimonial-${index}-${item._id || item.id}`} className="bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-lg hover:shadow-2xl border border-gray-100 dark:border-slate-600/50 relative flex flex-col min-w-[300px] sm:min-w-[400px] max-w-[300px] sm:max-w-[400px] h-[280px] sm:h-[320px] transition-all duration-700 ease-in-out hover:-translate-y-2 hover:scale-102 group flex-shrink-0">
                    <div className="text-primary/20 text-6xl absolute top-4 right-6 font-serif leading-none group-hover:text-primary/30 transition-colors duration-200">"</div>
                    
                    <div className="flex items-center gap-1 mb-4 text-yellow-400">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    
                    <p className="text-gray-600 dark:text-slate-300 italic mb-6 relative z-10 flex-1 leading-relaxed text-base line-clamp-4">"{item.content}"</p>
                    
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-600 shadow-md group-hover:scale-110 transition-transform duration-200">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">{item.name}</h4>
                        <p className="text-xs text-primary font-bold uppercase tracking-wider">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {testimonials.map((item, index) => (
                  <div key={`testimonial-duplicate-${index}-${item._id || item.id}`} className="bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm p-8 rounded-[2rem] shadow-lg hover:shadow-2xl border border-gray-100 dark:border-slate-600/50 relative flex flex-col min-w-[400px] max-w-[400px] h-[320px] transition-all duration-700 ease-in-out hover:-translate-y-2 hover:scale-102 group flex-shrink-0">
                    <div className="text-primary/20 text-6xl absolute top-4 right-6 font-serif leading-none group-hover:text-primary/30 transition-colors duration-200">"</div>
                    
                    <div className="flex items-center gap-1 mb-4 text-yellow-400">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    
                    <p className="text-gray-600 dark:text-slate-300 italic mb-6 relative z-10 flex-1 leading-relaxed text-base line-clamp-4">"{item.content}"</p>
                    
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-600 shadow-md group-hover:scale-110 transition-transform duration-200">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">{item.name}</h4>
                        <p className="text-xs text-primary font-bold uppercase tracking-wider">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </section>

      {/* ===== NEWS SECTION ===== */}
      <section ref={newsRef.ref} className="py-24 bg-white">
        <div className="container max-w-[1440px] mx-auto px-6">
          <div className={`flex flex-col md:flex-row justify-between items-center mb-16 gap-6 transition-all duration-300 ${newsRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <Mail size={18} className="text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.news_badge')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">{t('home.news_events')}</h2>
            </div>
            <Link to="/news" className="bg-white border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-700 px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 hover:-translate-y-1 hover:shadow-lg group">
              {t('common.view_details')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-300 delay-100 ${newsRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {latestNews.map((news, index) => (
              <div 
                key={`news-${index}-${news.id}`} 
                className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-200 border border-gray-100 hover:border-primary/20 hover:-translate-y-2 flex flex-col h-full cursor-pointer"
                onClick={() => navigate(`/news/${news.id}`)}
              >
                <div className="overflow-hidden h-64 relative">
                  <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-md">
                    {news.date}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h4 className="font-bold text-xl text-gray-900 leading-tight group-hover:text-primary transition-colors mb-4 line-clamp-2">{news.title}</h4>
                  <p className="text-gray-500 text-base line-clamp-3 mb-6 flex-1 leading-relaxed">{news.excerpt}</p>
                  <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-400 font-medium">{t('home.news_badge')}</span>
                    <span className="text-primary font-bold text-sm group-hover:underline flex items-center gap-1">
                      {t('home.read_more')} <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Infinite Slider */}
      <PartnerSlider />

      {/* ===== CTA SECTION ===== */}
      <section className="py-32 bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-l from-blue-500/5 to-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container max-w-[1440px] mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-orange-500/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.cta_badge')}</span>
            </div>
            
            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-6 sm:mb-8 leading-[1.3] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent max-w-4xl mx-auto text-balance py-2 sm:py-4 px-4 sm:px-0">
              <span className="block">{t('home.cta_title_1')}</span>
              <span className="block">{t('home.cta_title_2')}</span>
            </h2>
            
            {/* Description */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-slate-300 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto font-light px-4 sm:px-0">
              {t('home.ready_desc')}
            </p>
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
              <Link to="/contact" className="group relative inline-flex bg-gradient-to-r from-primary via-orange-500 to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-200 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl hover:shadow-primary/30 items-center gap-3 sm:gap-4 text-base sm:text-lg overflow-hidden w-full sm:w-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <Zap size={24} className="group-hover:animate-pulse relative z-10" />
                <span className="relative z-10">{t('home.contact_consult')}</span>
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
              </Link>
              
              <a href="tel:02366562020" className="group inline-flex items-center gap-3 text-gray-700 dark:text-slate-300 hover:text-primary font-semibold transition-colors duration-300 w-full sm:w-auto justify-center sm:justify-start">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 group-hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors duration-300">
                  <Phone size={20} className="group-hover:animate-bounce" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-500 dark:text-slate-400">{t('home.call_now')}</div>
                  <div className="font-bold text-base sm:text-lg dark:text-white">023 6656 2020</div>
                </div>
              </a>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>{t('home.free_consult')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>{t('home.warranty_25')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>{t('home.save_70')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {modalOpen && modalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white dark:bg-slate-800 w-full max-w-xs sm:max-w-lg lg:max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full z-20 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
            
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {modalContent.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 leading-relaxed">
                  {modalContent.desc}
                </p>
              </div>
              
              <div className="border-t border-gray-100 dark:border-slate-700 pt-4 sm:pt-6">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Chi tiết</h4>
                <p className="text-sm sm:text-base text-gray-700 dark:text-slate-300 leading-relaxed text-justify indent-4 sm:indent-8">
                  {modalContent.details}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 dark:border-slate-700">
                <Link 
                  to="/contact" 
                  className="flex-1 bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-center"
                  onClick={closeModal}
                >
                  Liên hệ tư vấn
                </Link>
                <button 
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Mind Map Modal */}
      {workflowModalOpen && selectedStep && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeWorkflowModal}></div>
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm sm:max-w-4xl lg:max-w-6xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <button 
              onClick={closeWorkflowModal} 
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full z-20 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
            
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-br ${selectedStep.color} text-white flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-black mb-3 sm:mb-4 shadow-xl`}>
                  {selectedStep.step}
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {selectedStep.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300">
                  {selectedStep.desc}
                </p>
              </div>
              
              {/* Mind Map */}
              <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8">
                  
                  {/* Central Node */}
                  <div className="relative">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${selectedStep.color} text-white flex items-center justify-center shadow-2xl relative z-10`}>
                      <div className="text-center">
                        <div className="text-2xl font-black">{selectedStep.step}</div>
                        <div className="text-xs font-bold opacity-90">BƯỚC</div>
                      </div>
                    </div>
                    
                    {/* Connecting Lines */}
                    <div className="hidden lg:block absolute top-1/2 -left-20 w-20 h-0.5 bg-gradient-to-l from-primary to-transparent"></div>
                    <div className="hidden lg:block absolute top-1/2 -right-20 w-20 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                    <div className="lg:hidden absolute -top-10 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-gradient-to-t from-primary to-transparent"></div>
                    <div className="lg:hidden absolute -bottom-10 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-gradient-to-b from-primary to-transparent"></div>
                  </div>
                  
                  {/* Detail Branches */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    {selectedStep.details.split('. ').filter(detail => detail.trim()).map((detail, index) => (
                      <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedStep.color} text-white flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            {index + 1}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {detail.trim()}{detail.trim() && '.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Process Flow Indicators */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4">
                    {['01', '02', '03', '04'].map((step, index) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          step === selectedStep.step 
                            ? `bg-gradient-to-br ${selectedStep.color} text-white shadow-lg scale-110` 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step}
                        </div>
                        {index < 3 && (
                          <div className={`w-8 h-0.5 mx-2 ${
                            parseInt(step) <= parseInt(selectedStep.step) 
                              ? 'bg-primary' 
                              : 'bg-gray-300'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link 
                  to="/contact" 
                  className="flex-1 bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-center"
                  onClick={closeWorkflowModal}
                >
                  Bắt đầu {selectedStep.title}
                </Link>
                <button 
                  onClick={closeWorkflowModal}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
