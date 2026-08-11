/**
 * Seed/Crawler V6: mục tiêu 850 sản phẩm thật đang có trên thị trường,
 * chuẩn SEO + GEO/AEO, Category SEO, evidence, datasheet/specification
 * đã xác minh và ảnh đúng model.
 *
 * Điểm chính:
 * - Crawl theo 54 danh mục lá, tổng quota mục tiêu 850; chấp nhận 820–900.
 * - Không tạo biến thể tên hoặc mã giả để ép đủ quota.
 * - Chỉ nhận trang thuộc domain hãng đã khai báo và có model/MPN/SKU thật.
 * - Catalog có cache để tiếp tục lần chạy sau, tránh tốn API và mất kết quả tốt.
 * - Đúng cây danh mục 3 cấp theo danh mục sản phẩm CTC.
 * - Giá luôn hiển thị "Liên hệ"; không tạo Schema Offer với giá 0.
 * - Mỗi sản phẩm dùng truy vấn riêng qua Serper API; không dùng lại ảnh của model khác.
 * - Ưu tiên ảnh từ website hãng; có thể cho phép nguồn phân phối uy tín.
 * - Kiểm tra URL, Content-Type, chữ ký, kích thước, fingerprint và độ khớp model ảnh.
 * - Có thể tải ảnh hợp lệ về public/uploads/products để tránh hotlink.
 * - Không dùng Unsplash/placeholder sai sản phẩm. Thiếu ảnh hợp lệ thì dừng seed.
 * - Tìm riêng trang sản phẩm và datasheet; chỉ công bố specification trích từ nguồn hãng khớp model.
 * - code/sku/mpn dùng part number/model thật của hãng; không tạo mã CTC tuần tự.
 * - Tên hàng không chứa part number đủ tin cậy hoặc trùng part number sẽ bị chặn trước khi seed.
 * - Tạo Category SEO cho cả danh mục gốc, trung gian và danh mục lá: H1, 300–600 từ,
 *   FAQ, breadcrumb, internal link sản phẩm, metadata và CollectionPage schema.
 * - Không chèn tỉnh/thành ngẫu nhiên vào từ khóa hoặc nội dung từng sản phẩm.
 * - Phạm vi phục vụ chỉ mô tả ở mức toàn quốc; dữ liệu GEO dùng cho ngữ cảnh nội bộ.
 * - GEO 2026: câu trả lời trực tiếp, entity rõ ràng, fact table hiển thị, nguồn xác thực, FAQ, freshness và JSON-LD liên kết bằng @id.
 * - GEO ở đây là Generative Engine Optimization; phạm vi địa lý được lưu riêng trong localCoverage.
 *
 * Cấu hình tối thiểu trong .env:
 *   SERPER_API_KEY=...
 *   MONGO_URI=mongodb://127.0.0.1:27017/ctc_web_new
 *   SITE_ORIGIN=https://ctcdn.vn
 *   DRY_RUN=true
 *   VALIDATE_CONFIG_ONLY=false
 *   VALIDATE_ONLY=false
 *
 * Đặt file trực tiếp tại server/scripts/.
 *
 * Chạy local:
 *   npx tsx server/scripts/seed-850-real-products-geo-v6.ts
 *
 * Chạy Docker:
 *   docker compose exec app npx tsx server/scripts/seed-850-real-products-geo-v6.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Product, ProductCategory, Category } from '../models/index.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// =============================================================================
// Cấu hình an toàn
// =============================================================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';
const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://ctcdn.vn').replace(/\/$/, '');
// Ưu tiên khóa trong môi trường; dùng khóa nhúng làm fallback theo cấu hình triển khai CTC.
const SERPER_API_KEY = process.env.SERPER_API_KEY || 'ba343b5949f5d05dcbe8eedf657c8d16e6e0392f';

const DRY_RUN = envBool('DRY_RUN', true);
const VALIDATE_CONFIG_ONLY = envBool('VALIDATE_CONFIG_ONLY', false);
const VALIDATE_ONLY = envBool('VALIDATE_ONLY', false);
const RESET_PRODUCTS = envBool('RESET_PRODUCTS', false);
const RESET_ALL_PRODUCTS = envBool('RESET_ALL_PRODUCTS', false);
const REQUIRE_OFFICIAL_IMAGE = envBool('REQUIRE_OFFICIAL_IMAGE', false);
const MIRROR_IMAGES = envBool('MIRROR_IMAGES', true);
const REVALIDATE_CACHE = envBool('REVALIDATE_CACHE', false);
const VALIDATE_REMOTE_IMAGES = envBool('VALIDATE_REMOTE_IMAGES', true);
const RESOLVE_OFFICIAL_SOURCES = envBool('RESOLVE_OFFICIAL_SOURCES', true);
const REQUIRE_OFFICIAL_SOURCE = envBool('REQUIRE_OFFICIAL_SOURCE', false);
const REVALIDATE_SOURCE_CACHE = envBool('REVALIDATE_SOURCE_CACHE', false);
const REQUIRE_DATASHEET = envBool('REQUIRE_DATASHEET', false);
const REQUIRE_VERIFIED_SPECIFICATIONS = envBool('REQUIRE_VERIFIED_SPECIFICATIONS', false);
const FAIL_ON_DUPLICATE_IMAGES = envBool('FAIL_ON_DUPLICATE_IMAGES', false);
const SEPARATE_DATASHEET_SEARCH = envBool('SEPARATE_DATASHEET_SEARCH', true);
const DISCOVER_PRODUCTS = envBool('DISCOVER_PRODUCTS', true);
const REVALIDATE_DISCOVERY_CACHE = envBool('REVALIDATE_DISCOVERY_CACHE', false);
const INCLUDE_DISCONTINUED_PRODUCTS = envBool('INCLUDE_DISCONTINUED_PRODUCTS', false);

const IMAGE_CONCURRENCY = envInt('IMAGE_CONCURRENCY', 3, 1, 8);
const SOURCE_CONCURRENCY = envInt('SOURCE_CONCURRENCY', 4, 1, 10);
const SERPER_RESULTS = envInt('SERPER_RESULTS', 10, 5, 20);
const FETCH_TIMEOUT_MS = envInt('FETCH_TIMEOUT_MS', 15_000, 5_000, 60_000);
const MAX_IMAGE_BYTES = envInt('MAX_IMAGE_MB', 12, 1, 30) * 1024 * 1024;
const MIN_IMAGE_WIDTH = envInt('MIN_IMAGE_WIDTH', 500, 200, 4000);
const MIN_IMAGE_HEIGHT = envInt('MIN_IMAGE_HEIGHT', 350, 200, 4000);
const MIN_IMAGE_MATCH_SCORE = envInt('MIN_IMAGE_MATCH_SCORE', 80, 50, 100);
const MAX_SOURCE_BYTES = envInt('MAX_SOURCE_MB', 4, 1, 10) * 1024 * 1024;
const MAX_VERIFIED_SPECS = envInt('MAX_VERIFIED_SPECS', 12, 1, 30);
const DISCOVERY_RESULTS_PER_QUERY = envInt('DISCOVERY_RESULTS_PER_QUERY', 20, 10, 20);
const DISCOVERY_CANDIDATE_MULTIPLIER = envInt('DISCOVERY_CANDIDATE_MULTIPLIER', 5, 2, 12);
const DISCOVERY_CONCURRENCY = envInt('DISCOVERY_CONCURRENCY', 3, 1, 6);
const MAX_DISCOVERY_QUERIES = envInt('MAX_DISCOVERY_QUERIES', 1000, 54, 5000);
const DISCOVERY_CACHE_MAX_AGE_DAYS = envInt('DISCOVERY_CACHE_MAX_AGE_DAYS', 30, 1, 365);
const MIN_CATEGORY_COVERAGE_PERCENT = envInt('MIN_CATEGORY_COVERAGE_PERCENT', 70, 1, 100);
const TARGET_TOTAL_PRODUCTS = 850;
const MIN_TOTAL_PRODUCTS = 820;
const MAX_TOTAL_PRODUCTS = 900;
const SEED_TAG = 'ctc-seed-850-real-products-geo-evidence-v6';
const GEO_STANDARD = 'CTC-GEO-2026.3';

const CACHE_DIR = path.resolve(__dirname, '../.cache/seed-850-products-v6');
const DISCOVERY_CACHE_FILE = path.join(CACHE_DIR, 'discovery-cache-v6.json');
const DISCOVERY_REPORT_FILE = path.join(CACHE_DIR, 'discovery-report-v6.json');
const DISCOVERED_CATALOG_FILE = path.join(CACHE_DIR, 'discovered-catalog-v6.json');
const IMAGE_CACHE_FILE = path.join(CACHE_DIR, 'image-cache-v6.json');
const EVIDENCE_CACHE_FILE = path.join(CACHE_DIR, 'evidence-cache-v6.json');
const IMAGE_REPORT_FILE = path.join(CACHE_DIR, 'image-report-v6.json');
const EVIDENCE_REPORT_FILE = path.join(CACHE_DIR, 'evidence-report-v6.json');
const CATEGORY_REPORT_FILE = path.join(CACHE_DIR, 'category-seo-report-v6.json');
const PART_NUMBER_REPORT_FILE = path.join(CACHE_DIR, 'part-number-report-v6.json');
const PRODUCT_PREVIEW_FILE = path.join(CACHE_DIR, 'product-preview-v6.json');
const PUBLIC_IMAGE_DIR = path.resolve(__dirname, '../../public/uploads/products');
const PUBLIC_IMAGE_PREFIX = '/uploads/products';

const COMPANY = {
  name: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung',
  alternateName: 'CTC',
  url: SITE_ORIGIN,
  address: {
    streetAddress: '50B Nguyễn Du',
    addressLocality: 'Đà Nẵng',
    addressCountry: 'VN',
  },
};

// 34 đơn vị hành chính cấp tỉnh hiện hành. Không sử dụng danh sách 63 tỉnh cũ.
const GEO_PROVINCES = [
  { code: '01', name: 'Hà Nội', type: 'Thành phố' },
  { code: '04', name: 'Cao Bằng', type: 'Tỉnh' },
  { code: '08', name: 'Tuyên Quang', type: 'Tỉnh' },
  { code: '11', name: 'Điện Biên', type: 'Tỉnh' },
  { code: '12', name: 'Lai Châu', type: 'Tỉnh' },
  { code: '14', name: 'Sơn La', type: 'Tỉnh' },
  { code: '15', name: 'Lào Cai', type: 'Tỉnh' },
  { code: '19', name: 'Thái Nguyên', type: 'Tỉnh' },
  { code: '20', name: 'Lạng Sơn', type: 'Tỉnh' },
  { code: '22', name: 'Quảng Ninh', type: 'Tỉnh' },
  { code: '24', name: 'Bắc Ninh', type: 'Tỉnh' },
  { code: '25', name: 'Phú Thọ', type: 'Tỉnh' },
  { code: '31', name: 'Hải Phòng', type: 'Thành phố' },
  { code: '33', name: 'Hưng Yên', type: 'Tỉnh' },
  { code: '37', name: 'Ninh Bình', type: 'Tỉnh' },
  { code: '38', name: 'Thanh Hóa', type: 'Tỉnh' },
  { code: '40', name: 'Nghệ An', type: 'Tỉnh' },
  { code: '42', name: 'Hà Tĩnh', type: 'Tỉnh' },
  { code: '44', name: 'Quảng Trị', type: 'Tỉnh' },
  { code: '46', name: 'Huế', type: 'Thành phố' },
  { code: '48', name: 'Đà Nẵng', type: 'Thành phố' },
  { code: '51', name: 'Quảng Ngãi', type: 'Tỉnh' },
  { code: '52', name: 'Gia Lai', type: 'Tỉnh' },
  { code: '56', name: 'Khánh Hòa', type: 'Tỉnh' },
  { code: '66', name: 'Đắk Lắk', type: 'Tỉnh' },
  { code: '68', name: 'Lâm Đồng', type: 'Tỉnh' },
  { code: '75', name: 'Đồng Nai', type: 'Tỉnh' },
  { code: '79', name: 'Thành phố Hồ Chí Minh', type: 'Thành phố' },
  { code: '80', name: 'Tây Ninh', type: 'Tỉnh' },
  { code: '82', name: 'Đồng Tháp', type: 'Tỉnh' },
  { code: '86', name: 'Vĩnh Long', type: 'Tỉnh' },
  { code: '91', name: 'An Giang', type: 'Tỉnh' },
  { code: '92', name: 'Cần Thơ', type: 'Thành phố' },
  { code: '96', name: 'Cà Mau', type: 'Tỉnh' },
] as const;


type CatalogGroup = {
  parentCategory: string;
  category: string;
  slug: string;
  brand: string;
  imageQuery: string;
  fallbackKey: string;
  quota: number;
  products: string[];
};

type CategoryTarget = {
  level1: string;
  level2?: string;
  category: string;
  slug: string;
  quota: number;
  brands: string[];
  searchTerms: string[];
};

type DiscoveredProduct = {
  name: string;
  brand: string;
  partNumber: string;
  categorySlug: string;
  productUrl: string;
  canonicalUrl: string;
  imageUrl: string;
  datasheetUrl?: string;
  sourceTitle: string;
  sourceDomain: string;
  specifications: Array<{ name: string; value: string }>;
  discontinued: boolean;
  evidenceScore: number;
  discoveredAt: string;
};

type DiscoveryCache = Record<string, DiscoveredProduct>;

type ImageCandidate = {
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  sourcePage: string;
  sourceDomain: string;
  imageWidth?: number;
  imageHeight?: number;
  position?: number;
};

type VerifiedImage = {
  query: string;
  imageUrl: string;
  publicUrl: string;
  sourcePage: string;
  sourceDomain: string;
  title: string;
  width?: number;
  height?: number;
  contentType: string;
  officialSource: boolean;
  verifiedAt: string;
  mirrored: boolean;
  localPath?: string;
  contentHash: string;
  matchEvidence: ImageMatchEvidence;
};

type ImageMatchEvidence = {
  score: number;
  method: 'exact-model' | 'all-model-tokens' | 'partial-model-tokens' | 'product-name-words';
  exactModel: boolean;
  brandMatched: boolean;
  matchedTokens: string[];
  missingTokens: string[];
};

type SourceEvidence = {
  productName: string;
  brand: string;
  model: string;
  url: string;
  domain: string;
  title: string;
  snippet: string;
  official: boolean;
  supportsProductFacts: boolean;
  httpValidated: boolean;
  contentType: string;
  sourceType: 'manufacturer-product-page' | 'manufacturer-datasheet' | 'manufacturer-image-page' | 'trusted-distributor' | 'unverified';
  verifiedAt: string;
  modelMatchScore: number;
  modelMatched: boolean;
  contentHash?: string;
  lastModified?: string;
};

type DatasheetEvidence = {
  url: string;
  domain: string;
  title: string;
  official: boolean;
  httpValidated: boolean;
  contentType: string;
  modelMatched: boolean;
  modelMatchScore: number;
  verifiedAt: string;
  contentHash?: string;
};

type VerifiedSpecification = {
  key: string;
  name: string;
  value: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceType: 'manufacturer-product-page' | 'manufacturer-datasheet';
  evidenceExcerpt: string;
  verifiedAt: string;
};

type ProductEvidenceBundle = {
  productName: string;
  brand: string;
  model: string;
  primarySource: SourceEvidence;
  datasheet: DatasheetEvidence | null;
  specifications: VerifiedSpecification[];
  evidenceStatus: 'verified-specifications' | 'official-source-only' | 'unresolved';
  reviewedAt: string;
};

const BASE_PRODUCT_CATALOG: CatalogGroup[] = [
  // ─── HẠ TẦNG VIỄN THÔNG & CNTT ───────────────────────────────────────
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'Router',
    slug: 'router',
    brand: 'MikroTik / DrayTek',
    imageQuery: 'MikroTik router product official',
    fallbackKey: 'router',
    quota: 30,
    products: [
      'MikroTik RB960PGS hEX PoE', 'MikroTik RB4011iGS+RM', 'MikroTik CCR1009-7G-1C-1S+',
      'MikroTik CCR2004-1G-12S+2XS', 'MikroTik RB3011UiAS-RM', 'MikroTik RB2011UiAS-2HnD-IN',
      'MikroTik RB750Gr3 hEX', 'MikroTik RB760iGS hEX S', 'MikroTik CCR1036-8G-2S+',
      'MikroTik RB5009UG+S+IN', 'DrayTek Vigor 2952 Dual WAN', 'DrayTek Vigor 2925FN',
      'DrayTek Vigor 2763AC VDSL2', 'DrayTek Vigor 3910 10G Router', 'DrayTek Vigor 2865 Series',
      'DrayTek Vigor 2962 Dual WAN', 'DrayTek Vigor 2135ac', 'DrayTek Vigor 2866Lac',
      'Cisco ISR4321/K9 Router', 'Cisco ISR4331/K9 Router', 'Cisco ISR1101-4G Router',
      'TP-Link TL-ER7206 Omada', 'TP-Link ER8411 Multi-WAN VPN', 'TP-Link TL-R605 Omada',
      'TP-Link TL-ER605 SafeStream', 'MikroTik CCR2116-12G-4S+', 'MikroTik RB2011iLS-IN',
      'MikroTik RB1100AHx4 Dude', 'DrayTek Vigor 165 VDSL2', 'MikroTik RBD52G-5HacD2HnD-TC',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'Switch',
    slug: 'switch',
    brand: 'Cisco / MikroTik',
    imageQuery: 'Cisco Catalyst network switch rack mount official',
    fallbackKey: 'switch',
    quota: 30,
    products: [
      'Cisco Catalyst WS-C2960X-48FPD-L', 'Cisco Catalyst C9300-48P-E', 'Cisco Catalyst C9200-24P-E',
      'Cisco SG350-28P-K9 Managed', 'Cisco SG550X-24P-K9 Stackable', 'Cisco CBS350-48P-4X-EU',
      'MikroTik CRS326-24G-2S+RM', 'MikroTik CRS354-48G-4S+2Q+RM', 'MikroTik CRS317-1G-16S+RM',
      'MikroTik CSS326-24G-2S+RM', 'TP-Link TL-SG3452XP Omada JetStream', 'TP-Link TL-SG3428X Omada',
      'TP-Link TL-SG2428P Omada', 'TP-Link TL-SG2452P Omada JetStream', 'HP Aruba 2930F 48G PoE+',
      'HP Aruba 2540 24G PoE+', 'Ubiquiti UniFi USW-Pro-48-POE', 'Ubiquiti UniFi USW-48-POE',
      'Netgear M4300-28G Managed', 'Netgear GS728TP-200EUS', 'D-Link DGS-3630-28PC Managed',
      'D-Link DGS-1210-28MP Smart', 'MikroTik CRS328-24P-4S+RM', 'Cisco SG250-26P-K9',
      'Cisco CBS220-24FP-4X-EU', 'TP-Link TL-SG1048 Rack', 'MikroTik CRS309-1G-8S+IN',
      'Cisco WS-C3750X-48PF-L', 'TP-Link TL-SG2008P JetStream', 'MikroTik CRS212-1G-10S-1S+IN',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'Wi-Fi / Access Point',
    slug: 'wifi-access-point',
    brand: 'MikroTik / TP-Link / Ubiquiti',
    imageQuery: 'MikroTik wireless access point hAP ceiling official',
    fallbackKey: 'wifi',
    quota: 25,
    products: [
      'MikroTik cAP ac RBcAPGi-5acD2nD', 'MikroTik hAP ac3 RBD53iG-5HacD2HnD',
      'MikroTik wAP ac RBwAPG-5HacD2HnD', 'MikroTik Audience LTE6 Kit',
      'TP-Link EAP670 Omada AX3600', 'TP-Link EAP655-Wall AX3000', 'TP-Link EAP225-Outdoor',
      'TP-Link EAP610-Outdoor AX1800', 'TP-Link EAP245 AC1750 Ceiling', 'TP-Link EAP265 HD AC1750',
      'TP-Link EAP115-Wall N300', 'Ubiquiti UAP-AC-HD UniFi', 'Ubiquiti UAP-AC-PRO UniFi',
      'Ubiquiti UniFi U6-Pro WiFi6', 'Ubiquiti UniFi U6-LR Long Range', 'Ubiquiti UniFi U6-Lite',
      'Cisco Aironet AIR-AP1832I-E-K9', 'Cisco CBW150AX WiFi 6', 'Cisco CW9164I-EWC-E',
      'MikroTik SXT Lite5 RBSXTG-5HPacD', 'MikroTik BaseBox 5 RBD25G-5HPacQD2HPnD',
      'Reyee RG-RAP6260(G) WiFi 6 Outdoor', 'Reyee RG-RAP2260(E) AX1800 Ceiling',
      'DrayTek VigorAP 912C', 'DrayTek VigorAP 960C WiFi 6',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'Thiết bị cân bằng tải',
    slug: 'can-bang-tai',
    brand: 'MikroTik / DrayTek',
    imageQuery: 'network load balancer appliance rack official',
    fallbackKey: 'router',
    quota: 10,
    products: [
      'MikroTik CCR2004-16G-2S+ Load Balancer', 'MikroTik CCR1036-12G-4S-EM',
      'DrayTek Vigor 3910 10G Load Balancer', 'DrayTek Vigor 2962 Dual WAN Balancer',
      'Peplink Balance 20X Load Balancer', 'Peplink Balance 310X Enterprise',
      'TP-Link TL-ER8411 Multi-WAN', 'Zyxel USG Flex 200H', 'Fortinet FortiGate 60F',
      'Cisco Meraki MX68W Balancer',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'SFP Module Quang',
    slug: 'sfp-module-quang',
    brand: 'CommScope / MikroTik',
    imageQuery: 'SFP fiber optic module transceiver official',
    fallbackKey: 'cable',
    quota: 15,
    products: [
      'MikroTik S-85DLC05D SFP 1.25G MM 550m', 'MikroTik S-31DLC20D SFP 1.25G SM 20km',
      'MikroTik S-RJ01 SFP to RJ45 Copper', 'MikroTik XS+85LC0316G SFP+ 10G MM',
      'MikroTik XS+31LC10D SFP+ 10G SM 10km', 'CommScope SFP+ 10G-LR 10km SM',
      'CommScope SFP 1G-SX 550m MM', 'Cisco SFP-10G-SR Module', 'Cisco SFP-10G-LR Module',
      'Cisco GLC-LH-SMD 1G SM 10km', 'Cisco GLC-SX-MMD 1G MM 550m',
      'TP-Link TL-SM311LS SFP 1G SM', 'TP-Link TL-SM5110-LR SFP+ 10G LR',
      'Ubiquiti UFiber SFP+ 10G SM 10km', 'Finisar FTLF8524P2BNL SFP+ 10G SR',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'ODF Tủ Phân Phối Quang',
    slug: 'odf-tu-phan-phoi-quang',
    brand: 'CommScope',
    imageQuery: 'CommScope ODF fiber distribution frame patch panel official',
    fallbackKey: 'cable',
    quota: 10,
    products: [
      'CommScope ODF 24FO LC/UPC Rack 1U', 'CommScope ODF 48FO LC/APC Rack 2U',
      'CommScope ODF 96FO SC/UPC Rack 4U', 'CommScope FODF-24-LC Wall Box',
      'Panduit OPTICOM WMPFASC24Y ODF 24FO', 'CommScope Systimax 760210401 ODF 48F',
      'FiberNet ODF 24FO SC/APC', 'FiberNet ODF 48FO LC/UPC 2U Rack',
      'Corning CCH-CP24-C3-P00RE ODF 24F', 'CommScope ODF 144FO LC/APC Rack 6U',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'VoIP Gateway',
    slug: 'voip-gateway',
    brand: 'Dinstar',
    imageQuery: 'Dinstar VoIP gateway GSM analog FXO FXS official',
    fallbackKey: 'voip',
    quota: 15,
    products: [
      'Dinstar DAG2000-32S VoIP Gateway 32FXS', 'Dinstar DAG2000-16S 16FXS VoIP',
      'Dinstar DAG2000-8S 8FXS VoIP', 'Dinstar DAG2000-8O 8FXO VoIP',
      'Dinstar DAG3000-8O/8S FXO+FXS Mixed', 'Dinstar UC2000-VE GSM VoIP Gateway 4G',
      'Dinstar MTG1000E E1/T1 VoIP Gateway', 'Dinstar MTG2000E 2E1 VoIP Gateway',
      'Dinstar UC100-1G/2G 4G LTE Gateway', 'Grandstream GXW4104 FXO Gateway 4-port',
      'Grandstream GXW4248 FXS 48-port Gateway', 'Grandstream GXW4504 PRI Gateway',
      'Patton SN4932/JO/EUI 32-FXO Gateway', 'AudioCodes MP-114/S/SIP 4FXS',
      'AudioCodes MP-1288 FXS/FXO Gateway',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'IP PBX Tổng Đài',
    slug: 'ip-pbx-tong-dai',
    brand: 'Dinstar',
    imageQuery: 'IP PBX telephone exchange business official product',
    fallbackKey: 'voip',
    quota: 10,
    products: [
      'Dinstar CooVox U50 IP PBX 50 Users', 'Dinstar CooVox U100 IP PBX 100 Users',
      'Dinstar CooVox U500 Enterprise IP PBX', 'Grandstream UCM6302 IP PBX 500 Users',
      'Grandstream UCM6304 IP PBX with FXO', 'Yeastar P560 IP PBX 500 Users',
      'Yeastar S412 Hybrid PBX 200 Users', 'Asterisk-based FreePBX Server 200 User',
      '3CX Phone System 64SC License', 'Avaya IP Office 500 V2 Control Unit',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'Điện Thoại IP',
    slug: 'dien-thoai-ip',
    brand: 'Dinstar',
    imageQuery: 'IP phone desk SIP VoIP official product',
    fallbackKey: 'voip',
    quota: 10,
    products: [
      'Dinstar C60S Color IP Phone', 'Dinstar C300 Basic SIP Phone',
      'Grandstream GRP2601P IP Phone 2 SIP', 'Grandstream GRP2614 IP Phone 4 SIP',
      'Grandstream GRP2616 6-line IP Phone', 'Yealink T31G IP Phone 2 SIP',
      'Yealink T43U Color USB IP Phone', 'Yealink T46U 16 SIP IP Phone',
      'Fanvil X4U Color IP Phone 12 DSS', 'Fanvil H2U Basic Hotel IP Phone',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'Cáp Mạng',
    slug: 'cap-mang',
    brand: 'CommScope',
    imageQuery: 'CommScope Cat6 Cat6A network cable UTP reel official',
    fallbackKey: 'cable',
    quota: 15,
    products: [
      'CommScope GigaSPEED XL Cat6 UTP 305m', 'CommScope GigaSPEED X10D Cat6A U/UTP',
      'CommScope SYSTIMAX Cat6A S/FTP 305m', 'CommScope Cat5e 305m UTP PVC',
      'TP-Link TL-EC620E Cat6 UTP Reel 305m', 'Panduit PUP6004OR Cat6 UTP 305m',
      'Panduit PUP6AOR Cat6A U/UTP 305m', 'Belden DataTwist Cat6 UTP 305m',
      'AMP Netconnect Cat6A STP 305m', 'CommScope Cat6A 10G ANEXT+',
      'LS Cable Cat6 UTP 305m Vietnam Made', 'CommScope Cat7 S/FTP 305m',
      'Panduit PUP6AX04OR Cat6A F/UTP', 'Belden 10GX Cat6A STP 305m',
      'Corning Cat6A F/UTP 305m Reel',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'Cáp Quang',
    slug: 'cap-quang',
    brand: 'CommScope',
    imageQuery: 'CommScope fiber optic cable ADSS G652D singlemode official',
    fallbackKey: 'cable',
    quota: 15,
    products: [
      'CommScope LazrSPEED OM4 12FO LC-LC 1m', 'CommScope LazrSPEED OM3 12FO 1m',
      'CommScope OS2 SM G652D 12FO 1km', 'CommScope ADSS 24FO G652D Span 100m',
      'CommScope OPGW 24FO Overhead Cable 1km', 'Corning ClearCurve OM4 12FO',
      'Draka BKT OS2 48FO Single-mode', 'OFS AllWave 96FO SM G652D',
      'LS Cable SM-96FO G652D Indoor', 'Panduit FLCJACKBLY Fiber LC Patch 3m',
      'CommScope 4FO SM OS2 Indoor Armored', 'Corning 96FO OS2 G657A1 Tight Buffer',
      'CommScope 8FO OM3 MMF Indoor Plenum', 'CommScope Pigtail LC/UPC SM OS2 1m',
      'CommScope 12FO G652D Outdoor Direct Burial',
    ],
  },
  {
    parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
    category: 'Patch Panel',
    slug: 'patch-panel',
    brand: 'CommScope',
    imageQuery: 'CommScope patch panel Cat6 rack 24 port 48 port official',
    fallbackKey: 'cable',
    quota: 10,
    products: [
      'CommScope GigaSPEED XL 24-port Cat6 1U', 'CommScope GigaSPEED X10D 24-port Cat6A',
      'CommScope SYSTIMAX 48-port Cat6 2U', 'Panduit CPP24WBLY 24-port Cat6 1U',
      'Panduit CPP48WBLY 48-port Cat6 2U', 'AMP Netconnect 24-port Cat5e 1U',
      'TP-Link TL-R48P-B Patch Panel 48-port', 'TP-Link TL-R24P-B Patch Panel Cat6 24P',
      'D-Link NPB-C6A24Y Cat6A 24-port', 'Belden REVConnect 24-port Cat6A',
    ],
  },

  // ─── THIẾT BỊ CNTT ───────────────────────────────────────────────────
  {
    parentCategory: 'Thiết Bị CNTT',
    category: 'Máy Chủ Server',
    slug: 'may-chu-server',
    brand: 'HPE / Dell',
    imageQuery: 'HPE ProLiant DL380 server rack 2U official product',
    fallbackKey: 'server',
    quota: 20,
    products: [
      'HPE ProLiant DL380 Gen10 Plus 2U', 'HPE ProLiant DL360 Gen10 Plus 1U',
      'HPE ProLiant DL20 Gen10 Plus Tower', 'HPE ProLiant ML350 Gen10 Tower',
      'Dell PowerEdge R750 2U Rack Server', 'Dell PowerEdge R650xs 1U Rack',
      'Dell PowerEdge T550 Tower Server', 'Dell PowerEdge R350 1U Rack',
      'Lenovo ThinkSystem SR650 V2 2U', 'Lenovo ThinkSystem SR550 V2 2U',
      'Lenovo ThinkSystem ST650 V2 Tower', 'Supermicro SYS-6029P-TRT 2U Server',
      'Supermicro AS-2124GQ-NART GPU Server', 'HPE ProLiant DL560 Gen10 4P Server',
      'Dell PowerEdge R940xa 4-Socket', 'HPE Synergy 480 Gen10 Blade',
      'Fujitsu PRIMERGY RX2540 M6 2U', 'Huawei FusionServer 2288H V6',
      'HPE ProLiant DL345 Gen10 Plus AMD', 'IBM Power S1022 2-Socket Server',
    ],
  },
  {
    parentCategory: 'Thiết Bị CNTT',
    category: 'PC Máy Tính Để Bàn',
    slug: 'pc-may-tinh-de-ban',
    brand: 'Dell / HP',
    imageQuery: 'Dell OptiPlex small form factor desktop PC official',
    fallbackKey: 'pc',
    quota: 15,
    products: [
      'Dell OptiPlex 3090 SFF Core i5 Gen11', 'Dell OptiPlex 5090 MFF Micro i7',
      'Dell OptiPlex 7090 Ultra i9 Gen11', 'HP ProDesk 400 G7 SFF Core i5',
      'HP ProDesk 600 G6 MT Core i7', 'HP EliteDesk 800 G6 Tower i9',
      'Lenovo ThinkCentre M70q Tiny Gen3', 'Lenovo ThinkCentre M90t Tower i9',
      'Asus ProArt Station PD500TC', 'ASUS ExpertCenter D700MC Tower',
      'HP Z2 Tower G9 Workstation Xeon', 'Dell Precision 3660 Tower Workstation',
      'Intel NUC 12 Pro Kit i7 RNUC12WSHI7', 'Asus PN53-S5070MD Mini PC',
      'MSI PRO DP21 11M Business PC',
    ],
  },
  {
    parentCategory: 'Thiết Bị CNTT',
    category: 'Mini PC',
    slug: 'mini-pc',
    brand: 'Các Hãng',
    imageQuery: 'mini PC fanless industrial embedded computer official',
    fallbackKey: 'pc',
    quota: 10,
    products: [
      'Intel NUC 11 Pro i5-1135G7 RNUC11TNHi50002', 'Intel NUC 13 Pro i7-1360P Arena Canyon',
      'Minisforum UM690 AMD Ryzen 9 6900HX', 'Minisforum EliteMini HX90 Ryzen 9',
      'Beelink SER6 Ryzen 7 6800H Mini PC', 'Beelink EQ12 N100 Fanless Mini PC',
      'Zotac ZBOX CI669 Nano Silent PC', 'Zotac ZBOX QK7P3000 Quadro K3000M',
      'AAEON UP Squared Pro i5-1135G7 Industrial', 'Advantech ARK-1123C Fanless Embedded PC',
    ],
  },
  {
    parentCategory: 'Thiết Bị CNTT',
    category: 'Laptop',
    slug: 'laptop',
    brand: 'Dell / HP',
    imageQuery: 'Dell Latitude HP EliteBook business laptop official product',
    fallbackKey: 'laptop',
    quota: 15,
    products: [
      'Dell Latitude 5430 Core i7 Gen12 14inch', 'Dell Latitude 7430 Core i7 vPro 14"',
      'Dell Precision 5570 Workstation i9', 'HP EliteBook 840 G9 Core i7 14inch',
      'HP EliteBook 1040 G9 i7 vPro 14"', 'Lenovo ThinkPad X1 Carbon Gen10 i7',
      'Lenovo ThinkPad T14s Gen3 AMD Ryzen7', 'Lenovo ThinkPad E14 Gen4 Core i5',
      'ASUS ExpertBook B2 Flip B2502FBA', 'ASUS ExpertBook B9 B9450CEA i7',
      'Microsoft Surface Laptop 5 i7 13.5"', 'Microsoft Surface Pro 9 i7 13" Tablet',
      'Apple MacBook Pro 14 M2 Pro 2023', 'Acer TravelMate P4 TMP414-51', 'HP ZBook Fury 16 G9 i9 Workstation',
    ],
  },
  {
    parentCategory: 'Thiết Bị CNTT',
    category: 'Máy In Nhãn',
    slug: 'may-in-nhan',
    brand: 'Zebra / Honeywell',
    imageQuery: 'Zebra ZT411 industrial barcode label printer official',
    fallbackKey: 'default',
    quota: 10,
    products: [
      'Zebra ZT411 Industrial Thermal Label 300dpi', 'Zebra ZT610 Industrial 600dpi',
      'Zebra GX430t Desktop Label Printer', 'Zebra ZD421 Desktop 4-inch 203dpi',
      'Honeywell PX940 Industrial Printer 600dpi', 'Honeywell PC45 Desktop Printer',
      'Brother PT-E550WVP Label Printer WiFi', 'Brother TD-4550DNWB USB Bluetooth',
      'Datamax H-Class Mark II Industrial', 'SATO CL6NX Plus 600dpi Label Printer',
    ],
  },
  {
    parentCategory: 'Thiết Bị CNTT',
    category: 'Kiosk Tự Phục Vụ',
    slug: 'kiosk-tu-phuc-vu',
    brand: 'Các Hãng',
    imageQuery: 'self service kiosk touch screen information official product',
    fallbackKey: 'kiosk',
    quota: 10,
    products: [
      'Kiosk 43-inch 4K Touch Screen Indoor', 'Kiosk 55-inch Outdoor Sunlight Readable',
      'Kiosk Floor Standing 32" FHD Touch', 'Kiosk Tabletop 15.6" Android POS',
      'Kiosk Ticket Dispensing Thermal Printer', 'Kiosk Check-in Counter Top Touch',
      'Kiosk POSIFLEX KS7315 15" Touch', 'Kiosk Wall Mount 21.5" Android 11',
      'Kiosk Interactive Wayfinding 55" 4K', 'Kiosk Payment ATM Style Indoor',
    ],
  },

  // ─── NĂNG LƯỢNG MẶT TRỜI ──────────────────────────────────────────────
  {
    parentCategory: 'Năng Lượng Mặt Trời',
    category: 'Tấm Pin Năng Lượng Mặt Trời',
    slug: 'tam-pin-nang-luong-mat-troi',
    brand: 'Canadian Solar / LONGI / Jinko',
    imageQuery: 'Canadian Solar HiKu6 solar panel monocrystalline official datasheet',
    fallbackKey: 'solar',
    quota: 35,
    products: [
      'Canadian Solar HiKu6 CS6W-570MS 570W', 'Canadian Solar HiKu7 CS7N-665MS 665W',
      'Canadian Solar BiKu CS6W-540BB 540W', 'Canadian Solar HiHero CS6R-410MS 410W',
      'LONGI Hi-MO 6 LR5-72HGD 580W TOPCon', 'LONGI Hi-MO X6 LR5-66HTH 530W',
      'LONGI Hi-MO 5m LR4-72HPH 450W', 'LONGI Hi-MO 7 LR5-72HBD 620W',
      'Jinko Solar Tiger Neo JKM580N-72HL4-V', 'Jinko Solar Tiger Pro JKM540M-72HL4-V',
      'Jinko Solar Cheetah HC JKM415M-54HL4-V', 'Jinko Solar Eagle JKM305PP-60',
      'Trina Solar Vertex NEG21C.20 720W', 'Trina Solar Vertex N NEG19RC.20 640W',
      'Trina Solar Honey Plus TSM-360DEG15H(II)', 'Trina Solar Vertex S NEG9R.28 430W',
      'Risen Solar RSM40-8-410M MONO', 'Risen Solar Titan RSM150-8-500BMDG',
      'JA Solar JAM72D30 565/MB 565W', 'JA Solar JAM66S30 500/MR 500W',
      'JA Solar DeepBlue 3.0 JAM72S30-545/MR', 'REC Alpha Pure-RX 410W',
      'REC Alpha Pro M 430W Series', 'Q.CELLS Q.TRON BLK-G2+ 400W',
      'Q.CELLS Q.PEAK DUO BLK ML-G10+ 395W', 'First Solar Series 7 TR1 420W CdTe',
      'SunPower Maxeon 6 AC Module 420W', 'AE Solar AE400MD-60 400W Poly',
      'Vikram Solar Somera 380W PERC', 'VSUN VSUN545-144M 545W Mono',
      'Adani Solar ASM 580M-72 580W TOPCon', 'Waaree Energies 535W Bifacial PERC',
      'Canadian Solar BiKu CS3Y-445PB 445W Bifacial', 'LONGI Hi-MO X LR5-72HGD 600W',
      'Trina Solar Vertex TSM-DE21.08W 710W',
    ],
  },
  {
    parentCategory: 'Năng Lượng Mặt Trời',
    category: 'Inverter Hòa Lưới',
    slug: 'inverter-hoa-luoi',
    brand: 'Huawei / SMA / Sungrow',
    imageQuery: 'Huawei SUN2000 inverter solar grid-tied official',
    fallbackKey: 'inverter',
    quota: 35,
    products: [
      'Huawei SUN2000-3KTL-L1 3kW 1P', 'Huawei SUN2000-5KTL-L1 5kW 1P',
      'Huawei SUN2000-8KTL-M1 8kW 3P', 'Huawei SUN2000-12KTL-M2 12kW 3P',
      'Huawei SUN2000-20KTL-M2 20kW 3P', 'Huawei SUN2000-36KTL-MA 36kW 3P',
      'Huawei SUN2000-50KTL-M3 50kW 3P', 'Huawei SUN2000-100KTL-M2 100kW 3P',
      'Huawei SUN2000-185KTL-H1 185kW Central', 'Huawei SUN2000-350KTL-H0 350kW',
      'SMA Sunny Boy SB3.0-1AV-41 3kW', 'SMA Sunny Tripower STP 10000TL-20 10kW',
      'SMA Sunny Tripower CORE1 STP 50-41 50kW', 'SMA Sunny Tripower CORE2 STP 110-60 110kW',
      'SMA Sunny Central SC 2500-EV 2500kW', 'Sungrow SG3.0RS 3kW 1P WiFi',
      'Sungrow SG7.0RT 7kW 3P', 'Sungrow SG15RT 15kW 3P', 'Sungrow SG30CX-P2 30kW',
      'Sungrow SG110CX 110kW 12MPPT', 'Sungrow SG250HX 250kW DC1500V',
      'Fronius Symo Gen24 Plus 8.0kW', 'Fronius Primo Gen24 6.0kW 1P',
      'Fronius Symo Advanced 20.0-3-M 20kW', 'Growatt MIN 6000TL-X 6kW 1P',
      'Growatt MOD 8000TL3-X 8kW 3P', 'Growatt MID 33KTL3-X 33kW 3P',
      'Deye SUN-6K-SG03LP1-EU 6kW Hybrid', 'Deye SUN-12K-SG04LP3 12kW Hybrid 3P',
      'Goodwe GW5048D-ES 5kW Hybrid Offgrid', 'Sofar Solar 8.8KTL-X 8.8kW 3P',
      'INVT Solar BG012KTR 12kW 3P', 'Kstar Blue-G KSG-25K 25kW',
      'Ingeteam Ingecon Sun 25TL 25kW', 'SolarEdge SE10K Optimized 10kW',
    ],
  },

  // ─── ẮC QUY VÀ LƯU TRỮ ĐIỆN ─────────────────────────────────────────
  {
    parentCategory: 'Ắc Quy Và Lưu Trữ Điện',
    category: 'Ắc Quy Lithium LiFePO4',
    slug: 'ac-quy-lithium-lifepo4',
    brand: 'CATL / BYD / Pylontech',
    imageQuery: 'LiFePO4 lithium battery energy storage rack 48V official product',
    fallbackKey: 'battery',
    quota: 20,
    products: [
      'CATL L012-100Ah LiFePO4 48V 100Ah Rack', 'CATL EnerOne Plus 100kWh Container',
      'Pylontech US3000C 48V 74Ah LiFePO4', 'Pylontech US5000B 48V 100Ah',
      'Pylontech H48074 48V 74Ah Rack Unit', 'BYD Battery-Box Premium HVS 7.7kWh',
      'BYD Battery-Box Premium HVM 11.04kWh', 'Huawei LUNA2000-15-S0 15kWh',
      'Sungrow SBH025-10 25kWh Rack Cabinet', 'Alpha ESS SMILE5 5kW/10kWh System',
      'Growatt GBLI6531 6.5kWh Lithium Pack', 'Deye BOS-G Pro 15kWh',
      'GivEnergy GIV-BAT-5.2kWh Battery', 'Goodwe Lynx Home F 10kWh 48V',
      'SOL-ARK SK-48V100-L 100Ah LiFePO4 Rack', 'ROSEN RSB-LF-48-100 48V 100Ah',
      'CATL CL4850-100 48V 100Ah Cabinet', 'Shoto SDA10-48100 48V 100Ah Rack',
      'PYTES E-BOX-48100R 48V 100Ah', 'EG4 LL-S Lithium Battery 48V 100Ah',
    ],
  },
  {
    parentCategory: 'Ắc Quy Và Lưu Trữ Điện',
    category: 'Ắc Quy Chì VRLA',
    slug: 'ac-quy-chi-vrla',
    brand: 'Yuasa / CSB',
    imageQuery: 'VRLA AGM lead acid battery 12V UPS official product',
    fallbackKey: 'battery',
    quota: 15,
    products: [
      'Yuasa NP100-12I 12V 100Ah VRLA AGM', 'Yuasa NP65-12I 12V 65Ah VRLA',
      'Yuasa NP38-12I 12V 38Ah AGM', 'CSB GPL12200 12V 200Ah VRLA',
      'CSB GPG12200 12V 200Ah 5HR', 'CSB EVX12200 12V 200Ah DeepCycle',
      'Exide EP950 AGM 12V 95Ah', 'Exide EP200 AGM 12V 200Ah',
      'Fiamm FG21202 12V 120Ah VRLA', 'GS Yuasa SWL1650 12V 165Ah',
      'Panasonic LC-XD1217APG 12V 17Ah', 'Leoch DJM12-200 12V 200Ah GEL',
      'Rocket EV200-12 12V 200Ah AGM', 'Vision 6FM200D 12V 200Ah GEL',
      'Ritar RA12-100 12V 100Ah VRLA AGM',
    ],
  },
  {
    parentCategory: 'Ắc Quy Và Lưu Trữ Điện',
    category: 'Ắc Quy Nước Traction',
    slug: 'ac-quy-nuoc-traction',
    brand: 'EnerSys / Hoppecke',
    imageQuery: 'forklift traction flooded lead acid battery 2V cell official',
    fallbackKey: 'battery',
    quota: 10,
    products: [
      'EnerSys Marathon L 2V 1000Ah Traction', 'EnerSys PowerSafe 2V 600Ah OPzS',
      'Hoppecke OPzS 2V 800Ah Flooded', 'Hoppecke Grid Power S 2V 1500Ah',
      'Exide SONNENSCHEIN A200 2V 800Ah GEL', 'Fiamm 2 SLA M 400 2V 400Ah',
      'Rolls Battery 4KS-21PS 4V 428Ah', 'Trojan L16H-AC 6V 435Ah Flooded',
      'U.S. Battery USB-185-XC 6V 196Ah', 'Deka Solar 8A4DLT 12V 195Ah Flooded',
    ],
  },

  // ─── THƯƠNG HIỆU ─────────────────────────────────────────────────────
  {
    parentCategory: 'Thương Hiệu',
    category: 'CommScope',
    slug: 'commscope',
    brand: 'CommScope',
    imageQuery: 'CommScope network infrastructure cabling official product',
    fallbackKey: 'cable',
    quota: 10,
    products: [
      'CommScope SYSTIMAX 2100 Cabinet 7ft', 'CommScope GigaSPEED XL Jack Module Cat6',
      'CommScope NetPatch 24-port Cat6A 1U', 'CommScope iPatch 4100 Intelligent Patch',
      'CommScope TrueNet Cat6 1P Data Outlet', 'CommScope AMP NetConnect Cat6A FTP',
      'CommScope SYSTIMAX 760 iD Cable', 'CommScope SpecTRAL SRS12A Fiber Rack',
      'CommScope FOSC 450 Fiber Closure', 'CommScope R-316A/U Coax Cable',
    ],
  },
  {
    parentCategory: 'Thương Hiệu',
    category: 'Dinstar',
    slug: 'dinstar',
    brand: 'Dinstar',
    imageQuery: 'Dinstar VoIP gateway PBX official product authorized reseller',
    fallbackKey: 'voip',
    quota: 5,
    products: [
      'Dinstar DAG2000-16S Phiên Bản Mới 2024', 'Dinstar UC100-4G GSM Gateway',
      'Dinstar CooVox U20 IP PBX Basic', 'Dinstar MTG200 E1 Gateway',
      'Dinstar IMS650 SBC Session Border',
    ],
  },
  {
    parentCategory: 'Thương Hiệu',
    category: 'DrayTek',
    slug: 'draytek',
    brand: 'DrayTek',
    imageQuery: 'DrayTek Vigor router firewall official authorized distributor',
    fallbackKey: 'router',
    quota: 5,
    products: [
      'DrayTek Vigor 2960 Dual WAN Firewall', 'DrayTek Vigor 2926L 4G LTE Router',
      'DrayTek VigorSwitch P2280 28-Port PoE', 'DrayTek VigorSwitch G2280 28-Port Managed',
      'DrayTek Vigor 167 VDSL2 Modem',
    ],
  },
  {
    parentCategory: 'Thương Hiệu',
    category: 'MikroTik',
    slug: 'mikrotik',
    brand: 'MikroTik',
    imageQuery: 'MikroTik router switch wireless RouterOS official product',
    fallbackKey: 'router',
    quota: 10,
    products: [
      'MikroTik CRS312-4C+8XG-RM 10G Switch', 'MikroTik CRS518-16XS-2XQ-RM 100G',
      'MikroTik RB1100AHx4 Router Dude Edition', 'MikroTik CCR2216-1G-12XS-2XQ',
      'MikroTik LHG 5 ac High Gain CPE', 'MikroTik SXTsq 5 ac CPE',
      'MikroTik Groove A-52HPn Outdoor', 'MikroTik RBGPE-TC OmniTIK 5HnD',
      'MikroTik wAP LTE kit 4G AP', 'MikroTik DISC Lite5 ac 120-degree',
    ],
  },
  {
    parentCategory: 'Thương Hiệu',
    category: 'TP-Link',
    slug: 'tp-link',
    brand: 'TP-Link',
    imageQuery: 'TP-Link Omada business router switch access point official',
    fallbackKey: 'router',
    quota: 10,
    products: [
      'TP-Link OC300 Omada Hardware Controller', 'TP-Link OC200 Omada Software Controller',
      'TP-Link TL-SG1048 48-Port Gigabit Rack', 'TP-Link TL-SG3452P 48-Port JetStream PoE',
      'TP-Link EAP773 WiFi 7 Ceiling AP', 'TP-Link EAP683 LR WiFi 6E Long Range',
      'TP-Link TL-ER7212PC Omada VPN Router', 'TP-Link TL-SX3016F 16-Port SFP+ 10G',
      'TP-Link TL-SG2428P JetStream PoE+ 375W', 'TP-Link TL-SX1008 8-Port 10G Unmanaged',
    ],
  },
];

// =============================================================================
// Bổ sung 70 sản phẩm để danh sách đạt đúng 500
// =============================================================================
const EXTRA_PRODUCTS: Record<string, string[]> = {
  router: [
    'MikroTik CCR2004-16G-2S+',
    'MikroTik hEX Refresh E50UG',
    'DrayTek Vigor 2927ax',
    'DrayTek Vigor 2866ax',
    'TP-Link ER707-M2 Omada Multi-Gigabit VPN Router',
  ],
  switch: [
    'Cisco Catalyst C1300-48P-4X',
    'Aruba CX 6100 48G Class4 PoE 4SFP+',
    'TP-Link TL-SG3428XPP-M2 Omada',
    'MikroTik CRS310-8G+2S+IN',
    'Ubiquiti UniFi Enterprise 24 PoE',
  ],
  'wifi-access-point': [
    'TP-Link EAP783 Omada WiFi 7',
    'Ubiquiti UniFi U7 Pro WiFi 7',
    'MikroTik cAP ax cAPGi-5HaxD2HaxD',
    'DrayTek VigorAP 1062C WiFi 6',
    'Cisco Catalyst CW9166I WiFi 6E',
  ],
  'sfp-module-quang': [
    'MikroTik S+RJ10 SFP+ RJ45 10G',
    'MikroTik XQ+31LC10D QSFP28 100G LR4',
    'Cisco QSFP-40G-SR4 40GBASE-SR4',
    'Cisco SFP-25G-SR-S 25GBASE-SR',
    'TP-Link SM5220-1M SFP+ Direct Attach Cable',
  ],
  'may-chu-server': [
    'HPE ProLiant DL380 Gen11 2U Rack Server',
    'Dell PowerEdge R760 2U Rack Server',
    'Lenovo ThinkSystem SR650 V3 2U Server',
    'Supermicro SYS-621C-TN12R 2U Server',
    'Huawei FusionServer Pro 2288H V5',
  ],
  'pc-may-tinh-de-ban': [
    'Dell OptiPlex 7010 SFF Plus',
    'HP Elite Tower 800 G9 Desktop PC',
    'Lenovo ThinkCentre M90s Gen 4 SFF',
    'ASUS ExpertCenter D7 SFF D700SER',
    'Acer Veriton X4 VX4710G',
  ],
  'tam-pin-nang-luong-mat-troi': [
    'Jinko Solar Tiger Neo JKM585N-72HL4-V 585W',
    'LONGi Hi-MO 7 LR5-72HGD-610M 610W',
    'Trina Solar Vertex N TSM-NEG21C.20 695W',
    'JA Solar DeepBlue 4.0 Pro JAM72D42-620/LB 620W',
    'Canadian Solar TOPHiKu6 CS6.2-48TD 460W',
  ],
  'inverter-hoa-luoi': [
    'Huawei SUN2000-125KTL-M5 125kW',
    'Sungrow SG125CX-P2 125kW',
    'SMA Sunny Tripower X 25',
    'GoodWe GW100K-HT 100kW',
    'SolarEdge SE33.3K Three Phase Inverter',
  ],
  'ac-quy-lithium-lifepo4': [
    'Pylontech Force H2 14.21kWh',
    'BYD Battery-Box Premium LVL 15.4',
    'Huawei LUNA2000-7-E1 7kWh Battery Module',
    'Sungrow SBR256 25.6kWh High Voltage Battery',
    'Dyness Tower T17 17.76kWh',
  ],
};

const KIOSK_PRODUCTS = [
  'Samsung KMA Series KM24A Interactive Kiosk',
  'LG 27KC3PJ-B Self-Ordering Kiosk',
  'Advantech UTC-520 Interactive Kiosk',
  'Posiflex Paragon TK-3200 Series Kiosk',
  'NCR SelfServ 90 Kiosk',
  'Diebold Nixdorf DN Series EASY ONE Kiosk',
  'AOPEN eTILE 22M-FB Interactive Kiosk',
  'Pyramid polytouch 32 Curve Kiosk',
  'Elo Wallaby Self-Service Floor Stand 22-inch',
  'PARTTEAM & OEMKIOSKS QTOUCH 32 Kiosk',
];

const CONNECTION_ACCESSORIES: CatalogGroup = {
  parentCategory: 'Hạ Tầng Viễn Thông & CNTT',
  category: 'Phụ kiện kết nối',
  slug: 'phu-kien-ket-noi',
  brand: 'CommScope / Panduit / Corning / Dintek',
  imageQuery: 'network fiber connectivity accessory official product',
  fallbackKey: 'cable',
  quota: 25,
  products: [
    'CommScope Cat6 RJ45 Modular Plug 8P8C',
    'CommScope Cat6A Shielded RJ45 Field Plug',
    'CommScope MGS400 Cat6 UTP Information Outlet',
    'CommScope MGS600 Cat6A Information Outlet',
    'CommScope Cat6 UTP Patch Cord 1m',
    'CommScope Cat6 UTP Patch Cord 3m',
    'CommScope Cat6A S/FTP Patch Cord 2m',
    'CommScope LC/UPC Single-mode Pigtail 1m',
    'CommScope SC/APC Single-mode Pigtail 1m',
    'CommScope LC-LC OS2 Duplex Patch Cord 3m',
    'CommScope SC-SC OS2 Duplex Patch Cord 3m',
    'CommScope LC-LC OM4 Duplex Patch Cord 3m',
    'CommScope SC/APC Fast Connector',
    'CommScope LC/UPC Fast Connector',
    'CommScope Fiber Optic Splice Tray 24 Core',
    'CommScope FOSC 400A4 Fiber Optic Closure',
    'Panduit CJ688TGBU Cat6 Mini-Com Jack',
    'Panduit UTP28SP3BU Cat6 Patch Cord 3ft',
    'TP-Link TL-SM321A BiDi SFP Module',
    'TP-Link TL-SM321B BiDi SFP Module',
    'Dintek 1501-88027 Cat6 RJ45 Connector',
    'Dintek Cat6 UTP Patch Cord 3m',
    '3M Scotchlok UY2 Connector',
    'Corning LC Uniboot Duplex Patch Cord OS2',
    'Corning OptiSnap SC/APC Fast Connector',
  ],
};

const V5_REFERENCE_PRODUCT_CATALOG: CatalogGroup[] = [
  ...BASE_PRODUCT_CATALOG.map((group) => {
    const replacement = group.slug === 'kiosk-tu-phuc-vu' ? KIOSK_PRODUCTS : group.products;
    const products = [...replacement, ...(EXTRA_PRODUCTS[group.slug] || [])];
    return { ...group, products, quota: products.length };
  }),
  CONNECTION_ACCESSORIES,
];

// V5 được giữ lại trong file như catalog tham chiếu. V6 chỉ seed catalog đã
// được crawler xác minh và gán vào biến này trong main().
let ACTIVE_PRODUCT_CATALOG: CatalogGroup[] = [];

// Đúng cây danh mục người dùng cung cấp, gồm các tầng trung gian.
const CATEGORY_PATHS: Record<string, string[]> = {
  router: ['Hạ Tầng Viễn Thông & CNTT', 'Thiết bị mạng', 'Router'],
  switch: ['Hạ Tầng Viễn Thông & CNTT', 'Thiết bị mạng', 'Switch'],
  'wifi-access-point': ['Hạ Tầng Viễn Thông & CNTT', 'Thiết bị mạng', 'Wi-Fi / Access Point'],
  'can-bang-tai': ['Hạ Tầng Viễn Thông & CNTT', 'Thiết bị mạng', 'Thiết bị cân bằng tải'],
  'sfp-module-quang': ['Hạ Tầng Viễn Thông & CNTT', 'Thiết bị truyền dẫn quang', 'SFP Module Quang'],
  'odf-tu-phan-phoi-quang': ['Hạ Tầng Viễn Thông & CNTT', 'Thiết bị truyền dẫn quang', 'ODF Tủ Phân Phối Quang'],
  'voip-gateway': ['Hạ Tầng Viễn Thông & CNTT', 'Tổng đài và VoIP', 'VoIP Gateway'],
  'ip-pbx-tong-dai': ['Hạ Tầng Viễn Thông & CNTT', 'Tổng đài và VoIP', 'IP PBX Tổng Đài'],
  'dien-thoai-ip': ['Hạ Tầng Viễn Thông & CNTT', 'Tổng đài và VoIP', 'Điện thoại IP'],
  'cap-mang': ['Hạ Tầng Viễn Thông & CNTT', 'Hạ tầng cáp và kết nối', 'Cáp mạng'],
  'cap-quang': ['Hạ Tầng Viễn Thông & CNTT', 'Hạ tầng cáp và kết nối', 'Cáp quang'],
  'patch-panel': ['Hạ Tầng Viễn Thông & CNTT', 'Hạ tầng cáp và kết nối', 'Patch Panel'],
  'phu-kien-ket-noi': ['Hạ Tầng Viễn Thông & CNTT', 'Hạ tầng cáp và kết nối', 'Phụ kiện kết nối'],
  'may-chu-server': ['Thiết Bị CNTT', 'Máy chủ Server'],
  'pc-may-tinh-de-ban': ['Thiết Bị CNTT', 'PC Máy tính để bàn'],
  'mini-pc': ['Thiết Bị CNTT', 'Mini PC'],
  laptop: ['Thiết Bị CNTT', 'Laptop'],
  'may-in-nhan': ['Thiết Bị CNTT', 'Máy in nhãn'],
  'kiosk-tu-phuc-vu': ['Thiết Bị CNTT', 'Kiosk tự phục vụ'],
  'may-tram-workstation': ['Thiết Bị CNTT', 'Máy trạm Workstation'],
  'may-tinh-all-in-one': ['Thiết Bị CNTT', 'Máy tính All-in-One'],
  'man-hinh-may-tinh': ['Thiết Bị CNTT', 'Màn hình máy tính'],
  'may-in-thiet-bi-in': ['Thiết Bị CNTT', 'Máy in & thiết bị in'],
  'may-quet-ma-vach': ['Thiết Bị CNTT', 'Máy quét mã vạch'],
  'thiet-bi-pos': ['Thiết Bị CNTT', 'Thiết bị POS'],
  'may-tinh-cong-nghiep': ['Thiết Bị CNTT', 'Máy tính công nghiệp'],
  'thiet-bi-luu-tru': ['Thiết Bị CNTT', 'Thiết bị lưu trữ'],
  'ups-thiet-bi-data-center': ['Thiết Bị CNTT', 'UPS & thiết bị Data Center'],
  'tu-rack-phu-kien': ['Thiết Bị CNTT', 'Tủ Rack & phụ kiện'],
  'camera-ip': ['Thiết Bị CNTT', 'Hệ thống Camera giám sát', 'Camera IP'],
  'camera-analog': ['Thiết Bị CNTT', 'Hệ thống Camera giám sát', 'Camera Analog / HDCVI / HDTVI'],
  'camera-ptz': ['Thiết Bị CNTT', 'Hệ thống Camera giám sát', 'Camera PTZ'],
  'camera-wifi': ['Thiết Bị CNTT', 'Hệ thống Camera giám sát', 'Camera Wi-Fi'],
  'camera-ai': ['Thiết Bị CNTT', 'Hệ thống Camera giám sát', 'Camera AI'],
  'dau-ghi-hinh-nvr': ['Thiết Bị CNTT', 'Hệ thống Camera giám sát', 'Đầu ghi hình NVR'],
  'dau-ghi-hinh-dvr-xvr': ['Thiết Bị CNTT', 'Hệ thống Camera giám sát', 'Đầu ghi hình DVR / XVR'],
  'phu-kien-camera': ['Thiết Bị CNTT', 'Hệ thống Camera giám sát', 'Phụ kiện Camera'],
  'thiet-bi-hoi-nghi-truyen-hinh': ['Thiết Bị CNTT', 'Thiết bị hội nghị truyền hình'],
  'may-chieu-thiet-bi-trinh-chieu': ['Thiết Bị CNTT', 'Máy chiếu & thiết bị trình chiếu'],
  'thiet-bi-ngoai-vi': ['Thiết Bị CNTT', 'Thiết bị ngoại vi'],
  'tam-pin-nang-luong-mat-troi': ['Năng Lượng Mặt Trời', 'Tấm pin năng lượng mặt trời'],
  'inverter-hoa-luoi': ['Năng Lượng Mặt Trời', 'Bộ hòa lưới Inverter'],
  'inverter-hybrid': ['Năng Lượng Mặt Trời', 'Inverter Hybrid'],
  'bo-toi-uu-cong-suat-optimizer': ['Năng Lượng Mặt Trời', 'Bộ tối ưu công suất – Optimizer'],
  'tu-dien-nang-luong-mat-troi': ['Năng Lượng Mặt Trời', 'Tủ điện năng lượng mặt trời'],
  'thiet-bi-bao-ve-dien-mat-troi': ['Năng Lượng Mặt Trời', 'Thiết bị bảo vệ điện mặt trời'],
  'cap-dau-noi-solar': ['Năng Lượng Mặt Trời', 'Cáp & đầu nối Solar'],
  'he-khung-gia-do-solar': ['Năng Lượng Mặt Trời', 'Hệ khung giá đỡ Solar'],
  'thiet-bi-giam-sat-do-dem': ['Năng Lượng Mặt Trời', 'Thiết bị giám sát & đo đếm'],
  'cong-to-thiet-bi-do-dien': ['Năng Lượng Mặt Trời', 'Công tơ & thiết bị đo điện'],
  'thiet-bi-ve-sinh-tam-pin': ['Năng Lượng Mặt Trời', 'Thiết bị vệ sinh tấm pin'],
  'ac-quy-chi-vrla': ['Ắc Quy Và Lưu Trữ Điện', 'Ắc quy chì VRLA / AGM'],
  'ac-quy-lithium-lifepo4': ['Ắc Quy Và Lưu Trữ Điện', 'Ắc quy Lithium LiFePO4'],
  'ac-quy-nuoc-traction': ['Ắc Quy Và Lưu Trữ Điện', 'Ắc quy nước Traction'],
  commscope: ['Thương Hiệu', 'CommScope'],
  dinstar: ['Thương Hiệu', 'Dinstar'],
  draytek: ['Thương Hiệu', 'DrayTek'],
  mikrotik: ['Thương Hiệu', 'MikroTik'],
  'tp-link': ['Thương Hiệu', 'TP-Link'],
};


const CATEGORY_PROFILE: Record<string, {
  summary: string;
  applications: string[];
  selection: string;
  entityType: string;
}> = {
  router: {
    summary: 'thiết bị định tuyến dành cho doanh nghiệp, chi nhánh, nhà máy và hệ thống đa đường truyền',
    applications: ['kết nối Internet doanh nghiệp', 'VPN site-to-site', 'quản trị nhiều WAN', 'phân đoạn mạng'],
    selection: 'số cổng, thông lượng thực tế, số phiên đồng thời, nhu cầu VPN và khả năng mở rộng',
    entityType: 'NetworkRouter',
  },
  switch: {
    summary: 'thiết bị chuyển mạch cho mạng LAN doanh nghiệp, hệ thống camera, Wi-Fi và Data Center',
    applications: ['mạng LAN văn phòng', 'PoE cho camera và Access Point', 'uplink quang', 'VLAN doanh nghiệp'],
    selection: 'số cổng, chuẩn PoE, công suất PoE, tốc độ uplink, khả năng quản trị và stacking',
    entityType: 'NetworkSwitch',
  },
  'wifi-access-point': {
    summary: 'điểm truy cập không dây cho văn phòng, khách sạn, trường học, nhà xưởng và khu vực công cộng',
    applications: ['Wi-Fi doanh nghiệp', 'phủ sóng mật độ cao', 'roaming', 'quản trị tập trung'],
    selection: 'chuẩn Wi-Fi, số luồng, mật độ người dùng, vị trí trong nhà/ngoài trời và bộ điều khiển',
    entityType: 'WirelessAccessPoint',
  },
  'can-bang-tai': {
    summary: 'thiết bị đa WAN và cân bằng tải giúp duy trì kết nối ổn định cho hệ thống quan trọng',
    applications: ['cân bằng nhiều đường Internet', 'dự phòng WAN', 'VPN', 'kiểm soát lưu lượng'],
    selection: 'số WAN, thông lượng firewall/VPN, chính sách định tuyến và yêu cầu dự phòng',
    entityType: 'LoadBalancer',
  },
  'sfp-module-quang': {
    summary: 'module thu phát quang dùng kết nối switch, router và thiết bị truyền dẫn',
    applications: ['uplink quang', 'kết nối Data Center', 'mạng Metro', 'truyền dẫn đường dài'],
    selection: 'tốc độ, loại sợi, bước sóng, khoảng cách, đầu nối và khả năng tương thích thiết bị',
    entityType: 'OpticalTransceiver',
  },
  'odf-tu-phan-phoi-quang': {
    summary: 'khung và hộp phối quang phục vụ quản lý, hàn nối và bảo vệ tuyến cáp quang',
    applications: ['tủ rack viễn thông', 'phòng máy', 'trạm BTS', 'mạng FTTx'],
    selection: 'số core, loại adapter, chuẩn đầu nối, kiểu rack/treo tường và không gian dự phòng',
    entityType: 'FiberDistributionFrame',
  },
  'voip-gateway': {
    summary: 'cổng chuyển đổi thoại IP cho kết nối FXS, FXO, E1/T1, GSM hoặc LTE',
    applications: ['kết nối điện thoại analog', 'trung kế PSTN', 'GSM VoIP', 'tích hợp tổng đài IP'],
    selection: 'số cổng, giao tiếp thoại, codec, giao thức SIP và kịch bản dự phòng',
    entityType: 'VoIPGateway',
  },
  'ip-pbx-tong-dai': {
    summary: 'tổng đài IP quản lý máy nhánh, cuộc gọi và các kênh liên lạc doanh nghiệp',
    applications: ['tổng đài văn phòng', 'call center', 'ghi âm', 'họp thoại và làm việc từ xa'],
    selection: 'số người dùng, số cuộc gọi đồng thời, cổng analog, SIP trunk và tính năng quản trị',
    entityType: 'IPPhoneSystem',
  },
  'dien-thoai-ip': {
    summary: 'điện thoại bàn SIP cho nhân viên, lễ tân, quản lý và trung tâm chăm sóc khách hàng',
    applications: ['máy nhánh SIP', 'hotline', 'lễ tân', 'call center'],
    selection: 'số tài khoản SIP, màn hình, phím DSS, PoE, tai nghe và khả năng tương thích tổng đài',
    entityType: 'IPPhone',
  },
  'cap-mang': {
    summary: 'cáp đồng cấu trúc cho mạng LAN, camera IP, Wi-Fi và hệ thống điều khiển',
    applications: ['mạng văn phòng', 'camera IP', 'PoE', 'Data Center'],
    selection: 'category, loại chống nhiễu, vật liệu vỏ, chiều dài, môi trường lắp đặt và tiêu chuẩn nghiệm thu',
    entityType: 'NetworkCable',
  },
  'cap-quang': {
    summary: 'cáp và dây nhảy quang cho mạng truyền dẫn, Data Center, FTTx và kết nối liên tòa nhà',
    applications: ['truyền dẫn đường trục', 'FTTx', 'Data Center', 'kết nối trạm viễn thông'],
    selection: 'single-mode/multimode, số core, chuẩn sợi, kết cấu bảo vệ, đầu nối và khoảng cách',
    entityType: 'FiberOpticCable',
  },
  'patch-panel': {
    summary: 'bảng đấu nối tập trung giúp quản lý cáp mạng và cáp quang trong tủ rack',
    applications: ['tủ mạng', 'Data Center', 'phòng máy', 'hệ thống cáp cấu trúc'],
    selection: 'số port, category, chiều cao U, loại module và phương án quản lý cáp',
    entityType: 'PatchPanel',
  },
  'phu-kien-ket-noi': {
    summary: 'phụ kiện đầu cuối và đấu nối cho mạng đồng, mạng quang và tủ rack',
    applications: ['bấm đầu mạng', 'đấu nối quang', 'dây nhảy', 'hàn nối và bảo vệ mối nối'],
    selection: 'chuẩn đầu nối, category, loại sợi, chuẩn đánh bóng, suy hao và tính tương thích',
    entityType: 'ConnectivityAccessory',
  },
  'may-chu-server': {
    summary: 'máy chủ cho ảo hóa, cơ sở dữ liệu, ứng dụng doanh nghiệp và hệ thống lưu trữ',
    applications: ['ảo hóa', 'cơ sở dữ liệu', 'ERP', 'dịch vụ web và Data Center'],
    selection: 'CPU, RAM, ổ lưu trữ, RAID, nguồn dự phòng, cổng mạng và khả năng mở rộng',
    entityType: 'ServerComputer',
  },
  'pc-may-tinh-de-ban': {
    summary: 'máy tính để bàn cho văn phòng, kỹ thuật, thiết kế và vận hành doanh nghiệp',
    applications: ['văn phòng', 'kế toán', 'thiết kế kỹ thuật', 'trạm làm việc'],
    selection: 'CPU, RAM, SSD, đồ họa, kích thước thùng máy, hệ điều hành và khả năng nâng cấp',
    entityType: 'DesktopComputer',
  },
  'mini-pc': {
    summary: 'máy tính kích thước nhỏ cho văn phòng, kiosk, màn hình số và hệ thống nhúng',
    applications: ['kiosk', 'digital signage', 'văn phòng', 'điều khiển công nghiệp'],
    selection: 'CPU, RAM, lưu trữ, cổng I/O, khả năng gắn VESA và điều kiện vận hành',
    entityType: 'MiniComputer',
  },
  laptop: {
    summary: 'máy tính xách tay cho nhân sự di động, quản lý, kỹ thuật và làm việc từ xa',
    applications: ['văn phòng di động', 'quản lý', 'kỹ thuật hiện trường', 'làm việc từ xa'],
    selection: 'CPU, RAM, SSD, màn hình, trọng lượng, thời lượng pin, bảo mật và bảo hành',
    entityType: 'LaptopComputer',
  },
  'may-in-nhan': {
    summary: 'máy in tem nhãn mã vạch cho kho vận, bán lẻ, sản xuất và quản lý tài sản',
    applications: ['tem kho', 'mã vạch', 'nhãn sản phẩm', 'nhãn cáp và thiết bị'],
    selection: 'công nghệ in, độ phân giải, khổ in, tốc độ, kết nối và loại vật tư',
    entityType: 'LabelPrinter',
  },
  'kiosk-tu-phuc-vu': {
    summary: 'kiosk cảm ứng tự phục vụ cho tra cứu, đặt hàng, thanh toán và tiếp nhận khách hàng',
    applications: ['check-in', 'đặt món', 'tra cứu thông tin', 'xếp hàng và thanh toán'],
    selection: 'kích thước màn hình, độ sáng, cảm ứng, máy in, đầu đọc, thanh toán và môi trường sử dụng',
    entityType: 'InteractiveKiosk',
  },
  'tam-pin-nang-luong-mat-troi': {
    summary: 'module quang điện cho hệ thống điện mặt trời áp mái và dự án C&I',
    applications: ['điện mặt trời nhà xưởng', 'hệ thống C&I', 'farm solar', 'hệ thống hybrid'],
    selection: 'công suất danh định, kích thước, công nghệ cell, hiệu suất, hệ số nhiệt và điều kiện bảo hành',
    entityType: 'SolarPanel',
  },
  'inverter-hoa-luoi': {
    summary: 'biến tần chuyển đổi điện DC từ tấm pin thành điện AC cho hệ thống hòa lưới hoặc hybrid',
    applications: ['điện mặt trời áp mái', 'nhà xưởng C&I', 'farm solar', 'hệ thống lưu trữ'],
    selection: 'công suất AC, dải MPPT, số MPPT, điện áp DC, số pha, bảo vệ và khả năng giám sát',
    entityType: 'SolarInverter',
  },
  'ac-quy-lithium-lifepo4': {
    summary: 'pin lưu trữ lithium cho viễn thông, UPS, điện mặt trời và hệ thống ESS',
    applications: ['nguồn trạm viễn thông', 'UPS', 'điện mặt trời hybrid', 'ESS'],
    selection: 'điện áp, dung lượng, công nghệ cell, BMS, dòng sạc/xả và giao tiếp giám sát',
    entityType: 'LithiumBattery',
  },
  'ac-quy-chi-vrla': {
    summary: 'ắc quy kín khí VRLA dùng cho UPS, viễn thông, báo cháy và nguồn dự phòng',
    applications: ['UPS', 'trạm viễn thông', 'báo cháy', 'nguồn DC dự phòng'],
    selection: 'điện áp, dung lượng, chế độ phóng, kích thước, tuổi thọ thiết kế và điều kiện nhiệt độ',
    entityType: 'LeadAcidBattery',
  },
  'ac-quy-nuoc-traction': {
    summary: 'ắc quy nước và ắc quy traction cho xe nâng, công nghiệp và nguồn DC dung lượng lớn',
    applications: ['xe nâng', 'nguồn công nghiệp', 'trạm điện', 'hệ thống dự phòng'],
    selection: 'điện áp cell, dung lượng, chế độ phóng, kích thước, bảo dưỡng và bộ sạc phù hợp',
    entityType: 'TractionBattery',
  },
};

const DEFAULT_PROFILE = {
  summary: 'sản phẩm chuyên dụng cho hạ tầng viễn thông, CNTT và năng lượng',
  applications: ['doanh nghiệp', 'nhà máy', 'Data Center', 'hạ tầng kỹ thuật'],
  selection: 'model, thông số trong datasheet, khả năng tương thích, điều kiện bảo hành và tiến độ giao hàng',
  entityType: 'Product',
};

// =============================================================================
// Nhận diện thương hiệu và tên miền nguồn chính hãng
// =============================================================================
const BRAND_DOMAINS: Record<string, string[]> = {
  'MikroTik': ['mikrotik.com'],
  'DrayTek': ['draytek.com'],
  'Cisco': ['cisco.com'],
  'TP-Link': ['tp-link.com'],
  'Ubiquiti': ['ui.com', 'ubnt.com'],
  'Aruba': ['arubanetworks.com', 'hpe.com'],
  'HP Aruba': ['arubanetworks.com', 'hpe.com'],
  'Reyee': ['ruijienetworks.com', 'reyee.com'],
  'Netgear': ['netgear.com'],
  'D-Link': ['dlink.com'],
  'Peplink': ['peplink.com'],
  'Zyxel': ['zyxel.com'],
  'Fortinet': ['fortinet.com'],
  'CommScope': ['commscope.com'],
  'Panduit': ['panduit.com'],
  'Corning': ['corning.com'],
  'Finisar': ['coherent.com', 'finisar.com'],
  'Dinstar': ['dinstar.com'],
  'Yealink': ['yealink.com'],
  'Fanvil': ['fanvil.com'],
  'Grandstream': ['grandstream.com'],
  'Patton': ['patton.com'],
  'AudioCodes': ['audiocodes.com'],
  'Yeastar': ['yeastar.com'],
  'FreePBX': ['freepbx.org', 'sangoma.com'],
  '3CX': ['3cx.com'],
  'Avaya': ['avaya.com'],
  'Belden': ['belden.com'],
  'AMP Netconnect': ['te.com'],
  'LS Cable': ['lscns.com'],
  'OFS': ['ofsglobal.com'],
  'HPE': ['hpe.com'],
  'Dell': ['dell.com'],
  'Lenovo': ['lenovo.com'],
  'Supermicro': ['supermicro.com'],
  'Fujitsu': ['fujitsu.com'],
  'Huawei': ['huawei.com'],
  'IBM': ['ibm.com'],
  'HP': ['hp.com'],
  'ASUS': ['asus.com'],
  'Intel': ['intel.com'],
  'MSI': ['msi.com'],
  'Minisforum': ['minisforum.com'],
  'Beelink': ['bee-link.com', 'beelink.com'],
  'Zotac': ['zotac.com'],
  'AAEON': ['aaeon.com'],
  'Advantech': ['advantech.com'],
  'Microsoft': ['microsoft.com'],
  'Apple': ['apple.com'],
  'Acer': ['acer.com'],
  'Zebra': ['zebra.com'],
  'Honeywell': ['honeywell.com'],
  'Brother': ['brother.com'],
  'Datamax': ['honeywell.com'],
  'SATO': ['sato-global.com'],
  'Posiflex': ['posiflex.com'],
  'Samsung': ['samsung.com'],
  'LG': ['lg.com'],
  'NCR': ['ncr.com', 'ncrvoyix.com'],
  'Diebold Nixdorf': ['dieboldnixdorf.com'],
  'AOPEN': ['aopen.com'],
  'Pyramid': ['pyramid-computer.com'],
  'Elo': ['elotouch.com'],
  'PARTTEAM & OEMKIOSKS': ['oemkiosks.com'],
  'Canadian Solar': ['canadiansolar.com', 'canadian-solar.com'],
  'LONGi': ['longi.com'],
  'Jinko Solar': ['jinkosolar.com'],
  'Trina Solar': ['trinasolar.com'],
  'Risen Solar': ['risenenergy.com'],
  'JA Solar': ['jasolar.com'],
  'REC': ['recgroup.com'],
  'Q.CELLS': ['qcells.com'],
  'First Solar': ['firstsolar.com'],
  'SunPower': ['maxeon.com', 'sunpower.com'],
  'AE Solar': ['ae-solar.com'],
  'Vikram Solar': ['vikramsolar.com'],
  'VSUN': ['vsun-solar.com'],
  'Adani Solar': ['adanisolar.com'],
  'Waaree': ['waaree.com'],
  'SMA': ['sma.de'],
  'Sungrow': ['sungrowpower.com'],
  'Fronius': ['fronius.com'],
  'Growatt': ['growatt.com'],
  'Deye': ['deyeinverter.com'],
  'GoodWe': ['goodwe.com'],
  'Sofar Solar': ['sofarsolar.com'],
  'INVT': ['invt-solar.com', 'invt.com'],
  'Kstar': ['kstar.com'],
  'Ingeteam': ['ingeteam.com'],
  'SolarEdge': ['solaredge.com'],
  'CATL': ['catl.com'],
  'Pylontech': ['pylontech.com.cn'],
  'BYD': ['byd.com'],
  'Alpha ESS': ['alphaess.com'],
  'GivEnergy': ['givenergy.co.uk'],
  'SOL-ARK': ['sol-ark.com'],
  'ROSEN': ['rosenpv.com'],
  'Shoto': ['shoto.com'],
  'PYTES': ['pytesusa.com', 'pytesgroup.com'],
  'EG4': ['eg4electronics.com'],
  'Yuasa': ['yuasa.com', 'gs-yuasa.com'],
  'GS Yuasa': ['gs-yuasa.com'],
  'CSB': ['csb-battery.com'],
  'Exide': ['exidegroup.com', 'exide.com'],
  'Fiamm': ['fiamm.com'],
  'Panasonic': ['panasonic.com'],
  'Leoch': ['leoch.com'],
  'Rocket': ['rocketbatt.com'],
  'Vision': ['vision-batt.com'],
  'Ritar': ['ritarpower.com'],
  'EnerSys': ['enersys.com'],
  'Hoppecke': ['hoppecke.com'],
  'Rolls': ['rollsbattery.com', 'rolls-battery.com'],
  'Trojan': ['trojanbattery.com'],
  'U.S. Battery': ['usbattery.com'],
  'Deka Solar': ['eastpennmanufacturing.com'],
  'Dintek': ['dintek.com.tw'],
  '3M': ['3m.com'],
};

// Mở rộng nguồn chính hãng cho 54 danh mục V6. Domain là allow-list; crawler
// không nhận marketplace, bài tổng hợp hoặc trang đại lý làm nguồn khám phá.
Object.assign(BRAND_DOMAINS, {
  'Ruijie': ['ruijienetworks.com'],
  'Sangoma': ['sangoma.com'],
  'LS': ['lselectric.com', 'lscns.com'],
  'Vinacap': ['vinacap.vn'],
  'AMP': ['te.com'],
  'Alantek': ['alantek.com'],
  'VSP': ['vsp.vn'],
  'Gigabyte': ['gigabyte.com'],
  'ViewSonic': ['viewsonic.com'],
  'BenQ': ['benq.com'],
  'Canon': ['canon.com'],
  'Epson': ['epson.com'],
  'Fujifilm': ['fujifilm.com'],
  'Ricoh': ['ricoh.com'],
  'Godex': ['godexintl.com'],
  'TSC': ['tscprinters.com'],
  'Datalogic': ['datalogic.com'],
  'Newland': ['newlandaidc.com'],
  'Symbol': ['zebra.com'],
  'Opticon': ['opticon.com'],
  'Sunmi': ['sunmi.com'],
  'COMQ': ['comq.vn'],
  'Minh Bảo': ['minhbao.com.vn'],
  'GoodM': ['goodm.com.vn'],
  'Tân Hưng Hà': ['tanhungha.com.vn'],
  'SimpleTech': ['simpletech.vn'],
  'Siemens': ['siemens.com'],
  'Beckhoff': ['beckhoff.com'],
  'Axiomtek': ['axiomtek.com'],
  'OnLogic': ['onlogic.com'],
  'ASUS IoT': ['asus.com'],
  'Cincoze': ['cincoze.com'],
  'Synology': ['synology.com'],
  'QNAP': ['qnap.com'],
  'Dell EMC': ['dell.com'],
  'Western Digital': ['westerndigital.com'],
  'Seagate': ['seagate.com'],
  'Kingston': ['kingston.com'],
  'APC': ['apc.com', 'se.com'],
  'Eaton': ['eaton.com'],
  'Vertiv': ['vertiv.com'],
  'Santak': ['santak.com'],
  'Delta': ['deltaww.com'],
  'Socomec': ['socomec.com'],
  'Schneider Electric': ['se.com'],
  'ECP': ['ecp.com.vn'],
  'Unirack': ['unirack.com.vn'],
  'KBVISION': ['kbvision.vn'],
  'Hikvision': ['hikvision.com'],
  'Dahua': ['dahuasecurity.com'],
  'Uniview': ['uniview.com'],
  'Hanwha Vision': ['hanwhavision.com'],
  'Bosch': ['boschsecurity.com'],
  'Logitech': ['logitech.com'],
  'Poly': ['hp.com'],
  'Jabra': ['jabra.com'],
  'Aver': ['aver.com'],
  'Panasonic Connect': ['connect.panasonic.com'],
  'Sony': ['sony.com'],
  'Optoma': ['optoma.com'],
  'Rapoo': ['rapoo.com'],
  'Astronergy': ['astronergy.com'],
  'Risen Energy': ['risenenergy.com'],
  'Solis': ['solisinverters.com'],
  'Tigo': ['tigoenergy.com'],
  'ABB': ['abb.com'],
  'LS Electric': ['lselectric.com'],
  'Chint': ['chintglobal.com'],
  'Mitsubishi Electric': ['mitsubishielectric.com'],
  'Phoenix Contact': ['phoenixcontact.com'],
  'DEHN': ['dehn-international.com'],
  'Stäubli': ['staubli.com'],
  'LAPP': ['lapp.com'],
  'HELUKABEL': ['helukabel.com'],
  'CADIVI': ['cadivi.vn'],
  'Leader Solar': ['leadersolar.com'],
  'Amphenol': ['amphenol.com'],
  'Schletter': ['schletter-group.com'],
  'Clenergy': ['clenergy.com'],
  'K2 Systems': ['k2-systems.com'],
  'Antaisolar': ['antaisolar.com'],
  'Kseng': ['xmkseng.com'],
  'Grace Solar': ['gracesolar.com'],
  'Carlo Gavazzi': ['gavazziautomation.com'],
  'Janitza': ['janitza.com'],
  'Kärcher': ['kaercher.com'],
  'Ecoppia': ['ecoppia.com'],
  'SunBrush': ['sunbrushmobil.com'],
  'SolarCleano': ['solarcleano.com'],
  'hyCLEANER': ['hycleaner.de'],
  'Dyness': ['dyness.com'],
  'Narada': ['naradapower.com'],
  'TAB': ['tab.si'],
  'Crown': ['crownbattery.com'],
});

const BRAND_PREFIXES = Object.keys(BRAND_DOMAINS).sort((a, b) => b.length - a.length);

function target(
  level1: string,
  level2: string | undefined,
  category: string,
  slug: string,
  quota: number,
  brands: string[],
  searchTerms: string[],
): CategoryTarget {
  return { level1, level2, category, slug, quota, brands, searchTerms };
}

const TELCO = 'Hạ Tầng Viễn Thông & CNTT';
const IT = 'Thiết Bị CNTT';
const SOLAR = 'Năng Lượng Mặt Trời';
const STORAGE = 'Ắc Quy Và Lưu Trữ Điện';

const CATEGORY_TARGETS: CategoryTarget[] = [
  target(TELCO, 'Thiết bị mạng', 'Router', 'router', 30, ['MikroTik', 'DrayTek', 'Cisco', 'TP-Link', 'Ubiquiti', 'Ruijie', 'Peplink'], ['enterprise router', 'business router']),
  target(TELCO, 'Thiết bị mạng', 'Switch', 'switch', 35, ['Cisco', 'MikroTik', 'TP-Link', 'Aruba', 'Ruijie', 'D-Link', 'Ubiquiti'], ['network switch', 'managed switch']),
  target(TELCO, 'Thiết bị mạng', 'Wi-Fi / Access Point', 'wifi-access-point', 30, ['TP-Link', 'Ubiquiti', 'MikroTik', 'Aruba', 'Cisco', 'Ruijie'], ['wireless access point', 'enterprise Wi-Fi access point']),
  target(TELCO, 'Thiết bị mạng', 'Thiết bị cân bằng tải', 'can-bang-tai', 15, ['MikroTik', 'DrayTek', 'Peplink', 'TP-Link', 'Fortinet'], ['multi-WAN load balancer', 'WAN load balancing appliance']),
  target(TELCO, 'Thiết bị truyền dẫn quang', 'SFP Module Quang', 'sfp-module-quang', 18, ['Cisco', 'MikroTik', 'TP-Link', 'CommScope', 'Huawei', 'Aruba', 'D-Link'], ['SFP transceiver module', 'optical transceiver']),
  target(TELCO, 'Thiết bị truyền dẫn quang', 'ODF Tủ Phân Phối Quang', 'odf-tu-phan-phoi-quang', 12, ['CommScope', 'Corning', 'Panduit', 'AMP', 'LS', 'Vinacap'], ['fiber distribution frame ODF', 'fiber enclosure patch panel']),
  target(TELCO, 'Tổng đài và VoIP', 'VoIP Gateway', 'voip-gateway', 12, ['Dinstar', 'Grandstream', 'AudioCodes', 'Yeastar', 'Patton'], ['VoIP gateway', 'FXS FXO gateway']),
  target(TELCO, 'Tổng đài và VoIP', 'IP PBX Tổng Đài', 'ip-pbx-tong-dai', 12, ['Dinstar', 'Grandstream', 'Yeastar', 'Sangoma'], ['IP PBX appliance', 'business phone system']),
  target(TELCO, 'Tổng đài và VoIP', 'Điện thoại IP', 'dien-thoai-ip', 16, ['Yealink', 'Grandstream', 'Fanvil', 'Dinstar', 'Cisco'], ['IP phone', 'SIP desk phone']),
  target(TELCO, 'Hạ tầng cáp và kết nối', 'Cáp mạng', 'cap-mang', 18, ['CommScope', 'Panduit', 'Belden', 'LS', 'AMP', 'Dintek', 'Alantek'], ['Cat6 cable', 'network cable reel']),
  target(TELCO, 'Hạ tầng cáp và kết nối', 'Cáp quang', 'cap-quang', 12, ['CommScope', 'Corning', 'LS', 'Vinacap'], ['fiber optic cable', 'single mode fiber cable']),
  target(TELCO, 'Hạ tầng cáp và kết nối', 'Patch Panel', 'patch-panel', 10, ['CommScope', 'Panduit', 'TP-Link', 'Dintek', 'Alantek'], ['network patch panel', 'Cat6 patch panel']),
  target(TELCO, 'Hạ tầng cáp và kết nối', 'Phụ kiện kết nối', 'phu-kien-ket-noi', 10, ['CommScope', 'Panduit', 'Dintek', 'Alantek', '3M', 'Corning'], ['network connector accessory', 'fiber connectivity accessory']),

  target(IT, undefined, 'Máy chủ Server', 'may-chu-server', 20, ['Dell', 'HPE', 'Lenovo', 'Supermicro', 'Fujitsu'], ['rack server', 'tower server']),
  target(IT, undefined, 'PC Máy tính để bàn', 'pc-may-tinh-de-ban', 25, ['Dell', 'HP', 'Lenovo', 'ASUS', 'Acer'], ['business desktop PC', 'small form factor desktop']),
  target(IT, undefined, 'Mini PC', 'mini-pc', 15, ['Intel', 'ASUS', 'Minisforum', 'Beelink', 'Zotac', 'Gigabyte'], ['mini PC', 'compact computer']),
  target(IT, undefined, 'Laptop', 'laptop', 40, ['Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Apple', 'MSI'], ['business laptop', 'notebook computer']),
  target(IT, undefined, 'Máy trạm Workstation', 'may-tram-workstation', 12, ['Dell', 'HP', 'Lenovo', 'ASUS', 'Supermicro'], ['workstation', 'mobile workstation']),
  target(IT, undefined, 'Máy tính All-in-One', 'may-tinh-all-in-one', 12, ['Dell', 'HP', 'Lenovo', 'ASUS', 'Acer'], ['all-in-one computer', 'AIO desktop']),
  target(IT, undefined, 'Màn hình máy tính', 'man-hinh-may-tinh', 18, ['Dell', 'HP', 'Lenovo', 'LG', 'Samsung', 'ASUS', 'ViewSonic', 'BenQ', 'VSP'], ['computer monitor', 'business display']),
  target(IT, undefined, 'Máy in & thiết bị in', 'may-in-thiet-bi-in', 18, ['HP', 'Canon', 'Brother', 'Epson', 'Fujifilm', 'Ricoh'], ['printer', 'multifunction printer']),
  target(IT, undefined, 'Máy in nhãn', 'may-in-nhan', 12, ['Zebra', 'Honeywell', 'Brother', 'SATO', 'Godex', 'TSC'], ['label printer', 'barcode label printer']),
  target(IT, undefined, 'Máy quét mã vạch', 'may-quet-ma-vach', 12, ['Zebra', 'Honeywell', 'Datalogic', 'Newland', 'Symbol', 'Opticon'], ['barcode scanner', 'handheld barcode reader']),
  target(IT, undefined, 'Thiết bị POS', 'thiet-bi-pos', 12, ['Sunmi', 'Posiflex', 'Epson', 'HP', 'Dell', 'Zebra', 'Honeywell'], ['POS terminal', 'point of sale terminal']),
  target(IT, undefined, 'Kiosk tự phục vụ', 'kiosk-tu-phuc-vu', 18, ['COMQ', 'Minh Bảo', 'GoodM', 'Tân Hưng Hà', 'SimpleTech'], ['self-service kiosk', 'touch screen kiosk']),
  target(IT, undefined, 'Máy tính công nghiệp', 'may-tinh-cong-nghiep', 12, ['Advantech', 'Siemens', 'Beckhoff', 'Axiomtek', 'OnLogic', 'ASUS IoT', 'Cincoze'], ['industrial computer', 'fanless industrial PC']),
  target(IT, undefined, 'Thiết bị lưu trữ', 'thiet-bi-luu-tru', 18, ['Synology', 'QNAP', 'Dell EMC', 'HPE', 'Lenovo', 'Western Digital', 'Seagate', 'Kingston', 'Samsung'], ['NAS storage', 'enterprise storage']),
  target(IT, undefined, 'UPS & thiết bị Data Center', 'ups-thiet-bi-data-center', 18, ['APC', 'Eaton', 'Vertiv', 'Santak', 'Delta', 'Socomec', 'Schneider Electric'], ['UPS uninterruptible power supply', 'data center power']),
  target(IT, undefined, 'Tủ Rack & phụ kiện', 'tu-rack-phu-kien', 10, ['APC', 'CommScope', 'Schneider Electric', 'ECP', 'Dintek', 'Alantek', 'Unirack'], ['server rack cabinet', 'rack accessory']),
  target(IT, 'Hệ thống Camera giám sát', 'Camera IP', 'camera-ip', 20, ['KBVISION', 'Hikvision', 'Dahua', 'Uniview', 'Hanwha Vision', 'Bosch'], ['IP camera', 'network camera']),
  target(IT, 'Hệ thống Camera giám sát', 'Camera Analog / HDCVI / HDTVI', 'camera-analog', 8, ['KBVISION', 'Hikvision', 'Dahua', 'Uniview'], ['analog surveillance camera', 'HDCVI HDTVI camera']),
  target(IT, 'Hệ thống Camera giám sát', 'Camera PTZ', 'camera-ptz', 6, ['KBVISION', 'Hikvision', 'Dahua', 'Uniview', 'Hanwha Vision', 'Bosch'], ['PTZ camera', 'pan tilt zoom camera']),
  target(IT, 'Hệ thống Camera giám sát', 'Camera Wi-Fi', 'camera-wifi', 6, ['KBVISION', 'Hikvision', 'Dahua', 'Uniview'], ['Wi-Fi camera', 'wireless security camera']),
  target(IT, 'Hệ thống Camera giám sát', 'Camera AI', 'camera-ai', 8, ['KBVISION', 'Hikvision', 'Dahua', 'Uniview', 'Hanwha Vision', 'Bosch'], ['AI security camera', 'deep learning camera']),
  target(IT, 'Hệ thống Camera giám sát', 'Đầu ghi hình NVR', 'dau-ghi-hinh-nvr', 8, ['KBVISION', 'Hikvision', 'Dahua', 'Uniview', 'Hanwha Vision', 'Bosch'], ['network video recorder NVR', 'NVR recorder']),
  target(IT, 'Hệ thống Camera giám sát', 'Đầu ghi hình DVR / XVR', 'dau-ghi-hinh-dvr-xvr', 5, ['KBVISION', 'Hikvision', 'Dahua', 'Uniview'], ['DVR XVR recorder', 'digital video recorder']),
  target(IT, 'Hệ thống Camera giám sát', 'Phụ kiện Camera', 'phu-kien-camera', 4, ['KBVISION', 'Hikvision', 'Dahua', 'Uniview', 'Hanwha Vision', 'Bosch'], ['camera accessory', 'surveillance camera mount']),
  target(IT, undefined, 'Thiết bị hội nghị truyền hình', 'thiet-bi-hoi-nghi-truyen-hinh', 8, ['Logitech', 'Yealink', 'Poly', 'Cisco', 'Jabra', 'Aver'], ['video conferencing system', 'conference room camera']),
  target(IT, undefined, 'Máy chiếu & thiết bị trình chiếu', 'may-chieu-thiet-bi-trinh-chieu', 8, ['Epson', 'BenQ', 'ViewSonic', 'Panasonic Connect', 'Sony', 'Optoma'], ['projector', 'business projector']),
  target(IT, undefined, 'Thiết bị ngoại vi', 'thiet-bi-ngoai-vi', 12, ['Logitech', 'Dell', 'HP', 'Lenovo', 'Microsoft', 'Rapoo', 'Kingston'], ['computer peripheral', 'keyboard mouse webcam']),

  target(SOLAR, undefined, 'Tấm pin năng lượng mặt trời', 'tam-pin-nang-luong-mat-troi', 30, ['LONGi', 'Jinko Solar', 'Canadian Solar', 'Trina Solar', 'JA Solar', 'Astronergy', 'Risen Energy'], ['solar module', 'photovoltaic panel']),
  target(SOLAR, undefined, 'Bộ hòa lưới Inverter', 'inverter-hoa-luoi', 35, ['Huawei', 'Sungrow', 'SMA', 'Growatt', 'GoodWe', 'Solis', 'Fronius'], ['grid-tied solar inverter', 'on-grid inverter']),
  target(SOLAR, undefined, 'Inverter Hybrid', 'inverter-hybrid', 25, ['Deye', 'Huawei', 'Sungrow', 'Growatt', 'GoodWe', 'Solis'], ['hybrid solar inverter', 'battery inverter']),
  target(SOLAR, undefined, 'Bộ tối ưu công suất – Optimizer', 'bo-toi-uu-cong-suat-optimizer', 10, ['Huawei', 'SolarEdge', 'Tigo', 'SMA'], ['solar power optimizer', 'PV optimizer']),
  target(SOLAR, undefined, 'Tủ điện năng lượng mặt trời', 'tu-dien-nang-luong-mat-troi', 12, ['Schneider Electric', 'ABB', 'LS Electric', 'Siemens', 'Chint', 'Mitsubishi Electric'], ['solar combiner box', 'PV electrical cabinet']),
  target(SOLAR, undefined, 'Thiết bị bảo vệ điện mặt trời', 'thiet-bi-bao-ve-dien-mat-troi', 15, ['Schneider Electric', 'ABB', 'Siemens', 'LS Electric', 'Chint', 'Phoenix Contact', 'DEHN'], ['solar surge protection', 'PV circuit breaker']),
  target(SOLAR, undefined, 'Cáp & đầu nối Solar', 'cap-dau-noi-solar', 15, ['Stäubli', 'LAPP', 'HELUKABEL', 'CADIVI', 'LS', 'Leader Solar', 'Amphenol'], ['solar cable connector', 'PV cable MC4']),
  target(SOLAR, undefined, 'Hệ khung giá đỡ Solar', 'he-khung-gia-do-solar', 10, ['Schletter', 'Clenergy', 'K2 Systems', 'Antaisolar', 'Kseng', 'Grace Solar'], ['solar mounting system', 'PV racking']),
  target(SOLAR, undefined, 'Thiết bị giám sát & đo đếm', 'thiet-bi-giam-sat-do-dem', 8, ['Huawei', 'Sungrow', 'SolarEdge', 'SMA', 'Schneider Electric', 'Carlo Gavazzi'], ['solar monitoring device', 'PV data logger']),
  target(SOLAR, undefined, 'Công tơ & thiết bị đo điện', 'cong-to-thiet-bi-do-dien', 5, ['Schneider Electric', 'ABB', 'Siemens', 'Janitza', 'Socomec', 'Carlo Gavazzi', 'Chint'], ['power meter', 'energy meter']),
  target(SOLAR, undefined, 'Thiết bị vệ sinh tấm pin', 'thiet-bi-ve-sinh-tam-pin', 5, ['Kärcher', 'Ecoppia', 'SunBrush', 'SolarCleano', 'hyCLEANER'], ['solar panel cleaning equipment', 'PV cleaning robot']),

  target(STORAGE, undefined, 'Ắc quy Lithium LiFePO4', 'ac-quy-lithium-lifepo4', 35, ['Pylontech', 'BYD', 'CATL', 'Huawei', 'Deye', 'Dyness', 'Growatt', 'Sungrow', 'Narada'], ['LiFePO4 battery', 'lithium energy storage battery']),
  target(STORAGE, undefined, 'Ắc quy chì VRLA / AGM', 'ac-quy-chi-vrla', 30, ['CSB', 'Yuasa', 'Panasonic', 'Leoch', 'Fiamm', 'Exide', 'Rocket', 'Vision', 'Narada'], ['VRLA AGM battery', 'sealed lead acid battery']),
  target(STORAGE, undefined, 'Ắc quy nước Traction', 'ac-quy-nuoc-traction', 20, ['Trojan', 'Hoppecke', 'EnerSys', 'TAB', 'Crown', 'Rolls', 'GS Yuasa'], ['traction battery', 'flooded lead acid battery']),
];

const BRAND_OVERRIDES: Array<{ pattern: RegExp; brand: string }> = [
  { pattern: /^HP Aruba\b/i, brand: 'Aruba' },
  { pattern: /^Asterisk-based FreePBX\b/i, brand: 'FreePBX' },
  { pattern: /^GS Yuasa\b/i, brand: 'GS Yuasa' },
];

const TRUSTED_DISTRIBUTOR_DOMAINS = [
  'fs.com', 'cdw.com', 'provantage.com', 'mouser.com', 'digikey.com',
  'rs-online.com', 'farnell.com', 'alliedelec.com', 'shi.com', 'insight.com',
  'senetic.com', 'networktigers.com', 'router-switch.com', '4gon.co.uk',
];

const BLOCKED_SOURCE_DOMAINS = [
  'facebook.com', 'pinterest.com', 'instagram.com', 'tiktok.com', 'youtube.com',
  'shopee.', 'lazada.', 'aliexpress.', 'amazon.', 'ebay.', 'walmart.',
  'encrypted-tbn', 'gstatic.com', 'google.com', 'googleusercontent.com',
];

// =============================================================================
// Tiện ích chung
// =============================================================================
function envBool(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function envInt(name: string, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(process.env[name] || '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function slugify(value: string): string {
  return value
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function clip(value: string, max: number): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.replace(/\s+\S*$/, '')}…`;
}

function stableNumber(value: string): number {
  return Number.parseInt(crypto.createHash('sha1').update(value).digest('hex').slice(0, 8), 16);
}

function detectBrand(productName: string): string {
  const override = BRAND_OVERRIDES.find((item) => item.pattern.test(productName));
  if (override) return override.brand;

  const normalized = productName.toLowerCase();
  const match = BRAND_PREFIXES.find((brand) => normalized.startsWith(brand.toLowerCase()));
  if (match) return match;

  return productName.split(/\s+/).slice(0, 2).join(' ');
}

// Chỉ dùng khi catalog đã được đối chiếu với hãng. Không thêm mã suy đoán vào đây.
const PART_NUMBER_OVERRIDES: Record<string, string> = {
  'Màn hình di động cảm ứng VSP VP1560FST1 (15.6 inch/FHD/IPS/62Hz/5ms/loa)': 'VP1560FST1',
};

const NON_PART_NUMBER_PATTERNS = [
  /^\d+(?:[.,]\d+)?(?:INCH|HZ|KHZ|MHZ|GHZ|MS|W|KW|V|KV|AH|MAH|GB|TB|MBPS|GBPS|M|KM)$/i,
  /^(?:CAT|CATEGORY)\d+[A-Z]?$/i,
  /^(?:WIFI|WI-FI)\d+[A-Z]?$/i,
  /^\d+(?:G|GE|PORT|CORE|CH|CHANNEL)$/i,
  /^\d+FO$/i,
  /^\d+U$/i,
  /^(?:OM[1-5]|OS[12]|G65\d+[A-Z]?|RJ\d+|VDSL\d*|ADSL\d*)$/i,
  /^(?:I[3579]|GEN\d+|G\d{1,2})$/i,
  /^(?:I[3579]|RYZEN\d+)-[A-Z0-9-]+$/i,
  /^(?:FHD|UHD|IPS|LCD|LED|OLED|POE|UTP|STP|FTP|SFTP)$/i,
];

const SERIES_WORDS = new Set([
  'VIGOR', 'PROLIANT', 'POWEREDGE', 'OPTIPLEX', 'PRECISION', 'LATITUDE', 'ELITEDESK', 'ELITEBOOK', 'PRODESK', 'THINKCENTRE',
  'THINKPAD', 'OMADA', 'UNIFI', 'CATALYST', 'SUN2000', 'HIKU', 'TIGER', 'NEO', 'PRIMO',
]);

const MODEL_SUFFIX_PATTERNS = [
  /^(?:GEN|G)\d+[A-Z-]*$/i,
  /^[A-Z]\d{1,3}$/i,
  /^(?:PLUS|PRO|MAX|MINI)$/i,
];

function cleanIdentityToken(value: string): string {
  return value.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9+._/-]+$/g, '');
}

function looksLikeMeasurementOrStandard(token: string): boolean {
  return NON_PART_NUMBER_PATTERNS.some((pattern) => pattern.test(token));
}

function extractPartNumber(productName: string, brand: string): string {
  const override = PART_NUMBER_OVERRIDES[productName];
  if (override) return override;

  // Phần trong ngoặc thường là kích thước/tần số/cấu hình, không phải mã hàng.
  const identityText = productName.split(/[([]/, 1)[0].trim();
  const tokens = (identityText.match(/[A-Za-z0-9À-ỹ][A-Za-z0-9À-ỹ+._/-]*/g) || [])
    .map(cleanIdentityToken)
    .filter(Boolean);
  const brandTokens = new Set(
    normalizeEvidenceText(brand).split(' ').filter(Boolean),
  );

  const candidates = tokens.map((token, index) => {
    const normalized = normalizeEvidenceText(token).replace(/\s+/g, '');
    const hasLetter = /[A-Z]/.test(normalized);
    const hasDigit = /\d/.test(normalized);
    const isBrandToken = brandTokens.has(normalized);
    const rejected = isBrandToken || looksLikeMeasurementOrStandard(token);
    let score = rejected ? -10_000 : 0;
    if (hasLetter && hasDigit) score += 80;
    if (/[-+._/]/.test(token)) score += 25;
    if (/^[A-Z0-9+._/-]+$/.test(token)) score += 15;
    if ((token.match(/\d/g) || []).length >= 2) score += 15;
    score += Math.min(token.length, 24);
    return { token, normalized, index, hasLetter, hasDigit, score };
  });

  const mixed = candidates
    .filter((item) => item.hasLetter && item.hasDigit && item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)[0];

  if (mixed) {
    const previous = tokens[mixed.index - 1];
    const next = tokens[mixed.index + 1];
    const parts: string[] = [];
    if (
      previous &&
      (SERIES_WORDS.has(normalizeEvidenceText(previous)) || (mixed.token.length <= 4 && /[a-z][A-Z]/.test(previous)))
    ) {
      parts.push(previous);
    }
    parts.push(mixed.token);
    if (next && MODEL_SUFFIX_PATTERNS.some((pattern) => pattern.test(next))) parts.push(next);
    return clip(parts.join(' '), 80);
  }

  // Part number thuần số có dấu phân tách, ví dụ Dintek 1501-88027.
  const structuredNumeric = candidates
    .filter((item) => /^\d{3,}(?:[-./]\d{2,})+$/.test(item.token) && item.score > -10_000)
    .sort((a, b) => b.token.length - a.token.length || a.index - b.index)[0];
  if (structuredNumeric) return structuredNumeric.token;

  // Một số model chính thức là chuỗi chữ viết hoa có cấu trúc, ví dụ UAP-AC-HD.
  const structuredAlpha = candidates
    .filter((item) => !item.hasDigit && /^[A-Z]{2,}(?:-[A-Z]{2,}){2,}$/.test(item.token) && item.score > -10_000)
    .sort((a, b) => b.token.length - a.token.length || a.index - b.index)[0];
  if (structuredAlpha) return structuredAlpha.token;

  const longAlpha = candidates
    .filter((item) => !item.hasDigit && /^[A-Z]{8,}$/.test(item.token) && item.score > -10_000)
    .sort((a, b) => b.token.length - a.token.length || a.index - b.index)[0];
  if (longAlpha) return longAlpha.token;

  // Một số hãng dùng part number chỉ gồm dãy số dài, ví dụ CommScope/3M.
  const numeric = candidates
    .filter((item) => /^\d{6,16}$/.test(item.token))
    .sort((a, b) => b.token.length - a.token.length || a.index - b.index)[0];
  if (numeric) return numeric.token;

  // Model dạng series + số rời, ví dụ DrayTek Vigor 2952.
  for (let index = 1; index < tokens.length; index += 1) {
    const current = tokens[index];
    const previous = tokens[index - 1];
    if (/^\d{3,5}[A-Z]?$/.test(current) && SERIES_WORDS.has(normalizeEvidenceText(previous))) {
      return `${previous} ${current}`;
    }
    if (/^\d{3,5}[A-Z]?$/.test(current) && brandTokens.has(normalizeEvidenceText(previous))) {
      return current;
    }
  }

  // Tên model thương mại dạng camelCase, ví dụ MikroTik cAP/hAP/mAP.
  const camelIndex = tokens.findIndex((token) => /[a-z][A-Z]{2,}/.test(token));
  if (camelIndex >= 0) {
    const next = tokens[camelIndex + 1];
    return next && /^[A-Za-z0-9+-]{2,8}$/.test(next)
      ? `${tokens[camelIndex]} ${next}`
      : tokens[camelIndex];
  }

  throw new Error(`Không tìm thấy part number/model đủ tin cậy trong tên sản phẩm: ${productName}`);
}

function extractModel(productName: string, brand: string): string {
  return extractPartNumber(productName, brand);
}

function assertPartNumberParser(): void {
  const cases = [
    {
      productName: 'Màn hình di động cảm ứng VSP VP1560FST1 (15.6 inch/FHD/IPS/62Hz/5ms/loa)',
      expected: 'VP1560FST1',
    },
    { productName: 'MikroTik RB960PGS hEX PoE', expected: 'RB960PGS' },
    { productName: 'DrayTek Vigor 2952 Dual WAN', expected: 'Vigor 2952' },
    { productName: 'Ubiquiti UAP-AC-HD UniFi', expected: 'UAP-AC-HD' },
  ];
  for (const testCase of cases) {
    const actual = extractPartNumber(testCase.productName, detectBrand(testCase.productName));
    if (actual !== testCase.expected) {
      throw new Error(`Part number parser sai: "${testCase.productName}" => "${actual}", cần "${testCase.expected}".`);
    }
  }
}

function hostname(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function hostMatches(host: string, domain: string): boolean {
  const normalized = domain.toLowerCase().replace(/^www\./, '');
  return host === normalized || host.endsWith(`.${normalized}`);
}

function isBlockedSource(...values: string[]): boolean {
  const text = values.join(' ').toLowerCase();
  return BLOCKED_SOURCE_DOMAINS.some((domain) => text.includes(domain));
}

function strongModelTokens(productName: string, brand: string): string[] {
  const brandWords = new Set(brand.toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean));
  return productName
    .toUpperCase()
    .split(/[^A-Z0-9+.-]+/)
    .map((token) => token.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((token) => token.length >= 3)
    .filter((token) => !brandWords.has(token))
    .filter((token) => /\d/.test(token) || /[-+.]/.test(token));
}

function normalizeEvidenceText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function evaluateTextMatch(text: string, productName: string, brand: string): ImageMatchEvidence {
  const normalizedText = normalizeEvidenceText(text);
  const model = extractModel(productName, brand);
  const normalizedModel = normalizeEvidenceText(model);
  const modelCompact = normalizedModel.replace(/\s+/g, '');
  const textCompact = normalizedText.replace(/\s+/g, '');
  const tokens = strongModelTokens(productName, brand).map(normalizeEvidenceText).filter(Boolean);
  const matchedTokens = tokens.filter((token) => normalizedText.includes(token) || textCompact.includes(token.replace(/\s+/g, '')));
  const missingTokens = tokens.filter((token) => !matchedTokens.includes(token));
  const brandMatched = normalizeEvidenceText(brand)
    .split(' ')
    .filter((word) => word.length >= 2)
    .every((word) => normalizedText.includes(word));
  const exactModel = modelCompact.length >= 4 && textCompact.includes(modelCompact);

  if (exactModel) {
    return { score: 100, method: 'exact-model', exactModel, brandMatched, matchedTokens, missingTokens };
  }

  if (tokens.length > 0 && matchedTokens.length === tokens.length) {
    return { score: 92, method: 'all-model-tokens', exactModel, brandMatched, matchedTokens, missingTokens };
  }

  if (tokens.length > 0) {
    const ratio = matchedTokens.length / tokens.length;
    const score = Math.round(45 + ratio * 45 + (brandMatched ? 5 : 0));
    return { score, method: 'partial-model-tokens', exactModel, brandMatched, matchedTokens, missingTokens };
  }

  const stopWords = new Set(['CHINH', 'HANG', 'PRODUCT', 'OFFICIAL', 'SERIES', 'THIET', 'BI', 'SAN', 'PHAM']);
  const productWords = normalizeEvidenceText(productName)
    .split(' ')
    .filter((word) => word.length >= 3 && !stopWords.has(word));
  const matchedWords = productWords.filter((word) => normalizedText.includes(word));
  const ratio = productWords.length > 0 ? matchedWords.length / productWords.length : 0;
  const score = Math.round(40 + ratio * 45 + (brandMatched ? 5 : 0));
  return {
    score,
    method: 'product-name-words',
    exactModel,
    brandMatched,
    matchedTokens: matchedWords,
    missingTokens: productWords.filter((word) => !matchedWords.includes(word)),
  };
}

function evaluateImageCandidate(candidate: ImageCandidate, productName: string, brand: string): ImageMatchEvidence {
  return evaluateTextMatch(
    `${candidate.title} ${candidate.sourcePage} ${candidate.imageUrl}`,
    productName,
    brand,
  );
}

function candidateMatchesProduct(candidate: ImageCandidate, productName: string, brand: string): boolean {
  return evaluateImageCandidate(candidate, productName, brand).score >= MIN_IMAGE_MATCH_SCORE;
}

function absoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`;
}

function imageExtension(contentType: string, url: string): string {
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('avif')) return '.avif';
  if (contentType.includes('gif')) return '.gif';
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'].includes(ext) ? ext : '.jpg';
}

function sniffImage(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const hex = Buffer.from(bytes.slice(0, 12)).toString('hex');
  const ascii = Buffer.from(bytes.slice(0, 12)).toString('ascii');
  return (
    hex.startsWith('ffd8ff') ||
    hex.startsWith('89504e470d0a1a0a') ||
    ascii.startsWith('GIF87a') ||
    ascii.startsWith('GIF89a') ||
    (ascii.slice(0, 4) === 'RIFF' && ascii.slice(8, 12) === 'WEBP') ||
    ascii.slice(4, 12).includes('ftypavif')
  );
}

async function readResponseBytes(response: Response, maxBytes: number, truncate = false): Promise<Buffer> {
  const reader = response.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      if (!next.value) continue;
      const chunk = Buffer.from(next.value);
      if (total + chunk.length > maxBytes) {
        if (!truncate) throw new Error(`Phản hồi vượt giới hạn ${maxBytes} bytes`);
        const remaining = maxBytes - total;
        if (remaining > 0) chunks.push(chunk.subarray(0, remaining));
        total = maxBytes;
        break;
      }
      total += chunk.length;
      chunks.push(chunk);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  return Buffer.concat(chunks);
}

function readImageDimensions(bytes: Buffer): { width?: number; height?: number } {
  if (bytes.length < 24) return {};

  if (bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }

  const signature = bytes.subarray(0, 6).toString('ascii');
  if (signature === 'GIF87a' || signature === 'GIF89a') {
    return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
  }

  if (bytes.subarray(0, 2).equals(Buffer.from([0xff, 0xd8]))) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2;
        continue;
      }
      const length = bytes.readUInt16BE(offset + 2);
      if (length < 2 || offset + 2 + length > bytes.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }

  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') {
    const chunkType = bytes.subarray(12, 16).toString('ascii');
    if (chunkType === 'VP8X' && bytes.length >= 30) {
      const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
      const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
      return { width, height };
    }
  }

  return {};
}

function categoryProfile(slug: string) {
  const explicit = CATEGORY_PROFILE[slug];
  if (explicit) return explicit;
  const targetItem = CATEGORY_TARGETS.find((item) => item.slug === slug);
  if (!targetItem) return DEFAULT_PROFILE;
  const applicationsByPillar: Record<string, string[]> = {
    [TELCO]: ['mạng doanh nghiệp', 'hạ tầng viễn thông', 'Data Center', 'kết nối nhà máy'],
    [IT]: ['văn phòng doanh nghiệp', 'số hóa vận hành', 'Data Center', 'hệ thống chuyên dụng'],
    [SOLAR]: ['điện mặt trời C&I', 'nhà xưởng', 'hệ thống rooftop', 'giám sát năng lượng'],
    [STORAGE]: ['nguồn dự phòng', 'UPS', 'viễn thông', 'lưu trữ năng lượng'],
  };
  return {
    summary: `nhóm ${targetItem.category.toLowerCase()} có model và part number được đối chiếu trực tiếp từ website hãng`,
    applications: applicationsByPillar[targetItem.level1] || DEFAULT_PROFILE.applications,
    selection: `model/part number, thông số ${targetItem.searchTerms.join(' và ')}, khả năng tương thích, datasheet đúng revision, điều kiện môi trường và tiến độ giao hàng`,
    entityType: 'Product',
  };
}

function categoryPath(slug: string, fallbackCategory: string): string[] {
  return CATEGORY_PATHS[slug] || [fallbackCategory];
}

function assertCatalog(): void {
  assertPartNumberParser();
  const products = ACTIVE_PRODUCT_CATALOG.flatMap((group) => group.products.map((name) => ({ name, slug: group.slug })));
  if (products.length < MIN_TOTAL_PRODUCTS || products.length > MAX_TOTAL_PRODUCTS) {
    throw new Error(
      `Catalog V6 phải nằm trong ${MIN_TOTAL_PRODUCTS}–${MAX_TOTAL_PRODUCTS} sản phẩm thật, hiện có ${products.length}. ` +
      `Không tạo sản phẩm giả để bù; xem ${DISCOVERY_REPORT_FILE}.`,
    );
  }
  if (ACTIVE_PRODUCT_CATALOG.length !== CATEGORY_TARGETS.length) {
    throw new Error(`Catalog phải có ${CATEGORY_TARGETS.length} danh mục lá, hiện có ${ACTIVE_PRODUCT_CATALOG.length}.`);
  }

  const normalized = new Map<string, string>();
  for (const product of products) {
    const key = slugify(product.name);
    if (!key) throw new Error(`Tên sản phẩm không hợp lệ: ${product.name}`);
    const duplicate = normalized.get(key);
    if (duplicate) throw new Error(`Trùng sản phẩm: "${duplicate}" và "${product.name}".`);
    normalized.set(key, product.name);
  }

  for (const group of ACTIVE_PRODUCT_CATALOG) {
    if (group.products.length !== group.quota) {
      throw new Error(`Sai quota danh mục ${group.category}: quota=${group.quota}, products=${group.products.length}`);
    }
    if (!CATEGORY_PATHS[group.slug]) {
      throw new Error(`Thiếu đường dẫn cây danh mục cho slug: ${group.slug}`);
    }
    const targetItem = CATEGORY_TARGETS.find((item) => item.slug === group.slug);
    if (!targetItem) throw new Error(`Nhóm ${group.slug} không thuộc CATEGORY_TARGETS.`);
    const minimum = Math.ceil(targetItem.quota * MIN_CATEGORY_COVERAGE_PERCENT / 100);
    if (group.products.length < minimum) {
      throw new Error(
        `${group.category} mới có ${group.products.length}/${targetItem.quota}, thấp hơn mức tối thiểu ` +
        `${MIN_CATEGORY_COVERAGE_PERCENT}% (${minimum}). Không bịa model để bù quota.`,
      );
    }
  }
}

function auditCatalogPartNumbers(items: Array<{ name: string; group: CatalogGroup }>) {
  const seen = new Map<string, string>();
  const rows: Array<{
    productName: string;
    category: string;
    brand: string;
    partNumber: string | null;
    status: 'valid' | 'missing' | 'duplicate';
    error?: string;
  }> = [];

  for (const { name, group } of items) {
    const brand = detectBrand(name);
    try {
      const partNumber = extractPartNumber(name, brand);
      const normalizedPartNumber = normalizeEvidenceText(partNumber).replace(/\s+/g, '');
      const key = `${normalizeEvidenceText(brand)}::${normalizedPartNumber}`;
      if (!normalizedPartNumber || /^CTC-/i.test(partNumber)) throw new Error(`Part number không hợp lệ: ${partNumber}`);
      const duplicateOf = seen.get(key);
      if (duplicateOf) {
        rows.push({
          productName: name,
          category: group.category,
          brand,
          partNumber,
          status: 'duplicate',
          error: `Trùng part number với sản phẩm: ${duplicateOf}`,
        });
        continue;
      }
      seen.set(key, name);
      rows.push({ productName: name, category: group.category, brand, partNumber, status: 'valid' });
    } catch (error) {
      rows.push({
        productName: name,
        category: group.category,
        brand,
        partNumber: null,
        status: 'missing',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    total: rows.length,
    valid: rows.filter((item) => item.status === 'valid').length,
    missing: rows.filter((item) => item.status === 'missing').length,
    duplicate: rows.filter((item) => item.status === 'duplicate').length,
    rows,
  };
}

// =============================================================================
// Cache ảnh
// =============================================================================
let imageCache: Record<string, VerifiedImage> = {};

async function loadImageCache(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(IMAGE_CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    imageCache = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    imageCache = {};
  }
}

async function saveImageCache(): Promise<void> {
  const temp = `${IMAGE_CACHE_FILE}.tmp`;
  await fs.writeFile(temp, JSON.stringify(imageCache, null, 2), 'utf8');
  await fs.rename(temp, IMAGE_CACHE_FILE);
}

function sanitizeSerperQuery(query: string): string {
  return query
    .replace(/site:/gi, ' ')
    .replace(/filetype:/gi, ' ')
    .replace(/inurl:/gi, ' ')
    .replace(/intitle:/gi, ' ')
    .replace(/\b(OR|AND)\b/g, ' ')
    .replace(/["\/::\[\]()\\+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// =============================================================================
// Google Images qua Serper và kiểm chứng ảnh
// =============================================================================
async function searchGoogleImages(query: string): Promise<ImageCandidate[]> {
  if (!SERPER_API_KEY) {
    throw new Error('Thiếu SERPER_API_KEY. Script không dùng ảnh mẫu hoặc ảnh rỗng để thay thế.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: sanitizeSerperQuery(query), gl: 'vn', hl: 'vi', num: SERPER_RESULTS }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Serper Images HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json() as { images?: any[] };
    return (data.images || []).map((item, index) => ({
      title: String(item.title || ''),
      imageUrl: String(item.imageUrl || ''),
      thumbnailUrl: item.thumbnailUrl ? String(item.thumbnailUrl) : undefined,
      sourcePage: String(item.link || ''),
      sourceDomain: String(item.domain || hostname(String(item.link || ''))),
      imageWidth: Number(item.imageWidth) || undefined,
      imageHeight: Number(item.imageHeight) || undefined,
      position: Number(item.position) || index + 1,
    }));
  } finally {
    clearTimeout(timer);
  }
}

function scoreCandidate(candidate: ImageCandidate, productName: string, brand: string): number {
  if (!candidate.imageUrl || !candidate.sourcePage) return -10_000;
  if (isBlockedSource(candidate.imageUrl, candidate.sourcePage, candidate.sourceDomain)) return -10_000;
  const matchEvidence = evaluateImageCandidate(candidate, productName, brand);
  if (matchEvidence.score < MIN_IMAGE_MATCH_SCORE) return -5_000;

  const sourceHost = hostname(candidate.sourcePage) || candidate.sourceDomain.toLowerCase();
  const official = (BRAND_DOMAINS[brand] || []).some((domain) => hostMatches(sourceHost, domain));
  const trusted = TRUSTED_DISTRIBUTOR_DOMAINS.some((domain) => hostMatches(sourceHost, domain));

  if (REQUIRE_OFFICIAL_IMAGE && !official) return -10_000;

  let score = official ? 1_000 : trusted ? 600 : 250;
  score += matchEvidence.score * 5;
  if ((candidate.imageWidth || 0) >= 1_000) score += 80;
  else if ((candidate.imageWidth || 0) >= MIN_IMAGE_WIDTH) score += 40;
  if ((candidate.imageHeight || 0) >= 700) score += 60;
  else if ((candidate.imageHeight || 0) >= MIN_IMAGE_HEIGHT) score += 30;
  if (/\.(jpe?g|png|webp|avif)(\?|$)/i.test(candidate.imageUrl)) score += 20;
  score += Math.max(0, 20 - (candidate.position || 20));
  return score;
}

type ImageValidation = {
  ok: boolean;
  contentType: string;
  width?: number;
  height?: number;
  contentHash: string;
  reason?: string;
};

async function validateImageUrl(url: string): Promise<ImageValidation> {
  if (!VALIDATE_REMOTE_IMAGES) {
    return { ok: true, contentType: 'image/unknown', contentHash: crypto.createHash('sha256').update(url).digest('hex') };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 CTCProductImageVerifier/2.0',
        'Range': 'bytes=0-262143',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    if (!response.ok && response.status !== 206) return { ok: false, contentType: '', contentHash: '', reason: `HTTP ${response.status}` };
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!contentType.startsWith('image/')) return { ok: false, contentType, contentHash: '', reason: 'Sai Content-Type' };

    const buffer = await readResponseBytes(response, 512 * 1024, true);
    if (!buffer.length || !sniffImage(buffer)) {
      return { ok: false, contentType, contentHash: '', reason: 'Sai chữ ký ảnh' };
    }
    const dimensions = readImageDimensions(buffer);
    const contentHash = crypto.createHash('sha256').update(buffer).digest('hex');
    return { ok: true, contentType, contentHash, ...dimensions };
  } catch (error) {
    return {
      ok: false,
      contentType: '',
      contentHash: '',
      reason: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function mirrorImage(url: string, productSlug: string, contentType: string): Promise<{
  publicUrl: string;
  localPath: string;
  contentHash: string;
  width?: number;
  height?: number;
}> {
  await fs.mkdir(PUBLIC_IMAGE_DIR, { recursive: true });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS * 2);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 CTCProductImageMirror/2.0',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Tải ảnh HTTP ${response.status}`);

    const responseType = (response.headers.get('content-type') || contentType).split(';')[0].trim().toLowerCase();
    if (!responseType.startsWith('image/')) throw new Error(`Sai Content-Type: ${responseType}`);

    const length = Number(response.headers.get('content-length') || 0);
    if (length > MAX_IMAGE_BYTES) throw new Error(`Ảnh vượt ${MAX_IMAGE_BYTES} bytes`);

    const buffer = await readResponseBytes(response, MAX_IMAGE_BYTES);
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES || !sniffImage(buffer)) {
      throw new Error('Dữ liệu ảnh rỗng, quá lớn hoặc sai định dạng.');
    }

    const fullHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const hash = fullHash.slice(0, 12);
    const dimensions = readImageDimensions(buffer);
    if (dimensions.width && dimensions.width < MIN_IMAGE_WIDTH) {
      throw new Error(`Ảnh quá nhỏ: ${dimensions.width}px < ${MIN_IMAGE_WIDTH}px`);
    }
    if (dimensions.height && dimensions.height < MIN_IMAGE_HEIGHT) {
      throw new Error(`Ảnh quá nhỏ: ${dimensions.height}px < ${MIN_IMAGE_HEIGHT}px`);
    }
    const extension = imageExtension(responseType, url);
    const filename = `${productSlug}-${hash}${extension}`;
    const localPath = path.join(PUBLIC_IMAGE_DIR, filename);
    await fs.writeFile(localPath, buffer);
    return { publicUrl: `${PUBLIC_IMAGE_PREFIX}/${filename}`, localPath, contentHash: fullHash, ...dimensions };
  } finally {
    clearTimeout(timer);
  }
}

async function resolveProductImage(productName: string): Promise<VerifiedImage> {
  const brand = detectBrand(productName);
  const productSlug = slugify(productName);
  const cacheKey = productSlug;
  const cached = imageCache[cacheKey];

  if (
    cached &&
    !REVALIDATE_CACHE &&
    cached.contentHash &&
    cached.matchEvidence?.score >= MIN_IMAGE_MATCH_SCORE
  ) {
    if (!cached.mirrored || !cached.localPath) return cached;
    try {
      const stat = await fs.stat(cached.localPath);
      if (stat.size > 0) return cached;
    } catch {
      // File local mất: tìm/tải lại, không dùng cache mồ côi.
    }
  }

  // Ảnh khai báo trực tiếp trên trang sản phẩm hãng được thử trước kết quả
  // Google Images, nhưng vẫn phải qua kiểm tra bytes, kích thước và model.
  const discovered = discoveredProductByName(productName);
  if (discovered) {
    const directCandidate: ImageCandidate = {
      title: discovered.sourceTitle,
      imageUrl: discovered.imageUrl,
      sourcePage: discovered.productUrl,
      sourceDomain: discovered.sourceDomain,
      position: 0,
    };
    const matchEvidence = evaluateImageCandidate(directCandidate, productName, brand);
    const officialSource = (BRAND_DOMAINS[brand] || []).some((domain) => hostMatches(discovered.sourceDomain, domain));
    if (officialSource && matchEvidence.score >= MIN_IMAGE_MATCH_SCORE) {
      const validation = await validateImageUrl(directCandidate.imageUrl);
      const wideEnough = !validation.width || validation.width >= MIN_IMAGE_WIDTH;
      const tallEnough = !validation.height || validation.height >= MIN_IMAGE_HEIGHT;
      if (validation.ok && wideEnough && tallEnough) {
        let publicUrl = directCandidate.imageUrl;
        let localPath: string | undefined;
        let mirrored = false;
        let contentHash = validation.contentHash;
        let width = validation.width;
        let height = validation.height;
        if (MIRROR_IMAGES) {
          try {
            const result = await mirrorImage(directCandidate.imageUrl, productSlug, validation.contentType);
            publicUrl = result.publicUrl;
            localPath = result.localPath;
            mirrored = true;
            contentHash = result.contentHash;
            width = result.width || width;
            height = result.height || height;
          } catch {
            // URL hãng vẫn hợp lệ; report sẽ ghi mirrored=false.
          }
        }
        const verified: VerifiedImage = {
          query: 'official-product-page-jsonld-or-og-image',
          imageUrl: directCandidate.imageUrl,
          publicUrl,
          sourcePage: directCandidate.sourcePage,
          sourceDomain: directCandidate.sourceDomain,
          title: directCandidate.title,
          width,
          height,
          contentType: validation.contentType,
          officialSource: true,
          verifiedAt: new Date().toISOString(),
          mirrored,
          localPath,
          contentHash,
          matchEvidence,
        };
        imageCache[cacheKey] = verified;
        return verified;
      }
    }
  }

  const officialHint = (BRAND_DOMAINS[brand] || []).join(' ');
  const model = extractModel(productName, brand);
  const queries = [
    `"${productName}" ${officialHint || `${brand} official`} product image`,
    `"${model}" "${brand}" product image`,
    `"${productName}" product`,
    `"${model}" "${brand}" official`,
    `"${productName}"`,
  ];

  for (const query of queries) {
    try {
      const candidates = await searchGoogleImages(query);
      const ranked = candidates
        .map((candidate) => ({ candidate, score: scoreCandidate(candidate, productName, brand) }))
        .filter((item) => item.score > -5_000)
        .sort((a, b) => b.score - a.score);

      for (const item of ranked.slice(0, 8)) {
        const candidate = item.candidate;
        const matchEvidence = evaluateImageCandidate(candidate, productName, brand);
        if (matchEvidence.score < MIN_IMAGE_MATCH_SCORE) continue;
        const validation = await validateImageUrl(candidate.imageUrl);
        if (!validation.ok) continue;

        const candidateWidth = validation.width || candidate.imageWidth;
        const candidateHeight = validation.height || candidate.imageHeight;
        if (candidateWidth && candidateWidth < MIN_IMAGE_WIDTH) continue;
        if (candidateHeight && candidateHeight < MIN_IMAGE_HEIGHT) continue;

        const sourceHost = hostname(candidate.sourcePage) || candidate.sourceDomain.toLowerCase();
        const officialSource = (BRAND_DOMAINS[brand] || []).some((domain) => hostMatches(sourceHost, domain));

        let publicUrl = candidate.imageUrl;
        let localPath: string | undefined;
        let mirrored = false;
        let contentHash = validation.contentHash;
        let width = candidateWidth;
        let height = candidateHeight;
        if (MIRROR_IMAGES) {
          try {
            const result = await mirrorImage(candidate.imageUrl, productSlug, validation.contentType);
            publicUrl = result.publicUrl;
            localPath = result.localPath;
            mirrored = true;
            contentHash = result.contentHash;
            width = result.width || width;
            height = result.height || height;
          } catch {
            // URL từ xa vẫn đã qua kiểm tra; ghi rõ mirrored=false trong evidence.
          }
        }

        const verified: VerifiedImage = {
          query,
          imageUrl: candidate.imageUrl,
          publicUrl,
          sourcePage: candidate.sourcePage,
          sourceDomain: sourceHost,
          title: candidate.title,
          width,
          height,
          contentType: validation.contentType,
          officialSource,
          verifiedAt: new Date().toISOString(),
          mirrored,
          localPath,
          contentHash,
          matchEvidence,
        };
        imageCache[cacheKey] = verified;
        return verified;
      }
    } catch {
      // Tiếp tục thử query kế tiếp
    }
  }

  throw new Error(
    `Không tìm thấy ảnh đủ điều kiện cho ${productName}: cần score khớp model >= ${MIN_IMAGE_MATCH_SCORE}, ` +
    `đúng định dạng và tối thiểu ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px.`,
  );
}






async function resolveAllImages(items: Array<{ name: string }>): Promise<{ ok: Map<string, VerifiedImage>; failed: Array<{ name: string; error: string }> }> {
  const ok = new Map<string, VerifiedImage>();
  const failed: Array<{ name: string; error: string }> = [];

  for (let start = 0; start < items.length; start += IMAGE_CONCURRENCY) {
    const batch = items.slice(start, start + IMAGE_CONCURRENCY);
    const results = await Promise.all(batch.map(async (item) => {
      try {
        const image = await resolveProductImage(item.name);
        return { item, image } as const;
      } catch (error) {
        return { item, error: error instanceof Error ? error.message : String(error) } as const;
      }
    }));

    for (const result of results) {
      if ('image' in result) ok.set(result.item.name, result.image);
      else failed.push({ name: result.item.name, error: result.error });
    }

    await saveImageCache();
    const done = Math.min(start + batch.length, items.length);
    if (done % 25 === 0 || done === items.length) {
      console.log(`🖼️  Đã kiểm tra ${done}/${items.length} sản phẩm | đạt: ${ok.size} | lỗi: ${failed.length}`);
    }
  }

  return { ok, failed };
}

// =============================================================================
// Nguồn xác thực sản phẩm cho GEO
// =============================================================================
let evidenceCache: Record<string, ProductEvidenceBundle> = {};

async function loadEvidenceCache(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(EVIDENCE_CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    evidenceCache = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    evidenceCache = {};
  }
}

async function saveEvidenceCache(): Promise<void> {
  const temp = `${EVIDENCE_CACHE_FILE}.tmp`;
  await fs.writeFile(temp, JSON.stringify(evidenceCache, null, 2), 'utf8');
  await fs.rename(temp, EVIDENCE_CACHE_FILE);
}

type WebSearchResult = {
  title: string;
  link: string;
  snippet: string;
  position: number;
};

async function searchGoogleWeb(query: string, resultCount = 10): Promise<WebSearchResult[]> {
  if (!SERPER_API_KEY) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: sanitizeSerperQuery(query), gl: 'vn', hl: 'vi', num: Math.min(20, Math.max(1, resultCount)) }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Serper Search HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json() as { organic?: any[] };
    return (data.organic || []).map((item, index) => ({
      title: String(item.title || ''),
      link: String(item.link || ''),
      snippet: String(item.snippet || ''),
      position: Number(item.position) || index + 1,
    }));
  } finally {
    clearTimeout(timer);
  }
}

type ValidatedSourcePage = {
  ok: boolean;
  contentType: string;
  finalUrl: string;
  text: string;
  contentHash: string;
  lastModified?: string;
  rawHtml?: string;
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function htmlToEvidenceText(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(?:br|\/p|\/div|\/li|\/tr|\/td|\/th|\/h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

async function validateSourcePage(url: string): Promise<ValidatedSourcePage> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 CTCProductEvidenceVerifier/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.5',
        'Range': `bytes=0-${MAX_SOURCE_BYTES - 1}`,
      },
      signal: controller.signal,
    });
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const okStatus = response.ok || response.status === 206;
    const okType = contentType.includes('text/html') || contentType.includes('application/xhtml+xml') || contentType.includes('application/pdf');
    if (!okStatus || !okType) {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false, contentType, finalUrl: response.url || url, text: '', contentHash: '' };
    }
    const bytes = await readResponseBytes(response, MAX_SOURCE_BYTES, true);
    const isHtml = contentType.includes('html');
    const rawHtml = isHtml ? bytes.toString('utf8') : '';
    const text = isHtml ? htmlToEvidenceText(rawHtml) : '';
    return {
      ok: bytes.length > 0,
      contentType,
      finalUrl: response.url || url,
      text,
      contentHash: crypto.createHash('sha256').update(bytes).digest('hex'),
      lastModified: response.headers.get('last-modified') || undefined,
      rawHtml: isHtml ? rawHtml : undefined,
    };
  } catch {
    return { ok: false, contentType: '', finalUrl: url, text: '', contentHash: '' };
  } finally {
    clearTimeout(timer);
  }
}

// =============================================================================
// V6 — khám phá catalog thật từ trang hãng
// =============================================================================
let discoveryCache: DiscoveryCache = {};
let discoveryQueryCount = 0;

function assertTargetConfig(): void {
  assertDiscoveryParser();
  const expectedByLevel1: Record<string, number> = {
    [TELCO]: 230,
    [IT]: 365,
    [SOLAR]: 170,
    [STORAGE]: 85,
  };
  if (CATEGORY_TARGETS.length !== 54) {
    throw new Error(`Cấu hình V6 phải có 54 danh mục lá, hiện có ${CATEGORY_TARGETS.length}.`);
  }
  const slugSet = new Set<string>();
  const total = CATEGORY_TARGETS.reduce((sum, item) => sum + item.quota, 0);
  if (total !== TARGET_TOTAL_PRODUCTS) {
    throw new Error(`Tổng quota phải là ${TARGET_TOTAL_PRODUCTS}, hiện có ${total}.`);
  }
  for (const [level1, expected] of Object.entries(expectedByLevel1)) {
    const actual = CATEGORY_TARGETS.filter((item) => item.level1 === level1)
      .reduce((sum, item) => sum + item.quota, 0);
    if (actual !== expected) throw new Error(`Sai quota ${level1}: cần ${expected}, hiện có ${actual}.`);
  }
  for (const item of CATEGORY_TARGETS) {
    if (slugSet.has(item.slug)) throw new Error(`Trùng category slug V6: ${item.slug}`);
    slugSet.add(item.slug);
    if (!CATEGORY_PATHS[item.slug]) throw new Error(`Thiếu CATEGORY_PATHS cho ${item.slug}.`);
    const expectedPath = [item.level1, ...(item.level2 ? [item.level2] : []), item.category];
    if (CATEGORY_PATHS[item.slug].join(' > ') !== expectedPath.join(' > ')) {
      throw new Error(
        `Sai CATEGORY_PATHS ${item.slug}: "${CATEGORY_PATHS[item.slug].join(' > ')}", ` +
        `cần "${expectedPath.join(' > ')}".`,
      );
    }
    if (item.brands.length === 0 || item.searchTerms.length === 0) {
      throw new Error(`Danh mục ${item.category} chưa có brand/search term.`);
    }
    for (const brand of item.brands) {
      if (!(BRAND_DOMAINS[brand] || []).length) {
        throw new Error(`Thương hiệu ${brand} của ${item.category} chưa có domain chính hãng.`);
      }
    }
  }
}

async function loadDiscoveryCache(): Promise<void> {
  try {
    const raw = await fs.readFile(DISCOVERY_CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    discoveryCache = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    discoveryCache = {};
  }
}

async function saveDiscoveryCache(): Promise<void> {
  const temp = `${DISCOVERY_CACHE_FILE}.tmp`;
  await fs.writeFile(temp, JSON.stringify(discoveryCache, null, 2), 'utf8');
  await fs.rename(temp, DISCOVERY_CACHE_FILE);
}

function flattenJsonLd(value: unknown): Record<string, any>[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (!value || typeof value !== 'object') return [];
  const object = value as Record<string, any>;
  return [object, ...flattenJsonLd(object['@graph'])];
}

function parseJsonLd(html: string): Record<string, any>[] {
  const rows: Record<string, any>[] = [];
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(regex)) {
    const raw = decodeHtmlEntities(match[1]).trim();
    if (!raw) continue;
    try {
      rows.push(...flattenJsonLd(JSON.parse(raw)));
    } catch {
      // JSON-LD lỗi trên một block không làm mất các block hợp lệ khác.
    }
  }
  return rows;
}

function assertDiscoveryParser(): void {
  const sample = `<html><head><meta property="og:image" content="https://vsp.vn/images/VP1560FST1.jpg"></head><body>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"Màn hình di động cảm ứng VSP VP1560FST1","mpn":"VP1560FST1","image":"https://vsp.vn/images/VP1560FST1.jpg","additionalProperty":[{"@type":"PropertyValue","name":"Kích thước","value":"15.6 inch"}]}</script>
    <h1>Màn hình di động cảm ứng VSP VP1560FST1</h1><p>Model: VP1560FST1</p></body></html>`;
  const product = parseJsonLd(sample).find((node) => schemaTypeIncludes(node, 'Product'));
  if (!product) throw new Error('Discovery parser không đọc được Product JSON-LD mẫu.');
  const partNumber = productNodePartNumber(product, 'VSP', htmlToEvidenceText(sample));
  if (partNumber !== 'VP1560FST1') {
    throw new Error(`Discovery parser đọc sai mã sản phẩm mẫu: ${partNumber || '(rỗng)'}.`);
  }
  if (metaContent(sample, 'og:image') !== 'https://vsp.vn/images/VP1560FST1.jpg') {
    throw new Error('Discovery parser không đọc được ảnh og:image mẫu.');
  }
}

function schemaTypeIncludes(node: Record<string, any>, expected: string): boolean {
  const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
  return types.some((value) => String(value || '').toLowerCase() === expected.toLowerCase());
}

function metaContent(html: string, key: string): string {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta\\b[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta\\b[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${escaped}["'][^>]*>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1]).trim();
  }
  return '';
}

function htmlHeading(html: string): string {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? htmlToEvidenceText(match[1]).replace(/\s+/g, ' ').trim() : '';
}

function absoluteFromPage(value: unknown, pageUrl: string): string {
  const raw = Array.isArray(value) ? value.find(Boolean) : value;
  if (raw && typeof raw === 'object') {
    return absoluteFromPage((raw as Record<string, unknown>).url || (raw as Record<string, unknown>).contentUrl, pageUrl);
  }
  const stringValue = String(raw || '').trim();
  if (!stringValue || /^data:/i.test(stringValue)) return '';
  try {
    return new URL(stringValue, pageUrl).toString();
  } catch {
    return '';
  }
}

function extractCanonicalUrl(html: string, pageUrl: string): string {
  const match = html.match(/<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["'][^"']*canonical[^"']*["'][^>]*>/i);
  return absoluteFromPage(match?.[1] || pageUrl, pageUrl);
}

function cleanPartNumberCandidate(value: unknown): string {
  return String(value || '')
    .replace(/^(?:MPN|MODEL|SKU|PART(?:\s+NUMBER)?|MÃ\s+SẢN\s+PHẨM)\s*[:#-]?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function looksLikeRealPartNumber(value: string, brand: string, pageText: string): boolean {
  if (!value || value.length < 3 || value.length > 80) return false;
  if (/^CTC-/i.test(value) || /^(?:N\/A|NA|NONE|UNKNOWN|PRODUCT|MODEL)$/i.test(value)) return false;
  if (!/[A-Z0-9]/i.test(value) || /[<>]/.test(value)) return false;
  if (looksLikeMeasurementOrStandard(value.replace(/\s+/g, ''))) return false;
  if (normalizeEvidenceText(value) === normalizeEvidenceText(brand)) return false;
  const compactPage = normalizeEvidenceText(pageText).replace(/\s+/g, '');
  const compactPart = normalizeEvidenceText(value).replace(/\s+/g, '');
  return compactPart.length >= 3 && compactPage.includes(compactPart);
}

function productNodePartNumber(node: Record<string, any>, brand: string, pageText: string): string {
  const modelValue = typeof node.model === 'object' ? node.model?.name || node.model?.value : node.model;
  const candidates = [node.mpn, modelValue, node.productID, node.sku]
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map(cleanPartNumberCandidate)
    .filter(Boolean);
  return candidates.find((value) => looksLikeRealPartNumber(value, brand, pageText)) || '';
}

function extractDatasheetLink(html: string, pageUrl: string, officialDomains: string[]): string | undefined {
  const links: Array<{ href: string; label: string }> = [];
  const regex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(regex)) {
    const href = absoluteFromPage(match[1], pageUrl);
    const label = htmlToEvidenceText(match[2]);
    if (!href || !officialDomains.some((domain) => hostMatches(hostname(href), domain))) continue;
    if (/\.pdf(?:$|[?#])|datasheet|data-sheet|specification|technical.?data/i.test(`${href} ${label}`)) {
      links.push({ href, label });
    }
  }
  return links.sort((a, b) => Number(/\.pdf(?:$|[?#])/i.test(b.href)) - Number(/\.pdf(?:$|[?#])/i.test(a.href)))[0]?.href;
}

function additionalProperties(node: Record<string, any>): Array<{ name: string; value: string }> {
  const values = Array.isArray(node.additionalProperty) ? node.additionalProperty : [node.additionalProperty];
  return values
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      name: String(item.name || item.propertyID || '').replace(/\s+/g, ' ').trim(),
      value: String(item.value || item.valueReference?.name || '').replace(/\s+/g, ' ').trim(),
    }))
    .filter((item) => item.name && item.value && looksLikeSpecificationValue(item.value))
    .slice(0, MAX_VERIFIED_SPECS);
}

function candidateName(rawName: string, brand: string, partNumber: string): string {
  let name = decodeHtmlEntities(rawName)
    .replace(/\s+[|–—-]\s+(?:official.*|product.*|support.*)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!name) name = `${brand} ${partNumber}`;
  if (!normalizeEvidenceText(name).startsWith(normalizeEvidenceText(brand))) name = `${brand} ${name}`;
  const nameCompact = normalizeEvidenceText(name).replace(/\s+/g, '');
  const partCompact = normalizeEvidenceText(partNumber).replace(/\s+/g, '');
  if (!nameCompact.includes(partCompact)) name = `${name} ${partNumber}`;
  return clip(name, 180);
}

function productIdentityKey(product: Pick<DiscoveredProduct, 'brand' | 'partNumber'>): string {
  return `${slugify(product.brand)}::${normalizeEvidenceText(product.partNumber).replace(/\s+/g, '')}`;
}

function discoveryCacheKey(product: Pick<DiscoveredProduct, 'brand' | 'partNumber' | 'categorySlug'>): string {
  return `${product.categorySlug}::${productIdentityKey(product)}`;
}

function discoveredProductByName(productName: string): DiscoveredProduct | undefined {
  return Object.values(discoveryCache).find((item) => item.name === productName);
}

async function discoverFromOfficialPage(
  targetItem: CategoryTarget,
  brand: string,
  result: WebSearchResult,
): Promise<DiscoveredProduct | null> {
  const officialDomains = BRAND_DOMAINS[brand] || [];
  if (!officialDomains.some((domain) => hostMatches(hostname(result.link), domain))) return null;
  const page = await validateSourcePage(result.link);
  if (!page.ok || !page.rawHtml || !officialDomains.some((domain) => hostMatches(hostname(page.finalUrl), domain))) return null;

  const html = page.rawHtml;
  const nodes = parseJsonLd(html);
  const productNodes = nodes.filter((node) => schemaTypeIncludes(node, 'Product'));
  const fallbackNode: Record<string, any> = {};
  const candidateNodes = productNodes.length > 0 ? productNodes : [fallbackNode];
  const pageTitle = metaContent(html, 'og:title') || htmlHeading(html) || result.title;
  const pageImage = metaContent(html, 'og:image') || metaContent(html, 'twitter:image');
  const pageText = `${pageTitle}\n${page.text}`;
  if (productNodes.length === 0 && !/\b(?:model|mpn|sku|part\s*(?:no\.?|number)|mã\s+sản\s+phẩm|thông\s+số)\b/i.test(page.text.slice(0, 80_000))) {
    return null;
  }
  const discontinued = /\b(?:discontinued|end[ -]of[ -]life|end[ -]of[ -]sale|obsolete|legacy product|ngừng (?:sản xuất|kinh doanh))\b/i.test(pageText);
  if (discontinued && !INCLUDE_DISCONTINUED_PRODUCTS) return null;

  for (const node of candidateNodes) {
    let partNumber = productNodePartNumber(node, brand, pageText);
    const rawName = String(node.name || pageTitle || '').trim();
    if (!partNumber) {
      try {
        const parsed = extractPartNumber(candidateName(rawName, brand, ''), brand);
        if (looksLikeRealPartNumber(parsed, brand, pageText)) partNumber = parsed;
      } catch {
        partNumber = '';
      }
    }
    if (!partNumber) continue;
    const name = candidateName(rawName, brand, partNumber);
    const match = evaluateTextMatch(`${pageTitle} ${page.finalUrl} ${page.text.slice(0, 20_000)}`, name, brand);
    if (!match.exactModel || !match.brandMatched) continue;
    const imageUrl = absoluteFromPage(node.image || pageImage, page.finalUrl);
    if (!imageUrl || isBlockedSource(imageUrl)) continue;
    const canonicalUrl = extractCanonicalUrl(html, page.finalUrl);
    const officialCanonical = officialDomains.some((domain) => hostMatches(hostname(canonicalUrl), domain));
    if (!officialCanonical) continue;
    const specifications = additionalProperties(node);
    const datasheetUrl = extractDatasheetLink(html, page.finalUrl, officialDomains);
    const evidenceScore = 70
      + (productNodes.length > 0 ? 10 : 0)
      + (node.mpn ? 8 : node.model ? 6 : node.sku ? 3 : 0)
      + (datasheetUrl ? 5 : 0)
      + (specifications.length > 0 ? 5 : 0)
      + (hostname(imageUrl) === hostname(page.finalUrl) ? 2 : 0);
    return {
      name,
      brand,
      partNumber,
      categorySlug: targetItem.slug,
      productUrl: page.finalUrl,
      canonicalUrl,
      imageUrl,
      datasheetUrl,
      sourceTitle: pageTitle,
      sourceDomain: hostname(page.finalUrl),
      specifications,
      discontinued,
      evidenceScore,
      discoveredAt: new Date().toISOString(),
    };
  }
  return null;
}

async function mapConcurrent<T, R>(items: T[], concurrency: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await work(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(items.length, 1)) }, worker));
  return results;
}

async function discoverCategory(targetItem: CategoryTarget, excludedIdentities: ReadonlySet<string>): Promise<DiscoveredProduct[]> {
  const selected = new Map<string, DiscoveredProduct>();
  for (const product of Object.values(discoveryCache)) {
    if (product.categorySlug !== targetItem.slug || product.discontinued) continue;
    const ageMs = Date.now() - new Date(product.discoveredAt).getTime();
    const fresh = Number.isFinite(ageMs) && ageMs <= DISCOVERY_CACHE_MAX_AGE_DAYS * 86_400_000;
    if (REVALIDATE_DISCOVERY_CACHE || !fresh) continue;
    const identity = productIdentityKey(product);
    if (!excludedIdentities.has(identity)) selected.set(identity, product);
  }
  if (!DISCOVER_PRODUCTS || (selected.size >= targetItem.quota && !REVALIDATE_DISCOVERY_CACHE)) {
    return [...selected.values()].sort((a, b) => b.evidenceScore - a.evidenceScore).slice(0, targetItem.quota);
  }

  const searchJobs = targetItem.brands.flatMap((brand) =>
    targetItem.searchTerms.map((term) => ({ brand, term, domain: BRAND_DOMAINS[brand][0] })),
  );
  const searchResults: Array<{ brand: string; result: WebSearchResult }> = [];
  for (const job of searchJobs) {
    if (selected.size >= targetItem.quota || discoveryQueryCount >= MAX_DISCOVERY_QUERIES) break;
    discoveryQueryCount += 1;
    const query = `${job.domain} ${job.term} product model specifications`;
    const results = await searchGoogleWeb(query, DISCOVERY_RESULTS_PER_QUERY);
    for (const result of results) searchResults.push({ brand: job.brand, result });
  }

  const uniquePages = new Map<string, { brand: string; result: WebSearchResult }>();
  for (const item of searchResults.sort((a, b) => a.result.position - b.result.position || a.brand.localeCompare(b.brand))) {
    const urlKey = item.result.link.replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase();
    if (!uniquePages.has(urlKey)) uniquePages.set(urlKey, item);
  }
  const candidates = [...uniquePages.values()]
    .slice(0, targetItem.quota * DISCOVERY_CANDIDATE_MULTIPLIER);
  const pageBatchSize = DISCOVERY_CONCURRENCY * 3;
  for (let start = 0; start < candidates.length && selected.size < targetItem.quota; start += pageBatchSize) {
    const pageBatch = candidates.slice(start, start + pageBatchSize);
    const discovered = await mapConcurrent(pageBatch, DISCOVERY_CONCURRENCY, async (item) => {
      try {
        return await discoverFromOfficialPage(targetItem, item.brand, item.result);
      } catch {
        return null;
      }
    });
    for (const product of discovered) {
      if (!product) continue;
      const identity = productIdentityKey(product);
      discoveryCache[discoveryCacheKey(product)] = product;
      if (excludedIdentities.has(identity)) continue;
      const previous = selected.get(identity);
      if (!previous || product.evidenceScore > previous.evidenceScore) selected.set(identity, product);
    }
  }
  await saveDiscoveryCache();
  return [...selected.values()].sort((a, b) => b.evidenceScore - a.evidenceScore).slice(0, targetItem.quota);
}

async function discoverProductCatalog(): Promise<CatalogGroup[]> {
  await loadDiscoveryCache();
  const globallyUsed = new Set<string>();
  const groups: CatalogGroup[] = [];
  const reportRows: Array<Record<string, unknown>> = [];

  for (const targetItem of CATEGORY_TARGETS) {
    const discovered = await discoverCategory(targetItem, globallyUsed);
    const accepted = discovered.filter((product) => {
      const key = productIdentityKey(product);
      if (globallyUsed.has(key)) return false;
      globallyUsed.add(key);
      return true;
    });
    for (const product of accepted) PART_NUMBER_OVERRIDES[product.name] = product.partNumber;
    groups.push({
      parentCategory: targetItem.level1,
      category: targetItem.category,
      slug: targetItem.slug,
      brand: accepted[0]?.brand || targetItem.brands[0],
      imageQuery: `${targetItem.category} official product`,
      fallbackKey: 'default',
      quota: accepted.length,
      products: accepted.map((product) => product.name),
    });
    const coverage = targetItem.quota > 0 ? Math.round((accepted.length / targetItem.quota) * 1000) / 10 : 100;
    reportRows.push({
      level1: targetItem.level1,
      level2: targetItem.level2 || null,
      category: targetItem.category,
      slug: targetItem.slug,
      target: targetItem.quota,
      accepted: accepted.length,
      shortage: Math.max(0, targetItem.quota - accepted.length),
      coveragePercent: coverage,
      status: accepted.length >= targetItem.quota ? 'target-met' : coverage >= MIN_CATEGORY_COVERAGE_PERCENT ? 'accepted-shortage' : 'below-minimum-coverage',
      products: accepted,
    });
    console.log(`🔎 ${targetItem.category}: ${accepted.length}/${targetItem.quota} model hãng hợp lệ.`);
  }

  const total = groups.reduce((sum, group) => sum + group.products.length, 0);
  const report = {
    generatedAt: new Date().toISOString(),
    target: TARGET_TOTAL_PRODUCTS,
    accepted: total,
    allowedRange: { min: MIN_TOTAL_PRODUCTS, max: MAX_TOTAL_PRODUCTS },
    categoryMinimumCoveragePercent: MIN_CATEGORY_COVERAGE_PERCENT,
    discoveryQueriesUsed: discoveryQueryCount,
    officialOnly: true,
    syntheticFallback: false,
    categories: reportRows,
  };
  await fs.writeFile(DISCOVERY_REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(DISCOVERED_CATALOG_FILE, JSON.stringify(groups, null, 2), 'utf8');
  return groups;
}

function sourceResultMatchesProduct(result: WebSearchResult, productName: string, brand: string): boolean {
  return evaluateTextMatch(`${result.title} ${result.link} ${result.snippet}`, productName, brand).score >= MIN_IMAGE_MATCH_SCORE;
}

function scoreSourceResult(
  result: WebSearchResult,
  productName: string,
  brand: string,
  intent: 'product' | 'datasheet',
): number {
  if (!result.link || isBlockedSource(result.link)) return -10_000;
  if (!sourceResultMatchesProduct(result, productName, brand)) return -5_000;

  const host = hostname(result.link);
  const official = (BRAND_DOMAINS[brand] || []).some((domain) => hostMatches(host, domain));
  const trusted = TRUSTED_DISTRIBUTOR_DOMAINS.some((domain) => hostMatches(host, domain));
  if (!official && !trusted) return -1_000;

  const match = evaluateTextMatch(`${result.title} ${result.link} ${result.snippet}`, productName, brand);
  let score = official ? 1_000 : 500;
  const normalized = `${result.title} ${result.link}`.toLowerCase();
  if (intent === 'product' && /product|products|support|specification|specs|detail/.test(normalized)) score += 160;
  if (intent === 'product' && /\.pdf($|\?)/.test(result.link.toLowerCase())) score -= 120;
  if (intent === 'datasheet' && /datasheet|data-sheet|specification|technical|download/.test(normalized)) score += 220;
  if (intent === 'datasheet' && /\.pdf($|\?)/.test(result.link.toLowerCase())) score += 180;
  score += match.score * 4;
  score += Math.max(0, 25 - result.position);
  return score;
}

const SPECIFICATION_FIELDS: Array<{ key: string; name: string; aliases: string[] }> = [
  { key: 'cpu', name: 'Bộ xử lý', aliases: ['processor', 'cpu'] },
  { key: 'memory', name: 'Bộ nhớ', aliases: ['memory', 'ram'] },
  { key: 'storage', name: 'Lưu trữ', aliases: ['storage', 'ssd', 'hard drive'] },
  { key: 'ports', name: 'Cổng kết nối', aliases: ['interfaces', 'ports', 'ethernet ports', 'network ports'] },
  { key: 'throughput', name: 'Thông lượng', aliases: ['throughput', 'forwarding rate', 'switching capacity'] },
  { key: 'data_rate', name: 'Tốc độ dữ liệu', aliases: ['data rate', 'transfer rate', 'baud rate'] },
  { key: 'wireless', name: 'Chuẩn không dây', aliases: ['wireless standards', 'wi-fi standards', 'wifi standards'] },
  { key: 'poe_budget', name: 'Công suất PoE', aliases: ['poe budget', 'poe power', 'power budget'] },
  { key: 'voltage', name: 'Điện áp', aliases: ['rated voltage', 'input voltage', 'output voltage', 'voltage'] },
  { key: 'capacity', name: 'Dung lượng', aliases: ['rated capacity', 'capacity'] },
  { key: 'power', name: 'Công suất', aliases: ['rated power', 'output power', 'power consumption'] },
  { key: 'efficiency', name: 'Hiệu suất', aliases: ['module efficiency', 'maximum efficiency', 'efficiency'] },
  { key: 'connector', name: 'Đầu nối', aliases: ['connector type', 'connector'] },
  { key: 'wavelength', name: 'Bước sóng', aliases: ['wavelength'] },
  { key: 'distance', name: 'Khoảng cách truyền', aliases: ['transmission distance', 'reach', 'distance'] },
  { key: 'dimensions', name: 'Kích thước', aliases: ['dimensions', 'dimension', 'size'] },
  { key: 'weight', name: 'Khối lượng', aliases: ['net weight', 'weight'] },
  { key: 'temperature', name: 'Nhiệt độ hoạt động', aliases: ['operating temperature', 'working temperature'] },
];

function looksLikeSpecificationValue(value: string): boolean {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length < 2 || clean.length > 140 || !/\d/.test(clean)) return false;
  if (/cookie|privacy|copyright|add to cart|price|login|sign in/i.test(clean)) return false;
  return true;
}

function extractVerifiedSpecifications(
  page: ValidatedSourcePage,
  sourceUrl: string,
  sourceDomain: string,
  sourceType: 'manufacturer-product-page' | 'manufacturer-datasheet',
): VerifiedSpecification[] {
  if (!page.ok || !page.text) return [];
  const lines = page.text.split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const found: VerifiedSpecification[] = [];
  const verifiedAt = new Date().toISOString();

  for (const field of SPECIFICATION_FIELDS) {
    let matchedValue = '';
    let evidenceExcerpt = '';
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const normalizedLine = line.toLowerCase();
      const alias = field.aliases.find((item) => normalizedLine === item || normalizedLine.startsWith(`${item}:`) || normalizedLine.startsWith(`${item} `));
      if (!alias) continue;

      let value = line.slice(alias.length).replace(/^\s*[:：\-]\s*/, '').trim();
      if (!looksLikeSpecificationValue(value)) value = lines[index + 1] || '';
      if (!looksLikeSpecificationValue(value)) continue;
      matchedValue = clip(value, 140);
      evidenceExcerpt = clip(`${line} ${value}`, 220);
      break;
    }
    if (!matchedValue) continue;
    found.push({
      key: field.key,
      name: field.name,
      value: matchedValue,
      sourceUrl,
      sourceDomain,
      sourceType,
      evidenceExcerpt,
      verifiedAt,
    });
    if (found.length >= MAX_VERIFIED_SPECS) break;
  }

  return found;
}

function unresolvedSource(productName: string, image: VerifiedImage): SourceEvidence {
  const brand = detectBrand(productName);
  const model = extractModel(productName, brand);
  return {
    productName,
    brand,
    model,
    url: image.sourcePage,
    domain: hostname(image.sourcePage) || image.sourceDomain,
    title: image.title || productName,
    snippet: 'Nguồn này chỉ xác nhận hình ảnh; chưa đủ điều kiện công bố thông số kỹ thuật.',
    official: image.officialSource,
    supportsProductFacts: false,
    httpValidated: false,
    contentType: '',
    sourceType: image.officialSource ? 'manufacturer-image-page' : 'unverified',
    verifiedAt: new Date().toISOString(),
    modelMatchScore: image.matchEvidence.score,
    modelMatched: image.matchEvidence.score >= MIN_IMAGE_MATCH_SCORE,
  };
}

async function resolveProductEvidence(productName: string, image: VerifiedImage): Promise<ProductEvidenceBundle> {
  const cacheKey = slugify(productName);
  const cached = evidenceCache[cacheKey];
  if (cached && !REVALIDATE_SOURCE_CACHE && cached.primarySource && Array.isArray(cached.specifications)) {
    if (REQUIRE_OFFICIAL_SOURCE && !cached.primarySource.supportsProductFacts) {
      throw new Error(`Cache chưa có nguồn hãng đủ điều kiện cho: ${productName}`);
    }
    if (REQUIRE_DATASHEET && !cached.datasheet) {
      throw new Error(`Cache chưa có datasheet chính hãng cho: ${productName}`);
    }
    if (REQUIRE_VERIFIED_SPECIFICATIONS && cached.specifications.length === 0) {
      throw new Error(`Cache chưa có specification đã xác minh cho: ${productName}`);
    }
    return cached;
  }

  const brand = detectBrand(productName);
  const model = extractModel(productName, brand);
  const domains = BRAND_DOMAINS[brand] || [];
  const candidates: WebSearchResult[] = [];
  const discovered = discoveredProductByName(productName);
  if (discovered) {
    candidates.push({
      title: discovered.sourceTitle,
      link: discovered.productUrl,
      snippet: `Trang sản phẩm chính hãng; model ${discovered.partNumber}.`,
      position: 0,
    });
    if (discovered.datasheetUrl) {
      candidates.push({
        title: `Datasheet ${discovered.partNumber}`,
        link: discovered.datasheetUrl,
        snippet: `Datasheet liên kết trực tiếp từ trang sản phẩm hãng ${brand}.`,
        position: 0,
      });
    }
  }
  if (image.officialSource) {
    candidates.push({ title: image.title, link: image.sourcePage, snippet: 'Nguồn trang chứa ảnh chính hãng.', position: 0 });
  }
  if (RESOLVE_OFFICIAL_SOURCES && SERPER_API_KEY) {
    const domainQuery = domains.length > 0 ? domains.join(' ') : '';
    const queries = [
      `"${model}" "${brand}" ${domainQuery} product specifications`.trim(),
      ...(SEPARATE_DATASHEET_SEARCH
        ? [`"${model}" "${brand}" ${domainQuery} datasheet pdf`]
        : []),
    ];
    const resultSets = await Promise.all(queries.map(searchGoogleWeb));
    candidates.push(...resultSets.flat());
  }

  const uniqueCandidates = [...new Map(candidates.filter((item) => item.link).map((item) => [item.link, item])).values()];
  const pageCache = new Map<string, ValidatedSourcePage>();
  const getChecked = async (url: string) => {
    const existing = pageCache.get(url);
    if (existing) return existing;
    const checked = await validateSourcePage(url);
    pageCache.set(url, checked);
    return checked;
  };

  let primarySource = unresolvedSource(productName, image);
  let primaryPage: ValidatedSourcePage | null = null;
  const rankedProduct = uniqueCandidates
    .map((result) => ({ result, score: scoreSourceResult(result, productName, brand, 'product') }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  for (const { result } of rankedProduct.slice(0, 6)) {
    const checked = await getChecked(result.link);
    if (!checked.ok) continue;
    const domain = hostname(checked.finalUrl);
    const official = domains.some((item) => hostMatches(domain, item));
    const trusted = TRUSTED_DISTRIBUTOR_DOMAINS.some((item) => hostMatches(domain, item));
    const match = evaluateTextMatch(`${result.title} ${result.link} ${result.snippet} ${checked.text.slice(0, 200_000)}`, productName, brand);
    if (match.score < MIN_IMAGE_MATCH_SCORE) continue;
    const isPdf = checked.contentType.includes('pdf');
    primarySource = {
      productName,
      brand,
      model,
      url: checked.finalUrl,
      domain,
      title: result.title || `${productName} | ${brand}`,
      snippet: result.snippet,
      official,
      supportsProductFacts: official && match.score >= MIN_IMAGE_MATCH_SCORE,
      httpValidated: true,
      contentType: checked.contentType,
      sourceType: official
        ? (isPdf ? 'manufacturer-datasheet' : 'manufacturer-product-page')
        : trusted ? 'trusted-distributor' : 'unverified',
      verifiedAt: new Date().toISOString(),
      modelMatchScore: match.score,
      modelMatched: match.score >= MIN_IMAGE_MATCH_SCORE,
      contentHash: checked.contentHash,
      lastModified: checked.lastModified,
    };
    primaryPage = checked;
    if (official) break;
  }

  let datasheet: DatasheetEvidence | null = null;
  let datasheetPage: ValidatedSourcePage | null = null;
  const rankedDatasheets = uniqueCandidates
    .map((result) => ({ result, score: scoreSourceResult(result, productName, brand, 'datasheet') }))
    .filter((item) => item.score > 0 && /datasheet|data-sheet|specification|technical|download|\.pdf/i.test(`${item.result.title} ${item.result.link}`))
    .sort((a, b) => b.score - a.score);

  for (const { result } of rankedDatasheets.slice(0, 6)) {
    const checked = await getChecked(result.link);
    if (!checked.ok) continue;
    const domain = hostname(checked.finalUrl);
    const official = domains.some((item) => hostMatches(domain, item));
    const match = evaluateTextMatch(`${result.title} ${result.link} ${result.snippet} ${checked.text.slice(0, 200_000)}`, productName, brand);
    if (!official || match.score < MIN_IMAGE_MATCH_SCORE) continue;
    datasheet = {
      url: checked.finalUrl,
      domain,
      title: result.title || `Datasheet ${model}`,
      official,
      httpValidated: true,
      contentType: checked.contentType,
      modelMatched: true,
      modelMatchScore: match.score,
      verifiedAt: new Date().toISOString(),
      contentHash: checked.contentHash,
    };
    datasheetPage = checked;
    break;
  }

  if (!datasheet && primarySource.sourceType === 'manufacturer-datasheet' && primarySource.supportsProductFacts) {
    datasheet = {
      url: primarySource.url,
      domain: primarySource.domain,
      title: primarySource.title,
      official: primarySource.official,
      httpValidated: primarySource.httpValidated,
      contentType: primarySource.contentType,
      modelMatched: primarySource.modelMatched,
      modelMatchScore: primarySource.modelMatchScore,
      verifiedAt: primarySource.verifiedAt,
      contentHash: primarySource.contentHash,
    };
    datasheetPage = primaryPage;
  }

  const specificationCandidates = [
    ...(primarySource.official && primaryPage
      ? extractVerifiedSpecifications(primaryPage, primarySource.url, primarySource.domain, primarySource.sourceType === 'manufacturer-datasheet' ? 'manufacturer-datasheet' : 'manufacturer-product-page')
      : []),
    ...(datasheet && datasheetPage && datasheet.url !== primarySource.url
      ? extractVerifiedSpecifications(datasheetPage, datasheet.url, datasheet.domain, 'manufacturer-datasheet')
      : []),
    ...(discovered?.specifications || []).map((item) => ({
      key: slugify(item.name).replace(/-/g, '_'),
      name: item.name,
      value: item.value,
      sourceUrl: discovered.productUrl,
      sourceDomain: discovered.sourceDomain,
      sourceType: 'manufacturer-product-page' as const,
      evidenceExcerpt: `${item.name}: ${item.value}`,
      verifiedAt: discovered.discoveredAt,
    })),
  ];
  const specifications = [...new Map(specificationCandidates.map((item) => [item.key, item])).values()].slice(0, MAX_VERIFIED_SPECS);

  const bundle: ProductEvidenceBundle = {
    productName,
    brand,
    model,
    primarySource,
    datasheet,
    specifications,
    evidenceStatus: specifications.length > 0
      ? 'verified-specifications'
      : primarySource.supportsProductFacts || Boolean(datasheet) ? 'official-source-only' : 'unresolved',
    reviewedAt: new Date().toISOString(),
  };

  if (REQUIRE_OFFICIAL_SOURCE && !primarySource.supportsProductFacts) {
    throw new Error(`Không tìm thấy trang sản phẩm/datasheet chính hãng khớp model cho: ${productName}`);
  }
  if (REQUIRE_DATASHEET && !datasheet) {
    throw new Error(`Không tìm thấy datasheet chính hãng khớp model cho: ${productName}`);
  }
  if (REQUIRE_VERIFIED_SPECIFICATIONS && specifications.length === 0) {
    throw new Error(`Không trích được specification đã xác minh cho: ${productName}`);
  }

  evidenceCache[cacheKey] = bundle;
  return bundle;
}

async function resolveAllEvidence(
  items: Array<{ name: string }>,
  images: Map<string, VerifiedImage>,
): Promise<Map<string, ProductEvidenceBundle>> {
  const result = new Map<string, ProductEvidenceBundle>();

  for (let start = 0; start < items.length; start += SOURCE_CONCURRENCY) {
    const batch = items.slice(start, start + SOURCE_CONCURRENCY);
    await Promise.all(batch.map(async ({ name }) => {
      const image = images.get(name);
      if (!image) throw new Error(`Không có ảnh để xác minh nguồn: ${name}`);
      const evidence = await resolveProductEvidence(name, image);
      result.set(name, evidence);
    }));
    await saveEvidenceCache();

    const done = Math.min(start + batch.length, items.length);
    if (done % 25 === 0 || done === items.length) {
      const official = [...result.values()].filter((item) => item.primarySource.official && item.primarySource.supportsProductFacts).length;
      const datasheets = [...result.values()].filter((item) => item.datasheet).length;
      const withSpecs = [...result.values()].filter((item) => item.specifications.length > 0).length;
      console.log(`🔎 Evidence ${done}/${items.length} | nguồn hãng: ${official} | datasheet: ${datasheets} | có specs: ${withSpecs}`);
    }
  }

  return result;
}

// =============================================================================
// SEO + GEO/AEO content
// =============================================================================
function buildProductContent(params: {
  name: string;
  brand: string;
  model: string;
  group: CatalogGroup;
  sku: string;
  image: VerifiedImage;
  evidence: ProductEvidenceBundle;
  categoryPathNames: string[];
}) {
  const { name, brand, model, group, sku, image, evidence, categoryPathNames } = params;
  const source = evidence.primarySource;
  const profile = categoryProfile(group.slug);
  const safeName = escapeHtml(name);
  const safeBrand = escapeHtml(brand);
  const safeModel = escapeHtml(model);
  const slug = slugify(name);
  const canonicalPath = `/products/${slug}`;
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;
  const imageUrl = absoluteUrl(image.publicUrl);
  const categoryName = categoryPathNames[categoryPathNames.length - 1];
  const focusKeyword = `${name} chính hãng`;
  const reviewedAt = new Date().toISOString();
  const reviewedDate = reviewedAt.slice(0, 10);

  const metaTitle = clip(`${name} chính hãng | Báo giá CTC`, 60);
  const metaDescription = clip(
    `${name}, model ${model}, thương hiệu ${brand}. Xem ứng dụng, tiêu chí lựa chọn, nguồn xác thực và yêu cầu báo giá tại CTC. Giá liên hệ.`,
    158,
  );

  const directAnswer = `${name} là ${profile.summary}. Sản phẩm phù hợp để xem xét cho ${profile.applications.slice(0, 3).join(', ')}; cấu hình cuối cùng phải đối chiếu tài liệu của đúng model ${model}. Giá được xác nhận theo báo giá.`;
  const limitation = evidence.specifications.length > 0
    ? `Các thông số hiển thị bên dưới được trích từ nguồn chính hãng khớp model và lưu kèm URL bằng chứng. CTC vẫn đối chiếu lại revision, khu vực phân phối và cấu hình tại thời điểm báo giá.`
    : source.supportsProductFacts
    ? `CTC đã xác minh nguồn chính hãng khớp model ${model}, nhưng chưa trích được bảng thông số đủ tin cậy. Cần đối chiếu tài liệu kỹ thuật tại thời điểm báo giá.`
    : `Hiện seed chưa xác minh được trang thông số chính hãng của đúng model. Không sử dụng nội dung này để kết luận về cổng kết nối, công suất, chứng nhận, tồn kho hoặc thời hạn bảo hành.`;

  const applications = profile.applications.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const selectionItems = profile.selection
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');

  const sourceHtml = source.supportsProductFacts
    ? `<li><strong>Nguồn sản phẩm:</strong> <a href="${escapeHtml(source.url)}" rel="nofollow noopener" target="_blank"><cite>${escapeHtml(source.title || source.domain)}</cite></a> — ${escapeHtml(source.domain)}.</li>`
    : `<li><strong>Nguồn sản phẩm:</strong> Chưa xác minh được trang thông số chính hãng của đúng model trong lần chạy seed này.</li>`;

  const datasheetHtml = evidence.datasheet
    ? `<li><strong>Datasheet:</strong> <a href="${escapeHtml(evidence.datasheet.url)}" rel="nofollow noopener" target="_blank"><cite>${escapeHtml(evidence.datasheet.title)}</cite></a> — nguồn hãng, khớp model ${safeModel}.</li>`
    : `<li><strong>Datasheet:</strong> Chưa tìm thấy tài liệu chính hãng đủ điều kiện trong lần rà soát này.</li>`;

  const specificationRows = evidence.specifications.map((item) => `
        <tr>
          <th scope="row">${escapeHtml(item.name)}</th>
          <td>${escapeHtml(item.value)}</td>
          <td><a href="${escapeHtml(item.sourceUrl)}" rel="nofollow noopener" target="_blank">${escapeHtml(item.sourceDomain)}</a></td>
        </tr>`).join('');

  const specificationHtml = evidence.specifications.length > 0 ? `
  <section aria-labelledby="thong-so-${slug}" class="verified-specifications">
    <h2 id="thong-so-${slug}">Thông số kỹ thuật đã xác minh</h2>
    <table>
      <thead><tr><th>Hạng mục</th><th>Giá trị</th><th>Nguồn</th></tr></thead>
      <tbody>${specificationRows}</tbody>
    </table>
    <p>Chỉ các trường trích được từ nguồn hãng khớp model mới xuất hiện trong bảng này.</p>
  </section>` : `
  <section aria-labelledby="thong-so-${slug}" class="verified-specifications pending-evidence">
    <h2 id="thong-so-${slug}">Thông số kỹ thuật</h2>
    <p>Chưa có trường thông số nào đủ điều kiện tự động công bố. Vui lòng yêu cầu CTC gửi datasheet đúng model để đối chiếu.</p>
  </section>`;

  const faq = [
    {
      question: `${name} là sản phẩm gì?`,
      answer: directAnswer,
    },
    {
      question: `${name} phù hợp cho nhu cầu nào?`,
      answer: `${name} có thể được xem xét cho ${profile.applications.join(', ')}. Việc lựa chọn cần căn cứ quy mô hệ thống, khả năng tương thích và tài liệu của đúng model.`,
    },
    {
      question: `${name} có giá bao nhiêu?`,
      answer: `Giá ${name} được để ở trạng thái Liên hệ. Báo giá phụ thuộc phiên bản, cấu hình, số lượng, thời điểm, điều kiện bảo hành và địa điểm giao hàng.`,
    },
    {
      question: `Cần cung cấp gì để CTC báo giá ${name}?`,
      answer: `Khách hàng nên gửi đúng model ${model}, số lượng, yêu cầu kỹ thuật, thiết bị hoặc hệ thống đang sử dụng, thời gian cần hàng và địa điểm giao nhận.`,
    },
    {
      question: `Thông số kỹ thuật của ${name} được xác nhận ở đâu?`,
      answer: evidence.datasheet
        ? `Thông số cần được đối chiếu trên datasheet chính hãng của ${brand}: ${evidence.datasheet.url}`
        : source.supportsProductFacts
        ? `CTC đã xác minh trang chính hãng khớp model tại ${source.url}; cần yêu cầu datasheet đúng revision trước khi chốt cấu hình.`
        : `Seed hiện chưa có nguồn chính hãng đủ điều kiện để xác nhận thông số. Cần bổ sung datasheet hoặc trang sản phẩm chính thức trước khi công bố thông số chi tiết.`,
    },
  ];

  const faqHtml = faq.map((item, index) => `
    <div class="faq-item" id="faq-${slug}-${index + 1}">
      <h3>${escapeHtml(item.question)}</h3>
      <p>${escapeHtml(item.answer)}</p>
    </div>`).join('');

  const description = `
<article class="product-seo-content product-geo-content space-y-6" data-geo-standard="${GEO_STANDARD}" data-entity-id="${canonicalUrl}#product">
  <header aria-labelledby="tong-quan-${slug}">
    <h2 id="tong-quan-${slug}">${safeName} – thông tin tổng quan</h2>
    <p class="geo-direct-answer" data-geo-answer="direct"><strong>Trả lời nhanh:</strong> ${escapeHtml(directAnswer)}</p>
  </header>

  <section aria-labelledby="thong-tin-xac-nhan-${slug}">
    <h2 id="thong-tin-xac-nhan-${slug}">Thông tin đã xác nhận</h2>
    <table>
      <tbody>
        <tr><th scope="row">Tên sản phẩm</th><td>${safeName}</td></tr>
        <tr><th scope="row">Thương hiệu</th><td>${safeBrand}</td></tr>
        <tr><th scope="row">Model / dòng sản phẩm</th><td>${safeModel}</td></tr>
        <tr><th scope="row">Danh mục</th><td>${escapeHtml(categoryPathNames.join(' › '))}</td></tr>
        <tr><th scope="row">Mã sản phẩm / Part number</th><td>${escapeHtml(sku)}</td></tr>
        <tr><th scope="row">Giá</th><td>Liên hệ</td></tr>
        <tr><th scope="row">Phạm vi tiếp nhận yêu cầu</th><td>Việt Nam</td></tr>
        <tr><th scope="row">Ngày rà soát nội dung</th><td>${reviewedDate}</td></tr>
      </tbody>
    </table>
  </section>

  ${specificationHtml}

  <section aria-labelledby="phu-hop-${slug}">
    <h2 id="phu-hop-${slug}">${safeName} phù hợp khi nào?</h2>
    <ul>${applications}</ul>
    <p>Danh sách trên là nhóm ứng dụng tham khảo theo danh mục sản phẩm, không thay thế bước thiết kế và kiểm tra tương thích.</p>
  </section>

  <section aria-labelledby="lua-chon-${slug}">
    <h2 id="lua-chon-${slug}">Tiêu chí cần kiểm tra trước khi chọn</h2>
    <ul>${selectionItems}</ul>
    <p>CTC chỉ đề xuất cấu hình sau khi đối chiếu nhu cầu triển khai với tài liệu của đúng model.</p>
  </section>

  <section aria-labelledby="bao-gia-${slug}">
    <h2 id="bao-gia-${slug}">Thông tin cần cung cấp để nhận báo giá</h2>
    <ol>
      <li>Đúng model hoặc mã hàng cần mua.</li>
      <li>Số lượng và thời điểm cần hàng.</li>
      <li>Yêu cầu kỹ thuật hoặc hệ thống cần tích hợp.</li>
      <li>Địa điểm giao nhận và yêu cầu hồ sơ kèm theo.</li>
    </ol>
    <p>Giá của <strong>${safeName}</strong> được để ở trạng thái <strong>Liên hệ</strong>; website không tạo giá, tồn kho hoặc thời hạn bảo hành giả.</p>
  </section>

  <section aria-labelledby="gioi-han-${slug}">
    <h2 id="gioi-han-${slug}">Giới hạn và mức độ xác thực</h2>
    <p>${escapeHtml(limitation)}</p>
  </section>

  <section aria-labelledby="nguon-${slug}" class="geo-citations" data-geo-citation-block="true">
    <h2 id="nguon-${slug}">Nguồn và căn cứ kiểm tra</h2>
    <ol>
      ${sourceHtml}
      ${datasheetHtml}
      <li><strong>Nguồn hình ảnh:</strong> <a href="${escapeHtml(image.sourcePage)}" rel="nofollow noopener" target="_blank"><cite>${escapeHtml(image.sourceDomain)}</cite></a>; điểm khớp model ${image.matchEvidence.score}/100, phương thức ${escapeHtml(image.matchEvidence.method)}, fingerprint ${escapeHtml(image.contentHash.slice(0, 16))}.</li>
      <li><strong>Dữ liệu catalog CTC:</strong> tên sản phẩm, thương hiệu, part number/model, danh mục và chính sách giá Liên hệ.</li>
    </ol>
  </section>

  <section aria-labelledby="faq-${slug}" class="product-faq">
    <h2 id="faq-${slug}">Câu hỏi thường gặp về ${safeName}</h2>${faqHtml}
  </section>
</article>`.trim();

  const shortDescription = clip(directAnswer, 300);

  const organizationId = `${SITE_ORIGIN}/#organization`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const webpageId = `${canonicalUrl}#webpage`;
  const productId = `${canonicalUrl}#product`;
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const faqId = `${canonicalUrl}#faq`;

  const productNode: Record<string, unknown> = {
    '@type': 'Product',
    '@id': productId,
    name,
    sku,
    url: canonicalUrl,
    image: [imageUrl],
    description: metaDescription,
    category: categoryPathNames.join(' > '),
    brand: { '@type': 'Brand', name: brand },
    model,
    mpn: model,
    manufacturer: { '@type': 'Organization', name: brand },
    mainEntityOfPage: { '@id': webpageId },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Trạng thái giá', value: 'Liên hệ' },
      { '@type': 'PropertyValue', name: 'Phạm vi cung cấp', value: 'Việt Nam' },
      { '@type': 'PropertyValue', name: 'Mức độ xác thực thông số', value: evidence.evidenceStatus },
      ...evidence.specifications.map((item) => ({
        '@type': 'PropertyValue',
        name: item.name,
        value: item.value,
      })),
    ],
    ...(source.official && source.supportsProductFacts
      ? { sameAs: [...new Set([source.url, evidence.datasheet?.url].filter(Boolean) as string[])] }
      : {}),
  };

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Sản phẩm', item: `${SITE_ORIGIN}/products` },
    ...categoryPathNames.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item,
    })),
    { '@type': 'ListItem', position: categoryPathNames.length + 2, name, item: canonicalUrl },
  ];

  const webPageNode: Record<string, unknown> = {
    '@type': 'WebPage',
    '@id': webpageId,
    url: canonicalUrl,
    name: metaTitle,
    description: metaDescription,
    inLanguage: 'vi-VN',
    isPartOf: { '@id': websiteId },
    about: { '@id': productId },
    mainEntity: { '@id': productId },
    breadcrumb: { '@id': breadcrumbId },
    dateModified: reviewedAt,
    publisher: { '@id': organizationId },
    ...((source.supportsProductFacts || evidence.datasheet) ? {
      citation: [...new Set([source.supportsProductFacts ? source.url : '', evidence.datasheet?.url || ''].filter(Boolean))],
    } : {}),
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: COMPANY.name,
        alternateName: COMPANY.alternateName,
        url: COMPANY.url,
        address: {
          '@type': 'PostalAddress',
          streetAddress: COMPANY.address.streetAddress,
          addressLocality: COMPANY.address.addressLocality,
          addressCountry: COMPANY.address.addressCountry,
        },
        areaServed: { '@type': 'Country', name: 'Việt Nam' },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: SITE_ORIGIN,
        name: COMPANY.alternateName,
        publisher: { '@id': organizationId },
        inLanguage: 'vi-VN',
      },
      webPageNode,
      productNode,
      {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: breadcrumbItems,
      },
      {
        '@type': 'FAQPage',
        '@id': faqId,
        url: `${canonicalUrl}#faq-${slug}`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  const keyFacts = [
    { name: 'productName', value: name, status: 'confirmed', basis: 'catalog' },
    { name: 'brand', value: brand, status: 'confirmed', basis: 'catalog' },
    { name: 'model', value: model, status: 'confirmed', basis: 'catalog' },
    { name: 'category', value: categoryName, status: 'confirmed', basis: 'catalog' },
    { name: 'price', value: 'Liên hệ', status: 'confirmed', basis: 'CTC pricing policy' },
    { name: 'serviceArea', value: 'Việt Nam', status: 'confirmed', basis: 'CTC service policy' },
    ...evidence.specifications.map((item) => ({
      name: item.key,
      value: item.value,
      status: 'verified',
      basis: item.sourceUrl,
    })),
  ];

  const fanoutQuestions = [
    `${name} là gì`,
    `${name} dùng cho hệ thống nào`,
    `${name} có tương thích với hệ thống hiện tại không`,
    `${name} giá bao nhiêu`,
    `datasheet ${model}`,
    `so sánh ${model} với model tương đương`,
    `mua ${name} tại Việt Nam`,
  ];

  const geo = {
    standard: GEO_STANDARD,
    meaning: 'Generative Engine Optimization',
    directAnswer,
    entity: {
      id: productId,
      name,
      type: profile.entityType,
      brand,
      model,
      category: categoryName,
      sku,
    },
    keyFacts,
    decisionSupport: {
      suitableFor: profile.applications,
      selectionCriteria: profile.selection,
      quotationInputs: ['model', 'số lượng', 'yêu cầu kỹ thuật', 'hệ thống cần tích hợp', 'thời gian cần hàng', 'địa điểm giao nhận'],
    },
    sourceEvidence: {
      officialProductSource: source.supportsProductFacts ? {
        url: source.url,
        domain: source.domain,
        title: source.title,
        official: source.official,
        verifiedAt: source.verifiedAt,
        modelMatchScore: source.modelMatchScore,
        contentHash: source.contentHash,
      } : null,
      datasheet: evidence.datasheet,
      verifiedSpecifications: evidence.specifications,
      imageSource: {
        sourcePage: image.sourcePage,
        sourceDomain: image.sourceDomain,
        originalImageUrl: image.imageUrl,
        officialSource: image.officialSource,
        verifiedAt: image.verifiedAt,
        contentHash: image.contentHash,
        matchEvidence: image.matchEvidence,
      },
      internalCatalog: {
        owner: COMPANY.name,
        fields: ['name', 'brand', 'model', 'category', 'sku', 'pricePolicy'],
      },
    },
    queryIntents: ['định nghĩa sản phẩm', 'tìm ứng dụng', 'kiểm tra phù hợp', 'yêu cầu báo giá', 'tìm nguồn chính hãng', 'tìm datasheet'],
    fanoutQuestions,
    questionsAnswered: faq.map((item) => item.question),
    factualBoundary: limitation,
    freshness: {
      reviewedAt,
      sourceVerifiedAt: source.verifiedAt,
      datasheetVerifiedAt: evidence.datasheet?.verifiedAt || null,
      imageVerifiedAt: image.verifiedAt,
      updatePolicy: 'Rà soát lại khi model, nguồn hãng, hình ảnh, chính sách giá hoặc trạng thái phân phối thay đổi.',
    },
    qualitySignals: {
      answerFirstVisible: true,
      factTableVisible: true,
      faqVisible: true,
      citationsVisible: true,
      structuredDataMatchesVisibleContent: true,
      unsupportedClaimsBlocked: true,
      uniqueProductEntity: true,
      evidenceStatus: evidence.evidenceStatus,
      verifiedSpecificationCount: evidence.specifications.length,
      imageModelMatchScore: image.matchEvidence.score,
    },
    localCoverage: {
      country: 'Việt Nam',
      primaryOffice: COMPANY.address,
      provinceCount: GEO_PROVINCES.length,
      provinces: GEO_PROVINCES,
      note: 'Dữ liệu phạm vi phục vụ; không tạo landing page địa phương hàng loạt cho từng sản phẩm.',
    },
    citationReady: Boolean(source.supportsProductFacts || evidence.datasheet),
  };

  return {
    slug,
    description,
    shortDescription,
    focusKeyword,
    metaTitle,
    metaDescription,
    canonicalPath,
    canonicalUrl,
    imageAlt: `${name} - hình ảnh sản phẩm ${brand}, model ${model}`,
    faq,
    specifications: evidence.specifications,
    evidenceStatus: evidence.evidenceStatus,
    structuredData,
    geo,
    seo: {
      metaTitle,
      metaDescription,
      focusKeyword,
      secondaryKeywords: [
        `${name} giá liên hệ`,
        `${name} datasheet`,
        `${model} chính hãng`,
        `${categoryName} ${brand}`,
        `mua ${name} tại Việt Nam`,
      ],
      canonicalPath,
      canonicalUrl,
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
      ogImage: imageUrl,
      imageAlt: `${name} - hình ảnh sản phẩm ${brand}, model ${model}`,
      contentReviewedAt: reviewedAt,
    },
  };
}

// =============================================================================
// Category SEO landing pages
// =============================================================================
type CategorySeoPayload = {
  name: string;
  slug: string;
  pathNames: string[];
  h1: string;
  intro: string;
  seoContent: string;
  wordCount: number;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  canonicalUrl: string;
  focusKeyword: string;
  faq: Array<{ question: string; answer: string }>;
  featuredProducts: Array<{ name: string; url: string }>;
  relatedCategories: Array<{ name: string; url: string }>;
  suggestedNewsTopics: string[];
  structuredData: Record<string, unknown>;
  reviewedAt: string;
};

function pathStartsWith(pathNames: string[], prefix: string[]): boolean {
  return prefix.every((name, index) => pathNames[index] === name);
}

function categorySeoKey(pathNames: string[]): string {
  return pathNames.map(slugify).join('/');
}

function buildCategorySeo(pathNames: string[]): CategorySeoPayload {
  const name = pathNames[pathNames.length - 1];
  const slug = slugify(name);
  const descendantGroups = ACTIVE_PRODUCT_CATALOG.filter((group) => pathStartsWith(categoryPath(group.slug, group.category), pathNames));
  if (descendantGroups.length === 0) throw new Error(`Không có sản phẩm con cho category: ${pathNames.join(' > ')}`);

  const allProducts = descendantGroups.flatMap((group) => group.products);
  const brands = [...new Set(allProducts.map(detectBrand))].slice(0, 8);
  const leafNames = [...new Set(descendantGroups.map((group) => categoryPath(group.slug, group.category).at(-1)!))];
  const applications = [...new Set(descendantGroups.flatMap((group) => categoryProfile(group.slug).applications))].slice(0, 6);
  const criteria = [...new Set(descendantGroups.flatMap((group) => categoryProfile(group.slug).selection.split(',').map((item) => item.trim())))].slice(0, 8);
  const leafSummary = leafNames.slice(0, 8).join(', ');
  const reviewedAt = new Date().toISOString();
  const canonicalPath = `/products/category/${slug}`;
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;
  const focusKeyword = `${name} chính hãng`;
  const h1 = `${name} Chính Hãng`;
  const metaTitle = clip(`${name} Chính Hãng | Tư Vấn & Báo Giá CTC`, 60);
  const metaDescription = clip(
    `Danh mục ${name} chính hãng tại CTC: ${leafNames.slice(0, 4).join(', ')}. Xem cách lựa chọn, sản phẩm nổi bật, nguồn kỹ thuật và nhận tư vấn báo giá.`,
    158,
  );

  const introParagraphs = [
    `${name} là danh mục thuộc hệ thống ${pathNames.slice(0, -1).join(' – ') || 'sản phẩm'} của CTC, được xây dựng để doanh nghiệp tra cứu đúng nhóm thiết bị trước khi đi vào từng model. Danh mục hiện liên kết ${allProducts.length} sản phẩm trong các nhóm ${leafSummary}. Nội dung tập trung vào nhu cầu kỹ thuật, khả năng tương thích và bằng chứng từ hãng thay vì chỉ lặp lại tên hàng hoặc từ khóa thương mại.`,
    `Các thương hiệu được nhận diện trong dữ liệu danh mục gồm ${brands.join(', ')}. Danh sách này phản ánh catalog đang được quản lý trong hệ thống, không mặc định xác nhận tồn kho, quyền phân phối hoặc thời hạn bảo hành. Với từng model, CTC kiểm tra riêng thương hiệu, nguồn sản phẩm, hình ảnh và datasheet. Vì vậy người đọc có thể đi từ trang danh mục đến trang sản phẩm để xem mức độ evidence cụ thể trước khi yêu cầu báo giá.`,
    `${name} thường được xem xét cho các nhu cầu như ${applications.join(', ')}. Tính phù hợp phụ thuộc quy mô triển khai, thiết bị đang sử dụng, điều kiện môi trường và yêu cầu nghiệm thu. CTC không dùng một cấu hình chung cho mọi dự án. Khách hàng nên cung cấp sơ đồ hệ thống, số lượng, chuẩn kết nối, yêu cầu dự phòng và tiến độ để đội ngũ kỹ thuật sàng lọc model phù hợp.`,
    `Khi lựa chọn sản phẩm trong danh mục này, các tiêu chí cần đối chiếu gồm ${criteria.join(', ')}. Thông số chỉ nên được chốt từ datasheet đúng model và đúng revision. Tên gọi gần giống, hình thức bên ngoài tương tự hoặc cùng một series không đủ để kết luận hai thiết bị có cấu hình như nhau. Đây là lý do V6 lưu nguồn và trạng thái xác minh theo từng sản phẩm thay vì sinh bảng thông số theo template.`,
    `Mỗi trang sản phẩm được liên kết từ danh mục có part number/model của hãng, brand, category, chính sách giá Liên hệ, nguồn hình ảnh và factual boundary. Khi tìm được trang hãng hoặc datasheet khớp model, URL bằng chứng và ngày rà soát được lưu cùng dữ liệu. Nếu chưa đủ evidence, trang sản phẩm phải nói rõ phần còn thiếu và không tự công bố cổng kết nối, công suất, chứng nhận, tồn kho hay bảo hành.`,
    `Để nhận tư vấn và báo giá ${name}, khách hàng nên gửi model dự kiến, số lượng, yêu cầu kỹ thuật, hệ thống cần tích hợp, địa điểm giao nhận và thời gian cần hàng. Từ trang này có thể mở từng sản phẩm nổi bật, so sánh evidence và chuyển tới biểu mẫu liên hệ. Các bài kiến thức liên quan nên tiếp tục liên kết về danh mục, sau đó dẫn tới đúng model và trang liên hệ để tạo hành trình News → Category → Product → Contact rõ ràng.`,
  ];
  const intro = introParagraphs.join('\n\n');

  const featuredProducts = allProducts.slice(0, 12).map((productName) => ({
    name: productName,
    url: `${SITE_ORIGIN}/products/${slugify(productName)}`,
  }));

  const nextLevelNames = [...new Set(descendantGroups
    .map((group) => categoryPath(group.slug, group.category)[pathNames.length])
    .filter(Boolean))];
  const relatedCategories = nextLevelNames.map((childName) => ({
    name: childName,
    url: `${SITE_ORIGIN}/products/category/${slugify(childName)}`,
  }));

  const faq = [
    {
      question: `CTC cung cấp những nhóm ${name} nào?`,
      answer: `Danh mục hiện liên kết các nhóm ${leafNames.join(', ')}. Danh sách model được cập nhật theo catalog và trạng thái evidence của từng sản phẩm.`,
    },
    {
      question: `Cách chọn ${name} phù hợp cho doanh nghiệp?`,
      answer: `Cần đối chiếu ${criteria.slice(0, 6).join(', ')}, khả năng tương thích và tài liệu kỹ thuật của đúng model.`,
    },
    {
      question: `${name} có sẵn datasheet không?`,
      answer: `Datasheet được kiểm tra theo từng model. Trang sản phẩm sẽ hiển thị liên kết nguồn khi tài liệu chính hãng đã được xác minh; nếu chưa có sẽ ghi rõ trạng thái còn thiếu.`,
    },
    {
      question: `Làm sao nhận báo giá ${name}?`,
      answer: `Gửi model hoặc yêu cầu hệ thống, số lượng, tiến độ và địa điểm giao nhận cho CTC. Giá và điều kiện thương mại được xác nhận trong báo giá, không suy đoán từ seed.`,
    },
  ];

  const productLinksHtml = featuredProducts
    .map((item) => `<li><a href="${escapeHtml(item.url)}">${escapeHtml(item.name)}</a></li>`)
    .join('');
  const relatedCategoryHtml = relatedCategories.length > 0
    ? `<section><h2>Nhóm sản phẩm trong ${escapeHtml(name)}</h2><ul>${relatedCategories.map((item) => `<li><a href="${escapeHtml(item.url)}">${escapeHtml(item.name)}</a></li>`).join('')}</ul></section>`
    : '';
  const faqHtml = faq.map((item) => `<div class="faq-item"><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></div>`).join('');
  const seoContent = `
<article class="category-seo-content" data-category-path="${escapeHtml(pathNames.join(' > '))}">
  <header><h1>${escapeHtml(h1)}</h1></header>
  ${introParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n  ')}
  ${relatedCategoryHtml}
  <section><h2>Sản phẩm ${escapeHtml(name)} nổi bật</h2><ul>${productLinksHtml}</ul></section>
  <section><h2>Nhận tư vấn và báo giá</h2><p><a href="${SITE_ORIGIN}/contact">Liên hệ CTC</a> và gửi model, số lượng cùng yêu cầu kỹ thuật để được đối chiếu cấu hình.</p></section>
  <section class="category-faq"><h2>Câu hỏi thường gặp</h2>${faqHtml}</section>
</article>`.trim();

  const wordCount = intro.split(/\s+/).filter(Boolean).length;
  if (wordCount < 300 || wordCount > 600) {
    throw new Error(`Category SEO ${name} phải 300–600 từ, hiện có ${wordCount} từ.`);
  }

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Sản phẩm', item: `${SITE_ORIGIN}/products` },
    ...pathNames.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item,
      item: `${SITE_ORIGIN}/products/category/${slugify(item)}`,
    })),
  ];
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: metaTitle,
        headline: h1,
        description: metaDescription,
        inLanguage: 'vi-VN',
        dateModified: reviewedAt,
        mainEntity: { '@id': `${canonicalUrl}#items` },
        breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#items`,
        numberOfItems: allProducts.length,
        itemListElement: featuredProducts.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: item.url,
        })),
      },
      { '@type': 'BreadcrumbList', '@id': `${canonicalUrl}#breadcrumb`, itemListElement: breadcrumbItems },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  return {
    name,
    slug,
    pathNames,
    h1,
    intro,
    seoContent,
    wordCount,
    metaTitle,
    metaDescription,
    canonicalPath,
    canonicalUrl,
    focusKeyword,
    faq,
    featuredProducts,
    relatedCategories,
    suggestedNewsTopics: [
      `${name} là gì và ứng dụng thực tế`,
      `Cách chọn ${name} cho doanh nghiệp`,
      `So sánh các công nghệ phổ biến trong ${name}`,
      `Checklist yêu cầu báo giá ${name}`,
    ],
    structuredData,
    reviewedAt,
  };
}

function buildAllCategorySeo(): Map<string, CategorySeoPayload> {
  const paths = new Map<string, string[]>();
  for (const group of ACTIVE_PRODUCT_CATALOG) {
    const fullPath = categoryPath(group.slug, group.category);
    for (let depth = 1; depth <= fullPath.length; depth += 1) {
      const prefix = fullPath.slice(0, depth);
      paths.set(categorySeoKey(prefix), prefix);
    }
  }
  return new Map([...paths.entries()].map(([key, pathNames]) => [key, buildCategorySeo(pathNames)]));
}

// =============================================================================
// MongoDB và danh mục
// =============================================================================
async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOTFOUND') && MONGO_URI.includes('mongo')) {
      const fallback = MONGO_URI.replace(/([\/@])mongo(?=[:\/]|$)/g, (_match, prefix: string) => `${prefix}127.0.0.1`);
      console.warn(`⚠️  Không phân giải được host mongo, thử: ${fallback}`);
      await mongoose.connect(fallback);
      return;
    }
    throw error;
  }
}

async function ensureCategory(
  pathNames: string[],
  parentId: mongoose.Types.ObjectId | null,
  order: number,
  categorySeoByKey: Map<string, CategorySeoPayload>,
): Promise<mongoose.Types.ObjectId> {
  const name = pathNames[pathNames.length - 1];
  const slug = slugify(name);
  const categorySeo = categorySeoByKey.get(categorySeoKey(pathNames));
  if (!categorySeo) throw new Error(`Thiếu Category SEO cho ${pathNames.join(' > ')}`);
  const category = await ProductCategory.findOneAndUpdate(
    { slug },
    {
      $set: {
        name,
        slug,
        description: categorySeo.intro,
        seoContent: categorySeo.seoContent,
        h1: categorySeo.h1,
        metaTitle: categorySeo.metaTitle,
        metaDescription: categorySeo.metaDescription,
        focusKeyword: categorySeo.focusKeyword,
        canonicalPath: categorySeo.canonicalPath,
        canonicalUrl: categorySeo.canonicalUrl,
        categoryPath: pathNames,
        faq: categorySeo.faq,
        structuredData: categorySeo.structuredData,
        internalLinks: {
          products: categorySeo.featuredProducts,
          categories: categorySeo.relatedCategories,
          contact: `${SITE_ORIGIN}/contact`,
          suggestedNewsTopics: categorySeo.suggestedNewsTopics,
        },
        seo: {
          metaTitle: categorySeo.metaTitle,
          metaDescription: categorySeo.metaDescription,
          focusKeyword: categorySeo.focusKeyword,
          canonicalPath: categorySeo.canonicalPath,
          canonicalUrl: categorySeo.canonicalUrl,
          robotsIndex: true,
          robotsFollow: true,
          contentWordCount: categorySeo.wordCount,
          contentReviewedAt: categorySeo.reviewedAt,
        },
        parentId: parentId || undefined,
        isActive: true,
        order,
      },
      $setOnInsert: { productCount: 0 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, strict: false },
  );
  return category._id as mongoose.Types.ObjectId;
}

async function ensureCategoryPath(
  names: string[],
  categorySeoByKey: Map<string, CategorySeoPayload>,
): Promise<mongoose.Types.ObjectId> {
  let parentId: mongoose.Types.ObjectId | null = null;
  for (let index = 0; index < names.length; index += 1) {
    parentId = await ensureCategory(names.slice(0, index + 1), parentId, index + 1, categorySeoByKey);
  }
  if (!parentId) throw new Error(`Không tạo được danh mục: ${names.join(' > ')}`);
  return parentId;
}

async function bulkUpsertProducts(products: any[]): Promise<void> {
  const batchSize = 100;
  for (let start = 0; start < products.length; start += batchSize) {
    const batch = products.slice(start, start + batchSize);
    const now = new Date();

    await Product.collection.bulkWrite(
      batch.map((product) => ({
        updateOne: {
          // Dùng slug để cập nhật đúng trang sản phẩm đã seed trước đó,
          // tránh sinh thêm URL trùng nội dung sau mỗi lần chạy.
          filter: { slug: product.slug },
          update: {
            $set: { ...product, updatedAt: now },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
    console.log(`💾 Đã ghi ${Math.min(start + batch.length, products.length)}/${products.length} sản phẩm`);
  }
}

async function updateCategoryCounts(): Promise<void> {
  const categories = await ProductCategory.find({}).select('_id parentId').lean();
  const children = new Map<string, mongoose.Types.ObjectId[]>();

  for (const category of categories) {
    const parentId = category.parentId ? String(category.parentId) : '';
    if (!parentId) continue;
    const list = children.get(parentId) || [];
    list.push(category._id as mongoose.Types.ObjectId);
    children.set(parentId, list);
  }

  const collectDescendants = (rootId: mongoose.Types.ObjectId): mongoose.Types.ObjectId[] => {
    const result: mongoose.Types.ObjectId[] = [rootId];
    const queue = [...(children.get(String(rootId)) || [])];
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      queue.push(...(children.get(String(current)) || []));
    }
    return result;
  };

  for (const category of categories) {
    const categoryIds = collectDescendants(category._id as mongoose.Types.ObjectId);
    const productCount = await Product.countDocuments({ categoryId: { $in: categoryIds } });
    await ProductCategory.updateOne({ _id: category._id }, { $set: { productCount } });
  }
}

// =============================================================================
// Main
// =============================================================================
async function main(): Promise<void> {
  assertTargetConfig();
  await fs.mkdir(CACHE_DIR, { recursive: true });
  if (VALIDATE_CONFIG_ONLY) {
    const totals = Object.fromEntries(
      [TELCO, IT, SOLAR, STORAGE].map((level1) => [
        level1,
        CATEGORY_TARGETS.filter((item) => item.level1 === level1).reduce((sum, item) => sum + item.quota, 0),
      ]),
    );
    console.log(`✅ Cấu hình V6 hợp lệ: ${CATEGORY_TARGETS.length} danh mục lá, quota ${TARGET_TOTAL_PRODUCTS}.`);
    console.log(JSON.stringify(totals, null, 2));
    return;
  }

  if (!SERPER_API_KEY && DISCOVER_PRODUCTS) {
    throw new Error('Cần SERPER_API_KEY để crawl catalog thật từ website hãng.');
  }
  ACTIVE_PRODUCT_CATALOG = await discoverProductCatalog();
  assertCatalog();

  const flatProducts = ACTIVE_PRODUCT_CATALOG.flatMap((group) => group.products.map((name) => ({ name, group })));
  const partNumberReport = auditCatalogPartNumbers(flatProducts);
  await fs.writeFile(PART_NUMBER_REPORT_FILE, JSON.stringify(partNumberReport, null, 2), 'utf8');

  if (partNumberReport.missing > 0 || partNumberReport.duplicate > 0) {
    const message =
      `Part number chưa đạt: ${partNumberReport.valid}/${partNumberReport.total} hợp lệ, ` +
      `${partNumberReport.missing} thiếu mã thật, ${partNumberReport.duplicate} trùng mã. ` +
      `Crawler không tự sinh mã thay thế; xem ${PART_NUMBER_REPORT_FILE}`;
    if (VALIDATE_ONLY) {
      console.error(`❌ ${message}`);
      process.exitCode = 1;
      return;
    }
    throw new Error(message);
  }

  const categorySeoByKey = buildAllCategorySeo();
  const categoryReport = {
    generatedAt: new Date().toISOString(),
    total: categorySeoByKey.size,
    categories: [...categorySeoByKey.values()].map((item) => ({
      path: item.pathNames,
      h1: item.h1,
      wordCount: item.wordCount,
      metaTitle: item.metaTitle,
      metaTitleLength: item.metaTitle.length,
      metaDescriptionLength: item.metaDescription.length,
      canonicalUrl: item.canonicalUrl,
      featuredProductLinks: item.featuredProducts.length,
      relatedCategoryLinks: item.relatedCategories.length,
    })),
  };
  await fs.writeFile(CATEGORY_REPORT_FILE, JSON.stringify(categoryReport, null, 2), 'utf8');

  if (VALIDATE_ONLY) {
    const brandCount = new Set(flatProducts.map((item) => detectBrand(item.name))).size;
    console.log(`✅ Catalog hợp lệ: ${flatProducts.length} sản phẩm, ${ACTIVE_PRODUCT_CATALOG.length} danh mục lá, ${categorySeoByKey.size} category landing, ${brandCount} thương hiệu nhận diện.`);
    console.log(`✅ Part number hợp lệ và duy nhất: ${partNumberReport.valid}/${partNumberReport.total}.`);
    console.log(`📄 Báo cáo Part number: ${PART_NUMBER_REPORT_FILE}`);
    console.log(`📄 Báo cáo Category SEO: ${CATEGORY_REPORT_FILE}`);
    return;
  }

  await Promise.all([loadImageCache(), loadEvidenceCache()]);
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('CTC — V6: 850 SẢN PHẨM THẬT + CATEGORY SEO + EVIDENCE + ẢNH ĐÚNG MODEL');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`Sản phẩm          : ${flatProducts.length}`);
  console.log(`Danh mục lá       : ${ACTIVE_PRODUCT_CATALOG.length}`);
  console.log(`Mục tiêu / dải    : ${TARGET_TOTAL_PRODUCTS} / ${MIN_TOTAL_PRODUCTS}–${MAX_TOTAL_PRODUCTS}`);
  console.log(`Query discovery   : ${discoveryQueryCount}/${MAX_DISCOVERY_QUERIES}`);
  console.log(`Phạm vi địa lý    : ${GEO_PROVINCES.length} tỉnh/thành`);
  console.log(`GEO standard      : ${GEO_STANDARD}`);
  console.log(`Tìm nguồn hãng    : ${RESOLVE_OFFICIAL_SOURCES}`);
  console.log(`Category landing  : ${categorySeoByKey.size}`);
  console.log(`Điểm khớp ảnh min : ${MIN_IMAGE_MATCH_SCORE}/100`);
  console.log(`Yêu cầu datasheet : ${REQUIRE_DATASHEET}`);
  console.log(`Yêu cầu specs     : ${REQUIRE_VERIFIED_SPECIFICATIONS}`);
  console.log(`Tìm datasheet riêng: ${SEPARATE_DATASHEET_SEARCH}`);
  console.log(`Serper API        : ${SERPER_API_KEY ? 'đã cấu hình' : 'CHƯA CẤU HÌNH'}`);
  console.log(`Mirror ảnh        : ${MIRROR_IMAGES}`);
  console.log(`Chỉ nhận ảnh hãng : ${REQUIRE_OFFICIAL_IMAGE}`);
  console.log(`DRY_RUN           : ${DRY_RUN}`);
  console.log(`VALIDATE_ONLY     : ${VALIDATE_ONLY}`);
  console.log('════════════════════════════════════════════════════════════\n');

  if (!SERPER_API_KEY && Object.keys(imageCache).length < flatProducts.length) {
    throw new Error('Cần SERPER_API_KEY để tìm ảnh thật. Script cố ý không dùng ảnh Unsplash/placeholder.');
  }

  const imageResult = await resolveAllImages(flatProducts);
  const imagesByFingerprint = new Map<string, string[]>();
  for (const [productName, image] of imageResult.ok.entries()) {
    const names = imagesByFingerprint.get(image.contentHash) || [];
    names.push(productName);
    imagesByFingerprint.set(image.contentHash, names);
  }
  const duplicateImageGroups = [...imagesByFingerprint.entries()]
    .filter(([, names]) => names.length > 1)
    .map(([contentHash, products]) => ({ contentHash, products }));
  const imageReport = {
    generatedAt: new Date().toISOString(),
    total: flatProducts.length,
    valid: imageResult.ok.size,
    failed: imageResult.failed.length,
    official: [...imageResult.ok.values()].filter((item) => item.officialSource).length,
    mirrored: [...imageResult.ok.values()].filter((item) => item.mirrored).length,
    minimumModelMatchScore: MIN_IMAGE_MATCH_SCORE,
    duplicateImageGroups,
    items: [...imageResult.ok.entries()].map(([productName, item]) => ({
      productName,
      sourcePage: item.sourcePage,
      sourceDomain: item.sourceDomain,
      originalImageUrl: item.imageUrl,
      publicUrl: item.publicUrl,
      width: item.width,
      height: item.height,
      contentType: item.contentType,
      contentHash: item.contentHash,
      officialSource: item.officialSource,
      mirrored: item.mirrored,
      matchEvidence: item.matchEvidence,
    })),
    failures: imageResult.failed,
  };
  await fs.writeFile(IMAGE_REPORT_FILE, JSON.stringify(imageReport, null, 2), 'utf8');

  if (imageResult.failed.length > 0 || imageResult.ok.size !== flatProducts.length) {
    throw new Error(`Chưa đủ ảnh hợp lệ. Đạt ${imageResult.ok.size}/${flatProducts.length}. Xem báo cáo: ${IMAGE_REPORT_FILE}`);
  }
  if (FAIL_ON_DUPLICATE_IMAGES && duplicateImageGroups.length > 0) {
    throw new Error(`Phát hiện ${duplicateImageGroups.length} nhóm ảnh trùng fingerprint. Xem ${IMAGE_REPORT_FILE}`);
  }

  const evidenceResult = await resolveAllEvidence(flatProducts, imageResult.ok);
  const evidenceReport = {
    generatedAt: new Date().toISOString(),
    total: flatProducts.length,
    resolved: evidenceResult.size,
    officialFactSources: [...evidenceResult.values()].filter((item) => item.primarySource.official && item.primarySource.supportsProductFacts).length,
    datasheets: [...evidenceResult.values()].filter((item) => item.datasheet).length,
    productsWithVerifiedSpecifications: [...evidenceResult.values()].filter((item) => item.specifications.length > 0).length,
    verifiedSpecificationFields: [...evidenceResult.values()].reduce((sum, item) => sum + item.specifications.length, 0),
    httpValidated: [...evidenceResult.values()].filter((item) => item.primarySource.httpValidated).length,
    statusCounts: {
      verifiedSpecifications: [...evidenceResult.values()].filter((item) => item.evidenceStatus === 'verified-specifications').length,
      officialSourceOnly: [...evidenceResult.values()].filter((item) => item.evidenceStatus === 'official-source-only').length,
      unresolved: [...evidenceResult.values()].filter((item) => item.evidenceStatus === 'unresolved').length,
    },
    unresolved: [...evidenceResult.values()].filter((item) => item.evidenceStatus === 'unresolved').map((item) => ({
      productName: item.productName,
      url: item.primarySource.url,
      domain: item.primarySource.domain,
      sourceType: item.primarySource.sourceType,
    })),
    items: [...evidenceResult.values()],
  };
  await fs.writeFile(EVIDENCE_REPORT_FILE, JSON.stringify(evidenceReport, null, 2), 'utf8');

  if (REQUIRE_OFFICIAL_SOURCE && evidenceReport.officialFactSources !== flatProducts.length) {
    throw new Error(`REQUIRE_OFFICIAL_SOURCE=true nhưng mới có ${evidenceReport.officialFactSources}/${flatProducts.length} nguồn hãng. Xem ${EVIDENCE_REPORT_FILE}`);
  }
  if (REQUIRE_DATASHEET && evidenceReport.datasheets !== flatProducts.length) {
    throw new Error(`REQUIRE_DATASHEET=true nhưng mới có ${evidenceReport.datasheets}/${flatProducts.length} datasheet. Xem ${EVIDENCE_REPORT_FILE}`);
  }
  if (REQUIRE_VERIFIED_SPECIFICATIONS && evidenceReport.productsWithVerifiedSpecifications !== flatProducts.length) {
    throw new Error(`REQUIRE_VERIFIED_SPECIFICATIONS=true nhưng mới có ${evidenceReport.productsWithVerifiedSpecifications}/${flatProducts.length} sản phẩm có specs. Xem ${EVIDENCE_REPORT_FILE}`);
  }

  const categoryIdBySlug = new Map<string, mongoose.Types.ObjectId>();
  const prepared: any[] = [];

  if (!DRY_RUN) {
    await connectMongo();
    console.log('✅ Đã kết nối MongoDB.');

    if (RESET_ALL_PRODUCTS) {
      const result = await Product.deleteMany({});
      console.log(`🗑️  Đã xóa toàn bộ ${result.deletedCount} sản phẩm theo yêu cầu RESET_ALL_PRODUCTS=true.`);
      const catResult = await ProductCategory.deleteMany({});
      console.log(`🗑️  Đã xóa toàn bộ ${catResult.deletedCount} danh mục mới theo yêu cầu.`);
      const legacyCatResult = await Category.deleteMany({});
      console.log(`🗑️  Đã xóa toàn bộ ${legacyCatResult.deletedCount} danh mục legacy theo yêu cầu.`);
    } else if (RESET_PRODUCTS) {

      const result = await Product.deleteMany({ seedSource: SEED_TAG });
      console.log(`🗑️  Đã xóa ${result.deletedCount} sản phẩm của seed ${SEED_TAG}.`);
    }


    for (const group of ACTIVE_PRODUCT_CATALOG) {
      categoryIdBySlug.set(
        group.slug,
        await ensureCategoryPath(categoryPath(group.slug, group.category), categorySeoByKey),
      );
    }
  }

  for (const group of ACTIVE_PRODUCT_CATALOG) {
    const pathNames = categoryPath(group.slug, group.category);
    const categoryId = categoryIdBySlug.get(group.slug);

    for (const name of group.products) {
      const brand = detectBrand(name);
      const partNumber = extractPartNumber(name, brand);
      const model = partNumber;
      const image = imageResult.ok.get(name);
      if (!image) throw new Error(`Thiếu ảnh sau bước tiền kiểm: ${name}`);

      // code/sku là mã model/part number của hãng, tuyệt đối không tự sinh mã CTC.
      const sku = partNumber;
      const evidence = evidenceResult.get(name);
      if (!evidence) throw new Error(`Thiếu evidence sau bước tiền kiểm: ${name}`);
      const source = evidence.primarySource;
      const content = buildProductContent({ name, brand, model, group, sku, image, evidence, categoryPathNames: pathNames });
      const imagePublicUrl = absoluteUrl(image.publicUrl);

      prepared.push({
        name,
        slug: content.slug,
        code: sku,
        sku,
        brand,
        manufacturer: brand,
        model,
        partNumber,
        mpn: partNumber,
        category: pathNames[pathNames.length - 1],
        categoryLabel: pathNames[pathNames.length - 1].toUpperCase(),
        categoryPath: pathNames,
        categoryId,
        description: content.description,
        shortDescription: content.shortDescription,
        specifications: content.specifications.length > 0
          ? content.specifications.map((item) => `${item.name}: ${item.value}`).join('; ')
          : `Model: ${model}; Thương hiệu: ${brand}; Danh mục: ${pathNames[pathNames.length - 1]}; chưa công bố thông số chi tiết do chưa đủ evidence trích xuất.`,
        verifiedSpecifications: content.specifications,
        datasheet: evidence.datasheet,
        datasheetUrl: evidence.datasheet?.url || null,
        evidenceStatus: content.evidenceStatus,
        features: [
          `Model / dòng sản phẩm: ${model}`,
          `Thương hiệu: ${brand}`,
          `Giá bán: Liên hệ`,
          `Tư vấn tương thích theo hệ thống thực tế`,
          `Tiếp nhận yêu cầu giao hàng trên toàn quốc theo điều kiện báo giá`,
        ],
        price: '0',
        originalPrice: '0',
        priceText: 'Liên hệ',
        contactPrice: true,
        stockStatus: 'contact',
        stock: 0,
        warranty: 'Theo chính sách của hãng và báo giá được xác nhận',
        image: imagePublicUrl,
        images: [imagePublicUrl],
        imageAlt: content.imageAlt,
        sourceUrl: source.supportsProductFacts ? source.url : image.sourcePage,
        sourceDomain: source.supportsProductFacts ? source.domain : image.sourceDomain,
        sourceEvidence: evidence,
        imageSource: {
          originalUrl: image.imageUrl,
          sourcePage: image.sourcePage,
          sourceDomain: image.sourceDomain,
          officialSource: image.officialSource,
          verifiedAt: image.verifiedAt,
          mirrored: image.mirrored,
          width: image.width,
          height: image.height,
          contentHash: image.contentHash,
          matchEvidence: image.matchEvidence,
        },
        focusKeyword: content.focusKeyword,
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        canonicalPath: content.canonicalPath,
        canonicalUrl: content.canonicalUrl,
        seo: content.seo,
        geo: content.geo,
        faq: content.faq,
        structuredData: content.structuredData,
        isFeatured: false,
        isActive: true,
        isPublished: true,
        views: 0,
        likes: 0,
        seedSource: SEED_TAG,
        dataQuality: {
          productNameType: 'catalog-model',
          pricePolicy: 'contact',
          imageValidated: true,
          imageOfficialSource: image.officialSource,
          imageModelMatchScore: image.matchEvidence.score,
          imageContentHash: image.contentHash,
          officialProductSourceResolved: source.official && source.supportsProductFacts,
          sourceHttpValidated: source.httpValidated,
          datasheetResolved: Boolean(evidence.datasheet),
          verifiedSpecificationCount: evidence.specifications.length,
          evidenceStatus: evidence.evidenceStatus,
          contentDoesNotInferSpecifications: true,
          geoStandard: GEO_STANDARD,
        },
      });
    }
  }

  await fs.writeFile(
    PRODUCT_PREVIEW_FILE,
    JSON.stringify(prepared.slice(0, 20), null, 2),
    'utf8',
  );

  if (prepared.length !== flatProducts.length) throw new Error(`Payload cuối phải có ${flatProducts.length} sản phẩm, hiện có ${prepared.length}.`);

  if (DRY_RUN) {
    console.log(`\n🧪 DRY_RUN=true: đã kiểm chứng ảnh-model, evidence, datasheet/specs và Category SEO; chưa ghi MongoDB.`);
    console.log(`📄 Báo cáo ảnh       : ${IMAGE_REPORT_FILE}`);
    console.log(`📄 Báo cáo evidence  : ${EVIDENCE_REPORT_FILE}`);
    console.log(`📄 Báo cáo category  : ${CATEGORY_REPORT_FILE}`);
    console.log(`📄 Preview           : ${PRODUCT_PREVIEW_FILE}`);
    return;
  }

  await bulkUpsertProducts(prepared);
  await updateCategoryCounts();
  console.log(`\n✅ Hoàn thành V6: upsert ${prepared.length} sản phẩm thật, Category SEO, evidence/datasheet/specs và ảnh đúng model.`);
}

main()
  .catch((error) => {
    console.error('\n❌ Seed thất bại:', error instanceof Error ? error.stack || error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
