import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

async function resetEngagement() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Reset all products' engagement stats to 0
    const result = await Product.updateMany(
      {},
      { 
        $set: { 
          views: 0, 
          likes: 0, 
          shares: 0 
        } 
      }
    );

    console.log(`✅ Reset engagement stats for ${result.modifiedCount} products`);
    console.log('   Views: 0');
    console.log('   Likes: 0');
    console.log('   Shares: 0');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetEngagement();
