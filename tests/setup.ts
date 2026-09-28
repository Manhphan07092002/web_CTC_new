import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Set required environment variables for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-vitest';
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ctcdn.vn';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TestAdmin@2024';
process.env.NODE_ENV = 'test';

let mongod: MongoMemoryServer;

export async function setupTestDB() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  return uri;
}

export async function teardownTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}
