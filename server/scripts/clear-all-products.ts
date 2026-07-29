/**
 * Clear All Products Script
 * Xóa sạch tất cả các sản phẩm cũ trong cơ sở dữ liệu MongoDB và reset productCount danh mục.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product, ProductCategory } from '../../models';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

async function clearAllProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Clear all products
    console.log('\n🔥 Deleting ALL products from database...');
    const result = await Product.deleteMany({});
    console.log(`✓ Successfully deleted ${result.deletedCount} products`);

    // 2. Reset productCount on all categories to 0
    console.log('\n🔄 Resetting product counts on all categories...');
    const updateResult = await ProductCategory.updateMany({}, { $set: { productCount: 0 } });
    console.log(`✓ Updated ${updateResult.modifiedCount} categories productCount to 0`);

    console.log('\n✅ All old products cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    process.exit(1);
  }
}

clearAllProducts();
