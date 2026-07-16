import { i18next } from '../i18n';

async function testI18n() {
  console.log('🌐 Testing i18n configuration...\n');
  
  // Wait for i18next to initialize
  await new Promise(resolve => {
    if (i18next.isInitialized) {
      resolve(true);
    } else {
      i18next.on('initialized', resolve);
    }
  });

  console.log('✅ i18next initialized successfully');
  console.log('📋 Available languages:', i18next.languages);
  console.log('🔤 Current language:', i18next.language);
  console.log('📂 Loaded namespaces:', i18next.options.ns);
  
  console.log('\n🧪 Testing translations:');
  
  // Test Vietnamese (default)
  i18next.changeLanguage('vi');
  console.log('\n🇻🇳 Vietnamese:');
  console.log('  greeting.hello:', i18next.t('greeting.hello'));
  console.log('  greeting.welcome:', i18next.t('greeting.welcome'));
  console.log('  auth:login.title:', i18next.t('auth:login.title'));
  console.log('  products:title:', i18next.t('products:title'));
  console.log('  order.items (1):', i18next.t('order.items', { count: 1 }));
  console.log('  order.items (5):', i18next.t('order.items', { count: 5 }));
  
  // Test English
  i18next.changeLanguage('en');
  console.log('\n🇺🇸 English:');
  console.log('  greeting.hello:', i18next.t('greeting.hello'));
  console.log('  greeting.welcome:', i18next.t('greeting.welcome'));
  console.log('  auth:login.title:', i18next.t('auth:login.title'));
  console.log('  products:title:', i18next.t('products:title'));
  console.log('  order.items (1):', i18next.t('order.items', { count: 1 }));
  console.log('  order.items (5):', i18next.t('order.items', { count: 5 }));
  
  // Test interpolation
  console.log('\n🔧 Testing interpolation:');
  console.log('  validation.password_min:', i18next.t('validation.password_min', { min: 8 }));
  
  // Test missing keys (should fallback)
  console.log('\n❓ Testing missing keys:');
  console.log('  missing.key:', i18next.t('missing.key'));
  
  console.log('\n✅ i18n test completed successfully!');
}

testI18n().catch(console.error);
