import React, { useState, useRef } from 'react';
import { Radio, Server, Sun, Wind, Building2, Wrench, ArrowRight, Check } from 'lucide-react';
import { useInView } from '../../hooks/useInView';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

/* ── Component ──────────────────────────────────────── */
const AreasOfOperation: React.FC = () => {
  const { t, language } = useLanguage();
  const { ref, isInView } = useInView(0.05);
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isEn = language === 'en';
  const isKo = language === 'ko';
  const isJa = language === 'ja';
  const isZh = language === 'zh';
  const isDe = language === 'de';

  const SECTORS = [
    {
      id: 'telecom',
      index: '01',
      icon: Radio,
      label: isEn ? 'Telecom' : isKo ? '통신' : isJa ? '通信' : isZh ? '电信' : isDe ? 'Telekom' : 'Viễn thông',
      accentColor: '#0ea5e9',
      gradFrom: '#0ea5e9',
      gradTo: '#6366f1',
      title: isEn ? 'Telecommunications &\nNetwork Infrastructure' : isKo ? '통신 및\n네트워크 인프라' : isJa ? '通信および\nネットワークインフラ' : isZh ? '电信与\n网络基础设施' : isDe ? 'Telekommunikation &\nNetzwerkinfrastruktur' : 'Viễn thông &\nHạ tầng mạng',
      titleEn: 'TELECOMMUNICATIONS',
      summary: isEn ? 'Designing, constructing, and operating transmission infrastructure, fiber optic networks, BTS stations, cable trenches, and OSP nationwide.' : isKo ? '전국 규모의 전송 인프라, 광케이블 네트워크, BTS 기지국, 케이블 관로 및 OSP 설계, 시공 및 운영.' : isJa ? '都市規模から全国規模までの伝送インフラ、光ファイバー網、BTS局、ケーブル洞道およびOSPの設計・構築・運用。' : isZh ? '设计、建设和运营从城市到全国范围的传输基础设施、光缆网络、BTS基站、电缆沟和OSP。' : isDe ? 'Planung, Bau und Betrieb von Übertragungsinfrastruktur, Glasfasernetzen, BTS-Stationen und OSP.' : 'Thiết kế, xây dựng và vận hành toàn bộ hạ tầng truyền dẫn, mạng cáp quang, trạm BTS, hầm cáp và OSP từ quy mô đô thị đến toàn quốc.',
      stat: '500+',
      statLabel: isEn ? 'Telecom Projects' : isKo ? '통신 프로젝트' : isJa ? '通信工事' : isZh ? '电信工程' : isDe ? 'Telekom-Projekte' : 'công trình viễn thông',
      tags: isEn ? ['Fiber Optic', 'BTS / Antenna', 'OSP / ISP', 'Cable Trench', 'Transmission', 'Exchange'] : ['Cáp quang', 'BTS / Anten', 'OSP / ISP', 'Hầm cáp', 'Truyền dẫn', 'Tổng đài'],
      projects: isEn ? [
        'Ministry of Public Security Fiber Line',
        'Nationwide Metro Mobifone Network',
        'OSP Infrastructure / VNPT Net',
        'Specialized BTS Station System'
      ] : [
        'Tuyến cáp quang Bộ Công an',
        'Metro Mobifone toàn quốc',
        'Hạ tầng OSP / VNPT Net',
        'Hệ thống trạm BTS chuyên biệt'
      ],
    },
    {
      id: 'it',
      index: '02',
      icon: Server,
      label: isEn ? 'IT & Data Center' : isKo ? 'IT 및 데이터 센터' : isJa ? 'IT・データセンター' : isZh ? 'IT与数据中心' : isDe ? 'IT & Rechenzentrum' : 'CNTT & Data Center',
      accentColor: '#8b5cf6',
      gradFrom: '#8b5cf6',
      gradTo: '#ec4899',
      title: isEn ? 'Information Technology\n& Data Center' : isKo ? '정보기술\n및 데이터 센터' : isJa ? '情報技術\nおよびデータセンター' : isZh ? '信息技术\n与数据中心' : isDe ? 'Informationstechnik\n& Rechenzentrum' : 'Công nghệ thông tin\n& Data Center',
      titleEn: 'IT & DATA CENTER',
      summary: isEn ? 'Deploying comprehensive IT infrastructure: International standard Data Centers, AI Camera surveillance, enterprise networks, and digital transformation solutions.' : isKo ? '국제 표준 데이터 센터, AI 감시 카메라, 기업 네트워크 및 디지털 전환 솔루션 등 포괄적인 IT 인프라 구축.' : isJa ? '国際規格データセンター、AI監視カメラ、企業ネットワーク、デジタル変革ソリューションなど、包括的なITインフラを導入。' : isZh ? '部署全面IT基础设施：国际标准数据中心、AI监控摄像头、企业网络及数字化转型解决方案。' : isDe ? 'Umfassende IT-Infrastruktur: Rechenzentren, AI-Kameras, Netzwerke & digitale Transformation.' : 'Triển khai hạ tầng CNTT toàn diện: Data Center tiêu chuẩn quốc tế, Camera AI giám sát, hệ thống mạng doanh nghiệp và giải pháp chuyển đổi số.',
      stat: 'Tier III',
      statLabel: isEn ? 'Data Center Standard' : isKo ? '데이터 센터 표준' : isJa ? 'データセンター規格' : isZh ? '数据中心标准' : isDe ? 'Rechenzentrum Standard' : 'tiêu chuẩn Data Center',
      tags: ['Data Center', 'Camera AI', 'Network / Server', 'IT Security', 'Digital Transformation', 'Cloud'],
      projects: isEn ? [
        'Standard BTS & Data Center Stations',
        'AI Security Camera System',
        'Enterprise Network Infrastructure',
        'Cloud Digital Transformation Solutions'
      ] : [
        'Trạm BTS & Data Center tiêu chuẩn',
        'Hệ thống Camera AI an ninh',
        'Hạ tầng mạng doanh nghiệp',
        'Giải pháp chuyển đổi số Cloud'
      ],
    },
    {
      id: 'solar',
      index: '03',
      icon: Sun,
      label: isEn ? 'Solar Power' : isKo ? '태양광 발전' : isJa ? '太陽光発電' : isZh ? '太阳能' : isDe ? 'Solarstrom' : 'Điện mặt trời',
      accentColor: '#f59e0b',
      gradFrom: '#f59e0b',
      gradTo: '#ef4444',
      title: isEn ? 'Solar Energy\nSolar EPC' : isKo ? '태양광 에너지\nSolar EPC' : isJa ? '太陽光エネルギー\nSolar EPC' : isZh ? '太阳能\nSolar EPC' : isDe ? 'Solarenergie\nSolar EPC' : 'Điện mặt trời\nSolar EPC',
      titleEn: 'SOLAR POWER',
      summary: isEn ? 'Full EPC contractor: survey, design, equipment supply, construction, and operation & maintenance (O&M) for all solar project scales.' : isKo ? '모든 규모의 태양광 프로젝트에 대한 현장 조사, 설계, 장비 공급, 시공 및 유지보수(O&M) 총괄 EPC.' : isJa ? 'あらゆる規模の太陽光プロジェクトに対する調査・設計・機器調達・施工・O&Mの一括EPC。' : isZh ? '全流程EPC总承包：勘察、设计、设备供应、施工及全生命周期运维（O&M）。' : isDe ? 'EPC-Generalunternehmer für alle Solarprojektgrößen von Planung bis O&M.' : 'Tổng thầu EPC toàn trình: khảo sát, thiết kế, cung cấp thiết bị chính hãng, thi công và vận hành bảo trì (O&M) cho mọi quy mô dự án Solar.',
      stat: 'EPC',
      statLabel: isEn ? 'Full turnkey to O&M' : isKo ? '턴키 시공에서 O&M까지' : isJa ? 'TurnkeyからO&Mまで' : isZh ? '交钥匙工程至运维' : isDe ? 'Schlüsselfertig bis O&M' : 'trọn gói đến O&M',
      tags: ['Rooftop Solar', 'C&I Solar', 'Industrial Solar', 'Telecom Solar', 'EPC Solar', 'O&M Solar'],
      projects: isEn ? [
        'Rooftop Residential & C&I Solar EPC',
        'Off-grid Telecom Solar Systems',
        'Industrial Solar Power Systems',
        'Periodic O&M & Repair Services'
      ] : [
        'EPC Solar áp mái hộ gia đình & C&I',
        'Điện mặt trời Telecom (off-grid)',
        'Hệ thống Solar công nghiệp',
        'Dịch vụ O&M định kỳ & sửa chữa'
      ],
    },
    {
      id: 'wind',
      index: '04',
      icon: Wind,
      label: isEn ? 'Wind Power' : isKo ? '풍력 발전' : isJa ? '風力発電' : isZh ? '风电' : isDe ? 'Windenergie' : 'Điện gió',
      accentColor: '#10b981',
      gradFrom: '#10b981',
      gradTo: '#0ea5e9',
      title: isEn ? 'Wind Energy\nWind EPC' : isKo ? '풍력 에너지\nWind EPC' : isJa ? '風力エネルギー\nWind EPC' : isZh ? '风力发电\nWind EPC' : isDe ? 'Windenergie\nWind EPC' : 'Điện gió\nWind EPC',
      titleEn: 'WIND POWER',
      summary: isEn ? 'EPC contractor for wind power plants: wind measurement masts, transmission lines, internal substations, turbine installation, and long-term O&M.' : isKo ? '풍력 발전소 EPC 총괄: 풍황 계측탑, 송전선, 내부 변전소, 터빈 설치 및 장기 유지보수.' : isJa ? '風力発電所のEPC：風況観測塔、送電線、構内変電所、タービン設置および長期O&M。' : isZh ? '风电场EPC总承包：测风塔、输电线路、站内变电站、风机安装及长期运维。' : isDe ? 'EPC-Generalunternehmer für Windparks: Windmessmasten, Leitungen, Umspannwerke, Turbinen.' : 'Tổng thầu EPC nhà máy điện gió: cột đo gió, đường dây truyền tải, trạm biến áp nội bộ, lắp đặt turbine và vận hành bảo trì dài hạn.',
      stat: '3',
      statLabel: isEn ? 'Major Wind Farms' : isKo ? '대형 풍력 발전소' : isJa ? '大型風力発電所' : isZh ? '大型风电场' : isDe ? 'Große Windparks' : 'nhà máy điện gió lớn',
      tags: ['Wind Farm EPC', 'Wind Mast', 'Substation', '110kV Line', 'EPC Wind', 'O&M Wind'],
      projects: isEn ? [
        'Huong Hiep Wind Power Plant (Quang Tri)',
        'Huong Linh & Huong Linh 4 Wind Farms',
        'Dien Bien Wind Measurement Mast',
        'Wind Farm Transmission Line & Substation'
      ] : [
        'Nhà máy điện gió Hướng Hiệp (Quảng Trị)',
        'Điện gió Hướng Linh & Hướng Linh 4',
        'Trụ đo gió Điện Biên',
        'Đường dây & trạm biến áp Wind Farm'
      ],
    },
    {
      id: 'construction',
      index: '05',
      icon: Building2,
      label: isEn ? 'Technical Construction' : isKo ? '기술 건설' : isJa ? '技術建設' : isZh ? '工程建设' : isDe ? 'Technischer Bau' : 'Xây dựng kỹ thuật',
      accentColor: '#3b82f6',
      gradFrom: '#3b82f6',
      gradTo: '#8b5cf6',
      title: isEn ? 'Civil & Industrial\nTechnical Construction' : isKo ? '민간 및 산업\n기술 건설' : isJa ? '土木・産業\n技術建設' : isZh ? '民用与工业\n工程建设' : isDe ? 'Bau- & Industrie-\nIngenieurbau' : 'Xây dựng dân dụng\n& Công nghiệp',
      titleEn: 'TECHNICAL CONSTRUCTION',
      summary: isEn ? 'Grade I certified by Ministry of Construction: power transmission lines, transformer stations up to 110kV, civil and industrial infrastructure.' : isKo ? '건설부 1등급 인증: 110kV 송전선, 변전소, 민간 및 산업 인프라 건축.' : isJa ? '建設省1級認定：110kV送電線、変電所、土木・産業インフラ建築。' : isZh ? '建设部一级资质：110kV输电线路、变电站、民用及工业基础设施建设。' : isDe ? 'Klasse I zertifiziert vom Bauministerium: Leitungen, Umspannwerke bis 110kV, Bauinfrastruktur.' : 'Chứng chỉ Hạng I do Bộ Xây dựng cấp: thi công đường dây truyền tải, trạm biến áp đến 110kV, công trình hạ tầng kỹ thuật dân dụng và công nghiệp.',
      stat: 'Grade I',
      statLabel: isEn ? 'Capacity Certificate' : isKo ? '건설 역량 등급' : isJa ? '建設能力等級' : isZh ? '建设能力等级' : isDe ? 'Baukompetenzklasse' : 'chứng chỉ năng lực BXD',
      tags: ['Substation', '110kV Line', 'Industrial Infra', 'Civil Infra', 'Grade I Certificate', 'SCADA'],
      projects: isEn ? [
        'Industrial Substation System',
        'Inter-provincial 110kV Power Line',
        'Enterprise Technical Infrastructure',
        'Industrial Civil Buildings'
      ] : [
        'Hệ thống trạm biến áp công nghiệp',
        'Đường dây điện 110kV liên tỉnh',
        'Hạ tầng kỹ thuật khu công nghiệp',
        'Công trình dân dụng công nghiệp'
      ],
    },
    {
      id: 'services',
      index: '06',
      icon: Wrench,
      label: isEn ? 'Technical Services' : isKo ? '기술 서비스' : isJa ? '技術サービス' : isZh ? '技术服务' : isDe ? 'Technische Dienste' : 'Dịch vụ kỹ thuật',
      accentColor: '#06b6d4',
      gradFrom: '#06b6d4',
      gradTo: '#3b82f6',
      title: isEn ? 'Technical Services\nO&M Maintenance' : isKo ? '기술 서비스\nO&M 유지보수' : isJa ? '技術サービス\nO&Mメンテナンス' : isZh ? '技术服务\nO&M运维保障' : isDe ? 'Technische Dienste\nO&M-Wartung' : 'Dịch vụ kỹ thuật\n& Bảo trì O&M',
      titleEn: 'TECHNICAL SERVICES',
      summary: isEn ? '24/7 technical services: preventive maintenance, troubleshooting, power plant auditing, SCADA system inspection, and equipment replacement.' : isKo ? '24/7 기술 서비스: 예방적 정비, 문제 해결, 발전소 진단, SCADA 시스템 검사 및 장비 교체.' : isJa ? '24/7技術サービス：予防保全、トラブルシューティング、発電所診断、SCADAシステム点検、機器交換。' : isZh ? '24/7全天候技术服务：预防性维护、故障排除、电站检测、SCADA系统巡检及设备更换。' : isDe ? '24/7 Technische Dienste: Präventive Wartung, Fehlerbehebung, Audits, SCADA-Prüfung & Ausrüstungstausch.' : 'Dịch vụ kỹ thuật 24/7: bảo trì định kỳ, xử lý sự cố khẩn cấp, kiểm định công trình, đo kiểm hệ thống SCADA và thay thế thiết bị chuyên dụng.',
      stat: '24/7',
      statLabel: isEn ? 'Technical Support' : isKo ? '기술 지원 응답' : isJa ? '24時間技術サポート' : isZh ? '24小时技术支持' : isDe ? '24/7 Technischer Support' : 'hỗ trợ kỹ thuật ứng cứu',
      tags: ['24/7 Support', 'O&M Maintenance', 'Emergency Repair', 'SCADA Audit', 'Equipment Test', 'System Upgrade'],
      projects: isEn ? [
        'Periodic O&M for Telecom Stations',
        '24/7 Emergency Incident Response',
        'Solar System Testing & Audit',
        'SCADA & Automation Upgrade'
      ] : [
        'Bảo trì O&M định kỳ trạm viễn thông',
        'Ứng cứu sự cố khẩn cấp 24/7',
        'Đo kiểm & nghiệm thu hệ thống Solar',
        'Nâng cấp SCADA & tự động hóa'
      ],
    },
  ];

  const epcSteps = [
    getLangText(language, { vi: 'Tư vấn', en: 'Consulting', ko: '상담', ja: 'コンサルティング', zh: '咨询', de: 'Beratung' }),
    getLangText(language, { vi: 'Thiết kế', en: 'Design', ko: '설계', ja: '設計', zh: '设计', de: 'Planung' }),
    getLangText(language, { vi: 'Thi công', en: 'Construction', ko: '시공', ja: '施工', zh: '施工', de: 'Bau' }),
    getLangText(language, { vi: 'Vận hành', en: 'Operations', ko: '운영', ja: '運用', zh: '运营', de: 'Betrieb' }),
    getLangText(language, { vi: 'Bảo trì O&M', en: 'O&M Maintenance', ko: 'O&M 유지보수', ja: 'O&Mメンテナンス', zh: 'O&M运维', de: 'O&M-Wartung' })
  ];

  const headerTag = isEn ? 'Areas of Operation' : isKo ? '사업 분야' : isJa ? '事業分野' : isZh ? '业务领域' : isDe ? 'Tätigkeitsbereiche' : 'Lĩnh vực hoạt động';
  const headerTitle1 = isEn ? 'Business' : isKo ? '사업' : isJa ? '事業' : isZh ? '商业' : isDe ? 'Geschäftsbereiche' : 'Hoạt Động';
  const headerTitle2 = isEn ? 'Operations' : isKo ? '운영' : isJa ? '活動' : isZh ? '运营' : isDe ? 'Aktivitäten' : 'Kinh Doanh';
  const headerDesc = getLangText(language, {
    vi: 'Giải pháp khép kín từ Tư vấn → Thiết kế → Thi công → Vận hành → Bảo trì trên 6 lĩnh vực chiến lược.',
    en: 'End-to-end solutions from Consulting → Design → Construction → Operations → Maintenance across 6 strategic sectors.',
    ko: '6개 전략 분야에서 상담 → 설계 → 시공 → 운영 → 유지보수까지 일괄 솔루션 제공.',
    ja: '6つの戦略分野でコンサルティング → 設計 → 施工 → 運用 → メンテナンスまで一貫ソリューションを提供。',
    zh: '在6大战略领域提供从 咨询 → 设计 → 施工 → 运营 → 运维 的一站式闭环解决方案。',
    de: 'End-to-End-Lösungen von Beratung → Planung → Bau → Betrieb → Wartung in 6 strategischen Bereichen.'
  });
  const scopeTag = isEn ? 'Service Scope' : isKo ? '서비스 범위' : isJa ? 'サービス範囲' : isZh ? '服务范围' : isDe ? 'Leistungsumfang' : 'Phạm vi dịch vụ';
  const projTag = isEn ? 'Featured Projects' : isKo ? '대표 프로젝트' : isJa ? '代表的プロジェクト' : isZh ? '代表项目' : isDe ? 'Repräsentative Projekte' : 'Dự án tiêu biểu';
  const epcTitle = isEn ? 'Turnkey EPC Process' : isKo ? '턴키 EPC 프로세스' : isJa ? '一貫EPCプロセス' : isZh ? '全流程EPC工程' : isDe ? 'Schlüsselfertiger EPC-Prozess' : 'Quy trình EPC khép kín';

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
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-white/40">{headerTag}</span>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none"
              style={{ fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" }}
            >
              {headerTitle1}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${s.accentColor}, ${s.gradTo})`, transition: 'background-image 0.5s' }}
              >
                {headerTitle2}
              </span>
            </h2>
          </div>
          <p className="text-slate-500 dark:text-white/40 text-sm leading-relaxed max-w-sm font-light lg:text-right">
            {headerDesc}
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
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/25 font-black mb-3">{epcTitle}</p>
              <div className="flex flex-col gap-2">
                {epcSteps.map((step, i) => (
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
                  style={{ fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" }}
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
                        fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif",
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
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/25 font-black mb-2.5">{scopeTag}</p>
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
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/25 font-black mb-1">{projTag}</p>
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
            { val: '6+', sub: isEn ? 'Strategic Sectors' : isKo ? '전략 분야' : isJa ? '戦略分野' : isZh ? '战略领域' : isDe ? 'Strategische Bereiche' : 'Lĩnh vực chiến lược' },
            { val: '500+', sub: isEn ? 'Projects Completed' : isKo ? '완료된 프로젝트' : isJa ? '完了プロジェクト' : isZh ? '完成项目' : isDe ? 'Abgeschlossene Projekte' : 'Công trình hoàn thành' },
            { val: '53+', sub: isEn ? 'Expert Engineers' : isKo ? '전문 엔지니어' : isJa ? '専門エンジニア' : isZh ? '专业工程师' : isDe ? 'Fachingenieure' : 'Kỹ sư chuyên môn' },
            { val: '288+', sub: isEn ? '$12M Revenue' : isKo ? '288억 동 매출' : isJa ? '2880億ドン収益' : isZh ? '2.88亿营收' : isDe ? '12 Mio. $ Umsatz' : 'Tỷ doanh thu 2025' },
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
