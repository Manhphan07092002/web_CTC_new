import { i18next } from '../i18n';
import fs from 'fs';
import path from 'path';

export interface TranslationStats {
  language: string;
  namespace: string;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  completionPercentage: number;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

// Supported languages with metadata
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false }
];

// Get language info by code
export function getLanguageInfo(code: string): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

// Get all available languages
export function getAvailableLanguages(): LanguageInfo[] {
  return SUPPORTED_LANGUAGES;
}

// Validate if language is supported
export function isLanguageSupported(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}

// Get translation with fallback
export function getTranslation(key: string, options: any = {}, language?: string): string {
  const currentLang = i18next.language;
  
  if (language && language !== currentLang) {
    i18next.changeLanguage(language);
  }
  
  const translation = i18next.t(key, options) as string;
  
  // Restore original language if changed
  if (language && language !== currentLang) {
    i18next.changeLanguage(currentLang);
  }
  
  return translation;
}

// Get translations for multiple keys
export function getTranslations(keys: string[], options: any = {}, language?: string): Record<string, string> {
  const translations: Record<string, string> = {};
  
  keys.forEach(key => {
    translations[key] = getTranslation(key, options, language);
  });
  
  return translations;
}

// Format error messages with i18n
export function formatError(errorKey: string, params: any = {}, language?: string): string {
  return getTranslation(`validation.${errorKey}`, params, language);
}

// Format success messages with i18n
export function formatSuccess(successKey: string, params: any = {}, language?: string): string {
  return getTranslation(`status.${successKey}`, params, language);
}

// Get localized date format
export function getLocalizedDate(date: Date, language?: string): string {
  const lang = language || i18next.language || 'vi';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat(lang, options).format(date);
}

// Get localized number format
export function getLocalizedNumber(number: number, language?: string): string {
  const lang = language || i18next.language || 'vi';
  return new Intl.NumberFormat(lang).format(number);
}

// Get localized currency format
export function getLocalizedCurrency(amount: number, currency: string = 'VND', language?: string): string {
  const lang = language || i18next.language || 'vi';
  
  return new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Load translation file
export function loadTranslationFile(language: string, namespace: string): any {
  const filePath = path.join(process.cwd(), 'locales', language, `${namespace}.json`);
  
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error loading translation file: ${filePath}`, error);
  }
  
  return {};
}

// Get all keys from an object recursively
function getAllKeys(obj: any, prefix: string = ''): string[] {
  let keys: string[] = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  
  return keys;
}

// Check translation completeness
export function checkTranslationCompleteness(language: string, namespace: string): TranslationStats {
  const baseTranslations = loadTranslationFile('vi', namespace); // Vietnamese as base
  const targetTranslations = loadTranslationFile(language, namespace);
  
  const baseKeys = getAllKeys(baseTranslations);
  const targetKeys = getAllKeys(targetTranslations);
  
  const missingKeys = baseKeys.filter(key => !targetKeys.includes(key));
  const translatedKeys = baseKeys.length - missingKeys.length;
  const completionPercentage = baseKeys.length > 0 ? Math.round((translatedKeys / baseKeys.length) * 100) : 0;
  
  return {
    language,
    namespace,
    totalKeys: baseKeys.length,
    translatedKeys,
    missingKeys,
    completionPercentage
  };
}

// Get translation stats for all languages and namespaces
export function getTranslationStats(): TranslationStats[] {
  const stats: TranslationStats[] = [];
  const namespaces = ['common', 'auth', 'products', 'projects', 'news', 'contact', 'calculator', 'admin'];
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    if (lang.code !== 'vi') { // Skip base language
      namespaces.forEach(namespace => {
        const stat = checkTranslationCompleteness(lang.code, namespace);
        stats.push(stat);
      });
    }
  });
  
  return stats;
}

// Express middleware to add i18n helpers to request
export function i18nHelpers(req: any, res: any, next: any) {
  req.i18n = {
    getTranslation: (key: string, options?: any) => getTranslation(key, options, req.language),
    getTranslations: (keys: string[], options?: any) => getTranslations(keys, options, req.language),
    formatError: (errorKey: string, params?: any) => formatError(errorKey, params, req.language),
    formatSuccess: (successKey: string, params?: any) => formatSuccess(successKey, params, req.language),
    getLocalizedDate: (date: Date) => getLocalizedDate(date, req.language),
    getLocalizedNumber: (number: number) => getLocalizedNumber(number, req.language),
    getLocalizedCurrency: (amount: number, currency?: string) => getLocalizedCurrency(amount, currency, req.language),
    getLanguageInfo: () => getLanguageInfo(req.language),
    isLanguageSupported: (code: string) => isLanguageSupported(code),
    // Enhanced helpers for database integration
    invalidateCache: (language?: string, namespace?: string, key?: string) => {
      const { enhancedBackend } = require('../i18n');
      enhancedBackend.invalidateCache(language, namespace, key);
    },
    getCacheStats: () => {
      const { enhancedBackend } = require('../i18n');
      return enhancedBackend.getCacheStats();
    },
    preloadTranslations: async (language?: string, namespace?: string) => {
      const { enhancedBackend } = require('../i18n');
      return enhancedBackend.preload(language, namespace);
    }
  };
  
  next();
}
