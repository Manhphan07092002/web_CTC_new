/**
 * Seed real data with auto-translate
 * Run: npx tsx server/scripts/seed-test-translate.ts
 */

import mongoose from 'mongoose';
import { translateProduct, translateProject, translateNews, translateCategory, translateTestimonial, translateTeamMember } from '../services/translate';

const MONGODB_URI = 'mongodb://localhost:27017/web-tranle1';

// Helper to generate slug
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

async function seedRealData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db!;

    // ========== 1. PRODUCT ==========
    console.log('📦 1. Adding Product...');
    const product = {
      name: 'Tấm Pin JA Solar 545W Mono Half-Cell',
      description: 'Tấm pin năng lượng mặt trời JA Solar công suất 545W, công nghệ Half-Cell tiên tiến, hiệu suất chuyển đổi cao 21.3%, bảo hành 12 năm sản phẩm và 25 năm hiệu suất.',
      shortDescription: 'Pin mặt trời công suất cao, công nghệ tiên tiến',
      features: [
        'Công suất 545W, hiệu suất 21.3%',
        'Công nghệ Half-Cell giảm tổn thất',
        'Khung nhôm chống ăn mòn',
        'Bảo hành 25 năm hiệu suất'
      ],
      specifications: 'Kích thước: 2278x1134x35mm | Trọng lượng: 28.5kg | Điện áp: 41.52V | Dòng điện: 13.13A',
      warranty: 'Bảo hành 12 năm sản phẩm, 25 năm hiệu suất tuyến tính'
    };
    
    const translatedProduct = await translateProduct(product);
    const existingProduct = await db.collection('products').findOne({ slug: generateSlug(product.name) });
    
    if (!existingProduct) {
      await db.collection('products').insertOne({
        ...translatedProduct,
        slug: generateSlug(product.name),
        price: 4500000,
        originalPrice: 5000000,
        stock: 150,
        category: 'Tấm Pin Mặt Trời',
        images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'],
        isActive: true,
        isFeatured: true,
        views: 0,
        createdAt: new Date()
      });
      console.log('   ✅ Product created with translations');
    } else {
      await db.collection('products').updateOne(
        { _id: existingProduct._id },
        { $set: { translations: translatedProduct.translations } }
      );
      console.log('   ✅ Product translations updated');
    }

    // ========== 2. PROJECT ==========
    console.log('\n🏗️ 2. Adding Project...');
    const project = {
      title: 'Hệ thống điện mặt trời 50kWp - Khách sạn Sunrise Đà Nẵng',
      location: 'Đà Nẵng, Việt Nam',
      description: 'Dự án lắp đặt hệ thống điện mặt trời áp mái công suất 50kWp cho Khách sạn Sunrise. Hệ thống giúp tiết kiệm 40% chi phí điện hàng tháng, giảm phát thải CO2 và tạo hình ảnh xanh cho khách sạn.'
    };
    
    const translatedProject = await translateProject(project);
    const existingProject = await db.collection('projects').findOne({ slug: generateSlug(project.title) });
    
    if (!existingProject) {
      await db.collection('projects').insertOne({
        ...translatedProject,
        slug: generateSlug(project.title),
        capacity: '50kWp',
        investment: '850,000,000 VNĐ',
        savings: '15,000,000 VNĐ/tháng',
        completedDate: new Date('2024-06-15'),
        images: ['https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800'],
        isActive: true,
        isFeatured: true,
        createdAt: new Date()
      });
      console.log('   ✅ Project created with translations');
    } else {
      await db.collection('projects').updateOne(
        { _id: existingProject._id },
        { $set: { translations: translatedProject.translations } }
      );
      console.log('   ✅ Project translations updated');
    }

    // ========== 3. NEWS ==========
    console.log('\n📰 3. Adding News...');
    const news = {
      title: 'Việt Nam đặt mục tiêu 30% năng lượng tái tạo vào năm 2030',
      excerpt: 'Chính phủ Việt Nam công bố kế hoạch phát triển năng lượng tái tạo với mục tiêu đạt 30% tổng công suất điện từ nguồn năng lượng sạch.',
      content: 'Theo Quy hoạch Điện VIII, Việt Nam đặt mục tiêu phát triển mạnh mẽ các nguồn năng lượng tái tạo. Đến năm 2030, tỷ trọng năng lượng tái tạo sẽ đạt khoảng 30% tổng công suất điện. Điện mặt trời mái nhà được khuyến khích phát triển với nhiều chính sách ưu đãi về thuế và giá mua điện.'
    };
    
    const translatedNews = await translateNews(news);
    const existingNews = await db.collection('news').findOne({ slug: generateSlug(news.title) });
    
    if (!existingNews) {
      await db.collection('news').insertOne({
        ...translatedNews,
        slug: generateSlug(news.title),
        author: 'Admin',
        category: 'Chính Sách',
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
        isActive: true,
        publishedAt: new Date(),
        views: 0,
        createdAt: new Date()
      });
      console.log('   ✅ News created with translations');
    } else {
      await db.collection('news').updateOne(
        { _id: existingNews._id },
        { $set: { translations: translatedNews.translations } }
      );
      console.log('   ✅ News translations updated');
    }

    // ========== 4. TESTIMONIAL ==========
    console.log('\n💬 4. Adding Testimonial...');
    const testimonial = {
      name: 'Nguyễn Minh Tuấn',
      role: 'Giám đốc Khách sạn Sunrise',
      content: 'Sau khi lắp đặt hệ thống điện mặt trời của CTC, chúng tôi đã tiết kiệm được 40% chi phí điện. Đội ngũ kỹ thuật rất chuyên nghiệp và hỗ trợ tận tình.'
    };
    
    const translatedTestimonial = await translateTestimonial(testimonial);
    const existingTestimonial = await db.collection('testimonials').findOne({ name: testimonial.name });
    
    if (!existingTestimonial) {
      await db.collection('testimonials').insertOne({
        ...translatedTestimonial,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        rating: 5,
        isActive: true,
        createdAt: new Date()
      });
      console.log('   ✅ Testimonial created with translations');
    } else {
      await db.collection('testimonials').updateOne(
        { _id: existingTestimonial._id },
        { $set: { translations: translatedTestimonial.translations } }
      );
      console.log('   ✅ Testimonial translations updated');
    }

    // ========== 5. TEAM MEMBER ==========
    console.log('\n👤 5. Adding Team Member...');
    const teamMember = {
      name: 'Lê Hoàng Anh',
      role: 'Kỹ sư trưởng Năng lượng Mặt trời'
    };
    
    const translatedTeam = await translateTeamMember(teamMember);
    const existingTeam = await db.collection('teammembers').findOne({ name: teamMember.name });
    
    if (!existingTeam) {
      await db.collection('teammembers').insertOne({
        ...translatedTeam,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        email: 'hoanganh@ctcdn.vn',
        phone: '0901234567',
        linkedin: 'https://linkedin.com/in/lehoang',
        isActive: true,
        order: 4,
        createdAt: new Date()
      });
      console.log('   ✅ Team member created with translations');
    } else {
      await db.collection('teammembers').updateOne(
        { _id: existingTeam._id },
        { $set: { translations: translatedTeam.translations } }
      );
      console.log('   ✅ Team member translations updated');
    }

    // ========== 6. PRODUCT CATEGORY ==========
    console.log('\n🏷️ 6. Adding Product Category...');
    const productCategory = {
      name: 'Bộ Điều Khiển Sạc',
      description: 'Thiết bị điều khiển sạc năng lượng mặt trời, bảo vệ pin và tối ưu hóa hiệu suất sạc'
    };
    
    const translatedProductCat = await translateCategory(productCategory);
    const existingProductCat = await db.collection('productcategories').findOne({ slug: generateSlug(productCategory.name) });
    
    if (!existingProductCat) {
      await db.collection('productcategories').insertOne({
        ...translatedProductCat,
        slug: generateSlug(productCategory.name),
        icon: 'Cpu',
        color: '#10B981',
        isActive: true,
        order: 5,
        productCount: 0,
        createdAt: new Date()
      });
      console.log('   ✅ Product category created with translations');
    } else {
      await db.collection('productcategories').updateOne(
        { _id: existingProductCat._id },
        { $set: { translations: translatedProductCat.translations } }
      );
      console.log('   ✅ Product category translations updated');
    }

    // ========== 7. NEWS CATEGORY ==========
    console.log('\n🏷️ 7. Adding News Category...');
    const newsCategory = {
      name: 'Kiến Thức Năng Lượng',
      description: 'Bài viết chia sẻ kiến thức về năng lượng mặt trời và năng lượng tái tạo'
    };
    
    const translatedNewsCat = await translateCategory(newsCategory);
    const existingNewsCat = await db.collection('newscategories').findOne({ slug: generateSlug(newsCategory.name) });
    
    if (!existingNewsCat) {
      await db.collection('newscategories').insertOne({
        ...translatedNewsCat,
        slug: generateSlug(newsCategory.name),
        icon: 'BookOpen',
        color: '#8B5CF6',
        isActive: true,
        order: 5,
        newsCount: 0,
        createdAt: new Date()
      });
      console.log('   ✅ News category created with translations');
    } else {
      await db.collection('newscategories').updateOne(
        { _id: existingNewsCat._id },
        { $set: { translations: translatedNewsCat.translations } }
      );
      console.log('   ✅ News category translations updated');
    }

    // ========== 8. PROJECT CATEGORY ==========
    console.log('\n🏷️ 8. Adding Project Category...');
    const projectCategory = {
      name: 'Dự Án Thương Mại',
      description: 'Các dự án điện mặt trời cho tòa nhà văn phòng, trung tâm thương mại'
    };
    
    const translatedProjectCat = await translateCategory(projectCategory);
    const existingProjectCat = await db.collection('projectcategories').findOne({ slug: generateSlug(projectCategory.name) });
    
    if (!existingProjectCat) {
      await db.collection('projectcategories').insertOne({
        ...translatedProjectCat,
        slug: generateSlug(projectCategory.name),
        icon: 'Building2',
        color: '#F59E0B',
        isActive: true,
        order: 5,
        projectCount: 0,
        createdAt: new Date()
      });
      console.log('   ✅ Project category created with translations');
    } else {
      await db.collection('projectcategories').updateOne(
        { _id: existingProjectCat._id },
        { $set: { translations: translatedProjectCat.translations } }
      );
      console.log('   ✅ Project category translations updated');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All data seeded successfully!');
    console.log('='.repeat(50));
    console.log('\n📋 Summary:');
    console.log('   1. Product: Tấm Pin JA Solar 545W');
    console.log('   2. Project: Khách sạn Sunrise 50kWp');
    console.log('   3. News: Mục tiêu năng lượng tái tạo 2030');
    console.log('   4. Testimonial: Nguyễn Minh Tuấn');
    console.log('   5. Team: Lê Hoàng Anh');
    console.log('   6. Product Category: Bộ Điều Khiển Sạc');
    console.log('   7. News Category: Kiến Thức Năng Lượng');
    console.log('   8. Project Category: Dự Án Thương Mại');
    console.log('\n📋 Test translations:');
    console.log('   curl http://localhost:4000/api/products?lang=en');
    console.log('   curl http://localhost:4000/api/product-categories?lang=ko');
    console.log('   curl http://localhost:4000/api/projects?lang=ja');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seedRealData();
