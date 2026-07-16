/**
 * Add translations for team members and testimonials
 * Run: npx tsx server/scripts/add-team-testimonial-translations.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

// Team role translations
const roleTranslations: Record<string, Record<string, string>> = {
  'Giám đốc điều hành': {
    en: 'CEO',
    ko: '대표이사',
    ja: '代表取締役',
    zh: '首席执行官',
    de: 'Geschäftsführer'
  },
  'Giám đốc công nghệ': {
    en: 'CTO',
    ko: '기술이사',
    ja: '最高技術責任者',
    zh: '首席技术官',
    de: 'Technischer Direktor'
  },
  'Trưởng phòng kỹ thuật': {
    en: 'Technical Manager',
    ko: '기술 관리자',
    ja: '技術部長',
    zh: '技术经理',
    de: 'Technischer Leiter'
  },
  'Kỹ sư năng lượng': {
    en: 'Energy Engineer',
    ko: '에너지 엔지니어',
    ja: 'エネルギーエンジニア',
    zh: '能源工程师',
    de: 'Energieingenieur'
  },
  'Chuyên viên tư vấn': {
    en: 'Consultant',
    ko: '컨설턴트',
    ja: 'コンサルタント',
    zh: '顾问',
    de: 'Berater'
  },
  'Trưởng phòng kinh doanh': {
    en: 'Sales Manager',
    ko: '영업 관리자',
    ja: '営業部長',
    zh: '销售经理',
    de: 'Vertriebsleiter'
  }
};

// Testimonial translations
const testimonialTranslations: Record<string, any> = {
  'Khách sạn Serene': {
    role: {
      en: 'Serene Hotel',
      ko: '세레네 호텔',
      ja: 'セレーネホテル',
      zh: '塞琳酒店',
      de: 'Serene Hotel'
    },
    content: {
      en: 'Investing in solar hot water and electricity system from CTC was the best decision for our hotel this year.',
      ko: 'CTC의 태양열 온수 및 전기 시스템에 투자한 것은 올해 호텔에서 내린 최고의 결정이었습니다.',
      ja: 'CTCの太陽熱温水・電気システムへの投資は、今年ホテルで下した最良の決断でした。',
      zh: '投资CTC的太阳能热水和电力系统是我们酒店今年做出的最佳决定。',
      de: 'Die Investition in Solarwarmwasser- und Stromsysteme von CTC war die beste Entscheidung für unser Hotel in diesem Jahr.'
    }
  },
  'GĐ Công ty May Việt Tiến': {
    role: {
      en: 'Director, Viet Tien Garment Company',
      ko: '비엣띠엔 의류 회사 이사',
      ja: 'ベトナムティエン衣料会社取締役',
      zh: '越进服装公司总监',
      de: 'Direktor, Viet Tien Bekleidungsunternehmen'
    },
    content: {
      en: 'The system operates very stably, helping our factory save 30% on electricity costs monthly. The support team is very dedicated.',
      ko: '시스템이 매우 안정적으로 작동하여 공장에서 매월 전기 비용을 30% 절감할 수 있었습니다. 지원팀이 매우 헌신적입니다.',
      ja: 'システムは非常に安定して動作し、工場の月間電気代を30%節約できました。サポートチームは非常に献身的です。',
      zh: '系统运行非常稳定，帮助我们工厂每月节省30%的电费。支持团队非常敬业。',
      de: 'Das System arbeitet sehr stabil und hilft unserer Fabrik, monatlich 30% bei den Stromkosten zu sparen. Das Support-Team ist sehr engagiert.'
    }
  },
  'Chủ hộ kinh doanh': {
    role: {
      en: 'Business Owner',
      ko: '사업주',
      ja: '事業主',
      zh: '企业主',
      de: 'Geschäftsinhaber'
    },
    content: {
      en: 'Very satisfied with the aesthetics during installation. The workers are clean, careful and follow instructions in detail.',
      ko: '설치 시 미적 측면에 매우 만족합니다. 작업자들이 깨끗하고 세심하며 지침을 자세히 따릅니다.',
      ja: '設置時の美観に非常に満足しています。作業員は清潔で丁寧で、指示に細かく従います。',
      zh: '对安装时的美观性非常满意。工人们干净、细心，按照说明详细操作。',
      de: 'Sehr zufrieden mit der Ästhetik bei der Installation. Die Arbeiter sind sauber, sorgfältig und folgen den Anweisungen im Detail.'
    }
  },
  'Chủ nhà dân': {
    role: {
      en: 'Homeowner',
      ko: '주택 소유자',
      ja: '住宅所有者',
      zh: '房主',
      de: 'Hausbesitzer'
    },
    content: {
      en: 'Very satisfied with the aesthetics during installation. The workers are clean, careful and follow instructions in detail.',
      ko: '설치 시 미적 측면에 매우 만족합니다. 작업자들이 깨끗하고 세심하며 지침을 자세히 따릅니다.',
      ja: '設置時の美観に非常に満足しています。作業員は清潔で丁寧で、指示に細かく従います。',
      zh: '对安装时的美观性非常满意。工人们干净、细心，按照说明详细操作。',
      de: 'Sehr zufrieden mit der Ästhetik bei der Installation. Die Arbeiter sind sauber, sorgfältig und folgen den Anweisungen im Detail.'
    }
  }
};

async function main() {
  console.log('🌍 Adding team and testimonial translations...');
  console.log('==============================================');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const languages = ['en', 'ko', 'ja', 'zh', 'de'];

    // Update Team Members
    console.log('\n👥 Updating Team Members...');
    const teamCol = db.collection('teammembers');
    const teamMembers = await teamCol.find({}).toArray();

    for (const member of teamMembers) {
      console.log(`  → ${member.name} (${member.role})`);
      
      const translations: Record<string, any> = member.translations || {};
      
      for (const lang of languages) {
        if (!translations[lang]) {
          translations[lang] = {};
        }
        
        // Find role translation
        const roleKey = Object.keys(roleTranslations).find(
          key => member.role?.toLowerCase().includes(key.toLowerCase())
        );
        
        if (roleKey && roleTranslations[roleKey][lang]) {
          translations[lang].role = roleTranslations[roleKey][lang];
          console.log(`    ✓ ${lang}: ${translations[lang].role}`);
        }
      }
      
      await teamCol.updateOne(
        { _id: member._id },
        { $set: { translations } }
      );
    }

    // Update Testimonials
    console.log('\n💬 Updating Testimonials...');
    const testimonialsCol = db.collection('testimonials');
    const testimonials = await testimonialsCol.find({}).toArray();

    for (const testimonial of testimonials) {
      console.log(`  → ${testimonial.name} (${testimonial.role})`);
      
      const translations: Record<string, any> = testimonial.translations || {};
      
      // Find matching testimonial translation
      const testKey = Object.keys(testimonialTranslations).find(
        key => testimonial.role?.toLowerCase().includes(key.toLowerCase())
      );
      
      for (const lang of languages) {
        if (!translations[lang]) {
          translations[lang] = {};
        }
        
        if (testKey && testimonialTranslations[testKey]) {
          if (testimonialTranslations[testKey].role?.[lang]) {
            translations[lang].role = testimonialTranslations[testKey].role[lang];
          }
          if (testimonialTranslations[testKey].content?.[lang]) {
            translations[lang].content = testimonialTranslations[testKey].content[lang];
          }
          console.log(`    ✓ ${lang}: role & content`);
        }
      }
      
      await testimonialsCol.updateOne(
        { _id: testimonial._id },
        { $set: { translations } }
      );
    }

    console.log('\n==============================================');
    console.log('🎉 All team and testimonial translations added!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
