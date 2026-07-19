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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="bg-white/75 dark:bg-[#060d1d]/70 backdrop-blur-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-3xl border border-white/50 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 animate-fade-in-up max-h-[90vh] flex flex-col transition-all duration-300">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header / Close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 dark:border-slate-800/50 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">Thông tin chi tiết</span>
          <button 
            onClick={onClose} 
            className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 p-2 rounded-full transition-all hover:rotate-90 duration-300"
          >
            <X size={18} className="text-gray-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 space-y-6">
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {content.title}
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              {content.desc}
            </p>
          </div>
          
          {content.details && (
            <div className="bg-white/40 dark:bg-slate-950/20 p-5 rounded-2xl border border-white/30 dark:border-white/5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Chi tiết</h4>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-line">
                {content.details}
              </p>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100/50 dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-950/20 relative z-10 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold transition-all"
          >
            Đóng
          </button>
          <Link 
            to="/contact" 
            className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all text-center flex items-center justify-center"
            onClick={onClose}
          >
            Liên hệ tư vấn
          </Link>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="bg-white/75 dark:bg-[#060d1d]/70 backdrop-blur-2xl w-full max-w-sm sm:max-w-3xl lg:max-w-5xl rounded-3xl border border-white/50 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 animate-fade-in-up max-h-[90vh] flex flex-col transition-all duration-300">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header / Close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 dark:border-slate-800/50 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">Quy trình thực hiện</span>
          <button 
            onClick={onClose} 
            className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 p-2 rounded-full transition-all hover:rotate-90 duration-300"
          >
            <X size={18} className="text-gray-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 space-y-8">
          
          {/* Header Description */}
          <div className="text-center space-y-2">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br ${selectedStep.color} text-white flex items-center justify-center text-lg sm:text-xl font-black shadow-lg shadow-sky-500/10`}>
              {selectedStep.step}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {selectedStep.title}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {selectedStep.desc}
            </p>
          </div>
          
          {/* Mind Map / Details Grid */}
          <div className="relative bg-white/40 dark:bg-slate-950/20 rounded-2xl p-6 sm:p-8 border border-white/30 dark:border-white/5">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              
              {/* Central Node */}
              <div className="relative flex-shrink-0">
                <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${selectedStep.color} text-white flex items-center justify-center shadow-xl relative z-10`}>
                  <div className="text-center">
                    <div className="text-xl font-black">{selectedStep.step}</div>
                    <div className="text-[10px] font-bold opacity-90 uppercase tracking-wider">BƯỚC</div>
                  </div>
                </div>
                
                {/* Connecting Lines */}
                <div className="hidden lg:block absolute top-1/2 -left-12 w-12 h-0.5 bg-gradient-to-l from-sky-500/50 to-transparent"></div>
                <div className="hidden lg:block absolute top-1/2 -right-12 w-12 h-0.5 bg-gradient-to-r from-sky-500/50 to-transparent"></div>
              </div>
              
              {/* Detail Branches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {selectedStep.details.split('. ').filter(detail => detail.trim()).map((detail, index) => (
                  <div key={index} className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-xl border border-white/50 dark:border-white/5 hover:border-sky-500/30 dark:hover:border-sky-400/20 hover:shadow-md transition-all duration-300 group flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${selectedStep.color} text-white flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {index + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {detail.trim()}{detail.trim() && '.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Process Flow Indicators */}
            <div className="mt-8 pt-6 border-t border-gray-100/50 dark:border-slate-800/50">
              <div className="flex items-center justify-center gap-4">
                {['01', '02', '03', '04'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === selectedStep.step 
                        ? `bg-gradient-to-br ${selectedStep.color} text-white shadow-md scale-110` 
                        : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-black/5 dark:border-white/5'
                    }`}>
                      {step}
                    </div>
                    {index < 3 && (
                      <div className={`w-6 h-0.5 mx-1 ${
                        parseInt(step) <= parseInt(selectedStep.step) 
                          ? 'bg-sky-500' 
                          : 'bg-black/10 dark:bg-white/10'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100/50 dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-950/20 relative z-10 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold transition-all"
          >
            Đóng
          </button>
          <Link 
            to="/contact" 
            className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all text-center flex items-center justify-center"
            onClick={onClose}
          >
            Bắt đầu {selectedStep.title}
          </Link>
        </div>
      </div>
    </div>
  );
};
