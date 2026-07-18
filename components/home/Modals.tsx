import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  content: { title: string; desc: string; details: string } | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ isOpen, content, onClose }) => {
  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-800 w-full max-w-xs sm:max-w-lg lg:max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full z-20 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
        
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              {content.title}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 leading-relaxed">
              {content.desc}
            </p>
          </div>
          
          <div className="border-t border-gray-100 dark:border-slate-700 pt-4 sm:pt-6">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Chi tiết</h4>
            <p className="text-sm sm:text-base text-gray-700 dark:text-slate-300 leading-relaxed text-justify indent-4 sm:indent-8">
              {content.details}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 dark:border-slate-700">
            <Link 
              to="/contact" 
              className="flex-1 bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-center"
              onClick={onClose}
            >
              Liên hệ tư vấn
            </Link>
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface WorkflowModalProps {
  isOpen: boolean;
  selectedStep: { step: string; title: string; desc: string; details: string; color: string } | null;
  onClose: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({ isOpen, selectedStep, onClose }) => {
  if (!isOpen || !selectedStep) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm sm:max-w-4xl lg:max-w-6xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full z-20 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
        
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-br ${selectedStep.color} text-white flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-black mb-3 sm:mb-4 shadow-xl`}>
              {selectedStep.step}
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2">
              {selectedStep.title}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300">
              {selectedStep.desc}
            </p>
          </div>
          
          {/* Mind Map */}
          <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-slate-700">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8">
              
              {/* Central Node */}
              <div className="relative">
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${selectedStep.color} text-white flex items-center justify-center shadow-2xl relative z-10`}>
                  <div className="text-center">
                    <div className="text-2xl font-black">{selectedStep.step}</div>
                    <div className="text-xs font-bold opacity-90">BƯỚC</div>
                  </div>
                </div>
                
                {/* Connecting Lines */}
                <div className="hidden lg:block absolute top-1/2 -left-20 w-20 h-0.5 bg-gradient-to-l from-primary to-transparent"></div>
                <div className="hidden lg:block absolute top-1/2 -right-20 w-20 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                <div className="lg:hidden absolute -top-10 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-gradient-to-t from-primary to-transparent"></div>
                <div className="lg:hidden absolute -bottom-10 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-gradient-to-b from-primary to-transparent"></div>
              </div>
              
              {/* Detail Branches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {selectedStep.details.split('. ').filter(detail => detail.trim()).map((detail, index) => (
                  <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedStep.color} text-white flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {detail.trim()}{detail.trim() && '.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Process Flow Indicators */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4">
                {['01', '02', '03', '04'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step === selectedStep.step 
                        ? `bg-gradient-to-br ${selectedStep.color} text-white shadow-lg scale-110` 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {index < 3 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        parseInt(step) <= parseInt(selectedStep.step) 
                          ? 'bg-primary' 
                          : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link 
              to="/contact" 
              className="flex-1 bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-center"
              onClick={onClose}
            >
              Bắt đầu {selectedStep.title}
            </Link>
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
