import React from 'react';
import { Radio, Server, Zap, CheckCircle, MapPin, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const FloatingContent: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language !== 'vi';
  const isKo = language === 'ko';
  const isJa = language === 'ja';

  return (
    <div className="bg-white dark:bg-[#060d1d] transition-colors">
      <div className="container mx-auto px-6 py-16">

        {/* Intro */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Radio size={14} /> {isEn ? 'Telecom & Digital Infra' : 'Viễn thông & Hạ tầng số'}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
              {isEn ? 'Telecom Infrastructure &' : 'Hạ Tầng Viễn Thông &'}<br />
              <span className="text-sky-500">{isEn ? 'Data Center – IT' : 'Data Center – CNTT'}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 text-justify">
              {isEn ? (
                'Originating from telecommunications infrastructure construction, CTC holds 32+ years of expertise in telecom networks. From fiber optics, BTS stations, Metro Networks to Tier III Data Centers and specialized IT systems for government agencies and corporate enterprises.'
              ) : (
                'Là doanh nghiệp xuất phát từ nền tảng xây dựng hạ tầng bưu điện (Bưu điện Miền Trung), CTC sở hữu kinh nghiệm 32+ năm trong lĩnh vực viễn thông. Từ mạng cáp quang, trạm BTS, Metro Network đến Data Center và hệ thống CNTT chuyên dụng cho cơ quan nhà nước, doanh nghiệp.'
              )}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '32+', label: isEn ? 'Years Telecom Experience' : 'Năm kinh nghiệm viễn thông' },
                { val: '100+', label: isEn ? 'Telecom Projects' : 'Công trình viễn thông' },
                { val: 'Tier III', label: isEn ? 'Data Center Standard' : 'Chuẩn Data Center' },
                { val: '24/7', label: isEn ? 'O&M Operations' : 'O&M – Vận hành & Bảo trì' },
              ].map((s, i) => (
                <div key={i} className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-sky-500">{s.val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop"
              alt="Telecom & Data Center CTC"
              className="rounded-3xl shadow-2xl w-full h-80 object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-sky-100 dark:border-sky-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-xl flex items-center justify-center text-sky-500">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{isEn ? 'Strategic Partners' : 'Đối tác chiến lược'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Mobifone, VNPT Net, Bộ Công an</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lĩnh vực */}
        <div className="mb-20">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 text-center">
            {isEn ? 'Telecom & IT Capabilities' : 'Lĩnh Vực Viễn Thông & CNTT'}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Radio size={22} />,
                title: isEn ? 'Optical Fiber Networks (OSP)' : 'Mạng Cáp Quang (OSP)',
                desc: isEn ? 'Design and construction of aerial and underground Outside Plant (OSP) fiber lines, directly connecting operators nationwide.' : 'Thiết kế và thi công tuyến cáp quang ngoại vi (Outside Plant) trên không và ngầm, kết nối trực tiếp hoặc theo hợp đồng dài hạn với các nhà mạng.',
                color: 'sky',
              },
              {
                icon: <Zap size={22} />,
                title: isEn ? 'BTS & Wireless Stations' : 'Trạm BTS & Vô tuyến',
                desc: isEn ? 'Construction, installation, and maintenance of 4G/5G BTS/NodeB/gNodeB stations, antenna towers, shelters, and backup power.' : 'Xây dựng, lắp đặt và bảo trì trạm phát sóng BTS/NodeB/gNodeB 4G/5G. Hạ tầng cột ăng-ten, nhà trạm, nguồn điện dự phòng.',
                color: 'blue',
              },
              {
                icon: <Server size={22} />,
                title: isEn ? 'Data Center & IT Systems' : 'Data Center & Hệ thống IT',
                desc: isEn ? 'Design, construction, and operation of Tier III Data Centers, precision cooling, UPS power, and physical security.' : 'Thiết kế, xây dựng và vận hành Trung tâm Dữ liệu chuẩn Tier III. Hệ thống làm mát precision cooling, nguồn UPS và bảo mật vật lý.',
                color: 'violet',
              },
              {
                icon: <Radio size={22} />,
                title: isEn ? 'Metro Network & Transmission' : 'Metro Network & Transmission',
                desc: isEn ? 'Metropolitan transmission network construction for mobile operators using high-speed optical and microwave systems.' : 'Xây dựng mạng truyền dẫn đô thị (Metro Network) cho nhà mạng di động. Hệ thống truyền dẫn tốc độ cao quang học và vô tuyến.',
                color: 'cyan',
              },
              {
                icon: <Zap size={22} />,
                title: isEn ? 'Government IT Infrastructure' : 'Hạ tầng CNTT cơ quan nhà nước',
                desc: isEn ? 'Internal LAN/WAN, security cameras, IP PBX, and integrated IT infrastructure for government and defense agencies.' : 'Hệ thống mạng nội bộ, camera an ninh, tổng đài, và hệ thống CNTT tích hợp cho các cơ quan nhà nước và đơn vị quốc phòng.',
                color: 'indigo',
              },
              {
                icon: <Server size={22} />,
                title: isEn ? 'Auxiliary Systems & Power' : 'Nguồn điện & Hệ thống phụ trợ',
                desc: isEn ? 'UPS backup power, Diesel generators, lightning grounding, precision cooling, and 24/7 infrastructure monitoring.' : 'Hệ thống nguồn điện dự phòng UPS, máy phát Diesel, tiếp địa chống sét, điều hòa chính xác và monitoring 24/7 cho hạ tầng viễn thông.',
                color: 'slate',
              },
            ].map((m, i) => (
              <div key={i} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                <div className={`w-11 h-11 bg-${m.color}-100 dark:bg-${m.color}-900/30 text-${m.color}-600 dark:text-${m.color}-400 rounded-xl flex items-center justify-center mb-4`}>
                  {m.icon}
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">{m.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Khách hàng & Dự án tiêu biểu */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-corporate to-sky-800 text-white rounded-3xl p-8">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
              <Award size={24} className="text-sky-300" /> {isEn ? 'Strategic Clients' : 'Khách Hàng Chiến Lược'}
            </h3>
            <div className="space-y-4">
              {[
                { name: isEn ? 'Ministry of Public Security' : 'Bộ Công an (Cục KTNVI)', desc: isEn ? 'Dedicated fiber optic lines and secure IT systems' : 'Tuyến cáp quang chuyên dụng và hệ thống CNTT an ninh' },
                { name: 'Mobifone', desc: isEn ? 'Metro Network and BTS infrastructure in Central Vietnam' : 'Metro Network và hạ tầng trạm BTS tại miền Trung' },
                { name: 'VNPT Net', desc: isEn ? 'OSP infrastructure and national transmission lines' : 'Hạ tầng OSP và mạng truyền dẫn ngoại vi toàn quốc' },
                { name: isEn ? 'Government Agencies' : 'Cơ quan nhà nước', desc: isEn ? 'Integrated IT, security cameras, and network infrastructure' : 'Hệ thống CNTT, camera an ninh và hạ tầng mạng tích hợp' },
              ].map((c, i) => (
                <div key={i} className="border-l-2 border-sky-400 pl-4">
                  <div className="font-bold text-sm text-sky-300 mb-1">{c.name}</div>
                  <div className="text-sm text-gray-300 leading-relaxed">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <TrendingUp className="text-sky-500" size={24} /> {isEn ? 'Featured Projects' : 'Dự Án Tiêu Biểu'}
            </h3>
            <div className="space-y-4">
              {[
                {
                  name: isEn ? 'Ministry of Public Security Fiber Line' : 'Tuyến cáp quang Bộ Công an',
                  location: isEn ? 'Nationwide' : 'Toàn quốc',
                  scope: isEn ? 'Construction of dedicated fiber optic lines serving security and defense communications.' : 'Xây dựng tuyến cáp quang chuyên dụng phục vụ hệ thống thông tin an ninh, quốc phòng.',
                },
                {
                  name: isEn ? 'Mobifone Metro Network – Da Nang' : 'Metro Mobifone – Đà Nẵng',
                  location: 'Đà Nẵng',
                  scope: isEn ? 'Construction of urban transmission network for Mobifone mobile network in Da Nang City.' : 'Thi công mạng truyền dẫn đô thị cho mạng di động Mobifone tại TP Đà Nẵng.',
                },
                {
                  name: isEn ? 'VNPT Net OSP Infrastructure' : 'Hạ tầng OSP VNPT Net',
                  location: isEn ? 'Central Vietnam' : 'Miền Trung',
                  scope: isEn ? 'Construction, installation, and maintenance of outside plant fiber optic networks.' : 'Xây dựng, lắp đặt và bảo trì mạng cáp quang ngoại vi khu vực miền Trung.',
                },
              ].map((p, i) => (
                <div key={i} className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-sky-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                      <div className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-medium my-1">
                        <MapPin size={11} /> {p.location}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{p.scope}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50 rounded-3xl p-10">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
            {isEn ? 'Telecom & IT Infrastructure Consultation' : 'Tư Vấn Hạ Tầng Viễn Thông & CNTT'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {isEn ? 'CTC telecom and IT engineers are ready to assist in designing and deploying customized solutions.' : 'Đội ngũ kỹ sư viễn thông và CNTT của CTC sẵn sàng hỗ trợ thiết kế và triển khai hệ thống theo yêu cầu.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg">
              <Zap size={18} /> {isEn ? 'Contact for Advice' : 'Liên hệ tư vấn'}
            </Link>
            <a href="tel:02363745555" className="inline-flex items-center gap-2 border-2 border-sky-400 text-sky-600 dark:text-sky-400 px-8 py-3.5 rounded-2xl font-bold hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all">
              0236 374 5555
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingContent;
