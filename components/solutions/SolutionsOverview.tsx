import React from 'react';
import { Radio, Sun, Wind, Zap, Building2, Server, ArrowRight } from 'lucide-react';
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
    to: '/solutions/telecom',
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
    to: '/solutions/solar',
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
    to: '/solutions/wind',
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
    to: '/solutions/electrical',
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
    to: '/solutions/datacenter',
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
    to: '/solutions/construction',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=800&auto=format&fit=crop',
  },
];

/* ─── Component ─────────────────────────────────────────────────── */
const SolutionsOverview: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-slate-50 dark:bg-[#060d1d] transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
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
        .sol-grid-card {
          background: linear-gradient(145deg, rgba(255,255,255,.96), rgba(241,245,249,.9));
          border: 1px solid rgba(255,255,255,.95);
          box-shadow: 0 18px 45px -24px rgba(15,23,42,.28);
          transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s ease, border-color .4s ease;
        }
        .dark .sol-grid-card {
          background: linear-gradient(145deg, rgba(15,23,42,.94), rgba(8,15,31,.92));
          border-color: rgba(255,255,255,.08);
          box-shadow: 0 18px 45px -24px rgba(0,0,0,.75);
        }
        .sol-grid-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 55px -25px rgba(15,23,42,.38);
        }
        .sol-grid-card:hover .sol-card-image { transform: scale(1.06); }
        .sol-card-image { transition: transform .7s cubic-bezier(.16,1,.3,1); }
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

        {/* 3 × 2 desktop grid; 2 columns on tablet; 1 column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 max-w-7xl mx-auto">
          {SOLUTIONS.map((s) => (
            <article key={s.id} className="sol-grid-card group rounded-[2rem] overflow-hidden flex flex-col h-full">
              <Link to={s.to} className="relative h-48 overflow-hidden block" aria-label={`Xem ${s.title}`}>
                <img src={s.img} alt={s.title} className="sol-card-image w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
                <div className={`absolute top-4 left-4 w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${s.gradient} shadow-xl`}>
                  {s.icon}
                </div>
                <div className="absolute left-5 right-5 bottom-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/75">{s.tag}</div>
                  <h3 className="mt-1 text-xl font-black text-white leading-tight">{s.title}</h3>
                </div>
              </Link>

              <div className="p-6 flex flex-col flex-1">
                <div className="text-xs font-bold" style={{ color: s.accent }}>{s.subtitle}</div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3">{s.desc}</p>

                <div className="grid grid-cols-2 gap-2 mt-5">
                  {s.highlights.slice(0, 4).map((highlight) => (
                    <div key={highlight} className="flex items-start gap-2 rounded-xl bg-slate-100/80 dark:bg-white/5 px-3 py-2.5 min-h-[44px]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.accent }} />
                      <span className="text-[11px] leading-4 font-medium text-slate-600 dark:text-slate-300">{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6 flex items-end justify-between gap-4">
                  <div className="flex gap-5">
                    {s.stats.map((stat) => (
                      <div key={stat.label}>
                        <div className="text-xl font-black" style={{ color: s.accent }}>{stat.val}</div>
                        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400 leading-3">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <Link to={s.to} className={`sol-cta-btn flex-shrink-0 w-11 h-11 rounded-xl inline-flex items-center justify-center text-white bg-gradient-to-r ${s.gradient} shadow-lg`} aria-label={`Xem chi tiết ${s.title}`}>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsOverview;
