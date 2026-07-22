import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface FAQItem {
  number: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    number: '01',
    question: 'Thời gian khảo sát và lập phương án tư vấn kỹ thuật mất bao lâu?',
    answer: 'Đội ngũ kỹ sư CTC sẽ tiếp nhận thông tin và tiến hành khảo sát thực địa tận nơi trong vòng 24 - 48 giờ trên toàn quốc. Phương án thiết kế 3D và báo giá chi tiết sẽ được hoàn thành trong vòng 3 ngày làm việc.'
  },
  {
    number: '02',
    question: 'Thời gian hoàn vốn trung bình cho dự án điện mặt trời mái nhà xưởng là bao lâu?',
    answer: 'Thời gian hoàn vốn trung bình dao động từ 3.5 đến 4.5 năm tùy thuộc vào giá điện hiện tại và tỷ lệ tự dùng của doanh nghiệp. Tuổi thọ hệ thống đạt trên 25-30 năm, mang lại lợi nhuận điện ròng trong hơn 20 năm.'
  },
  {
    number: '03',
    question: 'CTC có hỗ trợ trọn gói thủ tục thỏa thuận đấu nối với Tập đoàn Điện lực EVN không?',
    answer: 'Có. Là tổng thầu EPC chuyên nghiệp, CTC sẽ chịu trách nhiệm trọn gói từ khâu khảo sát, thiết kế, nộp hồ sơ xin thỏa thuận kỹ thuật đấu nối EVN, kiểm định an toàn PCCC cho đến khi đóng điện nghiệm thu.'
  },
  {
    number: '04',
    question: 'Chính sách bảo hành và dịch vụ vận hành O&M của CTC như thế nào?',
    answer: 'CTC cung cấp chính sách bảo hành thiết bị chính hãng: Tấm pin bảo hành hiệu suất 25 năm, Biến tần Inverter bảo hành 10 năm, Khung giàn nhôm bảo hành 15 năm. Đồng thời miễn phí 2 năm gói dịch vụ bảo trì rửa pin & kiểm tra nhiệt độ 6 tháng/lần.'
  }
];

const ContactFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mb-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black rounded-full uppercase tracking-widest border border-amber-500/20">
          GIẢI ĐÁP THẮC MẮC
        </span>
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-3 mb-2">
          Câu Hỏi Thường Gặp (FAQ)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Giải đáp các thắc mắc phổ biến của chủ đầu tư trước khi triển khai hệ thống điện mặt trời.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={`faq-item-${idx}`}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/80 shadow-md overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-gray-900 dark:text-white hover:text-amber-500 transition-colors text-base"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                    {faq.number}
                  </span>
                  <span className="leading-snug">{faq.question}</span>
                </div>
                {isOpen ? (
                  <ChevronUp size={20} className="text-amber-500 flex-shrink-0" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700/60 pt-4 animate-fade-in pl-16">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactFAQ;
