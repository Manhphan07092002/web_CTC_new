import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import Loading from '../components/Loading';
import analyticsTracking from '../services/analytics-tracking';

import {
  ProjectsHero,
  ProjectGrid,
  ProjectDetailModal
} from '../components/projects';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { t, language } = useLanguage();

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
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        if (a.isFeatured && b.isFeatured) {
          return (a.featuredOrder || 0) - (b.featuredOrder || 0);
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setProjects(sorted);
      setLoading(false);
    };
    fetchProjects();
  }, [selectedCategoryId, language]);

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
    "dateCreated": project.completionDate || project.date,
    "creator": {
       "@type": "Organization",
       "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
       "url": "https://www.ctcdn.vn",
       "telephone": "+84-915-059-666"
    }
  });

  if (loading) return <Loading fullScreen={false} className="h-[60vh]" />;

  return (
    <div className="w-full pb-20 animate-fade-in relative bg-gray-50 dark:bg-gray-900 min-h-screen">
      <SEO 
        title={selectedProject ? selectedProject.title : t('projects.title')}
        description={selectedProject ? `${selectedProject.title} - ${selectedProject.location}. ${selectedProject.capacity}.` : t('projects.subtitle')}
        image={selectedProject?.image}
        schema={selectedProject ? getProjectSchema(selectedProject) : {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Dự án điện mặt trời - CTC",
            "description": "Danh sách các dự án lắp đặt hệ thống điện mặt trời đã hoàn thành bởi Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
            "publisher": {
              "@type": "Organization",
              "name": "CTC",
              "url": "https://www.ctcdn.vn"
            }
        }}
      />

      {/* Hero Banner & Filter */}
      <ProjectsHero 
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
      />

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-12">
        <ProjectGrid 
          projects={projects}
          onProjectClick={(p) => navigate(`/projects/${p._id || p.id}`)}
        />
      </div>

      {/* Detail Modal */}
      <ProjectDetailModal 
        project={selectedProject}
        onClose={closeModal}
      />
    </div>
  );
};

export default Projects;
