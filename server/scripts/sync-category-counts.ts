/**
 * Sync Category Counts Script
 * Đồng bộ số lượng items trong mỗi category
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ProductCategory, NewsCategory, ProjectCategory } from '../../models';
import { Product, News, Project } from '../../models';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

async function syncCategoryCounts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Sync Product Categories
    console.log('📦 Syncing Product Categories...');
    const productCategories = await ProductCategory.find();
    for (const category of productCategories) {
      const count = await Product.countDocuments({ 
        $or: [
          { categoryId: category._id.toString() },
          { category: category.name }
        ],
        isDeleted: { $ne: true }
      });
      
      category.productCount = count;
      await category.save();
      console.log(`  ✓ ${category.name}: ${count} products`);
    }

    // Sync News Categories
    console.log('\n📰 Syncing News Categories...');
    const newsCategories = await NewsCategory.find();
    for (const category of newsCategories) {
      const count = await News.countDocuments({ 
        $or: [
          { categoryId: category._id.toString() },
          { category: category.name }
        ]
      });
      
      category.newsCount = count;
      await category.save();
      console.log(`  ✓ ${category.name}: ${count} news items`);
    }

    // Sync Project Categories
    console.log('\n🏗️ Syncing Project Categories...');
    const projectCategories = await ProjectCategory.find();
    for (const category of projectCategories) {
      const count = await Project.countDocuments({ 
        $or: [
          { categoryId: category._id.toString() },
          { category: category.name }
        ]
      });
      
      category.projectCount = count;
      await category.save();
      console.log(`  ✓ ${category.name}: ${count} projects`);
    }

    console.log('\n✅ Category counts synced successfully!');

    // Summary
    const totalProducts = await Product.countDocuments({ isDeleted: { $ne: true } });
    const totalNews = await News.countDocuments();
    const totalProjects = await Project.countDocuments();

    console.log('\n📊 Summary:');
    console.log(`  Products: ${totalProducts}`);
    console.log(`  News: ${totalNews}`);
    console.log(`  Projects: ${totalProjects}`);

  } catch (error) {
    console.error('❌ Error syncing category counts:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run if called directly
syncCategoryCounts();

export default syncCategoryCounts;
