import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';

import {
  ContactHero,
  ContactInfoCards,
  ContactForm,
  ContactOffices,
  ContactFAQ
} from '../components/contact';

const Contact: React.FC = () => {
  const { t } = useLanguage();

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
      "alternateName": "CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS CONSTRUCTION JOINT STOCK COMPANY",
      "taxID": "0400458940",
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
      "telephone": "+84-236-3745-555",
      "email": "info@ctcdn.vn",
      "url": "https://ctcdn.vn"
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-20 animate-fade-in relative min-h-screen overflow-hidden">
      
      {/* Floating Ambient Glass Background Lights */}
      <div className="absolute top-96 left-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[1200px] right-10 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <SEO 
        title={t('contact.title') || 'Liên Hệ Với CTC'} 
        description="Liên hệ Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC) - Hotline 0915 059 666. Địa chỉ 50B Nguyễn Du, Hải Châu, Đà Nẵng."
        schema={contactSchema}
      />

      {/* Hero Banner Header */}
      <ContactHero />

      {/* Main Container */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        
        {/* Quick Contact Info Cards (Glassmorphism Bento) */}
        <ContactInfoCards />

        {/* Form & Value Proposition Grid (Glassmorphism) */}
        <div className="mb-16">
          <ContactForm />
        </div>

        {/* Office & Interactive Map (Glassmorphism) */}
        <ContactOffices />

        {/* Frequently Asked Questions */}
        <ContactFAQ />
      </div>
    </div>
  );
};

export default Contact;
