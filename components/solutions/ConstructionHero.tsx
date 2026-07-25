import React from 'react';
import { Building2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

const ConstructionHero: React.FC = () => {
  const { language } = useLanguage();

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
            {getLangText(language, { vi: 'Xây dựng kỹ thuật – CTC EPC', en: 'Technical Construction – CTC EPC', ko: '기술 건설 – CTC EPC', ja: '技術建設 – CTC EPC', zh: '工程建设 – CTC EPC', de: 'Technischer Bau – CTC EPC' })}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            {getLangText(language, { vi: 'Xây Dựng Dân Dụng', en: 'Civil & Industrial', ko: '민간 및 산업', ja: '民生 & 産業', zh: '民用与工业', de: 'Zivil- & Industrie-' })} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-gray-200">
              {getLangText(language, { vi: '& Công Nghiệp EPC', en: 'Construction EPC', ko: '건설 EPC', ja: '建設 EPC', zh: '建筑 EPC', de: 'Bau EPC' })}
            </span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl font-light">
            {getLangText(language, {
              vi: <>Với <strong className="text-white">500+ công trình</strong> hoàn thành trong 32+ năm, CTC tổng thầu EPC nhà xưởng công nghiệp, hạ tầng dự án năng lượng và công trình quốc phòng trọng điểm – đảm bảo <em>Chất lượng – Tiến độ – An toàn.</em></>,
              en: <>With <strong className="text-white">500+ completed projects</strong> over 32+ years, CTC serves as turnkey EPC general contractor for industrial factories, energy infrastructure, and national defense facilities – guaranteeing <em>Quality – Schedule – Safety.</em></>,
              ko: <>32년 이상의 경험과 <strong className="text-white">500개 이상의 프로젝트</strong>를 통해 CTC는 산업 공장, 에너지 인프라 및 국방 시설에 대한 턴키 EPC 총괄 계약자로 작업합니다.</>,
              ja: <>32年以上の実績と<strong className="text-white">500件以上の施工実績</strong>を持つCTCは、産業工場、エネルギーインフラ、国防施設の一括EPC総責任者です。</>,
              zh: <>凭借32+年间完成<strong className="text-white">500+项目</strong>的深厚积累，CTC承担工业厂房、能源基础设施及国防重点工程的全流程EPC总承包。</>,
              de: <>Mit <strong className="text-white">500+ abgeschlossenen Projekten</strong> in über 32 Jahren ist CTC EPC-Generalunternehmer für Industrieanlagen, Energieinfrastruktur und Verteidigungsbauten.</>
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConstructionHero;
