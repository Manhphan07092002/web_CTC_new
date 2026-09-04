import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { autoSeedIfEmpty, autoSeedProfileData, autoSeedProductMeta } from './utils/autoSeed';

// Load environment variables from .env.local (fallback to .env)
dotenv.config({ path: '.env.local' });
dotenv.config();

const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';
const MONGO_URI = rawUri.includes('localhost') ? rawUri.replace('localhost', '127.0.0.1') : rawUri;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,
      minPoolSize: 10,
    });
    console.log(`🍃 MongoDB connected: ${conn.connection.host}`);
    
    // Automatically seed all initial data from seed-data/ if DB is empty
    await autoSeedIfEmpty();
    // Ensure profile data is seeded
    await autoSeedProfileData();
    // Ensure brands and attribute templates are seeded
    await autoSeedProductMeta();

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', (error as Error).message || error);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
};
