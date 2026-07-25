import React from 'react';
import { Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';

interface MilestoneItem {
  year: string;
  title: string;
  desc: string;
}

const TimelineAlternatingNode: React.FC<{ item: MilestoneItem; index: number }> = ({ item, index }) => {
  const { ref, isInView } = useInView(0.15);
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative flex flex-col md:flex-row items-center">
      {/* Central Node Dot (hidden on mobile, centered on desktop) */}
      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center z-10">
        <span 
          className={`w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-4 transition-all duration-700 shadow-md ${
            isInView ? 'scale-110 border-sky-500 ring-4 ring-sky-500/20' : 'scale-75 border-slate-300 dark:border-slate-700'
          }`}
        ></span>
        {isInView && (
          <div className="absolute w-3.5 h-3.5 rounded-full bg-sky-500/40 animate-ping"></div>
        )}
      </div>

      {/* Card Wrapper alternating left and right on desktop */}
      <div 
        className={`w-full md:w-[46%] ${
          isEven ? 'md:mr-auto md:pr-4' : 'md:ml-auto md:pl-4'
        } transition-all duration-700 transform ${
          isInView 
            ? 'opacity-100 translate-y-0 scale-100' 
            : `opacity-0 translate-y-10 scale-95 ${isEven ? 'md:-translate-x-6' : 'md:translate-x-6'}`
        }`}
        style={{ transitionDelay: `${index * 80}ms` }}
      >
        <div className="p-6 md:p-8 border border-white/80 dark:border-white/10 bg-gradient-to-b from-white/80 via-white/60 to-slate-100/50 dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] hover:border-sky-500/40 hover:shadow-xl transition-all duration-300 rounded-3xl relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-2xl md:text-3xl tracking-tight text-sky-500 dark:text-sky-400 block">
              {item.year}
            </span>
            <div className="w-2 h-2 rounded-full bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg mb-2">
            {item.title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed text-justify">
            {item.desc}
          </p>
        </div>
      </div>
    </div>
  );
};

const CompanyTimeline: React.FC = () => {
  const { t, language } = useLanguage();

  const isEn = language === 'en';
  const isKo = language === 'ko';
  const isJa = language === 'ja';
  const isZh = language === 'zh';
  const isDe = language === 'de';

  const sectionHeading = isEn ? "32+ Years Journey of Growth & Development" : isKo ? "32+년 설립 및 발전의 여정" : isJa ? "32年以上の歩みと発展の歴史" : isZh ? "32+年创立与发展历程" : isDe ? "32+ Jahre Geschichte & Entwicklung" : "Hành Trình 32+ Năm Hình Thành & Phát Triển";
  
  const sectionSub = isEn ? "Important milestones affirming CTC's reputation and leading position in telecom & energy construction." : isKo ? "통신 및 에너지 시공 분야에서 CTC의 명성과 입지를 입증하는 주요 이정표." : isJa ? "通信・エネルギー建設業界におけるCTCの信頼と地位を確立した重要なマイルストーン。" : isZh ? "印证CTC在通信与能源建设领域声誉与地位的重要里程碑。" : isDe ? "Wichtige Meilensteine, die den Ruf und die Position von CTC festigen." : "Những cột mốc quan trọng khẳng định uy tín và vị thế của CTC trong ngành xây lắp viễn thông & năng lượng.";

  const milestoneTitleMap = {
    vi: 'Quá trình hình thành & phát triển',
    en: 'Milestones & History',
    ko: '연혁 및 이정표',
    ja: '沿革とマイルストーン',
    zh: '发展历程与里程碑',
    de: 'Meilensteine & Geschichte'
  };
  const currentMilestoneTitle = milestoneTitleMap[language as keyof typeof milestoneTitleMap] || milestoneTitleMap.vi;

  const milestones: MilestoneItem[] = [
    {
      year: '1993',
      title: isEn ? 'Founded CTC' : isKo ? 'CTC 설립' : isJa ? 'CTC設立' : isZh ? 'CTC创立' : isDe ? 'CTC Gründung' : 'Khởi đầu hoạt động',
      desc: isEn ? 'Originated as a construction unit under Vietnam Posts and Telecommunications, building initial technical infrastructure.' : isKo ? '베트남 우정통신부 산하 시공 단위로 출발하여 초기 기술 인프라를 구축함.' : isJa ? 'ベトナム郵政・通信部門の建設部門としてスタートし、初期の技術インフラを構築。' : isZh ? '源自越南邮政通信部门属下的施工单位，建设初始技术基础设施。' : isDe ? 'Entstanden als Baueinheit unter der vietnamesischen Post und Telekommunikation.' : 'Khởi nguồn từ đơn vị xây lắp thuộc ngành Bưu chính – Viễn thông Việt Nam, xây dựng hạ tầng kỹ thuật ban đầu.'
    },
    {
      year: '2004',
      title: isEn ? 'Official Equitization' : isKo ? '공식 주식회사 전환' : isJa ? '正式な株式化' : isZh ? '正式股份化' : isDe ? 'Offizielle Umwandlung' : 'Chính thức cổ phần hóa',
      desc: isEn ? 'Established Central Vietnam Posts and Telecommunications Construction Joint Stock Company (Jan 30, 2004) under Ministry Decision.' : isKo ? '우정통신부 장관 결정에 따라 중부우정통신시공 주식회사 설립 (2004년 1월 30일).' : isJa ? '郵政通信大臣の決定に基づき、中部郵政通信建設株式會社を設立 (2004年1月30日)。' : isZh ? '根据邮政通信部部长的决定，成立中部邮政通信建设股份有限公司（2004年1月30日）。' : isDe ? 'Gründung der Central Vietnam Posts and Telecommunications Construction Joint Stock Company (30.01.2004).' : 'Thành lập Công ty Cổ phần Xây lắp Bưu điện Miền Trung (30/01/2004) theo Quyết định của Bộ trưởng Bộ Bưu chính, Viễn thông.'
    },
    {
      year: '2015',
      title: isEn ? 'Growth & Restructuring' : isKo ? '성장 및 구조조정' : isJa ? '成長と re-structuring' : isZh ? "增长与重组" : isDe ? 'Wachstum & Umstrukturierung' : 'Tăng trưởng & Tái cơ cấu',
      desc: isEn ? '9th business registration change (Nov 13, 2015), expanding charter capital and standardizing governance processes.' : isKo ? '제9차 사업자 등록 변경 (2015년 11월 13일), 자본금 확충 및 경영 프로세스 표준화.' : isJa ? '第9回事業登録変更 (2015年11月13日)、資本金の拡大とガバナンスプロセスの標準化。' : isZh ? '第9次变更营业执照（2015年11月13日），扩大注册资本并规范管理流程。' : isDe ? '9. Änderung der Gewerbeanmeldung (13.11.2015), Aufstockung des Stammkapitals.' : 'Thay đổi đăng ký kinh doanh lần thứ 9 (13/11/2015), mở rộng quy mô vốn điều lệ và chuẩn hóa quy trình quản trị.'
    },
    {
      year: '2020',
      title: isEn ? 'Construction Capacity Certificate' : isKo ? '건설 역량 인증서' : isJa ? '建設能力認定証' : isZh ? '建设能力证书' : isDe ? 'Baukompetenzzertifikat' : 'Chứng chỉ Năng lực Xây dựng',
      desc: isEn ? 'Ministry of Construction granted Construction Capacity Certificate for technical infrastructure, lines & transformer stations.' : isKo ? '건설부로부터 기술 인프라, 전선 및 변전소 시공 역량 인증서 취득.' : isJa ? '建設省より技術インフラ、送電線および変電所工事の建設能力認定証を取得。' : isZh ? '建设部颁发工程技术、输线路及变电站施工能力证书。' : isDe ? 'Das Bauministerium erteilte das Baukompetenzzertifikat für technische Infrastruktur.' : 'Bộ Xây dựng cấp Chứng chỉ năng lực hoạt động xây dựng công trình kỹ thuật, đường dây & trạm biến áp.'
    },
    {
      year: '2021 - 2024',
      title: isEn ? 'Renewable Energy Expansion' : isKo ? '신재생 에너지 확장' : isJa ? '再生可能エネルギーへの拡大' : isZh ? '扩展可再生能源' : isDe ? 'Expansion erneuerbarer Energien' : 'Mở rộng Năng lượng tái tạo',
      desc: isEn ? 'Constructed 500+ projects: Police fiber line, Metro Mobifone, Huong Linh & Huong Hiep wind farms, C&I solar systems.' : isKo ? '500개 이상의 프로젝트 시공: 공안부 광케이블, 메트로 모비폰, 풍력 발전소 및 C&I 태양광.' : isJa ? '500以上のプロジェクトを施工：公安部光ファイバー、メトロMobifone、風力発電所およびC&I太陽光。' : isZh ? '施工500多个项目：公安部光缆专线、Mobifone Metro、风电场及工商业光伏。' : isDe ? 'Über 500+ Projekte gebaut: Glasfaser der Polizei, Metro Mobifone, Windparks & C&I-Solar.' : 'Thi công hơn 500+ dự án: Tuyến cáp quang Bộ Công an, Metro Mobifone, điện gió Hướng Linh & Hướng Hiệp, điện mặt trời C&I.'
    },
    {
      year: '2025 - 2026',
      title: isEn ? 'Breakthrough & Digital Transformation' : isKo ? '도약 및 디지털 전환' : isJa ? '飛躍とデジタル変革' : isZh ? '突破与数字化转型' : isDe ? 'Durchbruch & Digitale Transformation' : 'Bứt phá & Chuyển đổi số',
      desc: isEn ? 'Revenue breakthrough of $12M+, strong EPC general contractor in Wind, Solar, Data Center & Digital Infrastructure.' : isKo ? '288억 동 이상의 매출 달성, 풍력, 태양광, 데이터 센터 및 디지털 인프라 EPC 총괄 강세.' : isJa ? '収益2,880億ドン突破、風力・太陽光・データセンターおよびデジタルインフラのEPCを強力に推進。' : isZh ? "营收突破2.88亿越南盾，大力发展风电、光伏、数据中心及数字基础设施EPC总承包。" : isDe ? 'Umsatzdurchbruch von über 12 Mio. $, starker EPC-Generalunternehmer für Wind, Solar & Rechenzentren.' : 'Bứt phá doanh thu 288+ tỷ VNĐ, phát triển mạnh Tổng thầu EPC Điện gió, Điện mặt trời, Data Center và Hạ tầng số.'
    }
  ];

  return (
    <div className="py-16 lg:py-24 bg-slate-50 dark:bg-[#060d1d] relative overflow-hidden transition-colors duration-300 border-b border-slate-200/60 dark:border-white/10">
      {/* Blueprint grid lines */}
      <div className="absolute inset-0 opacity-40 pointer-events-none z-1" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px'
      }}></div>
      <style dangerouslySetInnerHTML={{ __html: `
        .dark .about-lines-timeline {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
      `}} />
      <div className="absolute inset-0 about-lines-timeline z-1 opacity-40 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            <Calendar size={14} />
            <span>{currentMilestoneTitle}</span>
          </div>
          {/* USER REQUESTED: Giảm font size */}
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            {sectionHeading}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-light">
            {sectionSub}
          </p>
        </div>

        {/* Central Alternating Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central Vertical Line (visible on desktop) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-sky-500 via-blue-600 to-sky-400 opacity-30 dark:opacity-40 hidden md:block"></div>

          <div className="space-y-10 md:space-y-12">
            {milestones.map((item, index) => (
              <TimelineAlternatingNode key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyTimeline;
