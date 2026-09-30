import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { autoSeedIfEmpty, autoSeedProfileData, autoSeedProductMeta } from './utils/autoSeed';
import { logger } from "../utils/logger";

// Load environment variables from .env.local (fallback to .env)
dotenv.config({ path: '.env.local' });
dotenv.config();

const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';
const MONGO_URI = rawUri.includes('localhost') ? rawUri.replace('localhost', '127.0.0.1') : rawUri;

let listenersAttached = false;

function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  mongoose.connection.on('error', (err) => {
    logger.error('❌ MongoDB connection error:', (err as Error)?.message || err);
  });
  mongoose.connection.on('disconnected', () => {
    logger.error('❌ MongoDB disconnected, will retry in background');
  });
  mongoose.connection.on('reconnected', () => {
    logger.log('🍃 MongoDB reconnected');
  });
}

export const connectDB = async (retries = 12, delayMs = 5000) => {
  attachListeners();
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 50,
        minPoolSize: 10,
      });
      logger.log(`🍃 MongoDB connected: ${conn.connection.host} (attempt ${attempt}/${retries})`);
    
    // Automatically seed all initial data from seed-data/ if DB is empty
    await autoSeedIfEmpty();
    // Ensure profile data is seeded
    await autoSeedProfileData();
    // Ensure brands and attribute templates are seeded
    await autoSeedProductMeta();

    return conn;
    } catch (error) {
      lastError = error;
      logger.error(`❌ MongoDB connect attempt ${attempt}/${retries} failed:`, (error as Error).message || error);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  logger.error('❌ MongoDB connection error:', (lastError as Error)?.message || lastError);
  throw lastError;
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.log('MongoDB disconnected');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
    throw error;
  }
};
