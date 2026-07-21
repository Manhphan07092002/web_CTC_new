import React, { useRef, useEffect, useState } from 'react';
import { Radio, Sun, Wind, Zap, Building2, Server, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Sector Data ─────────────────────────────────────────── */
const SECTORS = [
  {
    id: 'telecom',
    icon: Radio,
    tag: 'Viễn thông & CNTT',
    title: 'Hạ Tầng Viễn Thông',
    sub: 'Cáp quang • BTS • Data Center',
    desc: 'Thiết kế, thi công mạng cáp quang OSP, trạm BTS/NodeB 4G/5G, Metro Network và Data Center chuẩn Tier III cho nhà mạng & cơ quan nhà nước.',
    checks: ['Cáp quang ngoại vi (OSP)', 'Trạm BTS/NodeB 4G/5G', 'Metro Network', 'Data Center Tier III'],
    stat1: '100+', stat1l: 'Công trình',
    stat2: '32+', stat2l: 'Năm KN',
    to: '/solutions/floating',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
    glowBg: 'rgba(14,165,233,0.15)',
    accent: '#38bdf8',
    borderHover: 'hover:border-sky-400',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    tagStyle: 'bg-sky-900/60 text-sky-300 border-sky-700/50',
  },
  {
    id: 'solar',
    icon: Sun,
    tag: 'Solar EPC',
    title: 'Điện Mặt Trời',
    sub: 'Áp mái • C&I • Solar Farm',
    desc: 'Tổng thầu EPC trọn gói hệ thống Solar cho hộ gia đình, thương mại & công nghiệp (C&I) và trang trại Solar Farm kết nối lưới quốc gia.',
    checks: ['Solar áp mái hộ gia đình', 'C&I Nhà máy & KCN', 'Solar Farm kết nối lưới', 'O&M bảo trì dài hạn'],
    stat1: '500+', stat1l: 'Hệ thống',
    stat2: '4-5 năm', stat2l: 'Hoàn vốn',
    to: '/solutions/rooftop',
    gradient: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
    glowBg: 'rgba(249,115,22,0.15)',
    accent: '#fb923c',
    borderHover: 'hover:border-orange-400',
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop',
    tagStyle: 'bg-orange-900/60 text-orange-300 border-orange-700/50',
  },
  {
    id: 'wind',
    icon: Wind,
    tag: 'Wind Power EPC',
    title: 'Điện Gió',
    sub: 'EPC • Nền móng • Đấu nối 110kV',
    desc: 'Tổng thầu EPC các dự án điện gió trong đất liền tại Quảng Trị. Nền móng trụ gió, cáp nội bộ, trạm biến áp 110kV và hệ thống SCADA.',
    checks: ['Điện gió Hướng Linh 1 & 4', 'Điện gió Hướng Hiệp', 'Nền móng trụ gió bê tông', 'Trạm biến áp 110kV'],
    stat1: '3', stat1l: 'Dự án gió',
    stat2: '110kV', stat2l: 'Đấu nối',
    to: '/solutions/farm',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    glowBg: 'rgba(20,184,166,0.15)',
    accent: '#2dd4bf',
    borderHover: 'hover:border-teal-400',
    img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop',
    tagStyle: 'bg-teal-900/60 text-teal-300 border-teal-700/50',
  },
  {
    id: 'electrical',
    icon: Zap,
    tag: 'Điện lực & Kỹ thuật',
    title: 'Đường Dây & Trạm Biến Áp',
    sub: 'Đường dây 110kV • Trạm biến áp',
    desc: 'Xây dựng đường dây tải điện trung – cao thế và trạm biến áp 110kV đấu nối lưới quốc gia. Hệ thống tiếp địa, chống sét và nguồn dự phòng.',
    checks: ['Đường dây 110kV/220kV', 'Trạm biến áp 110kV', 'Tiếp địa chống sét', 'UPS & Nguồn dự phòng'],
    stat1: '02', stat1l: 'Chứng chỉ BXD',
    stat2: '110kV', stat2l: 'Điện áp',
    to: '/solutions/electrical',
    gradient: 'linear-gradient(135deg, #a16207 0%, #ca8a04 100%)',
    glowBg: 'rgba(234,179,8,0.15)',
    accent: '#fbbf24',
    borderHover: 'hover:border-yellow-400',
    img: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=800&auto=format&fit=crop',
    tagStyle: 'bg-yellow-900/60 text-yellow-300 border-yellow-700/50',
  },
  {
    id: 'datacenter',
    icon: Server,
    tag: 'Hạ tầng số',
    title: 'Data Center & CNTT',
    sub: 'Tier III • Cloud • Smart System',
    desc: 'Thiết kế, xây dựng và vận hành Data Center chuẩn Tier III. Hệ thống mạng doanh nghiệp, camera an ninh và chuyển đổi số tích hợp.',
    checks: ['Data Center chuẩn Tier III', 'Precision Cooling system', 'Network & Bảo mật dữ liệu', 'CCTV & Smart Security'],
    stat1: 'Tier III', stat1l: 'Chuẩn DC',
    stat2: '24/7', stat2l: 'Giám sát',
    to: '/solutions/datacenter',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
    glowBg: 'rgba(139,92,246,0.15)',
    accent: '#a78bfa',
    borderHover: 'hover:border-violet-400',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=700&auto=format&fit=crop',
    tagStyle: 'bg-violet-900/60 text-violet-300 border-violet-700/50',
  },
  {
    id: 'construction',
    icon: Building2,
    tag: 'Xây dựng kỹ thuật',
    title: 'Xây Dựng Dân Dụng & CN',
    sub: 'EPC • Nhà xưởng • Hạ tầng',
    desc: 'Thi công công trình dân dụng, nhà xưởng công nghiệp và hạ tầng tổng hợp đi kèm các dự án năng lượng, viễn thông và quốc phòng.',
    checks: ['Nhà xưởng & kho công nghiệp', 'Hạ tầng dự án năng lượng', 'Công trình quốc phòng A70', 'M&E cơ điện'],
    stat1: '500+', stat1l: 'Công trình',
    stat2: 'EPC', stat2l: 'Tổng thầu',
    to: '/solutions/construction',
    gradient: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
    glowBg: 'rgba(100,116,139,0.15)',
    accent: '#94a3b8',
    borderHover: 'hover:border-slate-400',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=800&auto=format&fit=crop',
    tagStyle: 'bg-slate-800/60 text-slate-300 border-slate-600/50',
  },
];

/* ─── Animated Number Hook ────────────────────────────────── */
const useCountUp = (target: string, trigger: boolean) => {
  const [val, setVal] = useState('0');
  useEffect(() => {
    if (!trigger) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) { setVal(target); return; }
    const suffix = target.replace(/[0-9.]/g, '');
    let start = 0;
    const step = num / 30;
    const timer = setInterval(() => {
      start = Math.min(start + step, num);
      setVal(Math.round(start) + suffix);
      if (start >= num) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [trigger, target]);
  return val;
};

/* ─── Card Component ──────────────────────────────────────── */
const SectorCard: React.FC<{ s: typeof SECTORS[0]; visible: boolean; delay: number }> = ({ s, visible, delay }) => {
  const Icon = s.icon;
  const [hovered, setHovered] = useState(false);
  const val1 = useCountUp(s.stat1, visible);
  const val2 = useCountUp(s.stat2, visible);

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-3xl border-2 border-white/8 bg-[#0a1628] cursor-pointer transition-all duration-500"
      style={{
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        boxShadow: hovered ? `0 20px 60px -15px ${s.glowBg}, 0 0 0 1px ${s.accent}33` : '0 4px 24px -8px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Glow blob behind card (shows on hover) ── */}
      <div
        className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${s.glowBg}, transparent 70%)` }}
      />

      {/* ── Image strip ── */}
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        <img
          src={s.img}
          alt={s.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* dark scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-[#0a1628]" />

        {/* Tag pill */}
        <div className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-sm ${s.tagStyle}`}>
          <Icon size={12} />
          {s.tag}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-6 relative z-10">

        {/* Title + Sub */}
        <div className="mb-3">
          <h3 className="text-base font-extrabold text-white leading-snug mb-1 group-hover:text-white transition-colors">
            {s.title}
          </h3>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{s.sub}</p>
        </div>

        {/* Divider */}
        <div className="w-10 h-0.5 mb-3 rounded-full transition-all duration-300 group-hover:w-16"
          style={{ background: s.accent }} />

        {/* Description */}
        <p className="text-[13px] text-slate-400 leading-relaxed mb-4 flex-1">{s.desc}</p>

        {/* Feature checks */}
        <ul className="space-y-1.5 mb-5">
          {s.checks.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-[12px] text-slate-300">
              <Check size={12} className="flex-shrink-0" style={{ color: s.accent }} />
              {c}
            </li>
          ))}
        </ul>

        {/* Stats + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/8">
          <div className="flex items-center gap-5">
            <div>
              <div className="text-xl font-black" style={{ color: s.accent }}>{val1}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{s.stat1l}</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-xl font-black text-white">{val2}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{s.stat2l}</div>
            </div>
          </div>

          <Link
            to={s.to}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-white transition-all duration-300 group-hover:gap-3"
            style={{
              background: s.gradient,
              boxShadow: hovered ? `0 8px 20px -6px ${s.glowBg}` : 'none',
            }}
          >
            Xem thêm <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────── */
const SolutionsOverview: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-20 sm:py-28 bg-[#060d1d] overflow-hidden"
    >
      {/* Blueprint grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* Ambient glows */}
      <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* ── Header ── */}
        <div
          className="text-center mb-14 transition-all duration-700"
          style={{ transform: visible ? 'translateY(0)' : 'translateY(20px)', opacity: visible ? 1 : 0 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-sky-500/25 bg-sky-500/8 text-[11px] font-black tracking-widest text-sky-400 uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            CTC – Giải pháp EPC toàn diện
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
            6 Lĩnh Vực{' '}
            <span className="text-transparent bg-clip-text" style={{
              backgroundImage: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)'
            }}>
              Chiến Lược
            </span>
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto font-light leading-relaxed">
            Dịch vụ khép kín <strong className="text-slate-300">Tư vấn → Thiết kế → Thi công → Vận hành & Bảo trì</strong> –
            32+ năm kinh nghiệm, 500+ công trình hoàn thành
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto rounded-full mt-5 opacity-70" />
        </div>

        {/* ── 3×2 Card Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTORS.map((s, i) => (
            <SectorCard key={s.id} s={s} visible={visible} delay={i * 80} />
          ))}
        </div>

        {/* ── Bottom CTA strip ── */}
        <div
          className="mt-14 text-center transition-all duration-700 delay-500"
          style={{ transform: visible ? 'translateY(0)' : 'translateY(20px)', opacity: visible ? 1 : 0 }}
        >
          <p className="text-slate-400 text-sm mb-5">
            Cần tư vấn chi tiết? Đội ngũ kỹ sư CTC sẵn sàng hỗ trợ 24/7
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-105 hover:shadow-sky-500/30 hover:shadow-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(2,132,199,0.9) 0%, rgba(3,105,161,0.9) 100%)', border: '1px solid rgba(56,189,248,0.4)' }}
          >
            Nhận tư vấn miễn phí <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SolutionsOverview;
