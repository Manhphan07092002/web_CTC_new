import React from 'react';
import { Sun, CheckCircle, Building2, Factory, Zap, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const RooftopContent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#060d1d] transition-colors">
      {/* Intro */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Sun size={14} /> Solar EPC – Tổng thầu
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
              Điện Mặt Trời Áp Mái<br />
              <span className="text-orange-500">Hộ Gia Đình & C&I</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 text-justify">
              CTC cung cấp dịch vụ EPC trọn gói hệ thống điện mặt trời áp mái cho hộ gia đình và khách hàng
              Thương mại & Công nghiệp (C&I). Với kinh nghiệm thi công hàng trăm công trình tại miền Trung,
              CTC đảm bảo chất lượng, tiến độ và hiệu quả đầu tư tối ưu.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '500+', label: 'Công trình Solar đã thi công' },
                { val: '4–5 năm', label: 'Thời gian hoàn vốn điển hình' },
                { val: '20+', label: 'Năm vòng đời hệ thống' },
                { val: '100%', label: 'Cam kết đúng tiến độ' },
              ].map((s, i) => (
                <div key={i} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-orange-500">{s.val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?q=80&w=800&auto=format&fit=crop"
              alt="Solar Rooftop CTC"
              className="rounded-3xl shadow-2xl w-full h-80 object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-orange-100 dark:border-orange-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center text-orange-500">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Chứng chỉ Năng lực</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Bộ Xây dựng – 2020</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mô hình */}
        <div className="mb-20">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 text-center">
            Mô Hình Khách Hàng Tiêu Biểu
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Building2 size={24} />,
                title: 'Hộ gia đình & Biệt thự',
                desc: 'Hệ thống 5–30kWp, hòa lưới bán điện EVN. Hoàn vốn 4–5 năm, tiết kiệm toàn bộ hóa đơn điện sau đó.',
                color: 'blue',
              },
              {
                icon: <Factory size={24} />,
                title: 'Nhà máy & Khu công nghiệp',
                desc: 'Hệ thống C&I quy mô 100kWp – 5MWp. Giảm chi phí điện sản xuất, đạt chứng chỉ xanh ESG/LEED.',
                color: 'orange',
              },
              {
                icon: <Zap size={24} />,
                title: 'Tòa nhà văn phòng & Thương mại',
                desc: 'Tích hợp hệ thống BESS lưu trữ điện, tối ưu giờ cao điểm và ổn định nguồn điện vận hành.',
                color: 'yellow',
              },
            ].map((m, i) => (
              <div key={i} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-7 hover:shadow-xl transition-shadow">
                <div className={`w-12 h-12 bg-${m.color}-100 dark:bg-${m.color}-900/30 text-${m.color}-600 dark:text-${m.color}-400 rounded-xl flex items-center justify-center mb-4`}>
                  {m.icon}
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">{m.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lợi ích & Quy trình */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-corporate to-blue-800 text-white rounded-3xl p-8">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
              <CheckCircle className="text-green-400" size={24} /> Lợi Ích Vượt Trội
            </h3>
            <ul className="space-y-4">
              {[
                'Tiết kiệm 70–100% chi phí điện hàng tháng',
                'Thu nhập từ bán điện dư cho EVN',
                'Giảm nhiệt độ mái nhà 3–5°C, tiết kiệm điều hòa',
                'Bảo vệ môi trường – Giảm phát thải CO₂',
                'Tuổi thọ pin 25–30 năm, bảo hành dài hạn',
                'Tăng giá trị bất động sản lên đến 4%',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <TrendingUp className="text-orange-500" size={24} /> Quy Trình EPC CTC
            </h3>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Tư vấn & Khảo sát', desc: 'Đánh giá hiện trạng mái, bức xạ, tải điện và đề xuất công suất tối ưu.' },
                { step: '02', title: 'Thiết kế kỹ thuật', desc: 'Thiết kế bản vẽ thi công, lựa chọn thiết bị, trình duyệt EVN (nếu cần).' },
                { step: '03', title: 'Thi công & Lắp đặt', desc: 'Đội kỹ thuật chuyên nghiệp, thi công đúng tiến độ, an toàn tuyệt đối.' },
                { step: '04', title: 'Nghiệm thu & Vận hành', desc: 'Đấu nối lưới, kiểm tra toàn hệ thống và bàn giao đầy đủ hồ sơ.' },
              ].map((q, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl font-black text-sm flex items-center justify-center flex-shrink-0">
                    {q.step}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{q.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{q.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-3xl p-10">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Nhận Báo Giá Miễn Phí Ngay Hôm Nay</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Đội ngũ kỹ sư CTC sẵn sàng tư vấn và thiết kế hệ thống phù hợp nhất với nhu cầu của bạn.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-orange-500/30">
              <Zap size={18} /> Liên hệ tư vấn
            </Link>
            <a href="tel:0915059666" className="inline-flex items-center gap-2 border-2 border-orange-400 text-orange-600 dark:text-orange-400 px-8 py-3.5 rounded-2xl font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
              Hotline: 0915 059 666
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RooftopContent;
