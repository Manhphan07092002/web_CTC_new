import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

// User Schema
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

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete ALL existing users first
    console.log('Deleting all existing users...');
    await User.deleteMany({});
    console.log('All users deleted.');

    // Create fresh admin user
    console.log('Creating new admin user...');
    
    const admin = new User({
      name: 'Super Admin',
      email: 'admin@ctcdn.vn',
      password: 'CTC@2024',
      role: 'admin',
      phone: '',
      avatar: ''
    });
    
    await admin.save();
    console.log('Admin user created successfully!');
    console.log('\n✅ IMPORTANT: Copy this ID to AuthContext.tsx line 53:');
    console.log('ID:', admin._id.toString());
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
