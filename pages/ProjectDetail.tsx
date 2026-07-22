import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Project } from '../types';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();

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
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Không tìm thấy dự án</h2>
      <Link to="/projects" className="text-primary hover:underline mt-4 block font-semibold">Xem tất cả dự án</Link>
    </div>
  );

  const getProjectSchema = (p: Project) => ({
    "@context": "https://schema.org/",
    "@type": "CreativeWork",
    "@id": `${window.location.origin}/projects/${id}`,
    "name": p.title,
    "image": p.image?.startsWith('http') ? p.image : `${window.location.origin}${p.image}`,
    "description": p.description,
    "dateCreated": p.date || p.completionDate,
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
    <div className="bg-gray-50 dark:bg-gray-900 font-sans text-gray-700 dark:text-gray-300 pb-20 animate-fade-in">
      <SEO 
        title={project.title}
        description={project.description?.substring(0, 160) || ''}
        image={project.image}
        schema={getProjectSchema(project)}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-primary flex items-center gap-1"><Home size={14}/> {t('nav.home')}</Link>
            <ChevronRight size={14} className="mx-2"/>
            <Link to="/projects" className="hover:text-primary">Dự án</Link>
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
                Mô tả dự án
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
                <p className="leading-relaxed whitespace-pre-line">{project.description}</p>
              </div>
            </div>

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
