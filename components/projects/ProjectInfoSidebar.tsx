import React, { useState } from 'react';
import { Project } from '../../types';
import { Zap, MapPin, Calendar, Phone, Award, ShieldCheck, ArrowRight, MessageSquare, Calculator, Leaf, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

interface ProjectInfoSidebarProps {
  project: Project;
}

export const ProjectInfoSidebar: React.FC<ProjectInfoSidebarProps> = ({ project }) => {
  const { language } = useLanguage();

  // Extract initial capacity number from string e.g. "50kWp" -> 50
  const parseCapacityNum = (str?: string): number => {
    if (!str) return 50;
    const match = str.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 50;
  };

  const [capacityKwp, setCapacityKwp] = useState<number>(parseCapacityNum(project.capacity));

  // Solar Math formulas (standard Vietnam climate avg 3.8 - 4.2 kWh/kWp/day)
  const annualKwh = Math.round(capacityKwp * 3.9 * 365);
  const annualSavingsVnd = Math.round(annualKwh * 2100); // avg commercial tariff 2,100 VND/kWh
  const co2ReducedTons = (annualKwh * 0.00085).toFixed(1);

  const specs = [
    {
      icon: <Zap className="text-amber-500" size={20} />,
      label: getLangText(language, { vi: 'Công suất lắp đặt', en: 'Installed Capacity', ko: '설치 용량', ja: '設置容量', zh: '装机容量', de: 'Installierte Leistung' }),
      value: project.capacity || 'Liên hệ',
      highlight: true
    },
    {
      icon: <MapPin className="text-primary" size={20} />,
      label: getLangText(language, { vi: 'Địa điểm thi công', en: 'Location', ko: '위치', ja: '所在地', zh: '地点', de: 'Standort' }),
      value: project.location || 'Việt Nam'
    },
    {
      icon: <Calendar className="text-violet-500" size={20} />,
      label: getLangText(language, { vi: 'Năm hoàn thành', en: 'Completion Date', ko: '완공일', ja: '完了日', zh: '竣工日期', de: 'Fertigstellungsdatum' }),
      value: (project as any).date || project.completionDate || '2025'
    },
    {
      icon: <Award className="text-emerald-500" size={20} />,
      label: getLangText(language, { vi: 'Hạng mục thi công', en: 'Project Scope', ko: '프로젝트 범위', ja: '施工範囲', zh: '施工范围', de: 'Projektumfang' }),
      value: project.category || 'Điện mặt trời EPC'
    },
    {
      icon: <ShieldCheck className="text-blue-500" size={20} />,
      label: getLangText(language, { vi: 'Cam kết bảo hành', en: 'Warranty', ko: '보증', ja: '保証', zh: '质保', de: 'Garantie' }),
      value: '12-25 năm chính hãng'
    }
  ];

  return (
    <div className="space-y-6 sticky top-32">
      {/* Project Specs Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 space-y-5">
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
          <Award className="text-primary" size={20} />
          {getLangText(language, { vi: 'Thông số kỹ thuật dự án', en: 'Project Specifications', ko: '프로젝트 사양', ja: 'プロジェクト仕様', zh: '项目规格', de: 'Projektspezifikationen' })}
        </h3>

        <div className="space-y-4">
          {specs.map((item, idx) => (
            <div key={idx} className={`p-3.5 rounded-2xl flex items-center gap-3.5 transition-all ${
              item.highlight 
                ? 'bg-amber-500/10 dark:bg-amber-500/20 border border-amber-400/30' 
                : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700/60'
            }`}>
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.label}</p>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white truncate mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solar Energy Savings Calculator Widget */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <span className="flex items-center gap-2">
            <Calculator className="text-amber-500" size={18} />
            Dự toán sản lượng & Tiết kiệm
          </span>
          <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md font-bold">
            Tính nhanh
          </span>
        </h3>

        {/* Capacity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-500 dark:text-gray-400">Công suất thiết kế:</span>
            <span className="text-primary font-black text-sm">{capacityKwp} kWp</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="500" 
            step="10"
            value={capacityKwp}
            onChange={e => setCapacityKwp(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Dynamic Computed Outputs */}
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Sản lượng dự kiến/năm:</span>
            </div>
            <span className="font-black text-xs text-amber-700 dark:text-amber-300">{annualKwh.toLocaleString()} kWh</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Tiết kiệm chi phí/năm:</span>
            </div>
            <span className="font-black text-xs text-emerald-700 dark:text-emerald-300">{annualSavingsVnd.toLocaleString()} VNĐ</span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf size={16} className="text-blue-500" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Giảm phát thải CO2:</span>
            </div>
            <span className="font-black text-xs text-blue-700 dark:text-blue-300">{co2ReducedTons} tấn/năm</span>
          </div>
        </div>
      </div>

      {/* High Converting Contact CTA Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-blue-800 to-slate-950 p-7 text-white shadow-2xl space-y-5 border border-sky-400/20 group">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-sky-500/20 blur-2xl group-hover:scale-125 transition-transform" />
        
        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 border border-white/10">
          Tư vấn giải pháp tương tự
        </span>

        <h3 className="text-xl font-black leading-tight">
          {getLangText(language, { vi: 'Bạn muốn triển khai hệ thống tương tự?', en: 'Want a similar solar system?', ko: '유사한 시스템을 구축하시겠습니까?', ja: '同様のシステムをご検討ですか？', zh: '想要建设类似系统？', de: 'Möchten Sie một tương tự?' })}
        </h3>

        <p className="text-xs text-slate-200 leading-relaxed opacity-90">
          {getLangText(language, { 
            vi: 'Đội ngũ kỹ sư CTC sẵn sàng khảo sát thực tế và lập phương án tài chính & kỹ thuật tối ưu miễn phí.', 
            en: 'CTC engineering team is ready for site survey and free optimal financial & technical proposal.',
            ko: 'CTC 엔지니어링 팀이 현장 조사 및 무료 최적의 재정 và 기술 제안을 chuẩn bị합니다.',
            ja: 'CTCエンジニアチームが現地調査と最適な財務・技術提案を rơ-mi-um でご cung cấp.',
            zh: 'CTC工程师团队随时准备现场勘测并免费 provide 最佳财务与技术方案。',
            de: 'Das CTC-Ingenieurteam steht für eine Standortbesichtigung bereit.' 
          })}
        </p>

        <div className="space-y-3 pt-2">
          <Link 
            to="/contact" 
            className="w-full py-3.5 px-4 bg-white text-blue-800 font-black text-xs uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-2 hover:bg-amber-300 hover:text-slate-900 transition-all shadow-xl group-hover:translate-x-0.5"
          >
            <MessageSquare size={16} className="text-blue-800" />
            {getLangText(language, { vi: 'Đăng ký tư vấn miễn phí', en: 'Request Free Advice', ko: '무료 상담 신청', ja: '無料相談を申し込む', zh: '申请免费咨询', de: 'Kostenlose Beratung anfordern' })}
            <ArrowRight size={14} />
          </Link>

          <a 
            href="tel:0915059666" 
            className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-2 transition-all backdrop-blur-md"
          >
            <Phone size={16} className="text-amber-400 animate-pulse" />
            Hotline: 0915 059 666
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoSidebar;
