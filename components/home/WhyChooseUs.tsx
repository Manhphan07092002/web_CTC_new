import React from 'react';
import { Users, Award, Settings, Handshake, TrendingUp, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import companyProfile from '../../constants/company_profile.json';

interface WhyChooseUsProps {
  onOpenModal: (title: string, desc: string, details: string) => void;
}

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onOpenModal }) => {
  const { language } = useLanguage();
  const { ref: whyRef, isInView } = useInView(0.1);
  const isEn = language === 'en';

  const items = [
    {
      icon: Users,
      title: isEn ? "TALENTED HUMAN RESOURCES" : "ĐỘI NGŨ NHÂN SỰ GIỎI",
      desc: isEn 
        ? "CTC is proud to have a team of highly experienced and talented staff, providing advanced customized solutions tailored to clients' needs, while ensuring success and efficiency for every project."
        : "Công ty Cổ phần Xây lắp Bưu điện Miền Trung tự hào có đội ngũ nhân sự giàu kinh nghiệm và tài năng, cung cấp các giải pháp tùy chỉnh tiên tiến và phù hợp với nhu cầu của khách hàng; đồng thời, đem lại sự thành công và hiệu quả cho mọi dự án.",
      details: isEn
        ? "CTC is proud to own a team of skilled, experienced, and highly dedicated engineers and staff. We frequently organize internal training to upgrade skills and adapt to the latest global technologies. Professionalism, responsibility, and deep technical understanding are the keys to overcoming any engineering challenges."
        : "CTC tự hào sở hữu đội ngũ cán bộ, kỹ sư và công nhân lành nghề, giàu kinh nghiệm thực chiến. Chúng tôi thường xuyên tổ chức đào tạo nội bộ và nâng cao tay nghề, tiếp cận các công nghệ mới nhất trên thế giới. Sự chuyên nghiệp, tinh thần trách nhiệm cao và am hiểu kỹ thuật chuyên sâu là chìa khóa giúp CTC luôn vượt qua mọi thách thức kỹ thuật khó khăn.",
      color: 'from-blue-500 to-blue-700',
      shadow: 'shadow-blue-500/10'
    },
    {
      icon: Award,
      title: isEn ? "QUALITY & SERVICE" : "CHẤT LƯỢNG VÀ DỊCH VỤ",
      desc: isEn 
        ? "Products and services supplied by CTC are strictly verified under international standards. This comes along with comprehensive consultancy, technical assistance, and warranty service for projects."
        : "Sản phẩm và dịch vụ do Công ty Cổ phần Xây lắp Bưu điện Miền Trung cung cấp được kiểm tra nghiêm ngặt theo tiêu chuẩn quốc tế. Đi kèm theo đó là dịch vụ hỗ trợ tư vấn, kỹ thuật và bảo hành toàn diện cho các dự án.",
      details: isEn
        ? "We apply strict ISO quality control processes throughout the engineering, procurement, and construction phases. All equipment supplied by CTC complies with international standards, supported by long-term warranty policies and dedicated maintenance."
        : "Chúng tôi áp dụng quy trình kiểm soát chất lượng chuẩn ISO nghiêm ngặt trên toàn bộ quy trình thiết kế, mua sắm vật tư và thi công. Tất cả trang thiết bị do CTC cung cấp đều đạt tiêu chuẩn quốc tế và đi kèm gói bảo hành lâu dài, dịch vụ bảo trì định kỳ chu đáo.",
      color: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/10'
    },
    {
      icon: Settings,
      title: isEn ? "MODERN TECHNOLOGY" : "CÔNG NGHỆ HIỆN ĐẠI",
      desc: isEn 
        ? "Applying state-of-the-art technology in engineering design, construction, and project management. Utilizing advanced machinery and equipment to ensure deadlines and project quality."
        : "Ứng dụng công nghệ tiên tiến trong thiết kế, thi công và quản lý dự án. Sử dụng máy móc, thiết bị hiện đại để đảm bảo tiến độ và chất lượng công trình.",
      details: isEn
        ? "Constantly investing in state-of-the-art construction machinery, specialized testing equipment, and advanced management software. Implementing digitization and automation helps boost productivity, mitigate risks, and ensure excellent project delivery."
        : "Không ngừng đầu tư vào máy móc thi công hiện đại, thiết bị đo kiểm chuyên dụng thế hệ mới và các phần mềm quản lý tiên tiến. Việc ứng dụng công nghệ số và tự động hóa giúp tăng năng suất thi công, kiểm soát rủi ro tối đa và đảm bảo tiến độ bàn giao xuất sắc.",
      color: 'from-pink-400 to-rose-500',
      shadow: 'shadow-pink-500/10'
    },
    {
      icon: Handshake,
      title: isEn ? "STRATEGIC PARTNERS" : "ĐỐI TÁC CHIẾN LƯỢC",
      desc: isEn 
        ? "CTC is a strategic partner of many leading domestic and international brands, delivering diverse solutions to meet the demands of our clients."
        : "Công ty Cổ phần Xây lắp Bưu điện Miền Trung là đối tác chiến lược của nhiều thương hiệu hàng đầu trong và ngoài nước, cung cấp giải pháp đa dạng đáp ứng nhu cầu khách hàng.",
      details: isEn
        ? "With strong status and reputation, CTC is a long-term strategic partner of major global technology and equipment brands (like Huawei, Longi, Canadian Solar, and top telecom operators like Viettel, VNPT, Mobifone). This enables us to secure high-quality equipment, optimal pricing, and direct technical support."
        : "Với vị thế và uy tín vững chắc, CTC là đối tác chiến lược lâu năm của các tập đoàn công nghệ và thiết bị lớn trên thế giới (như Huawei, Longi, Canadian Solar, các nhà mạng viễn thông Viettel, VNPT, Mobifone). Điều này giúp chúng tôi tiếp cận nguồn thiết bị chất lượng cao, giá thành ưu đãi và sự hỗ trợ kỹ thuật trực tiếp từ hãng.",
      color: 'from-sky-400 to-cyan-500',
      shadow: 'shadow-sky-500/10'
    },
    {
      icon: TrendingUp,
      title: isEn ? "SUSTAINABLE DEVELOPMENT" : "PHÁT TRIỂN BỀN VỮNG",
      desc: isEn 
        ? "Committed to sustainable development, stable growth, and generating long-term values for clients and partners."
        : "Cam kết phát triển bền vững, tăng trưởng ổn định và tạo giá trị lâu dài cho khách hàng và đối tác.",
      details: isEn
        ? "CTC commits to linking business operations with environmental protection and social responsibility. We are pioneers in promoting clean energy solutions (solar, wind) and reducing carbon footprints, aiming for a sustainable and prosperous future."
        : "CTC cam kết gắn liền hoạt động kinh doanh với bảo vệ môi trường và đóng góp cho cộng đồng. Chúng tôi đi đầu trong việc thúc đẩy các giải pháp năng lượng xanh (điện mặt trời, điện gió), giảm thiểu lượng phát thải carbon, hướng tới một tương lai phát triển bền vững và thịnh vượng.",
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10'
    }
  ];

  return (
    <section ref={whyRef} className="py-24 bg-slate-50 dark:bg-[#060d1d] relative overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        .why-blueprint-lines {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
            background-size: 80px 80px;
            z-index: 1;
            opacity: 0.5;
            pointer-events: none;
        }
        .dark .why-blueprint-lines {
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }

        .why-aura-glow {
            position: absolute;
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, rgba(14, 165, 233, 0.16) 0%, transparent 70%);
            filter: blur(90px);
            z-index: 1;
            pointer-events: none;
        }
        .dark .why-aura-glow {
            background: radial-gradient(circle, rgba(14, 165, 233, 0.04) 0%, transparent 70%);
        }
        .w-aura-1 { top: -10%; left: -5%; }
        .w-aura-2 { bottom: -10%; right: -5%; }

        .why-glass-badge {
            background: rgba(255, 255, 255, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.7);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
        }
        .dark .why-glass-badge {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .why-glass-card {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.65);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.02), inset 0 1px 2px rgba(255, 255, 255, 0.5);
            z-index: 10;
        }
        .dark .why-glass-card {
            background: rgba(255, 255, 255, 0.015);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .why-glass-card:hover {
            transform: translateY(-4px);
            background: rgba(255, 255, 255, 0.45);
            border-color: rgba(14, 165, 233, 0.4);
            box-shadow: 0 15px 35px -10px rgba(14, 165, 233, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.6);
        }
        .dark .why-glass-card:hover {
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(56, 189, 248, 0.3);
            box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .why-glass-row {
            background: rgba(255, 255, 255, 0.22);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.65);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 4px 15px -5px rgba(0,0,0,0.01), inset 0 1px 1px rgba(255, 255, 255, 0.4);
        }
        .dark .why-glass-row {
            background: rgba(255, 255, 255, 0.01);
            border: 1px solid rgba(255, 255, 255, 0.06);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.02);
        }
        .why-glass-row:hover {
            transform: translateX(8px);
            background: rgba(255, 255, 255, 0.45);
            border-color: rgba(14, 165, 233, 0.35);
            box-shadow: 0 10px 25px -10px rgba(14, 165, 233, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.5);
        }
        .dark .why-glass-row:hover {
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(56, 189, 248, 0.25);
            box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.08);
        }

        .pulse-glow-icon::before {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            background: inherit;
            opacity: 0;
            z-index: -1;
            transition: all 0.4s ease;
        }
        .why-glass-row:hover .pulse-glow-icon::before {
            opacity: 0.25;
            animation: pulseIcon 2s infinite;
        }
        @keyframes pulseIcon {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.3); opacity: 0.1; }
            100% { transform: scale(1); opacity: 0.3; }
        }

        @keyframes floatNormal {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-float-normal {
            animation: floatNormal 6s ease-in-out infinite;
        }
      `}} />

      <div className="why-blueprint-lines"></div>
      <div className="why-aura-glow w-aura-1"></div>
      <div className="why-aura-glow w-aura-2"></div>

      <div className="container max-w-[1440px] mx-auto px-4 sm:px-6 relative z-10">
        <div className={`flex flex-col lg:flex-row gap-16 items-center transition-all duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Left Column: Premium Visual Collage */}
          <div className="w-full lg:w-1/2 relative">
            {/* Decorative background blur glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/10 to-blue-600/10 rounded-[2.5rem] blur-3xl opacity-70"></div>
            
            {/* Main Image in Glass Frame */}
            <div className="relative why-glass-card p-3.5 rounded-[2.8rem] overflow-hidden shadow-2xl z-10">
              <div className="relative aspect-[4/3] rounded-[2.2rem] overflow-hidden">
                <img 
                  src="/images/why_choose_us_visual.png" 
                  alt="Why Choose CTC" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[1200ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                
                {/* Visual overlay title - shifted right to prevent overlapping with bottom-left floating badge */}
                <div className="absolute bottom-7 left-28 sm:left-32 right-7 text-white">
                  <span className="text-[9px] font-black uppercase tracking-widest text-sky-400 bg-sky-950/40 px-2.5 py-1 rounded-md backdrop-blur-sm inline-block mb-2">CTC CO., LTD</span>
                  <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black leading-tight">{isEn ? "Pioneering Sustainable Engineering Solutions" : "Tiên phong giải pháp xây lắp bền vững"}</h4>
                </div>
              </div>
            </div>

            {/* Floating Badge 1: Years of Service */}
            <div 
              className="absolute -top-8 -right-4 sm:-right-8 why-glass-card w-32 h-32 sm:w-36 sm:h-36 rounded-[2rem] flex flex-col items-center justify-center p-4 shadow-2xl z-20 animate-float-normal cursor-default select-none" 
              style={{ animationDelay: '0s' }}
            >
              <span className="text-3xl sm:text-4xl font-black text-sky-500 dark:text-sky-400 tracking-tight leading-none">
                {companyProfile.hero_statistics.experience_years || "22+"}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 dark:text-slate-200 tracking-wider text-center uppercase mt-2.5 leading-tight max-w-[85px]">
                {isEn ? "YEARS EXPERIENCE" : "NĂM KINH NGHIỆM"}
              </span>
            </div>

            {/* Floating Badge 2: Success Projects Rate */}
            <div 
              className="absolute -bottom-8 -left-4 sm:-left-8 why-glass-card w-32 h-32 sm:w-36 sm:h-36 rounded-[2rem] flex flex-col items-center justify-center p-4 shadow-2xl z-20 animate-float-normal cursor-default select-none" 
              style={{ animationDelay: '3s' }}
            >
              <span className="text-3xl sm:text-4xl font-black text-sky-500 dark:text-sky-400 tracking-tight leading-none">
                {companyProfile.hero_statistics.similar_projects || "500+"}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 dark:text-slate-200 tracking-wider text-center uppercase mt-2.5 leading-tight max-w-[90px]">
                {isEn ? "PROJECTS COMPLETED" : "DỰ ÁN HOÀN THÀNH"}
              </span>
            </div>
          </div>

          {/* Right Column: High-tech List Content */}
          <div className="w-full lg:w-1/2 space-y-8 flex flex-col justify-center">
            
            {/* Header Area */}
            <div className="space-y-4 text-center lg:text-left">
              <div className="why-glass-badge inline-flex items-center gap-2 px-5 py-1.5 rounded-full">
                <Award size={18} className="text-sky-500" />
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                  {isEn ? "Why Choose Us" : "Tại sao chọn chúng tôi?"}
                </span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight uppercase tracking-wide">
                {isEn ? "WHY CHOOSE CTC?" : "TẠI SAO CHỌN CHÚNG TÔI?"}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                {isEn 
                  ? "Central Vietnam Posts and Telecommunications Construction Joint-Stock Company (CTC) – A trusted partner with rich experience and a team of highly-trained, expert professionals who have executed major projects for domestic and foreign enterprises. We commit to bringing optimal solutions, meeting all client requirements professionally and efficiently."
                  : "Công ty Cổ phần Xây lắp Bưu điện Miền Trung – Đối tác tin cậy với bề dày kinh nghiệm, đội ngũ chuyên gia giàu chuyên môn, được đào tạo bài bản và đã thực hiện nhiều dự án lớn cho doanh nghiệp trong và ngoài nước. Chúng tôi cam kết mang đến giải pháp tối ưu, đáp ứng mọi nhu cầu của khách hàng một cách chuyên nghiệp và hiệu quả."}
              </p>
            </div>

            {/* Vertical glass rows stack */}
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  onClick={() => onOpenModal(item.title, item.desc, item.details)}
                  className="why-glass-row p-4 sm:p-5 rounded-2xl cursor-pointer flex items-center gap-4 sm:gap-5"
                >
                  <div className="flex-shrink-0 relative">
                    <div className={`float-icon pulse-glow-icon w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md relative z-10`}>
                      <item.icon size={20} />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider transition-colors duration-200">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                  
                  <div className="text-slate-400 hover:text-sky-500 flex-shrink-0 self-center transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
