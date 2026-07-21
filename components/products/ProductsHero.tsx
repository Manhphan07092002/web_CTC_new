import React from 'react';

const ProductsHero: React.FC = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Compact Products Header Banner ── */
        .prod-hero {
          position: relative;
          width: 100%;
          overflow: hidden;
          background-color: #060d1d;
          display: flex;
          align-items: center;
          padding-top: 140px;
          padding-bottom: 50px;
          font-family: 'Montserrat', 'Be Vietnam Pro', sans-serif;
        }

        /* Blueprint grid */
        .prod-hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 3; pointer-events: none;
        }

        /* Gradient overlays */
        .prod-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom,
            rgba(6,13,29,0.4) 0%,
            rgba(6,13,29,0.75) 70%,
            #060d1d 100%);
          z-index: 2;
        }

        /* Glow aurus */
        .prod-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          z-index: 2; pointer-events: none;
        }

        /* Badge style */
        .prod-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #94a3b8;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        /* Typography spacing */
        .prod-title {
          font-size: clamp(1.6rem, 3.5vw, 2.5rem);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.5px;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        .prod-subtitle {
          font-size: clamp(0.85rem, 1.8vw, 0.95rem);
          font-weight: 300;
          line-height: 1.6;
          color: #94a3b8;
        }
      `}} />

      <div className="prod-hero">
        {/* Low-profile background image */}
        <img
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1920&auto=format&fit=crop"
          alt="CTC Products Banner"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.2, zIndex: 1 }}
        />

        <div className="prod-hero-overlay" />
        <div className="prod-hero-grid" />

        {/* Soft center glow */}
        <div className="prod-glow" style={{ width: 450, height: 450, top: '10%', left: '30%', background: 'radial-gradient(circle, rgba(2,132,199,0.08) 0%, transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="prod-badge mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Thiết bị chính hãng – Tiêu chuẩn Quốc tế
            </div>

            {/* Title */}
            <h1 className="prod-title mb-3">
              Vật tư & Thiết bị năng lượng
            </h1>

            {/* Simple description */}
            <p className="prod-subtitle">
              CTC chuyên phân phối các dòng vật tư, thiết bị điện mặt trời chính hãng Tier 1 (Canadian Solar, Longi, Huawei, SMA...) với chứng nhận CO/CQ đầy đủ và cam kết chất lượng, bảo hành hiệu suất lâu dài từ nhà sản xuất.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsHero;
