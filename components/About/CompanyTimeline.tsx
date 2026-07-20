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
      title: t('about.milestone_1') || 'Khởi đầu hoạt động',
      desc: 'Khởi nguồn từ đơn vị xây lắp thuộc ngành Bưu chính – Viễn thông Việt Nam, xây dựng hạ tầng kỹ thuật ban đầu.'
    },
    {
      year: '2004',
      title: 'Chính thức cổ phần hóa',
      desc: 'Thành lập Công ty Cổ phần Xây lắp Bưu điện Miền Trung (30/01/2004) theo Quyết định của Bộ trưởng Bộ Bưu chính, Viễn thông.'
    },
    {
      year: '2015',
      title: 'Tăng trưởng & Tái cơ cấu',
      desc: 'Thay đổi đăng ký kinh doanh lần thứ 9 (13/11/2015), mở rộng quy mô vốn điều lệ và chuẩn hóa quy trình quản trị.'
    },
    {
      year: '2020',
      title: 'Chứng chỉ Năng lực Xây dựng',
      desc: 'Bộ Xây dựng cấp Chứng chỉ năng lực hoạt động xây dựng công trình kỹ thuật, đường dây & trạm biến áp.'
    },
    {
      year: '2021 - 2024',
      title: t('about.milestone_2') || 'Mở rộng Năng lượng tái tạo',
      desc: 'Thi công hơn 500+ dự án: Tuyến cáp quang Bộ Công an, Metro Mobifone, điện gió Hướng Linh & Hướng Hiệp, điện mặt trời C&I.'
    },
    {
      year: '2025 - 2026',
      title: 'Bứt phá & Chuyển đổi số',
      desc: 'Bứt phá doanh thu 288+ tỷ VNĐ, phát triển mạnh Tổng thầu EPC Điện gió, Điện mặt trời, Data Center và Hạ tầng số.'
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
            Hành Trình 32+ Năm Hình Thành & Phát Triển
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-light">
            Những cột mốc quan trọng khẳng định uy tín và vị thế của CTC trong ngành xây lắp viễn thông & năng lượng.
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
