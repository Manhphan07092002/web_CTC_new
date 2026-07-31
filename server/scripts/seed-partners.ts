/**
 * Seed danh sách Đối tác chiến lược & Đối tác tài chính thực tế của CTC
 * Dữ liệu chuẩn dựa trên: constants/company_profile.md và thực tế ngành Viễn thông / Năng lượng / Ngân hàng
 *
 * Chạy lệnh:
 *   npx tsx server/scripts/seed-partners.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Partner } from '../../models/index.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

// Logo SVG placeholder hoặc SVG chính hãng
const getSvgLogo = (name: string, bg = '0EA5E9', text = 'FFFFFF') =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"><rect width="200" height="80" rx="10" fill="%23${bg}"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="%23${text}">${encodeURIComponent(name)}</text></svg>`;

const PARTNERS = [
  // === 1. ĐỐI TÁC CUNG CẤP & CHIẾN LƯỢC (supplier) ===
  {
    name: 'Mobifone',
    type: 'supplier' as const,
    logo: getSvgLogo('MobiFone', '005BAA', 'FFFFFF'),
    website: 'https://mobifone.vn',
  },
  {
    name: 'VNPT Net',
    type: 'supplier' as const,
    logo: getSvgLogo('VNPT', '0066B3', 'FFFFFF'),
    website: 'https://vnpt.com.vn',
  },
  {
    name: 'Bộ Công an (Cục Kỹ thuật nghiệp vụ)',
    type: 'supplier' as const,
    logo: getSvgLogo('Bộ Công An', 'D32F2F', 'FFFFFF'),
    website: 'https://bocongan.gov.vn',
  },
  {
    name: 'Dongfang Electric International',
    type: 'supplier' as const,
    logo: getSvgLogo('DONGFANG', '003366', 'FFFFFF'),
    website: 'http://www.dongfang.com.cn',
  },
  {
    name: 'CommScope',
    type: 'supplier' as const,
    logo: getSvgLogo('CommScope', '00A8B5', 'FFFFFF'),
    website: 'https://www.commscope.com',
  },
  {
    name: 'MikroTik',
    type: 'supplier' as const,
    logo: getSvgLogo('MikroTik', '222222', 'FFFFFF'),
    website: 'https://mikrotik.com',
  },
  {
    name: 'DrayTek',
    type: 'supplier' as const,
    logo: getSvgLogo('DrayTek', 'D32F2F', 'FFFFFF'),
    website: 'https://www.draytek.com',
  },
  {
    name: 'Huawei Enterprise',
    type: 'supplier' as const,
    logo: getSvgLogo('HUAWEI', 'C8102E', 'FFFFFF'),
    website: 'https://e.huawei.com',
  },
  {
    name: 'ZTE Corporation',
    type: 'supplier' as const,
    logo: getSvgLogo('ZTE', '0054A6', 'FFFFFF'),
    website: 'https://www.zte.com.cn',
  },
  {
    name: 'Cisco Systems',
    type: 'supplier' as const,
    logo: getSvgLogo('CISCO', '049FD9', 'FFFFFF'),
    website: 'https://www.cisco.com',
  },
  {
    name: 'ĐIỆN GIÓ HƯỚNG LINH',
    type: 'supplier' as const,
    logo: getSvgLogo('Điện gió Hướng Linh', '0284C7', 'FFFFFF'),
    website: 'https://ctc.vn',
  },
  {
    name: 'VNEEC',
    type: 'supplier' as const,
    logo: getSvgLogo('VNEEC', '15803D', 'FFFFFF'),
    website: 'https://vneec.com.vn',
  },

  // === 2. ĐỐI TÁC TÀI CHÍNH & NGÂN HÀNG (financial) ===
  {
    name: 'BIDV Chi nhánh Đà Nẵng',
    type: 'financial' as const,
    logo: getSvgLogo('BIDV', '006B54', 'FFFFFF'),
    website: 'https://bidv.com.vn',
  },
  {
    name: 'VietinBank',
    type: 'financial' as const,
    logo: getSvgLogo('VietinBank', '0054A6', 'FFFFFF'),
    website: 'https://vietinbank.vn',
  },
  {
    name: 'Vietcombank',
    type: 'financial' as const,
    logo: getSvgLogo('Vietcombank', '005228', 'FFFFFF'),
    website: 'https://vietcombank.com.vn',
  },
  {
    name: 'MBBank (Ngân hàng Quân đội)',
    type: 'financial' as const,
    logo: getSvgLogo('MB BANK', '1B365D', 'FFFFFF'),
    website: 'https://mbbank.com.vn',
  },
  {
    name: 'Agribank',
    type: 'financial' as const,
    logo: getSvgLogo('AGRIBANK', 'A42327', 'FFFFFF'),
    website: 'https://agribank.com.vn',
  },
  {
    name: 'Bảo Việt Đà Nẵng',
    type: 'financial' as const,
    logo: getSvgLogo('BẢO VIỆT', '004A8D', 'FFFFFF'),
    website: 'https://baoviet.com.vn',
  },
];

async function main() {
  console.log('🔌 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  console.log('🗑️  Xóa đối tác cũ (nếu có)...');
  await Partner.deleteMany({});

  console.log('🌱 Đang chèn danh sách Đối tác chuẩn ngành Viễn thông & Năng lượng...');
  let inserted = 0;
  for (const p of PARTNERS) {
    await Partner.create(p);
    inserted++;
    console.log(`  ✅ [${inserted.toString().padStart(2, '0')}] (${p.type}) ${p.name}`);
  }

  console.log(`\n🎉 Đã chèn thành công ${inserted} Đối tác vào DB!`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
