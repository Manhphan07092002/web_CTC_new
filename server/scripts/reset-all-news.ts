import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

async function resetAllNews() {
  console.log('\n============================================================');
  console.log('CTC — PURGING ALL OLD NEWS ARTICLES AND CATEGORIES');
  console.log('============================================================');

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection failed');

  const res1 = await db.collection('news').deleteMany({}).catch(() => ({ deletedCount: 0 }));
  const res2 = await db.collection('newsarticles').deleteMany({}).catch(() => ({ deletedCount: 0 }));
  const res3 = await db.collection('newscategories').deleteMany({}).catch(() => ({ deletedCount: 0 }));

  console.log(`🗑️ Deleted ${res1.deletedCount || 0} items from "news" collection`);
  console.log(`🗑️ Deleted ${res2.deletedCount || 0} items from "newsarticles" collection`);
  console.log(`🗑️ Deleted ${res3.deletedCount || 0} items from "newscategories" collection`);

  await mongoose.disconnect();
  console.log('✅ Purge complete!\n');
}

resetAllNews().catch((err) => {
  console.error('❌ Error purging news:', err);
  process.exit(1);
});
