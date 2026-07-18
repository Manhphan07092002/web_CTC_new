
import React from 'react';
import { CheckCircle, Target, Eye, Award, Calendar, FileText, Zap, Quote, ArrowRight, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';

const About: React.FC = () => {
  const { t } = useLanguage();

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${window.location.origin}/about`,
    "mainEntity": {
      "@type": "Organization",
      "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
      "alternateName": "CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS  CONSTRUCTION JOINT - STOCK COMPANY",
      "taxID": "0400458940",
      "foundingDate": "2004-02-11",
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
    <div className="w-full font-sans text-gray-700 overflow-hidden">
      <SEO 
        title={t('nav.about')} 
        description={t('about.hero_subtitle')}
        schema={aboutSchema}
      />

      {/* 1. Hero Banner - Parallax & Animated Text */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-corporate">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop" 
            alt="Office Background" 
            className="w-full h-full object-cover opacity-30 animate-[pulse_20s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-corporate/80 to-corporate/95"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/20 text-sm font-medium mb-6 animate-fade-in-down">
             <Trophy size={14} className="text-yellow-400"/> {t('about.hero_badge')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            {t('nav.about')} <span className="text-primary">{t('about.hero_title')}</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-8 rounded-full animate-fade-in-up delay-200"></div>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-300">
            {t('about.hero_subtitle')}
          </p>
        </div>
      </div>

      {/* 2. CEO Message Section - Elegant Layout */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            
            {/* Left: Image & Timeline */}
            <div className="lg:w-5/12 relative animate-slide-in-left">
               {/* Decor element */}
               <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-100 rounded-full opacity-50 blur-2xl"></div>
               <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-blue-100 rounded-full opacity-50 blur-2xl"></div>

               <div className="relative rounded-2xl overflow-hidden shadow-2xl border-[8px] border-white z-10">
                  <img 
                    src="/uploads/images/Images_web/1764042731577-57377200.jpg" 
                    alt="CEO Tran Thanh Xuan" 
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-corporate/90 to-transparent p-8 pt-24 text-white">
                     <h3 className="text-2xl font-bold">{t('about.ceo_title')}</h3>
                     <p className="opacity-80 uppercase text-sm tracking-wider">{t('about.ceo_role')}</p>
                  </div>
               </div>

               {/* Enhanced Timeline */}
               <div className="mt-12 pl-4">
                  <h3 className="text-xl font-bold text-corporate mb-6 flex items-center gap-2 border-b pb-2 border-gray-100">
                    <Calendar className="text-primary" size={24} /> {t('home.stat_exp')}
                  </h3>
                  <div className="space-y-8 relative border-l-2 border-gray-200 ml-3 pl-8">
                     <div className="relative group">
                        <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white border-4 border-primary group-hover:scale-125 transition-transform duration-300"></span>
                        <div className="font-bold text-2xl text-primary leading-none mb-1">1992</div>
                        <h4 className="font-bold text-gray-800 text-lg">{t('about.milestone_1')}</h4>
                        <p className="text-sm text-gray-500 mt-1">{t('about.milestone_1_desc')}</p>
                     </div>
                     <div className="relative group">
                        <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white border-4 border-corporate group-hover:scale-125 transition-transform duration-300"></span>
                        <div className="font-bold text-2xl text-corporate leading-none mb-1">2068/QĐ-TTG</div>
                        <h4 className="font-bold text-gray-800 text-lg">{t('about.milestone_2')}</h4>
                        <p className="text-sm text-gray-500 mt-1">{t('about.milestone_2_desc')}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right: The Letter */}
            <div className="lg:w-7/12 animate-slide-in-right">
               <div className="relative">
                 <Quote size={120} className="absolute -top-10 -left-10 text-gray-100 -z-10" />
                 <h2 className="text-4xl font-bold text-corporate mb-8">{t('about.letter_title')}</h2>
                 
                 <div className="prose prose-lg max-w-none text-justify text-gray-600 leading-relaxed space-y-6">
                   <p className="font-medium text-gray-900 italic text-xl border-l-4 border-primary pl-4 bg-gray-50 py-4 pr-4 rounded-r-lg">
                     {t('about.letter_greeting')}
                   </p>

                   <p>{t('about.letter_p1')}</p>
                   <p>{t('about.letter_p2')}</p>
                   
                   <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start gap-4 my-6 transform hover:-translate-y-1 transition-transform duration-300">
                      <Award className="text-primary flex-shrink-0" size={32} />
                      <div>
                        <h4 className="font-bold text-corporate text-lg mb-1">{t('about.core_val_title')}</h4>
                        <p className="text-sm">{t('about.core_val_desc')}</p>
                      </div>
                   </div>

                   <p>
                     Trong tương lai gần, Việt Nam sẽ chính thức tham gia các hiệp định quốc tế về giảm phát thải năng lượng, thể hiện quyết tâm và cam kết mạnh mẽ của Chính phủ Việt Nam trong việc phát triển năng lượng tái tạo. Động thái vĩ mô này của Chính phủ sẽ tạo điều kiện cho CTC phát triển bền vững trong những năm tiếp theo.
                   </p>

                   <p>
                     Chúng tôi rất hân hạnh được đồng hành cùng quý khách hàng trên hành trình phát triển. Chúng tôi tin tưởng rằng với kinh nghiệm, chuyên môn và đội ngũ nhân viên hùng hậu, chúng tôi sẽ mang lại giá trị vượt trội cho quý khách.
                   </p>
                 </div>

                 {/* Signature Block */}
                 <div className="mt-12 flex justify-end">
                    <div className="text-center relative">
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gray-200"></div>
                      <p className="text-gray-500 mb-2 font-serif italic">Trân trọng,</p>
                      <h3 className="font-bold text-corporate text-lg uppercase tracking-widest">{t('about.ceo_role')}</h3>
                      <div className="h-24 flex items-center justify-center">
                         {/* Simulated Signature - In real app use an image or signature font */}
                         <span className="font-signature text-5xl text-primary rotate-[-5deg] opacity-90 font-cursive" style={{fontFamily: '"Dancing Script", cursive, serif'}}>Nguyen Van Duy</span>
                      </div>
                      <p className="font-bold text-gray-800 mt-2">{t('about.ceo_title')}</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mission & Vision Cards - Hover Effects */}
      <div className="bg-gray-50 py-24 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-corporate mb-4">{t('about.vision_title')}</h2>
            <p className="text-gray-600">{t('about.vision_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {/* Mission */}
             <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group border border-gray-100 animate-fade-in-up delay-100">
               <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-corporate group-hover:bg-corporate group-hover:text-white transition-colors duration-500 rotate-3 group-hover:rotate-0 shadow-inner">
                 <Target size={40} />
               </div>
               <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center group-hover:text-corporate transition-colors">{t('about.mission')}</h3>
               <p className="text-gray-600 text-center leading-relaxed">
                 {t('about.mission_desc')}
               </p>
             </div>

             {/* Vision */}
             <div className="bg-corporate text-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 md:-mt-6 group relative overflow-hidden animate-fade-in-up delay-200">
               <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary rounded-full opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
               
               <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 text-primary group-hover:bg-white group-hover:text-primary transition-colors duration-500 rotate-3 group-hover:rotate-0 shadow-lg">
                 <Eye size={40} />
               </div>
               <h3 className="text-2xl font-bold mb-4 text-center">{t('about.vision')}</h3>
               <p className="text-gray-200 text-center leading-relaxed">
                 {t('about.vision_desc')}
               </p>
             </div>

             {/* Core Values */}
             <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group border border-gray-100 animate-fade-in-up delay-300">
               <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 rotate-3 group-hover:rotate-0 shadow-inner">
                 <Award size={40} />
               </div>
               <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center group-hover:text-primary transition-colors">{t('about.core_values')}</h3>
               <ul className="space-y-4 text-gray-600">
                 <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                    <CheckCircle size={20} className="text-primary flex-shrink-0" /> 
                    <span className="font-medium">{t('about.core_trust')}</span>
                 </li>
                 <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                    <CheckCircle size={20} className="text-primary flex-shrink-0" /> 
                    <span className="font-medium">{t('about.core_quality')}</span>
                 </li>
                 <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                    <CheckCircle size={20} className="text-primary flex-shrink-0" /> 
                    <span className="font-medium">{t('about.core_portfolio')}</span>
                 </li>
               </ul>
             </div>
          </div>
        </div>
      </div>

      {/* 4. Areas of Operation - Grid with Reveal */}
      <div className="py-24 bg-white">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-100 pb-6 animate-fade-in">
               <div>
                 <span className="text-primary font-bold uppercase tracking-widest text-sm">{t('common.category')}</span>
                 <h2 className="text-3xl md:text-4xl font-bold text-corporate mt-2">{t('about.areas_title')}</h2>
               </div>
               <button className="hidden md:flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
                  {t('common.view_details')} <ArrowRight size={18} />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { icon: Zap, title: t('about.area_epc'), desc: t('about.area_epc_desc'), delay: 'delay-0' },
                 { icon: FileText, title: t('about.area_design'), desc: t('about.area_design_desc'), delay: 'delay-100' },
                 { icon: Target, title: t('about.area_dist'), desc: t('about.area_dist_desc'), delay: 'delay-200' },
                 { icon: Eye, title: t('about.area_invest'), desc: t('about.area_invest_desc'), delay: 'delay-300' }
               ].map((item, idx) => (
                 <div key={idx} className={`bg-white p-8 rounded-xl border border-gray-100 hover:border-primary transition-all duration-500 hover:shadow-xl group cursor-pointer animate-fade-in-up ${item.delay}`}>
                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110">
                       <item.icon size={28} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-600">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default About;
