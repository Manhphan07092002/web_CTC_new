import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Project } from '../types';
import { ArrowLeft, Calendar, MapPin, Zap, DollarSign, Users, CheckCircle, Share2, Eye, Phone, Mail, ChevronRight, Home, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';

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

  if (loading) return <div className="w-full h-[60vh] flex items-center justify-center"><div className="animate-spin-slow text-primary text-4xl">☀️</div></div>;

  if (!project) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Không tìm thấy dự án</h2>
      <Link to="/projects" className="text-primary hover:underline mt-4 block">Xem tất cả dự án</Link>
    </div>
  );

  const getProjectSchema = (project: Project) => ({
    "@context": "https://schema.org/",
    "@type": "CreativeWork",
    "@id": `${window.location.origin}/projects/${id}`,
    "name": project.title,
    "image": project.image?.startsWith('http') ? project.image : `${window.location.origin}${project.image}`,
    "description": project.description,
    "dateCreated": project.completionDate,
    "locationCreated": {
      "@type": "Place",
      "name": project.location,
      "address": project.location
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
      "description": `Dự án lắp đặt điện mặt trời công suất ${project.capacity} tại ${project.location}`
    }
  });

  return (
    <div className="bg-gray-50 font-sans text-gray-700 dark:text-gray-300 pb-20 animate-fade-in">
      <SEO 
        title={project.title}
        description={project.description?.substring(0, 160) || ''}
        image={project.image}
        schema={getProjectSchema(project)}
      />

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-primary flex items-center gap-1"><Home size={14}/> {t('nav.home')}</Link>
            <ChevronRight size={14} className="mx-2"/>
            <Link to="/projects" className="hover:text-primary">Dự án</Link>
            <ChevronRight size={14} className="mx-2"/>
            <span className="text-corporate font-semibold truncate">{project.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8">
          <div className="container mx-auto">
            <div className="max-w-3xl text-white">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full">
                  {project.category}
                </span>
                <span className="px-4 py-2 bg-white dark:bg-gray-800/20 backdrop-blur-md text-white text-sm font-bold rounded-full border border-white/30">
                  {project.capacity}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{project.date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mô tả dự án</h2>
              <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400">
                <p className="leading-relaxed">{project.description}</p>
              </div>
            </div>

            {/* Project Features */}
            {project.features && project.features.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tính năng nổi bật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Thông tin dự án</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="text-primary" size={20} />
                  <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Công suất</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.capacity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-primary" size={20} />
                  <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Địa điểm</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-primary" size={20} />
                  <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Thời gian</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.date}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-gradient-to-br from-primary to-orange-500 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Quan tâm đến dự án này?</h3>
              <p className="text-sm mb-6 opacity-90">Liên hệ với chúng tôi để được tư vấn chi tiết về giải pháp năng lượng mặt trời phù hợp.</p>
              <div className="space-y-3">
                <Link 
                  to="/contact" 
                  className="w-full bg-white dark:bg-gray-900 text-primary py-3 rounded-lg font-bold text-center block hover:bg-gray-100 transition-colors"
                >
                  Liên hệ tư vấn
                </Link>
                <a 
                  href="tel:0915059666" 
                  className="w-full border border-white/30 text-white py-3 rounded-lg font-bold text-center block hover:bg-white dark:bg-gray-900/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone size={18} /> Gọi ngay
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-corporate mb-8 border-l-4 border-primary pl-3">Dự án liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProjects.map((item, index) => (
                <Link key={`related-project-${item._id}-${index}`} to={`/projects/${item._id}`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group">
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                        {item.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
