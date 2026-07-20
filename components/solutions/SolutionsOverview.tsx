import React, { useEffect, useRef, useState } from 'react';
import { Radio, Sun, Wind, Zap, Building2, Server, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Data ─────────────────────────────────────────────────────── */
interface SolutionCard {
  id: string;
  icon: React.ReactNode;
  accent: string;
  gradient: string;
  glowColor: string;
  tag: string;
  title: string;
  subtitle: string;
  desc: string;
  stats: { val: string; label: string }[];
  highlights: string[];
  to: string;
  img: string;
}

const SOLUTIONS: SolutionCard[] = [
  {
    id: 'telecom',
    icon: <Radio size={22} />,
    accent: '#38bdf8',
    gradient: 'from-sky-500 to-blue-600',
    glowColor: 'rgba(56,189,248,0.18)',
    tag: 'VIỄN THÔNG & CNTT',
    title: 'Hạ Tầng Viễn Thông',
    subtitle: 'Cáp quang • BTS • Data Center',
    desc: 'Thiết kế và thi công mạng cáp quang OSP, trạm BTS/NodeB, hạ tầng Metro và Data Center chuẩn Tier III cho nhà mạng và cơ quan nhà nước.',
    stats: [
      { val: '100+', label: 'Công trình viễn thông' },
      { val: '32+', label: 'Năm kinh nghiệm' },
    ],
    highlights: ['Cáp quang ngoại vi (OSP)', 'Trạm BTS/NodeB 4G/5G', 'Metro Network', 'Data Center Tier III'],
    to: '/solutions/floating',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'solar',
    icon: <Sun size={22} />,
    accent: '#f97316',
    gradient: 'from-orange-500 to-yellow-500',
    glowColor: 'rgba(249,115,22,0.18)',
    tag: 'NĂNG LƯỢNG TÁI TẠO',
    title: 'Điện Mặt Trời Solar',
    subtitle: 'Áp mái • C&I • Solar Farm',
    desc: 'Tổng thầu EPC hệ thống Solar cho hộ gia đình, thương mại & công nghiệp (C&I) và trang trại điện mặt trời kết nối lưới quốc gia.',
    stats: [
      { val: '500+', label: 'Hệ thống Solar' },
      { val: '4-5 năm', label: 'Hoàn vốn' },
    ],
    highlights: ['Solar áp mái hộ gia đình', 'C&I – Nhà máy & KCN', 'Solar Farm kết nối lưới', 'O&M bảo trì dài hạn'],
    to: '/solutions/rooftop',
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'wind',
    icon: <Wind size={22} />,
    accent: '#2dd4bf',
    gradient: 'from-teal-500 to-emerald-500',
    glowColor: 'rgba(45,212,191,0.18)',
    tag: 'NĂNG LƯỢNG TÁI TẠO',
    title: 'Điện Gió Wind Power',
    subtitle: 'EPC • Hạ tầng • Đấu nối lưới 110kV',
    desc: 'Tổng thầu EPC các dự án điện gió trong đất liền tại Quảng Trị. Nền móng trụ gió, cáp nội bộ, trạm 110kV và vận hành SCADA.',
    stats: [
      { val: '3', label: 'Trang trại điện gió' },
      { val: '110kV', label: 'Chuẩn đấu nối' },
    ],
    highlights: ['Điện gió Hướng Linh 1 & 4', 'Điện gió Hướng Hiệp', 'Nền móng trụ gió bê tông', 'Trạm biến áp 110kV'],
    to: '/solutions/farm',
    img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'electrical',
    icon: <Zap size={22} />,
    accent: '#eab308',
    gradient: 'from-yellow-500 to-amber-500',
    glowColor: 'rgba(234,179,8,0.18)',
    tag: 'ĐIỆN LỰC & KỸ THUẬT',
    title: 'Đường Dây & Trạm Biến Áp',
    subtitle: 'Đường dây 110kV • Trạm biến áp',
    desc: 'Xây dựng đường dây tải điện trung – cao thế và trạm biến áp 110kV đấu nối lưới quốc gia. Hệ thống tiếp địa, chống sét và nguồn dự phòng UPS.',
    stats: [
      { val: '110kV', label: 'Điện áp đấu nối' },
      { val: '02', label: 'Chứng chỉ Bộ XD' },
    ],
    highlights: ['Đường dây 110kV/220kV', 'Trạm biến áp 110kV', 'Tiếp địa chống sét', 'UPS & Nguồn dự phòng'],
    to: '/solutions',
    img: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'datacenter',
    icon: <Server size={22} />,
    accent: '#a78bfa',
    gradient: 'from-violet-500 to-purple-600',
    glowColor: 'rgba(167,139,250,0.18)',
    tag: 'HẠ TẦNG SỐ',
    title: 'Data Center & CNTT',
    subtitle: 'Tier III • Cloud • Smart System',
    desc: 'Thiết kế, xây dựng và vận hành Data Center chuẩn Tier III. Hệ thống mạng doanh nghiệp, camera an ninh và chuyển đổi số tích hợp.',
    stats: [
      { val: 'Tier III', label: 'Chuẩn Data Center' },
      { val: '24/7', label: 'Giám sát O&M' },
    ],
    highlights: ['Data Center chuẩn Tier III', 'Precision Cooling hệ thống', 'Network & Bảo mật', 'CCTV & Smart Security'],
    to: '/solutions',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: 'construction',
    icon: <Building2 size={22} />,
    accent: '#94a3b8',
    gradient: 'from-slate-500 to-gray-600',
    glowColor: 'rgba(148,163,184,0.18)',
    tag: 'XÂY DỰNG KỸ THUẬT',
    title: 'Xây Dựng Dân Dụng & Công Nghiệp',
    subtitle: 'EPC • Nhà xưởng • Hạ tầng',
    desc: 'Thi công công trình dân dụng, nhà xưởng công nghiệp và hạ tầng tổng hợp đi kèm các dự án năng lượng và viễn thông.',
    stats: [
      { val: '500+', label: 'Công trình hoàn thành' },
      { val: 'EPC', label: 'Tổng thầu trọn gói' },
    ],
    highlights: ['Nhà xưởng & kho công nghiệp', 'Hạ tầng dự án năng lượng', 'Công trình quốc phòng', 'M&E cơ điện'],
    to: '/solutions',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=800&auto=format&fit=crop',
  },
];

/* ─── Component ─────────────────────────────────────────────────── */
const SolutionsOverview: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string>('telecom');
  const active = SOLUTIONS.find(s => s.id === activeCard) ?? SOLUTIONS[0];
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = (id: string) => {
    if (id === activeCard) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveCard(id);
      setIsTransitioning(false);
    }, 180);
  };

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-slate-50 dark:bg-[#060d1d] transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Blueprint grid - same as Home */
        .sol-blueprint {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
        }
        .dark .sol-blueprint {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        }
        .sol-aura {
          position: absolute;
          width: 700px; height: 700px;
          filter: blur(100px);
          pointer-events: none;
        }

        /* Tab list item */
        .sol-tab {
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(226,232,240,0.7) 100%);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.8);
          border-left: 4px solid transparent;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 8px 20px -8px rgba(0,0,0,0.04);
        }
        .dark .sol-tab {
          background: linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.65) 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-left: 4px solid transparent;
        }
        .sol-tab:hover {
          transform: translateX(4px);
          background: rgba(255,255,255,0.97);
          box-shadow: 0 12px 28px -10px rgba(0,0,0,0.07);
        }
        .dark .sol-tab:hover {
          background: linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.75) 100%);
        }
        .sol-tab.active {
          transform: translateX(8px);
          box-shadow: 0 14px 30px -10px rgba(0,0,0,0.1);
        }
        .dark .sol-tab.active {
          box-shadow: 0 14px 30px -10px rgba(0,0,0,0.5);
        }

        /* Display panel */
        .sol-panel {
          background: linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(226,232,240,0.65) 100%);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.85);
          box-shadow: 0 24px 60px -15px rgba(0,0,0,0.06);
        }
        .dark .sol-panel {
          background: linear-gradient(135deg, rgba(6,13,29,0.6) 0%, rgba(15,23,42,0.45) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 24px 60px -15px rgba(0,0,0,0.5);
        }

        /* Dot grid inside panel */
        .sol-dotgrid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(14,165,233,0.07) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        /* Image transition */
        .sol-img { transition: opacity 0.25s ease, transform 0.4s ease; }
        .sol-img.fading { opacity: 0; transform: scale(1.03); }

        @keyframes solSlideUp {
          from { opacity: 0; transform: translateY(18px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        .sol-animate { animation: solSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }

        /* CTA button shimmer */
        .sol-cta-btn {
          position: relative; overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .sol-cta-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -130%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          transform: skewX(-20deg);
          transition: transform 0.75s ease;
        }
        .sol-cta-btn:hover::before { transform: translateX(260%) skewX(-20deg); }
        .sol-cta-btn:hover { transform: translateY(-2px) scale(1.02); }
      `}} />

      {/* Background decorations */}
      <div className="sol-blueprint z-0" />
      <div className="sol-aura z-0" style={{
        top: '-10%', left: '-8%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)'
      }} />
      <div className="sol-aura z-0" style={{
        bottom: '-10%', right: '-8%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)'
      }} />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* ── Section Header ── */}
        <div className="text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-sky-500/25 bg-sky-500/6 text-xs font-black tracking-widest text-sky-600 dark:text-sky-400 uppercase">
            CTC – GIẢI PHÁP TOÀN DIỆN EPC
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            6 Lĩnh Vực Chiến Lược
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto font-light">
            Tư vấn → Thiết kế → Thi công → Vận hành & Bảo trì – dịch vụ khép kín 32+ năm kinh nghiệm
          </p>
          <div className="w-14 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto rounded-full opacity-60" />
        </div>

        {/* ── 2-Column Command Layout ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch max-w-6xl mx-auto">

          {/* LEFT: Tab list */}
          <div className="w-full lg:w-5/12 flex flex-col gap-3">
            {SOLUTIONS.map((s) => {
              const isActive = s.id === activeCard;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelect(s.id)}
                  className={`sol-tab text-left p-4 sm:p-5 rounded-2xl cursor-pointer flex items-center gap-4 select-none ${isActive ? 'active' : ''}`}
                  style={isActive ? {
                    borderLeftColor: s.accent,
                    boxShadow: `0 14px 30px -10px ${s.glowColor}`,
                  } : {}}
                >
                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br ${s.gradient} shadow-lg transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                  >
                    {s.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                      {s.tag}
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {s.title}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 hidden sm:block">
                      {s.subtitle}
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronRight
                    size={18}
                    className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'text-slate-900 dark:text-white translate-x-1' : 'text-slate-300 dark:text-slate-700'}`}
                  />
                </button>
              );
            })}
          </div>

          {/* RIGHT: Detail panel */}
          <div className="w-full lg:w-7/12 sol-panel rounded-[2.5rem] relative overflow-hidden flex flex-col min-h-[520px]">
            <div className="sol-dotgrid" />

            {/* Image */}
            <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-[2.5rem]">
              <img
                src={active.img}
                alt={active.title}
                className={`sol-img w-full h-full object-cover ${isTransitioning ? 'fading' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
              {/* Tag badge on image */}
              <div
                className="absolute bottom-4 left-5 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                style={{ background: `linear-gradient(135deg, ${active.accent}cc, ${active.accent}88)` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {active.tag}
              </div>
            </div>

            {/* Content body */}
            <div className={`flex-1 flex flex-col p-6 sm:p-8 relative z-10 ${isTransitioning ? '' : 'sol-animate'}`}>

              {/* Title */}
              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1">
                  {active.title}
                </h3>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-3">{active.subtitle}</div>
                <div className="w-10 h-1 rounded-full" style={{ background: active.accent }} />
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                {active.desc}
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {active.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/30 border border-white/60 dark:border-white/5 rounded-xl px-3 py-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: active.accent }} />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-tight">{h}</span>
                  </div>
                ))}
              </div>

              {/* Bottom: Stats + CTA */}
              <div className="mt-auto pt-5 border-t border-slate-200/40 dark:border-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Mini stats */}
                <div className="flex items-center gap-8">
                  {active.stats.map((s, i) => (
                    <div key={i}>
                      <div className="text-2xl font-black text-slate-900 dark:text-white" style={{ color: active.accent }}>{s.val}</div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <Link
                  to={active.to}
                  className={`sol-cta-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-black text-sm uppercase tracking-wider shadow-xl bg-gradient-to-r ${active.gradient}`}
                >
                  Xem chi tiết <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsOverview;
