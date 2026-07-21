/**
 * Check Categories in Database
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ProductCategory, NewsCategory, ProjectCategory } from '../../models';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

async function checkCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Check Product Categories
    console.log('=== PRODUCT CATEGORIES ===');
    const productCats = await ProductCategory.find({});
    console.log(`Total: ${productCats.length}`);
    productCats.forEach((cat, idx) => {
      console.log(`${idx + 1}. ${cat.name} (${cat._id})`);
      console.log(`   Slug: ${cat.slug}`);
      console.log(`   Description: ${cat.description}`);
      console.log(`   Order: ${cat.order}, Active: ${cat.isActive}\n`);
    });

    // Check News Categories
    console.log('\n=== NEWS CATEGORIES ===');
    const newsCats = await NewsCategory.find({});
    console.log(`Total: ${newsCats.length}`);
    newsCats.forEach((cat, idx) => {
      console.log(`${idx + 1}. ${cat.name} (${cat._id})`);
      console.log(`   Slug: ${cat.slug}`);
      console.log(`   Description: ${cat.description}`);
      console.log(`   Order: ${cat.order}, Active: ${cat.isActive}\n`);
    });

    // Check Project Categories
    console.log('\n=== PROJECT CATEGORIES ===');
    const projectCats = await ProjectCategory.find({});
    console.log(`Total: ${projectCats.length}`);
    projectCats.forEach((cat, idx) => {
      console.log(`${idx + 1}. ${cat.name} (${cat._id})`);
      console.log(`   Slug: ${cat.slug}`);
      console.log(`   Description: ${cat.description}`);
      console.log(`   Order: ${cat.order}, Active: ${cat.isActive}\n`);
    });

  } catch (error) {
    console.error('Error checking categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the check function
checkCategories();

export default checkCategories;
