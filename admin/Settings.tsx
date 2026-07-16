import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Globe, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
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
}

const Settings: React.FC = () => {
  const { showToast } = useToast();
  const { refreshSettings } = useSettings();
  const { hasPermission, hasMinRoleLevel } = usePermission();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<'logo' | 'logoHeader' | 'logoFooter' | 'favicon' | 'appleTouchIcon'>('logo');
  
  const [formData, setFormData] = useState<SettingsData>({
    siteName: 'Tran Le Electricity',
    siteDescription: 'Giải pháp năng lượng mặt trời hàng đầu Việt Nam',
    logo: '/uploads/images/logo/logodo.png',
    logoHeader: '',
    logoFooter: '',
    favicon: '',
    appleTouchIcon: '',
    email: 'info@tranle.com',
    phone: '0236 656 2020',
    address: '259 Thế Lữ, An Hải Bắc, Sơn Trà, Đà Nẵng',
    facebook: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    maintenance: false,
    notifyEmail: true,
    twoFactorAuth: false,
    currency: 'VND',
    taxRate: 10
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
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Lỗi khi lưu cài đặt', 'error');
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
