
import React, { useEffect, useState, useRef } from 'react';
import { Handshake } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { Partner } from '../types';

// PartnerRow is declared inside this component, so use a stable object ref
// here instead of a callback ref that would set state during detach/attach.
const usePartnerInView = (threshold = 0.05) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
};

/** Render legacy placeholder logos locally and keep external logos resilient. */
const PartnerLogo: React.FC<{ partner: Partner }> = ({ partner }) => {
  const [hasError, setHasError] = useState(false);
  const isPlaceholder = /via\.placeholder\.com/i.test(partner.logo || '');

  if (isPlaceholder || hasError || !partner.logo) {
    return (
      <span className="px-3 text-center text-sm font-bold tracking-wide text-slate-600 dark:text-slate-200">
        {partner.name}
      </span>
    );
  }

  return (
    <div className="w-[140px] sm:w-[170px] h-[60px] flex items-center justify-center p-3.5 bg-white/95 dark:bg-white/90 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] transition-all duration-500 group-hover:bg-white">
      <img
        src={partner.logo}
        alt={partner.name}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
        className="w-full h-full object-contain opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
      />
    </div>
  );
};

const getDisplayData = (items: Partner[]) => {
  if (items.length === 0) return [];
  // Keep each marquee lane wide enough without creating dozens of duplicate DOM nodes.
  const repeatCount = Math.max(3, Math.ceil(9 / items.length));
  return Array.from({ length: repeatCount }, () => items).flat();
};

const PartnerSlider: React.FC = () => {
  const { t } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);
  const supplierRef = usePartnerInView();
  const financialRef = usePartnerInView();

  useEffect(() => {
    let cancelled = false;

    const fetchPartners = async () => {
      try {
        const data = await api.partners.getAll();
        if (!cancelled) setPartners(data);
      } catch {
        if (!cancelled) setPartners([]);
      }
    };

    fetchPartners();

    return () => {
      cancelled = true;
    };
  }, []);

  const suppliers = partners.filter(p => p.type === 'supplier');
  const financial = partners.filter(p => p.type === 'financial');

  const PartnerRow = React.useCallback(({ title, data, sectionRef, isInView }: { title: string, data: Partner[], sectionRef: React.RefObject<HTMLDivElement>, isInView: boolean }) => {
    if (data.length === 0) return null;
    const displayData = getDisplayData(data);

    const renderCards = () => (
      <div className="partner-track py-6 px-4 motion-reduce:[animation-play-state:paused]">
        {displayData.map((partner, idx) => (
          <div
            key={`${partner.id}-${idx}`}
            className="partner-card group relative flex h-28 w-[190px] flex-shrink-0 cursor-pointer items-center justify-center rounded-2xl p-5 sm:w-[220px]"
          >
            <PartnerLogo partner={partner} />
            <span className="pointer-events-none absolute inset-x-5 bottom-2 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
          </div>
        ))}
      </div>
    );

    return (
      <div ref={sectionRef} className="mb-16 last:mb-0 w-full overflow-hidden">
        <div className={`mb-7 flex items-center justify-center gap-3 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-indigo-500/50 sm:w-16" />
          <h3 className="text-center text-sm font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 sm:text-base">
            {title}
          </h3>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-indigo-500/50 sm:w-16" />
        </div>

        <div className={`partner-viewport relative overflow-hidden transition-all duration-700 delay-150 ${isInView ? 'opacity-100' : 'opacity-0'}`}>
          {renderCards()}
        </div>
      </div>
    );
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="partner-section relative overflow-hidden bg-slate-50 py-24 transition-colors duration-300 dark:bg-[#060d1d]">
      <style>{`
        .partner-grid {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image: linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .dark .partner-grid {
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
        }
        .partner-aura { position: absolute; width: 700px; height: 700px; z-index: 1; pointer-events: none; filter: blur(90px); }
        .partner-aura-1 { top: -25%; left: -8%; background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); }
        .partner-aura-2 { right: -8%; bottom: -25%; background: radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%); }
        .dark .partner-aura-1 { background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%); }
        .dark .partner-aura-2 { background: radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%); }
        .partner-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(225,235,250,0.64) 100%);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.82);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.8);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .dark .partner-card {
          background: linear-gradient(135deg, rgba(15,23,42,0.75) 0%, rgba(30,41,59,0.6) 100%);
          border-color: rgba(255,255,255,0.07);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.04);
        }
        .partner-card:hover { transform: translateY(-6px) scale(1.02); border-color: rgba(99,102,241,0.4); box-shadow: 0 24px 48px -15px rgba(99,102,241,0.12), inset 0 1px 2px rgba(255,255,255,0.9); }
        .dark .partner-card:hover { border-color: rgba(99,102,241,0.3); box-shadow: 0 24px 48px -15px rgba(0,0,0,0.5); }
        @keyframes partner-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        .partner-track { display: flex; gap: 1.75rem; width: max-content; animation: partner-marquee 30s linear infinite; }
        .partner-track:hover { animation-play-state: paused; }
        .partner-viewport::before, .partner-viewport::after { content: ''; position: absolute; top: 0; bottom: 0; width: 120px; z-index: 10; pointer-events: none; }
        .partner-viewport::before { left: 0; background: linear-gradient(to right, rgba(248,250,252,1), transparent); }
        .partner-viewport::after { right: 0; background: linear-gradient(to left, rgba(248,250,252,1), transparent); }
        .dark .partner-viewport::before { background: linear-gradient(to right, rgba(6,13,29,1), transparent); }
        .dark .partner-viewport::after { background: linear-gradient(to left, rgba(6,13,29,1), transparent); }
        @media (prefers-reduced-motion: reduce) { .partner-track { animation-play-state: paused; } }
      `}</style>

      <div className="partner-grid" />
      <div className="partner-aura partner-aura-1" />
      <div className="partner-aura partner-aura-2" />

      <div className="relative z-10">
        <div className="mb-14 px-4 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100/80 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-2 shadow-sm dark:border-indigo-800/30 dark:from-indigo-950/40 dark:to-sky-950/40">
            <Handshake size={15} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{t('home.partners_title')}</span>
          </div>
          <h2 className="py-2 text-3xl font-black leading-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white sm:text-4xl lg:text-5xl">
            {t('home.partners_title')}
          </h2>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-500/50" />
            <div className="relative h-2.5 w-2.5"><div className="absolute inset-0 animate-ping rounded-full bg-indigo-500 opacity-75" /><div className="relative h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" /></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-indigo-500/50" />
          </div>
        </div>

        <div className="container mx-auto px-4">
          <PartnerRow title={t('home.partners_supplier')} data={suppliers} sectionRef={supplierRef.ref} isInView={supplierRef.isInView} />
          <PartnerRow title={t('home.partners_financial')} data={financial} sectionRef={financialRef.ref} isInView={financialRef.isInView} />
        </div>
      </div>
    </section>
  );
};

export default PartnerSlider;
