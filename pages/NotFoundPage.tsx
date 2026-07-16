import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft, Compass } from 'lucide-react';
import SEO from '../components/SEO';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const popularLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản phẩm', path: '/products' },
    { name: 'Dự án', path: '/projects' },
    { name: 'Tin tức', path: '/news' },
    { name: 'Giới thiệu', path: '/about' },
    { name: 'Liên hệ', path: '/contact' },
  ];

  return (
    <>
      <SEO 
        title="404 - Không tìm thấy trang"
        description="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-4xl w-full relative z-10">
          <div className="text-center animate-fade-in">
            {/* 404 Illustration */}
            <div className="mb-8 relative">
              {/* Large 404 Text */}
              <h1 className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-purple-500 leading-none select-none">
                404
              </h1>
              
              {/* Floating Icon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full shadow-2xl flex items-center justify-center animate-bounce-slow">
                  <Compass size={64} className="text-primary animate-spin-slow" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Oops! Trang không tồn tại
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Có vẻ như bạn đã đi lạc đường. Trang bạn đang tìm kiếm không tồn tại, 
              đã bị xóa hoặc tạm thời không khả dụng.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleGoBack}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 border-2 border-gray-300 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 shadow-lg group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Quay lại
              </button>

              <button
                onClick={handleGoHome}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:shadow-2xl transition-all flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-1"
              >
                <Home size={20} />
                Về trang chủ
              </button>
            </div>

            {/* Search Box */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-2 border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center justify-center gap-2">
                  <Search size={20} className="text-primary" />
                  Hoặc thử tìm kiếm
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm, dự án, tin tức..."
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all text-lg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const query = (e.target as HTMLInputElement).value;
                        if (query) {
                          navigate(`/products?search=${encodeURIComponent(query)}`);
                        }
                      }
                    }}
                  />
                  <Search size={24} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Popular Links */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Các trang phổ biến
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {popularLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="px-6 py-3 bg-gray-50 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-primary transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Cần hỗ trợ? Liên hệ{' '}
                <a 
                  href="mailto:info@ctcdn.vn" 
                  className="text-primary hover:text-secondary font-bold underline"
                >
                  info@ctcdn.vn
                </a>
                {' '}hoặc gọi{' '}
                <a 
                  href="tel:0236656202" 
                  className="text-primary hover:text-secondary font-bold underline"
                >
                  0915 059 666
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </>
  );
};

export default NotFoundPage;
