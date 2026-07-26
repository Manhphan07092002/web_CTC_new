import React, { useState } from 'react';
import { Project } from '../../types';
import { MapPin, Calendar, Zap, ShieldCheck, Maximize2 } from 'lucide-react';

interface ProjectGalleryProps {
  project: Project;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ project }) => {
  const [selectedImage, setSelectedImage] = useState<string>(project.image);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const images = (project as any).images && (project as any).images.length > 0 
    ? (project as any).images 
    : [project.image];

  return (
    <div className="space-y-4">
      {/* Immersive Main Hero Image */}
      <div className="relative h-[450px] sm:h-[550px] lg:h-[600px] w-full overflow-hidden rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 group">
        <img 
          src={selectedImage} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 flex-wrap">
            {project.category && (
              <span className="px-4 py-1.5 bg-primary/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider rounded-full shadow-lg border border-white/20">
                {project.category}
              </span>
            )}
            {project.capacity && (
              <span className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-black rounded-full shadow-lg border border-amber-400/30 flex items-center gap-1.5">
                <Zap size={14} className="fill-amber-400" /> {project.capacity}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="pointer-events-auto w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-colors shadow-lg border border-white/20"
            title="Xem ảnh phóng to"
          >
            <Maximize2 size={18} />
          </button>
        </div>

        {/* Bottom Hero Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white space-y-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight drop-shadow-md max-w-4xl">
            {project.title}
          </h1>

          <div className="flex items-center gap-6 flex-wrap text-xs sm:text-sm text-slate-200 font-medium">
            {project.location && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                <MapPin size={16} className="text-primary" />
                <span>{project.location}</span>
              </div>
            )}
            {((project as any).date || project.completionDate) && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                <Calendar size={16} className="text-amber-400" />
                <span>Hoàn thành: {(project as any).date || project.completionDate}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md text-emerald-300 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 font-bold">
              <ShieldCheck size={16} /> Nghiệm thu & Bàn giao 100%
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails list if multiple photos */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                selectedImage === img 
                  ? 'border-primary ring-4 ring-primary/20 scale-105' 
                  : 'border-gray-200 dark:border-gray-800 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Image Lightbox Modal */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <img 
            src={selectedImage} 
            alt={project.title} 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;
