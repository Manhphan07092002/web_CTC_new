import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
  data?: any;
}

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const error = useRouteError() as RouteError;
  
  const errorStatus = error?.status || 500;
  const errorMessage = error?.message || error?.statusText || 'Đã có lỗi xảy ra';

  const getErrorTitle = () => {
    switch (errorStatus) {
      case 404:
        return 'Không tìm thấy trang';
      case 403:
        return 'Truy cập bị từ chối';
      case 500:
        return 'Lỗi máy chủ';
      default:
        return 'Đã có lỗi xảy ra';
    }
  };

  const getErrorDescription = () => {
    switch (errorStatus) {
      case 404:
        return 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.';
      case 403:
        return 'Bạn không có quyền truy cập vào trang này.';
      case 500:
        return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
      default:
        return 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.';
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <>
      <SEO 
        title={`${errorStatus} - ${getErrorTitle()}`}
        description={getErrorDescription()}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Error Icon */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6 animate-bounce-slow">
              <AlertTriangle size={48} className="text-red-600" />
            </div>
            
            {/* Error Code */}
            <h1 className="text-8xl font-black text-gray-200 mb-4 tracking-tight">
              {errorStatus}
            </h1>
            
            {/* Error Title */}
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              {getErrorTitle()}
            </h2>
            
            {/* Error Description */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {getErrorDescription()}
            </p>

            {/* Technical Details (if available) */}
            {errorMessage && errorStatus !== 404 && (
              <div className="bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-8 text-left max-w-md mx-auto">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Chi tiết kỹ thuật:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-words">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
            <button
              onClick={handleGoBack}
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-900 border-2 border-gray-300 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Quay lại
            </button>

            <button
              onClick={handleRefresh}
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-900 border-2 border-gray-300 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 group"
            >
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              Tải lại
            </button>

            <button
              onClick={handleGoHome}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Home size={20} />
              Về trang chủ
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ{' '}
              <a 
                href="mailto:info@tranle.com" 
                className="text-primary hover:text-secondary font-bold underline"
              >
                info@tranle.com
              </a>
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.3s both;
        }
      `}</style>
    </>
  );
};

export default ErrorPage;
