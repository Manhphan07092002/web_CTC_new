import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

// ── Inline schemas (no import loops) ──────────────────────────────────────
const ProjectCategorySchema = new Schema({
  name:  { type: String, required: true },
  slug:  { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon:  String,
  color: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  projectCount: { type: Number, default: 0 }
}, { timestamps: true });

const ProjectSchema = new Schema({
  title:          { type: String, required: true },
  location:       { type: String, required: true },
  capacity:       { type: String, required: true },   // re-used for "chủ đầu tư / quy mô"
  completionDate: { type: String, required: true },
  image:          { type: String, required: true },
  description:    { type: String, required: true },
  categoryId:     { type: Schema.Types.ObjectId, ref: 'ProjectCategory' },
  category:       String,
  featured:       { type: Boolean, default: false }
}, { timestamps: true });

// Guard against re-registration in watch mode
const ProjectCategory = mongoose.models.ProjectCategory
  || mongoose.model('ProjectCategory', ProjectCategorySchema);
const Project = mongoose.models.Project
  || mongoose.model('Project', ProjectSchema);

// ── Utility helpers ────────────────────────────────────────────────────────
// Representative Unsplash images per sector
const IMAGES: Record<string, string> = {
  wind:   'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
  solar:  'https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&w=800&q=80',
  telecom:'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=800&q=80',
  infra:  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80',
  bts:    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80',
  civil:  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  scada:  'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=800&q=80',
  road:   'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=800&q=80',
  it:     'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
};

// ── Category definitions ───────────────────────────────────────────────────
interface CatDef { name: string; slug: string; desc: string; icon: string; color: string; order: number; }
const CATEGORIES: CatDef[] = [
  { name: 'Điện Gió',                slug: 'dien-gio',                   desc: 'Dự án nhà máy điện gió, cột đo gió và hạ tầng truyền tải',       icon: '💨', color: '#06b6d4', order: 1 },
  { name: 'Điện Mặt Trời',           slug: 'dien-mat-troi',              desc: 'Dự án điện mặt trời áp mái, C&I, rooftop và trang trại',         icon: '☀️', color: '#f59e0b', order: 2 },
  { name: 'Hạ Tầng Viễn Thông',      slug: 'ha-tang-vien-thong',         desc: 'Cáp quang, BTS, truyền dẫn Metro và hạ tầng OSP/ISP',            icon: '📡', color: '#6366f1', order: 3 },
  { name: 'Hạ Tầng Điện & Kỹ Thuật', slug: 'ha-tang-dien-ky-thuat',     desc: 'Hệ thống nguồn điện AC, tiếp địa, trạm biến áp',                 icon: '⚡', color: '#f43f5e', order: 4 },
  { name: 'Xây Dựng Dân Dụng',       slug: 'xay-dung-dan-dung',          desc: 'Công trình dân dụng, công nghiệp, trụ sở và hoàn thiện',         icon: '🏗️', color: '#78716c', order: 5 },
  { name: 'SCADA & Tự Động Hóa',     slug: 'scada-tu-dong-hoa',          desc: 'Hệ thống SCADA, điều khiển nhà máy thủy điện và tự động hóa',   icon: '🖥️', color: '#8b5cf6', order: 6 },
  { name: 'Hạ Tầng Giao Thông',      slug: 'ha-tang-giao-thong',         desc: 'Đường nội bộ, hạ tầng giao thông phục vụ khu công nghiệp/điện', icon: '🛣️', color: '#10b981', order: 7 },
  { name: 'CNTT & Data Center',       slug: 'cntt-data-center',           desc: 'Hệ thống camera AI, mạng LAN/WAN, Data Center',                 icon: '🖧',  color: '#0ea5e9', order: 8 },
];

// ── Project data ───────────────────────────────────────────────────────────
interface ProjectRow {
  title:    string;
  catSlug:  string;
  location: string;
  client:   string;
  capacity: string;
  date:     string;
  img:      string;
  desc:     string;
  featured: boolean;
}

const PROJECTS: ProjectRow[] = [
  // ── Điện Gió ──────────────────────────────────────────────────────────
  {
    title:    'Nhà máy Điện gió Hướng Hiệp',
    catSlug:  'dien-gio',
    location: 'Quảng Trị',
    client:   'Dongfang Electric International Corporation',
    capacity: '~30 MW – Chủ đầu tư: Dongfang Electric',
    date:     '2022-06-30',
    img:      IMAGES.wind,
    desc:     'Thi công EPC hạ tầng nhà máy điện gió Hướng Hiệp tại Quảng Trị. CTC đảm nhận toàn bộ công tác lắp đặt hạ tầng điện, đường dây truyền tải và kết nối lưới.',
    featured: true,
  },
  {
    title:    'Nhà máy Điện gió Hướng Linh 4',
    catSlug:  'dien-gio',
    location: 'Quảng Trị',
    client:   'Hướng Linh Wind Power',
    capacity: 'Chủ đầu tư: Hướng Linh Wind Power',
    date:     '2023-03-31',
    img:      IMAGES.wind,
    desc:     'EPC xây dựng và lắp đặt hạ tầng điện, truyền tải cho nhà máy điện gió Hướng Linh 4, tiếp nối thành công của các giai đoạn trước.',
    featured: true,
  },
  {
    title:    'Cột đo gió Điện Biên',
    catSlug:  'dien-gio',
    location: 'Điện Biên',
    client:   'VEEC',
    capacity: 'Chủ đầu tư: VEEC',
    date:     '2021-09-30',
    img:      IMAGES.wind,
    desc:     'Cung cấp, chế tạo và lắp dựng cột đo gió phục vụ khảo sát tiềm năng phát triển dự án điện gió tại Điện Biên.',
    featured: false,
  },
  {
    title:    'Chế tạo cột đo gió khu vực Miền Trung',
    catSlug:  'dien-gio',
    location: 'Miền Trung',
    client:   'VEEC',
    capacity: 'Chủ đầu tư: VEEC',
    date:     '2022-03-31',
    img:      IMAGES.wind,
    desc:     'Chế tạo, gia công cột đo gió kết cấu thép tại khu vực Miền Trung theo tiêu chuẩn IEC phục vụ cho các dự án nghiên cứu phát triển điện gió.',
    featured: false,
  },
  // ── Điện Mặt Trời ──────────────────────────────────────────────────────
  {
    title:    'Điện mặt trời áp mái Gỗ Thành Đạt 1MWp',
    catSlug:  'dien-mat-troi',
    location: 'Bình Định',
    client:   'Gỗ Thành Đạt',
    capacity: '1 MWp – Solar C&I',
    date:     '2023-12-31',
    img:      IMAGES.solar,
    desc:     'Thi công EPC hệ thống điện mặt trời áp mái công suất 1MWp cho nhà máy chế biến gỗ Thành Đạt tại Bình Định. Giúp doanh nghiệp tiết kiệm đáng kể chi phí điện năng.',
    featured: true,
  },
  {
    title:    'Điện mặt trời Hyundai 147kWp',
    catSlug:  'dien-mat-troi',
    location: 'Thanh Hóa',
    client:   'Hyundai',
    capacity: '147 kWp – Solar C&I',
    date:     '2023-06-30',
    img:      IMAGES.solar,
    desc:     'Lắp đặt hệ thống điện mặt trời áp mái 147kWp cho nhà xưởng Hyundai tại Thanh Hóa, tích hợp hệ thống monitoring thông minh.',
    featured: false,
  },
  {
    title:    'Điện mặt trời Viễn thông Quảng Nam',
    catSlug:  'dien-mat-troi',
    location: 'Quảng Nam',
    client:   'VNPT',
    capacity: 'Solar Rooftop – Chủ đầu tư: VNPT',
    date:     '2022-12-31',
    img:      IMAGES.solar,
    desc:     'Lắp đặt hệ thống điện mặt trời áp mái tại trụ sở Viễn thông Quảng Nam, cung cấp điện năng sạch cho hoạt động của VNPT tại tỉnh.',
    featured: false,
  },
  {
    title:    'Điện mặt trời áp mái Nhà máy',
    catSlug:  'dien-mat-troi',
    location: 'Miền Trung',
    client:   'Doanh nghiệp sản xuất',
    capacity: 'Solar C&I – Trên 200kWp',
    date:     '2024-03-31',
    img:      IMAGES.solar,
    desc:     'Thi công hệ thống điện mặt trời áp mái cho các nhà máy sản xuất khu vực Miền Trung, tối ưu chi phí điện năng và hướng đến sản xuất xanh.',
    featured: false,
  },
  {
    title:    'Điện mặt trời áp mái Nhà xưởng',
    catSlug:  'dien-mat-troi',
    location: 'Miền Trung',
    client:   'Doanh nghiệp',
    capacity: 'Solar C&I – 100–500kWp',
    date:     '2024-06-30',
    img:      IMAGES.solar,
    desc:     'Cung cấp giải pháp điện mặt trời cho hệ thống nhà xưởng doanh nghiệp, giảm phụ thuộc vào lưới điện quốc gia và tối ưu chi phí vận hành.',
    featured: false,
  },
  {
    title:    'Điện mặt trời áp mái Kho logistics',
    catSlug:  'dien-mat-troi',
    location: 'Miền Trung',
    client:   'Doanh nghiệp logistics',
    capacity: 'Solar C&I – 300–500kWp',
    date:     '2024-09-30',
    img:      IMAGES.solar,
    desc:     'Thi công điện mặt trời áp mái cho hệ thống kho bãi logistics, cung cấp điện cho hệ thống chiếu sáng, làm lạnh và thiết bị bốc dỡ.',
    featured: false,
  },
  {
    title:    'Điện mặt trời áp mái Văn phòng',
    catSlug:  'dien-mat-troi',
    location: 'Đà Nẵng',
    client:   'Doanh nghiệp',
    capacity: 'Solar Commercial – 30–100kWp',
    date:     '2024-06-30',
    img:      IMAGES.solar,
    desc:     'Lắp đặt hệ thống điện mặt trời áp mái tòa nhà văn phòng tại Đà Nẵng, tích hợp hệ thống giám sát từ xa và quản lý năng lượng thông minh.',
    featured: false,
  },
  {
    title:    'Điện mặt trời áp mái Khách sạn',
    catSlug:  'dien-mat-troi',
    location: 'Miền Trung',
    client:   'Khách sạn',
    capacity: 'Solar Commercial – 50–200kWp',
    date:     '2024-03-31',
    img:      IMAGES.solar,
    desc:     'Thi công điện mặt trời áp mái cho khách sạn tại Miền Trung, giúp cơ sở lưu trú tiết kiệm chi phí điện năng và nâng cao hình ảnh thân thiện môi trường.',
    featured: false,
  },
  {
    title:    'Điện mặt trời áp mái Trường học',
    catSlug:  'dien-mat-troi',
    location: 'Miền Trung',
    client:   'Đơn vị giáo dục',
    capacity: 'Solar Public – 30–100kWp',
    date:     '2023-09-30',
    img:      IMAGES.solar,
    desc:     'Lắp đặt hệ thống điện mặt trời cho trường học tại Miền Trung, vừa cung cấp điện năng sạch vừa phục vụ giáo dục nhận thức về năng lượng tái tạo cho học sinh.',
    featured: false,
  },
  {
    title:    'Điện mặt trời áp mái Bệnh viện',
    catSlug:  'dien-mat-troi',
    location: 'Miền Trung',
    client:   'Đơn vị y tế',
    capacity: 'Solar Public – 50–200kWp',
    date:     '2024-01-31',
    img:      IMAGES.solar,
    desc:     'Thi công EPC điện mặt trời áp mái bệnh viện, đảm bảo nguồn điện ổn định và sạch cho các hoạt động y tế, giảm phụ thuộc vào điện lưới.',
    featured: false,
  },
  {
    title:    'Điện mặt trời hộ kinh doanh',
    catSlug:  'dien-mat-troi',
    location: 'Miền Trung',
    client:   'Khách hàng cá nhân / hộ kinh doanh',
    capacity: 'Solar Residential – 5–30kWp',
    date:     '2024-09-30',
    img:      IMAGES.solar,
    desc:     'Cung cấp và lắp đặt hệ thống điện mặt trời cho hộ kinh doanh tại Miền Trung, tiết kiệm chi phí điện 60–80% và hoàn vốn trong 4–6 năm.',
    featured: false,
  },
  // ── Viễn Thông ──────────────────────────────────────────────────────────
  {
    title:    'Tuyến cáp quang Bộ Công an',
    catSlug:  'ha-tang-vien-thong',
    location: 'Đà Nẵng – TP.HCM',
    client:   'Bộ Công an',
    capacity: 'Tuyến truyền dẫn liên tỉnh – Chủ đầu tư: Bộ Công an',
    date:     '2020-12-31',
    img:      IMAGES.telecom,
    desc:     'Thi công tuyến cáp quang truyền dẫn cho hệ thống thông tin Bộ Công an trên trục Đà Nẵng – TP.HCM, đảm bảo an toàn thông tin quốc gia.',
    featured: true,
  },
  {
    title:    'Tuyến cáp quang 96FO Phan Rang – Đà Lạt',
    catSlug:  'ha-tang-vien-thong',
    location: 'Ninh Thuận – Lâm Đồng',
    client:   'Tổng công ty Hạ tầng mạng (VNPT Net)',
    capacity: '96 sợi quang – Chủ đầu tư: VNPT Net',
    date:     '2021-06-30',
    img:      IMAGES.telecom,
    desc:     'Thi công tuyến cáp quang 96FO kết nối Phan Rang – Đà Lạt cho VNPT Net, nâng cao năng lực truyền dẫn khu vực Nam Trung Bộ – Tây Nguyên.',
    featured: false,
  },
  {
    title:    'Metro Mobifone Khánh Hòa',
    catSlug:  'ha-tang-vien-thong',
    location: 'Khánh Hòa',
    client:   'Mobifone',
    capacity: 'Mạng Metro – Chủ đầu tư: Mobifone',
    date:     '2021-12-31',
    img:      IMAGES.telecom,
    desc:     'Thi công hệ thống mạng Metro Mobifone tại Khánh Hòa, kết nối các trạm BTS và nút mạng lõi, đảm bảo chất lượng dịch vụ 4G/5G cho khách hàng.',
    featured: false,
  },
  {
    title:    'Metro Mobifone Tây Nguyên',
    catSlug:  'ha-tang-vien-thong',
    location: 'Tây Nguyên',
    client:   'Mobifone',
    capacity: 'Mạng Metro – Chủ đầu tư: Mobifone',
    date:     '2022-06-30',
    img:      IMAGES.telecom,
    desc:     'Xây dựng mạng Metro Mobifone khu vực Tây Nguyên, kết nối đa tỉnh Đắk Lắk, Đắk Nông, Gia Lai, Kon Tum với hệ thống mạng lõi quốc gia.',
    featured: false,
  },
  {
    title:    'Metro Mobifone Quảng Nam',
    catSlug:  'ha-tang-vien-thong',
    location: 'Quảng Nam',
    client:   'Mobifone',
    capacity: 'Mạng Metro – Chủ đầu tư: Mobifone',
    date:     '2022-03-31',
    img:      IMAGES.telecom,
    desc:     'Thi công và triển khai mạng Metro Mobifone tại Quảng Nam, nâng cao chất lượng mạng di động và phủ sóng 4G rộng khắp toàn tỉnh.',
    featured: false,
  },
  {
    title:    'Metro Mobifone Quảng Ngãi',
    catSlug:  'ha-tang-vien-thong',
    location: 'Quảng Ngãi',
    client:   'Mobifone',
    capacity: 'Mạng Metro – Chủ đầu tư: Mobifone',
    date:     '2022-09-30',
    img:      IMAGES.telecom,
    desc:     'Triển khai hệ thống mạng Metro Mobifone tại Quảng Ngãi, đảm bảo kết nối liên tục giữa các trạm BTS và trung tâm điều hành mạng.',
    featured: false,
  },
  {
    title:    'Metro Mobifone Bình Định',
    catSlug:  'ha-tang-vien-thong',
    location: 'Bình Định',
    client:   'Mobifone',
    capacity: 'Mạng Metro – Chủ đầu tư: Mobifone',
    date:     '2022-12-31',
    img:      IMAGES.telecom,
    desc:     'Xây dựng mạng Metro cáp quang Mobifone tại Bình Định, kết nối các cụm trạm BTS và triển khai hạ tầng sẵn sàng cho 5G.',
    featured: false,
  },
  {
    title:    'Metro Mobifone Gia Lai',
    catSlug:  'ha-tang-vien-thong',
    location: 'Gia Lai',
    client:   'Mobifone',
    capacity: 'Mạng Metro – Chủ đầu tư: Mobifone',
    date:     '2023-03-31',
    img:      IMAGES.telecom,
    desc:     'Triển khai mạng Metro Mobifone tại Gia Lai, đảm bảo chất lượng dịch vụ di động cho vùng Tây Nguyên, tích hợp sẵn sàng lên 5G.',
    featured: false,
  },
  {
    title:    'Metro 5G Sơn Trà – Ngũ Hành Sơn',
    catSlug:  'ha-tang-vien-thong',
    location: 'Đà Nẵng',
    client:   'Mobifone',
    capacity: 'Mạng Metro 5G – Chủ đầu tư: Mobifone',
    date:     '2024-06-30',
    img:      IMAGES.telecom,
    desc:     'Thi công hạ tầng Metro 5G kết nối quận Sơn Trà và Ngũ Hành Sơn tại Đà Nẵng, nâng cao chất lượng phủ sóng 5G phục vụ du lịch và kinh doanh.',
    featured: true,
  },
  {
    title:    'Tuyến cáp quang QL1A',
    catSlug:  'ha-tang-vien-thong',
    location: 'Quảng Trị',
    client:   'Tổng công ty Hạ tầng mạng (VNPT Net)',
    capacity: 'Tuyến dọc QL1A – Chủ đầu tư: VNPT Net',
    date:     '2021-09-30',
    img:      IMAGES.telecom,
    desc:     'Thi công tuyến cáp quang dọc Quốc lộ 1A đoạn qua Quảng Trị, tăng cường năng lực hạ tầng mạng truyền dẫn Bắc – Nam.',
    featured: false,
  },
  {
    title:    'Hệ thống truyền dữ liệu Bộ Công an',
    catSlug:  'ha-tang-vien-thong',
    location: 'Đà Nẵng',
    client:   'Bộ Công an',
    capacity: 'Hệ thống truyền dữ liệu – Chủ đầu tư: Bộ Công an',
    date:     '2022-06-30',
    img:      IMAGES.telecom,
    desc:     'Lắp đặt và tích hợp hệ thống truyền dữ liệu chuyên dụng cho Bộ Công an tại Đà Nẵng, đảm bảo an toàn thông tin và băng thông cao.',
    featured: false,
  },
  {
    title:    'Bảo trì tuyến cáp quang Bộ Công an 2021',
    catSlug:  'ha-tang-vien-thong',
    location: 'Toàn quốc',
    client:   'Bộ Công an',
    capacity: 'Bảo trì định kỳ – Chủ đầu tư: Bộ Công an',
    date:     '2021-12-31',
    img:      IMAGES.telecom,
    desc:     'Thực hiện bảo trì, khắc phục sự cố và nâng cấp hệ thống cáp quang Bộ Công an trên toàn quốc, đảm bảo thông tin liên lạc không gián đoạn.',
    featured: false,
  },
  {
    title:    'Bảo trì tuyến cáp quang Bộ Công an 2024',
    catSlug:  'ha-tang-vien-thong',
    location: 'Toàn quốc',
    client:   'Bộ Công an',
    capacity: 'Bảo trì định kỳ – Chủ đầu tư: Bộ Công an',
    date:     '2024-12-31',
    img:      IMAGES.telecom,
    desc:     'Hợp đồng bảo trì dài hạn hệ thống cáp quang Bộ Công an năm 2024, bao gồm kiểm tra định kỳ, vá lỗi và nâng cấp thiết bị đầu cuối.',
    featured: false,
  },
  {
    title:    'Hạ tầng BTS Mobifone Miền Trung',
    catSlug:  'ha-tang-vien-thong',
    location: 'Miền Trung',
    client:   'Mobifone',
    capacity: 'Nhiều trạm BTS – Chủ đầu tư: Mobifone',
    date:     '2023-12-31',
    img:      IMAGES.telecom,
    desc:     'Thi công lắp đặt hệ thống trạm BTS Mobifone khu vực Miền Trung, mở rộng vùng phủ sóng 4G/5G và nâng cấp hạ tầng viễn thông toàn vùng.',
    featured: false,
  },
  {
    title:    'Hạ tầng cáp quang VNPT Miền Trung',
    catSlug:  'ha-tang-vien-thong',
    location: 'Miền Trung',
    client:   'VNPT',
    capacity: 'Nhiều tuyến cáp quang – Chủ đầu tư: VNPT',
    date:     '2024-06-30',
    img:      IMAGES.telecom,
    desc:     'Thi công xây dựng và mở rộng hạ tầng cáp quang VNPT tại các tỉnh Miền Trung, phục vụ phủ sóng internet cáp quang đến vùng nông thôn.',
    featured: false,
  },
  {
    title:    'Hạ tầng viễn thông Bộ Công an',
    catSlug:  'ha-tang-vien-thong',
    location: 'Toàn quốc',
    client:   'Bộ Công an',
    capacity: 'Hạ tầng chuyên dụng – Chủ đầu tư: Bộ Công an',
    date:     '2024-12-31',
    img:      IMAGES.telecom,
    desc:     'Tổng thầu xây dựng hạ tầng viễn thông chuyên dụng cho Bộ Công an trên toàn quốc, bao gồm cáp quang, truyền dẫn, thiết bị đầu cuối và hệ thống giám sát.',
    featured: false,
  },
  // ── Hạ Tầng Điện & Kỹ Thuật ──────────────────────────────────────────
  {
    title:    'Hệ thống nguồn điện AC Hòa Vang',
    catSlug:  'ha-tang-dien-ky-thuat',
    location: 'Đà Nẵng',
    client:   'Bộ Công an',
    capacity: 'Hệ thống điện AC – Chủ đầu tư: Bộ Công an',
    date:     '2021-06-30',
    img:      IMAGES.infra,
    desc:     'Thi công lắp đặt hệ thống nguồn điện xoay chiều (AC) tại trụ sở A70 Hòa Vang, đảm bảo nguồn cấp điện liên tục và ổn định cho các hệ thống quan trọng.',
    featured: false,
  },
  {
    title:    'Hệ thống tiếp địa Hòa Vang',
    catSlug:  'ha-tang-dien-ky-thuat',
    location: 'Đà Nẵng',
    client:   'Bộ Công an',
    capacity: 'Hệ thống tiếp địa – Chủ đầu tư: Bộ Công an',
    date:     '2021-09-30',
    img:      IMAGES.infra,
    desc:     'Thiết kế và thi công hệ thống tiếp địa chống sét tại khu vực Hòa Vang theo tiêu chuẩn kỹ thuật chuyên dụng của Bộ Công an.',
    featured: false,
  },
  // ── BTS & Phòng máy ───────────────────────────────────────────────────
  {
    title:    'Trạm BTS Hòa Vang',
    catSlug:  'ha-tang-vien-thong',
    location: 'Đà Nẵng',
    client:   'Bộ Công an',
    capacity: 'Trạm BTS chuyên dụng – Chủ đầu tư: Bộ Công an',
    date:     '2021-06-30',
    img:      IMAGES.bts,
    desc:     'Xây dựng và lắp đặt trạm BTS chuyên dụng cho Bộ Công an tại Hòa Vang, Đà Nẵng, phục vụ thông tin liên lạc an ninh chuyên biệt.',
    featured: false,
  },
  {
    title:    'Phòng máy Hòa Vang',
    catSlug:  'cntt-data-center',
    location: 'Đà Nẵng',
    client:   'Bộ Công an',
    capacity: 'Hạ tầng BTS & Data Room – Chủ đầu tư: Bộ Công an',
    date:     '2021-12-31',
    img:      IMAGES.it,
    desc:     'Thi công phòng máy chủ và trung tâm dữ liệu chuyên dụng tại Hòa Vang phục vụ Bộ Công an, bao gồm hạ tầng điện, làm mát, giám sát và an toàn dữ liệu.',
    featured: false,
  },
  // ── Xây Dựng Dân Dụng ─────────────────────────────────────────────────
  {
    title:    'Trụ sở A70',
    catSlug:  'xay-dung-dan-dung',
    location: 'Đà Nẵng',
    client:   'Bộ Công an',
    capacity: 'Công trình dân dụng – Chủ đầu tư: Bộ Công an',
    date:     '2022-12-31',
    img:      IMAGES.civil,
    desc:     'Thi công xây dựng trụ sở A70 tại Đà Nẵng cho Bộ Công an, bao gồm kết cấu thô, hoàn thiện nội ngoại thất và hệ thống kỹ thuật.',
    featured: false,
  },
  {
    title:    'Vách nhôm kính A70',
    catSlug:  'xay-dung-dan-dung',
    location: 'Đà Nẵng',
    client:   'Bộ Công an',
    capacity: 'Hoàn thiện – Chủ đầu tư: Bộ Công an',
    date:     '2023-03-31',
    img:      IMAGES.civil,
    desc:     'Cung cấp và thi công hệ thống vách kính nhôm cao cấp cho công trình A70, đảm bảo tính thẩm mỹ, cách nhiệt và an ninh theo yêu cầu Bộ Công an.',
    featured: false,
  },
  // ── SCADA & Tự Động Hóa ───────────────────────────────────────────────
  {
    title:    'Nhà máy Thủy điện Ka Nak – SCADA',
    catSlug:  'scada-tu-dong-hoa',
    location: 'Gia Lai',
    client:   'Ka Nak Hydropower',
    capacity: 'SCADA & Tự động hóa – Chủ đầu tư: Ka Nak Hydropower',
    date:     '2020-12-31',
    img:      IMAGES.scada,
    desc:     'Thi công hệ thống SCADA và tự động hóa nhà máy thủy điện Ka Nak tại Gia Lai, điều khiển toàn bộ quá trình phát điện, giám sát và bảo vệ hệ thống.',
    featured: false,
  },
  {
    title:    'Thủy điện Quảng Trị – SCADA',
    catSlug:  'scada-tu-dong-hoa',
    location: 'Quảng Trị',
    client:   'Quảng Trị Hydropower',
    capacity: 'SCADA & Tự động hóa – Chủ đầu tư: Quảng Trị Hydropower',
    date:     '2021-06-30',
    img:      IMAGES.scada,
    desc:     'Cung cấp và lắp đặt hệ thống SCADA điều khiển nhà máy thủy điện Quảng Trị, tích hợp giám sát từ xa và tối ưu hóa sản lượng phát điện.',
    featured: false,
  },
  // ── Hạ Tầng Giao Thông ────────────────────────────────────────────────
  {
    title:    'Đường Khe Van – Hướng Linh',
    catSlug:  'ha-tang-giao-thong',
    location: 'Quảng Trị',
    client:   'Hướng Linh Wind Power',
    capacity: 'Đường nội bộ – Chủ đầu tư: Hướng Linh Wind Power',
    date:     '2022-09-30',
    img:      IMAGES.road,
    desc:     'Thi công đường nội bộ Khe Van – Hướng Linh phục vụ thi công và vận hành nhà máy điện gió Hướng Linh, đảm bảo kết nối vận chuyển thiết bị cồng kềnh.',
    featured: false,
  },
  // ── CNTT & Data Center ────────────────────────────────────────────────
  {
    title:    'Hệ thống camera & Data Center',
    catSlug:  'cntt-data-center',
    location: 'Đà Nẵng',
    client:   'Doanh nghiệp',
    capacity: 'CNTT & Data Center – Chủ đầu tư: Doanh nghiệp',
    date:     '2024-06-30',
    img:      IMAGES.it,
    desc:     'Tư vấn, cung cấp và thi công hệ thống camera AI giám sát thông minh tích hợp với Data Center, đảm bảo an toàn và hiệu quả quản lý doanh nghiệp.',
    featured: false,
  },
];

// ── Main seed function ─────────────────────────────────────────────────────
async function seed() {
  try {
    console.log('🔌 Kết nối MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối thành công.');

    // Clear existing
    const delCat = await ProjectCategory.deleteMany({});
    const delProj = await Project.deleteMany({});
    console.log(`🧹 Đã xóa ${delCat.deletedCount} danh mục, ${delProj.deletedCount} dự án cũ.`);

    // Insert categories
    const catDocs = await ProjectCategory.insertMany(
      CATEGORIES.map(c => ({
        name: c.name, slug: c.slug, description: c.desc,
        icon: c.icon, color: c.color, order: c.order,
        isActive: true, projectCount: 0
      })) as any
    );
    console.log(`📂 Đã tạo ${catDocs.length} danh mục.`);

    // Build slug → _id map
    const catMap = new Map<string, mongoose.Types.ObjectId>();
    catDocs.forEach(doc => catMap.set(doc.slug, doc._id as mongoose.Types.ObjectId));

    // Insert projects
    const projectDocs = PROJECTS.map(p => ({
      title:          p.title,
      location:       p.location,
      capacity:       p.capacity,
      completionDate: p.date,
      image:          p.img,
      description:    p.desc,
      categoryId:     catMap.get(p.catSlug),
      category:       CATEGORIES.find(c => c.slug === p.catSlug)?.name || '',
      featured:       p.featured,
    }));

    const inserted = await Project.insertMany(projectDocs as any);
    console.log(`📦 Đã tạo ${inserted.length} dự án.`);

    // Update category counts
    for (const catDoc of catDocs) {
      const count = inserted.filter(p => p.categoryId?.toString() === catDoc._id.toString()).length;
      await (ProjectCategory as any).findByIdAndUpdate(catDoc._id, { projectCount: count });
    }
    console.log('✅ Cập nhật số lượng dự án trong danh mục.');

    // Summary
    const featured = inserted.filter(p => p.featured).length;
    console.log('\n📊 Tóm tắt:');
    console.log(`   📂 Danh mục: ${catDocs.length}`);
    console.log(`   📦 Dự án:    ${inserted.length}`);
    console.log(`   ⭐ Nổi bật:  ${featured}`);
    console.log('\n🎉 Seed dự án hoàn tất!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
}

seed();
