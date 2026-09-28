import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

async function fixAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    try {
      await mongoose.connect(MONGO_URI);
    } catch (e) {
      console.warn('Fallback connecting without auth...');
      await mongoose.connect('mongodb://127.0.0.1:27017/ctc_web_new');
    }
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    const newPassword = process.env.NEW_ADMIN_PASS;
    if (!newPassword) {
      console.error('Error: NEW_ADMIN_PASS environment variable is required');
      process.exit(1);
    }
    console.log('Hashing new password...');
    const hash = await bcrypt.hash(newPassword, 10);
    
    // Update or insert admin
    const result = await users.updateOne(
      { email: process.env.ADMIN_EMAIL || 'admin@ctcdn.vn' },
      { 
        $set: { 
          password: hash,
          role: 'admin',
          name: 'Admin CTC',
          failedLoginAttempts: 0,
          isLocked: false,
          lockUntil: null
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
