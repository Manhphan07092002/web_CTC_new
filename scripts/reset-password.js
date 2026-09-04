import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  avatar: { type: String },
  role: { type: String, required: true, enum: ['admin', 'editor', 'viewer'] },
  lastLogin: { type: Date }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function resetPassword() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    let admin = await User.findOne({ email: 'admin@ctcdn.vn' });
    const salt = await bcrypt.genSalt(10);
    const newPassword = 'CTC@2024';
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    if (!admin) {
      console.log('Admin user not found. Creating new admin user...');
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@ctcdn.vn',
        password: hashedPassword,
        role: 'admin',
        phone: '0915 059 666',
        avatar: ''
      });
    } else {
      console.log('Found admin user:', admin._id);
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
    }
    
    console.log('\n✅ Password reset successfully with bcrypt hash!');
    console.log('Email: admin@ctcdn.vn');
    console.log('Password: ' + newPassword);
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetPassword();
