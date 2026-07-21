import React from 'react';
import { Zap } from 'lucide-react';

const ElectricalHero: React.FC = () => {
  return (
    <div className="relative py-32 md:py-40 bg-gray-900 overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1544256718-3b61027159cb?q=80&w=1920&auto=format&fit=crop" 
        alt="Trạm Biến Áp 110kV"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/90 via-corporate/80 to-transparent"></div>
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Zap size={16} className="animate-pulse" />
            Năng Lượng & Điện Lực
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Đường Dây & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
              Trạm Biến Áp 110kV
            </span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl font-light">
            Thi công đường dây tải điện, trạm biến áp, hệ thống tiếp địa chống sét và cung cấp 
            nguồn dự phòng UPS. CTC tự hào là đối tác tin cậy của lưới điện quốc gia và công trình trọng điểm.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElectricalHero;
