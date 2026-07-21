import React from 'react';
import { Server } from 'lucide-react';

const DataCenterHero: React.FC = () => {
  return (
    <div className="relative pt-36 md:pt-44 pb-20 bg-gray-900 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1920&auto=format&fit=crop"
        alt="Data Center & Hạ tầng số CTC"
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-900/80 to-transparent" />
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 text-violet-300 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Server size={16} />
            Hạ tầng số – CTC Digital
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Data Center & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">
              Hạ Tầng Số CNTT
            </span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl font-light">
            CTC thiết kế, xây dựng và vận hành Trung tâm Dữ liệu chuẩn{' '}
            <strong className="text-white">Tier III</strong>. Hệ thống CNTT, mạng doanh nghiệp,
            camera an ninh và chuyển đổi số cho cơ quan nhà nước và doanh nghiệp toàn quốc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataCenterHero;
