
import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastType } from '../contexts/ToastContext';

interface ToastProps {
  toasts: { id: string; message: string; type: ToastType }[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto min-w-[320px] max-w-md bg-white rounded-xl shadow-2xl border-l-4 p-4 flex items-start gap-3 transform transition-all duration-500 ease-out animate-slide-in ${
            toast.type === 'success' ? 'border-green-500 bg-gradient-to-r from-green-50 to-white' :
            toast.type === 'error' ? 'border-red-500 bg-gradient-to-r from-red-50 to-white' :
            toast.type === 'warning' ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-white' :
            'border-blue-500 bg-gradient-to-r from-blue-50 to-white'
          } hover:shadow-xl hover:scale-[1.02] transition-transform`}
        >
          <div className={`mt-0.5 flex-shrink-0 ${
             toast.type === 'success' ? 'text-green-600' :
             toast.type === 'error' ? 'text-red-600' :
             toast.type === 'warning' ? 'text-yellow-600' :
             'text-blue-600'
          }`}>
            {toast.type === 'success' && <CheckCircle size={22} className="animate-bounce-once" />}
            {toast.type === 'error' && <AlertCircle size={22} className="animate-shake" />}
            {toast.type === 'warning' && <AlertTriangle size={22} className="animate-pulse" />}
            {toast.type === 'info' && <Info size={22} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-relaxed">{toast.message}</p>
          </div>

          <button 
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-all flex-shrink-0"
            aria-label="Đóng thông báo"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
