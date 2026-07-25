/**
 * Translation Helper Utilities
 * Hỗ trợ đa ngôn ngữ cho dữ liệu động từ MongoDB
 * Optimized with caching for better performance
 */

import { Language } from '../contexts/LanguageContext';

// Cache for translated items to avoid repeated transformations
const translationCache = new Map<string, any>();
const CACHE_SIZE_LIMIT = 1000; // Giới hạn cache để tránh memory leak

// Helper to generate cache key
function getCacheKey(itemId: string | number, language: Language): string {
  return `${itemId}_${language}`;
}

// Clear cache if it gets too large
function manageCacheSize() {
  if (translationCache.size > CACHE_SIZE_LIMIT) {
    // Clear oldest 20% of entries
    const keysToDelete = Array.from(translationCache.keys()).slice(0, Math.floor(CACHE_SIZE_LIMIT * 0.2));
    keysToDelete.forEach(key => translationCache.delete(key));
  }
}

// Generic translation interface
export interface TranslationFields {
  name?: string;
  description?: string;
  shortDescription?: string;
  specifications?: string;
  features?: string[];
  categoryLabel?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  [key: string]: any;
}

export interface TranslatableItem {
  translations?: {
    en?: TranslationFields;
    ko?: TranslationFields;
    ja?: TranslationFields;
    zh?: TranslationFields;
    de?: TranslationFields;
  };
  [key: string]: any;
}

/**
 * Quick inline multi-language string getter supporting all 6 languages (vi, en, ko, ja, zh, de)
 */
export function getLangText<T = string>(
  language: Language,
  texts: { vi: T; en?: T; ko?: T; ja?: T; zh?: T; de?: T }
): T {
  if (language === 'vi') return texts.vi;
  if (texts[language]) return texts[language]!;
  return texts.en || texts.vi;
}

/**
 * Lấy giá trị field đã được dịch
 * @param item - Object chứa data (product, project, news, etc.)
 * @param field - Tên field cần dịch
 * @param language - Ngôn ngữ hiện tại
 * @returns Giá trị đã dịch hoặc fallback
 */
export function getTranslatedField<T extends TranslatableItem>(
  item: T,
  field: keyof T,
  language: Language
): string {
  // Nếu là tiếng Việt, trả về field gốc
  if (language === 'vi') {
    return (item[field] as string) || '';
  }
  
  // Tìm trong translations
  if (item.translations && item.translations[language]) {
    const translated = item.translations[language]?.[field as string];
    if (translated) return translated as string;
  }
  
  // Fallback về English
  if (language !== 'en' && item.translations?.en) {
    const translated = item.translations.en[field as string];
    if (translated) return translated as string;
  }
  
  // Fallback về Vietnamese (field gốc)
  return (item[field] as string) || '';
}

/**
 * Lấy array field đã được dịch (ví dụ: features)
 */
export function getTranslatedArray<T extends TranslatableItem>(
  item: T,
  field: keyof T,
  language: Language
): string[] {
  // Nếu là tiếng Việt, trả về array gốc
  if (language === 'vi') {
    return (item[field] as string[]) || [];
  }
  
  // Tìm trong translations
  if (item.translations && item.translations[language]) {
    const translated = item.translations[language]?.[field as string];
    if (translated && Array.isArray(translated)) return translated;
  }
  
  // Fallback về English
  if (language !== 'en' && item.translations?.en) {
    const translated = item.translations.en[field as string];
    if (translated && Array.isArray(translated)) return translated;
  }
  
  // Fallback về Vietnamese (field gốc)
  return (item[field] as string[]) || [];
}

/**
 * Tự động dịch một object (Product, Project, News, etc.)
 * Trả về object mới với các field đã được dịch
 * Sử dụng CACHE để tối ưu performance
 */
export function getTranslatedObject<T extends TranslatableItem>(
  item: T,
  language: Language,
  fieldsToTranslate: (keyof T)[] = ['name', 'description', 'title', 'content', 'excerpt']
): T {
  if (!item) return item;
  
  // Nếu là tiếng Việt, trả về item gốc
  if (language === 'vi') {
    return item;
  }
  
  // Thử lấy từ cache
  const itemId = item._id || item.id;
  if (itemId) {
    const cacheKey = getCacheKey(itemId, language);
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }
  }
  
  // Tạo object mới với các field đã dịch
  const translatedItem = { ...item };
  
  fieldsToTranslate.forEach(field => {
    if (field in item) {
      const val = item[field];
      if (Array.isArray(val)) {
        (translatedItem as any)[field] = getTranslatedArray(item, field, language);
      } else if (typeof val === 'string') {
        (translatedItem as any)[field] = getTranslatedField(item, field, language);
      }
    }
  });
  
  // Lưu vào cache
  if (itemId) {
    manageCacheSize();
    const cacheKey = getCacheKey(itemId, language);
    translationCache.set(cacheKey, translatedItem);
  }
  
  return translatedItem;
}

/**
 * Tự động dịch một danh sách các object
 * Sử dụng cache cho từng item
 */
export function getTranslatedList<T extends TranslatableItem>(
  items: T[],
  language: Language,
  fieldsToTranslate: (keyof T)[] = ['name', 'description', 'title', 'content', 'excerpt']
): T[] {
  if (!items || !Array.isArray(items)) return [];
  if (language === 'vi') return items;
  
  return items.map(item => getTranslatedObject(item, language, fieldsToTranslate));
}

/**
 * Clear translation cache
 * Sử dụng khi data thay đổi (create/update/delete)
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

export function getTranslatedProduct<T extends TranslatableItem>(item: T, language: Language): T {
  return getTranslatedObject(item, language);
}

export function getTranslatedProject<T extends TranslatableItem>(item: T, language: Language): T {
  return getTranslatedObject(item, language);
}

export function getTranslatedNews<T extends TranslatableItem>(item: T, language: Language): T {
  return getTranslatedObject(item, language);
}
