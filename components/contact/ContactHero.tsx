import React from 'react';
import companyProfile from '../../constants/company_profile.json';

const ContactHero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-br from-corporate via-[#0f2447] to-[#071328] text-white overflow-hidden">
      {/* Background Decorative Mesh & Light Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs md:text-sm font-semibold text-amber-300 border border-white/15 mb-6 shadow-xl">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span>{companyProfile.slogan.vi}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-6 drop-shadow-md">
            Liên Hệ <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">{companyProfile.company_name.short}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-200/90 font-normal leading-relaxed max-w-3xl mx-auto mb-10">
            {companyProfile.company_name.vi} (MST: {companyProfile.tax_code}) - Đại diện pháp luật: {companyProfile.representative} (Tổng Giám Đốc).
          </p>

          {/* Stats Ticker Grid - From Official Company Profile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-xl md:text-2xl font-black text-amber-400">{companyProfile.hero_statistics.experience_years} năm</div>
              <div className="text-[11px] md:text-xs text-gray-300 font-medium">Kinh Nghiệm (từ {companyProfile.establishment_year})</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-xl md:text-2xl font-black text-amber-400">{companyProfile.hero_statistics.revenue_2025}</div>
              <div className="text-[11px] md:text-xs text-gray-300 font-medium">Doanh Thu Năm 2025</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-xl md:text-2xl font-black text-amber-400">{companyProfile.hero_statistics.key_technical_officers}</div>
              <div className="text-[11px] md:text-xs text-gray-300 font-medium">Kỹ Sư Chủ Chốt</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-xl md:text-2xl font-black text-amber-400">{companyProfile.hero_statistics.similar_projects}</div>
              <div className="text-[11px] md:text-xs text-gray-300 font-medium">Công Trình Đã Thực Hiện</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactHero;
