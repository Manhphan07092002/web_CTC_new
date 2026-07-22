import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, Sparkles, User, Phone, Mail, FileText, MapPin, Award, Zap, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import analyticsTracking from '../../services/analytics-tracking';

const getApiBase = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  if (!port || port === '80' || port === '443') {
    return '/api';
  }
  return `${protocol}//${hostname}:4000/api`;
};
const API_BASE = getApiBase();

const SERVICES = [
  { id: 'rooftop', label: 'Điện Mặt Trời Mái Nhà Xưởng / Công Nghiệp' },
  { id: 'farm', label: 'Điện Mặt Trời Trang Trại Solar Farm' },
  { id: 'floating', label: 'Điện Mặt Trời Nổi Mặt Nước Floating' },
  { id: 'bess', label: 'Hệ Thống Lưu Trữ Điện BESS Công Nghiệp' },
  { id: 'station', label: 'Trạm Biến Áp & Đường Dây Truyền Tải' },
  { id: 'equipment', label: 'Cung Cấp Thiết Bị Pin & Inverter Chính Hãng' }
];

const ContactForm: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: SERVICES[0].label,
    address: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');

    try {
      const response = await fetch(`${API_BASE}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setFormStatus('success');
        showToast('✅ ' + (result.message || 'Gửi yêu cầu tư vấn thành công!'), 'success');

        analyticsTracking.trackContactRequest(formData.service, {
          name: formData.name,
          email: formData.email
        });

        setFormData({
          name: '',
          phone: '',
          email: '',
          service: SERVICES[0].label,
          address: '',
          message: ''
        });

        setTimeout(() => setFormStatus('idle'), 6000);
      } else {
        throw new Error(result.error || 'Gửi yêu cầu không thành công');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showToast('❌ Có lỗi xảy ra. Vui lòng liên hệ Hotline 0915 059 666!', 'error');
      setFormStatus('idle');
    }
  };

  return (
    <div id="form-sec" className="mb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: CTC Value Proposition Cards */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-corporate via-[#0f2447] to-[#081730] text-white p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300 border border-white/15 mb-6">
              <Sparkles size={14} /> TẠI SAO CHỌN CTC?
            </div>

            <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
              Đồng Hành Cùng Doanh Nghiệp Năng Lượng Xanh
            </h3>

            <p className="text-sm text-gray-300 leading-relaxed mb-8 font-light">
              CTC là nhà thầu EPC trọn gói tiên phong mang lại giải pháp điện mặt trời công nghiệp tối ưu chi phí LCOE, tuân thủ nghiêm ngặt quy chuẩn an toàn.
            </p>

            {/* Benefit List */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl flex-shrink-0 border border-amber-500/30">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Khảo Sát & Mô Phỏng 3D Miễn Phí</h4>
                  <p className="text-xs text-gray-300 leading-relaxed mt-0.5">
                    Kỹ sư đến khảo sát thực địa mái nhà xưởng trong 24h & tính toán sản lượng điện năng PV*SOL chính xác 99%.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 text-blue-300 rounded-2xl flex-shrink-0 border border-blue-500/30">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Bảo Hành Hiệu Suất 25 Năm</h4>
                  <p className="text-xs text-gray-300 leading-relaxed mt-0.5">
                    Cam kết chất lượng thiết bị pin & Inverter chính hãng có chứng chỉ CO/CQ & bảo hiểm Munich RE quốc tế.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl flex-shrink-0 border border-emerald-500/30">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Thủ Tục Pháp Lý & EVN Trọn Gói</h4>
                  <p className="text-xs text-gray-300 leading-relaxed mt-0.5">
                    Hoàn tất thỏa thuận đấu nối EVN, thẩm duyệt PCCC và kiểm định an toàn kết cấu không lo chi phí phát sinh.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Direct Call Box */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 block uppercase">Cần hỗ trợ gấp?</span>
              <a href="tel:0915059666" className="text-lg font-black text-amber-300 hover:underline">
                0915 059 666
              </a>
            </div>
            <a
              href="tel:0915059666"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5"
            >
              <Phone size={14} /> Gọi ngay
            </a>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Đăng ký báo giá EPC</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3">
              Yêu Cầu Tư Vấn & Thiết Kế Dự Án
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Nhập thông tin của bạn vào biểu mẫu bên dưới. Chuyên viên dự án CTC sẽ chủ động gọi điện tư vấn chi tiết.
            </p>

            {formStatus === 'success' ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-8 rounded-2xl text-center animate-fade-in my-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="font-extrabold text-xl">Gửi Yêu Cầu Tư Vấn Thành Công!</h4>
                <p className="text-sm max-w-md mx-auto leading-relaxed">
                  Cảm ơn quý khách hàng. Đội ngũ kỹ sư CTC sẽ liên hệ qua số điện thoại để trao đổi chi tiết phương án thi công.
                </p>
                <button
                  onClick={() => setFormStatus('idle')}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all"
                >
                  Gửi thêm yêu cầu tư vấn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Inputs: Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      />
                      <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0915 059 666"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      />
                      <Phone size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Inputs: Email & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="congty@domain.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      />
                      <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Địa điểm dự án / Tỉnh thành
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Ví dụ: KCN Hòa Khánh, Đà Nẵng"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      />
                      <MapPin size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Service Choice */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2.5">
                    Hạng mục giải pháp quan tâm
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICES.map((srv) => {
                      const isSelected = formData.service === srv.label;
                      return (
                        <button
                          type="button"
                          key={srv.id}
                          onClick={() => setFormData({ ...formData, service: srv.label })}
                          className={`p-3 rounded-2xl text-xs font-bold text-left transition-all flex items-center justify-between border ${
                            isSelected
                              ? 'bg-corporate text-white border-corporate shadow-md'
                              : 'bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-amber-400'
                          }`}
                        >
                          <span className="truncate pr-2">{srv.label}</span>
                          {isSelected && <Check size={16} className="text-amber-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Ghi chú chi tiết / Công suất dự kiến (kWp)
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Mô tả diện tích mái xưởng hoặc nhu cầu lắp đặt..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                    />
                    <FileText size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className={`w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base rounded-2xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 ${
                    formStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {formStatus === 'submitting' ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý thông tin...
                    </span>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>GỬI YÊU CẦU TƯ VẤN NGAY</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactForm;
