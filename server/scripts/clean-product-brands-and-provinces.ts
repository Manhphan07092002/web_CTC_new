import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Product } from '../../models/index.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

function detectRealBrand(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('cisco')) return 'Cisco';
  if (n.includes('tp-link') || n.includes('tplink')) return 'TP-Link';
  if (n.includes('mikrotik')) return 'MikroTik';
  if (n.includes('draytek')) return 'DrayTek';
  if (n.includes('ruijie') || n.includes('reyee')) return 'Ruijie';
  if (n.includes('huawei')) return 'Huawei';
  if (n.includes('sungrow')) return 'Sungrow';
  if (n.includes('deye')) return 'Deye';
  if (n.includes('sma')) return 'SMA';
  if (n.includes('jinko')) return 'Jinko Solar';
  if (n.includes('ja solar')) return 'JA Solar';
  if (n.includes('canadian')) return 'Canadian Solar';
  if (n.includes('longi')) return 'Longi Solar';
  if (n.includes('dintek')) return 'Dintek';
  if (n.includes('commscope') || n.includes('amp')) return 'CommScope';
  if (n.includes('vision')) return 'Vision';
  if (n.includes('dinstar')) return 'Dinstar';
  return 'Chính Hãng';
}

function cleanText(text: string, realBrand: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Remove "MikroTik / DrayTek" default brand string if product is not MikroTik or DrayTek
  if (realBrand !== 'MikroTik' && realBrand !== 'DrayTek') {
    cleaned = cleaned.replace(/MikroTik\s*\/\s*DrayTek/gi, realBrand);
  }

  // 2. Fix 63 province references
  cleaned = cleaned.replace(/tất cả 63 tỉnh thành/gi, 'toàn quốc');
  cleaned = cleaned.replace(/63 tỉnh thành/gi, '34 tỉnh, thành phố và toàn quốc');
  cleaned = cleaned.replace(/63 tỉnh, thành phố/gi, '34 tỉnh, thành phố');

  // 3. Remove random provincial injections like "tại An Giang và tất cả 63 tỉnh thành" -> "trên toàn quốc"
  cleaned = cleaned.replace(/tại\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĐa-zàáâãèéêìíòóôõùúýđ\s]+\s+và tất cả/g, 'trên');
  cleaned = cleaned.replace(/bảo hành đổi trả tại\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĐa-zàáâãèéêìíòóôõùúýđ\s]+\s+và/g, 'bảo hành đổi trả trên');

  return cleaned;
}

async function runCleanup() {
  console.log('🚀 Starting MongoDB Product Brands & Provinces Cleanup...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🍃 Connected to MongoDB:', MONGODB_URI);

    const products = await Product.find({ isDeleted: { $ne: true } });
    console.log(`📦 Total products to inspect: ${products.length}`);

    let updatedCount = 0;

    for (const product of products) {
      const realBrand = detectRealBrand(product.name);
      let isModified = false;

      if (product.brand !== realBrand) {
        product.brand = realBrand;
        isModified = true;
      }

      const cleanedDesc = cleanText(product.description || '', realBrand);
      if (cleanedDesc !== product.description) {
        product.description = cleanedDesc;
        isModified = true;
      }

      const cleanedShortDesc = cleanText(product.shortDescription || '', realBrand);
      if (cleanedShortDesc !== product.shortDescription) {
        product.shortDescription = cleanedShortDesc;
        isModified = true;
      }

      const cleanedSpecs = cleanText(product.specifications || '', realBrand);
      if (cleanedSpecs !== product.specifications) {
        product.specifications = cleanedSpecs;
        isModified = true;
      }

      if (isModified) {
        await product.save();
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} products with clean brands & nationwide delivery text.`);

  } catch (error) {
    console.error('❌ Error during product cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 MongoDB connection closed.');
  }
}

runCleanup();
