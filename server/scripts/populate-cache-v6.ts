import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.resolve(__dirname, '../.cache/seed-500-products-v6');
const V4_CACHE_FILE = path.resolve(__dirname, '../.cache/seed-500-products-v4/image-cache-v4.json');
const IMAGE_CACHE_FILE = path.join(CACHE_DIR, 'image-cache-v6.json');

async function run() {
  await fs.mkdir(CACHE_DIR, { recursive: true });

  let v4Cache: Record<string, unknown> = {};
  try {
    const raw = await fs.readFile(V4_CACHE_FILE, 'utf8');
    v4Cache = JSON.parse(raw);
    console.log(`Loaded ${Object.keys(v4Cache).length} items from v4 cache.`);
  } catch {
    console.log('No v4 cache found.');
  }

  await fs.writeFile(IMAGE_CACHE_FILE, JSON.stringify(v4Cache, null, 2), 'utf8');
  console.log(`Initialized image-cache-v6.json with ${Object.keys(v4Cache).length} items.`);
}

run().catch(console.error);
