#!/usr/bin/env node
/**
 * Setup with Data Import
 * Tự động cài đặt và import dữ liệu từ backup
 * 
 * Usage: npm run setup-with-data [backup-folder]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    return false;
  }
}

async function setupWithData() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 SETUP VỚI DỮ LIỆU - TRAN LE ELECTRICITY', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  // Step 1: Install dependencies
  log('📋 Bước 1/5: Cài đặt dependencies', 'yellow');
  if (!execCommand('npm install', 'Cài đặt npm packages')) {
    log('\n❌ Setup thất bại!', 'red');
    process.exit(1);
  }

  // Step 2: Create directories
  log('\n📋 Bước 2/5: Tạo thư mục cần thiết', 'yellow');
  const directories = ['uploads', 'uploads/images', 'uploads/documents', 'exports', 'logs'];
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`   ✅ Tạo: ${dir}`, 'green');
    }
  });

  // Step 3: Check .env
  log('\n📋 Bước 3/5: Kiểm tra cấu hình', 'yellow');
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envLocalPath)) {
    const envTemplate = `MONGO_URI=mongodb://localhost:27017/web-tranle1
PORT=4000
JWT_SECRET=change-this-secret-key-in-production
`;
    fs.writeFileSync(envLocalPath, envTemplate, 'utf8');
    log('✅ Đã tạo .env.local', 'green');
  }

  // Step 4: Find backup
  log('\n📋 Bước 4/5: Tìm kiếm backup', 'yellow');
  let backupPath = process.argv[2];
  
  if (!backupPath) {
    // Auto find latest backup
    const exportsDir = path.join(__dirname, '..', 'exports');
    if (fs.existsSync(exportsDir)) {
      const backups = fs.readdirSync(exportsDir)
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();
      
      if (backups.length > 0) {
        backupPath = path.join(exportsDir, backups[0]);
        log(`   📦 Tìm thấy backup: ${backups[0]}`, 'green');
      }
    }
  } else {
    backupPath = path.isAbsolute(backupPath) 
      ? backupPath 
      : path.join(__dirname, '..', backupPath);
  }

  if (!backupPath || !fs.existsSync(backupPath)) {
    log('   ⚠️  Không tìm thấy backup!', 'yellow');
    log('   💡 Bạn có thể:', 'cyan');
    log('      1. Chạy: npm run setup-with-data exports/backup-xxx', 'blue');
    log('      2. Hoặc tạo admin mới: npm run seed-admin', 'blue');
    log('\n✅ Setup cơ bản hoàn tất (không có dữ liệu)', 'green');
    return;
  }

  // Step 5: Import data
  log('\n📋 Bước 5/5: Import dữ liệu', 'yellow');
  log(`   📁 Từ: ${backupPath}`, 'blue');

  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';
    
    log('   🔌 Kết nối MongoDB...', 'cyan');
    await mongoose.connect(MONGO_URI);
    log('   ✅ Đã kết nối MongoDB', 'green');

    // Read summary
    const summaryPath = path.join(backupPath, '_summary.json');
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      log(`   📊 Backup: ${summary.totalDocuments} documents, ${summary.totalCollections} collections`, 'blue');
    }

    // Import files
    const files = fs.readdirSync(backupPath)
      .filter(f => f.endsWith('.json') && !f.startsWith('_'));

    let totalImported = 0;
    let successCount = 0;

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const filepath = path.join(backupPath, file);
      
      try {
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        
        if (data.length > 0) {
          const collection = mongoose.connection.collection(collectionName);
          
          // Clear existing data
          await collection.deleteMany({});
          
          // Insert data
          await collection.insertMany(data, { ordered: false });
          
          log(`   ✅ ${collectionName.padEnd(25)} ${data.length.toString().padStart(5)} docs`, 'green');
          totalImported += data.length;
          successCount++;
        }
      } catch (error) {
        log(`   ⚠️  ${collectionName.padEnd(25)} ${error.message}`, 'yellow');
      }
    }

    await mongoose.disconnect();

    log('\n' + '='.repeat(60), 'bright');
    log('✨ SETUP HOÀN TẤT!', 'green');
    log('='.repeat(60), 'bright');
    log(`\n📊 Đã import: ${totalImported} documents từ ${successCount} collections`, 'green');
    
    log('\n🚀 Khởi động server:', 'yellow');
    log('   npm run server', 'cyan');
    log('\n🎨 Khởi động frontend:', 'yellow');
    log('   npm run dev', 'cyan');
    
    log('\n🌐 Truy cập:', 'yellow');
    log('   Frontend: http://localhost:3000', 'blue');
    log('   Backend:  http://localhost:4000', 'blue');
    log('   Admin:    http://localhost:3000/#/admin', 'blue');
    
    log('\n🎉 Chúc bạn làm việc hiệu quả!\n', 'green');

  } catch (error) {
    log(`\n❌ Import thất bại: ${error.message}`, 'red');
    await mongoose.disconnect();
    process.exit(1);
  }
}

setupWithData().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
