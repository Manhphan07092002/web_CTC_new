#!/usr/bin/env node
/**
 * Script seed 100 tài liệu kỹ thuật, catalogue, hồ sơ năng lực và bản vẽ CAD
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log('🚀 Running seed-100-resources script via tsx...');
  const targetScript = path.resolve(__dirname, '../server/scripts/seed-100-resources.ts');
  execSync(`npx tsx "${targetScript}"`, { stdio: 'inherit' });
  console.log('🎉 Seed 100 resources completed!');
} catch (error) {
  console.error('❌ Failed to run seed script:', error.message);
  process.exit(1);
}
