import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Navigation, CheckCircle2, ExternalLink } from 'lucide-react';

export interface OfficeBranch {
  id: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  mapEmbedUrl: string;
  isHeadquarter?: boolean;
}

const OFFICES: OfficeBranch[] = [
  {
    id: 'danang',
    name: 'Trụ Sở Chính Đà Nẵng',
    region: 'MIỀN TRUNG',
    address: '50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP. Đà Nẵng, Việt Nam',
    phone: '0236 374 5555 - 0915 059 666',
    email: 'info@ctcdn.vn',
    mapEmbedUrl: 'https://maps.google.com/maps?q=50B%20Nguy%E1%BB%85n%20Du,%20Ph%C6%B0%E1%BB%9Dng%20Th%E1%BA%A1ch%20Thang,%20Qu%E1%BA%ADn%20H%E1%BA%A3i%20Ch%C3%A2u,%20%C4%90%C3%A0%20N%E1%BA%B9ng&t=&z=17&ie=UTF8&iwloc=&output=embed',
    isHeadquarter: true
  },
  {
    id: 'hanoi',
    name: 'Chi Nhánh Hà Nội',
    region: 'MIỀN BẮC',
    address: 'Tầng 6, Tòa nhà PVI, Số 1 Phạm Văn Bạch, Quận Cầu Giấy, TP. Hà Nội',
    phone: '024 3838 9999 - 0905 123 456',
    email: 'hanoi@ctcdn.vn',
    mapEmbedUrl: 'https://maps.google.com/maps?q=T%C3%B2a%20nh%C3%A0%20PVI,%20S%E1%BB%91%201%20Ph%E1%BA%A1m%20V%C4%83n%20B%E1%BA%A1ch,%20C%E1%BA%A7u%20Gi%E1%BA%A5y,%20H%C3%A0%20N%E1%BB%99i&t=&z=16&ie=UTF8&iwloc=&output=embed'
  },
  {
    id: 'hcm',
    name: 'Chi Nhánh TP. Hồ Chí Minh',
    region: 'MIỀN NAM',
    address: 'Tầng 12, Tòa nhà Viettel Complex, 285 Cách Mạng Tháng 8, Phường 12, Quận 10, TP.HCM',
    phone: '028 3939 8888 - 0915 059 666',
    email: 'hcm@ctcdn.vn',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Viettel%20Complex,%20285%20C%C3%A1ch%20M%E1%BA%A1ng%20Th%C3%A1ng%208,%20Qu%E1%BA%ADn%2010,%20TP.HCM&t=&z=16&ie=UTF8&iwloc=&output=embed'
  }
];

const ContactOffices: React.FC = () => {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('danang');
  const activeOffice = OFFICES.find(o => o.id === selectedOfficeId) || OFFICES[0];

  return (
    <div className="mb-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black rounded-full uppercase tracking-widest border border-amber-500/20">
          MẠNG LƯỚI TOÀN QUỐC
        </span>
        <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mt-3 mb-3">
          Văn Phòng & Chi Nhánh CTC
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
          CTC sở hữu văn phòng đại diện tại cả 3 miền Bắc - Trung - Nam, sẵn sàng phục vụ tư vấn & hỗ trợ kỹ thuật trực tiếp.
        </p>
      </div>

      {/* Office Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {OFFICES.map((office) => {
          const isSelected = office.id === selectedOfficeId;
          return (
            <button
              key={office.id}
              onClick={() => setSelectedOfficeId(office.id)}
              className={`p-6 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-corporate to-[#0c1f3d] text-white border-corporate shadow-xl scale-[1.02]'
                  : 'bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-gray-700/70 hover:border-amber-400 hover:shadow-lg'
              }`}
            >
              {office.isHeadquarter && (
                <span className={`absolute top-4 right-4 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isSelected ? 'bg-amber-400 text-gray-950 shadow-md' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  Trụ sở chính
                </span>
              )}

              <div>
                <span className={`text-xs font-black block mb-2 uppercase tracking-widest ${
                  isSelected ? 'text-amber-400' : 'text-amber-500'
                }`}>
                  {office.region}
                </span>
                
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Building2 size={20} className={isSelected ? 'text-amber-400' : 'text-corporate'} />
                  {office.name}
                </h3>

                <p className={`text-xs line-clamp-2 mb-4 leading-relaxed ${
                  isSelected ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {office.address}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 dark:border-gray-700 flex items-center justify-between text-xs font-bold">
                <span>{office.phone.split('-')[0]}</span>
                <span className="flex items-center gap-1 text-amber-400">
                  Xem vị trí <Navigation size={12} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Office Map & Details View */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Office Info */}
        <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-black rounded-full uppercase tracking-wider border border-amber-500/20">
                {activeOffice.region} • {activeOffice.isHeadquarter ? 'TRỤ SỞ CHÍNH' : 'CHI NHÁNH VĂN PHÒNG'}
              </span>
            </div>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-5">
              {activeOffice.name}
            </h3>

            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{activeOffice.address}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={20} className="text-amber-500 flex-shrink-0" />
                <a href={`tel:${activeOffice.phone.split('-')[0].replace(/\s+/g, '')}`} className="font-bold text-gray-900 dark:text-white hover:text-amber-500 transition-colors">
                  {activeOffice.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={20} className="text-amber-500 flex-shrink-0" />
                <a href={`mailto:${activeOffice.email}`} className="font-semibold text-gray-800 dark:text-gray-200 hover:text-amber-500 transition-colors">
                  {activeOffice.email}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Khảo sát 24h
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Bản vẽ thiết kế EPC
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Đấu nối EVN
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Bảo hành 25 năm
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(activeOffice.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-corporate hover:bg-black text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Navigation size={16} className="text-amber-400" /> Dẫn đường Google Maps tới vị trí
            </a>
          </div>
        </div>

        {/* Right Embedded Google Map */}
        <div className="lg:col-span-7 h-96 lg:h-auto min-h-[380px] relative bg-gray-200 dark:bg-gray-900">
          <iframe
            src={activeOffice.mapEmbedUrl}
            className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Bản đồ ${activeOffice.name}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactOffices;
