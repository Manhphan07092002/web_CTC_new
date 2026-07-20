
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ArrowLeft, HelpCircle, Shield, AlertTriangle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  // Log 404 attempts for security monitoring
  useEffect(() => {
    const logData = {
      timestamp: new Date().toISOString(),
      path: location.pathname,
      search: location.search,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct',
      ip: 'client-side' // Server-side would have real IP
    };

    // Log to console (in production, send to analytics/security service)
    console.warn('404 Access Attempt:', logData);
    
    // Send to security logging service
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    const apiUrl = (!port || port === '80' || port === '443')
      ? '/api/security/404'
      : `${protocol}//${hostname}:4000/api/security/404`;
    
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    }).catch(() => {
      // Silent fail - don't break user experience if logging fails
      console.error('Failed to log 404 attempt to server');
    });
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <SEO title="404 - Không tìm thấy trang" description="Trang bạn tìm kiếm không tồn tại" noindex={true} />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        <div className="text-center">
          {/* 404 Number with Animation */}
          <div className="mb-8">
            <h1 className="text-[180px] md:text-[250px] font-extrabold leading-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-corporate via-primary to-secondary animate-gradient">
                404
              </span>
            </h1>
          </div>

          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-xl">
                <HelpCircle size={48} className="text-white" />
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Oops! Trang không tồn tại
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            Xin lỗi, trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không truy cập được. 
            Hãy kiểm tra lại URL hoặc quay về trang chủ.
          </p>
          
          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <Shield size={20} />
              <span className="font-semibold">Thông báo bảo mật</span>
            </div>
            <p className="text-sm text-amber-600">
              Truy cập này đã được ghi lại để đảm bảo an ninh hệ thống. 
              Nếu bạn đang tìm kiếm nội dung cụ thể, vui lòng sử dụng menu điều hướng hoặc liên hệ với chúng tôi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-corporate to-primary hover:from-primary hover:to-secondary text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Home size={20} /> 
              Về trang chủ
            </Link>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 text-corporate border-2 border-corporate px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Search size={20} /> 
              Xem sản phẩm
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Có thể bạn đang tìm:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                to="/" 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Home size={24} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trang chủ</span>
              </Link>
              
              <Link 
                to="/products" 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-green-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Search size={24} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sản phẩm</span>
              </Link>
              
              <Link 
                to="/projects" 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-purple-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dự án</span>
              </Link>
              
              <Link 
                to="/contact" 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Liên hệ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
