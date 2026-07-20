import React from 'react';
import { Radio } from 'lucide-react';

const FloatingHero: React.FC = () => {
  return (
    <div className="relative py-32 md:py-40 bg-gray-900 overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1920&auto=format&fit=crop" 
        alt="Telecom & Data Center CTC"
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 via-corporate/80 to-transparent"></div>
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-sky-400/10 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 text-sky-300 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Radio size={16} />
            Viễn thông & CNTT – Lĩnh vực cốt lõi CTC
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Hạ Tầng Viễn Thông &
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
              Data Center – CNTT
            </span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl font-light">
            Xuất phát từ hạ tầng Bưu điện Miền Trung, CTC sở hữu <strong className="text-white">32+ năm kinh nghiệm</strong> trong lĩnh vực
            viễn thông. Khách hàng bao gồm Bộ Công an, Mobifone, VNPT Net và các cơ quan nhà nước.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingHero;
