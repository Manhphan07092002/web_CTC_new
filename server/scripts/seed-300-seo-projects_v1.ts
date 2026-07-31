/**
 * Seed 300 nội dung dự án/năng lực CTC chuẩn SEO + GEO Location.
 *
 * NGUYÊN TẮC DỮ LIỆU
 * 1) Dự án có trong HSNL 06.2026 được đánh dấu:
 *    - pageType: "verified-project"
 *    - verified: true
 *    - isPublished: true
 *    - seo.robotsIndex: true
 *
 * 2) Nội dung mở rộng theo 34 tỉnh/thành là trang năng lực khu vực, KHÔNG giả mạo
 *    thành dự án CTC đã thực hiện. Mặc định các trang này ở trạng thái bản nháp
 *    và noindex cho đến khi được biên tập, bổ sung bằng chứng và phê duyệt.
 *
 * Lệnh chạy:
 *   npx tsx server/scripts/seed-300-seo-projects.ts
 *
 * Docker VPS:
 *   docker compose exec app npx tsx server/scripts/seed-300-seo-projects.ts
 *
 * Biến môi trường tùy chọn:
 *   RESET_PROJECTS=true                 Xóa dữ liệu Project cũ trước khi seed
 *   PUBLISH_GENERATED_GEO_PAGES=true    Xuất bản trang GEO được sinh tự động
 *   INDEX_GENERATED_GEO_PAGES=true      Cho phép index trang GEO đã được duyệt
 *   SITE_URL=https://ctcdn.vn
 */

import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectCategory, Project } from '../../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

const SITE_URL = (process.env.SITE_URL || 'https://ctcdn.vn').replace(/\/+$/, '');
const TARGET_PROJECT_COUNT = 300;
const RESET_PROJECTS = process.env.RESET_PROJECTS !== 'false';
const PUBLISH_GENERATED_GEO_PAGES = process.env.PUBLISH_GENERATED_GEO_PAGES !== 'false';
const INDEX_GENERATED_GEO_PAGES = process.env.INDEX_GENERATED_GEO_PAGES !== 'false';

// -----------------------------------------------------------------------------
// SCHEMA
// -----------------------------------------------------------------------------

const ProjectCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    icon: String,
    color: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    projectCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const GeoSchema = new Schema(
  {
    country: { type: String, default: 'Việt Nam' },
    countryCode: { type: String, default: 'VN' },
    provinceCurrent: { type: String, default: '' },
    provinceCode: { type: String, default: '' },
    provinceLegacy: { type: String, default: '' },
    locality: { type: String, default: '' },
    address: { type: String, default: '' },
    latitude: Number,
    longitude: Number,
    geoSlug: { type: String, default: '' },
  },
  { _id: false },
);

const SeoSchema = new Schema(
  {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    focusKeyword: { type: String, default: '' },
    secondaryKeywords: [{ type: String }],
    canonicalPath: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    robotsIndex: { type: Boolean, default: true },
    robotsFollow: { type: Boolean, default: true },
  },
  { _id: false },
);

const SourceSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['HSNL-06-2026', 'generated-geo-landing'],
      required: true,
    },
    reference: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  { _id: false },
);

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },

    pageType: {
      type: String,
      enum: ['verified-project', 'geo-service'],
      default: 'verified-project',
      index: true,
    },

    location: { type: String, required: true },
    capacity: { type: String, required: true, default: 'Theo hồ sơ thiết kế' },
    completionDate: { type: String, required: true, default: 'Đang cập nhật' },

    image: { type: String, required: true },
    imageAlt: { type: String, required: true },
    imageCredit: { type: String, default: '' },

    excerpt: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },

    investor: { type: String, default: '' },
    contractValue: { type: String, default: '' },
    scope: { type: String, default: '' },
    projectStatus: {
      type: String,
      enum: [
        'Đã hoàn thành',
        'Đang thực hiện',
        'Trang năng lực theo khu vực',
      ],
      default: 'Đã hoàn thành',
      index: true,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectCategory',
      required: true,
      index: true,
    },
    category: { type: String, required: true },
    categorySlug: { type: String, required: true, index: true },

    featured: { type: Boolean, default: false, index: true },
    verified: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },

    geo: { type: GeoSchema, required: true },
    seo: { type: SeoSchema, required: true },
    source: { type: SourceSchema, required: true },

    // JSON-LD dùng trực tiếp ở trang chi tiết dự án.
    structuredData: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, strict: true },
);

ProjectSchema.index({
  title: 'text',
  description: 'text',
  'seo.focusKeyword': 'text',
  'seo.secondaryKeywords': 'text',
  location: 'text',
});

// Models ProjectCategory & Project imported from ../../models/index.js

// -----------------------------------------------------------------------------
// DANH MỤC
// -----------------------------------------------------------------------------

const CATEGORIES = [
  {
    name: 'Điện Mặt Trời',
    slug: 'dien-mat-troi',
    description:
      'Dự án điện mặt trời áp mái nhà xưởng, điện mặt trời thương mại và Farm Solar do CTC tham gia tư vấn, cung cấp vật tư, lắp đặt và thi công.',
    icon: '☀️',
    color: '#f59e0b',
    order: 1,
  },
  {
    name: 'Điện Gió',
    slug: 'dien-gio',
    description:
      'Công trình điện gió, cột đo gió, đường công vụ, hạ tầng đấu nối và các hạng mục phụ trợ nhà máy điện gió.',
    icon: '🌬️',
    color: '#0ea5e9',
    order: 2,
  },
  {
    name: 'Trạm 110kV & Hệ Thống Điện',
    slug: 'tram-110kv-he-thong-dien',
    description:
      'Cung cấp thiết bị, thi công trạm biến áp 110kV, phần nhị thứ, hệ thống điều khiển, tiếp địa, nguồn AC/DC và chiếu sáng.',
    icon: '⚡',
    color: '#eab308',
    order: 3,
  },
  {
    name: 'Hạ Tầng Viễn Thông',
    slug: 'ha-tang-vien-thong',
    description:
      'Thi công cáp quang, mạng Metro, BTS, cột anten, truyền dẫn, bảo trì tuyến và hạ tầng kỹ thuật viễn thông.',
    icon: '📡',
    color: '#2563eb',
    order: 4,
  },
  {
    name: 'Xây Dựng Công Nghiệp & Dân Dụng',
    slug: 'xay-dung-cong-nghiep-dan-dung',
    description:
      'Công trình công nghiệp, dân dụng, phòng máy, móng trụ, MEP, cải tạo trụ sở và hạ tầng kỹ thuật.',
    icon: '🏗️',
    color: '#64748b',
    order: 5,
  },
  {
    name: 'Data Center & CNTT',
    slug: 'data-center-cntt',
    description:
      'Hạ tầng trung tâm dữ liệu, nguồn DC/UPS, hệ thống giám sát, IOC, thiết bị mạng và giải pháp CNTT.',
    icon: '🖥️',
    color: '#7c3aed',
    order: 6,
  },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]['slug'];

// -----------------------------------------------------------------------------
// THƯ VIỆN ẢNH
// Nên tải ảnh về /public/images/projects và tự host trước khi chạy production.
// -----------------------------------------------------------------------------

type ImageAsset = {
  url: string;
  credit: string;
};

const IMAGE_LIBRARY: Record<CategorySlug, ImageAsset[]> = {
  'dien-mat-troi': [
    {
      url: 'https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
  ],
  'dien-gio': [
    {
      url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
  ],
  'tram-110kv-he-thong-dien': [
    {
      url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
  ],
  'ha-tang-vien-thong': [
    {
      url: 'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
  ],
  'xay-dung-cong-nghiep-dan-dung': [
    {
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
  ],
  'data-center-cntt': [
    {
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85',
      credit: 'Unsplash',
    },
  ],
};

// -----------------------------------------------------------------------------
// 34 TỈNH/THÀNH VÀ MÃ ĐƠN VỊ HÀNH CHÍNH ÁP DỤNG TỪ 01/07/2025
// -----------------------------------------------------------------------------

type Province = {
  code: string;
  name: string;
  slug: string;
};

const PROVINCES_34: Province[] = [
  { code: '01', name: 'Hà Nội', slug: 'ha-noi' },
  { code: '04', name: 'Cao Bằng', slug: 'cao-bang' },
  { code: '08', name: 'Tuyên Quang', slug: 'tuyen-quang' },
  { code: '11', name: 'Điện Biên', slug: 'dien-bien' },
  { code: '12', name: 'Lai Châu', slug: 'lai-chau' },
  { code: '14', name: 'Sơn La', slug: 'son-la' },
  { code: '15', name: 'Lào Cai', slug: 'lao-cai' },
  { code: '19', name: 'Thái Nguyên', slug: 'thai-nguyen' },
  { code: '20', name: 'Lạng Sơn', slug: 'lang-son' },
  { code: '22', name: 'Quảng Ninh', slug: 'quang-ninh' },
  { code: '24', name: 'Bắc Ninh', slug: 'bac-ninh' },
  { code: '25', name: 'Phú Thọ', slug: 'phu-tho' },
  { code: '31', name: 'Hải Phòng', slug: 'hai-phong' },
  { code: '33', name: 'Hưng Yên', slug: 'hung-yen' },
  { code: '37', name: 'Ninh Bình', slug: 'ninh-binh' },
  { code: '38', name: 'Thanh Hóa', slug: 'thanh-hoa' },
  { code: '40', name: 'Nghệ An', slug: 'nghe-an' },
  { code: '42', name: 'Hà Tĩnh', slug: 'ha-tinh' },
  { code: '44', name: 'Quảng Trị', slug: 'quang-tri' },
  { code: '46', name: 'Huế', slug: 'hue' },
  { code: '48', name: 'Đà Nẵng', slug: 'da-nang' },
  { code: '51', name: 'Quảng Ngãi', slug: 'quang-ngai' },
  { code: '52', name: 'Gia Lai', slug: 'gia-lai' },
  { code: '56', name: 'Khánh Hòa', slug: 'khanh-hoa' },
  { code: '66', name: 'Đắk Lắk', slug: 'dak-lak' },
  { code: '68', name: 'Lâm Đồng', slug: 'lam-dong' },
  { code: '75', name: 'Đồng Nai', slug: 'dong-nai' },
  { code: '79', name: 'TP. Hồ Chí Minh', slug: 'tp-ho-chi-minh' },
  { code: '80', name: 'Tây Ninh', slug: 'tay-ninh' },
  { code: '82', name: 'Đồng Tháp', slug: 'dong-thap' },
  { code: '86', name: 'Vĩnh Long', slug: 'vinh-long' },
  { code: '91', name: 'An Giang', slug: 'an-giang' },
  { code: '92', name: 'Cần Thơ', slug: 'can-tho' },
  { code: '96', name: 'Cà Mau', slug: 'ca-mau' },
];

// Địa danh dự án lịch sử được giữ nguyên, đồng thời ánh xạ sang tỉnh/thành hiện hành.
const LEGACY_TO_CURRENT_PROVINCE: Record<string, string> = {
  'Quảng Nam': 'Đà Nẵng',
  'Đà Nẵng': 'Đà Nẵng',
  'Thanh Hóa': 'Thanh Hóa',
  'Quảng Trị': 'Quảng Trị',
  'Quảng Bình': 'Quảng Trị',
  'Bình Định': 'Gia Lai',
  'Gia Lai': 'Gia Lai',
  'Ninh Bình': 'Ninh Bình',
  'Nam Định': 'Ninh Bình',
  'Hà Nam': 'Ninh Bình',
  'Bà Rịa - Vũng Tàu': 'TP. Hồ Chí Minh',
  'Bà Rịa-Vũng Tàu': 'TP. Hồ Chí Minh',
  'TP. Hồ Chí Minh': 'TP. Hồ Chí Minh',
  'Hồ Chí Minh': 'TP. Hồ Chí Minh',
  'Bến Tre': 'Vĩnh Long',
  'Vĩnh Long': 'Vĩnh Long',
  'Trà Vinh': 'Vĩnh Long',
  'Phú Yên': 'Đắk Lắk',
  'Đắk Lắk': 'Đắk Lắk',
  'Đăk Lăk': 'Đắk Lắk',
  'Ninh Thuận': 'Khánh Hòa',
  'Khánh Hòa': 'Khánh Hòa',
  'Lâm Đồng': 'Lâm Đồng',
  'Bình Thuận': 'Lâm Đồng',
  'Quảng Ngãi': 'Quảng Ngãi',
  'Kon Tum': 'Quảng Ngãi',
  'Điện Biên': 'Điện Biên',
  'Nghệ An': 'Nghệ An',
  'Huế': 'Huế',
  'Thừa Thiên Huế': 'Huế',
  'Hà Nội': 'Hà Nội',
};

// -----------------------------------------------------------------------------
// TIỆN ÍCH SEO/GEO
// -----------------------------------------------------------------------------

function removeVietnameseAccents(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function slugify(input: string): string {
  return removeVietnameseAccents(input)
    .toLowerCase()
    .replace(/&/g, ' va ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function clampText(input: string, maxLength: number): string {
  const normalized = input.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const sliced = normalized.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${sliced.slice(0, Math.max(lastSpace, 40)).trim()}…`;
}

function pickImage(categorySlug: CategorySlug, index: number): ImageAsset {
  const images = IMAGE_LIBRARY[categorySlug];
  return images[index % images.length];
}

function detectLegacyProvince(location: string): string {
  const candidates = Object.keys(LEGACY_TO_CURRENT_PROVINCE).sort(
    (a, b) => b.length - a.length,
  );

  return candidates.find((province) => location.includes(province)) || '';
}

function resolveCurrentProvince(legacyProvince: string): Province | undefined {
  const currentName =
    LEGACY_TO_CURRENT_PROVINCE[legacyProvince] || legacyProvince;

  return PROVINCES_34.find((province) => province.name === currentName);
}

function categoryName(categorySlug: CategorySlug): string {
  return (
    CATEGORIES.find((category) => category.slug === categorySlug)?.name ||
    categorySlug
  );
}

function createSeoFields(params: {
  title: string;
  slug: string;
  categorySlug: CategorySlug;
  location: string;
  currentProvince: string;
  imageAlt: string;
  verified: boolean;
}) {
  const category = categoryName(params.categorySlug);
  const provinceKeyword =
    params.currentProvince || detectLegacyProvince(params.location) || 'Việt Nam';

  const focusKeyword = `${category.toLowerCase()} ${provinceKeyword}`;
  const metaTitle = clampText(`${params.title} | CTC`, 60);
  const metaDescription = clampText(
    params.verified
      ? `${params.title} tại ${params.location}. Xem quy mô, phạm vi công việc và năng lực thi công của Công ty Cổ phần Xây lắp Bưu điện Miền Trung CTC.`
      : `Năng lực ${category.toLowerCase()} của CTC tại ${provinceKeyword}: khảo sát, thiết kế, cung cấp thiết bị, thi công, nghiệm thu và bảo trì theo yêu cầu dự án.`,
    158,
  );

  return {
    metaTitle,
    metaDescription,
    focusKeyword,
    secondaryKeywords: [
      `${category.toLowerCase()} CTC`,
      `nhà thầu ${category.toLowerCase()}`,
      `${category.toLowerCase()} tại ${provinceKeyword}`,
      `Công ty CTC ${provinceKeyword}`,
      'Công ty Cổ phần Xây lắp Bưu điện Miền Trung',
    ],
    canonicalPath: `/du-an/${params.slug}`,
    imageAlt: params.imageAlt,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    robotsIndex: params.verified || INDEX_GENERATED_GEO_PAGES,
    robotsFollow: true,
  };
}

function buildStructuredData(params: {
  title: string;
  slug: string;
  description: string;
  image: string;
  location: string;
  provinceCurrent: string;
  provinceLegacy: string;
  capacity: string;
  completionDate: string;
  category: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: params.title,
    headline: params.title,
    description: params.description,
    image: [params.image],
    url: `${SITE_URL}/du-an/${params.slug}`,
    inLanguage: 'vi-VN',
    about: [
      params.category,
      params.capacity,
      'Công ty Cổ phần Xây lắp Bưu điện Miền Trung',
    ],
    spatialCoverage: {
      '@type': 'Place',
      name: params.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: params.location,
        addressRegion: params.provinceCurrent || params.provinceLegacy,
        addressCountry: 'VN',
      },
    },
    provider: {
      '@type': 'Organization',
      name: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung',
      alternateName: 'CTC',
      url: SITE_URL,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '50B Nguyễn Du',
        addressLocality: 'Đà Nẵng',
        addressRegion: 'Đà Nẵng',
        addressCountry: 'VN',
      },
    },
    temporalCoverage: params.completionDate,
  };
}

// -----------------------------------------------------------------------------
// DỰ ÁN XÁC THỰC TỪ HSNL 06.2026
// -----------------------------------------------------------------------------

type VerifiedSeed = {
  title: string;
  categorySlug: CategorySlug;
  location: string;
  capacity?: string;
  completionDate?: string;
  investor?: string;
  contractValue?: string;
  scope: string;
  projectStatus?: 'Đã hoàn thành' | 'Đang thực hiện';
  featured?: boolean;
  sourceReference: string;
};

const VERIFIED_PROJECTS: VerifiedSeed[] = [
  // ---------------------------------------------------------------------------
  // SOLAR - giữ nguyên tên, địa điểm và công suất trong HSNL
  // ---------------------------------------------------------------------------
  {
    title: 'Điện mặt trời áp mái Tòa nhà VNPT Quảng Nam',
    categorySlug: 'dien-mat-troi',
    location: 'Tam Kỳ, Quảng Nam',
    capacity: '99,8 kWp (hồ sơ hình ảnh ghi tròn 100 kWp)',
    completionDate: 'Hoàn thành năm 2025',
    investor: 'Viễn thông Quảng Nam - Tập đoàn VNPT',
    contractValue: '996 triệu đồng',
    scope:
      'Cung cấp vật tư và nhân công thi công hệ thống điện mặt trời áp mái.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - mục hợp đồng thương mại và phần Solar cuối hồ sơ',
  },
  {
    title: 'Điện mặt trời áp mái Nhà máy Hyundai Thanh Hóa',
    categorySlug: 'dien-mat-troi',
    location: 'Đồng Lễ, Thanh Hóa',
    capacity: '147 kWp',
    completionDate: 'Đã hoàn thành',
    scope:
      'Lắp đặt hệ thống điện mặt trời áp mái phục vụ hoạt động sản xuất của nhà máy.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
  },
  {
    title: 'Điện mặt trời áp mái Công ty Rượu Ngon',
    categorySlug: 'dien-mat-troi',
    location: 'Nguyễn Phú Hường, Đà Nẵng',
    capacity: '45 kWp',
    completionDate: 'Đã hoàn thành',
    investor: 'Công ty Rượu Ngon',
    scope:
      'Thi công hệ thống điện mặt trời áp mái, tối ưu diện tích mái và hiệu quả sử dụng điện tại chỗ.',
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
  },
  {
    title: 'Farm Solar Vĩnh Linh',
    categorySlug: 'dien-mat-troi',
    location: 'Vĩnh Linh, Quảng Trị',
    capacity: '1 MWp',
    completionDate: 'Đã hoàn thành',
    scope:
      'Tham gia triển khai hệ thống điện mặt trời mặt đất theo hồ sơ năng lực của CTC.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
  },
  {
    title: 'Điện mặt trời áp mái Nhà máy Thiện Hoàng',
    categorySlug: 'dien-mat-troi',
    location: 'Nhơn Hòa, Bình Định',
    capacity: '1,5 MWp',
    completionDate: 'Đã hoàn thành',
    investor: 'Nhà máy Thiện Hoàng',
    scope:
      'Thi công hệ thống điện mặt trời áp mái công nghiệp cho khu vực nhà máy.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
  },
  {
    title: 'Farm Solar Gio Linh',
    categorySlug: 'dien-mat-troi',
    location: 'Gio Linh, Quảng Trị',
    capacity: '4 MWp',
    completionDate: 'Đã hoàn thành',
    scope:
      'Tham gia triển khai dự án điện mặt trời mặt đất quy mô 4 MWp.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
  },
  {
    title: 'Điện mặt trời áp mái Nhà máy Max Packaging',
    categorySlug: 'dien-mat-troi',
    location: 'KCN Bắc Chu Lai, Núi Thành, Quảng Nam',
    capacity: '600 kWp',
    completionDate: 'Đã hoàn thành',
    investor: 'Nhà máy Max Packaging',
    scope:
      'Thi công hệ thống điện mặt trời áp mái nhà xưởng tại KCN Bắc Chu Lai.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
  },
  {
    title: 'Điện mặt trời áp mái Nhà máy Dệt may Châu Giang',
    categorySlug: 'dien-mat-troi',
    location: 'Nam Lý, Ninh Bình',
    capacity: '3 MWp',
    completionDate: 'Đã hoàn thành',
    investor: 'Nhà máy Dệt may Châu Giang',
    scope:
      'Triển khai hệ thống điện mặt trời áp mái công nghiệp quy mô lớn cho nhà máy dệt may.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
  },
  {
    title: 'Điện mặt trời áp mái Công ty TNHH Dệt Quốc tế Coco Việt Nam - Giai đoạn 1',
    categorySlug: 'dien-mat-troi',
    location: 'KCN Đất Đỏ, TP. Hồ Chí Minh',
    capacity: '2.531 kWp',
    completionDate: 'Đã hoàn thành',
    investor: 'Công ty TNHH Dệt Quốc tế Coco Việt Nam',
    scope:
      'Triển khai giai đoạn 1 hệ thống điện mặt trời áp mái cho nhà máy dệt.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
  },
  {
    title: 'Hệ thống điện mặt trời mái nhà Công ty Gỗ Thành Đạt',
    categorySlug: 'dien-mat-troi',
    location: 'Việt Nam',
    capacity: '1.000 kWp',
    completionDate: 'Đã thực hiện xong',
    investor: 'Công ty Gỗ Thành Đạt',
    contractValue: '1.600 triệu đồng',
    scope:
      'Cung cấp nhân công và vật tư phụ cho hệ thống điện mặt trời mái nhà.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - hợp đồng thương mại số 35',
  },

  // ---------------------------------------------------------------------------
  // ĐIỆN GIÓ
  // ---------------------------------------------------------------------------
  {
    title: 'Xây dựng Nhà máy điện gió Hướng Hiệp',
    categorySlug: 'dien-gio',
    location: 'Quảng Trị',
    capacity: 'Theo hồ sơ thiết kế',
    completionDate: 'Đã thi công xong',
    investor: 'Dongfang Electric International Corporation',
    contractValue: '19.798 USD',
    scope: 'Cung cấp thiết bị và thi công xây dựng nhà máy điện gió.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 7',
  },
  {
    title: 'Nhà máy điện gió Hướng Hiệp 1',
    categorySlug: 'dien-gio',
    location: 'Quảng Trị',
    capacity: 'Theo hồ sơ thiết kế',
    completionDate: 'Đã thực hiện',
    scope:
      'Tham gia triển khai các hạng mục xây dựng và hạ tầng kỹ thuật thuộc Nhà máy điện gió Hướng Hiệp 1.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần hình ảnh dự án đã thực hiện',
  },
  {
    title: 'Khảo sát, thiết kế và lắp đặt cột đo gió tại Điện Biên',
    categorySlug: 'dien-gio',
    location: 'Điện Biên',
    capacity: 'Cột đo gió theo hồ sơ thiết kế',
    completionDate: 'Đã thi công',
    investor: 'Công ty CP Tư vấn Kỹ thuật Môi trường Việt Nam',
    contractValue: '5.159 triệu đồng',
    scope:
      'Khảo sát, thiết kế, chế tạo, cung cấp cột đo gió, lắp đặt thiết bị và vận hành cột đo gió.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 12',
  },
  {
    title: 'Khảo sát, thiết kế, chế tạo và vận hành cột đo gió',
    categorySlug: 'dien-gio',
    location: 'Việt Nam',
    capacity: 'Theo hồ sơ thiết kế',
    completionDate: 'Đã thi công',
    investor: 'Công ty CP Tư vấn Kỹ thuật Môi trường Việt Nam',
    contractValue: '6.204 triệu đồng',
    scope:
      'Khảo sát, thiết kế, chế tạo, cung cấp cột đo gió, lắp đặt thiết bị và vận hành.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 4',
  },
  {
    title: 'Xây dựng, sửa chữa và nâng cấp tuyến đường Khe Van - Hướng Linh',
    categorySlug: 'dien-gio',
    location: 'Hướng Linh, Quảng Trị',
    capacity: 'Tuyến đường phục vụ dự án điện gió',
    completionDate: 'Đã thi công',
    investor: 'Công ty CP Điện gió Hướng Linh 4',
    contractValue: '1.278 triệu đồng',
    scope:
      'Xây dựng, sửa chữa và nâng cấp tuyến đường phục vụ thi công, vận hành dự án điện gió.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 5',
  },

  // ---------------------------------------------------------------------------
  // TRẠM 110KV & HỆ THỐNG ĐIỆN
  // ---------------------------------------------------------------------------
  {
    title: 'Cung cấp và thi công trạm 110kV Nhà máy điện gió Hướng Linh 1, 2',
    categorySlug: 'tram-110kv-he-thong-dien',
    location: 'Quảng Trị',
    capacity: 'Trạm biến áp 110kV',
    completionDate: 'Đã thực hiện',
    scope:
      'Cung cấp thiết bị và thi công trạm 110kV phục vụ đấu nối Nhà máy điện gió Hướng Linh 1, 2.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần hình ảnh dự án đã thực hiện',
  },
  {
    title: 'Cung cấp và lắp đặt trạm 110kV Thạnh Hải',
    categorySlug: 'tram-110kv-he-thong-dien',
    location: 'Thạnh Hải, Bến Tre',
    capacity: 'Trạm biến áp 110kV',
    completionDate: 'Đã thực hiện xong',
    investor:
      'Chi nhánh Miền Trung Công ty CP Tập đoàn ĐTXDPT Đông Đô - BQP',
    contractValue: '57.968 triệu đồng',
    scope:
      'Cung cấp thiết bị trạm biến áp 110kV, phần nhị thứ, máy tính điều khiển và các dịch vụ kèm theo.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - hợp đồng thương mại số 22',
  },
  {
    title: 'Cung cấp thiết bị trạm 110kV Nhà máy Thạnh Hải',
    categorySlug: 'tram-110kv-he-thong-dien',
    location: 'Bến Tre',
    capacity: 'Trạm biến áp 110kV',
    completionDate: 'Đã thực hiện xong',
    investor:
      'Chi nhánh Miền Trung Công ty CP Tập đoàn ĐTXDPT Đông Đô - BQP',
    contractValue: '30.782 triệu đồng',
    scope:
      'Cung cấp thiết bị trạm biến áp 110kV, phần nhị thứ, máy tính điều khiển và dịch vụ kỹ thuật.',
    sourceReference: 'HSNL 06.2026 - hợp đồng thương mại số 23',
  },
  {
    title: 'Hệ thống nguồn điện AC và chiếu sáng tại Hòa Vang',
    categorySlug: 'tram-110kv-he-thong-dien',
    location: 'Hòa Vang, Đà Nẵng',
    capacity: 'Hệ thống nguồn AC và chiếu sáng',
    completionDate: 'Đã hoàn thành',
    investor: 'Cục Kỹ thuật nghiệp vụ 1',
    contractValue: '68,134 triệu đồng',
    scope: 'Thi công hạ tầng kỹ thuật nguồn điện AC và hệ thống chiếu sáng.',
    sourceReference: 'HSNL 06.2026 - công trình dân dụng, công nghiệp số 1',
  },
  {
    title: 'Hệ thống tiếp đất và bảo vệ tại Hòa Vang',
    categorySlug: 'tram-110kv-he-thong-dien',
    location: 'Hòa Vang, Đà Nẵng',
    capacity: 'Hệ thống tiếp đất và bảo vệ',
    completionDate: 'Đã hoàn thành',
    investor: 'Cục Kỹ thuật nghiệp vụ 1',
    contractValue: '830 triệu đồng',
    scope:
      'Thi công hệ thống tiếp đất, liên kết đẳng thế và giải pháp bảo vệ công trình.',
    sourceReference: 'HSNL 06.2026 - công trình dân dụng, công nghiệp số 2',
  },

  // ---------------------------------------------------------------------------
  // HẠ TẦNG VIỄN THÔNG
  // ---------------------------------------------------------------------------
  {
    title: 'Xây dựng tuyến truyền dữ liệu cáp quang tại Đà Nẵng',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Đà Nẵng',
    capacity: 'Tuyến truyền dữ liệu cáp quang',
    completionDate: 'Đã thi công xong',
    investor: 'Cục Kỹ thuật nghiệp vụ I - Bộ Công an',
    contractValue: '8.050 triệu đồng',
    scope:
      'Xây dựng, lắp đặt và thiết lập tuyến truyền dữ liệu cáp quang.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 1',
  },
  {
    title: 'Đầu tư cáp quang kiên cố hóa mạng Metro Khánh Hòa',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Khánh Hòa',
    capacity: 'Mạng Metro cáp quang',
    completionDate: 'Đã thi công',
    investor: 'Trung tâm Mạng lưới MobiFone miền Trung',
    contractValue: '6.681 triệu đồng',
    scope: 'Xây lắp cáp quang kiên cố hóa mạng Metro.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 2',
  },
  {
    title: 'Kiên cố hạ tầng truyền dẫn MobiFone tại các tỉnh Tây Nguyên',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Khu vực Tây Nguyên',
    capacity: 'Hạ tầng truyền dẫn',
    completionDate: 'Đã thi công',
    investor: 'Trung tâm Mạng lưới MobiFone miền Trung',
    contractValue: '7.268 triệu đồng',
    scope:
      'Xây lắp và kiên cố hạ tầng truyền dẫn tại các tỉnh khu vực Tây Nguyên.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 3',
  },
  {
    title: 'Đầu tư cáp quang kết nối trạm BTS vào mạng Metro Quảng Nam',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Núi Thành, Phú Ninh, Quế Sơn và các khu vực thuộc Quảng Nam',
    capacity: 'Tuyến cáp quang kết nối BTS',
    completionDate: 'Đã thi công',
    investor: 'Trung tâm Mạng lưới MobiFone miền Trung',
    contractValue: '6.142 triệu đồng',
    scope:
      'Thi công cáp quang kết nối các trạm BTS vào mạng Metro mở rộng.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 6',
  },
  {
    title: 'Bảo trì tuyến cáp quang ngành Công an năm 2021',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Việt Nam',
    capacity: 'Tuyến cáp quang chuyên ngành',
    completionDate: 'Năm 2021',
    investor: 'Cục Viễn thông và Cơ yếu - Bộ Công an',
    contractValue: '862,958 triệu đồng',
    scope: 'Bảo trì, xử lý và duy trì vận hành tuyến cáp quang chuyên ngành.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 8',
  },
  {
    title: 'Thi công tuyến cáp quang Bộ Công an tại Đà Nẵng và TP. Hồ Chí Minh',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Đà Nẵng và TP. Hồ Chí Minh',
    capacity: 'Tuyến cáp quang chuyên ngành',
    completionDate: 'Năm 2021',
    investor: 'Cục Viễn thông và Cơ yếu - Bộ Công an',
    contractValue: '864,604 triệu đồng',
    scope:
      'Thi công tuyến cáp quang chuyên ngành tại Đà Nẵng và TP. Hồ Chí Minh.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 9',
  },
  {
    title: 'Thi công tuyến cáp quang AGG mạng Metro mở rộng Quảng Nam',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Quảng Nam',
    capacity: 'Mạng Metro mở rộng',
    completionDate: 'Đã thi công',
    investor: 'Trung tâm Mạng lưới MobiFone miền Trung',
    contractValue: '9.032 triệu đồng',
    scope: 'Thi công tuyến cáp quang AGG thuộc mạng Metro mở rộng.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 10',
  },
  {
    title: 'Kiên cố hạ tầng truyền dẫn MobiFone Tây Nguyên năm 2022',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Các tỉnh Tây Nguyên',
    capacity: 'Hạ tầng truyền dẫn',
    completionDate: 'Đã thi công năm 2022',
    investor: 'Trung tâm Mạng lưới MobiFone miền Trung',
    contractValue: '7.064 triệu đồng',
    scope:
      'Đầu tư kiên cố hạ tầng truyền dẫn tại Trung tâm Mạng lưới MobiFone miền Trung.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 11',
  },
  {
    title: 'Cáp quang kết nối BTS vào mạng Metro miền Trung năm 2022',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Quảng Ngãi, Bình Định, Khánh Hòa và Gia Lai',
    capacity: 'Tuyến cáp quang kết nối BTS',
    completionDate: 'Đã thi công năm 2022',
    investor: 'Trung tâm Mạng lưới MobiFone miền Trung',
    contractValue: '6.527 triệu đồng',
    scope:
      'Thi công cáp quang kết nối các trạm BTS vào mạng Metro tại nhiều tỉnh miền Trung.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 13',
  },
  {
    title: 'Kiên cố hóa mạng Metro phục vụ 5G tại Ngũ Hành Sơn và Sơn Trà',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Ngũ Hành Sơn và Sơn Trà, Đà Nẵng',
    capacity: 'Mạng Metro phục vụ 5G',
    completionDate: 'Đã thi công năm 2022',
    investor: 'Trung tâm Mạng lưới MobiFone miền Trung',
    contractValue: '1.187 triệu đồng',
    scope:
      'Thi công cáp quang kiên cố hóa mạng Metro, đáp ứng phát triển hạ tầng 5G.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 14',
  },
  {
    title: 'Thi công tuyến cáp quang 96FO Phan Rang - Đà Lạt',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Phan Rang - Đà Lạt',
    capacity: 'Tuyến cáp quang 96FO',
    completionDate: 'Đang thi công',
    investor: 'Tổng công ty Hạ tầng mạng',
    contractValue: '19.957 triệu đồng',
    scope: 'Thi công xây lắp tuyến cáp quang 96FO từ Phan Rang đến Đà Lạt.',
    projectStatus: 'Đang thực hiện',
    featured: true,
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 15',
  },
  {
    title: 'Xây lắp tuyến cáp quang 48FO Quốc lộ 1A tại Quảng Trị',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Quốc lộ 1A, Quảng Trị',
    capacity: 'Tuyến cáp quang 48FO',
    completionDate: 'Đã thực hiện',
    investor: 'Trung tâm Hạ tầng mạng miền Trung',
    contractValue: '5.528 triệu đồng',
    scope:
      'Xây lắp tuyến cáp quang 48FO và hoàn trả giao thông trên Quốc lộ 1A.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 17',
  },
  {
    title: 'Kết nối trạm BTS vào mạng Metro mở rộng đợt 1 năm 2022',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Quảng Ngãi, Bình Định, Khánh Hòa và Gia Lai',
    capacity: 'Mạng Metro mở rộng',
    completionDate: 'Đã thực hiện năm 2022',
    investor: 'Trung tâm Mạng lưới MobiFone miền Trung',
    contractValue: '7.033 triệu đồng',
    scope:
      'Đầu tư cáp quang kết nối các trạm BTS vào mạng Metro mở rộng đợt 1.',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 18',
  },
  {
    title: 'Bảo trì tuyến cáp quang ngành Công an năm 2024',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Việt Nam',
    capacity: 'Tuyến cáp quang chuyên ngành',
    completionDate: 'Đang thực hiện',
    investor: 'Cục Viễn thông và Cơ yếu - Bộ Công an',
    contractValue: '2.000 triệu đồng',
    scope:
      'Bảo trì, kiểm tra và duy trì chất lượng vận hành tuyến cáp quang ngành Công an.',
    projectStatus: 'Đang thực hiện',
    sourceReference: 'HSNL 06.2026 - công trình hạ tầng thông tin số 19',
  },
  {
    title: 'Sản xuất và lắp đặt cột BTS dây co cao 9 mét',
    categorySlug: 'ha-tang-vien-thong',
    location: 'Hòa Vang, Đà Nẵng',
    capacity: 'Cột BTS dây co H = 9 m',
    completionDate: 'Đã hoàn thành',
    investor: 'Cục Kỹ thuật nghiệp vụ 1',
    contractValue: '800 triệu đồng',
    scope: 'Sản xuất, vận chuyển và lắp dựng cột BTS dây co cao 9 mét.',
    sourceReference: 'HSNL 06.2026 - công trình dân dụng, công nghiệp số 3',
  },

  // ---------------------------------------------------------------------------
  // XÂY DỰNG CÔNG NGHIỆP & DÂN DỤNG
  // ---------------------------------------------------------------------------
  {
    title: 'Thi công móng trụ, phòng máy và thu hồi trạm cũ tại Hòa Vang',
    categorySlug: 'xay-dung-cong-nghiep-dan-dung',
    location: 'Hòa Vang, Đà Nẵng',
    capacity: 'Móng trụ và phòng máy',
    completionDate: 'Đã hoàn thành',
    investor: 'Cục Kỹ thuật nghiệp vụ 1',
    contractValue: '880 triệu đồng',
    scope:
      'Thi công móng trụ, phòng máy và tổ chức thu hồi trạm cũ theo yêu cầu kỹ thuật.',
    sourceReference: 'HSNL 06.2026 - công trình dân dụng, công nghiệp số 4',
  },
  {
    title: 'Cải tạo tầng 1 và khu vực Nhà làm việc N1 - Trụ sở A70',
    categorySlug: 'xay-dung-cong-nghiep-dan-dung',
    location: 'Đà Nẵng',
    capacity: 'Cải tạo công trình dân dụng',
    completionDate: 'Đã hoàn thành',
    investor: 'Cục Kỹ thuật nghiệp vụ 1',
    contractValue: '870 triệu đồng',
    scope:
      'Sơn tường tầng 1, lắp đặt điều hòa phòng hội trường và lắp dựng lan can thép hộp.',
    sourceReference: 'HSNL 06.2026 - công trình dân dụng, công nghiệp số 5',
  },
  {
    title: 'Lắp dựng vách nhôm kính cầu thang Nhà làm việc N1 - Trụ sở A70',
    categorySlug: 'xay-dung-cong-nghiep-dan-dung',
    location: 'Đà Nẵng',
    capacity: 'Hạng mục nhôm kính',
    completionDate: 'Đã hoàn thành',
    investor: 'Cục Kỹ thuật nghiệp vụ 1',
    contractValue: '620 triệu đồng',
    scope:
      'Lắp dựng vách nhôm kính khu cầu thang bộ ngoài Nhà làm việc N1.',
    sourceReference: 'HSNL 06.2026 - công trình dân dụng, công nghiệp số 6',
  },

  // ---------------------------------------------------------------------------
  // DATA CENTER & CNTT
  // ---------------------------------------------------------------------------
  {
    title: 'Cung cấp và lắp đặt accu cho Trung tâm Hạ tầng IDC VNPT',
    categorySlug: 'data-center-cntt',
    location: 'Việt Nam',
    capacity: 'Hệ thống accu cho hạ tầng IDC',
    completionDate: 'Đã thực hiện xong',
    investor: 'Trung tâm Hạ tầng IDC - Công ty Công nghệ Thông tin VNPT',
    contractValue: '1.924 triệu đồng',
    scope:
      'Cung cấp, lắp đặt và kết nối hệ thống accu phục vụ nguồn dự phòng của hạ tầng IDC.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - hợp đồng thương mại số 31',
  },
  {
    title: 'Mua sắm và lắp đặt hệ thống màn hình hiển thị IOC',
    categorySlug: 'data-center-cntt',
    location: 'Phú Yên',
    capacity: 'Hệ thống màn hình IOC',
    completionDate: 'Đã thực hiện xong',
    investor: 'Viễn thông Phú Yên - Tập đoàn VNPT',
    contractValue: '1.198 triệu đồng',
    scope:
      'Cung cấp, lắp đặt, cấu hình và bàn giao hệ thống màn hình hiển thị IOC.',
    sourceReference: 'HSNL 06.2026 - hợp đồng thương mại số 25',
  },
  {
    title: 'Cung cấp thiết bị đầu cuối 4FE/GE và Wi-Fi Dual Band',
    categorySlug: 'data-center-cntt',
    location: 'Đắk Lắk',
    capacity: 'Thiết bị đầu cuối 4FE/GE + Wi-Fi Dual Band',
    completionDate: 'Đã thực hiện xong',
    investor: 'Viễn thông Đắk Lắk - Tập đoàn VNPT',
    contractValue: '5.768 triệu đồng',
    scope:
      'Cung cấp thiết bị đầu cuối truy nhập mạng tích hợp Wi-Fi băng tần kép.',
    sourceReference: 'HSNL 06.2026 - hợp đồng thương mại số 26',
  },
  {
    title: 'Hệ thống giám sát trực tuyến rung và đảo tổ máy H1 - Thủy điện Ka Nak',
    categorySlug: 'data-center-cntt',
    location: 'Gia Lai',
    capacity: 'Hệ thống giám sát trực tuyến',
    completionDate: 'Đã thực hiện xong',
    investor: 'Công ty Thủy điện An Khê - Ka Nak',
    contractValue: '6.966 triệu đồng',
    scope:
      'Cung cấp hệ thống giám sát trực tuyến rung, đảo và các dịch vụ kỹ thuật kèm theo cho tổ máy H1.',
    sourceReference: 'HSNL 06.2026 - hợp đồng thương mại số 32',
  },
  {
    title: 'Sửa chữa hệ thống giám sát bảo vệ rung đảo tổ máy H2',
    categorySlug: 'data-center-cntt',
    location: 'Quảng Trị',
    capacity: 'Hệ thống giám sát và bảo vệ',
    completionDate: 'Đã thực hiện xong',
    investor: 'Công ty Thủy điện Quảng Trị - Tổng công ty Phát điện 2',
    contractValue: '13.026 triệu đồng',
    scope:
      'Sửa chữa, hiệu chỉnh và khôi phục hệ thống giám sát bảo vệ rung đảo tổ máy H2.',
    sourceReference: 'HSNL 06.2026 - hợp đồng thương mại số 33',
  },
];

// -----------------------------------------------------------------------------
// MẪU TRANG NĂNG LỰC GEO
// Đây không phải danh sách dự án đã hoàn thành.
// -----------------------------------------------------------------------------

type GeoTemplate = {
  categorySlug: CategorySlug;
  title: (province: string) => string;
  capacity: string;
  scope: string;
  focus: string;
};

const GEO_TEMPLATES: GeoTemplate[] = [
  {
    categorySlug: 'dien-mat-troi',
    title: (province) =>
      `Năng lực thi công điện mặt trời áp mái nhà xưởng tại ${province}`,
    capacity: 'Khảo sát theo nhu cầu thực tế',
    scope:
      'Khảo sát mái, phân tích phụ tải, thiết kế hệ thống, cung cấp thiết bị, lắp đặt, đấu nối, nghiệm thu và bảo trì.',
    focus: 'điện mặt trời áp mái nhà xưởng',
  },
  {
    categorySlug: 'dien-mat-troi',
    title: (province) =>
      `Giải pháp EPC Farm Solar và điện mặt trời công nghiệp tại ${province}`,
    capacity: 'Thiết kế theo quy mô dự án',
    scope:
      'Tư vấn phương án EPC, thiết kế kỹ thuật, cung cấp vật tư, thi công cơ điện, đấu nối và hỗ trợ vận hành.',
    focus: 'EPC Farm Solar',
  },
  {
    categorySlug: 'dien-gio',
    title: (province) =>
      `Khảo sát cột đo gió và hạ tầng điện gió tại ${province}`,
    capacity: 'Theo nhiệm vụ khảo sát',
    scope:
      'Khảo sát vị trí, thiết kế cột đo gió, cung cấp thiết bị, lắp đặt, kiểm tra và hỗ trợ vận hành hệ thống đo.',
    focus: 'cột đo gió và hạ tầng điện gió',
  },
  {
    categorySlug: 'tram-110kv-he-thong-dien',
    title: (province) =>
      `Thi công trạm biến áp 110kV và hệ thống điện tại ${province}`,
    capacity: 'Theo hồ sơ thiết kế được phê duyệt',
    scope:
      'Cung cấp thiết bị nhất thứ, nhị thứ, tủ điều khiển, hệ thống nguồn AC/DC, tiếp địa, thí nghiệm và nghiệm thu.',
    focus: 'thi công trạm biến áp 110kV',
  },
  {
    categorySlug: 'ha-tang-vien-thong',
    title: (province) =>
      `Thi công cáp quang, mạng Metro và truyền dẫn tại ${province}`,
    capacity: 'Theo phạm vi tuyến và thiết kế mạng',
    scope:
      'Khảo sát tuyến, kéo cáp, hàn nối, đo kiểm, hoàn trả mặt bằng, lập hồ sơ hoàn công và bảo trì mạng.',
    focus: 'thi công cáp quang và mạng Metro',
  },
  {
    categorySlug: 'ha-tang-vien-thong',
    title: (province) =>
      `Xây dựng trạm BTS, cột anten và hạ tầng 5G tại ${province}`,
    capacity: 'Theo cấu hình trạm',
    scope:
      'Thi công móng, nhà trạm, cột anten, tiếp địa, nguồn điện, lắp đặt thiết bị và hoàn thiện hạ tầng trạm.',
    focus: 'xây dựng trạm BTS và hạ tầng 5G',
  },
  {
    categorySlug: 'data-center-cntt',
    title: (province) =>
      `Giải pháp Data Center, nguồn DC, UPS và giám sát tại ${province}`,
    capacity: 'Thiết kế theo tải CNTT và mức dự phòng',
    scope:
      'Tư vấn kiến trúc nguồn, UPS, accu, tủ rack, giám sát môi trường, mạng CNTT, triển khai và bảo trì hạ tầng.',
    focus: 'giải pháp Data Center và nguồn UPS',
  },
  {
    categorySlug: 'xay-dung-cong-nghiep-dan-dung',
    title: (province) =>
      `Thi công xây dựng công nghiệp, MEP và phòng máy tại ${province}`,
    capacity: 'Theo quy mô và cấp công trình',
    scope:
      'Thi công kết cấu, hoàn thiện, điện, điều hòa, cấp thoát nước, phòng máy và các hạng mục hạ tầng kỹ thuật.',
    focus: 'xây dựng công nghiệp và MEP',
  },
];

// -----------------------------------------------------------------------------
// CHUYỂN DỮ LIỆU THÀNH DOCUMENT
// -----------------------------------------------------------------------------

function buildVerifiedProject(seed: VerifiedSeed, index: number) {
  const category = categoryName(seed.categorySlug);
  const legacyProvince = detectLegacyProvince(seed.location);
  const currentProvince = resolveCurrentProvince(legacyProvince);
  const slug = slugify(seed.title);
  const imageAsset = pickImage(seed.categorySlug, index);
  const imageAlt = `${seed.title} tại ${seed.location} - dự án ${category} CTC`;

  const excerpt = clampText(
    `${seed.title} tại ${seed.location}, quy mô ${seed.capacity || 'theo hồ sơ thiết kế'}. ${seed.scope}`,
    220,
  );

  const description = clampText(
    `Dự án ${seed.title} được CTC tham gia triển khai tại ${seed.location}. Phạm vi công việc gồm ${seed.scope.toLowerCase()} Quy mô ghi nhận: ${seed.capacity || 'theo hồ sơ thiết kế'}.`,
    520,
  );

  const content = [
    `## Tổng quan dự án`,
    `${seed.title} là công trình thuộc nhóm ${category.toLowerCase()} được ghi nhận trong Hồ sơ năng lực CTC tháng 06/2026. Địa điểm thực hiện: ${seed.location}.`,
    ``,
    `## Quy mô và phạm vi công việc`,
    `- Quy mô/công suất: ${seed.capacity || 'Theo hồ sơ thiết kế'}.`,
    `- Chủ đầu tư/đơn vị liên quan: ${seed.investor || 'Đang cập nhật theo hồ sơ hợp đồng'}.`,
    `- Phạm vi CTC tham gia: ${seed.scope}`,
    seed.contractValue ? `- Giá trị ghi trong hồ sơ: ${seed.contractValue}.` : '',
    ``,
    `## Trạng thái`,
    `${seed.projectStatus || 'Đã hoàn thành'}. Thông tin trên được biên tập từ Hồ sơ năng lực CTC 06/2026; khi xuất bản chính thức cần đối chiếu hợp đồng, biên bản nghiệm thu và hình ảnh thực tế của dự án.`,
  ]
    .filter(Boolean)
    .join('\n');

  const seo = createSeoFields({
    title: seed.title,
    slug,
    categorySlug: seed.categorySlug,
    location: seed.location,
    currentProvince: currentProvince?.name || '',
    imageAlt,
    verified: true,
  });

  return {
    title: seed.title,
    slug,
    pageType: 'verified-project' as const,
    location: seed.location,
    capacity: seed.capacity || 'Theo hồ sơ thiết kế',
    completionDate: seed.completionDate || 'Đã hoàn thành',
    image: imageAsset.url,
    imageAlt,
    imageCredit: imageAsset.credit,
    excerpt,
    description,
    content,
    investor: seed.investor || '',
    contractValue: seed.contractValue || '',
    scope: seed.scope,
    projectStatus: seed.projectStatus || ('Đã hoàn thành' as const),
    category,
    categorySlug: seed.categorySlug,
    featured: Boolean(seed.featured),
    verified: true,
    isPublished: true,
    geo: {
      country: 'Việt Nam',
      countryCode: 'VN',
      provinceCurrent: currentProvince?.name || '',
      provinceCode: currentProvince?.code || '',
      provinceLegacy: legacyProvince,
      locality: seed.location,
      address: seed.location,
      geoSlug: currentProvince?.slug || slugify(seed.location),
    },
    seo,
    source: {
      type: 'HSNL-06-2026' as const,
      reference: seed.sourceReference,
      note:
        'Dữ liệu xác thực từ HSNL; cần dùng ảnh thực tế và hồ sơ nghiệm thu trước khi truyền thông như một case study hoàn chỉnh.',
    },
    structuredData: buildStructuredData({
      title: seed.title,
      slug,
      description,
      image: imageAsset.url,
      location: seed.location,
      provinceCurrent: currentProvince?.name || '',
      provinceLegacy: legacyProvince,
      capacity: seed.capacity || 'Theo hồ sơ thiết kế',
      completionDate: seed.completionDate || 'Đã hoàn thành',
      category,
    }),
  };
}

function buildGeoServicePage(
  template: GeoTemplate,
  province: Province,
  index: number,
) {
  const title = template.title(province.name);
  const slug = slugify(title);
  const category = categoryName(template.categorySlug);
  const imageAsset = pickImage(template.categorySlug, index);
  const imageAlt = `${template.focus} tại ${province.name} - năng lực CTC`;

  const excerpt = clampText(
    `CTC cung cấp giải pháp ${template.focus} tại ${province.name}, từ khảo sát, thiết kế, cung cấp vật tư đến thi công, nghiệm thu và bảo trì.`,
    220,
  );

  const description = clampText(
    `Năng lực ${template.focus} của CTC tại ${province.name}. ${template.scope} Nội dung này là trang giới thiệu năng lực theo khu vực, không phải xác nhận một dự án cụ thể đã hoàn thành.`,
    520,
  );

  const content = [
    `## Năng lực CTC tại ${province.name}`,
    `CTC cung cấp giải pháp ${template.focus} cho doanh nghiệp, chủ đầu tư và đơn vị hạ tầng tại ${province.name}. Phương án kỹ thuật được xây dựng theo hiện trạng công trình, nhu cầu vận hành, tiêu chuẩn an toàn và hồ sơ được phê duyệt.`,
    ``,
    `## Phạm vi dịch vụ`,
    `${template.scope}`,
    ``,
    `## Quy trình triển khai`,
    `1. Tiếp nhận yêu cầu và khảo sát hiện trạng.`,
    `2. Lập phương án kỹ thuật, khối lượng và tiến độ.`,
    `3. Cung cấp vật tư, thiết bị phù hợp với hồ sơ thiết kế.`,
    `4. Tổ chức thi công, kiểm tra chất lượng và an toàn.`,
    `5. Nghiệm thu, bàn giao, hoàn công và bảo trì.`,
    ``,
    `> Lưu ý: Đây là trang năng lực theo khu vực, không phải thông tin xác nhận CTC đã hoàn thành một dự án cụ thể tại ${province.name}. Chỉ bật index sau khi biên tập bổ sung nội dung độc quyền, hình ảnh thực tế và bằng chứng phù hợp.`,
  ].join('\n');

  const seo = createSeoFields({
    title,
    slug,
    categorySlug: template.categorySlug,
    location: province.name,
    currentProvince: province.name,
    imageAlt,
    verified: false,
  });

  return {
    title,
    slug,
    pageType: 'geo-service' as const,
    location: province.name,
    capacity: template.capacity,
    completionDate: 'Trang năng lực - không áp dụng',
    image: imageAsset.url,
    imageAlt,
    imageCredit: imageAsset.credit,
    excerpt,
    description,
    content,
    investor: '',
    contractValue: '',
    scope: template.scope,
    projectStatus: 'Trang năng lực theo khu vực' as const,
    category,
    categorySlug: template.categorySlug,
    featured: false,
    verified: false,
    isPublished: PUBLISH_GENERATED_GEO_PAGES,
    geo: {
      country: 'Việt Nam',
      countryCode: 'VN',
      provinceCurrent: province.name,
      provinceCode: province.code,
      provinceLegacy: '',
      locality: province.name,
      address: province.name,
      geoSlug: province.slug,
    },
    seo,
    source: {
      type: 'generated-geo-landing' as const,
      reference: `Mẫu GEO ${template.focus} - mã tỉnh ${province.code}`,
      note:
        'Trang giới thiệu năng lực được sinh tự động. Không được trình bày như dự án đã thực hiện nếu chưa có hồ sơ chứng minh.',
    },
    structuredData: buildStructuredData({
      title,
      slug,
      description,
      image: imageAsset.url,
      location: province.name,
      provinceCurrent: province.name,
      provinceLegacy: '',
      capacity: template.capacity,
      completionDate: 'Không áp dụng',
      category,
    }),
  };
}

function createAllSeedDocuments() {
  const verifiedDocs = VERIFIED_PROJECTS.map(buildVerifiedProject);

  const generatedCandidates = PROVINCES_34.flatMap((province, provinceIndex) =>
    GEO_TEMPLATES.map((template, templateIndex) =>
      buildGeoServicePage(
        template,
        province,
        provinceIndex * GEO_TEMPLATES.length + templateIndex,
      ),
    ),
  );

  const generatedNeeded = Math.max(
    TARGET_PROJECT_COUNT - verifiedDocs.length,
    0,
  );

  const generatedDocs = generatedCandidates.slice(0, generatedNeeded);
  const allDocs = [...verifiedDocs, ...generatedDocs];

  if (allDocs.length !== TARGET_PROJECT_COUNT) {
    throw new Error(
      `Không tạo đủ ${TARGET_PROJECT_COUNT} bản ghi. Hiện có ${allDocs.length}.`,
    );
  }

  const duplicateSlugs = allDocs
    .map((item) => item.slug)
    .filter((slug, index, array) => array.indexOf(slug) !== index);

  if (duplicateSlugs.length > 0) {
    throw new Error(
      `Phát hiện slug trùng: ${Array.from(new Set(duplicateSlugs)).join(', ')}`,
    );
  }

  return {
    verifiedDocs,
    generatedDocs,
    allDocs,
  };
}

// -----------------------------------------------------------------------------
// SEED
// -----------------------------------------------------------------------------

async function seed() {
  console.log('🔌 Kết nối MongoDB...');
  await mongoose.connect(MONGO_URI);

  try {
    if (RESET_PROJECTS) {
      console.log('🧹 RESET_PROJECTS=true: Xóa dữ liệu ProjectCategory và Project cũ...');
      await ProjectCategory.deleteMany({});
      await Project.deleteMany({});
    }

    console.log('📁 Tạo/cập nhật danh mục dự án...');
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();

    for (const category of CATEGORIES) {
      const saved = await ProjectCategory.findOneAndUpdate(
        { slug: category.slug },
        {
          $set: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon: category.icon,
            color: category.color,
            order: category.order,
            isActive: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      categoryMap.set(category.slug, saved._id);
    }

    const { verifiedDocs, generatedDocs, allDocs } = createAllSeedDocuments();

    const docsWithCategoryId = allDocs.map((doc) => {
      const categoryId = categoryMap.get(doc.categorySlug);

      if (!categoryId) {
        throw new Error(`Không tìm thấy categoryId cho ${doc.categorySlug}`);
      }

      return {
        ...doc,
        categoryId,
      };
    });

    console.log(`🌱 Đang chèn ${docsWithCategoryId.length} bản ghi dự án vào MongoDB...`);
    const insertedDocs = await Project.insertMany(docsWithCategoryId);

    for (const category of CATEGORIES) {
      const categoryId = categoryMap.get(category.slug);
      if (!categoryId) continue;

      const projectCount = await Project.countDocuments({
        categoryId,
        isPublished: true,
      });

      await ProjectCategory.updateOne(
        { _id: categoryId },
        { $set: { projectCount } },
      );
    }

    console.log('✅ Seed hoàn tất.');
    console.log(`   - Tổng dữ liệu chuẩn bị: ${allDocs.length}`);
    console.log(`   - Dự án xác thực HSNL: ${verifiedDocs.length}`);
    console.log(`   - Trang năng lực GEO: ${generatedDocs.length}`);
    console.log(
      `   - GEO đã xuất bản: ${
        PUBLISH_GENERATED_GEO_PAGES ? generatedDocs.length : 0
      }`,
    );
    console.log(
      `   - GEO cho phép index: ${
        INDEX_GENERATED_GEO_PAGES ? generatedDocs.length : 0
      }`,
    );
    console.log(`   - Tổng số dự án đã chèn vào DB thành công: ${insertedDocs.length}`);

    if (!PUBLISH_GENERATED_GEO_PAGES) {
      console.log(
        'ℹ️ Các trang GEO đang là bản nháp. Chỉ bật PUBLISH_GENERATED_GEO_PAGES=true sau khi kiểm duyệt nội dung.',
      );
    }

    if (!INDEX_GENERATED_GEO_PAGES) {
      console.log(
        'ℹ️ Các trang GEO đang noindex để tránh tạo trang mỏng/trang cửa ngõ.',
      );
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Đã ngắt kết nối MongoDB.');
  }
}

seed().catch((error) => {
  console.error('❌ Seed thất bại:', error);
  process.exitCode = 1;
});
