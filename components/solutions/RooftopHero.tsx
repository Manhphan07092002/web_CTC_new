import React from 'react';
import { Sun } from 'lucide-react';

const RooftopHero: React.FC = () => {
  return (
    <div className="relative py-32 md:py-40 bg-gray-900 overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?q=80&w=1920&auto=format&fit=crop" 
        alt="Solar Rooftop CTC"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 via-corporate/80 to-transparent"></div>
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-orange-400/10 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-300 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Sun size={16} className="animate-spin-slow" />
            Điện Mặt Trời – Solar EPC
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Điện Mặt Trời Áp Mái
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
              Hộ Gia Đình & C&I
            </span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl font-light">
            CTC cung cấp dịch vụ EPC trọn gói hệ thống điện mặt trời áp mái với kinh nghiệm 
            <strong className="text-white"> 32+ năm</strong> và đội ngũ kỹ sư chuyên nghiệp. 
            Từ <em>Tư vấn → Thiết kế → Thi công → Vận hành & Bảo trì.</em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RooftopHero;
