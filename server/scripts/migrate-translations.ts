import fs from 'fs';
import path from 'path';
import { connectDB } from '../db';
import { Translation } from '../../models/Translation';
import { SUPPORTED_LANGUAGES } from '../utils/i18n-helpers';

interface MigrationStats {
  processed: number;
  created: number;
  updated: number;
  errors: number;
  skipped: number;
}

class TranslationMigrator {
  private stats: MigrationStats = {
    processed: 0,
    created: 0,
    updated: 0,
    errors: 0,
    skipped: 0
  };

  async migrateFromFiles(): Promise<void> {
    console.log('🚀 Starting translation migration from files to database...\n');

    try {
      // Connect to database without i18n initialization
      await connectDB();
      console.log('✅ Database connected\n');

      const namespaces = ['common', 'auth', 'products', 'projects', 'news', 'contact', 'calculator', 'admin'];
      
      for (const language of SUPPORTED_LANGUAGES) {
        console.log(`📁 Processing language: ${language.flag} ${language.name} (${language.code})`);
        
        for (const namespace of namespaces) {
          await this.migrateNamespace(language.code, namespace);
        }
        
        console.log(`   ✅ Completed ${language.code}\n`);
      }

      this.printSummary();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  private async migrateNamespace(language: string, namespace: string): Promise<void> {
    const filePath = path.join(process.cwd(), 'locales', language, `${namespace}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${language}/${namespace}.json`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const translations = JSON.parse(content);
      
      const flatTranslations = this.flattenObject(translations);
      const keys = Object.keys(flatTranslations);
      
      console.log(`   📄 ${namespace}.json: ${keys.length} keys`);
      
      for (const key of keys) {
        await this.migrateTranslation(key, namespace, language, flatTranslations[key]);
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${language}/${namespace}.json:`, error);
      this.stats.errors++;
    }
  }

  private async migrateTranslation(key: string, namespace: string, language: string, value: string): Promise<void> {
    try {
      this.stats.processed++;
      
      // Check if translation already exists
      const existing = await Translation.findOne({ key, namespace, language });
      
      if (existing) {
        // Update if value is different
        if (existing.value !== value) {
          existing.value = value;
          existing.updatedBy = 'migration-script';
          await existing.save();
          this.stats.updated++;
          console.log(`     🔄 Updated: ${key}`);
        } else {
          this.stats.skipped++;
        }
      } else {
        // Create new translation
        const translation = new Translation({
          key,
          namespace,
          language,
          value,
          description: `Migrated from ${language}/${namespace}.json`,
          status: 'published', // Auto-publish migrated translations
          createdBy: 'migration-script',
          version: 1
        });
        
        await translation.save();
        this.stats.created++;
        console.log(`     ✅ Created: ${key}`);
      }
      
    } catch (error) {
      console.error(`     ❌ Error migrating ${key}:`, error);
      this.stats.errors++;
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

  private printSummary(): void {
    console.log('📊 Migration Summary:');
    console.log(`   Total processed: ${this.stats.processed}`);
    console.log(`   Created: ${this.stats.created}`);
    console.log(`   Updated: ${this.stats.updated}`);
    console.log(`   Skipped: ${this.stats.skipped}`);
    console.log(`   Errors: ${this.stats.errors}`);
    console.log(`   Success rate: ${Math.round(((this.stats.created + this.stats.updated + this.stats.skipped) / this.stats.processed) * 100)}%`);
  }

  async syncExistingTranslations(): Promise<void> {
    console.log('🔄 Syncing existing database translations...\n');

    try {
      // Get all published translations from database
      const dbTranslations = await Translation.find({ status: 'published' });
      console.log(`📊 Found ${dbTranslations.length} published translations in database`);

      // Group by language and namespace
      const grouped = dbTranslations.reduce((acc: any, translation) => {
        const { language, namespace } = translation;
        if (!acc[language]) acc[language] = {};
        if (!acc[language][namespace]) acc[language][namespace] = {};
        
        // Build nested object
        const keys = translation.key.split('.');
        let current = acc[language][namespace];
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = translation.value;
        return acc;
      }, {});

      // Write back to files
      let filesUpdated = 0;
      
      for (const language of Object.keys(grouped)) {
        for (const namespace of Object.keys(grouped[language])) {
          const filePath = path.join(process.cwd(), 'locales', language, `${namespace}.json`);
          const dirPath = path.dirname(filePath);
          
          // Ensure directory exists
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          
          // Write file
          fs.writeFileSync(filePath, JSON.stringify(grouped[language][namespace], null, 2), 'utf8');
          filesUpdated++;
          console.log(`   ✅ Updated: ${language}/${namespace}.json`);
        }
      }
      
      console.log(`\n📁 Updated ${filesUpdated} translation files`);
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }

  async validateMigration(): Promise<void> {
    console.log('🔍 Validating migration...\n');

    try {
      const namespaces = ['common', 'auth', 'products', 'projects', 'news', 'contact', 'calculator', 'admin'];
      let totalFileKeys = 0;
      let totalDbKeys = 0;
      let mismatches = 0;

      for (const language of SUPPORTED_LANGUAGES) {
        for (const namespace of namespaces) {
          const filePath = path.join(process.cwd(), 'locales', language.code, `${namespace}.json`);
          
          if (fs.existsSync(filePath)) {
            // Count file keys
            const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const fileKeys = Object.keys(this.flattenObject(fileContent));
            totalFileKeys += fileKeys.length;

            // Count database keys
            const dbCount = await Translation.countDocuments({ 
              language: language.code, 
              namespace,
              status: 'published'
            });
            totalDbKeys += dbCount;

            if (fileKeys.length !== dbCount) {
              console.log(`   ⚠️  Mismatch in ${language.code}/${namespace}: File(${fileKeys.length}) vs DB(${dbCount})`);
              mismatches++;
            }
          }
        }
      }

      console.log(`📊 Validation Results:`);
      console.log(`   Total file keys: ${totalFileKeys}`);
      console.log(`   Total database keys: ${totalDbKeys}`);
      console.log(`   Mismatches: ${mismatches}`);
      console.log(`   Status: ${mismatches === 0 ? '✅ PASSED' : '⚠️  ISSUES FOUND'}`);

    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const migrator = new TranslationMigrator();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'migrate':
        await migrator.migrateFromFiles();
        break;
      case 'sync':
        await migrator.syncExistingTranslations();
        break;
      case 'validate':
        await migrator.validateMigration();
        break;
      case 'all':
        console.log('🚀 Running complete migration process...\n');
        await migrator.migrateFromFiles();
        console.log('\n' + '='.repeat(50) + '\n');
        await migrator.validateMigration();
        break;
      default:
        console.log('🔄 Translation Migrator');
        console.log('Usage: npx tsx server/scripts/migrate-translations.ts <command>');
        console.log('');
        console.log('Commands:');
        console.log('  migrate   - Migrate translations from files to database');
        console.log('  sync      - Sync database translations back to files');
        console.log('  validate  - Validate migration completeness');
        console.log('  all       - Run migrate + validate');
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TranslationMigrator };
