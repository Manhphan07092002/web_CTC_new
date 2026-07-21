
import React from 'react';
import { Sun } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  fullScreen = true,
  className = ''
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center transition-colors duration-300"
    : `w-full min-h-[300px] flex flex-col items-center justify-center ${className}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing spinner ring */}
        <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
        {/* Inner pulsing sun logo icon */}
        <div className="absolute flex items-center justify-center">
          <Sun size={24} className="text-primary animate-pulse" />
        </div>
      </div>
      {fullScreen && (
        <div className="mt-4 text-corporate dark:text-white font-bold text-lg tracking-wider animate-pulse">
          CTC...
        </div>
      )}
    </div>
  );
};

export default Loading;
