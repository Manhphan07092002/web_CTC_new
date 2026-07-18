import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { useMouseParallax } from '../../hooks/useMouseParallax';

interface AboutProps {
  onOpenModal: (title: string, desc: string, details: string) => void;
}

const About: React.FC<AboutProps> = ({ onOpenModal }) => {
  const { t } = useLanguage();
  const parallax = useMouseParallax();
  const { ref: aboutRef, isInView } = useInView(0.1);

  return (
    <section ref={aboutRef} className="py-12 sm:py-20 lg:py-32 bg-white dark:bg-slate-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] lg:w-[600px] h-[300px] sm:h-[500px] lg:h-[600px] bg-gray-50/80 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ transform: `translate(${parallax.x * -1}px, ${parallax.y * -1}px)` }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
          {/* Left: Images Grid with Parallax */}
          <div className={`relative transition-all duration-300 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6 translate-y-12" style={{ transform: `translateY(${48 + parallax.y * 0.5}px)` }}>
                <img
                  src="/uploads/images/Images_web/1764042731577-57377200.jpg"
                  alt="Solar Installation Team"
                  className="rounded-3xl shadow-2xl w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                />
                <img
                  src="/uploads/images/Images_web/1764042848653-118772669.jpg"
                  alt="Engineers Meeting"
                  className="rounded-3xl shadow-xl w-full h-56 object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="space-y-6" style={{ transform: `translateY(${parallax.y * -0.5}px)` }}>
                <img
                  src="/uploads/images/Images_web/1764042848656-866298623.jpg"
                  alt="Modern Office"
                  className="rounded-3xl shadow-xl w-full h-56 object-cover hover:scale-105 transition-transform duration-700"
                />
                <img
                  src="/uploads/images/Images_web/1764042848644-300262289.png"
                  alt="Solar Panels"
                  className="rounded-3xl shadow-2xl w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            {/* Floating Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl p-8 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white text-center w-48 h-48 flex flex-col justify-center items-center z-20 animate-float hover:scale-110 transition-transform duration-300">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 mb-1">10+</div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-widest">{t('home.stat_exp')}</div>
            </div>
          </div>

          {/* Right: Content */}
          <div className={`space-y-10 transition-all duration-300 delay-100 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full mb-6 hover:bg-orange-100 transition-colors">
                <Target size={18} className="text-primary animate-spin-slow" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.about_badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-8 leading-[1.4] py-2">
                <span className="block overflow-visible">
                  <span className={`block transition-transform duration-700 ${isInView ? 'translate-y-0' : 'translate-y-full'}`}>{t('home.about_title')}</span>
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-slate-300 leading-relaxed mb-6 text-justify indent-8">
                {t('home.about_desc')}
              </p>
              <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed font-light text-justify indent-8">
                {t('home.about_desc_2')}
              </p>
            </div>

            {/* Mission, Vision, Values Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
              {[
                { 
                  icon: Target, 
                  title: t('home.mission'), 
                  desc: t('home.mission_desc'), 
                  color: 'text-blue-500', 
                  bg: 'bg-blue-50',
                  details: 'Chúng tôi cam kết mang đến giải pháp năng lượng tái tạo chất lượng cao, giúp khách hàng tiết kiệm chi phí và bảo vệ môi trường. Với đội ngũ kỹ sư giàu kinh nghiệm và công nghệ tiên tiến, chúng tôi đảm bảo hệ thống hoạt động hiệu quả tối đa.'
                },
                { 
                  icon: Eye, 
                  title: t('home.vision'), 
                  desc: t('home.vision_desc'), 
                  color: 'text-orange-500', 
                  bg: 'bg-orange-50',
                  details: 'Trở thành công ty hàng đầu Việt Nam trong lĩnh vực năng lượng tái tạo, góp phần xây dựng một tương lai xanh và bền vững. Chúng tôi hướng tới việc phổ cập năng lượng mặt trời đến mọi gia đình và doanh nghiệp.'
                },
                { 
                  icon: Heart, 
                  title: t('home.values'), 
                  desc: t('home.values_desc'), 
                  color: 'text-red-500', 
                  bg: 'bg-red-50',
                  details: 'Chất lượng - Uy tín - Trách nhiệm. Chúng tôi đặt lợi ích khách hàng lên hàng đầu, cam kết cung cấp sản phẩm chất lượng cao với dịch vụ hậu mãi tận tâm. Mọi dự án đều được thực hiện với tinh thần trách nhiệm cao nhất.'
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-primary/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group perspective-1000">
                  <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300`}>
                    <item.icon size={24} className={item.color} />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                  <button 
                    onClick={() => onOpenModal(item.title, item.desc, item.details)}
                    className="text-primary font-semibold text-sm hover:text-orange-600 transition-colors flex items-center gap-1 group-hover:gap-2 duration-300"
                  >
                    Tìm hiểu thêm 
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/about" className="group bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-primary transition-all duration-300 flex items-center gap-3 hover:-translate-y-1 hover:shadow-lg overflow-hidden relative">
                <span className="relative z-10 flex items-center gap-2">
                  {t('home.learn_more')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
              <Link to="/contact" className="bg-white border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-full font-bold hover:border-primary hover:text-primary transition-all duration-300 hover:-translate-y-1">
                {t('home.contact_us')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
