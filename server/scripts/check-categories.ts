/**
 * Check Categories in Database
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ProductCategory, NewsCategory, ProjectCategory } from '../../models';
import { logger } from "../../utils/logger";

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

async function checkCategories() {
  try {
    logger.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    logger.log('Connected to MongoDB\n');

    // Check Product Categories
    logger.log('=== PRODUCT CATEGORIES ===');
    const productCats = await ProductCategory.find({});
    logger.log(`Total: ${productCats.length}`);
    productCats.forEach((cat, idx) => {
      logger.log(`${idx + 1}. ${cat.name} (${cat._id})`);
      logger.log(`   Slug: ${cat.slug}`);
      logger.log(`   Description: ${cat.description}`);
      logger.log(`   Order: ${cat.order}, Active: ${cat.isActive}\n`);
    });

    // Check News Categories
    logger.log('\n=== NEWS CATEGORIES ===');
    const newsCats = await NewsCategory.find({});
    logger.log(`Total: ${newsCats.length}`);
    newsCats.forEach((cat, idx) => {
      logger.log(`${idx + 1}. ${cat.name} (${cat._id})`);
      logger.log(`   Slug: ${cat.slug}`);
      logger.log(`   Description: ${cat.description}`);
      logger.log(`   Order: ${cat.order}, Active: ${cat.isActive}\n`);
    });

    // Check Project Categories
    logger.log('\n=== PROJECT CATEGORIES ===');
    const projectCats = await ProjectCategory.find({});
    logger.log(`Total: ${projectCats.length}`);
    projectCats.forEach((cat, idx) => {
      logger.log(`${idx + 1}. ${cat.name} (${cat._id})`);
      logger.log(`   Slug: ${cat.slug}`);
      logger.log(`   Description: ${cat.description}`);
      logger.log(`   Order: ${cat.order}, Active: ${cat.isActive}\n`);
    });

  } catch (error) {
    logger.error('Error checking categories:', error);
  } finally {
    await mongoose.disconnect();
    logger.log('Disconnected from MongoDB');
  }
}

// Run the check function
checkCategories();

export default checkCategories;
