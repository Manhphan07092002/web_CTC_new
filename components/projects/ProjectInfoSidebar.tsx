import React from 'react';
import { Project } from '../../types';
import { Zap, MapPin, Calendar, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectInfoSidebarProps {
  project: Project;
}

const ProjectInfoSidebar: React.FC<ProjectInfoSidebarProps> = ({ project }) => {
  return (
    <div className="space-y-6">
      {/* Project Specs Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
          Thông tin dự án
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="text-primary flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Công suất</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{project.capacity}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-primary flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Địa điểm</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{project.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="text-primary flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Thời gian</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{(project as any).date || project.completionDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA Card */}
      <div className="bg-gradient-to-br from-primary to-orange-500 rounded-2xl p-6 text-white shadow-xl">
        <h3 className="text-xl font-bold mb-4">Quan tâm đến dự án này?</h3>
        <p className="text-sm mb-6 opacity-90 leading-relaxed">
          Liên hệ với chúng tôi để được tư vấn chi tiết về giải pháp năng lượng mặt trời phù hợp.
        </p>
        <div className="space-y-3">
          <Link 
            to="/contact" 
            className="w-full bg-white text-primary py-3 rounded-lg font-bold text-center block hover:bg-gray-100 transition-colors shadow-md"
          >
            Liên hệ tư vấn
          </Link>
          <a 
            href="tel:0915059666" 
            className="w-full border border-white/40 text-white py-3 rounded-lg font-bold text-center block hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Phone size={18} /> Gọi ngay 0915 059 666
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoSidebar;
