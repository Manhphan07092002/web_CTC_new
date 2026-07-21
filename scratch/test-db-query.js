import mongoose from 'mongoose';

async function test() {
  console.log('--- Connecting to ctc_web_new ---');
  await mongoose.connect('mongodb://localhost:27017/ctc_web_new');
  console.log('ctc_web_new products count:', await mongoose.connection.collection('products').countDocuments({}));
  console.log('ctc_web_new productcategories count:', await mongoose.connection.collection('productcategories').countDocuments({}));
  console.log('Sample product ID from ctc_web_new:', (await mongoose.connection.collection('products').findOne({}))?._id);
  await mongoose.disconnect();

  console.log('\n--- Connecting to web-tranle1 ---');
  try {
    await mongoose.connect('mongodb://localhost:27017/web-tranle1');
    console.log('web-tranle1 products count:', await mongoose.connection.collection('products').countDocuments({}));
    console.log('Sample product ID from web-tranle1:', (await mongoose.connection.collection('products').findOne({}))?._id);
    await mongoose.disconnect();
  } catch (e) {
    console.log('Failed to connect to web-tranle1:', e.message);
  }
}

test();
