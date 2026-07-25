import React from 'react';
import { Project } from '../../types';
import { Zap, MapPin, Calendar, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

interface ProjectInfoSidebarProps {
  project: Project;
}

const ProjectInfoSidebar: React.FC<ProjectInfoSidebarProps> = ({ project }) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Project Specs Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
          {getLangText(language, { vi: 'Thông tin dự án', en: 'Project Information', ko: '프로젝트 정보', ja: 'プロジェクト情報', zh: '项目信息', de: 'Projektinformationen' })}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="text-primary flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{getLangText(language, { vi: 'Công suất', en: 'Capacity', ko: '용량', ja: '容量', zh: '容量', de: 'Kapazität' })}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{project.capacity}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-primary flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{getLangText(language, { vi: 'Địa điểm', en: 'Location', ko: '위치', ja: '所在地', zh: '地点', de: 'Standort' })}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{project.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="text-primary flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{getLangText(language, { vi: 'Thời gian', en: 'Date', ko: '일자', ja: '日時', zh: '日期', de: 'Datum' })}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{(project as any).date || project.completionDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA Card */}
      <div className="bg-gradient-to-br from-primary to-orange-500 rounded-2xl p-6 text-white shadow-xl">
        <h3 className="text-xl font-bold mb-4">
          {getLangText(language, { vi: 'Quan tâm đến dự án này?', en: 'Interested in this project?', ko: '이 프로젝트에 관심이 있으신가요?', ja: 'このプロジェクトにご興味をお持ちですか？', zh: '对此项目感兴趣？', de: 'Interesse an diesem Projekt?' })}
        </h3>
        <p className="text-sm mb-6 opacity-90 leading-relaxed">
          {getLangText(language, { vi: 'Liên hệ với chúng tôi để được tư vấn chi tiết về giải pháp năng lượng mặt trời phù hợp.', en: 'Contact us for detailed consultation on suitable green energy solutions.', ko: '적합한 친환경 에너지 솔루션에 대한 자세한 상담을 위해 문의하세요.', ja: '最適なグリーンエネルギーソリューションに関する詳細なコンサルティングについてはお問い合わせください。', zh: '联系我们以获取全面合宜的绿色能源解决方案咨询。', de: 'Kontaktieren Sie uns für eine ausführliche Beratung.' })}
        </p>
        <div className="space-y-3">
          <Link 
            to="/contact" 
            className="w-full bg-white text-primary py-3 rounded-lg font-bold text-center block hover:bg-gray-100 transition-colors shadow-md"
          >
            {getLangText(language, { vi: 'Liên hệ tư vấn', en: 'Contact for Advice', ko: '상담 문의', ja: 'お問い合わせ', zh: '联系咨询', de: 'Beratung anfordern' })}
          </Link>
          <a 
            href="tel:0915059666" 
            className="w-full border border-white/40 text-white py-3 rounded-lg font-bold text-center block hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Phone size={18} /> {getLangText(language, { vi: 'Gọi ngay 0915 059 666', en: 'Call Now 0915 059 666', ko: '지금 전화 0915 059 666', ja: '今すぐお電話 0915 059 666', zh: '立即致电 0915 059 666', de: 'Jetzt anrufen 0915 059 666' })}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoSidebar;
