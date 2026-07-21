import React from 'react';
import { Wind } from 'lucide-react';

const FarmHero: React.FC = () => {
  return (
    <div className="relative pt-36 md:pt-44 pb-20 bg-gray-900 overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1920&auto=format&fit=crop" 
        alt="Wind Farm CTC"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-corporate/80 to-transparent"></div>
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 text-teal-300 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Wind size={16} />
            Điện Gió – Wind Power EPC
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Tổng Thầu EPC
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
              Trang Trại Điện Gió
            </span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl font-light">
            CTC đã thi công thành công các dự án điện gió tại Quảng Trị – khu vực có tiềm năng gió
            mạnh nhất Việt Nam. Năng lực EPC từ <em>nền móng, cáp nội bộ đến đấu nối lưới 110kV/220kV.</em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmHero;
