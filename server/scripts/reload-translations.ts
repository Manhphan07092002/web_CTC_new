import { translationCache } from '../utils/translation-cache';
import { connectDB } from '../db';

async function reloadTranslations() {
  console.log('🔄 Reloading translations...\n');

  try {
    await connectDB();
    console.log('✅ Database connected');

    // Clear all cache
    translationCache.clear();
    console.log('🗑️  Cache cleared');

    // Warm up file-based translations
    await translationCache.warmUp();
    console.log('📁 File-based translations loaded');

    // Preload database translations
    await translationCache.preloadFromDatabase();
    console.log('🗄️  Database translations preloaded');

    // Get statistics
    const stats = translationCache.getStats();
    console.log('\n📊 Cache Statistics:');
    console.log(`   Total keys: ${stats.keys}`);
    console.log(`   Cache size: ${stats.size}`);
    console.log(`   Hit rate: ${stats.hitRate}%`);

    console.log('\n✅ Translations reloaded successfully!');
    console.log('🌐 Website should now display updated translations');

  } catch (error) {
    console.error('❌ Failed to reload translations:', error);
    process.exit(1);
  }
}

reloadTranslations();
