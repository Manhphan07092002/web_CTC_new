import React from 'react';
import { Project } from '../../types';
import { Link } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';

interface RelatedProjectsProps {
  projects: Project[];
}

const RelatedProjects: React.FC<RelatedProjectsProps> = ({ projects }) => {
  if (projects.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-corporate dark:text-white mb-8 border-l-4 border-primary pl-3">
        Dự án liên quan
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((item, index) => (
          <Link 
            key={`related-project-${item._id || item.id}-${index}`} 
            to={`/projects/${item._id || item.id}`} 
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
          >
            <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute top-4 left-4">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {item.capacity}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                {item.title}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{(item as any).date || item.completionDate}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProjects;
