import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import { AboutHero, CeoMessage, CompanyTimeline, AreasOfOperation } from '../components/About';
import HomeAboutSection from '../components/home/About';
import { DetailModal } from '../components/home/Modals';
import CTA from '../components/home/CTA';

const About: React.FC = () => {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; desc: string; details: string } | null>(null);

  const openModal = (title: string, desc: string, details: string) => {
    setModalContent({ title, desc, details });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${window.location.origin}/about`,
    "mainEntity": {
      "@type": "Organization",
      "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
      "alternateName": "CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS  CONSTRUCTION JOINT - STOCK COMPANY",
      "taxID": "0400458940",
      "foundingDate": "2004-01-30",
      "founder": {
        "@type": "Person",
        "name": "Nguyễn Văn Duy",
        "jobTitle": "Tổng Giám Đốc / CEO"
      },
      "description": "Thi công và lắp đặt hệ thống pin năng lượng mặt trời, máy phát điện năng lượng mặt trời, inverter, thiết bị năng lượng mặt trời tại Đà Nẵng và toàn quốc.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "50B Nguyễn Du",
        "addressLocality": "Hải Châu",
        "addressRegion": "Đà Nẵng",
        "postalCode": "550000",
        "addressCountry": "VN"
      },
      "telephone": "+84-236-3745-555",
      "email": "info@ctcdn.vn",
      "url": "https://www.ctcdn.vn"
    }
  };

  return (
    <div className="w-full font-sans text-gray-700 overflow-hidden bg-white">
      <SEO 
        title={t('nav.about')} 
        description={t('about.hero_subtitle')}
        schema={aboutSchema}
      />

      <AboutHero />

      {/* Homepage About block (4 images grid & Vision/Mission cards) */}
      <HomeAboutSection onOpenModal={openModal} />

      <CompanyTimeline />

      <CeoMessage />
      
      <AreasOfOperation />

      {/* Contact Section */}
      <CTA />

      {/* Modal for detailed view of Vision/Mission/Values */}
      <DetailModal 
        isOpen={modalOpen} 
        content={modalContent} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default About;
