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
  aiSystemInstruction: ''
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
