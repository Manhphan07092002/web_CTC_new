/**
 * Seed 400 sản phẩm thực tế, nội dung chuẩn SEO và cào nhiều ảnh đúng model (V2)
 *
 * Dữ liệu được tạo từ file "danh_muc_400_san_pham_thuc_te.xlsx".
 * Không sinh tên giả kiểu CTC-Pro Series.
 *
 * Cách chạy gợi ý:
 *   npx tsx server/scripts/seed-400-real-products-seo-images-v2.ts
 *
 * Xóa toàn bộ sản phẩm trước khi seed:
 *   CLEAR_ALL_PRODUCTS=true npx tsx server/scripts/seed-400-real-products-seo-images-v2.ts
 *
 * Mặc định script chỉ xóa các sản phẩm có code CTC-REAL-* rồi tạo lại,
 * không xóa những sản phẩm khác đang có trong cơ sở dữ liệu.
 *
 * Biến môi trường cho phần hình ảnh:
 *   CRAWL_PRODUCT_IMAGES=true             Bật/tắt cào ảnh từ trang hãng
 *   MAX_PRODUCT_IMAGES=6                  Số ảnh tối đa cho mỗi sản phẩm
 *   IMAGE_CRAWL_CONCURRENCY=2             Số sản phẩm xử lý song song
 *   IMAGE_REQUEST_TIMEOUT_MS=20000        Timeout mỗi request
 *   MAX_DETAIL_PAGES_PER_PRODUCT=5        Số trang chi tiết tối đa cần đọc
 *   DOWNLOAD_PRODUCT_IMAGES=true          Tải ảnh về thư mục public thay vì hotlink
 *   PRODUCT_IMAGE_OUTPUT_DIR=public/uploads/products/seed-400
 *   PRODUCT_IMAGE_PUBLIC_PREFIX=/uploads/products/seed-400
 *   ENABLE_SITEMAP_DISCOVERY=true          Tìm trang model qua sitemap hãng
 *   ENABLE_BING_IMAGE_SEARCH=true          Tìm bổ sung khi trang hãng thiếu ảnh
 *   OFFICIAL_IMAGES_ONLY=false             true nếu chỉ chấp nhận ảnh từ domain hãng
 *   ALLOW_SHARED_IMAGES=false              Không dùng lại cùng một ảnh cho nhiều sản phẩm
 *   UPDATE_IMAGES_ONLY=true                Chỉ cập nhật image/images, không seed lại dữ liệu
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { Product, ProductCategory } from '../models/index.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

const CLEAR_ALL_PRODUCTS =
  String(process.env.CLEAR_ALL_PRODUCTS || '').toLowerCase() === 'true';

const RESET_CATALOG_PRODUCTS =
  String(process.env.RESET_CATALOG_PRODUCTS || 'true').toLowerCase() !== 'false';



function readPositiveInteger(
  value: string | undefined,
  fallback: number,
  maximum: number,
): number {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, maximum);
}

function readBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined || value === '') {
    return fallback;
  }
  return String(value).toLowerCase() === 'true';
}

const CRAWL_PRODUCT_IMAGES = readBoolean(
  process.env.CRAWL_PRODUCT_IMAGES,
  true,
);

const UPDATE_IMAGES_ONLY = readBoolean(
  process.env.UPDATE_IMAGES_ONLY,
  false,
);

const DOWNLOAD_PRODUCT_IMAGES = readBoolean(
  process.env.DOWNLOAD_PRODUCT_IMAGES,
  true,
);

const ENABLE_SITEMAP_DISCOVERY = readBoolean(
  process.env.ENABLE_SITEMAP_DISCOVERY,
  true,
);

const ENABLE_BING_IMAGE_SEARCH = readBoolean(
  process.env.ENABLE_BING_IMAGE_SEARCH,
  true,
);

const OFFICIAL_IMAGES_ONLY = readBoolean(
  process.env.OFFICIAL_IMAGES_ONLY,
  false,
);

const ALLOW_SHARED_IMAGES = readBoolean(
  process.env.ALLOW_SHARED_IMAGES,
  false,
);

const MAX_PRODUCT_IMAGES = readPositiveInteger(
  process.env.MAX_PRODUCT_IMAGES,
  6,
  10,
);

const MIN_PRODUCT_IMAGES = readPositiveInteger(
  process.env.MIN_PRODUCT_IMAGES,
  2,
  MAX_PRODUCT_IMAGES,
);

const IMAGE_CRAWL_CONCURRENCY = readPositiveInteger(
  process.env.IMAGE_CRAWL_CONCURRENCY,
  2,
  6,
);

const IMAGE_REQUEST_TIMEOUT_MS = readPositiveInteger(
  process.env.IMAGE_REQUEST_TIMEOUT_MS,
  20_000,
  60_000,
);

const MAX_DETAIL_PAGES_PER_PRODUCT = readPositiveInteger(
  process.env.MAX_DETAIL_PAGES_PER_PRODUCT,
  5,
  10,
);

const MAX_SITEMAP_FILES_PER_HOST = readPositiveInteger(
  process.env.MAX_SITEMAP_FILES_PER_HOST,
  15,
  50,
);

const MAX_SITEMAP_URLS_PER_HOST = readPositiveInteger(
  process.env.MAX_SITEMAP_URLS_PER_HOST,
  30_000,
  100_000,
);

const MAX_IMAGE_BYTES = readPositiveInteger(
  process.env.MAX_IMAGE_BYTES,
  12 * 1024 * 1024,
  30 * 1024 * 1024,
);

const PRODUCT_IMAGE_OUTPUT_DIR = path.resolve(
  process.cwd(),
  process.env.PRODUCT_IMAGE_OUTPUT_DIR ||
    'public/uploads/products/seed-400',
);

const PRODUCT_IMAGE_PUBLIC_PREFIX = (
  process.env.PRODUCT_IMAGE_PUBLIC_PREFIX ||
  '/uploads/products/seed-400'
).replace(/\/+$/, '');


interface CatalogProduct {
  name: string;
  model: string;
  mainGroup: string;
  categoryName: string;
  brand: string;
  shortDescription: string;
  focusKeyword: string;
  sourceUrl: string;
  verificationNote: string;
}

const catalogProducts: CatalogProduct[] = [
  {
    "name": "Router MikroTik CCR2004-1G-12S+2XS",
    "model": "CCR2004-1G-12S+2XS",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik ccr2004-1g-12s+2xs",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik CCR2004-16G-2S+",
    "model": "CCR2004-16G-2S+",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik ccr2004-16g-2s+",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik CCR2116-12G-4S+",
    "model": "CCR2116-12G-4S+",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik ccr2116-12g-4s+",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik CCR2216-1G-12XS-2XQ",
    "model": "CCR2216-1G-12XS-2XQ",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik ccr2216-1g-12xs-2xq",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik RB5009UG+S+IN",
    "model": "RB5009UG+S+IN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik rb5009ug+s+in",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik RB5009UPr+S+IN",
    "model": "RB5009UPr+S+IN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik rb5009upr+s+in",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik hEX S (2025)",
    "model": "hEX S (2025)",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik hex s (2025)",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik hEX (RB750Gr3)",
    "model": "hEX (RB750Gr3)",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik hex (rb750gr3)",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik L009UiGS-RM",
    "model": "L009UiGS-RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik l009uigs-rm",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik Chateau LTE18 ax",
    "model": "Chateau LTE18 ax",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik chateau lte18 ax",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik Chateau 5G ax",
    "model": "Chateau 5G ax",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik chateau 5g ax",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik LtAP mini LTE kit",
    "model": "LtAP mini LTE kit",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik ltap mini lte kit",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik RB4011iGS+RM",
    "model": "RB4011iGS+RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik rb4011igs+rm",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik RB1100AHx4",
    "model": "RB1100AHx4",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik rb1100ahx4",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router MikroTik RB1100AHx4 Dude Edition",
    "model": "RB1100AHx4 Dude Edition",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "MikroTik",
    "shortDescription": "Router chuyên dụng cho doanh nghiệp, ISP, chi nhánh hoặc kết nối WAN.",
    "focusKeyword": "router mikrotik rb1100ahx4 dude edition",
    "sourceUrl": "https://mikrotik.com/products/group/ethernet-routers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router TP-Link Omada ER8411",
    "model": "ER8411",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "TP-Link Omada",
    "shortDescription": "Router Omada cho mạng doanh nghiệp, VPN, đa WAN và quản trị tập trung.",
    "focusKeyword": "router tp-link omada er8411",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router TP-Link Omada ER7412-M2",
    "model": "ER7412-M2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "TP-Link Omada",
    "shortDescription": "Router Omada cho mạng doanh nghiệp, VPN, đa WAN và quản trị tập trung.",
    "focusKeyword": "router tp-link omada er7412-m2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router TP-Link Omada ER707-M2",
    "model": "ER707-M2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "TP-Link Omada",
    "shortDescription": "Router Omada cho mạng doanh nghiệp, VPN, đa WAN và quản trị tập trung.",
    "focusKeyword": "router tp-link omada er707-m2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router TP-Link Omada ER7406",
    "model": "ER7406",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "TP-Link Omada",
    "shortDescription": "Router Omada cho mạng doanh nghiệp, VPN, đa WAN và quản trị tập trung.",
    "focusKeyword": "router tp-link omada er7406",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router TP-Link Omada ER7206",
    "model": "ER7206",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "TP-Link Omada",
    "shortDescription": "Router Omada cho mạng doanh nghiệp, VPN, đa WAN và quản trị tập trung.",
    "focusKeyword": "router tp-link omada er7206",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router TP-Link Omada ER605 V2",
    "model": "ER605 V2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "TP-Link Omada",
    "shortDescription": "Router Omada cho mạng doanh nghiệp, VPN, đa WAN và quản trị tập trung.",
    "focusKeyword": "router tp-link omada er605 v2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router TP-Link Omada ER706W",
    "model": "ER706W",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "TP-Link Omada",
    "shortDescription": "Router Omada cho mạng doanh nghiệp, VPN, đa WAN và quản trị tập trung.",
    "focusKeyword": "router tp-link omada er706w",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router TP-Link Omada ER706W-4G",
    "model": "ER706W-4G",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "TP-Link Omada",
    "shortDescription": "Router Omada cho mạng doanh nghiệp, VPN, đa WAN và quản trị tập trung.",
    "focusKeyword": "router tp-link omada er706w-4g",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router TP-Link Omada ER706WP-4G",
    "model": "ER706WP-4G",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "TP-Link Omada",
    "shortDescription": "Router Omada cho mạng doanh nghiệp, VPN, đa WAN và quản trị tập trung.",
    "focusKeyword": "router tp-link omada er706wp-4g",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router TP-Link Omada ER7212PC",
    "model": "ER7212PC",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "TP-Link Omada",
    "shortDescription": "Router Omada cho mạng doanh nghiệp, VPN, đa WAN và quản trị tập trung.",
    "focusKeyword": "router tp-link omada er7212pc",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router DrayTek Vigor2927",
    "model": "Vigor2927",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "DrayTek",
    "shortDescription": "Router DrayTek cho doanh nghiệp, VPN, cân bằng WAN và quản trị mạng.",
    "focusKeyword": "router draytek vigor2927",
    "sourceUrl": "https://www.draytek.com/products/routers/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router DrayTek Vigor2927ax",
    "model": "Vigor2927ax",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "DrayTek",
    "shortDescription": "Router DrayTek cho doanh nghiệp, VPN, cân bằng WAN và quản trị mạng.",
    "focusKeyword": "router draytek vigor2927ax",
    "sourceUrl": "https://www.draytek.com/products/routers/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router DrayTek Vigor2962",
    "model": "Vigor2962",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "DrayTek",
    "shortDescription": "Router DrayTek cho doanh nghiệp, VPN, cân bằng WAN và quản trị mạng.",
    "focusKeyword": "router draytek vigor2962",
    "sourceUrl": "https://www.draytek.com/products/routers/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router DrayTek Vigor3912",
    "model": "Vigor3912",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "DrayTek",
    "shortDescription": "Router DrayTek cho doanh nghiệp, VPN, cân bằng WAN và quản trị mạng.",
    "focusKeyword": "router draytek vigor3912",
    "sourceUrl": "https://www.draytek.com/products/routers/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Router DrayTek Vigor2866",
    "model": "Vigor2866",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Router",
    "brand": "DrayTek",
    "shortDescription": "Router DrayTek cho doanh nghiệp, VPN, cân bằng WAN và quản trị mạng.",
    "focusKeyword": "router draytek vigor2866",
    "sourceUrl": "https://www.draytek.com/products/routers/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS309-1G-8S+IN",
    "model": "CRS309-1G-8S+IN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs309-1g-8s+in",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS518-16XS-2XQ-RM",
    "model": "CRS518-16XS-2XQ-RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs518-16xs-2xq-rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS310-1G-5S-4S+IN",
    "model": "CRS310-1G-5S-4S+IN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs310-1g-5s-4s+in",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik netPower 16P",
    "model": "netPower 16P",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik netpower 16p",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik netPower 15FR",
    "model": "netPower 15FR",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik netpower 15fr",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik netFiber 9",
    "model": "netFiber 9",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik netfiber 9",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS326-24G-2S+IN",
    "model": "CRS326-24G-2S+IN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs326-24g-2s+in",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS326-24G-2S+RM",
    "model": "CRS326-24G-2S+RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs326-24g-2s+rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS326-24S+2Q+RM",
    "model": "CRS326-24S+2Q+RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs326-24s+2q+rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS326-4C+20G+2Q+RM",
    "model": "CRS326-4C+20G+2Q+RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs326-4c+20g+2q+rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS328-24P-4S+RM",
    "model": "CRS328-24P-4S+RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs328-24p-4s+rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS328-4C-20S-4S+RM",
    "model": "CRS328-4C-20S-4S+RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs328-4c-20s-4s+rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS354-48G-4S+2Q+RM",
    "model": "CRS354-48G-4S+2Q+RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs354-48g-4s+2q+rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS354-48P-4S+2Q+RM",
    "model": "CRS354-48P-4S+2Q+RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs354-48p-4s+2q+rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS520-4XS-16XQ-RM",
    "model": "CRS520-4XS-16XQ-RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs520-4xs-16xq-rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CSS318-16G-2S+IN",
    "model": "CSS318-16G-2S+IN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik css318-16g-2s+in",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CSS326-24G-2S+RM",
    "model": "CSS326-24G-2S+RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik css326-24g-2s+rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik RB260GS",
    "model": "RB260GS",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik rb260gs",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik RB260GSP",
    "model": "RB260GSP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik rb260gsp",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS106-1C-5S",
    "model": "CRS106-1C-5S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs106-1c-5s",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CSS610-8G-2S+IN",
    "model": "CSS610-8G-2S+IN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik css610-8g-2s+in",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS112-8P-4S-IN",
    "model": "CRS112-8P-4S-IN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs112-8p-4s-in",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CSS610-8P-2S+IN",
    "model": "CSS610-8P-2S+IN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik css610-8p-2s+in",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS418-8P-8G-2S+RM",
    "model": "CRS418-8P-8G-2S+RM",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs418-8p-8g-2s+rm",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch MikroTik CRS504-4XQ-IN",
    "model": "CRS504-4XQ-IN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "MikroTik",
    "shortDescription": "Switch Ethernet, PoE hoặc cổng quang cho doanh nghiệp, ISP và trung tâm dữ liệu.",
    "focusKeyword": "switch mikrotik crs504-4xq-in",
    "sourceUrl": "https://mikrotik.com/products/group/switches",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG6654XHP",
    "model": "SG6654XHP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg6654xhp",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG6654X",
    "model": "SG6654X",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg6654x",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG6428XHP",
    "model": "SG6428XHP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg6428xhp",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG6428X",
    "model": "SG6428X",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg6428x",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG5452XMPP",
    "model": "SG5452XMPP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg5452xmpp",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG5428XMPP",
    "model": "SG5428XMPP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg5428xmpp",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG5428X",
    "model": "SG5428X",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg5428x",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3452XMPP",
    "model": "SG3452XMPP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3452xmpp",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3452XP",
    "model": "SG3452XP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3452xp",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3452X",
    "model": "SG3452X",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3452x",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3428XMPP",
    "model": "SG3428XMPP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3428xmpp",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3428XMP",
    "model": "SG3428XMP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3428xmp",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3428X",
    "model": "SG3428X",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3428x",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3428XPP-M2",
    "model": "SG3428XPP-M2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3428xpp-m2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3428X-M2",
    "model": "SG3428X-M2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3428x-m2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3218XP-M2",
    "model": "SG3218XP-M2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3218xp-m2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3210XHP-M2",
    "model": "SG3210XHP-M2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3210xhp-m2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG3210X-M2",
    "model": "SG3210X-M2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg3210x-m2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada SG2210XMP-M2",
    "model": "SG2210XMP-M2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada sg2210xmp-m2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Switch TP-Link Omada ES210X-M2",
    "model": "ES210X-M2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Switch",
    "brand": "TP-Link Omada",
    "shortDescription": "Switch quản trị Omada cho LAN doanh nghiệp, PoE, uplink SFP/SFP+ và SDN.",
    "focusKeyword": "switch tp-link omada es210x-m2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP690E HD",
    "model": "EAP690E HD",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap690e hd",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP265 HD",
    "model": "EAP265 HD",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap265 hd",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP223 V2",
    "model": "EAP223 V2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap223 v2",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP115 V4",
    "model": "EAP115 V4",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap115 v4",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP110 V4",
    "model": "EAP110 V4",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap110 v4",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP787",
    "model": "EAP787",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap787",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP773",
    "model": "EAP773",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap773",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP772",
    "model": "EAP772",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap772",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP770",
    "model": "EAP770",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap770",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP727",
    "model": "EAP727",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap727",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP723",
    "model": "EAP723",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap723",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP720",
    "model": "EAP720",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap720",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP783",
    "model": "EAP783",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap783",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP683 UR",
    "model": "EAP683 UR",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap683 ur",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP673",
    "model": "EAP673",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap673",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP670",
    "model": "EAP670",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap670",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP660 HD",
    "model": "EAP660 HD",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap660 hd",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP653 UR",
    "model": "EAP653 UR",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap653 ur",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP653",
    "model": "EAP653",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap653",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP650",
    "model": "EAP650",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap650",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP620 HD",
    "model": "EAP620 HD",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap620 hd",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP613",
    "model": "EAP613",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap613",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP610",
    "model": "EAP610",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap610",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP245 V3",
    "model": "EAP245 V3",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap245 v3",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point TP-Link Omada EAP225 V3",
    "model": "EAP225 V3",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "TP-Link Omada",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp, hỗ trợ quản trị tập trung Omada SDN.",
    "focusKeyword": "wi-fi / access point tp-link omada eap225 v3",
    "sourceUrl": "https://www.omadanetworks.com/us/omada-sdn/product-list/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point DrayTek VigorAP 1070C",
    "model": "VigorAP 1070C",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "DrayTek",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp cho văn phòng, khách sạn và trường học.",
    "focusKeyword": "wi-fi / access point draytek vigorap 1070c",
    "sourceUrl": "https://www.draytek.com/products/access-points/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point DrayTek VigorAP 912C",
    "model": "VigorAP 912C",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "DrayTek",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp cho văn phòng, khách sạn và trường học.",
    "focusKeyword": "wi-fi / access point draytek vigorap 912c",
    "sourceUrl": "https://www.draytek.com/products/access-points/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point DrayTek VigorAP 906",
    "model": "VigorAP 906",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "DrayTek",
    "shortDescription": "Điểm truy cập Wi-Fi doanh nghiệp cho văn phòng, khách sạn và trường học.",
    "focusKeyword": "wi-fi / access point draytek vigorap 906",
    "sourceUrl": "https://www.draytek.com/products/access-points/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point MikroTik cAP ax",
    "model": "cAP ax",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "MikroTik",
    "shortDescription": "Thiết bị Wi-Fi MikroTik tích hợp RouterOS cho mạng doanh nghiệp hoặc chi nhánh.",
    "focusKeyword": "wi-fi / access point mikrotik cap ax",
    "sourceUrl": "https://mikrotik.com/products/group/wireless-for-home-and-office",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Wi-Fi / Access Point MikroTik hAP ax S",
    "model": "hAP ax S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Wi-Fi / Access Point",
    "brand": "MikroTik",
    "shortDescription": "Thiết bị Wi-Fi MikroTik tích hợp RouterOS cho mạng doanh nghiệp hoặc chi nhánh.",
    "focusKeyword": "wi-fi / access point mikrotik hap ax s",
    "sourceUrl": "https://mikrotik.com/products/group/wireless-for-home-and-office",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Thiết bị cân bằng tải F5 BIG-IP r2600",
    "model": "BIG-IP r2600",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Thiết bị cân bằng tải",
    "brand": "F5",
    "shortDescription": "Thiết bị ADC/cân bằng tải ứng dụng cho trung tâm dữ liệu và hệ thống dịch vụ số.",
    "focusKeyword": "thiết bị cân bằng tải f5 big-ip r2600",
    "sourceUrl": "https://www.f5.com/products/big-ip-services/rseries-adc-hardware-appliance",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Thiết bị cân bằng tải F5 BIG-IP r2800",
    "model": "BIG-IP r2800",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Thiết bị cân bằng tải",
    "brand": "F5",
    "shortDescription": "Thiết bị ADC/cân bằng tải ứng dụng cho trung tâm dữ liệu và hệ thống dịch vụ số.",
    "focusKeyword": "thiết bị cân bằng tải f5 big-ip r2800",
    "sourceUrl": "https://www.f5.com/products/big-ip-services/rseries-adc-hardware-appliance",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Thiết bị cân bằng tải F5 BIG-IP r4600",
    "model": "BIG-IP r4600",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Thiết bị cân bằng tải",
    "brand": "F5",
    "shortDescription": "Thiết bị ADC/cân bằng tải ứng dụng cho trung tâm dữ liệu và hệ thống dịch vụ số.",
    "focusKeyword": "thiết bị cân bằng tải f5 big-ip r4600",
    "sourceUrl": "https://www.f5.com/products/big-ip-services/rseries-adc-hardware-appliance",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Thiết bị cân bằng tải F5 BIG-IP r4800",
    "model": "BIG-IP r4800",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Thiết bị cân bằng tải",
    "brand": "F5",
    "shortDescription": "Thiết bị ADC/cân bằng tải ứng dụng cho trung tâm dữ liệu và hệ thống dịch vụ số.",
    "focusKeyword": "thiết bị cân bằng tải f5 big-ip r4800",
    "sourceUrl": "https://www.f5.com/products/big-ip-services/rseries-adc-hardware-appliance",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Thiết bị cân bằng tải F5 BIG-IP r5600",
    "model": "BIG-IP r5600",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Thiết bị cân bằng tải",
    "brand": "F5",
    "shortDescription": "Thiết bị ADC/cân bằng tải ứng dụng cho trung tâm dữ liệu và hệ thống dịch vụ số.",
    "focusKeyword": "thiết bị cân bằng tải f5 big-ip r5600",
    "sourceUrl": "https://www.f5.com/products/big-ip-services/rseries-adc-hardware-appliance",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Thiết bị cân bằng tải F5 BIG-IP r5800",
    "model": "BIG-IP r5800",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Thiết bị cân bằng tải",
    "brand": "F5",
    "shortDescription": "Thiết bị ADC/cân bằng tải ứng dụng cho trung tâm dữ liệu và hệ thống dịch vụ số.",
    "focusKeyword": "thiết bị cân bằng tải f5 big-ip r5800",
    "sourceUrl": "https://www.f5.com/products/big-ip-services/rseries-adc-hardware-appliance",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Thiết bị cân bằng tải F5 BIG-IP r5900",
    "model": "BIG-IP r5900",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Thiết bị cân bằng tải",
    "brand": "F5",
    "shortDescription": "Thiết bị ADC/cân bằng tải ứng dụng cho trung tâm dữ liệu và hệ thống dịch vụ số.",
    "focusKeyword": "thiết bị cân bằng tải f5 big-ip r5900",
    "sourceUrl": "https://www.f5.com/products/big-ip-services/rseries-adc-hardware-appliance",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Thiết bị cân bằng tải F5 BIG-IP r10600",
    "model": "BIG-IP r10600",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Thiết bị cân bằng tải",
    "brand": "F5",
    "shortDescription": "Thiết bị ADC/cân bằng tải ứng dụng cho trung tâm dữ liệu và hệ thống dịch vụ số.",
    "focusKeyword": "thiết bị cân bằng tải f5 big-ip r10600",
    "sourceUrl": "https://www.f5.com/products/big-ip-services/rseries-adc-hardware-appliance",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Thiết bị cân bằng tải A10 Networks Thunder 3030S",
    "model": "Thunder 3030S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Thiết bị cân bằng tải",
    "brand": "A10 Networks",
    "shortDescription": "Thiết bị cân bằng tải và phân phối ứng dụng cho hạ tầng doanh nghiệp.",
    "focusKeyword": "thiết bị cân bằng tải a10 networks thunder 3030s",
    "sourceUrl": "https://www.a10networks.com/products/thunder-adc/",
    "verificationNote": "Model có thật; cần xác minh trạng thái vòng đời/EOL và khả dụng trước khi chào bán."
  },
  {
    "name": "Thiết bị cân bằng tải Progress Kemp LoadMaster LM-X15-NG",
    "model": "LoadMaster LM-X15-NG",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Thiết bị cân bằng tải",
    "brand": "Progress Kemp",
    "shortDescription": "Thiết bị cân bằng tải ứng dụng vật lý cho hệ thống doanh nghiệp.",
    "focusKeyword": "thiết bị cân bằng tải progress kemp loadmaster lm-x15-ng",
    "sourceUrl": "https://docs.progress.com/bundle/loadmaster-technical-note-loadmaster-physical-to-logical-port-assignment-ga/page/LoadMaster-LM-X15-NG.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco GLC-SX-MMD",
    "model": "GLC-SX-MMD",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco glc-sx-mmd",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco GLC-LH-SMD",
    "model": "GLC-LH-SMD",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco glc-lh-smd",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco GLC-TE",
    "model": "GLC-TE",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco glc-te",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco GLC-T",
    "model": "GLC-T",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco glc-t",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco SFP-10G-SR",
    "model": "SFP-10G-SR",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco sfp-10g-sr",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco SFP-10G-LR",
    "model": "SFP-10G-LR",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco sfp-10g-lr",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco SFP-10G-ER",
    "model": "SFP-10G-ER",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco sfp-10g-er",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco SFP-10G-ZR",
    "model": "SFP-10G-ZR",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco sfp-10g-zr",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco SFP-25G-SR-S",
    "model": "SFP-25G-SR-S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco sfp-25g-sr-s",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco SFP-25G-LR-S",
    "model": "SFP-25G-LR-S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco sfp-25g-lr-s",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco QSFP-40G-SR4",
    "model": "QSFP-40G-SR4",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco qsfp-40g-sr4",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco QSFP-40G-LR4",
    "model": "QSFP-40G-LR4",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco qsfp-40g-lr4",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco QSFP-100G-SR4-S",
    "model": "QSFP-100G-SR4-S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco qsfp-100g-sr4-s",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP Cisco QSFP-100G-LR4-S",
    "model": "QSFP-100G-LR4-S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "Cisco",
    "shortDescription": "Module thu phát quang/đồng cho kết nối Ethernet tốc độ cao.",
    "focusKeyword": "module quang sfp/qsfp cisco qsfp-100g-lr4-s",
    "sourceUrl": "https://www.cisco.com/c/en/us/products/interfaces-modules/transceiver-modules/index.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP MikroTik S-85DLC05D",
    "model": "S-85DLC05D",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "MikroTik",
    "shortDescription": "Module quang MikroTik dùng cho switch, router và hệ thống truyền dẫn.",
    "focusKeyword": "module quang sfp/qsfp mikrotik s-85dlc05d",
    "sourceUrl": "https://mikrotik.com/products/group/sfp-qsfp",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP MikroTik S-31DLC20D",
    "model": "S-31DLC20D",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "MikroTik",
    "shortDescription": "Module quang MikroTik dùng cho switch, router và hệ thống truyền dẫn.",
    "focusKeyword": "module quang sfp/qsfp mikrotik s-31dlc20d",
    "sourceUrl": "https://mikrotik.com/products/group/sfp-qsfp",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP MikroTik S-55DLC80D",
    "model": "S-55DLC80D",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "MikroTik",
    "shortDescription": "Module quang MikroTik dùng cho switch, router và hệ thống truyền dẫn.",
    "focusKeyword": "module quang sfp/qsfp mikrotik s-55dlc80d",
    "sourceUrl": "https://mikrotik.com/products/group/sfp-qsfp",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP MikroTik S+85DLC03D",
    "model": "S+85DLC03D",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "MikroTik",
    "shortDescription": "Module quang MikroTik dùng cho switch, router và hệ thống truyền dẫn.",
    "focusKeyword": "module quang sfp/qsfp mikrotik s+85dlc03d",
    "sourceUrl": "https://mikrotik.com/products/group/sfp-qsfp",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP MikroTik S+31DLC10D",
    "model": "S+31DLC10D",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "MikroTik",
    "shortDescription": "Module quang MikroTik dùng cho switch, router và hệ thống truyền dẫn.",
    "focusKeyword": "module quang sfp/qsfp mikrotik s+31dlc10d",
    "sourceUrl": "https://mikrotik.com/products/group/sfp-qsfp",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Module quang SFP/QSFP MikroTik XS+85LC01D",
    "model": "XS+85LC01D",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Module quang SFP/QSFP",
    "brand": "MikroTik",
    "shortDescription": "Module quang MikroTik dùng cho switch, router và hệ thống truyền dẫn.",
    "focusKeyword": "module quang sfp/qsfp mikrotik xs+85lc01d",
    "sourceUrl": "https://mikrotik.com/products/group/sfp-qsfp",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope FACT-ODF",
    "model": "FACT-ODF",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope fact-odf",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope PROPEL-XFRAME",
    "model": "PROPEL-XFRAME",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope propel-xframe",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope NG4-ODF",
    "model": "NG4-ODF",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope ng4-odf",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope NG4access ODF Skeleton Frame",
    "model": "NG4access ODF Skeleton Frame",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope ng4access odf skeleton frame",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope Flex Frame",
    "model": "Flex Frame",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope flex frame",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope LSX Fiber Distribution Frame",
    "model": "LSX Fiber Distribution Frame",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope lsx fiber distribution frame",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope FIST-GR3",
    "model": "FIST-GR3",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope fist-gr3",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope FDF-CHASSIS",
    "model": "FDF-CHASSIS",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope fdf-chassis",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope FACT Splice Frame",
    "model": "FACT Splice Frame",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope fact splice frame",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope FACT Patch Frame",
    "model": "FACT Patch Frame",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope fact patch frame",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope NG4access Fiber Patch Chassis",
    "model": "NG4access Fiber Patch Chassis",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope ng4access fiber patch chassis",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope NG4access Fiber Splice Chassis",
    "model": "NG4access Fiber Splice Chassis",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope ng4access fiber splice chassis",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope FIST-GPS2",
    "model": "FIST-GPS2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope fist-gps2",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope FIST-GPST",
    "model": "FIST-GPST",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope fist-gpst",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "ODF CommScope FIST-WR2",
    "model": "FIST-WR2",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "ODF",
    "brand": "CommScope",
    "shortDescription": "Khung, chassis hoặc hệ thống phối quang ODF cho trung tâm dữ liệu, tổng đài và mạng viễn thông.",
    "focusKeyword": "odf commscope fist-wr2",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/optical-distribution-frames-odf/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-1S",
    "model": "DAG1000-1S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-1s",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-2S",
    "model": "DAG1000-2S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-2s",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-4S",
    "model": "DAG1000-4S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-4s",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-4S(GE)",
    "model": "DAG1000-4S(GE)",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-4s(ge)",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-8S(GE)",
    "model": "DAG1000-8S(GE)",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-8s(ge)",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG2000-16S(GE)",
    "model": "DAG2000-16S(GE)",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag2000-16s(ge)",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG2000-24S(GE)",
    "model": "DAG2000-24S(GE)",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag2000-24s(ge)",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG2000-32S(GE)",
    "model": "DAG2000-32S(GE)",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag2000-32s(ge)",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG2500-48S",
    "model": "DAG2500-48S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag2500-48s",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG2500-72S",
    "model": "DAG2500-72S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag2500-72s",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG2500-96S",
    "model": "DAG2500-96S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag2500-96s",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG3000-312S",
    "model": "DAG3000-312S",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag3000-312s",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-2O",
    "model": "DAG1000-2O",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-2o",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-4O",
    "model": "DAG1000-4O",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-4o",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-8O",
    "model": "DAG1000-8O",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-8o",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG2000-16O",
    "model": "DAG2000-16O",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag2000-16o",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-1S1O",
    "model": "DAG1000-1S1O",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-1s1o",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-2S2O",
    "model": "DAG1000-2S2O",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-2s2o",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG1000-4S4O",
    "model": "DAG1000-4S4O",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag1000-4s4o",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "VoIP Gateway Dinstar DAG2000-8S8O",
    "model": "DAG2000-8S8O",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "VoIP Gateway",
    "brand": "Dinstar",
    "shortDescription": "Gateway chuyển đổi thoại analog sang SIP/VoIP cho tổng đài, doanh nghiệp và nhà mạng.",
    "focusKeyword": "voip gateway dinstar dag2000-8s8o",
    "sourceUrl": "https://www.dinstar.com/products/analog-voip-gateway/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "IP PBX Dinstar UC200 Pro",
    "model": "UC200 Pro",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "IP PBX",
    "brand": "Dinstar",
    "shortDescription": "Tổng đài IP hợp nhất thoại, SIP trunk và quản trị liên lạc doanh nghiệp.",
    "focusKeyword": "ip pbx dinstar uc200 pro",
    "sourceUrl": "https://www.dinstar.com/products/ip-pbx/",
    "verificationNote": "Model có thật; một số dòng có thể đã EOL, cần xác minh trạng thái trước khi đăng bán."
  },
  {
    "name": "IP PBX Dinstar UC350",
    "model": "UC350",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "IP PBX",
    "brand": "Dinstar",
    "shortDescription": "Tổng đài IP hợp nhất thoại, SIP trunk và quản trị liên lạc doanh nghiệp.",
    "focusKeyword": "ip pbx dinstar uc350",
    "sourceUrl": "https://www.dinstar.com/products/ip-pbx/",
    "verificationNote": "Model có thật; một số dòng có thể đã EOL, cần xác minh trạng thái trước khi đăng bán."
  },
  {
    "name": "IP PBX Dinstar UC350 Pro",
    "model": "UC350 Pro",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "IP PBX",
    "brand": "Dinstar",
    "shortDescription": "Tổng đài IP hợp nhất thoại, SIP trunk và quản trị liên lạc doanh nghiệp.",
    "focusKeyword": "ip pbx dinstar uc350 pro",
    "sourceUrl": "https://www.dinstar.com/products/ip-pbx/",
    "verificationNote": "Model có thật; một số dòng có thể đã EOL, cần xác minh trạng thái trước khi đăng bán."
  },
  {
    "name": "IP PBX Dinstar UC8000",
    "model": "UC8000",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "IP PBX",
    "brand": "Dinstar",
    "shortDescription": "Tổng đài IP hợp nhất thoại, SIP trunk và quản trị liên lạc doanh nghiệp.",
    "focusKeyword": "ip pbx dinstar uc8000",
    "sourceUrl": "https://www.dinstar.com/products/ip-pbx/",
    "verificationNote": "Model có thật; một số dòng có thể đã EOL, cần xác minh trạng thái trước khi đăng bán."
  },
  {
    "name": "IP PBX Dinstar UC200",
    "model": "UC200",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "IP PBX",
    "brand": "Dinstar",
    "shortDescription": "Tổng đài IP hợp nhất thoại, SIP trunk và quản trị liên lạc doanh nghiệp.",
    "focusKeyword": "ip pbx dinstar uc200",
    "sourceUrl": "https://www.dinstar.com/products/ip-pbx/",
    "verificationNote": "Model có thật; một số dòng có thể đã EOL, cần xác minh trạng thái trước khi đăng bán."
  },
  {
    "name": "IP PBX Dinstar UC120",
    "model": "UC120",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "IP PBX",
    "brand": "Dinstar",
    "shortDescription": "Tổng đài IP hợp nhất thoại, SIP trunk và quản trị liên lạc doanh nghiệp.",
    "focusKeyword": "ip pbx dinstar uc120",
    "sourceUrl": "https://www.dinstar.com/products/ip-pbx/",
    "verificationNote": "Model có thật; một số dòng có thể đã EOL, cần xác minh trạng thái trước khi đăng bán."
  },
  {
    "name": "IP PBX Grandstream UCM6301",
    "model": "UCM6301",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "IP PBX",
    "brand": "Grandstream",
    "shortDescription": "Tổng đài IP doanh nghiệp hỗ trợ thoại, họp và quản trị truyền thông hợp nhất.",
    "focusKeyword": "ip pbx grandstream ucm6301",
    "sourceUrl": "https://www.grandstream.com/products/ip-pbxs",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "IP PBX Grandstream UCM6302",
    "model": "UCM6302",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "IP PBX",
    "brand": "Grandstream",
    "shortDescription": "Tổng đài IP doanh nghiệp hỗ trợ thoại, họp và quản trị truyền thông hợp nhất.",
    "focusKeyword": "ip pbx grandstream ucm6302",
    "sourceUrl": "https://www.grandstream.com/products/ip-pbxs",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "IP PBX Grandstream UCM6304",
    "model": "UCM6304",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "IP PBX",
    "brand": "Grandstream",
    "shortDescription": "Tổng đài IP doanh nghiệp hỗ trợ thoại, họp và quản trị truyền thông hợp nhất.",
    "focusKeyword": "ip pbx grandstream ucm6304",
    "sourceUrl": "https://www.grandstream.com/products/ip-pbxs",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "IP PBX Grandstream UCM6308",
    "model": "UCM6308",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "IP PBX",
    "brand": "Grandstream",
    "shortDescription": "Tổng đài IP doanh nghiệp hỗ trợ thoại, họp và quản trị truyền thông hợp nhất.",
    "focusKeyword": "ip pbx grandstream ucm6308",
    "sourceUrl": "https://www.grandstream.com/products/ip-pbxs",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar C66G",
    "model": "C66G",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar c66g",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar C66GP",
    "model": "C66GP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar c66gp",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar C64G",
    "model": "C64G",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar c64g",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar C64GP",
    "model": "C64GP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar c64gp",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar C63G",
    "model": "C63G",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar c63g",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar C63GP",
    "model": "C63GP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar c63gp",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar C62U",
    "model": "C62U",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar c62u",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar C62UP",
    "model": "C62UP",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar c62up",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar C60U-W",
    "model": "C60U-W",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar c60u-w",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar C60U-T",
    "model": "C60U-T",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar c60u-t",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Dinstar H60P",
    "model": "H60P",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Dinstar",
    "shortDescription": "Điện thoại SIP/IP cho văn phòng, lễ tân, khách sạn và trung tâm chăm sóc khách hàng.",
    "focusKeyword": "điện thoại ip dinstar h60p",
    "sourceUrl": "https://www.dinstar.com/products/ip-phones/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GXP1610",
    "model": "GXP1610",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream gxp1610",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GXP1625",
    "model": "GXP1625",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream gxp1625",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GXP1630",
    "model": "GXP1630",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream gxp1630",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GRP2601P",
    "model": "GRP2601P",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream grp2601p",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GRP2602P",
    "model": "GRP2602P",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream grp2602p",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GRP2603P",
    "model": "GRP2603P",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream grp2603p",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GRP2604P",
    "model": "GRP2604P",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream grp2604p",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GRP2612P",
    "model": "GRP2612P",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream grp2612p",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GRP2613",
    "model": "GRP2613",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream grp2613",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GRP2614",
    "model": "GRP2614",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream grp2614",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GRP2615",
    "model": "GRP2615",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream grp2615",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GRP2616",
    "model": "GRP2616",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream grp2616",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GXV3370",
    "model": "GXV3370",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream gxv3370",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Điện thoại IP Grandstream GXV3380",
    "model": "GXV3380",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Điện thoại IP",
    "brand": "Grandstream",
    "shortDescription": "Điện thoại IP/SIP cho doanh nghiệp, từ dòng cơ bản đến màn hình cảm ứng/video.",
    "focusKeyword": "điện thoại ip grandstream gxv3380",
    "sourceUrl": "https://www.grandstream.com/products/ip-voice-telephony/ip-phones",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED XL 1071E",
    "model": "GigaSPEED XL 1071E",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed xl 1071e",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED XL 1071E-UTG",
    "model": "GigaSPEED XL 1071E-UTG",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed xl 1071e-utg",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED XL 2071E",
    "model": "GigaSPEED XL 2071E",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed xl 2071e",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED XL 2071E-UTG",
    "model": "GigaSPEED XL 2071E-UTG",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed xl 2071e-utg",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED XL 3071E",
    "model": "GigaSPEED XL 3071E",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed xl 3071e",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED XL 3071E-UTG",
    "model": "GigaSPEED XL 3071E-UTG",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed xl 3071e-utg",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED XL5 3081B",
    "model": "GigaSPEED XL5 3081B",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed xl5 3081b",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED XL 3073A",
    "model": "GigaSPEED XL 3073A",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed xl 3073a",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED XL 1073A",
    "model": "GigaSPEED XL 1073A",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed xl 1073a",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED X10D 1091B",
    "model": "GigaSPEED X10D 1091B",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed x10d 1091b",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED X10D 1091B-UTG",
    "model": "GigaSPEED X10D 1091B-UTG",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed x10d 1091b-utg",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED X10D 1091L",
    "model": "GigaSPEED X10D 1091L",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed x10d 1091l",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED X10D 1091SD",
    "model": "GigaSPEED X10D 1091SD",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed x10d 1091sd",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope GigaSPEED X10D 1291B",
    "model": "GigaSPEED X10D 1291B",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope gigaspeed x10d 1291b",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp mạng CommScope SYSTIMAX CS30Z",
    "model": "SYSTIMAX CS30Z",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp mạng",
    "brand": "CommScope",
    "shortDescription": "Cáp đồng xoắn đôi Cat6/Cat6A cho hệ thống mạng cấu trúc doanh nghiệp.",
    "focusKeyword": "cáp mạng commscope systimax cs30z",
    "sourceUrl": "https://www.commscope.com/product-type/cables/twisted-pair-cables/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning ALTOS Loose Tube Gel-Free Cable",
    "model": "ALTOS Loose Tube Gel-Free Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning altos loose tube gel-free cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning ALTOS Lite Loose Tube Cable",
    "model": "ALTOS Lite Loose Tube Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning altos lite loose tube cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning ALTOS Ribbon Cable",
    "model": "ALTOS Ribbon Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning altos ribbon cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning ALTOS LSZH Loose Tube Cable",
    "model": "ALTOS LSZH Loose Tube Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning altos lszh loose tube cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning FREEDM One Tight-Buffered Riser Cable",
    "model": "FREEDM One Tight-Buffered Riser Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning freedm one tight-buffered riser cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning FREEDM One Plenum Cable",
    "model": "FREEDM One Plenum Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning freedm one plenum cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning FREEDM Loose Tube Indoor/Outdoor Cable",
    "model": "FREEDM Loose Tube Indoor/Outdoor Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning freedm loose tube indoor/outdoor cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning FREEDM Loose Tube Gel-Free Cable",
    "model": "FREEDM Loose Tube Gel-Free Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning freedm loose tube gel-free cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning FREEDM LST Cable",
    "model": "FREEDM LST Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning freedm lst cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning MIC Riser Cable",
    "model": "MIC Riser Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning mic riser cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning MIC Plenum Cable",
    "model": "MIC Plenum Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning mic plenum cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning MIC Interlocking Armored Riser Cable",
    "model": "MIC Interlocking Armored Riser Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning mic interlocking armored riser cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning MIC Unitized Riser Cable",
    "model": "MIC Unitized Riser Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning mic unitized riser cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning Ribbon Interconnect Cable",
    "model": "Ribbon Interconnect Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning ribbon interconnect cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Cáp quang Corning Tactical Fiber Optic Cable",
    "model": "Tactical Fiber Optic Cable",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Cáp quang",
    "brand": "Corning",
    "shortDescription": "Cáp quang trong nhà, ngoài trời hoặc indoor/outdoor cho mạng backbone và viễn thông.",
    "focusKeyword": "cáp quang corning tactical fiber optic cable",
    "sourceUrl": "https://www.corning.com/optical-communications/worldwide/en/home/products/fiber-optic-cable.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope 360-IP-PANELS 24 Port",
    "model": "360-IP-PANELS 24 Port",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope 360-ip-panels 24 port",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope 360-IP-PANELS 48 Port",
    "model": "360-IP-PANELS 48 Port",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope 360-ip-panels 48 port",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope 360-MFTP-PANELS",
    "model": "360-MFTP-PANELS",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope 360-mftp-panels",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope 360-MOD-M-PANELS",
    "model": "360-MOD-M-PANELS",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope 360-mod-m-panels",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope PATCHMAX-PANELS 24 Port",
    "model": "PATCHMAX-PANELS 24 Port",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope patchmax-panels 24 port",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope PATCHMAX-PANELS 48 Port",
    "model": "PATCHMAX-PANELS 48 Port",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope patchmax-panels 48 port",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope 1100-DM-PANELS",
    "model": "1100-DM-PANELS",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope 1100-dm-panels",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope CPP-DM-PANELS",
    "model": "CPP-DM-PANELS",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope cpp-dm-panels",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope CPP-MODULAR-PANELS",
    "model": "CPP-MODULAR-PANELS",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope cpp-modular-panels",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope 360-IPR-1100A-E-GS3-1U-24",
    "model": "360-IPR-1100A-E-GS3-1U-24",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope 360-ipr-1100a-e-gs3-1u-24",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope 360-IPR-1100A-E-GS6-1U-24",
    "model": "360-IPR-1100A-E-GS6-1U-24",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope 360-ipr-1100a-e-gs6-1u-24",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Patch Panel CommScope 360-PM-GS6-2U-48",
    "model": "360-PM-GS6-2U-48",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Patch Panel",
    "brand": "CommScope",
    "shortDescription": "Patch panel RJ45/copper cho tủ rack và hệ thống mạng cấu trúc.",
    "focusKeyword": "patch panel commscope 360-pm-gs6-2u-48",
    "sourceUrl": "https://www.commscope.com/product-type/frames-panels-cassettes-modules/copper-panels-modules-cassettes/copper-panels/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope MGS400-WH",
    "model": "MGS400-WH",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope mgs400-wh",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope MGS400-BL",
    "model": "MGS400-BL",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope mgs400-bl",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope MGS400-OR",
    "model": "MGS400-OR",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope mgs400-or",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope MGS400-RD",
    "model": "MGS400-RD",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope mgs400-rd",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope MGS400-YL",
    "model": "MGS400-YL",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope mgs400-yl",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope MGS400-GN",
    "model": "MGS400-GN",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope mgs400-gn",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope MGS500 Modular Jack",
    "model": "MGS500 Modular Jack",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope mgs500 modular jack",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope MGS600 Modular Jack",
    "model": "MGS600 Modular Jack",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope mgs600 modular jack",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope MGS600S Shielded Jack",
    "model": "MGS600S Shielded Jack",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope mgs600s shielded jack",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope SYSTIMAX 360 GigaSPEED XL Patch Cord",
    "model": "SYSTIMAX 360 GigaSPEED XL Patch Cord",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope systimax 360 gigaspeed xl patch cord",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope SYSTIMAX GigaSPEED X10D Patch Cord",
    "model": "SYSTIMAX GigaSPEED X10D Patch Cord",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope systimax gigaspeed x10d patch cord",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope MiNo6A Patch Cord",
    "model": "MiNo6A Patch Cord",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope mino6a patch cord",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope M-Series Single Port Faceplate",
    "model": "M-Series Single Port Faceplate",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope m-series single port faceplate",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối CommScope M-Series Dual Port Faceplate",
    "model": "M-Series Dual Port Faceplate",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "CommScope",
    "shortDescription": "Ổ cắm mạng, dây nhảy, mặt nạ và phụ kiện đấu nối cho hệ thống cáp cấu trúc.",
    "focusKeyword": "phụ kiện kết nối commscope m-series dual port faceplate",
    "sourceUrl": "https://www.commscope.com/product-type/connectors/rj45-jacks-accessories/category-6-jacks/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối MikroTik S-RJ01",
    "model": "S-RJ01",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "MikroTik",
    "shortDescription": "Module RJ45 hoặc cáp DAC dùng kết nối router, switch và thiết bị mạng.",
    "focusKeyword": "phụ kiện kết nối mikrotik s-rj01",
    "sourceUrl": "https://mikrotik.com/products/group/sfp-qsfp",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối MikroTik XS+DA0001",
    "model": "XS+DA0001",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "MikroTik",
    "shortDescription": "Module RJ45 hoặc cáp DAC dùng kết nối router, switch và thiết bị mạng.",
    "focusKeyword": "phụ kiện kết nối mikrotik xs+da0001",
    "sourceUrl": "https://mikrotik.com/products/group/sfp-qsfp",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối MikroTik XS+DA0003",
    "model": "XS+DA0003",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "MikroTik",
    "shortDescription": "Module RJ45 hoặc cáp DAC dùng kết nối router, switch và thiết bị mạng.",
    "focusKeyword": "phụ kiện kết nối mikrotik xs+da0003",
    "sourceUrl": "https://mikrotik.com/products/group/sfp-qsfp",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Phụ kiện kết nối MikroTik XQ+DA0001",
    "model": "XQ+DA0001",
    "mainGroup": "HẠ TẦNG VIỄN THÔNG & CNTT",
    "categoryName": "Phụ kiện kết nối",
    "brand": "MikroTik",
    "shortDescription": "Module RJ45 hoặc cáp DAC dùng kết nối router, switch và thiết bị mạng.",
    "focusKeyword": "phụ kiện kết nối mikrotik xq+da0001",
    "sourceUrl": "https://mikrotik.com/products/group/sfp-qsfp",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R260",
    "model": "R260",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r260",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R360",
    "model": "R360",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r360",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R470",
    "model": "R470",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r470",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R4715",
    "model": "R4715",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r4715",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R570",
    "model": "R570",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r570",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R5715",
    "model": "R5715",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r5715",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R660",
    "model": "R660",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r660",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R6615",
    "model": "R6615",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r6615",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R6625",
    "model": "R6625",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r6625",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R670",
    "model": "R670",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r670",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R6715",
    "model": "R6715",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r6715",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R6725",
    "model": "R6725",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r6725",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R760",
    "model": "R760",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r760",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R7615",
    "model": "R7615",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r7615",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R7625",
    "model": "R7625",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r7625",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R770",
    "model": "R770",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r770",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R7715",
    "model": "R7715",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r7715",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge R7725",
    "model": "R7725",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge r7725",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge T160",
    "model": "T160",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge t160",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy chủ Dell PowerEdge T360",
    "model": "T360",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy chủ",
    "brand": "Dell PowerEdge",
    "shortDescription": "Máy chủ rack hoặc tower cho ứng dụng doanh nghiệp, ảo hóa, dữ liệu và dịch vụ mạng.",
    "focusKeyword": "máy chủ dell poweredge t360",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-poweredge-servers/sr/enterprise-products/servers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC Dell OptiPlex 3000 Tower",
    "model": "3000 Tower",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "Dell OptiPlex",
    "shortDescription": "Máy tính để bàn doanh nghiệp cho văn phòng và hệ thống vận hành.",
    "focusKeyword": "pc dell optiplex 3000 tower",
    "sourceUrl": "https://www.dell.com/en-us/shop/desktop-computers/sr/desktops/optiplex-desktops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC Dell OptiPlex 5000 Tower",
    "model": "5000 Tower",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "Dell OptiPlex",
    "shortDescription": "Máy tính để bàn doanh nghiệp cho văn phòng và hệ thống vận hành.",
    "focusKeyword": "pc dell optiplex 5000 tower",
    "sourceUrl": "https://www.dell.com/en-us/shop/desktop-computers/sr/desktops/optiplex-desktops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC Dell OptiPlex 7000 Tower",
    "model": "7000 Tower",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "Dell OptiPlex",
    "shortDescription": "Máy tính để bàn doanh nghiệp cho văn phòng và hệ thống vận hành.",
    "focusKeyword": "pc dell optiplex 7000 tower",
    "sourceUrl": "https://www.dell.com/en-us/shop/desktop-computers/sr/desktops/optiplex-desktops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC Dell OptiPlex 7010 Small Form Factor",
    "model": "7010 Small Form Factor",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "Dell OptiPlex",
    "shortDescription": "Máy tính để bàn doanh nghiệp cho văn phòng và hệ thống vận hành.",
    "focusKeyword": "pc dell optiplex 7010 small form factor",
    "sourceUrl": "https://www.dell.com/en-us/shop/desktop-computers/sr/desktops/optiplex-desktops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC Dell OptiPlex 7020 Small Form Factor",
    "model": "7020 Small Form Factor",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "Dell OptiPlex",
    "shortDescription": "Máy tính để bàn doanh nghiệp cho văn phòng và hệ thống vận hành.",
    "focusKeyword": "pc dell optiplex 7020 small form factor",
    "sourceUrl": "https://www.dell.com/en-us/shop/desktop-computers/sr/desktops/optiplex-desktops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC HP EliteDesk 800 G9 Tower",
    "model": "EliteDesk 800 G9 Tower",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "HP",
    "shortDescription": "Máy tính để bàn doanh nghiệp cho văn phòng, cơ quan và tổ chức.",
    "focusKeyword": "pc hp elitedesk 800 g9 tower",
    "sourceUrl": "https://www.hp.com/us-en/desktops/business/elitedesk.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC HP EliteDesk 800 G9 Small Form Factor",
    "model": "EliteDesk 800 G9 Small Form Factor",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "HP",
    "shortDescription": "Máy tính để bàn doanh nghiệp cho văn phòng, cơ quan và tổ chức.",
    "focusKeyword": "pc hp elitedesk 800 g9 small form factor",
    "sourceUrl": "https://www.hp.com/us-en/desktops/business/elitedesk.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC HP EliteDesk 805 G8 Small Form Factor",
    "model": "EliteDesk 805 G8 Small Form Factor",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "HP",
    "shortDescription": "Máy tính để bàn doanh nghiệp cho văn phòng, cơ quan và tổ chức.",
    "focusKeyword": "pc hp elitedesk 805 g8 small form factor",
    "sourceUrl": "https://www.hp.com/us-en/desktops/business/elitedesk.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC HP ProDesk 400 G9 Tower",
    "model": "ProDesk 400 G9 Tower",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "HP",
    "shortDescription": "Máy tính để bàn doanh nghiệp cho văn phòng, cơ quan và tổ chức.",
    "focusKeyword": "pc hp prodesk 400 g9 tower",
    "sourceUrl": "https://www.hp.com/us-en/desktops/business/elitedesk.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC HP ProDesk 400 G9 Small Form Factor",
    "model": "ProDesk 400 G9 Small Form Factor",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "HP",
    "shortDescription": "Máy tính để bàn doanh nghiệp cho văn phòng, cơ quan và tổ chức.",
    "focusKeyword": "pc hp prodesk 400 g9 small form factor",
    "sourceUrl": "https://www.hp.com/us-en/desktops/business/elitedesk.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC Lenovo ThinkCentre M70t Gen 5",
    "model": "M70t Gen 5",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "Lenovo ThinkCentre",
    "shortDescription": "Máy tính để bàn doanh nghiệp ThinkCentre cho văn phòng và triển khai số lượng lớn.",
    "focusKeyword": "pc lenovo thinkcentre m70t gen 5",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/desktops/thinkcentre/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC Lenovo ThinkCentre M70s Gen 5",
    "model": "M70s Gen 5",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "Lenovo ThinkCentre",
    "shortDescription": "Máy tính để bàn doanh nghiệp ThinkCentre cho văn phòng và triển khai số lượng lớn.",
    "focusKeyword": "pc lenovo thinkcentre m70s gen 5",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/desktops/thinkcentre/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC Lenovo ThinkCentre M80t Gen 5",
    "model": "M80t Gen 5",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "Lenovo ThinkCentre",
    "shortDescription": "Máy tính để bàn doanh nghiệp ThinkCentre cho văn phòng và triển khai số lượng lớn.",
    "focusKeyword": "pc lenovo thinkcentre m80t gen 5",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/desktops/thinkcentre/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC Lenovo ThinkCentre M90t Gen 5",
    "model": "M90t Gen 5",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "Lenovo ThinkCentre",
    "shortDescription": "Máy tính để bàn doanh nghiệp ThinkCentre cho văn phòng và triển khai số lượng lớn.",
    "focusKeyword": "pc lenovo thinkcentre m90t gen 5",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/desktops/thinkcentre/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "PC Lenovo ThinkCentre neo 50t Gen 5",
    "model": "neo 50t Gen 5",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "PC",
    "brand": "Lenovo ThinkCentre",
    "shortDescription": "Máy tính để bàn doanh nghiệp ThinkCentre cho văn phòng và triển khai số lượng lớn.",
    "focusKeyword": "pc lenovo thinkcentre neo 50t gen 5",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/desktops/thinkcentre/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Mini PC Dell OptiPlex 7010 Micro",
    "model": "7010 Micro",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Mini PC",
    "brand": "Dell OptiPlex",
    "shortDescription": "Máy tính kích thước nhỏ cho văn phòng, quầy giao dịch và hệ thống nhúng.",
    "focusKeyword": "mini pc dell optiplex 7010 micro",
    "sourceUrl": "https://www.dell.com/en-us/shop/desktop-computers/sr/desktops/optiplex-desktops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Mini PC Dell OptiPlex 7020 Micro",
    "model": "7020 Micro",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Mini PC",
    "brand": "Dell OptiPlex",
    "shortDescription": "Máy tính kích thước nhỏ cho văn phòng, quầy giao dịch và hệ thống nhúng.",
    "focusKeyword": "mini pc dell optiplex 7020 micro",
    "sourceUrl": "https://www.dell.com/en-us/shop/desktop-computers/sr/desktops/optiplex-desktops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Mini PC Dell OptiPlex Plus 7020 Micro",
    "model": "Plus 7020 Micro",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Mini PC",
    "brand": "Dell OptiPlex",
    "shortDescription": "Máy tính kích thước nhỏ cho văn phòng, quầy giao dịch và hệ thống nhúng.",
    "focusKeyword": "mini pc dell optiplex plus 7020 micro",
    "sourceUrl": "https://www.dell.com/en-us/shop/desktop-computers/sr/desktops/optiplex-desktops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Mini PC HP Elite Mini 800 G9",
    "model": "Elite Mini 800 G9",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Mini PC",
    "brand": "HP",
    "shortDescription": "Máy tính mini doanh nghiệp tối ưu không gian làm việc.",
    "focusKeyword": "mini pc hp elite mini 800 g9",
    "sourceUrl": "https://www.hp.com/us-en/business-solutions/business-computers.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Mini PC HP Elite Mini 805 G8",
    "model": "Elite Mini 805 G8",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Mini PC",
    "brand": "HP",
    "shortDescription": "Máy tính mini doanh nghiệp tối ưu không gian làm việc.",
    "focusKeyword": "mini pc hp elite mini 805 g8",
    "sourceUrl": "https://www.hp.com/us-en/business-solutions/business-computers.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Mini PC HP Pro Mini 400 G9",
    "model": "Pro Mini 400 G9",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Mini PC",
    "brand": "HP",
    "shortDescription": "Máy tính mini doanh nghiệp tối ưu không gian làm việc.",
    "focusKeyword": "mini pc hp pro mini 400 g9",
    "sourceUrl": "https://www.hp.com/us-en/business-solutions/business-computers.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Mini PC Lenovo ThinkCentre M70q Gen 5",
    "model": "M70q Gen 5",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Mini PC",
    "brand": "Lenovo ThinkCentre",
    "shortDescription": "Máy tính Tiny/Mini PC cho doanh nghiệp và điểm giao dịch.",
    "focusKeyword": "mini pc lenovo thinkcentre m70q gen 5",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/desktops/thinkcentre/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Mini PC Lenovo ThinkCentre M80q Gen 4",
    "model": "M80q Gen 4",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Mini PC",
    "brand": "Lenovo ThinkCentre",
    "shortDescription": "Máy tính Tiny/Mini PC cho doanh nghiệp và điểm giao dịch.",
    "focusKeyword": "mini pc lenovo thinkcentre m80q gen 4",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/desktops/thinkcentre/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Mini PC Lenovo ThinkCentre M90q Gen 5",
    "model": "M90q Gen 5",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Mini PC",
    "brand": "Lenovo ThinkCentre",
    "shortDescription": "Máy tính Tiny/Mini PC cho doanh nghiệp và điểm giao dịch.",
    "focusKeyword": "mini pc lenovo thinkcentre m90q gen 5",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/desktops/thinkcentre/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Mini PC Lenovo ThinkCentre neo 50q Gen 4",
    "model": "neo 50q Gen 4",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Mini PC",
    "brand": "Lenovo ThinkCentre",
    "shortDescription": "Máy tính Tiny/Mini PC cho doanh nghiệp và điểm giao dịch.",
    "focusKeyword": "mini pc lenovo thinkcentre neo 50q gen 4",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/desktops/thinkcentre/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Dell Latitude 3450",
    "model": "Latitude 3450",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Dell",
    "shortDescription": "Laptop doanh nghiệp hoặc máy trạm di động cho nhân viên kỹ thuật và văn phòng.",
    "focusKeyword": "laptop dell latitude 3450",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-laptops-and-2-in-1-pcs/sr/laptops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Dell Latitude 3550",
    "model": "Latitude 3550",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Dell",
    "shortDescription": "Laptop doanh nghiệp hoặc máy trạm di động cho nhân viên kỹ thuật và văn phòng.",
    "focusKeyword": "laptop dell latitude 3550",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-laptops-and-2-in-1-pcs/sr/laptops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Dell Latitude 5450",
    "model": "Latitude 5450",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Dell",
    "shortDescription": "Laptop doanh nghiệp hoặc máy trạm di động cho nhân viên kỹ thuật và văn phòng.",
    "focusKeyword": "laptop dell latitude 5450",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-laptops-and-2-in-1-pcs/sr/laptops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Dell Latitude 5550",
    "model": "Latitude 5550",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Dell",
    "shortDescription": "Laptop doanh nghiệp hoặc máy trạm di động cho nhân viên kỹ thuật và văn phòng.",
    "focusKeyword": "laptop dell latitude 5550",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-laptops-and-2-in-1-pcs/sr/laptops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Dell Latitude 7450",
    "model": "Latitude 7450",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Dell",
    "shortDescription": "Laptop doanh nghiệp hoặc máy trạm di động cho nhân viên kỹ thuật và văn phòng.",
    "focusKeyword": "laptop dell latitude 7450",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-laptops-and-2-in-1-pcs/sr/laptops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Dell Precision 3490",
    "model": "Precision 3490",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Dell",
    "shortDescription": "Laptop doanh nghiệp hoặc máy trạm di động cho nhân viên kỹ thuật và văn phòng.",
    "focusKeyword": "laptop dell precision 3490",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-laptops-and-2-in-1-pcs/sr/laptops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Dell Precision 3590",
    "model": "Precision 3590",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Dell",
    "shortDescription": "Laptop doanh nghiệp hoặc máy trạm di động cho nhân viên kỹ thuật và văn phòng.",
    "focusKeyword": "laptop dell precision 3590",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-laptops-and-2-in-1-pcs/sr/laptops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Dell Precision 5690",
    "model": "Precision 5690",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Dell",
    "shortDescription": "Laptop doanh nghiệp hoặc máy trạm di động cho nhân viên kỹ thuật và văn phòng.",
    "focusKeyword": "laptop dell precision 5690",
    "sourceUrl": "https://www.dell.com/en-us/shop/dell-laptops-and-2-in-1-pcs/sr/laptops",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop HP EliteBook 640 G11",
    "model": "EliteBook 640 G11",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "HP",
    "shortDescription": "Laptop doanh nghiệp cho làm việc di động, quản trị và bảo mật.",
    "focusKeyword": "laptop hp elitebook 640 g11",
    "sourceUrl": "https://www.hp.com/us-en/shop/vwa/laptops/usage=Business",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop HP EliteBook 660 G11",
    "model": "EliteBook 660 G11",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "HP",
    "shortDescription": "Laptop doanh nghiệp cho làm việc di động, quản trị và bảo mật.",
    "focusKeyword": "laptop hp elitebook 660 g11",
    "sourceUrl": "https://www.hp.com/us-en/shop/vwa/laptops/usage=Business",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop HP EliteBook 840 G11",
    "model": "EliteBook 840 G11",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "HP",
    "shortDescription": "Laptop doanh nghiệp cho làm việc di động, quản trị và bảo mật.",
    "focusKeyword": "laptop hp elitebook 840 g11",
    "sourceUrl": "https://www.hp.com/us-en/shop/vwa/laptops/usage=Business",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop HP EliteBook 860 G11",
    "model": "EliteBook 860 G11",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "HP",
    "shortDescription": "Laptop doanh nghiệp cho làm việc di động, quản trị và bảo mật.",
    "focusKeyword": "laptop hp elitebook 860 g11",
    "sourceUrl": "https://www.hp.com/us-en/shop/vwa/laptops/usage=Business",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop HP ProBook 440 G11",
    "model": "ProBook 440 G11",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "HP",
    "shortDescription": "Laptop doanh nghiệp cho làm việc di động, quản trị và bảo mật.",
    "focusKeyword": "laptop hp probook 440 g11",
    "sourceUrl": "https://www.hp.com/us-en/shop/vwa/laptops/usage=Business",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop HP ProBook 460 G11",
    "model": "ProBook 460 G11",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "HP",
    "shortDescription": "Laptop doanh nghiệp cho làm việc di động, quản trị và bảo mật.",
    "focusKeyword": "laptop hp probook 460 g11",
    "sourceUrl": "https://www.hp.com/us-en/shop/vwa/laptops/usage=Business",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Lenovo ThinkPad E14 Gen 6",
    "model": "E14 Gen 6",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Lenovo ThinkPad",
    "shortDescription": "Laptop ThinkPad cho doanh nghiệp, quản lý và kỹ thuật chuyên nghiệp.",
    "focusKeyword": "laptop lenovo thinkpad e14 gen 6",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/laptops/thinkpad/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Lenovo ThinkPad E16 Gen 2",
    "model": "E16 Gen 2",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Lenovo ThinkPad",
    "shortDescription": "Laptop ThinkPad cho doanh nghiệp, quản lý và kỹ thuật chuyên nghiệp.",
    "focusKeyword": "laptop lenovo thinkpad e16 gen 2",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/laptops/thinkpad/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Lenovo ThinkPad T14 Gen 5",
    "model": "T14 Gen 5",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Lenovo ThinkPad",
    "shortDescription": "Laptop ThinkPad cho doanh nghiệp, quản lý và kỹ thuật chuyên nghiệp.",
    "focusKeyword": "laptop lenovo thinkpad t14 gen 5",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/laptops/thinkpad/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Lenovo ThinkPad T16 Gen 3",
    "model": "T16 Gen 3",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Lenovo ThinkPad",
    "shortDescription": "Laptop ThinkPad cho doanh nghiệp, quản lý và kỹ thuật chuyên nghiệp.",
    "focusKeyword": "laptop lenovo thinkpad t16 gen 3",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/laptops/thinkpad/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Lenovo ThinkPad X1 Carbon Gen 12",
    "model": "X1 Carbon Gen 12",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Lenovo ThinkPad",
    "shortDescription": "Laptop ThinkPad cho doanh nghiệp, quản lý và kỹ thuật chuyên nghiệp.",
    "focusKeyword": "laptop lenovo thinkpad x1 carbon gen 12",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/laptops/thinkpad/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Laptop Lenovo ThinkPad P14s Gen 5",
    "model": "P14s Gen 5",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Laptop",
    "brand": "Lenovo ThinkPad",
    "shortDescription": "Laptop ThinkPad cho doanh nghiệp, quản lý và kỹ thuật chuyên nghiệp.",
    "focusKeyword": "laptop lenovo thinkpad p14s gen 5",
    "sourceUrl": "https://www.lenovo.com/vn/vi/c/laptops/thinkpad/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy in nhãn Zebra ZD411",
    "model": "ZD411",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy in nhãn",
    "brand": "Zebra",
    "shortDescription": "Máy in mã vạch/nhãn để bàn hoặc công nghiệp cho kho vận và bán lẻ.",
    "focusKeyword": "máy in nhãn zebra zd411",
    "sourceUrl": "https://www.zebra.com/us/en/products/printers.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy in nhãn Zebra ZD421",
    "model": "ZD421",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy in nhãn",
    "brand": "Zebra",
    "shortDescription": "Máy in mã vạch/nhãn để bàn hoặc công nghiệp cho kho vận và bán lẻ.",
    "focusKeyword": "máy in nhãn zebra zd421",
    "sourceUrl": "https://www.zebra.com/us/en/products/printers.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy in nhãn Zebra ZD621",
    "model": "ZD621",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy in nhãn",
    "brand": "Zebra",
    "shortDescription": "Máy in mã vạch/nhãn để bàn hoặc công nghiệp cho kho vận và bán lẻ.",
    "focusKeyword": "máy in nhãn zebra zd621",
    "sourceUrl": "https://www.zebra.com/us/en/products/printers.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy in nhãn Zebra ZT231",
    "model": "ZT231",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy in nhãn",
    "brand": "Zebra",
    "shortDescription": "Máy in mã vạch/nhãn để bàn hoặc công nghiệp cho kho vận và bán lẻ.",
    "focusKeyword": "máy in nhãn zebra zt231",
    "sourceUrl": "https://www.zebra.com/us/en/products/printers.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy in nhãn Zebra ZT411",
    "model": "ZT411",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy in nhãn",
    "brand": "Zebra",
    "shortDescription": "Máy in mã vạch/nhãn để bàn hoặc công nghiệp cho kho vận và bán lẻ.",
    "focusKeyword": "máy in nhãn zebra zt411",
    "sourceUrl": "https://www.zebra.com/us/en/products/printers.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy in nhãn Zebra ZT421",
    "model": "ZT421",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy in nhãn",
    "brand": "Zebra",
    "shortDescription": "Máy in mã vạch/nhãn để bàn hoặc công nghiệp cho kho vận và bán lẻ.",
    "focusKeyword": "máy in nhãn zebra zt421",
    "sourceUrl": "https://www.zebra.com/us/en/products/printers.html",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy in nhãn Honeywell PC45",
    "model": "PC45",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy in nhãn",
    "brand": "Honeywell",
    "shortDescription": "Máy in nhãn và mã vạch cho bán lẻ, kho vận và sản xuất.",
    "focusKeyword": "máy in nhãn honeywell pc45",
    "sourceUrl": "https://automation.honeywell.com/us/en/products/productivity-solutions/printers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy in nhãn Honeywell PC45t",
    "model": "PC45t",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy in nhãn",
    "brand": "Honeywell",
    "shortDescription": "Máy in nhãn và mã vạch cho bán lẻ, kho vận và sản xuất.",
    "focusKeyword": "máy in nhãn honeywell pc45t",
    "sourceUrl": "https://automation.honeywell.com/us/en/products/productivity-solutions/printers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy in nhãn Honeywell PM45",
    "model": "PM45",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy in nhãn",
    "brand": "Honeywell",
    "shortDescription": "Máy in nhãn và mã vạch cho bán lẻ, kho vận và sản xuất.",
    "focusKeyword": "máy in nhãn honeywell pm45",
    "sourceUrl": "https://automation.honeywell.com/us/en/products/productivity-solutions/printers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Máy in nhãn Honeywell PD45S",
    "model": "PD45S",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Máy in nhãn",
    "brand": "Honeywell",
    "shortDescription": "Máy in nhãn và mã vạch cho bán lẻ, kho vận và sản xuất.",
    "focusKeyword": "máy in nhãn honeywell pd45s",
    "sourceUrl": "https://automation.honeywell.com/us/en/products/productivity-solutions/printers",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Kiosk Posiflex TK-2111",
    "model": "TK-2111",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Kiosk",
    "brand": "Posiflex",
    "shortDescription": "Kiosk tự phục vụ cho tra cứu thông tin, thanh toán, lấy số và giao dịch khách hàng.",
    "focusKeyword": "kiosk posiflex tk-2111",
    "sourceUrl": "https://www.posiflex.com/product/kiosk/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Kiosk Posiflex TK-2132",
    "model": "TK-2132",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Kiosk",
    "brand": "Posiflex",
    "shortDescription": "Kiosk tự phục vụ cho tra cứu thông tin, thanh toán, lấy số và giao dịch khách hàng.",
    "focusKeyword": "kiosk posiflex tk-2132",
    "sourceUrl": "https://www.posiflex.com/product/kiosk/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Kiosk Posiflex TK-2152",
    "model": "TK-2152",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Kiosk",
    "brand": "Posiflex",
    "shortDescription": "Kiosk tự phục vụ cho tra cứu thông tin, thanh toán, lấy số và giao dịch khách hàng.",
    "focusKeyword": "kiosk posiflex tk-2152",
    "sourceUrl": "https://www.posiflex.com/product/kiosk/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Kiosk Posiflex TK-3211",
    "model": "TK-3211",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Kiosk",
    "brand": "Posiflex",
    "shortDescription": "Kiosk tự phục vụ cho tra cứu thông tin, thanh toán, lấy số và giao dịch khách hàng.",
    "focusKeyword": "kiosk posiflex tk-3211",
    "sourceUrl": "https://www.posiflex.com/product/kiosk/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Kiosk Posiflex TK-3232",
    "model": "TK-3232",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Kiosk",
    "brand": "Posiflex",
    "shortDescription": "Kiosk tự phục vụ cho tra cứu thông tin, thanh toán, lấy số và giao dịch khách hàng.",
    "focusKeyword": "kiosk posiflex tk-3232",
    "sourceUrl": "https://www.posiflex.com/product/kiosk/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Kiosk Posiflex TK-3252",
    "model": "TK-3252",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Kiosk",
    "brand": "Posiflex",
    "shortDescription": "Kiosk tự phục vụ cho tra cứu thông tin, thanh toán, lấy số và giao dịch khách hàng.",
    "focusKeyword": "kiosk posiflex tk-3252",
    "sourceUrl": "https://www.posiflex.com/product/kiosk/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Kiosk Posiflex EK-2110",
    "model": "EK-2110",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Kiosk",
    "brand": "Posiflex",
    "shortDescription": "Kiosk tự phục vụ cho tra cứu thông tin, thanh toán, lấy số và giao dịch khách hàng.",
    "focusKeyword": "kiosk posiflex ek-2110",
    "sourceUrl": "https://www.posiflex.com/product/kiosk/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Kiosk Posiflex EK-2132",
    "model": "EK-2132",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Kiosk",
    "brand": "Posiflex",
    "shortDescription": "Kiosk tự phục vụ cho tra cứu thông tin, thanh toán, lấy số và giao dịch khách hàng.",
    "focusKeyword": "kiosk posiflex ek-2132",
    "sourceUrl": "https://www.posiflex.com/product/kiosk/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Kiosk Posiflex EK-2152",
    "model": "EK-2152",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Kiosk",
    "brand": "Posiflex",
    "shortDescription": "Kiosk tự phục vụ cho tra cứu thông tin, thanh toán, lấy số và giao dịch khách hàng.",
    "focusKeyword": "kiosk posiflex ek-2152",
    "sourceUrl": "https://www.posiflex.com/product/kiosk/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Kiosk Posiflex JK-3210",
    "model": "JK-3210",
    "mainGroup": "THIẾT BỊ CNTT",
    "categoryName": "Kiosk",
    "brand": "Posiflex",
    "shortDescription": "Kiosk tự phục vụ cho tra cứu thông tin, thanh toán, lấy số và giao dịch khách hàng.",
    "focusKeyword": "kiosk posiflex jk-3210",
    "sourceUrl": "https://www.posiflex.com/product/kiosk/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời LONGi Hi-MO X10 Scientist",
    "model": "Hi-MO X10 Scientist",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "LONGi",
    "shortDescription": "Tấm quang điện hiệu suất cao cho hệ thống mái nhà, thương mại hoặc dự án.",
    "focusKeyword": "tấm pin năng lượng mặt trời longi hi-mo x10 scientist",
    "sourceUrl": "https://www.longi.com/en/products/modules-series/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời LONGi Hi-MO X10 Guardian",
    "model": "Hi-MO X10 Guardian",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "LONGi",
    "shortDescription": "Tấm quang điện hiệu suất cao cho hệ thống mái nhà, thương mại hoặc dự án.",
    "focusKeyword": "tấm pin năng lượng mặt trời longi hi-mo x10 guardian",
    "sourceUrl": "https://www.longi.com/en/products/modules-series/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời LONGi Hi-MO S10",
    "model": "Hi-MO S10",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "LONGi",
    "shortDescription": "Tấm quang điện hiệu suất cao cho hệ thống mái nhà, thương mại hoặc dự án.",
    "focusKeyword": "tấm pin năng lượng mặt trời longi hi-mo s10",
    "sourceUrl": "https://www.longi.com/en/products/modules-series/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời LONGi Hi-MO 9",
    "model": "Hi-MO 9",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "LONGi",
    "shortDescription": "Tấm quang điện hiệu suất cao cho hệ thống mái nhà, thương mại hoặc dự án.",
    "focusKeyword": "tấm pin năng lượng mặt trời longi hi-mo 9",
    "sourceUrl": "https://www.longi.com/en/products/modules-series/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời LONGi Hi-MO 7",
    "model": "Hi-MO 7",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "LONGi",
    "shortDescription": "Tấm quang điện hiệu suất cao cho hệ thống mái nhà, thương mại hoặc dự án.",
    "focusKeyword": "tấm pin năng lượng mặt trời longi hi-mo 7",
    "sourceUrl": "https://www.longi.com/en/products/modules-series/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời JinkoSolar Tiger Neo 78HC-BDV",
    "model": "Tiger Neo 78HC-BDV",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "JinkoSolar",
    "shortDescription": "Tấm pin quang điện N-type cho dự án dân dụng, thương mại và quy mô lớn.",
    "focusKeyword": "tấm pin năng lượng mặt trời jinkosolar tiger neo 78hc-bdv",
    "sourceUrl": "https://www.jinkosolar.com/en/site/tigerneo",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời JinkoSolar Tiger Neo 72HC",
    "model": "Tiger Neo 72HC",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "JinkoSolar",
    "shortDescription": "Tấm pin quang điện N-type cho dự án dân dụng, thương mại và quy mô lớn.",
    "focusKeyword": "tấm pin năng lượng mặt trời jinkosolar tiger neo 72hc",
    "sourceUrl": "https://www.jinkosolar.com/en/site/tigerneo",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời JinkoSolar Tiger Neo 66HC",
    "model": "Tiger Neo 66HC",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "JinkoSolar",
    "shortDescription": "Tấm pin quang điện N-type cho dự án dân dụng, thương mại và quy mô lớn.",
    "focusKeyword": "tấm pin năng lượng mặt trời jinkosolar tiger neo 66hc",
    "sourceUrl": "https://www.jinkosolar.com/en/site/tigerneo",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời JinkoSolar Tiger Neo 3.0",
    "model": "Tiger Neo 3.0",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "JinkoSolar",
    "shortDescription": "Tấm pin quang điện N-type cho dự án dân dụng, thương mại và quy mô lớn.",
    "focusKeyword": "tấm pin năng lượng mặt trời jinkosolar tiger neo 3.0",
    "sourceUrl": "https://www.jinkosolar.com/en/site/tigerneo",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời JinkoSolar Tiger Neo 5.0",
    "model": "Tiger Neo 5.0",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "JinkoSolar",
    "shortDescription": "Tấm pin quang điện N-type cho dự án dân dụng, thương mại và quy mô lớn.",
    "focusKeyword": "tấm pin năng lượng mặt trời jinkosolar tiger neo 5.0",
    "sourceUrl": "https://www.jinkosolar.com/en/site/tigerneo",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời JinkoSolar Tiger Neo Light Diamond",
    "model": "Tiger Neo Light Diamond",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "JinkoSolar",
    "shortDescription": "Tấm pin quang điện N-type cho dự án dân dụng, thương mại và quy mô lớn.",
    "focusKeyword": "tấm pin năng lượng mặt trời jinkosolar tiger neo light diamond",
    "sourceUrl": "https://www.jinkosolar.com/en/site/tigerneo",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Tấm pin năng lượng mặt trời JinkoSolar Tiger Neo Anti-Dust Module",
    "model": "Tiger Neo Anti-Dust Module",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Tấm pin năng lượng mặt trời",
    "brand": "JinkoSolar",
    "shortDescription": "Tấm pin quang điện N-type cho dự án dân dụng, thương mại và quy mô lớn.",
    "focusKeyword": "tấm pin năng lượng mặt trời jinkosolar tiger neo anti-dust module",
    "sourceUrl": "https://www.jinkosolar.com/en/site/tigerneo",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Bộ hòa lưới (Inverter) Huawei FusionSolar SUN2000-3KTL-L1",
    "model": "SUN2000-3KTL-L1",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Bộ hòa lưới (Inverter)",
    "brand": "Huawei FusionSolar",
    "shortDescription": "Bộ nghịch lưu/hòa lưới cho hệ thống điện mặt trời dân dụng, thương mại hoặc công nghiệp.",
    "focusKeyword": "bộ hòa lưới (inverter) huawei fusionsolar sun2000-3ktl-l1",
    "sourceUrl": "https://solar.huawei.com/en/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Bộ hòa lưới (Inverter) Huawei FusionSolar SUN2000-4KTL-L1",
    "model": "SUN2000-4KTL-L1",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Bộ hòa lưới (Inverter)",
    "brand": "Huawei FusionSolar",
    "shortDescription": "Bộ nghịch lưu/hòa lưới cho hệ thống điện mặt trời dân dụng, thương mại hoặc công nghiệp.",
    "focusKeyword": "bộ hòa lưới (inverter) huawei fusionsolar sun2000-4ktl-l1",
    "sourceUrl": "https://solar.huawei.com/en/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Bộ hòa lưới (Inverter) Huawei FusionSolar SUN2000-5KTL-L1",
    "model": "SUN2000-5KTL-L1",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Bộ hòa lưới (Inverter)",
    "brand": "Huawei FusionSolar",
    "shortDescription": "Bộ nghịch lưu/hòa lưới cho hệ thống điện mặt trời dân dụng, thương mại hoặc công nghiệp.",
    "focusKeyword": "bộ hòa lưới (inverter) huawei fusionsolar sun2000-5ktl-l1",
    "sourceUrl": "https://solar.huawei.com/en/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Bộ hòa lưới (Inverter) Huawei FusionSolar SUN2000-6KTL-L1",
    "model": "SUN2000-6KTL-L1",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Bộ hòa lưới (Inverter)",
    "brand": "Huawei FusionSolar",
    "shortDescription": "Bộ nghịch lưu/hòa lưới cho hệ thống điện mặt trời dân dụng, thương mại hoặc công nghiệp.",
    "focusKeyword": "bộ hòa lưới (inverter) huawei fusionsolar sun2000-6ktl-l1",
    "sourceUrl": "https://solar.huawei.com/en/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Bộ hòa lưới (Inverter) Huawei FusionSolar SUN2000-10KTL-M1",
    "model": "SUN2000-10KTL-M1",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Bộ hòa lưới (Inverter)",
    "brand": "Huawei FusionSolar",
    "shortDescription": "Bộ nghịch lưu/hòa lưới cho hệ thống điện mặt trời dân dụng, thương mại hoặc công nghiệp.",
    "focusKeyword": "bộ hòa lưới (inverter) huawei fusionsolar sun2000-10ktl-m1",
    "sourceUrl": "https://solar.huawei.com/en/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Bộ hòa lưới (Inverter) Huawei FusionSolar SUN2000-12K-MAP0",
    "model": "SUN2000-12K-MAP0",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Bộ hòa lưới (Inverter)",
    "brand": "Huawei FusionSolar",
    "shortDescription": "Bộ nghịch lưu/hòa lưới cho hệ thống điện mặt trời dân dụng, thương mại hoặc công nghiệp.",
    "focusKeyword": "bộ hòa lưới (inverter) huawei fusionsolar sun2000-12k-map0",
    "sourceUrl": "https://solar.huawei.com/en/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Bộ hòa lưới (Inverter) Huawei FusionSolar SUN2000-20KTL-MB0",
    "model": "SUN2000-20KTL-MB0",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Bộ hòa lưới (Inverter)",
    "brand": "Huawei FusionSolar",
    "shortDescription": "Bộ nghịch lưu/hòa lưới cho hệ thống điện mặt trời dân dụng, thương mại hoặc công nghiệp.",
    "focusKeyword": "bộ hòa lưới (inverter) huawei fusionsolar sun2000-20ktl-mb0",
    "sourceUrl": "https://solar.huawei.com/en/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Bộ hòa lưới (Inverter) Huawei FusionSolar SUN2000-150K-MG0",
    "model": "SUN2000-150K-MG0",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Bộ hòa lưới (Inverter)",
    "brand": "Huawei FusionSolar",
    "shortDescription": "Bộ nghịch lưu/hòa lưới cho hệ thống điện mặt trời dân dụng, thương mại hoặc công nghiệp.",
    "focusKeyword": "bộ hòa lưới (inverter) huawei fusionsolar sun2000-150k-mg0",
    "sourceUrl": "https://solar.huawei.com/en/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Bộ hòa lưới (Inverter) Sungrow SG5.0RS",
    "model": "SG5.0RS",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Bộ hòa lưới (Inverter)",
    "brand": "Sungrow",
    "shortDescription": "Bộ inverter hòa lưới cho hệ thống điện mặt trời mái nhà và thương mại.",
    "focusKeyword": "bộ hòa lưới (inverter) sungrow sg5.0rs",
    "sourceUrl": "https://www.sungrowpower.com/en/pv-inverter",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Bộ hòa lưới (Inverter) Sungrow SG10RT",
    "model": "SG10RT",
    "mainGroup": "NĂNG LƯỢNG MẶT TRỜI",
    "categoryName": "Bộ hòa lưới (Inverter)",
    "brand": "Sungrow",
    "shortDescription": "Bộ inverter hòa lưới cho hệ thống điện mặt trời mái nhà và thương mại.",
    "focusKeyword": "bộ hòa lưới (inverter) sungrow sg10rt",
    "sourceUrl": "https://www.sungrowpower.com/en/pv-inverter",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy chì CSB Battery GP1272",
    "model": "GP1272",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy chì",
    "brand": "CSB Battery",
    "shortDescription": "Ắc quy chì kín khí VRLA cho UPS, viễn thông và nguồn dự phòng.",
    "focusKeyword": "ắc quy chì csb battery gp1272",
    "sourceUrl": "https://csb-battery.com/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy chì CSB Battery GP12260",
    "model": "GP12260",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy chì",
    "brand": "CSB Battery",
    "shortDescription": "Ắc quy chì kín khí VRLA cho UPS, viễn thông và nguồn dự phòng.",
    "focusKeyword": "ắc quy chì csb battery gp12260",
    "sourceUrl": "https://csb-battery.com/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy chì CSB Battery HRL12110W",
    "model": "HRL12110W",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy chì",
    "brand": "CSB Battery",
    "shortDescription": "Ắc quy chì kín khí VRLA cho UPS, viễn thông và nguồn dự phòng.",
    "focusKeyword": "ắc quy chì csb battery hrl12110w",
    "sourceUrl": "https://csb-battery.com/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy chì CSB Battery HRL1234W",
    "model": "HRL1234W",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy chì",
    "brand": "CSB Battery",
    "shortDescription": "Ắc quy chì kín khí VRLA cho UPS, viễn thông và nguồn dự phòng.",
    "focusKeyword": "ắc quy chì csb battery hrl1234w",
    "sourceUrl": "https://csb-battery.com/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy chì CSB Battery GPL12520",
    "model": "GPL12520",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy chì",
    "brand": "CSB Battery",
    "shortDescription": "Ắc quy chì kín khí VRLA cho UPS, viễn thông và nguồn dự phòng.",
    "focusKeyword": "ắc quy chì csb battery gpl12520",
    "sourceUrl": "https://csb-battery.com/products/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy chì Vision Battery CP1270",
    "model": "CP1270",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy chì",
    "brand": "Vision Battery",
    "shortDescription": "Ắc quy chì kín khí dùng cho UPS, viễn thông, lưu trữ và nguồn dự phòng.",
    "focusKeyword": "ắc quy chì vision battery cp1270",
    "sourceUrl": "https://www.vision-batt.com/en/product/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy chì Vision Battery CP12120",
    "model": "CP12120",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy chì",
    "brand": "Vision Battery",
    "shortDescription": "Ắc quy chì kín khí dùng cho UPS, viễn thông, lưu trữ và nguồn dự phòng.",
    "focusKeyword": "ắc quy chì vision battery cp12120",
    "sourceUrl": "https://www.vision-batt.com/en/product/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy chì Vision Battery 6FM100",
    "model": "6FM100",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy chì",
    "brand": "Vision Battery",
    "shortDescription": "Ắc quy chì kín khí dùng cho UPS, viễn thông, lưu trữ và nguồn dự phòng.",
    "focusKeyword": "ắc quy chì vision battery 6fm100",
    "sourceUrl": "https://www.vision-batt.com/en/product/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy chì Vision Battery 6FM150",
    "model": "6FM150",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy chì",
    "brand": "Vision Battery",
    "shortDescription": "Ắc quy chì kín khí dùng cho UPS, viễn thông, lưu trữ và nguồn dự phòng.",
    "focusKeyword": "ắc quy chì vision battery 6fm150",
    "sourceUrl": "https://www.vision-batt.com/en/product/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy chì Vision Battery HFS12-100W",
    "model": "HFS12-100W",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy chì",
    "brand": "Vision Battery",
    "shortDescription": "Ắc quy chì kín khí dùng cho UPS, viễn thông, lưu trữ và nguồn dự phòng.",
    "focusKeyword": "ắc quy chì vision battery hfs12-100w",
    "sourceUrl": "https://www.vision-batt.com/en/product/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy Lithium BYD Battery-Box Premium HVS 5.1",
    "model": "Premium HVS 5.1",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy Lithium",
    "brand": "BYD Battery-Box",
    "shortDescription": "Hệ thống pin lithium điện áp cao cho lưu trữ năng lượng mặt trời và nguồn dự phòng.",
    "focusKeyword": "ắc quy lithium byd battery-box premium hvs 5.1",
    "sourceUrl": "https://www.bydbatterybox.com/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy Lithium BYD Battery-Box Premium HVS 7.7",
    "model": "Premium HVS 7.7",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy Lithium",
    "brand": "BYD Battery-Box",
    "shortDescription": "Hệ thống pin lithium điện áp cao cho lưu trữ năng lượng mặt trời và nguồn dự phòng.",
    "focusKeyword": "ắc quy lithium byd battery-box premium hvs 7.7",
    "sourceUrl": "https://www.bydbatterybox.com/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy Lithium BYD Battery-Box Premium HVS 10.2",
    "model": "Premium HVS 10.2",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy Lithium",
    "brand": "BYD Battery-Box",
    "shortDescription": "Hệ thống pin lithium điện áp cao cho lưu trữ năng lượng mặt trời và nguồn dự phòng.",
    "focusKeyword": "ắc quy lithium byd battery-box premium hvs 10.2",
    "sourceUrl": "https://www.bydbatterybox.com/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy Lithium BYD Battery-Box Premium HVS 12.8",
    "model": "Premium HVS 12.8",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy Lithium",
    "brand": "BYD Battery-Box",
    "shortDescription": "Hệ thống pin lithium điện áp cao cho lưu trữ năng lượng mặt trời và nguồn dự phòng.",
    "focusKeyword": "ắc quy lithium byd battery-box premium hvs 12.8",
    "sourceUrl": "https://www.bydbatterybox.com/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy Lithium BYD Battery-Box Premium HVM 8.3",
    "model": "Premium HVM 8.3",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy Lithium",
    "brand": "BYD Battery-Box",
    "shortDescription": "Hệ thống pin lithium điện áp cao cho lưu trữ năng lượng mặt trời và nguồn dự phòng.",
    "focusKeyword": "ắc quy lithium byd battery-box premium hvm 8.3",
    "sourceUrl": "https://www.bydbatterybox.com/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy Lithium BYD Battery-Box Premium HVM 11.0",
    "model": "Premium HVM 11.0",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy Lithium",
    "brand": "BYD Battery-Box",
    "shortDescription": "Hệ thống pin lithium điện áp cao cho lưu trữ năng lượng mặt trời và nguồn dự phòng.",
    "focusKeyword": "ắc quy lithium byd battery-box premium hvm 11.0",
    "sourceUrl": "https://www.bydbatterybox.com/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy Lithium BYD Battery-Box Premium HVM 13.8",
    "model": "Premium HVM 13.8",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy Lithium",
    "brand": "BYD Battery-Box",
    "shortDescription": "Hệ thống pin lithium điện áp cao cho lưu trữ năng lượng mặt trời và nguồn dự phòng.",
    "focusKeyword": "ắc quy lithium byd battery-box premium hvm 13.8",
    "sourceUrl": "https://www.bydbatterybox.com/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy Lithium BYD Battery-Box Premium HVM 16.6",
    "model": "Premium HVM 16.6",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy Lithium",
    "brand": "BYD Battery-Box",
    "shortDescription": "Hệ thống pin lithium điện áp cao cho lưu trữ năng lượng mặt trời và nguồn dự phòng.",
    "focusKeyword": "ắc quy lithium byd battery-box premium hvm 16.6",
    "sourceUrl": "https://www.bydbatterybox.com/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy Lithium BYD Battery-Box Premium HVM 19.3",
    "model": "Premium HVM 19.3",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy Lithium",
    "brand": "BYD Battery-Box",
    "shortDescription": "Hệ thống pin lithium điện áp cao cho lưu trữ năng lượng mặt trời và nguồn dự phòng.",
    "focusKeyword": "ắc quy lithium byd battery-box premium hvm 19.3",
    "sourceUrl": "https://www.bydbatterybox.com/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy Lithium BYD Battery-Box Premium HVM 22.1",
    "model": "Premium HVM 22.1",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy Lithium",
    "brand": "BYD Battery-Box",
    "shortDescription": "Hệ thống pin lithium điện áp cao cho lưu trữ năng lượng mặt trời và nguồn dự phòng.",
    "focusKeyword": "ắc quy lithium byd battery-box premium hvm 22.1",
    "sourceUrl": "https://www.bydbatterybox.com/",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy nước Trojan Battery T-105",
    "model": "T-105",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy nước",
    "brand": "Trojan Battery",
    "shortDescription": "Ắc quy nước deep-cycle cho xe điện, năng lượng tái tạo và ứng dụng công nghiệp.",
    "focusKeyword": "ắc quy nước trojan battery t-105",
    "sourceUrl": "https://www.trojanbattery.com/resources/datasheets/signature-line-flooded",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy nước Trojan Battery T-125",
    "model": "T-125",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy nước",
    "brand": "Trojan Battery",
    "shortDescription": "Ắc quy nước deep-cycle cho xe điện, năng lượng tái tạo và ứng dụng công nghiệp.",
    "focusKeyword": "ắc quy nước trojan battery t-125",
    "sourceUrl": "https://www.trojanbattery.com/resources/datasheets/signature-line-flooded",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy nước Trojan Battery T-145",
    "model": "T-145",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy nước",
    "brand": "Trojan Battery",
    "shortDescription": "Ắc quy nước deep-cycle cho xe điện, năng lượng tái tạo và ứng dụng công nghiệp.",
    "focusKeyword": "ắc quy nước trojan battery t-145",
    "sourceUrl": "https://www.trojanbattery.com/resources/datasheets/signature-line-flooded",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy nước Trojan Battery T-605",
    "model": "T-605",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy nước",
    "brand": "Trojan Battery",
    "shortDescription": "Ắc quy nước deep-cycle cho xe điện, năng lượng tái tạo và ứng dụng công nghiệp.",
    "focusKeyword": "ắc quy nước trojan battery t-605",
    "sourceUrl": "https://www.trojanbattery.com/resources/datasheets/signature-line-flooded",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy nước Trojan Battery J250P",
    "model": "J250P",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy nước",
    "brand": "Trojan Battery",
    "shortDescription": "Ắc quy nước deep-cycle cho xe điện, năng lượng tái tạo và ứng dụng công nghiệp.",
    "focusKeyword": "ắc quy nước trojan battery j250p",
    "sourceUrl": "https://www.trojanbattery.com/resources/datasheets/signature-line-flooded",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy nước Trojan Battery J305G-AC",
    "model": "J305G-AC",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy nước",
    "brand": "Trojan Battery",
    "shortDescription": "Ắc quy nước deep-cycle cho xe điện, năng lượng tái tạo và ứng dụng công nghiệp.",
    "focusKeyword": "ắc quy nước trojan battery j305g-ac",
    "sourceUrl": "https://www.trojanbattery.com/resources/datasheets/signature-line-flooded",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy nước Trojan Battery L16E-AC",
    "model": "L16E-AC",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy nước",
    "brand": "Trojan Battery",
    "shortDescription": "Ắc quy nước deep-cycle cho xe điện, năng lượng tái tạo và ứng dụng công nghiệp.",
    "focusKeyword": "ắc quy nước trojan battery l16e-ac",
    "sourceUrl": "https://www.trojanbattery.com/resources/datasheets/signature-line-flooded",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  },
  {
    "name": "Ắc quy nước Trojan Battery TE35",
    "model": "TE35",
    "mainGroup": "ẮC QUY VÀ LƯU TRỮ ĐIỆN",
    "categoryName": "Ắc quy nước",
    "brand": "Trojan Battery",
    "shortDescription": "Ắc quy nước deep-cycle cho xe điện, năng lượng tái tạo và ứng dụng công nghiệp.",
    "focusKeyword": "ắc quy nước trojan battery te35",
    "sourceUrl": "https://www.trojanbattery.com/resources/datasheets/signature-line-flooded",
    "verificationNote": "Kiểm tra cấu hình, phiên bản và khả dụng tại Việt Nam trước khi báo giá."
  }
];

const CATEGORY_ALIASES: Record<string, string[]> = {
  router: ['router', 'bo-dinh-tuyen'],
  switch: ['switch', 'bo-chuyen-mach'],
  'wi-fi-access-point': [
    'wi-fi-access-point',
    'wifi-access-point',
    'wifi',
    'access-point',
    'thiet-bi-wifi',
  ],
  'thiet-bi-can-bang-tai': [
    'thiet-bi-can-bang-tai',
    'can-bang-tai',
    'load-balancer',
    'load-balancing',
  ],
  'module-quang-sfp-qsfp': [
    'module-quang-sfp-qsfp',
    'module-quang',
    'sfp',
    'sfp-qsfp',
    'module-sfp',
  ],
  odf: ['odf', 'hop-phoi-quang', 'gia-phoi-quang'],
  'voip-gateway': ['voip-gateway', 'gateway-voip', 'cong-voip'],
  'ip-pbx': ['ip-pbx', 'tong-dai-ip', 'tong-dai-voip'],
  'dien-thoai-ip': ['dien-thoai-ip', 'ip-phone', 'dien-thoai-voip'],
  'cap-mang': ['cap-mang', 'network-cable', 'cap-ethernet'],
  'cap-quang': ['cap-quang', 'fiber-optic-cable', 'fiber-cable'],
  'patch-panel': ['patch-panel', 'bang-dau-noi'],
  'phu-kien-ket-noi': [
    'phu-kien-ket-noi',
    'phu-kien-mang',
    'phu-kien-cap',
    'connector',
  ],
  'may-chu': ['may-chu', 'server'],
  pc: ['pc', 'may-tinh-de-ban', 'desktop'],
  'mini-pc': ['mini-pc', 'may-tinh-mini'],
  laptop: ['laptop', 'may-tinh-xach-tay'],
  'may-in-nhan': ['may-in-nhan', 'label-printer'],
  kiosk: ['kiosk', 'may-kiosk'],
  'tam-pin-nang-luong-mat-troi': [
    'tam-pin-nang-luong-mat-troi',
    'tam-pin-mat-troi',
    'solar-panel',
    'pin-mat-troi',
  ],
  'bo-hoa-luoi-inverter': [
    'bo-hoa-luoi-inverter',
    'bo-hoa-luoi',
    'inverter',
    'solar-inverter',
  ],
  'ac-quy-chi': ['ac-quy-chi', 'lead-acid-battery'],
  'ac-quy-lithium': [
    'ac-quy-lithium',
    'pin-lithium',
    'lithium-battery',
  ],
  'ac-quy-nuoc': ['ac-quy-nuoc', 'flooded-battery'],
};


function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCompact(value: unknown): string {
  return normalizeText(value).replace(/-/g, '');
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCharCode(Number.parseInt(code, 10)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    );
}

function getTagAttribute(
  tag: string,
  attributeName: string,
): string | undefined {
  const escapedName = attributeName.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
  const match = tag.match(
    new RegExp(
      `(?:^|\\s)${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      'i',
    ),
  );

  return (
    decodeHtmlEntities(
      match?.[1] || match?.[2] || match?.[3] || '',
    ).trim() || undefined
  );
}

function resolveUrl(
  rawUrl: string | undefined,
  baseUrl: string,
): string | undefined {
  if (!rawUrl) {
    return undefined;
  }

  const cleaned = decodeHtmlEntities(rawUrl)
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\\u0026/gi, '&')
    .replace(/\\u002f/gi, '/')
    .replace(/\\\//g, '/');

  if (
    !cleaned ||
    /^(data|javascript|mailto|tel|blob):/i.test(cleaned)
  ) {
    return undefined;
  }

  try {
    const url = new URL(cleaned, baseUrl);
    if (!/^https?:$/i.test(url.protocol)) {
      return undefined;
    }

    url.hash = '';
    return url.toString();
  } catch {
    return undefined;
  }
}

function parseSrcSet(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function getHost(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function isSameHostOrSubdomain(
  candidateUrl: string,
  sourceUrl: string,
): boolean {
  const candidateHost = getHost(candidateUrl);
  const sourceHost = getHost(sourceUrl);

  return Boolean(
    candidateHost &&
      sourceHost &&
      (candidateHost === sourceHost ||
        candidateHost.endsWith(`.${sourceHost}`) ||
        sourceHost.endsWith(`.${candidateHost}`)),
  );
}

function isLikelyImageUrl(url: string): boolean {
  const normalized = url.toLowerCase();

  if (
    /(?:logo|favicon|sprite|icon|loader|spinner|placeholder|avatar|tracking|pixel|badge|flag|captcha|payment|social|facebook|youtube|instagram|linkedin|header|footer|menu|cookie|banner)/i.test(
      normalized,
    )
  ) {
    return false;
  }

  if (
    /\.(?:jpe?g|png|webp|avif|gif)(?:$|[?#])/i.test(normalized)
  ) {
    return true;
  }

  return /(?:image|images|media|product|products|upload|uploads|catalog|asset|assets|cdn|photo|gallery|picture)/i.test(
    normalized,
  );
}

function imageUrlKey(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`
      .replace(/\/+/g, '/')
      .toLowerCase();
  } catch {
    return url.replace(/[?#].*$/, '').toLowerCase();
  }
}

function productSearchVariants(product: CatalogProduct): string[] {
  const rawModel = product.model.trim();
  const withoutParentheses = rawModel
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const modelSlug = normalizeText(rawModel);
  const modelCompact = normalizeCompact(rawModel);
  const nameSlug = normalizeText(product.name);

  return Array.from(
    new Set(
      [
        rawModel,
        withoutParentheses,
        modelSlug,
        modelCompact,
        nameSlug,
      ].filter((item) => item.length >= 3),
    ),
  );
}

interface FetchTextResult {
  text: string;
  finalUrl: string;
  contentType: string;
}

interface ImageCandidate {
  url: string;
  score: number;
  origin: string;
  pageUrl: string;
}

interface ProductImageResult {
  images: string[];
  sourceImages: string[];
  usedPlaceholder: boolean;
  pagesVisited: number;
  detailPage?: string;
}

interface DownloadedImage {
  publicUrl: string;
  sourceUrl: string;
  contentHash: string;
}

const pageTextCache = new Map<
  string,
  Promise<FetchTextResult | null>
>();
const sitemapUrlCache = new Map<
  string,
  Promise<string[]>
>();
const claimedSourceImageKeys = new Map<string, string>();
const claimedContentHashes = new Map<string, string>();

function requestHeaders(accept: string): Record<string, string> {
  return {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
    accept,
    'accept-language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
  };
}

async function fetchText(
  url: string,
  accept =
    'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
): Promise<FetchTextResult | null> {
  const cacheKey = `${accept}::${url}`;
  const existing = pageTextCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const request = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      IMAGE_REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: requestHeaders(accept),
      });

      if (!response.ok) {
        return null;
      }

      const contentType =
        response.headers.get('content-type') || '';
      const buffer = Buffer.from(await response.arrayBuffer());

      if (buffer.length === 0) {
        return null;
      }

      let decodedBuffer = buffer;
      const isGzip =
        url.toLowerCase().endsWith('.gz') ||
        (buffer.length >= 2 &&
          buffer[0] === 0x1f &&
          buffer[1] === 0x8b);

      if (isGzip) {
        try {
          decodedBuffer = gunzipSync(buffer);
        } catch {
          return null;
        }
      }

      if (decodedBuffer.length > 15 * 1024 * 1024) {
        return null;
      }

      return {
        text: decodedBuffer.toString('utf8'),
        finalUrl: response.url || url,
        contentType,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  })();

  pageTextCache.set(cacheKey, request);
  return request;
}

function stripHtmlForSearch(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 1_500_000);
}

function getPageRelevance(
  html: string,
  pageUrl: string,
  product: CatalogProduct,
): number {
  const title =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ||
    '';
  const h1 =
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '';
  const canonicalTag =
    html.match(
      /<link[^>]+rel=["']?canonical["']?[^>]*>/i,
    )?.[0] || '';
  const canonical =
    getTagAttribute(canonicalTag, 'href') || '';
  const bodyText = stripHtmlForSearch(html);
  const importantText = `${pageUrl} ${title} ${h1} ${canonical} ${bodyText}`;
  const compactText = normalizeCompact(importantText);
  const modelCompact = normalizeCompact(product.model);
  const nameCompact = normalizeCompact(product.name);

  let score = 0;

  if (
    modelCompact.length >= 4 &&
    normalizeCompact(`${pageUrl} ${title} ${h1} ${canonical}`).includes(
      modelCompact,
    )
  ) {
    score += 120;
  } else if (
    modelCompact.length >= 4 &&
    compactText.includes(modelCompact)
  ) {
    score += 55;
  }

  if (
    nameCompact.length >= 8 &&
    normalizeCompact(`${title} ${h1}`).includes(nameCompact)
  ) {
    score += 90;
  } else if (
    nameCompact.length >= 8 &&
    compactText.includes(nameCompact)
  ) {
    score += 35;
  }

  if (
    normalizeText(importantText).includes(
      normalizeText(product.brand),
    )
  ) {
    score += 10;
  }

  if (
    /(?:product|products|san-pham|detail|catalog)/i.test(
      pageUrl,
    )
  ) {
    score += 10;
  }

  return score;
}

function scoreImageCandidate(
  imageUrl: string,
  context: string,
  product: CatalogProduct,
  pageRelevance: number,
  origin: string,
  pageUrl: string,
): number {
  const combined = `${imageUrl} ${context} ${pageUrl}`;
  const compactHaystack = normalizeCompact(combined);
  const normalizedHaystack = normalizeText(combined);
  const modelCompact = normalizeCompact(product.model);
  const nameCompact = normalizeCompact(product.name);

  let score = pageRelevance;

  if (
    modelCompact.length >= 4 &&
    compactHaystack.includes(modelCompact)
  ) {
    score += 170;
  }

  if (
    nameCompact.length >= 8 &&
    compactHaystack.includes(nameCompact)
  ) {
    score += 110;
  }

  if (
    normalizedHaystack.includes(normalizeText(product.brand))
  ) {
    score += 15;
  }

  if (
    /(?:product|gallery|zoom|large|original|detail|hero|main|front|back|side|angle|thumbnail)/i.test(
      combined,
    )
  ) {
    score += 20;
  }

  if (isSameHostOrSubdomain(imageUrl, product.sourceUrl)) {
    score += 35;
  } else if (OFFICIAL_IMAGES_ONLY) {
    score -= 500;
  }

  if (origin === 'json-ld') {
    score += 50;
  } else if (origin === 'meta') {
    score += 35;
  } else if (origin === 'gallery-link') {
    score += 30;
  } else if (origin === 'img') {
    score += 20;
  } else if (origin === 'script-image') {
    score += 15;
  } else if (origin === 'bing-image') {
    score += 5;
  }

  return score;
}

function addImageCandidate(
  target: Map<string, ImageCandidate>,
  rawUrl: string | undefined,
  pageUrl: string,
  context: string,
  product: CatalogProduct,
  pageRelevance: number,
  origin: string,
): void {
  const resolved = resolveUrl(rawUrl, pageUrl);
  if (!resolved || !isLikelyImageUrl(resolved)) {
    return;
  }

  const score = scoreImageCandidate(
    resolved,
    context,
    product,
    pageRelevance,
    origin,
    pageUrl,
  );

  if (score < -100) {
    return;
  }

  const key = imageUrlKey(resolved);
  const previous = target.get(key);

  if (!previous || score > previous.score) {
    target.set(key, {
      url: resolved,
      score,
      origin,
      pageUrl,
    });
  }
}

function collectJsonLdImages(
  value: unknown,
  result: Array<{ url: string; context: string }>,
  context = '',
): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectJsonLdImages(item, result, context);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;
  const nextContext = `${context} ${String(
    record.name || '',
  )} ${String(record.sku || '')} ${String(
    record.mpn || '',
  )} ${String(record.model || '')}`;

  for (const key of [
    'image',
    'images',
    'contentUrl',
    'thumbnailUrl',
  ]) {
    const imageValue = record[key];

    if (typeof imageValue === 'string') {
      result.push({
        url: imageValue,
        context: nextContext,
      });
    } else if (Array.isArray(imageValue)) {
      for (const item of imageValue) {
        if (typeof item === 'string') {
          result.push({
            url: item,
            context: nextContext,
          });
        } else if (item && typeof item === 'object') {
          const nested = item as Record<string, unknown>;
          const nestedUrl =
            nested.url ||
            nested.contentUrl ||
            nested.src;

          if (typeof nestedUrl === 'string') {
            result.push({
              url: nestedUrl,
              context: nextContext,
            });
          }
        }
      }
    } else if (
      imageValue &&
      typeof imageValue === 'object'
    ) {
      const nested =
        imageValue as Record<string, unknown>;
      const nestedUrl =
        nested.url ||
        nested.contentUrl ||
        nested.src;

      if (typeof nestedUrl === 'string') {
        result.push({
          url: nestedUrl,
          context: nextContext,
        });
      }
    }
  }

  for (const nestedValue of Object.values(record)) {
    if (nestedValue && typeof nestedValue === 'object') {
      collectJsonLdImages(
        nestedValue,
        result,
        nextContext,
      );
    }
  }
}

function extractImagesFromHtml(
  html: string,
  pageUrl: string,
  product: CatalogProduct,
): ImageCandidate[] {
  const candidates = new Map<string, ImageCandidate>();
  const pageRelevance = getPageRelevance(
    html,
    pageUrl,
    product,
  );

  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const property = (
      getTagAttribute(tag, 'property') ||
      getTagAttribute(tag, 'name') ||
      getTagAttribute(tag, 'itemprop') ||
      ''
    ).toLowerCase();

    if (
      /(?:og:image|twitter:image|image|thumbnail)/i.test(
        property,
      )
    ) {
      addImageCandidate(
        candidates,
        getTagAttribute(tag, 'content'),
        pageUrl,
        tag,
        product,
        pageRelevance,
        'meta',
      );
    }
  }

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = (
      getTagAttribute(tag, 'rel') || ''
    ).toLowerCase();
    const asValue = (
      getTagAttribute(tag, 'as') || ''
    ).toLowerCase();

    if (
      rel.includes('image_src') ||
      (rel.includes('preload') && asValue === 'image')
    ) {
      addImageCandidate(
        candidates,
        getTagAttribute(tag, 'href'),
        pageUrl,
        tag,
        product,
        pageRelevance,
        'meta',
      );
    }
  }

  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const parsed = JSON.parse(
        decodeHtmlEntities(match[1]).trim(),
      );
      const jsonImages: Array<{
        url: string;
        context: string;
      }> = [];
      collectJsonLdImages(parsed, jsonImages);

      for (const item of jsonImages) {
        addImageCandidate(
          candidates,
          item.url,
          pageUrl,
          item.context,
          product,
          pageRelevance,
          'json-ld',
        );
      }
    } catch {
      // Bỏ qua JSON-LD lỗi.
    }
  }

  const imageAttributeNames = [
    'src',
    'data-src',
    'data-original',
    'data-lazy-src',
    'data-zoom-image',
    'data-large-image',
    'data-image',
    'data-full',
    'data-full-image',
    'data-hires',
    'data-src-large',
  ];

  for (const match of html.matchAll(
    /<(?:img|source)\b[^>]*>/gi,
  )) {
    const tag = match[0];
    const position = match.index || 0;
    const width = Number.parseInt(
      getTagAttribute(tag, 'width') || '0',
      10,
    );
    const height = Number.parseInt(
      getTagAttribute(tag, 'height') || '0',
      10,
    );

    if (
      width > 0 &&
      height > 0 &&
      width < 180 &&
      height < 180
    ) {
      continue;
    }

    const nearbyContext = html
      .slice(
        Math.max(0, position - 900),
        Math.min(
          html.length,
          position + tag.length + 900,
        ),
      )
      .replace(/<[^>]+>/g, ' ');

    const context = `${getTagAttribute(tag, 'alt') || ''} ${
      getTagAttribute(tag, 'title') || ''
    } ${nearbyContext}`;

    for (const attributeName of imageAttributeNames) {
      addImageCandidate(
        candidates,
        getTagAttribute(tag, attributeName),
        pageUrl,
        context,
        product,
        pageRelevance,
        'img',
      );
    }

    for (const srcSetItem of [
      ...parseSrcSet(getTagAttribute(tag, 'srcset')),
      ...parseSrcSet(
        getTagAttribute(tag, 'data-srcset'),
      ),
    ]) {
      addImageCandidate(
        candidates,
        srcSetItem,
        pageUrl,
        context,
        product,
        pageRelevance,
        'img',
      );
    }
  }

  for (const match of html.matchAll(
    /<a\b[^>]*href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/gi,
  )) {
    const href = match[1] || match[2] || match[3];
    if (!href || !isLikelyImageUrl(href)) {
      continue;
    }

    const position = match.index || 0;
    const context = html
      .slice(
        Math.max(0, position - 500),
        Math.min(html.length, position + 800),
      )
      .replace(/<[^>]+>/g, ' ');

    addImageCandidate(
      candidates,
      href,
      pageUrl,
      context,
      product,
      pageRelevance,
      'gallery-link',
    );
  }

  for (const match of html.matchAll(
    /(?:background-image\s*:\s*url\(|["'](?:image|imageUrl|image_url|largeImage|zoomImage|fullImage|src)["']\s*:\s*["'])([^"'()]+?\.(?:jpe?g|png|webp|avif|gif)(?:\?[^"'()]*)?)/gi,
  )) {
    const position = match.index || 0;
    const context = html
      .slice(
        Math.max(0, position - 500),
        Math.min(html.length, position + 700),
      )
      .replace(/<[^>]+>/g, ' ');

    addImageCandidate(
      candidates,
      match[1],
      pageUrl,
      context,
      product,
      pageRelevance,
      'script-image',
    );
  }

  for (const match of html.matchAll(
    /https?:\\?\/\\?\/[^"'<>\\\s]+?\.(?:jpe?g|png|webp|avif|gif)(?:\?[^"'<>\\\s]*)?/gi,
  )) {
    const position = match.index || 0;
    const rawUrl = match[0].replace(/\\\//g, '/');
    const context = html
      .slice(
        Math.max(0, position - 400),
        Math.min(html.length, position + 600),
      )
      .replace(/<[^>]+>/g, ' ');

    addImageCandidate(
      candidates,
      rawUrl,
      pageUrl,
      context,
      product,
      pageRelevance,
      'script-image',
    );
  }

  return Array.from(candidates.values()).sort(
    (a, b) => b.score - a.score,
  );
}

function extractProductLinks(
  html: string,
  pageUrl: string,
  product: CatalogProduct,
): Array<{ url: string; score: number }> {
  const links = new Map<string, number>();
  const modelCompact = normalizeCompact(product.model);
  const nameCompact = normalizeCompact(product.name);
  const sourceHost = getHost(product.sourceUrl);

  for (const match of html.matchAll(
    /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi,
  )) {
    const rawHref = match[1] || match[2] || match[3];
    const url = resolveUrl(rawHref, pageUrl);

    if (
      !url ||
      url === pageUrl ||
      /\.(?:pdf|zip|docx?|xlsx?|jpe?g|png|webp|avif)(?:$|[?#])/i.test(
        url,
      )
    ) {
      continue;
    }

    const anchorText = match[4].replace(/<[^>]+>/g, ' ');
    const compactHaystack = normalizeCompact(
      `${url} ${anchorText}`,
    );
    let score = 0;

    if (
      modelCompact.length >= 4 &&
      compactHaystack.includes(modelCompact)
    ) {
      score += 220;
    }

    if (
      nameCompact.length >= 8 &&
      compactHaystack.includes(nameCompact)
    ) {
      score += 130;
    }

    if (
      /(?:product|products|san-pham|detail|catalog|shop)/i.test(
        url,
      )
    ) {
      score += 25;
    }

    const linkHost = getHost(url);
    if (
      linkHost === sourceHost ||
      linkHost.endsWith(`.${sourceHost}`) ||
      sourceHost.endsWith(`.${linkHost}`)
    ) {
      score += 40;
    } else {
      score -= 60;
    }

    if (score >= 45) {
      links.set(url, Math.max(score, links.get(url) || 0));
    }
  }

  return Array.from(links.entries())
    .map(([url, score]) => ({ url, score }))
    .sort((a, b) => b.score - a.score);
}

function extractXmlLocs(xml: string): string[] {
  return Array.from(
    xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi),
  )
    .map((match) => decodeHtmlEntities(match[1]).trim())
    .filter((url) => /^https?:\/\//i.test(url));
}

async function discoverSitemapUrls(
  sourceUrl: string,
): Promise<string[]> {
  const origin = new URL(sourceUrl).origin;
  const existing = sitemapUrlCache.get(origin);

  if (existing) {
    return existing;
  }

  const task = (async () => {
    const sitemapQueue: string[] = [];
    const visitedSitemaps = new Set<string>();
    const productUrls = new Set<string>();

    const robots = await fetchText(
      `${origin}/robots.txt`,
      'text/plain,*/*;q=0.8',
    );

    if (robots) {
      for (const match of robots.text.matchAll(
        /^\s*Sitemap:\s*(\S+)\s*$/gim,
      )) {
        sitemapQueue.push(match[1]);
      }
    }

    sitemapQueue.push(
      `${origin}/sitemap.xml`,
      `${origin}/sitemap_index.xml`,
      `${origin}/sitemap-index.xml`,
    );

    while (
      sitemapQueue.length > 0 &&
      visitedSitemaps.size < MAX_SITEMAP_FILES_PER_HOST &&
      productUrls.size < MAX_SITEMAP_URLS_PER_HOST
    ) {
      const sitemapUrl = sitemapQueue.shift()!;
      if (visitedSitemaps.has(sitemapUrl)) {
        continue;
      }

      visitedSitemaps.add(sitemapUrl);
      const response = await fetchText(
        sitemapUrl,
        'application/xml,text/xml,*/*;q=0.8',
      );

      if (!response) {
        continue;
      }

      const locs = extractXmlLocs(response.text);
      const isIndex =
        /<sitemapindex\b/i.test(response.text) ||
        locs.some((url) =>
          /(?:sitemap|site-map).*(?:xml|gz)(?:$|\?)/i.test(url),
        );

      for (const loc of locs) {
        if (
          isIndex &&
          /(?:sitemap|site-map).*(?:xml|gz)(?:$|\?)/i.test(
            loc,
          )
        ) {
          if (!visitedSitemaps.has(loc)) {
            sitemapQueue.push(loc);
          }
        } else if (productUrls.size < MAX_SITEMAP_URLS_PER_HOST) {
          productUrls.add(loc);
        }
      }
    }

    return Array.from(productUrls);
  })();

  sitemapUrlCache.set(origin, task);
  return task;
}

function rankSitemapProductUrls(
  urls: string[],
  product: CatalogProduct,
): Array<{ url: string; score: number }> {
  const modelCompact = normalizeCompact(product.model);
  const nameCompact = normalizeCompact(product.name);
  const brandCompact = normalizeCompact(product.brand);

  return urls
    .map((url) => {
      const compactUrl = normalizeCompact(url);
      let score = 0;

      if (
        modelCompact.length >= 4 &&
        compactUrl.includes(modelCompact)
      ) {
        score += 260;
      }

      if (
        nameCompact.length >= 8 &&
        compactUrl.includes(nameCompact)
      ) {
        score += 160;
      }

      if (
        brandCompact.length >= 3 &&
        compactUrl.includes(brandCompact)
      ) {
        score += 20;
      }

      if (
        /(?:product|products|san-pham|shop|catalog|detail)/i.test(
          url,
        )
      ) {
        score += 25;
      }

      return { url, score };
    })
    .filter((item) => item.score >= 80)
    .sort((a, b) => b.score - a.score);
}

function buildOfficialSearchUrls(
  product: CatalogProduct,
): string[] {
  try {
    const source = new URL(product.sourceUrl);
    const origin = source.origin;
    const query = encodeURIComponent(product.model);
    const queryWithBrand = encodeURIComponent(
      `${product.brand} ${product.model}`,
    );

    return [
      `${origin}/?s=${query}`,
      `${origin}/search?q=${query}`,
      `${origin}/search/?q=${query}`,
      `${origin}/search?query=${query}`,
      `${origin}/search/${query}`,
      `${origin}/?q=${queryWithBrand}`,
    ];
  } catch {
    return [];
  }
}

async function searchBingWebForOfficialPages(
  product: CatalogProduct,
): Promise<Array<{ url: string; score: number }>> {
  const sourceHost = getHost(product.sourceUrl);
  if (!sourceHost) {
    return [];
  }

  const query = encodeURIComponent(
    `site:${sourceHost} "${product.model}" ${product.brand}`,
  );
  const searchUrl = `https://www.bing.com/search?q=${query}&count=10`;
  const response = await fetchText(searchUrl);

  if (!response) {
    return [];
  }

  const links = new Map<string, number>();

  for (const match of response.text.matchAll(
    /href=["'](https?:\/\/[^"'#]+)["']/gi,
  )) {
    const url = decodeHtmlEntities(match[1]);
    if (!isSameHostOrSubdomain(url, product.sourceUrl)) {
      continue;
    }

    const compactUrl = normalizeCompact(url);
    const modelCompact = normalizeCompact(product.model);
    let score = 70;

    if (
      modelCompact.length >= 4 &&
      compactUrl.includes(modelCompact)
    ) {
      score += 170;
    }

    if (
      /(?:product|products|san-pham|detail|catalog)/i.test(
        url,
      )
    ) {
      score += 25;
    }

    links.set(url, Math.max(score, links.get(url) || 0));
  }

  return Array.from(links.entries())
    .map(([url, score]) => ({ url, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_DETAIL_PAGES_PER_PRODUCT);
}

async function searchBingImages(
  product: CatalogProduct,
): Promise<ImageCandidate[]> {
  if (!ENABLE_BING_IMAGE_SEARCH) {
    return [];
  }

  const queryParts = [
    product.brand,
    product.model,
    product.categoryName,
    'product',
  ];

  if (OFFICIAL_IMAGES_ONLY) {
    queryParts.push(`site:${getHost(product.sourceUrl)}`);
  }

  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(
    queryParts.join(' '),
  )}&form=HDRSC2&first=1`;

  const response = await fetchText(searchUrl);
  if (!response) {
    return [];
  }

  const candidates = new Map<string, ImageCandidate>();

  for (const match of response.text.matchAll(
    /\bm=(?:"([^"]+)"|'([^']+)')/gi,
  )) {
    const rawMetadata = decodeHtmlEntities(
      match[1] || match[2] || '',
    );

    try {
      const metadata = JSON.parse(rawMetadata) as {
        murl?: string;
        purl?: string;
        turl?: string;
        desc?: string;
        t?: string;
      };

      const imageUrl = metadata.murl || metadata.turl;
      const pageUrl = metadata.purl || searchUrl;

      if (!imageUrl) {
        continue;
      }

      const context = `${metadata.desc || ''} ${
        metadata.t || ''
      } ${pageUrl}`;

      addImageCandidate(
        candidates,
        imageUrl,
        pageUrl,
        context,
        product,
        0,
        'bing-image',
      );
    } catch {
      // Bỏ qua metadata lỗi.
    }
  }

  return Array.from(candidates.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

function extensionFromContentType(
  contentType: string,
  sourceUrl: string,
): string {
  const normalized = contentType.toLowerCase();

  if (normalized.includes('image/webp')) return '.webp';
  if (normalized.includes('image/png')) return '.png';
  if (normalized.includes('image/avif')) return '.avif';
  if (normalized.includes('image/gif')) return '.gif';
  if (
    normalized.includes('image/jpeg') ||
    normalized.includes('image/jpg')
  ) {
    return '.jpg';
  }

  const extension = path.extname(
    new URL(sourceUrl).pathname,
  ).toLowerCase();

  if (
    ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'].includes(
      extension,
    )
  ) {
    return extension === '.jpeg' ? '.jpg' : extension;
  }

  return '.jpg';
}

async function downloadImageCandidate(
  candidate: ImageCandidate,
  productCode: string,
  imageIndex: number,
): Promise<DownloadedImage | null> {
  const sourceKey = imageUrlKey(candidate.url);
  const currentOwner = claimedSourceImageKeys.get(sourceKey);

  if (
    !ALLOW_SHARED_IMAGES &&
    currentOwner &&
    currentOwner !== productCode
  ) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    IMAGE_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(candidate.url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        ...requestHeaders(
          'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        ),
        referer: candidate.pageUrl || productCode,
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType =
      response.headers.get('content-type') || '';

    if (!contentType.toLowerCase().startsWith('image/')) {
      return null;
    }

    const contentLength = Number.parseInt(
      response.headers.get('content-length') || '0',
      10,
    );

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_IMAGE_BYTES
    ) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (
      buffer.length < 4_000 ||
      buffer.length > MAX_IMAGE_BYTES
    ) {
      return null;
    }

    const contentHash = createHash('sha256')
      .update(buffer)
      .digest('hex');

    const contentOwner =
      claimedContentHashes.get(contentHash);

    if (
      !ALLOW_SHARED_IMAGES &&
      contentOwner &&
      contentOwner !== productCode
    ) {
      return null;
    }

    const extension = extensionFromContentType(
      contentType,
      candidate.url,
    );
    const productDir = path.join(
      PRODUCT_IMAGE_OUTPUT_DIR,
      productCode.toLowerCase(),
    );
    await fs.mkdir(productDir, { recursive: true });

    const filename = `${String(imageIndex + 1).padStart(
      2,
      '0',
    )}-${contentHash.slice(0, 12)}${extension}`;
    const filePath = path.join(productDir, filename);
    await fs.writeFile(filePath, buffer);

    claimedSourceImageKeys.set(sourceKey, productCode);
    claimedContentHashes.set(contentHash, productCode);

    return {
      publicUrl: `${PRODUCT_IMAGE_PUBLIC_PREFIX}/${productCode.toLowerCase()}/${filename}`,
      sourceUrl: candidate.url,
      contentHash,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function makeProductPlaceholder(
  product: CatalogProduct,
  productCode: string,
): Promise<string> {
  const productDir = path.join(
    PRODUCT_IMAGE_OUTPUT_DIR,
    productCode.toLowerCase(),
  );
  await fs.mkdir(productDir, { recursive: true });

  const filePath = path.join(productDir, 'placeholder.svg');
  const title = escapeHtml(product.model || product.name).slice(
    0,
    70,
  );
  const brand = escapeHtml(product.brand).slice(0, 40);
  const category = escapeHtml(product.categoryName).slice(
    0,
    50,
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#f3f6f9"/>
  <rect x="70" y="70" width="1060" height="660" rx="32" fill="#ffffff" stroke="#d8e1e8" stroke-width="4"/>
  <text x="600" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#0877b9">${brand}</text>
  <text x="600" y="390" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#1f2937">${title}</text>
  <text x="600" y="485" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#4b5563">${category}</text>
  <text x="600" y="610" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#6b7280">Đang cập nhật hình ảnh sản phẩm</text>
</svg>`;

  await fs.writeFile(filePath, svg, 'utf8');

  return `${PRODUCT_IMAGE_PUBLIC_PREFIX}/${productCode.toLowerCase()}/placeholder.svg`;
}

async function materializeProductImages(
  candidates: ImageCandidate[],
  product: CatalogProduct,
  productCode: string,
): Promise<{
  images: string[];
  sourceImages: string[];
}> {
  const images: string[] = [];
  const sourceImages: string[] = [];
  const localHashes = new Set<string>();

  for (const candidate of candidates) {
    if (images.length >= MAX_PRODUCT_IMAGES) {
      break;
    }

    const sourceKey = imageUrlKey(candidate.url);
    if (sourceImages.some((url) => imageUrlKey(url) === sourceKey)) {
      continue;
    }

    if (!DOWNLOAD_PRODUCT_IMAGES) {
      const owner = claimedSourceImageKeys.get(sourceKey);
      if (
        !ALLOW_SHARED_IMAGES &&
        owner &&
        owner !== productCode
      ) {
        continue;
      }

      claimedSourceImageKeys.set(sourceKey, productCode);
      images.push(candidate.url);
      sourceImages.push(candidate.url);
      continue;
    }

    const downloaded = await downloadImageCandidate(
      candidate,
      productCode,
      images.length,
    );

    if (!downloaded) {
      continue;
    }

    if (localHashes.has(downloaded.contentHash)) {
      continue;
    }

    localHashes.add(downloaded.contentHash);
    images.push(downloaded.publicUrl);
    sourceImages.push(downloaded.sourceUrl);
  }

  return { images, sourceImages };
}

async function crawlProductImages(
  product: CatalogProduct,
  productIndex: number,
): Promise<ProductImageResult> {
  const productCode = `CTC-REAL-${String(
    productIndex + 1,
  ).padStart(3, '0')}`;

  if (!CRAWL_PRODUCT_IMAGES) {
    const placeholder = await makeProductPlaceholder(
      product,
      productCode,
    );

    return {
      images: [placeholder],
      sourceImages: [],
      usedPlaceholder: true,
      pagesVisited: 0,
    };
  }

  const allCandidates = new Map<string, ImageCandidate>();
  const detailLinks = new Map<string, number>();
  let pagesVisited = 0;
  let bestDetailPage: string | undefined;

  const mergeImages = (items: ImageCandidate[]) => {
    for (const item of items) {
      const key = imageUrlKey(item.url);
      const current = allCandidates.get(key);

      if (!current || item.score > current.score) {
        allCandidates.set(key, item);
      }
    }
  };

  const mergeLinks = (
    links: Array<{ url: string; score: number }>,
  ) => {
    for (const link of links) {
      detailLinks.set(
        link.url,
        Math.max(
          link.score,
          detailLinks.get(link.url) || 0,
        ),
      );
    }
  };

  const sourceResponse = await fetchText(product.sourceUrl);

  if (sourceResponse) {
    pagesVisited += 1;
    mergeImages(
      extractImagesFromHtml(
        sourceResponse.text,
        sourceResponse.finalUrl,
        product,
      ),
    );
    mergeLinks(
      extractProductLinks(
        sourceResponse.text,
        sourceResponse.finalUrl,
        product,
      ),
    );
  }

  for (const searchUrl of buildOfficialSearchUrls(
    product,
  ).slice(0, 4)) {
    if (
      detailLinks.size >= MAX_DETAIL_PAGES_PER_PRODUCT * 2
    ) {
      break;
    }

    const searchResponse = await fetchText(searchUrl);
    if (!searchResponse) {
      continue;
    }

    pagesVisited += 1;
    mergeLinks(
      extractProductLinks(
        searchResponse.text,
        searchResponse.finalUrl,
        product,
      ),
    );
  }

  if (ENABLE_SITEMAP_DISCOVERY) {
    try {
      const sitemapUrls = await discoverSitemapUrls(
        product.sourceUrl,
      );
      mergeLinks(
        rankSitemapProductUrls(
          sitemapUrls,
          product,
        ).slice(0, MAX_DETAIL_PAGES_PER_PRODUCT * 2),
      );
    } catch {
      // Không dừng seed khi sitemap của hãng lỗi.
    }
  }

  if (
    detailLinks.size < MAX_DETAIL_PAGES_PER_PRODUCT
  ) {
    mergeLinks(
      await searchBingWebForOfficialPages(product),
    );
  }

  const rankedDetailLinks = Array.from(
    detailLinks.entries(),
  )
    .map(([url, score]) => ({ url, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_DETAIL_PAGES_PER_PRODUCT);

  for (const detailLink of rankedDetailLinks) {
    const detailResponse = await fetchText(detailLink.url);
    if (!detailResponse) {
      continue;
    }

    pagesVisited += 1;
    const relevance = getPageRelevance(
      detailResponse.text,
      detailResponse.finalUrl,
      product,
    );

    if (
      !bestDetailPage ||
      relevance >=
        getPageRelevance(
          '',
          bestDetailPage,
          product,
        )
    ) {
      bestDetailPage = detailResponse.finalUrl;
    }

    mergeImages(
      extractImagesFromHtml(
        detailResponse.text,
        detailResponse.finalUrl,
        product,
      ),
    );
  }

  let rankedImages = Array.from(
    allCandidates.values(),
  )
    .filter((item) => item.score >= 45)
    .sort((a, b) => b.score - a.score);

  let materialized = await materializeProductImages(
    rankedImages,
    product,
    productCode,
  );

  if (
    materialized.images.length < MIN_PRODUCT_IMAGES &&
    ENABLE_BING_IMAGE_SEARCH
  ) {
    mergeImages(await searchBingImages(product));

    rankedImages = Array.from(allCandidates.values())
      .filter((item) => item.score >= 25)
      .sort((a, b) => b.score - a.score);

    materialized = await materializeProductImages(
      rankedImages,
      product,
      productCode,
    );
  }

  if (materialized.images.length === 0) {
    const placeholder = await makeProductPlaceholder(
      product,
      productCode,
    );

    return {
      images: [placeholder],
      sourceImages: [],
      usedPlaceholder: true,
      pagesVisited,
      detailPage: bestDetailPage,
    };
  }

  return {
    images: materialized.images,
    sourceImages: materialized.sourceImages,
    usedPlaceholder: false,
    pagesVisited,
    detailPage: bestDetailPage,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;

      if (index >= items.length) {
        return;
      }

      results[index] = await mapper(
        items[index],
        index,
      );
    }
  }

  await Promise.all(
    Array.from(
      {
        length: Math.min(
          concurrency,
          items.length,
        ),
      },
      () => worker(),
    ),
  );

  return results;
}

function getAliases(categoryName: string): string[] {
  const normalizedCategory = normalizeText(categoryName);
  return Array.from(
    new Set([
      normalizedCategory,
      ...(CATEGORY_ALIASES[normalizedCategory] || []),
    ]),
  );
}

function matchesCategory(
  category: any,
  aliases: string[],
  allowPartialMatch = false,
): boolean {
  const normalizedName = normalizeText(category?.name);
  const normalizedSlug = normalizeText(category?.slug);

  return aliases.some((alias) => {
    if (normalizedName === alias || normalizedSlug === alias) {
      return true;
    }

    if (!allowPartialMatch || alias.length < 4) {
      return false;
    }

    return (
      normalizedName.includes(alias) ||
      normalizedSlug.includes(alias) ||
      alias.includes(normalizedName) ||
      alias.includes(normalizedSlug)
    );
  });
}

function findProductCategory(
  product: CatalogProduct,
  categories: any[],
): any | undefined {
  const aliases = getAliases(product.categoryName);

  return (
    categories.find((category) =>
      matchesCategory(category, aliases, false),
    ) ||
    categories.find((category) =>
      matchesCategory(category, aliases, true),
    )
  );
}

interface CategorySeoProfile {
  singularLabel: string;
  solution: string;
  primaryUse: string;
  benefits: string[];
  applications: string[];
  buyingAdvice: string;
}

const CATEGORY_SEO_PROFILES: Record<string, CategorySeoProfile> = {
  router: {
    singularLabel: 'bộ định tuyến',
    solution: 'tổ chức, bảo mật và tối ưu lưu lượng kết nối giữa mạng nội bộ với Internet hoặc các chi nhánh',
    primaryUse: 'doanh nghiệp, văn phòng, hệ thống nhiều đường truyền và hạ tầng ISP',
    benefits: [
      'Hỗ trợ xây dựng kết nối mạng ổn định, linh hoạt theo quy mô triển khai',
      'Phù hợp cho các mô hình cần quản lý lưu lượng, phân tuyến và kết nối nhiều khu vực',
      'Dễ tích hợp vào hệ thống mạng doanh nghiệp hoặc hạ tầng viễn thông hiện hữu',
    ],
    applications: ['Văn phòng và trụ sở doanh nghiệp', 'Kết nối liên chi nhánh', 'Hệ thống mạng ISP và trung tâm dữ liệu'],
    buyingAdvice: 'Khi lựa chọn router, nên đối chiếu số cổng, tốc độ cổng, năng lực xử lý, tính năng VPN, số đường WAN và phương thức quản trị với nhu cầu thực tế.',
  },
  switch: {
    singularLabel: 'bộ chuyển mạch mạng',
    solution: 'kết nối tập trung các thiết bị đầu cuối, máy chủ, camera, điểm truy cập và các phân đoạn mạng',
    primaryUse: 'mạng LAN doanh nghiệp, trường học, khách sạn, nhà máy và trung tâm dữ liệu',
    benefits: [
      'Mở rộng số lượng cổng kết nối cho hệ thống mạng có dây',
      'Hỗ trợ tổ chức hạ tầng mạng tập trung, thuận tiện cho vận hành và bảo trì',
      'Phù hợp triển khai theo từng lớp truy cập, phân phối hoặc lõi mạng',
    ],
    applications: ['Mạng LAN văn phòng', 'Hệ thống camera và Wi-Fi', 'Tủ mạng, phòng máy và trung tâm dữ liệu'],
    buyingAdvice: 'Cần kiểm tra số cổng, chuẩn Ethernet, cổng uplink, PoE, khả năng quản trị, VLAN và công suất chuyển mạch trước khi lựa chọn.',
  },
  'wi-fi-access-point': {
    singularLabel: 'điểm truy cập Wi-Fi',
    solution: 'mở rộng vùng phủ sóng không dây và phục vụ kết nối đồng thời cho nhiều thiết bị',
    primaryUse: 'văn phòng, khách sạn, trường học, cửa hàng, nhà xưởng và khu vực công cộng',
    benefits: [
      'Cải thiện vùng phủ sóng và chất lượng truy cập không dây',
      'Hỗ trợ triển khai mạng Wi-Fi tập trung theo khu vực',
      'Phù hợp cho môi trường có nhiều người dùng và nhiều thiết bị kết nối',
    ],
    applications: ['Văn phòng và phòng họp', 'Khách sạn, nhà hàng và bán lẻ', 'Trường học, bệnh viện và nhà xưởng'],
    buyingAdvice: 'Nên đối chiếu chuẩn Wi-Fi, băng tần, số luồng, khả năng chịu tải, nguồn PoE, kiểu lắp đặt và nền tảng quản trị tập trung.',
  },
  'thiet-bi-can-bang-tai': {
    singularLabel: 'thiết bị cân bằng tải',
    solution: 'phân phối lưu lượng truy cập giữa nhiều máy chủ hoặc nhiều đường truyền nhằm tăng tính sẵn sàng',
    primaryUse: 'website, ứng dụng doanh nghiệp, trung tâm dữ liệu và hệ thống cần hoạt động liên tục',
    benefits: [
      'Hỗ trợ phân phối tải và hạn chế điểm nghẽn trong hệ thống',
      'Tăng khả năng sẵn sàng khi một máy chủ hoặc đường truyền gặp sự cố',
      'Phù hợp với hạ tầng cần mở rộng theo lưu lượng truy cập',
    ],
    applications: ['Website và cổng thông tin', 'Ứng dụng nội bộ doanh nghiệp', 'Hệ thống máy chủ và trung tâm dữ liệu'],
    buyingAdvice: 'Cần xác định lưu lượng dự kiến, số máy chủ, giao thức sử dụng, yêu cầu dự phòng, SSL và phương thức quản trị trước khi chọn thiết bị.',
  },
  'module-quang-sfp-qsfp': {
    singularLabel: 'module quang',
    solution: 'chuyển đổi và truyền tín hiệu dữ liệu qua hạ tầng cáp quang giữa các thiết bị mạng',
    primaryUse: 'switch, router, máy chủ, thiết bị truyền dẫn và hệ thống trung tâm dữ liệu',
    benefits: [
      'Hỗ trợ kết nối quang tốc độ cao giữa các thiết bị tương thích',
      'Linh hoạt lựa chọn khoảng cách truyền và loại sợi quang theo công trình',
      'Thuận tiện thay thế, nâng cấp hoặc mở rộng tuyến truyền dẫn',
    ],
    applications: ['Kết nối uplink cho switch và router', 'Liên kết tủ mạng hoặc phòng máy', 'Hạ tầng viễn thông và trung tâm dữ liệu'],
    buyingAdvice: 'Phải kiểm tra chuẩn SFP/SFP+/QSFP, tốc độ, bước sóng, khoảng cách, đầu nối, loại sợi và khả năng tương thích với thiết bị chủ.',
  },
  odf: {
    singularLabel: 'hộp hoặc giá phối quang ODF',
    solution: 'quản lý, bảo vệ và tổ chức các mối hàn cùng đầu nối quang trong hệ thống',
    primaryUse: 'tủ mạng, phòng máy, trạm viễn thông, tòa nhà và tuyến cáp quang',
    benefits: [
      'Giúp bố trí đầu nối và mối hàn quang khoa học, dễ kiểm tra',
      'Hỗ trợ bảo vệ sợi quang tại điểm phối nối',
      'Thuận tiện mở rộng, bảo trì và xử lý sự cố tuyến cáp',
    ],
    applications: ['Tủ rack và phòng máy', 'Trạm viễn thông', 'Hệ thống cáp quang tòa nhà và nhà máy'],
    buyingAdvice: 'Nên xác định số cổng, chuẩn adapter, kiểu lắp rack hoặc treo tường, loại khay hàn và phụ kiện đi kèm.',
  },
  'voip-gateway': {
    singularLabel: 'cổng chuyển đổi VoIP Gateway',
    solution: 'kết nối hệ thống thoại IP với đường điện thoại analog, trung kế hoặc thiết bị thoại hiện hữu',
    primaryUse: 'doanh nghiệp, tổng đài IP, nhà cung cấp dịch vụ và hệ thống chăm sóc khách hàng',
    benefits: [
      'Tận dụng thiết bị thoại hiện có khi chuyển đổi sang nền tảng VoIP',
      'Hỗ trợ liên thông giữa nhiều chuẩn và giao diện thoại',
      'Phù hợp mở rộng số máy lẻ hoặc kết nối trung kế theo nhu cầu',
    ],
    applications: ['Tổng đài doanh nghiệp', 'Call center và chăm sóc khách hàng', 'Kết nối điện thoại analog với hệ thống IP'],
    buyingAdvice: 'Cần đối chiếu loại cổng FXS/FXO/E1, số kênh, giao thức SIP, codec, khả năng tương thích tổng đài và yêu cầu dự phòng.',
  },
  'ip-pbx': {
    singularLabel: 'tổng đài IP PBX',
    solution: 'quản lý cuộc gọi nội bộ, cuộc gọi ra vào và các tính năng liên lạc hợp nhất trên nền IP',
    primaryUse: 'doanh nghiệp, khách sạn, bệnh viện, trường học và trung tâm chăm sóc khách hàng',
    benefits: [
      'Tổ chức hệ thống máy lẻ và luồng cuộc gọi tập trung',
      'Hỗ trợ mở rộng người dùng linh hoạt theo quy mô doanh nghiệp',
      'Phù hợp tích hợp điện thoại IP, SIP trunk và các ứng dụng liên lạc',
    ],
    applications: ['Văn phòng và doanh nghiệp nhiều chi nhánh', 'Khách sạn và bệnh viện', 'Call center và bộ phận hỗ trợ khách hàng'],
    buyingAdvice: 'Nên xác định số người dùng, số cuộc gọi đồng thời, loại trung kế, tính năng ghi âm, IVR, báo cáo và khả năng mở rộng.',
  },
  'dien-thoai-ip': {
    singularLabel: 'điện thoại IP',
    solution: 'thực hiện và quản lý cuộc gọi thoại qua mạng IP với khả năng tích hợp vào tổng đài doanh nghiệp',
    primaryUse: 'bàn làm việc, quầy lễ tân, phòng họp, bộ phận kinh doanh và chăm sóc khách hàng',
    benefits: [
      'Hỗ trợ liên lạc nội bộ và cuộc gọi doanh nghiệp trên nền IP',
      'Thuận tiện quản lý danh bạ, phím chức năng và tài khoản SIP',
      'Phù hợp triển khai đồng bộ với tổng đài IP và hệ thống mạng hiện hữu',
    ],
    applications: ['Bàn làm việc nhân viên', 'Quầy lễ tân và trực tổng đài', 'Phòng họp và bộ phận chăm sóc khách hàng'],
    buyingAdvice: 'Cần kiểm tra số tài khoản SIP, màn hình, phím chức năng, PoE, cổng mạng, tai nghe và khả năng tương thích tổng đài.',
  },
  'cap-mang': {
    singularLabel: 'cáp mạng',
    solution: 'truyền dữ liệu ổn định giữa các thiết bị trong hệ thống mạng có dây',
    primaryUse: 'văn phòng, tòa nhà, nhà máy, camera, Wi-Fi và trung tâm dữ liệu',
    benefits: [
      'Tạo nền tảng kết nối vật lý ổn định cho hệ thống mạng',
      'Phù hợp thi công âm tường, đi máng cáp hoặc đấu nối trong tủ rack',
      'Dễ kết hợp với patch panel, ổ cắm mạng và đầu nối tương ứng',
    ],
    applications: ['Mạng LAN doanh nghiệp', 'Camera IP và điểm truy cập Wi-Fi', 'Hệ thống cáp cấu trúc trong tòa nhà'],
    buyingAdvice: 'Nên xác định chuẩn Cat, loại UTP/FTP, vật liệu lõi, vỏ cáp, môi trường trong nhà hoặc ngoài trời và chiều dài tuyến.',
  },
  'cap-quang': {
    singularLabel: 'cáp quang',
    solution: 'truyền dữ liệu băng thông cao trên khoảng cách lớn với khả năng chống nhiễu điện từ',
    primaryUse: 'mạng trục, liên kết tòa nhà, nhà máy, viễn thông và trung tâm dữ liệu',
    benefits: [
      'Phù hợp cho tuyến truyền dẫn yêu cầu băng thông và khoảng cách lớn',
      'Hạn chế ảnh hưởng của nhiễu điện từ trong môi trường công nghiệp',
      'Linh hoạt triển khai theo số sợi, cấu trúc và điều kiện thi công',
    ],
    applications: ['Mạng backbone', 'Liên kết giữa các tòa nhà', 'Hạ tầng viễn thông và nhà máy'],
    buyingAdvice: 'Cần chọn đúng single-mode hoặc multi-mode, số sợi, cấu trúc cáp, lớp bảo vệ, điều kiện kéo treo/chôn ngầm và bán kính uốn.',
  },
  'patch-panel': {
    singularLabel: 'patch panel',
    solution: 'tập trung và quản lý các tuyến cáp mạng hoặc cáp quang trong tủ rack',
    primaryUse: 'phòng máy, tủ mạng, trung tâm dữ liệu và hệ thống cáp cấu trúc',
    benefits: [
      'Giúp đánh số, quản lý và thay đổi kết nối thuận tiện',
      'Tạo bố cục tủ mạng gọn gàng, chuyên nghiệp',
      'Hỗ trợ bảo trì và khoanh vùng sự cố nhanh hơn',
    ],
    applications: ['Tủ rack mạng', 'Phòng máy doanh nghiệp', 'Hệ thống cáp cấu trúc tòa nhà'],
    buyingAdvice: 'Nên kiểm tra số port, chuẩn Cat hoặc loại adapter quang, chiều cao rack, kiểu đấu nối và phụ kiện quản lý cáp.',
  },
  'phu-kien-ket-noi': {
    singularLabel: 'phụ kiện kết nối',
    solution: 'hoàn thiện các điểm đấu nối, chuyển đổi và tổ chức đường truyền trong hệ thống viễn thông và CNTT',
    primaryUse: 'thi công mạng, tủ rack, cáp đồng, cáp quang và hệ thống thiết bị đầu cuối',
    benefits: [
      'Hỗ trợ hoàn thiện kết nối đúng chuẩn và đồng bộ',
      'Thuận tiện thay thế, bảo trì và mở rộng hệ thống',
      'Đa dạng lựa chọn theo loại cáp, đầu nối và môi trường sử dụng',
    ],
    applications: ['Thi công mạng LAN', 'Đấu nối cáp quang', 'Tủ mạng và phòng thiết bị'],
    buyingAdvice: 'Cần xác định chính xác loại đầu nối, chuẩn tương thích, kích thước, vật liệu và thiết bị sử dụng cùng.',
  },
  'may-chu': {
    singularLabel: 'máy chủ',
    solution: 'vận hành ứng dụng, cơ sở dữ liệu, lưu trữ và các dịch vụ CNTT tập trung',
    primaryUse: 'doanh nghiệp, trung tâm dữ liệu, hệ thống ảo hóa và ứng dụng nghiệp vụ',
    benefits: [
      'Cung cấp nền tảng xử lý tập trung cho ứng dụng và dữ liệu',
      'Hỗ trợ mở rộng tài nguyên theo nhu cầu vận hành',
      'Phù hợp xây dựng hạ tầng ảo hóa, lưu trữ hoặc dịch vụ nội bộ',
    ],
    applications: ['Máy chủ ứng dụng và cơ sở dữ liệu', 'Ảo hóa và điện toán riêng', 'Lưu trữ, sao lưu và dịch vụ nội bộ'],
    buyingAdvice: 'Cần làm rõ bộ xử lý, RAM, ổ đĩa, RAID, nguồn dự phòng, card mạng, hệ điều hành, khả năng mở rộng và hình thức rack/tower.',
  },
  pc: {
    singularLabel: 'máy tính để bàn',
    solution: 'phục vụ công việc văn phòng, nghiệp vụ chuyên môn và vận hành ứng dụng tại vị trí làm việc',
    primaryUse: 'doanh nghiệp, cơ quan, trường học, quầy giao dịch và bộ phận kỹ thuật',
    benefits: [
      'Cấu hình linh hoạt theo từng nhu cầu công việc',
      'Thuận tiện nâng cấp, bảo trì và thay thế linh kiện',
      'Phù hợp triển khai đồng bộ số lượng lớn trong doanh nghiệp',
    ],
    applications: ['Công việc văn phòng', 'Phần mềm nghiệp vụ', 'Thiết kế, kỹ thuật hoặc vận hành theo cấu hình'],
    buyingAdvice: 'Nên xác định CPU, RAM, dung lượng lưu trữ, card đồ họa, màn hình, hệ điều hành và chính sách bảo hành.',
  },
  'mini-pc': {
    singularLabel: 'máy tính mini',
    solution: 'cung cấp khả năng xử lý trong thiết kế nhỏ gọn, tiết kiệm không gian lắp đặt',
    primaryUse: 'văn phòng, phòng họp, kiosk, màn hình trình chiếu và hệ thống điều khiển',
    benefits: [
      'Thiết kế nhỏ gọn, dễ bố trí tại nhiều vị trí',
      'Phù hợp cho nhu cầu vận hành liên tục với không gian hạn chế',
      'Dễ tích hợp cùng màn hình, kiosk hoặc thiết bị ngoại vi',
    ],
    applications: ['Máy tính văn phòng gọn nhẹ', 'Phòng họp và trình chiếu', 'Kiosk và hệ thống điều khiển'],
    buyingAdvice: 'Cần kiểm tra CPU, RAM, SSD, số cổng kết nối, Wi-Fi, khả năng gắn VESA, hệ điều hành và phương án tản nhiệt.',
  },
  laptop: {
    singularLabel: 'máy tính xách tay',
    solution: 'đáp ứng công việc di động, học tập, họp trực tuyến và xử lý nghiệp vụ',
    primaryUse: 'nhân viên văn phòng, quản lý, kỹ thuật, học tập và làm việc từ xa',
    benefits: [
      'Linh hoạt di chuyển và làm việc tại nhiều địa điểm',
      'Tích hợp màn hình, bàn phím, pin và kết nối không dây',
      'Đa dạng cấu hình theo nhu cầu văn phòng hoặc chuyên môn',
    ],
    applications: ['Công việc văn phòng và di động', 'Họp trực tuyến', 'Kỹ thuật, thiết kế hoặc xử lý chuyên môn theo cấu hình'],
    buyingAdvice: 'Nên cân đối CPU, RAM, SSD, kích thước màn hình, trọng lượng, thời lượng pin, cổng kết nối và chính sách bảo hành.',
  },
  'may-in-nhan': {
    singularLabel: 'máy in nhãn',
    solution: 'in tem nhãn, mã vạch và thông tin nhận diện cho hàng hóa hoặc tài sản',
    primaryUse: 'kho vận, bán lẻ, sản xuất, y tế, văn phòng và quản lý tài sản',
    benefits: [
      'Hỗ trợ chuẩn hóa quy trình nhận diện và truy xuất hàng hóa',
      'Phù hợp in tem theo nhu cầu tại quầy hoặc trong công nghiệp',
      'Dễ tích hợp với phần mềm bán hàng, kho hoặc quản lý tài sản',
    ],
    applications: ['Kho hàng và logistics', 'Bán lẻ và siêu thị', 'Sản xuất, y tế và quản lý tài sản'],
    buyingAdvice: 'Cần xác định công nghệ in, độ phân giải, khổ nhãn, tốc độ, kết nối, công suất in và loại vật tư tương thích.',
  },
  kiosk: {
    singularLabel: 'thiết bị kiosk',
    solution: 'tự động hóa thao tác tra cứu, đăng ký, lấy số, thanh toán hoặc phục vụ khách hàng',
    primaryUse: 'ngân hàng, bệnh viện, cơ quan hành chính, bán lẻ, sân bay và khu vực dịch vụ công',
    benefits: [
      'Hỗ trợ tự phục vụ và giảm tải cho nhân viên tại quầy',
      'Tạo trải nghiệm giao dịch nhất quán, hiện đại',
      'Có thể tích hợp màn hình cảm ứng và nhiều thiết bị ngoại vi',
    ],
    applications: ['Kiosk tra cứu và lấy số', 'Kiosk đăng ký hoặc thanh toán', 'Điểm dịch vụ tự động tại khu vực công cộng'],
    buyingAdvice: 'Nên xác định kích thước màn hình, cấu hình máy tính, thiết bị ngoại vi, kiểu vỏ, môi trường lắp đặt và phần mềm tích hợp.',
  },
  'tam-pin-nang-luong-mat-troi': {
    singularLabel: 'tấm pin năng lượng mặt trời',
    solution: 'chuyển đổi bức xạ mặt trời thành điện năng cho hệ thống điện mặt trời',
    primaryUse: 'mái nhà dân dụng, nhà xưởng, tòa nhà thương mại và dự án điện mặt trời',
    benefits: [
      'Tạo nguồn điện sạch từ năng lượng mặt trời',
      'Phù hợp triển khai theo nhiều quy mô công suất',
      'Có thể kết hợp với inverter và hệ thống lưu trữ phù hợp',
    ],
    applications: ['Điện mặt trời mái nhà', 'Nhà xưởng và tòa nhà thương mại', 'Dự án năng lượng phân tán'],
    buyingAdvice: 'Cần kiểm tra công suất danh định, hiệu suất, kích thước, điện áp, dòng điện, hệ số nhiệt, tiêu chuẩn và điều kiện bảo hành của đúng model.',
  },
  'bo-hoa-luoi-inverter': {
    singularLabel: 'bộ hòa lưới inverter',
    solution: 'chuyển đổi điện một chiều từ tấm pin thành điện xoay chiều để sử dụng hoặc hòa vào hệ thống điện',
    primaryUse: 'hệ thống điện mặt trời dân dụng, thương mại và công nghiệp',
    benefits: [
      'Đóng vai trò trung tâm chuyển đổi và quản lý nguồn điện mặt trời',
      'Hỗ trợ giám sát trạng thái vận hành tùy theo dòng sản phẩm',
      'Phù hợp thiết kế theo công suất và cấu trúc chuỗi pin',
    ],
    applications: ['Điện mặt trời mái nhà dân dụng', 'Hệ thống thương mại và nhà xưởng', 'Dự án điện mặt trời hòa lưới'],
    buyingAdvice: 'Phải đối chiếu công suất AC/DC, số MPPT, dải điện áp, số chuỗi pin, pha điện, chuẩn bảo vệ và khả năng giám sát.',
  },
  'ac-quy-chi': {
    singularLabel: 'ắc quy chì',
    solution: 'lưu trữ và cấp nguồn dự phòng cho thiết bị điện, viễn thông hoặc hệ thống UPS',
    primaryUse: 'UPS, viễn thông, báo cháy, chiếu sáng khẩn cấp và nguồn dự phòng',
    benefits: [
      'Cung cấp nguồn điện dự phòng khi nguồn chính gián đoạn',
      'Phù hợp với nhiều hệ thống nguồn DC và UPS',
      'Đa dạng dung lượng cho từng thời gian lưu điện yêu cầu',
    ],
    applications: ['UPS và bộ lưu điện', 'Thiết bị viễn thông', 'Báo cháy, an ninh và chiếu sáng khẩn cấp'],
    buyingAdvice: 'Cần chọn đúng điện áp, dung lượng Ah, dòng xả, kích thước, loại cực, tuổi thọ thiết kế và điều kiện sạc/xả.',
  },
  'ac-quy-lithium': {
    singularLabel: 'ắc quy Lithium',
    solution: 'lưu trữ điện năng với mật độ năng lượng cao và khả năng quản lý pin theo hệ thống',
    primaryUse: 'điện mặt trời, nguồn dự phòng, viễn thông, UPS và hệ thống lưu trữ năng lượng',
    benefits: [
      'Thiết kế gọn hơn theo cùng nhu cầu dung lượng so với nhiều công nghệ truyền thống',
      'Phù hợp cho hệ thống cần số chu kỳ sạc xả cao',
      'Có thể tích hợp hệ thống quản lý pin tùy theo dòng sản phẩm',
    ],
    applications: ['Lưu trữ điện mặt trời', 'Nguồn dự phòng và UPS', 'Trạm viễn thông và hệ thống năng lượng'],
    buyingAdvice: 'Cần xác định điện áp, dung lượng, công suất xả, số chu kỳ, BMS, giao tiếp, kiểu lắp đặt và khả năng tương thích inverter/UPS.',
  },
  'ac-quy-nuoc': {
    singularLabel: 'ắc quy nước',
    solution: 'tích trữ và cấp dòng điện cho các hệ thống cần khả năng phóng điện phù hợp',
    primaryUse: 'phương tiện, máy phát, thiết bị công nghiệp và một số hệ thống nguồn dự phòng',
    benefits: [
      'Đáp ứng nhu cầu khởi động hoặc cấp nguồn theo đúng cấu hình sử dụng',
      'Có nhiều mức điện áp và dung lượng để lựa chọn',
      'Phù hợp các ứng dụng có quy trình kiểm tra, bảo dưỡng định kỳ',
    ],
    applications: ['Khởi động động cơ và máy phát', 'Thiết bị công nghiệp', 'Nguồn điện dự phòng theo thiết kế'],
    buyingAdvice: 'Cần kiểm tra điện áp, dung lượng, dòng khởi động, kích thước, vị trí cọc, yêu cầu bảo dưỡng và điều kiện lắp đặt.',
  },
};

const DEFAULT_SEO_PROFILE: CategorySeoProfile = {
  singularLabel: 'thiết bị',
  solution: 'hoàn thiện và nâng cao hiệu quả vận hành của hệ thống',
  primaryUse: 'doanh nghiệp, dự án và các công trình hạ tầng kỹ thuật',
  benefits: [
    'Phù hợp tích hợp vào hệ thống theo đúng yêu cầu kỹ thuật',
    'Hỗ trợ triển khai, thay thế hoặc mở rộng hạ tầng',
    'Có thể lựa chọn cấu hình theo nhu cầu và quy mô thực tế',
  ],
  applications: ['Doanh nghiệp và văn phòng', 'Công trình hạ tầng kỹ thuật', 'Dự án triển khai theo yêu cầu'],
  buyingAdvice: 'Cần đối chiếu thông số của đúng model, khả năng tương thích, điều kiện lắp đặt và chính sách bảo hành trước khi đặt hàng.',
};

function getSeoProfile(categoryName: string): CategorySeoProfile {
  return CATEGORY_SEO_PROFILES[normalizeText(categoryName)] || DEFAULT_SEO_PROFILE;
}

function getDeterministicVariant(value: string, totalVariants: number): number {
  let hash = 0;

  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash % totalVariants;
}

function buildSeoShortDescription(product: CatalogProduct): string {
  const profile = getSeoProfile(product.categoryName);
  const variants = [
    `${product.name} (${product.model}) là ${profile.singularLabel} thương hiệu ${product.brand}, phù hợp cho ${profile.primaryUse}. Liên hệ CTC Telecom để được tư vấn cấu hình và báo giá.`,
    `Tìm hiểu ${product.name} model ${product.model} của ${product.brand}: giải pháp ${product.categoryName.toLowerCase()} dành cho ${profile.primaryUse}. Tư vấn kỹ thuật và báo giá theo dự án.`,
    `${product.name} thuộc nhóm ${product.categoryName}, hỗ trợ ${profile.solution}. CTC Telecom tư vấn lựa chọn đúng cấu hình, khả năng tương thích và tình trạng hàng.`,
    `Báo giá ${product.name} – model ${product.model}, thương hiệu ${product.brand}. Sản phẩm phù hợp ${profile.primaryUse}, hỗ trợ tư vấn kỹ thuật theo nhu cầu triển khai.`,
  ];

  return variants[getDeterministicVariant(product.name, variants.length)];
}

function getFeatures(product: CatalogProduct): string[] {
  const profile = getSeoProfile(product.categoryName);

  return [
    `Model / dòng sản phẩm: ${product.model}`,
    `Thương hiệu: ${product.brand}`,
    ...profile.benefits,
    'Tư vấn kiểm tra cấu hình, khả năng tương thích và tình trạng phân phối trước khi đặt hàng',
  ];
}

function generateSeoDescription(product: CatalogProduct): {
  description: string;
  shortDescription: string;
  features: string[];
  specifications: string;
} {
  const profile = getSeoProfile(product.categoryName);
  const generatedShortDescription = buildSeoShortDescription(product);

  const name = escapeHtml(product.name);
  const model = escapeHtml(product.model);
  const brand = escapeHtml(product.brand);
  const mainGroup = escapeHtml(product.mainGroup);
  const categoryName = escapeHtml(product.categoryName);
  const singularLabel = escapeHtml(profile.singularLabel);
  const solution = escapeHtml(profile.solution);
  const primaryUse = escapeHtml(profile.primaryUse);
  const originalSummary = escapeHtml(product.shortDescription);
  const sourceUrl = escapeHtml(product.sourceUrl);
  const verificationNote = escapeHtml(product.verificationNote);
  const buyingAdvice = escapeHtml(profile.buyingAdvice);

  const benefitItems = profile.benefits
    .map((benefit) => `    <li>${escapeHtml(benefit)}.</li>`)
    .join('\n');

  const applicationItems = profile.applications
    .map((application) => `    <li>${escapeHtml(application)}.</li>`)
    .join('\n');

  const introVariants = [
    `<strong>${name}</strong> là ${singularLabel} thuộc thương hiệu <strong>${brand}</strong>, model <strong>${model}</strong>. Sản phẩm được định hướng cho ${primaryUse}, giúp ${solution}.`,
    `Trong các hệ thống cần ${solution}, <strong>${name}</strong> là một lựa chọn thuộc danh mục <strong>${categoryName}</strong>. Model <strong>${model}</strong> đến từ thương hiệu <strong>${brand}</strong> và phù hợp cho ${primaryUse}.`,
    `<strong>${name}</strong> model <strong>${model}</strong> là sản phẩm trong nhóm <strong>${categoryName}</strong> của <strong>${brand}</strong>. Thiết bị phù hợp với ${primaryUse}, đặc biệt khi cần ${solution}.`,
    `Được xếp trong danh mục <strong>${categoryName}</strong>, <strong>${name}</strong> hỗ trợ ${solution}. Đây là model <strong>${model}</strong> của thương hiệu <strong>${brand}</strong>, phù hợp triển khai cho ${primaryUse}.`,
  ];

  const intro = introVariants[
    getDeterministicVariant(`${product.name}-${product.model}`, introVariants.length)
  ];

  const description = `
<article class="space-y-6 text-gray-700 dark:text-gray-300 product-description">
  <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
    ${name} – ${categoryName} ${brand} cho hệ thống chuyên nghiệp
  </h2>

  <p class="text-base leading-relaxed">
    ${intro}
  </p>

  <p class="text-base leading-relaxed">
    ${originalSummary} Khi lựa chọn sản phẩm, người dùng nên đối chiếu đúng mã model, yêu cầu kỹ thuật và môi trường triển khai để bảo đảm hiệu quả đầu tư.
  </p>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">
    Ưu điểm nổi bật của ${name}
  </h3>

  <ul class="list-disc pl-6 space-y-2">
${benefitItems}
  </ul>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">
    Ứng dụng phù hợp
  </h3>

  <p class="leading-relaxed">
    Với định hướng sử dụng trong ${primaryUse}, ${name} có thể được xem xét cho nhiều mô hình triển khai như:
  </p>

  <ul class="list-disc pl-6 space-y-2">
${applicationItems}
  </ul>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">
    Thông tin sản phẩm ${name}
  </h3>

  <div class="overflow-x-auto">
    <table class="w-full border-collapse border border-gray-200 dark:border-slate-700 text-sm">
      <tbody>
        <tr class="border-b border-gray-200 dark:border-slate-700">
          <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800 w-1/3">Tên sản phẩm</td>
          <td class="p-2.5">${name}</td>
        </tr>
        <tr class="border-b border-gray-200 dark:border-slate-700">
          <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Model / Dòng sản phẩm</td>
          <td class="p-2.5">${model}</td>
        </tr>
        <tr class="border-b border-gray-200 dark:border-slate-700">
          <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Thương hiệu</td>
          <td class="p-2.5">${brand}</td>
        </tr>
        <tr class="border-b border-gray-200 dark:border-slate-700">
          <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Danh mục</td>
          <td class="p-2.5">${categoryName}</td>
        </tr>
        <tr>
          <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Nhóm sản phẩm</td>
          <td class="p-2.5">${mainGroup}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">
    Kinh nghiệm lựa chọn ${categoryName}
  </h3>

  <p class="leading-relaxed">
    ${buyingAdvice}
  </p>

  <p class="leading-relaxed">
    <strong>Lưu ý:</strong> ${verificationNote} Thông số, phụ kiện, hình ảnh và chính sách bảo hành có thể thay đổi theo thị trường hoặc từng phiên bản sản phẩm.
  </p>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">
    Tư vấn ${name} tại CTC Telecom
  </h3>

  <p class="leading-relaxed">
    CTC Telecom hỗ trợ tiếp nhận yêu cầu, đối chiếu model, kiểm tra khả năng tương thích và đề xuất cấu hình phù hợp cho từng công trình. Quý khách nên cung cấp quy mô hệ thống, thiết bị đang sử dụng và mục tiêu triển khai để được tư vấn chính xác hơn.
  </p>

  <p class="leading-relaxed">
    Tham khảo thêm dữ liệu tại
    <a
      href="${sourceUrl}"
      target="_blank"
      rel="noopener noreferrer nofollow"
      class="text-sky-600 hover:underline"
    >
      nguồn sản phẩm của hãng ${brand}
    </a>.
  </p>

  <section class="space-y-3">
    <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">
      Câu hỏi thường gặp về ${name}
    </h3>

    <h4 class="font-semibold text-slate-900 dark:text-white">
      ${name} phù hợp với đối tượng nào?
    </h4>
    <p class="leading-relaxed">
      Sản phẩm phù hợp để xem xét cho ${primaryUse}. Cấu hình cuối cùng cần căn cứ vào quy mô và yêu cầu kỹ thuật của hệ thống.
    </p>

    <h4 class="font-semibold text-slate-900 dark:text-white">
      Cần kiểm tra gì trước khi đặt mua model ${model}?
    </h4>
    <p class="leading-relaxed">
      Nên xác nhận đúng model, thông số, phụ kiện đi kèm, khả năng tương thích, tình trạng phân phối và điều kiện bảo hành tại thời điểm báo giá.
    </p>

    <h4 class="font-semibold text-slate-900 dark:text-white">
      Giá ${name} là bao nhiêu?
    </h4>
    <p class="leading-relaxed">
      Giá phụ thuộc vào phiên bản, cấu hình, số lượng và thời điểm cung cấp. Vui lòng liên hệ CTC Telecom để nhận báo giá theo nhu cầu thực tế.
    </p>
  </section>
</article>
  `.trim();

  return {
    description,
    shortDescription: generatedShortDescription,
    features: getFeatures(product),
    specifications: [
      `Tên sản phẩm: ${product.name}`,
      `Model / Dòng sản phẩm: ${product.model}`,
      `Thương hiệu: ${product.brand}`,
      `Nhóm chính: ${product.mainGroup}`,
      `Danh mục: ${product.categoryName}`,
      `Ứng dụng gợi ý: ${profile.applications.join(', ')}`,
      `Nguồn tham khảo: ${product.sourceUrl}`,
    ].join('; '),
  };
}
function getCategoryAndDescendantIds(
  categoryId: any,
  childrenByParentId: Map<string, any[]>,
): any[] {
  const result: any[] = [categoryId];
  const children = childrenByParentId.get(String(categoryId)) || [];

  for (const child of children) {
    result.push(
      ...getCategoryAndDescendantIds(
        child._id,
        childrenByParentId,
      ),
    );
  }

  return result;
}

async function seed400RealProducts(): Promise<void> {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let categories = await ProductCategory.find({
      isActive: true,
    }).lean();

    const missingCategoryNames = Array.from(
      new Set(
        catalogProducts
          .filter(
            (product) =>
              !findProductCategory(product, categories),
          )
          .map((product) => product.categoryName),
      ),
    );

    if (missingCategoryNames.length > 0) {
      console.log(
        `\n📁 Auto-creating ${missingCategoryNames.length} missing product categories...`,
      );
      for (const catName of missingCategoryNames) {
        const slug = normalizeText(catName);
        await ProductCategory.findOneAndUpdate(
          { slug },
          {
            $setOnInsert: {
              name: catName,
              slug,
              description: `Danh mục ${catName} chính hãng`,
              icon: 'Package',
              color: '#3B82F6',
              order: 0,
              isActive: true,
              productCount: 0,
            },
          },
          { upsert: true, new: true },
        );
      }
      categories = await ProductCategory.find({
        isActive: true,
      }).lean();
    }

    console.log(`📁 Found ${categories.length} active categories.`);

    if (!UPDATE_IMAGES_ONLY && CLEAR_ALL_PRODUCTS) {
      console.log('\n🔥 CLEAR_ALL_PRODUCTS=true: deleting all products...');
      const deleteResult = await Product.deleteMany({});
      console.log(
        `✓ Deleted ${deleteResult.deletedCount ?? 0} existing products.`,
      );
    } else if (!UPDATE_IMAGES_ONLY && RESET_CATALOG_PRODUCTS) {
      console.log('\n🧹 Removing previous CTC-REAL seed products...');
      const deleteResult = await Product.deleteMany({
        code: /^CTC-REAL-/,
      });
      console.log(
        `✓ Deleted ${deleteResult.deletedCount ?? 0} previous seed products.`,
      );
    }

    console.log(
      `\n🖼️ Crawling exact product images: tối đa ${MAX_PRODUCT_IMAGES} ảnh/sản phẩm, concurrency=${IMAGE_CRAWL_CONCURRENCY}, download=${DOWNLOAD_PRODUCT_IMAGES}...`,
    );

    let completedImageProducts = 0;
    let productsWithMultipleImages = 0;
    let productsUsingPlaceholder = 0;
    let totalPagesVisited = 0;

    const productImageResults = await mapWithConcurrency(
      catalogProducts,
      IMAGE_CRAWL_CONCURRENCY,
      async (catalogProduct, index) => {
        const result = await crawlProductImages(catalogProduct, index);
        completedImageProducts += 1;
        totalPagesVisited += result.pagesVisited;

        if (result.images.length > 1) {
          productsWithMultipleImages += 1;
        }
        if (result.usedPlaceholder) {
          productsUsingPlaceholder += 1;
        }

        if (
          completedImageProducts % 10 === 0 ||
          completedImageProducts === catalogProducts.length
        ) {
          console.log(
            `   ${completedImageProducts}/${catalogProducts.length} sản phẩm | nhiều ảnh: ${productsWithMultipleImages} | placeholder: ${productsUsingPlaceholder}`,
          );
        }

        return result;
      },
    );

    console.log(
      `✓ Image crawl completed. Đã đọc ${totalPagesVisited} trang; ${productsWithMultipleImages}/${catalogProducts.length} sản phẩm có từ 2 ảnh; ${productsUsingPlaceholder} sản phẩm dùng ảnh chờ cập nhật.`,
    );

    await fs.mkdir(PRODUCT_IMAGE_OUTPUT_DIR, { recursive: true });
    await fs.writeFile(
      path.join(PRODUCT_IMAGE_OUTPUT_DIR, 'image-manifest.json'),
      JSON.stringify(
        catalogProducts.map((product, index) => ({
          code: `CTC-REAL-${String(index + 1).padStart(3, '0')}`,
          name: product.name,
          model: product.model,
          sourcePage: product.sourceUrl,
          detailPage: productImageResults[index].detailPage || null,
          images: productImageResults[index].images,
          sourceImages: productImageResults[index].sourceImages,
          usedPlaceholder: productImageResults[index].usedPlaceholder,
        })),
        null,
        2,
      ),
      'utf8',
    );

    const existingRealCount = await Product.countDocuments({
      code: /^CTC-REAL-/,
    });

    if (UPDATE_IMAGES_ONLY && existingRealCount > 0) {
      console.log('\n🔄 UPDATE_IMAGES_ONLY=true: updating image fields only...');

      let updatedCount = 0;
      for (let index = 0; index < catalogProducts.length; index += 1) {
        const code = `CTC-REAL-${String(index + 1).padStart(3, '0')}`;
        const imageUrls = productImageResults[index].images;

        const result = await Product.updateOne(
          { code },
          {
            $set: {
              image: imageUrls[0],
              images: imageUrls,
            },
          },
        );

        updatedCount += result.modifiedCount || 0;
      }

      console.log(`✅ Updated images for ${updatedCount} existing products.`);
      return;
    }

    const productsToInsert = catalogProducts.map(
      (catalogProduct, index) => {
        const category = findProductCategory(
          catalogProduct,
          categories,
        );

        if (!category) {
          throw new Error(
            `Không tìm thấy categoryId cho "${catalogProduct.categoryName}".`,
          );
        }

        const code = `CTC-REAL-${String(index + 1).padStart(3, '0')}`;
        const imageUrls = productImageResults[index].images;

        const {
          description,
          shortDescription,
          features,
          specifications,
        } = generateSeoDescription(catalogProduct);

        return {
          name: catalogProduct.name,
          category: category.name,
          categoryId: category._id,
          categoryLabel: String(category.name).toUpperCase(),
          code,
          description,
          shortDescription,
          specifications,
          price: '0',
          originalPrice: '0',
          contactPrice: true,
          stockStatus: 'contact',
          stock: 100,
          warranty: 'Theo chính sách của hãng/nhà phân phối',
          features,
          image: imageUrls[0],
          images: imageUrls,
          isFeatured: (index + 1) % 8 === 0,
          isActive: true,
          focusKeyword:
            catalogProduct.focusKeyword ||
            `${catalogProduct.categoryName} ${catalogProduct.brand} ${catalogProduct.model}`,
          views: 50 + (((index + 1) * 37) % 451),
          likes: 5 + (((index + 1) * 11) % 46),
        };
      },
    );

    if (productsToInsert.length !== 400) {
      throw new Error(
        `Số lượng sản phẩm không hợp lệ: ${productsToInsert.length}/400.`,
      );
    }

    console.log(
      `\n🚀 Inserting ${productsToInsert.length} real products...`,
    );

    const insertedProducts = await Product.insertMany(
      productsToInsert,
      {
        ordered: true,
      },
    );

    console.log(
      `✅ Inserted ${insertedProducts.length} products. Giá được đặt ở chế độ "Liên hệ".`,
    );

    console.log('\n🔄 Updating productCount for all categories...');

    const childrenByParentId = new Map<string, any[]>();

    for (const category of categories) {
      if (!category.parentId) {
        continue;
      }

      const parentId = String(category.parentId);
      const children = childrenByParentId.get(parentId) || [];
      children.push(category);
      childrenByParentId.set(parentId, children);
    }

    for (const category of categories) {
      const categoryIds = getCategoryAndDescendantIds(
        category._id,
        childrenByParentId,
      );

      const productCount = await Product.countDocuments({
        categoryId: { $in: categoryIds },
        isActive: true,
      });

      await ProductCategory.findByIdAndUpdate(
        category._id,
        { productCount },
      );
    }

    console.log('✓ Updated category product counts.');
    console.log('\n🎉 Seed 400 real products completed successfully.');
  } catch (error) {
    console.error('\n❌ Error seeding 400 products:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => undefined);
    console.log('🔌 Disconnected from MongoDB.');
  }
}

void seed400RealProducts();
