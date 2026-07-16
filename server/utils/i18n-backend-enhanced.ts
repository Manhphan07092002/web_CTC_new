import { BackendModule, Services, InitOptions, ReadCallback } from 'i18next';
import { Translation } from '../../models/Translation';
import { translationCache } from './translation-cache';
import fs from 'fs';
import path from 'path';

interface EnhancedBackendOptions {
  loadPath?: string;
  addPath?: string;
  allowMultiLoading?: boolean;
  parse?: (data: string) => any;
  stringify?: (obj: any) => string;
  useDatabase?: boolean;
  cacheEnabled?: boolean;
  fallbackToFiles?: boolean;
}

class EnhancedI18nBackend implements BackendModule {
  static type = 'backend' as const;
  type = 'backend' as const;

  private services!: Services;
  private options: EnhancedBackendOptions = {};
  private logger: any;

  init(services: Services, backendOptions: EnhancedBackendOptions = {}, i18nextOptions: InitOptions = {}) {
    this.services = services;
    this.logger = services.logger || console;
    
    this.options = {
      loadPath: path.join(process.cwd(), 'locales/{{lng}}/{{ns}}.json'),
      useDatabase: true,
      cacheEnabled: true,
      fallbackToFiles: true,
      parse: JSON.parse,
      stringify: JSON.stringify,
      ...backendOptions
    };

    // Initialize cache if enabled
    if (this.options.cacheEnabled) {
      this.initializeCache();
    }
  }

  private async initializeCache(): Promise<void> {
    try {
      // Warm up file-based translations
      await translationCache.warmUp();
      
      // Preload database translations
      if (this.options.useDatabase) {
        await translationCache.preloadFromDatabase();
      }
      
      this.logger.log('[Enhanced Backend] Cache initialized successfully');
    } catch (error) {
      this.logger.error('[Enhanced Backend] Cache initialization failed:', error);
    }
  }

  read(language: string, namespace: string, callback: ReadCallback) {
    this.readAsync(language, namespace)
      .then(data => callback(null, data))
      .catch(error => callback(error, null));
  }

  private async readAsync(language: string, namespace: string): Promise<any> {
    // Try cache first if enabled
    if (this.options.cacheEnabled) {
      const cached = translationCache.getNamespace(language, namespace);
      if (cached) {
        this.logger.log(`[Enhanced Backend] Cache hit: ${language}/${namespace}`);
        return cached;
      }
    }

    let translations: any = {};
    let foundData = false;

    // Try database first if enabled
    if (this.options.useDatabase) {
      try {
        const dbTranslations = await this.loadFromDatabase(language, namespace);
        if (dbTranslations && Object.keys(dbTranslations).length > 0) {
          translations = { ...translations, ...dbTranslations };
          foundData = true;
          
          // Cache database translations
          if (this.options.cacheEnabled) {
            translationCache.setNamespace(language, namespace, dbTranslations, true);
          }
          
          this.logger.log(`[Enhanced Backend] Database hit: ${language}/${namespace}`);
        }
      } catch (error) {
        this.logger.warn(`[Enhanced Backend] Database read failed for ${language}/${namespace}:`, error);
      }
    }

    // Fallback to files if enabled and no database data found
    if (this.options.fallbackToFiles && (!foundData || Object.keys(translations).length === 0)) {
      try {
        const fileTranslations = await this.loadFromFile(language, namespace);
        if (fileTranslations && Object.keys(fileTranslations).length > 0) {
          translations = { ...fileTranslations, ...translations }; // Database overrides files
          foundData = true;
          
          // Cache file translations
          if (this.options.cacheEnabled) {
            translationCache.setNamespace(language, namespace, fileTranslations, false);
          }
          
          this.logger.log(`[Enhanced Backend] File hit: ${language}/${namespace}`);
        }
      } catch (error) {
        this.logger.warn(`[Enhanced Backend] File read failed for ${language}/${namespace}:`, error);
      }
    }

    if (!foundData) {
      throw new Error(`No translations found for ${language}/${namespace}`);
    }

    return translations;
  }

  private async loadFromDatabase(language: string, namespace: string): Promise<any> {
    try {
      const translations = await Translation.find({
        language,
        namespace,
        status: { $in: ['approved', 'published'] }
      }).lean();

      if (!translations || translations.length === 0) {
        return null;
      }

      // Convert flat structure to nested object
      const result: any = {};
      
      translations.forEach(translation => {
        const keys = translation.key.split('.');
        let current = result;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = translation.value;

        // Track usage
        Translation.updateOne(
          { key: translation.key, namespace: translation.namespace, language: translation.language },
          { 
            $inc: { usageCount: 1 },
            $set: { lastUsed: new Date() }
          }
        ).catch(error => this.logger.warn('Failed to increment usage:', error));
      });

      return result;
    } catch (error) {
      this.logger.error(`[Enhanced Backend] Database error for ${language}/${namespace}:`, error);
      throw error;
    }
  }

  private async loadFromFile(language: string, namespace: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.options.loadPath) {
        return reject(new Error('No loadPath configured'));
      }

      const filePath = this.options.loadPath
        .replace('{{lng}}', language)
        .replace('{{ns}}', namespace);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }

        try {
          const parsed = this.options.parse!(data);
          resolve(parsed);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }

  // Optional: Implement save method for database writes
  save(language: string, namespace: string, data: any, callback?: (error?: any) => void) {
    this.saveAsync(language, namespace, data)
      .then(() => callback && callback())
      .catch(error => callback && callback(error));
  }

  private async saveAsync(language: string, namespace: string, data: any): Promise<void> {
    if (!this.options.useDatabase) {
      throw new Error('Database saving is disabled');
    }

    try {
      // Flatten the nested object
      const flatTranslations = this.flattenObject(data);

      // Save each translation to database
      const savePromises = Object.keys(flatTranslations).map(async (key) => {
        const value = flatTranslations[key];
        
        // Check if translation exists
        const existing = await Translation.findOne({ key, namespace, language });
        
        if (existing) {
          // Update existing
          existing.value = value;
          existing.status = 'draft'; // Reset to draft when modified
          await existing.save();
        } else {
          // Create new
          const translation = new Translation({
            key,
            namespace,
            language,
            value,
            status: 'draft'
          });
          await translation.save();
        }
      });

      await Promise.all(savePromises);

      // Invalidate cache
      if (this.options.cacheEnabled) {
        translationCache.invalidateNamespace(language, namespace);
      }

      this.logger.log(`[Enhanced Backend] Saved ${Object.keys(flatTranslations).length} translations for ${language}/${namespace}`);
    } catch (error) {
      this.logger.error(`[Enhanced Backend] Save error for ${language}/${namespace}:`, error);
      throw error;
    }
  }

  private flattenObject(obj: any, prefix: string = ''): Record<string, string> {
    const result: Record<string, string> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          Object.assign(result, this.flattenObject(obj[key], fullKey));
        } else {
          result[fullKey] = obj[key];
        }
      }
    }
    
    return result;
  }

  // Cache management methods
  invalidateCache(language?: string, namespace?: string, key?: string): void {
    if (!this.options.cacheEnabled) return;

    if (key && namespace && language) {
      translationCache.invalidate(language, namespace, key);
    } else if (namespace && language) {
      translationCache.invalidateNamespace(language, namespace);
    } else if (language) {
      translationCache.invalidateLanguage(language);
    } else {
      translationCache.clear();
    }
  }

  getCacheStats() {
    if (!this.options.cacheEnabled) {
      return { enabled: false };
    }

    return {
      enabled: true,
      ...translationCache.getStats()
    };
  }

  // Preload specific translations
  async preload(language?: string, namespace?: string): Promise<void> {
    if (this.options.cacheEnabled && this.options.useDatabase) {
      await translationCache.preloadFromDatabase(language, namespace);
    }
  }
}

export { EnhancedI18nBackend };
export type { EnhancedBackendOptions };
