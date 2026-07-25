import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

function convertIds(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(convertIds);
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) {
        res[key] = new mongoose.Types.ObjectId(val);
      } else if (val && typeof val === 'object') {
        res[key] = convertIds(val);
      } else {
        res[key] = val;
      }
    }
    return res;
  }
  return obj;
}

/**
 * Automatically imports all JSON seed files from `seed-data/` if MongoDB is empty.
 * Triggered automatically on server startup or initial setup.
 */
export async function autoSeedIfEmpty(): Promise<boolean> {
  try {
    const db = mongoose.connection.db;
    if (!db) return false;

    // Check if products collection has documents
    const productsCount = await db.collection('products').countDocuments();
    const settingsCount = await db.collection('settings').countDocuments();

    // If products or settings already exist, skip auto-seeding
    if (productsCount > 0 && settingsCount > 0) {
      return false;
    }

    console.log('🌱 Database is empty! Auto-seeding initial data from seed-data/...');

    // Locate seed-data directory
    const seedDir = path.join(process.cwd(), 'seed-data');
    if (!fs.existsSync(seedDir)) {
      console.warn(`⚠️ seed-data directory not found at: ${seedDir}`);
      return false;
    }

    // Read all JSON files except summary
    const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
    let totalImported = 0;

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const filePath = path.join(seedDir, file);

      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let data = JSON.parse(fileContent);

        if (Array.isArray(data) && data.length > 0) {
          data = convertIds(data);
          const collection = db.collection(collectionName);
          
          // Clear any partial data before inserting
          await collection.deleteMany({});
          await collection.insertMany(data, { ordered: false });
          
          console.log(`   ✅ Loaded ${collectionName}: ${data.length} records`);
          totalImported += data.length;
        }
      } catch (err: any) {
        console.error(`   ❌ Error loading ${file}:`, err.message || err);
      }
    }

    console.log(`🎉 Auto-seeding completed! Imported ${totalImported} documents across ${files.length} collections.\n`);
    return true;
  } catch (error: any) {
    console.error('❌ Auto-seed error:', error.message || error);
    return false;
  }
}
