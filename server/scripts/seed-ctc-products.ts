/**
 * Seed CTC Products & Categories
 * Dữ liệu mẫu dựa theo hồ sơ năng lực thực tế của CTC (company_profile.json)
 * 5 Danh mục | 10 Sản phẩm
 * 
 * Lĩnh vực CTC:
 *   - Viễn thông: BTS, Cáp quang, OSP, Anten
 *   - CNTT & Data Center: Camera AI, Server, Network
 *   - Năng lượng mặt trời: Tấm pin, Inverter (Rooftop / C&I / EPC)
 *   - Điện gió: Trụ đo gió, Cáp trung thế Wind
 *   - Hạ tầng & Xây dựng: Máy biến áp, Tủ điện trung thế
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ProductCategory, Product } from '../../models';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

// ─────────────────────────────────────────────────────────
// 5 PRODUCT CATEGORIES – theo lĩnh vực hoạt động của CTC
// ─────────────────────────────────────────────────────────
const ctcCategories = [
  {
    name: 'Thiết Bị Viễn Thông',
    slug: 'thiet-bi-vien-thong',
    description: 'Cột BTS, cáp quang, thiết bị hạ tầng mạng viễn thông chuyên dụng',
    icon: 'Radio',
    color: '#3B82F6',
    order: 1
  },
  {
    name: 'Thiết Bị CNTT & Data Center',
    slug: 'thiet-bi-cntt-data-center',
    description: 'Camera AI, server, thiết bị mạng, bảo mật và trung tâm dữ liệu',
    icon: 'Server',
    color: '#8B5CF6',
    order: 2
  },
  {
    name: 'Thiết Bị Điện Mặt Trời',
    slug: 'thiet-bi-dien-mat-troi',
    description: 'Tấm pin năng lượng mặt trời, inverter, phụ kiện EPC Solar',
    icon: 'Sun',
    color: '#F59E0B',
    order: 3
  },
  {
    name: 'Thiết Bị Điện Gió',
    slug: 'thiet-bi-dien-gio',
    description: 'Trụ đo gió Met Mast, cáp trung thế, thiết bị đấu nối wind farm',
    icon: 'Wind',
    color: '#10B981',
    order: 4
  },
  {
    name: 'Hạ Tầng & Trạm Điện',
    slug: 'ha-tang-tram-dien',
    description: 'Máy biến áp, tủ điện trung thế, thiết bị xây dựng hạ tầng kỹ thuật',
    icon: 'Zap',
    color: '#EF4444',
    order: 5
  }
];

// ─────────────────────────────────────────────────────────
// 10 SAMPLE PRODUCTS – 2 sản phẩm / danh mục
// ─────────────────────────────────────────────────────────
const ctcProducts = [

  // ── VIỄN THÔNG ─────────────────────────────────────────
  {
    name: 'Cột Anten BTS Đơn Cực (Monopole) 30m',
    code: 'CTC-VT-MONO-30',
    category: 'Thiết Bị Viễn Thông',
    categoryLabel: 'VIỄN THÔNG',
    description: 'Cột anten BTS đơn cực (Monopole) cao 30m được sản xuất từ thép mạ kẽm nhúng nóng chất lượng cao, tuân thủ tiêu chuẩn TCVN và TIA-222-H. Phù hợp triển khai trạm BTS cho Viettel, Mobifone, VNPT tại khu vực đô thị và ngoại thành. CTC đã thi công lắp đặt hơn 200 cột anten các loại trên toàn miền Trung.',
    shortDescription: 'Cột Monopole 30m thép mạ kẽm, tiêu chuẩn TIA-222-H, phù hợp triển khai BTS 4G/5G',
    price: 'Liên hệ',
    contactPrice: true,
    image: '/images/products/monopole-30m.jpg',
    images: ['/images/products/monopole-30m.jpg', '/images/products/monopole-30m-2.jpg'],
    stockStatus: 'contact',
    warranty: '10 năm kết cấu',
    isFeatured: true,
    featuredOrder: 1,
    features: [
      'Thép mạ kẽm nhúng nóng chống ăn mòn',
      'Tuân thủ TIA-222-H / TCVN',
      'Tải trọng gió cấp 12 (135 km/h)',
      'Lắp đặt trọn gói, bàn giao nghiệm thu',
      'Bảo hành kết cấu 10 năm'
    ],
    technicalSpecs: {
      'Chiều cao': '30m',
      'Vật liệu': 'Thép A36 mạ kẽm nhúng nóng',
      'Tải trọng gió': 'Cấp 12 (135 km/h)',
      'Đường kính chân': '600mm',
      'Đường kính đỉnh': '250mm',
      'Tiêu chuẩn': 'TIA-222-H / TCVN 7555',
      'Bề mặt': 'Mạ kẽm nhúng nóng 86μm',
      'Tuổi thọ thiết kế': '25 năm'
    },
    specifications: 'Chiều cao 30m | Thép A36 mạ kẽm | Cấp gió 12 | Đường kính chân 600mm | Tiêu chuẩn TIA-222-H | Bảo hành 10 năm',
    isActive: true,
    stock: 0
  },

  {
    name: 'Cáp Quang Single-mode 96 Core G.652D',
    code: 'CTC-VT-CABLE-96SM',
    category: 'Thiết Bị Viễn Thông',
    categoryLabel: 'VIỄN THÔNG',
    description: 'Cáp quang single-mode 96 core tiêu chuẩn G.652D, vỏ bọc HDPE kép chống UV, phù hợp thi công ngoài trời (OSP – Outside Plant). CTC là đơn vị thi công hạ tầng cáp quang OSP cho Bộ Công an, VNPT Net và Mobifone, đảm bảo tiêu chuẩn kỹ thuật viễn thông quốc gia.',
    shortDescription: 'Cáp quang 96 core G.652D, vỏ HDPE chống UV, dùng cho OSP ngoài trời',
    price: 'Liên hệ',
    contactPrice: true,
    image: '/images/products/cap-quang-96-core.jpg',
    images: ['/images/products/cap-quang-96-core.jpg'],
    stockStatus: 'contact',
    warranty: '25 năm',
    isFeatured: true,
    featuredOrder: 2,
    features: [
      'Single-mode ITU-T G.652D',
      'Vỏ bọc HDPE kép chống UV',
      'Phù hợp chôn ngầm / treo cột OSP',
      'Suy hao thấp ≤0.20 dB/km tại 1550nm',
      'Tuổi thọ vận hành 25 năm'
    ],
    technicalSpecs: {
      'Số core': '96 core',
      'Tiêu chuẩn sợi': 'ITU-T G.652D (SMF)',
      'Suy hao 1310nm': '≤0.34 dB/km',
      'Suy hao 1550nm': '≤0.20 dB/km',
      'Băng thông': 'Không giới hạn (SM)',
      'Vỏ bọc': 'HDPE + PE kép',
      'Nhiệt độ vận hành': '-40°C đến +70°C',
      'Bán kính uốn': '≥280mm (vận hành)'
    },
    specifications: '96 core | G.652D SMF | Suy hao ≤0.20 dB/km | HDPE chống UV | Nhiệt độ -40 ~ +70°C | 25 năm tuổi thọ',
    isActive: true,
    stock: 500
  },

  // ── CNTT & DATA CENTER ─────────────────────────────────
  {
    name: 'Camera AI Giám Sát 4K Dahua IPC-HDW2849H',
    code: 'CTC-IT-CAM-4K-DH',
    category: 'Thiết Bị CNTT & Data Center',
    categoryLabel: 'CNTT & SECURITY',
    description: 'Camera IP AI Dahua 4K (8MP) dome gắn trần, tích hợp nhận dạng khuôn mặt và phát hiện xâm nhập thông minh. Phù hợp triển khai hệ thống giám sát an ninh cho khu công nghiệp, trung tâm dữ liệu, cơ quan nhà nước. CTC cung cấp dịch vụ tư vấn, lắp đặt và bảo trì hệ thống camera AI toàn diện.',
    shortDescription: 'Camera AI 4K (8MP) Dahua, nhận diện khuôn mặt, chống nước IP67',
    price: 'Liên hệ',
    contactPrice: true,
    image: '/images/products/camera-ai-dahua-4k.jpg',
    images: ['/images/products/camera-ai-dahua-4k.jpg'],
    stockStatus: 'in_stock',
    stock: 30,
    warranty: '2 năm',
    isFeatured: true,
    featuredOrder: 3,
    features: [
      'Độ phân giải 4K 8 Megapixel',
      'AI: nhận diện khuôn mặt, phát hiện xâm nhập',
      'Chống nước bụi IP67, chống đột nhập IK10',
      'Hồng ngoại ban đêm 30m',
      'Hỗ trợ H.265+, giảm băng thông 90%'
    ],
    technicalSpecs: {
      'Độ phân giải': '4K (3840×2160 / 8MP)',
      'Cảm biến': '1/2.7" CMOS',
      'Tầm nhìn đêm': '30m IR',
      'Chống nước': 'IP67 / IK10',
      'Nén video': 'H.265+ / H.264+',
      'AI tích hợp': 'Face Detection, IVS, SMD Plus',
      'Góc nhìn': '102° (2.8mm lens)',
      'Nguồn điện': 'PoE IEEE802.3af / 12V DC'
    },
    specifications: '8MP 4K | IR 30m | IP67 IK10 | H.265+ | AI Face Detection | PoE',
    isActive: true
  },

  {
    name: 'Server Dell PowerEdge R750 – Rack 2U',
    code: 'CTC-IT-SVR-R750',
    category: 'Thiết Bị CNTT & Data Center',
    categoryLabel: 'DATA CENTER',
    description: 'Server rack 2U Dell PowerEdge R750 cấu hình tiêu chuẩn Data Center, hỗ trợ 2x CPU Intel Xeon Scalable thế hệ 3, tối đa 6TB RAM DDR4, phù hợp triển khai ảo hóa VMware, ứng dụng ERP, hệ thống quản lý viễn thông. CTC cung cấp, cài đặt và bảo trì server cho các cơ quan nhà nước và doanh nghiệp.',
    shortDescription: 'Server rack 2U Dell R750, 2x Xeon, tối đa 6TB RAM, phù hợp Data Center',
    price: 'Liên hệ',
    contactPrice: true,
    image: '/images/products/dell-r750-server.jpg',
    images: ['/images/products/dell-r750-server.jpg'],
    stockStatus: 'contact',
    stock: 0,
    warranty: '3 năm onsite',
    isFeatured: false,
    features: [
      'Dual CPU Intel Xeon Scalable Gen.3',
      'RAM tối đa 6TB DDR4 3200MHz',
      'Lưu trữ NVMe / SAS RAID tích hợp',
      'iDRAC9 quản trị từ xa',
      'Bảo hành 3 năm onsite 24x7'
    ],
    technicalSpecs: {
      'Form factor': '2U Rack',
      'CPU': '2x Intel Xeon Scalable Gen.3 (tối đa 40 core mỗi CPU)',
      'RAM': 'Tối đa 6TB DDR4 (32 DIMM)',
      'Lưu trữ': 'Tối đa 24x NVMe hoặc 12x 3.5" SAS/SATA',
      'Card mạng': '4x 25GbE + 2x 10GbE tích hợp',
      'Nguồn điện': 'Hot-swap Redundant 800W/1100W Platinum',
      'Quản trị': 'iDRAC9 Enterprise',
      'OS hỗ trợ': 'Windows Server, Red Hat, VMware ESXi'
    },
    specifications: 'Rack 2U | Dual Xeon Gen.3 | RAM đến 6TB | NVMe Storage | iDRAC9 | Bảo hành 3 năm onsite',
    isActive: true
  },

  // ── ĐIỆN MẶT TRỜI ──────────────────────────────────────
  {
    name: 'Tấm Pin Jinko Solar Tiger Neo N-type 580W',
    code: 'CTC-SOLAR-JKO-580',
    category: 'Thiết Bị Điện Mặt Trời',
    categoryLabel: 'TẤM PIN SOLAR',
    description: 'Tấm pin năng lượng mặt trời Jinko Solar dòng Tiger Neo N-type TOPCon 580W, hiệu suất 22.02%, phù hợp lắp mái nhà và dự án C&I. CTC là đơn vị thi công EPC Solar uy tín tại miền Trung, đã lắp đặt hàng nghìn kWp cho doanh nghiệp và khu công nghiệp. Tấm pin thuộc Top 5 thế giới Tier 1 – đảm bảo độ bền và hiệu suất dài hạn.',
    shortDescription: 'Tấm pin Jinko Tiger Neo N-type 580W, hiệu suất 22.02%, bảo hành 30 năm công suất',
    price: 'Liên hệ',
    contactPrice: true,
    image: '/images/products/jinko-tiger-neo-580w.jpg',
    images: ['/images/products/jinko-tiger-neo-580w.jpg', '/images/products/jinko-tiger-neo-580w-2.jpg'],
    stockStatus: 'in_stock',
    stock: 200,
    power: 580,
    efficiency: 22.02,
    warranty: '30 năm công suất / 12 năm sản phẩm',
    isFeatured: true,
    featuredOrder: 4,
    features: [
      'Công nghệ N-type TOPCon thế hệ mới',
      'Hiệu suất 22.02% – Top đầu thị trường',
      'Suy giảm công suất năm đầu chỉ 1%',
      'Chịu đựng thời tiết khắc nghiệt IEC 61215',
      'Bảo hành công suất 30 năm – Jinko Solar Tier 1'
    ],
    technicalSpecs: {
      'Công suất danh định': '580W (STC)',
      'Công nghệ': 'N-type TOPCon',
      'Hiệu suất module': '22.02%',
      'Điện áp Voc': '49.50V',
      'Dòng điện Isc': '14.73A',
      'Kích thước': '2278 × 1134 × 30mm',
      'Trọng lượng': '28.8kg',
      'Bảo hành': '12 năm sản phẩm / 30 năm công suất',
      'Tiêu chuẩn': 'IEC 61215 / IEC 61730 / UL 61730'
    },
    specifications: '580W | N-type TOPCon | Hiệu suất 22.02% | 2278×1134mm | 28.8kg | BH 30 năm | IEC 61215',
    isActive: true
  },

  {
    name: 'Inverter 3 Pha Huawei SUN2000-100KTL-M2',
    code: 'CTC-SOLAR-HWI-100K',
    category: 'Thiết Bị Điện Mặt Trời',
    categoryLabel: 'INVERTER SOLAR',
    description: 'Bộ nghịch lưu hòa lưới 3 pha Huawei SUN2000-100KTL-M2 công suất 100kW, phù hợp triển khai dự án điện mặt trời C&I (Commercial & Industrial) và mái xưởng sản xuất. Hiệu suất tối đa 98.8%, tích hợp AI Boost giúp tối ưu sản lượng phát điện. CTC là đối tác EPC Solar ủy quyền của Huawei tại miền Trung.',
    shortDescription: 'Inverter Huawei 100kW 3 pha, hiệu suất 98.8%, AI Boost, phù hợp C&I Solar',
    price: 'Liên hệ',
    contactPrice: true,
    image: '/images/products/huawei-sun2000-100k.jpg',
    images: ['/images/products/huawei-sun2000-100k.jpg'],
    stockStatus: 'in_stock',
    stock: 10,
    power: 100,
    efficiency: 98.8,
    warranty: '10 năm (gia hạn được 25 năm)',
    isFeatured: true,
    featuredOrder: 5,
    features: [
      'Công suất AC 100kW, 3 pha 400V',
      'Hiệu suất tối đa 98.8%',
      'AI Boost – tối ưu sản lượng tự động',
      'Kết nối SmartLogger, giám sát 24/7',
      'IP66, hoạt động -25°C đến +60°C'
    ],
    technicalSpecs: {
      'Công suất AC': '100kW',
      'Điện áp đầu vào (DC)': '200–1500V',
      'Điện áp đầu ra (AC)': '3N~380/400V',
      'Hiệu suất tối đa': '98.8%',
      'Số dây MPPT': '10 MPPT',
      'Bảo vệ': 'IP66',
      'Nhiệt độ hoạt động': '-25°C đến +60°C',
      'Kết nối': 'RS485, PLC, MBUS',
      'Bảo hành': '10 năm (gia hạn đến 25 năm)'
    },
    specifications: '100kW 3 pha | 98.8% hiệu suất | 1500V DC | 10 MPPT | IP66 | AI Boost | Bảo hành 10 năm',
    isActive: true
  },

  // ── ĐIỆN GIÓ ───────────────────────────────────────────
  {
    name: 'Trụ Đo Gió Met Mast 80m – EPC Turnkey',
    code: 'CTC-WIND-MAST-80',
    category: 'Thiết Bị Điện Gió',
    categoryLabel: 'ĐIỆN GIÓ',
    description: 'Trụ đo gió thép (Meteorological Mast) cao 80m dạng dây néo chuyên dụng để khảo sát tài nguyên gió phục vụ phát triển dự án điện gió. CTC đã thi công lắp đặt Met Mast tại Điện Biên và các dự án điện gió Hướng Linh, Hướng Hiệp. Bao gồm: cột thép, neo dây, cảm biến gió, data logger, hệ thống chống sét.',
    shortDescription: 'Met Mast 80m khảo sát gió, bao gồm cảm biến, data logger, chống sét – EPC turnkey',
    price: 'Liên hệ',
    contactPrice: true,
    image: '/images/products/met-mast-80m.jpg',
    images: ['/images/products/met-mast-80m.jpg'],
    stockStatus: 'contact',
    stock: 0,
    warranty: '5 năm kết cấu',
    isFeatured: true,
    featuredOrder: 6,
    features: [
      'Cột thép dây néo cao 80m',
      'Cảm biến gió NRG / Thies Clima',
      'Data logger Campbell Scientific',
      'Hệ thống chống sét toàn diện',
      'Lắp đặt EPC trọn gói, có số liệu sau 12 tháng'
    ],
    technicalSpecs: {
      'Chiều cao': '80m',
      'Loại cột': 'Lattice tower dây néo',
      'Cảm biến': 'Anemometer NRG #40C, Wind vane NRG #200P',
      'Data logger': 'Campbell Scientific CR1000X',
      'Nguồn điện': 'Pin mặt trời 80W + ắc quy dự phòng',
      'Truyền dữ liệu': 'GPRS 4G realtime',
      'Chống sét': 'LPSD – Lightning Protection System Design',
      'Vật liệu cột': 'Thép mạ kẽm nhúng nóng'
    },
    specifications: 'Cột 80m dây néo | Cảm biến NRG | Logger Campbell | GPRS 4G | Chống sét | Thi công EPC trọn gói',
    isActive: true
  },

  {
    name: 'Cáp Trung Thế 22kV 3×240mm² XLPE/SWA/PVC',
    code: 'CTC-WIND-CABLE-22KV',
    category: 'Thiết Bị Điện Gió',
    categoryLabel: 'ĐIỆN GIÓ',
    description: 'Cáp điện trung thế 22kV 3 lõi 240mm² lõi nhôm bọc XLPE, giáp thép SWA, vỏ PVC dùng chôn trực tiếp dưới đất. Phù hợp thi công hệ thống đấu nối nội bộ trang trại điện gió, từ chân turbine đến trạm biến áp 110kV. CTC có kinh nghiệm thi công điện đường dây trung thế tại các wind farm Hướng Linh, Hướng Hiệp.',
    shortDescription: 'Cáp 22kV 3×240mm² XLPE chôn ngầm, dùng đấu nối nội bộ wind farm',
    price: 'Liên hệ',
    contactPrice: true,
    image: '/images/products/cap-22kv-240.jpg',
    images: ['/images/products/cap-22kv-240.jpg'],
    stockStatus: 'contact',
    stock: 0,
    warranty: '30 năm vật liệu',
    isFeatured: false,
    features: [
      'Điện áp 22kV, lõi nhôm 240mm²',
      'Cách điện XLPE chịu nhiệt 90°C',
      'Giáp thép SWA chống tác động cơ học',
      'Phù hợp chôn ngầm trực tiếp',
      'Tiêu chuẩn IEC 60502-2 / TCVN'
    ],
    technicalSpecs: {
      'Điện áp định mức': '22kV (Uo/U: 12.7/22kV)',
      'Tiết diện lõi': '3 × 240mm²',
      'Vật liệu lõi': 'Nhôm (Al) class 2 stranded',
      'Cách điện': 'XLPE (Cross-linked Polyethylene)',
      'Giáp bảo vệ': 'SWA – Steel Wire Armour',
      'Vỏ ngoài': 'PVC đen chịu UV',
      'Nhiệt độ vận hành': 'Liên tục 90°C / Ngắn mạch 250°C',
      'Tiêu chuẩn': 'IEC 60502-2 / TCVN 5934'
    },
    specifications: '22kV | 3×240mm² Al | XLPE | SWA | Chôn ngầm | IEC 60502-2 | 30 năm tuổi thọ',
    isActive: true
  },

  // ── HẠ TẦNG & TRẠM ĐIỆN ────────────────────────────────
  {
    name: 'Máy Biến Áp Phân Phối 3 Pha 500kVA 22/0.4kV',
    code: 'CTC-HA-MBA-500KVA',
    category: 'Hạ Tầng & Trạm Điện',
    categoryLabel: 'TRẠM ĐIỆN',
    description: 'Máy biến áp phân phối dầu 3 pha 500kVA, điện áp 22kV/0.4kV, tiêu chuẩn TCVN 6306 / IEC 60076. Phù hợp cấp nguồn điện cho khu công nghiệp, nhà xưởng, trang trại điện mặt trời. CTC có chứng chỉ năng lực thi công xây dựng Đường dây & Trạm biến áp hạng Bộ Xây dựng cấp, đã thi công nhiều trạm biến áp 22/110kV trên miền Trung.',
    shortDescription: 'MBA dầu 3 pha 500kVA 22/0.4kV TCVN 6306, phù hợp khu công nghiệp và Solar',
    price: 'Liên hệ',
    contactPrice: true,
    image: '/images/products/may-bien-ap-500kva.jpg',
    images: ['/images/products/may-bien-ap-500kva.jpg'],
    stockStatus: 'in_stock',
    stock: 5,
    warranty: '5 năm',
    isFeatured: true,
    featuredOrder: 7,
    features: [
      'Dầu cách điện tự nhiên, thân thiện môi trường',
      'Tổn hao không tải thấp (No-Load Loss)',
      'Vỏ hộp kín IP54, chống nước mưa',
      'Tiêu chuẩn TCVN 6306 / IEC 60076',
      'Bảo hành 5 năm, phụ tùng thay thế sẵn có'
    ],
    technicalSpecs: {
      'Công suất định mức': '500kVA',
      'Điện áp sơ cấp': '22kV (±5%)',
      'Điện áp thứ cấp': '0.4kV (400V)',
      'Tần số': '50Hz',
      'Tổ đấu dây': 'Dyn11 (3 pha)',
      'Tổn hao không tải': '≤750W',
      'Tổn hao ngắn mạch': '≤6500W',
      'Cấp bảo vệ vỏ': 'IP54',
      'Tiêu chuẩn': 'TCVN 6306 / IEC 60076-1'
    },
    specifications: '500kVA | 22/0.4kV | 50Hz | Dyn11 | IP54 | TCVN 6306 | Tổn hao ≤750W | Bảo hành 5 năm',
    isActive: true
  },

  {
    name: 'Tủ Điện Trung Thế RMU ABB SafeRing 24kV',
    code: 'CTC-HA-RMU-ABB-24',
    category: 'Hạ Tầng & Trạm Điện',
    categoryLabel: 'TRẠM ĐIỆN',
    description: 'Tủ đóng cắt trung thế Ring Main Unit (RMU) ABB SafeRing 24kV, cách điện SF6 kín hoàn toàn, thiết kế compact phù hợp lắp đặt trong trạm điện nội bộ khu công nghiệp, tòa nhà thương mại và dự án điện mặt trời đấu nối lưới. CTC có kinh nghiệm lắp đặt, vận hành và bảo trì tủ RMU tại nhiều dự án năng lượng và hạ tầng kỹ thuật.',
    shortDescription: 'Tủ RMU ABB SafeRing 24kV, SF6 kín, compact, phù hợp trạm nội bộ khu công nghiệp',
    price: 'Liên hệ',
    contactPrice: true,
    image: '/images/products/rmu-abb-safering-24kv.jpg',
    images: ['/images/products/rmu-abb-safering-24kv.jpg'],
    stockStatus: 'contact',
    stock: 0,
    warranty: '5 năm',
    isFeatured: false,
    features: [
      'Cách điện khí SF6 kín hoàn toàn',
      'Thiết kế compact, lắp đặt nhanh',
      'Không cần bảo trì SF6 (maintenance-free)',
      'Điện áp 24kV, dòng điện định mức 630A',
      'ABB – thương hiệu hàng đầu Thụy Sĩ'
    ],
    technicalSpecs: {
      'Điện áp định mức': '24kV (Ur)',
      'Dòng điện định mức': '630A',
      'Dòng cắt ngắn mạch': '16kA / 1s',
      'Môi trường cách điện': 'SF6 kín hoàn toàn',
      'Cấu hình tiêu chuẩn': '2 x Load Break Switch + 1 x Fuse',
      'Cấp bảo vệ': 'IP65 (tủ) / IP67 (ngăn SF6)',
      'Nhiệt độ hoạt động': '-25°C đến +55°C',
      'Tiêu chuẩn': 'IEC 62271-200 / IEC 62271-105'
    },
    specifications: '24kV | 630A | SF6 kín | IP65 | 16kA | LBS+Fuse | Maintenance-free | IEC 62271',
    isActive: true
  }
];

// ─────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────
async function seedCTCProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── 1. Clear CTC-related categories ──────────────────
    console.log('🧹 Clearing old CTC product categories...');
    const ctcCategoryNames = ctcCategories.map(c => c.name);
    const deleted = await (ProductCategory as any).deleteMany({ name: { $in: ctcCategoryNames } });
    console.log(`   Removed ${deleted.deletedCount} old categories.\n`);

    // ── 2. Seed categories ────────────────────────────────
    console.log('📂 Seeding 5 CTC product categories...');
    const createdCategories: Record<string, any> = {};
    for (const cat of ctcCategories) {
      const newCat = new (ProductCategory as any)({ ...cat, isActive: true, productCount: 0 });
      await newCat.save();
      createdCategories[cat.name] = newCat;
      console.log(`   ✓ [${cat.order}] ${cat.name} (slug: ${cat.slug})`);
    }
    console.log('');

    // ── 3. Clear old CTC products ─────────────────────────
    console.log('🧹 Clearing old CTC products...');
    const ctcProductCodes = ctcProducts.map(p => p.code);
    const deletedProducts = await (Product as any).deleteMany({ code: { $in: ctcProductCodes } });
    console.log(`   Removed ${deletedProducts.deletedCount} old products.\n`);

    // ── 4. Seed products ──────────────────────────────────
    console.log('📦 Seeding 10 CTC products...');
    const createdProducts: any[] = [];
    for (const [index, productData] of ctcProducts.entries()) {
      const catDoc = createdCategories[productData.category];
      const product = new (Product as any)({
        ...productData,
        categoryId: catDoc?._id || null,
        isActive: true,
        views: Math.floor(Math.random() * 500) + 50,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await product.save();
      createdProducts.push(product);
      console.log(`   ✓ [${index + 1}] ${productData.name} (${productData.category})`);
    }

    // ── 5. Update category product counts ─────────────────
    console.log('\n📊 Updating category product counts...');
    for (const catName of Object.keys(createdCategories)) {
      const count = ctcProducts.filter(p => p.category === catName).length;
      await (ProductCategory as any).findByIdAndUpdate(createdCategories[catName]._id, { productCount: count });
      console.log(`   ✓ ${catName}: ${count} sản phẩm`);
    }

    // ── 6. Print summary ──────────────────────────────────
    console.log('\n══════════════════════════════════════════════');
    console.log('🎉 SEED HOÀN TẤT – CTC Products & Categories');
    console.log('══════════════════════════════════════════════');
    console.log(`📂 Categories: ${ctcCategories.length}`);
    console.log(`📦 Products:   ${createdProducts.length}`);
    console.log(`⭐ Featured:   ${ctcProducts.filter(p => p.isFeatured).length}`);
    console.log('══════════════════════════════════════════════\n');

    const categoryBreakdown = ctcCategories.map(c => ({
      category: c.name,
      products: ctcProducts.filter(p => p.category === c.name).map(p => `  - ${p.name}`)
    }));
    console.log('📋 Danh sách theo danh mục:');
    categoryBreakdown.forEach(c => {
      console.log(`\n▸ ${c.category}`);
      c.products.forEach(p => console.log(p));
    });

  } catch (error) {
    console.error('❌ Lỗi khi seed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedCTCProducts();

export default seedCTCProducts;
