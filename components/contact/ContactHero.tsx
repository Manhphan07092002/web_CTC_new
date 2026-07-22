import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { PhoneCall, ShieldCheck, Clock } from 'lucide-react';

const ContactHero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-corporate text-white shadow-md relative pt-32 pb-12 md:pt-36 md:pb-16 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs md:text-sm font-semibold text-yellow-400 border border-white/20 mb-4 shadow-sm">
          <PhoneCall size={16} className="animate-bounce" />
          <span>Tư Vấn & Khảo Sát Tận Nơi Miễn Phí 24/7</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md mb-4 leading-tight">
          Liên Hệ Với CTC
        </h1>
        
        <p className="opacity-90 text-base md:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
          CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG - Tổng thầu EPC Điện Mặt Trời & Hạ Tầng Năng Lượng Tái Tạo Uy Tín Hàng Đầu.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs md:text-sm font-medium text-white/90">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
            <ShieldCheck size={18} className="text-green-400" />
            <span>MST: 0400458940</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
            <Clock size={18} className="text-yellow-400" />
            <span>Phản hồi nhanh trong 15 phút</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHero;
