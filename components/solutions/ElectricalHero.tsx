import React from 'react';
import { Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const ElectricalHero: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language !== 'vi';
  const isKo = language === 'ko';
  const isJa = language === 'ja';

  return (
    <div className="relative pt-36 md:pt-44 pb-20 bg-gray-900 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=1920&auto=format&fit=crop"
        alt="Đường dây & Trạm biến áp 110kV CTC"
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/90 via-amber-900/80 to-transparent" />
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Zap size={16} className="animate-pulse" />
            {isEn ? 'Power Grid & Engineering – CTC EPC' : 'Điện lực & Kỹ thuật – CTC EPC'}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            {isEn ? '110kV Power Lines &' : 'Đường Dây & Trạm'} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
              {isEn ? 'Substations EPC' : 'Biến Áp 110kV'}
            </span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl font-light">
            {isEn ? (
              <>CTC constructs medium and high-voltage transmission lines and 110kV substations connected to the national grid. <strong className="text-white">Grade I Ministry Certificate (2020)</strong>, extensive experience in national defense electrical works and renewable energy projects.</>
            ) : (
              <>CTC thi công đường dây tải điện trung – cao thế và trạm biến áp 110kV đấu nối lưới quốc gia. <strong className="text-white">Chứng chỉ năng lực Bộ Xây dựng 2020</strong>, kinh nghiệm thi công công trình điện quốc phòng và dự án năng lượng tái tạo.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElectricalHero;
