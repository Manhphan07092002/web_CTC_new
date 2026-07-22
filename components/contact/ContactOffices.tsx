import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Navigation, CheckCircle2 } from 'lucide-react';

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
    region: 'Miền Trung',
    address: '50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng',
    phone: '0236 374 5555 - 0915 059 666',
    email: 'info@ctcdn.vn',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.847325759783!2d108.22992137591056!3d16.073407984606735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421823e98d9d19%3A0x51162c0c8358b9c4!2zMjU5IFRo4bq_IEzhu68sIEFuIEjhuqNpIELhuq9jLCBTxqFuIFRyw6AsIMSQw6AgTuG6tW5nIDU1MDAwMCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1716345678901!5m2!1sen!2s',
    isHeadquarter: true
  },
  {
    id: 'hanoi',
    name: 'Chi Nhánh Hà Nội',
    region: 'Miền Bắc',
    address: 'Tầng 6, Tòa nhà PVI, Số 1 Phạm Văn Bạch, Quận Cầu Giấy, TP Hà Nội',
    phone: '024 3838 9999 - 0905 123 456',
    email: 'hanoi@ctcdn.vn',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.321856754023!2d105.78765437588147!3d21.019808980628867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab52fa315bfb%3A0x550d510255b7aa2a!2zVMOyYSBuaMOgIFBWSSwgMSBQaOG6oW0gVsSDbiBC4bqhY2gsIFnDqm4gSG_DoCwgQ-G6p3UgR2nhuqV5LCBIw6AgTuG7mWksIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1716345678902!5m2!1sen!2s'
  },
  {
    id: 'hcm',
    name: 'Chi Nhánh TP. Hồ Chí Minh',
    region: 'Miền Nam',
    address: 'Tầng 12, Tòa nhà Viettel Complex, 285 Cách Mạng Tháng 8, Phường 12, Quận 10, TP.HCM',
    phone: '028 3939 8888 - 0915 059 666',
    email: 'hcm@ctcdn.vn',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.467389182394!2d106.67568537583687!3d10.775475989373264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f260be55555%3A0x8e833441a156291a!2zVmlldHRlbCBDb21wbGV4IEJ1aWxkaW5nLCAyODUgQ8OhY2ggTeG6oW5nIFRow6FuZyA4LCBQaMaw4budbmcgMTIsIFF14bqtbiAxMCwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1716345678903!5m2!1sen!2s'
  }
];

interface ContactOfficesProps {
  onOfficeSelect?: (office: OfficeBranch) => void;
}

const ContactOffices: React.FC<ContactOfficesProps> = () => {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('danang');
  const activeOffice = OFFICES.find(o => o.id === selectedOfficeId) || OFFICES[0];

  return (
    <div className="mb-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-corporate dark:text-white tracking-tight mb-3">
          Mạng Lưới Văn Phòng & Chi Nhánh CTC
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          CTC hiện có mặt tại cả 3 Miền Bắc - Trung - Nam với đội ngũ kỹ sư sẵn sàng hỗ trợ tư vấn và khảo sát tận nơi.
        </p>
      </div>

      {/* Office Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {OFFICES.map((office) => {
          const isSelected = office.id === selectedOfficeId;
          return (
            <button
              key={office.id}
              onClick={() => setSelectedOfficeId(office.id)}
              className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-corporate text-white border-corporate shadow-xl scale-[1.02]'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-700 hover:border-primary hover:shadow-md'
              }`}
            >
              {office.isHeadquarter && (
                <span className={`absolute top-4 right-4 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isSelected ? 'bg-yellow-400 text-gray-900' : 'bg-primary/10 text-primary'
                }`}>
                  Trụ sở chính
                </span>
              )}

              <div>
                <span className={`text-xs font-bold block mb-1 uppercase tracking-wider ${
                  isSelected ? 'text-yellow-300' : 'text-primary'
                }`}>
                  {office.region}
                </span>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Building2 size={20} /> {office.name}
                </h3>
                <p className={`text-xs line-clamp-2 mb-4 leading-relaxed ${
                  isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {office.address}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 dark:border-gray-700 flex items-center justify-between text-xs font-semibold">
                <span>{office.phone.split('-')[0]}</span>
                <span className="flex items-center gap-1">
                  Xem bản đồ <Navigation size={12} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Office Map & Details View */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Office Info */}
        <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-6">
          <div>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-extrabold rounded-full uppercase tracking-wider">
              {activeOffice.region} • {activeOffice.isHeadquarter ? 'Trụ Sở Chính' : 'Văn Phòng Chi Nhánh'}
            </span>

            <h3 className="text-2xl font-extrabold text-corporate dark:text-white mt-3 mb-4">
              {activeOffice.name}
            </h3>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <span>{activeOffice.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-primary flex-shrink-0" />
                <span className="font-bold text-gray-900 dark:text-white">{activeOffice.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-primary flex-shrink-0" />
                <span>{activeOffice.email}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dịch Vụ Tại Chi Nhánh:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-green-500" /> Khảo sát tận nơi
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-green-500" /> Thiết kế bản vẽ EPC
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-green-500" /> Thi công lắp đặt
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-green-500" /> Bảo hành & O&M
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(activeOffice.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-4 py-3 bg-primary hover:bg-secondary text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Navigation size={16} /> Dẫn đường Google Maps tới văn phòng
            </a>
          </div>
        </div>

        {/* Right Embedded Google Map */}
        <div className="lg:col-span-7 h-80 lg:h-auto min-h-[350px] relative bg-gray-200 dark:bg-gray-700">
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
