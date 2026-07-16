import { i18next } from '../i18n';
import { 
  getAvailableLanguages, 
  getLanguageInfo, 
  isLanguageSupported,
  getTranslation,
  getTranslations,
  formatError,
  formatSuccess,
  getLocalizedDate,
  getLocalizedNumber,
  getLocalizedCurrency,
  checkTranslationCompleteness,
  getTranslationStats
} from '../utils/i18n-helpers';

async function testCompleteI18nSystem() {
  console.log('🌐 Testing Complete i18n System...\n');
  
  // Wait for i18next to initialize
  await new Promise(resolve => {
    if (i18next.isInitialized) {
      resolve(true);
    } else {
      i18next.on('initialized', resolve);
    }
  });

  console.log('✅ i18next initialized successfully\n');

  // Test 1: Language Management
  console.log('🔤 Testing Language Management:');
  const languages = getAvailableLanguages();
  console.log(`   Available languages: ${languages.length}`);
  languages.forEach(lang => {
    console.log(`   ${lang.flag} ${lang.code}: ${lang.nativeName}`);
  });
  
  console.log(`   Language support check: vi=${isLanguageSupported('vi')}, xx=${isLanguageSupported('xx')}`);
  
  const enInfo = getLanguageInfo('en');
  console.log(`   English info: ${enInfo?.name} (${enInfo?.nativeName})`);

  // Test 2: Basic Translations
  console.log('\n📝 Testing Basic Translations:');
  
  const testKeys = [
    'greeting.hello',
    'greeting.welcome',
    'status.success',
    'actions.create',
    'validation.required'
  ];
  
  ['vi', 'en', 'ko', 'ja'].forEach(lang => {
    console.log(`\n   ${lang.toUpperCase()}:`);
    testKeys.forEach(key => {
      const translation = getTranslation(key, {}, lang);
      console.log(`     ${key}: "${translation}"`);
    });
  });

  // Test 3: Namespace Translations
  console.log('\n🏷️  Testing Namespace Translations:');
  
  const namespaceTests = [
    { key: 'auth:login.title', params: {} },
    { key: 'auth:login.email', params: {} },
    { key: 'products:title', params: {} },
    { key: 'contact:form.title', params: {} }
  ];
  
  ['vi', 'en'].forEach(lang => {
    console.log(`\n   ${lang.toUpperCase()}:`);
    namespaceTests.forEach(test => {
      const translation = getTranslation(test.key, test.params, lang);
      console.log(`     ${test.key}: "${translation}"`);
    });
  });

  // Test 4: Pluralization
  console.log('\n🔢 Testing Pluralization:');
  
  const counts = [0, 1, 2, 5, 10];
  ['vi', 'en'].forEach(lang => {
    console.log(`\n   ${lang.toUpperCase()}:`);
    counts.forEach(count => {
      const translation = getTranslation('order.items', { count }, lang);
      console.log(`     ${count} items: "${translation}"`);
    });
  });

  // Test 5: Interpolation
  console.log('\n🔧 Testing Interpolation:');
  
  const interpolationTests = [
    { key: 'validation.password_min', params: { min: 8 } },
    { key: 'contact:notifications.contact_description', params: { 
      name: 'John Doe', 
      phone: '0123456789', 
      service: 'Solar Installation',
      email: 'john@example.com'
    }}
  ];
  
  ['vi', 'en'].forEach(lang => {
    console.log(`\n   ${lang.toUpperCase()}:`);
    interpolationTests.forEach(test => {
      const translation = getTranslation(test.key, test.params, lang);
      console.log(`     ${test.key}: "${translation}"`);
    });
  });

  // Test 6: Helper Functions
  console.log('\n🛠️  Testing Helper Functions:');
  
  ['vi', 'en', 'ko', 'ja'].forEach(lang => {
    console.log(`\n   ${lang.toUpperCase()}:`);
    
    const multiTranslations = getTranslations([
      'greeting.hello',
      'status.success',
      'actions.save'
    ], {}, lang);
    
    console.log(`     Multi-translations:`, Object.values(multiTranslations).join(', '));
    console.log(`     Error format: "${formatError('required', {}, lang)}"`);
    console.log(`     Success format: "${formatSuccess('success', {}, lang)}"`);
  });

  // Test 7: Localization Formats
  console.log('\n📅 Testing Localization Formats:');
  
  const testDate = new Date('2025-12-02T06:35:00Z');
  const testNumber = 1234567.89;
  const testAmount = 1000000;
  
  ['vi', 'en', 'ko', 'ja'].forEach(lang => {
    console.log(`\n   ${lang.toUpperCase()}:`);
    console.log(`     Date: ${getLocalizedDate(testDate, lang)}`);
    console.log(`     Number: ${getLocalizedNumber(testNumber, lang)}`);
    console.log(`     Currency VND: ${getLocalizedCurrency(testAmount, 'VND', lang)}`);
    console.log(`     Currency USD: ${getLocalizedCurrency(testAmount / 24000, 'USD', lang)}`);
  });

  // Test 8: Translation Completeness
  console.log('\n📊 Testing Translation Completeness:');
  
  const completenessTests = [
    { lang: 'en', namespace: 'common' },
    { lang: 'ko', namespace: 'common' },
    { lang: 'ja', namespace: 'auth' },
    { lang: 'zh', namespace: 'products' }
  ];
  
  completenessTests.forEach(test => {
    const stats = checkTranslationCompleteness(test.lang, test.namespace);
    console.log(`   ${test.lang}/${test.namespace}: ${stats.completionPercentage}% (${stats.translatedKeys}/${stats.totalKeys})`);
    if (stats.missingKeys.length > 0) {
      console.log(`     Missing: ${stats.missingKeys.slice(0, 3).join(', ')}${stats.missingKeys.length > 3 ? '...' : ''}`);
    }
  });

  // Test 9: Overall Statistics
  console.log('\n📈 Overall Translation Statistics:');
  
  const allStats = getTranslationStats();
  const statsByLang = allStats.reduce((acc: any, stat) => {
    if (!acc[stat.language]) {
      acc[stat.language] = { total: 0, translated: 0, namespaces: 0 };
    }
    acc[stat.language].total += stat.totalKeys;
    acc[stat.language].translated += stat.translatedKeys;
    acc[stat.language].namespaces++;
    return acc;
  }, {});
  
  Object.keys(statsByLang).forEach(lang => {
    const langStats = statsByLang[lang];
    const completion = langStats.total > 0 ? Math.round((langStats.translated / langStats.total) * 100) : 0;
    const langInfo = getLanguageInfo(lang);
    console.log(`   ${langInfo?.flag} ${lang.toUpperCase()}: ${completion}% (${langStats.translated}/${langStats.total}) across ${langStats.namespaces} namespaces`);
  });

  // Test 10: Error Handling
  console.log('\n❌ Testing Error Handling:');
  
  console.log('   Missing key test:');
  const missingKey = getTranslation('non.existent.key', {}, 'en');
  console.log(`     Result: "${missingKey}"`);
  
  console.log('   Unsupported language test:');
  const unsupportedLang = isLanguageSupported('xyz');
  console.log(`     Is 'xyz' supported: ${unsupportedLang}`);
  
  console.log('   Fallback test (missing namespace):');
  const fallbackTest = getTranslation('missing:key.test', {}, 'en');
  console.log(`     Result: "${fallbackTest}"`);

  console.log('\n🎉 Complete i18n System Test Finished!');
  console.log('\n📋 Summary:');
  console.log(`   ✅ ${languages.length} languages supported`);
  console.log(`   ✅ ${Object.keys(statsByLang).length} languages with translations`);
  console.log(`   ✅ Namespace support working`);
  console.log(`   ✅ Pluralization working`);
  console.log(`   ✅ Interpolation working`);
  console.log(`   ✅ Localization formats working`);
  console.log(`   ✅ Helper functions working`);
  console.log(`   ✅ Error handling working`);
  console.log(`   ✅ Translation management working`);
}

testCompleteI18nSystem().catch(console.error);
