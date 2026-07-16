import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { generateFAQSchema, FAQItem } from '../utils/seoSchemas';
import { useLanguage } from '../contexts/LanguageContext';

interface FAQProps {
  faqs?: FAQItem[];
  title?: string;
  className?: string;
}

// Default FAQs for solar energy business
const defaultFAQs: Record<string, FAQItem[]> = {
  vi: [
    {
      question: 'Điện mặt trời hoạt động như thế nào?',
      answer: 'Hệ thống điện mặt trời hoạt động bằng cách chuyển đổi ánh sáng mặt trời thành điện năng thông qua các tấm pin quang điện. Khi ánh sáng chiếu vào tấm pin, nó tạo ra dòng điện một chiều (DC), sau đó được chuyển đổi thành điện xoay chiều (AC) qua inverter để sử dụng cho các thiết bị điện trong nhà.'
    },
    {
      question: 'Chi phí lắp đặt hệ thống điện mặt trời là bao nhiêu?',
      answer: 'Chi phí lắp đặt phụ thuộc vào công suất hệ thống và nhu cầu sử dụng điện. Một hệ thống 5kWp cho hộ gia đình có giá từ 60-80 triệu đồng. Hệ thống lớn hơn cho doanh nghiệp có thể từ 200-500 triệu đồng trở lên. Liên hệ với chúng tôi để được báo giá chi tiết.'
    },
    {
      question: 'Thời gian hoàn vốn của hệ thống điện mặt trời?',
      answer: 'Thời gian hoàn vốn trung bình từ 4-6 năm tùy thuộc vào mức tiêu thụ điện và vị trí địa lý. Sau khi hoàn vốn, bạn sẽ sử dụng điện miễn phí trong 20-25 năm còn lại của tuổi thọ hệ thống.'
    },
    {
      question: 'Hệ thống điện mặt trời có cần bảo trì không?',
      answer: 'Hệ thống điện mặt trời cần rất ít bảo trì. Bạn chỉ cần vệ sinh tấm pin 2-4 lần/năm để đảm bảo hiệu suất tối đa. Chúng tôi cung cấp dịch vụ bảo trì định kỳ miễn phí trong 2 năm đầu.'
    },
    {
      question: 'Điện mặt trời có hoạt động vào ngày mưa hoặc trời âm u không?',
      answer: 'Có, hệ thống vẫn hoạt động nhưng với hiệu suất thấp hơn (khoảng 10-25% so với ngày nắng). Tại Việt Nam với khí hậu nhiệt đới, số ngày nắng cao nên hệ thống vẫn đảm bảo sản lượng điện ổn định quanh năm.'
    },
    {
      question: 'Tuổi thọ của hệ thống điện mặt trời là bao lâu?',
      answer: 'Tấm pin mặt trời có tuổi thọ 25-30 năm với bảo hành hiệu suất 25 năm (đảm bảo còn 80% hiệu suất sau 25 năm). Inverter có tuổi thọ 10-15 năm với bảo hành 5-10 năm tùy hãng.'
    }
  ],
  en: [
    {
      question: 'How does solar energy work?',
      answer: 'Solar energy systems work by converting sunlight into electricity through photovoltaic panels. When sunlight hits the panels, it creates direct current (DC) electricity, which is then converted to alternating current (AC) by an inverter for use in your home or business.'
    },
    {
      question: 'How much does a solar system installation cost?',
      answer: 'Installation costs depend on system capacity and energy needs. A 5kWp residential system costs between 60-80 million VND. Larger commercial systems can range from 200-500 million VND or more. Contact us for a detailed quote.'
    },
    {
      question: 'What is the payback period for solar systems?',
      answer: 'The average payback period is 4-6 years depending on electricity consumption and location. After payback, you enjoy free electricity for the remaining 20-25 years of the system lifespan.'
    },
    {
      question: 'Does a solar system require maintenance?',
      answer: 'Solar systems require minimal maintenance. You only need to clean the panels 2-4 times per year to ensure maximum efficiency. We provide free periodic maintenance service for the first 2 years.'
    },
    {
      question: 'Does solar work on cloudy or rainy days?',
      answer: 'Yes, the system still works but at lower efficiency (about 10-25% compared to sunny days). In Vietnam with tropical climate, high number of sunny days ensures stable electricity production year-round.'
    },
    {
      question: 'How long do solar systems last?',
      answer: 'Solar panels have a lifespan of 25-30 years with 25-year performance warranty (guaranteed 80% efficiency after 25 years). Inverters last 10-15 years with 5-10 year warranty depending on brand.'
    }
  ]
};

const FAQ: React.FC<FAQProps> = ({ faqs, title, className = '' }) => {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = faqs || defaultFAQs[language] || defaultFAQs.vi;
  const sectionTitle = title || (language === 'en' ? 'Frequently Asked Questions' : 'Câu hỏi thường gặp');

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* JSON-LD Schema for FAQ */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema(faqItems))}
        </script>
      </Helmet>

      {/* Visual FAQ Section */}
      <section className={`py-12 ${className}`}>
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
              <HelpCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {sectionTitle}
            </h2>
            <p className="text-gray-600 dark:text-slate-400">
              {language === 'en' 
                ? 'Find answers to common questions about solar energy' 
                : 'Tìm câu trả lời cho các thắc mắc phổ biến về điện mặt trời'}
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 dark:text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-4 text-gray-600 dark:text-slate-300 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQ;
