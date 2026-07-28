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
  aiEnabled?: boolean;
  aiApiKey?: string;
  aiModel?: string;
  aiTemperature?: number;
  aiSystemInstruction?: string;
  aiProvider?: string;
  aiBaseUrl?: string;
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
    siteDescription: 'Giáº£i phÃ¡p EPC vÃ  NÄƒng lÆ°á»£ng tÃ¡i táº¡o hÃ ng Ä‘áº§u Viá»‡t Nam',
    logo: '/uploads/images/logo/logodo.png',
    logoHeader: '',
    logoFooter: '',
    favicon: '',
    appleTouchIcon: '',
    email: 'info@ctcdn.vn',
    phone: '0236 3745 555',
    address: '50B Nguyá»…n Du, PhÆ°á»ng Tháº¡ch Thang, Quáº­n Háº£i ChÃ¢u, TP ÄÃ  Náºµng',
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

  const sanitizeUrls = (data: any) => {
    if (!data) return data;
    const cleaned = { ...data };
    const urlFields: Array<keyof SettingsData> = ['logo', 'logoHeader', 'logoFooter', 'favicon', 'appleTouchIcon'];
    for (const field of urlFields) {
      if (typeof cleaned[field] === 'string' && cleaned[field]) {
        (cleaned[field] as string) = (cleaned[field] as string).replace(/^https?:\/\/[^\/]+/, '');
      }
    }
    return cleaned;
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.settings.get();
      if (data) {
        setFormData(sanitizeUrls(data));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Lá»—i khi táº£i cÃ i Ä‘áº·t', 'error');
    }
    setLoading(false);
  };

  const handleImageSelect = (url: string) => {
    const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '');
    setFormData({ ...formData, [imagePickerTarget]: cleanUrl });
    setShowImagePicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.siteName || !formData.email || !formData.phone || !formData.address) {
      showToast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.settings.update(formData);
      await refreshSettings(); // Refresh global settings context
      showToast('Cáº­p nháº­t cÃ i Ä‘áº·t thÃ nh cÃ´ng!', 'success');
      
      // Show special message if maintenance mode changed
      if (formData.maintenance) {
        showToast('âš ï¸ Cháº¿ Ä‘á»™ báº£o trÃ¬ Ä‘Ã£ Báº¬T - Website cÃ´ng khai sáº½ hiá»ƒn thá»‹ trang báº£o trÃ¬', 'info');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      const msg = error?.message || '';
      if (msg.includes('Unauthorized') || msg.includes('401') || msg.includes('Token')) {
        showToast('ðŸ”’ PhiÃªn Ä‘Äƒng nháº­p Ä‘Ã£ háº¿t háº¡n hoáº·c chÆ°a cÃ³ Token. Vui lÃ²ng Ä‘Äƒng xuáº¥t vÃ  Ä‘Äƒng nháº­p láº¡i Admin.', 'error');
      } else {
        showToast(`Lá»—i khi lÆ°u cÃ i Ä‘áº·t: ${msg || 'KhÃ´ng thá»ƒ lÆ°u'}`, 'error');
      }
    }
    setSaving(false);
  };

  // Check permissions
  if (!hasPermission('view_system_settings') && !hasMinRoleLevel(90)) {
    return (
      <AccessDenied 
        message="Báº¡n cáº§n quyá»n 'view_system_settings' hoáº·c vai trÃ² level 90+ Ä‘á»ƒ truy cáº­p trang cÃ i Ä‘áº·t"
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">CÃ i Ä‘áº·t Há»‡ thá»‘ng</h1>
          <p className="text-gray-500 mt-1">Quáº£n lÃ½ thÃ´ng tin vÃ  cáº¥u hÃ¬nh website</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-primary" />
            ThÃ´ng tin chung
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                TÃªn website <span className="text-red-500">*</span>
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
                MÃ´ táº£ website <span className="text-red-500">*</span>
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
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-primary" />
            Logo & Biá»ƒu tÆ°á»£ng
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Main Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Logo chÃ­nh</label>
              <div className="space-y-2">
                {formData.logo && (
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-900/60">
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
                  Chá»n logo
                </button>
              </div>
            </div>

            {/* Header Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Logo Header</label>
              <div className="space-y-2">
                {formData.logoHeader && (
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-900/60">
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
                  Chá»n logo header
                </button>
              </div>
            </div>

            {/* Footer Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Logo Footer</label>
              <div className="space-y-2">
                {formData.logoFooter && (
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-900/60">
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
                  Chá»n logo footer
                </button>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Favicon (32x32)</label>
              <div className="space-y-2">
                {formData.favicon && (
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-900/60">
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
                  Chá»n favicon
                </button>
              </div>
            </div>

            {/* Apple Touch Icon */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Apple Touch Icon (180x180)</label>
              <div className="space-y-2">
                {formData.appleTouchIcon && (
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-900/60">
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
                  Chá»n icon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Phone size={20} className="text-primary" />
            ThÃ´ng tin liÃªn há»‡
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
                Sá»‘ Ä‘iá»‡n thoáº¡i <span className="text-red-500">*</span>
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
              Äá»‹a chá»‰ <span className="text-red-500">*</span>
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
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Máº¡ng xÃ£ há»™i</h2>
          
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
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">CÃ i Ä‘áº·t há»‡ thá»‘ng</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/60 rounded-xl">
              <div>
                <h3 className="font-bold text-gray-800">Cháº¿ Ä‘á»™ báº£o trÃ¬</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Táº¡m thá»i Ä‘Ã³ng website Ä‘á»ƒ báº£o trÃ¬</p>
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

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/60 rounded-xl">
              <div>
                <h3 className="font-bold text-gray-800">ThÃ´ng bÃ¡o Email</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nháº­n thÃ´ng bÃ¡o qua email khi cÃ³ liÃªn há»‡ má»›i</p>
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

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/60 rounded-xl">
              <div>
                <h3 className="font-bold text-gray-800">XÃ¡c thá»±c 2 yáº¿u tá»‘</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">TÄƒng cÆ°á»ng báº£o máº­t tÃ i khoáº£n admin</p>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">ÄÆ¡n vá»‹ tiá»n tá»‡</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="VND">VND (â‚«)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (â‚¬)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Thuáº¿ VAT (%)</label>
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
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Bot size={22} className="text-primary" />
              Cáº¥u hÃ¬nh AI Chatbot & Nhiá»u NhÃ  Cung Cáº¥p API (Multi-Provider AI)
            </h2>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
              <Sparkles size={14} /> Gemini â€¢ Groq â€¢ OpenAI â€¢ DeepSeek
            </span>
          </div>

          <div className="space-y-4">
            {/* Toggle AI Enabled */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-sky-50/50 border border-blue-100 rounded-xl">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Cpu size={18} className="text-primary" /> KÃ­ch hoáº¡t Trá»£ LÃ½ AI Chatbot
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Báº­t hoáº·c táº¯t tÃ­nh nÄƒng Chatbot tÆ° váº¥n khÃ¡ch hÃ ng tá»± Ä‘á»™ng trÃªn toÃ n website</p>
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
                  <Globe size={16} className="text-primary" /> NhÃ  Cung Cáº¥p AI (AI Provider)
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
                  <option value="gemini">âœ¨ Google Gemini AI (Miá»…n phÃ­ & Pháº£n há»“i nhanh)</option>
                  <option value="groq">âš¡ Groq Cloud AI (SiÃªu tá»‘c Ä‘á»™ - Llama 3.3 / DeepSeek R1)</option>
                  <option value="openai">ðŸ¤– OpenAI (ChatGPT - GPT-4o / GPT-4o-mini)</option>
                  <option value="deepseek">ðŸ³ DeepSeek AI (ChÃ­nh xÃ¡c & Tiáº¿t kiá»‡m)</option>
                  <option value="custom">ðŸ› ï¸ Custom Endpoint API (OpenAI Compatible API)</option>
                </select>
              </div>

              {/* Model Select */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Cpu size={16} className="text-primary" /> Máº«u MÃ´ HÃ¬nh (Model Name)
                </label>
                {(formData.aiProvider || 'gemini') === 'gemini' && (
                  <select
                    value={formData.aiModel || 'gemini-2.5-flash'}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (KhuyÃªn dÃ¹ng - Nhanh & ThÃ´ng minh)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (TÆ° váº¥n chuyÃªn sÃ¢u)</option>
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
                    <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (SiÃªu tá»‘c & ThÃ´ng minh)</option>
                    <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Pháº£n há»“i tá»©c thÃ¬)</option>
                    <option value="deepseek-r1-distill-llama-70b">deepseek-r1-distill-llama-70b (Suy luáº­n cao cáº¥p)</option>
                    <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                  </select>
                )}

                {(formData.aiProvider || 'gemini') === 'openai' && (
                  <select
                    value={formData.aiModel || 'gpt-4o-mini'}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Nhanh & Ráº»)</option>
                    <option value="gpt-4o">gpt-4o (ThÃ´ng minh nháº¥t)</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  </select>
                )}

                {(formData.aiProvider || 'gemini') === 'deepseek' && (
                  <select
                    value={formData.aiModel || 'deepseek-chat'}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
                  >
                    <option value="deepseek-chat">deepseek-chat (V3 - Chuáº©n tÆ° váº¥n)</option>
                    <option value="deepseek-reasoner">deepseek-reasoner (R1 - Suy luáº­n)</option>
                  </select>
                )}

                {(formData.aiProvider || 'gemini') === 'custom' && (
                  <input
                    type="text"
                    value={formData.aiModel || ''}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    placeholder="Nháº­p tÃªn Model (VÃ­ dá»¥: llama3, mistral, custom-model)"
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
                  placeholder="https://api.groq.com/openai/v1 hoáº·c https://your-domain.com/v1"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            )}

            {/* API Key Field (Multi-Key Pool) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1.5">
                  <Key size={16} className="text-amber-500" />
                  Danh sÃ¡ch API Key (Nháº­p 1 hoáº·c nhiá»u Key)
                  <span className="bg-amber-100 text-amber-800 text-[11px] px-2 py-0.5 rounded-full font-bold">
                    ðŸ”„ Tá»± Ä‘á»™ng Ä‘á»•i Key khi háº¿t Quota
                  </span>
                </span>
                
                {/* Dynamic get API key link */}
                {(formData.aiProvider || 'gemini') === 'groq' && (
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">
                    Láº¥y Groq API Key miá»…n phÃ­ táº¡i console.groq.com &rarr;
                  </a>
                )}
                {(formData.aiProvider || 'gemini') === 'gemini' && (
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">
                    Láº¥y Gemini API Key miá»…n phÃ­ táº¡i Google AI Studio &rarr;
                  </a>
                )}
                {(formData.aiProvider || 'gemini') === 'openai' && (
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">
                    Láº¥y OpenAI API Key táº¡i platform.openai.com &rarr;
                  </a>
                )}
                {(formData.aiProvider || 'gemini') === 'deepseek' && (
                  <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">
                    Láº¥y DeepSeek API Key táº¡i platform.deepseek.com &rarr;
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
                  title={showApiKey ? "áº¨n bá»›t Ä‘á»™ nhÃ¬n" : "Xem API Key"}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ðŸ’¡ <strong>Máº¹o chá»‘ng giÃ¡n Ä‘oáº¡n:</strong> Báº¡n cÃ³ thá»ƒ nháº­p nhiá»u API Key (má»—i Key 1 dÃ²ng hoáº·c cÃ¡ch nhau báº±ng dáº¥u pháº©y <code>,</code>). Khi 1 Key bá»‹ háº¿t Quota hoáº·c giá»›i háº¡n sá»‘ request (HTTP 429), há»‡ thá»‘ng sáº½ <strong>tá»± Ä‘á»™ng chuyá»ƒn sang Key tiáº¿p theo</strong> ngay láº­p tá»©c!
              </p>
            </div>

            {/* Temperature Slider */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders size={16} className="text-sky-500" /> Nhiá»‡t Ä‘á»™ sÃ¡ng táº¡o (Temperature)
                </span>
                <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                  {formData.aiTemperature ?? 0.6}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium">0.0 (ChÃ­nh xÃ¡c)</span>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={formData.aiTemperature ?? 0.6}
                  onChange={(e) => setFormData({ ...formData, aiTemperature: parseFloat(e.target.value) })}
                  className="flex-1 accent-primary h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs text-gray-400 font-medium">1.0 (SÃ¡ng táº¡o)</span>
              </div>
            </div>

            {/* System Prompt / Instructions */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-500" /> Ká»‹ch báº£n chá»‰ dáº«n AI (System Prompt)
              </label>
              <textarea
                value={formData.aiSystemInstruction || ''}
                onChange={(e) => setFormData({ ...formData, aiSystemInstruction: e.target.value })}
                rows={5}
                placeholder="VÃ­ dá»¥: Báº¡n lÃ  trá»£ lÃ½ tÆ° váº¥n chuyÃªn nghiá»‡p cá»§a CTC Solar. Nhiá»‡m vá»¥ cá»§a báº¡n lÃ  giáº£i Ä‘Ã¡p cÃ¢u há»i cá»§a khÃ¡ch hÃ ng vá» Ä‘iá»‡n máº·t trá»i..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-sans text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">ðŸ’¡ Äá»‹nh hÃ¬nh phong cÃ¡ch tráº£ lá»i, thÃ´ng tin giÃ¡ cáº£, sá»‘ Hotline vÃ  ká»‹ch báº£n chá»‘t sale cá»§a AI Chatbot.</p>
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
                Äang lÆ°u...
              </>
            ) : (
              <>
                <Save size={20} />
                LÆ°u cÃ i Ä‘áº·t
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

