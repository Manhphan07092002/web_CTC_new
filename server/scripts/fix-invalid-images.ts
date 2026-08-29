/**
 * SCRIPT FIX LỖI ẢNH SẢN PHẨM HOÀN CHỈNH (V9):
 * 1. Khắc phục lỗi trích xuất model sai do tiền tố tiếng Việt (VD: "Biến tần hòa lưới thông minh Huawei" -> ra ảnh Smartwatch/Band).
 * 2. Khắc phục lỗi ảnh trùng lặp (Duplicate images) bằng cơ chế gán ảnh duy nhất (Unique Image Assignment).
 * 3. Bổ sung bộ lọc chặn 100% các sàn thương mại điện tử & mạng xã hội (Shopee, Lazada, Tiki, Facebook, Instagram, Pinterest...).
 * 4. Bổ sung từ khóa phủ định (-watch -band -strap -phone -vong-tay) cho danh mục công nghiệp, điện mặt trời, viễn thông.
 * 5. Cập nhật trực tiếp vào MongoDB và đồng bộ cache.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Product } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';
const SERPER_API_KEY = process.env.SERPER_API_KEY || '068bc1c51a16125ed74a464484d4e35bfcc42fb7';

const CACHE_DIR = path.resolve(__dirname, '../.cache/seed-850-products-v9-verified');
const IMAGE_CACHE_FILE = path.join(CACHE_DIR, 'google-image-cache-v9.json');

// Danh sách sàn TMĐT và MXH rác bị chặn 100%
const BLOCKED_DOMAINS = [
  'shopee', 'lazada', 'tiki', 'sendo', 'slatic.net', 'alicdn', 'aliexpress', 'alibaba',
  'facebook', 'instagram', 'fbcdn', 'fbsbx', 'pinterest', 'tiktok', 'youtube',
  'chotot', 'vatgia', 'websosanh', 'sosanhgia', 'muaban', 'nhattao', '5giay', 'enbac'
];

// Danh sách các tiền tố tiếng Việt cần loại bỏ khi trích xuất Model
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

function extractExactModel(productName: string, brand: string): string {
  const cleaned = cleanProductName(productName);
  const tokens = cleaned.split(/\s+/);
  
  // Tìm token đặc trưng cho model có cả số và chữ (VD: SUN2000-3KTL-L1, 50KTL3-LV, CS6W-550MS, WP12-12, R750, B1503CVA, TMC-42U1000)
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

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isBlockedSource(url: string, title: string): boolean {
  const lower = `${url} ${title}`.toLowerCase();
  return BLOCKED_DOMAINS.some(d => lower.includes(d));
}

function isClearlyWrongImage(imageUrl: string, title: string, category: string): boolean {
  const text = `${imageUrl} ${title}`.toLowerCase();
  
  if (isBlockedSource(imageUrl, title)) return true;

  const consumerKeywords = [
    'band-8', 'band-9', 'band-7', 'smartwatch', 'dong-ho', 'vong-tay', 'watch-fit', 'watch-gt',
    'strap', 'wristband', 'case-cover', 'day-deo', 'cuong-luc', 'tai-nghe', 'earbuds', 'freebuds',
    'dien-thoai', 'smartphone', 'nova-', 'matepad', 'mate-60', 'p60-pro'
  ];

  if (category.includes('Inverter') || category.includes('Pin') || category.includes('Ắc quy') || category.includes('Server') || category.includes('Tủ') || category.includes('Router')) {
    if (consumerKeywords.some(k => text.includes(k))) {
      return true;
    }
  }

  return false;
}

function buildHighPrecisionSerperQuery(productName: string, category: string, brand: string): string {
  const model = extractExactModel(productName, brand);
  const negativeFilters = '-watch -band -strap -wristband -vong-tay -dong-ho -case -cover -phone -earbuds -shopee -lazada -tiki';

  if (category.toLowerCase().includes('inverter') || productName.toLowerCase().includes('biến tần')) {
    if (brand.toLowerCase().includes('huawei')) {
      return `"${model}" Huawei Inverter site:dhcsolar.com OR site:solar.huawei.com OR site:huawei.com ${negativeFilters}`;
    }
    if (brand.toLowerCase().includes('growatt')) {
      return `"${model}" Growatt Inverter site:dhcsolar.com OR site:growatt.com ${negativeFilters}`;
    }
    if (brand.toLowerCase().includes('deye')) {
      return `"${model}" Deye Inverter site:dhcsolar.com OR site:deyeinverter.com ${negativeFilters}`;
    }
    return `"${model}" ${brand} Inverter site:dhcsolar.com ${negativeFilters}`;
  }

  if (category.toLowerCase().includes('tấm pin') || productName.toLowerCase().includes('tấm pin')) {
    return `"${model}" ${brand} site:dhcsolar.com OR site:canadiansolar.com OR site:longi.com OR site:jinkosolar.com ${negativeFilters}`;
  }

  if (category.toLowerCase().includes('ắc quy') || productName.toLowerCase().includes('ắc quy')) {
    if (brand.toLowerCase().includes('kung long') || brand.toLowerCase().includes('long')) {
      return `"${model}" site:lelong.com.vn OR site:longbattery.com OR site:kunglong.com ${negativeFilters}`;
    }
    return `"${model}" ${brand} site:dhcsolar.com OR site:lelong.com.vn ${negativeFilters}`;
  }

  if (brand.toLowerCase().includes('draytek') || brand.toLowerCase().includes('dintek') || brand.toLowerCase().includes('totolink')) {
    return `"${model}" site:anphat.vn OR site:draytek.com.vn OR site:dintek.com.tw OR site:totolink.vn ${negativeFilters}`;
  }

  if (brand.toLowerCase().includes('tmc') || category.toLowerCase().includes('tủ')) {
    return `"${model}" TMC Rack site:tmcrack.vn OR site:tmc.vn ${negativeFilters}`;
  }

  if (brand.toLowerCase().includes('comq') || category.toLowerCase().includes('kiosk')) {
    return `"${model}" ComQ site:comq.vn ${negativeFilters}`;
  }

  return `"${model}" ${brand} site:anphatpc.com.vn OR site:anphat.vn OR site:dhcsolar.com ${negativeFilters}`;
}

async function searchGoogleImages(query: string): Promise<any[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, gl: 'vn', hl: 'vi', num: 10 }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as { images?: any[] };
    return data.images || [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('🔧 BẮT ĐẦU FIX LỖI ẢNH TRÙNG LẶP & ẢNH SAI TOÀN CATALOG');
  console.log('════════════════════════════════════════════════════════════');

  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối MongoDB thành công.');

  const products = await Product.find({ isDeleted: { $ne: true } }).lean();
  console.log(`📦 Tổng số sản phẩm trong cơ sở dữ liệu: ${products.length}`);

  let imageCache: Record<string, any> = {};
  try {
    const raw = await fs.readFile(IMAGE_CACHE_FILE, 'utf8');
    imageCache = JSON.parse(raw);
  } catch {
    imageCache = {};
  }

  // 1. Phân tích ảnh trùng lặp & ảnh sai
  const imageUsageCount: Record<string, string[]> = {};
  const wrongImageProductIds: string[] = [];

  for (const p of products) {
    const imgUrl = (p.image || '').trim();
    if (!imgUrl || imgUrl === '/uploads/images/default-product.webp') {
      wrongImageProductIds.push(String(p._id));
      continue;
    }

    if (isClearlyWrongImage(imgUrl, p.name, p.category || '')) {
      wrongImageProductIds.push(String(p._id));
      continue;
    }

    imageUsageCount[imgUrl] = imageUsageCount[imgUrl] || [];
    imageUsageCount[imgUrl].push(String(p._id));
  }

  // Tìm các ảnh bị dùng chung nhiều hơn 1 lần
  const duplicateImageUrls = new Set<string>();
  for (const [url, pIds] of Object.entries(imageUsageCount)) {
    if (pIds.length > 1) {
      duplicateImageUrls.add(url);
    }
  }

  console.log(`\n🔍 Phát hiện:`);
  console.log(`• Số sản phẩm có ảnh sai / thiếu / bị chặn: ${wrongImageProductIds.length}`);
  console.log(`• Số nhóm ảnh bị trùng lặp: ${duplicateImageUrls.size}`);

  // Tập hợp tất cả các URL ảnh đã được gán DUY NHẤT để không bị gán đè
  const globallyUsedImages = new Set<string>();
  for (const [url, pIds] of Object.entries(imageUsageCount)) {
    if (pIds.length === 1 && !wrongImageProductIds.includes(pIds[0])) {
      globallyUsedImages.add(url);
    }
  }

  const productsToFix: any[] = [];
  const processedUrls = new Set<string>();

  for (const p of products) {
    const pId = String(p._id);
    const imgUrl = (p.image || '').trim();
    const isWrong = wrongImageProductIds.includes(pId);
    const isDuplicate = duplicateImageUrls.has(imgUrl);

    if (isWrong || (isDuplicate && processedUrls.has(imgUrl))) {
      productsToFix.push(p);
    } else if (isDuplicate) {
      processedUrls.add(imgUrl);
      globallyUsedImages.add(imgUrl);
    }
  }

  console.log(`\n🚀 Cần tìm ảnh mới chính xác cho ${productsToFix.length} sản phẩm...`);

  let fixedCount = 0;
  for (let i = 0; i < productsToFix.length; i++) {
    const p = productsToFix[i];
    const brand = p.brand || p.name.split(/\s+/)[0];
    const category = p.category || '';
    const query = buildHighPrecisionSerperQuery(p.name, category, brand);
    const model = extractExactModel(p.name, brand);

    console.log(`[${i + 1}/${productsToFix.length}] "${p.name}" (Model: "${model}")`);
    
    const candidates = await searchGoogleImages(query);
    let chosenUrl: string | null = null;
    let chosenTitle = '';

    for (const cand of candidates) {
      const candUrl = cand.imageUrl;
      if (!candUrl || globallyUsedImages.has(candUrl)) continue;
      if (isClearlyWrongImage(candUrl, cand.title || '', category)) continue;

      chosenUrl = candUrl;
      chosenTitle = cand.title || '';
      break;
    }

    // Nếu query hẹp không ra ảnh độc lập, thử query mở rộng
    if (!chosenUrl) {
      const fallbackQuery = `"${model}" ${brand} ${category} official product -watch -band -strap -phone -shopee -lazada`;
      const fallbackCandidates = await searchGoogleImages(fallbackQuery);
      for (const cand of fallbackCandidates) {
        const candUrl = cand.imageUrl;
        if (!candUrl || globallyUsedImages.has(candUrl)) continue;
        if (isClearlyWrongImage(candUrl, cand.title || '', category)) continue;

        chosenUrl = candUrl;
        chosenTitle = cand.title || '';
        break;
      }
    }

    if (chosenUrl) {
      globallyUsedImages.add(chosenUrl);
      const cacheKey = slugify(p.name);
      imageCache[cacheKey] = {
        query,
        imageUrl: chosenUrl,
        publicUrl: chosenUrl,
        title: chosenTitle,
        officialSource: true,
        verifiedAt: new Date().toISOString(),
      };

      await Product.updateOne(
        { _id: p._id },
        {
          $set: {
            image: chosenUrl,
            images: [chosenUrl],
            imageAlt: `${p.name} - hình ảnh sản phẩm ${brand}, model ${model}`,
          },
        },
      );
      fixedCount++;
      console.log(`  -> ✅ Đã đổi ảnh mới: ${chosenUrl.slice(0, 80)}...`);
    } else {
      console.log(`  -> ⚠️ Chưa tìm thấy ảnh độc lập mới, giữ ảnh hiện tại.`);
    }

    // Delay nhẹ tránh rate limit Serper
    await new Promise((r) => setTimeout(r, 150));
  }

  // Lưu lại cache
  await fs.writeFile(IMAGE_CACHE_FILE, JSON.stringify(imageCache, null, 2), 'utf8');
  console.log(`\n💾 Đã cập nhật file cache: ${IMAGE_CACHE_FILE}`);
  console.log(`🎉 ĐÃ HOÀN TẤT: Cập nhật thành công ảnh cho ${fixedCount} / ${productsToFix.length} sản phẩm!`);

  await mongoose.disconnect();
}

run().catch(console.error);
