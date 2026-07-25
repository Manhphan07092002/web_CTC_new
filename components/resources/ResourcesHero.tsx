import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

const ResourcesHero: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="bg-corporate text-white shadow-md relative pt-32 pb-12 md:pt-36 md:pb-16 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-yellow-400 border border-white/20 mb-3">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          {getLangText(language, { vi: 'Thư Viện Tài Liệu Kỹ Thuật CTC', en: 'CTC Technical Document Library', ko: 'CTC 기술 문서 라이브러리', ja: 'CTC技術ドキュメントライブラリ', zh: 'CTC技术资料库', de: 'CTC Technische Dokumentenbibliothek' })}
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
          {t('resources.title')}
        </h1>
        <p className="opacity-90 mt-3 text-base md:text-xl max-w-2xl font-normal leading-relaxed">
          {t('resources.subtitle')}
        </p>
      </div>
    </div>
  );
};

export default ResourcesHero;
