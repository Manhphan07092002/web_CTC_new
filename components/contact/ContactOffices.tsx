import React from 'react';
import { MapPin, Phone, Mail, Navigation, ShieldCheck, UserCheck, Clock } from 'lucide-react';
import companyProfile from '../../constants/company_profile.json';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';

const ContactOffices: React.FC = () => {
  const { language } = useLanguage();

  const headquarterMapEmbedUrl = 'https://maps.google.com/maps?q=50B%20Nguy%E1%BB%85n%20Du,%20H%E1%BA%A3i%20Ch%C3%A2u,%20%C4%90%C3%A0%20N%E1%BA%B9ng&t=&z=17&ie=UTF8&iwloc=&output=embed';
  const fullAddress = companyProfile.contact.address;

  return (
    <div className="mb-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="px-3.5 py-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-300 text-xs font-black rounded-full uppercase tracking-widest border border-amber-500/30 backdrop-blur-md">
          {getLangText(language, { vi: 'ĐỊA CHỈ TRỤ SỞ CHÍNH', en: 'HEADQUARTERS ADDRESS', ko: '본사 주소', ja: '本社所在地', zh: '总部地址', de: 'HAUPTSITZ ADRESSE' })}
        </span>
        <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mt-3 mb-3">
          {getLangText(language, { vi: 'Văn Phòng Trụ Sở CTC', en: 'CTC Headquarters Office', ko: 'CTC 본사 사무소', ja: 'CTC本社オフィス', zh: 'CTC总部办公室', de: 'CTC Hauptsitz Büro' })}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
          {getLangText(language, {
            vi: 'Kính mời quý khách hàng và đối tác đến thăm trực tiếp trụ sở công ty để trao đổi dự án & xem mẫu thiết bị.',
            en: 'We welcome clients and partners to visit our headquarters for project discussions and equipment samples.',
            ko: '프로젝트 논의 및 장비 샘플 확인을 위해 본사를 방문해 주시기 바랍니다.',
            ja: 'プロジェクトの打ち合わせや機器サンプルの見学のため、本社へのご来社を心よりお待ちしております。',
            zh: '诚挚欢迎客户与合作伙伴亲临总部洽谈项目并察看设备样品。',
            de: 'Wir heißen Kunden und Partner herzlich willkommen, unseren Hauptsitz zu besuchen.'
          })}
        </p>
      </div>

      {/* Single Headquarters Box with Embedded Map (Glassmorphism Container) */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] border border-white/80 dark:border-gray-700/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Headquarters Info */}
        <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-amber-500 text-gray-950 text-[11px] font-black rounded-full uppercase tracking-wider shadow-md">
                {getLangText(language, { vi: 'TRỤ SỞ CHÍNH DUY NHẤT', en: 'SOLE HEADQUARTERS', ko: '단독 본사', ja: '唯一の本社', zh: '唯一总部', de: 'EINZIGER HAUPTSITZ' })}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
              {getLangText(language, {
                vi: companyProfile.company_name.vi,
                en: companyProfile.company_name.en,
                ko: '중부 우정 통신 건설 주식회사',
                ja: '中部ベトナム郵政通信建設株式會社',
                zh: '中部越南邮电建筑股份有限公司',
                de: 'Zentralvietnam Post- und Telekommunikationsbau AG'
              })}
            </h3>
            
            <div className="space-y-1.5 mb-6 text-xs text-amber-600 dark:text-amber-400 font-bold">
              <p className="flex items-center gap-1.5">
                <ShieldCheck size={16} /> {getLangText(language, { vi: 'Mã số thuế:', en: 'Tax ID:', ko: '사업자 번호:', ja: '税務番号:', zh: '税号:', de: 'Steuer-ID:' })} {companyProfile.tax_code}
              </p>
              <p className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <UserCheck size={16} className="text-amber-500" /> {getLangText(language, { vi: 'Đại diện PL:', en: 'Representative:', ko: '법정 대리인:', ja: '法的代表者:', zh: '法定代表人:', de: 'Gesetzlicher Vertreter:' })} {companyProfile.representative} ({getLangText(language, { vi: 'Tổng Giám Đốc', en: 'General Director', ko: '대표이사', ja: '取締役社長', zh: '总经理', de: 'Generaldirektor' })})
              </p>
            </div>

            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{fullAddress}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={20} className="text-amber-500 flex-shrink-0" />
                <a href={`tel:${companyProfile.contact.hotline}`} className="font-bold text-gray-900 dark:text-white hover:text-amber-500 transition-colors">
                  {companyProfile.contact.phone} - Hotline: {companyProfile.contact.hotline}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={20} className="text-amber-500 flex-shrink-0" />
                <a href="mailto:info@ctcdn.vn" className="font-bold text-gray-900 dark:text-white hover:text-amber-500 transition-colors">
                  info@ctcdn.vn
                </a>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Clock size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-gray-900 dark:text-white">{getLangText(language, { vi: 'Thời gian làm việc:', en: 'Working Hours:', ko: '근무 시간:', ja: '営業時間:', zh: '工作时间:', de: 'Arbeitszeiten:' })}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getLangText(language, {
                      vi: 'Thứ 2 - Thứ 7: 07:30 - 17:00 (Chủ nhật trực Hotline)',
                      en: 'Mon - Sat: 07:30 - 17:00 (Sun: 24/7 Hotline)',
                      ko: '월 - 토: 07:30 - 17:00 (일요일 핫라인 대기)',
                      ja: '月〜土: 07:30 - 17:00 (日曜日: ホットライン対応)',
                      zh: '周一至周六: 07:30 - 17:00 (周日热线值班)',
                      de: 'Mo - Sa: 07:30 - 17:00 (So: Hotline)'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <a
            href="https://maps.google.com/?q=50B+Nguyen+Du+Hai+Chau+Da+Nang"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/20"
          >
            <Navigation size={18} /> {getLangText(language, { vi: 'Chỉ Đường Trên Google Maps', en: 'Get Directions on Google Maps', ko: 'Google 지도에서 길찾기', ja: 'Google マップでルート案内', zh: '在Google地图上获取路线', de: 'Wegbeschreibung auf Google Maps' })}
          </a>
        </div>

        {/* Right Embedded Interactive Map */}
        <div className="lg:col-span-7 h-[350px] lg:h-auto min-h-[350px] relative border-t lg:border-t-0 lg:border-l border-gray-200/50 dark:border-gray-700/50">
          <iframe
            title="CTC Headquarters Map"
            src={headquarterMapEmbedUrl}
            className="w-full h-full border-0 filter grayscale-[20%] contrast-[105%] hover:grayscale-0 transition-all duration-500"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactOffices;
