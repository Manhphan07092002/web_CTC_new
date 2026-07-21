import React from 'react';
import { Building2 } from 'lucide-react';

const ConstructionHero: React.FC = () => {
  return (
    <div className="relative pt-36 md:pt-44 pb-20 bg-gray-900 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1920&auto=format&fit=crop"
        alt="Xây dựng dân dụng & công nghiệp CTC"
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-gray-900/80 to-transparent" />
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-slate-400/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-slate-500/20 border border-slate-400/30 text-slate-300 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Building2 size={16} />
            Xây dựng kỹ thuật – CTC EPC
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Xây Dựng Dân Dụng <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-gray-200">
              & Công Nghiệp EPC
            </span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl font-light">
            Với <strong className="text-white">500+ công trình</strong> hoàn thành trong 32+ năm, CTC tổng thầu EPC
            nhà xưởng công nghiệp, hạ tầng dự án năng lượng và công trình quốc phòng trọng điểm –
            đảm bảo <em>Chất lượng – Tiến độ – An toàn.</em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConstructionHero;
