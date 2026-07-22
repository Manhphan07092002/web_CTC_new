import React from 'react';
import { Phone, Mail, MapPin, Clock, ExternalLink, Copy, Check } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const ContactInfoCards: React.FC = () => {
  const { showToast } = useToast();
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Đã sao chép: ' + text, 'info');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const cards = [
    {
      icon: Phone,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-100 dark:border-blue-800',
      title: 'Hotline Tư Vấn 24/7',
      primaryText: '0236 374 5555',
      secondaryText: '0915 059 666',
      actionText: 'Gọi ngay',
      actionUrl: 'tel:0915059666',
      copyText: '0915059666'
    },
    {
      icon: Mail,
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 border-orange-100 dark:border-orange-800',
      title: 'Email Hỗ Trợ Khách Hàng',
      primaryText: 'info@ctcdn.vn',
      secondaryText: 'kinhdoanh@ctcdn.vn',
      actionText: 'Gửi Email',
      actionUrl: 'mailto:info@ctcdn.vn',
      copyText: 'info@ctcdn.vn'
    },
    {
      icon: MapPin,
      color: 'bg-green-50 text-green-600 dark:bg-green-950/60 dark:text-green-400 border-green-100 dark:border-green-800',
      title: 'Trụ Sở Chính CTC',
      primaryText: '50B Nguyễn Du, P. Thạch Thang',
      secondaryText: 'Q. Hải Châu, TP. Đà Nẵng',
      actionText: 'Chỉ đường',
      actionUrl: 'https://maps.google.com/?q=50B+Nguyen+Du+Da+Nang',
      copyText: '50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng'
    },
    {
      icon: Clock,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-100 dark:border-purple-800',
      title: 'Thời Gian Làm Việc',
      primaryText: 'Thứ 2 - Thứ 7: 08:00 - 17:30',
      secondaryText: 'Chủ nhật: Trực Hotline 24/7',
      actionText: 'Lịch tư vấn',
      actionUrl: '#form-sec',
      copyText: 'Thứ 2 - Thứ 7: 08:00 - 17:30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={`contact-card-${idx}`}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3.5 rounded-2xl border ${card.color} group-hover:scale-105 transition-transform`}>
                  <IconComponent size={26} />
                </div>
                <button
                  onClick={() => handleCopy(card.copyText, idx)}
                  className="p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-semibold"
                  title="Sao chép thông tin"
                >
                  {copiedIndex === idx ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>

              <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-2">
                {card.title}
              </h4>
              <p className="text-sm font-extrabold text-corporate dark:text-primary mb-0.5">
                {card.primaryText}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {card.secondaryText}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
              <a
                href={card.actionUrl}
                target={card.actionUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="text-xs font-bold text-primary hover:text-secondary flex items-center gap-1 group-hover:underline"
              >
                <span>{card.actionText}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactInfoCards;
