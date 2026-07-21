import React from 'react';
import { Building2, Shield, Hammer, CheckCircle, MapPin, TrendingUp, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConstructionContent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#060d1d] transition-colors">
      <div className="container mx-auto px-6 py-16">

        {/* ── Intro ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Building2 size={14} /> Xây dựng Kỹ thuật
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
              Xây Dựng Dân Dụng &<br />
              <span className="text-slate-500">Công Nghiệp EPC Toàn Diện</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 text-justify">
              Với vị thế tổng thầu xây lắp tích lũy suốt <strong className="text-slate-900 dark:text-white">32+ năm qua</strong>,
              CTC đã trực tiếp thi công và bàn giao hơn 500 công trình xây dựng kỹ thuật. Từ hệ thống nhà xưởng sản xuất,
              nhà kho công nghiệp quy mô lớn, đến hạ tầng kỹ thuật đặc thù cho các dự án năng lượng (nền móng trụ điện gió, trạm biến áp)
              và các công trình quốc phòng, an ninh an toàn tuyệt đối.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '500+', label: 'Công trình hoàn thành' },
                { val: '32+ Năm', label: 'Thương hiệu uy tín' },
                { val: 'Hạng II', label: 'Chứng chỉ Bộ Xây dựng' },
                { val: 'EPC', label: 'Tổng thầu trọn gói' },
              ].map((s, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-slate-600 dark:text-slate-400">{s.val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=800&auto=format&fit=crop"
              alt="Xây dựng công nghiệp CTC"
              className="rounded-3xl shadow-2xl w-full h-80 object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-100 dark:border-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900/50 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Tổng thầu EPC</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Thiết kế & Thi công trọn gói</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Dịch vụ ── */}
        <div className="mb-20">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 text-center">
            Năng Lực Thiết Kế & Thi Công
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Building2 size={22} />,
                title: 'Nhà xưởng & Kho công nghiệp',
                desc: 'Thi công kết cấu thép, hệ khung nhà tiền chế, sàn bê tông cốt thép tải trọng cao phục vụ nhu cầu sản xuất và lưu trữ của các doanh nghiệp trong nước và FDI.',
                color: 'slate',
              },
              {
                icon: <Hammer size={22} />,
                title: 'Móng & Trụ gió chuyên dụng',
                desc: 'Thi công kết cấu bê tông cốt thép khối lớn siêu trường siêu trọng cho nền móng trụ tua-bin điện gió, móng giàn pin năng lượng mặt trời.',
                color: 'zinc',
              },
              {
                icon: <Shield size={22} />,
                title: 'Công trình Quốc phòng A70',
                desc: 'Được tin tưởng giao phó xây lắp hạ tầng kỹ thuật quốc phòng và các công trình an ninh có yêu cầu bảo mật, độ tin cậy và tiêu chuẩn kỹ thuật nghiêm ngặt nhất.',
                color: 'slate',
              },
              {
                icon: <Building2 size={22} />,
                title: 'Công trình dân dụng & công sở',
                desc: 'Xây dựng nhà điều hành trạm biến áp, văn phòng làm việc, nhà ở cán bộ nhân viên và các công trình hành chính công cộng.',
                color: 'slate',
              },
              {
                icon: <Hammer size={22} />,
                title: 'Hệ thống cơ điện M&E',
                desc: 'Tổng thầu hệ thống cơ điện công nghiệp: hệ thống cấp thoát nước, thông gió điều hòa, hệ thống điện động lực, máy phát điện và chiếu sáng nhà xưởng.',
                color: 'zinc',
              },
              {
                icon: <Shield size={22} />,
                title: 'San lấp & Giao thông hạ tầng',
                desc: 'Thi công san lấp mặt bằng diện tích lớn, đường nội bộ KCN, hệ thống mương cống thoát nước và hạ tầng giao thông kết nối dự án.',
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

        {/* ── Khách hàng & Dự án ── */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-3xl p-8">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
              <Award size={24} className="text-slate-300" /> Khách Hàng & Đối Tác
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Bộ Quốc phòng', desc: 'Thi công xây lắp hạ tầng công trình thông tin và quốc phòng trọng điểm A70' },
                { name: 'Đơn vị quản lý Khu Công Nghiệp', desc: 'Tổng thầu san lấp mặt bằng, đường nội bộ, thoát nước và nhà xưởng công nghiệp' },
                { name: 'Chủ đầu tư Năng lượng Tái tạo', desc: 'Đơn vị thi công kết cấu móng tuabin, móng trạm biến áp 110kV cho dự án điện gió' },
                { name: 'Các doanh nghiệp tư nhân & FDI', desc: 'Thiết kế, xây dựng nhà kho, văn phòng đại diện và cơ điện phụ trợ M&E' },
              ].map((c, i) => (
                <div key={i} className="border-l-2 border-slate-400 pl-4">
                  <div className="font-bold text-sm text-slate-300 mb-1">{c.name}</div>
                  <div className="text-sm text-slate-200/80 leading-relaxed">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <TrendingUp className="text-slate-500" size={24} /> Dự Án Tiêu Biểu
            </h3>
            <div className="space-y-4">
              {[
                {
                  name: 'Công trình Quốc phòng A70',
                  location: 'Miền Trung',
                  scope: 'Thi công xây lắp toàn bộ kết cấu xây dựng và hạ tầng phòng máy chủ cho công trình quốc phòng chuyên dụng.',
                },
                {
                  name: 'Hạ tầng kết cấu móng tua-bin điện gió Hướng Linh',
                  location: 'Quảng Trị',
                  scope: 'Thi công đào đắp đất đá, đổ bê tông cốt thép móng khối lớn cho tua-bin điện gió vững chắc chống chịu bão lũ.',
                },
                {
                  name: 'Nhà xưởng công nghiệp kết cấu thép Hòa Khánh',
                  location: 'Đà Nẵng',
                  scope: 'Tổng thầu EPC thiết kế, cung cấp vật tư và thi công nhà xưởng sản xuất 5000m² và cơ điện M&E trọn gói.',
                },
              ].map((p, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-medium my-1">
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
        <div className="text-center bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/50 rounded-3xl p-10">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
            Tư Vấn Thiết Kế & Thi Công Xây Dựng
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Đội ngũ kỹ sư kết cấu và thi công của CTC sẵn sàng tư vấn giải pháp tổng thầu xây lắp công trình dân dụng, công nghiệp & quốc phòng.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg">
              <Zap size={18} /> Liên hệ tư vấn
            </Link>
            <a href="tel:02363745555" className="inline-flex items-center gap-2 border-2 border-slate-400 text-slate-600 dark:text-slate-400 px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-all">
              0236 374 5555
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionContent;
