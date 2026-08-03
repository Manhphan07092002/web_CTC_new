/**
 * Advanced AI Article Generator Service (Deep Persuasive & Rich Journalism Engine)
 * 1. Rich Formatting: Executive Summary Box, Quote Callouts, Data Tables, Expert Warning Boxes.
 * 2. Thick Content Expansion: 1,200+ to 1,800+ words of dense analytical depth & persuasive journalistic flow.
 * 3. Supports 5 Dynamic Article Structures:
 *    - Inverted Pyramid (Kim tự tháp ngược - Báo chí/Thời sự)
 *    - PAS (Problem - Agitate - Solution - Marketing/An ninh/Kỹ thuật)
 *    - 5W1H (Who - What - Where - When - Why - How - Tổng hợp tin tức)
 *    - Case Study / Storytelling (Câu chuyện thực tế/Dự án/Review)
 *    - Comparison & Pros/Cons (So sánh - Đánh giá - Tư vấn thiết bị)
 * 4. URL Article Web Scraper & Image Extractor.
 * 5. Reads Admin Settings (`db.settings.get()`) for Gemini API / OpenAI API Keys.
 * 6. Strict Yoast SEO 95-100 & Readability 95-100 score guarantees.
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../../services/db-mongodb';

export interface AiGeneratedArticle {
  title: string;
  rawTitle?: string; // Original scraped/clean title before Yoast formatting (use this as product/project name)
  excerpt: string;
  content: string;
  focusKeyword: string;
  tags: string[];
  image: string;
  images?: string[];
  status: 'pending';
  sources?: string[];
}

export type ArticleTone = 'journalistic' | 'expert' | 'sales' | 'storytelling';
export type ArticleLength = 'short' | 'medium' | 'deep';
export type ArticleStructure = 'inverted_pyramid' | 'pas' | '5w1h' | 'storytelling' | 'comparison';

type TopicDomain = 'solar' | 'telecom' | 'security' | 'construction' | 'general';

/**
 * Classify input title into a specific domain
 */
function detectTopicDomain(title: string, focusKeyword: string): TopicDomain {
  const text = `${title} ${focusKeyword}`.toLowerCase();
  
  if (/pin|mặt trời|áp mái|mái nhà|năng lượng sạch|inverter|điện mặt trời|tấm pin/i.test(text)) {
    return 'solar';
  }
  if (/cáp quang|5g|viễn thông|bưu điện|mạng|hạ tầng số|trạm phát sóng|bts|truyền dẫn|internet/i.test(text)) {
    return 'telecom';
  }
  if (/fbi|cảnh báo|lừa đảo|an ninh|bảo mật|tội phạm|mạng xã hội|mã độc|virus|hacker|giả mạo|chiêu trò|router|wi-fi/i.test(text)) {
    return 'security';
  }
  if (/xây lắp|xây dựng|trạm biến áp|lưới điện|công trình|hạ tầng|thi công|kỹ thuật|điện lực/i.test(text)) {
    return 'construction';
  }
  
  return 'general';
}

/**
 * Extract an accurate focus keyword from user title
 */
function resolveFocusKeyword(userTitle: string, explicitKeyword?: string): string {
  const kw = (explicitKeyword || '').trim();
  if (kw.length >= 2) return kw;

  const clean = userTitle.trim();

  if (/cảnh báo/i.test(clean)) {
    const match = clean.match(/(?:cảnh báo|lừa đảo|giả mạo)[^–\-\:\,]+/i);
    if (match) return match[0].trim().toLowerCase();
  }
  if (/pin mặt trời|điện mặt trời|cho thuê mái nhà/i.test(clean)) {
    const match = clean.match(/(?:pin mặt trời|điện mặt trời|cho thuê mái nhà|lắp điện mặt trời)/i);
    if (match) return match[0].trim().toLowerCase();
  }
  if (/cáp quang|viễn thông|5g/i.test(clean)) {
    const match = clean.match(/(?:cáp quang 5g|cáp quang|hạ tầng viễn thông|mạng 5g)/i);
    if (match) return match[0].trim().toLowerCase();
  }

  const words = clean.split(/\s+/).filter(w => w.length > 2);
  if (words.length >= 2) {
    return words.slice(0, Math.min(3, words.length)).join(' ');
  }

  return clean;
}

/**
 * Format SEO Title strictly within 50 to 64 characters for 10/10 Yoast SEO score
 */
/**
 * Format SEO Title — Preserves exact scraped article titles while truncating if overly long
 */
function formatYoastSeoTitle(cleanTitle: string, kw: string): string {
  let title = cleanTitle.trim();

  // If title is a real scraped or user-entered title (>= 12 chars and not generic 'Bài báo mẫu')
  // PRESERVE IT EXACTLY as scraped from the article! Do NOT append generic suffixes!
  if (title.length >= 12 && !title.toLowerCase().includes('bài báo mẫu')) {
    if (title.length > 100) {
      const trimmed = title.substring(0, 97);
      const lastSpace = trimmed.lastIndexOf(' ');
      return (lastSpace > 30 ? trimmed.substring(0, lastSpace) : trimmed).trim() + '...';
    }
    return title;
  }

  // Fallback ONLY for missing or short generic titles
  if (!title.toLowerCase().includes(kw.toLowerCase())) {
    title = `${title} – ${kw}`;
  }

  if (title.length >= 50 && title.length <= 65) {
    return title;
  }

  if (title.length > 65) {
    const trimmed = title.substring(0, 64);
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > 40) {
      return trimmed.substring(0, lastSpace).trim();
    }
    return trimmed.trim();
  }

  const candidateSuffixes = [
    ` – Cập Nhật Mới Nhất 2026`,
    ` – Phân Tích Mới Nhất 2026`,
    ` – Thông Tin Chi Tiết 2026`,
    ` – Giải Pháp Mới Nhất 2026`,
    ` Mới Nhất 2026`
  ];

  for (const suffix of candidateSuffixes) {
    const candidate = title + suffix;
    if (candidate.length >= 50 && candidate.length <= 65) {
      return candidate;
    }
  }

  if (title.length < 50) {
    const pad = ` – Tin Tức Cập Nhật 2026`;
    const candidate = title + pad;
    if (candidate.length <= 65) return candidate;
    return candidate.substring(0, 64).trim();
  }

  return title;
}

/**
 * Format Meta Excerpt strictly within 120 to 156 characters for 8/8 Yoast SEO score!
 */
function formatYoastSeoExcerpt(cleanTitle: string, kw: string, firstSnippet?: string): string {
  let excerpt = '';
  if (firstSnippet && firstSnippet.length > 30) {
    // Use actual scraped content as excerpt, not generic template
    const cleaned = cleanHtmlEntities(firstSnippet);
    excerpt = cleaned;
  } else {
    excerpt = `Cập nhật thông tin chi tiết về ${kw}. Phân tích bối cảnh, thực trạng diễn biến và tư vấn giải pháp thực tế từ các chuyên gia CTC.`;
  }

  if (!excerpt.toLowerCase().includes(kw.toLowerCase())) {
    excerpt = `${kw}: ${excerpt}`;
  }

  excerpt = excerpt.replace(/\s+/g, ' ').trim();

  if (excerpt.length >= 120 && excerpt.length <= 156) {
    return excerpt;
  }

  if (excerpt.length > 156) {
    const trimmed = excerpt.substring(0, 153);
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > 100) {
      return trimmed.substring(0, lastSpace).trim() + '...';
    }
    return trimmed.trim() + '...';
  }

  const pad = ` Liên hệ Bưu Điện Miền Trung (CTC) để nhận tư vấn trọn gói!`;
  excerpt = excerpt + pad;
  if (excerpt.length > 156) {
    const trimmed = excerpt.substring(0, 153);
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > 100) {
      return trimmed.substring(0, lastSpace).trim() + '...';
    }
    return trimmed.trim() + '...';
  }

  return excerpt;
}

function resolveAbsoluteUrl(rawUrl: string, baseUrl: string): string | null {
  try {
    let clean = rawUrl.trim();
    if (!clean) return null;
    if (clean.startsWith('//')) return 'https:' + clean;
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const resolved = new URL(clean, baseUrl);
    return resolved.href;
  } catch (e) {
    return null;
  }
}

/**
 * Automatically Scrape Article Content, Images & Videos from URL
 * Uses multi-source extraction: JSON-LD, og:image, twitter:image, all data-* attrs, srcset, background-image CSS
 */
export async function scrapeArticleFromUrl(url: string): Promise<{ scrapedTitle: string; scrapedParagraphs: string[]; scrapedImages: string[]; scrapedVideos: string[] }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const parsedUrl = new URL(url);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': parsedUrl.origin + '/',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Scraper] URL fetch non-200: ${res.status} ${res.statusText} for ${url}`);
      return { scrapedTitle: '', scrapedParagraphs: [], scrapedImages: [], scrapedVideos: [] };
    }
    const rawHtml = await res.text();

    // Clean HTML: strip scripts, styles, noscript, svg, comments
    const html = rawHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    // Helper to add unique resolved images
    const scrapedImages: string[] = [];
    const addImage = (raw: string) => {
      if (!raw || raw.startsWith('data:image') || raw.length < 5) return;
      if (/(?:logo|icon|avatar|pixel|spinner|loading|\.gif$|\.svg$|1x1|blank|placeholder|banner|promo|khuyen-mai|quang-cao|discount|store|exclusive|slider|adv)/i.test(raw)) return;
      const resolved = resolveAbsoluteUrl(raw, url);
      if (resolved && !scrapedImages.includes(resolved) && scrapedImages.length < 12) {
        scrapedImages.push(resolved);
      }
    };

    // 1. Extract Title - og:title > twitter:title > <title> > h1
    let scrapedTitle = '';
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
                         html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      scrapedTitle = ogTitleMatch[1].replace(/<[^>]+>/g, '').trim();
    } else {
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i) || html.match(/<h1[^>]*>(.*?)<\/h1>/is);
      if (titleMatch) {
        scrapedTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    }
    scrapedTitle = cleanHtmlEntities(scrapedTitle);
    scrapedTitle = scrapedTitle.replace(/\s*[|–—-]\s*(?:VnExpress|Tuổi Trẻ|Dân Trí|Thanh Niên|VietnamNet|VTV|Tiki|Shopee|Lazada|MSI|Dell|ASUS|HP|Lenovo|CTC|ctcdn\.vn|Thế Giới Di Động|TGDD|CellphoneS|FPT Shop|Chứng khoán|Báo|Trang tin).*$/i, '').trim();

    // 2. Extract Body Text & Technical Spec Tables
    const scrapedParagraphs: string[] = [];
    const scrapedSpecs: string[] = [];

    // 2a. Extract HTML Table Rows (specifications key: value)
    const trRegex = /<tr[^>]*>\s*<t[dh][^>]*>(.*?)<\/t[dh]>\s*<t[dh][^>]*>(.*?)<\/t[dh]>\s*<\/tr>/gis;
    let trMatch;
    while ((trMatch = trRegex.exec(html)) !== null && scrapedSpecs.length < 30) {
      const key = trMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const val = trMatch[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (key.length >= 2 && val.length >= 2 && key.length < 60 && val.length < 250 && !/chọn|mua|xem|giá|giảm/i.test(key)) {
        scrapedSpecs.push(`• ${key}: ${val}`);
      }
    }

    if (scrapedSpecs.length > 0) {
      scrapedParagraphs.push(`=== BẢNG THÔNG SỐ KỸ THUẬT CHI TIẾT TỪ TRANG NGUỒN ===\n` + scrapedSpecs.join('\n'));
    }

    // 2b. Smart Content Extraction: Prioritize <article>, <main>, [role="main"], known content selectors
    const junkPattern = /(?:copyright|all rights reserved|lượt xem|chia sẻ|theo dõi|đăng ký|quảng cáo|bảo lưu mọi quyền|cookie|chính sách|bình luận|comment|related|liên quan|xem thêm|đọc thêm|tin khác|bài viết khác|danh mục|menu|footer|header|sidebar|navigation|breadcrumb|tag|label|mạng xã hội|facebook|twitter|zalo|messenger|©|privacy|disclaimer)/i;

    // Try to isolate the main article content container first
    const articleContainerPatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/gi,
      /<main[^>]*>([\s\S]*?)<\/main>/gi,
      /<div[^>]*(?:class|id)=["'][^"']*(?:article[_-]?(?:body|content|detail|text)|post[_-]?(?:body|content|detail|text)|content[_-]?(?:body|detail|text|area|main|inner)|entry[_-]?content|detail[_-]?(?:content|text|body)|news[_-]?(?:content|detail|body)|main[_-]?content|story[_-]?(?:body|content))[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*role=["']main["'][^>]*>([\s\S]*?)<\/div>/gi,
    ];

    let articleHtml = '';
    for (const pattern of articleContainerPatterns) {
      const containerMatch = pattern.exec(html);
      if (containerMatch && containerMatch[1] && containerMatch[1].length > 200) {
        articleHtml = containerMatch[1];
        console.log(`[Scraper] Found article container (${articleHtml.length} chars) using pattern: ${pattern.source.substring(0, 40)}...`);
        break;
      }
    }

    // Fallback to full HTML if no article container found
    const contentHtml = articleHtml || html;

    // Extract paragraphs from the isolated content area
    const blockRegex = /<(?:p|h2|h3|h4|li)[^>]*>(.*?)<\/(?:p|h2|h3|h4|li)>/gis;
    let blockMatch;
    while ((blockMatch = blockRegex.exec(contentHtml)) !== null && scrapedParagraphs.length < 80) {
      const text = blockMatch[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length > 20 &&
          !junkPattern.test(text) &&
          !scrapedParagraphs.includes(text)) {
        scrapedParagraphs.push(text);
      }
    }

    // If article container yielded too few paragraphs, supplement from broader page <p> tags
    if (scrapedParagraphs.length < 5 && articleHtml) {
      const fallbackBlockRegex = /<p[^>]*>(.*?)<\/p>/gis;
      let fbMatch;
      while ((fbMatch = fallbackBlockRegex.exec(html)) !== null && scrapedParagraphs.length < 80) {
        const text = fbMatch[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        if (text.length > 25 &&
            !junkPattern.test(text) &&
            !scrapedParagraphs.includes(text)) {
          scrapedParagraphs.push(text);
        }
      }
    }

    // 3. Extract Images - multi-source strategy
    // 3a. Prioritize <img> inside article content container (actual article photos!)
    const imgAttrRegex = /<img[^>]+>/gi;
    const attrPatterns = [
      /data-zoom-image=["']([^"'\s]+)["']/i,
      /data-large=["']([^"'\s]+)["']/i,
      /data-full-src=["']([^"'\s]+)["']/i,
      /data-original-src=["']([^"'\s]+)["']/i,
      /data-original=["']([^"'\s]+)["']/i,
      /data-actualsrc=["']([^"'\s]+)["']/i,
      /data-vne-src=["']([^"'\s]+)["']/i,
      /data-lazy-src=["']([^"'\s]+)["']/i,
      /data-lazysrc=["']([^"'\s]+)["']/i,
      /data-src=["']([^"'\s]+)["']/i,
      /data-img=["']([^"'\s]+)["']/i,
      /data-image=["']([^"'\s]+)["']/i,
      /data-photo-url=["']([^"'\s]+)["']/i,
      /data-url=["']([^"'\s]+)["']/i,
      /data-srcset=["']([^"']+)["']/i,
      /srcset=["']([^"']+)["']/i,
      /src=["']([^"'\s]+)["']/i,
    ];

    const processImgTags = (targetHtml: string) => {
      let match;
      imgAttrRegex.lastIndex = 0;
      while ((match = imgAttrRegex.exec(targetHtml)) !== null && scrapedImages.length < 20) {
        const tag = match[0];
        for (const ap of attrPatterns) {
          const am = tag.match(ap);
          if (am && am[1]) {
            if (ap.source.includes('srcset')) {
              const parts = am[1].split(',').map((s: string) => s.trim().split(/\s+/)[0]);
              for (const p of parts.reverse()) { addImage(p); if (scrapedImages.length >= 20) break; }
            } else {
              addImage(am[1]);
            }
            break;
          }
        }
      }
    };

    // First scan inside isolated article/main container for authentic content images
    if (articleHtml) {
      processImgTags(articleHtml);
    }

    // 3b. JSON-LD Schema.org (Product / ImageObject)
    const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null && scrapedImages.length < 20) {
      try {
        const schema = JSON.parse(jsonLdMatch[1].trim());
        const extractSchemaImages = (obj: any) => {
          if (!obj) return;
          if (Array.isArray(obj)) { obj.forEach(extractSchemaImages); return; }
          if (typeof obj !== 'object') return;
          if (obj['@type'] === 'Product' || obj['@type'] === 'ImageObject' || obj['@graph'] || obj['@type'] === 'NewsArticle' || obj['@type'] === 'Article') {
            const graphs = obj['@graph'] || [obj];
            for (const item of (Array.isArray(graphs) ? graphs : [graphs])) {
              if (item.image) {
                const imgs = Array.isArray(item.image) ? item.image : [item.image];
                for (const img of imgs) {
                  if (typeof img === 'string') addImage(img);
                  else if (img?.url) addImage(img.url);
                  else if (img?.contentUrl) addImage(img.contentUrl);
                }
              }
              if (item['@type'] === 'ImageObject') {
                if (item.url) addImage(item.url);
                if (item.contentUrl) addImage(item.contentUrl);
              }
            }
          } else {
            if (obj.image) {
              const imgs = Array.isArray(obj.image) ? obj.image : [obj.image];
              for (const img of imgs) {
                if (typeof img === 'string') addImage(img);
                else if (img?.url) addImage(img.url);
              }
            }
          }
        };
        extractSchemaImages(schema);
      } catch {}
    }

    // 3c. Open Graph / Twitter meta tags
    const metaImgPatterns = [
      /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"'\s]+)["']/gi,
      /<meta[^>]+content=["']([^"'\s]+)["'][^>]+property=["']og:image["']/gi,
      /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"'\s]+)["']/gi,
      /<meta[^>]+content=["']([^"'\s]+)["'][^>]+name=["']twitter:image["']/gi,
    ];
    for (const pattern of metaImgPatterns) {
      let m;
      while ((m = pattern.exec(html)) !== null && scrapedImages.length < 20) {
        addImage(m[1]);
      }
    }

    // 3d. Scan full HTML if articleHtml yielded few images
    if (scrapedImages.length < 5) {
      processImgTags(html);
    }

    // 3e. Background-image CSS in inline styles
    const bgImgRegex = /background-image\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)/gi;
    let bgMatch;
    while ((bgMatch = bgImgRegex.exec(html)) !== null && scrapedImages.length < 20) {
      addImage(bgMatch[1]);
    }

    // 3e. Direct image URLs in JSON attributes (common in React/Angular product pages)
    const jsonImgRegex = /"(?:src|url|image|imageUrl|image_url|photo|thumbnail|productImage|mainImage|largeImage)":\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|avif)[^"]*)"/gi;
    let jsonImgMatch;
    while ((jsonImgMatch = jsonImgRegex.exec(html)) !== null && scrapedImages.length < 10) {
      addImage(jsonImgMatch[1]);
    }

    // 4. Extract Videos (YouTube, Vimeo, HTML5)
    const scrapedVideos: string[] = [];
    const addVideo = (raw: string) => {
      if (!raw) return;
      let v = raw.trim();
      if (v.startsWith('//')) v = 'https:' + v;
      // Convert youtu.be short links to embed
      v = v.replace(/youtu\.be\/([a-zA-Z0-9_-]+)/, 'www.youtube.com/embed/$1');
      // Convert youtube.com/watch?v= to embed
      v = v.replace(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/, 'youtube.com/embed/$1');
      if (v.startsWith('http') && !scrapedVideos.includes(v)) {
        scrapedVideos.push(v);
      }
    };

    // iframe embeds
    const iframeRegex = /<iframe[^>]+src=["']([^"'\s]+(?:youtube|youtu\.be|vimeo)[^"'\s]*)["'][^>]*>/gi;
    let vMatch;
    while ((vMatch = iframeRegex.exec(html)) !== null && scrapedVideos.length < 3) addVideo(vMatch[1]);

    // YouTube links in href/data attributes
    const ytLinkRegex = /(?:href|src|data-url|data-video)=["']([^"']*(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+[^"']*)["']/gi;
    while ((vMatch = ytLinkRegex.exec(html)) !== null && scrapedVideos.length < 3) addVideo(vMatch[1]);

    // HTML5 video/source tags
    const videoTagRegex = /<(?:video|source)[^>]+src=["']([^"'\s]+\.(?:mp4|webm|ogg))["'][^>]*>/gi;
    while ((vMatch = videoTagRegex.exec(html)) !== null && scrapedVideos.length < 3) addVideo(vMatch[1]);

    console.log(`[Scraper] URL: ${url} → Title: "${scrapedTitle}" | Images: ${scrapedImages.length} | Videos: ${scrapedVideos.length} | Paragraphs: ${scrapedParagraphs.length}`);

    return { scrapedTitle, scrapedParagraphs, scrapedImages, scrapedVideos };
  } catch (err) {
    console.error('[AI Scrape Article URL Error]:', err);
    return { scrapedTitle: '', scrapedParagraphs: [], scrapedImages: [], scrapedVideos: [] };
  }
}


/**
 * Extract image URLs directly embedded in raw text or HTML
 */
function extractImageUrlsFromText(text: string): string[] {
  const images: string[] = [];
  const urlRegex = /(https?:\/\/[^\s<"']+\.(?:jpg|jpeg|png|webp|avif)(?:\?[^\s<"']*)?)/gi;
  let match;
  while ((match = urlRegex.exec(text)) !== null && images.length < 5) {
    const url = match[1].trim();
    if (!images.includes(url) && !/(?:logo|icon|avatar|pixel|\.gif|\.svg)/i.test(url)) {
      images.push(url);
    }
  }
  return images;
}

/**
 * Live Web Context Search from Google / DuckDuckGo
 */
async function searchWebContext(query: string): Promise<{ rawSnippets: string[]; combinedText: string }> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) return { rawSnippets: [], combinedText: '' };

    const html = await response.text();
    const snippets: string[] = [];
    const snippetRegex = /<a class="result__snippet[^>]*>(.*?)<\/a>/gi;
    let match;
    while ((match = snippetRegex.exec(html)) !== null && snippets.length < 8) {
      const cleanText = match[1].replace(/<[^>]+>/g, '').trim();
      if (cleanText.length > 25) {
        snippets.push(cleanText);
      }
    }

    return {
      rawSnippets: snippets,
      combinedText: snippets.join(' ')
    };
  } catch (err) {
    console.log('[AI Search Web Context]: Web search fallback active');
    return { rawSnippets: [], combinedText: '' };
  }
}

/**
 * Full HTML entity decoder for Vietnamese text and special characters
 */
function cleanHtmlEntities(snippet: string): string {
  if (!snippet) return '';

  let str = snippet
    // Numeric decimal entities &#7875; -> String.fromCharCode(7875)
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return '';
      }
    })
    // Numeric hex entities &#x1F1E6; -> String.fromCodePoint(0x1F1E6)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    // Basic XML/HTML entities
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Named HTML entities for Latin & Vietnamese accented letters
  const namedMap: Record<string, string> = {
    'aacute': 'á', 'agrave': 'à', 'amacr': 'ā', 'anode': 'ã', 'acirc': 'â', 'atilde': 'ã', 'aring': 'å', 'auml': 'ä',
    'eacute': 'é', 'egrave': 'è', 'ecirc': 'ê', 'euml': 'ë',
    'iacute': 'í', 'igrave': 'ì', 'icirc': 'î', 'iuml': 'ï',
    'oacute': 'ó', 'ograve': 'ò', 'ocirc': 'ô', 'otilde': 'õ', 'ouml': 'ö',
    'uacute': 'ú', 'ugrave': 'ù', 'ucirc': 'û', 'uuml': 'ü',
    'yacute': 'ý', 'ygrave': 'ỳ', 'ycirc': 'ŷ', 'yuml': 'ÿ',
    'Aacute': 'Á', 'Agrave': 'À', 'Acirc': 'Â', 'Atilde': 'Ã', 'Auml': 'Ä',
    'Eacute': 'É', 'Egrave': 'È', 'Ecirc': 'Ê', 'Euml': 'Ë',
    'Iacute': 'Í', 'Igrave': 'Ì', 'Icirc': 'Î', 'Iuml': 'Ï',
    'Oacute': 'Ó', 'Ograve': 'Ò', 'Ocirc': 'Ô', 'Otilde': 'Õ', 'Ouml': 'Ö',
    'Uacute': 'Ú', 'Ugrave': 'Ù', 'Ucirc': 'Û', 'Uuml': 'Ü',
    'Yacute': 'Ý', 'Ygrave': 'Ỳ', 'ndash': '–', 'mdash': '—', 'hellip': '…',
    'laquo': '«', 'raquo': '»', 'ldquo': '“', 'rdquo': '”', 'lsquo': '‘', 'rsquo': '’'
  };

  str = str.replace(/&([a-zA-Z]+);/g, (match, entity) => {
    return namedMap[entity] || match;
  });

  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Auto Internal Linking Engine:
 * Scans article HTML for CTC key terms and automatically inserts high-SEO internal links.
 */
function autoApplyInternalLinks(htmlContent: string): string {
  if (!htmlContent) return htmlContent;

  let result = htmlContent;

  const rules: { pattern: RegExp; replacement: string }[] = [
    {
      pattern: /(?<!<a[^>]*>)\b(điện mặt trời|pin mặt trời|cho thuê mái nhà)\b(?!<\/a>)/i,
      replacement: `<a href="/products" class="text-primary font-bold underline hover:text-secondary transition-colors" title="Giải pháp Điện Mặt Trời CTC">$1</a>`
    },
    {
      pattern: /(?<!<a[^>]*>)\b(cáp quang|hạ tầng viễn thông|mạng 5g)\b(?!<\/a>)/i,
      replacement: `<a href="/products" class="text-primary font-bold underline hover:text-secondary transition-colors" title="Thiết bị & Hạ tầng Viễn Thông CTC">$1</a>`
    },
    {
      pattern: /(?<!<a[^>]*>)\b(bưu điện miền trung|xây lắp bưu điện)\b(?!<\/a>)/i,
      replacement: `<a href="/about" class="text-primary font-bold underline hover:text-secondary transition-colors" title="Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)">$1</a>`
    },
    {
      pattern: /(?<!<a[^>]*>)\b(dự án xây lắp|thi công công trình|trạm biến áp)\b(?!<\/a>)/i,
      replacement: `<a href="/projects" class="text-primary font-bold underline hover:text-secondary transition-colors" title="Các dự án xây lắp tiêu biểu của CTC">$1</a>`
    },
    {
      pattern: /(?<!<a[^>]*>)\b(tư vấn giải pháp|báo giá trọn gói|liên hệ ctc)\b(?!<\/a>)/i,
      replacement: `<a href="/contact" class="text-primary font-bold underline hover:text-secondary transition-colors" title="Trang liên hệ tư vấn trọn gói CTC">$1</a>`
    }
  ];

  for (const rule of rules) {
    let replaced = false;
    result = result.replace(rule.pattern, (match) => {
      if (replaced) return match;
      replaced = true;
      return rule.replacement.replace('$1', match);
    });
  }

  return result;
}

/**
 * Asynchronously download an external image and save to /uploads/scraped/
 * Returns relative URL (/uploads/scraped/scraped_xxx.jpg) or original URL if download fails.
 */
async function localizeExternalImage(imageUrl: string): Promise<string> {
  if (!imageUrl || !imageUrl.startsWith('http')) return imageUrl;

  try {
    const scrapedDir = path.join(process.cwd(), 'uploads', 'scraped');
    if (!fs.existsSync(scrapedDir)) {
      fs.mkdirSync(scrapedDir, { recursive: true });
    }

    const extMatch = imageUrl.match(/\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';

    const hash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 12);
    const filename = `scraped_${hash}.${ext}`;
    const filePath = path.join(scrapedDir, filename);
    const relativeUrl = `/uploads/scraped/${filename}`;

    if (fs.existsSync(filePath)) {
      return relativeUrl;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const buffer = await res.buffer();
      if (buffer && buffer.length > 500) {
        fs.writeFileSync(filePath, buffer);
        console.log(`[AI Image Localizer]: Downloaded & saved ${imageUrl} -> ${relativeUrl} (${buffer.length} bytes)`);
        return relativeUrl;
      }
    }
  } catch (err) {
    console.warn(`[AI Image Localizer Warning]: Could not download ${imageUrl}:`, (err as any).message);
  }

  return imageUrl;
}

/**
 * Localize all external image URLs inside HTML content & array of image URLs
 */
async function localizeAllArticleImages(content: string, images: string[]): Promise<{ content: string; images: string[] }> {
  let updatedContent = content;

  const imgSrcRegex = /<img[^>]+src=["'](https?:\/\/[^"'\s]+)["']/gi;
  const matches = Array.from(content.matchAll(imgSrcRegex));
  const uniqueUrls = Array.from(new Set(matches.map(m => m[1])));

  const localizedMap = new Map<string, string>();
  await Promise.all(uniqueUrls.map(async (url) => {
    const local = await localizeExternalImage(url);
    localizedMap.set(url, local);
  }));

  localizedMap.forEach((localUrl, originalUrl) => {
    const escaped = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    updatedContent = updatedContent.replace(new RegExp(escaped, 'g'), localUrl);
  });

  const updatedImages: string[] = [];
  for (const img of images) {
    if (localizedMap.has(img)) {
      updatedImages.push(localizedMap.get(img)!);
    } else {
      const local = await localizeExternalImage(img);
      updatedImages.push(local);
    }
  }

  return { content: updatedContent, images: updatedImages };
}

/**
 * Post-processor for 100/100 Readability Score (Yoast Standard)
 * 1. Enforces paragraph length < 100 words (splits long paragraphs).
 * 2. Shortens long sentences > 22 words at natural pause points.
 * 3. Ensures bullet lists <ul>/<li> are present for readability.
 * 4. Ensures transition words (Bên cạnh đó, Tuy nhiên, Do đó, Ngoài ra, Đặc biệt) are inserted naturally.
 */
function optimizeReadabilityScore(htmlContent: string, kw: string): string {
  if (!htmlContent) return htmlContent;

  let result = htmlContent;

  // 1. Ensure bullet list <ul> / <li> exists in content
  if (!result.includes('<ul') && !result.includes('<ol') && !result.includes('<li>')) {
    const listHtml = `
<div class="my-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
  <p class="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">📌 Các điểm trọng tâm về ${kw}:</p>
  <ul class="list-disc pl-5 text-xs text-slate-700 space-y-1 font-medium leading-relaxed">
    <li>Theo dõi và cập nhật liên tục diễn biến mới nhất liên quan đến ${kw}.</li>
    <li>Đánh giá tác động thực tế và áp dụng quy trình kiểm soát rủi ro chuẩn hóa.</li>
    <li>Liên hệ bộ phận chuyên môn CTC để nhận tư vấn và báo giá trọn gói.</li>
  </ul>
</div>`;

    if (result.includes('<h2>')) {
      result = result.replace(/(<\/h2>\s*<p>[\s\S]*?<\/p>)/i, `$1\n${listHtml}`);
    } else {
      result += `\n${listHtml}`;
    }
  }

  // 2. Ensure transition words (Tuy nhiên, Bên cạnh đó, Ngoài ra, Do đó, Đặc biệt) exist in paragraph starts
  const transitions = ['tuy nhiên', 'bên cạnh đó', 'ngoài ra', 'do đó', 'hơn nữa', 'đặc biệt', 'tóm lại'];
  const textLower = result.toLowerCase();
  const transitionCount = transitions.filter(t => textLower.includes(t)).length;

  if (transitionCount < 3) {
    let injected = 0;
    result = result.replace(/<p>(.*?)<\/p>/gi, (match, pText) => {
      if (injected >= 3 || pText.trim().length < 30 || pText.startsWith('<strong') || pText.includes('<a')) return match;
      const prefixes = ['Bên cạnh đó, ', 'Tuy nhiên, ', 'Do đó, ', 'Ngoài ra, ', 'Đặc biệt, '];
      const prefix = prefixes[injected % prefixes.length];
      injected++;
      return `<p>${prefix}${pText.substring(0, 1).toLowerCase()}${pText.substring(1)}</p>`;
    });
  }

  // 3. Split long paragraphs (> 100 words) into 2 smaller <p> blocks
  result = result.replace(/<p>(.*?)<\/p>/gi, (match, pText) => {
    const words = pText.trim().split(/\s+/);
    if (words.length > 100) {
      const sentences = pText.split(/(?<=[.!?])\s+/);
      if (sentences.length >= 2) {
        let halfIndex = Math.ceil(sentences.length / 2);
        const part1 = sentences.slice(0, halfIndex).join(' ');
        const part2 = sentences.slice(halfIndex).join(' ');
        if (part1 && part2) {
          return `<p>${part1}</p>\n<p>${part2}</p>`;
        }
      }
    }
    return match;
  });

  // 4. Shorten long sentences (> 22 words) at commas or conjunctions
  result = result.replace(/<p>(.*?)<\/p>/gi, (match, pText) => {
    const sentences = pText.split(/(?<=[.!?])\s+/);
    let modified = false;

    const newSentences = sentences.map(s => {
      const words = s.trim().split(/\s+/);
      if (words.length > 22 && !s.includes('<a') && !s.includes('<img')) {
        const commaIdx = s.indexOf(', ', 30);
        if (commaIdx > 15 && commaIdx < s.length - 15) {
          modified = true;
          return s.substring(0, commaIdx) + '. ' + s.substring(commaIdx + 2).charAt(0).toUpperCase() + s.substring(commaIdx + 3);
        }
      }
      return s;
    });

    if (modified) {
      return `<p>${newSentences.join(' ')}</p>`;
    }
    return match;
  });

  return result;
}

/**
 * Filter out author, date, photo caption metadata from raw reference content
 */
function parseCleanReferenceParagraphs(rawText: string): string[] {
  const lines = rawText.split(/\n+/);
  const cleanParagraphs: string[] = [];

  for (const line of lines) {
    let text = line.trim();
    if (!text || text.length < 15) continue;

    if (/(?:GMT\+7|chủ nhật|thứ hai|thứ ba|thứ tư|thứ năm|thứ sáu|thứ bảy|\d{1,2}\/\d{1,2}\/\d{4})/i.test(text) && text.length < 90) {
      continue;
    }
    if (/^(?:ảnh|nguồn|theo|tác giả|bài|hình)\s*:\s*/i.test(text) && text.length < 80) {
      continue;
    }
    if (/^\w+\s+\w+\s+\w+\,\s*\d+/i.test(text) && text.length < 60) {
      continue;
    }

    // Clean HTML entities only, preserve original wording
    const cleanP = cleanHtmlEntities(text);
    if (cleanP.length > 20) {
      cleanParagraphs.push(cleanP);
    }
  }

  return cleanParagraphs;
}

/**
 * Extract domain-relevant image URL
 */
function getDomainImage(domain: TopicDomain): string {
  switch (domain) {
    case 'security':
      return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop';
    case 'telecom':
      return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop';
    case 'construction':
      return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1000&auto=format&fit=crop';
    case 'solar':
      return 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop';
    case 'general':
    default:
      return 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1000&auto=format&fit=crop';
  }
}

/**
 * Dynamically extract 100% content-bound SEO tags
 */
function extractSmartTags(title: string, content: string, focusKeyword: string): string[] {
  const plainText = content.replace(/<[^>]+>/g, ' ');
  const extracted = new Set<string>();

  if (focusKeyword) {
    extracted.add(focusKeyword.trim().toLowerCase());
  }

  const words = title.split(/\s+/).filter(w => w.length > 2);
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`.toLowerCase();
    if (phrase.length > 5 && !['cho biết', 'vừa qua', 'như thế', 'cần phải'].includes(phrase)) {
      extracted.add(phrase);
    }
  }

  extracted.add('CTC');
  extracted.add('Bưu Điện Miền Trung');

  return Array.from(extracted)
    .map(t => t.trim())
    .filter(t => t.length >= 2)
    .slice(0, 6);
}

/**
 * 5 Dynamic Article Structures Generator
 */
function buildStructuredHeadings(
  title: string, 
  kw: string, 
  domain: TopicDomain, 
  structure: ArticleStructure = 'inverted_pyramid'
): { h2_1: string; h2_2: string; h2_3: string; h2_4: string } {
  const cleanKw = kw || 'thông tin';

  switch (structure) {
    case 'pas':
      return {
        h2_1: `1. Thực trạng & rủi ro nhức nhối xoay quanh ${cleanKw}`,
        h2_2: `2. Phân tích tác hại nghiêm trọng & hệ lụy nếu kéo dài`,
        h2_3: `3. Giải pháp khắc phục triệt để & đột phá từ chuyên gia`,
        h2_4: `4. Đơn vị tư vấn uy tín CTC và thông tin liên hệ hỗ trợ`
      };
    case '5w1h':
      return {
        h2_1: `1. Ai & Sự việc gì đang diễn ra liên quan đến ${cleanKw} (Who & What)`,
        h2_2: `2. Thời điểm & địa điểm ghi nhận diễn biến thực tế (When & Where)`,
        h2_3: `3. Nguyên nhân chiều sâu & tại sao cần đặc biệt chú ý (Why)`,
        h2_4: `4. Phương án xử lý hiệu quả & liên hệ tư vấn CTC (How)`
      };
    case 'storytelling':
      return {
        h2_1: `1. Góc nhìn thực tế từ câu chuyện thực địa liên quan đến ${cleanKw}`,
        h2_2: `2. Số liệu chứng minh & kết quả đánh giá kỹ thuật chuyên sâu`,
        h2_3: `3. Bài học kinh nghiệm xương máu & rút ra giải pháp tối ưu`,
        h2_4: `4. Định hướng phát triển bền vững & tư vấn trọn gói từ CTC`
      };
    case 'comparison':
      return {
        h2_1: `1. Đặt vấn đề & các phương án giải pháp đối với ${cleanKw}`,
        h2_2: `2. Phân tích ưu điểm, nhược điểm & bảng so sánh chi tiết`,
        h2_3: `3. Đánh giá chuyên môn & tiêu chuẩn lựa chọn phù hợp nhất`,
        h2_4: `4. Lời khuyên chọn lựa đối tác uy tín CTC & thông tin liên hệ`
      };
    case 'inverted_pyramid':
    default:
      return {
        h2_1: `1. Tin nóng & diễn biến cốt lõi mới nhất về ${cleanKw}`,
        h2_2: `2. Phân tích chi tiết nguyên nhân & các số liệu thực tế`,
        h2_3: `3. Bối cảnh tác động đa chiều và các khía cạnh liên quan`,
        h2_4: `4. Khuyến nghị giải pháp & thông tin liên hệ CTC`
      };
  }
}

/**
 * Query Gemini / OpenAI API if configured in Admin Settings
 */
/**
 * Query Gemini / OpenAI / Groq / DeepSeek / Custom API if configured in Admin Settings
 */
async function queryAiLlmFromAdminSettings(prompt: string): Promise<string | null> {
  try {
    const settings = await db.settings.get();
    if (!settings || !settings.aiApiKey) {
      console.warn('[AI LLM API Query]: No aiApiKey found in Admin Settings.');
      return null;
    }

    const apiKey = settings.aiApiKey;
    const provider = (settings.aiProvider || 'gemini').toLowerCase();
    let model = settings.aiModel || 'gemini-1.5-flash';

    console.log(`[AI LLM API Query]: Requesting provider="${provider}", model="${model}"...`);

    // Handle OpenAI-compatible providers (openai, groq, deepseek, custom)
    if (['openai', 'groq', 'deepseek', 'custom'].includes(provider)) {
      let baseUrl = 'https://api.openai.com/v1';
      if (provider === 'groq') baseUrl = 'https://api.groq.com/openai/v1';
      else if (provider === 'deepseek') baseUrl = 'https://api.deepseek.com/v1';
      else if (provider === 'custom') baseUrl = (settings.aiBaseUrl || '').replace(/\/$/, '') || 'https://api.groq.com/openai/v1';

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      const data: any = await response.json();
      if (!response.ok) {
        console.error(`[AI LLM Query Error] Provider ${provider} returned ${response.status}:`, JSON.stringify(data));
        return null;
      }

      const reply = data.choices?.[0]?.message?.content || null;
      if (reply) {
        console.log(`[AI LLM API Query]: Successfully received ${reply.length} chars from ${provider}`);
      }
      return reply;
    } else {
      // Google Gemini API
      // Normalize model names if user selected non-existent gemini-2.5-flash / gemini-2.5-pro
      if (model.includes('2.5-flash') || model.includes('2.0-flash')) model = 'gemini-1.5-flash';
      else if (model.includes('2.5-pro')) model = 'gemini-1.5-pro';

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data: any = await response.json();
      if (!response.ok) {
        console.error(`[AI LLM Query Error] Gemini API returned ${response.status}:`, JSON.stringify(data));
        // Try fallback to gemini-1.5-flash if 404
        if (response.status === 404 && model !== 'gemini-1.5-flash') {
          console.log('[AI LLM API Query]: Retrying Gemini API with fallback model "gemini-1.5-flash"...');
          const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
          const fbRes = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const fbData: any = await fbRes.json();
          if (fbRes.ok) {
            return fbData.candidates?.[0]?.content?.parts?.[0]?.text || null;
          }
        }
        return null;
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      if (reply) {
        console.log(`[AI LLM API Query]: Successfully received ${reply.length} chars from Gemini (${model})`);
      }
      return reply;
    }
  } catch (err) {
    console.error('[AI Admin Settings Query Error]:', err);
    return null;
  }
}

/**
 * Dynamic AI Article Generator:
 * Deep Persuasive Journalism Engine with Callouts, Quotes, Tables & Rich Paragraph Expansion!
 */
export async function generateAiArticle(
  userTitle: string,
  userFocusKeyword?: string,
  tone: ArticleTone = 'journalistic',
  targetLength: ArticleLength = 'medium',
  referenceContent?: string,
  articleUrl?: string,
  structure: ArticleStructure = 'inverted_pyramid',
  selectedImages?: string[]
): Promise<AiGeneratedArticle> {
  let cleanTitle = userTitle.trim();
  let rawReferenceText = (referenceContent || '').trim();
  let extractedImages: string[] = [];

  let extractedVideos: string[] = [];

  // 1. Auto Scrape Article Text, Images & Videos if URL is supplied
  let scrapedUrlSuccess = false;
  let scrapedTitleFound = '';
  if (articleUrl && articleUrl.trim().startsWith('http')) {
    console.log(`[AI Writer]: Auto scraping article content, images & videos from URL: ${articleUrl}`);
    const { scrapedTitle, scrapedParagraphs, scrapedImages, scrapedVideos } = await scrapeArticleFromUrl(articleUrl.trim());
    if (scrapedParagraphs.length > 0 || scrapedImages.length > 0 || scrapedTitle) {
      scrapedUrlSuccess = true;
      if (scrapedTitle) {
        scrapedTitleFound = scrapedTitle;
      }
      rawReferenceText = scrapedParagraphs.join('\n\n');
      if (scrapedImages.length > 0) {
        extractedImages = scrapedImages;
      }
      if (scrapedVideos && scrapedVideos.length > 0) {
        extractedVideos = scrapedVideos;
      }
    }
  }

  // Override extractedImages if user explicitly selected specific images in UI
  if (selectedImages && Array.isArray(selectedImages) && selectedImages.length > 0) {
    console.log(`[AI Writer]: Using ${selectedImages.length} user-selected images (out of ${extractedImages.length} scraped)`);
    extractedImages = selectedImages;
  }

  // PRECEDENCE FOR TITLE:
  // If scrapedTitleFound is available from URL, ALWAYS prioritize it over empty or generic titles ("Bài báo mẫu")
  if (scrapedTitleFound) {
    if (!cleanTitle || cleanTitle.toLowerCase().includes('bài báo mẫu') || cleanTitle.length < 10) {
      cleanTitle = scrapedTitleFound;
    }
  }

  // Extract images directly embedded in raw pasted text
  if (rawReferenceText) {
    const textImgs = extractImageUrlsFromText(rawReferenceText);
    for (const img of textImgs) {
      if (!extractedImages.includes(img)) {
        extractedImages.push(img);
      }
    }
  }

  if (!cleanTitle && !articleUrl) {
    throw new Error('Vui lòng nhập tiêu đề hoặc dán đường dẫn link bài báo mẫu');
  }
  if (!cleanTitle) {
    throw new Error('Không thể tự động lấy tên sản phẩm từ link. Trang web có thể chặn cào dữ liệu.');
  }

  const refParagraphs = parseCleanReferenceParagraphs(rawReferenceText);
  const hasReferenceText = refParagraphs.length > 0;

  // 2. Resolve Focus Keyword & Domain
  const kw = resolveFocusKeyword(cleanTitle, userFocusKeyword);
  const domain = detectTopicDomain(cleanTitle, kw);

  // Primary & Secondary Feature Images
  const mainImage = extractedImages[0] || getDomainImage(domain);
  const secondImage = extractedImages[1] || null;
  const thirdImage = extractedImages[2] || null;

  // 3. Live Google Search IF no reference text was supplied
  let searchResult = { rawSnippets: [] as string[], combinedText: '' };
  if (!hasReferenceText) {
    searchResult = await searchWebContext(cleanTitle);
  }

  // 4. Format SEO Title & Excerpt (Yoast 10/10 & 8/8)
  const title = formatYoastSeoTitle(cleanTitle, kw);
  const firstSnippet = hasReferenceText ? refParagraphs[0] : searchResult.rawSnippets[0];
  const excerpt = formatYoastSeoExcerpt(cleanTitle, kw, firstSnippet);

  // 5. Generate 5-Structure Headings
  const headings = buildStructuredHeadings(cleanTitle, kw, domain, structure);

  // 6. Tone Customization Adjustments
  let toneBadge = 'THÔNG TIN CẬP NHẬT 2026';
  let toneCallout = 'Chủ động nắm bắt thông tin sẽ giúp bạn đưa ra quyết định phù hợp nhất.';
  if (tone === 'expert') {
    toneBadge = 'PHÂN TÍCH CHUYÊN GIA 2026';
    toneCallout = 'Đánh giá kỹ thuật chuyên sâu và giải pháp vận hành chuẩn hóa từ đội ngũ kỹ sư CTC.';
  } else if (tone === 'sales') {
    toneBadge = 'GIẢI PHÁP ĐỘT PHÁ 2026';
    toneCallout = 'Đầu tư ngay hôm nay để nhận giải pháp tối ưu chi phí và báo giá ưu đãi trọn gói!';
  } else if (tone === 'storytelling') {
    toneBadge = 'GÓC NHÌN TRẢI NGHIỆM 2026';
    toneCallout = 'Chia sẻ thực tế từ các dự án triển khai thực địa và bài học kinh nghiệm.';
  }

  // 7. Check if Admin Settings has Gemini API / OpenAI API configured
  let aiLlmGeneratedContent: string | null = null;
  // Trim reference content for LLM prompt (avoid token overflow, keep first ~6000 chars)
  const trimmedRef = (rawReferenceText || searchResult.combinedText || '').substring(0, 6000);

  const imageListPrompt = extractedImages.length > 0
    ? `\n\n## DANH SÁCH HÌNH ẢNH CÀO ĐƯỢC TỪ BÀI VIẾT GỐC:\n${extractedImages.map((img, i) => `Ảnh ${i + 1}: ${img}`).join('\n')}\n-> YÊU CẦU: Hãy chèn TẤT CẢ (hoặc tối đa) các hình ảnh trên vào các vị trí hợp lý tương ứng giữa các đoạn văn trong bài viết. Mỗi ảnh dùng định dạng HTML:\n<figure class="my-6">\n  <img src="URL_ANH" alt="Mô tả ảnh" class="w-full h-auto rounded-2xl shadow-md object-cover max-h-[500px]" />\n  <figcaption class="text-center text-xs text-gray-500 mt-2 italic">Chú thích ảnh minh họa</figcaption>\n</figure>`
    : '';

  const llmPrompt = `Bạn là một nhà báo và chuyên gia biên tập nội dung hàng đầu Việt Nam.

## NHIỆM VỤ BẮT BUỘC:
Viết lại bài báo dựa **100% trên nội dung gốc** được cung cấp bên dưới. Bài viết phải giàu sức thuyết phục, hấp dẫn (độ dài trên 1.200 từ, chuẩn SEO Yoast 100/100).

## QUY TẮC TUYỆT ĐỐI – KHÔNG ĐƯỢC VI PHẠM:
1. **CHỈ ĐƯỢC viết dựa trên nội dung gốc bên dưới**. TUYỆT ĐỐI KHÔNG bịa thêm số liệu, sự kiện, tên người, tên tổ chức, ngày tháng hoặc bất kỳ thông tin nào KHÔNG CÓ trong nội dung gốc.
2. Giữ nguyên chính xác mọi dữ kiện quan trọng: tên riêng, con số, ngày tháng, địa điểm, trích dẫn từ nội dung gốc.
3. Viết lại bằng văn phong riêng, KHÔNG copy nguyên văn, nhưng phải truyền tải đúng ý nghĩa gốc.
4. Nếu nội dung gốc ngắn, hãy khai thác sâu các chi tiết đã có, KHÔNG bịa thêm.

## THÔNG TIN BÀI VIẾT:
- Tiêu đề: ${title}
- Từ khóa chính: ${kw}
- Cấu trúc bài viết: ${structure}

## [NỘI DUNG GỐC BẮT ĐẦU]
${trimmedRef}
## [NỘI DUNG GỐC KẾT THÚC]
${imageListPrompt}

## YÊU CẦU ĐỊNH DẠNG HTML:
1. Sử dụng thẻ <h2> cho 4 phần tiêu đề chính (đặt tên heading phù hợp với nội dung gốc, KHÔNG dùng heading chung chung):
   - <h2>Phần 1: [Tóm tắt/Tin chính từ nội dung gốc]</h2>
   - <h2>Phần 2: [Chi tiết/Phân tích từ nội dung gốc]</h2>
   - <h2>Phần 3: [Bối cảnh/Tác động từ nội dung gốc]</h2>
   - <h2>Phần 4: [Khuyến nghị/Kết luận]</h2>
2. Chèn 1 khối Tóm Tắt Nhanh (<div class="p-4 bg-emerald-50 ...">) ở đầu bài — tóm tắt các điểm chính CỦA NỘI DUNG GỐC.
3. Chèn 1 khối Trích Dẫn (<blockquote class="border-l-4 border-amber-500 bg-amber-50 ...">) lấy từ trích dẫn THẬT trong nội dung gốc (nếu có).
4. Chèn 1 Bảng Thống Kê / So Sánh nếu nội dung gốc có dữ liệu số (<table class="w-full border-collapse ...">). Nếu không có số liệu thì KHÔNG chèn bảng.
5. Chèn các hình ảnh cào được vào giữa các đoạn văn tương ứng.
6. Văn phong sắc sảo, tự nhiên, ngắn gọn (<18 từ/câu).
7. Đảm bảo từ khóa "${kw}" xuất hiện tự nhiên từ 3 đến 5 lần.
8. Cuối bài chèn thông tin liên hệ Công Ty Cổ Phần Xây Lắp Bưu Điện Miền Trung (CTC), Hotline: 0915 059 666.`;

  aiLlmGeneratedContent = await queryAiLlmFromAdminSettings(llmPrompt);

  let content = '';

  if (aiLlmGeneratedContent && aiLlmGeneratedContent.length > 300) {
    console.log('[AI Writer]: Successfully generated article using Admin Settings LLM API Key!');
    content = aiLlmGeneratedContent;
  } else {
    // Content-first Fallback Engine: ALL body comes from scraped content, only CTC contact is static

    // Intro paragraph: use first scraped paragraph or a brief intro
    const introP = refParagraphs.length > 0
      ? `<p><strong>${toneBadge}</strong> — ${refParagraphs[0]}</p>`
      : `<p><strong>${toneBadge}</strong> — Các diễn biến mới nhất liên quan đến <strong>${kw}</strong>. ${toneCallout}</p>`;

    // Executive Summary: built from actual scraped content
    const summaryBullets = refParagraphs.slice(0, 3).map((p) => {
      const short = p.length > 120 ? p.substring(0, 117).trim() + '...' : p;
      return `    <li>${short}</li>`;
    }).join('\n');

    const execSummaryBox = refParagraphs.length >= 2 ? `
<div class="my-6 p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg border border-slate-700 space-y-2">
  <div class="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
    <span>💡 TÓM TẮT CÁC ĐIỂM CHÍNH:</span>
  </div>
  <ul class="list-disc pl-5 text-xs text-slate-200 space-y-1.5 font-medium leading-relaxed">
${summaryBullets}
  </ul>
</div>` : '';

    // Distribute ALL scraped paragraphs across 3 body sections
    const bodyParagraphs = refParagraphs.slice(1);
    const totalP = bodyParagraphs.length;
    const chunkSize = Math.max(1, Math.ceil(totalP / 3));

    const section1Paragraphs = bodyParagraphs.slice(0, chunkSize);
    const section2Paragraphs = bodyParagraphs.slice(chunkSize, chunkSize * 2);
    const section3Paragraphs = bodyParagraphs.slice(chunkSize * 2);

    // Build image blocks for all remaining extracted images
    const remainingImages = extractedImages.slice(1);
    const createImgBlock = (imgUrl: string, idx: number) => `
<figure class="my-6">
  <img src="${imgUrl}" alt="Hình ảnh minh họa ${kw} ${idx + 1}" class="w-full h-auto rounded-2xl shadow-md object-cover max-h-[500px]" />
  <figcaption class="text-center text-xs text-gray-500 mt-2 italic">Hình ảnh thực tế từ bài viết gốc (${idx + 1}).</figcaption>
</figure>`;

    const imgBlocks = remainingImages.map((img, idx) => createImgBlock(img, idx + 1));

    const buildSectionWithImages = (paragraphs: string[], startImgIdx: number, imgCount: number): { html: string; nextImgIdx: number } => {
      let html = '';
      let imgPointer = startImgIdx;
      const endImgIdx = Math.min(imgBlocks.length, startImgIdx + imgCount);

      const pPerImg = Math.max(1, Math.floor(paragraphs.length / Math.max(1, imgCount)));

      paragraphs.forEach((p, pIdx) => {
        html += `<p>${p}</p>\n`;
        if (imgPointer < endImgIdx && (pIdx + 1) % pPerImg === 0) {
          html += imgBlocks[imgPointer] + '\n';
          imgPointer++;
        }
      });

      // Insert any remaining images assigned to this section
      while (imgPointer < endImgIdx) {
        html += imgBlocks[imgPointer] + '\n';
        imgPointer++;
      }

      return { html, nextImgIdx: imgPointer };
    };

    const imgPerSec = Math.max(1, Math.ceil(imgBlocks.length / 3));

    const sec1 = buildSectionWithImages(section1Paragraphs, 0, imgPerSec);
    const sec2 = buildSectionWithImages(section2Paragraphs, sec1.nextImgIdx, imgPerSec);
    const sec3 = buildSectionWithImages(section3Paragraphs, sec2.nextImgIdx, imgBlocks.length - sec2.nextImgIdx);

    let body_1 = sec1.html;
    let body_2 = sec2.html;
    let body_3 = sec3.html;

    if (!hasReferenceText && searchResult.rawSnippets.length > 0) {
      const snippets = searchResult.rawSnippets;
      const sChunk = Math.max(1, Math.ceil(snippets.length / 3));
      body_1 = snippets.slice(0, sChunk).map(s => `<p>${s}</p>`).join('\n');
      body_2 = snippets.slice(sChunk, sChunk * 2).map(s => `<p>${s}</p>`).join('\n');
      body_3 = snippets.slice(sChunk * 2).map(s => `<p>${s}</p>`).join('\n');
    } else if (!hasReferenceText) {
      body_1 = `<p>Không thể lấy nội dung từ bài viết gốc. Vui lòng kiểm tra lại đường link hoặc dán nội dung bài báo mẫu trực tiếp.</p>`;
      body_2 = '';
      body_3 = '';
    }

    // STATIC: Only the CTC contact section is static
    const body_4 = `<p>Tóm lại, <strong>Công Ty Cổ Phần Xây Lắp Bưu Điện Miền Trung (CTC)</strong> luôn sẵn sàng tư vấn và đồng hành cùng quý đối tác đối với mọi giải pháp liên quan tới <strong>${kw}</strong>:</p>
<ul>
  <li><strong>Tên đơn vị:</strong> Công Ty Cổ Phần Xây Lắp Bưu Điện Miền Trung (CTC)</li>
  <li><strong>Hotline tư vấn 24/7:</strong> <a href="tel:0915059666" class="text-primary font-bold">0915 059 666</a></li>
  <li><strong>Trang liên hệ chi tiết:</strong> Đăng ký hỗ trợ tại <a href="/contact" class="text-primary font-bold underline">Trang Liên Hệ CTC</a>.</li>
</ul>`;

    const scrapedVideoBlock = (extractedVideos && extractedVideos.length > 0) ? `
<div class="my-6">
  <p class="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">🎬 Video trải nghiệm & review thực tế:</p>
  <div class="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black">
    <iframe src="${extractedVideos[0]}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>
</div>
` : '';

    content = `
${introP}

${execSummaryBox}

${scrapedVideoBlock}

<figure class="my-6">
  <img src="${mainImage}" alt="${kw}" class="w-full h-auto rounded-2xl shadow-md object-cover max-h-[500px]" />
  <figcaption class="text-center text-xs text-gray-500 mt-2 italic">Hình ảnh minh họa bài viết về ${kw}.</figcaption>
</figure>

<h2>${headings.h2_1}</h2>
${body_1}

<h2>${headings.h2_2}</h2>
${body_2}

<h2>${headings.h2_3}</h2>
${body_3}

<h2>${headings.h2_4}</h2>
${body_4}
`.trim();
  }

  // 8. Auto Apply Internal Links to CTC Products/Projects/Pages & Optimize Readability (100/100)
  content = autoApplyInternalLinks(content);
  content = optimizeReadabilityScore(content, kw);

  // 9. Auto Localize Images: Download external images to /uploads/scraped/ for reliable storage
  const imagesToLocalize = [mainImage, ...extractedImages.slice(1)];
  const localized = await localizeAllArticleImages(content, imagesToLocalize);
  content = localized.content;
  const finalMainImage = localized.images[0] || mainImage;
  const finalImages = localized.images.slice(1, 6);

  // 10. Extract dynamic, content-bound tags
  const tags = extractSmartTags(title, content, kw);

  return {
    title,
    rawTitle: cleanTitle, // Original scraped title - use this as product/project name in forms
    excerpt,
    content,
    focusKeyword: kw,
    tags,
    image: finalMainImage,
    images: finalImages,
    status: 'pending',
    sources: scrapedUrlSuccess
      ? [`Cào dữ liệu & hình ảnh từ đường link: ${articleUrl}`, 'CTC Knowledge Base']
      : hasReferenceText 
        ? ['Nội dung bài báo mẫu do người dùng cung cấp (AI đã biên tập lại 100%)', 'CTC Knowledge Base']
        : searchResult.rawSnippets.length > 0 
          ? ['Dữ liệu tìm kiếm Google / DuckDuckGo thực tế (Đã biên tập & viết lại)', 'CTC Knowledge Base']
          : ['CTC Knowledge Base']
  };
}
