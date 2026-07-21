import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  categoryName: string;
}

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent('<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#F3F4F6"/><g transform="translate(110, 60)"><path d="M160 120L110 60L80 95L30 30L0 120H160Z" fill="#D1D5DB"/><circle cx="130" cy="35" r="20" fill="#D1D5DB"/></g><text x="200" y="220" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="500" fill="#9CA3AF">No Image</text></svg>');

const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  categoryName
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const imageList = images && images.length > 0 ? images : [];

  // Auto-play logic
  useEffect(() => {
    let interval: any;
    if (imageList.length > 1 && !isHovered) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [imageList.length, isHovered]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
  };

  return (
    <div className="space-y-4">
      <div 
        className="relative group aspect-[4/3] overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Image */}
        <img 
          src={imageList[currentImageIndex] || PLACEHOLDER_IMAGE} 
          alt={`${productName} - View ${currentImageIndex + 1}`} 
          className="w-full h-full object-contain transition-all duration-500 ease-in-out"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
        />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
            {categoryName}
          </span>
        </div>

        {/* Navigation Arrows (Only if > 1 image) */}
        {imageList.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800/80 hover:bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800/80 hover:bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {imageList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={`w-2 h-2 rounded-full transition-all shadow-sm ${currentImageIndex === idx ? 'bg-primary w-6' : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:bg-gray-800'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Thumbnail Strip (Only if > 1 image) */}
      {imageList.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {imageList.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-primary opacity-100 ring-2 ring-primary/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
