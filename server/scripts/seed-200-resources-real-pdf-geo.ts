/**
 * Seed 200 tài liệu kỹ thuật PDF có thật, được tìm từ kết quả Google
 * và kiểm chứng trước khi ghi vào MongoDB.
 *
 * Mục tiêu:
 * - KHÔNG dùng dummy.pdf, sample.pdf hoặc URL PDF giả.
 * - Chỉ nhận URL trỏ trực tiếp tới PDF có chữ ký "%PDF-".
 * - Kiểm tra dung lượng tối thiểu, loại file rỗng/file test, chống trùng URL
 *   và chống trùng nội dung bằng fingerprint SHA-256.
 * - Chỉ lấy tài liệu từ website chính thức của hãng, tổ chức tiêu chuẩn,
 *   cơ quan nhà nước hoặc viện nghiên cứu uy tín.
 * - Tạo nội dung SEO + GEO/AEO: câu trả lời trực tiếp, thực thể, nguồn trích dẫn,
 *   phạm vi áp dụng tại Việt Nam và JSON-LD.
 * - Nếu chưa thu đủ 200 PDF hợp lệ, script DỪNG và KHÔNG ghi dữ liệu rác vào DB.
 *
 * ---------------------------------------------------------------------------
 * CÁCH LẤY KẾT QUẢ GOOGLE
 * ---------------------------------------------------------------------------
 * Script tự chọn một trong ba nhà cung cấp sau:
 *
 * 1) Google Custom Search JSON API (dành cho tài khoản đang có quyền sử dụng)
 *    GOOGLE_CSE_API_KEY=...
 *    GOOGLE_CSE_CX=...
 *
 * 2) Serper.dev - API trả kết quả Google
 *    SERPER_API_KEY=...
 *
 * 3) SerpAPI - Google Search API
 *    SERPAPI_API_KEY=...
 *
 * Có thể chỉ định rõ:
 *    SEARCH_PROVIDER=google-cse | serper | serpapi | auto
 *
 * ---------------------------------------------------------------------------
 * CẤU HÌNH KHUYẾN NGHỊ TRONG .env
 * ---------------------------------------------------------------------------
 * MONGO_URI=mongodb://127.0.0.1:27017/ctc_web_new
 * SERPER_API_KEY=your_key
 * SEARCH_PROVIDER=auto
 * TARGET_RESOURCES=200
 *
 * # false: lưu URL PDF gốc sau khi kiểm chứng; không sao chép file về VPS.
 * # true: tải bản sao PDF về public/uploads/resources/pdfs.
 * # Chỉ bật khi điều khoản sử dụng của nguồn cho phép lưu bản sao.
 * MIRROR_PDFS=false
 *
 * PDF_MIN_KB=25
 * PDF_MAX_MB=30
 * MAX_GOOGLE_QUERIES=95
 * FETCH_TIMEOUT_MS=25000
 * RESET_SEEDED_RESOURCES=false
 * DRY_RUN=false
 * SITE_ORIGIN=https://ctcdn.vn
 *
 * ---------------------------------------------------------------------------
 * LỆNH CHẠY
 * ---------------------------------------------------------------------------
 * npx tsx server/scripts/seed-200-resources.ts
 *
 * Docker VPS:
 * docker compose exec app npx tsx server/scripts/seed-200-resources.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { once } from 'node:events';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DocumentCategory, Resource } from '../../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// -----------------------------------------------------------------------------
// Cấu hình chung
// -----------------------------------------------------------------------------

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';
const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://ctcdn.vn').replace(/\/$/, '');
const TARGET_RESOURCES = Number(process.env.TARGET_RESOURCES || 200);
const PDF_MIN_BYTES = Number(process.env.PDF_MIN_KB || 25) * 1024;
const PDF_MAX_BYTES = Number(process.env.PDF_MAX_MB || 30) * 1024 * 1024;
const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 25_000);
const MAX_GOOGLE_QUERIES = Number(process.env.MAX_GOOGLE_QUERIES || 95);
const RESULTS_PER_QUERY = 10;
const MAX_PAGES_PER_PROFILE = 2;
const MIRROR_PDFS = String(process.env.MIRROR_PDFS || 'false').toLowerCase() === 'true';
const RESET_SEEDED_RESOURCES = String(process.env.RESET_SEEDED_RESOURCES || 'false').toLowerCase() === 'true';
const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
const SEED_KEY = 'seed-200-real-google-pdfs-geo-v2';

const PDF_STORAGE_DIR = path.resolve(__dirname, '../../public/uploads/resources/pdfs');
const PDF_PUBLIC_PREFIX = '/uploads/resources/pdfs';
const CACHE_DIR = path.resolve(__dirname, '../.cache/seed-200-resources');
const SEARCH_CACHE_FILE = path.join(CACHE_DIR, 'google-search-cache.json');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36 CTC-PDF-Validator/2.0';

const BLOCKED_FILE_NAMES = [
  'dummy.pdf',
  'sample.pdf',
  'blank.pdf',
  'empty.pdf',
  'test.pdf',
  'example.pdf',
  'testfile.pdf',
];

// -----------------------------------------------------------------------------
// Kiểu dữ liệu
// -----------------------------------------------------------------------------

type SearchProviderName = 'google-cse' | 'serper' | 'serpapi';

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  quota: number;
  focusKeyword: string;
};

type SearchProfile = {
  categorySlug: string;
  query: string;
  domain: string;
  publisher: string;
  topic: string;
  tags: string[];
  maxPages?: number;
};

type SearchResult = {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
  mime?: string;
};

type PdfProbe = {
  requestedUrl: string;
  finalUrl: string;
  contentType: string;
  sizeBytes: number | null;
  prefixHash: string;
  etag?: string;
  lastModified?: string;
};

type PdfAsset = PdfProbe & {
  fileUrl: string;
  localPath?: string;
  sha256: string;
  mirrored: boolean;
};

type ValidatedCandidate = {
  search: SearchResult;
  profile: SearchProfile;
  asset: PdfAsset;
};

type Province = {
  name: string;
  type: 'Thành phố' | 'Tỉnh';
  region: 'Miền Bắc' | 'Miền Trung' | 'Tây Nguyên' | 'Miền Nam';
};

// -----------------------------------------------------------------------------
// 6 danh mục tài liệu
// Tổng quota phải bằng TARGET_RESOURCES mặc định 200.
// -----------------------------------------------------------------------------

const CATEGORIES_DATA: CategorySeed[] = [
  {
    name: 'Catalogue & Datasheet Thiết Bị',
    slug: 'catalogue-datasheet-thiet-bi',
    description:
      'Catalogue và datasheet PDF chính hãng về tấm pin, inverter, lưu trữ năng lượng, thiết bị viễn thông, UPS, tủ nguồn và thiết bị điện.',
    icon: 'FileText',
    color: '#0ea5e9',
    order: 1,
    quota: 60,
    focusKeyword: 'catalogue datasheet thiết bị kỹ thuật',
  },
  {
    name: 'Bản Vẽ Kỹ Thuật & Sơ Đồ Nguyên Lý',
    slug: 'ban-ve-ky-thuat-so-do-nguyen-ly',
    description:
      'Tài liệu thiết kế, sơ đồ nguyên lý, hướng dẫn lựa chọn cấu hình và kiến trúc tham khảo cho Solar, trạm điện, viễn thông và Data Center.',
    icon: 'DraftingCompass',
    color: '#8b5cf6',
    order: 2,
    quota: 25,
    focusKeyword: 'bản vẽ kỹ thuật sơ đồ nguyên lý',
  },
  {
    name: 'Hướng Dẫn Vận Hành & Bảo Trì O&M',
    slug: 'huong-dan-van-hanh-bao-tri-om',
    description:
      'Manual lắp đặt, hướng dẫn vận hành, bảo trì và xử lý sự cố cho hệ thống điện mặt trời, trạm điện, pin lưu trữ, mạng viễn thông và Data Center.',
    icon: 'Wrench',
    color: '#10b981',
    order: 3,
    quota: 40,
    focusKeyword: 'hướng dẫn vận hành bảo trì O&M',
  },
  {
    name: 'Hồ Sơ Kỹ Thuật, Pháp Lý & Báo Cáo Ngành',
    slug: 'ho-so-ky-thuat-phap-ly-bao-cao-nganh',
    description:
      'Quy định, hướng dẫn đấu nối, báo cáo kỹ thuật và tài liệu ngành từ cơ quan quản lý, viện nghiên cứu và tổ chức năng lượng uy tín.',
    icon: 'Landmark',
    color: '#f59e0b',
    order: 4,
    quota: 25,
    focusKeyword: 'hồ sơ kỹ thuật pháp lý năng lượng',
  },
  {
    name: 'Chứng Nhận, Tiêu Chuẩn & Tuyên Bố Phù Hợp',
    slug: 'chung-nhan-tieu-chuan-tuyen-bo-phu-hop',
    description:
      'Chứng nhận sản phẩm, tuyên bố phù hợp, tài liệu IEC, ISO, UL, TÜV và các hướng dẫn đánh giá chất lượng từ nguồn chính thức.',
    icon: 'BadgeCheck',
    color: '#ef4444',
    order: 5,
    quota: 25,
    focusKeyword: 'chứng nhận tiêu chuẩn thiết bị',
  },
  {
    name: 'SCADA, IoT & Phần Mềm Giám Sát',
    slug: 'scada-iot-phan-mem-giam-sat',
    description:
      'Manual và tài liệu kiến trúc SCADA, IoT công nghiệp, giám sát năng lượng, quản trị mạng, an toàn hệ thống điều khiển và nền tảng vận hành số.',
    icon: 'MonitorCog',
    color: '#06b6d4',
    order: 6,
    quota: 25,
    focusKeyword: 'SCADA IoT phần mềm giám sát',
  },
];

// -----------------------------------------------------------------------------
// 34 tỉnh/thành hiện hành để mô tả phạm vi ứng dụng tại Việt Nam.
// Đây là "phạm vi áp dụng", KHÔNG phải địa điểm phát hành tài liệu hoặc dự án CTC.
// -----------------------------------------------------------------------------

const VIETNAM_PROVINCES: Province[] = [
  { name: 'Hà Nội', type: 'Thành phố', region: 'Miền Bắc' },
  { name: 'Hải Phòng', type: 'Thành phố', region: 'Miền Bắc' },
  { name: 'Huế', type: 'Thành phố', region: 'Miền Trung' },
  { name: 'Đà Nẵng', type: 'Thành phố', region: 'Miền Trung' },
  { name: 'Thành phố Hồ Chí Minh', type: 'Thành phố', region: 'Miền Nam' },
  { name: 'Cần Thơ', type: 'Thành phố', region: 'Miền Nam' },
  { name: 'Lai Châu', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Điện Biên', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Sơn La', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Lạng Sơn', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Cao Bằng', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Tuyên Quang', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Lào Cai', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Thái Nguyên', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Phú Thọ', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Bắc Ninh', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Hưng Yên', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Ninh Bình', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Quảng Ninh', type: 'Tỉnh', region: 'Miền Bắc' },
  { name: 'Thanh Hóa', type: 'Tỉnh', region: 'Miền Trung' },
  { name: 'Nghệ An', type: 'Tỉnh', region: 'Miền Trung' },
  { name: 'Hà Tĩnh', type: 'Tỉnh', region: 'Miền Trung' },
  { name: 'Quảng Trị', type: 'Tỉnh', region: 'Miền Trung' },
  { name: 'Quảng Ngãi', type: 'Tỉnh', region: 'Miền Trung' },
  { name: 'Gia Lai', type: 'Tỉnh', region: 'Tây Nguyên' },
  { name: 'Đắk Lắk', type: 'Tỉnh', region: 'Tây Nguyên' },
  { name: 'Khánh Hòa', type: 'Tỉnh', region: 'Miền Trung' },
  { name: 'Lâm Đồng', type: 'Tỉnh', region: 'Tây Nguyên' },
  { name: 'Đồng Nai', type: 'Tỉnh', region: 'Miền Nam' },
  { name: 'Tây Ninh', type: 'Tỉnh', region: 'Miền Nam' },
  { name: 'Vĩnh Long', type: 'Tỉnh', region: 'Miền Nam' },
  { name: 'Đồng Tháp', type: 'Tỉnh', region: 'Miền Nam' },
  { name: 'Cà Mau', type: 'Tỉnh', region: 'Miền Nam' },
  { name: 'An Giang', type: 'Tỉnh', region: 'Miền Nam' },
];

// -----------------------------------------------------------------------------
// Hồ sơ tìm kiếm: chỉ dùng tên miền chính thức.
// Mỗi truy vấn đều được bổ sung filetype:pdf và site:<domain> khi tìm trên Google.
// -----------------------------------------------------------------------------

const profile = (
  categorySlug: string,
  domain: string,
  publisher: string,
  query: string,
  topic: string,
  tags: string[],
  maxPages = MAX_PAGES_PER_PROFILE,
): SearchProfile => ({ categorySlug, domain, publisher, query, topic, tags, maxPages });

const SEARCH_PROFILES: SearchProfile[] = [
  // 1) Catalogue & Datasheet thiết bị
  profile('catalogue-datasheet-thiet-bi', 'longi.com', 'LONGi', 'Hi-MO solar module datasheet', 'tấm pin quang điện', ['Solar', 'PV module', 'LONGi']),
  profile('catalogue-datasheet-thiet-bi', 'jinkosolar.com', 'JinkoSolar', 'Tiger Neo module datasheet', 'tấm pin TOPCon', ['Solar', 'TOPCon', 'JinkoSolar']),
  profile('catalogue-datasheet-thiet-bi', 'trinasolar.com', 'Trina Solar', 'Vertex N module datasheet', 'tấm pin công suất cao', ['Solar', 'Vertex N', 'Trina Solar']),
  profile('catalogue-datasheet-thiet-bi', 'canadiansolar.com', 'Canadian Solar', 'HiKu TOPHiKu module datasheet', 'tấm pin quang điện', ['Solar', 'HiKu', 'Canadian Solar']),
  profile('catalogue-datasheet-thiet-bi', 'jasolar.com', 'JA Solar', 'DeepBlue solar module datasheet', 'tấm pin quang điện', ['Solar', 'DeepBlue', 'JA Solar']),
  profile('catalogue-datasheet-thiet-bi', 'risenenergy.com', 'Risen Energy', 'solar module Titan datasheet', 'tấm pin quang điện', ['Solar', 'Risen', 'PV module']),
  profile('catalogue-datasheet-thiet-bi', 'chintglobal.com', 'Astronergy / CHINT', 'Astronergy solar module datasheet', 'tấm pin quang điện', ['Solar', 'Astronergy', 'PV module']),
  profile('catalogue-datasheet-thiet-bi', 'firstsolar.com', 'First Solar', 'Series solar module datasheet', 'tấm pin màng mỏng', ['Solar', 'thin film', 'First Solar']),
  profile('catalogue-datasheet-thiet-bi', 'recgroup.com', 'REC Group', 'REC Alpha module datasheet', 'tấm pin quang điện', ['Solar', 'REC Alpha', 'PV module']),
  profile('catalogue-datasheet-thiet-bi', 'qcells.com', 'Qcells', 'Q TRON solar module datasheet', 'tấm pin quang điện', ['Solar', 'Q.TRON', 'PV module']),
  profile('catalogue-datasheet-thiet-bi', 'solar.huawei.com', 'Huawei Digital Power', 'SUN2000 inverter datasheet', 'inverter điện mặt trời', ['Solar', 'Inverter', 'Huawei']),
  profile('catalogue-datasheet-thiet-bi', 'sungrowpower.com', 'Sungrow', 'SG CX inverter datasheet', 'inverter điện mặt trời', ['Solar', 'Inverter', 'Sungrow']),
  profile('catalogue-datasheet-thiet-bi', 'sma.de', 'SMA Solar Technology', 'Sunny Tripower datasheet', 'inverter điện mặt trời', ['Solar', 'Inverter', 'SMA']),
  profile('catalogue-datasheet-thiet-bi', 'fronius.com', 'Fronius', 'Tauro Eco inverter datasheet', 'inverter điện mặt trời', ['Solar', 'Inverter', 'Fronius']),
  profile('catalogue-datasheet-thiet-bi', 'solaredge.com', 'SolarEdge', 'commercial inverter datasheet', 'inverter điện mặt trời', ['Solar', 'Inverter', 'SolarEdge']),
  profile('catalogue-datasheet-thiet-bi', 'goodwe.com', 'GoodWe', 'HT series inverter datasheet', 'inverter điện mặt trời', ['Solar', 'Inverter', 'GoodWe']),
  profile('catalogue-datasheet-thiet-bi', 'growatt.com', 'Growatt', 'MAX series inverter datasheet', 'inverter điện mặt trời', ['Solar', 'Inverter', 'Growatt']),
  profile('catalogue-datasheet-thiet-bi', 'deyeinverter.com', 'Deye', 'three phase inverter datasheet', 'inverter điện mặt trời', ['Solar', 'Inverter', 'Deye']),
  profile('catalogue-datasheet-thiet-bi', 'enphase.com', 'Enphase', 'IQ microinverter datasheet', 'microinverter', ['Solar', 'Microinverter', 'Enphase']),
  profile('catalogue-datasheet-thiet-bi', 'bydbatterybox.com', 'BYD Battery-Box', 'Battery Box datasheet', 'pin lưu trữ năng lượng', ['BESS', 'Battery', 'BYD']),
  profile('catalogue-datasheet-thiet-bi', 'se.com', 'Schneider Electric', 'Galaxy UPS datasheet', 'UPS Data Center', ['UPS', 'Data Center', 'Schneider Electric']),
  profile('catalogue-datasheet-thiet-bi', 'vertiv.com', 'Vertiv', 'Liebert UPS datasheet', 'UPS Data Center', ['UPS', 'Data Center', 'Vertiv']),
  profile('catalogue-datasheet-thiet-bi', 'eaton.com', 'Eaton', 'UPS product datasheet', 'UPS Data Center', ['UPS', 'Data Center', 'Eaton']),
  profile('catalogue-datasheet-thiet-bi', 'deltaelectronics.com', 'Delta Electronics', 'telecom DC power system datasheet', 'tủ nguồn DC viễn thông', ['DC power', 'Telecom', 'Delta']),
  profile('catalogue-datasheet-thiet-bi', 'cisco.com', 'Cisco', 'Catalyst 9300 data sheet', 'switch mạng doanh nghiệp', ['Switch', 'Cisco', 'Network']),
  profile('catalogue-datasheet-thiet-bi', 'mikrotik.com', 'MikroTik', 'CCR router product datasheet', 'router viễn thông', ['Router', 'MikroTik', 'Network']),
  profile('catalogue-datasheet-thiet-bi', 'draytek.com', 'DrayTek', 'Vigor router datasheet', 'router cân bằng tải', ['Router', 'DrayTek', 'Network']),
  profile('catalogue-datasheet-thiet-bi', 'commscope.com', 'CommScope', 'fiber optic cable datasheet', 'cáp quang viễn thông', ['Fiber optic', 'CommScope', 'Telecom']),
  profile('catalogue-datasheet-thiet-bi', 'corning.com', 'Corning', 'fiber optic cable datasheet', 'cáp quang viễn thông', ['Fiber optic', 'Corning', 'Telecom']),
  profile('catalogue-datasheet-thiet-bi', 'dinstar.com', 'Dinstar', 'VoIP gateway datasheet', 'VoIP Gateway', ['VoIP', 'Gateway', 'Dinstar']),
  profile('catalogue-datasheet-thiet-bi', 'ruijienetworks.com', 'Ruijie Networks', 'switch access point datasheet', 'switch và Wi-Fi', ['Switch', 'Wi-Fi', 'Ruijie']),
  profile('catalogue-datasheet-thiet-bi', 'juniper.net', 'Juniper Networks', 'MX router data sheet', 'router mạng lõi', ['Router', 'Juniper', 'Network']),
  profile('catalogue-datasheet-thiet-bi', 'hitachienergy.com', 'Hitachi Energy', 'power transformer product brochure datasheet', 'máy biến áp lực', ['Transformer', 'Substation', 'Hitachi Energy']),
  profile('catalogue-datasheet-thiet-bi', 'siemens-energy.com', 'Siemens Energy', 'substation product brochure datasheet', 'trạm biến áp', ['Substation', 'Power grid', 'Siemens Energy']),
  profile('catalogue-datasheet-thiet-bi', 'gevernova.com', 'GE Vernova', 'wind turbine product brochure datasheet', 'tua-bin điện gió', ['Wind', 'Turbine', 'GE Vernova']),
  profile('catalogue-datasheet-thiet-bi', 'vestas.com', 'Vestas', 'wind turbine product brochure', 'tua-bin điện gió', ['Wind', 'Turbine', 'Vestas']),
  profile('catalogue-datasheet-thiet-bi', 'siemensgamesa.com', 'Siemens Gamesa', 'wind turbine product brochure', 'tua-bin điện gió', ['Wind', 'Turbine', 'Siemens Gamesa']),

  // 2) Bản vẽ, sơ đồ và thiết kế tham khảo
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'se.com', 'Schneider Electric', 'single line diagram solar electrical design guide', 'sơ đồ điện một sợi', ['Single-line diagram', 'Electrical design', 'Solar']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'siemens.com', 'Siemens', 'substation single line diagram application guide', 'thiết kế trạm biến áp', ['Substation', 'Single-line diagram', 'Protection']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'hitachienergy.com', 'Hitachi Energy', 'substation design guide', 'thiết kế trạm biến áp', ['Substation', 'Grid', 'Design']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'gevernova.com', 'GE Vernova', 'protection relay application guide substation', 'bảo vệ rơ-le trạm điện', ['Protection relay', 'Substation', 'Grid']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'abb.com', 'ABB', 'medium voltage switchgear application guide', 'tủ trung thế', ['MV switchgear', 'Electrical design', 'ABB']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'nrel.gov', 'National Renewable Energy Laboratory', 'photovoltaic system design guide drawings', 'thiết kế hệ thống PV', ['Solar', 'Design', 'NREL']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'solar.huawei.com', 'Huawei Digital Power', 'commercial industrial solar solution design guide', 'thiết kế Solar C&I', ['Solar C&I', 'Design', 'Huawei']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'sungrowpower.com', 'Sungrow', 'commercial industrial solar system design guide', 'thiết kế Solar C&I', ['Solar C&I', 'Design', 'Sungrow']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'sma.de', 'SMA Solar Technology', 'PV system planning design guide', 'thiết kế hệ thống PV', ['Solar', 'Design', 'SMA']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'fronius.com', 'Fronius', 'PV system design guide', 'thiết kế hệ thống PV', ['Solar', 'Design', 'Fronius']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'commscope.com', 'CommScope', 'fiber optic network design guide', 'thiết kế mạng cáp quang', ['Fiber optic', 'Network design', 'Telecom']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'corning.com', 'Corning', 'fiber optic network design guide', 'thiết kế mạng cáp quang', ['Fiber optic', 'Network design', 'Corning']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'cisco.com', 'Cisco', 'data center network design guide', 'thiết kế mạng Data Center', ['Data Center', 'Network design', 'Cisco']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'vertiv.com', 'Vertiv', 'data center reference design', 'thiết kế Data Center', ['Data Center', 'Reference design', 'Vertiv']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'se.com', 'Schneider Electric', 'data center reference design', 'thiết kế Data Center', ['Data Center', 'Reference design', 'Schneider Electric']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'energy.gov', 'U.S. Department of Energy', 'battery energy storage system design guide', 'thiết kế hệ thống lưu trữ năng lượng', ['BESS', 'Battery', 'Design']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'vestas.com', 'Vestas', 'wind power plant grid connection guide', 'đấu nối nhà máy điện gió', ['Wind', 'Grid connection', 'Design']),
  profile('ban-ve-ky-thuat-so-do-nguyen-ly', 'siemensgamesa.com', 'Siemens Gamesa', 'wind farm electrical design grid connection', 'thiết kế điện gió', ['Wind', 'Electrical design', 'Grid']),

  // 3) Hướng dẫn vận hành và bảo trì
  profile('huong-dan-van-hanh-bao-tri-om', 'nrel.gov', 'National Renewable Energy Laboratory', 'photovoltaic operations maintenance best practices', 'O&M điện mặt trời', ['Solar', 'O&M', 'NREL']),
  profile('huong-dan-van-hanh-bao-tri-om', 'iea-pvps.org', 'IEA PVPS', 'operation maintenance photovoltaic systems report', 'O&M điện mặt trời', ['Solar', 'O&M', 'IEA PVPS']),
  profile('huong-dan-van-hanh-bao-tri-om', 'solarpowereurope.org', 'SolarPower Europe', 'operation maintenance best practice guidelines', 'O&M điện mặt trời', ['Solar', 'O&M', 'Best practice']),
  profile('huong-dan-van-hanh-bao-tri-om', 'ifc.org', 'International Finance Corporation', 'utility scale solar power plants guide operation maintenance', 'O&M nhà máy Solar', ['Solar farm', 'O&M', 'IFC']),
  profile('huong-dan-van-hanh-bao-tri-om', 'worldbank.org', 'World Bank', 'solar operation maintenance guide', 'O&M điện mặt trời', ['Solar', 'O&M', 'World Bank']),
  profile('huong-dan-van-hanh-bao-tri-om', 'solar.huawei.com', 'Huawei Digital Power', 'SUN2000 user manual installation manual', 'vận hành inverter', ['Solar', 'Manual', 'Huawei']),
  profile('huong-dan-van-hanh-bao-tri-om', 'sungrowpower.com', 'Sungrow', 'inverter user manual installation manual', 'vận hành inverter', ['Solar', 'Manual', 'Sungrow']),
  profile('huong-dan-van-hanh-bao-tri-om', 'sma.de', 'SMA Solar Technology', 'inverter operating manual installation manual', 'vận hành inverter', ['Solar', 'Manual', 'SMA']),
  profile('huong-dan-van-hanh-bao-tri-om', 'fronius.com', 'Fronius', 'inverter operating instructions installation manual', 'vận hành inverter', ['Solar', 'Manual', 'Fronius']),
  profile('huong-dan-van-hanh-bao-tri-om', 'solaredge.com', 'SolarEdge', 'inverter installation guide user manual', 'vận hành inverter', ['Solar', 'Manual', 'SolarEdge']),
  profile('huong-dan-van-hanh-bao-tri-om', 'goodwe.com', 'GoodWe', 'inverter user manual installation guide', 'vận hành inverter', ['Solar', 'Manual', 'GoodWe']),
  profile('huong-dan-van-hanh-bao-tri-om', 'growatt.com', 'Growatt', 'inverter installation manual user guide', 'vận hành inverter', ['Solar', 'Manual', 'Growatt']),
  profile('huong-dan-van-hanh-bao-tri-om', 'deyeinverter.com', 'Deye', 'inverter user manual installation manual', 'vận hành inverter', ['Solar', 'Manual', 'Deye']),
  profile('huong-dan-van-hanh-bao-tri-om', 'enphase.com', 'Enphase', 'microinverter installation manual', 'lắp đặt microinverter', ['Solar', 'Manual', 'Enphase']),
  profile('huong-dan-van-hanh-bao-tri-om', 'se.com', 'Schneider Electric', 'UPS operation maintenance guide manual', 'bảo trì UPS', ['UPS', 'O&M', 'Data Center']),
  profile('huong-dan-van-hanh-bao-tri-om', 'vertiv.com', 'Vertiv', 'Liebert UPS operation maintenance manual', 'bảo trì UPS', ['UPS', 'O&M', 'Vertiv']),
  profile('huong-dan-van-hanh-bao-tri-om', 'cisco.com', 'Cisco', 'hardware installation guide switch router', 'lắp đặt thiết bị mạng', ['Network', 'Installation', 'Cisco']),
  profile('huong-dan-van-hanh-bao-tri-om', 'mikrotik.com', 'MikroTik', 'RouterOS user guide manual', 'vận hành RouterOS', ['RouterOS', 'Manual', 'MikroTik']),
  profile('huong-dan-van-hanh-bao-tri-om', 'draytek.com', 'DrayTek', 'Vigor user guide manual', 'vận hành router', ['Router', 'Manual', 'DrayTek']),
  profile('huong-dan-van-hanh-bao-tri-om', 'commscope.com', 'CommScope', 'fiber optic installation guide', 'lắp đặt cáp quang', ['Fiber optic', 'Installation', 'CommScope']),
  profile('huong-dan-van-hanh-bao-tri-om', 'corning.com', 'Corning', 'fiber optic cable installation guide', 'lắp đặt cáp quang', ['Fiber optic', 'Installation', 'Corning']),
  profile('huong-dan-van-hanh-bao-tri-om', 'hitachienergy.com', 'Hitachi Energy', 'power transformer maintenance guide', 'bảo trì máy biến áp', ['Transformer', 'O&M', 'Substation']),
  profile('huong-dan-van-hanh-bao-tri-om', 'siemens-energy.com', 'Siemens Energy', 'power transformer service maintenance guide', 'bảo trì máy biến áp', ['Transformer', 'O&M', 'Siemens Energy']),
  profile('huong-dan-van-hanh-bao-tri-om', 'energy.gov', 'U.S. Department of Energy', 'battery energy storage safety maintenance guide', 'bảo trì hệ thống lưu trữ', ['BESS', 'Safety', 'O&M']),
  profile('huong-dan-van-hanh-bao-tri-om', 'nrel.gov', 'National Renewable Energy Laboratory', 'lithium ion battery operations maintenance report', 'bảo trì pin Lithium', ['Battery', 'O&M', 'NREL']),
  profile('huong-dan-van-hanh-bao-tri-om', 'gevernova.com', 'GE Vernova', 'wind turbine operation maintenance guide', 'O&M điện gió', ['Wind', 'O&M', 'GE Vernova']),
  profile('huong-dan-van-hanh-bao-tri-om', 'vestas.com', 'Vestas', 'wind turbine service maintenance guide', 'O&M điện gió', ['Wind', 'O&M', 'Vestas']),

  // 4) Hồ sơ kỹ thuật, pháp lý và báo cáo ngành
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'moit.gov.vn', 'Bộ Công Thương Việt Nam', 'điện mặt trời thông tư hướng dẫn kỹ thuật', 'quy định điện mặt trời Việt Nam', ['Pháp lý', 'Solar', 'Việt Nam']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'evn.com.vn', 'Tập đoàn Điện lực Việt Nam', 'đấu nối điện mặt trời tài liệu hướng dẫn', 'đấu nối hệ thống điện', ['EVN', 'Grid connection', 'Solar']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'chinhphu.vn', 'Chính phủ Việt Nam', 'quy hoạch điện VIII quyết định', 'quy hoạch phát triển điện lực', ['Quy hoạch điện', 'Pháp lý', 'Việt Nam']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'nrel.gov', 'National Renewable Energy Laboratory', 'Vietnam renewable energy report', 'năng lượng tái tạo Việt Nam', ['Vietnam', 'Renewable energy', 'Report']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'irena.org', 'International Renewable Energy Agency', 'Vietnam renewable energy report', 'năng lượng tái tạo Việt Nam', ['Vietnam', 'IRENA', 'Report']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'worldbank.org', 'World Bank', 'Vietnam solar power report', 'điện mặt trời Việt Nam', ['Vietnam', 'Solar', 'World Bank']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'ifc.org', 'International Finance Corporation', 'Vietnam rooftop solar guide', 'điện mặt trời mái nhà Việt Nam', ['Vietnam', 'Rooftop solar', 'IFC']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'iea.org', 'International Energy Agency', 'Vietnam energy profile report', 'hệ thống năng lượng Việt Nam', ['Vietnam', 'Energy', 'IEA']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'worldbank.org', 'World Bank', 'Vietnam offshore wind roadmap', 'điện gió ngoài khơi Việt Nam', ['Vietnam', 'Offshore wind', 'World Bank']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'nist.gov', 'National Institute of Standards and Technology', 'data center cybersecurity guide', 'an toàn thông tin Data Center', ['Data Center', 'Cybersecurity', 'NIST']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'cisa.gov', 'Cybersecurity and Infrastructure Security Agency', 'industrial control systems security guide', 'an toàn hệ thống điều khiển', ['ICS', 'Cybersecurity', 'CISA']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'energy.gov', 'U.S. Department of Energy', 'data center energy efficiency guide', 'hiệu quả năng lượng Data Center', ['Data Center', 'Energy efficiency', 'DOE']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'vertiv.com', 'Vertiv', 'data center trends report', 'xu hướng Data Center', ['Data Center', 'Trends', 'Vertiv']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'se.com', 'Schneider Electric', 'data center sustainability report', 'Data Center bền vững', ['Data Center', 'Sustainability', 'Schneider Electric']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'iea-pvps.org', 'IEA PVPS', 'photovoltaic market report', 'báo cáo thị trường điện mặt trời', ['Solar', 'Market report', 'IEA PVPS']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'irena.org', 'International Renewable Energy Agency', 'wind energy technology report', 'báo cáo điện gió', ['Wind', 'IRENA', 'Report']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'irena.org', 'International Renewable Energy Agency', 'battery storage report', 'báo cáo lưu trữ năng lượng', ['BESS', 'IRENA', 'Report']),
  profile('ho-so-ky-thuat-phap-ly-bao-cao-nganh', 'worldbank.org', 'World Bank', 'digital infrastructure data center report', 'hạ tầng số và Data Center', ['Digital infrastructure', 'Data Center', 'Report']),

  // 5) Chứng nhận, tiêu chuẩn và tuyên bố phù hợp
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'longi.com', 'LONGi', 'solar module certificate IEC declaration conformity', 'chứng nhận tấm pin', ['Certificate', 'IEC', 'Solar']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'jinkosolar.com', 'JinkoSolar', 'product certificate IEC module', 'chứng nhận tấm pin', ['Certificate', 'IEC', 'JinkoSolar']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'trinasolar.com', 'Trina Solar', 'product certificate IEC module', 'chứng nhận tấm pin', ['Certificate', 'IEC', 'Trina Solar']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'canadiansolar.com', 'Canadian Solar', 'module certificate IEC declaration', 'chứng nhận tấm pin', ['Certificate', 'IEC', 'Canadian Solar']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'jasolar.com', 'JA Solar', 'module certificate IEC declaration', 'chứng nhận tấm pin', ['Certificate', 'IEC', 'JA Solar']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'risenenergy.com', 'Risen Energy', 'module certificate IEC declaration', 'chứng nhận tấm pin', ['Certificate', 'IEC', 'Risen']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'solar.huawei.com', 'Huawei Digital Power', 'inverter certificate declaration conformity', 'chứng nhận inverter', ['Certificate', 'Inverter', 'Huawei']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'sungrowpower.com', 'Sungrow', 'inverter certificate declaration conformity', 'chứng nhận inverter', ['Certificate', 'Inverter', 'Sungrow']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'sma.de', 'SMA Solar Technology', 'inverter certificate declaration conformity', 'chứng nhận inverter', ['Certificate', 'Inverter', 'SMA']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'fronius.com', 'Fronius', 'inverter certificate declaration conformity', 'chứng nhận inverter', ['Certificate', 'Inverter', 'Fronius']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'solaredge.com', 'SolarEdge', 'inverter certificate declaration conformity', 'chứng nhận inverter', ['Certificate', 'Inverter', 'SolarEdge']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'goodwe.com', 'GoodWe', 'inverter certificate declaration conformity', 'chứng nhận inverter', ['Certificate', 'Inverter', 'GoodWe']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'se.com', 'Schneider Electric', 'ISO certificate declaration conformity', 'chứng nhận hệ thống và thiết bị', ['ISO', 'Certificate', 'Schneider Electric']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'vertiv.com', 'Vertiv', 'ISO certificate declaration conformity', 'chứng nhận hệ thống và thiết bị', ['ISO', 'Certificate', 'Vertiv']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'cisco.com', 'Cisco', 'declaration of conformity certificate', 'tuyên bố phù hợp thiết bị mạng', ['Certificate', 'Network', 'Cisco']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'commscope.com', 'CommScope', 'declaration of conformity certificate', 'tuyên bố phù hợp cáp viễn thông', ['Certificate', 'Telecom', 'CommScope']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'corning.com', 'Corning', 'product certificate declaration conformity fiber', 'chứng nhận cáp quang', ['Certificate', 'Fiber optic', 'Corning']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'iso.org', 'International Organization for Standardization', 'renewable energy standards brochure', 'tiêu chuẩn năng lượng tái tạo', ['ISO', 'Standards', 'Renewable energy']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'iec.ch', 'International Electrotechnical Commission', 'solar photovoltaic standards brochure', 'tiêu chuẩn IEC điện mặt trời', ['IEC', 'Standards', 'Solar']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'ul.com', 'UL Solutions', 'solar inverter certification guide', 'chứng nhận inverter', ['UL', 'Certificate', 'Inverter']),
  profile('chung-nhan-tieu-chuan-tuyen-bo-phu-hop', 'tuv.com', 'TÜV Rheinland', 'solar photovoltaic certification white paper', 'chứng nhận điện mặt trời', ['TÜV', 'Certificate', 'Solar']),

  // 6) SCADA, IoT và phần mềm giám sát
  profile('scada-iot-phan-mem-giam-sat', 'siemens.com', 'Siemens', 'WinCC SCADA system manual', 'SCADA công nghiệp', ['SCADA', 'WinCC', 'Siemens']),
  profile('scada-iot-phan-mem-giam-sat', 'se.com', 'Schneider Electric', 'EcoStruxure SCADA manual', 'SCADA công nghiệp', ['SCADA', 'EcoStruxure', 'Schneider Electric']),
  profile('scada-iot-phan-mem-giam-sat', 'abb.com', 'ABB', 'MicroSCADA user manual', 'SCADA trạm điện', ['SCADA', 'Substation', 'ABB']),
  profile('scada-iot-phan-mem-giam-sat', 'rockwellautomation.com', 'Rockwell Automation', 'FactoryTalk SCADA manual', 'SCADA công nghiệp', ['SCADA', 'FactoryTalk', 'Rockwell']),
  profile('scada-iot-phan-mem-giam-sat', 'honeywell.com', 'Honeywell', 'SCADA user guide industrial', 'SCADA công nghiệp', ['SCADA', 'Industrial IoT', 'Honeywell']),
  profile('scada-iot-phan-mem-giam-sat', 'inductiveautomation.com', 'Inductive Automation', 'Ignition user manual', 'nền tảng SCADA Ignition', ['SCADA', 'Ignition', 'IIoT']),
  profile('scada-iot-phan-mem-giam-sat', 'cisco.com', 'Cisco', 'industrial IoT design guide', 'kiến trúc IoT công nghiệp', ['IIoT', 'Network', 'Cisco']),
  profile('scada-iot-phan-mem-giam-sat', 'huawei.com', 'Huawei', 'eSight user guide', 'giám sát hạ tầng mạng', ['Monitoring', 'eSight', 'Huawei']),
  profile('scada-iot-phan-mem-giam-sat', 'solar.huawei.com', 'Huawei Digital Power', 'FusionSolar management system user manual', 'giám sát điện mặt trời', ['Solar monitoring', 'FusionSolar', 'Huawei']),
  profile('scada-iot-phan-mem-giam-sat', 'sungrowpower.com', 'Sungrow', 'iSolarCloud user manual', 'giám sát điện mặt trời', ['Solar monitoring', 'iSolarCloud', 'Sungrow']),
  profile('scada-iot-phan-mem-giam-sat', 'sma.de', 'SMA Solar Technology', 'Sunny Portal manual', 'giám sát điện mặt trời', ['Solar monitoring', 'Sunny Portal', 'SMA']),
  profile('scada-iot-phan-mem-giam-sat', 'fronius.com', 'Fronius', 'Solar web monitoring manual', 'giám sát điện mặt trời', ['Solar monitoring', 'Solar.web', 'Fronius']),
  profile('scada-iot-phan-mem-giam-sat', 'solaredge.com', 'SolarEdge', 'monitoring platform user guide', 'giám sát điện mặt trời', ['Solar monitoring', 'SolarEdge', 'Platform']),
  profile('scada-iot-phan-mem-giam-sat', 'goodwe.com', 'GoodWe', 'SEMS portal user manual', 'giám sát điện mặt trời', ['Solar monitoring', 'SEMS', 'GoodWe']),
  profile('scada-iot-phan-mem-giam-sat', 'growatt.com', 'Growatt', 'ShineServer user manual', 'giám sát điện mặt trời', ['Solar monitoring', 'ShineServer', 'Growatt']),
  profile('scada-iot-phan-mem-giam-sat', 'mikrotik.com', 'MikroTik', 'RouterOS monitoring management manual', 'quản trị giám sát mạng', ['RouterOS', 'Monitoring', 'MikroTik']),
  profile('scada-iot-phan-mem-giam-sat', 'draytek.com', 'DrayTek', 'central management user guide', 'quản trị tập trung mạng', ['Network management', 'DrayTek', 'Monitoring']),
  profile('scada-iot-phan-mem-giam-sat', 'nist.gov', 'National Institute of Standards and Technology', 'industrial control systems security guide', 'an toàn SCADA và ICS', ['SCADA', 'ICS', 'Cybersecurity']),
  profile('scada-iot-phan-mem-giam-sat', 'cisa.gov', 'Cybersecurity and Infrastructure Security Agency', 'SCADA cybersecurity guide', 'an toàn SCADA', ['SCADA', 'Cybersecurity', 'CISA']),
  profile('scada-iot-phan-mem-giam-sat', 'hitachienergy.com', 'Hitachi Energy', 'SCADA energy management system brochure manual', 'SCADA hệ thống điện', ['SCADA', 'EMS', 'Power grid']),
];

// -----------------------------------------------------------------------------
// Tiện ích chuỗi, URL và kích thước file
// -----------------------------------------------------------------------------

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 150);
}

function cleanSearchTitle(input: string): string {
  return input
    .replace(/^\s*\[?pdf\]?\s*[-–—|:]?\s*/i, '')
    .replace(/\s*[-–—|:]?\s*pdf\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return `${input.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function humanFileSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return 'Đã xác thực';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index >= 2 ? 2 : 0)} ${units[index]}`;
}

function normalizedUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.hash = '';
  const trackingParams = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
  ];
  trackingParams.forEach((key) => url.searchParams.delete(key));
  return url.toString();
}

function hostMatchesDomain(urlValue: string, officialDomain: string): boolean {
  try {
    const host = new URL(urlValue).hostname.toLowerCase().replace(/^www\./, '');
    const domain = officialDomain.toLowerCase().replace(/^www\./, '');
    return host === domain || host.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}

function isBlockedTestPdf(urlValue: string): boolean {
  try {
    const pathname = decodeURIComponent(new URL(urlValue).pathname).toLowerCase();
    return BLOCKED_FILE_NAMES.some((name) => pathname.endsWith(`/${name}`) || pathname === name);
  } catch {
    return true;
  }
}

function stableNumber(input: string): number {
  const hash = crypto.createHash('sha256').update(input).digest();
  return hash.readUInt32BE(0);
}

function pickServiceAreas(seed: string, count = 3): Province[] {
  const start = stableNumber(seed) % VIETNAM_PROVINCES.length;
  const step = 7;
  const output: Province[] = [];
  for (let i = 0; output.length < count && i < VIETNAM_PROVINCES.length * 2; i += 1) {
    const province = VIETNAM_PROVINCES[(start + i * step) % VIETNAM_PROVINCES.length];
    if (!output.some((item) => item.name === province.name)) output.push(province);
  }
  return output;
}

function localApplicationNote(profileValue: SearchProfile, areas: Province[]): string {
  const names = areas.map((item) => item.name).join(', ');
  const topic = profileValue.topic.toLowerCase();

  if (/solar|điện mặt trời|inverter|pv|pin lưu trữ|bess/i.test(`${profileValue.topic} ${profileValue.tags.join(' ')}`)) {
    return `Khi tham khảo tài liệu cho công trình tại ${names}, cần khảo sát bức xạ, nhiệt độ vận hành, tải trọng mái, gió bão, môi trường muối biển và yêu cầu đấu nối thực tế. Không dùng thông số trong tài liệu để thay thế hồ sơ thiết kế đã được phê duyệt.`;
  }

  if (/viễn thông|router|switch|cáp quang|network|voip|fiber/i.test(`${profileValue.topic} ${profileValue.tags.join(' ')}`)) {
    return `Khi ứng dụng tại ${names}, cần đối chiếu hiện trạng tuyến, khoảng cách truyền dẫn, suy hao quang, nguồn dự phòng, tiếp địa, điều kiện ngoài trời và tiêu chuẩn của nhà mạng hoặc chủ đầu tư.`;
  }

  if (/trạm|substation|transformer|switchgear|grid|điện gió|wind/i.test(`${profileValue.topic} ${profileValue.tags.join(' ')}`)) {
    return `Đối với công trình tại ${names}, thông số lựa chọn thiết bị phải được kiểm tra cùng cấp điện áp, công suất ngắn mạch, sơ đồ bảo vệ, điều kiện khí hậu, khoảng cách an toàn và yêu cầu của đơn vị quản lý lưới điện.`;
  }

  if (/data center|ups|scada|iot|monitoring|cyber/i.test(`${profileValue.topic} ${profileValue.tags.join(' ')}`)) {
    return `Khi triển khai tại ${names}, cần đánh giá dự phòng nguồn, làm mát, an toàn thông tin, phân vùng mạng, giám sát tập trung, khả năng mở rộng và quy trình vận hành liên tục của hệ thống.`;
  }

  return `Tài liệu có thể dùng làm nguồn tham khảo ban đầu cho nhu cầu tại ${names}. Trước khi áp dụng, kỹ sư phải đối chiếu phiên bản sản phẩm, tiêu chuẩn Việt Nam, điều kiện hiện trường và yêu cầu cụ thể của chủ đầu tư.`;
}

// -----------------------------------------------------------------------------
// Chọn nhà cung cấp kết quả Google
// -----------------------------------------------------------------------------

function resolveSearchProvider(): SearchProviderName {
  const preferred = String(process.env.SEARCH_PROVIDER || 'auto').toLowerCase();

  if (preferred !== 'auto') {
    if (preferred === 'google-cse' && process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_CX) return 'google-cse';
    if (preferred === 'serper' && process.env.SERPER_API_KEY) return 'serper';
    if (preferred === 'serpapi' && process.env.SERPAPI_API_KEY) return 'serpapi';
    throw new Error(`SEARCH_PROVIDER=${preferred} nhưng chưa khai báo đủ API key tương ứng.`);
  }

  if (process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_CX) return 'google-cse';
  if (process.env.SERPER_API_KEY) return 'serper';
  if (process.env.SERPAPI_API_KEY) return 'serpapi';

  throw new Error(
    [
      'Chưa có API để lấy kết quả Google.',
      'Hãy khai báo một trong các cấu hình sau trong .env:',
      '- GOOGLE_CSE_API_KEY và GOOGLE_CSE_CX',
      '- SERPER_API_KEY',
      '- SERPAPI_API_KEY',
      'Script không tự chèn dummy.pdf hoặc dữ liệu giả để bù số lượng.',
    ].join('\n'),
  );
}

let searchApiCalls = 0;
let searchCache: Record<string, SearchResult[]> = {};

async function loadSearchCache(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  try {
    const content = await fs.readFile(SEARCH_CACHE_FILE, 'utf8');
    searchCache = JSON.parse(content) as Record<string, SearchResult[]>;
  } catch {
    searchCache = {};
  }
}

async function saveSearchCache(): Promise<void> {
  await fs.writeFile(SEARCH_CACHE_FILE, JSON.stringify(searchCache, null, 2), 'utf8');
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept: 'application/pdf,application/json,text/html;q=0.8,*/*;q=0.5',
        ...(init.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function googleCseSearch(query: string, start: number): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY as string;
  const cx = process.env.GOOGLE_CSE_CX as string;
  const url = new URL('https://customsearch.googleapis.com/customsearch/v1');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', query);
  url.searchParams.set('num', String(RESULTS_PER_QUERY));
  url.searchParams.set('start', String(start));
  url.searchParams.set('fileType', 'pdf');
  url.searchParams.set('safe', 'active');
  url.searchParams.set('hl', 'vi');
  url.searchParams.set('gl', 'vn');

  const response = await fetchWithTimeout(url.toString(), { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Google CSE HTTP ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as {
    items?: Array<{ title?: string; link?: string; snippet?: string; displayLink?: string; mime?: string }>;
  };

  return (data.items || [])
    .filter((item) => item.link)
    .map((item) => ({
      title: item.title || 'Tài liệu kỹ thuật PDF',
      link: item.link as string,
      snippet: item.snippet || '',
      displayLink: item.displayLink,
      mime: item.mime,
    }));
}

async function serperSearch(query: string, start: number): Promise<SearchResult[]> {
  const page = Math.floor((start - 1) / RESULTS_PER_QUERY) + 1;
  const response = await fetchWithTimeout('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY as string,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ q: query, gl: 'vn', hl: 'vi', num: RESULTS_PER_QUERY, page }),
  });

  if (!response.ok) throw new Error(`Serper HTTP ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as {
    organic?: Array<{ title?: string; link?: string; snippet?: string }>;
  };

  return (data.organic || [])
    .filter((item) => item.link)
    .map((item) => ({
      title: item.title || 'Tài liệu kỹ thuật PDF',
      link: item.link as string,
      snippet: item.snippet || '',
    }));
}

async function serpApiSearch(query: string, start: number): Promise<SearchResult[]> {
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('api_key', process.env.SERPAPI_API_KEY as string);
  url.searchParams.set('q', query);
  url.searchParams.set('num', String(RESULTS_PER_QUERY));
  url.searchParams.set('start', String(start - 1));
  url.searchParams.set('gl', 'vn');
  url.searchParams.set('hl', 'vi');
  url.searchParams.set('safe', 'active');

  const response = await fetchWithTimeout(url.toString(), { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`SerpAPI HTTP ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as {
    organic_results?: Array<{ title?: string; link?: string; snippet?: string; displayed_link?: string }>;
  };

  return (data.organic_results || [])
    .filter((item) => item.link)
    .map((item) => ({
      title: item.title || 'Tài liệu kỹ thuật PDF',
      link: item.link as string,
      snippet: item.snippet || '',
      displayLink: item.displayed_link,
    }));
}

async function searchGoogle(providerName: SearchProviderName, query: string, start: number): Promise<SearchResult[]> {
  const cacheKey = `${providerName}|${start}|${query}`;
  if (searchCache[cacheKey]) return searchCache[cacheKey];

  if (searchApiCalls >= MAX_GOOGLE_QUERIES) {
    throw new Error(`Đã đạt MAX_GOOGLE_QUERIES=${MAX_GOOGLE_QUERIES}. Không tiếp tục tạo dữ liệu chưa kiểm chứng.`);
  }

  searchApiCalls += 1;
  let results: SearchResult[];
  if (providerName === 'google-cse') results = await googleCseSearch(query, start);
  else if (providerName === 'serper') results = await serperSearch(query, start);
  else results = await serpApiSearch(query, start);

  searchCache[cacheKey] = results;
  await saveSearchCache();
  return results;
}

// -----------------------------------------------------------------------------
// Kiểm chứng PDF thật
// -----------------------------------------------------------------------------

async function readResponsePrefix(response: Response, maxBytes = 64 * 1024): Promise<Buffer> {
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;

  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      const chunk = Buffer.from(value);
      const remaining = maxBytes - total;
      chunks.push(chunk.length > remaining ? chunk.subarray(0, remaining) : chunk);
      total += Math.min(chunk.length, remaining);
      if (total >= maxBytes) break;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  return Buffer.concat(chunks);
}

function parseTotalSize(response: Response): number | null {
  const contentRange = response.headers.get('content-range');
  if (contentRange) {
    const match = contentRange.match(/\/(\d+)$/);
    if (match) return Number(match[1]);
  }
  const contentLength = response.headers.get('content-length');
  if (contentLength && /^\d+$/.test(contentLength)) return Number(contentLength);
  return null;
}

function hasPdfMagic(buffer: Buffer): boolean {
  const searchable = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('latin1');
  return searchable.includes('%PDF-');
}

async function probePdf(urlValue: string, officialDomain: string): Promise<PdfProbe> {
  if (!hostMatchesDomain(urlValue, officialDomain)) {
    throw new Error(`Tên miền không khớp nguồn chính thức: ${officialDomain}`);
  }
  if (isBlockedTestPdf(urlValue)) throw new Error('File nằm trong danh sách PDF test/dummy bị chặn.');

  const response = await fetchWithTimeout(urlValue, {
    method: 'GET',
    headers: { range: 'bytes=0-65535' },
  });

  if (!response.ok && response.status !== 206) {
    throw new Error(`HTTP ${response.status}`);
  }

  const prefix = await readResponsePrefix(response, 64 * 1024);
  if (!hasPdfMagic(prefix)) throw new Error('Không tìm thấy chữ ký %PDF trong phần đầu file.');

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const sizeBytes = parseTotalSize(response);

  if (sizeBytes !== null && sizeBytes < PDF_MIN_BYTES) {
    throw new Error(`PDF quá nhỏ (${humanFileSize(sizeBytes)}), có nguy cơ là file rỗng/test.`);
  }
  if (sizeBytes !== null && sizeBytes > PDF_MAX_BYTES) {
    throw new Error(`PDF vượt giới hạn ${humanFileSize(PDF_MAX_BYTES)}.`);
  }
  if (prefix.length < Math.min(PDF_MIN_BYTES, 64 * 1024) && sizeBytes === null) {
    throw new Error('Không xác định được dung lượng và dữ liệu đọc được quá nhỏ.');
  }

  return {
    requestedUrl: normalizedUrl(urlValue),
    finalUrl: normalizedUrl(response.url || urlValue),
    contentType: contentType || 'application/pdf',
    sizeBytes,
    prefixHash: crypto.createHash('sha256').update(prefix).digest('hex'),
    etag: response.headers.get('etag') || undefined,
    lastModified: response.headers.get('last-modified') || undefined,
  };
}

async function downloadAndVerifyPdf(probe: PdfProbe, slug: string): Promise<PdfAsset> {
  await fs.mkdir(PDF_STORAGE_DIR, { recursive: true });

  const tempName = `${slug}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.tmp`;
  const tempPath = path.join(PDF_STORAGE_DIR, tempName);
  const hash = crypto.createHash('sha256');
  const response = await fetchWithTimeout(probe.finalUrl, { method: 'GET' }, Math.max(FETCH_TIMEOUT_MS, 60_000));

  if (!response.ok || !response.body) throw new Error(`Không tải được PDF: HTTP ${response.status}`);

  const writer = createWriteStream(tempPath);
  const reader = response.body.getReader();
  let total = 0;
  let firstBytes = Buffer.alloc(0);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      const chunk = Buffer.from(value);
      if (firstBytes.length < 1024) {
        firstBytes = Buffer.concat([firstBytes, chunk]).subarray(0, 1024);
      }

      total += chunk.length;
      if (total > PDF_MAX_BYTES) throw new Error(`PDF vượt giới hạn ${humanFileSize(PDF_MAX_BYTES)}.`);
      hash.update(chunk);
      if (!writer.write(chunk)) await once(writer, 'drain');
    }
    writer.end();
    await once(writer, 'finish');
  } catch (error) {
    writer.destroy();
    await fs.unlink(tempPath).catch(() => undefined);
    throw error;
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  if (total < PDF_MIN_BYTES || !hasPdfMagic(firstBytes)) {
    await fs.unlink(tempPath).catch(() => undefined);
    throw new Error(`File tải về không đạt chuẩn PDF hoặc quá nhỏ: ${humanFileSize(total)}.`);
  }

  const sha256 = hash.digest('hex');
  const finalName = `${slug}-${sha256.slice(0, 12)}.pdf`;
  const finalPath = path.join(PDF_STORAGE_DIR, finalName);

  try {
    await fs.access(finalPath);
    await fs.unlink(tempPath).catch(() => undefined);
  } catch {
    await fs.rename(tempPath, finalPath);
  }

  return {
    ...probe,
    sizeBytes: total,
    sha256,
    mirrored: true,
    localPath: finalPath,
    fileUrl: `${PDF_PUBLIC_PREFIX}/${finalName}`,
  };
}

async function createPdfAsset(probe: PdfProbe, slug: string): Promise<PdfAsset> {
  if (MIRROR_PDFS) return downloadAndVerifyPdf(probe, slug);

  return {
    ...probe,
    sha256: crypto
      .createHash('sha256')
      .update(`${probe.prefixHash}|${probe.sizeBytes ?? 'unknown'}|${probe.finalUrl}`)
      .digest('hex'),
    mirrored: false,
    fileUrl: probe.finalUrl,
  };
}

// -----------------------------------------------------------------------------
// Nội dung SEO + GEO/AEO
// -----------------------------------------------------------------------------

function buildSeoDescription(title: string, publisher: string, topic: string): string {
  const value = `Tải và tra cứu ${title}, tài liệu PDF chính thức từ ${publisher} về ${topic}. URL đã được CTC kiểm tra định dạng và khả năng truy cập.`;
  return truncate(value, 158);
}

function buildResourceDocument(candidate: ValidatedCandidate, categoryId: mongoose.Types.ObjectId, index: number) {
  const { search, profile: profileValue, asset } = candidate;
  const cleanedTitle = cleanSearchTitle(search.title) || `Tài liệu ${profileValue.topic} từ ${profileValue.publisher}`;
  const slugBase = slugify(`${cleanedTitle}-${profileValue.publisher}`);
  const slug = `${slugBase}-${asset.sha256.slice(0, 8)}`;
  const canonicalPath = `/tai-lieu/${slug}`;
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;
  const serviceAreas = pickServiceAreas(`${slug}-${index}`, 3);
  const localNote = localApplicationNote(profileValue, serviceAreas);
  const fileSizeText = humanFileSize(asset.sizeBytes);
  const metaTitle = truncate(`${cleanedTitle} | Tài liệu PDF CTC`, 60);
  const metaDescription = buildSeoDescription(cleanedTitle, profileValue.publisher, profileValue.topic);
  const answerFirst = `${cleanedTitle} là tài liệu PDF do ${profileValue.publisher} công bố, phục vụ tra cứu về ${profileValue.topic}. CTC đã kiểm tra URL, chữ ký định dạng PDF và dung lượng tối thiểu trước khi đưa vào thư viện.`;
  const sourceSnippet = truncate(search.snippet.replace(/\s+/g, ' ').trim(), 500);
  const areaNames = serviceAreas.map((item) => item.name);
  const now = new Date();

  const content = [
    `## Trả lời nhanh`,
    answerFirst,
    ``,
    `## Nội dung tài liệu`,
    sourceSnippet || `Tài liệu kỹ thuật chính thức liên quan đến ${profileValue.topic}. Vui lòng mở file PDF để xem đầy đủ phiên bản, bảng thông số, sơ đồ và lưu ý của nhà phát hành.`,
    ``,
    `## Nguồn và tình trạng kiểm chứng`,
    `- Nhà phát hành: **${profileValue.publisher}**.`,
    `- Tên miền nguồn: **${profileValue.domain}**.`,
    `- Định dạng: **PDF đã kiểm tra chữ ký %PDF**.`,
    `- Dung lượng: **${fileSizeText}**.`,
    `- Hình thức lưu trữ: **${asset.mirrored ? 'Bản sao trên máy chủ CTC' : 'Liên kết trực tiếp tới PDF gốc'}**.`,
    `- Ngày kiểm tra: **${now.toISOString().slice(0, 10)}**.`,
    ``,
    `## Phạm vi tham khảo tại Việt Nam`,
    localNote,
    ``,
    `## Lưu ý kỹ thuật`,
    `Tài liệu này là nguồn tham khảo từ bên phát hành. CTC không tự thay đổi thông số trong file. Trước khi mua sắm, thiết kế hoặc thi công, cần đối chiếu mã sản phẩm, phiên bản tài liệu, tiêu chuẩn áp dụng và điều kiện hiện trường.`,
  ].join('\n');

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${canonicalUrl}#article`,
        headline: cleanedTitle,
        description: metaDescription,
        inLanguage: 'vi-VN',
        mainEntityOfPage: canonicalUrl,
        dateModified: now.toISOString(),
        author: {
          '@type': 'Organization',
          '@id': `${SITE_ORIGIN}/#organization`,
          name: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung',
          alternateName: 'CTC',
          url: SITE_ORIGIN,
        },
        publisher: {
          '@type': 'Organization',
          name: profileValue.publisher,
          url: `https://${profileValue.domain}`,
        },
        about: profileValue.tags.map((name) => ({ '@type': 'Thing', name })),
        spatialCoverage: {
          '@type': 'Country',
          name: 'Việt Nam',
        },
        associatedMedia: {
          '@type': 'DigitalDocument',
          '@id': `${canonicalUrl}#pdf`,
          name: cleanedTitle,
          encodingFormat: 'application/pdf',
          contentUrl: asset.fileUrl.startsWith('http') ? asset.fileUrl : `${SITE_ORIGIN}${asset.fileUrl}`,
          url: asset.finalUrl,
          isBasedOn: asset.requestedUrl,
        },
      },
      {
        '@type': 'DigitalDocument',
        '@id': `${canonicalUrl}#pdf`,
        name: cleanedTitle,
        encodingFormat: 'application/pdf',
        contentUrl: asset.fileUrl.startsWith('http') ? asset.fileUrl : `${SITE_ORIGIN}${asset.fileUrl}`,
        inLanguage: search.snippet ? 'en' : 'und',
        publisher: {
          '@type': 'Organization',
          name: profileValue.publisher,
        },
      },
    ],
  };

  return {
    seedKey: SEED_KEY,
    sourceType: 'verified-google-pdf',
    title: cleanedTitle,
    name: cleanedTitle,
    slug,
    description: metaDescription,
    summary: answerFirst,
    excerpt: metaDescription,
    content,
    categoryId,
    category: profileValue.categorySlug,
    categorySlug: profileValue.categorySlug,
    tags: Array.from(new Set([...profileValue.tags, profileValue.topic, profileValue.publisher, 'PDF kỹ thuật'])),

    // Các alias phổ biến để tương thích nhiều schema Resource khác nhau.
    fileUrl: asset.fileUrl,
    downloadUrl: asset.fileUrl,
    url: asset.fileUrl,
    originalPdfUrl: asset.finalUrl,
    sourceUrl: asset.requestedUrl,
    fileType: 'PDF',
    mimeType: 'application/pdf',
    fileSize: fileSizeText,
    fileSizeBytes: asset.sizeBytes,
    size: fileSizeText,

    pdf: {
      url: asset.fileUrl,
      originalUrl: asset.finalUrl,
      requestedUrl: asset.requestedUrl,
      mimeType: 'application/pdf',
      sizeBytes: asset.sizeBytes,
      sizeText: fileSizeText,
      sha256: asset.sha256,
      prefixHash: asset.prefixHash,
      mirrored: asset.mirrored,
      verified: true,
      verifiedAt: now,
      etag: asset.etag,
      lastModified: asset.lastModified,
    },

    seo: {
      title: metaTitle,
      metaTitle,
      description: metaDescription,
      metaDescription,
      focusKeyword: profileValue.topic,
      secondaryKeywords: Array.from(new Set([...profileValue.tags, `${profileValue.topic} PDF`, `tài liệu ${profileValue.publisher}`])),
      canonicalPath,
      canonicalUrl,
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: cleanedTitle,
      ogDescription: metaDescription,
      breadcrumb: ['Trang chủ', 'Tài liệu', profileValue.categorySlug, cleanedTitle],
    },

    // GEO ở đây là Generative Engine Optimization + ngữ cảnh địa lý áp dụng.
    geo: {
      answerFirst,
      sourceAuthority: profileValue.publisher,
      sourceDomain: profileValue.domain,
      sourceUrl: asset.requestedUrl,
      originalPdfUrl: asset.finalUrl,
      verifiedAt: now,
      factualBoundary:
        'Phần thông số chi tiết phải được đọc trực tiếp trong PDF gốc; nội dung giới thiệu của CTC không thay thế tài liệu của nhà phát hành.',
      entities: [
        { type: 'Organization', name: profileValue.publisher },
        ...profileValue.tags.map((name) => ({ type: 'Thing', name })),
        { type: 'Country', name: 'Việt Nam' },
      ],
      questionsAnswered: [
        `Tài liệu ${profileValue.topic} này do đơn vị nào phát hành?`,
        `File PDF ${cleanedTitle} có phải là liên kết thật không?`,
        `Tài liệu có thể tham khảo cho công trình tại Việt Nam như thế nào?`,
      ],
      keyFacts: [
        `Nguồn phát hành: ${profileValue.publisher}.`,
        `Tên miền chính thức: ${profileValue.domain}.`,
        `Định dạng đã kiểm chứng: application/pdf và chữ ký %PDF.`,
        `Dung lượng kiểm tra: ${fileSizeText}.`,
      ],
      applicableCountry: 'Việt Nam',
      applicableRegions: areaNames,
      localApplicationNote: localNote,
      citationReady: true,
    },

    provenance: {
      discoveredVia: 'Google Search API',
      searchQuery: `${profileValue.query} filetype:pdf site:${profileValue.domain}`,
      publisher: profileValue.publisher,
      officialDomain: profileValue.domain,
      sourceSnippet,
      accessDate: now,
      checksum: asset.sha256,
    },

    faq: [
      {
        question: `Đây có phải PDF thật từ ${profileValue.publisher} không?`,
        answer: `Có. Script đã kiểm tra tên miền nguồn, phản hồi HTTP, chữ ký %PDF và dung lượng tối thiểu trước khi lưu bản ghi.`,
      },
      {
        question: `Có thể dùng tài liệu này làm hồ sơ thiết kế chính thức không?`,
        answer: `Không nên dùng trực tiếp mà không thẩm tra. Cần đối chiếu mã thiết bị, phiên bản PDF, tiêu chuẩn hiện hành và điều kiện dự án cụ thể.`,
      },
      {
        question: `Tài liệu có áp dụng cho toàn bộ Việt Nam không?`,
        answer: `Tài liệu có giá trị tham khảo kỹ thuật; việc áp dụng tại Việt Nam phải tuân thủ quy chuẩn, tiêu chuẩn, điều kiện khí hậu và yêu cầu của chủ đầu tư hoặc đơn vị quản lý chuyên ngành.`,
      },
    ],

    schemaOrg,
    structuredData: schemaOrg,
    isActive: true,
    isPublished: true,
    status: 'published',
    verified: true,
    featured: index < 12,
    publishedAt: now,
    updatedAt: now,
  };
}

// -----------------------------------------------------------------------------
// Thu thập đủ PDF hợp lệ theo quota từng danh mục
// -----------------------------------------------------------------------------

function categoryCounts(candidates: ValidatedCandidate[]): Record<string, number> {
  return candidates.reduce<Record<string, number>>((acc, item) => {
    acc[item.profile.categorySlug] = (acc[item.profile.categorySlug] || 0) + 1;
    return acc;
  }, {});
}

function quotaFor(categorySlug: string): number {
  return CATEGORIES_DATA.find((item) => item.slug === categorySlug)?.quota || 0;
}

function hasMetAllQuotas(candidates: ValidatedCandidate[]): boolean {
  const counts = categoryCounts(candidates);
  return CATEGORIES_DATA.every((category) => (counts[category.slug] || 0) >= category.quota);
}

async function collectValidatedPdfs(providerName: SearchProviderName): Promise<ValidatedCandidate[]> {
  const accepted: ValidatedCandidate[] = [];
  const seenUrls = new Set<string>();
  const seenFingerprints = new Set<string>();
  const seenHashes = new Set<string>();

  for (let pageIndex = 0; pageIndex < MAX_PAGES_PER_PROFILE; pageIndex += 1) {
    for (const currentProfile of SEARCH_PROFILES) {
      const counts = categoryCounts(accepted);
      if ((counts[currentProfile.categorySlug] || 0) >= quotaFor(currentProfile.categorySlug)) continue;
      if (pageIndex >= (currentProfile.maxPages || MAX_PAGES_PER_PROFILE)) continue;

      const query = `${currentProfile.query} filetype:pdf site:${currentProfile.domain}`;
      const start = pageIndex * RESULTS_PER_QUERY + 1;

      let results: SearchResult[] = [];
      try {
        results = await searchGoogle(providerName, query, start);
      } catch (error) {
        console.warn(`⚠️ Không tìm được [${currentProfile.publisher}] trang ${pageIndex + 1}:`, (error as Error).message);
        continue;
      }

      for (const result of results) {
        const currentCounts = categoryCounts(accepted);
        if ((currentCounts[currentProfile.categorySlug] || 0) >= quotaFor(currentProfile.categorySlug)) break;

        let sourceUrl: string;
        try {
          sourceUrl = normalizedUrl(result.link);
        } catch {
          continue;
        }

        if (seenUrls.has(sourceUrl)) continue;
        seenUrls.add(sourceUrl);

        if (!hostMatchesDomain(sourceUrl, currentProfile.domain)) continue;
        if (isBlockedTestPdf(sourceUrl)) continue;

        try {
          const probe = await probePdf(sourceUrl, currentProfile.domain);
          const fingerprint = `${probe.prefixHash}:${probe.sizeBytes ?? 'unknown'}`;
          if (seenFingerprints.has(fingerprint)) continue;

          const titleForFile = cleanSearchTitle(result.title) || currentProfile.topic;
          const asset = await createPdfAsset(probe, slugify(titleForFile));
          if (seenHashes.has(asset.sha256)) {
            if (asset.localPath) await fs.unlink(asset.localPath).catch(() => undefined);
            continue;
          }

          seenFingerprints.add(fingerprint);
          seenHashes.add(asset.sha256);
          accepted.push({ search: result, profile: currentProfile, asset });

          const updatedCounts = categoryCounts(accepted);
          console.log(
            `✅ ${accepted.length}/${TARGET_RESOURCES} | ${currentProfile.categorySlug}: ` +
              `${updatedCounts[currentProfile.categorySlug]}/${quotaFor(currentProfile.categorySlug)} | ` +
              `${truncate(titleForFile, 74)} | ${humanFileSize(asset.sizeBytes)}`,
          );

          if (hasMetAllQuotas(accepted)) return accepted.slice(0, TARGET_RESOURCES);
        } catch (error) {
          console.warn(`   ↳ Bỏ qua PDF không đạt: ${truncate(result.link, 100)} — ${(error as Error).message}`);
        }
      }
    }
  }

  return accepted;
}

// -----------------------------------------------------------------------------
// Ghi MongoDB bằng collection thô để giữ đầy đủ trường SEO/GEO dù schema hiện tại
// chưa khai báo tất cả field. Không xóa tài liệu nhập thủ công.
// -----------------------------------------------------------------------------

async function upsertCategories(): Promise<Map<string, mongoose.Types.ObjectId>> {
  const categoryMap = new Map<string, mongoose.Types.ObjectId>();
  const now = new Date();

  for (const category of CATEGORIES_DATA) {
    const existing = await DocumentCategory.collection.findOne({ slug: category.slug });
    const categoryId = (existing?._id as mongoose.Types.ObjectId | undefined) || new mongoose.Types.ObjectId();

    await DocumentCategory.collection.updateOne(
      { _id: categoryId },
      {
        $set: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          order: category.order,
          isActive: true,
          focusKeyword: category.focusKeyword,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    categoryMap.set(category.slug, categoryId);
  }

  return categoryMap;
}

async function ensureIndexes(): Promise<void> {
  const indexes = [
    Resource.collection.createIndex({ slug: 1 }, { unique: true, name: 'resource_slug_unique' }),
    Resource.collection.createIndex({ 'pdf.sha256': 1 }, { sparse: true, name: 'resource_pdf_sha256' }),
    Resource.collection.createIndex({ categoryId: 1, isPublished: 1 }, { name: 'resource_category_published' }),
    Resource.collection.createIndex({ title: 'text', description: 'text', content: 'text' }, { name: 'resource_search_text' }),
  ];

  const results = await Promise.allSettled(indexes);
  results.forEach((result) => {
    if (result.status === 'rejected') console.warn('⚠️ Không tạo được một index:', result.reason?.message || result.reason);
  });
}

async function saveResources(candidates: ValidatedCandidate[]): Promise<void> {
  if (candidates.length !== TARGET_RESOURCES || !hasMetAllQuotas(candidates)) {
    const counts = categoryCounts(candidates);
    const detail = CATEGORIES_DATA.map(
      (category) => `- ${category.name}: ${counts[category.slug] || 0}/${category.quota}`,
    ).join('\n');

    throw new Error(
      `Chỉ xác thực được ${candidates.length}/${TARGET_RESOURCES} PDF. Không ghi MongoDB để tránh dữ liệu thiếu hoặc giả.\n${detail}`,
    );
  }

  if (DRY_RUN) {
    console.log('🧪 DRY_RUN=true: đã kiểm tra đủ PDF, bỏ qua bước ghi MongoDB.');
    return;
  }

  const categoryMap = await upsertCategories();
  await ensureIndexes();

  if (RESET_SEEDED_RESOURCES) {
    const result = await Resource.collection.deleteMany({ seedKey: SEED_KEY });
    console.log(`🗑️ Đã xóa ${result.deletedCount} tài liệu cũ của seed ${SEED_KEY}.`);
  }

  const documents = candidates.map((candidate, index) => {
    const categoryId = categoryMap.get(candidate.profile.categorySlug);
    if (!categoryId) throw new Error(`Không tìm thấy categoryId: ${candidate.profile.categorySlug}`);
    return buildResourceDocument(candidate, categoryId, index);
  });

  const operations = documents.map((document) => ({
    updateOne: {
      filter: { 'pdf.sha256': document.pdf.sha256 },
      update: {
        $set: document,
        $setOnInsert: { createdAt: new Date() },
      },
      upsert: true,
    },
  }));

  const result = await Resource.collection.bulkWrite(operations, { ordered: false });
  console.log(
    `💾 MongoDB: upserted=${result.upsertedCount}, modified=${result.modifiedCount}, matched=${result.matchedCount}`,
  );

  const counts = categoryCounts(candidates);
  for (const category of CATEGORIES_DATA) {
    await DocumentCategory.collection.updateOne(
      { slug: category.slug },
      { $set: { resourceCount: counts[category.slug] || 0, updatedAt: new Date() } },
    );
  }
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  const configuredQuota = CATEGORIES_DATA.reduce((sum, item) => sum + item.quota, 0);
  if (configuredQuota !== TARGET_RESOURCES) {
    throw new Error(
      `Tổng quota danh mục là ${configuredQuota}, nhưng TARGET_RESOURCES=${TARGET_RESOURCES}. ` +
        `Hãy điều chỉnh quota để hai giá trị bằng nhau.`,
    );
  }

  const providerName = resolveSearchProvider();
  await loadSearchCache();

  console.log('============================================================');
  console.log('CTC — SEED 200 PDF THẬT CHUẨN SEO + GEO/AEO');
  console.log('============================================================');
  console.log(`Nguồn tìm kiếm       : ${providerName}`);
  console.log(`Số tài liệu mục tiêu : ${TARGET_RESOURCES}`);
  console.log(`PDF tối thiểu        : ${humanFileSize(PDF_MIN_BYTES)}`);
  console.log(`PDF tối đa           : ${humanFileSize(PDF_MAX_BYTES)}`);
  console.log(`Lưu bản sao về VPS   : ${MIRROR_PDFS ? 'Có' : 'Không — dùng URL PDF gốc đã kiểm chứng'}`);
  console.log(`Dry run              : ${DRY_RUN ? 'Có' : 'Không'}`);
  console.log('============================================================');

  const candidates = await collectValidatedPdfs(providerName);

  const counts = categoryCounts(candidates);
  console.log('\nKẾT QUẢ XÁC THỰC:');
  for (const category of CATEGORIES_DATA) {
    console.log(`- ${category.name}: ${counts[category.slug] || 0}/${category.quota}`);
  }
  console.log(`- Tổng cộng: ${candidates.length}/${TARGET_RESOURCES}`);
  console.log(`- Số truy vấn API mới: ${searchApiCalls}/${MAX_GOOGLE_QUERIES}`);

  // Chỉ kết nối MongoDB sau khi đã thu đủ tài liệu hợp lệ.
  if (!DRY_RUN) {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB.');
  }

  await saveResources(candidates);
  console.log('🎉 Hoàn tất seed tài liệu PDF có thật, không sử dụng file dummy.');
}

main()
  .catch((error) => {
    console.error('\n❌ Seed thất bại:');
    console.error(error instanceof Error ? error.stack || error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
