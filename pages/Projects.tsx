import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useProjectCategories } from '../hooks/useCategories';
import SEO from '../components/SEO';
import Loading from '../components/Loading';
import analyticsTracking from '../services/analytics-tracking';
import { getProjectUrl } from '../utils/news-url-helper';

import {
  ProjectsHero,
  ProjectGrid,
  ProjectFilterSidebar,
  ProjectDetailModal
} from '../components/projects';

const ITEMS_PER_PAGE = 9; // 3 items per row x 3 rows = 9 items per page

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { t, language } = useLanguage();
  const { categories: projectCategories } = useProjectCategories();

  // Read initial category filter from URL query param
  useEffect(() => {
    const catParam = searchParams.get('cat') || searchParams.get('category') || searchParams.get('categoryId');
    if (catParam) {
      setSelectedCategoryId(catParam);
    }
  }, [searchParams]);

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

  const handleCategoryChange = (catId: string | null) => {
    setSelectedCategoryId(catId);
    if (catId) {
      setSearchParams({ cat: catId });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('cat');
      newParams.delete('category');
      newParams.delete('categoryId');
      setSearchParams(newParams);
    }
  };

  // Filter projects by category & search query
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Category filter
      let matchesCategory = true;
      if (selectedCategoryId) {
        const targetCat = projectCategories.find(c =>
          c.id === selectedCategoryId ||
          c._id === selectedCategoryId ||
          c.slug === selectedCategoryId ||
          c.name?.toLowerCase() === selectedCategoryId.toLowerCase()
        );

        const projectCatId = typeof project.categoryId === 'object' ? (project.categoryId as any)?._id || (project.categoryId as any)?.id : project.categoryId;
        const projectCatName = project.category;
        const projectCatSlug = (project as any).categorySlug;

        if (targetCat) {
          matchesCategory =
            projectCatId === targetCat.id ||
            projectCatId === targetCat._id ||
            projectCatName === targetCat.name ||
            projectCatSlug === targetCat.slug;
        } else {
          matchesCategory =
            projectCatId === selectedCategoryId ||
            projectCatName === selectedCategoryId ||
            projectCatSlug === selectedCategoryId ||
            (typeof projectCatName === 'string' && projectCatName.toLowerCase() === selectedCategoryId.toLowerCase());
        }
      }

      // Search query filter
      const matchesSearch = searchQuery.trim()
        ? project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategoryId, searchQuery, projectCategories]);

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
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('cat');
    newParams.delete('category');
    newParams.delete('categoryId');
    setSearchParams(newParams);
  };

  const closeModal = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

  const getProjectSchema = (project: Project) => ({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": project.description?.replace(/<[^>]*>/g, '') || '',
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
    <div className="w-full pt-28 md:pt-36 pb-20 animate-fade-in relative bg-gray-50 dark:bg-gray-900 min-h-screen">
      <SEO 
        title={selectedProject ? selectedProject.title : t('projects.title')}
        description={selectedProject ? `${selectedProject.title} - ${selectedProject.location}. ${selectedProject.capacity}.` : t('projects.subtitle')}
        keywords={selectedProject ? `${selectedProject.title}, dự án CTC, ${selectedProject.location}, ${selectedProject.capacity}, thi công điện mặt trời nhà xưởng, Farm Solar` : "dự án CTC, thi công điện mặt trời áp mái, dự án Farm Solar 4MWp Gio Linh, dự án Dệt Châu Giang 3MWp, Coco Việt Nam 2.531kWp, Thiện Hoàng 1.5MWp, trạm 110kV Thạnh Hải, điện gió Hướng Hiệp 1, nhà thầu EPC CTC, chứng chỉ viễn thông Hạng I, chứng chỉ trạm biến áp Hạng II"}
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
              onCategoryChange={handleCategoryChange}
              totalProjects={projects.length}
              filteredCount={filteredProjects.length}
              onReset={handleResetFilters}
              categories={projectCategories}
            />
          </div>

          {/* Right Main Grid (w-full lg:w-3/4) */}
          <div className="w-full lg:w-3/4">
            <ProjectGrid 
              projects={paginatedProjects}
              onProjectClick={(p) => navigate(getProjectUrl(p))}
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
