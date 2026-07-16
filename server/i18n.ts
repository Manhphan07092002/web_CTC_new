import i18next from 'i18next';
import * as middleware from 'i18next-http-middleware';
import path from 'path';
import { EnhancedI18nBackend } from './utils/i18n-backend-enhanced';
import { translationCache } from './utils/translation-cache';

// Initialize enhanced backend
const enhancedBackend = new EnhancedI18nBackend();

i18next
  .use(enhancedBackend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'vi',
    preload: ['vi', 'en', 'ko', 'ja', 'zh', 'de', 'fr', 'es'],
    ns: ['common', 'auth', 'products', 'projects', 'news', 'contact', 'calculator', 'admin', 'home', 'dynamic'],
    defaultNS: 'common',
    backend: {
      loadPath: path.join(process.cwd(), 'locales/{{lng}}/{{ns}}.json'),
      useDatabase: true,
      cacheEnabled: true,
      fallbackToFiles: true
    },
    detection: {
      order: ['querystring', 'cookie', 'header'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupHeader: 'accept-language',
      caches: ['cookie']
    },
    interpolation: {
      escapeValue: false
    },
    saveMissing: true,
    missingKeyHandler: (lng: string[], ns: string, key: string, fallbackValue: string) => {
      console.warn(`Missing translation key: ${lng}.${ns}.${key}`);
    },
    // Enhanced options
    debug: process.env.NODE_ENV === 'development',
    load: 'languageOnly', // Load only language, not region
    cleanCode: true,
    initImmediate: false // Wait for backend initialization
  })
  .then(() => {
    console.log('🌐 Enhanced i18n system initialized successfully');
    console.log(`📊 Cache stats: ${JSON.stringify(translationCache.getStats())}`);
  })
  .catch((error) => {
    console.error('❌ Enhanced i18n initialization failed:', error);
  });

// Export enhanced backend instance for cache management
export { i18next, middleware, enhancedBackend, translationCache };
