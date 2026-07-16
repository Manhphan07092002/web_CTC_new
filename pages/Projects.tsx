import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Project } from '../types';
import { MapPin, Calendar, Zap, ChevronRight, Filter, Home, X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import CategoryFilter from '../components/CategoryFilter';
import { useProjectCategories } from '../hooks/useCategories';
import analyticsTracking from '../services/analytics-tracking';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { getCategoryById } = useProjectCategories();

  useEffect(() => {
    // Track page view
    analyticsTracking.trackPageView('/projects', { title: 'Projects Page' });
    
    const fetchProjects = async () => {
      setLoading(true);
      let data = await api.projects.getAll();
      
      // Filter by category if selected
      if (selectedCategoryId) {
        data = data.filter(project => project.categoryId === selectedCategoryId);
      }
      
      // Sort: Featured first (by featuredOrder), then by date
      const sorted = data.sort((a, b) => {
        // Featured items first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        // If both featured, sort by featuredOrder
        if (a.isFeatured && b.isFeatured) {
          return (a.featuredOrder || 0) - (b.featuredOrder || 0);
        }
        // If both not featured, sort by date (newest first)
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setProjects(sorted);
      setLoading(false);
    };
    fetchProjects();
  }, [selectedCategoryId, language]);

  const openModal = (project: Project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

  const getProjectSchema = (project: Project) => ({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": project.description,
    "image": project.image?.startsWith('http') ? project.image : `${window.location.origin}${project.image}`,
    "locationCreated": {
       "@type": "Place",
       "name": project.location,
       "address": project.location
    },
    "dateCreated": project.completionDate,
    "creator": {
       "@type": "Organization",
       "name": "CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN TRẦN LÊ",
       "url": "https://tranle.vn",
       "telephone": "+84-236-656-2020"
    }
  });

  if (loading) return <div className="w-full py-20 text-center">{t('common.loading')}</div>;

  return (
    <div className="w-full pb-20 animate-fade-in relative">
      <SEO 
        title={selectedProject ? selectedProject.title : t('projects.title')}
        description={selectedProject ? `${selectedProject.title} - ${selectedProject.location}. ${selectedProject.capacity}.` : t('projects.subtitle')}
        image={selectedProject?.image}
        schema={selectedProject ? getProjectSchema(selectedProject) : {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Dự án điện mặt trời - TRAN LE Electricity",
            "description": "Danh sách các dự án lắp đặt hệ thống điện mặt trời đã hoàn thành bởi CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN TRẦN LÊ",
            "publisher": {
              "@type": "Organization",
              "name": "TRAN LE Electricity",
              "url": "https://tranle.vn"
            }
        }}
      />

      <div className="bg-corporate py-12 text-white">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="mb-6">
            <CategoryFilter
              type="project"
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={setSelectedCategoryId}
              showAll={true}
            />
          </div>
          <h1 className="text-3xl font-bold">{t('projects.title')}</h1>
          <p className="opacity-80 mt-2">{t('projects.subtitle')}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {projects.map((project, idx) => (
            <div 
              key={`${project.id}-${idx}`} 
              className="flex flex-col bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              onClick={() => navigate(`/projects/${project._id || project.id}`)}
            >
              <div className="h-64 overflow-hidden relative">
                 <img src={project.image} alt={project.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                 {project.isFeatured && (
                   <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                     ⭐ Nổi bật
                   </div>
                 )}
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-primary font-bold text-sm tracking-wider uppercase">
                       <MapPin size={14} className="mr-1"/> {project.location}
                    </div>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-bold">{project.completionDate}</span>
                </div>
                <h3 className="text-2xl font-bold text-corporate mb-3 group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-gray-600 mb-6 flex-1 line-clamp-2">{project.description}</p>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-sm font-bold text-gray-500 flex items-center gap-1">
                    <Zap size={16} className="text-yellow-500"/> {t('projects.capacity')}: <span className="text-corporate">{project.capacity}</span>
                  </div>
                  <span className="text-primary font-bold hover:text-secondary text-sm">{t('projects.view_detail')} &rarr;</span>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
             <div className="col-span-full text-center py-12 text-gray-500">{t('projects.no_projects')}</div>
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 bg-white/20 hover:bg-black/10 p-2 rounded-full z-20 transition-colors">
              <X size={24} className="text-gray-800 md:text-white drop-shadow-md" />
            </button>
            
            <div className="relative h-64 md:h-80">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{selectedProject.title}</h2>
                <p className="flex items-center gap-2 opacity-90"><MapPin size={18} /> {selectedProject.location}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-gray-500 text-xs uppercase mb-1">{t('projects.capacity')}</div>
                  <div className="text-xl font-bold text-corporate">{selectedProject.capacity}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-gray-500 text-xs uppercase mb-1">{t('projects.completion')}</div>
                  <div className="text-xl font-bold text-gray-800">{selectedProject.completionDate}</div>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-gray-500 text-xs uppercase mb-1">{t('projects.type')}</div>
                  <div className="text-xl font-bold text-gray-800">{t('solutions.rooftop')}</div>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-gray-500 text-xs uppercase mb-1">{t('projects.status')}</div>
                  <div className="text-xl font-bold text-green-600">Operating</div>
                </div>
              </div>

              <div className="prose max-w-none text-gray-600">
                <h3 className="text-xl font-bold text-corporate mb-4">{t('common.view_details')}</h3>
                <p className="mb-4">{selectedProject.description}</p>
                <p className="mb-4">
                    {t('home.why_choose_desc')}
                </p>
                
                <h4 className="text-lg font-bold text-gray-800 mb-3">Scope of Work:</h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {['EPC', 'Design', 'Installation', 'Grid Connection', 'O&M'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-primary" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button onClick={closeModal} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">{t('common.close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
