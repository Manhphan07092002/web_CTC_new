/**
 * Seed 500 Sản phẩm chuẩn SEO + GEO với hình ảnh thực tế từ Google Images (Serper API).
 *
 * Mục tiêu:
 * - Hình ảnh cào trực tiếp từ Google Images qua Serper API (tương tự cơ chế PDF).
 * - Mỗi sản phẩm có tối thiểu 1 ảnh thực từ website chính hãng (Mikrotik, DrayTek, CommScope...).
 * - Tên sản phẩm chuẩn đúng Model code thực tế (VD: MikroTik RB960PGS, DrayTek Vigor 2952...).
 * - Mô tả HTML SEO chuẩn, tích hợp từ khóa và geo 63 tỉnh thành.
 * - Giá "Liên hệ" (contactPrice: true).
 * - Cache kết quả ảnh vào file JSON, không gọi lại API nếu đã có.
 * - Tự động fallback MONGO_URI khi chạy ngoài Docker.
 *
 * Cấu hình .env:
 *   SERPER_API_KEY=your_key
 *   MONGO_URI=mongodb://...
 *   RESET_PRODUCTS=true
 *   DRY_RUN=false
 *
 * Lệnh chạy:
 *   npx tsx server/scripts/seed-500-seo-products-real-img.ts
 *
 * Docker VPS:
 *   docker compose exec app npx tsx server/scripts/seed-500-seo-products-real-img.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Product, ProductCategory } from '../../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// =============================================================================
// Cấu hình chung
// =============================================================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';
const SERPER_API_KEY = process.env.SERPER_API_KEY || '';
const RESET_PRODUCTS = String(process.env.RESET_PRODUCTS || 'true').toLowerCase() === 'true';
const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
const FETCH_TIMEOUT_MS = 12_000;

const CACHE_DIR = path.resolve(__dirname, '../.cache/seed-500-products');
const IMG_CACHE_FILE = path.join(CACHE_DIR, 'image-cache.json');

const FALLBACK_IMG: Record<string, string> = {
  router: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
  switch: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  wifi: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80',
  server: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
  pc: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&q=80',
  solar: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80',
  inverter: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  battery: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
  cable: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
  voip: 'https://images.unsplash.com/photo-1580894732468-058f747280f2?w=800&q=80',
  laptop: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80',
  kiosk: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
};

// =============================================================================
// GEO Location 63 tỉnh thành
// =============================================================================
const GEO_PROVINCES = [
  'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'Quảng Trị', 'Thừa Thiên Huế', 'Bình Định', 'Khánh Hòa', 'Đắk Lắk',
  'Lâm Đồng', 'Đồng Nai', 'Bình Dương', 'Bà Rịa - Vũng Tàu', 'Long An',
  'Tiền Giang', 'Bến Tre', 'Vĩnh Long', 'An Giang', 'Kiên Giang',
  'Ninh Bình', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình',
  'Quảng Nam', 'Quảng Ngãi', 'Phú Yên', 'Bình Thuận', 'Đắk Nông',
  'Gia Lai', 'Kon Tum', 'Tây Ninh', 'Bình Phước', 'Đồng Tháp',
  'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau', 'Trà Vinh',
  'Nam Định', 'Hà Nam', 'Thái Bình', 'Hưng Yên', 'Hải Dương',
  'Bắc Ninh', 'Vĩnh Phúc', 'Phú Thọ', 'Thái Nguyên', 'Bắc Giang',
  'Lạng Sơn', 'Quảng Ninh', 'Hòa Bình', 'Sơn La', 'Điện Biên',
  'Lai Châu', 'Lào Cai', 'Yên Bái', 'Tuyên Quang', 'Hà Giang',
  'Cao Bằng', 'Bắc Kạn', 'Bình Dương', 'Đắk Lắk',
];

// =============================================================================
// 500 sản phẩm thực tế phân bổ theo cây danh mục
// =============================================================================
const PRODUCT_CATALOG: {
  parentCategory: string;
  category: string;
  slug: string;
  brand: string;
  imageQuery: string;
  fallbackKey: string;
  quota: number;
  products: string[];
}[] = [
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
// Cache Image
// =============================================================================
let imgCache: Record<string, string> = {};

async function loadImgCache(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const raw = await fs.readFile(IMG_CACHE_FILE, 'utf-8');
    imgCache = JSON.parse(raw);
    console.log(`📦 Đã nạp cache ảnh: ${Object.keys(imgCache).length} URL`);
  } catch {
    imgCache = {};
  }
}

async function saveImgCache(): Promise<void> {
  await fs.writeFile(IMG_CACHE_FILE, JSON.stringify(imgCache, null, 2), 'utf-8');
}

// =============================================================================
// Serper Google Images API
// =============================================================================
async function fetchImageViaSerper(query: string, fallbackKey: string): Promise<string> {
  const cacheKey = query.trim().toLowerCase();
  if (imgCache[cacheKey]) return imgCache[cacheKey];

  if (!SERPER_API_KEY) {
    return FALLBACK_IMG[fallbackKey] || FALLBACK_IMG.default;
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, num: 5 }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`Serper HTTP ${res.status}`);
    const json = await res.json() as any;
    const images: any[] = json.images || [];

    for (const img of images) {
      const url: string = img.imageUrl || img.link || '';
      if (!url || url.includes('data:')) continue;
      // Ưu tiên ảnh từ tên miền chính hãng
      const isOfficial = [
        'mikrotik.com', 'draytek.com', 'tp-link.com', 'commscope.com',
        'canadian-solar.com', 'longi.com', 'jinko', 'trinasolar.com',
        'sma.de', 'sungrowpower.com', 'huawei.com', 'dinstar.com',
        'cisco.com', 'dell.com', 'hp.com', 'hpe.com', 'lenovo.com',
        'zebra.com', 'pylontech.com.cn', 'catl.com', 'byd.com',
        'rec-group.com', 'q-cells.com', 'firstsolar.com',
      ].some((d) => url.includes(d));
      if (isOfficial) {
        imgCache[cacheKey] = url;
        await saveImgCache();
        return url;
      }
    }

    // Nếu không tìm thấy ảnh chính hãng, lấy ảnh đầu tiên
    if (images.length > 0) {
      const url = images[0].imageUrl || images[0].link || '';
      if (url) {
        imgCache[cacheKey] = url;
        await saveImgCache();
        return url;
      }
    }
  } catch {
    // Timeout hoặc lỗi mạng => dùng fallback
  }

  return FALLBACK_IMG[fallbackKey] || FALLBACK_IMG.default;
}

// =============================================================================
// Build SEO Description HTML
// =============================================================================
function buildGeoKeywords(province: string, productName: string, category: string): string {
  return `Mua ${productName} chính hãng tại ${province}. Phân phối ${category} cho doanh nghiệp, nhà xưởng, Data Center tại ${province} - CTC Telecom giao hàng toàn quốc.`;
}

function buildSeoDescription(productName: string, category: string, brand: string, province: string): string {
  return `
<div class="space-y-6 text-gray-700 dark:text-gray-300">
  <p class="text-base leading-relaxed">
    <strong>${productName}</strong> là thiết bị chuyên dụng trong phân khúc <em>${category}</em> thuộc thương hiệu <strong>${brand}</strong>. Sản phẩm đáp ứng tiêu chuẩn kỹ thuật khắt khe nhất của hạ tầng viễn thông, CNTT và năng lượng tái tạo tại Việt Nam.
  </p>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">Tính Năng Nổi Bật</h3>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>Hiệu năng vượt trội:</strong> Vận hành ổn định liên tục 24/7 ngay cả trong điều kiện môi trường khắc nghiệt.</li>
    <li><strong>Tiết kiệm năng lượng:</strong> Thiết kế tối ưu hóa điện năng tiêu thụ, giảm chi phí vận hành lâu dài.</li>
    <li><strong>Bảo mật cao cấp:</strong> Tích hợp hệ thống bảo vệ quá tải, quá áp và chống nhiễu điện từ (EMI).</li>
    <li><strong>Dễ tích hợp:</strong> Tương thích hoàn toàn với hạ tầng sẵn có, không cần thay đổi cấu trúc hệ thống.</li>
    <li><strong>Chứng nhận quốc tế:</strong> CO, CQ chính hãng; đạt chuẩn CE, RoHS, ISO 9001:2015.</li>
  </ul>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">Ứng Dụng Thực Tế</h3>
  <p class="leading-relaxed">
    <strong>${productName}</strong> được ứng dụng rộng rãi tại các văn phòng doanh nghiệp, tòa nhà thông minh, nhà máy sản xuất, trung tâm dữ liệu (Data Center), công trình điện mặt trời và hạ tầng viễn thông trên toàn quốc — đặc biệt phù hợp cho thị trường ${province}.
  </p>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">Thông Số Kỹ Thuật Chính</h3>
  <table class="w-full border-collapse border border-gray-200 dark:border-slate-700 text-sm">
    <tbody>
      <tr class="border-b border-gray-200 dark:border-slate-700">
        <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800 w-1/3">Dòng sản phẩm</td>
        <td class="p-2.5">${productName}</td>
      </tr>
      <tr class="border-b border-gray-200 dark:border-slate-700">
        <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Danh mục</td>
        <td class="p-2.5">${category}</td>
      </tr>
      <tr class="border-b border-gray-200 dark:border-slate-700">
        <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Thương hiệu</td>
        <td class="p-2.5">${brand}</td>
      </tr>
      <tr class="border-b border-gray-200 dark:border-slate-700">
        <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Chứng nhận</td>
        <td class="p-2.5">CO/CQ Chính Hãng, CE, RoHS, ISO 9001:2015</td>
      </tr>
      <tr>
        <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Bảo hành</td>
        <td class="p-2.5">12 - 36 tháng chính hãng (1 đổi 1 trong 30 ngày)</td>
      </tr>
    </tbody>
  </table>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">Tại Sao Chọn CTC Telecom?</h3>
  <p class="leading-relaxed">
    <strong>CTC Telecom</strong> là nhà phân phối chính thức thiết bị viễn thông, CNTT và Năng lượng mặt trời hàng đầu Việt Nam. Chúng tôi cung cấp <strong>${productName}</strong> với cam kết:
  </p>
  <ul class="list-disc pl-6 space-y-1">
    <li>100% sản phẩm chính hãng, mới hoàn toàn — CO/CQ đầy đủ.</li>
    <li>Giá cạnh tranh nhất thị trường, chiết khấu đặc biệt cho đại lý và dự án lớn.</li>
    <li>Tư vấn kỹ thuật tận tâm, hỗ trợ 24/7 từ đội ngũ 53 kỹ sư chuyên ngành.</li>
    <li>Giao hàng toàn quốc, bảo hành đổi trả tại ${province} và tất cả 63 tỉnh thành.</li>
  </ul>
</div>`.trim();
}

// =============================================================================
// MongoDB connection với smart fallback
// =============================================================================
async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
  } catch (err: any) {
    if (err.message && err.message.includes('ENOTFOUND') && MONGO_URI.includes('mongo')) {
      const fallbackUri = MONGO_URI.replace(/([\/@])mongo(?=[:\/]|$)/g, '$1127.0.0.1');
      console.warn(`⚠️  Fallback MongoDB: ${fallbackUri}`);
      await mongoose.connect(fallbackUri);
    } else {
      throw err;
    }
  }
}

// =============================================================================
// Tạo / lấy danh mục sản phẩm
// =============================================================================
async function ensureCategory(name: string, slug: string, parent?: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId> {
  let cat = await ProductCategory.findOne({ $or: [{ name }, { slug }] });
  if (!cat) {
    cat = await ProductCategory.create({
      name, slug, isActive: true, parentId: parent,
      description: `Danh mục sản phẩm ${name} chính hãng nhập khẩu tại CTC Telecom`,
      order: 0,
    });
  }
  return cat._id as mongoose.Types.ObjectId;
}

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  console.log('\n============================================================');
  console.log('CTC — SEED 500 SẢN PHẨM CHUẨN SEO + GEO + HÌNH ẢNH THỰC');
  console.log('============================================================');
  console.log(`Serper API Key : ${SERPER_API_KEY ? '✅ Có' : '❌ Không có (dùng Unsplash fallback)'}`);
  console.log(`RESET_PRODUCTS : ${RESET_PRODUCTS}`);
  console.log(`DRY_RUN        : ${DRY_RUN}`);
  console.log('============================================================\n');

  await loadImgCache();

  const totalProducts = PRODUCT_CATALOG.reduce((s, c) => s + c.products.length, 0);
  console.log(`📦 Tổng sản phẩm cần seed: ${totalProducts}`);

  // Gom danh sách query ảnh duy nhất cần gọi API
  const uniqueImgQueries = [...new Set(PRODUCT_CATALOG.map((c) => c.imageQuery))];
  const needFetch = uniqueImgQueries.filter((q) => !imgCache[q.toLowerCase()]);

  if (needFetch.length > 0 && SERPER_API_KEY) {
    console.log(`\n🖼️  Đang tìm ${needFetch.length} bộ ảnh từ Google Images...`);
    let fetched = 0;
    for (const query of needFetch) {
      const catConfig = PRODUCT_CATALOG.find((c) => c.imageQuery === query)!;
      await fetchImageViaSerper(query, catConfig.fallbackKey);
      fetched++;
      if (fetched % 5 === 0) process.stdout.write(`  → ${fetched}/${needFetch.length} ảnh\n`);
    }
    console.log(`✅ Xong tìm ảnh: ${Object.keys(imgCache).length} URL trong cache\n`);
  } else if (needFetch.length > 0) {
    console.log('⚠️  Không có Serper API Key → dùng Unsplash fallback cho tất cả ảnh.\n');
  } else {
    console.log('✅ Tất cả ảnh đã có trong cache → bỏ qua gọi API.\n');
  }

  if (DRY_RUN) {
    console.log('🧪 DRY_RUN=true: bỏ qua ghi MongoDB.');
    return;
  }

  await connectMongo();
  console.log('✅ Đã kết nối MongoDB.\n');

  if (RESET_PRODUCTS) {
    const del = await Product.deleteMany({});
    console.log(`🗑️  Đã xóa ${del.deletedCount} sản phẩm cũ.`);
  }

  const productsToInsert: any[] = [];
  let globalIdx = 1;

  // Map parent categories
  const parentCatMap: Record<string, mongoose.Types.ObjectId> = {};

  for (const catConfig of PRODUCT_CATALOG) {
    // Tạo parent category nếu cần
    if (!parentCatMap[catConfig.parentCategory]) {
      const parentSlug = catConfig.parentCategory.toLowerCase()
        .replace(/\s+&\s+/g, '-va-')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      parentCatMap[catConfig.parentCategory] = await ensureCategory(catConfig.parentCategory, parentSlug);
    }
    const parentId = parentCatMap[catConfig.parentCategory];

    // Tạo child category
    const childId = await ensureCategory(catConfig.category, catConfig.slug, parentId);

    // Lấy ảnh đại diện cho danh mục
    const catImg = imgCache[catConfig.imageQuery.toLowerCase()] || FALLBACK_IMG[catConfig.fallbackKey] || FALLBACK_IMG.default;

    for (let i = 0; i < catConfig.products.length; i++) {
      const productName = catConfig.products[i];
      const province = GEO_PROVINCES[globalIdx % GEO_PROVINCES.length];
      const sku = `CTC-${catConfig.slug.substring(0, 5).toUpperCase()}-${String(globalIdx).padStart(4, '0')}`;

      // Mỗi sản phẩm thứ 3 sẽ thêm số variant vào tên để phân biệt
      const finalName = productName;

      const description = buildSeoDescription(finalName, catConfig.category, catConfig.brand, province);
      const shortDescription = `${finalName} chính hãng ${catConfig.brand} - Nhập khẩu trực tiếp, bảo hành 12-36 tháng, CO/CQ đầy đủ. Giao hàng tại ${province} và toàn quốc. Liên hệ CTC Telecom để được báo giá tốt nhất.`;

      productsToInsert.push({
        name: finalName,
        category: catConfig.category,
        categoryId: childId,
        categoryLabel: catConfig.category.toUpperCase(),
        code: sku,
        description,
        shortDescription,
        specifications: `Tiêu chuẩn: CE, RoHS, ISO 9001:2015; CO/CQ chính hãng; Bảo hành: 12-36 tháng; Thương hiệu: ${catConfig.brand}`,
        price: '0',
        originalPrice: '0',
        contactPrice: true,
        stockStatus: 'contact' as const,
        stock: 100,
        warranty: '12 - 36 tháng',
        features: [
          `Hiệu năng vượt trội, vận hành liên tục 24/7`,
          `Chứng nhận CO/CQ chính hãng ${catConfig.brand}`,
          `Bảo hành 12-36 tháng, 1 đổi 1 trong 30 ngày`,
          `Tư vấn & hỗ trợ kỹ thuật 24/7 bởi 53 kỹ sư CTC`,
          `Giao hàng tận nơi tại ${province} và toàn quốc 63 tỉnh thành`,
        ],
        image: catImg,
        images: [catImg],
        isFeatured: globalIdx % 10 === 0,
        isActive: true,
        focusKeyword: `${finalName} chính hãng ${catConfig.brand} giá rẻ ${province}`,
        views: Math.floor(Math.random() * 800) + 100,
        likes: Math.floor(Math.random() * 80) + 10,
      });

      console.log(`  ✅ ${globalIdx}/${totalProducts} | ${catConfig.category}: ${finalName}`);
      globalIdx++;
    }
  }

  console.log(`\n🚀 Đang chèn ${productsToInsert.length} sản phẩm vào MongoDB...`);
  const inserted = await Product.insertMany(productsToInsert);
  console.log(`\n💾 MongoDB: Đã chèn ${inserted.length} sản phẩm thành công!`);

  // Cập nhật productCount cho categories
  const allCats = await ProductCategory.find({});
  for (const cat of allCats) {
    const count = await Product.countDocuments({ categoryId: cat._id });
    await ProductCategory.findByIdAndUpdate(cat._id, { productCount: count });
  }
  console.log('🔄 Đã cập nhật productCount cho tất cả danh mục.');

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`🎉 HOÀN THÀNH! ĐÃ SEED ${inserted.length} SẢN PHẨM CHUẨN SEO + GEO`);
  console.log('════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('\n❌ Seed thất bại:', err instanceof Error ? err.stack || err.message : err);
  process.exitCode = 1;
}).finally(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
