import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

async function checkTranslations() {
  console.log('🔍 Kiểm tra tình trạng translations...\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công\n');

    // Get Translation model
    const TranslationSchema = new mongoose.Schema({
      key: String,
      language: String,
      namespace: String,
      value: String,
      status: String
    });
    
    const Translation = mongoose.models.Translation || mongoose.model('Translation', TranslationSchema);

    // 1. Check database stats
    console.log('📊 THỐNG KÊ DATABASE:');
    console.log('=' .repeat(50));
    
    const langStats = await Translation.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nSố lượng translations theo ngôn ngữ:');
    langStats.forEach((stat: any) => {
      console.log(`  ${stat._id}: ${stat.count} translations`);
    });

    // 2. Check namespace coverage per language
    console.log('\n📁 NAMESPACE COVERAGE:');
    console.log('=' .repeat(50));
    
    const namespaceStats = await Translation.aggregate([
      { $group: { _id: { lang: '$language', ns: '$namespace' }, count: { $sum: 1 } } },
      { $sort: { '_id.lang': 1, '_id.ns': 1 } }
    ]);

    const coverage: Record<string, Record<string, number>> = {};
    namespaceStats.forEach((stat: any) => {
      if (!coverage[stat._id.lang]) {
        coverage[stat._id.lang] = {};
      }
      coverage[stat._id.lang][stat._id.ns] = stat.count;
    });

    const allNamespaces = ['common', 'auth', 'products', 'projects', 'news', 'contact', 'calculator', 'admin', 'home'];
    const allLanguages = ['vi', 'en', 'ko', 'ja', 'zh', 'de', 'fr', 'es'];

    console.log('\nBảng coverage (✅ = có, ❌ = thiếu):');
    console.log('\nNamespace     | VI | EN | KO | JA | ZH | DE | FR | ES |');
    console.log('--------------|----|----|----|----|----|----|----|----|');
    
    allNamespaces.forEach(ns => {
      let row = `${ns.padEnd(13)} |`;
      allLanguages.forEach(lang => {
        const count = coverage[lang]?.[ns] || 0;
        row += count > 0 ? ` ${count.toString().padStart(2)} |` : ' ❌ |';
      });
      console.log(row);
    });

    // 3. Check file-based translations
    console.log('\n\n📂 KIỂM TRA FILE LOCALE:');
    console.log('=' .repeat(50));
    
    const localesDir = path.join(process.cwd(), 'locales');
    
    for (const lang of allLanguages) {
      const langDir = path.join(localesDir, lang);
      if (!fs.existsSync(langDir)) {
        console.log(`\n❌ Thư mục ${lang}/ không tồn tại`);
        continue;
      }
      
      console.log(`\n📁 ${lang.toUpperCase()}:`);
      
      for (const ns of allNamespaces) {
        const filePath = path.join(langDir, `${ns}.json`);
        if (!fs.existsSync(filePath)) {
          console.log(`  ❌ ${ns}.json - KHÔNG TỒN TẠI`);
          continue;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        const keys = countKeys(data);
        const emptyKeys = countEmptyKeys(data);
        
        if (emptyKeys > 0) {
          console.log(`  ⚠️  ${ns}.json - ${keys} keys (${emptyKeys} trống)`);
        } else if (keys === 0) {
          console.log(`  ❌ ${ns}.json - TRỐNG`);
        } else {
          console.log(`  ✅ ${ns}.json - ${keys} keys`);
        }
      }
    }

    // 4. Summary
    console.log('\n\n📋 TÓM TẮT:');
    console.log('=' .repeat(50));
    
    const totalInDB = await Translation.countDocuments();
    console.log(`\n📊 Tổng trong DB: ${totalInDB} translations`);
    
    const missingLangs: string[] = [];
    const incompleteLangs: string[] = [];
    
    allLanguages.forEach(lang => {
      const langCoverage = coverage[lang] || {};
      const coveredNamespaces = Object.keys(langCoverage).length;
      
      if (coveredNamespaces === 0) {
        missingLangs.push(lang);
      } else if (coveredNamespaces < allNamespaces.length) {
        incompleteLangs.push(`${lang} (${coveredNamespaces}/${allNamespaces.length} namespaces)`);
      }
    });

    if (missingLangs.length > 0) {
      console.log(`\n❌ Ngôn ngữ thiếu hoàn toàn: ${missingLangs.join(', ')}`);
    }
    
    if (incompleteLangs.length > 0) {
      console.log(`\n⚠️  Ngôn ngữ chưa hoàn chỉnh:`);
      incompleteLangs.forEach(l => console.log(`   - ${l}`));
    }

    await mongoose.disconnect();
    console.log('\n✅ Hoàn tất kiểm tra');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

function countKeys(obj: any, prefix = ''): number {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key], `${prefix}${key}.`);
    } else {
      count++;
    }
  }
  return count;
}

function countEmptyKeys(obj: any): number {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countEmptyKeys(obj[key]);
    } else if (obj[key] === '' || obj[key] === null) {
      count++;
    }
  }
  return count;
}

checkTranslations();
