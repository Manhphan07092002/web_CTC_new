/**
 * Translation Scheduler - Auto translate untranslated content every 12 hours
 */

import mongoose from 'mongoose';
import { autoTranslate } from './translate';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../models';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/web-tranle1';

// Track last run time
let lastRunTime: Date | null = null;
let isRunning = false;

// Collections to check for translations
const COLLECTIONS_CONFIG = [
  {
    name: 'products',
    fields: ['name', 'description', 'features', 'specifications']
  },
  {
    name: 'projects', 
    fields: ['title', 'description', 'location']
  },
  {
    name: 'news',
    fields: ['title', 'excerpt', 'content']
  },
  {
    name: 'testimonials',
    fields: ['name', 'role', 'content']
  },
  {
    name: 'teammembers',
    fields: ['name', 'role', 'bio']
  },
  {
    name: 'productcategories',
    fields: ['name', 'description']
  },
  {
    name: 'newscategories',
    fields: ['name', 'description']
  },
  {
    name: 'projectcategories',
    fields: ['name', 'description']
  }
];

/**
 * Check if document needs translation
 */
function needsTranslation(doc: any, fields: string[]): boolean {
  if (!doc.translations) return true;
  
  const targetLangs: SupportedLanguage[] = ['en', 'ko', 'ja', 'zh', 'de'];
  
  for (const lang of targetLangs) {
    if (!doc.translations[lang]) return true;
    
    // Check if all fields are translated
    for (const field of fields) {
      if (doc[field] && !doc.translations[lang][field]) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Translate a single document
 */
async function translateDocument(doc: any, fields: string[]): Promise<any> {
  const content: Record<string, string | string[]> = {};
  
  for (const field of fields) {
    if (doc[field]) {
      content[field] = doc[field];
    }
  }
  
  if (Object.keys(content).length === 0) return null;
  
  try {
    const translations = await autoTranslate(content, 'vi');
    return translations;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}

/**
 * Run translation job for all collections
 */
export async function runTranslationJob(): Promise<{ success: number; failed: number; skipped: number }> {
  if (isRunning) {
    console.log('⏳ Translation job already running, skipping...');
    return { success: 0, failed: 0, skipped: 0 };
  }
  
  isRunning = true;
  const stats = { success: 0, failed: 0, skipped: 0 };
  
  console.log('\n' + '='.repeat(60));
  console.log('🌐 STARTING AUTO-TRANSLATION JOB');
  console.log('📅 Time:', new Date().toLocaleString('vi-VN'));
  console.log('='.repeat(60));
  
  try {
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    }
    
    const db = mongoose.connection.db!;
    
    for (const config of COLLECTIONS_CONFIG) {
      console.log(`\n📦 Processing: ${config.name}`);
      
      const collection = db.collection(config.name);
      const docs = await collection.find({}).toArray();
      
      let collectionStats = { translated: 0, skipped: 0 };
      
      for (const doc of docs) {
        // Check if needs translation
        if (!needsTranslation(doc, config.fields)) {
          collectionStats.skipped++;
          stats.skipped++;
          continue;
        }
        
        console.log(`   → Translating: ${doc.name || doc.title || doc._id}`);
        
        const translations = await translateDocument(doc, config.fields);
        
        if (translations && Object.keys(translations).length > 0) {
          await collection.updateOne(
            { _id: doc._id },
            { $set: { translations } }
          );
          collectionStats.translated++;
          stats.success++;
          
          // Small delay between translations to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          stats.failed++;
        }
      }
      
      console.log(`   ✅ Translated: ${collectionStats.translated}, Skipped: ${collectionStats.skipped}`);
    }
    
  } catch (error) {
    console.error('❌ Translation job error:', error);
  } finally {
    isRunning = false;
    lastRunTime = new Date();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TRANSLATION JOB COMPLETED');
  console.log(`   ✅ Success: ${stats.success}`);
  console.log(`   ❌ Failed: ${stats.failed}`);
  console.log(`   ⏭️ Skipped: ${stats.skipped}`);
  console.log('='.repeat(60) + '\n');
  
  return stats;
}

/**
 * Start the 12-hour scheduler
 */
export function startTranslationScheduler() {
  const TWELVE_HOURS = 12 * 60 * 60 * 1000; // 12 hours in ms
  
  console.log('🕐 Translation Scheduler Started');
  console.log(`   → Next run in 12 hours`);
  console.log(`   → Or run manually: POST /api/admin/translate-all`);
  
  // Run immediately on start (optional - comment out if not needed)
  // setTimeout(() => runTranslationJob(), 5000);
  
  // Schedule every 12 hours
  setInterval(async () => {
    console.log('\n⏰ Scheduled translation job triggered');
    await runTranslationJob();
  }, TWELVE_HOURS);
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    isRunning,
    lastRunTime,
    nextRunTime: lastRunTime 
      ? new Date(lastRunTime.getTime() + 12 * 60 * 60 * 1000) 
      : null
  };
}
