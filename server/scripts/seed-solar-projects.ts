/**
 * Seed riêng 10 dự án ĐIỆN MẶT TRỜI của CTC.
 *
 * Nguồn dữ liệu: HSNL 06.2026 + nội dung SEO/GEO đã biên tập.
 *
 * Chạy:
 *   npx tsx server/scripts/seed-solar-projects.ts
 *
 * Hoặc Docker:
 *   docker compose exec app npx tsx server/scripts/seed-solar-projects.ts
 *
 * ENV:
 *   MONGO_URI=mongodb://127.0.0.1:27017/ctc_web_new
 *   SITE_URL=https://ctcdn.vn
 *
 * LƯU Ý:
 * - Script này CHỈ xóa và tạo lại các Project thuộc categorySlug
 *   "dien-mat-troi". Không đụng tới Điện Gió, Trạm 110kV, Viễn thông...
 * - Không tự thêm thông số kỹ thuật không có trong HSNL.
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

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';
const SITE_URL = (process.env.SITE_URL || 'https://ctcdn.vn').replace(/\/+$/, '');

const CATEGORY = {
  name: 'Điện Mặt Trời',
  slug: 'dien-mat-troi',
  description:
    'Các dự án điện mặt trời áp mái, điện mặt trời công nghiệp và Solar Farm được CTC ghi nhận trong hồ sơ năng lực.',
  icon: '☀️',
  color: '#f59e0b',
  order: 1,
};

const SOLAR_IMAGES = [
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
];

type SolarProject = {
  title: string;
  location: string;
  capacity: string;
  completionDate: string;
  investor?: string;
  contractValue?: string;
  scope: string;
  featured?: boolean;
  htmlDescription: string;
  sourceReference: string;
};

const link = (pathName: string, title: string, text: string) =>
  `<a href="${SITE_URL}${pathName}" title="${title}"><strong>${text}</strong></a>`;

const SOLAR_PROJECTS: SolarProject[] = [
  {
    title: 'Điện mặt trời áp mái Tòa nhà VNPT Quảng Nam',
    location: 'Tam Kỳ, Quảng Nam',
    capacity: '99,8 kWp (hồ sơ hình ảnh ghi tròn 100 kWp)',
    completionDate: 'Hoàn thành năm 2025',
    investor: 'Viễn thông Quảng Nam - Tập đoàn VNPT',
    contractValue: '996 triệu đồng',
    scope: 'Cung cấp vật tư và nhân công thi công hệ thống điện mặt trời áp mái.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - mục hợp đồng thương mại và phần Solar cuối hồ sơ',
    htmlDescription: `<h2>Điện mặt trời áp mái Tòa nhà VNPT Quảng Nam</h2><p><strong>Dự án điện mặt trời áp mái Tòa nhà VNPT Quảng Nam</strong> được CTC triển khai tại khu vực Tam Kỳ, Quảng Nam, với quy mô <strong>99,8 kWp</strong> theo dữ liệu hợp đồng; hồ sơ hình ảnh ghi tròn <strong>100 kWp</strong>. Hệ thống được triển khai nhằm tận dụng hiệu quả diện tích mái công trình và khai thác nguồn năng lượng mặt trời.</p><p>Phạm vi CTC ghi nhận trong hồ sơ gồm <strong>cung cấp vật tư và nhân công thi công hệ thống điện mặt trời áp mái</strong>. Dự án thể hiện kinh nghiệm của CTC trong triển khai điện mặt trời cho công trình văn phòng, thương mại và hạ tầng viễn thông.</p><p>Tìm hiểu thêm ${link('/solutions','Giải pháp điện mặt trời CTC','giải pháp điện mặt trời')}, ${link('/products','Sản phẩm điện mặt trời CTC','sản phẩm và thiết bị năng lượng mặt trời')} và ${link('/news','Tin tức năng lượng tái tạo CTC','tin tức năng lượng tái tạo')}.</p>`,
  },
  {
    title: 'Điện mặt trời áp mái Nhà máy Hyundai Thanh Hóa',
    location: 'Đồng Lễ, Thanh Hóa',
    capacity: '147 kWp',
    completionDate: 'Đã hoàn thành',
    scope: 'Lắp đặt hệ thống điện mặt trời áp mái phục vụ hoạt động sản xuất của nhà máy.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
    htmlDescription: `<h2>Điện mặt trời áp mái Nhà máy Hyundai Thanh Hóa</h2><p><strong>Dự án điện mặt trời áp mái Nhà máy Hyundai Thanh Hóa</strong> được CTC triển khai tại khu vực Đồng Lễ, Thanh Hóa, với <strong>công suất 147 kWp</strong>. Hệ thống được triển khai trên mái nhà máy nhằm khai thác nguồn năng lượng mặt trời và thúc đẩy ứng dụng năng lượng tái tạo trong hoạt động sản xuất.</p><p>Phạm vi dự án được hồ sơ năng lực ghi nhận là <strong>lắp đặt hệ thống điện mặt trời áp mái phục vụ hoạt động sản xuất của nhà máy</strong>. Đây là kinh nghiệm thực tế của CTC trong triển khai điện mặt trời áp mái cho khách hàng công nghiệp.</p><p>Khám phá ${link('/solutions','Giải pháp Solar EPC CTC','giải pháp Solar EPC')} và ${link('/products','Thiết bị điện mặt trời CTC','thiết bị điện mặt trời')} của CTC.</p>`,
  },
  {
    title: 'Điện mặt trời áp mái Công ty Rượu Ngon',
    location: 'Nguyễn Phú Hường, Đà Nẵng',
    capacity: '45 kWp',
    completionDate: 'Đã hoàn thành',
    investor: 'Công ty Rượu Ngon',
    scope: 'Thi công hệ thống điện mặt trời áp mái, tối ưu diện tích mái và hiệu quả sử dụng điện tại chỗ.',
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
    htmlDescription: `<h2>Điện mặt trời áp mái Công ty Rượu Ngon</h2><p><strong>Dự án điện mặt trời áp mái Công ty Rượu Ngon</strong> được CTC triển khai tại khu vực Nguyễn Phú Hường, Đà Nẵng, với <strong>công suất 45 kWp</strong>. Hệ thống tận dụng diện tích mái công trình để khai thác nguồn năng lượng mặt trời và ứng dụng năng lượng tái tạo vào hoạt động của doanh nghiệp.</p><p>Phạm vi dự án gồm <strong>thi công hệ thống điện mặt trời áp mái, tối ưu diện tích mái và hiệu quả sử dụng điện tại chỗ</strong>. Công trình thể hiện năng lực của CTC trong triển khai giải pháp điện mặt trời cho khách hàng thương mại và doanh nghiệp.</p><p>Tham khảo ${link('/solutions','Giải pháp năng lượng tái tạo CTC','giải pháp năng lượng tái tạo')}, ${link('/products','Sản phẩm điện mặt trời CTC','sản phẩm điện mặt trời')} và ${link('/news','Tin tức CTC','tin tức CTC')}.</p>`,
  },
  {
    title: 'Farm Solar Vĩnh Linh',
    location: 'Vĩnh Linh, Quảng Trị',
    capacity: '1 MWp',
    completionDate: 'Đã hoàn thành',
    scope: 'Tham gia triển khai hệ thống điện mặt trời mặt đất theo hồ sơ năng lực của CTC.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
    htmlDescription: `<h2>Farm Solar Vĩnh Linh</h2><p><strong>Farm Solar Vĩnh Linh</strong> là dự án điện mặt trời có <strong>công suất 1 MWp</strong>, được CTC ghi nhận trong hồ sơ năng lực tại Vĩnh Linh, Quảng Trị. Dự án thuộc nhóm điện mặt trời mặt đất, khai thác nguồn năng lượng mặt trời để phát triển nguồn điện tái tạo.</p><p>CTC ghi nhận phạm vi <strong>tham gia triển khai hệ thống điện mặt trời mặt đất</strong> theo hồ sơ năng lực. Với quy mô 1 MWp, dự án thể hiện kinh nghiệm tham gia các công trình Solar Farm quy mô MW.</p><p>Tìm hiểu thêm ${link('/solutions','Giải pháp Solar EPC CTC','giải pháp Solar EPC')}, ${link('/products','Thiết bị điện mặt trời CTC','thiết bị điện mặt trời')} và ${link('/news','Tin tức năng lượng tái tạo CTC','tin tức năng lượng tái tạo')}.</p>`,
  },
  {
    title: 'Điện mặt trời áp mái Nhà máy Thiện Hoàng',
    location: 'Nhơn Hòa, Bình Định',
    capacity: '1,5 MWp',
    completionDate: 'Đã hoàn thành',
    investor: 'Nhà máy Thiện Hoàng',
    scope: 'Thi công hệ thống điện mặt trời áp mái công nghiệp cho khu vực nhà máy.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
    htmlDescription: `<h2>Điện mặt trời áp mái Nhà máy Thiện Hoàng</h2><p><strong>Dự án điện mặt trời áp mái Nhà máy Thiện Hoàng</strong> được CTC triển khai tại khu vực Nhơn Hòa, Bình Định, với <strong>công suất 1,5 MWp</strong>. Hệ thống được triển khai trên khu vực mái nhà máy nhằm khai thác nguồn năng lượng mặt trời và ứng dụng năng lượng tái tạo trong hoạt động sản xuất.</p><p>Phạm vi CTC ghi nhận là <strong>thi công hệ thống điện mặt trời áp mái công nghiệp cho khu vực nhà máy</strong>. Quy mô 1,5 MWp thể hiện kinh nghiệm của CTC trong triển khai hệ thống điện mặt trời áp mái công nghiệp quy mô lớn.</p><p>Khám phá ${link('/solutions','Giải pháp điện mặt trời CTC','giải pháp điện mặt trời')} và ${link('/products','Thiết bị năng lượng mặt trời CTC','thiết bị năng lượng mặt trời')}.</p>`,
  },
  {
    title: 'Farm Solar Gio Linh',
    location: 'Gio Linh, Quảng Trị',
    capacity: '4 MWp',
    completionDate: 'Đã hoàn thành',
    scope: 'Tham gia triển khai dự án điện mặt trời mặt đất quy mô 4 MWp.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
    htmlDescription: `<h2>Farm Solar Gio Linh</h2><p><strong>Farm Solar Gio Linh</strong> là dự án điện mặt trời mặt đất có <strong>công suất 4 MWp</strong>, được CTC ghi nhận trong hồ sơ năng lực tại Gio Linh, Quảng Trị. Với quy mô 4 MWp, dự án thuộc nhóm công trình điện mặt trời quy mô lớn.</p><p>CTC ghi nhận phạm vi <strong>tham gia triển khai dự án điện mặt trời mặt đất quy mô 4 MWp</strong>. Công trình thể hiện kinh nghiệm của CTC trong các dự án Solar Farm và hệ thống năng lượng tái tạo quy mô MW.</p><p>Khám phá ${link('/solutions','Giải pháp Solar EPC CTC','giải pháp Solar EPC')}, ${link('/products','Sản phẩm điện mặt trời CTC','sản phẩm điện mặt trời')} và ${link('/news','Tin tức năng lượng tái tạo CTC','tin tức năng lượng tái tạo')}.</p>`,
  },
  {
    title: 'Điện mặt trời áp mái Nhà máy Max Packaging',
    location: 'KCN Bắc Chu Lai, Núi Thành, Quảng Nam',
    capacity: '600 kWp',
    completionDate: 'Đã hoàn thành',
    investor: 'Nhà máy Max Packaging',
    scope: 'Thi công hệ thống điện mặt trời áp mái nhà xưởng tại KCN Bắc Chu Lai.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
    htmlDescription: `<h2>Điện mặt trời áp mái Nhà máy Max Packaging</h2><p><strong>Dự án điện mặt trời áp mái Nhà máy Max Packaging</strong> được CTC triển khai tại Khu công nghiệp Bắc Chu Lai, Núi Thành, Quảng Nam, với <strong>công suất 600 kWp</strong>. Hệ thống được triển khai trên mái nhà xưởng nhằm tận dụng diện tích công trình và khai thác nguồn năng lượng mặt trời.</p><p>Phạm vi dự án gồm <strong>thi công hệ thống điện mặt trời áp mái nhà xưởng tại KCN Bắc Chu Lai</strong>. Đây là công trình thể hiện kinh nghiệm của CTC trong triển khai điện mặt trời áp mái cho khách hàng công nghiệp và nhà máy.</p><p>Tìm hiểu ${link('/solutions','Giải pháp Solar EPC CTC','giải pháp Solar EPC')}, ${link('/products','Sản phẩm và thiết bị điện mặt trời CTC','sản phẩm và thiết bị điện mặt trời')} và ${link('/news','Tin tức CTC','tin tức CTC')}.</p>`,
  },
  {
    title: 'Điện mặt trời áp mái Nhà máy Dệt may Châu Giang',
    location: 'Nam Lý, Ninh Bình',
    capacity: '3 MWp',
    completionDate: 'Đã hoàn thành',
    investor: 'Nhà máy Dệt may Châu Giang',
    scope: 'Triển khai hệ thống điện mặt trời áp mái công nghiệp quy mô lớn cho nhà máy dệt may.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
    htmlDescription: `<h2>Điện mặt trời áp mái Nhà máy Dệt may Châu Giang</h2><p><strong>Dự án điện mặt trời áp mái Nhà máy Dệt may Châu Giang</strong> được CTC triển khai tại Nam Lý, Ninh Bình, với <strong>công suất 3 MWp</strong>. Hệ thống khai thác diện tích mái nhà máy để phát triển nguồn năng lượng mặt trời phục vụ định hướng sử dụng năng lượng tái tạo trong sản xuất.</p><p>Phạm vi dự án được ghi nhận là <strong>triển khai hệ thống điện mặt trời áp mái công nghiệp quy mô lớn cho nhà máy dệt may</strong>. Với công suất 3 MWp, dự án thể hiện năng lực của CTC trong các công trình điện mặt trời quy mô MW.</p><p>Khám phá ${link('/solutions','Giải pháp năng lượng tái tạo CTC','giải pháp năng lượng tái tạo')}, ${link('/products','Thiết bị điện mặt trời CTC','thiết bị điện mặt trời')} và ${link('/news','Tin tức năng lượng tái tạo CTC','tin tức chuyên ngành')}.</p>`,
  },
  {
    title: 'Điện mặt trời áp mái Công ty TNHH Dệt Quốc tế Coco Việt Nam - Giai đoạn 1',
    location: 'KCN Đất Đỏ, TP. Hồ Chí Minh',
    capacity: '2.531 kWp',
    completionDate: 'Đã hoàn thành',
    investor: 'Công ty TNHH Dệt Quốc tế Coco Việt Nam',
    scope: 'Triển khai giai đoạn 1 hệ thống điện mặt trời áp mái cho nhà máy dệt.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - phần Solar cuối hồ sơ',
    htmlDescription: `<h2>Điện mặt trời áp mái Công ty TNHH Dệt Quốc tế Coco Việt Nam - Giai đoạn 1</h2><p><strong>Dự án điện mặt trời áp mái Công ty TNHH Dệt Quốc tế Coco Việt Nam - Giai đoạn 1</strong> được CTC triển khai tại Khu công nghiệp Đất Đỏ, TP. Hồ Chí Minh, với <strong>công suất 2.531 kWp</strong>. Dự án thuộc nhóm hệ thống điện mặt trời quy mô lớn dành cho khách hàng công nghiệp.</p><p>Phạm vi được hồ sơ năng lực ghi nhận là <strong>triển khai giai đoạn 1 hệ thống điện mặt trời áp mái cho nhà máy dệt</strong>. Công trình thể hiện kinh nghiệm của CTC trong triển khai giải pháp điện mặt trời cho nhà máy và doanh nghiệp sản xuất.</p><p>Tìm hiểu thêm ${link('/solutions','Giải pháp Solar EPC CTC','giải pháp Solar EPC')}, ${link('/products','Sản phẩm và thiết bị điện mặt trời CTC','sản phẩm và thiết bị điện mặt trời')} và ${link('/news','Tin tức năng lượng tái tạo CTC','tin tức năng lượng tái tạo')}.</p>`,
  },
  {
    title: 'Hệ thống điện mặt trời mái nhà Công ty Gỗ Thành Đạt',
    location: 'Việt Nam',
    capacity: '1.000 kWp',
    completionDate: 'Đã thực hiện xong',
    investor: 'Công ty Gỗ Thành Đạt',
    contractValue: '1.600 triệu đồng',
    scope: 'Cung cấp nhân công và vật tư phụ cho hệ thống điện mặt trời mái nhà.',
    featured: true,
    sourceReference: 'HSNL 06.2026 - hợp đồng thương mại số 35',
    htmlDescription: `<h2>Hệ thống điện mặt trời mái nhà Công ty Gỗ Thành Đạt</h2><p><strong>Hệ thống điện mặt trời mái nhà Công ty Gỗ Thành Đạt</strong> là dự án năng lượng tái tạo có <strong>công suất 1.000 kWp</strong>, được ghi nhận trong hồ sơ năng lực CTC và đã thực hiện xong. Dự án hướng đến việc ứng dụng nguồn năng lượng mặt trời trên hệ thống mái nhà của doanh nghiệp.</p><p>Phạm vi CTC thực hiện gồm <strong>cung cấp nhân công và vật tư phụ cho hệ thống điện mặt trời mái nhà</strong>. Với quy mô 1 MWp, dự án bổ sung kinh nghiệm của CTC trong việc tham gia triển khai hệ thống điện mặt trời mái nhà cho khách hàng doanh nghiệp.</p><p>Khám phá ${link('/solutions','Giải pháp điện mặt trời CTC','giải pháp điện mặt trời')}, ${link('/products','Sản phẩm và thiết bị điện mặt trời CTC','sản phẩm và thiết bị điện mặt trời')} và ${link('/news','Tin tức năng lượng tái tạo CTC','tin tức năng lượng tái tạo')}. Khách hàng có nhu cầu khảo sát và tư vấn có thể ${link('/contact','Liên hệ CTC tư vấn điện mặt trời','liên hệ CTC')} để được hỗ trợ.</p>`,
  },
];

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function clampText(text: string, max = 220): string {
  const value = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return value.length <= max ? value : `${value.slice(0, max - 1).trim()}…`;
}

function createSeo(seed: SolarProject, slug: string, imageAlt: string) {
  const metaTitle = `${seed.title} | ${seed.capacity} | CTC Solar`;
  const metaDescription = clampText(
    `${seed.title} tại ${seed.location}, công suất ${seed.capacity}. CTC tham gia triển khai giải pháp điện mặt trời và năng lượng tái tạo.`,
    155,
  );

  return {
    metaTitle,
    metaDescription,
    focusKeyword: `${seed.title}`,
    secondaryKeywords: [
      'điện mặt trời CTC',
      'điện mặt trời áp mái',
      'điện mặt trời công nghiệp',
      'năng lượng tái tạo',
      'Solar EPC',
      seed.location,
      seed.capacity,
    ],
    canonicalPath: `/projects/${slug}`,
    imageAlt,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    robotsIndex: true,
    robotsFollow: true,
  };
}

function createStructuredData(seed: SolarProject, slug: string, image: string) {
  const url = `${SITE_URL}/projects/${slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Project',
    name: seed.title,
    description: clampText(seed.htmlDescription, 500),
    url,
    image,
    location: {
      '@type': 'Place',
      name: seed.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: seed.location,
        addressCountry: 'VN',
      },
    },
    sponsor: {
      '@type': 'Organization',
      name: 'Công ty Cổ phần Xây lắp Bưu Điện Miền Trung',
      url: SITE_URL,
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Công suất',
        value: seed.capacity,
      },
      {
        '@type': 'PropertyValue',
        name: 'Danh mục',
        value: CATEGORY.name,
      },
    ],
  };
}

function buildDocument(seed: SolarProject, index: number, categoryId: Schema.Types.ObjectId) {
  const slug = slugify(seed.title);
  const image = SOLAR_IMAGES[index % SOLAR_IMAGES.length];
  const imageAlt = `${seed.title} tại ${seed.location} - dự án điện mặt trời CTC`;
  const description = seed.htmlDescription.trim();

  const content = [
    '# Tổng quan dự án',
    `${seed.title} là dự án thuộc danh mục Điện Mặt Trời được ghi nhận trong Hồ sơ năng lực CTC 06/2026. Địa điểm: ${seed.location}. Công suất: ${seed.capacity}.`,
    '',
    '# Quy mô và phạm vi',
    `- Công suất: ${seed.capacity}`,
    `- Phạm vi CTC tham gia: ${seed.scope}`,
    seed.investor ? `- Chủ đầu tư/đơn vị liên quan: ${seed.investor}` : '',
    seed.contractValue ? `- Giá trị ghi trong hồ sơ: ${seed.contractValue}` : '',
    '',
    '# Nguồn thông tin',
    `Thông tin dự án được biên tập từ ${seed.sourceReference}.`,
  ].filter(Boolean).join('\n');

  return {
    title: seed.title,
    slug,
    pageType: 'verified-project',
    location: seed.location,
    capacity: seed.capacity,
    completionDate: seed.completionDate,
    image: image.url,
    imageAlt,
    imageCredit: image.credit,
    excerpt: clampText(`${seed.title} tại ${seed.location}, quy mô ${seed.capacity}. ${seed.scope}`, 220),
    description,
    content,
    investor: seed.investor || '',
    contractValue: seed.contractValue || '',
    scope: seed.scope,
    projectStatus: 'Đã hoàn thành',
    categoryId,
    category: CATEGORY.name,
    categorySlug: CATEGORY.slug,
    featured: Boolean(seed.featured),
    verified: true,
    isPublished: true,
    geo: {
      country: 'Việt Nam',
      countryCode: 'VN',
      provinceCurrent: '',
      provinceCode: '',
      provinceLegacy: '',
      locality: seed.location,
      address: seed.location,
      geoSlug: slugify(seed.location),
    },
    seo: createSeo(seed, slug, imageAlt),
    source: {
      type: 'HSNL-06-2026',
      reference: seed.sourceReference,
      note: 'Dự án xác thực từ hồ sơ năng lực CTC 06/2026. Không tự bổ sung thông số kỹ thuật ngoài hồ sơ.',
    },
    structuredData: createStructuredData(seed, slug, image.url),
  };
}

async function seedSolar() {
  console.log('🔌 Kết nối MongoDB...');
  await mongoose.connect(MONGO_URI);

  try {
    console.log('📁 Tạo/cập nhật danh mục Điện Mặt Trời...');
    const category = await ProjectCategory.findOneAndUpdate(
      { slug: CATEGORY.slug },
      {
        $set: {
          name: CATEGORY.name,
          slug: CATEGORY.slug,
          description: CATEGORY.description,
          icon: CATEGORY.icon,
          color: CATEGORY.color,
          order: CATEGORY.order,
          isActive: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (!category?._id) {
      throw new Error('Không tạo/đọc được category Điện Mặt Trời.');
    }

    console.log('🧹 Xóa các dự án Solar cũ...');
    await Project.deleteMany({ categorySlug: CATEGORY.slug });

    const documents = SOLAR_PROJECTS.map((project, index) =>
      buildDocument(project, index, category._id),
    );

    const slugs = documents.map((item) => item.slug);
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicates.length) {
      throw new Error(`Slug trùng: ${[...new Set(duplicates)].join(', ')}`);
    }

    console.log(`🌱 Đang seed ${documents.length} dự án Solar...`);
    const inserted = await Project.insertMany(documents);

    const projectCount = await Project.countDocuments({
      categoryId: category._id,
      isPublished: true,
    });

    await ProjectCategory.updateOne(
      { _id: category._id },
      { $set: { projectCount } },
    );

    console.log('');
    console.log('✅ SEED SOLAR HOÀN TẤT');
    console.log(`   - Danh mục: ${CATEGORY.name}`);
    console.log(`   - Số dự án: ${inserted.length}`);
    console.log(`   - Dự án published: ${projectCount}`);
    console.log('');
    SOLAR_PROJECTS.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.title} | ${project.capacity}`);
    });
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã đóng kết nối MongoDB.');
  }
}

seedSolar().catch((error) => {
  console.error('❌ Seed Solar thất bại:', error);
  process.exit(1);
});
