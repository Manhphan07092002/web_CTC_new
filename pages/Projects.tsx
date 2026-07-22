import React, { useEffect, useState, useMemo } from 'react';
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
  ProjectFilterSidebar,
  ProjectDetailModal
} from '../components/projects';

const ITEMS_PER_PAGE = 9; // 3 items per row x 3 rows = 9 items per page

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { t, language } = useLanguage();

  useEffect(() => {
    // Track page view
    analyticsTracking.trackPageView('/projects', { title: 'Projects Page' });
    
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await api.projects.getAll();
        // Sort: Featured first, then by date
        const sorted = data.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isFeatured && b.isFeatured) {
            return (a.featuredOrder || 0) - (b.featuredOrder || 0);
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setProjects(sorted);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [language]);

  // Filter projects by category & search query
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Category filter
      const matchesCategory = selectedCategoryId
        ? project.categoryId === selectedCategoryId || project.category === selectedCategoryId
        : true;

      // Search query filter
      const matchesSearch = searchQuery.trim()
        ? project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategoryId, searchQuery]);

  // Reset to page 1 whenever filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleResetFilters = () => {
    setSelectedCategoryId(null);
    setSearchQuery('');
    setCurrentPage(1);
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
    "dateCreated": project.completionDate || (project as any).date,
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

      {/* Hero Banner Header */}
      <ProjectsHero />

      {/* Main Container with Left Sidebar & Right 3-Column Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar (w-full lg:w-1/4) */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <ProjectFilterSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={setSelectedCategoryId}
              totalProjects={projects.length}
              filteredCount={filteredProjects.length}
              onReset={handleResetFilters}
            />
          </div>

          {/* Right Main Grid (w-full lg:w-3/4) */}
          <div className="w-full lg:w-3/4">
            <ProjectGrid 
              projects={paginatedProjects}
              onProjectClick={(p) => navigate(`/projects/${p._id || p.id}`)}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              totalItems={filteredProjects.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </div>
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
