import React, { useState } from 'react';
import { FileText, TrendingUp, Handshake, Download, X, Check, ArrowRight, Eye, ShieldCheck, ChevronRight, BarChart3, Building2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

// Load company profile data
import companyProfile from '../../constants/company_profile.json';

export const Features: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'hsnl' | 'bctc' | 'lvhd'>('hsnl');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeActiveModal = () => setActiveModal(null);

  const currentLang = language as keyof typeof companyProfile.intro;

  // Data mapping for tabs
  const tabData = {
    hsnl: {
      id: 'hsnl',
      title: getLangText(language, { vi: 'Hồ Sơ Năng Lực', en: 'Company Profile', ko: '회사 프로필', ja: '会社概要・実績', zh: '公司资质与能力', de: 'Unternehmensprofil' }),
      subtitle: getLangText(language, { vi: 'Năng lực & Pháp lý', en: 'Credentials & Capacity', ko: '자격 및 역량', ja: '資格・法的能力', zh: '资质与法律', de: 'Qualifikationen' }),
      color: "from-blue-500 to-sky-600",
      accentColor: "sky",
      icon: FileText,
      tag: "CTC-PROFILE-2026",
      desc: getLangText(language, {
        vi: 'Tổng hợp toàn diện về năng lực pháp lý, tài chính, đội ngũ nhân sự kỹ thuật cao và trang thiết bị thi công hiện đại của công ty.',
        en: 'Comprehensive review of CTC legal credentials, capital, engineering staff, and machinery capacities.',
        ko: 'CTC의 법적 자격, 자본, 엔지니어링 인력 및 장비 역량에 대한 종합적 검토.',
        ja: 'CTCの法的資格、資本、エンジニアリングスタッフ、および設備能力の総合的な概要。',
        zh: '全面汇总CTC的法律资质、资金、高素质技术团队和现代施工设备。',
        de: 'Umfassende Übersicht über rechtliche Qualifikationen, Kapital, Ingenieurteam und Bauausrüstung von CTC.'
      }),
      details: [
        getLangText(language, { vi: 'Đầy đủ chứng chỉ hành nghề và năng lực xây dựng Hạng I của Bộ Xây dựng.', en: 'Full legal credentials & construction licenses Class I', ko: '건설부의 Class I 건설 능력 인증서 보유', ja: '建設省の等級I建設能力認定を保有', zh: '具备建设部一级施工能力证书', de: 'Bauqualifikationszertifikat Klasse I des Bauministeriums' }),
        getLangText(language, { vi: 'Đội ngũ nhân sự chuyên môn vững vàng với hơn 53+ kỹ sư, chỉ huy trưởng.', en: 'Detailed engineer lists with 53+ technical officers', ko: '53명 이상의 기술진 및 프로젝트 매니저 보유', ja: '53名以上の技術責任者・現場監督チーム', zh: '拥有53多名工程师和项目经理的高素质团队', de: 'Technisches Team mit über 53 Ingenieuren und Projektleitern' }),
        getLangText(language, { vi: 'Danh mục máy móc đo đạc, thi công chuyên biệt hiện đại nhập khẩu.', en: 'Modern specialized construction machinery and instruments', ko: '최신 수입 측정 및 전용 시공 장비 보유', ja: '輸入された最新の専門測定・施工機器を所有', zh: '配备进口现代化的专业测量与施工机械', de: 'Moderne importierte Spezialmess- und Baumaschinen' }),
        getLangText(language, { vi: 'Đối tác tin cậy của các tập đoàn Viễn thông, Công nghệ & Năng lượng lớn.', en: 'Strategic partner of major Telecom, IT & Energy Corporations', ko: '주요 통신, IT 및 에너지 기업의 신뢰할 수 있는 파트너', ja: '大手通信・IT・エネルギーグループの信頼できるパートナー', zh: '大型电信、科技与能源集团信赖的合作伙伴', de: 'Vertrauenswürdiger Partner großer Telekom- und Energiekonzerne' })
      ],
      stats: [
        { value: "53+", label: getLangText(language, { vi: 'Cán bộ kỹ thuật chủ chốt', en: 'Key technical officers', ko: '핵심 기술진', ja: 'Key Lineエンジニア', zh: '核心技术人员', de: 'Leitende Ingenieure' }) },
        { value: "32+", label: getLangText(language, { vi: 'Năm kinh nghiệm', en: 'Years of experience', ko: '년 경력', ja: '年の実績', zh: '年行业经验', de: 'Jahre Erfahrung' }) }
      ],
      btnText: getLangText(language, { vi: 'Xem Hồ Sơ Năng Lực', en: 'View Complete Profile', ko: '전체 프로필 보기', ja: '会社概要を見る', zh: '查看完整资质', de: 'Vollständiges Profil ansehen' }),
      downloadText: getLangText(language, { vi: 'Tải về bản DOCX', en: 'Download DOCX', ko: 'DOCX 다운로드', ja: 'DOCXをダウンロード', zh: '下载 DOCX 文件', de: 'DOCX herunterladen' }),
      modalId: 'hsnl'
    },
    bctc: {
      id: 'bctc',
      title: getLangText(language, { vi: 'Báo Cáo Tài Chính', en: 'Financial Statements', ko: '재무 제표', ja: '財務諸表', zh: '财务报告', de: 'Finanzberichte' }),
      subtitle: getLangText(language, { vi: 'Minh bạch & Tăng trưởng', en: 'Transparency & Assets', ko: '투명성 및 성과', ja: '透明性・資産', zh: '透明与增长', de: 'Transparenz & Vermögen' }),
      color: "from-indigo-500 to-purple-600",
      accentColor: "purple",
      icon: TrendingUp,
      tag: "CTC-FINANCE-2025",
      desc: getLangText(language, {
        vi: 'Công bố chi tiết tình hình tài chính thường niên đã qua kiểm toán, thể hiện quy mô tài sản và tính minh bạch của doanh nghiệp.',
        en: 'Audited financial declarations showing CTC financial strength, total assets, and tax duties compliance.',
        ko: 'CTC의 재무 건전성, 총 자산 및 납세 준수 상태를 보여주는 감사 재무 제표.',
        ja: '監査済みの財務諸表により、CTCの財務の健全性、総資産、法令順守を提示。',
        zh: '经审计的年度财务报告，展示企业资产规模与高度透明度。',
        de: 'Geprüfter Finanzbericht zur Erläuterung der Vermögenswerte und Transparenz von CTC.'
      }),
      details: [
        getLangText(language, { vi: 'Báo cáo kiểm toán độc lập thường niên khách quan, chính xác.', en: 'Independent audited reports ensuring transparency', ko: '투명성을 보장하는 독립 회계 감사 보고서', ja: '透明性を保証する独立監査報告書', zh: '年度独立审计报告，确保高度客观与准确', de: 'Unabhängiger Jahresprüfungsbericht für höchste Transparenz' }),
        getLangText(language, { vi: 'Tổng quy mô tài sản vững chắc đạt trên 181+ tỷ VNĐ.', en: 'Robust asset base with over 181+ Billion VNĐ', ko: '1,810억 동 이상의 탄탄한 자산 규모', ja: '1810億ドン以上の堅実な資産規模', zh: '总资产规模超 1810 亿+ 越南盾', de: 'Solide Vermögensbasis von über 181+ Mrd. VND' }),
        getLangText(language, { vi: 'Lợi nhuận sau thuế năm 2025 đạt 913 triệu VNĐ.', en: 'Profit after tax reached 913 million VND in 2025', ko: '2025년 당기순이익 9억 1300만 동 달성', ja: '2025年の税引後利益は9億1300万ドンを達成', zh: '2025年税后利润达9.13亿越南盾', de: 'Jahresüberschuss 2025 erreichte 913 Mio. VND' }),
        getLangText(language, { vi: 'Cơ cấu nguồn vốn an toàn, tỷ lệ nợ phải trả luôn trong tầm kiểm soát.', en: 'Optimal capital efficiency and sustainable profit growth', ko: '안전한 자본 구조 및 통제 가능한 부채 비율', ja: '健全な資本構造と制御可能な負債比率', zh: '资本结构安全，负债率维持在可控范围内', de: 'Sichere Kapitalstruktur und kontrollierte Verschuldung' })
      ],
      stats: [
        { value: "181+", label: getLangText(language, { vi: 'Tỷ VNĐ tài sản', en: 'Billion VND assets', ko: '억 동 자산', ja: '億ドン資産', zh: '亿越南盾资产', de: 'Mrd. VND Vermögen' }) },
        { value: "288+", label: getLangText(language, { vi: 'Tỷ VNĐ doanh thu', en: 'Billion VND revenue', ko: '억 동 매출', ja: '億ドン売上高', zh: '亿越南盾营业额', de: 'Mrd. VND Umsatz' }) }
      ],
      btnText: getLangText(language, { vi: 'Xem Chi Tiết Tài Chính', en: 'View Financial Details', ko: '재무 상세 보기', ja: '財務詳細を見る', zh: '查看财务详情', de: 'Finanzdetails ansehen' }),
      downloadText: getLangText(language, { vi: 'Tải Báo Cáo Kiếm Toán', en: 'Download Audit Report', ko: '감사 보고서 다운로드', ja: '監査報告書をダウンロード', zh: '下载审计报告', de: 'Prüfbericht herunterladen' }),
      modalId: 'bctc'
    },
    lvhd: {
      id: 'lvhd',
      title: getLangText(language, { vi: 'Lĩnh Vực Hoạt Động', en: 'Areas of Operation', ko: '사업 분야', ja: '事業領域', zh: '业务领域', de: 'Geschäftsbereiche' }),
      subtitle: getLangText(language, { vi: 'Đa dạng & Chuyên sâu', en: 'EPC & Infrastructure', ko: '다양성 및 전문성', ja: 'インフラ・EPC', zh: '多元与专业', de: 'Infrastruktur & EPC' }),
      color: "from-amber-500 to-orange-600",
      accentColor: "orange",
      icon: Handshake,
      btnText: getLangText(language, { vi: 'Khám Phá Chi Tiết Lĩnh Vực', en: 'Explore Business Sectors', ko: '사업 분야 자세히 보기', ja: '事業領域の詳細を見る', zh: '探索业务领域', de: 'Geschäftsbereiche erkunden' }),
      downloadText: getLangText(language, { vi: 'Xem Danh Mục Dự Án', en: 'View Portfolio', ko: '포트폴리오 보기', ja: 'ポートフォリオを見る', zh: '查看项目组合', de: 'Portfolio ansehen' }),
      modalId: 'lvhd'
    }
  };

  const activeTabInfo: any = tabData[activeTab];

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
            {getLangText(language, {
              vi: 'TRUNG TÂM NĂNG LỰC CTC',
              en: 'CTC COMMAND CENTER',
              ko: 'CTC 기업 역량 센터',
              ja: 'CTC企業能力センター',
              zh: 'CTC 核心能力中心',
              de: 'CTC KOMPETENZZENTRUM'
            })}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {getLangText(language, {
              vi: 'Hồ sơ năng lực & Thông tin hoạt động',
              en: 'Information & Capabilities Hub',
              ko: '기업 정보 및 역량 센터',
              ja: '企業情報・実績ハブ',
              zh: '企业资质与运营能力',
              de: 'Unternehmensprofil & Kompetenzzentrum'
            })}
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
              <span className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">
                {getLangText(language, { vi: 'Hồ sơ năng lực', en: 'Company Profile', ko: '회사 프로필', ja: '会社概要', zh: '公司资质', de: 'Unternehmensprofil' })}
              </span>
              <button onClick={closeActiveModal} className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 p-2 rounded-full transition-all hover:rotate-90 duration-300">
                <X size={18} className="text-gray-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 space-y-6">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                {getLangText(language, {
                  vi: 'Hồ sơ năng lực của chúng tôi cung cấp một cái nhìn chi tiết và toàn diện về CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC). Tại đây, Quý đối tác và khách hàng có thể tìm thấy thông tin đầy đủ về:',
                  en: 'Our Company Profile provides a detailed and comprehensive look at CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS CONSTRUCTION JOINT-STOCK COMPANY (CTC). Here, partners and clients can find full details about:',
                  ko: '회사 프로필은 중부 포스트 및 통신 건설 주식 회사 (CTC)에 대한 자세한 정보를 제공합니다.',
                  ja: '当社プロファイルは、中部ポスト＆電気通信建設株式会社（CTC）の詳細な情報を提供します。',
                  zh: '我们的公司资质与能力文件为您提供越南中部邮电建设股份有限公司（CTC）的全面信息：',
                  de: 'Unser Unternehmensprofil bietet einen detaillierten Überblick über CTC:'
                })}
              </p>
              <ul className="space-y-3">
                {[
                  getLangText(language, { vi: 'Năng lực pháp lý: Giấy phép kinh doanh, chứng chỉ năng lực xây dựng hạng do Bộ Xây dựng cấp.', en: 'Legal capacity: Business license, operation credentials, and government construction certificates.', ko: '법적 역량: 사업자 등록증, 건설부 발급 건설 역량 인증서.', ja: '法的能力：事業ライセンス、建設省発行の建設能力認定。', zh: '法律资质：营业执照、建设部颁发的施工资质证书。', de: 'Rechtliche Qualifikation: Gewerbelizenz, Bauzertifikate Klasse I.' }),
                  getLangText(language, { vi: 'Năng lực tài chính: Các báo cáo tài chính tóm tắt, thể hiện sự ổn định và tiềm lực phát triển mạnh mẽ.', en: 'Financial capacity: Key statements demonstrating stable assets, capital, and robust performance.', ko: '재무 역량: 안정적인 자산과 자본을 보여주는 핵심 재무 제표.', ja: '財務能力： corporate 資産と資本を示す主要財務諸表。', zh: '财务实力：展示稳定资产与资金实力的财务报告。', de: 'Finanzielle Leistungsfähigkeit: Finanzberichte und Vermögenswerte.' }),
                  getLangText(language, { vi: 'Năng lực nhân sự: Giới thiệu về đội ngũ quản lý, kỹ sư và chuyên gia có kinh nghiệm thực tế dồi dào.', en: 'Human resources: Experienced engineers, project managers, and technical officers.', ko: '인적 자원: 풍부한 경험을 갖춘 엔지니어 및 프로젝트 매니저 팀.', ja: ' me 人的資源：豊富な経験を持つエンジニアおよびプロジェクトマネージャー。', zh: '人员实力：具有丰富实战经验的工程师与项目经理团队。', de: 'Personalressourcen: Erfahrene Ingenieure und Projektleiter.' }),
                  getLangText(language, { vi: 'Năng lực trang thiết bị: Cơ sở vật chất và các trang thiết bị hiện đại phục vụ cho hoạt động kinh doanh và thi công.', en: 'Equipment capacity: Modern facilities, specialized construction vehicles, and testing devices.', ko: '장비 역량: 현대적인 건설 장비 및 측정 기기.', ja: ' me 設備能力：最新の施工機械および専門測定機器。', zh: '设备实力：现代化的专业施工机械与检测设备。', de: 'Ausrüstungskapazität: Moderne Baumaschinen und Messgeräte.' }),
                  getLangText(language, { vi: 'Kinh nghiệm và Dự án tiêu biểu: Danh sách các công trình tiêu biểu, minh chứng cho năng lực thực tế của CTC.', en: 'Key Projects: Landmark references in telecom, data centers, solar arrays, and wind farms.', ko: '주요 프로젝트: 통신, 데이터 센터, 태양광 및 풍력 대표 프로젝트.', ja: '代表的プロジェクト：通信、データセンター、太陽光・風力発電の実績。', zh: '代表项目：电信、数据中心、光伏与风电项目业绩。', de: 'Repräsentative Projekte: Referenzen in Telekom, Rechenzentren, Solar und Wind.' })
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
                {getLangText(language, { vi: 'Đóng', en: 'Close', ko: '닫기', ja: '閉じる', zh: '关闭', de: 'Schließen' })}
              </button>
              <a href="/file/HSNL 2024.docx" download="HoSoNangLuc_CTC_2024.docx" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold text-sm tracking-wider uppercase hover:shadow-lg hover:shadow-blue-500/20 transition-all text-center flex items-center justify-center gap-2">
                <Download size={16} /> {getLangText(language, { vi: 'Tải về HSNL', en: 'Download DOCX', ko: 'DOCX 다운로드', ja: 'DOCXをダウンロード', zh: '下载 DOCX', de: 'DOCX herunterladen' })}
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
              <span className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">
                {getLangText(language, { vi: 'Báo cáo tài chính', en: 'Financial Statements', ko: '재무 제표', ja: '財務諸表', zh: '财务报告', de: 'Finanzberichte' })}
              </span>
              <button onClick={closeActiveModal} className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 p-2 rounded-full transition-all hover:rotate-90 duration-300">
                <X size={18} className="text-gray-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 space-y-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                {getLangText(language, {
                  vi: 'Thể hiện trách nhiệm giải trình và cung cấp cái nhìn sâu sắc về sức khỏe tài chính, CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC) xin công bố các Báo cáo Tài chính thường niên.',
                  en: 'Demonstrating transparency and accountability, CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS CONSTRUCTION JOINT-STOCK COMPANY (CTC) releases its annual financial statements.',
                  ko: '투명성과 책임을 도모하기 위해 CTC는 연례 재무 제표를 공시합니다.',
                  ja: '透明性と me 責任を果たすため、CTCは年次財務諸表を公開しています。',
                  zh: '为体现透明度与对股东、合作伙伴的责任，CTC公布历年财务报告。',
                  de: 'Zur Gewährleistung von Transparenz veröffentlicht CTC seine jährlichen Finanzberichte.'
                })}
              </p>
              
              <div className="space-y-4">
                {[
                  { year: '2025', file: 'BCTC 2025.pdf', desc: getLangText(language, { vi: 'Tổng kết năm 2025 với những bước tiến vượt bậc, khẳng định vị thế vững chắc.', en: 'Summary of 2025 with strong expansion into industrial solar and transmission infrastructure.', ko: '2025년 총결산 보고서.', ja: '2025年の年次決算報告。', zh: '2025年度财务总结报告。', de: 'Zusammenfassung des Jahres 2025.' }) },
                  { year: '2024', file: 'BCTC 2024.pdf', desc: getLangText(language, { vi: 'Tổng kết năm 2024 với những bước tiến vượt bậc, khẳng định vị thế vững vàng.', en: 'Detailed annual report for 2024, demonstrating resilience and key target achievements.', ko: '2024년 총결산 보고서.', ja: '2024年の年次決算報告。', zh: '2024年度财务总结报告。', de: 'Detaillierter Jahresbericht 2024.' }) },
                  { year: '2023', file: 'BCTC 2023.pdf', desc: getLangText(language, { vi: 'Phân tích kết quả kinh doanh năm 2023, làm cơ sở định hướng phát triển.', en: 'Key metrics for 2023 showing OSP network stability and wind turbine projects startup.', ko: '2023년 총결산 보고서.', ja: '2023年の年次決算報告。', zh: '2023年度财务总结报告。', de: 'Jahresbericht 2023.' }) },
                  { year: '2022', file: 'BCTC 2022.pdf', desc: getLangText(language, { vi: 'Cung cấp cái nhìn tổng quan về tình hình tài chính năm 2022, làm cơ sở đầu tư.', en: 'Financial standing for fiscal year 2022, providing foundation for joint ventures.', ko: '2022년 총결산 보고서.', ja: '2022年の年次決算報告。', zh: '2022年度财务总结报告。', de: 'Jahresbericht 2022.' }) },
                  { year: getLangText(language, { vi: 'Xác nhận nghĩa vụ thuế', en: 'Tax Confirmation', ko: '세금 납부 확인서', ja: '納税 me 証明書', zh: '完税证明', de: 'Steuerbestätigung' }), file: 'Xác nhận không nợ thuế CTC đến 16-...pdf', desc: getLangText(language, { vi: 'Giấy xác nhận thực hiện nghĩa vụ thuế nhà nước, cập nhật mới nhất (Tháng 5/2025).', en: 'Official confirmation from Tax Office showing zero outstanding debt.', ko: '국세청 미납 세금 없음 공식 확인서.', ja: '税務署からの滞納なし me 証明書。', zh: '税务机关出具的无欠税证明。', de: 'Offizielle Bestätigung der Steuerbehörde.' }) }
                ].map((report, idx) => (
                  <div key={idx} className="bg-white/40 dark:bg-slate-950/20 p-5 rounded-2xl border border-white/30 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base">
                        {report.year.includes('Tax') || report.year.includes('thuế') || report.year.includes('세금') || report.year.includes('税') || report.year.includes('Steuer') ? report.year : `${getLangText(language, { vi: 'Báo cáo tài chính năm', en: 'Financial Report', ko: '재무 보고서', ja: '財務報告書', zh: '财务报告', de: 'Finanzbericht' })} ${report.year}`}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{report.desc}</p>
                    </div>
                    <a 
                      href={`/Tinh_Hinh_Tai_Chinh/${report.file}`} 
                      download={report.file}
                      className="bg-sky-500/10 dark:bg-sky-400/5 hover:bg-sky-500 dark:hover:bg-sky-400 hover:text-white text-sky-600 dark:text-sky-400 p-2.5 rounded-xl border border-sky-500/20 dark:border-sky-400/10 flex items-center justify-center gap-2 font-bold text-xs transition-all flex-shrink-0"
                    >
                      <Download size={14} /> {getLangText(language, { vi: 'Tải PDF', en: 'PDF', ko: 'PDF', ja: 'PDF', zh: 'PDF', de: 'PDF' })}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100/50 dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-950/20 relative z-10">
              <button onClick={closeActiveModal} className="w-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all">
                {getLangText(language, { vi: 'Đóng', en: 'Close', ko: '닫기', ja: '閉じる', zh: '关闭', de: 'Schließen' })}
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
              <span className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">
                {getLangText(language, { vi: 'Lĩnh vực hoạt động', en: 'Business Sectors', ko: '사업 분야', ja: '事業領域', zh: '业务领域', de: 'Geschäftsbereiche' })}
              </span>
              <button onClick={closeActiveModal} className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 p-2 rounded-full transition-all hover:rotate-90 duration-300">
                <X size={18} className="text-gray-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 space-y-6">
              <p className="text-sm sm:p-base text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                {getLangText(language, {
                  vi: 'CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC) tự hào hoạt động đa ngành, tập trung vào các lĩnh vực cốt lõi sau:',
                  en: 'CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS CONSTRUCTION JOINT-STOCK COMPANY (CTC) is proud of its multi-sectoral expertise, focusing on key industrial areas:',
                  ko: 'CTC는 다음 핵심 사업 분야에 집중하는 다각화된 전문 기업입니다.',
                  ja: 'CTCは、以下の主要産業分野に注力する多角化企業です。',
                  zh: '越南中部邮电建设股份有限公司（CTC）业务涵盖多个核心工业领域：',
                  de: 'CTC ist stolz auf seine breit gefächerten Kompetenzen in folgenden Kernbereichen:'
                })}
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    title: getLangText(language, { vi: 'Cung cấp giải pháp & sản phẩm công nghệ', en: 'Technology Solutions & Products', ko: '기술 솔루션 및 제품', ja: '技術ソリューション＆製品', zh: '技术解决方案与产品', de: 'Technologielösungen & Produkte' }),
                    items: getLangText(language, {
                      vi: ["Thiết bị tin học chuyên dụng, máy chủ, hệ thống lưu trữ.", "Thiết bị viễn thông, mạng truyền dẫn chuyên sâu.", "Hệ thống nghe nhìn (AV) chuyên nghiệp, phòng họp thông minh.", "Phần mềm bản quyền và các gói giải pháp doanh nghiệp."],
                      en: ["IT hardware, servers, corporate storage networks.", "Telecommunications equipment and ISP networks.", "Professional audio-visual (AV) and video conference systems.", "Software licensing and customized applications."],
                      ko: ["IT 하드웨어, 서버, 기업용 스토리지 네트워크.", "통신 장비 및 ISP 네트워크.", "전문 음향/영상(AV) 및 스마트 회의실 시스템.", "소프트웨어 라이선스 및 맞춤형 기업 솔루션."],
                      ja: ["ITハードウェア、サーバー、企業向けストレージ。", "通信機器および専門伝送ネットワーク。", "プロフェッショナルAV・スマート会議室システム。", "ライセンスソフトウェアおよび企業向けソリューション。"],
                      zh: ["专业IT硬件、服务器、企业存储网络。", "电信设备及专业传输网络。", "专业音视频 (AV) 与智能会议室系统。", "正版软件授权与企业定制解决方案。"],
                      de: ["IT-Hardware, Server, Unternehmensspeicher.", "Telekommunikationsgeräte und Übertragungsnetze.", "Professionelle AV- und Konferenzsysteme.", "Softwarelizenzen und maßgeschneiderte Lösungen."]
                    })
                  },
                  {
                    title: getLangText(language, { vi: 'Xây dựng hạ tầng & công trình', en: 'Infrastructure & Construction', ko: '인프라 및 건설', ja: 'インフラ・建設', zh: '基础设施与工程建设', de: 'Infrastruktur & Bau' }),
                    items: getLangText(language, {
                      vi: ["Thi công tổng thầu EPC dân dụng và công nghiệp.", "Hạ tầng kỹ thuật viễn thông (trạm thu phát BTS, cáp ngầm cáp treo).", "Xây dựng trạm biến áp, hệ thống cơ điện công trình M&E."],
                      en: ["Civil and industrial EPC building contracts.", "Telecom physical infrastructure (BTS stations, fiber OSP).", "Electrical lines and substation setups (M&E system)."],
                      ko: ["민간 및 산업 EPC 총괄 시공.", "통신 기술 인프라 (BTS 기지국, 광케이블).", "변전소 및 M&E 전기/기계 시스템 시공."],
                      ja: ["土木・産業EPC総一括施工。", "通信技術インフラ（BTS局、光ファイバー網）。", "変電所建設およびM&E設備施工。"],
                      zh: ["民用与工业EPC总承包施工。", "电信技术基础设施（BTS基站、光缆工程）。", "变电站与建筑M&E机电系统建设。"],
                      de: ["Zivil- und industrielle EPC-Bauaufträge.", "Telekom-Infrastruktur (BTS-Stationen, Glasfaser).", "Umspannwerke und M&E-Gebäudetechnik."]
                    })
                  },
                  {
                    title: getLangText(language, { vi: 'Cung cấp dịch vụ hỗ trợ', en: 'Professional Services', ko: '전문 지원 서비스', ja: '専門サポートサービス', zh: '专业支持服务', de: 'Professionelle Dienste' }),
                    items: getLangText(language, {
                      vi: ["Tư vấn kỹ thuật chuyên sâu, khảo sát lập thiết kế kỹ thuật.", "Dịch vụ lắp đặt, đo kiểm, cấu hình nghiệm thu thiết bị.", "Hợp đồng vận hành, bảo dưỡng khôi phục sự cố O&M."],
                      en: ["Technical consultation, detailed designs.", "System deployment, software setup, configuration.", "Operations and maintenance (O&M) contracts."],
                      ko: ["심도 있는 기술 자문, 현장 조사 및 설계.", "장비 설치, 측정, 구성 및 검수 서비스.", "운영 및 유지보수 (O&M) 계약."],
                      ja: ["高度な技術コンサルティング、調査・詳細設計。", "機器の設置・測定・設定・検収サービス。", "運用・保守（O&M）契約。"],
                      zh: ["深度技术咨询、勘察及详细工程设计。", "设备安装、测试、配置及验收服务。", "运维保障 (O&M) 与紧急抢修服务。"],
                      de: ["Technische Beratung, Detaillierte Planung.", "Systeminstallation, Messung, Konfiguration.", "Betriebs- und Wartungsverträge (O&M)."]
                    })
                  },
                  {
                    title: getLangText(language, { vi: 'Phát triển giải pháp tổng thể', en: 'Integrated Solutions', ko: '통합 솔루션 개발', ja: '統合ソリューション開発', zh: '整体解决方案开发', de: 'Integrierte Gesamtlösungen' }),
                    items: getLangText(language, {
                      vi: ["Tích hợp công nghệ cao trong các dự án Chìa khóa trao tay.", "Hạ tầng trung tâm dữ liệu thông minh, chuyển đổi số Cloud."],
                      en: ["Turnkey smart-city and cloud system integrations.", "Telecom power supplies and structural grounding systems."],
                      ko: ["턴키 스마트 시티 및 클라우드 시스템 통합.", "통신 전원 및 접지 시스템."],
                      ja: ["Turnkeyスマートシティおよびクラウド統合。", "通信用 me 電源および接地 me システム。"],
                      zh: ["交钥匙工程高新技术集成与云化转型。", "智能数据中心基础设施与通信接地系统。"],
                      de: ["Schlüsselfertige Smart-City- und Cloud-Integration.", "Telekom-Stromversorgung und Erdungssysteme."]
                    })
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
                {getLangText(language, { vi: 'Đóng', en: 'Close', ko: '닫기', ja: '閉じる', zh: '关闭', de: 'Schließen' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Features;
