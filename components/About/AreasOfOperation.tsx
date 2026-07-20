import React, { useState, useRef } from 'react';
import { Radio, Server, Sun, Wind, Building2, Wrench, ArrowRight, Check } from 'lucide-react';
import { useInView } from '../../hooks/useInView';

/* ── Data ────────────────────────────────────────────── */
const SECTORS = [
  {
    id: 'telecom',
    index: '01',
    icon: Radio,
    label: 'Viễn thông',
    accentColor: '#0ea5e9',
    gradFrom: '#0ea5e9',
    gradTo: '#6366f1',
    title: 'Viễn thông &\nHạ tầng mạng',
    titleEn: 'TELECOMMUNICATIONS',
    summary:
      'Thiết kế, xây dựng và vận hành toàn bộ hạ tầng truyền dẫn, mạng cáp quang, trạm BTS, hầm cáp và OSP từ quy mô đô thị đến toàn quốc.',
    stat: '500+',
    statLabel: 'công trình viễn thông',
    tags: ['Cáp quang', 'BTS / Anten', 'OSP / ISP', 'Hầm cáp', 'Truyền dẫn', 'Tổng đài'],
    projects: [
      'Tuyến cáp quang Bộ Công an',
      'Metro Mobifone toàn quốc',
      'Hạ tầng OSP / VNPT Net',
      'Hệ thống trạm BTS chuyên biệt',
    ],
  },
  {
    id: 'it',
    index: '02',
    icon: Server,
    label: 'CNTT & Data Center',
    accentColor: '#8b5cf6',
    gradFrom: '#8b5cf6',
    gradTo: '#ec4899',
    title: 'Công nghệ thông tin\n& Data Center',
    titleEn: 'IT & DATA CENTER',
    summary:
      'Triển khai hạ tầng CNTT toàn diện: Data Center tiêu chuẩn quốc tế, Camera AI giám sát, hệ thống mạng doanh nghiệp và giải pháp chuyển đổi số.',
    stat: 'Tier III',
    statLabel: 'tiêu chuẩn Data Center',
    tags: ['Data Center', 'Camera AI', 'Network / Server', 'Bảo mật CNTT', 'Chuyển đổi số', 'Cloud'],
    projects: [
      'Trạm BTS & Data Center tiêu chuẩn',
      'Hệ thống Camera AI an ninh',
      'Hạ tầng mạng doanh nghiệp',
      'Giải pháp chuyển đổi số Cloud',
    ],
  },
  {
    id: 'solar',
    index: '03',
    icon: Sun,
    label: 'Điện mặt trời',
    accentColor: '#f59e0b',
    gradFrom: '#f59e0b',
    gradTo: '#ef4444',
    title: 'Điện mặt trời\nSolar EPC',
    titleEn: 'SOLAR POWER',
    summary:
      'Tổng thầu EPC toàn trình: khảo sát, thiết kế, cung cấp thiết bị chính hãng, thi công và vận hành bảo trì (O&M) cho mọi quy mô dự án Solar.',
    stat: 'EPC',
    statLabel: 'trọn gói đến O&M',
    tags: ['Rooftop Solar', 'C&I Solar', 'Industrial Solar', 'Telecom Solar', 'EPC Solar', 'O&M Solar'],
    projects: [
      'EPC Solar áp mái hộ gia đình & C&I',
      'Điện mặt trời Telecom (off-grid)',
      'Hệ thống Solar công nghiệp',
      'Dịch vụ O&M định kỳ & sửa chữa',
    ],
  },
  {
    id: 'wind',
    index: '04',
    icon: Wind,
    label: 'Điện gió',
    accentColor: '#10b981',
    gradFrom: '#10b981',
    gradTo: '#0ea5e9',
    title: 'Điện gió\nWind EPC',
    titleEn: 'WIND POWER',
    summary:
      'Tổng thầu EPC nhà máy điện gió: cột đo gió, đường dây truyền tải, trạm biến áp nội bộ, lắp đặt turbine và vận hành bảo trì dài hạn.',
    stat: '3',
    statLabel: 'nhà máy điện gió lớn',
    tags: ['Wind Farm EPC', 'Wind Mast', 'Trạm biến áp', 'Đường dây 110kV', 'EPC Wind', 'O&M Wind'],
    projects: [
      'Nhà máy điện gió Hướng Hiệp (Quảng Trị)',
      'Điện gió Hướng Linh & Hướng Linh 4',
      'Trụ đo gió Điện Biên',
      'Đường dây & trạm biến áp Wind Farm',
    ],
  },
  {
    id: 'construction',
    index: '05',
    icon: Building2,
    label: 'Xây dựng kỹ thuật',
    accentColor: '#3b82f6',
    gradFrom: '#3b82f6',
    gradTo: '#10b981',
    title: 'Xây dựng kỹ thuật\n& Hạ tầng',
    titleEn: 'TECHNICAL CONSTRUCTION',
    summary:
      'Thi công công trình dân dụng, công nghiệp, giao thông; xây lắp đường dây tải điện và trạm biến áp; hạ tầng đô thị và công trình quốc phòng.',
    stat: '110kV',
    statLabel: 'năng lực trạm biến áp',
    tags: ['Dân dụng', 'Công nghiệp', 'Giao thông', 'Đường dây điện', 'Trạm biến áp', 'Quốc phòng'],
    projects: [
      'Trạm biến áp 110kV',
      'Hạ tầng kỹ thuật đô thị',
      'Công trình quốc phòng A70',
      'Hệ thống nguồn điện dự phòng',
    ],
  },
  {
    id: 'services',
    index: '06',
    icon: Wrench,
    label: 'Dịch vụ kỹ thuật',
    accentColor: '#f43f5e',
    gradFrom: '#f43f5e',
    gradTo: '#f59e0b',
    title: 'Dịch vụ kỹ thuật\n& Tư vấn EPC',
    titleEn: 'TECHNICAL SERVICES',
    summary:
      'Cung cấp dịch vụ khép kín: tư vấn đầu tư, khảo sát, thiết kế bản vẽ, giám sát thi công, nghiệm thu và hợp đồng bảo trì O&M dài hạn.',
    stat: '53+',
    statLabel: 'kỹ sư chứng chỉ hành nghề',
    tags: ['EPC Tổng thầu', 'Tư vấn thiết kế', 'Khảo sát', 'Giám sát', 'Bảo trì O&M', 'Nghiệm thu'],
    projects: [
      'Tư vấn đầu tư dự án năng lượng',
      'Khảo sát & thiết kế hạ tầng',
      'Giám sát thi công độc lập',
      'Hợp đồng bảo trì O&M dài hạn',
    ],
  },
];

/* ── Component ──────────────────────────────────────── */
const AreasOfOperation: React.FC = () => {
  const { ref, isInView } = useInView(0.05);
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSelect = (idx: number) => {
    if (idx === active || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setAnimating(false);
    }, 200);
  };

  const s = SECTORS[active];
  const Icon = s.icon;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-slate-50 dark:bg-[#060d1d] transition-colors duration-300"
    >
      {/* Blueprint grid lines – matches the rest of the site */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        .dark .ao-grid-lines {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        }
        .ao-sidebar-item {
          position: relative;
          cursor: pointer;
          transition: all 0.25s ease;
          border-left: 2px solid transparent;
        }
        .ao-sidebar-item:hover {
          background: rgba(14,165,233,0.05);
        }
        .ao-sidebar-item.is-active {
          border-left-color: var(--accent);
          background: rgba(14,165,233,0.07);
        }
        .dark .ao-sidebar-item:hover  { background: rgba(255,255,255,0.04); }
        .dark .ao-sidebar-item.is-active { background: rgba(255,255,255,0.06); }
        .ao-sidebar-item.is-active .ao-index { color: var(--accent); }
        .ao-content-enter {
          animation: aoSlideUp 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes aoSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ao-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 13px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: 1px solid;
          transition: all 0.22s;
        }
        .ao-tag:hover { transform: translateY(-1px); }
        .ao-project-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 13px 0;
          border-bottom: 1px solid;
          transition: all 0.2s;
        }
        .ao-project-row:last-child { border-bottom: none !important; }
        .ao-proj-arrow { opacity: 0; transition: all 0.2s; flex-shrink: 0; }
        .ao-project-row:hover .ao-proj-arrow { opacity: 1; transform: translateX(3px); }
      `}} />
      <div className="absolute inset-0 ao-grid-lines pointer-events-none z-0 opacity-40" />

      {/* Soft glow auras matching site palette */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none z-0 opacity-20 transition-all duration-700"
        style={{ background: `radial-gradient(circle, ${s.accentColor}, transparent 70%)` }}
      />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none z-0" />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className={`relative z-10 px-8 lg:px-16 pt-20 pb-10 border-b border-slate-200/70 dark:border-white/[0.07] transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-slate-400 dark:to-white/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-white/40">Lĩnh vực hoạt động</span>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Hoạt Động{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${s.accentColor}, ${s.gradTo})`, transition: 'background-image 0.5s' }}
              >
                Kinh Doanh
              </span>
            </h2>
          </div>
          <p className="text-slate-500 dark:text-white/40 text-sm leading-relaxed max-w-sm font-light lg:text-right">
            Giải pháp khép kín từ Tư vấn → Thiết kế → Thi công → Vận hành → Bảo trì trên{' '}
            <span className="text-slate-700 dark:text-white/70 font-semibold">6 lĩnh vực chiến lược</span>.
          </p>
        </div>
      </div>

      {/* ── Main Body ──────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row min-h-[540px]">

          {/* ── LEFT SIDEBAR ── */}
          <div className={`lg:w-[260px] xl:w-[300px] flex-shrink-0 border-r border-slate-200/70 dark:border-white/[0.07] py-10 pr-6 transition-all duration-1000 delay-100 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="space-y-0.5">
              {SECTORS.map((sec, i) => {
                const SIcon = sec.icon;
                const isAct = i === active;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleSelect(i)}
                    className={`ao-sidebar-item w-full text-left px-4 py-3.5 rounded-r-xl ${isAct ? 'is-active' : ''}`}
                    style={{ '--accent': sec.accentColor } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3">
                      <span className="ao-index text-[11px] font-black tracking-widest text-slate-300 dark:text-white/25 font-mono w-6 flex-shrink-0 transition-colors duration-300">
                        {sec.index}
                      </span>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={isAct
                          ? { background: `linear-gradient(135deg, ${sec.gradFrom}, ${sec.gradTo})`, boxShadow: `0 4px 14px ${sec.accentColor}44` }
                          : { background: 'rgba(148,163,184,0.12)' }
                        }
                      >
                        <SIcon size={13} style={{ color: isAct ? '#fff' : '#94a3b8' }} />
                      </div>
                      <span
                        className="text-sm font-bold transition-colors duration-300 leading-tight"
                        style={{ color: isAct ? '#0f172a' : '#64748b' }}
                      >
                        <span className="dark:hidden">{sec.label}</span>
                        <span
                          className="hidden dark:inline"
                          style={{ color: isAct ? '#f1f5f9' : 'rgba(255,255,255,0.4)' }}
                        >
                          {sec.label}
                        </span>
                      </span>
                      {isAct && (
                        <ArrowRight size={12} className="ml-auto flex-shrink-0 text-slate-400 dark:text-white/30" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* EPC Steps */}
            <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-white/[0.07] px-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/25 font-black mb-3">Quy trình EPC khép kín</p>
              <div className="flex flex-col gap-2">
                {['Tư vấn', 'Thiết kế', 'Thi công', 'Vận hành', 'Bảo trì O&M'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[9px] font-black text-slate-400 dark:text-white/30">
                      {i + 1}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-white/35 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT CONTENT ── */}
          <div
            ref={contentRef}
            className={`flex-1 py-10 lg:pl-12 flex flex-col transition-all duration-1000 delay-200 ${isInView ? 'opacity-100' : 'opacity-0'}`}
          >
            <div key={active} className="ao-content-enter h-full flex flex-col">

              {/* Sector header */}
              <div className="mb-8">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.3em] mb-3"
                  style={{ color: s.accentColor }}
                >
                  {s.titleEn}
                </p>
                <h3
                  className="text-3xl md:text-4xl xl:text-[2.6rem] font-black text-slate-900 dark:text-white tracking-tight leading-tight whitespace-pre-line mb-4"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {s.title}
                </h3>
                <p className="text-slate-500 dark:text-white/50 text-base leading-relaxed font-light max-w-2xl">
                  {s.summary}
                </p>
              </div>

              {/* Grid: stat + tags | projects */}
              <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 flex-1">

                {/* LEFT: Stat + Tags */}
                <div className="flex flex-col gap-5">
                  {/* Accent stat card */}
                  <div
                    className="rounded-2xl p-6 border relative overflow-hidden"
                    style={{
                      borderColor: `${s.accentColor}30`,
                      background: `linear-gradient(135deg, ${s.accentColor}0d, ${s.gradTo}06)`,
                    }}
                  >
                    <div
                      className="bg-clip-text text-transparent font-black leading-none"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${s.accentColor}, ${s.gradTo})`,
                        fontSize: 'clamp(52px, 7vw, 80px)',
                        fontFamily: "'Montserrat', sans-serif",
                        letterSpacing: '-3px',
                      }}
                    >
                      <AnimatedNumber valueStr={s.stat} isInView={isInView} />
                    </div>
                    <p className="text-slate-500 dark:text-white/45 text-sm font-semibold mt-1.5 uppercase tracking-wide">{s.statLabel}</p>
                    <div
                      className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-30"
                      style={{ background: s.accentColor }}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/25 font-black mb-2.5">Phạm vi dịch vụ</p>
                    <div className="flex flex-wrap gap-2">
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          className="ao-tag text-slate-600 dark:text-white/55"
                          style={{
                            borderColor: `${s.accentColor}30`,
                            backgroundColor: `${s.accentColor}08`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Projects */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/25 font-black mb-1">Dự án tiêu biểu</p>
                  <div>
                    {s.projects.map((proj, i) => (
                      <div
                        key={proj}
                        className="ao-project-row group"
                        style={{ borderColor: 'rgba(148,163,184,0.15)' }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black"
                          style={{
                            background: `${s.accentColor}15`,
                            color: s.accentColor,
                            border: `1px solid ${s.accentColor}30`,
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <span className="ao-proj-text text-slate-600 dark:text-white/55 text-sm leading-snug font-light flex-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
                          {proj}
                        </span>
                        <ArrowRight size={14} className="ao-proj-arrow text-slate-400 dark:text-white/30 mt-0.5" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-white/[0.07]">
                    <div className="flex items-center gap-4 flex-wrap">
                      {['ISO Certified', 'BXD Hạng cao', 'On-time Delivery'].map((badge) => (
                        <span key={badge} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-white/35">
                          <Check size={11} className="text-emerald-500" />
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Stats Bar ─────────────────────────────── */}
      <div className={`relative z-10 border-t border-slate-200/70 dark:border-white/[0.07] transition-all duration-1000 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-8 lg:px-16 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-200/70 dark:divide-white/[0.07]">
          {[
            { val: '6+', sub: 'Lĩnh vực chiến lược' },
            { val: '500+', sub: 'Công trình hoàn thành' },
            { val: '53+', sub: 'Kỹ sư chuyên môn' },
            { val: '288+', sub: 'Tỷ doanh thu 2025' },
          ].map((st) => (
            <div key={st.sub} className="py-8 px-6 text-center group hover:bg-slate-100/60 dark:hover:bg-white/[0.03] transition-colors duration-300">
              <div
                className="text-3xl md:text-4xl font-black mb-1 bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${s.accentColor}, ${s.gradTo})` }}
              >
                <AnimatedNumber valueStr={st.val} isInView={isInView} />
              </div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-white/30 font-bold">{st.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AnimatedNumber: React.FC<{ valueStr: string; isInView: boolean }> = ({ valueStr, isInView }) => {
  const [count, setCount] = React.useState(0);
  
  const match = valueStr.match(/(\d+)(.*)/);
  const targetNum = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : valueStr;

  React.useEffect(() => {
    if (!isInView) {
      setCount(0);
      return;
    }
    
    if (targetNum === 0) return;
    
    let startTimestamp: number | null = null;
    let animationFrameId: number | null = null;
    const duration = 2000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeOut * targetNum));
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(targetNum);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, targetNum]);

  if (!match) return <>{valueStr}</>;

  return (
    <>
      {count}{suffix}
    </>
  );
};

export default AreasOfOperation;
