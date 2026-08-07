import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

async function updateStock() {
  console.log('Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  const result = await mongoose.connection.collection('products').updateMany(
    {},
    { $set: { stock: 100, stockStatus: 'in_stock' } }
  );
  console.log(`✅ Updated ${result.modifiedCount} products to 'in_stock' (stock = 100)!`);
  await mongoose.disconnect();
}

updateStock().catch(console.error);
