import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:ctcadmin2024@127.0.0.1:27017/ctc_web_new?authSource=admin';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Hash password properly with bcrypt
    console.log('Hashing password...');
    const hash = await bcrypt.hash('CTC@2024', 10);

    // Upsert admin user (create if not exists, update if exists)
    const result = await users.updateOne(
      { email: 'admin@ctcdn.vn' },
      {
        $set: {
          name: 'Super Admin',
          email: 'admin@ctcdn.vn',
          password: hash,
          role: 'admin',
          phone: '',
          avatar: ''
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    console.log('Result:', result.upsertedId ? 'Created new admin' : 'Updated existing admin');
    console.log('\n✅ Admin credentials:');
    console.log('Email: admin@ctcdn.vn');
    console.log('Password: CTC@2024');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
