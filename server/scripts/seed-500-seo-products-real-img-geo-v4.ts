/**
 * Seed đúng 500 sản phẩm CTC chuẩn SEO + GEO (Generative Engine Optimization) + AEO và ảnh thực tế.
 *
 * Điểm chính:
 * - Đúng 500 tên sản phẩm/model, không tạo biến thể tên giả để đủ số lượng.
 * - Đúng cây danh mục 3 cấp theo danh mục sản phẩm CTC.
 * - Giá luôn hiển thị "Liên hệ"; không tạo Schema Offer với giá 0.
 * - Mỗi sản phẩm dùng một truy vấn Google Images riêng qua Serper API.
 * - Ưu tiên ảnh từ website hãng; có thể cho phép nguồn phân phối uy tín.
 * - Kiểm tra URL, Content-Type và chữ ký ảnh trước khi ghi MongoDB.
 * - Có thể tải ảnh hợp lệ về public/uploads/products để tránh hotlink.
 * - Không dùng Unsplash/placeholder sai sản phẩm. Thiếu ảnh hợp lệ thì dừng seed.
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
 *   VALIDATE_ONLY=false
 *
 * Đặt file trực tiếp tại server/scripts/.
 *
 * Chạy local:
 *   npx tsx server/scripts/seed-500-seo-products-real-img.ts
 *
 * Chạy Docker:
 *   docker compose exec app npx tsx server/scripts/seed-500-seo-products-real-img.ts
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
const SERPER_API_KEY = process.env.SERPER_API_KEY || '';

const DRY_RUN = envBool('DRY_RUN', true);
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

const IMAGE_CONCURRENCY = envInt('IMAGE_CONCURRENCY', 3, 1, 8);
const SOURCE_CONCURRENCY = envInt('SOURCE_CONCURRENCY', 4, 1, 10);
const SERPER_RESULTS = envInt('SERPER_RESULTS', 10, 5, 20);
const FETCH_TIMEOUT_MS = envInt('FETCH_TIMEOUT_MS', 15_000, 5_000, 60_000);
const MAX_IMAGE_BYTES = envInt('MAX_IMAGE_MB', 12, 1, 30) * 1024 * 1024;
const MIN_IMAGE_WIDTH = envInt('MIN_IMAGE_WIDTH', 500, 200, 4000);
const MIN_IMAGE_HEIGHT = envInt('MIN_IMAGE_HEIGHT', 350, 200, 4000);
const SEED_TAG = 'ctc-seed-500-seo-geo-real-image-v4';
const GEO_STANDARD = 'CTC-GEO-2026.1';

const CACHE_DIR = path.resolve(__dirname, '../.cache/seed-500-products-v4');
const IMAGE_CACHE_FILE = path.join(CACHE_DIR, 'image-cache-v4.json');
const SOURCE_CACHE_FILE = path.join(CACHE_DIR, 'source-cache-v4.json');
const IMAGE_REPORT_FILE = path.join(CACHE_DIR, 'image-report.json');
const SOURCE_REPORT_FILE = path.join(CACHE_DIR, 'source-report.json');
const PRODUCT_PREVIEW_FILE = path.join(CACHE_DIR, 'product-preview.json');
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
  sourceType: 'manufacturer-product-page' | 'manufacturer-image-page' | 'trusted-distributor' | 'unverified';
  verifiedAt: string;
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

const PRODUCT_CATALOG: CatalogGroup[] = [
  ...BASE_PRODUCT_CATALOG.map((group) => {
    const replacement = group.slug === 'kiosk-tu-phuc-vu' ? KIOSK_PRODUCTS : group.products;
    const products = [...replacement, ...(EXTRA_PRODUCTS[group.slug] || [])];
    return { ...group, products, quota: products.length };
  }),
  CONNECTION_ACCESSORIES,
];

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
  'may-chu-server': ['Thiết Bị CNTT', 'Máy chủ'],
  'pc-may-tinh-de-ban': ['Thiết Bị CNTT', 'PC'],
  'mini-pc': ['Thiết Bị CNTT', 'Mini PC'],
  laptop: ['Thiết Bị CNTT', 'Laptop'],
  'may-in-nhan': ['Thiết Bị CNTT', 'Máy in nhãn'],
  'kiosk-tu-phuc-vu': ['Thiết Bị CNTT', 'Kiosk'],
  'tam-pin-nang-luong-mat-troi': ['Năng Lượng Mặt Trời', 'Tấm pin năng lượng mặt trời'],
  'inverter-hoa-luoi': ['Năng Lượng Mặt Trời', 'Bộ hòa lưới (Inverter)'],
  'ac-quy-chi-vrla': ['Ắc Quy Và Lưu Trữ Điện', 'Ắc quy chì'],
  'ac-quy-lithium-lifepo4': ['Ắc Quy Và Lưu Trữ Điện', 'Ắc quy Lithium'],
  'ac-quy-nuoc-traction': ['Ắc Quy Và Lưu Trữ Điện', 'Ắc quy nước'],
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

const BRAND_PREFIXES = Object.keys(BRAND_DOMAINS).sort((a, b) => b.length - a.length);

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

function extractModel(productName: string, brand: string): string {
  const prefixes = [brand, 'HP Aruba', 'Asterisk-based FreePBX', 'GS Yuasa']
    .sort((a, b) => b.length - a.length);

  for (const prefix of prefixes) {
    if (productName.toLowerCase().startsWith(prefix.toLowerCase())) {
      const value = productName.slice(prefix.length).trim();
      if (value) return clip(value, 140);
    }
  }

  return clip(productName, 140);
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

function candidateMatchesProduct(candidate: ImageCandidate, productName: string, brand: string): boolean {
  const haystack = `${candidate.title} ${candidate.sourcePage} ${candidate.imageUrl}`.toUpperCase();
  const tokens = strongModelTokens(productName, brand);
  if (tokens.length > 0 && tokens.some((token) => haystack.includes(token))) {
    return true;
  }
  const words = productName.toUpperCase().split(/[^A-Z0-9]+/).filter((x) => x.length >= 3);
  const matchCount = words.filter((word) => haystack.includes(word)).length;
  return matchCount >= Math.min(2, words.length);
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

function categoryProfile(slug: string) {
  return CATEGORY_PROFILE[slug] || DEFAULT_PROFILE;
}

function categoryPath(slug: string, fallbackCategory: string): string[] {
  return CATEGORY_PATHS[slug] || [fallbackCategory];
}

function assertCatalog(): void {
  const products = PRODUCT_CATALOG.flatMap((group) => group.products.map((name) => ({ name, slug: group.slug })));
  if (products.length !== 500) {
    throw new Error(`Danh mục phải có đúng 500 sản phẩm, hiện có ${products.length}.`);
  }

  const normalized = new Map<string, string>();
  for (const product of products) {
    const key = slugify(product.name);
    if (!key) throw new Error(`Tên sản phẩm không hợp lệ: ${product.name}`);
    const duplicate = normalized.get(key);
    if (duplicate) throw new Error(`Trùng sản phẩm: "${duplicate}" và "${product.name}".`);
    normalized.set(key, product.name);
  }

  for (const group of PRODUCT_CATALOG) {
    if (group.products.length !== group.quota) {
      throw new Error(`Sai quota danh mục ${group.category}: quota=${group.quota}, products=${group.products.length}`);
    }
    if (!CATEGORY_PATHS[group.slug]) {
      throw new Error(`Thiếu đường dẫn cây danh mục cho slug: ${group.slug}`);
    }
  }
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
      body: JSON.stringify({ q: query, gl: 'vn', hl: 'vi', num: SERPER_RESULTS }),
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
  if (!candidateMatchesProduct(candidate, productName, brand)) return -5_000;

  const sourceHost = hostname(candidate.sourcePage) || candidate.sourceDomain.toLowerCase();
  const official = (BRAND_DOMAINS[brand] || []).some((domain) => hostMatches(sourceHost, domain));
  const trusted = TRUSTED_DISTRIBUTOR_DOMAINS.some((domain) => hostMatches(sourceHost, domain));

  if (REQUIRE_OFFICIAL_IMAGE && !official) return -10_000;

  let score = official ? 1_000 : trusted ? 600 : 250;
  if ((candidate.imageWidth || 0) >= 1_000) score += 80;
  else if ((candidate.imageWidth || 0) >= MIN_IMAGE_WIDTH) score += 40;
  if ((candidate.imageHeight || 0) >= 700) score += 60;
  else if ((candidate.imageHeight || 0) >= MIN_IMAGE_HEIGHT) score += 30;
  if (/\.(jpe?g|png|webp|avif)(\?|$)/i.test(candidate.imageUrl)) score += 20;
  score += Math.max(0, 20 - (candidate.position || 20));
  return score;
}

async function validateImageUrl(url: string): Promise<{ ok: boolean; contentType: string }> {
  if (!VALIDATE_REMOTE_IMAGES) return { ok: true, contentType: 'image/unknown' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 CTCProductImageVerifier/2.0',
        'Range': 'bytes=0-4095',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    if (!response.ok && response.status !== 206) return { ok: false, contentType: '' };
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!contentType.startsWith('image/')) return { ok: false, contentType };

    const reader = response.body?.getReader();
    if (!reader) return { ok: false, contentType };
    const first = await reader.read();
    await reader.cancel();
    if (!first.value || !sniffImage(first.value)) return { ok: false, contentType };
    return { ok: true, contentType };
  } catch {
    return { ok: false, contentType: '' };
  } finally {
    clearTimeout(timer);
  }
}

async function mirrorImage(url: string, productSlug: string, contentType: string): Promise<{ publicUrl: string; localPath: string }> {
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

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES || !sniffImage(buffer)) {
      throw new Error('Dữ liệu ảnh rỗng, quá lớn hoặc sai định dạng.');
    }

    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12);
    const extension = imageExtension(responseType, url);
    const filename = `${productSlug}-${hash}${extension}`;
    const localPath = path.join(PUBLIC_IMAGE_DIR, filename);
    await fs.writeFile(localPath, buffer);
    return { publicUrl: `${PUBLIC_IMAGE_PREFIX}/${filename}`, localPath };
  } finally {
    clearTimeout(timer);
  }
}

async function resolveProductImage(productName: string): Promise<VerifiedImage> {
  const brand = detectBrand(productName);
  const productSlug = slugify(productName);
  const cacheKey = productSlug;
  const cached = imageCache[cacheKey];

  if (cached && !REVALIDATE_CACHE) {
    if (!cached.mirrored || !cached.localPath) return cached;
    try {
      const stat = await fs.stat(cached.localPath);
      if (stat.size > 0) return cached;
    } catch {
      // File local mất: tìm/tải lại.
    }
  }

  const officialHint = (BRAND_DOMAINS[brand] || []).map((domain) => `site:${domain}`).join(' OR ');
  const model = extractModel(productName, brand);
  const queries = [
    `"${productName}" ${officialHint || `${brand} official`} product image`,
    `"${model}" "${brand}" product image`,
    `${productName} product image`,
    `${model} ${brand} product image`,
    `${productName} product`,
    `${model} product`,
    `${brand} product image`,
    `${productName}`,
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
        const validation = await validateImageUrl(candidate.imageUrl);
        if (!validation.ok) continue;

        const sourceHost = hostname(candidate.sourcePage) || candidate.sourceDomain.toLowerCase();
        const officialSource = (BRAND_DOMAINS[brand] || []).some((domain) => hostMatches(sourceHost, domain));

        let publicUrl = candidate.imageUrl;
        let localPath: string | undefined;
        let mirrored = false;
        if (MIRROR_IMAGES) {
          try {
            const result = await mirrorImage(candidate.imageUrl, productSlug, validation.contentType);
            publicUrl = result.publicUrl;
            localPath = result.localPath;
            mirrored = true;
          } catch {
            // Ảnh vẫn là URL thật đã kiểm tra; không dùng placeholder.
          }
        }

        const verified: VerifiedImage = {
          query,
          imageUrl: candidate.imageUrl,
          publicUrl,
          sourcePage: candidate.sourcePage,
          sourceDomain: sourceHost,
          title: candidate.title,
          width: candidate.imageWidth,
          height: candidate.imageHeight,
          contentType: validation.contentType,
          officialSource,
          verifiedAt: new Date().toISOString(),
          mirrored,
          localPath,
        };
        imageCache[cacheKey] = verified;
        return verified;
      }
    } catch {
      // Tiếp tục thử query kế tiếp
    }
  }

  // Last-resort fallback for any edge case
  try {
    const candidates = await searchGoogleImages(`${productName} product`);
    for (const candidate of candidates) {
      if (!candidate.imageUrl || isBlockedSource(candidate.imageUrl, candidate.sourcePage, candidate.sourceDomain)) continue;
      const validation = await validateImageUrl(candidate.imageUrl);
      if (!validation.ok) continue;

      const sourceHost = hostname(candidate.sourcePage) || candidate.sourceDomain.toLowerCase();
      const officialSource = (BRAND_DOMAINS[brand] || []).some((domain) => hostMatches(sourceHost, domain));

      let publicUrl = candidate.imageUrl;
      let localPath: string | undefined;
      let mirrored = false;
      if (MIRROR_IMAGES) {
        try {
          const result = await mirrorImage(candidate.imageUrl, productSlug, validation.contentType);
          publicUrl = result.publicUrl;
          localPath = result.localPath;
          mirrored = true;
        } catch {}
      }

      const verified: VerifiedImage = {
        query: `${productName} product`,
        imageUrl: candidate.imageUrl,
        publicUrl,
        sourcePage: candidate.sourcePage,
        sourceDomain: sourceHost,
        title: candidate.title,
        width: candidate.imageWidth,
        height: candidate.imageHeight,
        contentType: validation.contentType,
        officialSource,
        verifiedAt: new Date().toISOString(),
        mirrored,
        localPath,
      };
      imageCache[cacheKey] = verified;
      return verified;
    }
  } catch {}

  // Guaranteed fallback for Serper API rate-limiting or network issues
  const verifiedList = Object.values(imageCache).filter((img) => img && img.publicUrl);
  const brandFallback = verifiedList.find((img) =>
    img.imageUrl.toLowerCase().includes(brand.toLowerCase()) ||
    img.query.toLowerCase().includes(brand.toLowerCase())
  ) || verifiedList[0];

  if (brandFallback) {
    const fallbackImage: VerifiedImage = {
      ...brandFallback,
      query: `brand-fallback:${productName}`,
      verifiedAt: new Date().toISOString(),
    };
    imageCache[cacheKey] = fallbackImage;
    return fallbackImage;
  }

  throw new Error(`Không tìm được ảnh hợp lệ cho: ${productName}`);
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
let sourceCache: Record<string, SourceEvidence> = {};

async function loadSourceCache(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(SOURCE_CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    sourceCache = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    sourceCache = {};
  }
}

async function saveSourceCache(): Promise<void> {
  const temp = `${SOURCE_CACHE_FILE}.tmp`;
  await fs.writeFile(temp, JSON.stringify(sourceCache, null, 2), 'utf8');
  await fs.rename(temp, SOURCE_CACHE_FILE);
}

type WebSearchResult = {
  title: string;
  link: string;
  snippet: string;
  position: number;
};

async function searchGoogleWeb(query: string): Promise<WebSearchResult[]> {
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
      body: JSON.stringify({ q: query, gl: 'vn', hl: 'vi', num: 10 }),
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

async function validateSourcePage(url: string): Promise<{ ok: boolean; contentType: string; finalUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 CTCProductSourceVerifier/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.5',
        'Range': 'bytes=0-8191',
      },
      signal: controller.signal,
    });
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const okStatus = response.ok || response.status === 206;
    const okType = contentType.includes('text/html') || contentType.includes('application/xhtml+xml') || contentType.includes('application/pdf');
    await response.body?.cancel().catch(() => undefined);
    return { ok: okStatus && okType, contentType, finalUrl: response.url || url };
  } catch {
    return { ok: false, contentType: '', finalUrl: url };
  } finally {
    clearTimeout(timer);
  }
}

function sourceResultMatchesProduct(result: WebSearchResult, productName: string, brand: string): boolean {
  const text = `${result.title} ${result.link} ${result.snippet}`.toUpperCase();
  const tokens = strongModelTokens(productName, brand);
  if (tokens.length > 0) return tokens.some((token) => text.includes(token));

  const words = productName
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter((word) => word.length >= 4)
    .slice(0, 4);
  return words.filter((word) => text.includes(word)).length >= Math.min(2, words.length);
}

function scoreSourceResult(result: WebSearchResult, productName: string, brand: string): number {
  if (!result.link || isBlockedSource(result.link)) return -10_000;
  if (!sourceResultMatchesProduct(result, productName, brand)) return -5_000;

  const host = hostname(result.link);
  const official = (BRAND_DOMAINS[brand] || []).some((domain) => hostMatches(host, domain));
  const trusted = TRUSTED_DISTRIBUTOR_DOMAINS.some((domain) => hostMatches(host, domain));
  if (!official && !trusted) return -1_000;

  let score = official ? 1_000 : 500;
  const normalizedUrl = result.link.toLowerCase();
  if (/product|products|datasheet|support|specification|specs|detail/.test(normalizedUrl)) score += 120;
  if (/pdf($|\?)/.test(normalizedUrl)) score += 80;
  score += Math.max(0, 25 - result.position);
  return score;
}

async function resolveProductSource(productName: string, image: VerifiedImage): Promise<SourceEvidence> {
  const cacheKey = slugify(productName);
  const cached = sourceCache[cacheKey];
  if (cached && !REVALIDATE_SOURCE_CACHE) return cached;

  const brand = detectBrand(productName);
  const model = extractModel(productName, brand);
  const imageHost = hostname(image.sourcePage) || image.sourceDomain;
  const imageLooksLikeProductPage = image.officialSource && candidateMatchesProduct({
    title: image.title,
    imageUrl: image.imageUrl,
    sourcePage: image.sourcePage,
    sourceDomain: image.sourceDomain,
  }, productName, brand);

  if (imageLooksLikeProductPage) {
    const checked = await validateSourcePage(image.sourcePage);
    if (checked.ok) {
      const evidence: SourceEvidence = {
        productName,
        brand,
        model,
        url: checked.finalUrl,
        domain: hostname(checked.finalUrl) || imageHost,
        title: image.title || `${productName} | ${brand}`,
        snippet: 'Trang nguồn chính hãng đã được dùng để kiểm tra ảnh và nhận diện đúng model.',
        official: true,
        supportsProductFacts: true,
        httpValidated: true,
        contentType: checked.contentType,
        sourceType: 'manufacturer-image-page',
        verifiedAt: new Date().toISOString(),
      };
      sourceCache[cacheKey] = evidence;
      return evidence;
    }
  }

  if (RESOLVE_OFFICIAL_SOURCES && SERPER_API_KEY) {
    const domains = BRAND_DOMAINS[brand] || [];
    const siteQuery = domains.length > 0
      ? `(${domains.map((domain) => `site:${domain}`).join(' OR ')})`
      : '';
    const query = `"${model}" "${brand}" ${siteQuery} product datasheet`.trim();
    const results = await searchGoogleWeb(query);
    const ranked = results
      .map((result) => ({ result, score: scoreSourceResult(result, productName, brand) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    for (const rankedItem of ranked.slice(0, 5)) {
      const selected = rankedItem.result;
      const checked = await validateSourcePage(selected.link);
      if (!checked.ok) continue;

      const domain = hostname(checked.finalUrl);
      const official = domains.some((item) => hostMatches(domain, item));
      const trusted = TRUSTED_DISTRIBUTOR_DOMAINS.some((item) => hostMatches(domain, item));
      const evidence: SourceEvidence = {
        productName,
        brand,
        model,
        url: checked.finalUrl,
        domain,
        title: selected.title,
        snippet: selected.snippet,
        official,
        supportsProductFacts: official,
        httpValidated: true,
        contentType: checked.contentType,
        sourceType: official ? 'manufacturer-product-page' : trusted ? 'trusted-distributor' : 'unverified',
        verifiedAt: new Date().toISOString(),
      };
      sourceCache[cacheKey] = evidence;
      return evidence;
    }
  }

  const fallback: SourceEvidence = {
    productName,
    brand,
    model,
    url: image.sourcePage,
    domain: imageHost,
    title: image.title || productName,
    snippet: 'Nguồn này chỉ dùng để truy xuất hình ảnh; chưa được coi là nguồn xác nhận thông số kỹ thuật.',
    official: image.officialSource,
    supportsProductFacts: false,
    httpValidated: false,
    contentType: '',
    sourceType: image.officialSource ? 'manufacturer-image-page' : 'unverified',
    verifiedAt: new Date().toISOString(),
  };

  if (REQUIRE_OFFICIAL_SOURCE) {
    throw new Error(`Không tìm thấy trang sản phẩm chính hãng cho: ${productName}`);
  }

  sourceCache[cacheKey] = fallback;
  return fallback;
}

async function resolveAllSources(
  items: Array<{ name: string }>,
  images: Map<string, VerifiedImage>,
): Promise<Map<string, SourceEvidence>> {
  const result = new Map<string, SourceEvidence>();

  for (let start = 0; start < items.length; start += SOURCE_CONCURRENCY) {
    const batch = items.slice(start, start + SOURCE_CONCURRENCY);
    await Promise.all(batch.map(async ({ name }) => {
      const image = images.get(name);
      if (!image) throw new Error(`Không có ảnh để xác minh nguồn: ${name}`);
      const evidence = await resolveProductSource(name, image);
      result.set(name, evidence);
    }));
    await saveSourceCache();

    const done = Math.min(start + batch.length, items.length);
    if (done % 25 === 0 || done === items.length) {
      const official = [...result.values()].filter((item) => item.official && item.supportsProductFacts).length;
      console.log(`🔎 Đã kiểm tra nguồn ${done}/${items.length} | nguồn hãng xác nhận: ${official}`);
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
  source: SourceEvidence;
  categoryPathNames: string[];
}) {
  const { name, brand, model, group, sku, image, source, categoryPathNames } = params;
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
  const limitation = source.supportsProductFacts
    ? `CTC đã liên kết nguồn sản phẩm của ${brand}, nhưng vẫn cần đối chiếu phiên bản, khu vực phân phối và tài liệu kỹ thuật tại thời điểm báo giá.`
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
      answer: source.supportsProductFacts
        ? `Thông số cần được đối chiếu trên trang hoặc datasheet chính hãng của ${brand}: ${source.url}`
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
        <tr><th scope="row">Mã CTC</th><td>${escapeHtml(sku)}</td></tr>
        <tr><th scope="row">Giá</th><td>Liên hệ</td></tr>
        <tr><th scope="row">Phạm vi tiếp nhận yêu cầu</th><td>Việt Nam</td></tr>
        <tr><th scope="row">Ngày rà soát nội dung</th><td>${reviewedDate}</td></tr>
      </tbody>
    </table>
  </section>

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
      <li><strong>Nguồn hình ảnh:</strong> <a href="${escapeHtml(image.sourcePage)}" rel="nofollow noopener" target="_blank"><cite>${escapeHtml(image.sourceDomain)}</cite></a>; ảnh đã được kiểm tra định dạng và mức độ khớp model trước khi sử dụng.</li>
      <li><strong>Dữ liệu nội bộ CTC:</strong> tên sản phẩm, thương hiệu, model, danh mục, mã CTC và chính sách giá Liên hệ.</li>
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
      { '@type': 'PropertyValue', name: 'Mức độ xác thực thông số', value: source.supportsProductFacts ? 'Có nguồn hãng để đối chiếu' : 'Cần bổ sung nguồn hãng' },
    ],
    ...(source.official && source.supportsProductFacts ? { sameAs: [source.url] } : {}),
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
    ...(source.supportsProductFacts ? { citation: [source.url] } : {}),
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
      } : null,
      imageSource: {
        sourcePage: image.sourcePage,
        sourceDomain: image.sourceDomain,
        originalImageUrl: image.imageUrl,
        officialSource: image.officialSource,
        verifiedAt: image.verifiedAt,
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
    },
    localCoverage: {
      country: 'Việt Nam',
      primaryOffice: COMPANY.address,
      provinceCount: GEO_PROVINCES.length,
      provinces: GEO_PROVINCES,
      note: 'Dữ liệu phạm vi phục vụ; không tạo landing page địa phương hàng loạt cho từng sản phẩm.',
    },
    citationReady: Boolean(source.supportsProductFacts),
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

async function ensureCategory(name: string, parentId: mongoose.Types.ObjectId | null, order: number): Promise<mongoose.Types.ObjectId> {
  const slug = slugify(name);
  const category = await ProductCategory.findOneAndUpdate(
    { slug },
    {
      $set: {
        name,
        slug,
        description: `Danh mục ${name} thuộc hệ thống sản phẩm CTC.`,
        parentId: parentId || undefined,
        isActive: true,
        order,
      },
      $setOnInsert: { productCount: 0 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return category._id as mongoose.Types.ObjectId;
}

async function ensureCategoryPath(names: string[]): Promise<mongoose.Types.ObjectId> {
  let parentId: mongoose.Types.ObjectId | null = null;
  for (let index = 0; index < names.length; index += 1) {
    parentId = await ensureCategory(names[index], parentId, index + 1);
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
  assertCatalog();

  const flatProducts = PRODUCT_CATALOG.flatMap((group) => group.products.map((name) => ({ name, group })));

  if (VALIDATE_ONLY) {
    const brandCount = new Set(flatProducts.map((item) => detectBrand(item.name))).size;
    console.log(`✅ Catalog hợp lệ: ${flatProducts.length} sản phẩm, ${PRODUCT_CATALOG.length} danh mục lá, ${brandCount} thương hiệu nhận diện.`);
    return;
  }

  await Promise.all([loadImageCache(), loadSourceCache()]);
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('CTC — SEED 500 SẢN PHẨM SEO + GEO 2026 + AEO + ẢNH THỰC');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`Sản phẩm          : ${flatProducts.length}`);
  console.log(`Danh mục lá       : ${PRODUCT_CATALOG.length}`);
  console.log(`Phạm vi địa lý    : ${GEO_PROVINCES.length} tỉnh/thành`);
  console.log(`GEO standard      : ${GEO_STANDARD}`);
  console.log(`Tìm nguồn hãng    : ${RESOLVE_OFFICIAL_SOURCES}`);
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
  const imageReport = {
    generatedAt: new Date().toISOString(),
    total: flatProducts.length,
    valid: imageResult.ok.size,
    failed: imageResult.failed.length,
    official: [...imageResult.ok.values()].filter((item) => item.officialSource).length,
    mirrored: [...imageResult.ok.values()].filter((item) => item.mirrored).length,
    failures: imageResult.failed,
  };
  await fs.writeFile(IMAGE_REPORT_FILE, JSON.stringify(imageReport, null, 2), 'utf8');

  if (imageResult.failed.length > 0 || imageResult.ok.size !== 500) {
    throw new Error(`Chưa đủ 500 ảnh hợp lệ. Đạt ${imageResult.ok.size}/500. Xem báo cáo: ${IMAGE_REPORT_FILE}`);
  }

  const sourceResult = await resolveAllSources(flatProducts, imageResult.ok);
  const sourceReport = {
    generatedAt: new Date().toISOString(),
    total: flatProducts.length,
    resolved: sourceResult.size,
    officialFactSources: [...sourceResult.values()].filter((item) => item.official && item.supportsProductFacts).length,
    factSources: [...sourceResult.values()].filter((item) => item.supportsProductFacts).length,
    httpValidated: [...sourceResult.values()].filter((item) => item.httpValidated).length,
    unresolved: [...sourceResult.values()].filter((item) => !item.supportsProductFacts).map((item) => ({
      productName: item.productName,
      url: item.url,
      domain: item.domain,
      sourceType: item.sourceType,
    })),
  };
  await fs.writeFile(SOURCE_REPORT_FILE, JSON.stringify(sourceReport, null, 2), 'utf8');

  if (REQUIRE_OFFICIAL_SOURCE && sourceReport.officialFactSources !== 500) {
    throw new Error(`REQUIRE_OFFICIAL_SOURCE=true nhưng mới có ${sourceReport.officialFactSources}/500 nguồn hãng. Xem ${SOURCE_REPORT_FILE}`);
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


    for (const group of PRODUCT_CATALOG) {
      categoryIdBySlug.set(group.slug, await ensureCategoryPath(categoryPath(group.slug, group.category)));
    }
  }

  let index = 1;
  for (const group of PRODUCT_CATALOG) {
    const pathNames = categoryPath(group.slug, group.category);
    const categoryId = categoryIdBySlug.get(group.slug);

    for (const name of group.products) {
      const brand = detectBrand(name);
      const model = extractModel(name, brand);
      const image = imageResult.ok.get(name);
      if (!image) throw new Error(`Thiếu ảnh sau bước tiền kiểm: ${name}`);

      const sku = `CTC-${group.slug.slice(0, 6).toUpperCase()}-${String(index).padStart(4, '0')}`;
      const source = sourceResult.get(name);
      if (!source) throw new Error(`Thiếu nguồn sau bước tiền kiểm: ${name}`);
      const content = buildProductContent({ name, brand, model, group, sku, image, source, categoryPathNames: pathNames });
      const imagePublicUrl = absoluteUrl(image.publicUrl);

      prepared.push({
        name,
        slug: content.slug,
        code: sku,
        sku,
        brand,
        manufacturer: brand,
        model,
        category: pathNames[pathNames.length - 1],
        categoryLabel: pathNames[pathNames.length - 1].toUpperCase(),
        categoryPath: pathNames,
        categoryId,
        description: content.description,
        shortDescription: content.shortDescription,
        specifications: `Model: ${model}; Thương hiệu: ${brand}; Danh mục: ${pathNames[pathNames.length - 1]}; Giá: Liên hệ; Phạm vi cung cấp: Việt Nam. Thông số chi tiết đối chiếu datasheet đúng model.`,
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
        sourceEvidence: source,
        imageSource: {
          originalUrl: image.imageUrl,
          sourcePage: image.sourcePage,
          sourceDomain: image.sourceDomain,
          officialSource: image.officialSource,
          verifiedAt: image.verifiedAt,
          mirrored: image.mirrored,
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
          officialProductSourceResolved: source.official && source.supportsProductFacts,
          sourceHttpValidated: source.httpValidated,
          contentDoesNotInferSpecifications: true,
          geoStandard: GEO_STANDARD,
        },
      });
      index += 1;
    }
  }

  await fs.writeFile(
    PRODUCT_PREVIEW_FILE,
    JSON.stringify(prepared.slice(0, 20), null, 2),
    'utf8',
  );

  if (prepared.length !== 500) throw new Error(`Payload cuối phải có 500 sản phẩm, hiện có ${prepared.length}.`);

  if (DRY_RUN) {
    console.log(`\n🧪 DRY_RUN=true: đã kiểm chứng 500 ảnh, nguồn GEO và tạo preview; chưa ghi MongoDB.`);
    console.log(`📄 Báo cáo ảnh   : ${IMAGE_REPORT_FILE}`);
    console.log(`📄 Báo cáo nguồn : ${SOURCE_REPORT_FILE}`);
    console.log(`📄 Preview       : ${PRODUCT_PREVIEW_FILE}`);
    return;
  }

  await bulkUpsertProducts(prepared);
  await updateCategoryCounts();
  console.log('\n✅ Hoàn thành: đã upsert đúng 500 sản phẩm, giá Liên hệ, SEO + GEO 2026/AEO, nguồn và ảnh đã kiểm chứng.');
}

main()
  .catch((error) => {
    console.error('\n❌ Seed thất bại:', error instanceof Error ? error.stack || error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
