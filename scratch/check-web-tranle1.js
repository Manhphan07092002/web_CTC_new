import mongoose from 'mongoose';

async function test() {
  await mongoose.connect('mongodb://localhost:27017/web-tranle1');
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('web-tranle1 collections:');
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments({});
    console.log(` - ${col.name}: ${count} documents`);
  }
  await mongoose.disconnect();
}

test();
