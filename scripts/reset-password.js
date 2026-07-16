import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  avatar: { type: String },
  role: { type: String, required: true, enum: ['admin', 'editor', 'viewer'] },
  lastLogin: { type: Date }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function resetPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@tranle.com' });
    
    if (!admin) {
      console.error('Admin user not found!');
      process.exit(1);
    }

    console.log('Found admin user:', admin._id);
    console.log('Resetting password to: TranLe@2024');
    
    admin.password = 'TranLe@2024';
    await admin.save();
    
    console.log('\n✅ Password reset successfully!');
    console.log('Email: admin@tranle.com');
    console.log('Password: TranLe@2024');
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetPassword();
