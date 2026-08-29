import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

async function fixInverters() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const Product = mongoose.connection.db!.collection('products');

  const huaweiReplacements: Record<string, string> = {
    'SUN2000-3KTL-L1': 'https://solar.huawei.com/admin/asset/v1/pro/view/8ce9247014a847e7a798a4548e59cb9e.png',
    'SUN2000-5KTL-L1': 'https://solar.huawei.com/admin/asset/v1/pro/view/238e42509c4141159f71758a448f4d25.png',
    'SUN2000-10KTL-M1': 'https://solar.huawei.com/admin/asset/v1/pro/view/fa4dc467d58d4a98be4e870da57f00bf.png',
    'SUN2000-20KTL-M2': 'https://solar.huawei.com/admin/asset/v1/pro/view/630b91e9a3a948e99fcfe84e8ec3b7ae.png',
    'SUN2000-50KTL-M3': 'https://solar.huawei.com/admin/asset/v1/pro/view/7279f0fc3ecb45ea88b688d0eb5f3fa3.png',
    'SUN2000-100KTL-M2': 'https://solar.huawei.com/admin/asset/v1/pro/view/bf0d6f228b37494daff1206f6e5a0e98.png',
    'SUN2000-115KTL-M2': 'https://solar.huawei.com/admin/asset/v1/pro/view/c1e345e69bf94f9999a0d84c3e8031d8.png',
    'SUN2000-450W-P2': 'https://solar.huawei.com/admin/asset/v1/pro/view/70362f689e4744d0840bc43f324bc63b.png',
    'SUN2000-600W-P': 'https://solar.huawei.com/admin/asset/v1/pro/view/054a5528994747ebba397a61d1ea00d8.png',
    'SmartLogger 3000A': 'https://solar.huawei.com/admin/asset/v1/pro/view/46cc4dbb68d541b3aaac715ee69a7af6.jpg',
    'LUNA2000-5-E0': 'https://solar.huawei.com/admin/asset/v1/pro/view/3c2a382c4997424683fb081a28a3857d.png',
    'LUNA2000-10-S0': 'https://solar.huawei.com/admin/asset/v1/pro/view/3c2a382c4997424683fb081a28a3857d.png'
  };

  for (const [model, url] of Object.entries(huaweiReplacements)) {
    const res = await Product.updateMany(
      { name: new RegExp(model.replace(/\s+/g, '.*'), 'i') },
      { $set: { image: url, images: [url] } }
    );
    console.log(`Updated Huawei ${model} -> ${res.modifiedCount} products`);
  }

  const growattReplacements: Record<string, string> = {
    'MAX 50KTL3-LV': 'https://www.dhcsolar.com/wp-content/uploads/2020/08/growatt-MAX-50KTL3-LV.jpg',
    'MAX 100KTL3-X': 'https://www.dhcsolar.com/wp-content/uploads/2025/06/bien-tan-growatt-150kw.jpg',
    'MAX 125KTL3-X': 'https://www.dhcsolar.com/wp-content/uploads/2022/09/Datasheet-growatt-max-125KTL3-X-LV.jpg',
    'MIN 3000TL-X': 'https://www.dhcsolar.com/wp-content/uploads/2021/03/Growatt-MIN-3000-6000-TL-X.jpg',
    'MIN 5000TL-X': 'https://www.dhcsolar.com/wp-content/uploads/2020/08/growatt-MIN-5000TL-X.jpg',
    'MOD 10KTL3-X': 'https://www.dhcsolar.com/wp-content/uploads/2021/08/Datasheet-growatt-MOD-15KTL3-X.jpg',
    'MOD 15KTL3-X': 'https://www.dhcsolar.com/wp-content/uploads/2020/08/inverter-growatt-15kw-MOD-15KTL3-X.jpg',
    'MID 20KTL3-X1': 'https://www.dhcsolar.com/wp-content/uploads/2021/08/Datasheet-inverter-growatt-mid-25ktl3-x.jpg',
    'MID 25KTL3-X1': 'https://www.dhcsolar.com/wp-content/uploads/2020/08/inverter-growatt-25kw-mid-25ktl3-x.jpg'
  };

  for (const [model, url] of Object.entries(growattReplacements)) {
    const res = await Product.updateMany(
      { name: new RegExp(model.replace(/\s+/g, '.*'), 'i') },
      { $set: { image: url, images: [url] } }
    );
    console.log(`Updated Growatt ${model} -> ${res.modifiedCount} products`);
  }

  // Also clear in-memory backend cache
  try {
    const res = await fetch('http://localhost:4000/api/products/clear-cache');
    console.log('Cleared backend cache:', await res.json());
  } catch (e: any) {
    console.log('Backend cache clear:', e.message);
  }

  console.log('✅ ALL INVERTER IMAGES SUCCESSFULLY FIXED!');
  await mongoose.disconnect();
}

fixInverters().catch(console.error);
