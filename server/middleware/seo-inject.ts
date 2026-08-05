/**
 * SEO Meta Injection Middleware
 * 
 * Giải quyết vấn đề SPA trả cùng 1 HTML cho mọi URL bằng cách:
 * 1. Đọc dist/index.html làm template
 * 2. Thay thế <title>, <meta description>, <link canonical>, OG tags dựa trên URL
 * 3. Query MongoDB cho trang chi tiết sản phẩm/tin tức/dự án
 * 4. Trả HTTP 404 cho URL không tồn tại (thay vì soft 404)
 * 5. Redirect 301 product URL dạng ObjectID sang URL slug
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
    title: 'CTC — Nhà Thầu EPC Điện Mặt Trời & Hạ Tầng Viễn Thông',
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

// ─── Valid route patterns for 404 detection ─────────────────────
const VALID_ROUTE_PREFIXES = [
  '/', '/about', '/products', '/projects', '/news', '/contact',
  '/solutions', '/resources', '/cart', '/track-order', '/search',
  '/admin'
];

function isValidStaticRoute(urlPath: string): boolean {
  // Exact match
  if (STATIC_PAGES[urlPath]) return true;
  // Check if it's a known prefix route
  for (const prefix of VALID_ROUTE_PREFIXES) {
    if (urlPath === prefix) return true;
  }
  return false;
}

function isDynamicRoute(urlPath: string): boolean {
  // /products/:id or /products/:slug-:hash
  if (/^\/products\/[^/]+$/.test(urlPath)) return true;
  // /projects/:id or /projects/:slug-:hash
  if (/^\/projects\/[^/]+$/.test(urlPath)) return true;
  // /news/:slug-:hash
  if (/^\/news\/[^/]+$/.test(urlPath)) return true;
  // /solutions/:type (already in static map, but catch dynamic ones)
  if (/^\/solutions\/[^/]+$/.test(urlPath)) return true;
  // /admin/* routes
  if (urlPath.startsWith('/admin')) return true;
  return false;
}

function isMongoObjectId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

// ─── HTML Template Injection ────────────────────────────────────
function injectMeta(html: string, meta: PageMeta, urlPath: string): string {
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

    try {
      // ── 1. Check for static page ────────────────────────────
      if (STATIC_PAGES[urlPath]) {
        const meta = STATIC_PAGES[urlPath];
        const html = injectMeta(htmlTemplate, meta, urlPath);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).send(html);
      }

      // ── 2. Product detail page ──────────────────────────────
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
          // Product not found by ID → 404
          const meta: PageMeta = { title: 'Sản Phẩm Không Tồn Tại', description: 'Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.', noindex: true };
          const html = injectMeta(htmlTemplate, meta, urlPath);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(404).send(html);
        }

        // Slug-based URL: extract short hash from end
        const hashMatch = param.match(/-([0-9a-f]{8})$/i);
        if (hashMatch) {
          const shortHash = hashMatch[1];
          try {
            // Find product where _id ends with shortHash
            const products = await Product.find({
              isDeleted: { $ne: true }
            }).select('_id name slug shortDescription').lean();
            
            const product = products.find(p => {
              const id = (p._id || '').toString();
              return id.endsWith(shortHash);
            });

            if (product) {
              const meta: PageMeta = {
                title: `${(product as any).name} | ${SITE_NAME}`,
                description: (product as any).shortDescription || `Mua ${(product as any).name} chính hãng tại CTC Đà Nẵng. Bảo hành chính hãng, giao hàng toàn quốc.`
              };
              const html = injectMeta(htmlTemplate, meta, urlPath);
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              return res.status(200).send(html);
            }
          } catch (e) {}
        }

        // Try finding by exact ID (for non-ObjectID format IDs)
        try {
          const product = await Product.findById(param).select('name slug shortDescription').lean();
          if (product) {
            const meta: PageMeta = {
              title: `${(product as any).name} | ${SITE_NAME}`,
              description: (product as any).shortDescription || `Mua ${(product as any).name} chính hãng tại CTC.`
            };
            const html = injectMeta(htmlTemplate, meta, urlPath);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(html);
          }
        } catch (e) {}

        // Product not found → 404
        const meta404: PageMeta = { title: 'Sản Phẩm Không Tồn Tại', description: 'Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.', noindex: true };
        const html404 = injectMeta(htmlTemplate, meta404, urlPath);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(html404);
      }

      // ── 3. Project detail page ──────────────────────────────
      const projectMatch = urlPath.match(/^\/projects\/(.+)$/);
      if (projectMatch) {
        const param = projectMatch[1];

        // MongoDB ObjectID → redirect 301 to slug URL
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

        // Slug-based URL
        const hashMatch = param.match(/-([0-9a-f]{8})$/i);
        if (hashMatch) {
          try {
            const projects = await Project.find({ isDeleted: { $ne: true } }).select('_id title slug description').lean();
            const project = projects.find(p => (p._id || '').toString().endsWith(hashMatch[1]));
            if (project) {
              const meta: PageMeta = {
                title: `${(project as any).title} | Dự Án CTC`,
                description: (project as any).description?.substring(0, 160) || `Dự án ${(project as any).title} do CTC thi công.`
              };
              return res.status(200).send(injectMeta(htmlTemplate, meta, urlPath));
            }
          } catch (e) {}
        }

        try {
          const project = await Project.findById(param).select('title description').lean();
          if (project) {
            const meta: PageMeta = {
              title: `${(project as any).title} | Dự Án CTC`,
              description: (project as any).description?.substring(0, 160) || `Dự án ${(project as any).title} do CTC thi công.`
            };
            return res.status(200).send(injectMeta(htmlTemplate, meta, urlPath));
          }
        } catch (e) {}

        return res.status(404).send(injectMeta(htmlTemplate, { title: 'Dự Án Không Tồn Tại', description: 'Dự án không tồn tại.', noindex: true }, urlPath));
      }

      // ── 4. News detail page ─────────────────────────────────
      const newsMatch = urlPath.match(/^\/news\/(.+)$/);
      if (newsMatch) {
        const param = newsMatch[1];
        const hashMatch = param.match(/-([0-9a-f]{8})$/i);

        if (hashMatch) {
          try {
            const allNews = await News.find({}).select('_id title slug excerpt').lean();
            const news = allNews.find(n => (n._id || '').toString().endsWith(hashMatch[1]));
            if (news) {
              const meta: PageMeta = {
                title: `${(news as any).title} | Tin Tức CTC`,
                description: (news as any).excerpt?.substring(0, 160) || `${(news as any).title} - Tin tức từ CTC.`
              };
              return res.status(200).send(injectMeta(htmlTemplate, meta, urlPath));
            }
          } catch (e) {}
        }

        return res.status(404).send(injectMeta(htmlTemplate, { title: 'Bài Viết Không Tồn Tại', description: 'Bài viết không tồn tại.', noindex: true }, urlPath));
      }

      // ── 5. Solutions sub-pages (catch any not in static map) ─
      if (urlPath.startsWith('/solutions/')) {
        // Already checked static map above, so this is an unknown solution page
        const meta: PageMeta = {
          title: 'Giải Pháp | CTC',
          description: 'Giải pháp từ CTC — Nhà thầu EPC điện mặt trời và hạ tầng viễn thông.'
        };
        return res.status(200).send(injectMeta(htmlTemplate, meta, urlPath));
      }

      // ── 6. Admin pages ──────────────────────────────────────
      if (urlPath.startsWith('/admin')) {
        const meta: PageMeta = { title: 'Quản Trị | CTC', description: 'Trang quản trị hệ thống.', noindex: true };
        return res.status(200).send(injectMeta(htmlTemplate, meta, urlPath));
      }

      // ── 7. URL query params (e.g. /products?cat=router) ─────
      if (urlPath === '/products' || urlPath === '/projects' || urlPath === '/news') {
        // Already handled in static map, this catches with query params
        const meta = STATIC_PAGES[urlPath];
        return res.status(200).send(injectMeta(htmlTemplate, meta, urlPath));
      }

      // ── 8. Legacy URLs → 404 with proper status ─────────────
      if (urlPath.includes('hoat_dong_chi_tiet') || urlPath.includes('tinh_hinh_tai_chinh')) {
        return res.redirect(301, '/about');
      }

      // ── 9. Unknown URL → 404 ───────────────────────────────
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
      // Fallback: serve original HTML
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(htmlTemplate);
    }
  };
}
