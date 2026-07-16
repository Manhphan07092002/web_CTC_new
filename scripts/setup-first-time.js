#!/usr/bin/env node
/**
 * First Time Setup Script
 * Chạy script này khi lần đầu deploy lên server mới
 * 
 * Usage: npm run setup-first-time
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} - Hoàn thành!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - Lỗi!`, 'red');
    console.error(error.message);
    return false;
  }
}

async function setupFirstTime() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 SETUP LẦN ĐẦU - TRAN LE ELECTRICITY', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  // Step 1: Check Node version
  log('📋 Bước 1: Kiểm tra môi trường', 'yellow');
  const nodeVersion = process.version;
  log(`   Node.js version: ${nodeVersion}`, 'blue');
  
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    log('⚠️  Cảnh báo: Nên dùng Node.js >= 18', 'yellow');
  }

  // Step 2: Install dependencies
  log('\n📋 Bước 2: Cài đặt dependencies', 'yellow');
  if (!execCommand('npm install', 'Cài đặt npm packages')) {
    log('\n❌ Setup thất bại ở bước cài đặt dependencies', 'red');
    process.exit(1);
  }

  // Step 3: Check .env file
  log('\n📋 Bước 3: Kiểm tra file cấu hình', 'yellow');
  const envPath = path.join(__dirname, '..', '.env');
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath) && !fs.existsSync(envLocalPath)) {
    log('⚠️  Không tìm thấy file .env hoặc .env.local', 'yellow');
    log('   Tạo file .env.local mẫu...', 'cyan');
    
    const envTemplate = `# MongoDB
MONGO_URI=mongodb://localhost:27017/web-tranle1

# Server
PORT=4000

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google AI (optional)
GOOGLE_AI_API_KEY=your-google-ai-api-key
`;
    
    fs.writeFileSync(envLocalPath, envTemplate, 'utf8');
    log('✅ Đã tạo file .env.local mẫu', 'green');
    log('⚠️  Vui lòng cập nhật thông tin trong .env.local', 'yellow');
  } else {
    log('✅ File cấu hình đã tồn tại', 'green');
  }

  // Step 4: Check MongoDB connection
  log('\n📋 Bước 4: Kiểm tra kết nối MongoDB', 'yellow');
  try {
    const { default: mongoose } = await import('mongoose');
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';
    
    log(`   Đang kết nối: ${MONGO_URI}`, 'blue');
    await mongoose.connect(MONGO_URI);
    log('✅ Kết nối MongoDB thành công!', 'green');
    await mongoose.disconnect();
  } catch (error) {
    log('❌ Không thể kết nối MongoDB!', 'red');
    log('   Vui lòng kiểm tra:', 'yellow');
    log('   1. MongoDB đã được cài đặt và đang chạy', 'yellow');
    log('   2. MONGO_URI trong .env.local đúng', 'yellow');
    log(`   Error: ${error.message}`, 'red');
  }

  // Step 5: Create necessary directories
  log('\n📋 Bước 5: Tạo thư mục cần thiết', 'yellow');
  const directories = [
    'uploads',
    'uploads/images',
    'uploads/documents',
    'exports',
    'logs'
  ];

  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`   ✅ Tạo thư mục: ${dir}`, 'green');
    } else {
      log(`   ✓ Thư mục đã tồn tại: ${dir}`, 'blue');
    }
  });

  // Step 6: Check for backup data
  log('\n📋 Bước 6: Kiểm tra dữ liệu backup', 'yellow');
  const exportsDir = path.join(__dirname, '..', 'exports');
  
  if (fs.existsSync(exportsDir)) {
    const backups = fs.readdirSync(exportsDir)
      .filter(f => f.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (backups.length > 0) {
      log(`   📦 Tìm thấy ${backups.length} backup(s):`, 'green');
      backups.slice(0, 3).forEach((backup, i) => {
        log(`      ${i + 1}. ${backup}`, 'blue');
      });
      
      log('\n   💡 Để import dữ liệu, chạy:', 'cyan');
      log(`      npm run import-data exports/${backups[0]}`, 'bright');
    } else {
      log('   ℹ️  Chưa có backup nào', 'blue');
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'bright');
  log('✨ SETUP HOÀN TẤT!', 'green');
  log('='.repeat(60), 'bright');
  
  log('\n📝 Các bước tiếp theo:', 'yellow');
  log('   1. Cập nhật thông tin trong .env.local (nếu cần)', 'blue');
  log('   2. Import dữ liệu (nếu có backup):', 'blue');
  log('      npm run import-data exports/backup-xxx', 'cyan');
  log('   3. Hoặc tạo admin user mới:', 'blue');
  log('      npm run seed-admin', 'cyan');
  log('   4. Khởi động server:', 'blue');
  log('      npm run server', 'cyan');
  log('   5. Khởi động frontend:', 'blue');
  log('      npm run dev', 'cyan');
  
  log('\n🎉 Chúc bạn làm việc hiệu quả!\n', 'green');
}

// Run setup
setupFirstTime().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
