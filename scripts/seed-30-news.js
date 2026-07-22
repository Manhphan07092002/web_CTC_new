#!/usr/bin/env node
/**
 * Script seed 30 bài viết tin tức đầy đủ (Thời sự, Lịch nghỉ lễ, Dự án, Công nghệ & Hướng dẫn)
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log('🚀 Running seed-30-news script via tsx...');
  const targetScript = path.resolve(__dirname, '../server/scripts/seed-30-news.ts');
  execSync(`npx tsx "${targetScript}"`, { stdio: 'inherit' });
  console.log('🎉 Seed 30 news articles completed!');
} catch (error) {
  console.error('❌ Failed to run seed script:', error.message);
  process.exit(1);
}
