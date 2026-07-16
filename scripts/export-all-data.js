// Export all MongoDB data to JSON files
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

// Collections to export
const COLLECTIONS = [
  'products',
  'productcategories',
  'projects',
  'projectcategories',
  'news',
  'newscategories',
  'testimonials',
  'partners',
  'users',
  'teammembers',
  'contacts',
  'reviews',
  'notifications',
  'settings',
  'analyticsevents',
  'analyticsgoals',
  'funnelmetrics'
];

async function exportAllData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create export directory
    const exportDir = path.join(__dirname, '..', 'exports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const exportPath = path.join(exportDir, `backup-${timestamp}`);
    
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    fs.mkdirSync(exportPath, { recursive: true });

    console.log(`📁 Export directory: ${exportPath}\n`);

    let totalDocuments = 0;
    const summary = [];

    // Export each collection
    for (const collectionName of COLLECTIONS) {
      try {
        const collection = mongoose.connection.collection(collectionName);
        const documents = await collection.find({}).toArray();
        
        if (documents.length > 0) {
          const filename = `${collectionName}.json`;
          const filepath = path.join(exportPath, filename);
          
          fs.writeFileSync(filepath, JSON.stringify(documents, null, 2), 'utf8');
          
          console.log(`✅ ${collectionName.padEnd(25)} ${documents.length.toString().padStart(5)} documents`);
          totalDocuments += documents.length;
          
          summary.push({
            collection: collectionName,
            count: documents.length,
            file: filename
          });
        } else {
          console.log(`⚠️  ${collectionName.padEnd(25)} ${' 0'.padStart(5)} documents (skipped)`);
        }
      } catch (error) {
        console.log(`❌ ${collectionName.padEnd(25)} Error: ${error.message}`);
      }
    }

    // Create summary file
    const summaryData = {
      exportDate: new Date().toISOString(),
      database: MONGO_URI,
      totalCollections: summary.length,
      totalDocuments: totalDocuments,
      collections: summary
    };

    fs.writeFileSync(
      path.join(exportPath, '_summary.json'),
      JSON.stringify(summaryData, null, 2),
      'utf8'
    );

    // Create README
    const readme = `# MongoDB Backup
Export Date: ${new Date().toLocaleString('vi-VN')}
Database: ${MONGO_URI}

## Summary
- Total Collections: ${summary.length}
- Total Documents: ${totalDocuments}

## Collections
${summary.map(s => `- ${s.collection}: ${s.count} documents`).join('\n')}

## How to Import
\`\`\`bash
# Import single collection
mongoimport --db web-tranle1 --collection products --file products.json --jsonArray

# Import all collections
npm run import-data
\`\`\`
`;

    fs.writeFileSync(path.join(exportPath, 'README.md'), readme, 'utf8');

    console.log('\n' + '='.repeat(60));
    console.log(`✨ Export completed successfully!`);
    console.log(`📊 Total: ${totalDocuments} documents from ${summary.length} collections`);
    console.log(`📁 Location: ${exportPath}`);
    console.log('='.repeat(60));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

exportAllData();
