import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Copy, Check, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

const ContactInfoCards: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast(getLangText(language, { vi: 'Đã sao chép: ', en: 'Copied: ', ko: '복사됨: ', ja: 'コピー完了: ', zh: '已复制: ', de: 'Kopiert: ' }) + text, 'info');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const cards = [
    {
      badge: 'HOTLINE 24/7',
      badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: Phone,
      gradientBg: 'from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/30',
      glowColor: 'bg-amber-500/20',
      title: getLangText(language, { vi: 'Hotline kinh doanh & dự án', en: 'Sales & Project Hotline', ko: '영업 및 프로젝트 핫라인', ja: '営業・プロジェクト窓口', zh: '销售与项目热线', de: 'Vertriebs- & Projekt-Hotline' }),
      primaryText: '0915 059 666',
      secondaryText: getLangText(language, { vi: 'Tổng đài Đà Nẵng: 0236 3745 555', en: 'Da Nang Switchboard: 0236 3745 555', ko: '다낭 교환원: 0236 3745 555', ja: 'ダナン代表: 0236 3745 555', zh: '岘港总机: 0236 3745 555', de: 'Da Nang Zentrale: 0236 3745 555' }),
      actionText: getLangText(language, { vi: 'Gọi ngay', en: 'Call Now', ko: '지금 전화하기', ja: '今すぐ電話', zh: '立即致电', de: 'Jetzt anrufen' }),
      actionUrl: 'tel:0915059666',
      copyText: '0915059666'
    },
    {
      badge: getLangText(language, { vi: 'EMAIL CHÍNH THỨC', en: 'OFFICIAL EMAIL', ko: '공식 이메일', ja: '公式メール', zh: '官方邮箱', de: 'OFFIZIELLE E-MAIL' }),
      badgeStyle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      icon: Mail,
      gradientBg: 'from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/30',
      glowColor: 'bg-blue-500/20',
      title: getLangText(language, { vi: 'Hỗ Trợ & Báo Giá', en: 'Support & Inquiries', ko: '지원 및 견적 문의', ja: 'サポート・見積もり', zh: '支持与报价咨询', de: 'Support & Anfragen' }),
      primaryText: 'info@ctcdn.vn',
      secondaryText: getLangText(language, { vi: 'Dự án: vandat@ctcdn.vn', en: 'Projects: vandat@ctcdn.vn', ko: '프로젝트: vandat@ctcdn.vn', ja: 'プロジェクト: vandat@ctcdn.vn', zh: '项目: vandat@ctcdn.vn', de: 'Projekte: vandat@ctcdn.vn' }),
      actionText: getLangText(language, { vi: 'Gửi Email', en: 'Send Email', ko: '이메일 보내기', ja: 'メールを送信', zh: '发送邮件', de: 'E-Mail senden' }),
      actionUrl: 'mailto:info@ctcdn.vn',
      copyText: 'info@ctcdn.vn'
    },
    {
      badge: getLangText(language, { vi: 'TRỤ SỞ CHÍNH', en: 'HEADQUARTERS', ko: '본사', ja: '本社', zh: '总部', de: 'HAUPTSITZ' }),
      badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: MapPin,
      gradientBg: 'from-emerald-500 via-teal-600 to-emerald-700 shadow-emerald-500/30',
      glowColor: 'bg-emerald-500/20',
      title: getLangText(language, { vi: 'Trụ Sở Đà Nẵng', en: 'Da Nang HQ', ko: '다낭 본사', ja: 'ダナン本社', zh: '岘港总部', de: 'Da Nang Hauptsitz' }),
      primaryText: '50B Nguyễn Du',
      secondaryText: 'Hải Châu, Đà Nẵng',
      actionText: getLangText(language, { vi: 'Xem bản đồ', en: 'View Map', ko: '지도 보기', ja: '地図を見る', zh: '查看地图', de: 'Karte anzeigen' }),
      actionUrl: 'https://maps.google.com/?q=50B+Nguyen+Du+Hai+Chau+Da+Nang',
      copyText: '50B Nguyễn Du, Hải Châu, Đà Nẵng'
    },
    {
      badge: getLangText(language, { vi: 'LỊCH LÀM VIỆC', en: 'WORKING HOURS', ko: '근무 시간', ja: '営業時間', zh: '工作时间', de: 'ARBEITSZEITEN' }),
      badgeStyle: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      icon: Clock,
      gradientBg: 'from-purple-600 via-indigo-700 to-purple-800 shadow-purple-500/30',
      glowColor: 'bg-purple-500/20',
      title: getLangText(language, { vi: 'Thời Gian Làm Việc', en: 'Office Schedule', ko: '근무 시간', ja: '営業時間', zh: '工作时间', de: 'Bürozeiten' }),
      primaryText: getLangText(language, { vi: 'Thứ 2 - Thứ 7: 07:30 - 17:00', en: 'Mon - Sat: 07:30 - 17:00', ko: '월 - 토: 07:30 - 17:00', ja: '月 - 土: 07:30 - 17:00', zh: '周一至周六: 07:30 - 17:00', de: 'Mo - Sa: 07:30 - 17:00' }),
      secondaryText: getLangText(language, { vi: 'Chủ nhật: Trực Hotline 24/7', en: 'Sunday: Hotline 24/7', ko: '일요일: 24/7 핫라인 대기', ja: '日曜日: 24/7ホットライン対応', zh: '周日: 24/7热线值班', de: 'Sonntag: 24/7 Hotline-Bereitschaft' }),
      actionText: getLangText(language, { vi: 'Chat Zalo', en: 'Zalo Chat', ko: 'Zalo 채팅', ja: 'Zaloチャット', zh: 'Zalo在线咨询', de: 'Zalo Chat' }),
      actionUrl: 'https://zalo.me/0915059666',
      copyText: '0915059666'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        const isCopied = copiedIndex === idx;

        return (
          <div
            key={idx}
            className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 dark:border-gray-700/80 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Glow blob behind card icon */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${card.glowColor} blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-5">
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider border ${card.badgeStyle}`}>
                  {card.badge}
                </span>
                <button
                  onClick={() => handleCopy(card.copyText, idx)}
                  className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                  title={getLangText(language, { vi: 'Sao chép', en: 'Copy', ko: '복사', ja: 'コピー', zh: '复制', de: 'Kopieren' })}
                >
                  {isCopied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                </button>
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradientBg} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {card.title}
                  </h3>
                  <p className="font-black text-lg text-gray-900 dark:text-white leading-tight">
                    {card.primaryText}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                {card.secondaryText}
              </p>
            </div>

            {/* Action Link Button */}
            <a
              href={card.actionUrl}
              target={card.actionUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-700/80 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 text-gray-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-between group/btn shadow-sm"
            >
              <span>{card.actionText}</span>
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default ContactInfoCards;
