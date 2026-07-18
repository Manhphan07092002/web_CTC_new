import React from 'react';
import { Target, Briefcase, PenTool, HardHat, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface WorkflowProps {
  onOpenWorkflowModal: (step: string, title: string, desc: string, details: string, color: string) => void;
}

const Workflow: React.FC<WorkflowProps> = ({ onOpenWorkflowModal }) => {
  const { t } = useLanguage();

  const steps = [
    { 
      step: "01", 
      title: t('home.step_1'), 
      icon: Briefcase, 
      desc: t('home.step_1_desc'), 
      color: 'from-blue-500 to-cyan-500',
      details: 'Đội ngũ kỹ sư chuyên nghiệp sẽ đến tận nơi để khảo sát thực tế mái nhà, đánh giá khả năng chịu tải, hướng nắng và các yếu tố ảnh hưởng. Tư vấn miễn phí về giải pháp tối ưu nhất, tính toán công suất phù hợp với nhu cầu sử dụng điện và ngân sách của gia đình.'
    },
    { 
      step: "02", 
      title: t('home.step_2'), 
      icon: PenTool, 
      desc: t('home.step_2_desc'), 
      color: 'from-purple-500 to-pink-500',
      details: 'Lên bản vẽ chi tiết về mô phỏng sản lượng điện, bố trí tấm pin tối ưu trên mái nhà. Tính toán chính xác chi phí đầu tư, thời gian hoàn vốn và lợi nhuận dự kiến. Thiết kế hệ thống phù hợp với tiêu chuẩn kỹ thuật và quy định pháp luật hiện hành.'
    },
    { 
      step: "03", 
      title: t('home.step_3'), 
      icon: HardHat, 
      desc: t('home.step_3_desc'), 
      color: 'from-primary to-orange-500',
      details: 'Thi công lắp đặt nhanh chóng, an toàn với đội ngũ kỹ thuật viên được đào tạo chuyên nghiệp. Sử dụng thiết bị và vật liệu chất lượng cao, tuân thủ nghiêm ngặt quy trình kỹ thuật. Hoàn thành trong 1-3 ngày tùy theo quy mô dự án.'
    },
    { 
      step: "04", 
      title: t('home.step_4'), 
      icon: ShieldCheck, 
      desc: t('home.step_4_desc'), 
      color: 'from-green-500 to-emerald-500',
      details: 'Giám sát hệ thống 24/7 qua ứng dụng thông minh, cảnh báo sự cố tức thì. Bảo trì định kỳ miễn phí, vệ sinh tấm pin để đảm bảo hiệu suất tối đa. Đội ngũ kỹ thuật sẵn sàng hỗ trợ và sửa chữa trong thời gian bảo hành.'
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-900">
      <div className="container max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Target size={18} className="text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('home.workflow_badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">{t('home.workflow_title')}</h2>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary via-orange-500 to-primary"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {steps.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => onOpenWorkflowModal(item.step, item.title, item.desc, item.details, item.color)}
                className="group bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 hover:border-transparent hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] transition-all duration-700 ease-in-out text-center hover:-translate-y-2 hover:scale-102 relative overflow-hidden z-10 hover:z-20 cursor-pointer"
              >
                {/* Background Glow on Hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-3 bg-gradient-to-br ${item.color} transition-opacity duration-700 ease-in-out`}></div>
                
                {/* Step Number */}
                <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center text-2xl font-black mb-6 shadow-xl group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 ease-in-out relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"></div>
                  <span className="relative z-10">{item.step}</span>
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-200 ease-in-out group-hover:scale-105">
                  <item.icon size={28} className="text-gray-600 dark:text-slate-300 group-hover:text-primary transition-colors duration-200 ease-in-out" />
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors duration-200 ease-in-out">{item.title}</h3>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed transition-colors duration-200 ease-in-out group-hover:text-gray-800 dark:group-hover:text-slate-200">{item.desc}</p>
                
                {/* Progress indicator appearing on hover */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-in-out delay-100">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Bước {item.step}</span>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
