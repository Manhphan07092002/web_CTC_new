import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { triggerInstantIndexing } from '../services/indexing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';
const SITE_URL = (process.env.SITE_URL || 'https://ctcdn.vn').replace(/\/$/, '');

async function submitAllUrls() {
  console.log('\n============================================================');
  console.log('🚀 CTC — PING INSTANT INDEXING (INDEXNOW + SEARCH ENGINES)');
  console.log('============================================================');

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB.');

  const db = mongoose.connection.db;
  if (!db) throw new Error('DB connection failed');

  const urls: string[] = [
    `${SITE_URL}/`,
    `${SITE_URL}/about`,
    `${SITE_URL}/solutions`,
    `${SITE_URL}/solutions/rooftop`,
    `${SITE_URL}/solutions/farm`,
    `${SITE_URL}/solutions/floating`,
    `${SITE_URL}/solutions/electrical`,
    `${SITE_URL}/solutions/datacenter`,
    `${SITE_URL}/solutions/construction`,
    `${SITE_URL}/products`,
    `${SITE_URL}/projects`,
    `${SITE_URL}/news`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/resources`,
  ];

  // Fetch News articles
  const newsItems = await db.collection('news').find({}).toArray();
  for (const item of newsItems) {
    const fullId = (item._id || item.id || '').toString();
    const shortHash = fullId.length >= 8 ? fullId.slice(-8) : fullId;
    const slugStr = item.slug || (item.title ? item.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') : 'tin-tuc');
    urls.push(`${SITE_URL}/news/${slugStr}-${shortHash}`);
  }

  // Fetch Products
  const products = await db.collection('products').find({ isDeleted: { $ne: true } }).toArray();
  for (const p of products) {
    const pId = (p._id || p.id || '').toString();
    if (pId) {
      urls.push(`${SITE_URL}/products/${pId}`);
    }
  }

  // Fetch Projects
  const projects = await db.collection('projects').find({ isDeleted: { $ne: true } }).toArray();
  for (const p of projects) {
    const pId = (p._id || p.id || '').toString();
    if (pId) {
      urls.push(`${SITE_URL}/projects/${pId}`);
    }
  }

  console.log(`📦 Found total ${urls.length} URLs to submit for indexing.`);

  // Submit in batches of 100
  const batchSize = 100;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    console.log(`📡 Pinging batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)} (${batch.length} URLs)...`);
    try {
      const res = await triggerInstantIndexing(batch);
      console.log(`  ✓ Status:`, res);
    } catch (err: any) {
      console.error(`  ✕ Error submitting batch:`, err?.message || err);
    }
  }

  await mongoose.disconnect();
  console.log('\n🎉 Instant Indexing submit completed successfully!\n');
}

submitAllUrls().catch(err => {
  console.error('❌ Error running submitAllUrls:', err);
  process.exit(1);
});
