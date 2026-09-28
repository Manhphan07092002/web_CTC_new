import { translationCache } from '../utils/translation-cache';
import { connectDB } from '../db';
import { logger } from "../../utils/logger";

async function reloadTranslations() {
  logger.log('🔄 Reloading translations...\n');

  try {
    await connectDB();
    logger.log('✅ Database connected');

    // Clear all cache
    translationCache.clear();
    logger.log('🗑️  Cache cleared');

    // Warm up file-based translations
    await translationCache.warmUp();
    logger.log('📁 File-based translations loaded');

    // Preload database translations
    await translationCache.preloadFromDatabase();
    logger.log('🗄️  Database translations preloaded');

    // Get statistics
    const stats = translationCache.getStats();
    logger.log('\n📊 Cache Statistics:');
    logger.log(`   Total keys: ${stats.keys}`);
    logger.log(`   Cache size: ${stats.size}`);
    logger.log(`   Hit rate: ${stats.hitRate}%`);

    logger.log('\n✅ Translations reloaded successfully!');
    logger.log('🌐 Website should now display updated translations');

  } catch (error) {
    logger.error('❌ Failed to reload translations:', error);
    process.exit(1);
  }
}

reloadTranslations();
