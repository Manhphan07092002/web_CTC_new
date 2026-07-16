import mongoose from 'mongoose';
import { Product, ProductCategory } from '../../models';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

async function updateCategoryCounts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await ProductCategory.find();
    console.log(`Found ${categories.length} categories`);

    // Update count for each category
    for (const category of categories) {
      // Count products by categoryId (new system)
      const countById = await Product.countDocuments({ 
        categoryId: category._id,
        isActive: true,
        isDeleted: { $ne: true }
      });

      // Count products by category name (old system)
      const countByName = await Product.countDocuments({ 
        category: category.name,
        isActive: true,
        isDeleted: { $ne: true }
      });

      // Use the higher count (in case some products use old system)
      const totalCount = Math.max(countById, countByName);

      // Update category
      await ProductCategory.findByIdAndUpdate(category._id, {
        productCount: totalCount
      });

      console.log(`✅ ${category.name}: ${totalCount} products`);
    }

    // Show final summary
    console.log('\n📊 Final Summary:');
    const updatedCategories = await ProductCategory.find().sort({ name: 1 });
    updatedCategories.forEach(cat => {
      console.log(`${cat.name}: ${cat.productCount} products`);
    });

    console.log('\n🎉 Category counts updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateCategoryCounts();
