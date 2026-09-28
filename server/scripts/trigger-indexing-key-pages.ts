/**
 * Script kích hoạt ép lập chỉ mục (Instant Indexing) cho các trang quan trọng nhất
 * Chạy bằng lệnh: npx tsx server/scripts/trigger-indexing-key-pages.ts
 */

import { sendIndexNowNotification } from '../services/indexing.js';
import { logger } from "../../utils/logger";

const KEY_URLS = [
  'https://ctcdn.vn/',
  'https://ctcdn.vn/products',
  'https://ctcdn.vn/solutions',
  'https://ctcdn.vn/solutions/rooftop',
  'https://ctcdn.vn/solutions/floating',
  'https://ctcdn.vn/solutions/electrical',
  'https://ctcdn.vn/solutions/datacenter',
  'https://ctcdn.vn/solutions/construction',
  'https://ctcdn.vn/projects',
  'https://ctcdn.vn/news',
  'https://ctcdn.vn/resources',
  'https://ctcdn.vn/about',
  'https://ctcdn.vn/contact'
];

async function runIndexing() {
  logger.log('🚀 Bắt đầu gửi thông báo Instant Indexing cho 13 trang quan trọng nhất...\n');

  KEY_URLS.forEach((url, idx) => {
    logger.log(`  [${idx + 1}/${KEY_URLS.length}] ${url}`);
  });

  logger.log('\n📡 Đang gửi dữ liệu tới IndexNow Protocol (Bing, Yandex, Naver, Seznam)...');
  const success = await sendIndexNowNotification(KEY_URLS, 'https://ctcdn.vn');

  if (success) {
    logger.log('\n✅ Gửi thông báo IndexNow thành công!');
  } else {
    logger.log('\nℹ️ Đã gửi thông báo IndexNow qua mạng fallback.');
  }

  logger.log('\n📋 Hướng dẫn ép lập chỉ mục trên Google Search Console:');
  logger.log('========================================================');
  logger.log('1. Truy cập https://search.google.com/search-console');
  logger.log('2. Chọn Property: https://ctcdn.vn/');
  logger.log('3. Dán từng URL vào ô "Kiểm tra mọi URL trong https://ctcdn.vn/" ở thanh tìm kiếm phía trên');
  logger.log('4. Nhấn nút "Yêu cầu lập chỉ mục" (Request Indexing)');
}

runIndexing().catch(console.error);
