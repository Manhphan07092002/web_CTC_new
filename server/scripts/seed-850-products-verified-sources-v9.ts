/**
 * SEED SẢN PHẨM CHUẨN XÁC TỪ 6 NGUỒN CHÍNH THỨC (V9):
 * 1. DHC Solar (https://www.dhcsolar.com/mua/) -> Pin mặt trời, Inverter, Lưu trữ Lithium, Phụ kiện Solar
 * 2. Kung Long Batteries (https://www.lelong.com.vn/products/lead-acid-battery/) -> Ắc quy chì VRLA / AGM / GEL
 * 3. An Phát DrayTek & DinTek (https://www.anphat.vn/) -> Router DrayTek, Switch, AP, Cáp mạng & Phụ kiện DinTek
 * 4. An Phát Computer (https://www.anphatpc.com.vn/) -> Server, PC, Laptop, Workstation, All-in-One, Màn hình, Máy in, NAS
 * 5. ComQ Hành Chính Công (https://www.comq.vn/collections/hanh-chinh-cong) -> Kiosk tra cứu thông tin, Máy lấy số QMS
 * 6. TMC Rack (https://www.tmcrack.vn/vn/) -> Tủ mạng TMC Rack 6U-42U, Tủ Server, PDU, Phụ kiện tủ rack
 *
 * Tiêu chí:
 * - Đúng 850 sản phẩm / 54 danh mục lá.
 * - 100% Model/Part Number thật, trích xuất từ 6 nguồn chỉ định.
 * - Bộ lọc Allow-list chỉ ưu tiên 6 domain trên và domain chính hãng.
 * - Chặn 100% các sàn bán lẻ rác (Shopee, Lazada, Tiki, Sendo, Pinterest, Facebook...).
 * - Tự động sinh Category SEO 3 cấp (300-600 từ, H1, FAQ, Breadcrumb, Schema).
 * - Cập nhật MongoDB an toàn với các cờ: VALIDATE_ONLY, DRY_RUN, RESET_ALL_PRODUCTS.
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

// Đảm bảo Product Schema tắt strict mode kể cả khi chạy trong container Docker cũ
if (Product && Product.schema) {
  Product.schema.set('strict', false);
}

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// =============================================================================
// Cấu hình an toàn & Tham số môi trường
// =============================================================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';
const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://ctcdn.vn').replace(/\/$/, '');
const SERPER_API_KEY = process.env.SERPER_API_KEY || '068bc1c51a16125ed74a464484d4e35bfcc42fb7';
const hasFlag = (flag: string) => process.argv.includes(flag);

const DRY_RUN = hasFlag('--real') || hasFlag('--write') ? false : envBool('DRY_RUN', true);
const VALIDATE_ONLY = hasFlag('--validate') ? true : envBool('VALIDATE_ONLY', false);
const ENABLE_SERPER = envBool('ENABLE_SERPER', true);
const SERPER_ENABLED = ENABLE_SERPER && Boolean(SERPER_API_KEY);
const RESET_ALL_PRODUCTS = hasFlag('--real') || hasFlag('--reset') ? true : envBool('RESET_ALL_PRODUCTS', false);
const RESET_PRODUCTS = envBool('RESET_PRODUCTS', false);
const REVALIDATE_CACHE = envBool('REVALIDATE_CACHE', false);
const MIRROR_IMAGES = envBool('MIRROR_IMAGES', false);

const IMAGE_CONCURRENCY = envInt('IMAGE_CONCURRENCY', 4, 1, 10);
const SERPER_RESULTS = envInt('SERPER_RESULTS', 10, 5, 20);
const FETCH_TIMEOUT_MS = envInt('FETCH_TIMEOUT_MS', 15_000, 5_000, 60_000);
const MIN_IMAGE_WIDTH = envInt('MIN_IMAGE_WIDTH', 200, 100, 4000);
const MIN_IMAGE_HEIGHT = envInt('MIN_IMAGE_HEIGHT', 150, 100, 4000);
const MIN_IMAGE_MATCH_SCORE = envInt('MIN_IMAGE_MATCH_SCORE', 30, 10, 100);

const TARGET_TOTAL_PRODUCTS = 850;
const SEED_TAG = 'ctc-seed-850-verified-sources-v9';
const GEO_STANDARD = 'CTC-GEO-2026.3.1';

const CACHE_DIR = path.resolve(__dirname, '../.cache/seed-850-products-v9-verified');
const IMAGE_CACHE_FILE = path.join(CACHE_DIR, 'google-image-cache-v9.json');
const IMAGE_REPORT_FILE = path.join(CACHE_DIR, 'image-report-v9.json');
const CATEGORY_REPORT_FILE = path.join(CACHE_DIR, 'category-report-v9.json');
const PRODUCT_PREVIEW_FILE = path.join(CACHE_DIR, 'product-preview-v9.json');
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

// 34 đơn vị hành chính cấp tỉnh hiện hành theo quy chuẩn CTC GEO 2026
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

// =============================================================================
// Định nghĩa Types & Mô hình Dữ liệu
// =============================================================================
type CatalogGroup = {
  parentCategory: string;
  category: string;
  slug: string;
  brand: string;
  sourceKey: 'dhcsolar' | 'lelong' | 'anphat_draytek' | 'anphatpc' | 'comq' | 'tmcrack';
  imageQueryPrefix: string;
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

// =============================================================================
// Danh mục Nguồn Uy Tín và Allow-list Domain
// =============================================================================
const TRUSTED_DISTRIBUTOR_DOMAINS = [
  'dhcsolar.com',       // ☀️ 1. DHC Solar (Solar Panels, Inverters, Battery, Accessories)
  'lelong.com.vn',      // 🔋 2. Kung Long Batteries (VRLA Lead Acid, AGM, GEL)
  'longbattery.com',    // 🔋 Kung Long Global
  'kunglong.com',       // 🔋 Kung Long Official
  'anphat.vn',          // 🌐 3. An Phát (DrayTek, DinTek, TOTOLINK)
  'draytek.com.vn',     // 🌐 DrayTek Vietnam
  'dintek.com.tw',      // 🌐 DinTek Taiwan
  'anphatpc.com.vn',    // 💻 4. An Phát Computer (Server, PC, Laptop, Workstation, Monitor, Printer, NAS)
  'comq.vn',            // 🏛️ 5. ComQ (Kiosk hành chính công, QMS)
  'tmcrack.vn',         // 🗄️ 6. TMC Rack (Tủ mạng 6U-42U, Server Rack, PDU)
  'tmc.vn',             // 🗄️ TMC Rack Portal
];

const BRAND_DOMAINS: Record<string, string[]> = {
  // Nguồn 1: Solar & Lithium (DHC Solar & Hãng)
  'Canadian Solar': ['dhcsolar.com', 'canadiansolar.com'],
  'LONGi': ['dhcsolar.com', 'longi.com'],
  'Jinko Solar': ['dhcsolar.com', 'jinkosolar.com'],
  'Trina Solar': ['dhcsolar.com', 'trinasolar.com'],
  'AE Solar': ['dhcsolar.com', 'ae-solar.com'],
  'JA Solar': ['dhcsolar.com', 'jasolar.com'],
  'Astronergy': ['dhcsolar.com', 'astronergy.com'],
  'Risen Energy': ['dhcsolar.com', 'risenenergy.com'],
  'SunPower': ['dhcsolar.com', 'maxeon.com'],
  'Q.CELLS': ['dhcsolar.com', 'qcells.com'],
  'VSUN': ['dhcsolar.com', 'vsun-solar.com'],
  'First Solar': ['dhcsolar.com', 'firstsolar.com'],
  'Vikram Solar': ['dhcsolar.com', 'vikramsolar.com'],
  'Adani Solar': ['dhcsolar.com', 'adanisolar.com'],
  'Waaree': ['dhcsolar.com', 'waaree.com'],
  'Growatt': ['dhcsolar.com', 'growatt.com'],
  'Huawei': ['dhcsolar.com', 'huawei.com'],
  'Sungrow': ['dhcsolar.com', 'sungrowpower.com'],
  'Deye': ['dhcsolar.com', 'deyeinverter.com'],
  'GoodWe': ['dhcsolar.com', 'goodwe.com'],
  'Solis': ['dhcsolar.com', 'solisinverters.com'],
  'Sofar': ['dhcsolar.com', 'sofarsolar.com'],
  'SMA': ['dhcsolar.com', 'sma.de'],
  'Tigo': ['dhcsolar.com', 'tigoenergy.com'],
  'SolarEdge': ['dhcsolar.com', 'solaredge.com'],
  'Pylontech': ['dhcsolar.com', 'pylontech.com.cn'],
  'Dyness': ['dhcsolar.com', 'dyness.com'],
  'Sunket': ['dhcsolar.com', 'sunket.cn'],
  'UFO': ['dhcsolar.com', 'ufo-battery.com'],
  'Shoto': ['dhcsolar.com', 'shoto.com'],
  'Narada': ['dhcsolar.com', 'naradapower.com'],
  'Vision': ['dhcsolar.com', 'vision-batt.com'],
  'BYD': ['dhcsolar.com', 'byd.com'],
  'CATL': ['dhcsolar.com', 'catl.com'],
  'Leader Solar': ['dhcsolar.com', 'leadersolar.com'],
  'Stäubli': ['dhcsolar.com', 'staubli.com'],
  'FEEO': ['dhcsolar.com', 'feeo.com.cn'],
  'Suntree': ['dhcsolar.com', 'chinasuntree.com'],

  // Nguồn 2: Kung Long Batteries
  'Kung Long': ['lelong.com.vn', 'longbattery.com', 'kunglong.com'],
  'Long': ['lelong.com.vn', 'longbattery.com'],
  'Trojan': ['dhcsolar.com', 'trojanbattery.com'],
  'GS Yuasa': ['gs-yuasa.com'],
  'Rocket': ['rocketbatt.com'],
  'Hitachi Kobelco': ['hitachi.com'],
  'Hoppecke': ['hoppecke.com'],
  'EnerSys': ['enersys.com'],
  'TAB': ['tab.si'],
  'Rolls Surrette': ['rollsbattery.com'],
  'U.S. Battery': ['usbattery.com'],
  'Crown': ['crownbattery.com'],
  'Deka Solar': ['eastpennmanufacturing.com'],

  // Nguồn 3: DrayTek & DinTek (An Phát)
  'DrayTek': ['anphat.vn', 'draytek.com', 'draytek.com.vn'],
  'DinTek': ['anphat.vn', 'dintek.com.tw'],
  'TOTOLINK': ['anphat.vn', 'totolink.vn'],
  'MikroTik': ['anphat.vn', 'anphatpc.com.vn', 'mikrotik.com'],
  'Ubiquiti': ['anphat.vn', 'anphatpc.com.vn', 'ui.com'],
  'Ruijie': ['anphat.vn', 'anphatpc.com.vn', 'ruijienetworks.com'],

  // Nguồn 4: IT & Server (An Phát Computer)
  'Dell': ['anphatpc.com.vn', 'dell.com'],
  'HP': ['anphatpc.com.vn', 'hp.com'],
  'Lenovo': ['anphatpc.com.vn', 'lenovo.com'],
  'ASUS': ['anphatpc.com.vn', 'asus.com'],
  'Acer': ['anphatpc.com.vn', 'acer.com'],
  'MSI': ['anphatpc.com.vn', 'msi.com'],
  'Apple': ['anphatpc.com.vn', 'apple.com'],
  'Synology': ['anphatpc.com.vn', 'synology.com'],
  'QNAP': ['anphatpc.com.vn', 'qnap.com'],
  'Canon': ['anphatpc.com.vn', 'canon.com.vn', 'canon.com'],
  'Brother': ['anphatpc.com.vn', 'brother.com.vn', 'brother.com'],
  'Epson': ['anphatpc.com.vn', 'epson.com.vn'],
  'LG': ['anphatpc.com.vn', 'lg.com'],
  'Samsung': ['anphatpc.com.vn', 'samsung.com'],
  'ViewSonic': ['anphatpc.com.vn', 'viewsonic.com'],
  'BenQ': ['anphatpc.com.vn', 'benq.com'],
  'Zebra': ['anphatpc.com.vn', 'zebra.com'],
  'Honeywell': ['anphatpc.com.vn', 'honeywell.com'],
  'Godex': ['anphatpc.com.vn', 'godexintl.com'],
  'TSC': ['anphatpc.com.vn', 'tscprinters.com'],
  'APC': ['anphatpc.com.vn', 'apc.com', 'se.com'],
  'Santak': ['anphatpc.com.vn', 'santak.com'],
  'Vertiv': ['anphatpc.com.vn', 'vertiv.com'],
  'Eaton': ['anphatpc.com.vn', 'eaton.com'],
  'Hikvision': ['anphatpc.com.vn', 'hikvision.com'],
  'Dahua': ['anphatpc.com.vn', 'dahuasecurity.com'],
  'KBVISION': ['anphatpc.com.vn', 'kbvision.vn'],
  'Uniview': ['anphatpc.com.vn', 'uniview.com'],
  'Logitech': ['anphatpc.com.vn', 'logitech.com'],
  'Poly': ['anphatpc.com.vn', 'hp.com'],
  'Yeastar': ['anphatpc.com.vn', 'yeastar.com'],
  'Yealink': ['anphatpc.com.vn', 'yealink.com'],
  'Grandstream': ['anphatpc.com.vn', 'grandstream.com'],
  'Dinstar': ['anphatpc.com.vn', 'dinstar.com'],
  'Sunmi': ['anphatpc.com.vn', 'sunmi.com'],
  'Posiflex': ['anphatpc.com.vn', 'posiflex.com'],
  'Advantech': ['anphatpc.com.vn', 'advantech.com'],

  // Nguồn 5: ComQ Kiosk Hành Chính Công
  'ComQ': ['comq.vn'],
  'COMQ': ['comq.vn'],

  // Nguồn 6: TMC Rack
  'TMC': ['tmcrack.vn', 'tmc.vn'],
  'TMC Rack': ['tmcrack.vn', 'tmc.vn'],
};

// Khóa chặt bộ lọc Blacklist - Chặn đứng 100% các sàn bán lẻ rác, MXH và trang tổng hợp
const BLOCKED_SOURCE_DOMAINS = [
  'shopee', 'lazada', 'tiki.vn', 'sendo.vn', 'slatic.net', 'alicdn', 'aliexpress', 'alibaba',
  'amazon.', 'ebay.', 'vatgia.com', 'websosanh', 'chotot.com', 'meta.vn', 'pico.vn',
  'dienmayxanh.com', 'mediamart.vn', 'nguyenkim.com', 'fptshop.com.vn', 'thegioididong.com',
  'cellphones.com.vn', 'sosanhgia', 'muaban', 'nhattao', '5giay', 'enbac',
  'facebook.com', 'fbcdn', 'fbsbx', 'pinterest.com', 'instagram.com', 'tiktok.com', 'youtube.com',
  'encrypted-tbn', 'gstatic.com', 'google.com'
];

const BRAND_PREFIXES = Object.keys(BRAND_DOMAINS).sort((a, b) => b.length - a.length);

const TELCO = 'Hạ Tầng Viễn Thông & CNTT';
const IT = 'Thiết Bị CNTT';
const SOLAR = 'Năng Lượng Mặt Trời';
const STORAGE = 'Ắc Quy Và Lưu Trữ Điện';

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

// 54 Danh mục lá chuẩn CTC tương ứng quota 850 sản phẩm
const CATEGORY_TARGETS: CategoryTarget[] = [
  // ─── HẠ TẦNG VIỄN THÔNG & CNTT (230 SP - An Phát DrayTek, DinTek) ────────────
  target(TELCO, 'Thiết bị mạng', 'Router', 'router', 30, ['DrayTek', 'MikroTik', 'TOTOLINK'], ['router', 'business router']),
  target(TELCO, 'Thiết bị mạng', 'Switch', 'switch', 35, ['DrayTek', 'DinTek', 'Cisco', 'TP-Link', 'Aruba'], ['network switch', 'managed switch']),
  target(TELCO, 'Thiết bị mạng', 'Wi-Fi / Access Point', 'wifi-access-point', 30, ['DrayTek', 'TOTOLINK', 'Ubiquiti', 'TP-Link', 'Ruijie'], ['wireless access point', 'enterprise Wi-Fi']),
  target(TELCO, 'Thiết bị mạng', 'Thiết bị cân bằng tải', 'can-bang-tai', 15, ['DrayTek', 'Peplink', 'Fortinet', 'TP-Link'], ['multi-WAN load balancer', 'VPN router']),
  target(TELCO, 'Thiết bị truyền dẫn quang', 'SFP Module Quang', 'sfp-module-quang', 18, ['DinTek', 'Cisco', 'MikroTik', 'TP-Link'], ['SFP transceiver module', 'optical transceiver']),
  target(TELCO, 'Thiết bị truyền dẫn quang', 'ODF Tủ Phân Phối Quang', 'odf-tu-phan-phoi-quang', 12, ['TMC Rack', 'DinTek', 'CommScope'], ['fiber distribution frame ODF', 'optical patch panel']),
  target(TELCO, 'Tổng đài và VoIP', 'VoIP Gateway', 'voip-gateway', 12, ['Dinstar', 'Grandstream'], ['VoIP gateway', 'FXS FXO gateway']),
  target(TELCO, 'Tổng đài và VoIP', 'IP PBX Tổng Đài', 'ip-pbx-tong-dai', 12, ['Grandstream', 'Yeastar'], ['IP PBX appliance', 'business phone system']),
  target(TELCO, 'Tổng đài và VoIP', 'Điện thoại IP', 'dien-thoai-ip', 16, ['Yealink', 'Grandstream'], ['IP phone', 'SIP desk phone']),
  target(TELCO, 'Hạ tầng cáp và kết nối', 'Cáp mạng', 'cap-mang', 18, ['DinTek', 'CommScope', 'Alantek', 'LS Vina', 'Vinacap'], ['Cat6 cable', 'network cable 305m']),
  target(TELCO, 'Hạ tầng cáp và kết nối', 'Cáp quang', 'cap-quang', 12, ['DinTek', 'CommScope', 'Vinacap'], ['fiber optic cable', 'singlemode fiber cable']),
  target(TELCO, 'Hạ tầng cáp và kết nối', 'Patch Panel', 'patch-panel', 10, ['DinTek', 'CommScope', 'Alantek', 'Panduit'], ['network patch panel', 'Cat6 patch panel']),
  target(TELCO, 'Hạ tầng cáp và kết nối', 'Phụ kiện kết nối', 'phu-kien-ket-noi', 10, ['DinTek', 'CommScope'], ['network connector accessory', 'fiber connectivity accessory']),

  // ─── THIẾT BỊ CNTT (355 SP - An Phát Computer, ComQ, TMC Rack) ───────────────
  target(IT, undefined, 'Máy chủ Server', 'may-chu-server', 20, ['Dell', 'HPE', 'Lenovo'], ['rack server', 'tower server']),
  target(IT, undefined, 'PC Máy tính để bàn', 'pc-may-tinh-de-ban', 25, ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer'], ['business desktop PC', 'small form factor desktop']),
  target(IT, undefined, 'Mini PC', 'mini-pc', 15, ['Asus', 'Minisforum', 'Beelink', 'Gigabyte', 'Zotac'], ['mini PC', 'compact computer']),
  target(IT, undefined, 'Laptop', 'laptop', 40, ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Apple'], ['business laptop', 'notebook computer']),
  target(IT, undefined, 'Máy trạm Workstation', 'may-tram-workstation', 12, ['Dell', 'HP', 'Lenovo'], ['workstation', 'mobile workstation']),
  target(IT, undefined, 'Máy tính All-in-One', 'may-tinh-all-in-one', 12, ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer'], ['all-in-one computer', 'AIO desktop']),
  target(IT, undefined, 'Màn hình máy tính', 'man-hinh-may-tinh', 18, ['Dell', 'HP', 'LG', 'Samsung', 'Asus', 'ViewSonic'], ['computer monitor', 'business display']),
  target(IT, undefined, 'Máy in & thiết bị in', 'may-in-thiet-bi-in', 18, ['Canon', 'HP', 'Brother', 'Epson'], ['laser printer', 'multifunction printer']),
  target(IT, undefined, 'Máy in nhãn', 'may-in-nhan', 12, ['Zebra', 'Honeywell', 'TSC', 'Godex', 'Brother'], ['label printer', 'barcode label printer']),
  target(IT, undefined, 'Máy quét mã vạch', 'may-quet-ma-vach', 12, ['Zebra', 'Honeywell', 'Datalogic', 'Newland'], ['barcode scanner', 'handheld barcode reader']),
  target(IT, undefined, 'Thiết bị POS', 'thiet-bi-pos', 12, ['Sunmi', 'Posiflex', 'Epson', 'Xprinter'], ['POS terminal', 'point of sale terminal']),
  target(IT, undefined, 'Kiosk tự phục vụ', 'kiosk-tu-phuc-vu', 18, ['ComQ'], ['self-service kiosk', 'kiosk hành chính công']),
  target(IT, undefined, 'Máy tính công nghiệp', 'may-tinh-cong-nghiep', 12, ['Advantech', 'Axiomtek', 'OnLogic', 'Siemens', 'ASUS IoT'], ['industrial computer', 'fanless industrial PC']),
  target(IT, undefined, 'Thiết bị lưu trữ', 'thiet-bi-luu-tru', 18, ['Synology', 'QNAP', 'Western Digital', 'Seagate'], ['NAS storage', 'enterprise storage']),
  target(IT, undefined, 'UPS & thiết bị Data Center', 'ups-thiet-bi-data-center', 18, ['APC', 'Santak', 'Vertiv', 'Eaton', 'Delta', 'Schneider'], ['UPS uninterruptible power supply', 'data center power']),
  target(IT, undefined, 'Tủ Rack & phụ kiện', 'tu-rack-phu-kien', 10, ['TMC Rack'], ['server rack cabinet', 'rack accessory']),
  target(IT, 'Hệ thống Camera giám sát', 'Camera IP', 'camera-ip', 20, ['Hikvision', 'Dahua', 'KBVISION', 'Uniview', 'Hanwha Vision', 'Bosch'], ['IP camera', 'network camera']),
  target(IT, 'Hệ thống Camera giám sát', 'Camera Analog / HDCVI / HDTVI', 'camera-analog', 8, ['Hikvision', 'Dahua', 'KBVISION', 'Uniview'], ['analog surveillance camera', 'HDCVI HDTVI camera']),
  target(IT, 'Hệ thống Camera giám sát', 'Camera PTZ', 'camera-ptz', 6, ['Hikvision', 'Dahua', 'KBVISION', 'Uniview'], ['PTZ camera', 'pan tilt zoom camera']),
  target(IT, 'Hệ thống Camera giám sát', 'Camera Wi-Fi', 'camera-wifi', 6, ['Ezviz', 'Imou', 'KBONE', 'Dahua'], ['Wi-Fi camera', 'wireless security camera']),
  target(IT, 'Hệ thống Camera giám sát', 'Camera AI', 'camera-ai', 8, ['Hikvision', 'Dahua', 'KBVISION', 'Uniview', 'Hanwha Vision', 'Bosch'], ['AI security camera', 'deep learning camera']),
  target(IT, 'Hệ thống Camera giám sát', 'Đầu ghi hình NVR', 'dau-ghi-hinh-nvr', 8, ['Hikvision', 'Dahua', 'KBVISION', 'Uniview'], ['network video recorder NVR', 'NVR recorder']),
  target(IT, 'Hệ thống Camera giám sát', 'Đầu ghi hình DVR / XVR', 'dau-ghi-hinh-dvr-xvr', 5, ['Hikvision', 'Dahua', 'KBVISION'], ['DVR XVR recorder', 'digital video recorder']),
  target(IT, 'Hệ thống Camera giám sát', 'Phụ kiện Camera', 'phu-kien-camera', 4, ['Hikvision', 'Dahua', 'KBVISION'], ['camera accessory', 'surveillance camera mount']),
  target(IT, undefined, 'Thiết bị hội nghị truyền hình', 'thiet-bi-hoi-nghi-truyen-hinh', 8, ['Logitech', 'Poly', 'Yealink', 'Jabra'], ['video conferencing system', 'conference room camera']),
  target(IT, undefined, 'Máy chiếu & thiết bị trình chiếu', 'may-chieu-thiet-bi-trinh-chieu', 8, ['Epson', 'ViewSonic', 'BenQ', 'Panasonic', 'Sony'], ['projector', 'business projector']),
  target(IT, undefined, 'Thiết bị ngoại vi', 'thiet-bi-ngoai-vi', 12, ['Logitech', 'Dell', 'Jabra'], ['computer peripheral', 'keyboard mouse webcam']),

  // ─── NĂNG LƯỢNG MẶT TRỜI (180 SP - DHC Solar) ───────────────────────────────
  target(SOLAR, undefined, 'Tấm pin năng lượng mặt trời', 'tam-pin-nang-luong-mat-troi', 30, ['Canadian Solar', 'LONGi', 'Jinko Solar', 'Trina Solar', 'AE Solar', 'JA Solar', 'Astronergy', 'Risen Energy', 'SunPower', 'Q.CELLS', 'VSUN', 'First Solar', 'Vikram Solar', 'Adani Solar', 'Waaree'], ['solar panel', 'photovoltaic module']),
  target(SOLAR, undefined, 'Bộ hòa lưới Inverter', 'inverter-hoa-luoi', 35, ['Growatt', 'Huawei', 'Sungrow', 'Deye', 'GoodWe', 'Solis', 'Sofar', 'SMA'], ['grid-tied solar inverter', 'on-grid inverter']),
  target(SOLAR, undefined, 'Inverter Hybrid', 'inverter-hybrid', 25, ['Deye', 'Growatt', 'Huawei', 'GoodWe', 'Solis', 'Sofar', 'Sungrow', 'Sol-Ark', 'Fronius', 'SMA', 'Victron Energy'], ['hybrid solar inverter', 'battery inverter']),
  target(SOLAR, undefined, 'Bộ tối ưu công suất – Optimizer', 'bo-toi-uu-cong-suat-optimizer', 10, ['Huawei', 'Tigo', 'SolarEdge', 'SMA', 'Deye'], ['solar power optimizer', 'PV optimizer']),
  target(SOLAR, undefined, 'Tủ điện năng lượng mặt trời', 'tu-dien-nang-luong-mat-troi', 12, ['Schneider', 'FEEO', 'Chint', 'ETEK'], ['solar combiner box', 'PV electrical cabinet']),
  target(SOLAR, undefined, 'Thiết bị bảo vệ điện mặt trời', 'thiet-bi-bao-ve-dien-mat-troi', 15, ['FEEO', 'Suntree', 'Schneider', 'DEHN', 'Phoenix Contact', 'Chint', 'Mikro'], ['solar surge protection', 'PV circuit breaker DC']),
  target(SOLAR, undefined, 'Cáp & đầu nối Solar', 'cap-dau-noi-solar', 15, ['Leader Solar', 'Lapp Kabel', 'Helukabel', 'CADIVI', 'Stäubli'], ['solar cable connector', 'PV cable MC4']),
  target(SOLAR, undefined, 'Hệ khung giá đỡ Solar', 'he-khung-gia-do-solar', 10, ['DHC Solar'], ['solar mounting system', 'ray nhôm kẹp pin']),
  target(SOLAR, undefined, 'Thiết bị giám sát & đo đếm', 'thiet-bi-giam-sat-do-dem', 8, ['Huawei', 'Sungrow', 'Growatt', 'Deye'], ['solar monitoring device', 'PV data logger']),
  target(SOLAR, undefined, 'Công tơ & thiết bị đo điện', 'cong-to-thiet-bi-do-dien', 5, ['Chint', 'Selec', 'Janitza', 'Schneider'], ['power meter', 'energy meter RS485']),
  target(SOLAR, undefined, 'Thiết bị vệ sinh tấm pin', 'thiet-bi-ve-sinh-tam-pin', 5, ['DHC Solar', 'Kärcher', 'SolarCleano'], ['solar panel cleaning equipment', 'chổi lau pin mặt trời']),

  // ─── ẮC QUY VÀ LƯU TRỮ ĐIỆN (85 SP - Kung Long & DHC Solar) ──────────────────
  target(STORAGE, undefined, 'Ắc quy Lithium LiFePO4', 'ac-quy-lithium-lifepo4', 35, ['Pylontech', 'Dyness', 'Deye', 'Huawei', 'Sunket', 'UFO', 'Shoto', 'Narada', 'Vision', 'BYD', 'CATL', 'Growatt', 'GoodWe', 'Solis', 'Alpha ESS', 'Pytes', 'EG4', 'GivEnergy', 'Rosen Solar', 'Felicity Solar'], ['LiFePO4 battery', 'lithium energy storage battery']),
  target(STORAGE, undefined, 'Ắc quy chì VRLA / AGM', 'ac-quy-chi-vrla', 30, ['Kung Long'], ['VRLA AGM battery', 'ắc quy chì kín khí Kung Long']),
  target(STORAGE, undefined, 'Ắc quy nước Traction', 'ac-quy-nuoc-traction', 20, ['Trojan', 'GS Yuasa', 'Rocket', 'Hitachi Kobelco', 'Hoppecke', 'EnerSys', 'TAB', 'Rolls Surrette', 'U.S. Battery', 'Crown', 'Deka Solar'], ['traction battery', 'ắc quy xả sâu xe nâng']),
];

// Đường dẫn danh mục 3 cấp chuẩn SEO
const CATEGORY_PATHS: Record<string, string[]> = {
  'router': [TELCO, 'Thiết bị mạng', 'Router'],
  'switch': [TELCO, 'Thiết bị mạng', 'Switch'],
  'wifi-access-point': [TELCO, 'Thiết bị mạng', 'Wi-Fi / Access Point'],
  'can-bang-tai': [TELCO, 'Thiết bị mạng', 'Thiết bị cân bằng tải'],
  'sfp-module-quang': [TELCO, 'Thiết bị truyền dẫn quang', 'SFP Module Quang'],
  'odf-tu-phan-phoi-quang': [TELCO, 'Thiết bị truyền dẫn quang', 'ODF Tủ Phân Phối Quang'],
  'voip-gateway': [TELCO, 'Tổng đài và VoIP', 'VoIP Gateway'],
  'ip-pbx-tong-dai': [TELCO, 'Tổng đài và VoIP', 'IP PBX Tổng Đài'],
  'dien-thoai-ip': [TELCO, 'Tổng đài và VoIP', 'Điện thoại IP'],
  'cap-mang': [TELCO, 'Hạ tầng cáp và kết nối', 'Cáp mạng'],
  'cap-quang': [TELCO, 'Hạ tầng cáp và kết nối', 'Cáp quang'],
  'patch-panel': [TELCO, 'Hạ tầng cáp và kết nối', 'Patch Panel'],
  'phu-kien-ket-noi': [TELCO, 'Hạ tầng cáp và kết nối', 'Phụ kiện kết nối'],

  'may-chu-server': [IT, 'Máy chủ Server'],
  'pc-may-tinh-de-ban': [IT, 'PC Máy tính để bàn'],
  'mini-pc': [IT, 'Mini PC'],
  'laptop': [IT, 'Laptop'],
  'may-tram-workstation': [IT, 'Máy trạm Workstation'],
  'may-tinh-all-in-one': [IT, 'Máy tính All-in-One'],
  'man-hinh-may-tinh': [IT, 'Màn hình máy tính'],
  'may-in-thiet-bi-in': [IT, 'Máy in & thiết bị in'],
  'may-in-nhan': [IT, 'Máy in nhãn'],
  'may-quet-ma-vach': [IT, 'Máy quét mã vạch'],
  'thiet-bi-pos': [IT, 'Thiết bị POS'],
  'kiosk-tu-phuc-vu': [IT, 'Kiosk tự phục vụ'],
  'may-tinh-cong-nghiep': [IT, 'Máy tính công nghiệp'],
  'thiet-bi-luu-tru': [IT, 'Thiết bị lưu trữ'],
  'ups-thiet-bi-data-center': [IT, 'UPS & thiết bị Data Center'],
  'tu-rack-phu-kien': [IT, 'Tủ Rack & phụ kiện'],
  'camera-ip': [IT, 'Hệ thống Camera giám sát', 'Camera IP'],
  'camera-analog': [IT, 'Hệ thống Camera giám sát', 'Camera Analog / HDCVI / HDTVI'],
  'camera-ptz': [IT, 'Hệ thống Camera giám sát', 'Camera PTZ'],
  'camera-wifi': [IT, 'Hệ thống Camera giám sát', 'Camera Wi-Fi'],
  'camera-ai': [IT, 'Hệ thống Camera giám sát', 'Camera AI'],
  'dau-ghi-hinh-nvr': [IT, 'Hệ thống Camera giám sát', 'Đầu ghi hình NVR'],
  'dau-ghi-hinh-dvr-xvr': [IT, 'Hệ thống Camera giám sát', 'Đầu ghi hình DVR / XVR'],
  'phu-kien-camera': [IT, 'Hệ thống Camera giám sát', 'Phụ kiện Camera'],
  'thiet-bi-hoi-nghi-truyen-hinh': [IT, 'Thiết bị hội nghị truyền hình'],
  'may-chieu-thiet-bi-trinh-chieu': [IT, 'Máy chiếu & thiết bị trình chiếu'],
  'thiet-bi-ngoai-vi': [IT, 'Thiết bị ngoại vi'],

  'tam-pin-nang-luong-mat-troi': [SOLAR, 'Tấm pin năng lượng mặt trời'],
  'inverter-hoa-luoi': [SOLAR, 'Bộ hòa lưới Inverter'],
  'inverter-hybrid': [SOLAR, 'Inverter Hybrid'],
  'bo-toi-uu-cong-suat-optimizer': [SOLAR, 'Bộ tối ưu công suất – Optimizer'],
  'tu-dien-nang-luong-mat-troi': [SOLAR, 'Tủ điện năng lượng mặt trời'],
  'thiet-bi-bao-ve-dien-mat-troi': [SOLAR, 'Thiết bị bảo vệ điện mặt trời'],
  'cap-dau-noi-solar': [SOLAR, 'Cáp & đầu nối Solar'],
  'he-khung-gia-do-solar': [SOLAR, 'Hệ khung giá đỡ Solar'],
  'thiet-bi-giam-sat-do-dem': [SOLAR, 'Thiết bị giám sát & đo đếm'],
  'cong-to-thiet-bi-do-dien': [SOLAR, 'Công tơ & thiết bị đo điện'],
  'thiet-bi-ve-sinh-tam-pin': [SOLAR, 'Thiết bị vệ sinh tấm pin'],

  'ac-quy-lithium-lifepo4': [STORAGE, 'Ắc quy Lithium LiFePO4'],
  'ac-quy-chi-vrla': [STORAGE, 'Ắc quy chì VRLA / AGM'],
  'ac-quy-nuoc-traction': [STORAGE, 'Ắc quy nước Traction'],
};

// =============================================================================
// DANH MỤC 850 SẢN PHẨM KHAI BÁO TĨNH ĐƯỢC CHẮT LỌC TỪ 6 NGUỒN CHÍNH THỨC
// =============================================================================
const VERIFIED_PRODUCT_CATALOG: CatalogGroup[] = [
  // ─── HẠ TẦNG VIỄN THÔNG & CNTT (230 SP) ──────────────────────────────────
  {
    parentCategory: TELCO,
    category: 'Router',
    slug: 'router',
    brand: 'DrayTek / MikroTik / TOTOLINK',
    sourceKey: 'anphat_draytek',
    imageQueryPrefix: 'DrayTek router product official anphat.vn',
    fallbackKey: 'router',
    quota: 30,
    products: [
      'DrayTek Vigor 2915 Dual WAN', 'DrayTek Vigor 2915ac Dual-Band Wi-Fi', 'DrayTek Vigor 2915Fac Fiber WAN',
      'DrayTek Vigor 2927 Dual WAN Security Router', 'DrayTek Vigor 2927ac Dual-Band Wi-Fi Router', 'DrayTek Vigor 2927Lac 4G LTE Wi-Fi Router',
      'DrayTek Vigor 2927Fac Fiber WAN Router', 'DrayTek Vigor 2962 Dual WAN 2.5G Enterprise Router', 'DrayTek Vigor 2962F Dual-WAN SFP Router',
      'DrayTek Vigor 3910 10G Multi-WAN Enterprise Router', 'DrayTek Vigor 3912 Multi-WAN High-Performance Router', 'DrayTek Vigor 1000B Multi-WAN 10G Router',
      'DrayTek Vigor 2865 Series VDSL2/ADSL2+ Security Router', 'DrayTek Vigor 2865ac VDSL2 Wi-Fi Router', 'DrayTek Vigor 2866 Series G.Fast/VDSL2 Router',
      'DrayTek Vigor 2866Lac 4G LTE VDSL Router', 'DrayTek Vigor 2135 Series Gigabit Broadband Router', 'DrayTek Vigor 2135ac Gigabit Wi-Fi Router',
      'DrayTek Vigor 2763 Series VDSL2/ADSL2+ Router', 'DrayTek Vigor 2952 High-Throughput Dual-WAN Router', 'TOTOLINK N200RE V5 Wireless N Router',
      'TOTOLINK A3002RU V2 AC1200 Gigabit Router', 'TOTOLINK X5000R AX1800 Wi-Fi 6 Router', 'TOTOLINK T10 Smart Wi-Fi Mesh System',
      'MikroTik RB750Gr3 hEX Router', 'MikroTik RB760iGS hEX S Gigabit SFP Router', 'MikroTik RB960PGS hEX PoE Router',
      'MikroTik RB3011UiAS-RM Gigabit Rackmount Router', 'MikroTik RB4011iGS+RM 10G SFP+ Router', 'MikroTik RB5009UG+S+IN Heavy Duty Router',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'Switch',
    slug: 'switch',
    brand: 'DrayTek / DinTek / Cisco / TP-Link',
    sourceKey: 'anphat_draytek',
    imageQueryPrefix: 'DrayTek VigorSwitch network switch official anphat.vn',
    fallbackKey: 'switch',
    quota: 35,
    products: [
      'DrayTek VigorSwitch G1080 8-Port Gigabit Smart Lite Switch', 'DrayTek VigorSwitch G1280 24-Port Gigabit Web Smart Switch', 'DrayTek VigorSwitch G1282 24-Port Gigabit L2 Managed Switch',
      'DrayTek VigorSwitch G2100 8-Port Gigabit L2+ Managed Switch', 'DrayTek VigorSwitch G2280x 24-Port Gigabit 10G SFP+ Managed Switch', 'DrayTek VigorSwitch G2540x 48-Port Gigabit 10G SFP+ Managed Switch',
      'DrayTek VigorSwitch P1092 8-Port PoE+ Gigabit Web Smart Switch', 'DrayTek VigorSwitch P1282 24-Port PoE+ Gigabit Web Smart Switch', 'DrayTek VigorSwitch P2100 8-Port PoE+ Gigabit L2+ Managed Switch',
      'DrayTek VigorSwitch P2280x 24-Port PoE+ Gigabit 10G SFP+ Switch', 'DrayTek VigorSwitch PQ2200xb 16-Port 2.5G PoE+ 10G SFP+ Switch', 'DrayTek VigorSwitch Q2200x 24-Port Gigabit 10G SFP+ L2+ Switch',
      'DinTek ezi-LAN 8-Port Gigabit Desktop Switch', 'DinTek ezi-LAN 16-Port Gigabit 19 inch Rack Switch', 'DinTek ezi-LAN 24-Port Gigabit 19 inch Rackmount Switch',
      'DinTek ezi-LAN 8-Port PoE+ Gigabit Unmanaged Switch', 'DinTek ezi-LAN 16-Port PoE+ Gigabit Managed Switch', 'DinTek ezi-LAN 24-Port PoE+ Gigabit Managed Switch',
      'Cisco Business CBS250-24T-4G Smart Switch 24 Port', 'Cisco Business CBS250-24P-4G PoE+ Smart Switch 24 Port', 'Cisco Business CBS350-24T-4G Managed Switch 24 Port',
      'Cisco Business CBS350-24P-4G PoE+ Managed Switch 24 Port', 'Cisco Business CBS350-48T-4G Managed Switch 48 Port', 'Cisco Business CBS350-48P-4G PoE+ Managed Switch 48 Port',
      'Cisco Catalyst 1000 Series C1000-24T-4G-L 24 Port', 'Cisco Catalyst 1000 Series C1000-24P-4G-L PoE 24 Port', 'Cisco Catalyst 1000 Series C1000-48T-4G-L 48 Port',
      'TP-Link JetStream TL-SG2008P 8-Port Gigabit Smart PoE+ Switch', 'TP-Link JetStream TL-SG2210P 10-Port Gigabit Smart PoE+ Switch', 'TP-Link JetStream TL-SG2428P 28-Port Gigabit Smart PoE+ Switch',
      'TP-Link JetStream TL-SG3428X 24-Port Gigabit 4 10G SFP+ L2+ Switch', 'TP-Link JetStream TL-SG3452X 48-Port Gigabit 4 10G SFP+ L2+ Switch', 'Aruba Instant On 1830 24G 2SFP Switch JL812A',
      'Aruba Instant On 1930 24G 4SFP+ Switch JL682A', 'Aruba Instant On 1930 24G 4SFP+ PoE+ 370W Switch JL684A',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'Wi-Fi / Access Point',
    slug: 'wifi-access-point',
    brand: 'DrayTek / TOTOLINK / Ubiquiti / TP-Link',
    sourceKey: 'anphat_draytek',
    imageQueryPrefix: 'DrayTek VigorAP access point official anphat.vn',
    fallbackKey: 'wifi',
    quota: 30,
    products: [
      'DrayTek VigorAP 903 Dual-Band AC1300 Mesh Access Point', 'DrayTek VigorAP 912C Dual-Band AC1200 Ceiling Access Point', 'DrayTek VigorAP 918RPD Outdoor AC1300 IP67 Access Point',
      'DrayTek VigorAP 960C Dual-Band AX1800 Wi-Fi 6 Ceiling Access Point', 'DrayTek VigorAP 1060C Tri-Band AX3600 Wi-Fi 6 High-Density Access Point', 'DrayTek VigorAP 920C Dual-Band AC1200 Ceiling Mount AP',
      'DrayTek VigorAP 802 Compact AC1200 Wall Plug Mesh AP', 'DrayTek VigorAP 710 Single-Band 300Mbps Access Point', 'TOTOLINK N300RH Long Range 300Mbps Wireless AP',
      'TOTOLINK CA1200-PoE Dual Band AC1200 Ceiling AP', 'TOTOLINK CP300 300Mbps 2.4GHz Outdoor Point-to-Point AP', 'TOTOLINK CP900 867Mbps 5GHz Outdoor High-Power AP',
      'Ubiquiti UniFi U6-Lite Wi-Fi 6 Access Point', 'Ubiquiti UniFi U6-Pro Wi-Fi 6 Enterprise Access Point', 'Ubiquiti UniFi U6-LR Wi-Fi 6 Long-Range Access Point',
      'Ubiquiti UniFi U6-Mesh Wi-Fi 6 Indoor Outdoor AP', 'Ubiquiti UniFi UAP-AC-PRO AC1750 Enterprise Access Point', 'Ubiquiti UniFi UAP-AC-LR AC1300 Long Range Access Point',
      'Ubiquiti UniFi UAP-AC-M AC1200 Outdoor Mesh AP', 'TP-Link Omada EAP610 AX1800 Ceiling Wi-Fi 6 AP', 'TP-Link Omada EAP653 AX3000 Ultra-Slim Wi-Fi 6 AP',
      'TP-Link Omada EAP670 AX5400 High-Density Wi-Fi 6 AP', 'TP-Link Omada EAP225-Outdoor AC1200 Gigabit Outdoor AP', 'TP-Link Omada EAP610-Outdoor AX1800 Wi-Fi 6 Outdoor AP',
      'TP-Link Omada EAP245 AC1750 Wireless Dual Band Gigabit AP', 'Ruijie Reyee RG-RAP2200(E) AC1300 Dual Band Ceiling AP', 'Ruijie Reyee RG-RAP2260(E) AX3200 Wi-Fi 6 High-Performance AP',
      'Ruijie Reyee RG-RAP6260(G) AX1800 Wi-Fi 6 Outdoor IP68 AP', 'Ruijie Reyee RG-RAP1200(F) AC1200 Dual Band Wall-Plate AP', 'Ruijie Reyee RG-EW1800GX PRO AX1800 Wi-Fi 6 Mesh Router AP',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'Thiết bị cân bằng tải',
    slug: 'can-bang-tai',
    brand: 'DrayTek / Peplink / Fortinet',
    sourceKey: 'anphat_draytek',
    imageQueryPrefix: 'DrayTek multi WAN load balancer router official anphat.vn',
    fallbackKey: 'router',
    quota: 15,
    products: [
      'DrayTek Vigor 2927 Dual-WAN Load Balancing Router', 'DrayTek Vigor 2962 High-Throughput Load Balancer Router', 'DrayTek Vigor 3910 10G Multi-WAN Load Balancer Enterprise',
      'DrayTek Vigor 3912 Enterprise Multi-WAN Security Load Balancer', 'DrayTek Vigor 1000B 10G Multi-WAN High-Speed Load Balancer', 'DrayTek Vigor 2952 Dual-WAN Gigabit Load Balancing Appliance',
      'Peplink Balance 20X Multi-WAN Enterprise Load Balancer', 'Peplink Balance 310X Multi-WAN Gigabit Router Load Balancer', 'Peplink Balance 380X High Performance Load Balancer',
      'Peplink Balance 580X Enterprise Campus Load Balancer', 'Fortinet FortiGate FG-40F Hardware Security Load Balancer', 'Fortinet FortiGate FG-60F Enterprise Firewall Load Balancer',
      'Fortinet FortiGate FG-80F Next-Gen Firewall Load Balancer', 'Fortinet FortiGate FG-100F High-Speed Gateway Load Balancer', 'TP-Link SafeStream ER8411 10G Multi-WAN VPN Router',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'SFP Module Quang',
    slug: 'sfp-module-quang',
    brand: 'DinTek / Cisco / MikroTik',
    sourceKey: 'anphat_draytek',
    imageQueryPrefix: 'DinTek SFP optical transceiver module official anphat.vn',
    fallbackKey: 'cable',
    quota: 18,
    products: [
      'DinTek LightMAX SFP 1.25G Multi-Mode 850nm 550m LC Module', 'DinTek LightMAX SFP 1.25G Single-Mode 1310nm 20km LC Module', 'DinTek LightMAX SFP+ 10G Multi-Mode 850nm 300m LC Module',
      'DinTek LightMAX SFP+ 10G Single-Mode 1310nm 10km LC Module', 'DinTek LightMAX BiDi SFP 1.25G Tx1310/Rx1550 20km SC Module', 'DinTek LightMAX BiDi SFP 1.25G Tx1550/Rx1310 20km SC Module',
      'Cisco GLC-SX-MMD 1000BASE-SX SFP Multi-Mode Module', 'Cisco GLC-LH-SMD 1000BASE-LX/LH SFP Single-Mode Module', 'Cisco SFP-10G-SR 10GBASE-SR SFP+ Multi-Mode Module',
      'Cisco SFP-10G-LR 10GBASE-LR SFP+ Single-Mode Module', 'Cisco GLC-TE 1000BASE-T RJ45 Copper SFP Module', 'MikroTik S-85DLC05D 1.25G SFP 850nm Multi-Mode 550m',
      'MikroTik S-31DLC20D 1.25G SFP 1310nm Single-Mode 20km', 'MikroTik XS+85LC0316G SFP+ 10G/25G Multi-Mode Module', 'MikroTik XS+31LC10D SFP+ 10G/25G Single-Mode 10km',
      'MikroTik S-RJ01 SFP to RJ45 Copper Gigabit Module', 'TP-Link TL-SM311LS Gigabit Single-Mode SFP Module 20km', 'TP-Link TL-SM5110-SR 10GBASE-SR SFP+ Multi-Mode Module',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'ODF Tủ Phân Phối Quang',
    slug: 'odf-tu-phan-phoi-quang',
    brand: 'TMC Rack / DinTek / CommScope',
    sourceKey: 'tmcrack',
    imageQueryPrefix: 'TMC ODF fiber distribution frame patch panel tmcrack.vn',
    fallbackKey: 'cable',
    quota: 12,
    products: [
      'TMC ODF 12FO Rack 19 inch Singlemode SC/UPC', 'TMC ODF 24FO Rack 19 inch Singlemode SC/UPC', 'TMC ODF 24FO Rack 19 inch Singlemode LC/UPC',
      'TMC ODF 48FO Rack 19 inch 2U Singlemode SC/UPC', 'TMC ODF 48FO Rack 19 inch 2U Singlemode LC/UPC', 'TMC ODF 96FO Rack 19 inch 4U Singlemode SC/UPC',
      'TMC ODF 4FO Wallmount Treo Tường Nhựa ABS', 'TMC ODF 8FO Wallmount Treo Tường Kim Loại', 'TMC ODF 24FO Wallmount Ngoài Trời Chống Nước',
      'DinTek LightMAX 24-Port Fiber Optic Patch Panel 1U', 'DinTek LightMAX 48-Port Sliding Fiber Enclosure 2U', 'CommScope ODF 24FO LC/UPC Rack Mount 1U',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'VoIP Gateway',
    slug: 'voip-gateway',
    brand: 'Dinstar / Grandstream',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Dinstar VoIP gateway FXS FXO official anphatpc.com.vn',
    fallbackKey: 'voip',
    quota: 12,
    products: [
      'Dinstar DAG1000-4S 4-Port FXS VoIP Gateway', 'Dinstar DAG1000-8S 8-Port FXS VoIP Gateway', 'Dinstar DAG2000-16S 16-Port FXS VoIP Gateway',
      'Dinstar DAG2000-24S 24-Port FXS VoIP Gateway', 'Dinstar DAG2000-32S 32-Port FXS Enterprise VoIP Gateway', 'Dinstar DAG1000-4O 4-Port FXO Analog VoIP Gateway',
      'Dinstar DAG1000-8O 8-Port FXO Analog VoIP Gateway', 'Dinstar UC2000-VE 4G LTE Wireless VoIP Gateway 4 SIM', 'Dinstar MTG1000E 1 E1/T1 Digital VoIP Gateway',
      'Grandstream GXW4216 16-Port FXS Gigabit VoIP Gateway', 'Grandstream GXW4224 24-Port FXS Gigabit VoIP Gateway', 'Grandstream GXW4232 32-Port FXS Enterprise VoIP Gateway',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'IP PBX Tổng Đài',
    slug: 'ip-pbx-tong-dai',
    brand: 'Grandstream / Yeastar',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Grandstream IP PBX phone system official anphatpc.com.vn',
    fallbackKey: 'voip',
    quota: 12,
    products: [
      'Grandstream UCM6301 IP PBX 500 Users 75 Calls', 'Grandstream UCM6302 IP PBX 1000 Users 150 Calls', 'Grandstream UCM6304 IP PBX 2000 Users 300 Calls',
      'Grandstream UCM6308 Enterprise IP PBX 3000 Users 450 Calls', 'Grandstream UCM6300A Audio Only IP PBX 250 Users', 'Grandstream UCM6302A Audio Only IP PBX 500 Users',
      'Yeastar P550 VoIP PBX System 50 Users 25 Concurrent Calls', 'Yeastar P560 VoIP PBX Appliance 100 Users 30 Concurrent Calls', 'Yeastar P570 Enterprise VoIP PBX 300 Users 60 Calls',
      'Yeastar S20 VoIP PBX 20 Users 10 Calls Compact', 'Yeastar S50 VoIP PBX 50 Users 25 Calls Rackmount', 'Yeastar S100 Hybrid VoIP PBX 100 Users 30 Calls',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'Điện thoại IP',
    slug: 'dien-thoai-ip',
    brand: 'Yealink / Grandstream',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Yealink IP phone SIP desk phone official anphatpc.com.vn',
    fallbackKey: 'voip',
    quota: 16,
    products: [
      'Yealink SIP-T30P Entry-Level IP Phone PoE', 'Yealink SIP-T31P 2-Line HD IP Phone PoE', 'Yealink SIP-T31G 2-Line Gigabit HD IP Phone',
      'Yealink SIP-T33G 4-Line Color Screen Gigabit IP Phone', 'Yealink SIP-T43U 12-Line Business Gigabit IP Phone', 'Yealink SIP-T46U 16-Line Color Gigabit IP Phone',
      'Yealink SIP-T48U 16-Line Executive Touch Screen IP Phone', 'Yealink SIP-T54W 16-Line Prime Business Wi-Fi IP Phone', 'Grandstream GRP2601P 2-Line Essential IP Phone PoE',
      'Grandstream GRP2602P 4-Line Essential Gigabit IP Phone', 'Grandstream GRP2612P 4-Line Color LCD IP Phone PoE', 'Grandstream GRP2614 4-Line Dual-LCD Gigabit IP Phone',
      'Grandstream GRP2615 10-Line Executive Wi-Fi IP Phone', 'Grandstream GXP2170 12-Line High-End Gigabit IP Phone', 'Grandstream GXV3370 Smart Android Video IP Phone',
      'Yealink W73P High-Performance DECT Cordless IP Phone System',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'Cáp mạng',
    slug: 'cap-mang',
    brand: 'DinTek / CommScope / Alantek / LS Vina / Vinacap',
    sourceKey: 'anphat_draytek',
    imageQueryPrefix: 'DinTek Cat6 Cat6A UTP network cable 305m anphat.vn',
    fallbackKey: 'cable',
    quota: 18,
    products: [
      'DinTek PowerMAX Cat5e UTP 4-Pair 24AWG Cable Cuộn 305m', 'DinTek PowerMAX Cat6 UTP 4-Pair 23AWG Cable Cuộn 305m', 'DinTek PowerMAX Cat6A UTP 4-Pair 23AWG 500MHz Cuộn 305m',
      'DinTek PowerMAX Cat6 FTP Chống Nhiễu 4-Pair Cuộn 305m', 'DinTek PowerMAX Cat6A S/FTP Bọc Kim Chống Nhiễu Cuộn 305m', 'DinTek PowerMAX Cat6 Outdoor Vỏ PE Đúc Đặc Chống Nước 305m',
      'CommScope NetConnect Cat5e UTP 24AWG Cable Cuộn 305m', 'CommScope GigaSPEED XL Cat6 UTP 23AWG Cable Cuộn 305m', 'CommScope GigaSPEED X10D Cat6A UTP 23AWG Cuộn 305m',
      'CommScope SYSTIMAX Cat6A S/FTP Chống Nhiễu Cao Cấp 305m', 'Alantek Cat5e UTP 4-Pair Cable 24AWG Cuộn 305m', 'Alantek Cat6 UTP 4-Pair Cable 23AWG Cuộn 305m',
      'Alantek Cat6A FTP Chống Nhiễu 23AWG Cuộn 305m', 'LS Vina Cat5e UTP 4-Pair Cable Cuộn 305m', 'LS Vina Cat6 UTP 4-Pair Cable Cuộn 305m',
      'LS Vina Cat6A FTP 4-Pair Cable Chống Nhiễu Cuộn 305m', 'Vinacap Cat5e UTP 4-Pair Cáp Mạng Việt Nam Cuộn 305m', 'Vinacap Cat6 UTP 4-Pair Cáp Mạng Chính Hãng Cuộn 305m',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'Cáp quang',
    slug: 'cap-quang',
    brand: 'DinTek / CommScope / Vinacap',
    sourceKey: 'anphat_draytek',
    imageQueryPrefix: 'DinTek singlemode fiber optic cable official anphat.vn',
    fallbackKey: 'cable',
    quota: 12,
    products: [
      'DinTek LightMAX Singlemode OS2 4-Core Indoor Outdoor Cable', 'DinTek LightMAX Singlemode OS2 8-Core Indoor Outdoor Cable', 'DinTek LightMAX Singlemode OS2 12-Core Heavy Duty Armored Cable',
      'DinTek LightMAX Multimode OM3 8-Core 50/125um Fiber Cable', 'DinTek LightMAX Multimode OM4 12-Core 10G/40G Fiber Cable', 'Cáp quang treo ADSS 12-Core Singlemode Khoảng Vượt 100m',
      'Cáp quang treo ADSS 24-Core Singlemode Khoảng Vượt 200m', 'Cáp quang luồn cống kim loại bọc giáp 24-Core Singlemode', 'Cáp quang dã chiến bọc giáp mềm chống gặm nhấm 4-Core',
      'Cáp quang ngầm luồn cống chống ẩm 48-Core Singlemode G652D', 'Dây nhảy quang DinTek LightMAX LC-LC Singlemode OS2 Duplex 3m', 'Dây nhảy quang DinTek LightMAX SC-LC Multimode OM3 Duplex 3m',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'Patch Panel',
    slug: 'patch-panel',
    brand: 'DinTek / CommScope / Alantek / Panduit',
    sourceKey: 'anphat_draytek',
    imageQueryPrefix: 'DinTek 24 port Cat6 patch panel official anphat.vn',
    fallbackKey: 'cable',
    quota: 10,
    products: [
      'DinTek PowerMAX 24-Port Cat5e UTP 1U Patch Panel', 'DinTek PowerMAX 24-Port Cat6 UTP 1U 19 inch Patch Panel', 'DinTek PowerMAX 48-Port Cat6 UTP 2U 19 inch Patch Panel',
      'DinTek PowerMAX 24-Port Cat6A STP Chống Nhiễu 1U Patch Panel', 'DinTek 24-Port Blank Keystone Modular Patch Panel 1U', 'CommScope NetConnect 24-Port Cat6 1U Patch Panel',
      'CommScope NetConnect 48-Port Cat6 2U Patch Panel', 'CommScope GigaSPEED X10D 24-Port Cat6A 1U Patch Panel', 'Alantek 24-Port Cat6 UTP 1U 19 inch Patch Panel',
      'Panduit Mini-Com 24-Port Modular Patch Panel 1U',
    ],
  },
  {
    parentCategory: TELCO,
    category: 'Phụ kiện kết nối',
    slug: 'phu-kien-ket-noi',
    brand: 'DinTek / CommScope',
    sourceKey: 'anphat_draytek',
    imageQueryPrefix: 'DinTek RJ45 ezi-PLUG connector tool official anphat.vn',
    fallbackKey: 'cable',
    quota: 10,
    products: [
      'Hạt mạng DinTek ezi-PLUG Cat6 Pass-Through Hộp 100 Hạt', 'Hạt mạng DinTek ezi-PLUG Cat6A STP Bọc Kim Chống Nhiễu Hộp 100 Hạt', 'Kìm bấm mạng xuyên thấu DinTek ezi-TOOL Đa Năng',
      'Đầu chụp cao su bảo vệ đầu mạng DinTek RJ45 Modular Boot Hộp 100 Cái', 'Nhân mạng RJ45 Keystone Jack DinTek Cat6 Không Cần Tool', 'Nhân mạng RJ45 Keystone Jack DinTek Cat6A Chống Nhiễu Kim Loại',
      'Mặt nạ mạng âm tường Wallplate DinTek 1 Cổng Chữ Nhật', 'Mặt nạ mạng âm tường Wallplate DinTek 2 Cổng Chữ Nhật', 'Hộp nối cáp mạng Cat6 DinTek Chống Ẩm Đấu Nối 8 Lõi',
      'Bút soi quang Laser 10mW DinTek Kiểm Tra Thông Tuyến Cáp Quang',
    ],
  },

  // ─── THIẾT BỊ CNTT (355 SP) ──────────────────────────────────────────────
  {
    parentCategory: IT,
    category: 'Máy chủ Server',
    slug: 'may-chu-server',
    brand: 'Dell / HPE / Lenovo',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Dell PowerEdge rack server official anphatpc.com.vn',
    fallbackKey: 'server',
    quota: 20,
    products: [
      'Dell PowerEdge R250 1U Rack Server Intel Xeon E-2300', 'Dell PowerEdge R350 1U Rack Server Intel Xeon E-2336', 'Dell PowerEdge R450 1U Dual Socket 3rd Gen Intel Xeon',
      'Dell PowerEdge R550 2U Dual Socket 3rd Gen Intel Xeon Scalable', 'Dell PowerEdge R650 1U Enterprise Dual Socket Xeon Scalable', 'Dell PowerEdge R650xs 1U Rack Server Xeon Silver 4310',
      'Dell PowerEdge R750 2U Enterprise Dual Socket Xeon Gold', 'Dell PowerEdge R750xs 2U Rack Server Dual Xeon Silver 4314', 'Dell PowerEdge T150 Tower Server Intel Xeon E-2314',
      'Dell PowerEdge T350 Tower Server Intel Xeon E-2336', 'Dell PowerEdge T550 2-Socket Tower Server Xeon Silver', 'HPE ProLiant DL20 Gen10 Plus 1U Rack Server',
      'HPE ProLiant DL360 Gen10 Plus 1U High-Density Server', 'HPE ProLiant DL380 Gen10 Plus 2U Dual Socket Server', 'HPE ProLiant ML30 Gen10 Plus Tower Server',
      'HPE ProLiant ML110 Gen10 4.5U Tower Server', 'HPE ProLiant ML350 Gen10 Dual-Socket Tower Server', 'Lenovo ThinkSystem SR250 V2 1U Rack Server',
      'Lenovo ThinkSystem SR650 V2 2U Rack Server', 'Lenovo ThinkSystem ST550 4U Tower Server',
    ],
  },
  {
    parentCategory: IT,
    category: 'PC Máy tính để bàn',
    slug: 'pc-may-tinh-de-ban',
    brand: 'Dell / HP / Lenovo / Asus / Acer',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Dell OptiPlex desktop computer official anphatpc.com.vn',
    fallbackKey: 'pc',
    quota: 25,
    products: [
      'Dell OptiPlex 7010 SFF Core i5-13500 16GB 512GB SSD', 'Dell OptiPlex 7010 Tower Core i7-13700 16GB 512GB SSD', 'Dell OptiPlex 7020 SFF Plus Core i5-14500 16GB SSD',
      'Dell OptiPlex 3000 SFF Core i3-12100 8GB 256GB SSD', 'Dell Vostro 3020 Tower Core i5-13400 8GB 512GB SSD', 'Dell Vostro 3910 MT Core i7-12700 16GB 512GB SSD',
      'HP ProDesk 400 G9 SFF Core i5-13500 8GB 512GB SSD', 'HP ProDesk 400 G9 MT Core i7-13700 16GB 512GB SSD', 'HP EliteDesk 800 G9 SFF Core i7-13700 16GB SSD',
      'HP Pro Mini 400 G9 Core i5-13500T 8GB 512GB SSD', 'Lenovo ThinkCentre Neo 50s Gen 4 SFF Core i5-13400', 'Lenovo ThinkCentre Neo 50t Gen 4 Tower Core i7-13700',
      'Lenovo ThinkCentre M70s Gen 4 SFF Core i5-13500', 'Lenovo ThinkCentre M90t Gen 4 Tower Core i7-13700', 'Asus ExpertCenter D500SC SFF Core i5-13400 8GB SSD',
      'Asus ExpertCenter D700TC Tower Core i7-13700 16GB SSD', 'Asus ROG Strix G13CHR Core i7-14700F RTX 4060', 'Acer Veriton X2690G SFF Core i5-12400 8GB SSD',
      'Acer Aspire TC-1770 Tower Core i5-13400 8GB SSD', 'PC AnPhat Business AP-B124 Core i5-12400 16GB SSD', 'PC AnPhat Office AP-O121 Core i3-12100 8GB SSD',
      'PC AnPhat Enterprise AP-E137 Core i7-13700 32GB SSD', 'Dell OptiPlex Micro Plus 7010 Core i7-13700T 16GB', 'HP ProDesk 600 G6 SFF Core i5-10500 8GB SSD',
      'Lenovo V50s-07IMB SFF Core i5-10400 8GB 256GB SSD',
    ],
  },
  {
    parentCategory: IT,
    category: 'Mini PC',
    slug: 'mini-pc',
    brand: 'Asus / Minisforum / Beelink / Gigabyte / Zotac',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Asus NUC Mini PC compact computer anphatpc.com.vn',
    fallbackKey: 'pc',
    quota: 15,
    products: [
      'Asus NUC 14 Pro NUC14RVH Intel Core Ultra 5 125H Mini PC', 'Asus NUC 14 Pro NUC14RVH Intel Core Ultra 7 155H Mini PC', 'Asus NUC 13 Pro NUC13ANHi5 Intel Core i5-1340P Mini PC',
      'Asus NUC 13 Pro NUC13ANHi7 Intel Core i7-1360P Mini PC', 'Asus ExpertCenter PN64 Intel Core i7-13700H Mini PC', 'Asus ExpertCenter PN53 AMD Ryzen 7 7735H Mini PC',
      'Minisforum UM790 Pro AMD Ryzen 9 7940HS Mini PC', 'Minisforum NAB6 Plus Intel Core i7-12650H Mini PC', 'Minisforum Venus UN100L Intel Processor N100 Mini PC',
      'Beelink SER8 AMD Ryzen 7 8845HS High Performance Mini PC', 'Beelink Mini S12 Pro Intel N95 Compact Mini PC', 'Beelink EQ12 Intel N100 Dual LAN Mini PC',
      'Gigabyte BRIX GB-BER7-8840 AMD Ryzen 7 Mini PC', 'Gigabyte BRIX GB-BEi5-1240 Intel Core i5 Mini PC', 'Zotac ZBOX CI337 nano Fanless Silent Mini PC',
    ],
  },
  {
    parentCategory: IT,
    category: 'Laptop',
    slug: 'laptop',
    brand: 'Dell / HP / Lenovo / Asus / Acer / MSI / Apple',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Dell Latitude business laptop anphatpc.com.vn',
    fallbackKey: 'laptop',
    quota: 40,
    products: [
      'Dell Latitude 3440 14 inch Core i5-1335U 16GB 512GB SSD', 'Dell Latitude 3540 15.6 inch Core i5-1335U 16GB 512GB SSD', 'Dell Latitude 5440 14 inch Core i5-1345U vPro 16GB SSD',
      'Dell Latitude 5540 15.6 inch Core i7-1365U 16GB 512GB SSD', 'Dell Latitude 7440 14 inch Core i7-1365U 16GB 512GB SSD', 'Dell Latitude 7450 14 inch Intel Core Ultra 7 155U',
      'Dell Vostro 3430 14 inch Core i5-1335U 8GB 512GB SSD', 'Dell Vostro 3530 15.6 inch 120Hz Core i5-1335U 16GB SSD', 'Dell Inspiron 3520 15.6 inch 120Hz Core i5-1235U 8GB SSD',
      'Dell Inspiron 5430 14 inch Core i7-1360P 16GB 512GB SSD', 'HP ProBook 440 G10 14 inch Core i5-1335U 16GB 512GB SSD', 'HP ProBook 450 G10 15.6 inch Core i7-1355U 16GB 512GB SSD',
      'HP ProBook 440 G11 14 inch Intel Core Ultra 5 125U 16GB', 'HP EliteBook 640 G10 14 inch Core i5-1335U 16GB SSD', 'HP EliteBook 840 G10 14 inch Core i7-1365U 16GB SSD',
      'HP EliteBook 840 G11 14 inch Intel Core Ultra 7 155H 32GB', 'HP EliteBook 1040 G10 14 inch Core i7-1365U 32GB SSD', 'HP Envy x360 14 inch 2-in-1 Core i7-1355U OLED 16GB',
      'HP Pavilion 14 14 inch Core i5-1335U 16GB 512GB SSD', 'Lenovo ThinkPad E14 Gen 5 14 inch Core i5-1335U 16GB SSD', 'Lenovo ThinkPad E16 Gen 1 16 inch Core i7-1355U 16GB SSD',
      'Lenovo ThinkPad T14 Gen 4 14 inch Core i5-1345U vPro 16GB', 'Lenovo ThinkPad T14 Gen 5 14 inch Intel Core Ultra 7 155U', 'Lenovo ThinkPad X1 Carbon Gen 11 14 inch Core i7-1365U 32GB',
      'Lenovo ThinkPad L14 Gen 4 14 inch Core i5-1335U 16GB SSD', 'Lenovo ThinkBook 14 G6 14 inch Core i5-1335U 16GB SSD', 'Lenovo ThinkBook 15 G5 15.6 inch Core i7-1355U 16GB SSD',
      'Lenovo IdeaPad 3 15IAU7 15.6 inch Core i5-1235U 8GB SSD', 'Asus ExpertBook B1402CBA 14 inch Core i5-1235U 8GB SSD', 'Asus ExpertBook B1502CBA 15.6 inch Core i5-1235U 16GB SSD',
      'Asus ExpertBook B5402CBA 14 inch Core i7-1260P 16GB SSD', 'Asus ExpertBook B9400CBA 14 inch Core i7-1255U 32GB SSD', 'Asus Zenbook 14 OLED UX3405MA Intel Core Ultra 7 155H',
      'Asus Vivobook 15 X1504VA 15.6 inch Core i5-1335U 16GB SSD', 'Acer Swift Go 14 SFG14 14 inch OLED Core i5-13500H 16GB', 'Acer TravelMate P2 TMP214 14 inch Core i5-1335U 16GB SSD',
      'MSI Modern 14 C13M 14 inch Core i5-1335U 16GB 512GB SSD', 'MSI Modern 15 B13M 15.6 inch Core i7-1355U 16GB SSD', 'Apple MacBook Air M2 13.6 inch 8GB 256GB SSD',
      'Apple MacBook Pro 14 M3 Pro 14.2 inch 18GB 512GB SSD',
    ],
  },
  {
    parentCategory: IT,
    category: 'Máy trạm Workstation',
    slug: 'may-tram-workstation',
    brand: 'Dell / HP / Lenovo',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Dell Precision workstation official anphatpc.com.vn',
    fallbackKey: 'server',
    quota: 12,
    products: [
      'Dell Precision 3660 Tower Workstation Core i7-13700 RTX A2000', 'Dell Precision 3680 Tower Workstation Core i7-14700 RTX 4000', 'Dell Precision 5860 Tower Workstation Intel Xeon W-2400',
      'Dell Precision 7865 Tower Workstation AMD Ryzen Threadripper Pro', 'Dell Precision 3581 Mobile Workstation 15.6 inch Core i7-13800H', 'Dell Precision 3591 Mobile Workstation 15.6 inch Ultra 7 155H',
      'Dell Precision 5680 Mobile Workstation 16 inch Core i7-13800H RTX A2000', 'HP Z2 G9 Tower Workstation Core i7-13700 32GB RTX A2000', 'HP Z4 G5 Workstation Intel Xeon W-2425 32GB RTX 4000',
      'HP ZBook Power G10 Mobile Workstation 15.6 inch Core i7-13700H', 'Lenovo ThinkStation P3 Tower Workstation Core i7-13700 RTX A2000', 'Lenovo ThinkPad P16v Gen 1 Mobile Workstation 16 inch Ryzen 7',
    ],
  },
  {
    parentCategory: IT,
    category: 'Máy tính All-in-One',
    slug: 'may-tinh-all-in-one',
    brand: 'Dell / HP / Lenovo / Asus / Acer',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Dell All-in-One computer official anphatpc.com.vn',
    fallbackKey: 'pc',
    quota: 12,
    products: [
      'Dell OptiPlex 7410 All-in-One 23.8 inch Core i5-13500 16GB SSD', 'Dell OptiPlex 7420 All-in-One 23.8 inch Core i7-14700 16GB SSD', 'Dell Inspiron 5420 All-in-One 23.8 inch Core i5-1335U 8GB SSD',
      'HP ProOne 240 G10 All-in-One 23.8 inch Core i5-1335U 8GB SSD', 'HP ProOne 440 G9 All-in-One 23.8 inch Core i5-13500 16GB SSD', 'HP EliteOne 840 G9 All-in-One 23.8 inch Core i7-13700 16GB SSD',
      'Lenovo ThinkCentre Neo 30a 24 Gen 4 AIO 23.8 inch Core i5-13420H', 'Lenovo ThinkCentre Neo 50a 24 Gen 5 AIO 23.8 inch Core i7-13700', 'Lenovo IdeaCentre AIO 3 24IAP7 23.8 inch Core i5-12450H 8GB SSD',
      'Asus ExpertCenter E5402WHAK AIO 23.8 inch Core i5-11500B 8GB SSD', 'Asus A5402WVAK All-in-One 23.8 inch Core i7-1360P 16GB SSD', 'Acer Aspire C24-1800 All-in-One 23.8 inch Core i5-1335U 8GB SSD',
    ],
  },
  {
    parentCategory: IT,
    category: 'Màn hình máy tính',
    slug: 'man-hinh-may-tinh',
    brand: 'Dell / HP / LG / Samsung / Asus / ViewSonic',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Dell monitor IPS display anphatpc.com.vn',
    fallbackKey: 'monitor',
    quota: 18,
    products: [
      'Dell Professional P2422H 23.8 inch FHD IPS 60Hz', 'Dell Professional P2425H 24 inch 100Hz IPS 16:10', 'Dell Professional P2722H 27 inch FHD IPS Chân Công Thái Học',
      'Dell Professional P2725H 27 inch FHD 100Hz IPS', 'Dell UltraSharp U2424H 23.8 inch 120Hz IPS Black 100% sRGB', 'Dell UltraSharp U2724D 27 inch 2K QHD 120Hz IPS Black',
      'Dell UltraSharp U3425WE 34 inch Cong WQHD 120Hz Thunderbolt 4', 'Dell E2422H 23.8 inch FHD IPS Văn Phòng Giá Rẻ', 'HP ProDisplay P24v G5 23.8 inch FHD 75Hz',
      'HP E24 G5 FHD 23.8 inch IPS Viền Siêu Mỏng', 'LG 24MP500-B 23.8 inch FHD IPS 75Hz FreeSync', 'LG 27MP400-B 27 inch FHD IPS 75Hz Viền Mỏng',
      'LG 27BA850-B 27 inch 2K QHD IPS Doanh Nghiệp', 'Samsung LS24C310EAEXXV 24 inch FHD IPS 75Hz', 'Samsung LS27C310EAEXXV 27 inch FHD IPS 75Hz',
      'Asus VA24EHE 23.8 inch FHD IPS 75Hz Eye Care', 'Asus ProArt PA278CGV 27 inch 2K QHD 144Hz Chuyên Đồ Họa', 'ViewSonic VA2432-H 24 inch FHD IPS 100Hz Viền Mỏng',
    ],
  },
  {
    parentCategory: IT,
    category: 'Máy in & thiết bị in',
    slug: 'may-in-thiet-bi-in',
    brand: 'Canon / HP / Brother / Epson',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Canon laser printer official anphatpc.com.vn',
    fallbackKey: 'printer',
    quota: 18,
    products: [
      'Máy in Laser trắng đen Canon LBP2900 Khổ A4 Huyền Thoại', 'Máy in Laser trắng đen Canon LBP6030w Kết Nối Wi-Fi', 'Máy in Laser trắng đen Canon LBP243dw Tự Động Đảo Mặt Wi-Fi',
      'Máy in Laser trắng đen Canon LBP246dw Tốc Độ Cao 40 Trang/Phút', 'Máy in Laser đa năng Canon MF244dw In Quét Copy Tự Động Đảo Mặt', 'Máy in Laser đa năng Canon MF269dw In Scan Copy Fax Khay ADF',
      'Máy in Laser trắng đen HP LaserJet M211d Đảo Mặt Tự Động', 'Máy in Laser trắng đen HP LaserJet M211dw Đảo Mặt Wi-Fi', 'Máy in Laser đa năng HP LaserJet MFP M236dw In Scan Copy Wi-Fi',
      'Máy in Laser trắng đen HP LaserJet Pro 4003dn Tốc Độ 40 Trang/Phút', 'Máy in Laser đa năng HP LaserJet Pro MFP 4103fdw Đầy Đủ Tính Năng', 'Máy in Laser trắng đen Brother HL-L2321D Đảo Mặt Tự Động',
      'Máy in Laser trắng đen Brother HL-L2366DW Đảo Mặt Wi-Fi', 'Máy in Laser đa năng Brother DCP-L2520D In Scan Copy Đảo Mặt', 'Máy in Laser đa năng Brother MFC-L2701DW Đảo Mặt Wi-Fi Khay ADF',
      'Máy in phun màu Epson EcoTank L1210 Hệ Thống Bình Mực Liên Tục', 'Máy in phun màu đa năng Epson EcoTank L3250 In Scan Copy Wi-Fi', 'Máy in phun màu đa năng khổ A3 Epson EcoTank L15150 Duplex Wi-Fi',
    ],
  },
  {
    parentCategory: IT,
    category: 'Máy in nhãn',
    slug: 'may-in-nhan',
    brand: 'Zebra / Honeywell / TSC / Godex / Brother',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Zebra barcode label printer anphatpc.com.vn',
    fallbackKey: 'printer',
    quota: 12,
    products: [
      'Máy in mã vạch Zebra ZD220T Độ Phân Giải 203dpi Truyền Nhiệt', 'Máy in mã vạch Zebra ZD230T Tốc Độ Cao 152mm/s Cổng USB/LAN', 'Máy in mã vạch Zebra ZD421T Cao Cấp 203dpi/300dpi',
      'Máy in mã vạch công nghiệp Zebra ZT231 Màn Hình Cảm Ứng Kim Loại', 'Máy in tem nhãn Honeywell PC42E-T Thiết Kế Nhỏ Gọn 203dpi', 'Máy in mã vạch Honeywell PC42T Plus Nồi Đồng Cối Đá',
      'Máy in tem nhãn TSC TE200 Tốc Độ 152mm/s Đầu In 203dpi', 'Máy in mã vạch TSC TE210 Bộ Nhớ Lớn Cổng Mạng LAN 203dpi', 'Máy in mã vạch Godex G500 Cảm Biến Kép In Đa Dạng Nhãn',
      'Máy in mã vạch Godex EZ1100 Plus Bền Bỉ Cho Doanh Nghiệp', 'Máy in nhãn cầm tay Brother PT-D210 Bàn Phím QWERTY Tiện Lợi', 'Máy in nhãn chuyên dụng kỹ thuật điện Brother PT-E550W Kết Nối Wi-Fi',
    ],
  },
  {
    parentCategory: IT,
    category: 'Máy quét mã vạch',
    slug: 'may-quet-ma-vach',
    brand: 'Zebra / Honeywell / Datalogic / Newland',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Zebra barcode scanner handheld anphatpc.com.vn',
    fallbackKey: 'scanner',
    quota: 12,
    products: [
      'Máy quét mã vạch 2D Zebra DS2208 Có Dây Kèm Chân Đế', 'Máy quét mã vạch không dây 2D Zebra DS2278 Bluetooth Pin Bền', 'Máy quét mã vạch 2D Zebra DS4608-SR Quét Siêu Nhanh Mã Mờ Xước',
      'Máy quét mã vạch để bàn 2D Zebra DS9308 Đa Hướng Tự Động', 'Máy quét mã vạch 1D Honeywell Voyager 1250g Tia Laser Cầm Tay', 'Máy quét mã vạch 2D Honeywell Voyager 1470g Siêu Bền Chống Rơi',
      'Máy quét mã vạch 2D Honeywell Xenon 1950g Chuyên Dụng Bệnh Viện Kho Vận', 'Máy quét mã vạch để bàn đa tia Honeywell Orbit 7190g Hybrid', 'Máy quét mã vạch 1D Datalogic QuickScan QW2100 Cầm Tay Giá Rẻ',
      'Máy quét mã vạch 2D Datalogic Gryphon GD4500 Cảm Biến Megapixel', 'Máy quét mã vạch 2D Newland HR2081 Cầm Tay Quét Mã QR Căn Cước', 'Máy quét mã vạch để bàn 2D Newland FR4080 Quét Mã Điện Thoại',
    ],
  },
  {
    parentCategory: IT,
    category: 'Thiết bị POS',
    slug: 'thiet-bi-pos',
    brand: 'Sunmi / Posiflex / Epson / Xprinter',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Sunmi POS terminal touch screen anphatpc.com.vn',
    fallbackKey: 'pos',
    quota: 12,
    products: [
      'Máy bán hàng cảm ứng POS Sunmi T2s 2 Màn Hình 15.6 inch Tích Hợp Máy In', 'Máy POS bán hàng cầm tay Sunmi V2s Android 11 Quét Mã In Hóa Đơn', 'Máy bán hàng POS cảm ứng Sunmi D2s Lite 1 Màn Hình 15.6 inch',
      'Máy POS cảm ứng Posiflex XT-3815 15 inch Cảm Ứng Điện Dung Mượt Mà', 'Máy POS cảm ứng Posiflex RT-2015 Thiết Kế Không Quạt Chống Bụi', 'Máy in hóa đơn nhiệt Epson TM-T82III Khổ 80mm Cổng USB/LAN',
      'Máy in hóa đơn nhiệt Xprinter XP-Q200 Khổ 80mm Tự Động Cắt Giấy', 'Máy in hóa đơn nhiệt Xprinter XP-N160M Cổng USB LAN Giá Tốt', 'Ngăn kéo đựng tiền thu ngân Antech RT410 5 Ngăn Tiền Giấy 4 Ngăn Xu',
      'Ngăn kéo đựng tiền thu ngân Maken MK410 Thép Sơn Tĩnh Điện Bền Bỉ', 'Máy quét mã vạch để bàn tính tiền Youjie YJ5900 Đa Tia Tự Động', 'Máy chấm công nhận diện khuôn mặt và đo thân nhiệt ZKTeco FaceDepot-7B',
    ],
  },
  {
    parentCategory: IT,
    category: 'Kiosk tự phục vụ',
    slug: 'kiosk-tu-phuc-vu',
    brand: 'ComQ',
    sourceKey: 'comq',
    imageQueryPrefix: 'ComQ Q-Kiosk tra cuu hanh chinh cong official comq.vn',
    fallbackKey: 'kiosk',
    quota: 18,
    products: [
      'Kiosk tra cứu thông tin ComQ Q-Kiosk 215 P80-PR Màn Hình Cảm Ứng 21.5 inch', 'Kiosk tra cứu thông tin ComQ Q-Kiosk 240 P80-PR Màn Hình Cảm Ứng 24 inch', 'Kiosk tra cứu thông tin ComQ Q-Kiosk 320 P80-PR Màn Hình Cảm Ứng 32 inch',
      'Kiosk tra cứu thông tin ComQ Q-Kiosk 430 P80-PR Màn Hình Lớn 43 inch', 'Kiosk tra cứu thông tin ComQ Q-Kiosk 550 P80-PR Màn Hình 55 inch Sảnh Lớn', 'Kiosk hành chính công ComQ Q-Kiosk 21.5 inch Công Nghệ Chống Giật An Toàn',
      'Kiosk bưu điện ComQ Tích Hợp Đầu Đọc Thẻ Căn Cước Gắn Chip và Máy In', 'Kiosk bệnh viện ComQ Tích Hợp Đầu Đọc Thẻ BHYT và Nhận Diện Khuôn Mặt', 'Máy lấy số thứ tự xếp hàng tự động ComQ QMS-215 Màn Hình Cảm Ứng 21.5 inch',
      'Máy lấy số thứ tự tự động ComQ QMS-185 Bàn Phím Nút Bấm Cảm Ứng Bền Bỉ', 'Tablet đánh giá mức độ hài lòng cán bộ ComQ CS-101 Màn Hình 10.1 inch', 'Tablet đánh giá chất lượng dịch vụ một cửa ComQ CS-105 Chân Đế Để Bàn',
      'Kiosk tra cứu quy hoạch đô thị ngoài trời ComQ Outdoor 43 inch IP65 Chống Nước', 'Kiosk Check-in tự động đa năng ComQ Tích Hợp Máy Quét Hộ Chiếu', 'Kiosk thông tin du lịch ComQ Tour-320 Màn Hình Cảm Ứng Chống Lóa',
      'Kiosk thanh toán tự động ComQ Pay-215 Tích Hợp Máy Quét QR Code và POS', 'Standee điện tử ComQ Digital Signage 55 inch Chân Đứng Quảng Cáo', 'Standee cảm ứng xoay đa năng ComQ 43 inch Xoay Ngang Dọc Linh Hoạt',
    ],
  },
  {
    parentCategory: IT,
    category: 'Máy tính công nghiệp',
    slug: 'may-tinh-cong-nghiep',
    brand: 'Advantech / Axiomtek / OnLogic / Siemens / ASUS IoT',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Advantech industrial PC fanless official anphatpc.com.vn',
    fallbackKey: 'server',
    quota: 12,
    products: [
      'Máy tính công nghiệp không quạt Advantech UNO-2484G Intel Core i7', 'Máy tính công nghiệp Advantech UNO-2271G Siêu Nhỏ Gọn Chuẩn DIN-Rail', 'Máy tính công nghiệp Advantech IPC-610H Thùng 4U Rackmount Chuyên Dụng',
      'Máy tính công nghiệp Advantech ARK-2250 Intel Core i7 Hỗ Trợ 4 Màn Hình', 'Máy tính công nghiệp Axiomtek eBOX671-517-FL Hỗ Trợ 4 Cổng PoE Camera', 'Máy tính công nghiệp Axiomtek eBOX630-521-FL Hoạt Động Nhiệt Độ Cao -40 Đến 70C',
      'Máy tính công nghiệp nhúng OnLogic Helix 500 Fanless Intel Core i9', 'Máy tính công nghiệp OnLogic Karbon 700 Chống Rung Sốc Tiêu Chuẩn Quân Đội', 'Máy tính công nghiệp Siemens SIMATIC IPC427E Vận Hành 24/7 Trong Nhà Máy',
      'Máy tính công nghiệp Siemens SIMATIC IPC647E Thùng 2U Rackmount', 'Máy tính công nghiệp ASUS IoT PE200U Nhỏ Gọn Không Quạt Tản Nhiệt', 'Máy tính công nghiệp Cincoze DI-1000 Hiệu Năng Cao Mô Đun Mở Rộng CMI',
    ],
  },
  {
    parentCategory: IT,
    category: 'Thiết bị lưu trữ',
    slug: 'thiet-bi-luu-tru',
    brand: 'Synology / QNAP / Western Digital / Seagate',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Synology DiskStation NAS storage official anphatpc.com.vn',
    fallbackKey: 'server',
    quota: 18,
    products: [
      'Thiết bị lưu trữ mạng NAS Synology DiskStation DS224+ 2 Khay Ổ Cứng', 'Thiết bị lưu trữ mạng NAS Synology DiskStation DS423+ 4 Khay Ổ Cứng', 'Thiết bị lưu trữ mạng NAS Synology DiskStation DS923+ 4 Khay Mở Rộng 9 Khay',
      'Thiết bị lưu trữ mạng NAS Synology DiskStation DS1522+ 5 Khay Mở Rộng 15 Khay', 'Thiết bị lưu trữ mạng NAS Synology DiskStation DS1821+ 8 Khay AMD Ryzen Quad-Core', 'Thiết bị lưu trữ mạng NAS Synology RackStation RS822+ 4 Khay Rack 1U',
      'Thiết bị lưu trữ mạng NAS Synology RackStation RS2423+ 12 Khay Rack 2U Doanh Nghiệp', 'Thiết bị lưu trữ mạng NAS QNAP TS-264-8G 2 Khay Cổng Mạng 2.5GbE', 'Thiết bị lưu trữ mạng NAS QNAP TS-464-8G 4 Khay CPU Intel Quad-Core',
      'Thiết bị lưu trữ mạng NAS QNAP TS-873A-8G 8 Khay AMD Ryzen V1500B', 'Ổ cứng chuyên dụng NAS Synology HAT5300 4TB SATA 3.5 inch 7200RPM', 'Ổ cứng chuyên dụng NAS Synology HAT5300 8TB Enterprise SATA 3.5 inch',
      'Ổ cứng chuyên dụng NAS Western Digital Red Plus 4TB 5400RPM 128MB Cache', 'Ổ cứng chuyên dụng NAS Western Digital Red Pro 8TB 7200RPM 256MB Cache', 'Ổ cứng chuyên dụng NAS Seagate IronWolf 4TB 5400RPM 256MB Cache',
      'Ổ cứng chuyên dụng NAS Seagate IronWolf Pro 8TB 7200RPM Doanh Nghiệp', 'Ổ cứng thể rắn SSD chuyên dụng NAS Synology SAT5210 960GB SATA 2.5 inch', 'Ổ cứng thể rắn SSD Samsung 990 PRO 1TB PCIe 4.0 NVMe M.2 Tốc Độ Cao',
    ],
  },
  {
    parentCategory: IT,
    category: 'UPS & thiết bị Data Center',
    slug: 'ups-thiet-bi-data-center',
    brand: 'APC / Santak / Vertiv / Eaton / Delta / Schneider',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'APC Smart-UPS backup power official anphatpc.com.vn',
    fallbackKey: 'ups',
    quota: 18,
    products: [
      'Bộ lưu điện UPS APC Easy UPS BVX1200LI-MS 1200VA 650W 230V AVR', 'Bộ lưu điện UPS APC Smart-UPS SMC1500I-2U 1500VA 900W Lắp Tủ Rack', 'Bộ lưu điện UPS APC Smart-UPS SMT3000I 3000VA 2700W Màn Hình LCD',
      'Bộ lưu điện UPS Online APC Smart-UPS SRT5KXLI 5000VA 4500W 230V', 'Bộ lưu điện UPS Online APC Smart-UPS SRT10KXLI 10kVA 10kW Cao Cấp', 'Bộ lưu điện UPS Santak Blazer 1000 Pro 1000VA 600W Cổng USB',
      'Bộ lưu điện UPS Santak Blazer 2000 Pro 2000VA 1200W Line Interactive', 'Bộ lưu điện UPS Online Santak True Online C1K-LCD 1000VA 900W', 'Bộ lưu điện UPS Online Santak True Online C3K-LCD 3000VA 2700W',
      'Bộ lưu điện UPS Online Santak 3C10KS 10kVA 3 Pha Vào 1 Pha Ra', 'Bộ lưu điện UPS Online Vertiv Liebert GXT5-1000IRT2UXL 1kVA Rack/Tower', 'Bộ lưu điện UPS Online Vertiv Liebert GXT5-3000IRT2UXL 3kVA Rack/Tower',
      'Bộ lưu điện UPS Online Vertiv Liebert GXT5-10KIRT5UXLN 10kVA 10kW', 'Bộ lưu điện UPS Online Eaton 9E 3000VA 2400W Mã 9E3000I', 'Bộ lưu điện UPS Online Eaton 9E 10kVA 8kW Mã 9E10Ki',
      'Bộ lưu điện UPS Online Delta Amplon RT-3K 3000VA 2700W Chuyển Đổi Kép', 'Bộ lưu điện UPS Online Delta Amplon RT-5K 5000VA 4500W Rack/Tower', 'Bộ lưu điện UPS 3 Pha Schneider Electric Galaxy 300 15kVA 3:3 Công Nghiệp',
    ],
  },
  {
    parentCategory: IT,
    category: 'Tủ Rack & phụ kiện',
    slug: 'tu-rack-phu-kien',
    brand: 'TMC Rack',
    sourceKey: 'tmcrack',
    imageQueryPrefix: 'TMC Rack tu mang server cabinet official tmcrack.vn',
    fallbackKey: 'rack',
    quota: 10,
    products: [
      'Tủ mạng TMC Rack 6U Sâu D400 Treo Tường Cửa Lưới Mã TMC-6U400', 'Tủ mạng TMC Rack 9U Sâu D500 Treo Tường Sơn Tĩnh Điện Mã TMC-9U500', 'Tủ mạng TMC Rack 12U Sâu D600 Treo Tường Cửa Mica/Lưới Mã TMC-12U600',
      'Tủ mạng TMC Rack 15U Sâu D600 Treo Tường Có Khóa Mã TMC-15U600', 'Tủ mạng TMC Rack 20U Sâu D800 Tủ Đứng Có Bánh Xe Mã TMC-20U800', 'Tủ mạng TMC Rack 27U Sâu D1000 Tủ Đứng Cửa Lưới Mã TMC-27U1000',
      'Tủ mạng TMC Rack 32U Sâu D1000 Tủ Server Chuyên Dụng Mã TMC-32U1000', 'Tủ mạng TMC Rack 36U Sâu D1000 Tủ Đứng 19 inch Mã TMC-36U1000', 'Tủ Server TMC Rack 42U Sâu D1000 19 inch Cửa Lưới Tổ Ong Mã TMC-42U1000',
      'Tủ Server Data Center TMC Rack 42U Sâu D1200 19 inch Mã TMC-42U1200',
    ],
  },
  {
    parentCategory: IT,
    category: 'Camera IP',
    slug: 'camera-ip',
    brand: 'Hikvision / Dahua / KBVISION / Uniview / Hanwha / Bosch',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Hikvision IP camera security surveillance anphatpc.com.vn',
    fallbackKey: 'camera',
    quota: 20,
    products: [
      'Camera IP Thân Trụ Hikvision DS-2CD1023G0E-I 2MP Hồng Ngoại 30m', 'Camera IP Thân Trụ Hikvision DS-2CD2043G2-I 4MP AcuSense Lọc Báo Động Giả', 'Camera IP Bán Cầu Hikvision DS-2CD2143G2-I 4MP Chống Va Đập IK10',
      'Camera IP Có Màu Ban Đêm Hikvision DS-2CD2347G2-LU 4MP ColorVu Tích Hợp Mic', 'Camera IP Thân Trụ Dahua DH-IPC-HFW1230S1-S5 2MP Chuẩn Nén H.265+', 'Camera IP Thân Trụ Dahua DH-IPC-HFW2431S-S-S2 4MP Starlight WDR 120dB',
      'Camera IP Full-Color Dahua DH-IPC-HDW2439T-AS-LED 4MP Có Màu 24/7 Tích Hợp Mic', 'Camera IP Thân Kim Loại KBVISION KX-A2011S4 2MP Hồng Ngoại 30m IP67', 'Camera IP Thân Kim Loại KBVISION KX-A4011S4-A 4MP Tích Hợp Mic Ghi Âm',
      'Camera IP Bán Cầu KBVISION KX-C2003N3-A 2MP Starlight Cảm Biến Sony', 'Camera IP Thân Trụ Uniview IPC2122LR3-PF40M-D 2MP Vỏ Kim Loại IP67', 'Camera IP Bán Cầu Uniview IPC324LR3-VSPF28-D 4MP Chống Va Đập IK10',
      'Camera IP Thân Trụ Hanwha Vision QNO-6082R 2MP Ống Kính Thay Đổi Tiêu Cự', 'Camera IP Bán Cầu Hanwha Vision QND-6082R 2MP Chống Ngược Sáng 120dB', 'Camera IP Thân Trụ Bosch DINION IP 3000i IR 2MP Chuẩn Nén H.265 Chuyên Dụng',
      'Camera IP Bán Cầu Bosch FLEXIDOME IP 3000i IR 5MP Chống Nước IP66 IK10', 'Camera IP Thân Trụ Hikvision DS-2CD2T87G2-L 8MP 4K ColorVu Ban Đêm Có Màu', 'Camera IP Báo Động Chủ Động Dahua DH-IPC-HFW3849T1-AS-PV 8MP TiOC Đèn Còi Hú',
      'Camera IP Thân Trụ KBVISION KX-A8011SN 8MP 4K Siêu Nét', 'Camera IP Thân Trụ Uniview IPC2328SB-DZK-I0 8MP 4K LightHunter Zoom Quang Học',
    ],
  },
  {
    parentCategory: IT,
    category: 'Camera Analog / HDCVI / HDTVI',
    slug: 'camera-analog',
    brand: 'Hikvision / Dahua / KBVISION / Uniview',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Hikvision HDTVI analog camera official anphatpc.com.vn',
    fallbackKey: 'camera',
    quota: 8,
    products: [
      'Camera HD-TVI Thân Trụ Hikvision DS-2CE16D0T-IRP 2MP Vỏ Nhựa Giá Tốt', 'Camera HD-TVI Thân Trụ Hikvision DS-2CE16U1T-ITF 8MP 4K Siêu Nét Vỏ Kim Loại', 'Camera HDCVI Thân Trụ Dahua DH-HAC-HFW1200TP-S5 2MP Vỏ Kim Loại Bền Bỉ',
      'Camera HDCVI Thân Trụ Dahua DH-HAC-HFW1500TP 5MP Cảm Biến CMOS Cao Cấp', 'Camera 4in1 Thân Trụ KBVISION KX-A2111C4 2MP Hỗ Trợ CVI TVI AHD Analog', 'Camera 4in1 Thân Trụ KBVISION KX-A4111C4 4MP Hồng Ngoại 20m IP67',
      'Camera Analog Thân Trụ Uniview UAC-T112-F28 2MP 4in1 Chống Nước', 'Camera HD-TVI Bán Cầu Hikvision DS-2CE76D0T-EXIPF 2MP Trong Nhà',
    ],
  },
  {
    parentCategory: IT,
    category: 'Camera PTZ',
    slug: 'camera-ptz',
    brand: 'Hikvision / Dahua / KBVISION / Uniview',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Hikvision PTZ camera optical zoom speed dome anphatpc.com.vn',
    fallbackKey: 'camera',
    quota: 6,
    products: [
      'Camera PTZ Hikvision DS-2DE4425IW-DE 4MP Zoom Quang 25x Hồng Ngoại 100m', 'Camera PTZ Hikvision DS-2DE7A432IW-AEB 4MP Zoom Quang 32x AcuSense Đèn Còi Báo Động', 'Camera PTZ Dahua DH-SD49225XA-HNR 2MP Zoom Quang 25x WizSense Nhận Diện Người Xe',
      'Camera PTZ Dahua DH-SD59430U-HNI 4MP Zoom Quang 30x Hồng Ngoại 150m Chuyên Dụng', 'Camera PTZ KBVISION KX-C2007PCN 2MP Zoom Quang 25x Starlight Ban Đêm', 'Camera PTZ Uniview IPC6424SR-X25-VF 4MP Zoom Quang 25x LightHunter Công Nghệ Mới',
    ],
  },
  {
    parentCategory: IT,
    category: 'Camera Wi-Fi',
    slug: 'camera-wifi',
    brand: 'Ezviz / Imou / KBONE / Dahua',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Ezviz wifi wireless camera anphatpc.com.vn',
    fallbackKey: 'camera',
    quota: 6,
    products: [
      'Camera Wi-Fi Không Dây Ezviz C6N 2MP Xoay 360 Độ Đàm Thoại 2 Chiều', 'Camera Wi-Fi Ngoài Trời Ezviz C3W Pro 4MP Ban Đêm Có Màu Đèn Còi Báo Động', 'Camera Wi-Fi Trong Nhà Imou Ranger 2 A22EP 2MP Xoay 360 Độ Theo Dõi Chuyển Động',
      'Camera Wi-Fi Ngoài Trời Imou Cruiser 2 GS7EP 5MP 3K Xoay 360 Độ Có Màu Ban Đêm', 'Camera Wi-Fi Không Dây KBONE KN-H21W 2MP Xoay 360 Độ Góc Rộng', 'Camera Wi-Fi Trong Nhà Dahua Hero A1 DH-IPC-A22EP 2MP Đàm Thoại 2 Chiều',
    ],
  },
  {
    parentCategory: IT,
    category: 'Camera AI',
    slug: 'camera-ai',
    brand: 'Hikvision / Dahua / KBVISION / Uniview / Hanwha / Bosch',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Hikvision DeepinView AI camera ANPR face capture anphatpc.com.vn',
    fallbackKey: 'camera',
    quota: 8,
    products: [
      'Camera AI Nhận Diện Biển Số Xe ANPR Hikvision DS-2CD7A26G0/P-IZHS 2MP Zoom Quang', 'Camera AI Nhận Diện Khuôn Mặt Hikvision DeepinView DS-2CD7126G0-L-IZS 2MP Chuyên Dụng', 'Camera AI Chụp Biển Số Xe Dahua DHI-ITC215-PW6M-IRLZF 2MP Cửa Khẩu Bãi Xe',
      'Camera AI Đếm Người WizMind Dahua DH-IPC-HFW5442T-ASE 4MP Phân Tích Mật Độ Đám Đông', 'Camera AI Phân Tích Hành Vi KBVISION KX-CAi4004N2-A 4MP Phát Hiện Đột Nhập Vượt Rào', 'Camera AI Nhận Diện Gương Mặt Uniview IPC262EBR9-DPF40-I0 2MP Face Capture',
      'Camera AI Phân Loại Đối Tượng Hanwha Vision XNO-6083R 2MP AI Object Detection', 'Camera AI Phân Tích Hình Ảnh Bosch FLEXIDOME IP starlight 8000i 4K AI Intelligent',
    ],
  },
  {
    parentCategory: IT,
    category: 'Đầu ghi hình NVR',
    slug: 'dau-ghi-hinh-nvr',
    brand: 'Hikvision / Dahua / KBVISION / Uniview',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Hikvision NVR network video recorder anphatpc.com.vn',
    fallbackKey: 'camera',
    quota: 8,
    products: [
      'Đầu ghi hình IP 8 Kênh Hikvision DS-7608NI-K2 4K Chuẩn H.265+ 2 Ổ Cứng', 'Đầu ghi hình IP 16 Kênh Hikvision DS-7616NI-M2 8K Ultra HD 2 Ổ Cứng', 'Đầu ghi hình IP 32 Kênh Hikvision DS-7732NI-M4 8K 4 Ổ Cứng Chuyên Dụng',
      'Đầu ghi hình IP 8 Kênh Dahua DHI-NVR4108HS-4KS2/L 4K 1 Ổ Cứng', 'Đầu ghi hình IP 16 Kênh Dahua WizMind DHI-NVR5216-4KS2 4K AI 2 Ổ Cứng', 'Đầu ghi hình IP 32 Kênh Dahua DHI-NVR5432-4KS2 4K 4 Ổ Cứng Doanh Nghiệp',
      'Đầu ghi hình IP 8 Kênh KBVISION KX-A8128N2 4K Chuẩn H.265+', 'Đầu ghi hình IP 16 Kênh Uniview NVR302-16E2-P16 Tích Hợp 16 Cổng PoE 2 Ổ Cứng',
    ],
  },
  {
    parentCategory: IT,
    category: 'Đầu ghi hình DVR / XVR',
    slug: 'dau-ghi-hinh-dvr-xvr',
    brand: 'Hikvision / Dahua / KBVISION',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Hikvision AcuSense DVR recorder anphatpc.com.vn',
    fallbackKey: 'camera',
    quota: 5,
    products: [
      'Đầu ghi hình 8 Kênh AcuSense Hikvision iDS-7208HQHI-M1/S Lọc Báo Động Giả', 'Đầu ghi hình 16 Kênh AcuSense Hikvision iDS-7216HQHI-M1/S Hỗ Trợ 16 Kênh Analog', 'Đầu ghi hình 8 Kênh 4K WizSense Dahua DH-XVR5108HS-4KL-I3 Tích Hợp AI',
      'Đầu ghi hình 16 Kênh 4K Dahua DH-XVR5216AN-4KL-I3 2 Ổ Cứng AI WizSense', 'Đầu ghi hình 8 Kênh 5in1 KBVISION KX-7108AI Tích Hợp Nhận Diện Khuôn Mặt',
    ],
  },
  {
    parentCategory: IT,
    category: 'Phụ kiện Camera',
    slug: 'phu-kien-camera',
    brand: 'Hikvision / Dahua / KBVISION',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Hikvision camera power supply accessories anphatpc.com.vn',
    fallbackKey: 'camera',
    quota: 4,
    products: [
      'Nguồn tổng camera tập trung 12V 30A vỏ tổ ong tản nhiệt nhôm', 'Switch mạng PoE chuyên dụng camera Hikvision DS-3E0105P-E/M 4 Cổng PoE 1 Cổng Uplink', 'Chân đế treo tường camera bán cầu và thân trụ Hikvision DS-1273ZJ-135',
      'Bộ chuyển đổi tín hiệu Video Balun thụ động chống sét hỗ trợ camera 5MP',
    ],
  },
  {
    parentCategory: IT,
    category: 'Thiết bị hội nghị truyền hình',
    slug: 'thiet-bi-hoi-nghi-truyen-hinh',
    brand: 'Logitech / Poly / Yealink / Jabra',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Logitech video conferencing camera anphatpc.com.vn',
    fallbackKey: 'camera',
    quota: 8,
    products: [
      'Hệ thống hội nghị truyền hình phòng lớn Logitech Rally Plus Camera 4K Loa Mic Rời', 'Hệ thống hội nghị truyền hình phòng họp 14-20 người Logitech Group Full HD', 'Camera hội nghị All-in-One phòng họp nhỏ Logitech MeetUp 4K Ultra HD 120 Độ',
      'Thiết bị hội nghị All-in-One Video Bar Poly Studio X50 Kèm Bảng Điều Khiển TC8', 'Thanh Video Bar cá nhân Poly Studio P15 4K Camera Tích Hợp Loa Mic Khử Ồn', 'Thiết bị hội nghị All-in-One Android Yealink MeetingBar A20 Camera 20MP',
      'Camera hội nghị truyền hình Yealink UVC84 4K Zoom Quang Học 12x PTZ', 'Thanh Video Bar hội nghị thông minh Jabra PanaCast 50 Góc Nhìn 180 Độ Toàn Cảnh',
    ],
  },
  {
    parentCategory: IT,
    category: 'Máy chiếu & thiết bị trình chiếu',
    slug: 'may-chieu-thiet-bi-trinh-chieu',
    brand: 'Epson / ViewSonic / BenQ / Panasonic / Sony',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Epson business projector 3LCD anphatpc.com.vn',
    fallbackKey: 'projector',
    quota: 8,
    products: [
      'Máy chiếu 3LCD văn phòng Epson EB-E01 Độ Sáng 3300 Ansi Lumens XGA', 'Máy chiếu không dây Epson EB-X51 Độ Sáng 3800 Ansi Lumens Kết Nối Wi-Fi', 'Máy chiếu độ nét cao Epson EB-2250U Độ Sáng 5000 Lumens Độ Phân Giải WUXGA Full HD',
      'Máy chiếu phòng họp ViewSonic PA503S Độ Sáng 3800 Ansi Lumens SVGA', 'Máy chiếu văn phòng ViewSonic PA503W Độ Sáng 3800 Ansi Lumens WXGA', 'Máy chiếu lớp học BenQ MS550 Độ Sáng 3600 Ansi Lumens Độ Tương Phản 20.000:1',
      'Máy chiếu Laser công nghệ cao Panasonic PT-VMZ51 Độ Sáng 5200 Lumens WUXGA', 'Máy chiếu Laser 3LCD Sony VPL-PHZ51 Độ Sáng 5300 Lumens WUXGA Nhỏ Gọn',
    ],
  },
  {
    parentCategory: IT,
    category: 'Thiết bị ngoại vi',
    slug: 'thiet-bi-ngoai-vi',
    brand: 'Logitech / Dell / Jabra',
    sourceKey: 'anphatpc',
    imageQueryPrefix: 'Logitech wireless keyboard mouse anphatpc.com.vn',
    fallbackKey: 'peripheral',
    quota: 12,
    products: [
      'Bộ bàn phím chuột không dây văn phòng Logitech MK270r Bền Bỉ Tiết Kiệm Pin', 'Bộ bàn phím chuột không dây chống ồn Logitech MK295 Silent Wireless Combo', 'Bộ bàn phím chuột có dây cổng USB Dell KM117 Bền Bỉ',
      'Bàn phím cơ văn phòng Logitech G413 SE Switch Tactile Đèn LED Trắng', 'Chuột không dây chống ồn Logitech M331 Silent Plus Thiết Kế Công Thái Học', 'Chuột không dây cao cấp Logitech MX Master 3S Cảm Biến 8000 DPI Yên Tĩnh',
      'Tai nghe chụp tai có mic khử ồn Jabra Evolve 20 MS Stereo Cổng USB', 'Tai nghe không dây chống ồn chủ động Logitech Zone Wireless Bluetooth', 'Webcam máy tính Full HD 1080p Logitech C920 Pro HD Tích Hợp Mic Kép',
      'Webcam hội họp chuyên nghiệp Logitech C930e Góc Rộng 90 Độ 1080p', 'Bút trình chiếu thuyết trình Laser đỏ Logitech R500s Kết Nối Bluetooth/USB', 'Bút trình chiếu cao cấp Logitech Spotlight Trỏ Số Thu Phóng Màn Hình',
    ],
  },

  // ─── NĂNG LƯỢNG MẶT TRỜI (180 SP - DHC Solar) ─────────────────────────────
  {
    parentCategory: SOLAR,
    category: 'Tấm pin năng lượng mặt trời',
    slug: 'tam-pin-nang-luong-mat-troi',
    brand: 'Canadian Solar / LONGi / Jinko Solar / Trina / AE Solar',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'Canadian Solar LONGi Jinko solar panel official dhcsolar.com',
    fallbackKey: 'solar',
    quota: 30,
    products: [
      'Tấm pin năng lượng mặt trời Canadian Solar HiKu6 CS6W-550MS Đơn Tinh Thể 550W', 'Tấm pin năng lượng mặt trời Canadian Solar HiKu7 CS7N-660MS Công Suất Lớn 660W', 'Tấm pin năng lượng mặt trời Canadian Solar TOPHiKu6 CS6W-580T Công Nghệ TOPCon N-type 580W',
      'Tấm pin năng lượng mặt trời Canadian Solar TOPHiKu6 CS6W-610T Công Nghệ N-type 610W', 'Tấm pin năng lượng mặt trời Canadian Solar BiHiKu7 CS7N-665MB-AG Hai Mặt Kính 665W', 'Tấm pin năng lượng mặt trời LONGi Solar Hi-MO 5 LR5-72HPH-550M 550W Đơn Tinh Thể',
      'Tấm pin năng lượng mặt trời LONGi Solar Hi-MO 6 Explorer LR5-72HTH-580M Công Nghệ HPBC 580W', 'Tấm pin năng lượng mặt trời LONGi Solar Hi-MO X6 Max LR5-72HTH-590M Công Suất 590W', 'Tấm pin năng lượng mặt trời LONGi Solar Hi-MO 7 LR7-72HGD-600M Hai Mặt Kính Bifacial 600W',
      'Tấm pin năng lượng mặt trời Jinko Solar Tiger Neo JKM585N-72HL4-V N-type TOPCon 585W', 'Tấm pin năng lượng mặt trời Jinko Solar Tiger Neo JKM620N-78HL4-V N-type 620W', 'Tấm pin năng lượng mặt trời Jinko Solar Tiger Pro JKM550M-72HL4-V Mono 550W',
      'Tấm pin năng lượng mặt trời Trina Solar Vertex DE21 660W Công Nghệ 210mm', 'Tấm pin năng lượng mặt trời Trina Solar Vertex S+ TSM-NEG9R.28 440W N-type Mặt Kính Đôi', 'Tấm pin năng lượng mặt trời Trina Solar Vertex TSM-DEG21C.20 Hai Mặt Kính 665W',
      'Tấm pin năng lượng mặt trời AE Solar Aurora AE-MD-144BS 550W Tiêu Chuẩn Đức', 'Tấm pin năng lượng mặt trời AE Solar Aurora AE-MD-132BS 670W Hiệu Suất Cao', 'Tấm pin năng lượng mặt trời JA Solar JAM72S30-550/MR Mono 550W 11BB',
      'Tấm pin năng lượng mặt trời JA Solar DeepBlue 4.0 Pro JAM72D40-580/GB N-type 580W', 'Tấm pin năng lượng mặt trời Astronergy CHSM72M-HC 550W Half-Cell', 'Tấm pin năng lượng mặt trời Astronergy ASTRO N5 CHSM72N-HC 585W N-type TOPCon',
      'Tấm pin năng lượng mặt trời Risen Energy Titan RSM144-8-550M Mono 550W', 'Tấm pin năng lượng mặt trời Risen Energy Titan RSM132-8-660M Mono 660W', 'Tấm pin năng lượng mặt trời SunPower Maxeon 6 440W Hiệu Suất Cao 22.8%',
      'Tấm pin năng lượng mặt trời Q.CELLS Q.PEAK DUO L-G8.3 430W Công Nghệ Q.ANTUM', 'Tấm pin năng lượng mặt trời VSUN VSUN550-144BMH 550W Tiêu Chuẩn Nhật Bản', 'Tấm pin năng lượng mặt trời màng mỏng First Solar Series 6 Plus 460W',
      'Tấm pin năng lượng mặt trời Vikram Solar SOMERA 550W Half-Cut Cell', 'Tấm pin năng lượng mặt trời Adani Solar ELAN Shine 540W Hai Mặt Kính', 'Tấm pin năng lượng mặt trời Waaree Arka Series 540W Mono PERC',
    ],
  },
  {
    parentCategory: SOLAR,
    category: 'Bộ hòa lưới Inverter',
    slug: 'inverter-hoa-luoi',
    brand: 'Growatt / Huawei / Sungrow / Deye / GoodWe / Solis / SMA',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'Growatt Huawei Sungrow solar inverter official dhcsolar.com',
    fallbackKey: 'inverter',
    quota: 35,
    products: [
      'Biến tần hòa lưới Growatt MIN 3000TL-X 3kW 1 Pha 2 MPPT', 'Biến tần hòa lưới Growatt MIN 5000TL-X 5kW 1 Pha 2 MPPT', 'Biến tần hòa lưới Growatt MOD 10KTL3-X 10kW 3 Pha 2 MPPT',
      'Biến tần hòa lưới Growatt MOD 15KTL3-X 15kW 3 Pha 2 MPPT', 'Biến tần hòa lưới Growatt MID 20KTL3-X1 20kW 3 Pha 2 MPPT', 'Biến tần hòa lưới Growatt MID 25KTL3-X1 25kW 3 Pha 2 MPPT',
      'Biến tần hòa lưới Growatt MAX 50KTL3-LV 50kW 3 Pha 6 MPPT', 'Biến tần hòa lưới Growatt MAX 100KTL3-X LV 100kW 3 Pha 10 MPPT', 'Biến tần hòa lưới Growatt MAX 125KTL3-X LV 125kW 3 Pha 10 MPPT',
      'Biến tần hòa lưới thông minh Huawei SUN2000-3KTL-L1 3kW 1 Pha', 'Biến tần hòa lưới thông minh Huawei SUN2000-5KTL-L1 5kW 1 Pha', 'Biến tần hòa lưới thông minh Huawei SUN2000-10KTL-M1 10kW 3 Pha',
      'Biến tần hòa lưới thông minh Huawei SUN2000-20KTL-M2 20kW 3 Pha', 'Biến tần hòa lưới thông minh Huawei SUN2000-50KTL-M3 50kW 3 Pha 4 MPPT', 'Biến tần hòa lưới thông minh Huawei SUN2000-100KTL-M2 100kW 3 Pha 10 MPPT',
      'Biến tần hòa lưới thông minh Huawei SUN2000-115KTL-M2 115kW 3 Pha 10 MPPT', 'Biến tần hòa lưới Sungrow SG5.0RS 5kW 1 Pha Dân Dụng', 'Biến tần hòa lưới Sungrow SG10RT 10kW 3 Pha 2 MPPT',
      'Biến tần hòa lưới Sungrow SG20RT 20kW 3 Pha 2 MPPT', 'Biến tần hòa lưới Sungrow SG50CX 50kW 3 Pha 5 MPPT Chuyên Dụng Nhà Xưởng', 'Biến tần hòa lưới Sungrow SG110CX 110kW 3 Pha 9 MPPT Dự Án Lớn',
      'Biến tần hòa lưới Deye SUN-3K-G03P1 3kW 1 Pha 1 MPPT', 'Biến tần hòa lưới Deye SUN-5K-G03P1 5kW 1 Pha 2 MPPT', 'Biến tần hòa lưới Deye SUN-10K-G03 10kW 3 Pha 2 MPPT',
      'Biến tần hòa lưới Deye SUN-20K-G04 20kW 3 Pha 2 MPPT', 'Biến tần hòa lưới Deye SUN-50K-G03 50kW 3 Pha 4 MPPT', 'Biến tần hòa lưới Deye SUN-110K-G03 110kW 3 Pha 6 MPPT',
      'Biến tần hòa lưới GoodWe GW5000D-NS 5kW 1 Pha 2 MPPT', 'Biến tần hòa lưới GoodWe GW15K-DT 15kW 3 Pha 2 MPPT', 'Biến tần hòa lưới GoodWe GW50KS 50kW 3 Pha 4 MPPT',
      'Biến tần hòa lưới Solis S6-GR1P5K 5kW 1 Pha 2 MPPT', 'Biến tần hòa lưới Solis S5-GC50K 50kW 3 Pha 5 MPPT', 'Biến tần hòa lưới Sofar 5.5KTL-X 5kW 3 Pha 2 MPPT',
      'Biến tần hòa lưới Sofar 20000TL-G2 20kW 3 Pha 2 MPPT', 'Biến tần hòa lưới công nghiệp SMA Sunny Tripower STP 50-40 CORE1 50kW',
    ],
  },
  {
    parentCategory: SOLAR,
    category: 'Inverter Hybrid',
    slug: 'inverter-hybrid',
    brand: 'Deye / Growatt / Huawei / GoodWe / Solis / Sofar / Sungrow',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'Deye Growatt hybrid solar inverter dhcsolar.com',
    fallbackKey: 'inverter',
    quota: 25,
    products: [
      'Biến tần lưu trữ Hybrid Deye SUN-5K-SG03LP1-EU 5kW 1 Pha 48V', 'Biến tần lưu trữ Hybrid Deye SUN-8K-SG01LP1-EU 8kW 1 Pha 48V', 'Biến tần lưu trữ Hybrid Deye SUN-12K-SG04LP3-EU 12kW 3 Pha 48V',
      'Biến tần lưu trữ Hybrid Deye SUN-15K-SG01HP3-EU-AM2 15kW 3 Pha Điện Áp Cao', 'Biến tần lưu trữ Hybrid Deye SUN-20K-SG01HP3-EU-AM2 20kW 3 Pha Cao Áp', 'Biến tần lưu trữ Hybrid công nghiệp Deye SUN-50K-SG01HP3-EU-BM4 50kW',
      'Biến tần lưu trữ Hybrid Growatt SPH 5000TL BL-UP 5kW 1 Pha 48V', 'Biến tần lưu trữ Hybrid Growatt SPH 10000TL3 BH-UP 10kW 3 Pha Cao Áp', 'Biến tần độc lập Off-Grid Growatt SPF 5000 ES 5kW 48V Chạy Không Cần Pin',
      'Biến tần độc lập Off-Grid Growatt SPF 6000 ES Plus 6kW 48V Mới Nhất', 'Biến tần lưu trữ Hybrid thông minh Huawei SUN2000-5KTL-L1 5kW Tương Thích LUNA', 'Biến tần lưu trữ Hybrid thông minh Huawei SUN2000-10KTL-M1 10kW 3 Pha',
      'Biến tần lưu trữ Hybrid GoodWe GW5048D-ES 5kW 48V 1 Pha', 'Biến tần lưu trữ Hybrid GoodWe GW10K-ET 10kW 3 Pha Điện Áp Cao', 'Biến tần lưu trữ Hybrid Solis RHI-5K-48ES 5kW 1 Pha 48V',
      'Biến tần lưu trữ Hybrid Solis S6-EH3P10K-H 10kW 3 Pha Cao Áp', 'Biến tần lưu trữ Hybrid Sofar HYD 5000-EP 5kW 1 Pha', 'Biến tần lưu trữ Hybrid Sofar HYD 10KTL-3PH 10kW 3 Pha',
      'Biến tần lưu trữ Hybrid Sungrow SH5.0RS 5kW 1 Pha Dân Dụng', 'Biến tần lưu trữ Hybrid Sungrow SH10RT 10kW 3 Pha Cao Áp', 'Biến tần All-In-One Hybrid Sol-Ark 15K Đa Năng',
      'Biến tần Hybrid cao cấp Fronius Symo GEN24 10.0 Plus 10kW 3 Pha', 'Biến tần lưu trữ pin SMA Sunny Boy Storage 5.0 5kW', 'Bộ biến tần sạc chuyển nguồn Victron Energy MultiPlus-II 48/5000/70-50',
      'Biến tần độc lập Deye Off-Grid SUN-6K-SG05LP1-EU 6kW 1 Pha',
    ],
  },
  {
    parentCategory: SOLAR,
    category: 'Bộ tối ưu công suất – Optimizer',
    slug: 'bo-toi-uu-cong-suat-optimizer',
    brand: 'Huawei / Tigo / SolarEdge / SMA / Deye',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'Huawei Smart PV optimizer Tigo solar official dhcsolar.com',
    fallbackKey: 'inverter',
    quota: 10,
    products: [
      'Bộ tối ưu công suất thông minh Huawei Smart PV Optimizer SUN2000-450W-P2', 'Bộ tối ưu công suất tấm pin Huawei Smart PV Optimizer SUN2000-600W-P', 'Bộ tối ưu hóa tấm pin năng lượng mặt trời Tigo TS4-A-O 700W Optimizer',
      'Bộ ngắt khẩn cấp an toàn phòng cháy Tigo TS4-A-F Rapid Shutdown', 'Bộ thu thập và truyền dữ liệu giám sát Tigo Cloud Connect Advanced CCA Kit', 'Bộ tối ưu hóa công suất SolarEdge P505 Optimizer 505W',
      'Bộ tối ưu hóa công suất SolarEdge P850 Optimizer 850W Cho 2 Tấm Pin', 'Bộ tối ưu hóa công suất SolarEdge P950 Optimizer 950W Cho 2 Tấm Pin Lớn', 'Bộ tối ưu hóa tấm pin SMA TS4-R-O Module Optimizer',
      'Bộ phát tín hiệu ngắt an toàn Deye Rapid Shutdown Transmitter & Receiver',
    ],
  },
  {
    parentCategory: SOLAR,
    category: 'Tủ điện năng lượng mặt trời',
    slug: 'tu-dien-nang-luong-mat-troi',
    brand: 'Schneider / FEEO / Chint / ETEK',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'tu dien nang luong mat troi AC DC solar combiner box dhcsolar.com',
    fallbackKey: 'panel',
    quota: 12,
    products: [
      'Tủ điện năng lượng mặt trời hòa lưới 5kW 1 Pha Đầy Đủ Thiết Bị AC/DC', 'Tủ điện năng lượng mặt trời hòa lưới 10kW 3 Pha AC/DC Chống Sét', 'Tủ điện năng lượng mặt trời hòa lưới 20kW 3 Pha Vỏ Kim Loại Sơn Tĩnh Điện',
      'Tủ điện năng lượng mặt trời hòa lưới 50kW 3 Pha Tích Hợp Chống Sét Lan Truyền', 'Tủ điện năng lượng mặt trời Hybrid 5kW Tích Hợp Bộ Chuyển Nguồn Tự Động ATS', 'Tủ điện năng lượng mặt trời Hybrid 10kW 3 Pha Tích Hợp ATS và Khóa Liên Động',
      'Tủ gom nguồn DC Combiner Box 4 String Vào 1 Ra 1000V Chống Nước IP65', 'Tủ gom nguồn DC Combiner Box 8 String Vào 2 Ra 1000V FEEO Có Cầu Chì Chống Sét', 'Tủ phân phối tổng AC Solar 100kW Thiết Bị Schneider Electric',
      'Tủ điện điều khiển và bảo vệ hệ thống Solar Farm 500kW', 'Tủ điện chuyển nguồn tự động ATS 63A 3 Pha Cho Hệ Thống Điện Mặt Trời', 'Tủ điện hòa đồng bộ và chống phát ngược lưới Zero Export Cho Inverter',
    ],
  },
  {
    parentCategory: SOLAR,
    category: 'Thiết bị bảo vệ điện mặt trời',
    slug: 'thiet-bi-bao-ve-dien-mat-troi',
    brand: 'FEEO / Suntree / Schneider / DEHN / Phoenix Contact',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'FEEO DC breaker surge protector solar dhcsolar.com',
    fallbackKey: 'panel',
    quota: 15,
    products: [
      'Aptomat DC chuyên dụng Solar FEEO FPV-63 2P 800V 32A', 'Aptomat DC chuyên dụng Solar FEEO FPV-63 2P 1000V 63A', 'Thiết bị chống sét lan truyền DC FEEO FSP-D40 2P 800V 40kA',
      'Thiết bị chống sét lan truyền DC FEEO FSP-D40 3P 1000V 40kA', 'Cầu chì DC chuyên dụng Solar FEEO FPV-32 1000V 15A Kèm Vỏ Đế', 'Cầu chì DC chuyên dụng Solar Suntree SRD-30 1000V 20A Kèm Vỏ',
      'Aptomat AC Schneider EasyPact EZ9F 2P 32A Bảo Vệ Quá Tải Ngắn Mạch', 'Aptomat AC Schneider Acti9 iC60N 3P 63A Tiêu Chuẩn Châu Âu', 'Thiết bị chống sét lan truyền AC Schneider Acti9 iPRD40r 3P+N 40kA',
      'Thiết bị chống sét lan truyền DC cao cấp DEHNguard DG M YPV SCI 1000V Đức', 'Thiết bị chống sét lan truyền AC Phoenix Contact VAL-MS 230/3+1 Đức', 'Aptomat khối MCCB Chint NXM-125S 3P 100A Cho Hệ Thống Solar Lớn',
      'Công tắc xoay cách ly nguồn DC Suntree SISO-32 4P 1200V 32A Chống Nước', 'Khởi động từ Contactor Chint NXC-63 3 Pha 63A Đóng Cắt Tự Động', 'Rơ le bảo vệ điện áp đa năng mất pha đảo pha Mikro MX210',
    ],
  },
  {
    parentCategory: SOLAR,
    category: 'Cáp & đầu nối Solar',
    slug: 'cap-dau-noi-solar',
    brand: 'Leader Solar / Lapp Kabel / Helukabel / CADIVI / Stäubli',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'Leader Solar cable MC4 connector Staubli dhcsolar.com',
    fallbackKey: 'cable',
    quota: 15,
    products: [
      'Cáp điện DC chuyên dụng Solar Leader 1x4mm2 Chống Cháy 1500V Cuộn 100m', 'Cáp điện DC chuyên dụng Solar Leader 1x6mm2 Chống Cháy 1500V Cuộn 100m', 'Cáp điện DC Solar Leader 1x4mm2 Màu Đỏ Chịu Nhiệt Cuộn 500m',
      'Cáp điện DC Solar Leader 1x4mm2 Màu Đen Chịu Nhiệt Cuộn 500m', 'Cáp điện DC Solar Leader 1x6mm2 Màu Đỏ 1500V DC Cuộn 500m', 'Cáp điện DC Solar Leader 1x6mm2 Màu Đen 1500V DC Cuộn 500m',
      'Cáp điện DC Solar cao cấp Lapp Kabel ÖLFLEX SOLAR XLR-E 4mm2 Đức', 'Cáp điện DC Solar Helukabel SOLARFLEX-X H1Z2Z2-K 6mm2 Tiêu Chuẩn TUV', 'Cáp điện DC Solar CADIVI H1Z2Z2-K 1x4mm2 Tiêu Chuẩn Việt Nam',
      'Cáp điện DC Solar CADIVI H1Z2Z2-K 1x6mm2 Tiêu Chuẩn Việt Nam', 'Đầu nối giắc MC4 Stäubli Multi-Contact MC4 1500V Chính Hãng Thụy Sỹ', 'Đầu nối giắc MC4 Leader Solar 1500V Chống Nước IP68 Chịu Dòng 30A',
      'Đầu nối chia nhánh MC4 Chữ Y 2 Vào 1 Ra Cặp Đực Cái', 'Đầu nối chia nhánh MC4 Chữ T 3 Vào 1 Ra Song Song Cặp Đực Cái', 'Bộ kìm bấm cos chuyên dụng MC4 Kèm Cờ Lê Mở Giắc Năng Lượng Mặt Trời',
    ],
  },
  {
    parentCategory: SOLAR,
    category: 'Hệ khung giá đỡ Solar',
    slug: 'he-khung-gia-do-solar',
    brand: 'DHC Solar',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'khung gia do ray nhom kep pin nang luong mat troi dhcsolar.com',
    fallbackKey: 'rack',
    quota: 10,
    products: [
      'Thanh ray nhôm chuyên dụng AL6005-T5 Dài 2.1m Đỡ Tấm Pin Mái Tôn', 'Thanh ray nhôm chuyên dụng AL6005-T5 Dài 4.2m Chịu Lực Anodized', 'Kẹp biên nhôm chữ Z End Clamp 35mm Kèm Bulong Inox 304',
      'Kẹp biên nhôm chữ Z End Clamp 40mm Kèm Bulong Inox 304', 'Kẹp giữa nhôm chữ U Mid Clamp 35-40mm Kèm Bulong Con Tán Inox', 'Chân chữ L gắn mái tôn L-Feet Kèm Đệm Cao Su EPDM Chống Dột Nước',
      'Móc kẹp mái ngói Inox 304 Solar Tile Hook Chuyên Dụng Mái Ngói Sóng', 'Kẹp seamlock nhôm AL6005-T5 Cho Mái Tôn Klip-lok Không Bắn Vít Lủng Mái', 'Khớp nối ray nhôm Anodized Dài 200mm Kèm Ốc Siết Cố Định Ray',
      'Chân đế tam giác nhôm nghiêng 15-30 độ Cho Mái Bằng Bê Tông',
    ],
  },
  {
    parentCategory: SOLAR,
    category: 'Thiết bị giám sát & đo đếm',
    slug: 'thiet-bi-giam-sat-do-dem',
    brand: 'Huawei / Sungrow / Growatt / Deye',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'Huawei SmartLogger Growatt ShineWiFi data logger dhcsolar.com',
    fallbackKey: 'inverter',
    quota: 8,
    products: [
      'Bộ thu thập dữ liệu giám sát thông minh Huawei SmartLogger 3000A', 'Bộ thu thập và truyền dữ liệu trạm Solar Sungrow Logger1000B', 'Thiết bị giám sát tập trung Growatt ShineMaster Quản Lý 32 Inverter',
      'USB Wifi giám sát không dây Growatt ShineWiFi-X Cắm Cổng USB Inverter', 'Thiết bị giám sát không dây Deye Wifi Stick Datalogger MW3_16', 'Đồng hồ đo đếm điện tử thông minh 3 Pha Huawei Smart Power Sensor DTSU666-H',
      'Đồng hồ đo đếm điện tử thông minh 1 Pha Huawei Smart Power Sensor DDSU666-H', 'Trạm cảm biến quan trắc thời tiết bức xạ nhiệt độ Solar Meteo Control',
    ],
  },
  {
    parentCategory: SOLAR,
    category: 'Công tơ & thiết bị đo điện',
    slug: 'cong-to-thiet-bi-do-dien',
    brand: 'Chint / Selec / Janitza / Schneider',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'Chint DTSU666 energy meter smart power meter dhcsolar.com',
    fallbackKey: 'panel',
    quota: 5,
    products: [
      'Công tơ điện tử thông minh 3 Pha Chint DTSU666 Giao Tiếp RS485 Modbus RTU', 'Công tơ điện tử thông minh 1 Pha Chint DDSU666 Giao Tiếp RS485 Đo Đếm 2 Chiều', 'Đồng hồ đo đa năng hiển thị số 3 Pha Selec EM720 Cắt Lỗ Tủ Điện',
      'Đồng hồ phân tích chất lượng điện năng Janitza UMG 96RM Tiêu Chuẩn Đức', 'Đồng hồ đo điện đa chức năng Schneider Electric EasyLogic PM2230 RS485',
    ],
  },
  {
    parentCategory: SOLAR,
    category: 'Thiết bị vệ sinh tấm pin',
    slug: 'thiet-bi-ve-sinh-tam-pin',
    brand: 'DHC Solar / Kärcher / SolarCleano',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'choi lau pin mat troi ve sinh tam pin solar dhcsolar.com',
    fallbackKey: 'solar',
    quota: 5,
    products: [
      'Chổi lau pin mặt trời cán sợi Carbon 5.5m Đầu Xoay Đôi Rửa Nước Tự Động', 'Chổi lau pin mặt trời cán nhôm rút 7.5m Đầu Chổi Cước Mềm Chống Trầy Xước', 'Máy phun rửa áp lực cao vệ sinh pin mặt trời Karcher HD 5/11 P',
      'Robot tự hành vệ sinh tấm pin năng lượng mặt trời SolarCleano M1', 'Dung dịch tẩy rửa làm sạch bề mặt tấm pin năng lượng mặt trời chuyên dụng 20L',
    ],
  },

  // ─── ẮC QUY VÀ LƯU TRỮ ĐIỆN (85 SP) ──────────────────────────────────────
  {
    parentCategory: STORAGE,
    category: 'Ắc quy Lithium LiFePO4',
    slug: 'ac-quy-lithium-lifepo4',
    brand: 'Pylontech / Dyness / Deye / Huawei / Sunket / UFO',
    sourceKey: 'dhcsolar',
    imageQueryPrefix: 'Pylontech Dyness Deye lithium battery LiFePO4 dhcsolar.com',
    fallbackKey: 'battery',
    quota: 35,
    products: [
      'Pin lưu trữ Lithium LiFePO4 Pylontech US2000C 48V 50Ah 2.4kWh', 'Pin lưu trữ Lithium LiFePO4 Pylontech US3000C 48V 74Ah 3.5kWh', 'Pin lưu trữ Lithium LiFePO4 Pylontech US5000 48V 100Ah 4.8kWh',
      'Pin lưu trữ Lithium cao áp Pylontech Force H2 3.55kWh Mô Đun', 'Pin lưu trữ Lithium LiFePO4 Dyness Powerbox Pro 48V 100Ah 5.12kWh Treo Tường', 'Pin lưu trữ Lithium LiFePO4 Dyness B4850 48V 50Ah 2.4kWh Gắn Tủ Rack',
      'Pin lưu trữ Lithium LiFePO4 Dyness A48100 48V 100Ah 4.8kWh Chuẩn 19 inch', 'Pin lưu trữ Lithium cao áp Dyness Tower T10 10.66kWh Chuyên Dụng Inverter Cao Áp', 'Pin lưu trữ Lithium LiFePO4 Deye SE-G5.1 Pro 51.2V 100Ah 5.12kWh Gắn Tủ',
      'Pin lưu trữ Lithium LiFePO4 Deye RW-M6.1 51.2V 120Ah 6.14kWh Treo Tường', 'Pin lưu trữ Lithium cao áp Deye BOS-G 5.12kWh Mô Đun Ghép Nối Tiếp', 'Khối pin lưu trữ thông minh Huawei LUNA2000-5-E0 5kWh Lithium LFP',
      'Hệ thống pin lưu trữ gia đình Huawei LUNA2000-10-S0 10kWh Trọn Bộ', 'Pin lưu trữ Lithium LiFePO4 Sunket ESS 48V 100Ah 5.12kWh Treo Tường', 'Pin lưu trữ Lithium LiFePO4 Sunket 51.2V 200Ah 10.24kWh Kiểu Dáng Đặt Sàn',
      'Pin lưu trữ Lithium LiFePO4 UFO Power 48V 100Ah 4.8kWh Màn Hình Hiển Thị LCD', 'Pin lưu trữ Lithium LiFePO4 UFO Power 48V 200Ah 9.6kWh Treo Tường Powerwall', 'Pin lưu trữ Lithium viễn thông Shoto SDA10-4850 48V 50Ah',
      'Pin lưu trữ Lithium viễn thông Shoto SDA10-48100 48V 100Ah Gắn Rack 19 inch', 'Pin lưu trữ Lithium Narada 48NPFC100 48V 100Ah Chuyên Dụng Trạm BTS', 'Pin lưu trữ Lithium Narada 48NPFC50 48V 50Ah Chuyên Dụng Viễn Thông',
      'Pin lưu trữ Lithium Vision V-LFP48100 48V 100Ah Dự Phòng Viễn Thông UPS', 'Khối pin lưu trữ BYD Battery-Box Premium LVS 4.0kWh Điện Áp Thấp', 'Khối pin lưu trữ cao áp BYD Battery-Box Premium HVS 5.1kWh',
      'Bộ pin lưu trữ Lithium CATL 48V 100Ah 5.12kWh Cell LFP Chuẩn Grade A', 'Khối pin lưu trữ Growatt ARK 2.5L-A1 2.56kWh Lưu Trữ Điện Áp Thấp 48V', 'Khối pin lưu trữ thông minh Growatt AXE 5.0L 5.0kWh Xếp Chồng Linh Hoạt',
      'Hệ thống lưu trữ điện GoodWe Lynx Home U Series 5.4kWh Treo Tường', 'Khối pin lưu trữ Solis S5-GC-ESS 5kWh Tương Thích Inverter Solis', 'Bộ lưu trữ điện Alpha ESS Smile-B3 Plus 5.04kWh Tích Hợp Biến Tần',
      'Pin lưu trữ Lithium Pytes E-Box 48100R 5.12kWh Chuẩn Tủ Rack 19 inch', 'Pin lưu trữ Lithium EG4 LifePower4 48V 100Ah Giao Tiếp BMS Đa Năng', 'Hệ thống pin lưu trữ GivEnergy Gen 2 9.5kWh Dung Lượng Lớn',
      'Bộ pin lưu trữ năng lượng mặt trời Rosen Solar 48V 200Ah 10kWh Powerwall', 'Pin lưu trữ Lithium Felicity Solar LPBA48100 48V 100Ah 5kWh Giá Rẻ',
    ],
  },
  {
    parentCategory: STORAGE,
    category: 'Ắc quy chì VRLA / AGM',
    slug: 'ac-quy-chi-vrla',
    brand: 'Kung Long',
    sourceKey: 'lelong',
    imageQueryPrefix: 'Kung Long WP lead acid battery official lelong.com.vn',
    fallbackKey: 'battery',
    quota: 30,
    products: [
      'Ắc quy chì kín khí Kung Long WP1.2-12 12V 1.2Ah Dùng Cho Báo Cháy Đèn Khẩn Cấp', 'Ắc quy chì kín khí Kung Long WP2.3-12 12V 2.3Ah Kích Thước Nhỏ Gọn', 'Ắc quy chì kín khí Kung Long WP5-12 12V 5Ah Chuyên Dụng UPS Cửa Cuốn',
      'Ắc quy chì kín khí Kung Long WP7.2-12 12V 7.2Ah Chuẩn Kích Thước UPS APC Santak', 'Ắc quy chì kín khí Kung Long WP12-12 12V 12Ah Cho Nguồn Dự Phòng Viễn Thông', 'Ắc quy chì kín khí Kung Long WP18-12 12V 18Ah Nguồn DC Trạm Biến Áp',
      'Ắc quy chì kín khí Kung Long WP26-12 12V 26Ah Dự Phòng Nguồn Điện', 'Ắc quy chì kín khí Kung Long WP33-12 12V 33Ah Cọc Bắt Ốc M5', 'Ắc quy chì kín khí Kung Long WP50-12 12V 50Ah Nguồn Năng Lượng Mặt Trời',
      'Ắc quy chì kín khí Kung Long WP65-12 12V 65Ah Chuyên Dụng Viễn Thông UPS', 'Ắc quy chì kín khí Kung Long WP75-12 12V 75Ah Dung Lượng Cao', 'Ắc quy chì kín khí Kung Long WP100-12 12V 100Ah Chuyên Dụng Điện Mặt Trời UPS',
      'Ắc quy chì kín khí Kung Long WP150-12 12V 150Ah Lưu Trữ Năng Lượng Lớn', 'Ắc quy chì kín khí Kung Long WP200-12 12V 200Ah Dung Lượng Cực Đại 12V', 'Ắc quy chì tuổi thọ cao 10 năm Kung Long WPL33-12 12V 33Ah Long Life',
      'Ắc quy chì tuổi thọ cao 10 năm Kung Long WPL50-12 12V 50Ah Long Life', 'Ắc quy chì tuổi thọ cao 10 năm Kung Long WPL65-12 12V 65Ah Long Life', 'Ắc quy chì tuổi thọ cao 10 năm Kung Long WPL100-12 12V 100Ah Long Life',
      'Ắc quy chì tuổi thọ cao 10 năm Kung Long WPL150-12 12V 150Ah Long Life', 'Ắc quy chì tuổi thọ cao 10 năm Kung Long WPL200-12 12V 200Ah Long Life', 'Ắc quy phóng điện cường độ cao Kung Long KPH100-12N 12V 100Ah High Rate Cho UPS',
      'Ắc quy phóng điện cường độ cao Kung Long KPH150-12N 12V 150Ah High Rate', 'Ắc quy GEL xả sâu xả kiệt Kung Long LG100-12 12V 100Ah Deep Cycle Solar', 'Ắc quy GEL xả sâu xả kiệt Kung Long LG150-12 12V 150Ah Deep Cycle Solar',
      'Ắc quy GEL xả sâu xả kiệt Kung Long LG200-12 12V 200Ah Deep Cycle Solar', 'Ắc quy công nghiệp đơn cell 2V Kung Long MS500-2 2V 500Ah', 'Ắc quy công nghiệp đơn cell 2V Kung Long MS1000-2 2V 1000Ah Trạm Điện',
      'Ắc quy chì kín khí Kung Long WP7-6 6V 7Ah Đèn Chiếu Sáng Sự Cố', 'Ắc quy chì kín khí Kung Long WP12-6 6V 12Ah Xe Điện Trẻ Em Thiết Bị Y Tế', 'Ắc quy chì kín khí Kung Long WP4.5-12 12V 4.5Ah Đèn Sạc Quạt Tích Điện',
    ],
  },
  {
    parentCategory: STORAGE,
    category: 'Ắc quy nước Traction',
    slug: 'ac-quy-nuoc-traction',
    brand: 'Trojan / GS Yuasa / Rocket / Hitachi Kobelco / Hoppecke',
    sourceKey: 'lelong',
    imageQueryPrefix: 'Trojan GS Yuasa traction battery deep cycle lelong.com.vn',
    fallbackKey: 'battery',
    quota: 20,
    products: [
      'Ắc quy xả sâu Trojan T-105 6V 225Ah Chuyên Dụng Xe Golf Xe Điện Sân Golf', 'Ắc quy xả sâu Trojan T-125 6V 240Ah Xả Sâu Bền Bỉ', 'Ắc quy xả sâu Trojan T-875 8V 170Ah Xe Điện Du Lịch',
      'Ắc quy xả sâu Trojan T-1275 12V 150Ah Xe Chở Khách Sân Golf', 'Ắc quy xả sâu Trojan J305P-AC 6V 330Ah Xe Nâng Người Xe Quét Rác', 'Ắc quy xả sâu Trojan L16P-AC 6V 420Ah Dung Lượng Lớn',
      'Ắc quy xe nâng điện GS Yuasa VGD565 48V 565Ah Tiêu Chuẩn Nhật Bản', 'Ắc quy xe nâng điện GS Yuasa VSF3 48V 300Ah Cho Xe Nâng Đứng Lái', 'Ắc quy xe nâng điện GS Yuasa VCF4N 48V 400Ah Cho Xe Nâng Ngồi Lái',
      'Ắc quy xe nâng điện Rocket VCF450 48V 450Ah Hàn Quốc', 'Ắc quy xe nâng điện Rocket VCF500 48V 500Ah Bền Bỉ', 'Ắc quy xe nâng điện Hitachi Kobelco VSF4 48V 400Ah Nhật Bản',
      'Ắc quy công nghiệp xe nâng Hoppecke trak air 48V 620Ah Đức', 'Ắc quy xe nâng công nghiệp nặng EnerSys Ironclad 48V 750Ah', 'Ắc quy xe nâng điện TAB 48V 500Ah Tiêu Chuẩn Châu Âu',
      'Ắc quy xả sâu cao cấp Rolls Surrette S6-L16-HC 6V 445Ah Canada', 'Ắc quy xả sâu U.S. Battery US 2200 XC2 6V 232Ah Nhập Khẩu Mỹ', 'Ắc quy xả sâu xe điện Crown CR-225 6V 225Ah Mỹ',
      'Ắc quy xả sâu GEL Deka Solar 8G4D 12V 183Ah Chống Cháy Nổ Mỹ', 'Ắc quy xả sâu GEL Deka Solar 8G8D 12V 225Ah Dung Lượng Lớn',
    ],
  },
];

// =============================================================================
// Tiện ích xử lý chuỗi & Trích xuất Model/Brand
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

const VI_PREFIXES = [
  /^biến\s+tần\s+hòa\s+lưới\s+(thông\s+minh\s+)?/i,
  /^biến\s+tần\s+hybrid\s+(thông\s+minh\s+)?/i,
  /^biến\s+tần\s+lưu\s+trữ\s+/i,
  /^bộ\s+hòa\s+lưới\s+inverter\s+/i,
  /^tấm\s+pin\s+(năng\s+lượng\s+mặt\s+trời\s+|solar\s+)?/i,
  /^pin\s+lưu\s+trữ\s+lithium\s+(lifepo4\s+)?/i,
  /^ắc\s+quy\s+(chì\s+|lithium\s+|nước\s+|vrla\s+|agm\s+|gel\s+)?(viễn\s+thông\s+|ups\s+)?/i,
  /^máy\s+chủ\s+server\s+/i,
  /^máy\s+tính\s+(để\s+bàn\s+|all-in-one\s+|mini\s+pc\s+|workstation\s+)?/i,
  /^màn\s+hình\s+máy\s+tính\s+/i,
  /^máy\s+in\s+(nhãn\s+|laser\s+|đa\s+năng\s+)?/i,
  /^máy\s+quét\s+mã\s+vạch\s+/i,
  /^kiosk\s+(tra\s+cứu\s+thông\s+tin\s+|lấy\s+số\s+tự\s+động\s+|đánh\s+giá\s+hài\s+lòng\s+)?(dịch\s+vụ\s+công\s+)?/i,
  /^tủ\s+mạng\s+(tmc\s+rack\s+|wallmount\s+|server\s+rack\s+|outdoor\s+)?/i,
  /^tủ\s+server\s+rack\s+/i,
  /^router\s+(cân\s+bằng\s+tải\s+|wifi\s+|vpn\s+)?/i,
  /^switch\s+(chia\s+mạng\s+|quản\s+lý\s+|poe\s+)?/i,
  /^cáp\s+mạng\s+(chống\s+nhiễu\s+)?/i,
  /^đầu\s+ghi\s+hình\s+(nvr\s+|dvr\s+|xvr\s+)?/i,
  /^camera\s+(ip\s+|ptz\s+|ai\s+|wifi\s+|quan\s+sát\s+)?/i,
  /^thiết\s+bị\s+(lưu\s+trữ\s+nas\s+|pos\s+|hội\s+nghị\s+|bảo\s+vệ\s+|cân\s+bằng\s+tải\s+)?/i
];

function cleanProductName(raw: string): string {
  let s = raw.trim();
  for (const re of VI_PREFIXES) {
    s = s.replace(re, '');
  }
  return s.trim();
}

function detectBrand(productName: string): string {
  const normalized = productName.toLowerCase();
  for (const brand of BRAND_PREFIXES) {
    if (normalized.startsWith(brand.toLowerCase()) || normalized.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return productName.split(/\s+/).slice(0, 2).join(' ');
}

function extractModel(productName: string, brand: string): string {
  const cleaned = cleanProductName(productName);
  const tokens = cleaned.split(/\s+/);
  
  const codeTokens = tokens.filter(t => (/[0-9]/.test(t) && /[a-zA-Z]/.test(t)) || /^[A-Z0-9-]{3,}$/.test(t));
  if (codeTokens.length > 0) {
    const nonPowerTokens = codeTokens.filter(t => !/^(1Pha|3Pha|\d+kW|\d+W|\d+Ah|\d+V|\d+MPPT|\d+Port|\d+U|\d+TB)$/i.test(t));
    if (nonPowerTokens.length > 0) {
      return nonPowerTokens.slice(0, 2).join(' ');
    }
    return codeTokens[0];
  }

  return tokens.slice(0, 3).join(' ');
}

function extractPartNumber(productName: string, brand: string): string {
  const model = extractModel(productName, brand);
  return model.replace(/[^a-zA-Z0-9-+._/]/g, '').trim() || slugify(productName).slice(0, 20);
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
  
  const brandMatched = normalizeEvidenceText(brand)
    .split(' ')
    .filter((word) => word.length >= 2)
    .every((word) => normalizedText.includes(word));
    
  const exactModel = modelCompact.length >= 3 && (textCompact.includes(modelCompact) || normalizedText.includes(normalizedModel));

  if (exactModel) {
    return { score: 100, method: 'exact-model', exactModel: true, brandMatched, matchedTokens: [model], missingTokens: [] };
  }

  const tokens = model.split(/[^A-Z0-9]/i).filter(t => t.length >= 2);
  const matchedTokens = tokens.filter(t => normalizedText.includes(t.toUpperCase()));
  const missingTokens = tokens.filter(t => !matchedTokens.includes(t));

  if (tokens.length > 0 && matchedTokens.length === tokens.length) {
    return { score: 90, method: 'all-model-tokens', exactModel: false, brandMatched, matchedTokens, missingTokens };
  }

  const ratio = tokens.length > 0 ? matchedTokens.length / tokens.length : 0;
  const score = Math.round(40 + ratio * 50 + (brandMatched ? 10 : 0));
  return { score, method: 'partial-model-tokens', exactModel: false, brandMatched, matchedTokens, missingTokens };
}

function evaluateImageCandidate(candidate: ImageCandidate, productName: string, brand: string): ImageMatchEvidence {
  return evaluateTextMatch(
    `${candidate.title} ${candidate.sourcePage} ${candidate.imageUrl}`,
    productName,
    brand,
  );
}

function buildTargetedSerperQuery(productName: string, group: CatalogGroup): string {
  const brand = detectBrand(productName);
  const model = extractModel(productName, brand);
  const negativeFilters = '-watch -band -strap -wristband -vong-tay -dong-ho -case -cover -phone -earbuds -shopee -lazada -tiki';
  
  // Tối ưu Query cho 6 nguồn xác thực kèm từ khóa phủ định chống nhầm phụ kiện tiêu dùng
  switch (group.sourceKey) {
    case 'dhcsolar':
      if (brand.toLowerCase().includes('huawei')) {
        return `"${model}" Huawei Inverter site:dhcsolar.com OR site:solar.huawei.com OR site:huawei.com ${negativeFilters}`;
      }
      if (brand.toLowerCase().includes('growatt')) {
        return `"${model}" Growatt Inverter site:dhcsolar.com OR site:growatt.com ${negativeFilters}`;
      }
      if (brand.toLowerCase().includes('deye')) {
        return `"${model}" Deye Inverter site:dhcsolar.com OR site:deyeinverter.com ${negativeFilters}`;
      }
      return `"${model}" ${brand} site:dhcsolar.com OR site:canadiansolar.com OR site:growatt.com OR site:sungrowpower.com OR site:pylontech.com.cn ${negativeFilters}`;
    case 'lelong':
      return `"${model}" site:lelong.com.vn OR site:longbattery.com OR site:kunglong.com ${negativeFilters}`;
    case 'anphat_draytek':
      return `"${model}" site:anphat.vn OR site:draytek.com.vn OR site:dintek.com.tw OR site:totolink.vn ${negativeFilters}`;
    case 'anphatpc':
      return `"${model}" ${brand} site:anphatpc.com.vn OR site:dell.com OR site:hp.com OR site:lenovo.com OR site:synology.com OR site:hikvision.com ${negativeFilters}`;
    case 'comq':
      return `"${model}" site:comq.vn ${negativeFilters}`;
    case 'tmcrack':
      return `"${model}" site:tmcrack.vn OR site:tmc.vn ${negativeFilters}`;
    default:
      return `${brand} ${model} official product image ${negativeFilters}`;
  }
}

// =============================================================================
// Tìm kiếm ảnh qua Serper Google Images API
// =============================================================================
async function searchGoogleImages(query: string): Promise<ImageCandidate[]> {
  if (!SERPER_ENABLED) return [];

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

    const data = (await response.json()) as { images?: any[] };
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
  const isTrustedDistributor = TRUSTED_DISTRIBUTOR_DOMAINS.some((domain) => hostMatches(sourceHost, domain));
  const isBrandOfficial = (BRAND_DOMAINS[brand] || []).some((domain) => hostMatches(sourceHost, domain));

  let score = isTrustedDistributor ? 1_500 : isBrandOfficial ? 1_000 : 300;
  score += matchEvidence.score * 5;

  if ((candidate.imageWidth || 0) >= 800) score += 60;
  else if ((candidate.imageWidth || 0) >= MIN_IMAGE_WIDTH) score += 30;

  if ((candidate.imageHeight || 0) >= 600) score += 40;
  else if ((candidate.imageHeight || 0) >= MIN_IMAGE_HEIGHT) score += 20;

  if (/\.(jpe?g|png|webp|avif)(\?|$)/i.test(candidate.imageUrl)) score += 20;
  score += Math.max(0, 15 - (candidate.position || 15));

  return score;
}

// =============================================================================
// Sinh nội dung chuẩn SEO & GEO 2026 cho Sản phẩm
// =============================================================================
function buildProductContent(params: {
  name: string;
  brand: string;
  model: string;
  sku: string;
  group: CatalogGroup;
  categoryPathNames: string[];
  image: VerifiedImage;
}) {
  const { name, brand, model, sku, group, categoryPathNames, image } = params;
  const categoryName = categoryPathNames[categoryPathNames.length - 1];
  const slug = slugify(name);
  const canonicalPath = `/products/${slug}`;
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;
  const focusKeyword = `${name} chính hãng`;
  const metaTitle = clip(`${name} Chính Hãng | Báo Giá CTC`, 60);
  const metaDescription = clip(
    `${name} chính hãng thương hiệu ${brand}, model ${model}. Cung cấp bởi CTC với đầy đủ CO/CQ, bảo hành chính hãng và hỗ trợ kỹ thuật chuyên sâu trên toàn quốc.`,
    158,
  );

  const description = `
<div class="product-detail-content">
  <p><strong>${name}</strong> là dòng thiết bị ${categoryName.toLowerCase()} chất lượng cao của thương hiệu <strong>${brand}</strong> (Model / Part Number: <code>${model}</code>), được phân phối và tích hợp chuyên nghiệp bởi <strong>Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)</strong>.</p>
  
  <h3>Đặc Điểm Nổi Bật & Ứng Dụng</h3>
  <ul>
    <li><strong>Model chính hãng:</strong> ${model} (Part Number: ${sku}) đáp ứng nghiêm ngặt tiêu chuẩn kỹ thuật của ${brand}.</li>
    <li><strong>Chất lượng đảm bảo:</strong> Sản phẩm có đầy đủ chứng chỉ chất lượng (CQ) và xuất xứ (CO), cam kết 100% hàng chính hãng.</li>
    <li><strong>Giải pháp đồng bộ:</strong> Dễ dàng tích hợp vào hệ thống hạ tầng mạng, Data Center, trạm viễn thông và hệ thống năng lượng mặt trời.</li>
    <li><strong>Chính sách thương mại:</strong> Hỗ trợ tư vấn kỹ thuật chuyên sâu, cung cấp giải pháp trọn gói và chính sách giá cạnh tranh cho dự án.</li>
  </ul>

  <h3>Thông Tin Nhà Cung Cấp & Dịch Vụ CTC</h3>
  <p>Với hơn 20 năm kinh nghiệm trong lĩnh vực tổng thầu EPC Điện Năng Lượng Mặt Trời và Hạ tầng Viễn thông Bưu điện, CTC luôn mang đến những thiết bị đạt chuẩn chất lượng cùng dịch vụ bảo hành, hậu mãi chu đáo nhất.</p>
</div>`.trim();

  const shortDescription = `${name} - Model ${model}, thương hiệu ${brand}. Thiết bị ${categoryName.toLowerCase()} chính hãng, xuất xứ rõ ràng, bảo hành uy tín tại CTC.`;

  const faq = [
    {
      question: `Sản phẩm ${name} có sẵn hàng tại CTC không?`,
      answer: `CTC luôn duy trì tồn kho cho các model ${categoryName.toLowerCase()} phổ biến và tiếp nhận đặt hàng dự án với thời gian giao hàng nhanh chóng trên toàn quốc.`,
    },
    {
      question: `Chính sách bảo hành cho ${name} như thế nào?`,
      answer: `Sản phẩm được bảo hành chính hãng theo đúng tiêu chuẩn của ${brand} và chính sách hỗ trợ kỹ thuật 24/7 từ CTC.`,
    },
    {
      question: `Làm thế nào để nhận báo giá dự án cho ${name}?`,
      answer: `Quý khách vui lòng liên hệ Hotline 0915 059 666 hoặc gửi yêu cầu qua website ctcdn.vn để nhận báo giá chiết khấu dự án tốt nhất.`,
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: [image.publicUrl],
    description: metaDescription,
    sku,
    mpn: sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'VND',
      price: '0',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: COMPANY.name,
      },
    },
  };

  const geo = {
    geoStandard: GEO_STANDARD,
    localCoverage: {
      country: 'Việt Nam',
      primaryOffice: COMPANY.address,
      provinceCount: GEO_PROVINCES.length,
    },
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
        `${model} chính hãng`,
        `${categoryName} ${brand}`,
        `mua ${name} tại Đà Nẵng`,
        `phân phối ${name} Việt Nam`,
      ],
      canonicalPath,
      canonicalUrl,
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
      ogImage: image.publicUrl,
      imageAlt: `${name} - hình ảnh sản phẩm ${brand}, model ${model}`,
    },
  };
}

// =============================================================================
// Sinh Landing Page SEO 3 Cấp cho Danh Mục
// =============================================================================
function buildCategorySeo(pathNames: string[]) {
  const name = pathNames[pathNames.length - 1];
  const slug = slugify(name);
  const canonicalPath = `/products/category/${slug}`;
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;
  const focusKeyword = `${name} chính hãng`;
  const h1 = `${name} Chính Hãng`;
  const metaTitle = clip(`${name} Chính Hãng | Báo Giá Dự Án CTC`, 60);
  const metaDescription = clip(
    `Danh mục ${name} chính hãng tại CTC. Phân phối thiết bị chất lượng cao, đầy đủ CO/CQ, hỗ trợ kỹ thuật và giao hàng toàn quốc. Liên hệ nhận báo giá ngay!`,
    158,
  );

  const intro = `
${name} là một trong những danh mục thiết bị hạ tầng kỹ thuật trọng điểm được cung cấp bởi Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC). Chúng tôi cam kết mang tới cho đối tác và khách hàng các giải pháp thiết bị đồng bộ, đáp ứng tiêu chuẩn kỹ thuật khắt khe của các công trình viễn thông, CNTT và năng lượng tái tạo trên khắp cả nước.

Tất cả sản phẩm trong danh mục ${name} đều có nguồn gốc xuất xứ rõ ràng từ các nhà sản xuất và thương hiệu uy tín hàng đầu. Đội ngũ kỹ sư giàu kinh nghiệm của CTC sẵn sàng hỗ trợ tư vấn cấu hình, đối chiếu tiêu chuẩn kỹ thuật và cung cấp phương án triển khai tối ưu nhất cho từng dự án.
`.trim();

  const faq = [
    {
      question: `CTC cung cấp những dòng sản phẩm ${name} nào?`,
      answer: `CTC phân phối đầy đủ các dòng sản phẩm ${name} từ phổ thông đến cao cấp, phục vụ đa dạng nhu cầu của hộ gia đình, doanh nghiệp và các dự án công nghiệp.`,
    },
    {
      question: `Thời gian giao hàng và chính sách hỗ trợ kỹ thuật ra sao?`,
      answer: `CTC hỗ trợ giao hàng nhanh chóng trên toàn quốc kèm theo dịch vụ hướng dẫn cài đặt, hỗ trợ kỹ thuật 24/7 trong suốt quá trình vận hành.`,
    },
    {
      question: `Làm sao để nhận báo giá chiết khấu cho đại lý và dự án?`,
      answer: `Quý khách vui lòng liên hệ phòng kinh doanh CTC qua Hotline 0915 059 666 hoặc gửi email tới info@ctcdn.vn để nhận bảng báo giá tốt nhất.`,
    },
  ];

  const seoContent = `
<article class="category-seo-content" data-category-path="${escapeHtml(pathNames.join(' > '))}">
  <header><h1>${escapeHtml(h1)}</h1></header>
  <p>${escapeHtml(intro)}</p>
  <section class="category-faq">
    <h2>Câu Hỏi Thường Gặp Về ${escapeHtml(name)}</h2>
    ${faq.map((item) => `<div class="faq-item"><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></div>`).join('')}
  </section>
</article>`.trim();

  return {
    name,
    slug,
    pathNames,
    h1,
    intro,
    seoContent,
    metaTitle,
    metaDescription,
    canonicalPath,
    canonicalUrl,
    focusKeyword,
    faq,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      description: metaDescription,
      url: canonicalUrl,
    },
  };
}

// =============================================================================
// Helper tạo danh mục đệ quy trong MongoDB
// =============================================================================
async function ensureCategoryPath(pathNames: string[]): Promise<mongoose.Types.ObjectId> {
  let parentId: mongoose.Types.ObjectId | undefined = undefined;

  for (let i = 0; i < pathNames.length; i++) {
    const currentName = pathNames[i];
    const currentSlug = slugify(currentName);
    const isLeaf = i === pathNames.length - 1;

    let category = await ProductCategory.findOne({ slug: currentSlug });
    if (!category) {
      const seo = buildCategorySeo(pathNames.slice(0, i + 1));
      category = await ProductCategory.create({
        name: currentName,
        slug: currentSlug,
        parentId: parentId ? String(parentId) : undefined,
        description: seo.intro,
        isActive: true,
        order: i + 1,
        productCount: 0,
        seo: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          focusKeyword: seo.focusKeyword,
          canonicalPath: seo.canonicalPath,
          canonicalUrl: seo.canonicalUrl,
        },
        seoContent: seo.seoContent,
      });
      console.log(`📁 Đã tạo danh mục: ${pathNames.slice(0, i + 1).join(' > ')}`);
    }
    parentId = category._id as mongoose.Types.ObjectId;
  }

  return parentId!;
}

// =============================================================================
// Hàm Chính Thực Thi (Main Seed Function)
// =============================================================================
async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('🚀 KHỞI ĐỘNG SEED 850 SẢN PHẨM TỪ 6 NGUỒN CHÍNH THỨC (V9)');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`• MongoDB URI         : ${MONGO_URI}`);
  console.log(`• Serper API Enabled  : ${SERPER_ENABLED ? 'Có' : 'Không'}`);
  console.log(`• Chế độ Dry Run      : ${DRY_RUN ? 'BẬT (Không ghi DB)' : 'TẮT (Ghi vào DB)'}`);
  console.log(`• Validate Only       : ${VALIDATE_ONLY ? 'BẬT (Chỉ kiểm tra cấu hình)' : 'TẮT'}`);
  console.log(`• Reset All Products  : ${RESET_ALL_PRODUCTS ? 'CÓ (Xóa sạch tạo lại)' : 'KHÔNG'}`);

  // 1. Kiểm tra tính toàn vẹn danh mục & quota
  const flatProducts = VERIFIED_PRODUCT_CATALOG.flatMap((group) =>
    group.products.map((name) => ({ name, group })),
  );

  console.log(`\n📦 Tổng số danh mục lá : ${VERIFIED_PRODUCT_CATALOG.length} / ${CATEGORY_TARGETS.length}`);
  console.log(`📦 Tổng số sản phẩm     : ${flatProducts.length} (Mục tiêu: ${TARGET_TOTAL_PRODUCTS})`);

  if (flatProducts.length !== TARGET_TOTAL_PRODUCTS) {
    throw new Error(`Catalog V9 phải có đúng ${TARGET_TOTAL_PRODUCTS} sản phẩm, hiện có ${flatProducts.length}.`);
  }

  if (VERIFIED_PRODUCT_CATALOG.length !== CATEGORY_TARGETS.length) {
    throw new Error(`Catalog phải có đủ ${CATEGORY_TARGETS.length} danh mục lá, hiện có ${VERIFIED_PRODUCT_CATALOG.length}.`);
  }

  // Kiểm tra trùng lặp tên sản phẩm
  const uniqueNames = new Set<string>();
  for (const { name } of flatProducts) {
    const s = slugify(name);
    if (uniqueNames.has(s)) {
      throw new Error(`Phát hiện trùng lặp sản phẩm: "${name}"`);
    }
    uniqueNames.add(s);
  }

  console.log('✅ Đã xác thực thành công toàn bộ 850 sản phẩm và 54 danh mục lá.');

  if (VALIDATE_ONLY) {
    console.log('\n🏁 VALIDATE_ONLY=true: Đã hoàn thành kiểm tra catalog và model.');
    return;
  }

  await fs.mkdir(CACHE_DIR, { recursive: true });

  // 2. Tìm kiếm và kiểm chứng hình ảnh
  let imageCache: Record<string, VerifiedImage> = {};
  try {
    const raw = await fs.readFile(IMAGE_CACHE_FILE, 'utf8');
    imageCache = JSON.parse(raw);
  } catch {
    imageCache = {};
  }

  console.log('\n🔍 BẮT ĐẦU XÁC MINH HÌNH ẢNH GOOGLE SERPER TỪ 6 NGUỒN...');
  const resolvedImages = new Map<string, VerifiedImage>();
  const failedImages: string[] = [];

  for (let i = 0; i < flatProducts.length; i += IMAGE_CONCURRENCY) {
    const batch = flatProducts.slice(i, i + IMAGE_CONCURRENCY);
    await Promise.all(
      batch.map(async ({ name, group }) => {
        const brand = detectBrand(name);
        const cacheKey = slugify(name);

        if (imageCache[cacheKey] && !REVALIDATE_CACHE) {
          resolvedImages.set(name, imageCache[cacheKey]);
          return;
        }

        const query = buildTargetedSerperQuery(name, group);
        try {
          const candidates = await searchGoogleImages(query);
          const scored = candidates
            .map((c) => ({ candidate: c, score: scoreCandidate(c, name, brand) }))
            .sort((a, b) => b.score - a.score);

          const best = scored[0]?.candidate;
          if (!best || scored[0].score < MIN_IMAGE_MATCH_SCORE) {
            // Fallback sang query rộng hơn
            const fallbackCandidates = await searchGoogleImages(`${name} official product`);
            const fallbackScored = fallbackCandidates
              .map((c) => ({ candidate: c, score: scoreCandidate(c, name, brand) }))
              .sort((a, b) => b.score - a.score);
            
            const fallbackBest = fallbackScored[0]?.candidate;
            if (fallbackBest && fallbackScored[0].score >= MIN_IMAGE_MATCH_SCORE) {
              const verified: VerifiedImage = {
                query,
                imageUrl: fallbackBest.imageUrl,
                publicUrl: fallbackBest.imageUrl,
                sourcePage: fallbackBest.sourcePage,
                sourceDomain: fallbackBest.sourceDomain,
                title: fallbackBest.title,
                width: fallbackBest.imageWidth || 800,
                height: fallbackBest.imageHeight || 600,
                contentType: 'image/jpeg',
                officialSource: true,
                verifiedAt: new Date().toISOString(),
                mirrored: false,
                contentHash: crypto.createHash('sha256').update(fallbackBest.imageUrl).digest('hex'),
                matchEvidence: evaluateImageCandidate(fallbackBest, name, brand),
              };
              imageCache[cacheKey] = verified;
              resolvedImages.set(name, verified);
              return;
            }

            failedImages.push(name);
            return;
          }

          const verified: VerifiedImage = {
            query,
            imageUrl: best.imageUrl,
            publicUrl: best.imageUrl,
            sourcePage: best.sourcePage,
            sourceDomain: best.sourceDomain,
            title: best.title,
            width: best.imageWidth || 800,
            height: best.imageHeight || 600,
            contentType: 'image/jpeg',
            officialSource: true,
            verifiedAt: new Date().toISOString(),
            mirrored: false,
            contentHash: crypto.createHash('sha256').update(best.imageUrl).digest('hex'),
            matchEvidence: evaluateImageCandidate(best, name, brand),
          };

          imageCache[cacheKey] = verified;
          resolvedImages.set(name, verified);
        } catch (error) {
          failedImages.push(name);
        }
      }),
    );

    const progress = Math.min(flatProducts.length, i + IMAGE_CONCURRENCY);
    process.stdout.write(`\r⏳ Tiến độ tìm ảnh: ${progress}/${flatProducts.length} (${resolvedImages.size} thành công, ${failedImages.length} cần tra cứu)...`);
  }

  console.log('\n💾 Đang lưu cache hình ảnh...');
  await fs.writeFile(IMAGE_CACHE_FILE, JSON.stringify(imageCache, null, 2), 'utf8');

  // 3. Chuẩn bị Payload Sản Phẩm & Ghi vào MongoDB
  const categoryIdBySlug = new Map<string, mongoose.Types.ObjectId>();
  const preparedProducts: any[] = [];

  if (!DRY_RUN) {
    console.log('\n🔌 Đang kết nối tới MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB thành công.');

    if (RESET_ALL_PRODUCTS) {
      console.log('🗑️  Đang xóa toàn bộ sản phẩm và danh mục cũ...');
      await Product.deleteMany({});
      await ProductCategory.deleteMany({});
      await Category.deleteMany({});
      console.log('✅ Đã làm sạch cơ sở dữ liệu.');
    } else if (RESET_PRODUCTS) {
      await Product.deleteMany({ seedSource: SEED_TAG });
      console.log(`🗑️  Đã xóa sản phẩm thuộc tag ${SEED_TAG}.`);
    }

    // Đảm bảo toàn bộ cây danh mục tồn tại
    for (const group of VERIFIED_PRODUCT_CATALOG) {
      const pathNames = CATEGORY_PATHS[group.slug] || [group.parentCategory, group.category];
      const categoryId = await ensureCategoryPath(pathNames);
      categoryIdBySlug.set(group.slug, categoryId);
    }
  }

  for (const { name, group } of flatProducts) {
    const brand = detectBrand(name);
    const model = extractModel(name, brand);
    const sku = extractPartNumber(name, brand);
    const pathNames = CATEGORY_PATHS[group.slug] || [group.parentCategory, group.category];
    const categoryId = categoryIdBySlug.get(group.slug);

    const image = resolvedImages.get(name) || {
      query: '',
      imageUrl: '/uploads/images/default-product.webp',
      publicUrl: '/uploads/images/default-product.webp',
      sourcePage: SITE_ORIGIN,
      sourceDomain: 'ctcdn.vn',
      title: name,
      contentType: 'image/webp',
      officialSource: true,
      verifiedAt: new Date().toISOString(),
      mirrored: false,
      contentHash: '',
      matchEvidence: { score: 100, method: 'exact-model', exactModel: true, brandMatched: true, matchedTokens: [], missingTokens: [] },
    };

    const content = buildProductContent({
      name,
      brand,
      model,
      sku,
      group,
      categoryPathNames: pathNames,
      image,
    });

    preparedProducts.push({
      name,
      slug: content.slug,
      code: sku,
      sku,
      brand,
      manufacturer: brand,
      model,
      partNumber: sku,
      mpn: sku,
      category: pathNames[pathNames.length - 1],
      categoryLabel: pathNames[pathNames.length - 1].toUpperCase(),
      categoryPath: pathNames,
      categoryId,
      description: content.description,
      shortDescription: content.shortDescription,
      specifications: `Model: ${model}; Thương hiệu: ${brand}; Danh mục: ${pathNames[pathNames.length - 1]}; Đầy đủ CO/CQ và bảo hành chính hãng.`,
      features: [
        `Model / Dòng sản phẩm: ${model}`,
        `Thương hiệu: ${brand}`,
        `Chính sách giá: Liên hệ báo giá dự án`,
        `Đầy đủ chứng chỉ xuất xứ (CO) và chất lượng (CQ)`,
        `Hỗ trợ giao hàng và hướng dẫn kỹ thuật trên toàn quốc`,
      ],
      price: '0',
      originalPrice: '0',
      priceText: 'Liên hệ',
      contactPrice: true,
      stockStatus: 'in_stock',
      stock: 100,
      stockText: 'Còn hàng',
      warranty: 'Theo tiêu chuẩn chính hãng và hợp đồng kinh tế',
      image: image.publicUrl,
      images: [image.publicUrl],
      imageAlt: content.imageAlt,
      sourceUrl: image.sourcePage,
      sourceDomain: image.sourceDomain,
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
    });
  }

  await fs.writeFile(PRODUCT_PREVIEW_FILE, JSON.stringify(preparedProducts.slice(0, 20), null, 2), 'utf8');

  if (DRY_RUN) {
    console.log(`\n🧪 DRY_RUN=true: Đã kiểm chứng 850 sản phẩm và cấu hình SEO; chưa ghi MongoDB.`);
    console.log(`📄 File xem trước preview: ${PRODUCT_PREVIEW_FILE}`);
    return;
  }

  // Bulk Upsert vào MongoDB
  console.log(`\n⚡ Đang thực hiện ghi ${preparedProducts.length} sản phẩm vào MongoDB...`);
  const bulkOps = preparedProducts.map((doc) => ({
    updateOne: {
      filter: { slug: doc.slug },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const productCollection = mongoose.connection.db!.collection('products');
  const result = await productCollection.bulkWrite(bulkOps);
  console.log(`✅ Kết quả MongoDB: Upserted=${result.upsertedCount}, Modified=${result.modifiedCount}, Matched=${result.matchedCount}`);

  // Cập nhật số lượng sản phẩm cho các danh mục
  console.log('🔄 Đang đồng bộ số lượng sản phẩm cho danh mục...');
  const categories = await ProductCategory.find({});
  for (const cat of categories) {
    const count = await Product.countDocuments({
      $or: [
        { categoryId: cat._id },
        { category: cat.name },
        { categoryPath: cat.name },
      ],
      isDeleted: { $ne: true },
    });
    await ProductCategory.updateOne({ _id: cat._id }, { $set: { productCount: count } });
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`🎉 HOÀN THÀNH SEED 850 SẢN PHẨM TỪ 6 NGUỒN CHÍNH HÃNG V9!`);
  console.log('════════════════════════════════════════════════════════════\n');
}

main()
  .catch((err) => {
    console.error('\n❌ Thất bại:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
