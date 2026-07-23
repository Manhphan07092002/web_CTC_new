import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo: string;              // Logo chính (deprecated, dùng cho backward compatibility)
  logoHeader?: string;       // Logo Header riêng
  logoFooter?: string;       // Logo Footer riêng
  favicon?: string;          // Icon tab browser (32x32)
  appleTouchIcon?: string;   // Icon iOS (180x180)
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
  aiProvider?: 'gemini' | 'groq' | 'openai' | 'deepseek' | 'custom';
  aiApiKey?: string;
  aiModel?: string;
  aiBaseUrl?: string;
  aiTemperature?: number;
  aiSystemInstruction?: string;
  // Cấu hình Dynamic Header
  headerShowTopbar?: boolean;
  headerSlogan?: string;
  headerHotlineLabel?: string;
  headerHotlinePhone?: string;
  headerCtaText?: string;
  headerCtaLink?: string;
  headerNavLinks?: Array<{
    id: string;
    name: string;
    path: string;
    key?: string;
    order: number;
    submenu?: Array<{
      id: string;
      name: string;
      path: string;
    }>;
  }>;
}

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  siteName: 'CTC',
  siteDescription: 'Giải pháp EPC và Năng lượng tái tạo hàng đầu Việt Nam',
  logo: '/uploads/images/logo/logodo.png',
  email: 'info@ctcdn.vn',
  phone: '0236 3745 555',
  address: '50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng',
  facebook: 'https://facebook.com/ctcdn',
  instagram: 'https://instagram.com/ctcdn',
  youtube: 'https://youtube.com/@ctcdn',
  maintenance: false,
  notifyEmail: true,
  twoFactorAuth: false,
  currency: 'VND',
  taxRate: 10,
  aiEnabled: true,
  aiProvider: 'gemini',
  aiApiKey: '',
  aiModel: 'gemini-2.5-flash',
  aiBaseUrl: '',
  aiTemperature: 0.6,
  aiSystemInstruction: '',
  // Header Dynamic Defaults
  headerShowTopbar: true,
  headerSlogan: 'CTC – Nhà thầu EPC, Xây lắp điện và Giải pháp Năng lượng tái tạo tại Việt Nam',
  headerHotlineLabel: 'Hotline',
  headerHotlinePhone: '023 6374 5555',
  headerCtaText: 'LIÊN HỆ',
  headerCtaLink: 'https://zalo.me/0915059666',
  headerNavLinks: [
    { id: 'nav-1', name: 'Trang chủ', path: '/', key: 'home', order: 1 },
    { id: 'nav-2', name: 'Giới thiệu', path: '/about', key: 'about', order: 2 },
    { 
      id: 'nav-3', 
      name: 'Giải pháp', 
      path: '/solutions', 
      key: 'solutions', 
      order: 3,
      submenu: [
        { id: 'sub-3-1', name: 'GIẢI PHÁP TOÀN DIỆN', path: '/solutions' },
        { id: 'sub-3-2', name: 'HẠ TẦNG VIỄN THÔNG & CNTT', path: '/solutions/floating' },
        { id: 'sub-3-3', name: 'ĐIỆN MẶT TRỜI (SOLAR EPC)', path: '/solutions/rooftop' },
        { id: 'sub-3-4', name: 'ĐIỆN GIÓ (WIND POWER EPC)', path: '/solutions/farm' },
        { id: 'sub-3-5', name: 'ĐƯỜNG DÂY & TRẠM BIẾN ÁP 110KV', path: '/solutions/electrical' },
        { id: 'sub-3-6', name: 'DATA CENTER & HẠ TẦNG SỐ', path: '/solutions/datacenter' },
        { id: 'sub-3-7', name: 'XÂY DỰNG DÂN DỤNG & CÔNG NGHIỆP', path: '/solutions/construction' }
      ]
    },
    { 
      id: 'nav-4', 
      name: 'Sản phẩm', 
      path: '/products', 
      key: 'products', 
      order: 4,
      submenu: [] // Auto-synced from product categories DB at runtime
    },
    { id: 'nav-5', name: 'Dự án', path: '/projects', key: 'projects', order: 5 },
    { id: 'nav-6', name: 'Tin tức', path: '/news', key: 'news', order: 6 },
    { id: 'nav-7', name: 'Tài liệu', path: '/resources', key: 'resources', order: 7 },
    { id: 'nav-8', name: 'Liên hệ', path: '/contact', key: 'contact', order: 8 }
  ]
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if API fails
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      const updated = await api.settings.update(newSettings);
      if (updated) {
        setSettings(updated);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
