import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { Testimonial } from '../../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  const { t } = useLanguage();
  const { ref: testimonialsSection, isInView } = useInView(0.1);

  if (!testimonials || testimonials.length === 0) return null;

  // Double-up items for seamless loop
  const loopItems = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section
      ref={testimonialsSection}
      className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#060d1d] transition-colors duration-300"
    >
      {/* ── CSS: Blueprint Grid + Aura Orbs + Card Glass + Marquee ── */}
      <style>{`
        /* Blueprint subtle grid */
        .testi-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none; z-index: 1;
        }
        .dark .testi-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
        }

        /* Aura glow orbs */
        .testi-aura {
          position: absolute; width: 700px; height: 700px;
          filter: blur(90px); z-index: 1; pointer-events: none;
        }
        .testi-aura-1 {
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          top: -20%; left: -5%;
        }
        .testi-aura-2 {
          background: radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%);
          bottom: -20%; right: -5%;
        }
        .dark .testi-aura-1 { background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%); }
        .dark .testi-aura-2 { background: radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%); }

        /* Frosted glass card — matching Features */
        .testi-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(225,235,250,0.65) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.8);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .dark .testi-card {
          background: linear-gradient(135deg, rgba(15,23,42,0.75) 0%, rgba(30,41,59,0.6) 100%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.04);
        }
        .testi-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: rgba(99,102,241,0.4);
          box-shadow: 0 24px 48px -15px rgba(99,102,241,0.12), inset 0 1px 2px rgba(255,255,255,0.9);
        }
        .dark .testi-card:hover {
          border-color: rgba(99,102,241,0.3);
          box-shadow: 0 24px 48px -15px rgba(0,0,0,0.5);
        }

        /* Smooth infinite marquee */
        @keyframes testi-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .testi-track {
          display: flex;
          gap: 1.75rem;
          width: max-content;
          animation: testi-marquee 30s linear infinite;
        }
        .testi-track:hover { animation-play-state: paused; }

        /* Fade edge masks */
        .testi-viewport::before,
        .testi-viewport::after {
          content: '';
          position: absolute; top: 0; bottom: 0; width: 120px; z-index: 10; pointer-events: none;
        }
        .testi-viewport::before {
          left: 0;
          background: linear-gradient(to right, rgba(248,250,252,1), transparent);
        }
        .testi-viewport::after {
          right: 0;
          background: linear-gradient(to left, rgba(248,250,252,1), transparent);
        }
        .dark .testi-viewport::before {
          background: linear-gradient(to right, rgba(6,13,29,1), transparent);
        }
        .dark .testi-viewport::after {
          background: linear-gradient(to left, rgba(6,13,29,1), transparent);
        }

        /* Star shimmer */
        .testi-star-shimmer {
          filter: drop-shadow(0 0 4px rgba(251,191,36,0.6));
        }

        /* Quote mark decorative */
        .testi-quote-mark {
          background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(14,165,233,0.1) 100%);
          border-radius: 50%;
        }
        .dark .testi-quote-mark {
          background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(14,165,233,0.08) 100%);
        }
      `}</style>

      {/* Background decorations */}
      <div className="testi-grid" />
      <div className="testi-aura testi-aura-1" />
      <div className="testi-aura testi-aura-2" />

      <div className="relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-14 px-4 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-sky-950/40 border border-indigo-100/80 dark:border-indigo-800/30 px-5 py-2 rounded-full mb-5 shadow-sm">
            <Star size={15} className="text-indigo-600 dark:text-indigo-400 fill-current" />
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              {t('home.testimonials')}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white tracking-tight py-2 leading-normal mb-5">
            {t('home.testimonials_title')}
          </h2>

          {/* Separator */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-indigo-500/50" />
            <div className="relative w-2.5 h-2.5">
              <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75" />
              <div className="relative w-2.5 h-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            </div>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-indigo-500/50" />
          </div>
        </div>

        {/* Infinite Scroll Track */}
        <div
          className={`testi-viewport relative overflow-hidden transition-all duration-700 delay-150 ${isInView ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="testi-track py-6 px-4">
            {loopItems.map((item, index) => (
              <div
                key={`testi-${index}-${item._id || item.id}`}
                className="testi-card rounded-2xl p-6 flex flex-col flex-shrink-0 cursor-pointer"
                style={{ width: '340px', minHeight: '230px' }}
              >
                {/* Top: Quote icon + Stars */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-0.5 testi-star-shimmer">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <div className="testi-quote-mark w-9 h-9 flex items-center justify-center flex-shrink-0">
                    <Quote size={16} className="text-indigo-500 dark:text-indigo-400" />
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed italic flex-1 line-clamp-4 mb-5">
                  "{item.content}"
                </p>

                {/* Footer: Avatar + Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/60 dark:border-slate-700/40 mt-auto">
                  <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white dark:ring-slate-600 ring-offset-1 shadow-md">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</h4>
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
