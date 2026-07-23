import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, Sparkles, User, Phone, Mail, FileText, MapPin, Briefcase, Zap, Award } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import analyticsTracking from '../../services/analytics-tracking';
import companyProfile from '../../constants/company_profile.json';

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

const ContactForm: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    address: '',
    message: '',
    website_hp: ''
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
        body: JSON.stringify({
          ...formData,
          service: formData.service || 'Điện mặt trời mái nhà xưởng'
        })
      });

      const result = await response.json();

      if (response.ok) {
        setFormStatus('success');
        showToast('✅ ' + (result.message || 'Gửi yêu cầu tư vấn thành công!'), 'success');

        analyticsTracking.trackContactRequest(formData.service || 'Điện mặt trời mái nhà', {
          name: formData.name,
          email: formData.email
        });

        setFormData({
          name: '',
          phone: '',
          email: '',
          service: '',
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
      
      {/* Unified Single Seamless Block Container */}
      <div className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-2xl rounded-3xl shadow-[0_12px_40px_0_rgba(0,0,0,0.1)] border border-white/80 dark:border-gray-700/80 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Left Side Accent Banner (Unified inside container) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-corporate via-[#0b192c] to-[#071426] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300 border border-white/20 mb-6 shadow-sm">
                <Sparkles size={13} /> TẠI SAO CHỌN CTC?
              </div>

              <h3 className="text-2xl font-black mb-3 leading-tight drop-shadow-sm">
                Đồng Hành Cùng Doanh Nghiệp Năng Lượng Xanh
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed mb-6 font-light">
                {companyProfile.company_name.short} - Nhà thầu EPC uy tín hàng đầu trong lĩnh vực xây lắp, điện mặt trời & hạ tầng kỹ thuật.
              </p>

              {/* Seamless Value Bullet Points */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl flex-shrink-0 border border-amber-500/30">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Khảo Sát & Thiết Kế 3D Miễn Phí</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5 font-light">
                      Kỹ sư đến tận nơi trong 24h & tính toán sản lượng điện năng chuẩn PV*SOL.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl flex-shrink-0 border border-blue-500/30">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Bảo Hành Hiệu Suất 25 Năm</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5 font-light">
                      Thiết bị pin & Inverter chính hãng có chứng chỉ CO/CQ & bảo hiểm quốc tế.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl flex-shrink-0 border border-emerald-500/30">
                    <Award size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Pháp Lý & EVN Trọn Gói</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5 font-light">
                      Hoàn tất thỏa thuận đấu nối EVN & thẩm duyệt PCCC không lo phát sinh.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Direct Call Box */}
            <div className="mt-8 pt-5 border-t border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Tư vấn khẩn cấp 24/7</span>
                <a href={`tel:${companyProfile.contact.hotline}`} className="text-base font-black text-amber-300 hover:underline">
                  {companyProfile.contact.hotline}
                </a>
              </div>
              <a
                href={`tel:${companyProfile.contact.hotline}`}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-gray-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1"
              >
                <Phone size={13} /> Gọi ngay
              </a>
            </div>
          </div>

          {/* Right Side Form (Unified Seamless Panel) */}
          <div className="lg:col-span-8 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Đăng ký báo giá EPC</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">
                Yêu Cầu Tư Vấn & Thiết Kế Dự Án
              </h3>

              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Nhập thông tin của bạn vào biểu mẫu bên dưới. Chuyên viên dự án CTC sẽ chủ động liên hệ tư vấn trong 15 phút.
              </p>

              {formStatus === 'success' ? (
                <div className="bg-emerald-50/80 dark:bg-emerald-950/60 backdrop-blur-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-8 rounded-2xl text-center animate-fade-in my-6 space-y-4 shadow-lg">
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
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Honeypot field for anti-spam bots */}
                  <input
                    type="text"
                    name="website_hp"
                    value={formData.website_hp}
                    onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden absolute left-[-9999px] opacity-0 pointer-events-none"
                  />
                  
                  {/* Inputs: Name & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Họ và tên *
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                        />
                        <User size={17} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Số điện thoại *
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0915 059 666"
                          className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                        />
                        <Phone size={17} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Inputs: Email & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="congty@domain.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                        />
                        <Mail size={17} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Địa điểm dự án / Tỉnh thành
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Ví dụ: KCN Hòa Khánh, Đà Nẵng"
                          className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                        />
                        <MapPin size={17} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Single Manual Input for Hạng mục giải pháp quan tâm */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Hạng mục giải pháp quan tâm (Nhập tự do)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        placeholder="Ví dụ: Điện mặt trời mái nhà xưởng 500kWp, BESS lưu trữ, Trạm biến áp..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      />
                      <Briefcase size={17} className="absolute left-3.5 top-3 text-gray-400" />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Ghi chú chi tiết / Yêu cầu công suất
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Mô tả chi tiết diện tích mái nhà xưởng, mức tiêu thụ điện năng hàng tháng..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-sm text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      />
                      <FileText size={17} className="absolute left-3.5 top-3 text-gray-400" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className={`w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 ${
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

    </div>
  );
};

export default ContactForm;
