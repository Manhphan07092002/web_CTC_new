import React from 'react';
import { HardHat } from 'lucide-react';

const ConstructionHero: React.FC = () => {
  return (
    <div className="relative py-32 md:py-40 bg-gray-900 overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1541888081622-1aa454795906?q=80&w=1920&auto=format&fit=crop" 
        alt="Construction & Engineering"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-corporate/80 to-transparent"></div>
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-slate-400/10 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-slate-500/20 border border-slate-400/30 text-slate-300 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <HardHat size={16} className="animate-pulse" />
            Thi Công & Xây Lắp
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Xây Dựng Dân Dụng <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-gray-300">
              & Công Nghiệp
            </span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl font-light">
            CTC cung cấp dịch vụ tổng thầu xây dựng nhà xưởng, kho bãi, công trình dân dụng, hành chính và hạ tầng dự án năng lượng. Với hơn 500+ công trình đã hoàn thành, chúng tôi cam kết chất lượng, tiến độ và an toàn tuyệt đối.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConstructionHero;
