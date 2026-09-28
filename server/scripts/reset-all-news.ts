import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from "../../utils/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

async function resetAllNews() {
  logger.log('\n============================================================');
  logger.log('CTC — PURGING ALL OLD NEWS ARTICLES AND CATEGORIES');
  logger.log('============================================================');

  await mongoose.connect(MONGO_URI);
  logger.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection failed');

  const res1 = await db.collection('news').deleteMany({}).catch(() => ({ deletedCount: 0 }));
  const res2 = await db.collection('newsarticles').deleteMany({}).catch(() => ({ deletedCount: 0 }));
  const res3 = await db.collection('newscategories').deleteMany({}).catch(() => ({ deletedCount: 0 }));

  logger.log(`🗑️ Deleted ${res1.deletedCount || 0} items from "news" collection`);
  logger.log(`🗑️ Deleted ${res2.deletedCount || 0} items from "newsarticles" collection`);
  logger.log(`🗑️ Deleted ${res3.deletedCount || 0} items from "newscategories" collection`);

  await mongoose.disconnect();
  logger.log('✅ Purge complete!\n');
}

resetAllNews().catch((err) => {
  logger.error('❌ Error purging news:', err);
  process.exit(1);
});
