import React, { useState } from 'react';
import { FileText, TrendingUp, Handshake, Download, X, Check, ArrowRight, Eye, ShieldCheck, ChevronRight, BarChart3, Building2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// Load company profile data
import companyProfile from '../../constants/company_profile.json';

export const Features: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'hsnl' | 'bctc' | 'lvhd'>('hsnl');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const isEn = language === 'en';
  const closeActiveModal = () => setActiveModal(null);

  const currentLang = language as keyof typeof companyProfile.intro;

  // Data mapping for tabs
  const tabData = {
    hsnl: {
      id: 'hsnl',
      title: isEn ? "Company Profile" : "Hồ Sơ Năng Lực",
      subtitle: isEn ? "Credentials & Capacity" : "Năng lực & Pháp lý",
      color: "from-blue-500 to-sky-600",
      accentColor: "sky",
      icon: FileText,
      tag: "CTC-PROFILE-2024",
      desc: isEn 
        ? "Comprehensive review of CTC legal credentials, capital, engineering staff, and machinery capacities." 
        : "Tổng hợp toàn diện về năng lực pháp lý, tài chính, đội ngũ nhân sự kỹ thuật cao và trang thiết bị thi công hiện đại của công ty.",
      details: [
        isEn ? "Full legal credentials & construction licenses Class I" : "Đầy đủ chứng chỉ hành nghề và năng lực xây dựng Hạng I của Bộ Xây dựng.",
        isEn ? "Detailed engineer lists with 53+ technical officers" : "Đội ngũ nhân sự chuyên môn vững vàng với hơn 53+ kỹ sư, chỉ huy trưởng.",
        isEn ? "Proven track record of major national industrial projects" : "Danh mục máy móc đo đạc, thi công chuyên biệt hiện đại nhập khẩu.",
        isEn ? "Strategic partner of VNPT, Mobifone, Viettel, etc." : "Đối tác tin cậy của các tập đoàn Viễn thông, Công nghệ & Năng lượng lớn."
      ],
      stats: [
        { value: "53+", label: isEn ? "Engineers" : "Kỹ Sư & Cán Bộ" },
        { value: "22+", label: isEn ? "Years Exp" : "Năm Kinh Nghiệm" }
      ],
      btnText: isEn ? "View Complete Profile" : "Xem Hồ Sơ Năng Lực",
      downloadText: isEn ? "Download docx" : "Tải về bản DOCX",
      modalId: 'hsnl'
    },
    bctc: {
      id: 'bctc',
      title: isEn ? "Financial Statements" : "Báo Cáo Tài Chính",
      subtitle: isEn ? "Transparency & Assets" : "Minh bạch & Tăng trưởng",
      color: "from-indigo-500 to-purple-600",
      accentColor: "purple",
      icon: TrendingUp,
      tag: "CTC-FINANCE-2024",
      desc: isEn 
        ? "Audited financial declarations showing CTC financial strength, total assets, and tax duties compliance." 
        : "Công bố chi tiết tình hình tài chính thường niên đã qua kiểm toán, thể hiện quy mô tài sản và tính minh bạch của doanh nghiệp.",
      details: [
        isEn ? "Independent audited reports ensuring transparency" : "Báo cáo kiểm toán độc lập thường niên khách quan, chính xác.",
        isEn ? "Robust asset base with over 181+ Billion VNĐ" : "Tổng quy mô tài sản vững chắc đạt trên 181+ tỷ VNĐ.",
        isEn ? "Full compliance with state tax and social duties" : "Hoàn thành 100% nghĩa vụ nộp thuế nhà nước (Có giấy xác nhận).",
        isEn ? "Optimal capital efficiency and sustainable profit growth" : "Cơ cấu nguồn vốn an toàn, tỷ lệ nợ phải trả luôn trong tầm kiểm soát."
      ],
      stats: [
        { value: "181+ B", label: isEn ? "Total Assets" : "Tổng Tài Sản" },
        { value: "100%", label: isEn ? "Tax Cleared" : "Hoàn Thành Nghĩa Vụ" }
      ],
      btnText: isEn ? "View Financial Audit" : "Xem Kiểm Toán Tài Chính",
      downloadText: isEn ? "Download PDF Reports" : "Tải PDF Báo Cáo",
      modalId: 'bctc'
    },
    lvhd: {
      id: 'lvhd',
      title: isEn ? "Business Sectors" : "Lĩnh Vực Hoạt Động",
      subtitle: isEn ? "Core Operations" : "Ngành nghề cốt lõi",
      color: "from-pink-400 to-rose-500",
      accentColor: "pink",
      icon: Handshake,
      tag: "CTC-OPERATIONS-2026",
      desc: isEn 
        ? "Key focus on telecommunications infrastructure, digital solutions, and EPC industrial solar energy installations." 
        : "Tập trung thi công hạ tầng kỹ thuật viễn thông, tích hợp hệ thống số, mạng CNTT doanh nghiệp và năng lượng tái tạo.",
      details: [
        isEn ? "Telecom infrastructure (BTS tower, underground cabling)" : "Xây lắp và ngầm hóa hạ tầng viễn thông chuyên dụng (Trạm BTS, OSP).",
        isEn ? "Renewable energy (Solar EPC, rooftop solar systems)" : "Tổng thầu EPC hệ thống điện mặt trời mái nhà và công nghiệp quy mô lớn.",
        isEn ? "Technical mechanical electrical infrastructures (M&E)" : "Thi công hệ thống điện chiếu sáng, cơ điện nhà xưởng M&E.",
        isEn ? "System integration and customized enterprise software" : "Tích hợp thiết bị tin học, phòng họp thông minh, phần mềm bản quyền."
      ],
      stats: [
        { value: "5+", label: isEn ? "Core Pillars" : "Ngành Cốt Lõi" },
        { value: "EPC", label: isEn ? "Turnkey Delivery" : "Tổng Thầu EPC" }
      ],
      btnText: isEn ? "Explore Business Sectors" : "Khám Phá Chi Tiết Lĩnh Vực",
      downloadText: isEn ? "View Portfolio" : "Xem Danh Mục Dự Án",
      modalId: 'lvhd'
    }
  };

  const activeTabInfo = tabData[activeTab];

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-slate-50 dark:bg-[#060d1d] transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        .feature-blueprint-lines {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
            background-size: 80px 80px;
            z-index: 1;
            opacity: 0.5;
            pointer-events: none;
        }
        .dark .feature-blueprint-lines {
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }

        .feature-aura-glow {
            position: absolute;
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, transparent 70%);
            filter: blur(90px);
            z-index: 1;
            pointer-events: none;
        }
        .dark .feature-aura-glow {
            background: radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 70%);
        }
        .f-aura-1 { top: -20%; left: -10%; }
        .f-aura-2 { bottom: -20%; right: -10%; }

        /* Interactive tab switcher styling - ultra premium glassy metallic frost */
        .feature-interactive-tab {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(225, 235, 250, 0.65) 100%);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-left: 4px solid transparent;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.8);
        }
        .dark .feature-interactive-tab {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.6) 100%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-left: 4px solid transparent;
            box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        
        .feature-interactive-tab:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(225, 235, 250, 0.8) 100%);
            transform: translateX(4px);
            box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9);
        }
        .dark .feature-interactive-tab:hover {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%);
            transform: translateX(4px);
        }

        .feature-interactive-tab.active-hsnl {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(219, 234, 254, 0.8) 100%);
            border-color: rgba(59, 130, 246, 0.45);
            border-left: 4px solid #3b82f6;
            box-shadow: 0 15px 30px -10px rgba(59, 130, 246, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9);
            transform: translateX(8px);
        }
        .dark .feature-interactive-tab.active-hsnl {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%);
            border-color: rgba(59, 130, 246, 0.4);
            border-left: 4px solid #3b82f6;
            box-shadow: 0 15px 30px -10px rgba(59, 130, 246, 0.25);
            transform: translateX(8px);
        }
        
        .feature-interactive-tab.active-bctc {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(243, 232, 255, 0.8) 100%);
            border-color: rgba(139, 92, 246, 0.45);
            border-left: 4px solid #8b5cf6;
            box-shadow: 0 15px 30px -10px rgba(139, 92, 246, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9);
            transform: translateX(8px);
        }
        .dark .feature-interactive-tab.active-bctc {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%);
            border-color: rgba(139, 92, 246, 0.4);
            border-left: 4px solid #8b5cf6;
            box-shadow: 0 15px 30px -10px rgba(139, 92, 246, 0.25);
            transform: translateX(8px);
        }
        
        .feature-interactive-tab.active-lvhd {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 242, 248, 0.8) 100%);
            border-color: rgba(236, 72, 153, 0.45);
            border-left: 4px solid #ec4899;
            box-shadow: 0 15px 30px -10px rgba(236, 72, 153, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9);
            transform: translateX(8px);
        }
        .dark .feature-interactive-tab.active-lvhd {
            background: linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%);
            border-color: rgba(236, 72, 153, 0.4);
            border-left: 4px solid #ec4899;
            box-shadow: 0 15px 30px -10px rgba(236, 72, 153, 0.25);
            transform: translateX(8px);
        }

        .feature-display-panel {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(225, 235, 250, 0.65) 100%);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.75);
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dark .feature-display-panel {
            background: linear-gradient(135deg, rgba(6, 13, 29, 0.55) 0%, rgba(15, 23, 42, 0.4) 100%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.02);
        }

        .cyber-grid-overlay {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(rgba(14, 165, 233, 0.06) 1px, transparent 1px);
            background-size: 24px 24px;
            pointer-events: none;
        }

        .pulse-glow-icon::before {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            background: inherit;
            opacity: 0;
            z-index: -1;
            transition: all 0.4s ease;
        }
        .active-glow-icon::before {
            opacity: 0.2;
            animation: pulseIcon 2s infinite;
        }
        @keyframes pulseIcon {
            0% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.3); opacity: 0.05; }
            100% { transform: scale(1); opacity: 0.2; }
        }
      `}} />

      <div className="feature-blueprint-lines"></div>
      <div className="feature-aura-glow f-aura-1"></div>
      <div className="feature-aura-glow f-aura-2"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Header - High-tech dashboard title */}
        <div className="text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-sky-500/25 bg-sky-500/5 text-xs font-black tracking-widest text-sky-600 dark:text-sky-400 uppercase">
            {isEn ? "CTC COMMAND CENTER" : "TRUNG TÂM NĂNG LỰC CTC"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {isEn ? "Information & Capabilities Hub" : "Hồ sơ năng lực & Thông tin hoạt động"}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto rounded-full opacity-60"></div>
        </div>

        {/* 2-Column Immersive Command Center Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* LEFT: Tab Switchers */}
          <div className="w-full lg:w-5/12 flex flex-col gap-4 justify-between">
            {(Object.keys(tabData) as Array<keyof typeof tabData>).map((key) => {
              const item = tabData[key];
              const isActive = activeTab === key;
              const IconComponent = item.icon;

              return (
                <div
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`feature-interactive-tab p-5 sm:p-6 rounded-3xl cursor-pointer flex items-center gap-5 relative overflow-hidden select-none ${
                    isActive ? `active-${item.id}` : ""
                  }`}
                >
                  <div className="flex-shrink-0 relative">
                    <div className={`float-icon w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg relative z-10 ${
                      isActive ? "active-glow-icon" : ""
                    }`}>
                      <IconComponent size={24} />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {item.subtitle}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                      {item.title}
                    </h4>
                  </div>

                  <div className={`transition-all duration-300 flex-shrink-0 ${
                    isActive ? "text-slate-900 dark:text-white translate-x-1" : "text-slate-300 dark:text-slate-700"
                  }`}>
                    <ChevronRight size={20} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: High-tech Immersive Display Panel */}
          <div className="w-full lg:w-7/12 feature-display-panel rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between border min-h-[460px] lg:min-h-[480px]">
            {/* Cybergrid overlay background */}
            <div className="cyber-grid-overlay"></div>
            
            {/* Corner tech details */}
            <div className="absolute top-6 right-6 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/5 px-2.5 py-1 rounded-md">
              {activeTabInfo.tag}
            </div>

            {/* Content Body */}
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <span className="text-xs font-black text-sky-500 uppercase tracking-widest block">
                  {activeTabInfo.subtitle}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase">
                  {activeTabInfo.title}
                </h3>
                <div className="w-12 h-1 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full"></div>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {activeTabInfo.desc}
              </p>

              {/* Bullet details stack */}
              <div className="space-y-3">
                {activeTabInfo.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/40 dark:bg-slate-950/20 p-3 sm:p-3.5 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                    <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-tight">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Panel Actions & Metrics */}
            <div className="mt-8 pt-6 border-t border-slate-200/40 dark:border-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              
              {/* Mini Stats Widgets */}
              <div className="flex items-center gap-6">
                {activeTabInfo.stats.map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Glowing CTA Button */}
              <button
                onClick={() => setActiveModal(activeTabInfo.modalId)}
                className={`px-6 py-3.5 rounded-2xl bg-gradient-to-r ${activeTabInfo.color} hover:opacity-95 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group transition-all duration-300 active:scale-95`}
              >
                <span>{activeTabInfo.btnText}</span>
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* --- MODALS RENDER --- */}
      
      {/* Modal 1: HSNL */}
      {activeModal === 'hsnl' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300" onClick={closeActiveModal}></div>
          <div className="bg-white/75 dark:bg-[#060d1d]/70 backdrop-blur-2xl w-full max-w-md sm:max-w-xl lg:max-w-2xl rounded-3xl border border-white/50 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 animate-fade-in-up max-h-[90vh] flex flex-col transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 dark:border-slate-800/50 relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">{isEn ? "Company Profile" : "Hồ sơ năng lực"}</span>
              <button onClick={closeActiveModal} className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 p-2 rounded-full transition-all hover:rotate-90 duration-300">
                <X size={18} className="text-gray-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 space-y-6">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                {isEn 
                  ? "Our Company Profile provides a detailed and comprehensive look at CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS CONSTRUCTION JOINT-STOCK COMPANY (CTC). Here, partners and clients can find full details about:"
                  : "Hồ sơ năng lực của chúng tôi cung cấp một cái nhìn chi tiết và toàn diện về CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC). Tại đây, Quý đối tác và khách hàng có thể tìm thấy thông tin đầy đủ về:"}
              </p>
              <ul className="space-y-3">
                {[
                  isEn ? "Legal capacity: Business license, operation credentials, and government construction certificates." : "Năng lực pháp lý: Giấy phép kinh doanh, chứng chỉ năng lực xây dựng hạng do Bộ Xây dựng cấp.",
                  isEn ? "Financial capacity: Key statements demonstrating stable assets, capital, and robust performance." : "Năng lực tài chính: Các báo cáo tài chính tóm tắt, thể hiện sự ổn định và tiềm lực phát triển mạnh mẽ.",
                  isEn ? "Human resources: Experienced engineers, project managers, and technical officers." : "Năng lực nhân sự: Giới thiệu về đội ngũ quản lý, kỹ sư và chuyên gia có kinh nghiệm thực tế dồi dào.",
                  isEn ? "Equipment capacity: Modern facilities, specialized construction vehicles, and testing devices." : "Năng lực trang thiết bị: Cơ sở vật chất và các trang thiết bị hiện đại phục vụ cho hoạt động kinh doanh và thi công.",
                  isEn ? "Key Projects: Landmark references in telecom, data centers, solar arrays, and wind farms." : "Kinh nghiệm và Dự án tiêu biểu: Danh sách các công trình tiêu biểu, minh chứng cho năng lực thực tế của CTC."
                ].map((liText, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white/40 dark:bg-slate-950/20 p-3.5 rounded-xl border border-white/30 dark:border-white/5">
                    <Check size={18} className="text-sky-500 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{liText}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 border-t border-gray-100/50 dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-950/20 relative z-10 flex gap-4">
              <button onClick={closeActiveModal} className="flex-1 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all">
                {isEn ? "Close" : "Đóng"}
              </button>
              <a href="/file/HSNL 2024.docx" download="HoSoNangLuc_CTC_2024.docx" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold text-sm tracking-wider uppercase hover:shadow-lg hover:shadow-blue-500/20 transition-all text-center flex items-center justify-center gap-2">
                <Download size={16} /> {isEn ? "Download DOCX" : "Tải về HSNL"}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: BCTC */}
      {activeModal === 'bctc' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300" onClick={closeActiveModal}></div>
          <div className="bg-white/75 dark:bg-[#060d1d]/70 backdrop-blur-2xl w-full max-w-md sm:max-w-xl lg:max-w-2xl rounded-3xl border border-white/50 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 animate-fade-in-up max-h-[90vh] flex flex-col transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 dark:border-slate-800/50 relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">{isEn ? "Financial Statements" : "Báo cáo tài chính"}</span>
              <button onClick={closeActiveModal} className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 p-2 rounded-full transition-all hover:rotate-90 duration-300">
                <X size={18} className="text-gray-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 space-y-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                {isEn 
                  ? "Demonstrating transparency and accountability, CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS CONSTRUCTION JOINT-STOCK COMPANY (CTC) releases its annual financial statements. These records serve as concrete proof of our business growth, efficiency, and stable strategy."
                  : "Thể hiện trách nhiệm giải trình và cung cấp cái nhìn sâu sắc về sức khỏe tài chính, CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC) xin công bố các Báo cáo Tài chính thường niên. Các tài liệu này là minh chứng cho sự nỗ lực, hiệu quả hoạt động và chiến lược phát triển bền vững."}
              </p>
              
              <div className="space-y-4">
                {[
                  { year: '2025', file: 'BCTC 2025.pdf', desc: isEn ? "Summary of 2025 with strong expansion into industrial solar and transmission infrastructure." : "Tổng kết năm 2025 với những bước tiến vượt bậc, khẳng định vị thế vững chắc." },
                  { year: '2024', file: 'BCTC 2024.pdf', desc: isEn ? "Detailed annual report for 2024, demonstrating resilience and key target achievements." : "Tổng kết năm 2024 với những bước tiến vượt bậc, khẳng định vị thế vững vàng." },
                  { year: '2023', file: 'BCTC 2023.pdf', desc: isEn ? "Key metrics for 2023 showing OSP network stability and wind turbine projects startup." : "Phân tích kết quả kinh doanh năm 2023, làm cơ sở định hướng phát triển." },
                  { year: '2022', file: 'BCTC 2022.pdf', desc: isEn ? "Financial standing for fiscal year 2022, providing foundation for joint ventures." : "Cung cấp cái nhìn tổng quan về tình hình tài chính năm 2022, làm cơ sở đầu tư." },
                  { year: isEn ? 'Tax Confirmation' : 'Xác nhận nghĩa vụ thuế', file: 'Xác nhận không nợ thuế CTC đến 16-...pdf', desc: isEn ? "Official confirmation from Tax Office showing zero outstanding debt." : "Giấy xác nhận thực hiện nghĩa vụ thuế nhà nước, cập nhật mới nhất (Tháng 5/2025)." }
                ].map((report, idx) => (
                  <div key={idx} className="bg-white/40 dark:bg-slate-950/20 p-5 rounded-2xl border border-white/30 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base">
                        {report.year === 'Tax Confirmation' || report.year === 'Xác nhận nghĩa vụ thuế' ? report.year : (isEn ? `Financial Report ${report.year}` : `Báo cáo tài chính năm ${report.year}`)}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{report.desc}</p>
                    </div>
                    <a 
                      href={`/Tinh_Hinh_Tai_Chinh/${report.file}`} 
                      download={report.file}
                      className="bg-sky-500/10 dark:bg-sky-400/5 hover:bg-sky-500 dark:hover:bg-sky-400 hover:text-white text-sky-600 dark:text-sky-400 p-2.5 rounded-xl border border-sky-500/20 dark:border-sky-400/10 flex items-center justify-center gap-2 font-bold text-xs transition-all flex-shrink-0"
                    >
                      <Download size={14} /> {isEn ? "PDF" : "Tải PDF"}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100/50 dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-950/20 relative z-10">
              <button onClick={closeActiveModal} className="w-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all">
                {isEn ? "Close" : "Đóng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: LVHD */}
      {activeModal === 'lvhd' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300" onClick={closeActiveModal}></div>
          <div className="bg-white/75 dark:bg-[#060d1d]/70 backdrop-blur-2xl w-full max-w-md sm:max-w-xl lg:max-w-2xl rounded-3xl border border-white/50 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 animate-fade-in-up max-h-[90vh] flex flex-col transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 dark:border-slate-800/50 relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">{isEn ? "Business Sectors" : "Lĩnh vực hoạt động"}</span>
              <button onClick={closeActiveModal} className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 p-2 rounded-full transition-all hover:rotate-90 duration-300">
                <X size={18} className="text-gray-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 space-y-6">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                {isEn 
                  ? "CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS CONSTRUCTION JOINT-STOCK COMPANY (CTC) is proud of its multi-sectoral expertise, focusing on key industrial areas:"
                  : "CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC) tự hào hoạt động đa ngành, tập trung vào các lĩnh vực cốt lõi sau:"}
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    title: isEn ? "Technology Solutions & Products" : "Cung cấp giải pháp & sản phẩm công nghệ",
                    items: isEn 
                      ? ["IT hardware, servers, corporate storage networks.", "Telecommunications equipment and ISP networks.", "Professional audio-visual (AV) and video conference systems.", "Software licensing and customized applications."]
                      : ["Thiết bị tin học chuyên dụng, máy chủ, hệ thống lưu trữ.", "Thiết bị viễn thông, mạng truyền dẫn chuyên sâu.", "Hệ thống nghe nhìn (AV) chuyên nghiệp, phòng họp thông minh.", "Phần mềm bản quyền và các gói giải pháp doanh nghiệp."]
                  },
                  {
                    title: isEn ? "Infrastructure & Construction" : "Xây dựng hạ tầng & công trình",
                    items: isEn
                      ? ["Civil and industrial EPC building contracts.", "Telecom physical infrastructure (BTS stations, fiber OSP).", "Electrical lines and substation setups (M&E system)."]
                      : ["Thi công tổng thầu EPC dân dụng và công nghiệp.", "Hạ tầng kỹ thuật viễn thông (trạm thu phát BTS, cáp ngầm cáp treo).", "Xây dựng trạm biến áp, hệ thống cơ điện công trình M&E."]
                  },
                  {
                    title: isEn ? "Professional Services" : "Cung cấp dịch vụ hỗ trợ",
                    items: isEn
                      ? ["Technical consultation, detailed designs.", "System deployment, software setup, configuration.", "Operations and maintenance (O&M) contracts."]
                      : ["Tư vấn kỹ thuật chuyên sâu, khảo sát lập thiết kế kỹ thuật.", "Dịch vụ lắp đặt, đo kiểm, cấu hình nghiệm thu thiết bị.", "Hợp đồng vận hành, bảo dưỡng khôi phục sự cố O&M."]
                  },
                  {
                    title: isEn ? "Integrated Solutions" : "Phát triển giải pháp tổng thể",
                    items: isEn
                      ? ["Turnkey smart-city and cloud system integrations.", "Telecom power supplies and structural grounding systems."]
                      : ["Tích hợp công nghệ cao trong các dự án Chìa khóa trao tay.", "Hạ tầng trung tâm dữ liệu thông minh, chuyển đổi số Cloud."]
                  }
                ].map((sector, idx) => (
                  <div key={idx} className="bg-white/40 dark:bg-slate-950/20 p-5 rounded-2xl border border-white/30 dark:border-white/5 space-y-3">
                    <h5 className="font-bold text-sky-600 dark:text-sky-400 text-sm uppercase tracking-wide">
                      {sector.title}
                    </h5>
                    <ul className="space-y-1.5 pl-3 list-disc text-xs text-slate-500 dark:text-slate-400">
                      {sector.items.map((item, keyIdx) => (
                        <li key={keyIdx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100/50 dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-950/20 relative z-10">
              <button onClick={closeActiveModal} className="w-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all">
                {isEn ? "Close" : "Đóng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Features;
