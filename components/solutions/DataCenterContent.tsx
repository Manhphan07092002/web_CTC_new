import React from 'react';
import { Server, CheckCircle, Shield, Cpu, Cloud, Settings, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const DataCenterContent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#060d1d] transition-colors">
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Server size={14} /> Tích Hợp Hệ Thống
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
              Trung Tâm Dữ Liệu &<br />
              <span className="text-purple-500">Chuyển Đổi Số</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 text-justify">
              Đồng hành cùng công cuộc chuyển đổi số, CTC tư vấn và triển khai xây dựng Data Center chuẩn Tier III, 
              đáp ứng các tiêu chuẩn khắt khe về an toàn bảo mật số. Tự hào là đối tác của các cơ quan nhà nước, Bộ Công an.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: 'Tier III', label: 'Tiêu chuẩn Data Center' },
                { val: '24/7', label: 'Hệ thống giám sát CCTV' },
                { val: 'UPS', label: 'Nguồn điện liên tục' },
                { val: 'Cloud', label: 'Giải pháp điện toán' },
              ].map((s, i) => (
                <div key={i} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-purple-500">{s.val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop"
              alt="Data Center Infrastructure"
              className="rounded-3xl shadow-2xl w-full h-80 object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-purple-100 dark:border-purple-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center text-purple-500">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Đối Tác Uy Tín</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Khối Cơ quan Nhà nước</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 text-center">
            Giải Pháp Cốt Lõi
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Server size={24} />,
                title: 'Data Center Tier III',
                desc: 'Thiết kế, triển khai phòng máy chủ đạt chuẩn Tier III, tích hợp hệ thống làm mát chính xác (Precision Cooling).',
                color: 'purple',
              },
              {
                icon: <Shield size={24} />,
                title: 'Bảo Mật & CCTV',
                desc: 'Giải pháp camera an ninh, kiểm soát vào ra thông minh và hệ thống an toàn thông tin chuyên sâu.',
                color: 'violet',
              },
              {
                icon: <Cloud size={24} />,
                title: 'Chuyển Đổi Số',
                desc: 'Tư vấn lộ trình chuyển đổi số, cung cấp hạ tầng Cloud, nâng cao năng lực quản trị doanh nghiệp.',
                color: 'indigo',
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
          <div className="bg-gradient-to-br from-corporate to-purple-900 text-white rounded-3xl p-8">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
              <CheckCircle className="text-purple-400" size={24} /> Điểm Mạnh Công Nghệ
            </h3>
            <ul className="space-y-4">
              {[
                'Hệ thống điều hòa chính xác (Precision Cooling) tiết kiệm năng lượng',
                'Nguồn điện liên tục (UPS) dự phòng đa lớp N+1',
                'Hệ thống chữa cháy khí sạch FM-200 / Novec 1230',
                'Phần mềm giám sát quản trị hạ tầng DCIM',
                'Đội ngũ kỹ sư đạt chứng chỉ quốc tế uy tín',
                'Kinh nghiệm phục vụ Cục KTNVI (Bộ Công An) và cơ quan nhà nước',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                  <CheckCircle size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Settings className="text-purple-500" size={24} /> Quy Trình Thực Hiện
            </h3>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Đánh Giá & Tư Vấn', desc: 'Phân tích nhu cầu lưu trữ, công suất nguồn và chuẩn an ninh.' },
                { step: '02', title: 'Thiết Kế Hạ Tầng', desc: 'Thiết kế bố trí tủ Rack, làm mát, cáp mạng và cấp nguồn.' },
                { step: '03', title: 'Triển Khai Tích Hợp', desc: 'Thi công xây dựng, lắp đặt thiết bị CNTT, cấu hình hệ thống.' },
                { step: '04', title: 'Chuyển Giao Công Nghệ', desc: 'Kiểm thử tải trọng, bàn giao và đào tạo vận hành chuẩn quốc tế.' },
              ].map((q, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-black text-sm flex items-center justify-center flex-shrink-0">
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

        <div className="text-center bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-3xl p-10">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Sẵn Sàng Cho Kỷ Nguyên Số?</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Liên hệ đội ngũ chuyên gia của CTC để xây dựng Data Center an toàn, tối ưu chi phí.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-purple-500/30">
              <Server size={18} /> Liên hệ tư vấn
            </Link>
            <a href="tel:0915059666" className="inline-flex items-center gap-2 border-2 border-purple-400 text-purple-600 dark:text-purple-400 px-8 py-3.5 rounded-2xl font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
              Hotline: 0915 059 666
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCenterContent;
