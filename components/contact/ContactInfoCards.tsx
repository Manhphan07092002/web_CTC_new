import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Copy, Check, ArrowUpRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const ContactInfoCards: React.FC = () => {
  const { showToast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Đã sao chép: ' + text, 'info');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const cards = [
    {
      badge: 'HOTLINE 24/7',
      badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
      icon: Phone,
      iconBg: 'from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/30',
      title: 'Đường Dây Nóng Tư Vấn',
      primaryText: '0915 059 666',
      secondaryText: 'Tổng đài cố định: 0236 374 5555',
      actionText: 'Gọi tư vấn ngay',
      actionUrl: 'tel:0915059666',
      copyText: '0915059666'
    },
    {
      badge: 'EMAIL CHÍNH THỨC',
      badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
      icon: Mail,
      iconBg: 'from-blue-600 via-indigo-600 to-blue-700 text-white shadow-blue-500/30',
      title: 'Hỗ Trợ & Báo Giá',
      primaryText: 'info@ctcdn.vn',
      secondaryText: 'Dự án: ctc.solar@ctcdn.vn',
      actionText: 'Gửi Email báo giá',
      actionUrl: 'mailto:info@ctcdn.vn',
      copyText: 'info@ctcdn.vn'
    },
    {
      badge: 'TRỤ SỞ CHÍNH',
      badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
      icon: MapPin,
      iconBg: 'from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-emerald-500/30',
      title: 'Trụ Sở Đà Nẵng',
      primaryText: '50B Nguyễn Du, Hải Châu',
      secondaryText: 'TP. Đà Nẵng, Việt Nam',
      actionText: 'Xem bản đồ Google Maps',
      actionUrl: 'https://maps.google.com/?q=50B+Nguyen+Du+Hai+Chau+Da+Nang',
      copyText: '50B Nguyễn Du, Hải Châu, Đà Nẵng'
    },
    {
      badge: 'LỊCH LÀM VIỆC',
      badgeBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
      icon: Clock,
      iconBg: 'from-purple-600 via-indigo-700 to-purple-800 text-white shadow-purple-500/30',
      title: 'Thời Gian Hoạt Động',
      primaryText: 'Thứ 2 - Thứ 7: 08:00 - 17:30',
      secondaryText: 'Chủ nhật: Trực Hotline khảo sát 24/7',
      actionText: 'Đặt lịch hẹn tư vấn',
      actionUrl: '#form-sec',
      copyText: 'Thứ 2 - Thứ 7: 08:00 - 17:30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-10 relative z-20 mb-16">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={`glass-contact-card-${idx}`}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl p-7 rounded-3xl border border-white/80 dark:border-gray-700/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:border-amber-400/80 dark:hover:border-amber-400/80 hover:shadow-[0_20px_50px_rgba(245,158,11,0.2)] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Glass Light Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <span className={`px-3 py-1 text-[10px] font-black rounded-full border tracking-widest backdrop-blur-md ${card.badgeBg}`}>
                  {card.badge}
                </span>

                <button
                  onClick={() => handleCopy(card.copyText, idx)}
                  className="p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 text-gray-500 dark:text-gray-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors text-xs font-semibold backdrop-blur-md"
                  title="Sao chép"
                >
                  {copiedIndex === idx ? (
                    <span className="flex items-center gap-1 text-green-500 font-bold text-[11px]">
                      <Check size={14} /> Đã chép
                    </span>
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              {/* Icon & Details */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${card.iconBg} shadow-lg group-hover:scale-110 transition-transform`}>
                  <IconComponent size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base leading-snug">
                    {card.title}
                  </h4>
                  <p className="text-sm font-extrabold text-corporate dark:text-amber-400 mt-1 line-clamp-1">
                    {card.primaryText}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {card.secondaryText}
              </p>
            </div>

            {/* Bottom Link Button */}
            <div className="pt-5 mt-5 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
              <a
                href={card.actionUrl}
                target={card.actionUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="text-xs font-extrabold text-corporate dark:text-amber-400 hover:text-amber-500 flex items-center gap-1.5 transition-colors group-hover:translate-x-0.5"
              >
                <span>{card.actionText}</span>
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactInfoCards;
