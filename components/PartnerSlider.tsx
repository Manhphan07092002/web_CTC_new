
import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { Partner } from '../types';

// Custom hook for scroll animations
const useInView = (threshold = 0.05) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true); // Start as true to show immediately
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isInView };
};

const PartnerSlider: React.FC = () => {
  const { t } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);
  const supplierRef = useInView();
  const financialRef = useInView();

  useEffect(() => {
    const fetchPartners = async () => {
      const data = await api.partners.getAll();
      setPartners(data);
    };
    fetchPartners();
  }, []);

  const suppliers = partners.filter(p => p.type === 'supplier');
  const financial = partners.filter(p => p.type === 'financial');

  // Helper to duplicate items to ensure smooth infinite scroll if list is short
  const getDisplayData = (items: Partner[]) => {
     if (items.length === 0) return [];
     // Repeat items many times for ultra-seamless scrolling
     return [...items, ...items, ...items, ...items, ...items, ...items, ...items, ...items]; 
  };

  const PartnerRow = ({ title, data, sectionRef, isInView }: { title: string, data: Partner[], sectionRef: any, isInView: boolean }) => {
    if (data.length === 0) return null;
    const displayData = getDisplayData(data);

    return (
      <div ref={sectionRef} className="mb-16 last:mb-0 w-full overflow-hidden">
         {/* Centered Title with Underline */}
         <h3 className={`text-xl md:text-2xl font-bold text-corporate dark:text-white text-center uppercase mb-10 tracking-widest relative inline-block left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {title}
            <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary rounded-full transition-all duration-1000 delay-200 ${isInView ? 'scale-x-100' : 'scale-x-0'}`}></div>
         </h3>

         {/* Marquee Container */}
         <div className={`marquee-container w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] transition-all duration-1000 delay-300 ${isInView ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center md:justify-start [&_div]:mx-6 animate-infinite-scroll">
               {displayData.map((partner, idx) => (
                 <div 
                   key={`${partner.id}-${idx}`} 
                   className="w-48 h-28 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-500 hover:scale-125 hover:shadow-2xl hover:border-primary hover:z-10 cursor-pointer group relative"
                 >
                   <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                 </div>
               ))}
            </div>
            <div className="flex items-center justify-center md:justify-start [&_div]:mx-6 animate-infinite-scroll" aria-hidden="true">
               {displayData.map((partner, idx) => (
                 <div 
                   key={`${partner.id}-duplicate-${idx}`} 
                   className="w-48 h-28 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-500 hover:scale-125 hover:shadow-2xl hover:border-primary hover:z-10 cursor-pointer group relative"
                 >
                   <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                 </div>
               ))}
            </div>
         </div>
      </div>
    );
  };

  if (partners.length === 0) return null;

  return (
    <div className="w-full py-20 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
      <div className="w-full">
        <div className="container mx-auto px-4">
            <PartnerRow title={t('home.partners_supplier')} data={suppliers} sectionRef={supplierRef.ref} isInView={supplierRef.isInView} />
            <PartnerRow title={t('home.partners_financial')} data={financial} sectionRef={financialRef.ref} isInView={financialRef.isInView} />
        </div>
      </div>
    </div>
  );
};

export default PartnerSlider;
