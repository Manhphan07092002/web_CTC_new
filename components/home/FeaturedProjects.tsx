import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { Project } from '../../types';

interface FeaturedProjectsProps {
  featuredProjects: Project[];
}

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ featuredProjects }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { ref: projectsRef, isInView } = useInView(0.1);

  return (
    <section ref={projectsRef} className="py-24 bg-white relative overflow-hidden">
      <div className="container max-w-[1440px] mx-auto px-6">
        <div className={`flex flex-col md:flex-row justify-between items-center mb-16 transition-all duration-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4 hover:bg-primary/20 transition-colors">
              <Zap size={18} className="text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.projects_badge')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">{t('home.featured_projects')}</h2>
            <p className="text-gray-600">{t('home.featured_projects_sub')}</p>
          </div>
          <Link to="/projects" className="mt-4 md:mt-0 group bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 flex items-center gap-2 hover:-translate-y-1 overflow-hidden relative">
            <span className="relative z-10 flex items-center gap-2">
              {t('home.view_projects')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Link>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {featuredProjects.slice(0, 3).map((project, index) => (
            <div 
              key={`project-${index}-${project._id || project.id}`} 
              className="group relative rounded-[2rem] overflow-hidden h-[350px] cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-700 border border-gray-100"
              onClick={() => navigate(`/projects/${project._id || project.id}`)}
            >
              <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-gray-900/10 transition-colors z-10"></div>
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity z-20"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200 z-30">
                <div className="flex items-center gap-3 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                  <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">{project.capacity}</span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30">{project.location}</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 leading-tight group-hover:text-primary transition-colors duration-300">{project.title}</h3>
                <p className="text-gray-300 line-clamp-2 text-sm leading-relaxed max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-200">{project.description}</p>
                
                <div className="mt-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 delay-100 hover:bg-primary hover:border-primary">
                  <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
