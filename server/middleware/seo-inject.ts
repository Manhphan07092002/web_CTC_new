/**
 * SEO Meta & Content Injection Middleware
 * 
 * Giải quyết triệt để các vấn đề SEO cho SPA (React):
 * 1. Đọc dist/index.html làm template
 * 2. Thay thế <title>, <meta description>, <link canonical>, OG tags động theo từng URL
 * 3. Inject nội dung thực dạng <noscript> vào HTML server-rendered (để Googlebot thấy dữ liệu thật kể cả khi không chạy JS)
 * 4. Inject JSON-LD Structured Data (Product, NewsArticle, Organization, ItemList, BreadcrumbList) server-side
 * 5. Trả HTTP 404 cho URL không tồn tại (chống Soft 404)
 * 6. Redirect 301 product/project URL dạng ObjectID sang URL slug-hash
 * 7. Redirect 301 legacy URL dạng /hoat_dong_chi_tiet sang /news
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
    title: 'CTC | Tổng Thầu EPC Điện Mặt Trời & Hạ Tầng Viễn Thông Đà Nẵng',
    description: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC) — Nhà thầu EPC điện mặt trời áp mái, hạ tầng viễn thông, cáp quang, thiết bị mạng doanh nghiệp, trạm 110kV và Data Center toàn quốc.'
  },
  '/about': {
    title: 'Giới Thiệu Công Ty CTC — Xây Lắp Bưu Điện Miền Trung',
    description: 'Tìm hiểu về Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC) — năng lực thi công, chứng chỉ hành nghề, đội ngũ kỹ sư và lịch sử phát triển từ năm 2004.'
  },
  '/products': {
    title: 'Thiết Bị Mạng & Viễn Thông Chính Hãng — Switch, Router, Cáp Quang | CTC',
    description: 'Cung cấp thiết bị mạng Ruijie, MikroTik, DrayTek, cáp mạng Dintek, thiết bị quang, inverter Huawei, Sungrow, UPS và ắc quy viễn thông chính hãng tại Đà Nẵng.'
  },
  '/solutions': {
    title: 'Giải Pháp Toàn Diện — EPC Solar, Viễn Thông, Data Center | CTC',
    description: 'Giải pháp tổng thầu EPC điện mặt trời áp mái, thi công hạ tầng viễn thông, đường dây & trạm biến áp 110kV, Data Center và xây dựng dân dụng công nghiệp.'
  },
  '/solutions/rooftop': {
    title: 'Tổng Thầu EPC Điện Mặt Trời Áp Mái Nhà Xưởng & Doanh Nghiệp | CTC',
    description: 'Dịch vụ thiết kế, cung cấp và thi công (EPC) hệ thống điện mặt trời áp mái cho nhà xưởng, khu công nghiệp và doanh nghiệp. Tiết kiệm đến 80% chi phí điện.'
  },
  '/solutions/farm': {
    title: 'Giải Pháp Điện Gió & Trang Trại Năng Lượng Tái Tạo | CTC',
    description: 'Tư vấn, thiết kế và thi công trang trại điện gió, nhà máy điện mặt trời mặt đất quy mô lớn từ CTC.'
  },
  '/solutions/floating': {
    title: 'Thi Công Hạ Tầng Viễn Thông & Cáp Quang Toàn Quốc | CTC',
    description: 'Dịch vụ thi công hạ tầng viễn thông, mạng cáp quang, trạm BTS, mạng ngoại vi và hệ thống CNTT từ CTC — đơn vị có chứng chỉ Viễn thông Hạng I.'
  },
  '/solutions/electrical': {
    title: 'Thi Công Đường Dây & Trạm Biến Áp 110kV | CTC',
    description: 'Thiết kế và thi công đường dây truyền tải điện, trạm biến áp 110kV/220kV. Chứng chỉ năng lực xây dựng Hạng II.'
  },
  '/solutions/datacenter': {
    title: 'Thiết Kế & Thi Công Data Center Chuẩn Quốc Tế | CTC',
    description: 'Giải pháp thiết kế, xây dựng và vận hành trung tâm dữ liệu (Data Center), hạ tầng số, phòng máy chủ và hệ thống làm mát.'
  },
  '/solutions/construction': {
    title: 'Xây Dựng Dân Dụng & Công Nghiệp — Bưu Điện, Trường Học | CTC',
    description: 'Dịch vụ xây dựng, cải tạo công trình dân dụng và công nghiệp: bưu điện, trường học, nhà xưởng, văn phòng từ CTC.'
  },
  '/projects': {
    title: 'Dự Án Tiêu Biểu — Công Trình Đã Thi Công | CTC',
    description: 'Danh sách dự án tiêu biểu đã hoàn thành: điện mặt trời, hạ tầng viễn thông, trạm biến áp, Data Center và xây dựng dân dụng trên toàn quốc.'
  },
  '/news': {
    title: 'Tin Tức & Chuyên Môn Kỹ Thuật — Năng Lượng, Viễn Thông | CTC',
    description: 'Cập nhật tin tức mới nhất về năng lượng tái tạo, thiết bị mạng, viễn thông, hướng dẫn kỹ thuật và báo giá thiết bị từ CTC.'
  },
  '/contact': {
    title: 'Liên Hệ CTC — Hotline 0915 059 666 | Đà Nẵng',
    description: 'Liên hệ Công ty CTC tại 50B Nguyễn Du, Hải Châu, Đà Nẵng. Hotline: 0915 059 666. Email: info@ctcdn.vn. Nhận tư vấn và báo giá miễn phí.'
  },
  '/resources': {
    title: 'Tài Liệu Kỹ Thuật & Catalogue Sản Phẩm | CTC',
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
          "alternateName": ["CTC", "CTC Đà Nẵng", "CTC Miền Trung", "CTC điện mặt trời", "CTC hạ tầng viễn thông"],
          "url": SITE_URL,
          "logo": `${SITE_URL}/uploads/images/logo/logodo.png`,
          "taxID": "0400458940",
          "foundingDate": "2004-01-30",
          "description": meta.description,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu",
            "addressLocality": "Đà Nẵng",
            "addressCountry": "VN"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+84-915-059-666",
            "contactType": "customer service",
            "areaServed": "VN"
          }
        };

        const noscriptHtml = `
          <div style="padding: 20px; font-family: sans-serif;">
            <h1>Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)</h1>
            <p>Tổng thầu EPC điện mặt trời áp mái, hạ tầng viễn thông, cáp quang, Data Center và trạm biến áp 110kV tại Đà Nẵng và trên toàn quốc.</p>
            <h2>Dịch Vụ & Giải Pháp Chính</h2>
            <ul>
              <li><a href="/solutions/rooftop">Điện mặt trời áp mái nhà xưởng & doanh nghiệp</a></li>
              <li><a href="/solutions/floating">Thi công hạ tầng viễn thông & cáp quang</a></li>
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

        // Query real products from MongoDB for server-side HTML injection
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

          const productSchema = {
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
          };

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

          const projectSchema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": pTitle,
            "description": pDesc,
            "author": { "@type": "Organization", "name": "CTC" }
          };

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

          const newsSchema = {
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
          };

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
          title: 'Giải Pháp | CTC',
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
