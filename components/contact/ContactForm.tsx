import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, Sparkles, User, Phone, Mail, FileText, MapPin } from 'lucide-react';
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
  'Điện Mặt Trời Mái Nhà Xưởng / Công Nghiệp',
  'Điện Mặt Trời Trang Trại Solar Farm',
  'Điện Mặt Trời Nổi Mặt Nước Floating',
  'Hệ Thống Lưu Trữ Điện BESS',
  'Trạm Biến Áp & Đường Dây Truyền Tải',
  'Cung Cấp Thiết Bị Pin & Inverter Chính Hãng'
];

const ContactForm: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: SERVICES[0],
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
          service: SERVICES[0],
          address: '',
          message: ''
        });

        setTimeout(() => setFormStatus('idle'), 5000);
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
    <div id="form-sec" className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={20} className="text-yellow-500" />
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Tư vấn giải pháp EPC</span>
      </div>

      <h3 className="text-2xl md:text-3xl font-extrabold text-corporate dark:text-white mb-3">
        Đăng Ký Nhận Báo Giá & Thiết Kế Miễn Phí
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
        Điền thông tin bên dưới, chuyên viên kỹ thuật CTC sẽ liên hệ hỗ trợ tư vấn và lập phương án tài chính trong vòng <strong className="text-primary font-bold">15 phút</strong>.
      </p>

      {formStatus === 'success' ? (
        <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-8 rounded-2xl text-center animate-fade-in my-8 space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/60 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
            <CheckCircle2 size={36} />
          </div>
          <h4 className="font-extrabold text-xl">Gửi Yêu Cầu Tư Vấn Thành Công!</h4>
          <p className="text-sm max-w-md mx-auto leading-relaxed">
            Cảm ơn quý khách hàng đã tin tưởng CTC. Đội ngũ kỹ sư của chúng tôi sẽ gọi lại trực tiếp qua số điện thoại để hỗ trợ quý khách.
          </p>
          <button
            onClick={() => setFormStatus('idle')}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-green-700 transition-all"
          >
            Gửi thêm yêu cầu khác
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Họ và tên khách hàng *
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Số điện thoại liên hệ *
              </label>
              <div className="relative">
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0915 059 666"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Row 2: Email & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Địa chỉ Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="khachhang@ctcdn.vn"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Địa điểm triển khai công trình
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="KCN Hòa Khánh, Đà Nẵng..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Service Selector Chips */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Dịch vụ / Giải pháp quan tâm
            </label>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((srv) => (
                <button
                  type="button"
                  key={srv}
                  onClick={() => setFormData({ ...formData, service: srv })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    formData.service === srv
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {srv}
                </button>
              ))}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Nội dung chi tiết / Yêu cầu công suất (kWp)
            </label>
            <div className="relative">
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Cần khảo sát tư vấn hệ thống điện mặt trời mái nhà xưởng 500kWp tại Đà Nẵng..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
              <FileText size={18} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formStatus === 'submitting'}
            className={`w-full py-4 bg-primary hover:bg-secondary text-white font-extrabold text-base rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
              formStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {formStatus === 'submitting' ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang gửi thông tin...
              </span>
            ) : (
              <>
                <Send size={20} />
                <span>Gửi Yêu Cầu Báo Giá Ngay</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck size={14} className="text-green-500" /> Cam kết bảo mật 100% thông tin cá nhân khách hàng.
          </p>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
