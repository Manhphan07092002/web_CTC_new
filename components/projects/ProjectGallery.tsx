import React from 'react';
import { Project } from '../../types';
import { MapPin, Calendar } from 'lucide-react';

interface ProjectGalleryProps {
  project: Project;
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ project }) => {
  return (
    <div className="relative h-[60vh] overflow-hidden rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
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
              <span className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-md">
                {project.category}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-full border border-white/30">
                {project.capacity}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">{project.title}</h1>
            <div className="flex items-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{(project as any).date || project.completionDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectGallery;
