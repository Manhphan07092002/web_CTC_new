/**
 * SEO Meta & Content Injection Middleware
 * 
 * Giải quyết triệt để các vấn đề SEO cho SPA (React):
 * 1. Đọc dist/index.html làm template
 * 2. Thay thế <title>, <meta description>, <link canonical>, OG tags động theo từng URL
 * 3. Inject nội dung thực dạng <noscript> vào HTML server-rendered (để Googlebot thấy dữ liệu thật kể cả khi không chạy JS)
 * 4. Inject JSON-LD Structured Data (Product, NewsArticle, Organization, ItemList, CollectionPage, BreadcrumbList) server-side
 * 5. Trả HTTP 404 cho URL không tồn tại (chống Soft 404)
 * 6. Redirect 301 product/project URL dạng ObjectID sang URL slug-hash
 * 7. Redirect 301 legacy URL dạng /hoat_dong_chi_tiet sang /news
 * 8. Redirect 301 legacy URL /solutions/floating sang /solutions/telecom
 * 9. Hỗ trợ SEO cho các URL danh mục sản phẩm tĩnh (/products/router, /products/switch, /products/inverter...)
 */

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { Product, Project, News } from '../../models';

const SITE_URL = process.env.SITE_URL || 'https://ctcdn.vn';
const SITE_NAME = 'CTC';

// ─── Helper: tạo slug từ tiếng Việt ────────────────────────────
function createSlug(str: string, fallback = 'trang'): string {
  if (!str) return fallback;
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─── Helper: escape HTML special chars ──────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Static Page Meta Map ───────────────────────────────────────
interface PageMeta {
  title: string;
  description: string;
  noindex?: boolean;
}

const STATIC_PAGES: Record<string, PageMeta> = {
  '/': {
    title: 'CTC | Tổng thầu EPC điện mặt trời & hạ tầng viễn thông',
    description: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC) — Nhà thầu EPC điện mặt trời áp mái, hạ tầng viễn thông, cáp quang, thiết bị mạng doanh nghiệp, trạm 110kV và Data Center toàn quốc.'
  },
  '/about': {
    title: 'Giới thiệu Công ty Xây lắp Bưu điện Miền Trung | CTC',
    description: 'Tìm hiểu về Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC) — năng lực thi công, chứng chỉ hành nghề, đội ngũ kỹ sư và lịch sử phát triển từ năm 2004.'
  },
  '/products': {
    title: 'Thiết bị viễn thông, CNTT & điện mặt trời | CTC',
    description: 'Cung cấp thiết bị mạng Ruijie, MikroTik, DrayTek, cáp mạng Dintek, thiết bị quang, inverter Huawei, Sungrow, UPS và ắc quy viễn thông chính hãng tại Đà Nẵng.'
  },
  '/solutions': {
    title: 'Giải pháp điện, viễn thông & xây dựng công nghiệp | CTC',
    description: 'Giải pháp tổng thầu EPC điện mặt trời áp mái, thi công hạ tầng viễn thông, đường dây & trạm biến áp 110kV, Data Center và xây dựng dân dụng công nghiệp.'
  },
  '/solutions/rooftop': {
    title: 'Điện mặt trời áp mái nhà xưởng – Tổng thầu EPC | CTC',
    description: 'Dịch vụ thiết kế, cung cấp và thi công (EPC) hệ thống điện mặt trời áp mái cho nhà xưởng, khu công nghiệp và doanh nghiệp. Tiết kiệm đến 80% chi phí điện.'
  },
  '/solutions/farm': {
    title: 'Giải Pháp Điện Gió & Trang Trại Năng Lượng Tái Tạo | CTC',
    description: 'Tư vấn, thiết kế và thi công trang trại điện gió, nhà máy điện mặt trời mặt đất quy mô lớn từ CTC.'
  },
  '/solutions/telecom': {
    title: 'Thi công hạ tầng viễn thông & cáp quang toàn quốc | CTC',
    description: 'Dịch vụ thi công hạ tầng viễn thông, mạng cáp quang, trạm BTS, mạng ngoại vi và hệ thống CNTT từ CTC — đơn vị có chứng chỉ Viễn thông Hạng I.'
  },
  '/solutions/electrical': {
    title: 'Thi công đường dây & trạm biến áp 110kV | CTC',
    description: 'Thiết kế và thi công đường dây truyền tải điện, trạm biến áp 110kV/220kV. Chứng chỉ năng lực xây dựng Hạng II.'
  },
  '/solutions/datacenter': {
    title: 'Thiết Kế & Thi Công Data Center Chuẩn Quốc Tế | CTC',
    description: 'Giải pháp thiết kế, xây dựng và vận hành trung tâm dữ liệu (Data Center), hạ tầng số, phòng máy chủ và hệ thống làm mát.'
  },
  '/solutions/construction': {
    title: 'Xây dựng nhà xưởng & công trình công nghiệp | CTC',
    description: 'Dịch vụ xây dựng, cải tạo công trình dân dụng và công nghiệp: bưu điện, trường học, nhà xưởng, văn phòng từ CTC.'
  },
  '/projects': {
    title: 'Dự án điện mặt trời & hạ tầng viễn thông | CTC',
    description: 'Danh sách dự án tiêu biểu đã hoàn thành: điện mặt trời, hạ tầng viễn thông, trạm biến áp, Data Center và xây dựng dân dụng trên toàn quốc.'
  },
  '/news': {
    title: 'Tin điện mặt trời, viễn thông & hạ tầng | CTC',
    description: 'Cập nhật tin tức mới nhất về năng lượng tái tạo, thiết bị mạng, viễn thông, hướng dẫn kỹ thuật và báo giá thiết bị từ CTC.'
  },
  '/contact': {
    title: 'Liên hệ CTC – Tư vấn dự án và yêu cầu báo giá | CTC',
    description: 'Liên hệ Công ty CTC tại 50B Nguyễn Du, Hải Châu, Đà Nẵng. Hotline: 0915 059 666, Tổng đài: 0236 3745 555. Email: info@ctcdn.vn. Nhận tư vấn và báo giá miễn phí.'
  },
  '/resources': {
    title: 'Tài liệu điện mặt trời & hạ tầng viễn thông | CTC',
    description: 'Tải tài liệu kỹ thuật, catalogue sản phẩm, datasheet thiết bị mạng, hồ sơ năng lực và hướng dẫn lắp đặt từ CTC.'
  },
  // Trang noindex
  '/cart': {
    title: 'Giỏ Hàng & Báo Giá | CTC',
    description: 'Xem giỏ hàng và nhận báo giá chi tiết.',
    noindex: true
  },
  '/track-order': {
    title: 'Tra Cứu Đơn Hàng | CTC',
    description: 'Tra cứu trạng thái đơn hàng.',
    noindex: true
  },
  '/search': {
    title: 'Tìm Kiếm | CTC',
    description: 'Kết quả tìm kiếm trên hệ thống CTC.',
    noindex: true
  },
  '/admin': {
    title: 'Quản Trị Hệ Thống | CTC',
    description: 'Trang quản trị hệ thống.',
    noindex: true
  },
  '/admin/login': {
    title: 'Đăng Nhập Quản Trị | CTC',
    description: 'Trang đăng nhập quản trị hệ thống.',
    noindex: true
  }
};

// ─── Product Category SEO Map ────────────────────────────────────
interface CategorySEO {
  title: string;
  h1: string;
  description: string;
  intro: string;
}

const PRODUCT_CATEGORY_MAP: Record<string, CategorySEO> = {
  'router': {
    title: 'Router Doanh Nghiệp Chính Hãng — MikroTik, DrayTek, Ruijie | CTC',
    h1: 'Router Doanh Nghiệp & Thiết Bị Cân Bằng Tải Chính Hãng',
    description: 'Cung cấp Router MikroTik, DrayTek Vigor, Ruijie cân bằng tải nhiều WAN, hỗ trợ VPN tốc độ cao cho doanh nghiệp và nhà máy tại Đà Nẵng.',
    intro: 'Danh mục Router doanh nghiệp bao gồm các thiết bị định tuyến và cân bằng tải chính hãng từ MikroTik, DrayTek, Ruijie. Hỗ trợ gộp băng thông nhiều đường truyền Internet, thiết lập VPN bảo mật kết nối chi nhánh, quản lý băng thông QoS chuyên nghiệp cho tòa nhà, nhà xưởng và văn phòng.'
  },
  'switch': {
    title: 'Switch Chia Mạng PoE & Core Switch Chính Hãng | CTC',
    h1: 'Switch Mạng PoE, Layer 2/Layer 3 & Core Switch',
    description: 'Báo giá Switch PoE 8/16/24/48 cổng Ruijie, Cisco, TP-Link, MikroTik chính hãng. Quản lý VLAN, IGMP Snooping, bảo hành 36 tháng.',
    intro: 'Chuyên phân phối Switch chia mạng Layer 2, Layer 3, Switch PoE cấp nguồn cho Camera IP, Wi-Fi AP và Switch quang Core Switch cho trung tâm dữ liệu. Đầy đủ CO/CQ, hỗ trợ kỹ thuật tận nơi.'
  },
  'access-point': {
    title: 'Bộ Phát Wi-Fi Doanh Nghiệp Wi-Fi 6 / Wi-Fi 7 | CTC',
    h1: 'Bộ Phát Wi-Fi Doanh Nghiệp & Wi-Fi Chuyên Dụng',
    description: 'Cung cấp Wi-Fi Access Point Ruijie Reyee, Aruba, UniFi chuẩn Wi-Fi 6/7 chịu tải cao cho khách sạn, nhà xưởng, văn phòng.',
    intro: 'Hệ thống Wi-Fi doanh nghiệp cao cấp hỗ trợ Roaming không gián đoạn, quản lý Cloud miễn phí, chịu tải hàng trăm truy cập đồng thời. Phù hợp cho nhà máy, khách sạn, resort, trường học.'
  },
  'sfp': {
    title: 'Module Quang SFP, SFP+, QSFP+ Chính Hãng | CTC',
    h1: 'Module Quang SFP / SFP+ 1G, 10G, 40G, 100G',
    description: 'Module quang SFP 1.25G, SFP+ 10G Singlemode / Multimode 10km, 20km, 40km tương thích Ruijie, Cisco, MikroTik, HP.',
    intro: 'Cung cấp Module quang SFP/SFP+ chính hãng tốc độ 1Gbps, 10Gbps, 40Gbps, 100Gbps. Truyền dẫn qua sợi cáp quang Singlemode và Multimode với khoảng cách từ 550m đến 80km.'
  },
  'odf': {
    title: 'Hộp Phối Quang ODF 4, 8, 12, 24, 48, 96 Cổng | CTC',
    h1: 'Hộp Phối Quang ODF Gắn Tủ Rack & Treo Tường',
    description: 'Phân phối ODF quang 4 đến 96 core đầy đủ phụ kiện Dây hàn, Adapter LC/SC/ST, Khay nối quang cho hạ tầng viễn thông.',
    intro: 'Hộp phối quang ODF vỏ thép sơn tĩnh điện bảo vệ mối nối cáp quang an toàn tuyệt đối. Đa dạng chuẩn kết nối SC, LC, FC, ST cho trạm viễn thông và phòng máy chủ.'
  },
  'inverter': {
    title: 'Biến Tần Inverter Điện Mặt Trời Huawei, Sungrow, Deye | CTC',
    h1: 'Inverter Điện Mặt Trời Hòa Lưới & Hybrid Doanh Nghiệp',
    description: 'Đại lý phân phối Inverter hòa lưới 5kW - 110kW Huawei SUN2000, Sungrow, Deye, SMA. Hiệu suất 98.6%, bảo hành 5 năm.',
    intro: 'Bộ biến tần Inverter điện mặt trời chuyển đổi dòng điện một chiều DC từ tấm pin sang AC hòa lưới điện quốc gia. Công nghệ theo dõi điểm công suất cực đại MPPT kép, giám sát từ xa qua App di động.'
  },
  'tam-pin-nang-luong-mat-troi': {
    title: 'Tấm Pin Năng Lượng Mặt Trời Jinko, JA Solar, Canadian | CTC',
    h1: 'Tấm Pin Mặt Trời Công Suất Cao 550W - 700W Tier 1',
    description: 'Báo giá tấm pin năng lượng mặt trời Jinko Solar, JA Solar, Longi, Canadian Solar N-Type TOPCon 550W+, bảo hành hiệu suất 25-30 năm.',
    intro: 'Cung cấp các dòng tấm pin năng lượng mặt trời xếp hạng Tier 1 thế giới với công nghệ N-Type TOPCon, Half-cell, Perc hai mặt kính. Hiệu suất quang năng vượt trội, độ bền cao trước khí hậu khắc nghiệt.'
  },
  'ac-quy': {
    title: 'Ắc Quy Viễn Thông & Pin Lưu Trữ Lithium LiFePO4 | CTC',
    h1: 'Ắc Quy Viễn Thông & Pin Lưu Trữ Điện Lithium',
    description: 'Ắc quy AGM xả sâu Vision, Telecom và Pin Lithium LiFePO4 48V 100Ah/200Ah cho trạm BTS viễn thông và hệ thống Solar Hybrid.',
    intro: 'Hệ thống pin lưu trữ điện năng Lithium và ắc quy viễn thông chuyên dụng. Tuổi thọ xả sâu cao, cung cấp nguồn điện dự phòng liên tục cho trạm phát sóng viễn thông, trung tâm dữ liệu và hệ điện mặt trời lưu trữ.'
  }
};

function isMongoObjectId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

// ─── HTML Template Injection (Meta, Body Noscript & JSON-LD) ──
function injectMeta(
  html: string,
  meta: PageMeta,
  urlPath: string,
  extraBodyContent?: string,
  jsonLdSchema?: object | object[]
): string {
  const fullTitle = meta.title.includes(SITE_NAME) ? meta.title : `${meta.title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${urlPath}`;
  const robotsContent = meta.noindex ? 'noindex, follow' : 'index, follow';
  const escapedTitle = escapeHtml(fullTitle);
  const escapedDesc = escapeHtml(meta.description);

  let result = html;

  // Replace <title>
  result = result.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapedTitle}</title>`
  );

  // Replace or inject <meta name="description">
  if (result.includes('<meta name="description"')) {
    result = result.replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapedDesc}" />`
    );
  } else {
    result = result.replace('</head>', `    <meta name="description" content="${escapedDesc}" />\n  </head>`);
  }

  // Inject <link rel="canonical"> (before </head>)
  if (!result.includes('rel="canonical"')) {
    result = result.replace('</head>', `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  // Inject robots meta tag
  result = result.replace('</head>', `    <meta name="robots" content="${robotsContent}" />\n  </head>`);

  // Inject Open Graph tags (before </head>)
  const ogTags = `    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDesc}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="CTC — Xây lắp Bưu điện Miền Trung" />
    <meta property="og:locale" content="vi_VN" />
`;
  result = result.replace('</head>', `${ogTags}  </head>`);

  // Inject JSON-LD Schema if provided
  if (jsonLdSchema) {
    const jsonLdStr = JSON.stringify(jsonLdSchema, null, 2);
    const schemaScript = `    <script type="application/ld+json">\n${jsonLdStr}\n    </script>\n`;
    result = result.replace('</head>', `${schemaScript}  </head>`);
  }

  // Inject extra body content inside <noscript> for server-rendered data fallback
  if (extraBodyContent) {
    const noscriptBlock = `\n    <noscript>\n      ${extraBodyContent}\n    </noscript>\n  `;
    result = result.replace('</body>', `${noscriptBlock}</body>`);
  }

  return result;
}

// ─── Main Middleware ────────────────────────────────────────────
export function createSeoInjectMiddleware(distPath: string) {
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log('⚠️ SEO Inject: dist/index.html not found, middleware disabled');
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  // Cache template in memory
  let htmlTemplate = fs.readFileSync(indexPath, 'utf-8');

  // Watch for changes in dev mode
  if (process.env.NODE_ENV !== 'production') {
    fs.watchFile(indexPath, () => {
      try {
        htmlTemplate = fs.readFileSync(indexPath, 'utf-8');
        console.log('🔄 SEO Inject: Template reloaded');
      } catch (e) {}
    });
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip non-GET or non-HTML requests
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    // Skip static assets
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|webp|mp4|webm|json|xml|txt)$/)) {
      return next();
    }

    const urlPath = req.path.replace(/\/+$/, '') || '/'; // normalize trailing slash

    // ── Legacy URL 301 Redirects ────────────────────────────
    if (urlPath === '/solutions/floating') {
      return res.redirect(301, '/solutions/telecom');
    }
    if (urlPath.includes('hoat_dong_chi_tiet')) {
      return res.redirect(301, '/news');
    }
    if (urlPath.includes('tinh_hinh_tai_chinh') || urlPath.includes('/image/pdf')) {
      return res.redirect(301, '/about');
    }

    try {
      // ── 1. Homepage (/) ────────────────────────────────────
      if (urlPath === '/') {
        const meta = STATIC_PAGES['/'];
        const orgSchema = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
          "legalName": "CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG",
          "alternateName": ["CTC", "CTC Đà Nẵng", "CTC Miền Trung", "CTC EPC Solar", "CTC Hạ tầng Viễn thông"],
          "url": SITE_URL,
          "logo": `${SITE_URL}/uploads/images/logo/logodo.png`,
          "taxID": "0400458940",
          "foundingDate": "2004-01-30",
          "description": meta.description,
          "telephone": "+84-915-059-666",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "50B Nguyễn Du, Phường Hải Châu",
            "addressLocality": "Đà Nẵng",
            "addressCountry": "VN"
          },
          "contactPoint": [
            {
              "@type": "ContactPoint",
              "telephone": "+84-915-059-666",
              "contactType": "sales",
              "availableLanguage": ["Vietnamese", "English"]
            },
            {
              "@type": "ContactPoint",
              "telephone": "+84-236-3745-555",
              "contactType": "customer service",
              "availableLanguage": ["Vietnamese"]
            }
          ]
        };

        const noscriptHtml = `
          <div style="padding: 20px; font-family: sans-serif;">
            <h1>Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)</h1>
            <p>Tổng thầu EPC điện mặt trời áp mái, hạ tầng viễn thông, cáp quang, Data Center và trạm biến áp 110kV tại Đà Nẵng và trên toàn quốc.</p>
            <h2>Dịch Vụ & Giải Pháp Chính</h2>
            <ul>
              <li><a href="/solutions/rooftop">Điện mặt trời áp mái nhà xưởng & doanh nghiệp</a></li>
              <li><a href="/solutions/telecom">Thi công hạ tầng viễn thông & cáp quang</a></li>
              <li><a href="/solutions/electrical">Thi công đường dây & trạm biến áp 110kV</a></li>
              <li><a href="/solutions/datacenter">Thiết kế & thi công Data Center chuẩn quốc tế</a></li>
              <li><a href="/products">Cung cấp thiết bị mạng, Switch, Router, Inverter chính hãng</a></li>
            </ul>
          </div>
        `;

        const html = injectMeta(htmlTemplate, meta, urlPath, noscriptHtml, orgSchema);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).send(html);
      }

      // ── 2. Products Listing (/products) ─────────────────────
      if (urlPath === '/products') {
        const meta = STATIC_PAGES['/products'];

        let products: any[] = [];
        try {
          products = await Product.find({ isDeleted: { $ne: true } })
            .select('_id name slug shortDescription price category brand')
            .limit(24)
            .lean();
        } catch (e) {}

        const productItemsHtml = products.map(p => {
          const fullId = (p._id || '').toString();
          const shortHash = fullId.length >= 8 ? fullId.slice(-8) : fullId;
          const slugStr = (p as any).slug || createSlug((p as any).name, 'san-pham');
          const pUrl = `/products/${slugStr}-${shortHash}`;
          return `
            <li style="margin-bottom: 12px;">
              <a href="${pUrl}" style="font-weight: bold; color: #007cb9;">${escapeHtml((p as any).name)}</a>
              <p style="margin: 4px 0; color: #555;">${escapeHtml((p as any).shortDescription || '')}</p>
            </li>`;
        }).join('');

        const noscriptHtml = `
          <div style="padding: 20px; font-family: sans-serif;">
            <h1>Danh Sách Thiết Bị Mạng & Viễn Thông Chính Hãng | CTC</h1>
            <p>Cung cấp Switch, Router, Cáp Quang, Inverter Solar, UPS, ắc quy viễn thông từ Ruijie, MikroTik, DrayTek, Huawei, Sungrow.</p>
            <h2>Danh Mục Sản Phẩm Phổ Biến</h2>
            <ul>
              <li><a href="/products/router">Router & Thiết bị cân bằng tải</a></li>
              <li><a href="/products/switch">Switch chia mạng & Switch PoE</a></li>
              <li><a href="/products/access-point">Bộ phát Wi-Fi doanh nghiệp</a></li>
              <li><a href="/products/sfp">Module quang SFP / SFP+</a></li>
              <li><a href="/products/odf">Hộp phối quang ODF</a></li>
              <li><a href="/products/inverter">Biến tần Inverter hòa lưới Solar</a></li>
              <li><a href="/products/tam-pin-nang-luong-mat-troi">Tấm pin năng lượng mặt trời</a></li>
              <li><a href="/products/ac-quy">Ắc quy viễn thông & Pin Lithium</a></li>
            </ul>
            <h2>Sản Phẩm Mới Nhất</h2>
            <ul style="list-style: none; padding-left: 0;">
              ${productItemsHtml}
            </ul>
          </div>
        `;

        const itemListSchema = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Danh sách thiết bị mạng & viễn thông CTC",
          "numberOfItems": products.length,
          "itemListElement": products.map((p, idx) => {
            const fullId = (p._id || '').toString();
            const shortHash = fullId.length >= 8 ? fullId.slice(-8) : fullId;
            const slugStr = (p as any).slug || createSlug((p as any).name, 'san-pham');
            return {
              "@type": "ListItem",
              "position": idx + 1,
              "name": (p as any).name,
              "url": `${SITE_URL}/products/${slugStr}-${shortHash}`
            };
          })
        };

        const html = injectMeta(htmlTemplate, meta, urlPath, noscriptHtml, itemListSchema);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).send(html);
      }

      // ── 2b. Product Category Static Pages (/products/:categorySlug)
      const catMatch = urlPath.match(/^\/products\/([a-z0-9-]+)$/);
      if (catMatch && PRODUCT_CATEGORY_MAP[catMatch[1]]) {
        const catSlug = catMatch[1];
        const catInfo = PRODUCT_CATEGORY_MAP[catSlug];
        
        let products: any[] = [];
        try {
          products = await Product.find({
            isDeleted: { $ne: true },
            $or: [
              { category: { $regex: new RegExp(catSlug, 'i') } },
              { categoryLabel: { $regex: new RegExp(catSlug, 'i') } },
              { name: { $regex: new RegExp(catSlug, 'i') } }
            ]
          }).select('_id name slug shortDescription price brand').limit(20).lean();
        } catch (e) {}

        const meta: PageMeta = {
          title: catInfo.title,
          description: catInfo.description
        };

        const productListHtml = products.map(p => {
          const fullId = (p._id || '').toString();
          const shortHash = fullId.length >= 8 ? fullId.slice(-8) : fullId;
          const slugStr = (p as any).slug || createSlug((p as any).name, 'san-pham');
          return `
            <li style="margin-bottom: 12px;">
              <a href="/products/${slugStr}-${shortHash}" style="font-weight: bold; color: #007cb9;">${escapeHtml((p as any).name)}</a>
              <p style="margin: 4px 0; color: #555;">${escapeHtml((p as any).shortDescription || '')}</p>
            </li>`;
        }).join('');

        const noscriptHtml = `
          <div style="padding: 20px; font-family: sans-serif;">
            <h1>${escapeHtml(catInfo.h1)}</h1>
            <p style="font-size: 1.05rem; line-height: 1.6;">${escapeHtml(catInfo.intro)}</p>
            <h2>Danh Sách Sản Phẩm ${escapeHtml(catInfo.h1)}</h2>
            <ul style="list-style: none; padding-left: 0;">
              ${productListHtml || '<li>Đang cập nhật danh sách sản phẩm...</li>'}
            </ul>
          </div>
        `;

        const collectionSchema = [
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": catInfo.h1,
            "description": catInfo.description,
            "url": `${SITE_URL}${urlPath}`
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": SITE_URL },
              { "@type": "ListItem", "position": 2, "name": "Sản phẩm", "item": `${SITE_URL}/products` },
              { "@type": "ListItem", "position": 3, "name": catInfo.h1, "item": `${SITE_URL}${urlPath}` }
            ]
          }
        ];

        const html = injectMeta(htmlTemplate, meta, urlPath, noscriptHtml, collectionSchema);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
      }

      // ── 3. Static Pages ─────────────────────────────────────
      if (STATIC_PAGES[urlPath]) {
        const meta = STATIC_PAGES[urlPath];
        const noscriptHtml = `
          <div style="padding: 20px; font-family: sans-serif;">
            <h1>${escapeHtml(meta.title)}</h1>
            <p>${escapeHtml(meta.description)}</p>
          </div>
        `;
        const html = injectMeta(htmlTemplate, meta, urlPath, noscriptHtml);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).send(html);
      }

      // ── 4. Product Detail Page (/products/:id) ──────────────
      const productMatch = urlPath.match(/^\/products\/(.+)$/);
      if (productMatch) {
        const param = productMatch[1];

        // If param is a pure MongoDB ObjectID → redirect 301 to slug URL
        if (isMongoObjectId(param)) {
          try {
            const product = await Product.findById(param).select('name slug _id').lean();
            if (product) {
              const fullId = (product._id || '').toString();
              const shortHash = fullId.length >= 8 ? fullId.slice(-8) : fullId;
              const slugStr = (product as any).slug || createSlug((product as any).name, 'san-pham');
              const newUrl = `/products/${slugStr}-${shortHash}`;
              return res.redirect(301, newUrl);
            }
          } catch (e) {}
          const meta: PageMeta = { title: 'Sản Phẩm Không Tồn Tại', description: 'Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.', noindex: true };
          return res.status(404).send(injectMeta(htmlTemplate, meta, urlPath));
        }

        // Slug-based URL
        let product: any = null;
        const hashMatch = param.match(/-([0-9a-f]{8})$/i);
        if (hashMatch) {
          const shortHash = hashMatch[1];
          try {
            const products = await Product.find({ isDeleted: { $ne: true } })
              .select('_id name slug shortDescription description price brand category images')
              .lean();
            product = products.find(p => (p._id || '').toString().endsWith(shortHash));
          } catch (e) {}
        }

        if (!product) {
          try {
            product = await Product.findOne({ slug: param, isDeleted: { $ne: true } })
              .select('_id name slug shortDescription description price brand category images')
              .lean();
          } catch (e) {}
        }

        if (!product) {
          try {
            product = await Product.findById(param).select('name slug shortDescription description price brand category images').lean();
          } catch (e) {}
        }

        if (product) {
          const pName = (product as any).name || 'Sản Phẩm';
          const pDesc = (product as any).shortDescription || `Mua ${pName} chính hãng tại CTC Đà Nẵng. Bảo hành chính hãng, giao hàng toàn quốc.`;
          const meta: PageMeta = {
            title: `${pName} | ${SITE_NAME}`,
            description: pDesc.substring(0, 160)
          };

          const productSchema = [
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": pName,
              "description": pDesc,
              "brand": { "@type": "Brand", "name": (product as any).brand || "CTC" },
              "offers": {
                "@type": "Offer",
                "url": `${SITE_URL}${urlPath}`,
                "priceCurrency": "VND",
                "price": (product as any).price || 0,
                "availability": "https://schema.org/InStock"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Sản phẩm", "item": `${SITE_URL}/products` },
                { "@type": "ListItem", "position": 3, "name": pName, "item": `${SITE_URL}${urlPath}` }
              ]
            }
          ];

          const noscriptHtml = `
            <div style="padding: 20px; font-family: sans-serif;">
              <h1>${escapeHtml(pName)}</h1>
              <p><strong>Thương hiệu:</strong> ${escapeHtml((product as any).brand || 'CTC')}</p>
              <p>${escapeHtml(pDesc)}</p>
              <div>${(product as any).description || ''}</div>
            </div>
          `;

          const html = injectMeta(htmlTemplate, meta, urlPath, noscriptHtml, productSchema);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(html);
        }

        // Product not found → 404
        const meta404: PageMeta = { title: 'Sản Phẩm Không Tồn Tại', description: 'Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.', noindex: true };
        return res.status(404).send(injectMeta(htmlTemplate, meta404, urlPath));
      }

      // ── 5. Project Detail Page (/projects/:id) ──────────────
      const projectMatch = urlPath.match(/^\/projects\/(.+)$/);
      if (projectMatch) {
        const param = projectMatch[1];

        if (isMongoObjectId(param)) {
          try {
            const project = await Project.findById(param).select('title slug _id').lean();
            if (project) {
              const fullId = (project._id || '').toString();
              const shortHash = fullId.length >= 8 ? fullId.slice(-8) : fullId;
              const slugStr = (project as any).slug || createSlug((project as any).title, 'du-an');
              return res.redirect(301, `/projects/${slugStr}-${shortHash}`);
            }
          } catch (e) {}
          const meta: PageMeta = { title: 'Dự Án Không Tồn Tại', description: 'Dự án bạn tìm kiếm không tồn tại.', noindex: true };
          return res.status(404).send(injectMeta(htmlTemplate, meta, urlPath));
        }

        let project: any = null;
        const hashMatch = param.match(/-([0-9a-f]{8})$/i);
        if (hashMatch) {
          try {
            const projects = await Project.find({ isDeleted: { $ne: true } }).select('_id title slug description location client').lean();
            project = projects.find(p => (p._id || '').toString().endsWith(hashMatch[1]));
          } catch (e) {}
        }

        if (!project) {
          try {
            project = await Project.findOne({ slug: param, isDeleted: { $ne: true } })
              .select('title slug description location client')
              .lean();
          } catch (e) {}
        }

        if (!project) {
          try {
            project = await Project.findById(param).select('title slug description location client').lean();
          } catch (e) {}
        }

        if (project) {
          const pTitle = (project as any).title || 'Dự Án';
          const pDesc = (project as any).description?.substring(0, 160) || `Dự án ${pTitle} do CTC thi công.`;
          const meta: PageMeta = {
            title: `${pTitle} | Dự Án CTC`,
            description: pDesc
          };

          const projectSchema = [
            {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": pTitle,
              "description": pDesc,
              "author": { "@type": "Organization", "name": "CTC" }
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Dự án", "item": `${SITE_URL}/projects` },
                { "@type": "ListItem", "position": 3, "name": pTitle, "item": `${SITE_URL}${urlPath}` }
              ]
            }
          ];

          const noscriptHtml = `
            <article style="padding: 20px; font-family: sans-serif;">
              <h1>${escapeHtml(pTitle)}</h1>
              <p>${escapeHtml(pDesc)}</p>
            </article>
          `;

          return res.status(200).send(injectMeta(htmlTemplate, meta, urlPath, noscriptHtml, projectSchema));
        }

        return res.status(404).send(injectMeta(htmlTemplate, { title: 'Dự Án Không Tồn Tại', description: 'Dự án không tồn tại.', noindex: true }, urlPath));
      }

      // ── 6. News Detail Page (/news/:id) ─────────────────────
      const newsMatch = urlPath.match(/^\/news\/(.+)$/);
      if (newsMatch) {
        const param = newsMatch[1];
        let news: any = null;

        const hashMatch = param.match(/-([0-9a-f]{8})$/i);
        if (hashMatch) {
          try {
            const allNews = await News.find({}).select('_id title slug excerpt content author createdAt').lean();
            news = allNews.find(n => (n._id || '').toString().endsWith(hashMatch[1]));
          } catch (e) {}
        }

        if (!news) {
          try {
            news = await News.findOne({ slug: param })
              .select('title slug excerpt content author createdAt')
              .lean();
          } catch (e) {}
        }

        if (!news) {
          try {
            news = await News.findById(param).select('title slug excerpt content author createdAt').lean();
          } catch (e) {}
        }

        if (news) {
          const nTitle = (news as any).title || 'Tin Tức';
          const nDesc = (news as any).excerpt?.substring(0, 160) || `${nTitle} - Tin tức từ CTC.`;
          const meta: PageMeta = {
            title: `${nTitle} | Tin Tức CTC`,
            description: nDesc
          };

          const newsSchema = [
            {
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "headline": nTitle,
              "description": nDesc,
              "datePublished": (news as any).createdAt ? new Date((news as any).createdAt).toISOString() : new Date().toISOString(),
              "author": { "@type": "Organization", "name": (news as any).author || "CTC" },
              "publisher": {
                "@type": "Organization",
                "name": "CTC",
                "logo": { "@type": "ImageObject", "url": `${SITE_URL}/uploads/images/logo/logodo.png` }
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Tin tức", "item": `${SITE_URL}/news` },
                { "@type": "ListItem", "position": 3, "name": nTitle, "item": `${SITE_URL}${urlPath}` }
              ]
            }
          ];

          const noscriptHtml = `
            <article style="padding: 20px; font-family: sans-serif;">
              <h1>${escapeHtml(nTitle)}</h1>
              <p>${escapeHtml(nDesc)}</p>
            </article>
          `;

          return res.status(200).send(injectMeta(htmlTemplate, meta, urlPath, noscriptHtml, newsSchema));
        }

        return res.status(404).send(injectMeta(htmlTemplate, { title: 'Bài Viết Không Tồn Tại', description: 'Bài viết không tồn tại.', noindex: true }, urlPath));
      }

      // ── 7. Solutions sub-pages ──────────────────────────────
      if (urlPath.startsWith('/solutions/')) {
        const meta: PageMeta = {
          title: 'Giải pháp điện, viễn thông & xây dựng công nghiệp | CTC',
          description: 'Giải pháp từ CTC — Nhà thầu EPC điện mặt trời và hạ tầng viễn thông.'
        };
        return res.status(200).send(injectMeta(htmlTemplate, meta, urlPath));
      }

      // ── 8. Admin pages ──────────────────────────────────────
      if (urlPath.startsWith('/admin')) {
        const meta: PageMeta = { title: 'Quản Trị | CTC', description: 'Trang quản trị hệ thống.', noindex: true };
        return res.status(200).send(injectMeta(htmlTemplate, meta, urlPath));
      }

      // ── 9. Fallback Unknown URL → 404 ───────────────────────
      const notFoundMeta: PageMeta = {
        title: '404 — Trang Không Tồn Tại | CTC',
        description: 'Trang bạn tìm kiếm không tồn tại trên website CTC.',
        noindex: true
      };
      const notFoundHtml = injectMeta(htmlTemplate, notFoundMeta, urlPath);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(notFoundHtml);

    } catch (error) {
      console.error('[SEO Inject Error]', error);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(htmlTemplate);
    }
  };
}
