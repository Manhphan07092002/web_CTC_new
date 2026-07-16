import NodeCache from 'node-cache';
import { Translation } from '../../models/Translation';
import { SUPPORTED_LANGUAGES } from './i18n-helpers';

interface CachedTranslation {
  value: string;
  isPlural?: boolean;
  pluralForms?: {
    zero?: string;
    one?: string;
    other?: string;
  };
  variables?: string[];
  lastUpdated: Date;
}

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  size: string;
  hitRate: number;
}

class TranslationCache {
  private cache: NodeCache;
  private dbCache: NodeCache; // Separate cache for database translations
  private stats: { hits: number; misses: number };
  private readonly TTL = 3600; // 1 hour default TTL
  private readonly DB_TTL = 1800; // 30 minutes for database translations

  constructor() {
    // File-based translations cache (longer TTL)
    this.cache = new NodeCache({
      stdTTL: this.TTL,
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false, // Better performance
      maxKeys: 10000
    });

    // Database translations cache (shorter TTL)
    this.dbCache = new NodeCache({
      stdTTL: this.DB_TTL,
      checkperiod: 300, // Check every 5 minutes
      useClones: false,
      maxKeys: 5000
    });

    this.stats = { hits: 0, misses: 0 };

    // Set up cache event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Log cache events in development
    if (process.env.NODE_ENV === 'development') {
      this.cache.on('set', (key, value) => {
        console.log(`[Cache] Set key: ${key}`);
      });

      this.cache.on('del', (key, value) => {
        console.log(`[Cache] Deleted key: ${key}`);
      });

      this.cache.on('expired', (key, value) => {
        console.log(`[Cache] Expired key: ${key}`);
      });
    }
  }

  // Generate cache key
  private generateKey(language: string, namespace: string, key: string): string {
    return `${language}:${namespace}:${key}`;
  }

  // Generate namespace cache key
  private generateNamespaceKey(language: string, namespace: string): string {
    return `ns:${language}:${namespace}`;
  }

  // Get translation from cache
  get(language: string, namespace: string, key: string): CachedTranslation | null {
    const cacheKey = this.generateKey(language, namespace, key);
    
    // Try file cache first
    let cached = this.cache.get<CachedTranslation>(cacheKey);
    
    // If not found, try database cache
    if (!cached) {
      cached = this.dbCache.get<CachedTranslation>(cacheKey);
    }

    if (cached) {
      this.stats.hits++;
      return cached;
    }

    this.stats.misses++;
    return null;
  }

  // Set translation in cache
  set(
    language: string, 
    namespace: string, 
    key: string, 
    value: string,
    options: {
      isPlural?: boolean;
      pluralForms?: any;
      variables?: string[];
      isFromDatabase?: boolean;
      ttl?: number;
    } = {}
  ): void {
    const cacheKey = this.generateKey(language, namespace, key);
    const cached: CachedTranslation = {
      value,
      isPlural: options.isPlural,
      pluralForms: options.pluralForms,
      variables: options.variables,
      lastUpdated: new Date()
    };

    const ttl = options.ttl || (options.isFromDatabase ? this.DB_TTL : this.TTL);
    const targetCache = options.isFromDatabase ? this.dbCache : this.cache;

    targetCache.set(cacheKey, cached, ttl);
  }

  // Get entire namespace from cache
  getNamespace(language: string, namespace: string): Record<string, any> | null {
    const cacheKey = this.generateNamespaceKey(language, namespace);
    
    let cached = this.cache.get<Record<string, any>>(cacheKey);
    
    if (!cached) {
      cached = this.dbCache.get<Record<string, any>>(cacheKey);
    }

    if (cached) {
      this.stats.hits++;
      return cached;
    }

    this.stats.misses++;
    return null;
  }

  // Set entire namespace in cache
  setNamespace(
    language: string, 
    namespace: string, 
    translations: Record<string, any>,
    isFromDatabase: boolean = false
  ): void {
    const cacheKey = this.generateNamespaceKey(language, namespace);
    const ttl = isFromDatabase ? this.DB_TTL : this.TTL;
    const targetCache = isFromDatabase ? this.dbCache : this.cache;

    targetCache.set(cacheKey, translations, ttl);
  }

  // Invalidate specific translation
  invalidate(language: string, namespace: string, key: string): void {
    const cacheKey = this.generateKey(language, namespace, key);
    this.cache.del(cacheKey);
    this.dbCache.del(cacheKey);

    // Also invalidate namespace cache
    const namespaceKey = this.generateNamespaceKey(language, namespace);
    this.cache.del(namespaceKey);
    this.dbCache.del(namespaceKey);
  }

  // Invalidate entire namespace
  invalidateNamespace(language: string, namespace: string): void {
    const namespaceKey = this.generateNamespaceKey(language, namespace);
    this.cache.del(namespaceKey);
    this.dbCache.del(namespaceKey);

    // Invalidate all keys in this namespace
    const pattern = `${language}:${namespace}:`;
    const keys = this.cache.keys().filter(key => key.startsWith(pattern));
    const dbKeys = this.dbCache.keys().filter(key => key.startsWith(pattern));

    keys.forEach(key => this.cache.del(key));
    dbKeys.forEach(key => this.dbCache.del(key));
  }

  // Invalidate entire language
  invalidateLanguage(language: string): void {
    const pattern = `${language}:`;
    const nsPattern = `ns:${language}:`;

    // Get all keys for this language
    const keys = this.cache.keys().filter(key => key.startsWith(pattern) || key.startsWith(nsPattern));
    const dbKeys = this.dbCache.keys().filter(key => key.startsWith(pattern) || key.startsWith(nsPattern));

    keys.forEach(key => this.cache.del(key));
    dbKeys.forEach(key => this.dbCache.del(key));
  }

  // Clear all cache
  clear(): void {
    this.cache.flushAll();
    this.dbCache.flushAll();
    this.stats = { hits: 0, misses: 0 };
  }

  // Preload translations from database
  async preloadFromDatabase(language?: string, namespace?: string): Promise<void> {
    try {
      const filter: any = { status: { $in: ['approved', 'published'] } };
      
      if (language) filter.language = language;
      if (namespace) filter.namespace = namespace;

      const translations = await Translation.find(filter).lean();

      // Group by language and namespace
      const grouped = translations.reduce((acc: any, translation) => {
        const lang = translation.language;
        const ns = translation.namespace;
        
        if (!acc[lang]) acc[lang] = {};
        if (!acc[lang][ns]) acc[lang][ns] = {};
        
        // Handle nested keys
        const keys = translation.key.split('.');
        let current = acc[lang][ns];
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = translation.value;

        // Cache individual translation
        this.set(lang, ns, translation.key, translation.value, {
          isPlural: translation.isPlural,
          pluralForms: translation.pluralForms,
          variables: translation.variables,
          isFromDatabase: true
        });

        return acc;
      }, {});

      // Cache namespaces
      Object.keys(grouped).forEach(lang => {
        Object.keys(grouped[lang]).forEach(ns => {
          this.setNamespace(lang, ns, grouped[lang][ns], true);
        });
      });

      console.log(`[Cache] Preloaded ${translations.length} database translations`);
    } catch (error) {
      console.error('[Cache] Error preloading database translations:', error);
    }
  }

  // Warm up cache with file-based translations
  async warmUp(): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      for (const lang of SUPPORTED_LANGUAGES) {
        const langDir = path.join(process.cwd(), 'locales', lang.code);
        
        if (!fs.existsSync(langDir)) continue;

        const namespaces = ['common', 'auth', 'products', 'projects', 'news', 'contact', 'calculator', 'admin'];
        
        for (const namespace of namespaces) {
          const filePath = path.join(langDir, `${namespace}.json`);
          
          if (fs.existsSync(filePath)) {
            try {
              const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              this.setNamespace(lang.code, namespace, content, false);
            } catch (error) {
              console.error(`[Cache] Error loading ${filePath}:`, error);
            }
          }
        }
      }

      console.log('[Cache] File-based translations warmed up');
    } catch (error) {
      console.error('[Cache] Error warming up cache:', error);
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    const fileStats = this.cache.getStats();
    const dbStats = this.dbCache.getStats();

    const totalHits = this.stats.hits;
    const totalMisses = this.stats.misses;
    const totalRequests = totalHits + totalMisses;

    return {
      hits: totalHits,
      misses: totalMisses,
      keys: fileStats.keys + dbStats.keys,
      size: `${Math.round((fileStats.ksize + dbStats.ksize) / 1024)}KB`,
      hitRate: totalRequests > 0 ? Math.round((totalHits / totalRequests) * 100) : 0
    };
  }

  // Reset statistics
  resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }

  // Get cache keys for debugging
  getKeys(): { fileCache: string[]; dbCache: string[] } {
    return {
      fileCache: this.cache.keys(),
      dbCache: this.dbCache.keys()
    };
  }

  // Check if translation exists in cache
  has(language: string, namespace: string, key: string): boolean {
    const cacheKey = this.generateKey(language, namespace, key);
    return this.cache.has(cacheKey) || this.dbCache.has(cacheKey);
  }

  // Get TTL for a key
  getTtl(language: string, namespace: string, key: string): number | undefined {
    const cacheKey = this.generateKey(language, namespace, key);
    return this.cache.getTtl(cacheKey) || this.dbCache.getTtl(cacheKey);
  }

  // Update TTL for a key
  updateTtl(language: string, namespace: string, key: string, ttl: number): boolean {
    const cacheKey = this.generateKey(language, namespace, key);
    return this.cache.ttl(cacheKey, ttl) || this.dbCache.ttl(cacheKey, ttl);
  }
}

// Create singleton instance
export const translationCache = new TranslationCache();

// Export class for testing
export { TranslationCache };
