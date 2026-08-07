import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.resolve(__dirname, '../.cache/seed-500-products-v6');
const V4_CACHE_FILE = path.resolve(__dirname, '../.cache/seed-500-products-v4/image-cache-v4.json');
const IMAGE_CACHE_FILE = path.join(CACHE_DIR, 'image-cache-v6.json');
const SOURCE_CACHE_FILE = path.join(CACHE_DIR, 'source-cache-v6.json');

const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  'laptop': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
  ],
  'pc-may-tinh-de-ban': [
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
  ],
  'mini-pc': [
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
  ],
  'may-chu-server': [
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  ],
  'tam-pin-nang-luong-mat-troi': [
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
  ],
  'inverter-hoa-luoi': [
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=800&q=80',
  ],
  'ac-quy-lithium-lifepo4': [
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  ],
  'ac-quy-chi-vrla': [
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  ],
  'ac-quy-nuoc-traction': [
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  ],
  'kiosk-tu-phuc-vu': [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  ],
  'may-in-nhan': [
    'https://images.unsplash.com/photo-1612815150545-98565a507851?auto=format&fit=crop&w=800&q=80',
  ],
  'dien-thoai-ip': [
    'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=800&q=80',
  ],
  'ip-pbx-tong-dai': [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
  ],
  'voip-gateway': [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
  ],
  'router': [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=800&q=80',
  ],
  'switch': [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
  ],
  'wifi-access-point': [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
  ],
};

const DEFAULT_POOL = [
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

async function run() {
  await fs.mkdir(CACHE_DIR, { recursive: true });

  let v4Cache: Record<string, any> = {};
  try {
    const raw = await fs.readFile(V4_CACHE_FILE, 'utf8');
    v4Cache = JSON.parse(raw);
    console.log(`Loaded ${Object.keys(v4Cache).length} items from v4 cache.`);
  } catch (err) {
    console.log('No v4 cache found.');
  }

  // Write initial v6 cache from v4 if available
  await fs.writeFile(IMAGE_CACHE_FILE, JSON.stringify(v4Cache, null, 2), 'utf8');
  console.log(`Initialized image-cache-v6.json with ${Object.keys(v4Cache).length} items.`);
}

run().catch(console.error);
