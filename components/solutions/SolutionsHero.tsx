import React from 'react';
import { Sun, Wind, Radio, Zap, Building2, Server, ArrowRight, Trophy, Globe, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const SolutionsHero: React.FC = () => {
  const stats = [
    { icon: <Trophy size={18} />, val: '500+', label: 'Công trình' },
    { icon: <Briefcase size={18} />, val: '32+', label: 'Năm kinh nghiệm' },
    { icon: <Globe size={18} />, val: '6+', label: 'Lĩnh vực' },
    { icon: <Zap size={18} />, val: '53+', label: 'Kỹ sư chủ chốt' },
  ];

  const sectors = [
    { icon: <Radio size={16} />, label: 'Viễn thông' },
    { icon: <Sun size={16} />, label: 'Solar EPC' },
    { icon: <Wind size={16} />, label: 'Wind EPC' },
    { icon: <Zap size={16} />, label: 'Điện lực' },
    { icon: <Server size={16} />, label: 'Data Center' },
    { icon: <Building2 size={16} />, label: 'Xây dựng' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Hero – same visual language as Home Hero ── */
        .sol-hero {
          position: relative;
          width: 100%;
          min-height: 92vh;
          overflow: hidden;
          background-color: #060d1d;
          display: flex;
          align-items: center;
          padding-top: 120px;
          font-family: 'Montserrat', 'Be Vietnam Pro', sans-serif;
        }

        /* Blueprint grid */
        .sol-hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 80px 80px;
          z-index: 3; pointer-events: none;
        }

        /* Gradient overlays */
        .sol-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom,
            rgba(6,13,29,0.25) 0%,
            rgba(6,13,29,0.6) 60%,
            #060d1d 100%);
          z-index: 2;
        }

        /* Glow auras */
        .sol-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 2; pointer-events: none;
        }

        /* Badge */
        .sol-badge {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          padding: 10px 24px;
          font-size: 0.75rem; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: #e2e8f0;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.4);
          animation: solHeroEntrance 1.2s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* Typography */
        .sol-title-outline {
          font-size: clamp(0.9rem, 2.2vw, 1.2rem);
          font-weight: 600;
          letter-spacing: 7px;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          animation: solSlideUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .sol-title-white {
          display: block;
          font-size: clamp(2rem, 5vw, 3.8rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -1.5px;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 10px 30px rgba(0,0,0,0.4);
          animation: solSlideUp 1.5s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }
        .sol-title-gradient {
          display: block;
          font-size: clamp(2rem, 5vw, 3.8rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -1.5px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #38bdf8 0%, #0284c7 60%, #1e40af 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 10px 20px rgba(14,165,233,0.3));
          animation: solSlideUp 1.5s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }

        /* Dashboard card */
        .sol-dashboard {
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.5),
                      inset 0 1px 1px rgba(255,255,255,0.05);
          animation: solSlideRight 1.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .sol-dashboard::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent);
        }

        /* Stat rows */
        .sol-stat-row {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 14px;
          padding: 14px;
          transition: all 0.3s ease;
        }
        .sol-stat-row:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(56,189,248,0.2);
          transform: translateX(4px);
        }

        /* Sector chips ticker */
        .sol-sector-track {
          display: flex; gap: 10px; overflow: hidden;
          mask-image: linear-gradient(to right, transparent, white 8%, white 92%, transparent);
        }
        .sol-sector-items {
          display: inline-flex; gap: 10px; white-space: nowrap;
          animation: solTicker 16s linear infinite;
        }
        @keyframes solTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Keyframes */
        @keyframes solHeroEntrance {
          from { opacity: 0; transform: scale(0.88) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes solSlideUp {
          from { opacity: 0; transform: translateY(28px); filter: blur(10px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes solSlideRight {
          from { opacity: 0; transform: translateX(50px); filter: blur(10px); }
          to   { opacity: 1; transform: translateX(0);    filter: blur(0); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .sol-hero { min-height: auto; padding: 120px 0 60px; }
          .sol-layout { grid-template-columns: 1fr !important; }
        }
      `}} />

      <div className="sol-hero">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1920&auto=format&fit=crop"
          alt="CTC Solutions"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.5, zIndex: 1 }}
        />

        <div className="sol-hero-overlay" />
        <div className="sol-hero-grid" />

        {/* Glow auras */}
        <div className="sol-glow" style={{ width: 700, height: 700, top: '-15%', left: '-8%', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)' }} />
        <div className="sol-glow" style={{ width: 500, height: 500, bottom: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 py-12">
          <div className="sol-layout grid gap-16 lg:gap-20" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>

            {/* ── Left: Typographic core ── */}
            <div className="flex flex-col items-start">
              {/* Badge */}
              <div className="sol-badge mb-7">
                <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 0 4px rgba(52,211,153,0.25)' }} />
                Giải pháp EPC toàn diện – CTC
              </div>

              {/* Title */}
              <div className="mb-2 sol-title-outline">GIẢI PHÁP KỸ THUẬT</div>
              <div className="mb-6">
                <span className="sol-title-white">CTC – TỔNG THẦU</span>
                <span className="sol-title-gradient">EPC CHUYÊN NGHIỆP</span>
              </div>

              {/* Description bar */}
              <div className="border-l-2 border-sky-500/30 pl-5 mb-9" style={{ animation: 'solSlideUp 1.5s 0.35s both' }}>
                <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
                  <strong className="text-white">32+ năm kinh nghiệm</strong> – CTC cung cấp dịch vụ khép kín từ
                  <em className="text-sky-300"> Tư vấn → Thiết kế → Thi công → O&M</em> cho toàn bộ lĩnh vực
                  hạ tầng viễn thông, năng lượng tái tạo và xây dựng kỹ thuật.
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4 mb-10" style={{ animation: 'solSlideUp 1.5s 0.45s both' }}>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(2,132,199,0.9) 0%, rgba(3,105,161,0.9) 100%)',
                    border: '1px solid rgba(56,189,248,0.4)',
                    boxShadow: '0 12px 30px -10px rgba(14,165,233,0.45)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  Nhận tư vấn <ArrowRight size={16} />
                </Link>
                <a
                  href="tel:0915059666"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  0915 059 666
                </a>
              </div>

              {/* Sector ticker */}
              <div style={{ animation: 'solSlideUp 1.5s 0.5s both', width: '100%' }}>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">
                  LĨNH VỰC HOẠT ĐỘNG
                </div>
                <div className="sol-sector-track">
                  <div className="sol-sector-items">
                    {[...sectors, ...sectors].map((s, i) => (
                      <div key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-bold whitespace-nowrap">
                        <span className="text-sky-400">{s.icon}</span>
                        {s.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Dashboard ── */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="sol-dashboard w-full max-w-[400px] relative">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-white/8 pb-5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/20 flex items-center justify-center text-sky-400">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-sky-400">NĂNG LỰC DOANH NGHIỆP</div>
                    <div className="text-sm font-bold text-slate-400">CTC – Dữ liệu cập nhật 2025</div>
                  </div>
                </div>

                {/* Stat rows */}
                <div className="flex flex-col gap-3">
                  {stats.map((s, i) => (
                    <div key={i} className="sol-stat-row">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400 flex-shrink-0">
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-xl font-black text-white">{s.val}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clients strip */}
                <div className="mt-5 pt-4 border-t border-white/8">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">KHÁCH HÀNG CHIẾN LƯỢC</div>
                  <div className="flex flex-wrap gap-2">
                    {['Bộ Công an', 'Mobifone', 'VNPT Net', 'Dongfang Electric'].map((c, i) => (
                      <span key={i} className="px-3 py-1 text-[10px] font-bold text-slate-400 border border-white/8 rounded-full bg-white/3">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolutionsHero;
