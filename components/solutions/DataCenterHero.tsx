import React from 'react';
import { Server } from 'lucide-react';

const DataCenterHero: React.FC = () => {
  return (
    <div className="relative py-32 md:py-40 bg-gray-900 overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1920&auto=format&fit=crop" 
        alt="Data Center"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-corporate/80 to-transparent"></div>
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-purple-400/10 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Server size={16} className="animate-pulse" />
            Công Nghệ Thông Tin
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Data Center & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">
              Hạ Tầng Số
            </span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl font-light">
            Cung cấp giải pháp xây dựng trung tâm dữ liệu chuẩn Tier III, hệ thống Precision Cooling, UPS, CCTV và bảo mật an toàn thông tin phục vụ chuyển đổi số toàn diện.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataCenterHero;
