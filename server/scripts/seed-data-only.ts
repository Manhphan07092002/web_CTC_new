/**
 * Seed data WITHOUT translation (no API calls)
 * Run: npx tsx server/scripts/seed-data-only.ts
 */

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/ctc_web_new';

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db!;

    // 1. Product
    console.log('📦 1. Adding Product...');
    const productSlug = generateSlug('Tấm Pin JA Solar 545W Mono Half-Cell');
    if (!(await db.collection('products').findOne({ slug: productSlug }))) {
      await db.collection('products').insertOne({
        name: 'Tấm Pin JA Solar 545W Mono Half-Cell',
        slug: productSlug,
        description: 'Tấm pin năng lượng mặt trời JA Solar công suất 545W, công nghệ Half-Cell tiên tiến.',
        shortDescription: 'Pin mặt trời công suất cao',
        features: ['Công suất 545W', 'Hiệu suất 21.3%', 'Bảo hành 25 năm'],
        price: 4500000,
        category: 'Tấm Pin Mặt Trời',
        isActive: true,
        isFeatured: true,
        createdAt: new Date()
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️ Already exists');
    }

    // 2. Project
    console.log('🏗️ 2. Adding Project...');
    const projectSlug = generateSlug('Hệ thống điện mặt trời 50kWp Khách sạn Sunrise');
    if (!(await db.collection('projects').findOne({ slug: projectSlug }))) {
      await db.collection('projects').insertOne({
        title: 'Hệ thống điện mặt trời 50kWp - Khách sạn Sunrise',
        slug: projectSlug,
        location: 'Đà Nẵng, Việt Nam',
        description: 'Dự án lắp đặt hệ thống điện mặt trời áp mái 50kWp.',
        capacity: '50kWp',
        isActive: true,
        isFeatured: true,
        createdAt: new Date()
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️ Already exists');
    }

    // 3. News
    console.log('📰 3. Adding News...');
    const newsSlug = generateSlug('Việt Nam đặt mục tiêu 30% năng lượng tái tạo');
    if (!(await db.collection('news').findOne({ slug: newsSlug }))) {
      await db.collection('news').insertOne({
        title: 'Việt Nam đặt mục tiêu 30% năng lượng tái tạo vào năm 2030',
        slug: newsSlug,
        excerpt: 'Chính phủ công bố kế hoạch phát triển năng lượng tái tạo.',
        content: 'Theo Quy hoạch Điện VIII, Việt Nam đặt mục tiêu phát triển mạnh mẽ...',
        author: 'Admin',
        isActive: true,
        publishedAt: new Date(),
        createdAt: new Date()
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️ Already exists');
    }

    // 4. Testimonial
    console.log('💬 4. Adding Testimonial...');
    if (!(await db.collection('testimonials').findOne({ name: 'Nguyễn Minh Tuấn' }))) {
      await db.collection('testimonials').insertOne({
        name: 'Nguyễn Minh Tuấn',
        role: 'Giám đốc Khách sạn Sunrise',
        content: 'Sau khi lắp đặt hệ thống, chúng tôi đã tiết kiệm được 40% chi phí điện.',
        rating: 5,
        isActive: true,
        createdAt: new Date()
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️ Already exists');
    }

    // 5. Team Member
    console.log('👤 5. Adding Team Member...');
    if (!(await db.collection('teammembers').findOne({ name: 'Lê Hoàng Anh' }))) {
      await db.collection('teammembers').insertOne({
        name: 'Lê Hoàng Anh',
        role: 'Kỹ sư trưởng Năng lượng Mặt trời',
        email: 'hoanganh@ctcdn.vn',
        isActive: true,
        order: 4,
        createdAt: new Date()
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️ Already exists');
    }

    // 6. Product Category
    console.log('🏷️ 6. Adding Product Category...');
    const prodCatSlug = generateSlug('Bộ Điều Khiển Sạc');
    if (!(await db.collection('productcategories').findOne({ slug: prodCatSlug }))) {
      await db.collection('productcategories').insertOne({
        name: 'Bộ Điều Khiển Sạc',
        slug: prodCatSlug,
        description: 'Thiết bị điều khiển sạc năng lượng mặt trời',
        isActive: true,
        order: 5,
        productCount: 0,
        createdAt: new Date()
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️ Already exists');
    }

    // 7. News Category
    console.log('🏷️ 7. Adding News Category...');
    const newsCatSlug = generateSlug('Kiến Thức Năng Lượng');
    if (!(await db.collection('newscategories').findOne({ slug: newsCatSlug }))) {
      await db.collection('newscategories').insertOne({
        name: 'Kiến Thức Năng Lượng',
        slug: newsCatSlug,
        description: 'Bài viết chia sẻ kiến thức về năng lượng mặt trời',
        isActive: true,
        order: 5,
        newsCount: 0,
        createdAt: new Date()
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️ Already exists');
    }

    // 8. Project Category
    console.log('🏷️ 8. Adding Project Category...');
    const projCatSlug = generateSlug('Dự Án Thương Mại');
    if (!(await db.collection('projectcategories').findOne({ slug: projCatSlug }))) {
      await db.collection('projectcategories').insertOne({
        name: 'Dự Án Thương Mại',
        slug: projCatSlug,
        description: 'Các dự án điện mặt trời cho tòa nhà văn phòng',
        isActive: true,
        order: 5,
        projectCount: 0,
        createdAt: new Date()
      });
      console.log('   ✅ Created');
    } else {
      console.log('   ⏭️ Already exists');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Data seeded (without translations)!');
    console.log('='.repeat(50));
    console.log('\n⏳ Đợi 10-15 phút rồi chạy:');
    console.log('   npx tsx server/scripts/seed-test-translate.ts');
    console.log('\n   (Script đó sẽ update translations cho data đã có)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seedData();
