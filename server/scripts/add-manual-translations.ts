/**
 * Add manual translations (no API calls)
 * Run: npx tsx server/scripts/add-manual-translations.ts
 */

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/ctc_web_new';

// Pre-translated data
const translations = {
  products: {
    'Tấm Pin JA Solar 545W Mono Half-Cell': {
      en: { name: 'JA Solar 545W Mono Half-Cell Panel', description: 'JA Solar 545W solar panel with advanced Half-Cell technology, 21.3% high conversion efficiency, 12-year product warranty and 25-year performance warranty.' },
      ko: { name: 'JA Solar 545W 모노 하프셀 패널', description: 'JA Solar 545W 태양광 패널, 첨단 하프셀 기술, 21.3% 고효율, 12년 제품 보증 및 25년 성능 보증.' },
      ja: { name: 'JA Solar 545W モノハーフセルパネル', description: 'JA Solar 545W ソーラーパネル、先進のハーフセル技術、21.3%の高変換効率、12年の製品保証と25年の性能保証。' },
      zh: { name: 'JA Solar 545W 单晶半片电池板', description: 'JA Solar 545W 太阳能电池板，采用先进的半片电池技术，转换效率高达21.3%，12年产品质保和25年性能质保。' },
      de: { name: 'JA Solar 545W Mono Halbzellen-Panel', description: 'JA Solar 545W Solarpanel mit fortschrittlicher Halbzellen-Technologie, 21,3% hoher Wirkungsgrad, 12 Jahre Produktgarantie und 25 Jahre Leistungsgarantie.' }
    }
  },
  projects: {
    'Hệ thống điện mặt trời 50kWp - Khách sạn Sunrise Đà Nẵng': {
      en: { title: '50kWp Solar System - Sunrise Hotel Da Nang', location: 'Da Nang, Vietnam', description: 'Rooftop solar installation project with 50kWp capacity for Sunrise Hotel. The system helps save 40% monthly electricity costs, reduces CO2 emissions and creates a green image for the hotel.' },
      ko: { title: '50kWp 태양광 시스템 - 선라이즈 호텔 다낭', location: '베트남 다낭', description: '선라이즈 호텔을 위한 50kWp 용량의 옥상 태양광 설치 프로젝트. 월 전기 비용 40% 절감, CO2 배출 감소 및 호텔의 친환경 이미지 구축.' },
      ja: { title: '50kWp ソーラーシステム - サンライズホテル ダナン', location: 'ベトナム ダナン', description: 'サンライズホテル向け50kWp容量の屋上太陽光発電設置プロジェクト。月間電気代40%削減、CO2排出削減、ホテルのグリーンイメージ構築に貢献。' },
      zh: { title: '50kWp 太阳能系统 - 岘港日出酒店', location: '越南岘港', description: '为日出酒店安装50kWp容量的屋顶太阳能发电项目。该系统可节省40%的月度电费，减少CO2排放，为酒店树立绿色形象。' },
      de: { title: '50kWp Solaranlage - Sunrise Hotel Da Nang', location: 'Da Nang, Vietnam', description: 'Dachsolarinstallation mit 50kWp Kapazität für das Sunrise Hotel. Das System spart 40% der monatlichen Stromkosten, reduziert CO2-Emissionen und schafft ein grünes Image für das Hotel.' }
    }
  },
  news: {
    'Việt Nam đặt mục tiêu 30% năng lượng tái tạo vào năm 2030': {
      en: { title: 'Vietnam targets 30% renewable energy by 2030', excerpt: 'Vietnam government announces renewable energy development plan targeting 30% of total electricity from clean sources.', content: 'According to Power Plan VIII, Vietnam aims to strongly develop renewable energy sources. By 2030, renewable energy will account for about 30% of total electricity capacity. Rooftop solar is encouraged with tax incentives and electricity purchase price policies.' },
      ko: { title: '베트남, 2030년까지 재생에너지 30% 목표', excerpt: '베트남 정부가 청정 에너지원에서 총 전력의 30%를 목표로 하는 재생에너지 개발 계획을 발표했습니다.', content: '전력계획 VIII에 따르면 베트남은 재생에너지원을 강력히 개발할 계획입니다. 2030년까지 재생에너지는 총 전력 용량의 약 30%를 차지할 것입니다.' },
      ja: { title: 'ベトナム、2030年までに再生可能エネルギー30%を目標', excerpt: 'ベトナム政府がクリーンエネルギー源から総電力の30%を目標とする再生可能エネルギー開発計画を発表。', content: '電力計画VIIIによると、ベトナムは再生可能エネルギー源の強力な開発を目指しています。2030年までに再生可能エネルギーは総電力容量の約30%を占める見込みです。' },
      zh: { title: '越南设定2030年可再生能源30%目标', excerpt: '越南政府宣布可再生能源发展计划，目标是清洁能源占总电力的30%。', content: '根据电力规划八，越南计划大力发展可再生能源。到2030年，可再生能源将占总电力容量的约30%。屋顶太阳能将获得税收优惠和电价收购政策的支持。' },
      de: { title: 'Vietnam strebt 30% erneuerbare Energie bis 2030 an', excerpt: 'Die vietnamesische Regierung kündigt einen Plan zur Entwicklung erneuerbarer Energien an, der 30% des Gesamtstroms aus sauberen Quellen vorsieht.', content: 'Laut Stromplan VIII plant Vietnam eine starke Entwicklung erneuerbarer Energiequellen. Bis 2030 werden erneuerbare Energien etwa 30% der gesamten Stromkapazität ausmachen.' }
    }
  },
  testimonials: {
    'Nguyễn Minh Tuấn': {
      en: { name: 'Nguyen Minh Tuan', role: 'Director of Sunrise Hotel', content: 'After installing CTC solar system, we saved 40% on electricity costs. The technical team is very professional and supportive.' },
      ko: { name: '응우옌 민 뚜안', role: '선라이즈 호텔 대표', content: 'CTC 태양광 시스템 설치 후 전기 비용을 40% 절감했습니다. 기술팀이 매우 전문적이고 친절합니다.' },
      ja: { name: 'グエン・ミン・トゥアン', role: 'サンライズホテル取締役', content: 'CTCのソーラーシステム設置後、電気代を40%節約できました。技術チームは非常にプロフェッショナルでサポートが充実しています。' },
      zh: { name: '阮明俊', role: '日出酒店总监', content: '安装CTC太阳能系统后，我们节省了40%的电费。技术团队非常专业，服务周到。' },
      de: { name: 'Nguyen Minh Tuan', role: 'Direktor des Sunrise Hotels', content: 'Nach der Installation des CTC Solarsystems sparen wir 40% Stromkosten. Das technische Team ist sehr professionell und hilfsbereit.' }
    }
  },
  team: {
    'Lê Hoàng Anh': {
      en: { name: 'Le Hoang Anh', role: 'Chief Solar Energy Engineer' },
      ko: { name: '레 호앙 안', role: '수석 태양에너지 엔지니어' },
      ja: { name: 'レ・ホアン・アン', role: 'チーフソーラーエネルギーエンジニア' },
      zh: { name: '黎黄英', role: '首席太阳能工程师' },
      de: { name: 'Le Hoang Anh', role: 'Leitender Solarenergie-Ingenieur' }
    }
  },
  categories: {
    'Bộ Điều Khiển Sạc': {
      en: { name: 'Charge Controller', description: 'Solar charge controller devices, protecting batteries and optimizing charging efficiency' },
      ko: { name: '충전 컨트롤러', description: '태양광 충전 컨트롤러, 배터리 보호 및 충전 효율 최적화' },
      ja: { name: 'チャージコントローラー', description: 'ソーラー充電コントローラー、バッテリー保護と充電効率の最適化' },
      zh: { name: '充电控制器', description: '太阳能充电控制器，保护电池并优化充电效率' },
      de: { name: 'Laderegler', description: 'Solar-Laderegler, schützt Batterien und optimiert die Ladeeffizienz' }
    },
    'Kiến Thức Năng Lượng': {
      en: { name: 'Energy Knowledge', description: 'Articles sharing knowledge about solar energy and renewable energy' },
      ko: { name: '에너지 지식', description: '태양에너지 및 재생에너지에 대한 지식 공유 기사' },
      ja: { name: 'エネルギー知識', description: '太陽エネルギーと再生可能エネルギーに関する知識を共有する記事' },
      zh: { name: '能源知识', description: '分享太阳能和可再生能源知识的文章' },
      de: { name: 'Energiewissen', description: 'Artikel zum Teilen von Wissen über Solarenergie und erneuerbare Energien' }
    },
    'Dự Án Thương Mại': {
      en: { name: 'Commercial Projects', description: 'Solar projects for office buildings, shopping centers' },
      ko: { name: '상업용 프로젝트', description: '사무실 건물, 쇼핑센터를 위한 태양광 프로젝트' },
      ja: { name: '商業プロジェクト', description: 'オフィスビル、ショッピングセンター向けの太陽光発電プロジェクト' },
      zh: { name: '商业项目', description: '办公楼、购物中心的太阳能项目' },
      de: { name: 'Gewerbeprojekte', description: 'Solarprojekte für Bürogebäude, Einkaufszentren' }
    }
  }
};

async function addManualTranslations() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db!;

    // Update Products
    console.log('📦 Updating Products...');
    for (const [name, trans] of Object.entries(translations.products)) {
      const result = await db.collection('products').updateOne(
        { name },
        { $set: { translations: trans } }
      );
      if (result.modifiedCount > 0) console.log(`   ✅ ${name}`);
    }

    // Update Projects
    console.log('\n🏗️ Updating Projects...');
    for (const [title, trans] of Object.entries(translations.projects)) {
      const result = await db.collection('projects').updateOne(
        { title },
        { $set: { translations: trans } }
      );
      if (result.modifiedCount > 0) console.log(`   ✅ ${title.substring(0, 40)}...`);
    }

    // Update News
    console.log('\n📰 Updating News...');
    for (const [title, trans] of Object.entries(translations.news)) {
      const result = await db.collection('news').updateOne(
        { title },
        { $set: { translations: trans } }
      );
      if (result.modifiedCount > 0) console.log(`   ✅ ${title.substring(0, 40)}...`);
    }

    // Update Testimonials
    console.log('\n💬 Updating Testimonials...');
    for (const [name, trans] of Object.entries(translations.testimonials)) {
      const result = await db.collection('testimonials').updateOne(
        { name },
        { $set: { translations: trans } }
      );
      if (result.modifiedCount > 0) console.log(`   ✅ ${name}`);
    }

    // Update Team
    console.log('\n👤 Updating Team...');
    for (const [name, trans] of Object.entries(translations.team)) {
      const result = await db.collection('teammembers').updateOne(
        { name },
        { $set: { translations: trans } }
      );
      if (result.modifiedCount > 0) console.log(`   ✅ ${name}`);
    }

    // Update Categories
    console.log('\n🏷️ Updating Categories...');
    for (const [name, trans] of Object.entries(translations.categories)) {
      // Try all category collections
      for (const collection of ['productcategories', 'newscategories', 'projectcategories']) {
        const result = await db.collection(collection).updateOne(
          { name },
          { $set: { translations: trans } }
        );
        if (result.modifiedCount > 0) console.log(`   ✅ ${name}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Manual translations added!');
    console.log('='.repeat(50));
    console.log('\n📋 Test:');
    console.log('   curl http://localhost:4000/api/products?lang=en');
    console.log('   curl http://localhost:4000/api/projects?lang=ko');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected');
  }
}

addManualTranslations();
