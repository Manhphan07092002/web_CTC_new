import React from 'react';
import { HardHat, CheckCircle, Home, Factory, Zap, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConstructionContent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#060d1d] transition-colors">
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <HardHat size={14} /> Tổng Thầu Xây Lắp
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
              Kinh Nghiệm Triển Khai<br />
              <span className="text-slate-500">Đa Dạng Dự Án</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 text-justify">
              Với vị thế là đơn vị thi công hàng đầu tại khu vực, CTC đảm nhận vai trò tổng thầu cho nhiều loại hình dự án từ dân dụng, công nghiệp cho đến các dự án hạ tầng viễn thông, năng lượng và công trình quốc phòng trọng điểm A70.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '500+', label: 'Công trình hoàn thành' },
                { val: 'A70', label: 'Dự án quốc phòng' },
                { val: '32+', label: 'Năm kinh nghiệm' },
                { val: '100%', label: 'Cam kết tiến độ' },
              ].map((s, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-slate-600 dark:text-slate-300">{s.val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop"
              alt="Construction Site"
              className="rounded-3xl shadow-2xl w-full h-80 object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-100 dark:border-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900/50 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Uy Tín Vững Bền</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Hơn 30 năm phát triển</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 text-center">
            Lĩnh Vực Thi Công
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Factory size={24} />,
                title: 'Công Nghiệp & Nhà Xưởng',
                desc: 'Thi công xây dựng nhà máy, kho bãi, khu công nghiệp với kết cấu thép bền vững và tối ưu không gian.',
                color: 'slate',
              },
              {
                icon: <Home size={24} />,
                title: 'Dân Dụng & Hành Chính',
                desc: 'Xây dựng tòa nhà văn phòng, trụ sở cơ quan nhà nước, trung tâm thương mại và các dự án dân sinh.',
                color: 'gray',
              },
              {
                icon: <Zap size={24} />,
                title: 'Hạ Tầng Năng Lượng',
                desc: 'Thi công móng trạm biến áp, móng trụ điện gió, hệ thống cáp ngầm và hạ tầng viễn thông.',
                color: 'zinc',
              },
            ].map((m, i) => (
              <div key={i} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-7 hover:shadow-xl transition-shadow">
                <div className={`w-12 h-12 bg-${m.color}-200 dark:bg-${m.color}-800/30 text-${m.color}-700 dark:text-${m.color}-300 rounded-xl flex items-center justify-center mb-4`}>
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
              <CheckCircle className="text-slate-300" size={24} /> Tiêu Chuẩn Chất Lượng
            </h3>
            <ul className="space-y-4">
              {[
                'Áp dụng quy trình quản lý chất lượng ISO 9001:2015',
                'Đảm bảo an toàn lao động tuyệt đối trên công trường',
                'Sử dụng vật liệu xây dựng nguồn gốc rõ ràng, đạt chuẩn',
                'Đội ngũ kỹ sư, giám sát viên dày dặn kinh nghiệm',
                'Cam kết hoàn thành đúng tiến độ đã thỏa thuận',
                'Bảo hành, bảo trì dài hạn cho mọi công trình',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                  <CheckCircle size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <TrendingUp className="text-slate-500" size={24} /> Quy Trình Tổng Thầu
            </h3>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Tiếp Nhận & Báo Giá', desc: 'Nghiên cứu bản vẽ thiết kế, lập dự toán chi tiết và phương án thi công.' },
                { step: '02', title: 'Chuẩn Bị Mặt Bằng', desc: 'Tổ chức lán trại, thiết bị, tập kết vật tư và đảm bảo an toàn thi công.' },
                { step: '03', title: 'Triển Khai Xây Dựng', desc: 'Thi công phần thô, kết cấu, kiến trúc và hệ thống MEP đồng bộ.' },
                { step: '04', title: 'Nghiệm Thu & Bàn Giao', desc: 'Kiểm tra chất lượng hoàn thiện, dọn dẹp vệ sinh và bàn giao công trình.' },
              ].map((q, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 rounded-xl font-black text-sm flex items-center justify-center flex-shrink-0">
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

        <div className="text-center bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/50 rounded-3xl p-10">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Hợp Tác Cùng CTC</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Liên hệ để được tư vấn thiết kế, thi công trọn gói cho công trình của bạn với chi phí tối ưu.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-slate-500/30">
              <HardHat size={18} /> Nhận báo giá ngay
            </Link>
            <a href="tel:0915059666" className="inline-flex items-center gap-2 border-2 border-slate-400 text-slate-600 dark:text-slate-400 px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all">
              Hotline: 0915 059 666
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionContent;
