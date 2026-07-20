import React from 'react';
import { Wind, Zap, CheckCircle, MapPin, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const FarmContent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#060d1d] transition-colors">
      <div className="container mx-auto px-6 py-16">

        {/* Intro */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Wind size={14} /> Wind EPC – Tổng thầu
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
              Điện Gió (Wind Power)<br />
              <span className="text-teal-500">Trang Trại Điện Gió EPC</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 text-justify">
              CTC là một trong số ít doanh nghiệp miền Trung có năng lực EPC trọn gói các dự án điện gió trong đất liền.
              Từ nền móng trụ gió, hạ tầng cáp nội bộ đến đấu nối lưới 110kV/220kV và trạm biến áp, CTC đảm bảo chất lượng
              và tiến độ theo chuẩn quốc tế.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '3', label: 'Dự án điện gió đã thi công' },
                { val: '110kV', label: 'Chuẩn đấu nối lưới điện' },
                { val: '32+', label: 'Năm kinh nghiệm hạ tầng' },
                { val: '53+', label: 'Kỹ sư chuyên ngành' },
              ].map((s, i) => (
                <div key={i} className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-teal-500">{s.val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop"
              alt="Wind Farm CTC"
              className="rounded-3xl shadow-2xl w-full h-80 object-cover"
            />
            <div className="absolute -bottom-5 -right-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-teal-100 dark:border-teal-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center text-teal-500">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Đối tác chiến lược</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Dongfang Electric Int'l</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dự án tiêu biểu */}
        <div className="mb-20">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 text-center">
            Dự Án Điện Gió Tiêu Biểu
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Điện gió Hướng Linh 1',
                location: 'Hướng Hóa, Quảng Trị',
                scope: 'Thi công hạ tầng nền móng trụ gió, cáp nội bộ và hệ thống đấu nối lưới điện quốc gia.',
                client: 'Cty CP Điện gió Hướng Linh',
                img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=600&auto=format&fit=crop',
              },
              {
                name: 'Điện gió Hướng Linh 4',
                location: 'Hướng Hóa, Quảng Trị',
                scope: 'EPC hạ tầng tổng thể: Đường nội bộ, nền móng, cáp điện và trạm biến áp đấu nối.',
                client: 'Cty CP Điện gió Hướng Linh',
                img: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?q=80&w=600&auto=format&fit=crop',
              },
              {
                name: 'Điện gió Hướng Hiệp',
                location: 'Đakrông, Quảng Trị',
                scope: 'Xây dựng hạ tầng trang trại điện gió, hệ thống thu thập dữ liệu SCADA và O&M.',
                client: 'Cty CP Năng lượng tái tạo',
                img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
              },
            ].map((p, i) => (
              <div key={i} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                <div className="h-44 overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-5">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">{p.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium mb-3">
                    <MapPin size={12} /> {p.location}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{p.scope}</p>
                  <div className="text-xs text-slate-400 dark:text-slate-500">Chủ đầu tư: <strong className="text-slate-600 dark:text-slate-300">{p.client}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Năng lực EPC & Lợi ích */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Zap className="text-teal-500" size={24} /> Phạm Vi EPC Điện Gió
            </h3>
            <div className="space-y-3">
              {[
                'Khảo sát, đo gió, đánh giá tiềm năng dự án',
                'Thiết kế bản vẽ nền móng, hạ tầng tổng thể',
                'Xây dựng đường công vụ nội bộ trang trại gió',
                'Thi công nền móng bê tông trụ gió',
                'Lắp đặt cáp ngầm nội bộ liên turbine',
                'Xây dựng trạm biến áp 110kV/220kV đấu nối lưới',
                'Lắp đặt hệ thống SCADA giám sát vận hành',
                'O&M – Vận hành & Bảo trì dài hạn',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 rounded-xl px-4 py-3">
                  <CheckCircle size={16} className="text-teal-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-corporate to-teal-800 text-white rounded-3xl p-8">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
              <TrendingUp size={24} className="text-teal-300" /> Tại Sao Chọn CTC?
            </h3>
            <div className="space-y-5">
              {[
                { title: 'Kinh nghiệm thực chiến', desc: 'Đã hoàn thành 3 dự án điện gió tại Quảng Trị với tổng quy mô hàng chục MW.' },
                { title: 'Đối tác quốc tế', desc: 'Hợp tác với Dongfang Electric International Corporation – nhà sản xuất turbine hàng đầu.' },
                { title: 'Nhân lực chuyên sâu', desc: '53+ kỹ sư với chuyên môn Điện, Xây dựng, Viễn thông và Quản lý dự án năng lượng.' },
                { title: 'Năng lực tài chính', desc: 'Doanh thu 288 tỷ VNĐ năm 2025, tổng tài sản 181 tỷ VNĐ, đủ năng lực triển khai dự án lớn.' },
              ].map((r, i) => (
                <div key={i} className="border-l-2 border-teal-400 pl-4">
                  <div className="font-bold text-sm text-teal-300 mb-1">{r.title}</div>
                  <div className="text-sm text-gray-300 leading-relaxed">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 rounded-3xl p-10">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Tư Vấn Dự Án Điện Gió</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Liên hệ ngay để được đội ngũ kỹ sư EPC của CTC tư vấn chi tiết về kế hoạch triển khai và chi phí.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-8 py-3.5 rounded-2xl font-bold transition-all">
              <Zap size={18} /> Liên hệ EPC
            </Link>
            <a href="tel:02363745555" className="inline-flex items-center gap-2 border-2 border-teal-400 text-teal-600 dark:text-teal-400 px-8 py-3.5 rounded-2xl font-bold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all">
              0236 374 5555
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmContent;
