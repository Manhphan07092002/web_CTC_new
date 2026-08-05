/**
 * Script kích hoạt ép lập chỉ mục (Instant Indexing) cho các trang quan trọng nhất
 * Chạy bằng lệnh: npx tsx server/scripts/trigger-indexing-key-pages.ts
 */

import { sendIndexNowNotification } from '../services/indexing.js';

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
  console.log('🚀 Bắt đầu gửi thông báo Instant Indexing cho 13 trang quan trọng nhất...\n');

  KEY_URLS.forEach((url, idx) => {
    console.log(`  [${idx + 1}/${KEY_URLS.length}] ${url}`);
  });

  console.log('\n📡 Đang gửi dữ liệu tới IndexNow Protocol (Bing, Yandex, Naver, Seznam)...');
  const success = await sendIndexNowNotification(KEY_URLS, 'https://ctcdn.vn');

  if (success) {
    console.log('\n✅ Gửi thông báo IndexNow thành công!');
  } else {
    console.log('\nℹ️ Đã gửi thông báo IndexNow qua mạng fallback.');
  }

  console.log('\n📋 Hướng dẫn ép lập chỉ mục trên Google Search Console:');
  console.log('========================================================');
  console.log('1. Truy cập https://search.google.com/search-console');
  console.log('2. Chọn Property: https://ctcdn.vn/');
  console.log('3. Dán từng URL vào ô "Kiểm tra mọi URL trong https://ctcdn.vn/" ở thanh tìm kiếm phía trên');
  console.log('4. Nhấn nút "Yêu cầu lập chỉ mục" (Request Indexing)');
}

runIndexing().catch(console.error);
