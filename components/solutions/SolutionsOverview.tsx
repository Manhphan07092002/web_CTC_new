import React, { useRef, useEffect, useState } from 'react';
import { Radio, Sun, Wind, Zap, Building2, Server, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

type SectorType = {
  id: string;
  icon: any;
  tag: string;
  title: string;
  sub: string;
  desc: string;
  checks: string[];
  stat1: string; stat1l: string;
  stat2: string; stat2l: string;
  to: string;
  gradient: string;
  glowBg: string;
  accent: string;
  borderHover: string;
  img: string;
  tagStyle: string;
};

/* ─── Animated Number Hook ────────────────────────────────── */
const useCountUp = (target: string, trigger: boolean) => {
  const [val, setVal] = useState('0');
  useEffect(() => {
    if (!trigger) return;
    if (target.includes('/') || target.includes('-')) {
      setVal(target);
      return;
    }
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
const SectorCard: React.FC<{ s: SectorType; visible: boolean; delay: number }> = ({ s, visible, delay }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const Icon = s.icon;
  const [hovered, setHovered] = useState(false);
  const val1 = useCountUp(s.stat1, visible);
  const val2 = useCountUp(s.stat2, visible);

  return (
    <Link
      to={s.to}
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
          <h3 className="text-base font-extrabold text-white leading-snug mb-1 group-hover:text-sky-300 transition-colors">
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

          <span
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-white transition-all duration-300 group-hover:gap-3"
            style={{
              background: s.gradient,
              boxShadow: hovered ? `0 8px 20px -6px ${s.glowBg}` : 'none',
            }}
          >
            {getLangText(language, { vi: 'Xem thêm', en: 'Learn More', ko: '자세히 보기', ja: '詳細を見る', zh: '了解更多', de: 'Mehr erfahren' })} <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ─── Main Component ──────────────────────────────────────── */
const SolutionsOverview: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language !== 'vi';


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

  const SECTORS: SectorType[] = [
    {
      id: 'telecom',
      icon: Radio,
      tag: getLangText(language, { vi: 'Viễn thông & CNTT', en: 'Telecom & IT', ko: '통신 및 IT', ja: '通信・IT', zh: '电信与IT', de: 'Telekom & IT' }),
      title: getLangText(language, { vi: 'Hạ Tầng Viễn Thông', en: 'Telecom Infrastructure', ko: '통신 인프라', ja: '通信インフラ', zh: '电信基础设施', de: 'Telekom-Infrastruktur' }),
      sub: getLangText(language, { vi: 'Cáp quang • BTS • Data Center', en: 'Fiber Optic • BTS • Data Center', ko: '광케이블 • BTS • 데이터 센터', ja: '光ファイバー • BTS • データセンター', zh: '光缆 • BTS • 数据中心', de: 'Glasfaser • BTS • Rechenzentrum' }),
      desc: getLangText(language, {
        vi: 'Thiết kế, thi công mạng cáp quang OSP, trạm BTS/NodeB 4G/5G, Metro Network và Data Center chuẩn Tier III cho nhà mạng & cơ quan nhà nước.',
        en: 'Designing and constructing OSP fiber networks, 4G/5G BTS/NodeB stations, Metro Networks, and Tier III Data Centers.',
        ko: '통신사 및 정부 기관을 위한 OSP 광케이블 네트워크, 4G/5G BTS 기지국, 메트로 네트워크 및 Tier III 데이터 센터 설계 및 시공.',
        ja: '通信事業者や政府機関向けに、OSP光ファイバー網、4G/5G BTS/NodeB局、メトロネットワーク、Tier IIIデータセンターを設計・構築。',
        zh: '为运营商及政府机构设计和建设OSP光缆网络、4G/5G BTS基站、Metro网络及Tier III标准数据中心。',
        de: 'Planung und Bau von OSP-Glasfaser, 4G/5G BTS-Stationen, Metro-Netzwerken und Tier III Rechenzentren.'
      }),
      checks: [
        getLangText(language, { vi: 'Cáp quang ngoại vi (OSP)', en: 'Outside Plant Fiber (OSP)', ko: '광케이블 (OSP)', ja: 'OSP光ファイバー', zh: '室外光缆(OSP)', de: 'OSP-Glasfaser' }),
        getLangText(language, { vi: 'Trạm BTS/NodeB 4G/5G', en: 'BTS/NodeB 4G/5G Stations', ko: '4G/5G BTS 기지국', ja: '4G/5G BTS局', zh: '4G/5G BTS基站', de: '4G/5G BTS-Stationen' }),
        getLangText(language, { vi: 'Metro Network', en: 'Metro Network Infrastructure', ko: '메트로 네트워크 인프라', ja: 'メトロネットワーク', zh: '城域网基础设施', de: 'Metro-Netzwerkinfrastruktur' }),
        getLangText(language, { vi: 'Data Center Tier III', en: 'Tier III Data Center', ko: 'Tier III 데이터 센터', ja: 'Tier IIIデータセンター', zh: 'Tier III数据中心', de: 'Tier III Rechenzentrum' })
      ],
      stat1: '100+', stat1l: getLangText(language, { vi: 'Công trình', en: 'Projects', ko: '프로젝트', ja: '実績', zh: '项目', de: 'Projekte' }),
      stat2: '32+', stat2l: getLangText(language, { vi: 'Năm KN', en: 'Years Exp', ko: '경력 년수', ja: '年経験', zh: '年经验', de: 'Jahre Erf.' }),
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
      title: getLangText(language, { vi: 'Điện Mặt Trời', en: 'Solar Power Systems', ko: '태양광 발전 시스템', ja: '太陽光発電システム', zh: '太阳能光伏系统', de: 'Solarstromsysteme' }),
      sub: getLangText(language, { vi: 'Áp mái • C&I • Solar Farm', en: 'Rooftop • C&I • Solar Farm', ko: '옥상 • C&I • 태양광 팜', ja: '屋根設置 • C&I • メガソーラー', zh: '屋顶 • C&I工商业 • 光伏电站', de: 'Dach • C&I • Solarpark' }),
      desc: getLangText(language, {
        vi: 'Tổng thầu EPC trọn gói hệ thống Solar cho hộ gia đình, thương mại & công nghiệp (C&I) và trang trại Solar Farm kết nối lưới quốc gia.',
        en: 'Turnkey EPC solar solutions for residential, commercial & industrial (C&I) facilities, and utility-scale grid-connected solar farms.',
        ko: '주택용, 상업 및 산업용(C&I) 및 국가 전력망 연계 대형 태양광 팜을 위한 턴키 EPC 태양광 솔루션.',
        ja: '住宅用、商業・産業用（C&I）、および系統連系型のメガソーラー向けターンキーEPCソリューション。',
        zh: '为户用、工商业（C&I）及大型并网光伏电站提供一站式EPC总承包解决方案。',
        de: 'Schlüsselfertige EPC-Solarlösungen für Wohn-, Gewerbe- & Industrieanlagen sowie netzgekoppelte Solarparks.'
      }),
      checks: [
        getLangText(language, { vi: 'Solar áp mái hộ gia đình', en: 'Rooftop Residential Solar', ko: '주택용 옥상 태양광', ja: '住宅用屋根設置太陽光', zh: '户用屋顶光伏', de: 'Wohnhaus-Dachsolar' }),
        getLangText(language, { vi: 'C&I Nhà máy & KCN', en: 'Factory & Industrial C&I', ko: '공장 및 산업용 C&I', ja: '工場・産業用C&I', zh: '工厂及园区C&I光伏', de: 'Fabrik- & Industrie-C&I' }),
        getLangText(language, { vi: 'Solar Farm kết nối lưới', en: 'Grid-Connected Solar Farm', ko: '전력망 연계 태양광 팜', ja: '系統連系メガソーラー', zh: '地面并网光伏电站', de: 'Netzgekoppelter Solarpark' }),
        getLangText(language, { vi: 'O&M bảo trì dài hạn', en: 'Long-Term O&M Services', ko: '장기 O&M 서비스', ja: '长期O&Mサービス', zh: '长期运维保障(O&M)', de: 'Langzeit-O&M-Dienste' })
      ],
      stat1: '500+', stat1l: getLangText(language, { vi: 'Hệ thống', en: 'Systems', ko: '시스템', ja: '基', zh: '套系统', de: 'Systeme' }),
      stat2: '4-5 yrs', stat2l: getLangText(language, { vi: 'Hoàn vốn', en: 'ROI Payback', ko: '투자 회수', ja: '回収期間', zh: '投资回收期', de: 'Amortisation' }),
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
      title: isEn ? 'Wind Power EPC' : 'Điện Gió',
      sub: isEn ? 'EPC • Foundations • 110kV Connection' : 'EPC • Nền móng • Đấu nối 110kV',
      desc: isEn ? 'EPC general contractor for onshore wind power projects in Quang Tri. Turbine foundations, internal cabling, 110kV substations, and SCADA.' : 'Tổng thầu EPC các dự án điện gió trong đất liền tại Quảng Trị. Nền móng trụ gió, cáp nội bộ, trạm biến áp 110kV và hệ thống SCADA.',
      checks: isEn ? ['Huong Linh 1 & 4 Wind Farms', 'Huong Hiep Wind Farm', 'Turbine Concrete Foundations', '110kV Transformer Station'] : ['Điện gió Hướng Linh 1 & 4', 'Điện gió Hướng Hiệp', 'Nền móng trụ gió bê tông', 'Trạm biến áp 110kV'],
      stat1: '3', stat1l: isEn ? 'Wind Farms' : 'Dự án gió',
      stat2: '110kV', stat2l: isEn ? 'Grid Connection' : 'Đấu nối',
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
      tag: getLangText(language, { vi: 'Điện lực & Kỹ thuật', en: 'Power Grid & Engineering', ko: '전력 망 및 엔지니어링', ja: '電力網・エンジニアリング', zh: '电网与工程', de: 'Stromnetz & Engineering' }),
      title: getLangText(language, { vi: 'Đường Dây & Trạm Biến Áp', en: '110kV Lines & Substations', ko: '110kV 송전선 및 변전소', ja: '110kV送電線・変電所', zh: '110kV输电线路及变电站', de: '110kV Leitungen & Umspannwerke' }),
      sub: getLangText(language, { vi: 'Đường dây 110kV • Trạm biến áp', en: '110kV Power Lines • Substations', ko: '110kV 송전선 • 변전소', ja: '110kV送電線 • 変電所', zh: '110kV输电线路 • 变电站', de: '110kV Leitungen • Umspannwerke' }),
      desc: getLangText(language, { vi: 'Xây dựng đường dây tải điện trung – cao thế và trạm biến áp 110kV đấu nối lưới quốc gia. Hệ thống tiếp địa, chống sét và nguồn dự phòng.', en: 'Construction of medium and high-voltage transmission lines and 110kV substations connected to the national grid.', ko: '국가 전력망에 연계된 중/고압 송전선 및 110kV 변전소 건설.', ja: '国家系統に接続された中・高圧送電線および110kV変電所の建設。', zh: '建设连接国家电网的中高压输电线路及110kV变电站。', de: 'Bau von Mittel- und Hochspannungsleitungen sowie 110kV-Umspannwerken.' }),
      checks: [
        getLangText(language, { vi: 'Đường dây 110kV/220kV', en: '110kV/220kV Power Lines', ko: '110kV/220kV 송전선', ja: '110kV/220kV送電線', zh: '110kV/220kV输电线路', de: '110kV/220kV Stromleitungen' }),
        getLangText(language, { vi: 'Trạm biến áp 110kV', en: '110kV Substations', ko: '110kV 변전소', ja: '110kV変電所', zh: '110kV变电站', de: '110kV Umspannwerke' }),
        getLangText(language, { vi: 'Tiếp địa chống sét', en: 'Grounding & Lightning Protection', ko: '접지 및 lightning 보호', ja: '接地・避雷', zh: '接地与防雷', de: 'Erdung & Blitzschutz' }),
        getLangText(language, { vi: 'UPS & Nguồn dự phòng', en: 'UPS & Backup Power', ko: 'UPS 및 비상 전원', ja: 'UPS・バックアップ電源', zh: 'UPS与备用电源', de: 'USV & Backup-Strom' })
      ],
      stat1: '02', stat1l: getLangText(language, { vi: 'Chứng chỉ BXD', en: 'Grade I Cert', ko: '건설부 1등급', ja: '建設省1級', zh: '建设部一级资质', de: 'Klasse I Zert.' }),
      stat2: '110kV', stat2l: getLangText(language, { vi: 'Điện áp', en: 'Voltage', ko: '전압', ja: '電圧', zh: '电压', de: 'Spannung' }),
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
      tag: getLangText(language, { vi: 'Hạ tầng số', en: 'Digital Infrastructure', ko: '디지털 인프라', ja: 'デジタルインフラ', zh: '数字基础设施', de: 'Digitale Infrastruktur' }),
      title: getLangText(language, { vi: 'Data Center & CNTT', en: 'Data Center & IT', ko: '데이터 센터 및 IT', ja: 'データセンター・IT', zh: '数据中心与IT', de: 'Rechenzentrum & IT' }),
      sub: 'Tier III • Cloud • Smart System',
      desc: getLangText(language, { vi: 'Thiết kế, xây dựng và vận hành Data Center chuẩn Tier III. Hệ thống mạng doanh nghiệp, camera an ninh và chuyển đổi số tích hợp.', en: 'Design, construction, and operation of Tier III standard Data Centers, enterprise networks, AI security cameras, and digital transformation.', ko: 'Tier III 표준 데이터 센터, 기업 네트워크, AI 보안 카메라 및 디지털 전환의 설계, 시공 및 운영.', ja: 'Tier III規格データセンター、企業ネットワーク、AI防犯カメラ、デジタル変革の設計・構築・運用。', zh: 'Tier III标准数据中心、企业网络、AI安防监控及数字化转型的设计、建设与运营。', de: 'Planung, Bau und Betrieb von Tier III Rechenzentren, Unternehmensnetzwerken & AI-Kameras.' }),
      checks: [
        getLangText(language, { vi: 'Data Center chuẩn Tier III', en: 'Tier III Standard Data Center', ko: 'Tier III 표준 데이터 센터', ja: 'Tier III規格データセンター', zh: 'Tier III标准数据中心', de: 'Tier III Standard-Rechenzentrum' }),
        getLangText(language, { vi: 'Precision Cooling system', en: 'Precision Cooling System', ko: '정밀 냉각 시스템', ja: '精密空調システム', zh: '精密空调系统', de: 'Präzisionskühlung' }),
        getLangText(language, { vi: 'Network & Bảo mật dữ liệu', en: 'Network & Data Security', ko: '네트워크 및 데이터 보안', ja: 'ネットワーク・データセキュリティ', zh: '网络与数据安全', de: 'Netzwerk & Datensicherheit' }),
        getLangText(language, { vi: 'CCTV & Smart Security', en: 'CCTV & Smart Security', ko: 'CCTV 및 스마트 보안', ja: 'CCTV・スマートセキュリティ', zh: 'CCTV与智能安防', de: 'CCTV & Smart Security' })
      ],
      stat1: 'Tier III', stat1l: getLangText(language, { vi: 'Chuẩn DC', en: 'DC Standard', ko: 'DC 표준', ja: 'DC規格', zh: 'DC标准', de: 'DC-Standard' }),
      stat2: '24/7', stat2l: getLangText(language, { vi: 'Giám sát', en: 'Monitoring', ko: '모니터링', ja: '監視', zh: '监控', de: 'Überwachung' }),
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
      tag: getLangText(language, { vi: 'Xây dựng kỹ thuật', en: 'Technical Construction', ko: '기술 건설', ja: '技術建設', zh: '工程建设', de: 'Technischer Bau' }),
      title: getLangText(language, { vi: 'Xây Dựng Dân Dụng & CN', en: 'Civil & Industrial Construction', ko: '민간 및 산업 건설', ja: '土木・産業建設', zh: '民用与工业建筑', de: 'Bau- & Industriebau' }),
      sub: getLangText(language, { vi: 'EPC • Nhà xưởng • Hạ tầng', en: 'EPC • Factories • Infrastructure', ko: 'EPC • 공장 • 인프라', ja: 'EPC • 工場 • インフラ', zh: 'EPC • 厂房 • 基础设施', de: 'EPC • Fabriken • Infrastruktur' }),
      desc: getLangText(language, { vi: 'Thi công công trình dân dụng, nhà xưởng công nghiệp và hạ tầng tổng hợp đi kèm các dự án năng lượng, viễn thông và quốc phòng.', en: 'Construction of civil structures, industrial factories, and integrated infrastructure supporting energy and telecom projects.', ko: '에너지, 통신 및 국방 프로젝트를 지원하는 민간 구조물, 산업 공장 및 통합 인프라 건설.', ja: 'エネルギー、通信、防衛プロジェクトを支援する土木構造物、産業工場、統合インフラの建設。', zh: '建设支撑能源、通信及国防项目的民用建筑、工业厂房及综合基础设施。', de: 'Bau von Zivilbauten, Industriefabriken und integrierter Infrastruktur.' }),
      checks: [
        getLangText(language, { vi: 'Nhà xưởng & kho công nghiệp', en: 'Factories & Warehouses', ko: '공장 및 산업 창고', ja: '工場・産業用工商業倉庫', zh: '工业厂房与仓库', de: 'Fabriken & Lagerhallen' }),
        getLangText(language, { vi: 'Hạ tầng dự án năng lượng', en: 'Energy Infrastructure', ko: '에너지 프로젝트 인프라', ja: 'エネルギープロジェクトインフラ', zh: '能源项目基础设施', de: 'Energieinfrastruktur' }),
        getLangText(language, { vi: 'Công trình quốc phòng A70', en: 'Defense Projects A70', ko: '국방 프로젝트 A70', ja: '防衛工程A70', zh: '国防工程A70', de: 'Verteidigungsprojekte A70' }),
        getLangText(language, { vi: 'M&E cơ điện', en: 'M&E Systems', ko: 'M&E 설비 시스템', ja: 'M&E設備システム', zh: 'M&E机电系统', de: 'M&E-Systeme' })
      ],
      stat1: '500+', stat1l: getLangText(language, { vi: 'Công trình', en: 'Projects', ko: '프로젝트', ja: '実績', zh: '项目', de: 'Projekte' }),
      stat2: 'EPC', stat2l: getLangText(language, { vi: 'Tổng thầu', en: 'General Contractor', ko: '총괄 계약자', ja: '元請け', zh: '总承包商', de: 'Generalunternehmer' }),
      to: '/solutions/construction',
      gradient: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
      glowBg: 'rgba(100,116,139,0.15)',
      accent: '#94a3b8',
      borderHover: 'hover:border-slate-400',
      img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=800&auto=format&fit=crop',
      tagStyle: 'bg-slate-800/60 text-slate-300 border-slate-600/50',
    },
  ];

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
            {getLangText(language, { vi: 'CTC – Giải pháp EPC toàn diện', en: 'CTC – Turnkey EPC Solutions', ko: 'CTC – 턴키 EPC 솔루션', ja: 'CTC – 一貫EPCソリューション', zh: 'CTC – 全流程EPC解决方案', de: 'CTC – Schlüsselfertige EPC-Lösungen' })}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {getLangText(language, { vi: '6 Lĩnh Vực ', en: '6 Strategic ', ko: '6대 전략 ', ja: '6つの strategic ', zh: '6大战略', de: '6 Strategische ' })}
            <span className="text-transparent bg-clip-text" style={{
              backgroundImage: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)'
            }}>
              {getLangText(language, { vi: 'Chiến Lược', en: 'Sectors', ko: '분야', ja: 'セクター', zh: '领域', de: 'Sektoren' })}
            </span>
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto font-light leading-relaxed">
            {getLangText(language, { vi: 'Dịch vụ khép kín ', en: 'End-to-end services ', ko: '원스톱 서비스 ', ja: 'エンドツーエンドサービス ', zh: '全流程服务 ', de: 'End-to-End-Dienste ' })}
            <strong className="text-slate-300">
              {getLangText(language, { vi: 'Tư vấn → Thiết kế → Thi công → Vận hành & Bảo trì', en: 'Consulting → Design → Construction → Operations & Maintenance', ko: '상담 → 설계 → 시공 → 운영 및 유지보수', ja: 'コンサルティング → 設計 → 施工 → 運用 & 保守', zh: '咨询 → 设计 → 施工 → 运营与维护', de: 'Beratung → Planung → Bau → Betrieb & Wartung' })}
            </strong>
            {getLangText(language, { vi: ' – 32+ năm kinh nghiệm, 500+ công trình hoàn thành', en: ' – 32+ years of experience, 500+ completed projects', ko: ' – 32년 이상의 경력, 500개 이상의 완료 프로젝트', ja: ' – 32年以上の実績、500件以上の完了プロジェクト', zh: ' – 32+年经验, 500+已完成工程', de: ' – 32+ Jahre Erfahrung, 500+ abgeschlossene Projekte' })}
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
            {getLangText(language, { vi: 'Cần tư vấn chi tiết? Đội ngũ kỹ sư CTC sẵn sàng hỗ trợ 24/7', en: 'Need detailed consultation? CTC engineering team is available 24/7', ko: '자세한 상담이 필요하신가요? CTC 엔지니어 팀이 24/7 대기 중입니다', ja: '詳細な相談が必要ですか？CTCエンジニアチームが24/7対応します', zh: '需要详细咨询？CTC工程师团队24/7随时待命', de: 'Benötigen Sie eine detaillierte Beratung? CTC-Ingenieure sind 24/7 für Sie da' })}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-105 hover:shadow-sky-500/30 hover:shadow-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(2,132,199,0.9) 0%, rgba(3,105,161,0.9) 100%)', border: '1px solid rgba(56,189,248,0.4)' }}
          >
            {getLangText(language, { vi: 'Nhận tư vấn miễn phí', en: 'Get Free Consultation', ko: '무료 상담 받기', ja: '無料相談を受ける', zh: '获取免费咨询', de: 'Kostenlose Beratung anfordern' })} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SolutionsOverview;
