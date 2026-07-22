import React from 'react';
import { Building2, MapPin, Phone, Mail, Navigation, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

const ContactOffices: React.FC = () => {
  const headquarterMapEmbedUrl = 'https://maps.google.com/maps?q=50B%20Nguy%E1%BB%85n%20Du,%20H%E1%BA%A3i%20Ch%C3%A2u,%20%C4%90%C3%A0%20N%E1%BA%B9ng&t=&z=17&ie=UTF8&iwloc=&output=embed';
  const fullAddress = '50B Nguyễn Du, Hải Châu, Đà Nẵng';

  return (
    <div className="mb-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black rounded-full uppercase tracking-widest border border-amber-500/20">
          ĐỊA CHỈ TRỤ SỞ CHÍNH
        </span>
        <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mt-3 mb-3">
          Văn Phòng Trụ Sở CTC
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
          Kính mời quý khách hàng và đối tác đến thăm trực tiếp trụ sở công ty để trao đổi dự án & xem mẫu thiết bị.
        </p>
      </div>

      {/* Single Headquarters Box with Embedded Map */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Headquarters Info */}
        <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-amber-500 text-gray-950 text-[11px] font-black rounded-full uppercase tracking-wider shadow-md">
                TRỤ SỞ CHÍNH DUY NHẤT
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
              CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG
            </h3>
            
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mb-6 flex items-center gap-1.5">
              <ShieldCheck size={16} /> Mã số thuế: 0400458940
            </p>

            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{fullAddress}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={20} className="text-amber-500 flex-shrink-0" />
                <a href="tel:0915059666" className="font-bold text-gray-900 dark:text-white hover:text-amber-500 transition-colors">
                  0236 374 5555 - Hotline: 0915 059 666
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={20} className="text-amber-500 flex-shrink-0" />
                <a href="mailto:info@ctcdn.vn" className="font-semibold text-gray-800 dark:text-gray-200 hover:text-amber-500 transition-colors">
                  info@ctcdn.vn - ctc.solar@ctcdn.vn
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={20} className="text-amber-500 flex-shrink-0" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Thứ 2 - Thứ 7: 08:00 - 17:30 (CN trực Hotline)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Khảo sát tận nơi
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Thiết kế EPC 3D
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Hồ sơ EVN & PCCC
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Bảo hành 25 năm
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-gradient-to-r from-corporate to-[#0b192c] hover:bg-black text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              <Navigation size={18} className="text-amber-400" /> Mở Dẫn Đường Google Maps Tới Trụ Sở
            </a>
          </div>
        </div>

        {/* Right Embedded Google Map */}
        <div className="lg:col-span-7 h-96 lg:h-auto min-h-[420px] relative bg-gray-200 dark:bg-gray-900">
          <iframe
            src={headquarterMapEmbedUrl}
            className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Bản đồ Trụ sở chính CTC Đà Nẵng"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactOffices;
