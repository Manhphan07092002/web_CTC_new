import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { Project } from '../../types';

interface FeaturedProjectsProps {
  featuredProjects: Project[];
  isLoading?: boolean;
}

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ featuredProjects, isLoading = false }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { ref: projectsRef, isInView } = useInView(0.1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Get exactly 4 projects
  const projects = featuredProjects.slice(0, 4);

  return (
    <section 
      ref={projectsRef} 
      className="py-28 bg-gray-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300"
    >
      {/* Styles for the pulsing glow button */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes projectsPulseGlow {
            0% {
                box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.5);
            }
            70% {
                box-shadow: 0 0 0 15px rgba(14, 165, 233, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
            }
        }

        .btn-projects-pulse {
            background: rgba(14, 165, 233, 0.12);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: #007cb9 !important;
            border: 2px solid rgba(14, 165, 233, 0.4);
            border-radius: 16px;
            padding: 16px 36px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.4s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            box-shadow: 0 4px 20px rgba(14, 165, 233, 0.15);
            animation: projectsPulseGlow 2s infinite;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }
        .btn-projects-pulse:hover {
            transform: translateY(-3px) scale(1.02);
            background: #007cb9;
            color: #ffffff !important;
            border-color: #007cb9;
            box-shadow: 0 10px 25px rgba(14, 165, 233, 0.3);
        }
        .btn-projects-pulse::before {
            content: '';
            position: absolute;
            top: 0;
            left: -150%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
            transform: skewX(-20deg);
            transition: transform 0.8s ease;
        }
        .btn-projects-pulse:hover::before {
            transform: translateX(150%);
        }
        .dark .btn-projects-pulse {
            background: rgba(56, 189, 248, 0.08);
            color: #38bdf8 !important;
            border-color: rgba(56, 189, 248, 0.45);
            box-shadow: 0 4px 20px rgba(14, 165, 233, 0.25);
        }
        .dark .btn-projects-pulse:hover {
            background: #38bdf8;
            color: #0f172a !important;
            border-color: #38bdf8;
        }
      `}} />
      <div className="container max-w-[1440px] mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className={`flex flex-col mb-14 transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex self-start items-center gap-2 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 px-3.5 py-1.5 rounded-full mb-4">
            <Zap size={14} className="text-blue-500 dark:text-blue-400" />
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {t('home.projects_badge')}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
            {t('home.featured_projects')}
          </h2>
          
          {/* Symmetrical left-aligned gradient line */}
          <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full mb-6" />
          
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
            {t('home.featured_projects_sub')}
          </p>
        </div>

        {/* Dynamic Expanding Accordion Grid */}
        {isLoading ? (
          <div className="flex flex-col lg:flex-row gap-5 h-[650px] lg:h-[550px]">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex-1 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <Zap size={28} className="text-blue-500" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-lg">{t('home.featured_projects_sub')}</p>
          </div>
        ) : (
          <div 
            onMouseLeave={() => setHoveredIndex(null)}
            className={`flex flex-col lg:flex-row gap-4 h-[650px] lg:h-[550px] w-full transition-all duration-1000 delay-100 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {projects.map((project, index) => {
              const isActive = index === hoveredIndex;
              const isAnyActive = hoveredIndex !== null;

              return (
                <div
                  key={`project-accordion-${index}-${project._id || project.id}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onClick={() => navigate(`/projects/${project._id || project.id}`)}
                  className={`relative overflow-hidden rounded-[2.5rem] border border-slate-250/20 dark:border-slate-800/40 transition-all duration-700 ease-in-out cursor-pointer shadow-lg hover:shadow-2xl
                    ${isAnyActive
                      ? isActive 
                        ? 'lg:flex-[5] flex-[4] bg-slate-950' 
                        : 'lg:flex-[1] flex-[1] bg-slate-900'
                      : 'lg:flex-1 flex-1 bg-slate-900'
                    }`}
                >
                  <Link 
                    to={`/projects/${project._id || project.id}`}
                    className="absolute inset-0 w-full h-full block z-35"
                  />

                  {/* Background Image with slow Ken Burns effect */}
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out
                      ${isActive 
                        ? 'scale-100 opacity-90' 
                        : isAnyActive 
                          ? 'scale-105 opacity-55' 
                          : 'scale-100 opacity-75'}`}
                  />
                  
                  {/* Advanced Gradient Overlays */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10 transition-opacity duration-500 
                    ${isActive 
                      ? 'opacity-90' 
                      : isAnyActive 
                        ? 'opacity-70' 
                        : 'opacity-65'}`} 
                  />
                  <div className={`absolute inset-0 bg-blue-950/20 mix-blend-color transition-opacity duration-700 z-10 
                    ${isActive ? 'opacity-100' : 'opacity-0'}`} 
                  />

                  {/* Top Bar Section */}
                  <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
                    {/* Category Tag */}
                    <div className={`transition-all duration-500 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-0 lg:opacity-100'}`}>
                      {project.category && (
                        <span className="px-3.5 py-1.5 bg-blue-500 text-white text-[10px] lg:text-xs font-black tracking-widest uppercase rounded-full shadow-lg">
                          {isActive ? project.category : project.category.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    
                    {/* Active external link sign */}
                    <div className={`w-9 h-9 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all duration-500
                      ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                    >
                      <ExternalLink size={14} />
                    </div>
                  </div>

                  {/* Inactive Horizontal Title (Desktop only) */}
                  {!isActive && (
                    <div className="absolute inset-x-3 bottom-8 z-20 hidden lg:flex flex-col items-center justify-end text-center pointer-events-none animate-fadeIn">
                      <span 
                        className="text-xs font-black text-white/95 uppercase tracking-wider line-clamp-2 select-none"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                      >
                        {project.title}
                      </span>
                    </div>
                  )}

                  {/* Active / Expanded Info Panel */}
                  <div 
                    className={`absolute bottom-0 left-0 w-full p-8 lg:p-10 z-30 transition-all duration-700 ease-in-out transform
                      ${isActive 
                        ? 'translate-y-0 opacity-100 pointer-events-auto' 
                        : 'translate-y-6 opacity-0 lg:opacity-100 lg:translate-y-0 pointer-events-none lg:hidden'
                      }`}
                  >
                    {/* Metadata Row */}
                    <div className="flex items-center gap-4 mb-3.5 text-slate-300 text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-blue-500" />
                        {project.location}
                      </span>
                      {project.completionDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-orange-500" />
                          {new Date(project.completionDate).getFullYear()}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl lg:text-3.5xl font-black text-white mb-3 tracking-tight leading-tight group-hover:text-blue-400 transition-colors duration-300">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 max-w-xl opacity-90">
                      {project.description}
                    </p>

                    {/* Partner / Client info */}
                    {project.capacity && (
                      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 font-medium">
                        Quy mô / Đối tác: <span className="text-white font-semibold">{project.capacity}</span>
                      </div>
                    )}
                    
                    {/* Interactive button hint */}
                    <div className="mt-5 flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <span>Xem chi tiết dự án</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  {/* Hover Border Accent */}
                  <div className={`absolute inset-0 border rounded-[2.5rem] pointer-events-none z-40 transition-colors duration-500
                    ${isActive ? 'border-blue-500/40' : 'border-transparent'}`} 
                  />
                </div>
              );
            })}
          </div>
        )}
        {/* Center aligned view projects action button */}
        <div className={`mt-14 flex justify-center transition-all duration-1000 delay-300 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          <Link
            to="/projects"
            className="btn-projects-pulse text-xs uppercase tracking-widest font-black"
          >
            <span>{t('home.view_projects')}</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
