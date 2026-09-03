import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Project } from '../types';
import { ChevronRight, Home, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLangText } from '../utils/translation-helper';
import SEO from '../components/SEO';
import Loading from '../components/Loading';

import {
  ProjectGallery,
  ProjectFeatures,
  ProjectInfoSidebar,
  RelatedProjects
} from '../components/projects';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchProject = async () => {
      if (id) {
        setLoading(true);
        try {
          const projectData = await api.projects.getById(id);
          setProject(projectData);
          
          if (projectData) {
            const allProjects = await api.projects.getAll();
            const related = allProjects.filter(p => p.category === projectData.category && p._id !== projectData._id).slice(0, 3);
            setRelatedProjects(related);
          }
        } catch (error) {
          console.error('Error fetching project:', error);
        }
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <Loading fullScreen={false} className="h-[60vh]" />;

  if (!project) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
        {getLangText(language, { vi: 'Không tìm thấy dự án', en: 'Project not found', ko: '프로젝트를 찾을 수 없습니다', ja: 'プロジェクトが見つかりません', zh: '未找到项目', de: 'Projekt nicht gefunden' })}
      </h2>
      <Link to="/projects" className="text-primary hover:underline mt-4 block font-semibold">
        {getLangText(language, { vi: 'Xem tất cả dự án', en: 'View all projects', ko: '모든 프로젝트 보기', ja: 'すべてのプロジェクトを見る', zh: '查看所有项目', de: 'Alle Projekte anzeigen' })}
      </Link>
    </div>
  );

  const getProjectSchema = (p: Project) => ({
    "@context": "https://schema.org/",
    "@type": "CreativeWork",
    "@id": `${window.location.origin}/projects/${id}`,
    "name": p.title,
    "image": p.image?.startsWith('http') ? p.image : `${window.location.origin}${p.image}`,
    "description": p.description?.replace(/<[^>]*>/g, '') || '',
    "dateCreated": (p as any).date || p.completionDate,
    "locationCreated": {
      "@type": "Place",
      "name": p.location,
      "address": p.location
    },
    "creator": {
      "@type": "Organization",
      "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
      "url": "https://www.ctcdn.vn",
      "telephone": "+84-915-059-666",
      "email": "info@ctcdn.vn"
    },
    "about": {
      "@type": "Thing",
      "name": "Hệ thống điện mặt trời",
      "description": `Dự án lắp đặt điện mặt trời công suất ${p.capacity} tại ${p.location}`
    }
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 font-sans text-gray-700 dark:text-gray-300 pt-36 sm:pt-44 md:pt-48 pb-20 animate-fade-in">
      <SEO 
        title={project.title}
        description={project.description?.replace(/<[^>]*>/g, '').substring(0, 160) || ''}
        image={project.image}
        schema={getProjectSchema(project)}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-primary flex items-center gap-1"><Home size={14}/> {t('nav.home')}</Link>
            <ChevronRight size={14} className="mx-2"/>
            <Link to="/projects" className="hover:text-primary">{t('nav.projects') || getLangText(language, { vi: 'Dự án', en: 'Projects', ko: '프로젝트', ja: 'プロジェクト', zh: '项目', de: 'Projekte' })}</Link>
            <ChevronRight size={14} className="mx-2"/>
            <span className="text-corporate dark:text-primary font-semibold truncate">{project.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Banner Component */}
      <div className="container mx-auto px-4 pt-8">
        <ProjectGallery project={project} />
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Detailed Content & Features */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-10 space-y-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">
                {getLangText(language, { vi: 'Chi tiết & Mô tả dự án', en: 'Project Details & Description', ko: '프로젝트 세부 정보', ja: 'プロジェクトの詳細', zh: '项目详情与描述', de: 'Projektdetails & Beschreibung' })}
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-sans [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-corporate dark:[&_h2]:text-white [&_h2]:mb-4 [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-primary [&_a]:hover:underline [&_a]:font-semibold">
                {/<[a-z][\s\S]*>/i.test(project.description || '') ? (
                  <div dangerouslySetInnerHTML={{ __html: project.description }} />
                ) : (
                  <p className="whitespace-pre-line text-base sm:text-lg leading-relaxed">{project.description}</p>
                )}
              </div>
            </div>

            {/* Real Project Photo Album Grid if multiple images exist */}
            {project.images && project.images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-10 space-y-6">
                <div className="border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <ImageIcon className="text-primary" size={24} />
                      {getLangText(language, { vi: 'Thư viện ảnh thực tế công trình', en: 'Site Construction Gallery', ko: '현장 시공 사진 갤러리', ja: '現場施工写真ギャラリー', zh: '现场施工照片画廊', de: 'Baustellen-Fotogalerie' })}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {getLangText(language, { vi: 'Hình ảnh chi tiết về kết cấu lắp đặt, pin năng lượng mặt trời, inverter và trạm đấu nối của dự án', en: 'Detailed photos of solar installation, panels, inverters and substation', ko: '태양광 모듈, 인버터 및 변전소 시공 사진', ja: '太陽光パネル、インバーター、変電所の施工写真', zh: '太阳能光伏组件、逆变器及变电站施工照片', de: 'Detaillierte Fotos der Solaranlage und Komponenten' })}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full">
                    {[project.image, ...project.images].filter((img, i, arr) => Boolean(img) && arr.indexOf(img) === i).length} ảnh thực tế
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[project.image, ...project.images].filter((img, i, arr) => Boolean(img) && arr.indexOf(img) === i).map((img, idx) => (
                    <div 
                      key={idx}
                      className="group relative aspect-4/3 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-slate-800"
                    >
                      <img 
                        src={img} 
                        alt={`${project.title} - Ảnh ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-white text-xs font-bold flex items-center gap-1">
                          <Maximize2 size={13} /> Góc chụp #{idx + 1}
                        </span>
                      </div>
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Subcomponent */}
            <ProjectFeatures features={project.features} />
          </div>

          {/* Sidebar Specs & CTA Component */}
          <div>
            <ProjectInfoSidebar project={project} />
          </div>
        </div>

        {/* Related Projects Subcomponent */}
        <RelatedProjects projects={relatedProjects} />
      </div>
    </div>
  );
};

export default ProjectDetail;
