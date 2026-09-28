/**
 * Clear All Products Script
 * Xóa sạch tất cả các sản phẩm cũ trong cơ sở dữ liệu MongoDB và reset productCount danh mục.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product, ProductCategory, Category } from '../../models/index.js';
import { logger } from "../../utils/logger";


dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

const CLEAR_CATEGORIES = String(process.env.CLEAR_CATEGORIES || 'true').toLowerCase() === 'true';

async function clearAllProducts() {
  try {
    logger.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    logger.log('Connected to MongoDB');

    // 1. Clear all products
    logger.log('\n🔥 Deleting ALL products from database...');
    const result = await Product.deleteMany({});
    logger.log(`✓ Successfully deleted ${result.deletedCount} products`);

    // 2. Clear or Reset categories
    if (CLEAR_CATEGORIES) {
      logger.log('\n🔥 Deleting ALL categories from database...');
      const catResult = await ProductCategory.deleteMany({});
      logger.log(`✓ Successfully deleted ${catResult.deletedCount} ProductCategory items`);
      const legacyCatResult = await Category.deleteMany({});
      logger.log(`✓ Successfully deleted ${legacyCatResult.deletedCount} legacy Category items`);
    } else {

      logger.log('\n🔄 Resetting product counts on all categories...');
      const updateResult = await ProductCategory.updateMany({}, { $set: { productCount: 0 } });
      logger.log(`✓ Updated ${updateResult.modifiedCount} categories productCount to 0`);
    }

    logger.log('\n✅ All old products and categories cleared successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error clearing products:', error);
    process.exit(1);
  }
}


clearAllProducts();
