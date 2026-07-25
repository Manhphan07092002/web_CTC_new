import React from 'react';
import { Zap, Building, ShieldCheck, CheckCircle, MapPin, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const ElectricalContent: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language !== 'vi';

  return (
    <div className="bg-white dark:bg-[#060d1d] transition-colors">
      <div className="container mx-auto px-6 py-16">

        {/* ── Intro ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Zap size={14} /> {isEn ? 'Power Grid & Engineering' : 'Điện lực & Kỹ thuật'}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
              {isEn ? '110kV Lines & Substations' : 'Đường Dây & Trạm Biến Áp'} <br />
              <span className="text-yellow-500">{isEn ? 'National Grid Connection' : '110kV – Lưới điện quốc gia'}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 text-justify">
              {isEn ? (
                'CTC is capable of constructing transmission lines and transformer substations up to 110kV–220kV voltage levels, connecting directly to the national power grid. With Grade II Ministry of Construction certificate (2020), CTC acts as turnkey EPC contractor for solar, wind, and defense electrical projects.'
              ) : (
                'CTC có năng lực thi công đường dây truyền tải điện và trạm biến áp đến cấp điện áp 110kV–220kV, đấu nối trực tiếp lưới điện quốc gia. Với chứng chỉ năng lực Bộ Xây dựng hạng 2 (2020), CTC là đối tác tổng thầu EPC cho các dự án điện gió, điện mặt trời và công trình quốc phòng trọng điểm.'
              )}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '02', label: isEn ? 'Ministry Grade II Cert' : 'Chứng chỉ năng lực BXD' },
                { val: '110kV', label: isEn ? 'Connection Voltage' : 'Điện áp đấu nối' },
                { val: '500+', label: isEn ? 'Completed Projects' : 'Công trình hoàn thành' },
                { val: '24/7', label: isEn ? 'O&M Operations' : 'O&M vận hành & bảo trì' },
              ].map((s, i) => (
                <div key={i} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{s.val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=800&auto=format&fit=crop"
              alt="Trạm biến áp 110kV CTC"
              className="rounded-3xl shadow-2xl w-full h-80 object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-yellow-100 dark:border-yellow-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{isEn ? 'Capacity Certificate' : 'Chứng chỉ năng lực'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{isEn ? 'Ministry Grade II (2020)' : 'Bộ Xây dựng hạng 2 – 2020'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Dịch vụ ── */}
        <div className="mb-20">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 text-center">
            {isEn ? 'Power Engineering Capabilities' : 'Lĩnh Vực Thi Công Điện Lực'}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap size={22} />,
                title: isEn ? '110kV / 220kV Lines' : 'Đường dây 110kV / 220kV',
                desc: isEn ? 'Construction of medium and high-voltage transmission lines, including tower erection, wire stringing, and substation grid connection.' : 'Thi công đường dây truyền tải điện trung và cao thế, bao gồm dựng cột, kéo dây và đấu nối trạm biến áp vào lưới điện quốc gia.',
                color: 'yellow',
              },
              {
                icon: <Building size={22} />,
                title: isEn ? '110kV Substations' : 'Trạm biến áp 110kV',
                desc: isEn ? 'Indoor & outdoor 110kV substations. Installation of power transformers, busbar systems, disconnectors, and digital relay protection.' : 'Xây dựng trạm biến áp ngoài trời và trong nhà cấp 110kV. Lắp đặt máy biến áp, hệ thống thanh cái, dao cách ly và bảo vệ relay số.',
                color: 'amber',
              },
              {
                icon: <ShieldCheck size={22} />,
                title: isEn ? 'Grounding & Lightning Protection' : 'Tiếp địa & Chống sét',
                desc: isEn ? 'Safety grounding and direct lightning protection for substations, transmission lines, and power structures per IEC standards.' : 'Hệ thống tiếp địa an toàn và chống sét đánh thẳng cho trạm biến áp, đường dây và các công trình hạ tầng điện theo tiêu chuẩn IEC.',
                color: 'orange',
              },
              {
                icon: <Zap size={22} />,
                title: isEn ? 'UPS Backup Power' : 'Nguồn dự phòng UPS',
                desc: isEn ? 'Supply and installation of UPS, battery storage, and Diesel backup generators ensuring continuous operation for critical infrastructure.' : 'Cung cấp và lắp đặt hệ thống UPS, ắc quy lưu điện và máy phát điện dự phòng Diesel đảm bảo liên tục cho hạ tầng trọng yếu.',
                color: 'yellow',
              },
              {
                icon: <Building size={22} />,
                title: isEn ? 'Substation Control Buildings' : 'Nhà trạm & Hạ tầng phụ trợ',
                desc: isEn ? 'Control houses, security fencing, internal roads, and drainage systems for 110kV substations and power facilities.' : 'Xây dựng nhà điều hành, tường rào, đường nội bộ và hệ thống thoát nước cho trạm biến áp và công trình điện lực.',
                color: 'amber',
              },
              {
                icon: <ShieldCheck size={22} />,
                title: isEn ? 'O&M Maintenance' : 'O&M Vận hành & Bảo trì',
                desc: isEn ? 'Long-term operations and maintenance for power lines, substations, and renewable power systems under 24/7 or periodic O&M contracts.' : 'Dịch vụ vận hành và bảo trì dài hạn đường dây, trạm biến áp và hệ thống điện tái tạo theo hợp đồng O&M định kỳ hoặc 24/7.',
                color: 'orange',
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

        {/* ── Khách hàng & Dự án ── */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-yellow-700 to-amber-600 text-white rounded-3xl p-8">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
              <Award size={24} className="text-yellow-200" /> {isEn ? 'Clients & Partners' : 'Khách Hàng & Đối Tác'}
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Dongfang Electric', desc: isEn ? 'Subcontractor for electrical systems and foundations in Huong Linh 1 & 4 wind power projects' : 'Nhà thầu phụ thi công nền móng và hệ thống điện dự án điện gió Hướng Linh 1 & 4' },
                { name: 'EVN Central Power', desc: isEn ? '110kV power lines and substations connecting to national grid' : 'Thi công đường dây và trạm biến áp 110kV đấu nối lưới điện quốc gia' },
                { name: isEn ? 'Ministry of Defense (A70)' : 'Bộ Quốc phòng (Công trình A70)', desc: isEn ? 'Electrical power systems and technical infrastructure for defense facilities' : 'Hệ thống điện, hạ tầng kỹ thuật cho công trình quốc phòng trọng điểm' },
                { name: isEn ? 'Energy Developers' : 'Chủ đầu tư dự án năng lượng', desc: isEn ? '110kV connection lines for Solar Farms and Wind Farms in Central Vietnam' : 'Đường dây đấu nối 110kV cho các dự án Solar Farm và Wind Farm tại miền Trung' },
              ].map((c, i) => (
                <div key={i} className="border-l-2 border-yellow-300 pl-4">
                  <div className="font-bold text-sm text-yellow-200 mb-1">{c.name}</div>
                  <div className="text-sm text-yellow-100/80 leading-relaxed">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <TrendingUp className="text-yellow-500" size={24} /> {isEn ? 'Featured Projects' : 'Dự Án Tiêu Biểu'}
            </h3>
            <div className="space-y-4">
              {[
                {
                  name: isEn ? '110kV Substation – Huong Linh Wind Power' : 'Trạm biến áp 110kV – Điện gió Hướng Linh',
                  location: 'Quảng Trị',
                  scope: isEn ? '110kV substation construction and grid connection line for Huong Linh 1 & 4 wind farms.' : 'Thi công trạm biến áp 110kV và đường dây đấu nối lưới điện cho dự án điện gió Hướng Linh 1 & 4.',
                },
                {
                  name: isEn ? '110kV Power Line for Industrial Parks' : 'Đường dây 110kV KCN – Cụm công nghiệp',
                  location: isEn ? 'Central Vietnam' : 'Miền Trung',
                  scope: isEn ? 'Construction of 110kV lines supplying power to industrial zones and manufacturing clusters.' : 'Xây dựng đường dây 110kV cấp nguồn cho khu công nghiệp và cụm doanh nghiệp sản xuất.',
                },
                {
                  name: isEn ? 'A70 Defense Electrical Systems' : 'Hệ thống điện Công trình Quốc phòng A70',
                  location: isEn ? 'Nationwide' : 'Toàn quốc',
                  scope: isEn ? 'Electrical power, UPS, lightning protection, and grounding for key defense projects.' : 'Thi công hệ thống điện lực, UPS, chống sét và tiếp địa cho công trình quốc phòng trọng điểm.',
                },
              ].map((p, i) => (
                <div key={i} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                      <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium my-1">
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

        {/* ── CTA ── */}
        <div className="text-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-3xl p-10">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
            {isEn ? '110kV Power Line & Substation Consultation' : 'Tư Vấn Thi Công Đường Dây & Trạm Biến Áp'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {isEn ? 'CTC power engineers are ready to assist with design, cost estimation, and construction according to EVN and Ministry standards.' : 'Đội ngũ kỹ sư điện lực của CTC sẵn sàng tư vấn thiết kế, lập dự toán và thi công theo tiêu chuẩn EVN và Bộ Xây dựng.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg">
              <Zap size={18} /> {isEn ? 'Contact Electrical Team' : 'Liên hệ tư vấn'}
            </Link>
            <a href="tel:02363745555" className="inline-flex items-center gap-2 border-2 border-yellow-400 text-yellow-600 dark:text-yellow-400 px-8 py-3.5 rounded-2xl font-bold hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all">
              0236 374 5555
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricalContent;
