/**
 * Seed 40+ Đối tác chiến lược & Đối tác tài chính của CTC
 * Dữ liệu phong phú chuẩn ngành Viễn thông, CNTT, Năng lượng tái tạo, Ngân hàng & Bảo hiểm
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

const getSvgLogo = (name: string, bg = '0EA5E9', text = 'FFFFFF') =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"><rect width="200" height="80" rx="12" fill="%23${bg}"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="%23${text}">${encodeURIComponent(name)}</text></svg>`;

const PARTNERS = [
  // =========================================================================
  // 1. ĐỐI TÁC CUNG CẤP & CHIẾN LƯỢC (supplier) — 26 Đối tác
  // =========================================================================
  {
    name: 'MobiFone',
    type: 'supplier' as const,
    logo: getSvgLogo('MobiFone', '005BAA', 'FFFFFF'),
    website: 'https://mobifone.vn',
  },
  {
    name: 'VNPT Net',
    type: 'supplier' as const,
    logo: getSvgLogo('VNPT Net', '0066B3', 'FFFFFF'),
    website: 'https://vnpt.com.vn',
  },
  {
    name: 'Viettel Telecom',
    type: 'supplier' as const,
    logo: getSvgLogo('Viettel', 'EE0000', 'FFFFFF'),
    website: 'https://vietteltelecom.vn',
  },
  {
    name: 'Bộ Công An (Cục KTNVI)',
    type: 'supplier' as const,
    logo: getSvgLogo('Bộ Công An', 'C62828', 'FFFFFF'),
    website: 'https://bocongan.gov.vn',
  },
  {
    name: 'Dongfang Electric',
    type: 'supplier' as const,
    logo: getSvgLogo('DONGFANG', '003366', 'FFFFFF'),
    website: 'http://www.dongfang.com.cn',
  },
  {
    name: 'Điện Gió Hướng Linh',
    type: 'supplier' as const,
    logo: getSvgLogo('Điện Gió Hướng Linh', '0284C7', 'FFFFFF'),
    website: 'https://ctc.vn',
  },
  {
    name: 'VNEEC Việt Nam',
    type: 'supplier' as const,
    logo: getSvgLogo('VNEEC', '15803D', 'FFFFFF'),
    website: 'https://vneec.com.vn',
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
    logo: getSvgLogo('MikroTik', '1E293B', 'FFFFFF'),
    website: 'https://mikrotik.com',
  },
  {
    name: 'DrayTek',
    type: 'supplier' as const,
    logo: getSvgLogo('DrayTek', 'D32F2F', 'FFFFFF'),
    website: 'https://www.draytek.com',
  },
  {
    name: 'Cisco Systems',
    type: 'supplier' as const,
    logo: getSvgLogo('CISCO', '049FD9', 'FFFFFF'),
    website: 'https://www.cisco.com',
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
    name: 'AMP Netconnect',
    type: 'supplier' as const,
    logo: getSvgLogo('AMP Netconnect', '0284C7', 'FFFFFF'),
    website: 'https://www.commscope.com',
  },
  {
    name: 'Fortinet',
    type: 'supplier' as const,
    logo: getSvgLogo('FORTINET', 'C8102E', 'FFFFFF'),
    website: 'https://www.fortinet.com',
  },
  {
    name: 'Ruijie Networks',
    type: 'supplier' as const,
    logo: getSvgLogo('Ruijie', 'E11D48', 'FFFFFF'),
    website: 'https://www.ruijienetworks.com',
  },
  {
    name: 'Dinstar',
    type: 'supplier' as const,
    logo: getSvgLogo('DINSTAR', '0284C7', 'FFFFFF'),
    website: 'https://www.dinstar.com',
  },
  {
    name: 'LS Cable & System',
    type: 'supplier' as const,
    logo: getSvgLogo('LS Cable', '0369A1', 'FFFFFF'),
    website: 'https://www.lscns.com',
  },
  {
    name: 'CADIVI Cable',
    type: 'supplier' as const,
    logo: getSvgLogo('CADIVI', 'B91C1C', 'FFFFFF'),
    website: 'https://cadivi.vn',
  },
  {
    name: 'Schneider Electric',
    type: 'supplier' as const,
    logo: getSvgLogo('Schneider', '16A34A', 'FFFFFF'),
    website: 'https://www.se.com',
  },
  {
    name: 'ABB Group',
    type: 'supplier' as const,
    logo: getSvgLogo('ABB', 'FF0000', 'FFFFFF'),
    website: 'https://global.abb',
  },
  {
    name: 'SMA Solar Technology',
    type: 'supplier' as const,
    logo: getSvgLogo('SMA Solar', 'EAB308', '1E293B'),
    website: 'https://www.sma.de',
  },
  {
    name: 'Sungrow Power',
    type: 'supplier' as const,
    logo: getSvgLogo('SUNGROW', 'EA580C', 'FFFFFF'),
    website: 'https://www.sungrowpower.com',
  },
  {
    name: 'Jinko Solar',
    type: 'supplier' as const,
    logo: getSvgLogo('Jinko Solar', '16A34A', 'FFFFFF'),
    website: 'https://www.jinkosolar.com',
  },
  {
    name: 'JA Solar',
    type: 'supplier' as const,
    logo: getSvgLogo('JA SOLAR', '0284C7', 'FFFFFF'),
    website: 'https://www.jasolar.com',
  },
  {
    name: 'Canadian Solar',
    type: 'supplier' as const,
    logo: getSvgLogo('CanadianSolar', 'DC2626', 'FFFFFF'),
    website: 'https://www.canadiansolar.com',
  },

  // =========================================================================
  // 2. ĐỐI TÁC TÀI CHÍNH & BẢO HIỂM (financial) — 15 Đối tác
  // =========================================================================
  {
    name: 'BIDV Đà Nẵng',
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
    name: 'MBBank (Quân Đội)',
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
    name: 'Techcombank',
    type: 'financial' as const,
    logo: getSvgLogo('Techcombank', 'E11D48', 'FFFFFF'),
    website: 'https://techcombank.com.vn',
  },
  {
    name: 'VPBank',
    type: 'financial' as const,
    logo: getSvgLogo('VPBank', '16A34A', 'FFFFFF'),
    website: 'https://vpbank.com.vn',
  },
  {
    name: 'HD Bank',
    type: 'financial' as const,
    logo: getSvgLogo('HDBank', 'CA8A04', 'FFFFFF'),
    website: 'https://hdbank.com.vn',
  },
  {
    name: 'Sacombank',
    type: 'financial' as const,
    logo: getSvgLogo('Sacombank', '0284C7', 'FFFFFF'),
    website: 'https://sacombank.com.vn',
  },
  {
    name: 'TPBank',
    type: 'financial' as const,
    logo: getSvgLogo('TPBank', '7C3AED', 'FFFFFF'),
    website: 'https://tpb.vn',
  },
  {
    name: 'ACB Bank',
    type: 'financial' as const,
    logo: getSvgLogo('ACB Bank', '0284C7', 'FFFFFF'),
    website: 'https://acb.com.vn',
  },
  {
    name: 'Bảo Việt Đà Nẵng',
    type: 'financial' as const,
    logo: getSvgLogo('BẢO VIỆT', '004A8D', 'FFFFFF'),
    website: 'https://baoviet.com.vn',
  },
  {
    name: 'PVI Insurance',
    type: 'financial' as const,
    logo: getSvgLogo('PVI Insurance', '0284C7', 'FFFFFF'),
    website: 'https://pvi.com.vn',
  },
  {
    name: 'Bảo Minh Insurance',
    type: 'financial' as const,
    logo: getSvgLogo('BẢO MINH', '0369A1', 'FFFFFF'),
    website: 'https://baominh.com.vn',
  },
  {
    name: 'BIC Insurance',
    type: 'financial' as const,
    logo: getSvgLogo('BIC Insurance', '059669', 'FFFFFF'),
    website: 'https://bic.vn',
  },
];

async function main() {
  console.log('🔌 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  console.log('🗑️  Xóa toàn bộ đối tác cũ để cập nhật danh sách mới phong phú...');
  await Partner.deleteMany({});

  console.log('🌱 Đang chèn 41 Đối tác chiến lược & tài chính...');
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
