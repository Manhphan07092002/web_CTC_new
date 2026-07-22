import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Globe, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin, Bot, Key, Eye, EyeOff, Sparkles, Cpu, Sliders } from 'lucide-react';
import FilePickerModal from './FilePickerModal';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { usePermission } from '../contexts/PermissionContext';
import AccessDenied from '../components/AccessDenied';

interface SettingsData {
  siteName: string;
  siteDescription: string;
  logo: string;
  logoHeader?: string;
  logoFooter?: string;
  favicon?: string;
  appleTouchIcon?: string;
  email: string;
  phone: string;
  address: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  maintenance: boolean;
  notifyEmail: boolean;
  twoFactorAuth: boolean;
  currency: string;
  taxRate: number;
  // Cấu hình AI Chatbot
  aiEnabled?: boolean;
  aiApiKey?: string;
  aiModel?: string;
  aiTemperature?: number;
  aiSystemInstruction?: string;
}

const Settings: React.FC = () => {
  const { showToast } = useToast();
  const { refreshSettings } = useSettings();
  const { hasPermission, hasMinRoleLevel } = usePermission();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<'logo' | 'logoHeader' | 'logoFooter' | 'favicon' | 'appleTouchIcon'>('logo');
  
  const [formData, setFormData] = useState<SettingsData>({
    siteName: 'CTC',
    siteDescription: 'Giải pháp EPC và Năng lượng tái tạo hàng đầu Việt Nam',
    logo: '/uploads/images/logo/logodo.png',
    logoHeader: '',
    logoFooter: '',
    favicon: '',
    appleTouchIcon: '',
    email: 'info@ctcdn.vn',
    phone: '0236 3745 555',
    address: '50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng',
    facebook: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    maintenance: false,
    notifyEmail: true,
    twoFactorAuth: false,
    currency: 'VND',
    taxRate: 10,
    aiEnabled: true,
    aiApiKey: '',
    aiModel: 'gemini-2.5-flash',
    aiTemperature: 0.6,
    aiSystemInstruction: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.settings.get();
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Lỗi khi tải cài đặt', 'error');
    }
    setLoading(false);
  };

  const handleImageSelect = (url: string) => {
    setFormData({ ...formData, [imagePickerTarget]: url });
    setShowImagePicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.siteName || !formData.email || !formData.phone || !formData.address) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.settings.update(formData);
      await refreshSettings(); // Refresh global settings context
      showToast('Cập nhật cài đặt thành công!', 'success');
      
      // Show special message if maintenance mode changed
      if (formData.maintenance) {
        showToast('⚠️ Chế độ bảo trì đã BẬT - Website công khai sẽ hiển thị trang bảo trì', 'info');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      const msg = error?.message || '';
      if (msg.includes('Unauthorized') || msg.includes('401') || msg.includes('Token')) {
        showToast('🔒 Phiên đăng nhập đã hết hạn hoặc chưa có Token. Vui lòng đăng xuất và đăng nhập lại Admin.', 'error');
      } else {
        showToast(`Lỗi khi lưu cài đặt: ${msg || 'Không thể lưu'}`, 'error');
      }
    }
    setSaving(false);
  };

  // Check permissions
  if (!hasPermission('view_system_settings') && !hasMinRoleLevel(90)) {
    return (
      <AccessDenied 
        message="Bạn cần quyền 'view_system_settings' hoặc vai trò level 90+ để truy cập trang cài đặt"
        requiredPermission="view_system_settings"
        requiredLevel={90}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cài đặt Hệ thống</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin và cấu hình website</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-primary" />
            Thông tin chung
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên website <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mô tả website <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.siteDescription}
                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Logos & Icons */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-primary" />
            Logo & Biểu tượng
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Main Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Logo chính</label>
              <div className="space-y-2">
                {formData.logo && (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <img src={formData.logo} alt="Logo" className="h-12 object-contain mx-auto" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setImagePickerTarget('logo');
                    setShowImagePicker(true);
                  }}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Chọn logo
                </button>
              </div>
            </div>

            {/* Header Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Logo Header</label>
              <div className="space-y-2">
                {formData.logoHeader && (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <img src={formData.logoHeader} alt="Logo Header" className="h-12 object-contain mx-auto" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setImagePickerTarget('logoHeader');
                    setShowImagePicker(true);
                  }}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Chọn logo header
                </button>
              </div>
            </div>

            {/* Footer Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Logo Footer</label>
              <div className="space-y-2">
                {formData.logoFooter && (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <img src={formData.logoFooter} alt="Logo Footer" className="h-12 object-contain mx-auto" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setImagePickerTarget('logoFooter');
                    setShowImagePicker(true);
                  }}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Chọn logo footer
                </button>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Favicon (32x32)</label>
              <div className="space-y-2">
                {formData.favicon && (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <img src={formData.favicon} alt="Favicon" className="h-8 w-8 object-contain mx-auto" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setImagePickerTarget('favicon');
                    setShowImagePicker(true);
                  }}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Chọn favicon
                </button>
              </div>
            </div>

            {/* Apple Touch Icon */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Apple Touch Icon (180x180)</label>
              <div className="space-y-2">
                {formData.appleTouchIcon && (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <img src={formData.appleTouchIcon} alt="Apple Touch Icon" className="h-12 w-12 object-contain mx-auto rounded-xl" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setImagePickerTarget('appleTouchIcon');
                    setShowImagePicker(true);
                  }}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Chọn icon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Phone size={20} className="text-primary" />
            Thông tin liên hệ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Mail size={16} className="inline mr-1" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Phone size={16} className="inline mr-1" />
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Mạng xã hội</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Facebook size={16} className="inline mr-1 text-blue-600" />
                Facebook
              </label>
              <input
                type="url"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Instagram size={16} className="inline mr-1 text-pink-600" />
                Instagram
              </label>
              <input
                type="url"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Youtube size={16} className="inline mr-1 text-red-600" />
                YouTube
              </label>
              <input
                type="url"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="https://youtube.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Linkedin size={16} className="inline mr-1 text-blue-700" />
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="https://linkedin.com/..."
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Cài đặt hệ thống</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-bold text-gray-800">Chế độ bảo trì</h3>
                <p className="text-sm text-gray-500">Tạm thời đóng website để bảo trì</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, maintenance: !formData.maintenance })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.maintenance ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.maintenance ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-bold text-gray-800">Thông báo Email</h3>
                <p className="text-sm text-gray-500">Nhận thông báo qua email khi có liên hệ mới</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, notifyEmail: !formData.notifyEmail })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.notifyEmail ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.notifyEmail ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-bold text-gray-800">Xác thực 2 yếu tố</h3>
                <p className="text-sm text-gray-500">Tăng cường bảo mật tài khoản admin</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, twoFactorAuth: !formData.twoFactorAuth })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.twoFactorAuth ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.twoFactorAuth ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Đơn vị tiền tệ</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="VND">VND (₫)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Thuế VAT (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Chatbot & Multi-Provider API Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Bot size={22} className="text-primary" />
              Cấu hình AI Chatbot & Nhiều Nhà Cung Cấp API (Multi-Provider AI)
            </h2>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
              <Sparkles size={14} /> Gemini • Groq • OpenAI • DeepSeek
            </span>
          </div>

          <div className="space-y-4">
            {/* Toggle AI Enabled */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-sky-50/50 border border-blue-100 rounded-xl">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Cpu size={18} className="text-primary" /> Kích hoạt Trợ Lý AI Chatbot
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Bật hoặc tắt tính năng Chatbot tư vấn khách hàng tự động trên toàn website</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, aiEnabled: !formData.aiEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.aiEnabled ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.aiEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Provider & Model Select Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider Select */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Globe size={16} className="text-primary" /> Nhà Cung Cấp AI (AI Provider)
                </label>
                <select
                  value={formData.aiProvider || 'gemini'}
                  onChange={(e) => {
                    const provider = e.target.value as any;
                    const defaultModels: Record<string, string> = {
                      gemini: 'gemini-2.5-flash',
                      groq: 'llama-3.3-70b-versatile',
                      openai: 'gpt-4o-mini',
                      deepseek: 'deepseek-chat',
                      custom: 'llama-3.3-70b-versatile'
                    };
                    setFormData({ 
                      ...formData, 
                      aiProvider: provider,
                      aiModel: defaultModels[provider] || 'gemini-2.5-flash'
                    });
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-bold text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                >
                  <option value="gemini">✨ Google Gemini AI (Miễn phí & Phản hồi nhanh)</option>
                  <option value="groq">⚡ Groq Cloud AI (Siêu tốc độ - Llama 3.3 / DeepSeek R1)</option>
                  <option value="openai">🤖 OpenAI (ChatGPT - GPT-4o / GPT-4o-mini)</option>
                  <option value="deepseek">🐳 DeepSeek AI (Chính xác & Tiết kiệm)</option>
                  <option value="custom">🛠️ Custom Endpoint API (OpenAI Compatible API)</option>
                </select>
              </div>

              {/* Model Select */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Cpu size={16} className="text-primary" /> Mẫu Mô Hình (Model Name)
                </label>
                {(formData.aiProvider || 'gemini') === 'gemini' && (
                  <select
                    value={formData.aiModel || 'gemini-2.5-flash'}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Khuyên dùng - Nhanh & Thông minh)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Tư vấn chuyên sâu)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  </select>
                )}

                {(formData.aiProvider || 'gemini') === 'groq' && (
                  <select
                    value={formData.aiModel || 'llama-3.3-70b-versatile'}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
                  >
                    <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Siêu tốc & Thông minh)</option>
                    <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Phản hồi tức thì)</option>
                    <option value="deepseek-r1-distill-llama-70b">deepseek-r1-distill-llama-70b (Suy luận cao cấp)</option>
                    <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                  </select>
                )}

                {(formData.aiProvider || 'gemini') === 'openai' && (
                  <select
                    value={formData.aiModel || 'gpt-4o-mini'}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Nhanh & Rẻ)</option>
                    <option value="gpt-4o">gpt-4o (Thông minh nhất)</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  </select>
                )}

                {(formData.aiProvider || 'gemini') === 'deepseek' && (
                  <select
                    value={formData.aiModel || 'deepseek-chat'}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
                  >
                    <option value="deepseek-chat">deepseek-chat (V3 - Chuẩn tư vấn)</option>
                    <option value="deepseek-reasoner">deepseek-reasoner (R1 - Suy luận)</option>
                  </select>
                )}

                {(formData.aiProvider || 'gemini') === 'custom' && (
                  <input
                    type="text"
                    value={formData.aiModel || ''}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    placeholder="Nhập tên Model (Ví dụ: llama3, mistral, custom-model)"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                )}
              </div>
            </div>

            {/* Custom Base URL (If Custom or custom endpoint) */}
            {formData.aiProvider === 'custom' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Globe size={16} className="text-primary" /> API Base URL Endpoint
                </label>
                <input
                  type="url"
                  value={formData.aiBaseUrl || ''}
                  onChange={(e) => setFormData({ ...formData, aiBaseUrl: e.target.value })}
                  placeholder="https://api.groq.com/openai/v1 hoặc https://your-domain.com/v1"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            )}

            {/* API Key Field (Multi-Key Pool) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1.5">
                  <Key size={16} className="text-amber-500" />
                  Danh sách API Key (Nhập 1 hoặc nhiều Key)
                  <span className="bg-amber-100 text-amber-800 text-[11px] px-2 py-0.5 rounded-full font-bold">
                    🔄 Tự động đổi Key khi hết Quota
                  </span>
                </span>
                
                {/* Dynamic get API key link */}
                {(formData.aiProvider || 'gemini') === 'groq' && (
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">
                    Lấy Groq API Key miễn phí tại console.groq.com &rarr;
                  </a>
                )}
                {(formData.aiProvider || 'gemini') === 'gemini' && (
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">
                    Lấy Gemini API Key miễn phí tại Google AI Studio &rarr;
                  </a>
                )}
                {(formData.aiProvider || 'gemini') === 'openai' && (
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">
                    Lấy OpenAI API Key tại platform.openai.com &rarr;
                  </a>
                )}
                {(formData.aiProvider || 'gemini') === 'deepseek' && (
                  <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">
                    Lấy DeepSeek API Key tại platform.deepseek.com &rarr;
                  </a>
                )}
              </label>

              <div className="relative">
                <textarea
                  value={formData.aiApiKey || ''}
                  onChange={(e) => setFormData({ ...formData, aiApiKey: e.target.value })}
                  rows={3}
                  placeholder={
                    (formData.aiProvider || 'gemini') === 'groq' ? "gsk_key1...\ngsk_key2...\ngsk_key3..." :
                    (formData.aiProvider || 'gemini') === 'openai' ? "sk-key1...\nsk-key2..." :
                    (formData.aiProvider || 'gemini') === 'deepseek' ? "sk-key1...\nsk-key2..." :
                    "AIzaSy_key1...\nAIzaSy_key2..."
                  }
                  className="w-full border border-gray-300 rounded-xl pl-4 pr-11 py-2.5 font-mono text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1"
                  title={showApiKey ? "Ẩn bớt độ nhìn" : "Xem API Key"}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 <strong>Mẹo chống gián đoạn:</strong> Bạn có thể nhập nhiều API Key (mỗi Key 1 dòng hoặc cách nhau bằng dấu phẩy <code>,</code>). Khi 1 Key bị hết Quota hoặc giới hạn số request (HTTP 429), hệ thống sẽ <strong>tự động chuyển sang Key tiếp theo</strong> ngay lập tức!
              </p>
            </div>

            {/* Temperature Slider */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders size={16} className="text-sky-500" /> Nhiệt độ sáng tạo (Temperature)
                </span>
                <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                  {formData.aiTemperature ?? 0.6}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium">0.0 (Chính xác)</span>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={formData.aiTemperature ?? 0.6}
                  onChange={(e) => setFormData({ ...formData, aiTemperature: parseFloat(e.target.value) })}
                  className="flex-1 accent-primary h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs text-gray-400 font-medium">1.0 (Sáng tạo)</span>
              </div>
            </div>

            {/* System Prompt / Instructions */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-500" /> Kịch bản chỉ dẫn AI (System Prompt)
              </label>
              <textarea
                value={formData.aiSystemInstruction || ''}
                onChange={(e) => setFormData({ ...formData, aiSystemInstruction: e.target.value })}
                rows={5}
                placeholder="Ví dụ: Bạn là trợ lý tư vấn chuyên nghiệp của CTC Solar. Nhiệm vụ của bạn là giải đáp câu hỏi của khách hàng về điện mặt trời..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-sans text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">💡 Định hình phong cách trả lời, thông tin giá cả, số Hotline và kịch bản chốt sale của AI Chatbot.</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-secondary font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={20} />
                Lưu cài đặt
              </>
            )}
          </button>
        </div>
      </form>

      {/* Image Picker Modal */}
      <FilePickerModal
        isOpen={showImagePicker}
        onSelect={handleImageSelect}
        onClose={() => setShowImagePicker(false)}
      />
    </div>
  );
};

export default Settings;
