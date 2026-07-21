import React from 'react';
import { Zap, CheckCircle, Lightbulb, TowerControl, ShieldAlert, ShieldCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const ElectricalContent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#060d1d] transition-colors">
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Zap size={14} /> Hệ Thống Điện & Trạm Biến Áp
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
              Giải Pháp Năng Lượng<br />
              <span className="text-yellow-500">Chất Lượng Cao</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 text-justify">
              Từ các công trình đường dây tải điện đến hệ thống trạm biến áp 110kV/220kV, CTC mang đến các giải pháp an toàn, hiệu quả. Với chứng chỉ năng lực từ Bộ Xây dựng năm 2020, chúng tôi thực hiện các dự án yêu cầu kỹ thuật nghiêm ngặt nhất.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '110kV+', label: 'Công trình Trạm biến áp' },
                { val: 'A70', label: 'Tham gia dự án quốc phòng' },
                { val: '220kV', label: 'Hạ tầng đường dây điện' },
                { val: '2020', label: 'Chứng chỉ Bộ Xây dựng' },
              ].map((s, i) => (
                <div key={i} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-yellow-500">{s.val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1620800632292-628d7a1267b1?q=80&w=800&auto=format&fit=crop"
              alt="Hệ thống điện và trạm biến áp"
              className="rounded-3xl shadow-2xl w-full h-80 object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-yellow-100 dark:border-yellow-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center text-yellow-500">
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

        <div className="mb-20">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 text-center">
            Dịch Vụ Nổi Bật
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <TowerControl size={24} />,
                title: 'Đường Dây & Trạm Biến Áp',
                desc: 'Thi công đường dây tải điện 110kV/220kV, xây dựng trạm biến áp, phục vụ khu công nghiệp và dự án điện gió.',
                color: 'yellow',
              },
              {
                icon: <ShieldAlert size={24} />,
                title: 'Tiếp Địa & Chống Sét',
                desc: 'Hệ thống bảo vệ toàn diện, an toàn lưới điện, tiếp địa công trình dân dụng và công nghiệp quốc phòng.',
                color: 'orange',
              },
              {
                icon: <Lightbulb size={24} />,
                title: 'Nguồn Dự Phòng UPS',
                desc: 'Cung cấp giải pháp năng lượng liên tục, ổn định cho doanh nghiệp, đảm bảo không gián đoạn vận hành.',
                color: 'amber',
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

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-corporate to-slate-800 text-white rounded-3xl p-8">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
              <CheckCircle className="text-yellow-400" size={24} /> Năng Lực Cốt Lõi
            </h3>
            <ul className="space-y-4">
              {[
                'Đáp ứng tiêu chuẩn kỹ thuật điện lực quốc gia (EVN)',
                'Chứng chỉ năng lực xây dựng hạng cao do Bộ Xây dựng cấp',
                'Kinh nghiệm dự án quốc phòng A70 yêu cầu bảo mật',
                'Quản lý chất lượng & an toàn lao động nghiêm ngặt',
                'Giải pháp tích hợp đồng bộ từ móng cột đến trạm áp',
                'Đối tác cung cấp thiết bị năng lượng hàng đầu',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                  <CheckCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <ShieldCheck className="text-yellow-500" size={24} /> Quy Trình Triển Khai
            </h3>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Khảo sát & Phân tích', desc: 'Đánh giá địa chất, địa hình lưới điện khu vực.' },
                { step: '02', title: 'Thiết kế hệ thống', desc: 'Lập bản vẽ, hồ sơ dự toán và thỏa thuận đấu nối.' },
                { step: '03', title: 'Xây dựng móng & Trụ', desc: 'Thi công nền móng vững chắc, dựng cột điện và trạm áp.' },
                { step: '04', title: 'Kéo dây & Đóng điện', desc: 'Lắp đặt đường dây, thí nghiệm thiết bị và hòa lưới an toàn.' },
              ].map((q, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl font-black text-sm flex items-center justify-center flex-shrink-0">
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

        <div className="text-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-3xl p-10">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Triển Khai Dự Án Điện Trọng Điểm Của Bạn?</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Liên hệ CTC để nhận được sự tư vấn chuyên sâu về hạ tầng điện và trạm biến áp.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-yellow-500/30">
              <Zap size={18} /> Liên hệ tư vấn
            </Link>
            <a href="tel:0915059666" className="inline-flex items-center gap-2 border-2 border-yellow-400 text-yellow-600 dark:text-yellow-400 px-8 py-3.5 rounded-2xl font-bold hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all">
              Hotline: 0915 059 666
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricalContent;
