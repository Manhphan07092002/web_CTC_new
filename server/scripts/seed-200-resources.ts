/**
 * Seed 200 Bài viết / Tài liệu kỹ thuật chuẩn chuyên ngành dựa trên Sản phẩm & Dự án thực tế của CTC.
 * Nguồn dữ liệu dựa trên: HSNL 06.2026, sản phẩm Solar, Viễn thông, Điện gió, Trạm 110kV, Data Center.
 *
 * Lệnh chạy:
 *   npx tsx server/scripts/seed-200-resources.ts
 *
 * Hoặc trong Docker VPS:
 *   docker compose exec app npx tsx server/scripts/seed-200-resources.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DocumentCategory, Resource } from '../../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

const SAMPLE_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const CATEGORIES_DATA = [
  { name: 'Catalogue & Datasheet Thiết Bị', description: 'Thông số kỹ thuật chi tiết tấm pin, biến tần Inverter, thiết bị viễn thông, tủ nguồn DC và thiết bị điện công nghiệp.' },
  { name: 'Bản Vẽ Kỹ Thuật & Sơ Đồ Nguyên Lý CAD', description: 'Bản vẽ thiết kế điện mặt trời áp mái, sơ đồ 1 sợi trạm 110kV, khung giàn nhôm bão cấp 14 và hạ tầng cáp quang.' },
  { name: 'Hướng Dẫn Vận Hành & Bảo Trì O&M', description: 'Quy trình vận hành, cẩm nang bảo dưỡng định kỳ hệ thống solar, trạm biến áp, kiểm tra suy hao quang và pin Lithium.' },
  { name: 'Hồ Sơ Năng Lực & Pháp Lý Dự Án', description: 'Hồ sơ năng lực EPC CTC, chứng chỉ năng lực xây dựng Hạng I, thỏa thuận đấu nối EVN và nghiệm thu PCCC.' },
  { name: 'Chứng Nhận CO/CQ & Tiêu Chuẩn Quốc Tế', description: 'Giấy chứng nhận xuất xứ CO, chứng nhận chất lượng CQ, chứng chỉ TUV Rheinland, UL 1741, IEC và ISO.' },
  { name: 'Phần Mềm & Tài Liệu SCADA IoT', description: 'Công cụ giám sát SCADA, phần mềm cấu hình router MikroTik/DrayTek, firmware inverter và hệ thống màn hình IOC.' },
];

function generate200Resources() {
  const docs: any[] = [];

  // =========================================================================
  // 1. Catalogue & Datasheet Thiết Bị (50 tài liệu)
  // =========================================================================
  const solarPanels = ['Canadian Solar HiKu6 550W-570W', 'LONGI Hi-MO 6 580W TOPCon', 'Jinko Solar Tiger Neo 565W', 'Trina Solar Vertex N 700W+', 'JA Solar Jam72S30 545W', 'Risen Titan 40W Mono'];
  const inverters = ['Huawei SUN2000-100KTL-M2', 'SMA Sunny Tripower CORE2 110kW', 'Sungrow SG110CX 110kW', 'Deye Hybrid 12kW 3 Pha', 'Growatt SPH 10000TL3 10kW', 'Fronius Eco 27.0kW 3 Pha'];
  const telecomEquip = ['Router MikroTik CCR1009-7G-1C-1S+', 'DrayTek Vigor 2952 / 2925FN', 'Switch Cisco Catalyst C9300-48P', 'Tủ Nguồn Lithium 48V-100Ah 5G', 'Cáp Mạng CommScope Cat6 UTP', 'Tổng Đài Dinstar DAG2000-16S'];

  for (let i = 1; i <= 50; i++) {
    let title = '';
    let desc = '';
    let size = `${(1.5 + (i * 0.15)).toFixed(1)} MB`;

    if (i <= 18) {
      const panel = solarPanels[i % solarPanels.length];
      title = `Catalogue Thông Số Kỹ Thuật Tấm Pin Quang Điện ${panel} - Mã SP #${100 + i}`;
      desc = `Datasheet chính hãng chi tiết về công suất phát điện, hiệu suất quang năng 22.8%, hệ số suy hao nhiệt độ và bản vẽ cơ khí kích thước khung nhôm tấm pin ${panel}.`;
    } else if (i <= 36) {
      const inv = inverters[i % inverters.length];
      title = `Datasheet Biến Tần Hòa Lưới Inverter ${inv} Chuẩn Châu Âu`;
      desc = `Tài liệu thông số kỹ thuật inverter hòa lưới công nghiệp, hiệu suất chuyển đổi 98.7%, hỗ trợ đa kênh MPPT, chuẩn chống nước IP66 và tính năng ngắt mạch AFCI an toàn.`;
    } else {
      const tel = telecomEquip[i % telecomEquip.length];
      title = `Catalogue Thiết Bị Viễn Thông & Hạ Tầng Mạng ${tel}`;
      desc = `Thông số kỹ thuật chi tiết thiết bị viễn thông nhập khẩu chính hãng do CTC cung cấp cho các dự án mạng truyền dẫn, trạm BTS và Data Center toàn quốc.`;
    }

    docs.push({
      categoryName: 'Catalogue & Datasheet Thiết Bị',
      title,
      description: desc,
      fileUrl: SAMPLE_PDF_URL,
      type: 'PDF',
      size,
    });
  }

  // =========================================================================
  // 2. Bản Vẽ Kỹ Thuật & Sơ Đồ Nguyên Lý CAD (40 tài liệu)
  // =========================================================================
  const drawProjects = [
    'Farm Solar Gio Linh 4.0 MWp Quảng Trị', 'Dệt May Châu Giang 3.0 MWp Ninh Bình', 'Dệt Quốc Tế COCO 2.531 MWp TP.HCM',
    'NM Thiện Hoàng 1.5 MWp Bình Định', 'Farm Solar Vĩnh Linh 1.0 MWp', 'Gỗ Thành Đạt 1.0 MWp Đà Nẵng',
    'Trạm Biến Áp 110kV Thạnh Hải Bến Tre', 'Trạm 110kV Điện Gió Hướng Hiệp 1', 'Tuyến Cáp Quang 96FO Phan Rang - Đà Lạt',
    'Tòa Nhà Vietcombank Long An 10 Tầng', 'Trụ Sở A70 Bộ Công An Đà Nẵng'
  ];

  for (let i = 1; i <= 40; i++) {
    const proj = drawProjects[i % drawProjects.length];
    const typeExt = i % 3 === 0 ? 'DWG' : i % 3 === 1 ? 'PDF' : 'ZIP';
    const size = `${(5.2 + (i * 0.3)).toFixed(1)} MB`;

    docs.push({
      categoryName: 'Bản Vẽ Kỹ Thuật & Sơ Đồ Nguyên Lý CAD',
      title: `Bản Vẽ Thiết Kế Kỹ Thuật CAD Sơ Đồ Nguyên Lý Điện - Dự Án ${proj} (Bản #${i})`,
      description: `Bộ bản vẽ thiết kế thi công AutoCAD chi tiết gồm sơ đồ 1 sợi (Single Line Diagram), mặt bằng bố trí giàn pin/cột BTS, hệ thống tiếp địa chống sét và chi tiết kết cấu khung giàn chịu lực bão cấp 14 cho dự án ${proj}.`,
      fileUrl: SAMPLE_PDF_URL,
      type: typeExt,
      size,
    });
  }

  // =========================================================================
  // 3. Hướng Dẫn Vận Hành & Bảo Trì O&M (40 tài liệu)
  // =========================================================================
  const omTopics = [
    'Quy Trình Bảo Trì Định Kỳ Hệ Thống Điện Mặt Trời Áp Mái C&I Nhà Xưởng',
    'Hướng Dẫn Vận Hành Hệ Thống Biến Tần Inverter Chuỗi & Inverter Trung Tâm',
    'Quy Trình Kiểm Tra Bảo Dưỡng Trạm Biến Áp 110kV & Máy Biến Áp Lực',
    'Cẩm Nang Xử Lý Sự Cố Quá Nhiệt & Suy Hao Tấm Pin Quang Điện Solar',
    'Hướng Dẫn Kiểm Tra Đo Suy Hao Tuyến Cáp Quang Bằng Máy OTDR',
    'Quy Trình Vận Hành Nguồn Lưu Trữ Pin Lithium 48V Trạm BTS Viễn Thông',
    'Quy Trình Đo Điện Trở Tiếp Địa Chống Sét Hệ Thống Công Trình Kỹ Thuật',
    'Hướng Dẫn Cấu Hình Hệ Thống Zero Export Không Phát Lưới Cho Inverter Deye/SMA'
  ];

  for (let i = 1; i <= 40; i++) {
    const topic = omTopics[i % omTopics.length];
    const size = `${(2.1 + (i * 0.1)).toFixed(1)} MB`;

    docs.push({
      categoryName: 'Hướng Dẫn Vận Hành & Bảo Trì O&M',
      title: `${topic} - Tập ${Math.floor(i / 8) + 1} Chuẩn ISO CTC O&M`,
      description: `Tài liệu hướng dẫn chi tiết quy trình O&M (Operation & Maintenance) tiêu chuẩn do phòng Kỹ thuật CTC biên soạn với 53 kỹ sư chủ chốt, đảm bảo hệ thống vận hành an toàn 24/7 và đạt tuổi thọ thiết kế trên 25 năm.`,
      fileUrl: SAMPLE_PDF_URL,
      type: 'PDF',
      size,
    });
  }

  // =========================================================================
  // 4. Hồ Sơ Năng Lực & Pháp Lý Dự Án (30 tài liệu)
  // =========================================================================
  const legalDocs = [
    'Hồ Sơ Năng Lực Nhà Thầu EPC CTC Solar & Viễn Thông 2026 (HSNL 06.2026)',
    'Chứng Chỉ Năng Lực Hoạt Động Xây Dựng Hạng I Do Bộ Xây Dựng Cấp',
    'Giấy Chứng Nhận Đăng Ký Kinh Doanh & Đăng Ký Thuế Công Ty CTC',
    'Mẫu Thỏa Thuận Đấu Nối Điện Lưới EVN Cho Hệ Thống Điện Mặt Trời 22kV / 110kV',
    'Hồ Sơ Nghiệm Thu An Toàn PCCC Cho Hệ Thống Điện Mặt Trời Mái Nhà Xưởng',
    'Báo Cáo Đánh Giá Tác Động Môi Trường (ĐTM) Dự Án Điện Gió Hướng Hiệp 120MW',
    'Giấy Phép Hoạt Động Điện Lực Lĩnh Vực Tư Vấn & Thi Công Công Trình Điện',
    'Báo Cáo Kiểm Toán Tài Chính 3 Năm Gần Nhất (2023 - 2025) Doanh Thu 288 Tỷ VNĐ'
  ];

  for (let i = 1; i <= 30; i++) {
    const legal = legalDocs[i % legalDocs.length];
    const size = `${(3.5 + (i * 0.2)).toFixed(1)} MB`;

    docs.push({
      categoryName: 'Hồ Sơ Năng Lực & Pháp Lý Dự Án',
      title: `${legal} - Bản Cập Nhật Mới Nhất 2026 (#${i})`,
      description: `Tài liệu pháp lý chính thức, hồ sơ năng lực doanh nghiệp và các giấy phép thẩm duyệt an toàn, PCCC, đấu nối điện lưới EVN phục vụ đấu thầu và nghiệm thu dự án.`,
      fileUrl: SAMPLE_PDF_URL,
      type: i % 2 === 0 ? 'PDF' : 'DOCX',
      size,
    });
  }

  // =========================================================================
  // 5. Chứng Nhận CO/CQ & Tiêu Chuẩn Quốc Tế (20 tài liệu)
  // =========================================================================
  const certs = [
    'Giấy Chứng Nhận Xuất Xứ CO (Certificate of Origin) Tấm Pin Solar Canadian / Jinko',
    'Giấy Chứng Nhận Chất Lượng CQ (Certificate of Quality) Inverter Huawei / SMA',
    'Chứng Chỉ An Toàn Điện TUV Rheinland Đức Cho Thiết Bị Năng Lượng Mặt Trời',
    'Chứng Nhận Tiêu Chuẩn An Toàn UL 1741 & IEEE 1547 Cho Inverter Hòa Lưới',
    'Chứng Nhận Quản Lý Chất Lượng ISO 9001:2015 Công Ty Cổ Phần Xây Lắp Bưu Điện Miền Trung',
    'Chứng Nhận Quản Lý Môi Trường ISO 14001:2015 & An Toàn Lao Động ISO 45001'
  ];

  for (let i = 1; i <= 20; i++) {
    const cert = certs[i % certs.length];
    const size = `${(1.2 + (i * 0.15)).toFixed(1)} MB`;

    docs.push({
      categoryName: 'Chứng Nhận CO/CQ & Tiêu Chuẩn Quốc Tế',
      title: `${cert} - Lô Hàng Dự Án 2025-2026 (#${i})`,
      description: `Bản sao chứng thực các giấy chứng nhận CO/CQ xuất xứ chất lượng nhà máy và chứng chỉ tiêu chuẩn kiểm định an toàn quốc tế cấp cho vật tư thiết bị dự án CTC.`,
      fileUrl: SAMPLE_PDF_URL,
      type: 'PDF',
      size,
    });
  }

  // =========================================================================
  // 6. Phần Mềm & Tài Liệu SCADA IoT (20 tài liệu)
  // =========================================================================
  const scadaTools = [
    'Phần Mềm Giám Sát Điện Mặt Trời SCADA FusionSolar Huawei V6.0',
    'Công Cụ Cấu Hình Biến Tần Sungrow iSolarCloud & Cổng Gateway SG Logger',
    'Phần Mềm Quản Lý Mạng MikroTik WinBox v3.40 & RouterOS v7.14 LTS',
    'Tài Liệu Hướng Dẫn Tích Hợp Hệ Thống Giám Sát Màn Hình Trung Tâm IOC Phú Yên',
    'Bản Cập Nhật Firmware Mới Nhất Cho Inverter Hòa Lưới Deye & Growatt 2026',
    'Phần Mềm Đo Nội Trở & Dung Lượng Ắc Quy Lithium 48V HIOKI Battery Tester'
  ];

  for (let i = 1; i <= 20; i++) {
    const tool = scadaTools[i % scadaTools.length];
    const size = `${(8.5 + (i * 0.5)).toFixed(1)} MB`;

    docs.push({
      categoryName: 'Phần Mềm & Tài Liệu SCADA IoT',
      title: `${tool} - Bản Chuẩn Kỹ Thuật CTC (#${i})`,
      description: `Bộ phần mềm chuyên dụng, công cụ lập trình cấu hình từ xa và firmware cập nhật chính thức hỗ trợ công tác quản lý vận hành tự động hóa SCADA, IoT viễn thông và năng lượng.`,
      fileUrl: SAMPLE_PDF_URL,
      type: i % 2 === 0 ? 'ZIP' : 'EXE',
      size,
    });
  }

  return docs;
}

async function main() {
  console.log('🔌 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // 1. Tạo / Cập nhật Danh mục tài liệu (DocumentCategories)
  console.log('🌱 Đang khởi tạo Danh mục tài liệu (DocumentCategories)...');
  const catMap: Record<string, any> = {};

  for (const c of CATEGORIES_DATA) {
    let catDoc = await DocumentCategory.findOne({ name: c.name });
    if (!catDoc) {
      catDoc = await DocumentCategory.create({ name: c.name, description: c.description, isActive: true });
      console.log(`  ➕ Tạo danh mục tài liệu mới: ${c.name}`);
    } else {
      await DocumentCategory.updateOne({ _id: catDoc._id }, { description: c.description, isActive: true });
    }
    catMap[c.name] = catDoc._id;
  }

  // 2. Xóa tài liệu cũ và chèn 200 tài liệu mới
  console.log('\n🗑️  Xóa dữ liệu tài liệu cũ...');
  await Resource.deleteMany({});

  const allDocsData = generate200Resources();
  console.log(`\n🚀 Đang tiến hành chèn ${allDocsData.length} Tài liệu kỹ thuật chuẩn chuyên ngành...`);

  const docsToInsert = allDocsData.map((d) => ({
    title: d.title,
    description: d.description,
    fileUrl: d.fileUrl,
    type: d.type,
    categoryId: catMap[d.categoryName],
    size: d.size,
    isActive: true,
  }));

  const insertedDocs = await Resource.insertMany(docsToInsert);

  console.log('\n────────────────────────────────────────────────────────────');
  console.log(`🎉 HOÀN THÀNH KẾT QUẢ: ĐÃ SEED THÀNH CÔNG ${insertedDocs.length} TÀI LIỆU KỸ THUẬT!`);
  console.log('────────────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

main().catch((err) => {
  console.error('❌ Lỗi nghiêm trọng:', err);
  process.exit(1);
});
