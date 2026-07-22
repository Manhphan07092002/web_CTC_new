import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Copy, Check, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
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
      badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: Phone,
      gradientBg: 'from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/30',
      glowColor: 'bg-amber-500/20',
      title: 'Đường Dây Nóng Tư Vấn',
      primaryText: '0915 059 666',
      secondaryText: 'Cố định: 0236 374 5555',
      actionText: 'Gọi ngay',
      actionUrl: 'tel:0915059666',
      copyText: '0915059666'
    },
    {
      badge: 'EMAIL CHÍNH THỨC',
      badgeStyle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      icon: Mail,
      gradientBg: 'from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/30',
      glowColor: 'bg-blue-500/20',
      title: 'Hỗ Trợ & Báo Giá',
      primaryText: 'info@ctcdn.vn',
      secondaryText: 'Dự án: vandat@ctcdn.vn',
      actionText: 'Gửi Email',
      actionUrl: 'mailto:info@ctcdn.vn',
      copyText: 'info@ctcdn.vn'
    },
    {
      badge: 'TRỤ SỞ CHÍNH',
      badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: MapPin,
      gradientBg: 'from-emerald-500 via-teal-600 to-emerald-700 shadow-emerald-500/30',
      glowColor: 'bg-emerald-500/20',
      title: 'Trụ Sở Đà Nẵng',
      primaryText: '50B Nguyễn Du',
      secondaryText: 'Hải Châu, Đà Nẵng',
      actionText: 'Xem bản đồ',
      actionUrl: 'https://maps.google.com/?q=50B+Nguyen+Du+Hai+Chau+Da+Nang',
      copyText: '50B Nguyễn Du, Hải Châu, Đà Nẵng'
    },
    {
      badge: 'LỊCH LÀM VIỆC',
      badgeStyle: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      icon: Clock,
      gradientBg: 'from-purple-600 via-indigo-700 to-purple-800 shadow-purple-500/30',
      glowColor: 'bg-purple-500/20',
      title: 'Thời Gian Hoạt Động',
      primaryText: 'Thứ 2 - Thứ 6: 08:00 - 17:30',
      secondaryText: 'T7 & CN: Trực Hotline 24/7',
      actionText: 'Đặt lịch hẹn',
      actionUrl: '#form-sec',
      copyText: 'Thứ 2 - Thứ 6: 08:00 - 17:30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-10 relative z-20 mb-16">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        const isCopied = copiedIndex === idx;

        return (
          <div
            key={`ultra-contact-card-${idx}`}
            className="group relative rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl border border-white/80 dark:border-gray-700/80 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.15)] hover:border-amber-400/60"
          >
            {/* Top Light Ambient Glow Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.glowColor} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700`} />

            <div>
              {/* Header Badge & Copy Button */}
              <div className="flex items-center justify-between mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md ${card.badgeStyle}`}>
                  {card.badge}
                </span>

                <button
                  onClick={() => handleCopy(card.copyText, idx)}
                  className="p-2 rounded-xl bg-gray-100/80 dark:bg-gray-700/60 text-gray-500 dark:text-gray-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-gray-700 transition-all text-xs font-bold border border-gray-200/50 dark:border-gray-600/50 flex items-center gap-1"
                  title="Sao chép thông tin"
                >
                  {isCopied ? (
                    <span className="text-emerald-500 font-extrabold text-[11px] flex items-center gap-1">
                      <Check size={14} /> Đã chép
                    </span>
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
              </div>

              {/* Main Content Area: Floating 3D Icon & Text */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradientBg} text-white flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <IconComponent size={26} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-base leading-tight">
                    {card.title}
                  </h4>
                  <p className="text-sm font-black text-corporate dark:text-amber-400 mt-1 line-clamp-1">
                    {card.primaryText}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium pl-1">
                {card.secondaryText}
              </p>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <a
                href={card.actionUrl}
                target={card.actionUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-corporate hover:text-white dark:hover:bg-amber-400 dark:hover:text-gray-950 text-gray-800 dark:text-gray-200 text-xs font-extrabold flex items-center justify-between transition-all duration-300 group/btn border border-gray-200/60 dark:border-gray-600/60"
              >
                <span>{card.actionText}</span>
                <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default ContactInfoCards;
