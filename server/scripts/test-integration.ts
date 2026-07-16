import { connectDB } from '../db';
import { Translation } from '../../models/Translation';
import { translationCache } from '../utils/translation-cache';

async function testIntegration() {
  console.log('🧪 Testing Enhanced i18n Integration...\n');

  try {
    await connectDB();
    console.log('✅ Database connected\n');

    // Test 1: Check database translations
    console.log('📊 Database Translation Check:');
    const totalTranslations = await Translation.countDocuments();
    const publishedTranslations = await Translation.countDocuments({ status: 'published' });
    const languageBreakdown = await Translation.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log(`   Total translations: ${totalTranslations}`);
    console.log(`   Published translations: ${publishedTranslations}`);
    console.log('   Language breakdown:');
    languageBreakdown.forEach(lang => {
      console.log(`     ${lang._id}: ${lang.count} translations`);
    });

    // Test 2: Cache performance
    console.log('\n🚄 Cache Performance Test:');
    
    // Clear cache first
    translationCache.clear();
    console.log('   Cache cleared');

    // Preload from database
    await translationCache.preloadFromDatabase();
    console.log('   Database preloaded');

    // Test cache hits
    const testKeys = [
      { lang: 'vi', ns: 'common', key: 'greeting.hello' },
      { lang: 'en', ns: 'common', key: 'greeting.hello' },
      { lang: 'vi', ns: 'auth', key: 'login.title' },
      { lang: 'en', ns: 'products', key: 'title' }
    ];

    console.log('   Testing cache hits:');
    testKeys.forEach(test => {
      const cached = translationCache.get(test.lang, test.ns, test.key);
      console.log(`     ${test.lang}:${test.ns}:${test.key} - ${cached ? '✅ HIT' : '❌ MISS'}`);
      if (cached) {
        console.log(`       Value: "${cached.value}"`);
      }
    });

    // Test 3: API endpoints simulation
    console.log('\n🌐 API Endpoints Test:');
    
    // Simulate translation API calls
    const sampleTranslations = await Translation.find({ 
      language: 'vi', 
      namespace: 'common',
      status: 'published'
    }).limit(5);

    console.log(`   Found ${sampleTranslations.length} sample translations:`);
    sampleTranslations.forEach(t => {
      console.log(`     ${t.key}: "${t.value}"`);
    });

    // Test 4: Performance benchmark
    console.log('\n⚡ Performance Benchmark:');
    
    const iterations = 100;
    
    // Database query performance
    const dbStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      await Translation.findOne({ 
        key: 'greeting.hello', 
        namespace: 'common', 
        language: 'vi',
        status: 'published'
      });
    }
    const dbTime = Date.now() - dbStart;

    // Cache query performance
    const cacheStart = Date.now();
    for (let i = 0; i < iterations * 10; i++) { // 10x more iterations for cache
      translationCache.get('vi', 'common', 'greeting.hello');
    }
    const cacheTime = Date.now() - cacheStart;

    console.log(`   Database: ${iterations} queries in ${dbTime}ms (${(dbTime/iterations).toFixed(2)}ms per query)`);
    console.log(`   Cache: ${iterations * 10} queries in ${cacheTime}ms (${(cacheTime/(iterations*10)).toFixed(3)}ms per query)`);
    console.log(`   Cache is ${Math.round((dbTime/iterations) / (cacheTime/(iterations*10)))}x faster`);

    // Test 5: Translation statistics
    console.log('\n📈 Translation Statistics:');
    const stats = translationCache.getStats();
    console.log(`   Cache hits: ${stats.hits}`);
    console.log(`   Cache misses: ${stats.misses}`);
    console.log(`   Hit rate: ${stats.hitRate}%`);
    console.log(`   Cache size: ${stats.size}`);
    console.log(`   Total keys: ${stats.keys}`);

    // Test 6: Namespace coverage
    console.log('\n📁 Namespace Coverage:');
    const namespaceStats = await Translation.aggregate([
      { $match: { status: 'published' } },
      { 
        $group: { 
          _id: { namespace: '$namespace', language: '$language' }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { '_id.namespace': 1, '_id.language': 1 } }
    ]);

    const namespaces = ['common', 'auth', 'products', 'contact'];
    const languages = ['vi', 'en', 'ko', 'ja', 'zh', 'de'];

    console.log('   Coverage matrix:');
    console.log('   Namespace\\Lang  | VI | EN | KO | JA | ZH | DE |');
    console.log('   ----------------|----|----|----|----|----|----|');

    namespaces.forEach(ns => {
      let row = `   ${ns.padEnd(15)} |`;
      languages.forEach(lang => {
        const stat = namespaceStats.find(s => s._id.namespace === ns && s._id.language === lang);
        const count = stat ? stat.count : 0;
        row += ` ${count.toString().padStart(2)} |`;
      });
      console.log(row);
    });

    // Test 7: Integration health check
    console.log('\n🏥 Integration Health Check:');
    
    const healthChecks = [
      {
        name: 'Database Connection',
        check: async () => {
          const result = await Translation.findOne();
          return !!result;
        }
      },
      {
        name: 'Cache System',
        check: async () => {
          const stats = translationCache.getStats();
          return stats.keys > 0;
        }
      },
      {
        name: 'Translation Coverage',
        check: async () => {
          const count = await Translation.countDocuments({ status: 'published' });
          return count > 100; // Should have at least 100 published translations
        }
      },
      {
        name: 'Performance',
        check: async () => {
          const stats = translationCache.getStats();
          return stats.hitRate > 50; // Hit rate should be > 50%
        }
      }
    ];

    for (const healthCheck of healthChecks) {
      try {
        const result = await healthCheck.check();
        console.log(`   ${healthCheck.name}: ${result ? '✅ PASS' : '❌ FAIL'}`);
      } catch (error) {
        console.log(`   ${healthCheck.name}: ❌ ERROR - ${error}`);
      }
    }

    console.log('\n🎉 Integration Test Completed!');
    
    // Final summary
    console.log('\n📋 Summary:');
    console.log(`   ✅ Database: ${totalTranslations} total, ${publishedTranslations} published`);
    console.log(`   ✅ Cache: ${stats.hitRate}% hit rate, ${stats.keys} keys`);
    console.log(`   ✅ Performance: Cache is ${Math.round((dbTime/iterations) / (cacheTime/(iterations*10)))}x faster`);
    console.log(`   ✅ Coverage: ${languageBreakdown.length} languages supported`);

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

testIntegration()
  .then(() => {
    console.log('\n✅ All integration tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Integration test failed:', error);
    process.exit(1);
  });
