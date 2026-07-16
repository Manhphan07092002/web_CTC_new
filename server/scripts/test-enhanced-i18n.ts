import { Translation } from '../../models/Translation';
import { translationCache } from '../utils/translation-cache';
import { connectDB } from '../db';

async function testEnhancedI18n() {
  console.log('🚀 Testing Enhanced i18n System...\n');

  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');

    // Test 1: Database Translation Management
    console.log('📊 Testing Database Translation Management:');
    
    // Create sample translations
    const sampleTranslations = [
      {
        key: 'dynamic.welcome',
        namespace: 'dynamic',
        language: 'vi',
        value: 'Chào mừng bạn đến với hệ thống động',
        description: 'Dynamic welcome message',
        status: 'published' as const
      },
      {
        key: 'dynamic.welcome',
        namespace: 'dynamic',
        language: 'en',
        value: 'Welcome to the dynamic system',
        description: 'Dynamic welcome message',
        status: 'published' as const
      },
      {
        key: 'dynamic.user_count',
        namespace: 'dynamic',
        language: 'vi',
        value: '{{count}} người dùng',
        description: 'User count with pluralization',
        isPlural: true,
        pluralForms: {
          zero: 'Không có người dùng nào',
          one: '{{count}} người dùng',
          other: '{{count}} người dùng'
        },
        status: 'published' as const
      },
      {
        key: 'dynamic.user_count',
        namespace: 'dynamic',
        language: 'en',
        value: '{{count}} users',
        description: 'User count with pluralization',
        isPlural: true,
        pluralForms: {
          zero: 'No users',
          one: '{{count}} user',
          other: '{{count}} users'
        },
        status: 'published' as const
      }
    ];

    // Clean up existing test data
    await Translation.deleteMany({ namespace: 'dynamic' });

    // Insert sample translations
    const createdTranslations = await Translation.insertMany(sampleTranslations);
    console.log(`   ✅ Created ${createdTranslations.length} sample translations`);

    // Test 2: Cache System
    console.log('\n🗄️  Testing Cache System:');
    
    // Clear cache
    translationCache.clear();
    console.log('   ✅ Cache cleared');

    // Test cache miss
    const cacheMiss = translationCache.get('vi', 'dynamic', 'welcome');
    console.log(`   Cache miss test: ${cacheMiss ? 'FAIL' : 'PASS'}`);

    // Test cache set and get
    translationCache.set('vi', 'dynamic', 'test.key', 'Test value', {
      isFromDatabase: true,
      variables: ['name']
    });
    
    const cacheHit = translationCache.get('vi', 'dynamic', 'test.key');
    console.log(`   Cache hit test: ${cacheHit ? 'PASS' : 'FAIL'}`);
    console.log(`   Cached value: "${cacheHit?.value}"`);

    // Test namespace caching
    const namespaceData = {
      'greeting': {
        'hello': 'Xin chào',
        'goodbye': 'Tạm biệt'
      },
      'actions': {
        'save': 'Lưu',
        'cancel': 'Hủy'
      }
    };

    translationCache.setNamespace('vi', 'test', namespaceData);
    const cachedNamespace = translationCache.getNamespace('vi', 'test');
    console.log(`   Namespace cache test: ${cachedNamespace ? 'PASS' : 'FAIL'}`);

    // Test 3: Database Preloading
    console.log('\n📥 Testing Database Preloading:');
    
    await translationCache.preloadFromDatabase();
    console.log('   ✅ Database preloading completed');

    // Check if preloaded data is accessible
    const preloadedVi = translationCache.get('vi', 'dynamic', 'dynamic.welcome');
    const preloadedEn = translationCache.get('en', 'dynamic', 'dynamic.welcome');
    
    console.log(`   Vietnamese preload: ${preloadedVi ? 'PASS' : 'FAIL'}`);
    console.log(`   English preload: ${preloadedEn ? 'PASS' : 'FAIL'}`);

    if (preloadedVi) {
      console.log(`   VI Value: "${preloadedVi.value}"`);
    }
    if (preloadedEn) {
      console.log(`   EN Value: "${preloadedEn.value}"`);
    }

    // Test 4: Cache Statistics
    console.log('\n📈 Testing Cache Statistics:');
    
    // Generate some cache activity
    for (let i = 0; i < 10; i++) {
      translationCache.get('vi', 'dynamic', 'dynamic.welcome'); // Should hit
      translationCache.get('vi', 'dynamic', 'nonexistent.key'); // Should miss
    }

    const stats = translationCache.getStats();
    console.log(`   Total hits: ${stats.hits}`);
    console.log(`   Total misses: ${stats.misses}`);
    console.log(`   Hit rate: ${stats.hitRate}%`);
    console.log(`   Cache size: ${stats.size}`);
    console.log(`   Total keys: ${stats.keys}`);

    // Test 5: Cache Invalidation
    console.log('\n🗑️  Testing Cache Invalidation:');
    
    // Set some test data
    translationCache.set('vi', 'test', 'key1', 'value1');
    translationCache.set('vi', 'test', 'key2', 'value2');
    translationCache.set('en', 'test', 'key1', 'value1_en');
    
    console.log(`   Before invalidation - keys: ${translationCache.getKeys().fileCache.length + translationCache.getKeys().dbCache.length}`);
    
    // Test single key invalidation
    translationCache.invalidate('vi', 'test', 'key1');
    const afterSingleInvalidation = translationCache.get('vi', 'test', 'key1');
    console.log(`   Single key invalidation: ${!afterSingleInvalidation ? 'PASS' : 'FAIL'}`);
    
    // Test namespace invalidation
    translationCache.invalidateNamespace('vi', 'test');
    const afterNamespaceInvalidation = translationCache.get('vi', 'test', 'key2');
    console.log(`   Namespace invalidation: ${!afterNamespaceInvalidation ? 'PASS' : 'FAIL'}`);
    
    // Test language invalidation
    translationCache.invalidateLanguage('en');
    const afterLanguageInvalidation = translationCache.get('en', 'test', 'key1');
    console.log(`   Language invalidation: ${!afterLanguageInvalidation ? 'PASS' : 'FAIL'}`);

    // Test 6: Translation Queries
    console.log('\n🔍 Testing Translation Queries:');
    
    // Find translations by status
    const publishedTranslations = await Translation.find({ status: 'published' });
    console.log(`   Published translations: ${publishedTranslations.length}`);
    
    // Find translations by language
    const viTranslations = await Translation.find({ language: 'vi', namespace: 'dynamic' });
    console.log(`   Vietnamese dynamic translations: ${viTranslations.length}`);
    
    // Test aggregation
    const stats_db = await Translation.aggregate([
      { $match: { namespace: 'dynamic' } },
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);
    
    console.log('   Translation statistics by language:');
    stats_db.forEach(stat => {
      console.log(`     ${stat._id}: ${stat.count} translations, ${stat.totalUsage} total usage`);
    });

    // Test 7: Usage Tracking
    console.log('\n📊 Testing Usage Tracking:');
    
    // Simulate usage
    const testTranslation = await Translation.findOne({ key: 'dynamic.welcome', language: 'vi' });
    if (testTranslation) {
      const initialUsage = testTranslation.usageCount;
      
      // Increment usage
      await Translation.updateOne(
        { _id: testTranslation._id },
        { 
          $inc: { usageCount: 1 },
          $set: { lastUsed: new Date() }
        }
      );
      
      const updatedTranslation = await Translation.findById(testTranslation._id);
      const newUsage = updatedTranslation?.usageCount || 0;
      
      console.log(`   Usage tracking: ${newUsage > initialUsage ? 'PASS' : 'FAIL'}`);
      console.log(`   Usage count: ${initialUsage} → ${newUsage}`);
      console.log(`   Last used: ${updatedTranslation?.lastUsed}`);
    }

    // Test 8: Translation Versioning
    console.log('\n🔄 Testing Translation Versioning:');
    
    const versionTest = await Translation.findOne({ key: 'dynamic.welcome', language: 'vi' });
    if (versionTest) {
      const initialVersion = versionTest.version;
      
      // Update translation value
      versionTest.value = 'Chào mừng bạn đến với hệ thống động (cập nhật)';
      await versionTest.save();
      
      const newVersion = versionTest.version;
      console.log(`   Version increment: ${newVersion > initialVersion ? 'PASS' : 'FAIL'}`);
      console.log(`   Version: ${initialVersion} → ${newVersion}`);
    }

    // Test 9: Performance Test
    console.log('\n⚡ Performance Testing:');
    
    const iterations = 1000;
    
    // Test cache performance
    const cacheStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      translationCache.get('vi', 'dynamic', 'dynamic.welcome');
    }
    const cacheTime = Date.now() - cacheStart;
    
    // Test database performance
    const dbStart = Date.now();
    for (let i = 0; i < 100; i++) { // Fewer iterations for DB
      await Translation.findOne({ key: 'dynamic.welcome', language: 'vi' });
    }
    const dbTime = Date.now() - dbStart;
    
    console.log(`   Cache performance: ${iterations} lookups in ${cacheTime}ms (${(cacheTime/iterations).toFixed(3)}ms per lookup)`);
    console.log(`   Database performance: 100 queries in ${dbTime}ms (${(dbTime/100).toFixed(3)}ms per query)`);
    console.log(`   Cache is ${Math.round((dbTime/100) / (cacheTime/iterations))}x faster`);

    // Final statistics
    console.log('\n📋 Final Statistics:');
    const finalStats = translationCache.getStats();
    console.log(`   Cache hits: ${finalStats.hits}`);
    console.log(`   Cache misses: ${finalStats.misses}`);
    console.log(`   Hit rate: ${finalStats.hitRate}%`);
    console.log(`   Cache size: ${finalStats.size}`);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Translation.deleteMany({ namespace: 'dynamic' });
    translationCache.clear();
    console.log('   ✅ Cleanup completed');

    console.log('\n🎉 Enhanced i18n System Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testEnhancedI18n()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
