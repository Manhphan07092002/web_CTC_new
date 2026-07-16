import React from 'react';
import { Settings, Wrench, Clock, Mail, Phone } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import SEO from '../components/SEO';

const Maintenance: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-corporate via-primary to-secondary flex items-center justify-center p-4 relative overflow-hidden">
      <SEO 
        title="Bảo trì hệ thống" 
        description="Website đang trong quá trình bảo trì và nâng cấp"
        noindex={true}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white dark:bg-gray-800/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white dark:bg-gray-800/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white dark:bg-gray-800/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        <div className="bg-white dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src={settings.logo} 
              alt={settings.siteName} 
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>

          {/* Animated Icon */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary/20 rounded-full animate-ping"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-xl">
                <Settings size={64} className="text-white animate-spin-slow" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-corporate mb-4">
            Đang bảo trì hệ thống
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-6 font-medium">
            Chúng tôi đang nâng cấp để phục vụ bạn tốt hơn
          </p>

          {/* Description */}
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Website hiện đang trong quá trình bảo trì và nâng cấp để mang đến trải nghiệm tốt nhất cho bạn. 
              Chúng tôi sẽ quay lại sớm nhất có thể.
            </p>
            <p className="text-gray-500 text-sm">
              Xin lỗi vì sự bất tiện này. Cảm ơn bạn đã kiên nhẫn!
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Nâng cấp hệ thống</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cải thiện hiệu suất và tính năng mới</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Bảo trì định kỳ</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đảm bảo hệ thống hoạt động ổn định</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Sớm trở lại</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chúng tôi sẽ quay lại trong thời gian sớm nhất</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <p className="text-gray-700 dark:text-gray-300 font-semibold mb-4">
              Nếu cần hỗ trợ khẩn cấp, vui lòng liên hệ:
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a 
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 text-primary hover:text-secondary transition-colors font-medium"
              >
                <Mail size={20} />
                <span>{settings.email}</span>
              </a>
              <a 
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2 text-primary hover:text-secondary transition-colors font-medium"
              >
                <Phone size={20} />
                <span>{settings.phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80">
          <p className="text-sm">
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default Maintenance;
