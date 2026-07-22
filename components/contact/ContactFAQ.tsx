import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'Thời gian khảo sát và lập phương án tư vấn kỹ thuật mất bao lâu?',
    answer: 'Đội ngũ kỹ sư CTC sẽ tiếp nhận thông tin và tiến hành khảo sát thực địa tận nơi trong vòng 24 - 48 giờ trên toàn quốc. Phương án thiết kế 3D và báo giá chi tiết sẽ được hoàn thành trong vòng 3 ngày làm việc.'
  },
  {
    question: 'Thời gian hoàn vốn trung bình cho dự án điện mặt trời mái nhà xưởng là bao lâu?',
    answer: 'Thời gian hoàn vốn trung bình dao động từ 3.5 đến 4.5 năm tùy thuộc vào giá điện hiện tại và tỷ lệ tự dùng của doanh nghiệp. Tuổi thọ hệ thống đạt trên 25-30 năm, mang lại lợi nhuận điện ròng trong hơn 20 năm.'
  },
  {
    question: 'CTC có hỗ trợ trọn gói thủ tục thỏa thuận đấu nối với Tập đoàn Điện lực EVN không?',
    answer: 'Có. Là tổng thầu EPC chuyên nghiệp, CTC sẽ chịu trách nhiệm trọn gói từ khâu khảo sát, thiết kế, nộp hồ sơ xin thỏa thuận kỹ thuật đấu nối EVN, kiểm định an toàn PCCC cho đến khi đóng điện nghiệm thu.'
  },
  {
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
    <div className="mb-16">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h3 className="text-2xl md:text-3xl font-extrabold text-corporate dark:text-white tracking-tight mb-2">
          Câu Hỏi Thường Gặp (FAQ)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Giải đáp các thắc mắc phổ biến của chủ đầu tư trước khi triển khai hệ thống năng lượng mặt trời.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={`faq-${idx}`}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-gray-800 dark:text-gray-100 hover:text-primary transition-colors text-base"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle size={20} className="text-primary flex-shrink-0" />
                  {faq.question}
                </span>
                {isOpen ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4 animate-fade-in pl-12">
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
