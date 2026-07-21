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
        categoryId: category._id.toString(),
        isDeleted: { $ne: true }
      });
      
      if (category.productCount !== count) {
        category.productCount = count;
        await category.save();
        console.log(`  ✓ ${category.name}: ${count} products`);
      } else {
        console.log(`  - ${category.name}: ${count} products (no change)`);
      }
    }

    // Sync News Categories
    console.log('\n📰 Syncing News Categories...');
    const newsCategories = await NewsCategory.find();
    for (const category of newsCategories) {
      const count = await News.countDocuments({ 
        categoryId: category._id.toString()
      });
      
      if (category.newsCount !== count) {
        category.newsCount = count;
        await category.save();
        console.log(`  ✓ ${category.name}: ${count} news items`);
      } else {
        console.log(`  - ${category.name}: ${count} news items (no change)`);
      }
    }

    // Sync Project Categories
    console.log('\n🏗️ Syncing Project Categories...');
    const projectCategories = await ProjectCategory.find();
    for (const category of projectCategories) {
      const count = await Project.countDocuments({ 
        categoryId: category._id.toString()
      });
      
      if (category.projectCount !== count) {
        category.projectCount = count;
        await category.save();
        console.log(`  ✓ ${category.name}: ${count} projects`);
      } else {
        console.log(`  - ${category.name}: ${count} projects (no change)`);
      }
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
if (require.main === module) {
  syncCategoryCounts();
}

export default syncCategoryCounts;
