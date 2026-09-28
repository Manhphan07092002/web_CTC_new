/**
 * Sync Category Counts Script
 * Đồng bộ số lượng items trong mỗi category sử dụng Mongo collection driver trực tiếp
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from "../../utils/logger";

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

async function syncCategoryCounts() {
  try {
    logger.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    logger.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not established');

    // Sync Product Categories
    logger.log('📦 Syncing Product Categories...');
    const productCategories = await db.collection('productcategories').find().toArray();
    for (const category of productCategories) {
      if (!category) continue;
      const catId = category._id ? String(category._id) : (category.id || '');
      const catName = category.name || '';

      const orConditions: any[] = [];
      if (catId) orConditions.push({ categoryId: catId });
      if (catName) orConditions.push({ category: catName });

      const count = orConditions.length > 0 
        ? await db.collection('products').countDocuments({ $or: orConditions, isDeleted: { $ne: true } })
        : 0;
      
      await db.collection('productcategories').updateOne(
        { _id: category._id },
        { $set: { productCount: count } }
      );
      logger.log(`  ✓ ${catName}: ${count} products`);
    }

    // Sync News Categories
    logger.log('\n📰 Syncing News Categories...');
    const newsCategories = await db.collection('newscategories').find().toArray();
    for (const category of newsCategories) {
      if (!category) continue;
      const catId = category._id ? String(category._id) : (category.id || '');
      const catName = category.name || '';

      const orConditions: any[] = [];
      if (catId) orConditions.push({ categoryId: catId });
      if (catName) orConditions.push({ category: catName });

      const count = orConditions.length > 0 
        ? await db.collection('news').countDocuments({ $or: orConditions })
        : 0;
      
      await db.collection('newscategories').updateOne(
        { _id: category._id },
        { $set: { newsCount: count } }
      );
      logger.log(`  ✓ ${catName}: ${count} news items`);
    }

    // Sync Project Categories
    logger.log('\n🏗️ Syncing Project Categories...');
    const projectCategories = await db.collection('projectcategories').find().toArray();
    for (const category of projectCategories) {
      if (!category) continue;
      const catId = category._id ? String(category._id) : (category.id || '');
      const catName = category.name || '';

      const orConditions: any[] = [];
      if (catId) orConditions.push({ categoryId: catId });
      if (catName) orConditions.push({ category: catName });

      const count = orConditions.length > 0 
        ? await db.collection('projects').countDocuments({ $or: orConditions })
        : 0;
      
      await db.collection('projectcategories').updateOne(
        { _id: category._id },
        { $set: { projectCount: count } }
      );
      logger.log(`  ✓ ${catName}: ${count} projects`);
    }

    logger.log('\n✅ Category counts synced successfully!');

    // Summary
    const totalProducts = await db.collection('products').countDocuments({ isDeleted: { $ne: true } });
    const totalNews = await db.collection('news').countDocuments();
    const totalProjects = await db.collection('projects').countDocuments();

    logger.log('\n📊 Summary:');
    logger.log(`  Products: ${totalProducts}`);
    logger.log(`  News: ${totalNews}`);
    logger.log(`  Projects: ${totalProjects}`);

  } catch (error) {
    logger.error('❌ Error syncing category counts:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.log('\nDisconnected from MongoDB');
  }
}

// Run if called directly
syncCategoryCounts();

export default syncCategoryCounts;
