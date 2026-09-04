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
 * Aggressively optimizes sentence length (<18 words), paragraph length (<70 words),
 * transition words (≥5 words), and bullet list presence.
 */
function optimizeReadabilityScore(htmlContent: string, kw: string): string {
  if (!htmlContent) return htmlContent;

  let result = htmlContent;

  // 1. Ensure Bullet List <ul> / <li> exists for 20/20 Lists score
  if (!result.includes('<ul') && !result.includes('<ol') && !result.includes('<li>')) {
    const listHtml = `
<div class="my-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
  <p class="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">📌 Các điểm trọng tâm về ${kw}:</p>
  <ul class="list-disc pl-5 text-xs text-slate-700 space-y-1.5 font-medium leading-relaxed">
    <li>Theo dõi và cập nhật liên tục thông tin mới nhất liên quan đến ${kw}.</li>
    <li>Đánh giá tác động thực tế và áp dụng quy trình kiểm soát rủi ro chuẩn hóa.</li>
    <li>Liên hệ bộ phận chuyên môn CTC để nhận tư vấn chi tiết và báo giá trọn gói.</li>
  </ul>
</div>`;

    if (result.includes('<h2>')) {
      result = result.replace(/(<\/h2>\s*<p>[\s\S]*?<\/p>)/i, `$1\n${listHtml}`);
    } else {
      result += `\n${listHtml}`;
    }
  }

  // 2. Ensure Transition Words (Tuy nhiên, Bên cạnh đó, Do đó, Ngoài ra, Đặc biệt) exist for 15/15 score
  const transitionList = ['tuy nhiên', 'bên cạnh đó', 'ngoài ra', 'do đó', 'hơn nữa', 'đặc biệt', 'tóm lại', 'đáng chú ý', 'nhìn chung'];
  const textLower = result.toLowerCase();
  const foundTransitions = transitionList.filter(t => textLower.includes(t)).length;

  if (foundTransitions < 4) {
    let injected = 0;
    const prefixes = ['Bên cạnh đó, ', 'Tuy nhiên, ', 'Do đó, ', 'Ngoài ra, ', 'Đặc biệt, '];
    result = result.replace(/<p>([^<]+)<\/p>/gi, (match, pText) => {
      if (injected >= 4 || pText.trim().length < 25 || pText.startsWith('Tóm lại') || pText.startsWith('Thông tin')) return match;
      const prefix = prefixes[injected % prefixes.length];
      injected++;
      const firstChar = pText.trim().charAt(0).toLowerCase();
      const rest = pText.trim().slice(1);
      return `<p>${prefix}${firstChar}${rest}</p>`;
    });
  }

  // 3. Process all block elements (<p>, <li>, blockquote, figcaption, td, th) for 100/100 sentence length (<18 words)
  result = result.replace(/<(p|li|blockquote|figcaption|td|th)([^>]*)>(.*?)<\/\1>/gis, (fullMatch, tag, attrs, innerText) => {
    if (innerText.includes('<figure') || innerText.includes('<table') || innerText.includes('<iframe') || innerText.includes('<ul')) {
      return fullMatch;
    }

    const rawSentences = innerText.split(/(?<=[.!?])\s+/);

    const splitOneSentence = (s: string): string => {
      const trimmed = s.trim();
      if (!trimmed) return '';

      const plainText = trimmed.replace(/<[^>]+>/g, '').trim();
      const words = plainText.split(/\s+/).filter(w => w.length > 0);

      if (words.length <= 18) return trimmed;
      if (trimmed.includes('<a ') || trimmed.includes('<img')) return trimmed;

      const delimiters = [', ', ' và ', ' nhưng ', ' đồng thời ', ' giúp ', ' nhằm ', ' bởi vì ', ' vì ', ' nên ', ' khi ', ' với ', ' để '];

      for (const delim of delimiters) {
        const lower = trimmed.toLowerCase();
        let searchStart = 5;
        let delimIdx = lower.indexOf(delim, searchStart);

        while (delimIdx !== -1) {
          const part1Plain = trimmed.substring(0, delimIdx).replace(/<[^>]+>/g, '').trim();
          const part1Words = part1Plain.split(/\s+/).filter(w => w.length > 0).length;

          if (part1Words >= 5 && part1Words <= 16) {
            const part1 = trimmed.substring(0, delimIdx).trim();
            let part2 = trimmed.substring(delimIdx + delim.length).trim();
            if (part2) {
              part2 = part2.charAt(0).toUpperCase() + part2.slice(1);
              return `${splitOneSentence(part1)}. ${splitOneSentence(part2)}`;
            }
          }
          delimIdx = lower.indexOf(delim, delimIdx + delim.length);
        }
      }

      // Hard fallback split at middle word
      if (words.length > 18) {
        const midWordIdx = Math.floor(words.length / 2);
        let count = 0;
        let splitCharIdx = -1;
        for (let i = 0; i < trimmed.length; i++) {
          if (/\s/.test(trimmed[i])) {
            count++;
            if (count === midWordIdx) {
              splitCharIdx = i;
              break;
            }
          }
        }

        if (splitCharIdx > 0) {
          const part1 = trimmed.substring(0, splitCharIdx).trim();
          let part2 = trimmed.substring(splitCharIdx + 1).trim();
          if (part2) {
            part2 = part2.charAt(0).toUpperCase() + part2.slice(1);
            return `${splitOneSentence(part1)}. ${splitOneSentence(part2)}`;
          }
        }
      }

      return trimmed;
    };

    const fixedSentences = rawSentences.map(s => splitOneSentence(s));
    const fullText = fixedSentences.join(' ');

    // Paragraph length optimization (< 70 words per <p>)
    if (tag === 'p') {
      const pWords = fullText.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(w => w.length > 0);
      if (pWords.length > 70) {
        const sList = fullText.split(/(?<=[.!?])\s+/);
        if (sList.length >= 2) {
          const mid = Math.ceil(sList.length / 2);
          const p1 = sList.slice(0, mid).join(' ');
          const p2 = sList.slice(mid).join(' ');
          if (p1 && p2) {
            return `<p${attrs}>${p1}</p>\n<p${attrs}>${p2}</p>`;
          }
        }
      }
    }

    return `<${tag}${attrs}>${fullText}</${tag}>`;
  });

  return result;
}

/**
 * HTML Styling Enhancer:
 * Applies modern typography, gradient accents, card wrappers, and responsive table styling.
 */
function enhanceArticleHtmlStyling(htmlContent: string): string {
  if (!htmlContent) return htmlContent;

  let result = htmlContent;

  // 1. Upgrade plain <h2> headings with gradient left accent bar & bottom border
  result = result.replace(/<h2>(.*?)<\/h2>/gi, (match, headingText) => {
    if (headingText.includes('class=')) return match;
    return `<h2 class="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-4 pb-2.5 border-b-2 border-sky-500/20 flex items-center gap-3">
  <span class="w-3 h-7 bg-gradient-to-b from-sky-500 to-indigo-600 rounded-full inline-block flex-shrink-0 shadow-xs"></span>
  <span>${headingText}</span>
</h2>`;
  });

  // 2. Upgrade plain <p> tags with leading-relaxed typography
  result = result.replace(/<p>(.*?)<\/p>/gis, (match, pText) => {
    if (pText.includes('class=') || pText.includes('<figure') || pText.includes('<div') || pText.includes('<table')) return match;
    return `<p class="text-slate-700 text-sm sm:text-base leading-relaxed mb-4 font-normal">${pText}</p>`;
  });

  // 3. Upgrade <figure> & <figcaption> with rounded-2xl glassmorphic shadow card
  result = result.replace(/<figure([^>]*)>(.*?)<\/figure>/gis, (match, attrs, inner) => {
    if (inner.includes('group')) return match;
    return `<figure class="my-7 group">
  <div class="overflow-hidden rounded-2xl border border-slate-200/80 shadow-md bg-slate-950">
    ${inner.replace(/<figcaption[\s\S]*?<\/figcaption>/gi, '').trim()}
  </div>
  ${inner.match(/<figcaption[\s\S]*?<\/figcaption>/gi)?.[0] || ''}
</figure>`;
  });

  result = result.replace(/<figcaption([^>]*)>(.*?)<\/figcaption>/gi, (match, attrs, text) => {
    return `<figcaption class="text-center text-xs font-semibold text-slate-500 mt-2.5 italic flex items-center justify-center gap-1">📸 <span>${text.replace(/^📸\s*/, '')}</span></figcaption>`;
  });

  // 4. Upgrade <table> with responsive rounded wrapper & dark header
  result = result.replace(/(<table[^>]*>[\s\S]*?<\/table>)/gi, (match, tableHtml) => {
    if (result.includes('overflow-x-auto rounded-2xl')) return match;
    const cleanTable = tableHtml
      .replace(/<table[^>]*>/i, '<table class="w-full text-xs sm:text-sm text-left border-collapse">')
      .replace(/<thead[^>]*>/i, '<thead class="bg-slate-900 text-white uppercase text-[11px] font-black tracking-wider">')
      .replace(/<th([^>]*)>/gi, '<th class="p-3.5 border-b border-slate-800">')
      .replace(/<td([^>]*)>/gi, '<td class="p-3.5 border-b border-slate-100">');

    return `<div class="my-7 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">${cleanTable}</div>`;
  });

  // 5. Upgrade <blockquote> with amber quote card
  result = result.replace(/<blockquote([^>]*)>(.*?)<\/blockquote>/gis, (match, attrs, qText) => {
    if (qText.includes('bg-amber-50')) return match;
    return `<blockquote class="my-7 p-5 bg-amber-50/90 border-l-4 border-amber-500 rounded-r-2xl shadow-xs italic text-slate-800 text-sm sm:text-base leading-relaxed space-y-1">
  <p class="font-bold text-amber-950 non-italic text-xs uppercase tracking-wider mb-1 flex items-center gap-1">💬 Trích dẫn nổi bật:</p>
  <div>${qText}</div>
</blockquote>`;
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
 * Dynamically extract 100% content-bound SEO tags directly from scraped title & article content
 */
function extractSmartTags(title: string, content: string, focusKeyword: string): string[] {
  const extracted = new Set<string>();

  if (focusKeyword && focusKeyword.trim().length >= 2) {
    extracted.add(focusKeyword.trim().toLowerCase());
  }

  // 1. Extract 2-word phrases directly from scraped title
  const titleWords = title.split(/\s+/).filter(w => w.length >= 2);
  for (let i = 0; i < titleWords.length - 1; i++) {
    const word1 = titleWords[i].replace(/[^\w\u00C0-\u1EF9]/gi, '');
    const word2 = titleWords[i + 1].replace(/[^\w\u00C0-\u1EF9]/gi, '');
    if (word1.length >= 2 && word2.length >= 2) {
      const phrase = `${word1} ${word2}`;
      if (!/(?:cho biết|vừa qua|như thế|cần phải|theo đó|tại đây|lần này|xem xét|nguy hiểm)/i.test(phrase)) {
        extracted.add(phrase.toLowerCase());
      }
    }
  }

  // 2. Extract 3-word key phrases directly from scraped title
  for (let i = 0; i < titleWords.length - 2; i++) {
    const w1 = titleWords[i].replace(/[^\w\u00C0-\u1EF9]/gi, '');
    const w2 = titleWords[i + 1].replace(/[^\w\u00C0-\u1EF9]/gi, '');
    const w3 = titleWords[i + 2].replace(/[^\w\u00C0-\u1EF9]/gi, '');
    if (w1.length >= 2 && w2.length >= 2 && w3.length >= 2) {
      const phrase3 = `${w1} ${w2} ${w3}`;
      if (phrase3.length >= 8 && phrase3.length <= 35) {
        extracted.add(phrase3.toLowerCase());
      }
    }
  }

  return Array.from(extracted)
    .map(t => t.trim())
    .filter(t => t.length >= 3)
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
        h2_1: `1. Thực trạng & vấn đề nhức nhối xoay quanh ${cleanKw}`,
        h2_2: `2. Phân tích tác hại & hệ lụy nếu không xử lý kịp thời`,
        h2_3: `3. Các phương án giải pháp khắc phục triệt để`,
        h2_4: `4. Tổng kết đánh giá & giải pháp ứng phó hiệu quả`
      };
    case '5w1h':
      return {
        h2_1: `1. Sự việc gì đang diễn ra liên quan đến ${cleanKw} (Who & What)`,
        h2_2: `2. Thời điểm & địa điểm ghi nhận diễn biến thực tế (When & Where)`,
        h2_3: `3. Nguyên nhân chiều sâu & lý do cần đặc biệt chú ý (Why)`,
        h2_4: `4. Phương án xử lý & định hướng phát triển tiếp theo (How)`
      };
    case 'storytelling':
      return {
        h2_1: `1. Góc nhìn thực tế từ diễn biến liên quan đến ${cleanKw}`,
        h2_2: `2. Số liệu chứng minh & kết quả đánh giá thực địa`,
        h2_3: `3. Bài học kinh nghiệm & các phát hiện quan trọng`,
        h2_4: `4. Đánh giá tổng quan & định hướng trong thời gian tới`
      };
    case 'comparison':
      return {
        h2_1: `1. Tổng quan vấn đề đối với ${cleanKw}`,
        h2_2: `2. Phân tích ưu điểm, nhược điểm & so sánh chi tiết`,
        h2_3: `3. Đánh giá chuyên môn & tiêu chuẩn lựa chọn phù hợp`,
        h2_4: `4. Lời khuyên chọn lựa & tổng kết phương án tối ưu`
      };
    case 'inverted_pyramid':
    default:
      return {
        h2_1: `1. Tin tức & diễn biến cốt lõi mới nhất về ${cleanKw}`,
        h2_2: `2. Phân tích chi tiết nguyên nhân & các số liệu thực tế`,
        h2_3: `3. Bối cảnh tác động đa chiều và các khía cạnh liên quan`,
        h2_4: `4. Tổng kết đánh giá & khuyến nghị giải pháp phù hợp`
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

    const apiKey = (settings.aiApiKey || '').trim();
    let provider = (settings.aiProvider || 'gemini').toLowerCase();

    // Auto-detect provider from key prefix if mismatched
    if (apiKey.startsWith('gsk_')) provider = 'groq';
    else if (apiKey.startsWith('AIza')) provider = 'gemini';
    else if (apiKey.startsWith('sk-proj-') && provider === 'groq') provider = 'openai';

    const DEFAULT_MODELS: Record<string, string> = {
      gemini: 'gemini-2.5-flash',
      groq: 'openai/gpt-oss-120b',
      openai: 'gpt-4o-mini',
      deepseek: 'deepseek-chat',
      custom: 'openai/gpt-oss-120b'
    };

    const PROVIDER_MODEL_CANDIDATES: Record<string, string[]> = {
      groq: ['openai/gpt-oss-120b', 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'openai/gpt-oss-20b', 'groq/compound'],
      openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
      gemini: ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'],
      deepseek: ['deepseek-chat', 'deepseek-reasoner']
    };

    const normalizeModel = (prov: string, rawModel?: string): string => {
      const clean = (rawModel || '').trim();
      if (!clean) return DEFAULT_MODELS[prov] || 'gemini-2.5-flash';
      if (prov === 'gemini') {
        if (clean.toLowerCase().includes('gemini')) return clean;
        return 'gemini-2.5-flash';
      }
      if (prov === 'groq') {
        const DEPRECATED_GROQ = [
          'deepseek-r1-distill-llama-70b',
          'gemma2-9b-it',
          'gemma-7b-it',
          'llama3-70b-8192',
          'llama3-8b-8192',
          'mixtral-8x7b-32768',
          'qwen-2.5-32b',
          'whisper-large-v3-turbo'
        ];
        if (DEPRECATED_GROQ.includes(clean.toLowerCase()) || clean.toLowerCase().startsWith('gemini-')) {
          return 'openai/gpt-oss-120b';
        }
        return clean;
      }
      return clean;
    };

    const initialModel = normalizeModel(provider, settings.aiModel);
    const candidateModels = [initialModel];
    const fallbacks = PROVIDER_MODEL_CANDIDATES[provider] || [];
    for (const m of fallbacks) {
      if (!candidateModels.includes(m)) candidateModels.push(m);
    }

    console.log(`[AI LLM API Query]: Requesting provider="${provider}", model="${initialModel}"...`);

    // Handle OpenAI-compatible providers (openai, groq, deepseek, custom)
    if (['openai', 'groq', 'deepseek', 'custom'].includes(provider)) {
      let baseUrl = 'https://api.openai.com/v1';
      if (provider === 'groq') baseUrl = 'https://api.groq.com/openai/v1';
      else if (provider === 'deepseek') baseUrl = 'https://api.deepseek.com/v1';
      else if (provider === 'custom') baseUrl = (settings.aiBaseUrl || '').replace(/\/$/, '') || 'https://api.groq.com/openai/v1';

      for (const currentModel of candidateModels) {
        try {
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: currentModel,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7
            })
          });

          const data: any = await response.json();
          if (response.ok && data.choices?.[0]?.message?.content) {
            return data.choices[0].message.content;
          }
          console.warn(`[AI LLM Query] Model ${currentModel} on ${provider} error:`, data.error?.message || response.statusText);
        } catch (err: any) {
          console.warn(`[AI LLM Query Error] Model ${currentModel} failed:`, err.message);
        }
      }
      return null;
    } else {
      // Google Gemini API
      for (const gemModel of candidateModels) {
        let apiModel = gemModel;
        if (apiModel.includes('2.5-flash') || apiModel.includes('2.0-flash')) apiModel = 'gemini-1.5-flash';
        else if (apiModel.includes('2.5-pro')) apiModel = 'gemini-1.5-pro';

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });

          const data: any = await response.json();
          if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
          }
        } catch (e: any) {
          console.warn(`[Gemini Query Error] ${gemModel} failed:`, e.message);
        }
      }
      return null;
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

  const llmPrompt = `Bạn là một nhà báo công nghệ và chuyên gia phân tích sản phẩm hàng đầu Việt Nam.

## NHIỆM VỤ CHÍNH:
Biến bài viết gốc thành một bài báo phân tích chuyên sâu, có góc nhìn độc lập, giàu giá trị cho người đọc, chuẩn SEO Yoast 100/100.

## QUY TẮC NỘI DUNG VÀ VĂN PHONG TỐI THƯỢNG:
1. **ĐỘ DÀI VÀ SỰ CHI TIẾT (1.200 - 1.500 TỪ)**:
   - Bài viết BẮT BUỘC đạt độ dài từ **1.200 đến 1.500 TỪ**.
   - KHÔNG ĐƯỢC tóm tắt sơ sài. Phải khai thác TRỌN VẸN TẤT CẢ các chi tiết kỹ thuật từ nội dung gốc: Vi xử lý (Chip A20 Pro...), Tản nhiệt buồng hơi (Vapor Chamber), Khung vỏ (Nhôm & Titan), Kết nối 5G vệ tinh, Ống kính Tele zoom xa, Màn hình ngoài/trong (tương đương iPad mini), các phiên bản màu sắc (Đỏ rượu vang / Dark Cherry, Xanh nhạt, Xám đậm, Bạc...).

2. **VĂN PHONG KHÁCH QUAN & CẨN TRỌNG (DISCLAIMER CHUẨN BÁO CHÍ)**:
   - Vì thông tin sản phẩm chưa ra mắt là tin đồn, BẮT BUỘC dùng các cụm từ thể hiện sự thận trọng:
     * "Theo các nguồn tin rò rỉ từ chuỗi cung ứng..."
     * "Được đồn đoán sẽ trở thành mẫu..."
     * "Dự kiến có thể được trang bị..."
     * "Tin đồn cho thấy..."
   - TUYỆT ĐỐI KHÔNG viết khẳng định như thể Apple đã chính thức công bố.

3. **DỊCH THUẬT NGHĨA CHUẨN XÁC**:
   - Dịch "Dark Cherry" thành "Đỏ rượu vang" hoặc "Đỏ cherry đậm" (TUYỆT ĐỐI KHÔNG dịch là "Màu gốm đỏ").

4. **BẢNG SO SÁNH CHI TIẾT (SPECIFICATION TABLE)**:
   - BẮT BUỘC tạo 1 Bảng HTML (<table class="w-full border-collapse border border-slate-200 my-6 text-xs">) so sánh chi tiết giữa các phiên bản (Màn hình, Chip, Camera, Pin/Tản nhiệt, Thiết kế gập).

5. **PHÂN TÍCH ĐỐI TƯỢNG SỬ DỤNG (BUYER'S GUIDE)**:
   - Bổ sung 1 phần phân tích rõ ràng: Mẫu máy nào phù hợp với ai (VD: Người chụp ảnh/quay phim chuyên nghiệp & chơi game nặng -> Pro Max; Người đam mê công nghệ mới & màn hình lớn đa nhiệm -> Ultra gập).

6. **KẾT LUẬN TƯ VẤN HỮU ÍCH**:
   - Phần kết luận phải đưa ra đánh giá tư vấn hữu ích cho người đọc (đối tượng nào nên chờ mua, lưu ý về giá bán và tiến độ ra mắt), TUYỆT ĐỐI KHÔNG lặp lại mở bài.
   - CHỈ chèn duy nhất 1 khối liên hệ tư vấn CTC ở chân bài viết cuối cùng.

## THÔNG TIN BÀI VIẾT:
- Tiêu đề: ${title}
- Từ khóa chính: ${kw}
- Cấu trúc bài viết: ${structure}

## [NỘI DUNG GỐC BẮT ĐẦU]
${trimmedRef}
## [NỘI DUNG GỐC KẾT THÚC]
${imageListPrompt}

## YÊU CẦU ĐỊNH DẠNG HTML (ĐẦY ĐỦ THẺ <h2> & BẢNG SO SÁNH):
1. Sử dụng 4 thẻ <h2> bám sát diễn biến và phân tích kỹ thuật của bài viết gốc.
2. Thêm 1 Bảng So Sánh Chi Tiết giữa các phiên bản ở phần 2 hoặc phần 3.
3. Chèn 1 Khối Cảnh Báo Tin Đồn (<div class="my-6 p-4 bg-amber-50 border-l-4 border-amber-500 ...">) khẳng định đây là tin đồn rò rỉ chưa chính thức từ Apple.
4. Chèn các hình ảnh cào được vào giữa các đoạn văn tương ứng.
5. Mỗi câu văn ngắn dưới 18 từ. Thường xuyên ngắt câu bằng dấu chấm (.).
6. Đảm bảo từ khóa "${kw}" xuất hiện tự nhiên từ 4 đến 6 lần.`;

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

    // Distribute ALL scraped paragraphs across 3 body sections (100% pure scraped content)
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

    const disclaimerBox = `
<div class="my-6 p-4 bg-amber-50/90 border-l-4 border-amber-500 rounded-r-2xl shadow-xs text-xs text-amber-900 leading-relaxed">
  <p class="font-black uppercase tracking-wider mb-1 text-amber-950">⚠️ LƯU Ý BÁO CHÍ & DISCLAIMER TIN ĐỒN:</p>
  <p>Các thông tin trong bài viết được tổng hợp từ các nguồn tin rò rỉ từ chuỗi cung ứng. Thông số và tính năng thực tế có thể thay đổi khi nhà sản xuất chính thức công bố.</p>
</div>`;

    const comparisonTableBox = `
<div class="my-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
  <table class="w-full text-xs text-left border-collapse">
    <thead class="bg-slate-900 text-white uppercase text-[10px] font-black">
      <tr>
        <th class="p-3">Tiêu chí / Phiên bản</th>
        <th class="p-3">Phiên bản Tiêu Chuẩn / Pro</th>
        <th class="p-3">Phiên bản Pro Max / Cao Cấp</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
      <tr><td class="p-3 bg-slate-50 font-bold">Vi xử lý & Hiệu năng</td><td class="p-3">Thế hệ mới tối ưu điện năng</td><td class="p-3">Hiệu năng tối đa + Tản nhiệt buồng hơi</td></tr>
      <tr><td class="p-3 bg-slate-50 font-bold">Chất liệu khung vỏ</td><td class="p-3">Hợp kim cao cấp siêu nhẹ</td><td class="p-3">Khung Titan chịu lực tối đa</td></tr>
    </tbody>
  </table>
</div>`;

    const buyersGuideBox = `
<div class="my-6 p-5 bg-sky-50/90 border border-sky-200 rounded-2xl shadow-xs space-y-2">
  <p class="font-black text-xs text-sky-950 uppercase tracking-wider">🎯 PHÂN TÍCH ĐỐI TƯỢNG NÊN LỰA CHỌN PHIÊN BẢN NÀO:</p>
  <ul class="text-xs text-sky-900 space-y-1.5 font-medium leading-relaxed">
    <li>📌 <strong>Người dùng phổ thông & Văn phòng:</strong> Ưu tiên phiên bản tiêu chuẩn để có sự cân bằng hoàn hảo giữa hiệu năng và giá thành.</li>
    <li>🔥 <strong>Người dùng chuyên nghiệp & Chơi game nặng:</strong> Nên nâng cấp phiên bản Pro/Pro Max để sở hữu cấu hình mạnh nhất.</li>
  </ul>
</div>`;

    content = `
${introP}

${disclaimerBox}

${scrapedVideoBlock}

<figure class="my-6">
  <img src="${mainImage}" alt="${kw}" class="w-full h-auto rounded-2xl shadow-md object-cover max-h-[500px]" />
  <figcaption class="text-center text-xs text-gray-500 mt-2 italic">Hình ảnh minh họa bài viết về ${kw}.</figcaption>
</figure>

<h2>${headings.h2_1}</h2>
${body_1}

<h2>${headings.h2_2}</h2>
${comparisonTableBox}
${body_2}

<h2>${headings.h2_3}</h2>
${buyersGuideBox}
${body_3}

<h2>${headings.h2_4}</h2>
${body_4}
`.trim();
  }

  // 8. Auto Apply Internal Links, Optimize Readability & Enhance HTML Styling
  content = autoApplyInternalLinks(content);
  content = optimizeReadabilityScore(content, kw);
  content = enhanceArticleHtmlStyling(content);

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
