/**
 * Add translations for product features and specifications
 * Run: npx tsx server/scripts/add-features-translations.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

// Feature translations mapping
const featureTranslations: Record<string, Record<string, string>> = {
  // Common features
  'Tích hợp AI thông minh': {
    en: 'Smart AI Integration',
    ko: '스마트 AI 통합',
    ja: 'スマートAI統合',
    zh: '智能AI集成',
    de: 'Intelligente KI-Integration'
  },
  'Hiệu suất cao 98.4%': {
    en: 'High efficiency 98.4%',
    ko: '고효율 98.4%',
    ja: '高効率98.4%',
    zh: '高效率98.4%',
    de: 'Hohe Effizienz 98.4%'
  },
  'Kết nối WiFi/4G': {
    en: 'WiFi/4G Connectivity',
    ko: 'WiFi/4G 연결',
    ja: 'WiFi/4G接続',
    zh: 'WiFi/4G连接',
    de: 'WiFi/4G-Konnektivität'
  },
  'Chống sét tích hợp': {
    en: 'Built-in Lightning Protection',
    ko: '내장 낙뢰 보호',
    ja: '内蔵雷保護',
    zh: '内置防雷保护',
    de: 'Integrierter Blitzschutz'
  },
  'Thiết kế nhỏ gọn': {
    en: 'Compact Design',
    ko: '컴팩트 디자인',
    ja: 'コンパクトデザイン',
    zh: '紧凑设计',
    de: 'Kompaktes Design'
  },
  'Bảo hành 10 năm': {
    en: '10 Years Warranty',
    ko: '10년 보증',
    ja: '10年保証',
    zh: '10年质保',
    de: '10 Jahre Garantie'
  },
  'Bảo hành 25 năm': {
    en: '25 Years Warranty',
    ko: '25년 보증',
    ja: '25年保証',
    zh: '25年质保',
    de: '25 Jahre Garantie'
  },
  'Giám sát từ xa': {
    en: 'Remote Monitoring',
    ko: '원격 모니터링',
    ja: 'リモート監視',
    zh: '远程监控',
    de: 'Fernüberwachung'
  },
  'Hiệu suất chuyển đổi cao': {
    en: 'High Conversion Efficiency',
    ko: '높은 변환 효율',
    ja: '高変換効率',
    zh: '高转换效率',
    de: 'Hohe Umwandlungseffizienz'
  },
  'Chống nước IP65': {
    en: 'IP65 Waterproof',
    ko: 'IP65 방수',
    ja: 'IP65防水',
    zh: 'IP65防水',
    de: 'IP65 Wasserdicht'
  },
  'Tích hợp MPPT': {
    en: 'MPPT Integration',
    ko: 'MPPT 통합',
    ja: 'MPPT統合',
    zh: 'MPPT集成',
    de: 'MPPT-Integration'
  },
  'Tuổi thọ pin cao': {
    en: 'Long Battery Life',
    ko: '긴 배터리 수명',
    ja: '長いバッテリー寿命',
    zh: '电池寿命长',
    de: 'Lange Batterielebensdauer'
  },
  '6000+ chu kỳ sạc': {
    en: '6000+ Charge Cycles',
    ko: '6000+ 충전 사이클',
    ja: '6000+充電サイクル',
    zh: '6000+充电循环',
    de: '6000+ Ladezyklen'
  },
  'An toàn LiFePO4': {
    en: 'Safe LiFePO4 Chemistry',
    ko: '안전한 LiFePO4 화학',
    ja: '安全なLiFePO4化学',
    zh: '安全LiFePO4化学',
    de: 'Sichere LiFePO4-Chemie'
  },
  'Lắp đặt dễ dàng': {
    en: 'Easy Installation',
    ko: '쉬운 설치',
    ja: '簡単設置',
    zh: '安装简便',
    de: 'Einfache Installation'
  },
  'Vật liệu nhôm cao cấp': {
    en: 'Premium Aluminum Material',
    ko: '프리미엄 알루미늄 소재',
    ja: 'プレミアムアルミニウム素材',
    zh: '优质铝材料',
    de: 'Premium-Aluminiummaterial'
  },
  'Chống ăn mòn': {
    en: 'Corrosion Resistant',
    ko: '부식 방지',
    ja: '耐腐食性',
    zh: '防腐蚀',
    de: 'Korrosionsbeständig'
  },
  'Phù hợp mọi loại mái': {
    en: 'Suitable for All Roof Types',
    ko: '모든 지붕 유형에 적합',
    ja: 'あらゆる屋根タイプに対応',
    zh: '适用于所有屋顶类型',
    de: 'Geeignet für alle Dachtypen'
  }
};

// Specification translations
const specTranslations: Record<string, Record<string, string>> = {
  'Công suất AC': { en: 'AC Power', ko: 'AC 전력', ja: 'AC電力', zh: 'AC功率', de: 'AC-Leistung' },
  'Hiệu suất': { en: 'Efficiency', ko: '효율', ja: '効率', zh: '效率', de: 'Effizienz' },
  'Điện áp đầu vào': { en: 'Input Voltage', ko: '입력 전압', ja: '入力電圧', zh: '输入电压', de: 'Eingangsspannung' },
  'Điện áp đầu ra': { en: 'Output Voltage', ko: '출력 전압', ja: '出力電圧', zh: '输出电压', de: 'Ausgangsspannung' },
  'Bảo hành': { en: 'Warranty', ko: '보증', ja: '保証', zh: '质保', de: 'Garantie' },
  'năm': { en: 'years', ko: '년', ja: '年', zh: '年', de: 'Jahre' },
  'Công suất': { en: 'Power', ko: '전력', ja: '電力', zh: '功率', de: 'Leistung' },
  'Dung lượng': { en: 'Capacity', ko: '용량', ja: '容量', zh: '容量', de: 'Kapazität' },
  'Điện áp': { en: 'Voltage', ko: '전압', ja: '電圧', zh: '电压', de: 'Spannung' },
  'Trọng lượng': { en: 'Weight', ko: '무게', ja: '重量', zh: '重量', de: 'Gewicht' },
  'Kích thước': { en: 'Dimensions', ko: '크기', ja: 'サイズ', zh: '尺寸', de: 'Abmessungen' }
};

function translateFeature(feature: string, lang: string): string {
  // Direct match
  if (featureTranslations[feature] && featureTranslations[feature][lang]) {
    return featureTranslations[feature][lang];
  }
  
  // Partial match for features with dynamic values
  for (const [key, translations] of Object.entries(featureTranslations)) {
    if (feature.includes(key.replace(/[\d.%]+/g, '').trim())) {
      // Extract numbers and replace
      const numbers = feature.match(/[\d.%]+/g) || [];
      let translated = translations[lang] || feature;
      numbers.forEach(num => {
        if (!translated.includes(num)) {
          translated = translated.replace(/[\d.%]+/, num);
        }
      });
      return translated;
    }
  }
  
  return feature; // Return original if no translation found
}

function translateSpecifications(specs: string, lang: string): string {
  let translated = specs;
  
  for (const [vi, translations] of Object.entries(specTranslations)) {
    if (translations[lang]) {
      translated = translated.replace(new RegExp(vi, 'g'), translations[lang]);
    }
  }
  
  return translated;
}

async function main() {
  console.log('🌍 Adding features and specifications translations...');
  console.log('=====================================================');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const productsCol = db.collection('products');
    const products = await productsCol.find({}).toArray();

    console.log(`\n📦 Found ${products.length} products to update...`);

    const languages = ['en', 'ko', 'ja', 'zh', 'de'];

    for (const product of products) {
      console.log(`\n  → ${product.name}`);
      
      const existingTranslations = product.translations || {};
      
      for (const lang of languages) {
        if (!existingTranslations[lang]) {
          existingTranslations[lang] = {};
        }
        
        // Translate features
        if (product.features && Array.isArray(product.features)) {
          existingTranslations[lang].features = product.features.map(
            (f: string) => translateFeature(f, lang)
          );
          console.log(`    ✓ ${lang}: ${existingTranslations[lang].features.length} features`);
        }
        
        // Translate specifications
        if (product.specifications) {
          existingTranslations[lang].specifications = translateSpecifications(
            product.specifications,
            lang
          );
          console.log(`    ✓ ${lang}: specifications translated`);
        }
      }
      
      // Update product
      await productsCol.updateOne(
        { _id: product._id },
        { $set: { translations: existingTranslations } }
      );
    }

    console.log('\n=====================================================');
    console.log('🎉 All features and specifications translations added!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
