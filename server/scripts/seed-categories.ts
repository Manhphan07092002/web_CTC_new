/**
 * Seed Categories Script
 * Tạo dữ liệu mẫu cho danh mục sản phẩm, tin tức, dự án
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ProductCategory, NewsCategory, ProjectCategory } from '../../models';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

// Product Categories
const productCategories = [
  {
    name: 'Tấm Pin Mặt Trời',
    slug: 'tam-pin-mat-troi',
    description: 'Tấm pin quang điện chất lượng cao',
    icon: 'Sun',
    color: '#F59E0B',
    order: 1
  },
  {
    name: 'Inverter',
    slug: 'inverter',
    description: 'Bộ nghịch lưu năng lượng mặt trời',
    icon: 'Zap',
    color: '#3B82F6',
    order: 2
  },
  {
    name: 'Pin Lưu Trữ',
    slug: 'pin-luu-tru',
    description: 'Hệ thống lưu trữ năng lượng',
    icon: 'Battery',
    color: '#10B981',
    order: 3
  },
  {
    name: 'Phụ Kiện',
    slug: 'phu-kien',
    description: 'Phụ kiện và thiết bị hỗ trợ',
    icon: 'Package',
    color: '#6366F1',
    order: 4
  }
];

// News Categories
const newsCategories = [
  {
    name: 'Tin Tức Công Ty',
    slug: 'tin-tuc-cong-ty',
    description: 'Tin tức và sự kiện của CTC',
    icon: 'Building',
    color: '#3B82F6',
    order: 1
  },
  {
    name: 'Công Nghệ Mới',
    slug: 'cong-nghe-moi',
    description: 'Cập nhật công nghệ năng lượng mặt trời',
    icon: 'Lightbulb',
    color: '#F59E0B',
    order: 2
  },
  {
    name: 'Chính Sách',
    slug: 'chinh-sach',
    description: 'Chính sách và quy định về năng lượng tái tạo',
    icon: 'FileText',
    color: '#10B981',
    order: 3
  },
  {
    name: 'Hướng Dẫn',
    slug: 'huong-dan',
    description: 'Hướng dẫn sử dụng và bảo trì',
    icon: 'BookOpen',
    color: '#8B5CF6',
    order: 4
  }
];

// Project Categories
const projectCategories = [
  {
    name: 'Dự Án Mái Nhà',
    slug: 'du-an-mai-nha',
    description: 'Hệ thống điện mặt trời mái nhà',
    icon: 'Home',
    color: '#3B82F6',
    order: 1
  },
  {
    name: 'Dự Án Nhà Máy',
    slug: 'du-an-nha-may',
    description: 'Hệ thống điện mặt trời cho nhà máy, xí nghiệp',
    icon: 'Factory',
    color: '#F59E0B',
    order: 2
  },
  {
    name: 'Dự Án Nông Trại',
    slug: 'du-an-nong-trai',
    description: 'Hệ thống điện mặt trời cho nông trại',
    icon: 'Tractor',
    color: '#10B981',
    order: 3
  },
  {
    name: 'Dự Án Nổi',
    slug: 'du-an-noi',
    description: 'Hệ thống điện mặt trời nổi trên mặt nước',
    icon: 'Waves',
    color: '#06B6D4',
    order: 4
  }
];

async function seedCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    console.log('\nClearing existing categories...');
    await ProductCategory.deleteMany({});
    await NewsCategory.deleteMany({});
    await ProjectCategory.deleteMany({});
    console.log('Cleared existing categories');

    // Seed Product Categories
    console.log('\nSeeding Product Categories...');
    for (const cat of productCategories) {
      const category = new ProductCategory({
        ...cat,
        isActive: true,
        productCount: 0
      });
      await category.save();
      console.log(`✓ Created: ${cat.name}`);
    }

    // Seed News Categories
    console.log('\nSeeding News Categories...');
    for (const cat of newsCategories) {
      const category = new NewsCategory({
        ...cat,
        isActive: true,
        newsCount: 0
      });
      await category.save();
      console.log(`✓ Created: ${cat.name}`);
    }

    // Seed Project Categories
    console.log('\nSeeding Project Categories...');
    for (const cat of projectCategories) {
      const category = new ProjectCategory({
        ...cat,
        isActive: true,
        projectCount: 0
      });
      await category.save();
      console.log(`✓ Created: ${cat.name}`);
    }

    console.log('\n✅ All categories seeded successfully!');
    console.log(`\nSummary:`);
    console.log(`- Product Categories: ${productCategories.length}`);
    console.log(`- News Categories: ${newsCategories.length}`);
    console.log(`- Project Categories: ${projectCategories.length}`);
    console.log(`- Total: ${productCategories.length + newsCategories.length + projectCategories.length}`);

  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedCategories();

export default seedCategories;
