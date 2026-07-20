// Import all MongoDB data from JSON files
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

function convertIds(obj) {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(convertIds);
  }
  if (typeof obj === 'object') {
    const res = {};
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

async function importAllData() {
  try {
    // Get backup directory from command line or use 'seed-data' default
    const backupDir = process.argv[2] || 'seed-data';
    
    if (!backupDir) {
      console.error('❌ Please provide backup directory path');
      console.log('Usage: npm run import-data <backup-directory>');
      console.log('Example: npm run import-data exports/backup-2025-11-22T13-45-00');
      process.exit(1);
    }

    const backupPath = path.isAbsolute(backupDir) 
      ? backupDir 
      : path.join(__dirname, '..', backupDir);

    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup directory not found: ${backupPath}`);
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log(`📁 Import from: ${backupPath}\n`);

    // Read summary if exists
    const summaryPath = path.join(backupPath, '_summary.json');
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      console.log(`📊 Backup info:`);
      console.log(`   Date: ${new Date(summary.exportDate).toLocaleString('vi-VN')}`);
      console.log(`   Collections: ${summary.totalCollections}`);
      console.log(`   Documents: ${summary.totalDocuments}\n`);
    }

    // Get all JSON files
    const files = fs.readdirSync(backupPath)
      .filter(f => f.endsWith('.json') && !f.startsWith('_'));

    let totalImported = 0;

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const filepath = path.join(backupPath, file);
      
      try {
        let data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        
        if (data.length > 0) {
          data = convertIds(data);
          const collection = mongoose.connection.collection(collectionName);
          
          // Clear existing data to replace corrupt String IDs with clean ObjectIds
          await collection.deleteMany({});
          
          // Insert data
          await collection.insertMany(data, { ordered: false });
          
          console.log(`✅ ${collectionName.padEnd(25)} ${data.length.toString().padStart(5)} documents imported`);
          totalImported += data.length;
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  ${collectionName.padEnd(25)} Duplicate keys (skipped)`);
        } else {
          console.log(`❌ ${collectionName.padEnd(25)} Error: ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✨ Import completed!`);
    console.log(`📊 Total: ${totalImported} documents imported`);
    console.log('='.repeat(60));

    await mongoose.disconnect();

    // Automatically seed permissions & assign user roles after importing users
    try {
      console.log('\n🔑 Seeding permissions & roles...');
      execSync('npx tsx server/scripts/seed-permissions.ts', { stdio: 'inherit' });
      console.log('✅ Permissions and roles seeded successfully');
    } catch (e) {
      console.error('⚠️ Failed to seed permissions & roles:', e.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

importAllData();
