/**
 * Add translations manually without API calls
 * Run: npx tsx server/scripts/add-translations-manual.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

// Pre-translated data for Products
const productTranslations: Record<string, any> = {
  'Inverter Huawei Sun2000 5kWz': {
    en: { name: 'Huawei Sun2000 5kW Inverter', description: 'Huawei Sun2000 5kW grid-tied inverter with high efficiency and smart monitoring capabilities' },
    ko: { name: 'Huawei Sun2000 5kW 인버터', description: 'Huawei Sun2000 5kW 계통연계형 인버터, 고효율 및 스마트 모니터링 기능' },
    ja: { name: 'Huawei Sun2000 5kWインバーター', description: 'Huawei Sun2000 5kW系統連系インバーター、高効率でスマートモニタリング機能付き' },
    zh: { name: 'Huawei Sun2000 5kW逆变器', description: 'Huawei Sun2000 5kW并网逆变器，高效率，智能监控功能' },
    de: { name: 'Huawei Sun2000 5kW Wechselrichter', description: 'Huawei Sun2000 5kW Netz-Wechselrichter mit hoher Effizienz und Smart-Monitoring' }
  },
  'Inverter SMA Sunny Tripower 10kW': {
    en: { name: 'SMA Sunny Tripower 10kW Inverter', description: 'SMA Sunny Tripower 10kW three-phase inverter for commercial solar systems' },
    ko: { name: 'SMA Sunny Tripower 10kW 인버터', description: 'SMA Sunny Tripower 10kW 상업용 태양광 시스템용 3상 인버터' },
    ja: { name: 'SMA Sunny Tripower 10kWインバーター', description: 'SMA Sunny Tripower 10kW商業用太陽光発電システム向け三相インバーター' },
    zh: { name: 'SMA Sunny Tripower 10kW逆变器', description: 'SMA Sunny Tripower 10kW商用太阳能系统三相逆变器' },
    de: { name: 'SMA Sunny Tripower 10kW Wechselrichter', description: 'SMA Sunny Tripower 10kW Dreiphasen-Wechselrichter für gewerbliche Solaranlagen' }
  },
  'Tấm Pin Năng Lượng Mặt Trời 450W': {
    en: { name: '450W Solar Panel', description: 'High-efficiency 450W monocrystalline solar panel with 25-year warranty' },
    ko: { name: '450W 태양광 패널', description: '25년 보증의 고효율 450W 단결정 태양광 패널' },
    ja: { name: '450Wソーラーパネル', description: '25年保証付き高効率450W単結晶ソーラーパネル' },
    zh: { name: '450W太阳能电池板', description: '高效450W单晶太阳能电池板，25年质保' },
    de: { name: '450W Solarpanel', description: 'Hocheffizientes 450W monokristallines Solarpanel mit 25 Jahren Garantie' }
  },
  'Pin Lưu Trữ LiFePO4 100Ah': {
    en: { name: 'LiFePO4 100Ah Battery Storage', description: 'LiFePO4 lithium battery 100Ah for solar energy storage, 6000+ cycles' },
    ko: { name: 'LiFePO4 100Ah 배터리 저장장치', description: '태양광 에너지 저장용 LiFePO4 리튬 배터리 100Ah, 6000회 이상 사이클' },
    ja: { name: 'LiFePO4 100Ah蓄電池', description: '太陽光エネルギー貯蔵用LiFePO4リチウム電池100Ah、6000サイクル以上' },
    zh: { name: 'LiFePO4 100Ah储能电池', description: 'LiFePO4锂电池100Ah，用于太阳能储能，6000+循环' },
    de: { name: 'LiFePO4 100Ah Batteriespeicher', description: 'LiFePO4 Lithium-Batterie 100Ah für Solarenergiespeicherung, 6000+ Zyklen' }
  },
  'Phụ Kiện Giá Đỡ Mái Ngói': {
    en: { name: 'Roof Tile Mounting Accessories', description: 'Professional mounting accessories for tile roof solar panel installation' },
    ko: { name: '기와 지붕 설치 액세서리', description: '기와 지붕 태양광 패널 설치용 전문 마운팅 액세서리' },
    ja: { name: '瓦屋根取付アクセサリー', description: '瓦屋根ソーラーパネル設置用プロフェッショナル取付アクセサリー' },
    zh: { name: '瓦屋顶安装配件', description: '瓦屋顶太阳能电池板安装专业配件' },
    de: { name: 'Dachziegel-Montage-Zubehör', description: 'Professionelles Montagezubehör für Solarpanel-Installation auf Ziegeldächern' }
  }
};

// Pre-translated data for Projects
const projectTranslations: Record<string, any> = {
  'Hệ thống điện mặt trời mái nhà 5kW': {
    en: { title: '5kW Rooftop Solar System', location: 'Da Nang', description: 'Installation of 5kW rooftop solar power system for residential home in Da Nang' },
    ko: { title: '5kW 옥상 태양광 시스템', location: '다낭', description: '다낭 주거용 주택에 5kW 옥상 태양광 발전 시스템 설치' },
    ja: { title: '5kW屋上ソーラーシステム', location: 'ダナン', description: 'ダナンの住宅向け5kW屋上太陽光発電システムの設置' },
    zh: { title: '5kW屋顶太阳能系统', location: '岘港', description: '岘港住宅5kW屋顶太阳能发电系统安装' },
    de: { title: '5kW Dach-Solaranlage', location: 'Da Nang', description: 'Installation einer 5kW Dach-Solaranlage für Wohnhaus in Da Nang' }
  },
  'Nhà máy điện mặt trời 100kW': {
    en: { title: '100kW Solar Power Plant', location: 'Binh Duong', description: '100kW solar power plant project for industrial zone' },
    ko: { title: '100kW 태양광 발전소', location: '빈즈엉', description: '산업단지용 100kW 태양광 발전소 프로젝트' },
    ja: { title: '100kW太陽光発電所', location: 'ビンズオン', description: '工業団地向け100kW太陽光発電所プロジェクト' },
    zh: { title: '100kW太阳能发电站', location: '平阳', description: '工业区100kW太阳能发电站项目' },
    de: { title: '100kW Solarkraftwerk', location: 'Binh Duong', description: '100kW Solarkraftwerk-Projekt für Industriegebiet' }
  }
};

// Pre-translated data for News
const newsTranslations: Record<string, any> = {
  'Công nghệ pin mặt trời mới đạt hiệu suất 25%': {
    en: { title: 'New Solar Cell Technology Achieves 25% Efficiency', excerpt: 'New generation solar cell technology with energy conversion efficiency up to 25%, opening a new era for renewable energy.', content: 'Scientists have successfully developed solar cell technology with energy conversion efficiency up to 25%. This is an important step in reducing costs and increasing the efficiency of solar energy.' },
    ko: { title: '새로운 태양전지 기술 25% 효율 달성', excerpt: '에너지 변환 효율 25%의 차세대 태양전지 기술, 재생에너지의 새 시대를 열다.', content: '과학자들이 에너지 변환 효율 25%의 태양전지 기술 개발에 성공했습니다. 이는 태양에너지 비용 절감과 효율 향상의 중요한 진전입니다.' },
    ja: { title: '新型太陽電池技術が25%の効率を達成', excerpt: 'エネルギー変換効率25%の次世代太陽電池技術、再生可能エネルギーの新時代を開く。', content: '科学者たちはエネルギー変換効率25%の太陽電池技術の開発に成功しました。これは太陽エネルギーのコスト削減と効率向上における重要な進歩です。' },
    zh: { title: '新型太阳能电池技术达到25%效率', excerpt: '新一代太阳能电池技术能量转换效率高达25%，开启可再生能源新时代。', content: '科学家成功开发出能量转换效率高达25%的太阳能电池技术。这是降低太阳能成本和提高效率的重要一步。' },
    de: { title: 'Neue Solarzellentechnologie erreicht 25% Effizienz', excerpt: 'Solarzellentechnologie der neuen Generation mit Energieumwandlungseffizienz von bis zu 25%, eröffnet eine neue Ära für erneuerbare Energien.', content: 'Wissenschaftler haben erfolgreich eine Solarzellentechnologie mit einer Energieumwandlungseffizienz von bis zu 25% entwickelt. Dies ist ein wichtiger Schritt zur Kostensenkung und Effizienzsteigerung der Solarenergie.' }
  },
  'Chính sách hỗ trợ điện mặt trời mái nhà 2024': {
    en: { title: 'Rooftop Solar Support Policy 2024', excerpt: 'Government announces new policy to support rooftop solar installation with preferential pricing.', content: 'The government has just issued a new policy to support rooftop solar development, with preferential electricity selling prices and tax incentives.' },
    ko: { title: '2024년 옥상 태양광 지원 정책', excerpt: '정부, 우대 가격으로 옥상 태양광 설치 지원 새 정책 발표.', content: '정부가 우대 전력 판매 가격과 세금 혜택을 포함한 옥상 태양광 개발 지원 새 정책을 발표했습니다.' },
    ja: { title: '2024年屋上ソーラー支援政策', excerpt: '政府、優遇価格での屋上ソーラー設置支援の新政策を発表。', content: '政府は優遇電力販売価格と税制優遇を含む屋上ソーラー開発支援の新政策を発表しました。' },
    zh: { title: '2024年屋顶太阳能支持政策', excerpt: '政府宣布新政策，以优惠价格支持屋顶太阳能安装。', content: '政府刚刚发布了支持屋顶太阳能发展的新政策，包括优惠售电价格和税收优惠。' },
    de: { title: 'Dach-Solar-Förderpolitik 2024', excerpt: 'Regierung kündigt neue Politik zur Unterstützung der Dach-Solarinstallation mit Vorzugspreisen an.', content: 'Die Regierung hat gerade eine neue Politik zur Unterstützung der Dach-Solarentwicklung mit Vorzugs-Stromverkaufspreisen und Steuervorteilen erlassen.' }
  }
};

// Pre-translated data for Categories
const categoryTranslations: Record<string, any> = {
  // Product Categories
  'Tấm Pin Mặt Trời': {
    en: { name: 'Solar Panels', description: 'High-efficiency solar panels' },
    ko: { name: '태양광 패널', description: '고효율 태양광 패널' },
    ja: { name: 'ソーラーパネル', description: '高効率ソーラーパネル' },
    zh: { name: '太阳能电池板', description: '高效太阳能电池板' },
    de: { name: 'Solarpanele', description: 'Hocheffiziente Solarpanele' }
  },
  'Inverter': {
    en: { name: 'Inverters', description: 'Solar inverters and converters' },
    ko: { name: '인버터', description: '태양광 인버터 및 컨버터' },
    ja: { name: 'インバーター', description: 'ソーラーインバーターとコンバーター' },
    zh: { name: '逆变器', description: '太阳能逆变器和转换器' },
    de: { name: 'Wechselrichter', description: 'Solar-Wechselrichter und Konverter' }
  },
  'Pin Lưu Trữ': {
    en: { name: 'Battery Storage', description: 'Energy storage batteries' },
    ko: { name: '배터리 저장장치', description: '에너지 저장 배터리' },
    ja: { name: '蓄電池', description: 'エネルギー貯蔵バッテリー' },
    zh: { name: '储能电池', description: '能源储存电池' },
    de: { name: 'Batteriespeicher', description: 'Energiespeicher-Batterien' }
  },
  'Phụ Kiện': {
    en: { name: 'Accessories', description: 'Solar installation accessories' },
    ko: { name: '액세서리', description: '태양광 설치 액세서리' },
    ja: { name: 'アクセサリー', description: 'ソーラー設置アクセサリー' },
    zh: { name: '配件', description: '太阳能安装配件' },
    de: { name: 'Zubehör', description: 'Solar-Installationszubehör' }
  },
  // News Categories
  'Tin Tức Công Ty': {
    en: { name: 'Company News', description: 'Latest company updates' },
    ko: { name: '회사 뉴스', description: '최신 회사 소식' },
    ja: { name: '会社ニュース', description: '最新の会社情報' },
    zh: { name: '公司新闻', description: '最新公司动态' },
    de: { name: 'Unternehmensnachrichten', description: 'Neueste Unternehmensupdates' }
  },
  'Công Nghệ Mới': {
    en: { name: 'New Technology', description: 'Latest technology news' },
    ko: { name: '신기술', description: '최신 기술 뉴스' },
    ja: { name: '新技術', description: '最新技術ニュース' },
    zh: { name: '新技术', description: '最新技术新闻' },
    de: { name: 'Neue Technologie', description: 'Neueste Technologie-Nachrichten' }
  },
  'Chính Sách': {
    en: { name: 'Policies', description: 'Government policies and regulations' },
    ko: { name: '정책', description: '정부 정책 및 규정' },
    ja: { name: '政策', description: '政府の政策と規制' },
    zh: { name: '政策', description: '政府政策法规' },
    de: { name: 'Richtlinien', description: 'Regierungsrichtlinien und Vorschriften' }
  },
  'Hướng Dẫn': {
    en: { name: 'Guides', description: 'Installation and usage guides' },
    ko: { name: '가이드', description: '설치 및 사용 가이드' },
    ja: { name: 'ガイド', description: '設置・使用ガイド' },
    zh: { name: '指南', description: '安装和使用指南' },
    de: { name: 'Anleitungen', description: 'Installations- und Nutzungsanleitungen' }
  },
  // Project Categories
  'Dự Án Mái Nhà': {
    en: { name: 'Rooftop Projects', description: 'Residential rooftop solar projects' },
    ko: { name: '옥상 프로젝트', description: '주거용 옥상 태양광 프로젝트' },
    ja: { name: '屋上プロジェクト', description: '住宅用屋上ソーラープロジェクト' },
    zh: { name: '屋顶项目', description: '住宅屋顶太阳能项目' },
    de: { name: 'Dachprojekte', description: 'Wohn-Dach-Solarprojekte' }
  },
  'Dự Án Nhà Máy': {
    en: { name: 'Factory Projects', description: 'Industrial solar power plants' },
    ko: { name: '공장 프로젝트', description: '산업용 태양광 발전소' },
    ja: { name: '工場プロジェクト', description: '産業用太陽光発電所' },
    zh: { name: '工厂项目', description: '工业太阳能发电站' },
    de: { name: 'Fabrikprojekte', description: 'Industrielle Solarkraftwerke' }
  },
  'Dự Án Nông Trại': {
    en: { name: 'Farm Projects', description: 'Agricultural solar projects' },
    ko: { name: '농장 프로젝트', description: '농업용 태양광 프로젝트' },
    ja: { name: '農場プロジェクト', description: '農業用ソーラープロジェクト' },
    zh: { name: '农场项目', description: '农业太阳能项目' },
    de: { name: 'Farmprojekte', description: 'Landwirtschaftliche Solarprojekte' }
  },
  'Dự Án Nổi': {
    en: { name: 'Floating Projects', description: 'Floating solar power projects' },
    ko: { name: '수상 프로젝트', description: '수상 태양광 발전 프로젝트' },
    ja: { name: '水上プロジェクト', description: '水上太陽光発電プロジェクト' },
    zh: { name: '浮动项目', description: '浮动太阳能发电项目' },
    de: { name: 'Schwimmende Projekte', description: 'Schwimmende Solarkraftprojekte' }
  }
};

async function main() {
  console.log('🌍 Adding translations manually...');
  console.log('=====================================');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Get native MongoDB connection
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    // Update Products
    console.log('\n📦 Updating Products...');
    const productsCol = db.collection('products');
    const products = await productsCol.find({}).toArray();
    for (const product of products) {
      const trans = productTranslations[product.name];
      if (trans) {
        await productsCol.updateOne(
          { _id: product._id },
          { $set: { translations: trans } }
        );
        console.log(`  ✓ ${product.name}`);
      }
    }

    // Update Projects
    console.log('\n🏗️ Updating Projects...');
    const projectsCol = db.collection('projects');
    const projects = await projectsCol.find({}).toArray();
    for (const project of projects) {
      const trans = projectTranslations[project.title];
      if (trans) {
        await projectsCol.updateOne(
          { _id: project._id },
          { $set: { translations: trans } }
        );
        console.log(`  ✓ ${project.title}`);
      }
    }

    // Update News
    console.log('\n📰 Updating News...');
    const newsCol = db.collection('news');
    const newsItems = await newsCol.find({}).toArray();
    for (const news of newsItems) {
      const trans = newsTranslations[news.title];
      if (trans) {
        await newsCol.updateOne(
          { _id: news._id },
          { $set: { translations: trans } }
        );
        console.log(`  ✓ ${news.title}`);
      }
    }

    // Update Categories
    console.log('\n🏷️ Updating Categories...');
    
    const productCatsCol = db.collection('productcategories');
    const productCats = await productCatsCol.find({}).toArray();
    for (const cat of productCats) {
      const trans = categoryTranslations[cat.name];
      if (trans) {
        await productCatsCol.updateOne(
          { _id: cat._id },
          { $set: { translations: trans } }
        );
        console.log(`  ✓ Product: ${cat.name}`);
      }
    }

    const newsCatsCol = db.collection('newscategories');
    const newsCats = await newsCatsCol.find({}).toArray();
    for (const cat of newsCats) {
      const trans = categoryTranslations[cat.name];
      if (trans) {
        await newsCatsCol.updateOne(
          { _id: cat._id },
          { $set: { translations: trans } }
        );
        console.log(`  ✓ News: ${cat.name}`);
      }
    }

    const projectCatsCol = db.collection('projectcategories');
    const projectCats = await projectCatsCol.find({}).toArray();
    for (const cat of projectCats) {
      const trans = categoryTranslations[cat.name];
      if (trans) {
        await projectCatsCol.updateOne(
          { _id: cat._id },
          { $set: { translations: trans } }
        );
        console.log(`  ✓ Project: ${cat.name}`);
      }
    }

    console.log('\n=====================================');
    console.log('🎉 All translations added successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
