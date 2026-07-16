import fs from 'fs';
import path from 'path';
import { getTranslationStats, checkTranslationCompleteness, SUPPORTED_LANGUAGES } from '../utils/i18n-helpers';

interface TranslationKey {
  key: string;
  value: string;
  namespace: string;
}

class TranslationManager {
  private localesPath: string;
  private namespaces: string[];

  constructor() {
    this.localesPath = path.join(process.cwd(), 'locales');
    this.namespaces = ['common', 'auth', 'products', 'projects', 'news', 'contact', 'calculator', 'admin'];
  }

  // Get all translation keys from base language (Vietnamese)
  getAllKeys(): TranslationKey[] {
    const keys: TranslationKey[] = [];
    
    this.namespaces.forEach(namespace => {
      const filePath = path.join(this.localesPath, 'vi', `${namespace}.json`);
      
      if (fs.existsSync(filePath)) {
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const namespaceKeys = this.extractKeys(content, namespace);
          keys.push(...namespaceKeys);
        } catch (error) {
          console.error(`Error reading ${filePath}:`, error);
        }
      }
    });
    
    return keys;
  }

  // Extract keys recursively from translation object
  private extractKeys(obj: any, namespace: string, prefix: string = ''): TranslationKey[] {
    const keys: TranslationKey[] = [];
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          keys.push(...this.extractKeys(obj[key], namespace, fullKey));
        } else {
          keys.push({
            key: fullKey,
            value: obj[key],
            namespace
          });
        }
      }
    }
    
    return keys;
  }

  // Generate missing translation files
  generateMissingFiles(): void {
    console.log('🔍 Checking for missing translation files...\n');
    
    SUPPORTED_LANGUAGES.forEach(lang => {
      const langDir = path.join(this.localesPath, lang.code);
      
      // Create language directory if it doesn't exist
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
        console.log(`📁 Created directory: ${langDir}`);
      }
      
      this.namespaces.forEach(namespace => {
        const filePath = path.join(langDir, `${namespace}.json`);
        
        if (!fs.existsSync(filePath)) {
          // Create empty namespace file
          const emptyStructure = this.createEmptyStructure(namespace);
          fs.writeFileSync(filePath, JSON.stringify(emptyStructure, null, 2), 'utf8');
          console.log(`📄 Created file: ${filePath}`);
        }
      });
    });
    
    console.log('\n✅ Missing file generation completed!');
  }

  // Create empty structure based on Vietnamese template
  private createEmptyStructure(namespace: string): any {
    const viFilePath = path.join(this.localesPath, 'vi', `${namespace}.json`);
    
    if (!fs.existsSync(viFilePath)) {
      return {};
    }
    
    try {
      const viContent = JSON.parse(fs.readFileSync(viFilePath, 'utf8'));
      return this.createEmptyFromTemplate(viContent);
    } catch (error) {
      console.error(`Error reading Vietnamese template for ${namespace}:`, error);
      return {};
    }
  }

  // Create empty structure maintaining the same hierarchy
  private createEmptyFromTemplate(obj: any): any {
    const result: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          result[key] = this.createEmptyFromTemplate(obj[key]);
        } else {
          result[key] = ''; // Empty string for translation
        }
      }
    }
    
    return result;
  }

  // Generate translation report
  generateReport(): void {
    console.log('📊 Generating Translation Report...\n');
    
    const stats = getTranslationStats();
    
    interface LanguageStats {
      language: string;
      namespaces: any[];
      totalKeys: number;
      translatedKeys: number;
      averageCompletion: number;
    }
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalLanguages: SUPPORTED_LANGUAGES.length - 1, // Exclude base language
        totalNamespaces: this.namespaces.length,
        totalKeys: 0,
        averageCompletion: 0
      },
      languages: {} as Record<string, LanguageStats>,
      missingTranslations: [] as any[]
    };

    // Group stats by language
    const statsByLanguage: Record<string, LanguageStats> = stats.reduce((acc: Record<string, LanguageStats>, stat) => {
      if (!acc[stat.language]) {
        acc[stat.language] = {
          language: stat.language,
          namespaces: [],
          totalKeys: 0,
          translatedKeys: 0,
          averageCompletion: 0
        };
      }
      
      acc[stat.language].namespaces.push({
        namespace: stat.namespace,
        totalKeys: stat.totalKeys,
        translatedKeys: stat.translatedKeys,
        completionPercentage: stat.completionPercentage,
        missingKeys: stat.missingKeys
      });
      
      acc[stat.language].totalKeys += stat.totalKeys;
      acc[stat.language].translatedKeys += stat.translatedKeys;
      
      return acc;
    }, {});
    
    // Calculate average completion for each language
    Object.keys(statsByLanguage).forEach(lang => {
      const langStats = statsByLanguage[lang];
      langStats.averageCompletion = langStats.totalKeys > 0 
        ? Math.round((langStats.translatedKeys / langStats.totalKeys) * 100)
        : 0;
    });

    report.languages = statsByLanguage;
    
    // Calculate overall summary
    const languageStatsArray = Object.values(statsByLanguage);
    const totalKeys = languageStatsArray.reduce((sum: number, lang: LanguageStats) => sum + lang.totalKeys, 0);
    const totalTranslated = languageStatsArray.reduce((sum: number, lang: LanguageStats) => sum + lang.translatedKeys, 0);
    
    report.summary.totalKeys = totalKeys;
    report.summary.averageCompletion = totalKeys > 0 ? Math.round((totalTranslated / totalKeys) * 100) : 0;

    // Save report to file
    const reportPath = path.join(process.cwd(), 'translation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    // Display summary
    console.log('📈 Translation Summary:');
    console.log(`   Total Languages: ${report.summary.totalLanguages}`);
    console.log(`   Total Namespaces: ${report.summary.totalNamespaces}`);
    console.log(`   Total Keys: ${report.summary.totalKeys}`);
    console.log(`   Average Completion: ${report.summary.averageCompletion}%\n`);
    
    console.log('🌐 Language Completion:');
    Object.values(report.languages).forEach((lang: LanguageStats) => {
      const flag = SUPPORTED_LANGUAGES.find(l => l.code === lang.language)?.flag || '🏳️';
      console.log(`   ${flag} ${lang.language.toUpperCase()}: ${lang.averageCompletion}% (${lang.translatedKeys}/${lang.totalKeys})`);
    });
    
    if (report.missingTranslations.length > 0) {
      console.log('\n❌ Missing Translations:');
      report.missingTranslations.forEach((missing: any) => {
        console.log(`   ${missing.language}/${missing.namespace}: ${missing.missingKeys.length} keys missing`);
      });
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
  }

  // Validate translation files
  validateTranslations(): boolean {
    console.log('🔍 Validating translation files...\n');
    
    let hasErrors = false;
    
    SUPPORTED_LANGUAGES.forEach(lang => {
      this.namespaces.forEach(namespace => {
        const filePath = path.join(this.localesPath, lang.code, `${namespace}.json`);
        
        if (!fs.existsSync(filePath)) {
          console.log(`❌ Missing file: ${filePath}`);
          hasErrors = true;
          return;
        }
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          JSON.parse(content);
          console.log(`✅ Valid: ${lang.code}/${namespace}.json`);
        } catch (error) {
          console.log(`❌ Invalid JSON: ${filePath}`);
          console.log(`   Error: ${error}`);
          hasErrors = true;
        }
      });
    });
    
    if (!hasErrors) {
      console.log('\n🎉 All translation files are valid!');
    } else {
      console.log('\n⚠️  Some translation files have errors.');
    }
    
    return !hasErrors;
  }

  // Sync translation structure (add missing keys to all languages)
  syncTranslationStructure(): void {
    console.log('🔄 Syncing translation structure...\n');
    
    // Get base structure from Vietnamese
    const baseStructure: any = {};
    
    this.namespaces.forEach(namespace => {
      const viFilePath = path.join(this.localesPath, 'vi', `${namespace}.json`);
      
      if (fs.existsSync(viFilePath)) {
        try {
          baseStructure[namespace] = JSON.parse(fs.readFileSync(viFilePath, 'utf8'));
        } catch (error) {
          console.error(`Error reading ${viFilePath}:`, error);
        }
      }
    });
    
    // Sync all other languages
    SUPPORTED_LANGUAGES.forEach(lang => {
      if (lang.code === 'vi') return; // Skip base language
      
      this.namespaces.forEach(namespace => {
        if (!baseStructure[namespace]) return;
        
        const targetFilePath = path.join(this.localesPath, lang.code, `${namespace}.json`);
        let targetContent: any = {};
        
        // Load existing content if file exists
        if (fs.existsSync(targetFilePath)) {
          try {
            targetContent = JSON.parse(fs.readFileSync(targetFilePath, 'utf8'));
          } catch (error) {
            console.error(`Error reading ${targetFilePath}:`, error);
          }
        }
        
        // Merge with base structure
        const syncedContent = this.mergeStructures(baseStructure[namespace], targetContent);
        
        // Write back to file
        fs.writeFileSync(targetFilePath, JSON.stringify(syncedContent, null, 2), 'utf8');
        console.log(`🔄 Synced: ${lang.code}/${namespace}.json`);
      });
    });
    
    console.log('\n✅ Translation structure sync completed!');
  }

  // Merge structures while preserving existing translations
  private mergeStructures(base: any, target: any): any {
    const result: any = {};
    
    for (const key in base) {
      if (base.hasOwnProperty(key)) {
        if (typeof base[key] === 'object' && base[key] !== null) {
          result[key] = this.mergeStructures(base[key], target[key] || {});
        } else {
          // Keep existing translation or use empty string
          result[key] = (target && target[key]) || '';
        }
      }
    }
    
    return result;
  }
}

// CLI interface
const manager = new TranslationManager();

const command = process.argv[2];

switch (command) {
  case 'generate':
    manager.generateMissingFiles();
    break;
  case 'report':
    manager.generateReport();
    break;
  case 'validate':
    manager.validateTranslations();
    break;
  case 'sync':
    manager.syncTranslationStructure();
    break;
  case 'all':
    console.log('🚀 Running all translation management tasks...\n');
    manager.generateMissingFiles();
    console.log('\n' + '='.repeat(50) + '\n');
    manager.syncTranslationStructure();
    console.log('\n' + '='.repeat(50) + '\n');
    manager.validateTranslations();
    console.log('\n' + '='.repeat(50) + '\n');
    manager.generateReport();
    break;
  default:
    console.log('🌐 Translation Manager');
    console.log('Usage: npx tsx server/scripts/translation-manager.ts <command>');
    console.log('');
    console.log('Commands:');
    console.log('  generate  - Generate missing translation files');
    console.log('  report    - Generate translation completion report');
    console.log('  validate  - Validate all translation files');
    console.log('  sync      - Sync translation structure across languages');
    console.log('  all       - Run all commands in sequence');
    break;
}

export { TranslationManager };
