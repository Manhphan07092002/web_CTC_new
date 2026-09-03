import React, { useState, useEffect, useMemo } from 'react';
import { Project } from '../../types';
import { MapPin, Calendar, Zap, ShieldCheck, Maximize2, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';

interface ProjectGalleryProps {
  project: Project;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ project }) => {
  // Gộp ảnh đại diện chính và toàn bộ ảnh bổ sung trong images (loại bỏ trùng lặp)
  const images = useMemo(() => {
    const list: string[] = [];
    if (project.image) list.push(project.image);
    if (Array.isArray(project.images)) {
      project.images.forEach(img => {
        if (img && typeof img === 'string' && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&w=1600&q=85'];
  }, [project.image, project.images]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reset về ảnh đầu tiên khi chuyển sang dự án khác
  useEffect(() => {
    setCurrentIndex(0);
  }, [project.id, (project as any)._id]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Hỗ trợ phím mũi tên trái/phải và phím Esc để duyệt ảnh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  const currentImage = images[currentIndex] || images[0];

  return (
    <div className="space-y-4">
      {/* Immersive Main Hero Image */}
      <div className="relative h-[450px] sm:h-[550px] lg:h-[600px] w-full overflow-hidden rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 group select-none">
        <img 
          src={currentImage} 
          alt={`${project.title} - Ảnh ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

        {/* Top Badges & Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
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

          <div className="flex items-center gap-2 pointer-events-auto">
            {images.length > 1 && (
              <span className="px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-lg">
                <ImageIcon size={13} />
                {currentIndex + 1} / {images.length}
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-900/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-colors shadow-lg border border-white/20 cursor-pointer"
              title="Xem ảnh phóng to toàn màn hình"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>

        {/* Prev / Next Navigation Arrows on Hero */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-primary backdrop-blur-md text-white flex items-center justify-center transition-all shadow-xl border border-white/20 opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer z-10"
              title="Ảnh trước"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-primary backdrop-blur-md text-white flex items-center justify-center transition-all shadow-xl border border-white/20 opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer z-10"
              title="Ảnh tiếp theo"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Bottom Hero Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white space-y-4 pointer-events-none">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight drop-shadow-md max-w-4xl">
            {project.title}
          </h1>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs sm:text-sm text-slate-200 font-medium">
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
        <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-none">
          {images.map((img: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-24 sm:w-28 h-20 sm:h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                currentIndex === idx 
                  ? 'border-primary ring-4 ring-primary/25 scale-105 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100 hover:scale-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Image Lightbox Modal with Next/Prev and Fullscreen View */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in select-none"
        >
          {/* Close button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shadow-2xl cursor-pointer z-20"
            title="Đóng (Esc)"
          >
            <X size={24} />
          </button>

          {/* Image index badge */}
          <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold border border-white/20 z-20">
            {currentIndex + 1} / {images.length} — {project.title}
          </div>

          {/* Prev Arrow in Lightbox */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-all shadow-2xl cursor-pointer z-20"
              title="Ảnh trước (Mũi tên trái)"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Main Zoomed Image */}
          <div 
            className="max-w-6xl max-h-[85vh] w-full h-full flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={currentImage} 
              alt={`${project.title} - ${currentIndex + 1}`} 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>

          {/* Next Arrow in Lightbox */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-all shadow-2xl cursor-pointer z-20"
              title="Ảnh tiếp (Mũi tên phải)"
            >
              <ChevronRight size={36} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;
