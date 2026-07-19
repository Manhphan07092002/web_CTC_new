import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

const PartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  website: String,
  tier: { type: String, default: 'gold' },
  type: { type: String, enum: ['supplier', 'financial'], required: true },
  status: { type: String, default: 'active' }
});

const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);

interface PartnerData {
  name: string;
  logo: string;
  website: string;
  tier: string;
  type: 'supplier' | 'financial';
  status: string;
}

const samplePartners: PartnerData[] = [
  // ── SUPPLIERS ──
  {
    name: 'Huawei',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Huawei-Logo.svg',
    website: 'https://huawei.com',
    tier: 'platinum',
    type: 'supplier',
    status: 'active'
  },
  {
    name: 'Jinko Solar',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/JinkoSolar_Logo.png',
    website: 'https://jinkosolar.com',
    tier: 'gold',
    type: 'supplier',
    status: 'active'
  },
  {
    name: 'Canadian Solar',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Canadian_Solar_logo.svg',
    website: 'https://canadiansolar.com',
    tier: 'gold',
    type: 'supplier',
    status: 'active'
  },
  {
    name: 'ABB',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg',
    website: 'https://global.abb',
    tier: 'platinum',
    type: 'supplier',
    status: 'active'
  },
  {
    name: 'SMA Solar',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Sma_solar_technology_logo.png',
    website: 'https://sma.de',
    tier: 'gold',
    type: 'supplier',
    status: 'active'
  },
  {
    name: 'Dell Technologies',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg',
    website: 'https://dell.com',
    tier: 'gold',
    type: 'supplier',
    status: 'active'
  },
  {
    name: 'Mobifone',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Logo_MobiFone.svg',
    website: 'https://mobifone.vn',
    tier: 'platinum',
    type: 'supplier',
    status: 'active'
  },
  {
    name: 'VNPT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/VNPT_Logo.svg',
    website: 'https://vnpt.com.vn',
    tier: 'platinum',
    type: 'supplier',
    status: 'active'
  },

  // ── FINANCIAL PARTNERS ──
  {
    name: 'VietinBank',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Logo_VietinBank.svg',
    website: 'https://vietinbank.vn',
    tier: 'gold',
    type: 'financial',
    status: 'active'
  },
  {
    name: 'BIDV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_BIDV.svg',
    website: 'https://bidv.com.vn',
    tier: 'gold',
    type: 'financial',
    status: 'active'
  },
  {
    name: 'Vietcombank',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Vietcombank_logo.svg',
    website: 'https://vietcombank.com.vn',
    tier: 'platinum',
    type: 'financial',
    status: 'active'
  },
  {
    name: 'Agribank',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Agribank_Logo.svg',
    website: 'https://agribank.com.vn',
    tier: 'gold',
    type: 'financial',
    status: 'active'
  }
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Clearing old partners...');
    const deleteRes = await Partner.deleteMany({});
    console.log(`   Removed ${deleteRes.deletedCount} old partners.`);

    console.log('📦 Seeding new professional partners...');
    const inserted = await Partner.insertMany(samplePartners);
    console.log(`✅ Successfully seeded ${inserted.length} partners.`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding partners:', err);
    process.exit(1);
  }
}

seed();
