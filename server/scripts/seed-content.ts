/**
 * Seed Content Script
 * Tạo dữ liệu mẫu cho projects và news với categories mới
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product, Project, News, ProductCategory, NewsCategory, ProjectCategory } from '../../models';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

// Sample Projects
const sampleProjects = [
  {
    title: 'Hệ thống điện mặt trời mái nhà 5kW',
    description: 'Lắp đặt hệ thống điện mặt trời mái nhà công suất 5kW cho gia đình tại Đà Nẵng',
    location: 'Đà Nẵng',
    capacity: '5kW',
    completionDate: '2024-10-15',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'
  },
  {
    title: 'Nhà máy điện mặt trời 100kW',
    description: 'Dự án nhà máy điện mặt trời công suất 100kW cho khu công nghiệp',
    location: 'Bình Dương',
    capacity: '100kW',
    completionDate: '2024-09-20',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800'
  }
];

// Sample News
const sampleNews = [
  {
    title: 'Công nghệ pin mặt trời mới đạt hiệu suất 25%',
    excerpt: 'Công nghệ pin mặt trời thế hệ mới với hiệu suất chuyển đổi lên đến 25%, mở ra kỷ nguyên mới cho năng lượng tái tạo.',
    content: 'Các nhà khoa học đã phát triển thành công công nghệ pin mặt trời với hiệu suất chuyển đổi năng lượng lên đến 25%. Đây là bước tiến quan trọng trong việc giảm chi phí và tăng hiệu quả của năng lượng mặt trời.',
    author: 'Trần Văn Minh',
    date: '2024-11-15',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'
  },
  {
    title: 'Chính sách hỗ trợ điện mặt trời mái nhà 2024',
    excerpt: 'Chính phủ công bố chính sách mới hỗ trợ lắp đặt điện mặt trời mái nhà với mức giá ưu đãi.',
    content: 'Chính phủ vừa ban hành chính sách mới về hỗ trợ phát triển điện mặt trời mái nhà, với mức giá bán điện ưu đãi và các ưu đãi về thuế.',
    author: 'Lê Thị Hương',
    date: '2024-11-10',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800'
  }
];

async function seedContent() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get categories
    const productCategories = await ProductCategory.find();
    const newsCategories = await NewsCategory.find();
    const projectCategories = await ProjectCategory.find();

    console.log(`Found ${productCategories.length} product categories`);
    console.log(`Found ${newsCategories.length} news categories`);
    console.log(`Found ${projectCategories.length} project categories`);

    // Clear existing content
    console.log('\nClearing existing content...');
    await Project.deleteMany({});
    await News.deleteMany({});
    console.log('Cleared existing content');

    // Seed Projects
    console.log('\nSeeding Projects...');
    for (const projectData of sampleProjects) {
      // Assign to first project category if available
      const categoryId = projectCategories.length > 0 ? projectCategories[0]._id.toString() : undefined;
      
      const project = new Project({
        ...projectData,
        categoryId
      });
      await project.save();
      console.log(`✓ Created project: ${projectData.title}`);
    }

    // Seed News
    console.log('\nSeeding News...');
    for (const newsData of sampleNews) {
      // Assign to first news category if available
      const categoryId = newsCategories.length > 0 ? newsCategories[0]._id.toString() : undefined;
      
      const news = new News({
        ...newsData,
        categoryId
      });
      await news.save();
      console.log(`✓ Created news: ${newsData.title}`);
    }

    console.log('\n✅ Content seeded successfully!');
    console.log(`\nSummary:`);
    console.log(`- Projects: ${sampleProjects.length}`);
    console.log(`- News: ${sampleNews.length}`);

  } catch (error) {
    console.error('Error seeding content:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedContent();

export default seedContent;
