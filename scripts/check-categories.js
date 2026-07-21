import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

// ProductCategory Schema
const ProductCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: String,
  color: String,
  image: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  productCount: { type: Number, default: 0 },
  parentId: String
}, { timestamps: true });

const ProductCategory = mongoose.model('ProductCategory', ProductCategorySchema);

async function checkCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all product categories
    const categories = await ProductCategory.find().sort({ order: 1, name: 1 });
    
    console.log(`\n📁 Found ${categories.length} product categories:`);
    console.log('=' .repeat(60));
    
    if (categories.length === 0) {
      console.log('❌ No product categories found!');
      console.log('💡 You may need to run seed-categories script first.');
    } else {
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
        console.log(`   📝 Slug: ${cat.slug}`);
        console.log(`   📊 Products: ${cat.productCount || 0}`);
        console.log(`   🎨 Icon: ${cat.icon || 'None'}`);
        console.log(`   🎯 Active: ${cat.isActive ? '✅' : '❌'}`);
        console.log(`   📅 Created: ${cat.createdAt?.toLocaleDateString() || 'Unknown'}`);
        console.log('   ' + '-'.repeat(40));
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCategories();
