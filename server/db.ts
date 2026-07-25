import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { autoSeedIfEmpty } from './utils/autoSeed';

// Load environment variables from .env.local (fallback to .env)
dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

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
