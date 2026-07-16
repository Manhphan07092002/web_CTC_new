import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../../models';

// Dynamic import for ESM module
let translate: any = null;

const loadTranslate = async () => {
  if (!translate) {
    const module = await import('@vitalets/google-translate-api');
    translate = module.translate;
  }
  return translate;
};

// Language codes mapping
const GOOGLE_LANG_CODES: Record<SupportedLanguage, string> = {
  vi: 'vi',
  en: 'en',
  ko: 'ko',
  ja: 'ja',
  zh: 'zh-CN',
  de: 'de'
};

// Cache to avoid duplicate translations
const translationCache = new Map<string, any>();

// Delimiter for batch translation
const DELIMITER = ' ||| ';

// Rate limit tracking
let lastRateLimitTime: number = 0;
const RATE_LIMIT_COOLDOWN = 10 * 60 * 1000; // 10 minutes cooldown after rate limit

/**
 * Check if we're in rate limit cooldown
 */
export function isRateLimited(): boolean {
  if (lastRateLimitTime === 0) return false;
  const elapsed = Date.now() - lastRateLimitTime;
  return elapsed < RATE_LIMIT_COOLDOWN;
}

/**
 * Get remaining cooldown time in seconds
 */
export function getRateLimitCooldown(): number {
  if (!isRateLimited()) return 0;
  return Math.ceil((RATE_LIMIT_COOLDOWN - (Date.now() - lastRateLimitTime)) / 1000);
}

/**
 * Reset rate limit (call after successful translation or cooldown period)
 */
export function resetRateLimit(): void {
  lastRateLimitTime = 0;
}

/**
 * Translate batch text (all fields in ONE request per language)
 */
async function translateBatch(texts: string[], from: string, to: string, retries = 2): Promise<string[]> {
  if (texts.length === 0) return [];
  
  // Skip if rate limited
  if (isRateLimited()) {
    console.log(`⏳ Skipping translation - cooldown ${getRateLimitCooldown()}s remaining`);
    return texts;
  }
  
  // Join all texts with delimiter
  const combined = texts.join(DELIMITER);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const translateFn = await loadTranslate();
      const result = await translateFn(combined, { from, to });
      
      // Success! Reset rate limit tracking
      resetRateLimit();
      
      // Split back into array
      const translated = result.text.split(DELIMITER).map((t: string) => t.trim());
      
      // Ensure same length
      if (translated.length === texts.length) {
        return translated;
      }
      // Fallback: return originals if split failed
      console.warn('⚠️ Split mismatch, using originals');
      return texts;
      
    } catch (error: any) {
      if (error?.name === 'TooManyRequestsError') {
        lastRateLimitTime = Date.now();
        console.log(`🚫 Rate limited! Cooldown for ${RATE_LIMIT_COOLDOWN/60000} minutes`);
        return texts; // Return originals immediately, don't retry
      } else if (attempt === retries) {
        console.warn(`⚠️ Translation failed:`, error?.message || error);
        return texts;
      }
      // Wait before retry for other errors
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return texts;
}

/**
 * Auto-translate content - OPTIMIZED: 1 request per language
 */
export async function autoTranslate(
  content: Record<string, string | string[]>,
  sourceLanguage: SupportedLanguage = 'vi',
  targetLanguages: SupportedLanguage[] = SUPPORTED_LANGUAGES.filter(l => l !== sourceLanguage) as SupportedLanguage[]
): Promise<Record<SupportedLanguage, Record<string, string | string[]>>> {
  const translations: Record<string, Record<string, string | string[]>> = {};
  
  // Check cache
  const cacheKey = JSON.stringify({ content, sourceLanguage });
  if (translationCache.has(cacheKey)) {
    console.log('📦 Using cached translation');
    return translationCache.get(cacheKey);
  }

  // Flatten content to array for batch translation
  const keys: string[] = [];
  const values: string[] = [];
  const arrayLengths: Record<string, number> = {};
  
  for (const [key, value] of Object.entries(content)) {
    if (!value) continue;
    
    if (Array.isArray(value)) {
      arrayLengths[key] = value.length;
      for (const item of value) {
        if (item?.trim()) {
          keys.push(key);
          values.push(item);
        }
      }
    } else if (typeof value === 'string' && value.trim()) {
      keys.push(key);
      values.push(value);
    }
  }

  if (values.length === 0) return {} as any;

  const fromLang = GOOGLE_LANG_CODES[sourceLanguage];

  try {
    // Only 1 request per language!
    for (const targetLang of targetLanguages) {
      const toLang = GOOGLE_LANG_CODES[targetLang];
      
      console.log(`   → ${targetLang}...`);
      const translated = await translateBatch(values, fromLang, toLang);
      
      // Rebuild structure
      const translatedFields: Record<string, string | string[]> = {};
      const arrayBuilders: Record<string, string[]> = {};
      
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const val = translated[i];
        
        if (arrayLengths[key]) {
          if (!arrayBuilders[key]) arrayBuilders[key] = [];
          arrayBuilders[key].push(val);
        } else {
          translatedFields[key] = val;
        }
      }
      
      // Add arrays
      for (const [key, arr] of Object.entries(arrayBuilders)) {
        translatedFields[key] = arr;
      }
      
      if (Object.keys(translatedFields).length > 0) {
        translations[targetLang] = translatedFields;
      }
      
      // Small delay between languages
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Cache result
    translationCache.set(cacheKey, translations);
    if (translationCache.size > 100) {
      const firstKey = translationCache.keys().next().value;
      if (firstKey) translationCache.delete(firstKey);
    }
    
  } catch (error) {
    console.error('Auto-translate error:', error);
  }
  
  return translations as any;
}

/**
 * Auto-translate product fields
 */
export async function translateProduct(productData: any): Promise<any> {
  const fieldsToTranslate: Record<string, string | string[]> = {};
  
  if (productData.name) fieldsToTranslate.name = productData.name;
  if (productData.description) fieldsToTranslate.description = productData.description;
  if (productData.shortDescription) fieldsToTranslate.shortDescription = productData.shortDescription;
  if (productData.specifications) fieldsToTranslate.specifications = productData.specifications;
  if (productData.warranty) fieldsToTranslate.warranty = productData.warranty;
  if (productData.features?.length) fieldsToTranslate.features = productData.features;
  
  if (Object.keys(fieldsToTranslate).length === 0) {
    return productData;
  }
  
  console.log('🌐 Auto-translating product:', productData.name);
  const translations = await autoTranslate(fieldsToTranslate);
  
  return {
    ...productData,
    translations
  };
}

/**
 * Auto-translate project fields
 */
export async function translateProject(projectData: any): Promise<any> {
  const fieldsToTranslate: Record<string, string> = {};
  
  if (projectData.title) fieldsToTranslate.title = projectData.title;
  if (projectData.location) fieldsToTranslate.location = projectData.location;
  if (projectData.description) fieldsToTranslate.description = projectData.description;
  
  if (Object.keys(fieldsToTranslate).length === 0) {
    return projectData;
  }
  
  console.log('🌐 Auto-translating project:', projectData.title);
  const translations = await autoTranslate(fieldsToTranslate);
  
  return {
    ...projectData,
    translations
  };
}

/**
 * Auto-translate news fields
 */
export async function translateNews(newsData: any): Promise<any> {
  const fieldsToTranslate: Record<string, string> = {};
  
  if (newsData.title) fieldsToTranslate.title = newsData.title;
  if (newsData.excerpt) fieldsToTranslate.excerpt = newsData.excerpt;
  if (newsData.content) fieldsToTranslate.content = newsData.content;
  
  if (Object.keys(fieldsToTranslate).length === 0) {
    return newsData;
  }
  
  console.log('🌐 Auto-translating news:', newsData.title);
  const translations = await autoTranslate(fieldsToTranslate);
  
  return {
    ...newsData,
    translations
  };
}

/**
 * Auto-translate testimonial fields
 */
export async function translateTestimonial(testimonialData: any): Promise<any> {
  const fieldsToTranslate: Record<string, string> = {};
  
  if (testimonialData.role) fieldsToTranslate.role = testimonialData.role;
  if (testimonialData.content) fieldsToTranslate.content = testimonialData.content;
  
  if (Object.keys(fieldsToTranslate).length === 0) {
    return testimonialData;
  }
  
  console.log('🌐 Auto-translating testimonial:', testimonialData.name);
  const translations = await autoTranslate(fieldsToTranslate);
  
  return {
    ...testimonialData,
    translations
  };
}

/**
 * Auto-translate category fields
 */
export async function translateCategory(categoryData: any): Promise<any> {
  const fieldsToTranslate: Record<string, string> = {};
  
  if (categoryData.name) fieldsToTranslate.name = categoryData.name;
  if (categoryData.description) fieldsToTranslate.description = categoryData.description;
  
  if (Object.keys(fieldsToTranslate).length === 0) {
    return categoryData;
  }
  
  console.log('🌐 Auto-translating category:', categoryData.name);
  const translations = await autoTranslate(fieldsToTranslate);
  
  return {
    ...categoryData,
    translations
  };
}

/**
 * Auto-translate team member fields
 */
export async function translateTeamMember(memberData: any): Promise<any> {
  const fieldsToTranslate: Record<string, string> = {};
  
  if (memberData.role) fieldsToTranslate.role = memberData.role;
  
  if (Object.keys(fieldsToTranslate).length === 0) {
    return memberData;
  }
  
  console.log('🌐 Auto-translating team member:', memberData.name);
  const translations = await autoTranslate(fieldsToTranslate);
  
  return {
    ...memberData,
    translations
  };
}
