
import React from 'react';
import { Sun } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="relative">
        <Sun size={64} className="text-yellow-400 animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
      </div>
      <div className="mt-4 text-corporate font-bold text-lg animate-pulse">
        CTC...
      </div>
    </div>
  );
};

export default Loading;
