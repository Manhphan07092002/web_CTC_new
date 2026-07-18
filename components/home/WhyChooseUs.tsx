import React from 'react';
import { Award, Zap, ShieldCheck, Users, BatteryCharging, Leaf, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';

interface WhyChooseUsProps {
  onOpenModal: (title: string, desc: string, details: string) => void;
}

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onOpenModal }) => {
  const { t } = useLanguage();
  const { ref: whyRef, isInView } = useInView(0.1);

  const items = [
    { 
      icon: Zap, 
      title: t('home.why_1_title'), 
      desc: t('home.why_1_desc'), 
      color: 'from-yellow-400 to-orange-500', 
      shadow: 'shadow-orange-200',
      details: 'Hệ thống điện mặt trời của chúng tôi được thiết kế tối ưu với công nghệ inverter AI thế hệ mới, đảm bảo hiệu suất chuyển đổi năng lượng đạt trên 80%. Sử dụng tấm pin Tier 1 từ các thương hiệu hàng đầu thế giới như Longi, Canadian Solar với hiệu suất cao và độ bền vượt trội.'
    },
    { 
      icon: ShieldCheck, 
      title: t('home.why_2_title'), 
      desc: t('home.why_2_desc'), 
      color: 'from-blue-500 to-cyan-500', 
      shadow: 'shadow-blue-200',
      details: 'Chính sách bảo hành toàn diện với cam kết 1 đổi 1 cho tấm pin trong 12 năm đầu và bảo hành hiệu suất 25 năm. Đội ngũ kỹ thuật 24/7 sẵn sàng hỗ trợ bảo trì và sửa chữa. Bảo hiểm thiết bị từ các công ty uy tín.'
    },
    { 
      icon: Users, 
      title: t('home.why_3_title'), 
      desc: t('home.why_3_desc'), 
      color: 'from-green-500 to-emerald-500', 
      shadow: 'shadow-green-200',
      details: 'Đội ngũ kỹ sư được đào tạo bài bản với chứng chỉ hành nghề và kinh nghiệm thực chiến. Quy trình thi công chuẩn quốc tế, giám sát chất lượng nghiêm ngặt. Đã hoàn thành hơn 1000+ dự án trên toàn quốc với tỷ lệ hài lòng 99%.'
    },
    { 
      icon: BatteryCharging, 
      title: t('home.why_4_title'), 
      desc: t('home.why_4_desc'), 
      color: 'from-purple-500 to-pink-500', 
      shadow: 'shadow-purple-200',
      details: 'Hệ thống lưu trữ năng lượng thông minh với công nghệ Hybrid/ESS, tự động chuyển đổi giữa điện lưới và điện tích trữ. Ứng dụng giám sát từ xa 24/7, cảnh báo sự cố tức thì. Tối ưu hóa việc sử dụng điện và tiết kiệm tối đa chi phí.'
    },
    { 
      icon: Award, 
      title: t('home.why_5_title'), 
      desc: t('home.why_5_desc'), 
      color: 'from-red-500 to-rose-500', 
      shadow: 'shadow-red-200',
      details: 'Đối tác chiến lược độc quyền của Huawei, Canadian Solar, Longi tại thị trường Việt Nam. Nhận được nhiều giải thưởng uy tín về chất lượng dịch vụ và công nghệ. Được khách hàng tin tưởng và đánh giá cao về độ uy tín và chuyên nghiệp.'
    },
    { 
      icon: Leaf, 
      title: t('home.why_6_title'), 
      desc: t('home.why_6_desc'), 
      color: 'from-teal-500 to-green-500', 
      shadow: 'shadow-teal-200',
      details: 'Mỗi hệ thống điện mặt trời lắp đặt giúp giảm thiểu hàng tấn CO2 thải ra môi trường mỗi năm. Góp phần xây dựng tương lai xanh, bền vững cho thế hệ tương lai. Tuân thủ các tiêu chuẩn môi trường quốc tế và cam kết phát triển bền vững.'
    },
  ];

  return (
    <section ref={whyRef} className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      <div className="container max-w-[1440px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Award size={18} className="text-primary animate-bounce-once" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.why_choose')}</span>
          </div>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">{t('home.why_choose_title')}</h3>
          <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">{t('home.why_choose_desc')}</p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-all duration-300 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {items.map((item, index) => (
            <div key={index} className="group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-transparent hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] transition-all duration-700 ease-in-out hover:-translate-y-2 hover:scale-102 relative overflow-hidden z-10 hover:z-20 cursor-default">
              {/* Background Glow on Hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-3 bg-gradient-to-br ${item.color} transition-opacity duration-700 ease-in-out`}></div>
              
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-5 rounded-bl-full transition-transform duration-700 ease-in-out group-hover:scale-125`}></div>
              
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg ${item.shadow} group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 ease-in-out`}>
                <item.icon size={28} className="text-white" />
              </div>
              
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors duration-200 ease-in-out">{item.title}</h4>
              
              <p className="text-gray-600 leading-relaxed transition-colors duration-200 ease-in-out group-hover:text-gray-800">
                {item.desc}
              </p>
              
              {/* Learn more link appearing on hover */}
              <button 
                onClick={() => onOpenModal(item.title, item.desc, item.details)}
                className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-in-out delay-100 flex items-center gap-2 text-sm font-bold text-primary hover:text-orange-600 w-full text-left"
              >
                <span>Tìm hiểu thêm</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
