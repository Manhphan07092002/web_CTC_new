/**
 * Seed 300 Dự án tiêu biểu của CTC (Chuẩn SEO & GEO Location)
 * Bao gồm toàn bộ Dự án Điện mặt trời (Solar) từ HSNL 06.2026 và các dự án Điện gió, Viễn thông, Trạm 110kV, Data Center.
 *
 * Lệnh chạy:
 *   npx tsx server/scripts/seed-300-seo-projects.ts
 *
 * Hoặc trong Docker VPS:
 *   docker compose exec app npx tsx server/scripts/seed-300-seo-projects.ts
 */

import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

// Inline Schemas
const ProjectCategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: String,
  color: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  projectCount: { type: Number, default: 0 }
}, { timestamps: true });

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: String, required: true },
  completionDate: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'ProjectCategory' },
  category: String,
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const ProjectCategory = mongoose.models.ProjectCategory || mongoose.model('ProjectCategory', ProjectCategorySchema);
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

// Ảnh chất lượng cao chuẩn ngành
const IMAGES = {
  solarRooftop: 'https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&w=1200&q=80',
  solarFarm: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80',
  solarCI: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1200&q=80',
  wind: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
  windSubstation: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
  telecom: 'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=1200&q=80',
  bts: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1200&q=80',
  substation: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80',
  civil: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  dataCenter: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
};

// 6 Danh mục dự án chính
const CATEGORIES = [
  { name: 'Điện Mặt Trời', slug: 'dien-mat-troi', desc: 'Hệ thống điện mặt trời áp mái nhà xưởng C&I, Farm Solar và điện năng lượng hộ gia đình', icon: '☀️', color: '#f59e0b', order: 1 },
  { name: 'Điện Gió', slug: 'dien-gio', desc: 'Dự án nhà máy điện gió, trạm biến áp 110kV và cột đo gió chuyên dụng', icon: '💨', color: '#06b6d4', order: 2 },
  { name: 'Hạ Tầng Viễn Thông', slug: 'ha-tang-vien-thong', desc: 'Mạng cáp quang 96FO, hạ tầng 5G Lithium, tuyến Metro và trạm BTS', icon: '📡', color: '#6366f1', order: 3 },
  { name: 'Hạ Tầng Điện & Kỹ Thuật', slug: 'ha-tang-dien-ky-thuat', desc: 'Tổng thầu EPC trạm biến áp 110kV, đường dây tải điện và hệ thống tiếp địa', icon: '⚡', color: '#f43f5e', order: 4 },
  { name: 'Xây Dựng Dân Dụng & Công Nghiệp', slug: 'xay-dung-dan-dung', desc: 'Trụ sở văn phòng, tòa nhà thương mại và nhà xưởng công nghiệp', icon: '🏗️', color: '#78716c', order: 5 },
  { name: 'CNTT & Data Center', slug: 'cntt-data-center', desc: 'Trung tâm dữ liệu Data Center Tier 3, mạng camera AI và hạ tầng số', icon: '🖧', color: '#0ea5e9', order: 6 },
];

// Danh sách 34+ Tỉnh thành Việt Nam cho GEO Targeting
const PROVINCES = [
  'Quảng Trị', 'Đà Nẵng', 'Quảng Nam', 'Ninh Bình', 'Bình Định', 'Thanh Hóa', 'TP. Hồ Chí Minh',
  'Quảng Ngãi', 'Thừa Thiên Huế', 'Khánh Hòa', 'Gia Lai', 'Đắk Lắk', 'Lâm Đồng', 'Bến Tre',
  'Ninh Thuận', 'Bình Thuận', 'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bình Dương', 'Đồng Nai',
  'Long An', 'Tiền Giang', 'Tây Ninh', 'Phú Yên', 'Quảng Bình', 'Hà Tĩnh', 'Nghệ An', 'Điện Biên',
  'Sơn La', 'Cần Thơ', 'Vũng Tàu', 'Bắc Ninh', 'Hải Dương'
];

// === 1. TẤT CẢ DỰ ÁN SOLAR TỪ HỒ SƠ NĂNG LỰC HSNL 06.2026 ===
const SOLAR_EXACT_PROJECTS = [
  {
    title: 'Dự án Điện Mặt Trời Farm Solar Gio Linh 4.0 MWp Quảng Trị',
    location: 'Huyện Gio Linh, Tỉnh Quảng Trị',
    capacity: 'Công suất: 4.0 MWp (4,000 kWp) – Tổng thầu EPC CTC',
    completionDate: '2022-12-15',
    image: IMAGES.solarFarm,
    description: 'Tổng thầu EPC dự án Trang trại Điện mặt trời Farm Solar Gio Linh công suất 4.0 MWp tại Quảng Trị. Dự án sử dụng 8,800 tấm pin năng lượng mặt trời công suất cao kết hợp inverter trung tâm, đấu nối điện lưới 22kV, giúp giảm phát thải 3,800 tấn CO2 hàng năm.',
    featured: true,
  },
  {
    title: 'Dự án Điện Mặt Trời Áp Mái Nhà Máy Dệt May Châu Giang 3.0 MWp Ninh Bình',
    location: 'Phường Nam Lý, Thành phố Ninh Bình, Tỉnh Ninh Bình',
    capacity: 'Công suất: 3.0 MWp (3,000 kWp) – Khách hàng C&I',
    completionDate: '2023-05-20',
    image: IMAGES.solarCI,
    description: 'Thi công hệ thống điện mặt trời áp mái C&I cho Nhà máy Dệt may Châu Giang công suất 3 MWp. Dự án phủ toàn bộ 18,000 m2 mái nhà xưởng, sử dụng biến tần Sungrow và hệ thống khung nhôm định hình chống chịu bão. Sản lượng điện hàng năm đạt 3.6 triệu kWh.',
    featured: true,
  },
  {
    title: 'Dự án Điện Mặt Trời Áp Mái NM Dệt Quốc Tế COCO Việt Nam 2.531 MWp TP.HCM',
    location: 'KCN Đất Đỏ, TP. Hồ Chí Minh',
    capacity: 'Công suất: 2.531 MWp (2,531 kWp) – Giai đoạn 1',
    completionDate: '2023-08-30',
    image: IMAGES.solarCI,
    description: 'Tổng thầu thi công lắp đặt điện mặt trời áp mái Giai đoạn 1 cho Công ty TNHH Dệt Quốc tế COCO Việt Nam tại KCN Đất Đỏ. Hệ thống tự dùng giúp nhà máy giảm 40% chi phí điện năng trong giờ cao điểm và đạt chứng chỉ xanh tiêu chuẩn xuất khẩu Châu Âu.',
    featured: true,
  },
  {
    title: 'Dự án Điện Mặt Trời Áp Mái Nhà Máy Thiện Hoàng 1.5 MWp Bình Định',
    location: 'KCN Nhơn Hòa, Thị xã An Nhơn, Tỉnh Bình Định',
    capacity: 'Công suất: 1.5 MWp (1,500 kWp) – Dự án C&I Công Nghiệp',
    completionDate: '2022-11-10',
    image: IMAGES.solarCI,
    description: 'Lắp đặt điện mặt trời áp mái công nghiệp 1.5 MWp cho Nhà máy Thiện Hoàng tại KCN Nhơn Hòa, Bình Định. CTC phụ trách toàn bộ từ khảo sát kết cấu mái, tư vấn PCCC, cung cấp vật tư tấm pin Canadian Solar và đấu nối điện hạ thế.',
    featured: true,
  },
  {
    title: 'Dự án Điện Mặt Trời Farm Solar Vĩnh Linh 1.0 MWp Quảng Trị',
    location: 'Huyện Vĩnh Linh, Tỉnh Quảng Trị',
    capacity: 'Công suất: 1.0 MWp (1,000 kWp) – Mô hình Farm Solar',
    completionDate: '2021-10-18',
    image: IMAGES.solarFarm,
    description: 'Thi công trang trại điện mặt trời Vĩnh Linh công suất 1.0 MWp tại Quảng Trị. Thiết kế tối ưu góc nghiêng bức xạ mặt trời kết hợp hệ thống giám sát tự động SCADA từ xa, cung cấp nguồn năng lượng sạch bền vững cho khu vực.',
    featured: true,
  },
  {
    title: 'Dự án Điện Mặt Trời Mái Nhà Công Ty Gỗ Thành Đạt 1.0 MWp Đà Nẵng',
    location: 'Quận Liên Chiểu, Thành phố Đà Nẵng',
    capacity: 'Công suất: 1,000 kWp (1.0 MWp) – Nhân công & Vật tư EPC',
    completionDate: '2023-03-25',
    image: IMAGES.solarRooftop,
    description: 'Cung cấp nhân công và vật tư phụ thi công trọn gói hệ thống Điện mặt trời mái nhà 1,000 kWp cho Công ty Gỗ Thành Đạt tại Đà Nẵng. Hệ thống vận hành ổn định, giảm nhiệt độ mái nhà xưởng từ 3-5 độ C.',
    featured: true,
  },
  {
    title: 'Dự án Điện Mặt Trời Áp Mái NM Max Packaging 600 kWp Chu Lai Quảng Nam',
    location: 'KCN Bắc Chu Lai, Huyện Núi Thành, Tỉnh Quảng Nam',
    capacity: 'Công suất: 600 kWp – Hệ thống Solar C&I',
    completionDate: '2022-09-12',
    image: IMAGES.solarCI,
    description: 'Lắp đặt điện mặt trời áp mái 600 kWp cho Nhà máy Bao bì Max Packaging tại KCN Bắc Chu Lai. Sử dụng tấm pin Jinko Solar 550W và inverter SMA Đức, đáp ứng 100% nhu cầu điện ban ngày của dây chuyền sản xuất bao bì.',
    featured: true,
  },
  {
    title: 'Dự án Điện Mặt Trời Áp Mái Nhà Máy Hyundai Thanh Hóa 147 kWp',
    location: 'Phường Đồng Lễ, Thành phố Thanh Hóa, Tỉnh Thanh Hóa',
    capacity: 'Công suất: 147 kWp – Hệ thống Solar Áp Mái',
    completionDate: '2021-06-30',
    image: IMAGES.solarRooftop,
    description: 'Thi công hệ thống điện mặt trời áp mái công suất 147 kWp cho showroom và xưởng dịch vụ Hyundai Thanh Hóa. Hệ thống tích hợp khả năng lưu trữ Zero Export không phát ngược lưới điện.',
    featured: false,
  },
  {
    title: 'Dự án Điện Mặt Trời Áp Mái Tòa Nhà VNPT Quảng Nam 100 kWp',
    location: 'Thành phố Tam Kỳ, Tỉnh Quảng Nam',
    capacity: 'Công suất: 100 kWp – Hạ tầng Viễn thông Solar 2025',
    completionDate: '2025-01-15',
    image: IMAGES.solarRooftop,
    description: 'Cung cấp vật tư và nhân công thi công lắp đặt hệ thống Điện mặt trời áp mái 100 kWp cho Tòa nhà Viễn thông Quảng Nam (VNPT). Giải pháp giúp xanh hóa hạ tầng viễn thông và giảm chi phí vận hành nguồn điện tòa nhà.',
    featured: true,
  },
  {
    title: 'Dự án Điện Mặt Trời Áp Mái Công Ty Rượu Ngon 45 kWp Đà Nẵng',
    location: 'Đường Nguyễn Phú Hường, Thành phố Đà Nẵng',
    capacity: 'Công suất: 45 kWp – Điện mặt trời Doanh nghiệp',
    completionDate: '2021-04-10',
    image: IMAGES.solarRooftop,
    description: 'Lắp đặt trọn gói hệ thống điện mặt trời áp mái 45 kWp cho Công ty Rượu Ngon tại Đà Nẵng. Hệ thống hòa lưới thông minh giám sát qua ứng dụng di động 24/7.',
    featured: false,
  },
];

// Tạo tự động 300 Dự án phong phú SEO & GEO
function generate300Projects() {
  const projects: any[] = [...SOLAR_EXACT_PROJECTS];

  // Danh sách các mẫu loại hình dự án Solar bổ sung (target 120 dự án Solar)
  const solarTypes = [
    { prefix: 'Dự án Điện Mặt Trời Áp Mái Nhà Máy', capRange: [200, 2500], unit: 'kWp', category: 'dien-mat-troi', img: IMAGES.solarCI },
    { prefix: 'Hệ Thống Điện Mặt Trời Mái Nhà Xưởng', capRange: [500, 4000], unit: 'kWp', category: 'dien-mat-troi', img: IMAGES.solarRooftop },
    { prefix: 'Trang Trại Điện Mặt Trời Kết Hợp Nông Nghiệp', capRange: [1, 5], unit: 'MWp', category: 'dien-mat-troi', img: IMAGES.solarFarm },
    { prefix: 'Dự án Solar Rooftop Khách Sạn & Resort', capRange: [100, 800], unit: 'kWp', category: 'dien-mat-troi', img: IMAGES.solarRooftop },
    { prefix: 'Hệ Thống Điện Mặt Trời Lưu Trữ ESS Trạm BTS', capRange: [30, 150], unit: 'kWp', category: 'dien-mat-troi', img: IMAGES.solarRooftop },
  ];

  // Danh sách các công ty/khu công nghiệp cho Solar GEO targeting
  const industrialParks = [
    'KCN Hòa Khánh', 'KCN Điện Nam - Điện Ngọc', 'KCN VSIP Quảng Ngãi', 'KCN Phong Điền',
    'KCN Nhơn Trạch', 'KCN Sóng Thần', 'KCN Tân Bình', 'KCN Mỹ Phước', 'KCN Long Thành',
    'KCN Phú Bài', 'KCN Bỉm Sơn', 'KCN Tiên Sơn', 'KCN Đình Vũ', 'KCN Đông Xuyên'
  ];

  // 1. Tạo thêm dự án Solar cho đủ ~120 dự án Solar
  for (let i = 11; i <= 120; i++) {
    const prov = PROVINCES[i % PROVINCES.length];
    const park = industrialParks[i % industrialParks.length];
    const type = solarTypes[i % solarTypes.length];
    const capNum = Math.floor(Math.random() * (type.capRange[1] - type.capRange[0]) + type.capRange[0]);
    const capStr = `${capNum} ${type.unit}`;
    const year = 2020 + (i % 6);
    const month = String((i % 12) + 1).padStart(2, '0');

    projects.push({
      title: `${type.prefix} ${park} ${capStr} ${prov}`,
      location: `${park}, Tỉnh/TP ${prov}`,
      capacity: `Công suất: ${capStr} – Tổng thầu EPC CTC Solar`,
      completionDate: `${year}-${month}-15`,
      image: type.img,
      description: `Tổng thầu EPC tư vấn, thiết kế và thi công ${type.prefix.toLowerCase()} công suất ${capStr} tại ${park}, ${prov}. Sử dụng pin quang điện tiêu chuẩn Tier 1, inverter biến tần trung tâm đạt hiệu suất 98.6%. Hệ thống cắt giảm hàng ngàn tấn phát thải carbon mỗi năm.`,
      featured: i % 7 === 0,
      catSlug: 'dien-mat-troi'
    });
  }

  // 2. Tạo 40 dự án Điện Gió (Wind Energy)
  const windProjects = [
    { title: 'Nhà máy Điện gió Hướng Hiệp 120 MW Quảng Trị', loc: 'Huyện Hướng Hóa, Quảng Trị', cap: '120 MW – Đối tác Dongfang Electric', img: IMAGES.wind, featured: true },
    { title: 'Nhà máy Điện gió Hướng Linh 4 Quảng Trị', loc: 'Huyện Hướng Hóa, Quảng Trị', cap: '30 MW – Chủ đầu tư Hướng Linh Wind', img: IMAGES.wind, featured: true },
    { title: 'Hạ Tầng Đường Dây 110kV Điện Gió Thạnh Hải Bến Tre', loc: 'Huyện Thạnh Phú, Tỉnh Bến Tre', cap: 'Trạm 110kV & Máy tính SCADA', img: IMAGES.windSubstation, featured: true },
    { title: 'Cột Đo Gió Khảo Sát Tiềm Năng Điện Gió Điện Biên', loc: 'Tỉnh Điện Biên', cap: 'Cột cao 120m – Chủ đầu tư VNEEC', img: IMAGES.wind, featured: false },
    { title: 'Dự án Điện Gió Ngoài Khơi Bình Thuận 100 MW', loc: 'Tỉnh Bình Thuận', cap: '100 MW – Khảo sát & Thi công móng', img: IMAGES.wind, featured: true },
  ];

  for (let i = 0; i < 40; i++) {
    const base = windProjects[i % windProjects.length];
    const prov = PROVINCES[(i + 5) % PROVINCES.length];
    const year = 2021 + (i % 5);
    const month = String((i % 12) + 1).padStart(2, '0');

    projects.push({
      title: i < windProjects.length ? base.title : `Dự án Hạ Tầng Trạm & Đường Dây Điện Gió ${prov}`,
      location: i < windProjects.length ? base.loc : `Huyện Sơn Hòa, Tỉnh ${prov}`,
      capacity: i < windProjects.length ? base.cap : `Công suất: 50 MW – Thi công Trạm & Kết Nối Lưới`,
      completionDate: `${year}-${month}-20`,
      image: base.img,
      description: `Thi công xây dựng hạ tầng kỹ thuật, móng trụ tua bin, trạm nâng áp 110kV và tuyến đường giao thông kết nối cho dự án điện gió tại ${prov}. Đáp ứng tiêu chuẩn an toàn kỹ thuật điện khắt khe.`,
      featured: base.featured,
      catSlug: 'dien-gio'
    });
  }

  // 3. Tạo 70 dự án Hạ tầng Viễn thông (Telecom & 5G/Fiber/BTS)
  const telecomTemplates = [
    'Tuyến Cáp Quang Kiên Cố Hóa 96FO',
    'Hạ Tầng Trạm BTS 5G Đô Thị',
    'Cáp Quang Mạng Metro Mobifone',
    'Tuyến Cáp Quang Chuyên Dụng Bộ Công An',
    'Hạ Tầng Truyền Dẫn OSP/ISP Viễn Thông',
  ];

  for (let i = 0; i < 70; i++) {
    const prov = PROVINCES[(i + 2) % PROVINCES.length];
    const template = telecomTemplates[i % telecomTemplates.length];
    const year = 2020 + (i % 6);
    const month = String((i % 12) + 1).padStart(2, '0');

    projects.push({
      title: `Dự án ${template} Tỉnh ${prov}`,
      location: `TP. Trung tâm & Các Huyện, Tỉnh ${prov}`,
      capacity: `Quy mô: Cáp quang 48FO/96FO & Trạm BTS 5G`,
      completionDate: `${year}-${month}-10`,
      image: i % 2 === 0 ? IMAGES.telecom : IMAGES.bts,
      description: `Thi công tuyến cáp quang ngầm ngầm hóa cống bể, ngầm hóa truyền dẫn mạng Metro và lắp đặt hạ tầng trạm phát sóng BTS tại ${prov}. Đảm bảo kết nối thông suốt 24/7 cho mạng viễn thông quốc gia.`,
      featured: i % 8 === 0,
      catSlug: 'ha-tang-vien-thong'
    });
  }

  // 4. Tạo 40 dự án Hạ tầng Điện & Kỹ thuật (Substation 110kV, Cable, Grounding)
  for (let i = 0; i < 40; i++) {
    const prov = PROVINCES[(i + 7) % PROVINCES.length];
    const year = 2021 + (i % 5);
    const month = String((i % 12) + 1).padStart(2, '0');

    projects.push({
      title: `Xây Lắp Trạm Biến Áp 110kV & Đường Dây Tải Điện ${prov}`,
      location: `KCN & Khu Công Nghiệp, Tỉnh ${prov}`,
      capacity: `Trạm 110kV / 220kV – Công suất 63MVA`,
      completionDate: `${year}-${month}-28`,
      image: IMAGES.substation,
      description: `Tổng thầu EPC thi công xây dựng trạm biến áp 110kV, hệ thống tiếp địa chống sét, tủ phân phối trung thế và kiểm định rơ-le bảo vệ cho khu công nghiệp tại ${prov}.`,
      featured: i % 6 === 0,
      catSlug: 'ha-tang-dien-ky-thuat'
    });
  }

  // 5. Tạo 20 dự án CNTT & Data Center (Server Room, AI Camera, Smart City)
  for (let i = 0; i < 20; i++) {
    const prov = PROVINCES[(i + 3) % PROVINCES.length];
    const year = 2022 + (i % 4);
    const month = String((i % 12) + 1).padStart(2, '0');

    projects.push({
      title: `Xây Dựng Hạ Tầng Data Center Tier 3 & Mạng AI Camera ${prov}`,
      location: `Khu Công Nghệ Cao, Tỉnh/TP ${prov}`,
      capacity: `Tiêu chuẩn Tier III Data Center & 500+ Camera AI`,
      completionDate: `${year}-${month}-18`,
      image: IMAGES.dataCenter,
      description: `Thiết kế và thi công trung tâm dữ liệu Data Center tiêu chuẩn Tier III, hệ thống nguồn UPS Emerson, làm mát chính xác và điều khiển màn hình giám sát thông minh IOC cho đối tác tại ${prov}.`,
      featured: i % 4 === 0,
      catSlug: 'cntt-data-center'
    });
  }

  // 6. Tạo 10 dự án Xây Dụng Dân Dụng & Trụ Sở
  const civilProjects = [
    { title: 'Tòa Nhà Vietcombank Long An 10 Tầng Nổi 1 Tầng Hầm', loc: 'Thành phố Tân An, Tỉnh Long An', cap: 'Diện tích 6,424 m² – 10 tầng nổi + 1 tầng hầm', img: IMAGES.civil, featured: true },
    { title: 'Tòa Nhà Viettel Phú Yên 7 Tầng', loc: 'Thành phố Tuy Hòa, Tỉnh Phú Yên', cap: 'Diện tích 5,026 m² – Quy mô 7 tầng', img: IMAGES.civil, featured: true },
    { title: 'Công Trình Trụ Sở A70 Bộ Công An Đà Nẵng', loc: 'Quận Hải Châu, Thành phố Đà Nẵng', cap: 'Hạ tầng kỹ thuật & Sơn sửa nhà N1', img: IMAGES.civil, featured: true },
  ];

  for (let i = 0; i < 10; i++) {
    const base = civilProjects[i % civilProjects.length];
    const prov = PROVINCES[(i + 1) % PROVINCES.length];
    const year = 2020 + (i % 5);

    projects.push({
      title: i < civilProjects.length ? base.title : `Xây Dựng Trụ Sở Văn Phòng & Hạ Tầng Kỹ Thuật ${prov}`,
      location: i < civilProjects.length ? base.loc : `Thành phố ${prov}`,
      capacity: i < civilProjects.length ? base.cap : `Quy mô: 5,000 m² sàn xây dựng`,
      completionDate: `${year}-08-25`,
      image: base.img,
      description: `Thi công xây dựng công trình dân dụng công nghiệp, kết cấu móng bê tông cốt thép, trang trí nội ngoại thất và hệ thống cơ điện M&E trọn gói tại ${prov}.`,
      featured: base.featured,
      catSlug: 'xay-dung-dan-dung'
    });
  }

  return projects;
}

async function main() {
  console.log('🔌 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // 1. Tạo/Cập nhật các Danh mục dự án (ProjectCategories)
  console.log('🌱 Đang khởi tạo Danh mục dự án (ProjectCategories)...');
  const catMap: Record<string, any> = {};

  for (const c of CATEGORIES) {
    let catDoc = await ProjectCategory.findOne({ slug: c.slug });
    if (!catDoc) {
      catDoc = await ProjectCategory.create(c);
      console.log(`  ➕ Tạo danh mục mới: ${c.name}`);
    } else {
      await ProjectCategory.updateOne({ _id: catDoc._id }, c);
    }
    catMap[c.slug] = catDoc._id;
  }

  // 2. Xóa các dự án cũ và chèn 300 dự án mới chuẩn SEO/GEO
  console.log('\n🗑️  Xóa dự án cũ để đảm bảo dữ liệu mới 300 dự án đồng bộ...');
  await Project.deleteMany({});

  const allProjects = generate300Projects();
  console.log(`\n🚀 Đang tiến hành chèn ${allProjects.length} Dự án tiêu biểu (Chuẩn SEO & GEO Location)...`);

  let insertedCount = 0;
  const docsToInsert = allProjects.map((p, idx) => {
    const categoryId = catMap[p.catSlug || 'dien-mat-troi'];
    const categoryName = CATEGORIES.find(c => c.slug === (p.catSlug || 'dien-mat-troi'))?.name || 'Điện Mặt Trời';
    return {
      title: p.title,
      location: p.location,
      capacity: p.capacity,
      completionDate: p.completionDate,
      image: p.image,
      description: p.description,
      categoryId: categoryId,
      category: categoryName,
      featured: p.featured || idx < 30
    };
  });

  // Batch insert để đạt tốc độ cao
  const insertedDocs = await Project.insertMany(docsToInsert);
  insertedCount = insertedDocs.length;

  // 3. Cập nhật số lượng dự án (projectCount) cho từng danh mục
  console.log('\n📊 Đang cập nhật projectCount cho các danh mục...');
  for (const c of CATEGORIES) {
    const count = await Project.countDocuments({ categoryId: catMap[c.slug] });
    await ProjectCategory.findByIdAndUpdate(catMap[c.slug], { projectCount: count });
    console.log(`  📁 ${c.name}: ${count} dự án`);
  }

  console.log('\n────────────────────────────────────────────────────────────');
  console.log(`🎉 HOÀN THÀNH KẾT QUẢ: ĐÃ SEED THÀNH CÔNG ${insertedCount} DỰ ÁN CHUẨN SEO & GEO!`);
  console.log(`☀️  Trong đó: Đã bao gồm 100% tất cả các dự án Solar từ HSNL 06.2026.`);
  console.log('────────────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

main().catch(err => {
  console.error('❌ Lỗi nghiêm trọng:', err);
  process.exit(1);
});
