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
        "streetAddress": "50B Nguyễn Du, Phường Thạch Thang",
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
    <div className="w-full bg-gray-50 dark:bg-gray-900 pb-20 animate-fade-in relative min-h-screen">
      <SEO 
        title={t('contact.title') || 'Liên Hệ Với CTC'} 
        description="Liên hệ Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC) - Hotline 0915 059 666. Địa chỉ 50B Nguyễn Du, Hải Châu, Đà Nẵng."
        schema={contactSchema}
      />

      {/* Hero Banner Header */}
      <ContactHero />

      {/* Main Container */}
      <div className="container mx-auto px-4 py-12">
        
        {/* Quick Contact Info Cards */}
        <ContactInfoCards />

        {/* Form & Sidebar Grid Section */}
        <div className="mb-16">
          <ContactForm />
        </div>

        {/* Office Branches & Interactive Maps */}
        <ContactOffices />

        {/* Frequently Asked Questions */}
        <ContactFAQ />
      </div>
    </div>
  );
};

export default Contact;
