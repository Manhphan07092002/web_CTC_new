import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Translation } from '../../models/Translation';
import { logger } from "../../utils/logger";

// Simple migration without i18n system interference
async function simpleMigrate() {
  logger.log('🚀 Simple Translation Migration...\n');

  try {
    // Connect directly to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';
    await mongoose.connect(MONGO_URI);
    logger.log('✅ Database connected\n');

    const languages = ['vi', 'en', 'ko', 'ja', 'zh', 'de', 'fr', 'es'];
    const namespaces = ['common', 'auth', 'products', 'projects', 'news', 'contact', 'calculator', 'admin', 'home'];
    
    let totalProcessed = 0;
    let totalCreated = 0;

    for (const language of languages) {
      logger.log(`📁 Processing ${language}...`);
      
      for (const namespace of namespaces) {
        const filePath = path.join(process.cwd(), 'locales', language, `${namespace}.json`);
        
        if (fs.existsSync(filePath)) {
          try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const flatTranslations = flattenObject(content);
            
            logger.log(`   📄 ${namespace}.json: ${Object.keys(flatTranslations).length} keys`);
            
            for (const [key, value] of Object.entries(flatTranslations)) {
              totalProcessed++;
              
              // Check if exists
              const existing = await Translation.findOne({ key, namespace, language });
              
              if (!existing) {
                await Translation.create({
                  key,
                  namespace,
                  language,
                  value: value as string,
                  description: `Migrated from ${language}/${namespace}.json`,
                  status: 'published',
                  createdBy: 'migration-script',
                  version: 1
                });
                totalCreated++;
                
                if (totalCreated % 10 === 0) {
                  logger.log(`     ✅ Created ${totalCreated} translations...`);
                }
              }
            }
          } catch (error) {
            logger.error(`   ❌ Error processing ${language}/${namespace}:`, error);
          }
        }
      }
    }

    logger.log(`\n📊 Migration Summary:`);
    logger.log(`   Total processed: ${totalProcessed}`);
    logger.log(`   Total created: ${totalCreated}`);
    logger.log(`   Success rate: ${Math.round((totalCreated / totalProcessed) * 100)}%`);

    await mongoose.disconnect();
    logger.log('\n✅ Migration completed successfully!');

  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

function flattenObject(obj: any, prefix: string = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(result, flattenObject(obj[key], fullKey));
      } else {
        result[fullKey] = obj[key];
      }
    }
  }
  
  return result;
}

simpleMigrate();
