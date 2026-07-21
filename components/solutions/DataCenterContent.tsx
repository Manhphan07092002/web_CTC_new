import React from 'react';
import { Server, Shield, Wifi, CheckCircle, MapPin, TrendingUp, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const DataCenterContent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#060d1d] transition-colors">
      <div className="container mx-auto px-6 py-16">

        {/* ── Intro ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Server size={14} /> Hạ tầng số & CNTT
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
              Data Center & CNTT <br />
              <span className="text-violet-500">Chuẩn Tier III – Chuyển đổi số</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 text-justify">
              Từ nền tảng hạ tầng viễn thông, CTC mở rộng sang lĩnh vực hạ tầng số và CNTT. Đơn vị có kinh nghiệm
              thiết kế và xây dựng <strong className="text-slate-900 dark:text-white">Data Center chuẩn Tier III</strong>,
              hệ thống mạng nội bộ, bảo mật dữ liệu và camera an ninh cho cơ quan nhà nước, đơn vị quốc phòng
              và doanh nghiệp trên toàn quốc.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: 'Tier III', label: 'Chuẩn Data Center' },
                { val: '99.98%', label: 'Uptime đảm bảo' },
                { val: '24/7', label: 'Giám sát O&M' },
                { val: '100+', label: 'Hệ thống CNTT' },
              ].map((s, i) => (
                <div key={i} className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-violet-600 dark:text-violet-400">{s.val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop"
              alt="Data Center CTC"
              className="rounded-3xl shadow-2xl w-full h-80 object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-violet-100 dark:border-violet-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/50 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Đối tác chiến lược</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Bộ Công an, Cục KTNVI</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Dịch vụ ── */}
        <div className="mb-20">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 text-center">
            Lĩnh Vực Data Center & Hạ Tầng Số
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Server size={22} />,
                title: 'Data Center Tier III',
                desc: 'Thiết kế và thi công Trung tâm Dữ liệu chuẩn Tier III: hạ tầng điện N+1, làm mát precision cooling, UPS dự phòng và hệ thống phòng cháy chữa cháy.',
                color: 'violet',
              },
              {
                icon: <Wifi size={22} />,
                title: 'Hạ tầng mạng doanh nghiệp',
                desc: 'Thiết kế và triển khai hệ thống mạng LAN/WAN, core switching, WiFi enterprise, MPLS và SD-WAN cho văn phòng, nhà máy và khu công nghiệp.',
                color: 'purple',
              },
              {
                icon: <Shield size={22} />,
                title: 'Bảo mật & An ninh mạng',
                desc: 'Triển khai tường lửa (Firewall), hệ thống phát hiện xâm nhập IDS/IPS, VPN, bảo mật endpoint và chính sách an toàn thông tin theo chuẩn ISO 27001.',
                color: 'indigo',
              },
              {
                icon: <Server size={22} />,
                title: 'Camera & Giám sát an ninh',
                desc: 'Hệ thống camera IP, AI Camera phân tích hành vi, tổng đài IP và hệ thống kiểm soát ra vào (Access Control) cho tòa nhà, nhà máy và cơ quan.',
                color: 'violet',
              },
              {
                icon: <Wifi size={22} />,
                title: 'Hạ tầng CNTT cơ quan nhà nước',
                desc: 'Hệ thống mạng nội bộ, phòng máy chủ, hội nghị truyền hình và hạ tầng CNTT tích hợp cho các Bộ, ngành, đơn vị hành chính và cơ quan quốc phòng.',
                color: 'purple',
              },
              {
                icon: <Shield size={22} />,
                title: 'Chuyển đổi số & Cloud',
                desc: 'Tư vấn và triển khai giải pháp chuyển đổi số: quản lý tài sản IoT, hệ thống ERP, Cloud Hybrid và số hóa quy trình vận hành doanh nghiệp.',
                color: 'indigo',
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
          <div className="bg-gradient-to-br from-violet-700 to-purple-700 text-white rounded-3xl p-8">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
              <Award size={24} className="text-violet-200" /> Khách Hàng Chiến Lược
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Bộ Công an – Cục KTNVI', desc: 'Hệ thống CNTT an ninh, camera giám sát và hạ tầng mạng chuyên dụng cho cơ quan Bộ Công an' },
                { name: 'Cơ quan hành chính nhà nước', desc: 'Triển khai phòng máy chủ, mạng nội bộ và hệ thống hội nghị truyền hình cho các Bộ, Tỉnh' },
                { name: 'Doanh nghiệp FDI & Sản xuất', desc: 'Hạ tầng mạng, camera AI và hệ thống bảo mật cho nhà máy KCN và tổ hợp sản xuất' },
                { name: 'Tập đoàn viễn thông', desc: 'Phòng máy chủ, thiết bị active và giải pháp bảo mật cho hạ tầng mạng nhà mạng' },
              ].map((c, i) => (
                <div key={i} className="border-l-2 border-violet-300 pl-4">
                  <div className="font-bold text-sm text-violet-200 mb-1">{c.name}</div>
                  <div className="text-sm text-violet-100/80 leading-relaxed">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <TrendingUp className="text-violet-500" size={24} /> Dự Án Tiêu Biểu
            </h3>
            <div className="space-y-4">
              {[
                {
                  name: 'Data Center – Cục KTNVI Bộ Công an',
                  location: 'Toàn quốc',
                  scope: 'Thiết kế và xây dựng phòng máy chủ, hệ thống làm mát, UPS và bảo mật vật lý chuẩn Tier III cho cơ quan an ninh.',
                },
                {
                  name: 'Hệ thống camera AI – Khu công nghiệp',
                  location: 'Miền Trung',
                  scope: 'Triển khai hệ thống camera AI phân tích hành vi, kiểm soát ra vào và giám sát an ninh 24/7 cho khu công nghiệp.',
                },
                {
                  name: 'Hạ tầng mạng – Tòa nhà hành chính',
                  location: 'Đà Nẵng',
                  scope: 'Thiết kế và thi công toàn bộ hệ thống mạng LAN, WiFi, tổng đài IP và phòng máy chủ cho tòa nhà hành chính cấp tỉnh.',
                },
              ].map((p, i) => (
                <div key={i} className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/50 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-violet-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                      <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-medium my-1">
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
        <div className="text-center bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50 rounded-3xl p-10">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
            Tư Vấn Data Center & Hạ Tầng CNTT
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Đội ngũ chuyên gia CNTT của CTC sẵn sàng tư vấn thiết kế Data Center, hạ tầng mạng và giải pháp bảo mật phù hợp với quy mô và ngân sách của bạn.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg">
              <Zap size={18} /> Liên hệ tư vấn
            </Link>
            <a href="tel:02363745555" className="inline-flex items-center gap-2 border-2 border-violet-400 text-violet-600 dark:text-violet-400 px-8 py-3.5 rounded-2xl font-bold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all">
              0236 374 5555
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCenterContent;
