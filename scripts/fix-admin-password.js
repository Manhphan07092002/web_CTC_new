import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:ctcadmin2024@127.0.0.1:27017/ctc_web_new?authSource=admin';

async function fixAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    // Hash password properly
    console.log('Hashing new password (CTC@2024)...');
    const hash = await bcrypt.hash('CTC@2024', 10);
    
    // Update or insert admin
    const result = await users.updateOne(
      { email: 'admin@ctcdn.vn' },
      { 
        $set: { 
          password: hash,
          role: 'admin',
          name: 'Super Admin'
        }
      },
      { upsert: true }
    );
    
    console.log('Update result:', result);
    console.log('✅ Admin password updated successfully with proper hash!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing password:', error);
    process.exit(1);
  }
}

fixAdminPassword();
