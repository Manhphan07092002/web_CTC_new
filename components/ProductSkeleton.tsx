
import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="h-56 bg-gray-200 relative">
        <div className="absolute top-3 left-3 w-16 h-5 bg-gray-300 rounded"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        
        <div className="space-y-2 mt-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
           <div className="h-6 bg-gray-200 rounded w-1/3"></div>
           <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
