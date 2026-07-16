import React, { useState, useEffect } from 'react';
import { Wrench, Clock, Mail, Phone, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';

const MaintenancePage: React.FC = () => {
  const [countdown, setCountdown] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0
  });

  // Countdown timer (optional)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <SEO 
        title="Website đang bảo trì"
        description="Chúng tôi đang nâng cấp hệ thống để phục vụ bạn tốt hơn. Vui lòng quay lại sau."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF7F00' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 backgroundSize: '60px 60px'
               }}
          />
        </div>

        <div className="max-w-3xl w-full relative z-10">
          {/* Logo/Icon */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary mb-8 shadow-2xl animate-pulse-slow">
              <Wrench size={64} className="text-white animate-wiggle" />
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-gray-200 mb-4 tracking-tight">
              Website đang bảo trì
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn cho bạn. 
              Xin lỗi vì sự bất tiện này!
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock size={24} className="text-primary" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Thời gian dự kiến hoàn thành</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {/* Hours */}
              <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6 text-center shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-4xl font-black text-white mb-2">
                  {String(countdown.hours).padStart(2, '0')}
                </div>
                <div className="text-sm font-bold text-white/80 uppercase tracking-wider">
                  Giờ
                </div>
              </div>
              
              {/* Minutes */}
              <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6 text-center shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-4xl font-black text-white mb-2">
                  {String(countdown.minutes).padStart(2, '0')}
                </div>
                <div className="text-sm font-bold text-white/80 uppercase tracking-wider">
                  Phút
                </div>
              </div>
              
              {/* Seconds */}
              <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6 text-center shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-4xl font-black text-white mb-2">
                  {String(countdown.seconds).padStart(2, '0')}
                </div>
                <div className="text-sm font-bold text-white/80 uppercase tracking-wider">
                  Giây
                </div>
              </div>
            </div>
          </div>

          {/* What We're Doing */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 dark:border-gray-700 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
              Chúng tôi đang làm gì?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Nâng cấp hệ thống</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cải thiện hiệu suất và tốc độ</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Tăng cường bảo mật</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bảo vệ dữ liệu của bạn</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Tính năng mới</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Trải nghiệm tốt hơn cho bạn</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-xl p-8 text-white animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-xl font-bold mb-6 text-center">
              Cần hỗ trợ khẩn cấp?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a 
                href="mailto:info@tranle.com"
                className="flex items-center gap-3 bg-white dark:bg-gray-800/10 hover:bg-white dark:bg-gray-800/20 rounded-xl p-4 transition-all group"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-sm opacity-80">Email</div>
                  <div className="font-bold">info@tranle.com</div>
                </div>
              </a>
              
              <a 
                href="tel:0236656202"
                className="flex items-center gap-3 bg-white dark:bg-gray-800/10 hover:bg-white dark:bg-gray-800/20 rounded-xl p-4 transition-all group"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-sm opacity-80">Hotline</div>
                  <div className="font-bold">0915 059 666</div>
                </div>
              </a>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 hover:border-primary hover:text-primary transition-all shadow-lg group"
            >
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              Kiểm tra lại
            </button>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Cảm ơn bạn đã kiên nhẫn chờ đợi! 🙏
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary/5 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
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
          animation: fade-in-up 0.6s ease-out both;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default MaintenancePage;
