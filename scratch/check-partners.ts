import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

const PartnerSchema = new mongoose.Schema({
  name: String,
  logo: String,
  website: String,
  tier: String,
  type: String,
  status: String
});

const Partner = mongoose.model('Partner', PartnerSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const partners = await Partner.find({});
  console.log('Partners in DB:', JSON.stringify(partners, null, 2));
  await mongoose.disconnect();
}

run().catch(console.error);
