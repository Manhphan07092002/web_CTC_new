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
  
  // Fallback về Vietnamese (array gốc)
  return (item[field] as string[]) || [];
}

/**
 * Transform toàn bộ object với translations (with caching)
 * @param item - Object gốc
 * @param language - Ngôn ngữ cần dịch
 * @param fields - Danh sách fields cần dịch
 * @returns Object đã được dịch
 */
export function getTranslatedObject<T extends TranslatableItem>(
  item: T,
  language: Language,
  fields: (keyof T)[]
): T {
  if (language === 'vi') {
    return item; // Không cần transform
  }

  // Check cache
  const cacheKey = getCacheKey(item.id || item._id, language);
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  const translated = { ...item };

  fields.forEach(field => {
    const value = item[field];
    
    if (Array.isArray(value)) {
      (translated[field] as any) = getTranslatedArray(item, field, language);
    } else if (typeof value === 'string') {
      (translated[field] as any) = getTranslatedField(item, field, language);
    }
  });

  // Save to cache
  translationCache.set(cacheKey, translated);
  manageCacheSize();

  return translated;
}

/**
 * Transform Product với translations
 */
export function getTranslatedProduct(product: any, language: Language) {
  return getTranslatedObject(product, language, [
    'name',
    'description',
    'shortDescription',
    'specifications',
    'categoryLabel',
    'features'
  ]);
}

/**
 * Transform Project với translations
 */
export function getTranslatedProject(project: any, language: Language) {
  return getTranslatedObject(project, language, [
    'name',
    'description',
    'location',
    'client'
  ]);
}

/**
 * Transform News với translations
 */
export function getTranslatedNews(news: any, language: Language) {
  return getTranslatedObject(news, language, [
    'title',
    'content',
    'excerpt'
  ]);
}

/**
 * Transform Category với translations
 */
export function getTranslatedCategory(category: any, language: Language) {
  return getTranslatedObject(category, language, [
    'name',
    'description'
  ]);
}

/**
 * Batch transform array of items (optimized)
 */
export function getTranslatedList<T extends TranslatableItem>(
  items: T[],
  language: Language,
  fields: (keyof T)[]
): T[] {
  if (language === 'vi') return items; // No transformation needed
  return items.map(item => getTranslatedObject(item, language, fields));
}

/**
 * Clear translation cache (useful when language changes or data updates)
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats() {
  return {
    size: translationCache.size,
    limit: CACHE_SIZE_LIMIT,
    usage: `${((translationCache.size / CACHE_SIZE_LIMIT) * 100).toFixed(1)}%`
  };
}

/**
 * Check xem item có translation cho ngôn ngữ cụ thể không
 */
export function hasTranslation(
  item: TranslatableItem,
  language: Language
): boolean {
  if (language === 'vi') return true; // Vietnamese là default
  return !!(item.translations && item.translations[language]);
}

/**
 * Get translation completeness percentage
 */
export function getTranslationCompleteness(
  item: TranslatableItem,
  language: Language,
  requiredFields: string[]
): number {
  if (language === 'vi') return 100;
  
  if (!item.translations || !item.translations[language]) {
    return 0;
  }

  const translation = item.translations[language];
  const completedFields = requiredFields.filter(
    field => translation?.[field] && translation[field] !== ''
  );

  return Math.round((completedFields.length / requiredFields.length) * 100);
}

/**
 * Get available languages for an item
 */
export function getAvailableLanguages(item: TranslatableItem): Language[] {
  const languages: Language[] = ['vi']; // Vietnamese always available
  
  if (!item.translations) return languages;

  const translationKeys = Object.keys(item.translations) as Language[];
  return [...languages, ...translationKeys];
}

/**
 * React Hook for translated data with automatic caching
 */
export function useTranslatedData<T extends TranslatableItem>(
  item: T | null,
  fields: (keyof T)[],
  language: Language
): T | null {
  if (!item) return null;
  return getTranslatedObject(item, language, fields);
}

/**
 * Example usage:
 * 
 * const product = {
 *   id: '123',
 *   name: 'Tấm pin Canadian Solar 550W',
 *   description: 'Tấm pin hiệu suất cao',
 *   translations: {
 *     en: {
 *       name: 'Canadian Solar 550W Panel',
 *       description: 'High-efficiency solar panel'
 *     },
 *     ko: {
 *       name: 'Canadian Solar 550W 패널',
 *       description: '고효율 태양광 패널'
 *     }
 *   }
 * };
 * 
 * // Sử dụng với caching
 * const { language } = useLanguage();
 * const translatedProduct = getTranslatedProduct(product, language);
 * // Lần gọi thứ 2 với cùng product & language sẽ lấy từ cache
 * 
 * console.log(translatedProduct.name); // "Canadian Solar 550W Panel" (nếu language = 'en')
 * 
 * // Clear cache khi cần
 * clearTranslationCache();
 */
