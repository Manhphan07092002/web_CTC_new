import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { db } from '../../services/db-mongodb';

export type ProductStyle = 'technical' | 'sales' | 'comparison';
export type ProductLength = 'standard' | 'deep';

export interface ScrapedProductData {
  scrapedTitle: string;
  scrapedParagraphs: string[];
  scrapedImages: string[];
  scrapedVideos: string[];
  specifications: { [key: string]: string };
  rawText: string;
}

export interface AiGeneratedProduct {
  name: string;
  code?: string;
  focusKeyword: string;
  tags: string[];
  shortDescription: string;
  description: string;
  specifications: string;
  power?: number;
  efficiency?: number;
  warranty?: string;
  features?: string[];
  technicalSpecs?: { [key: string]: string };
  image?: string;
  images?: string[];
  status: string;
  sources: string[];
}

/**
 * Clean HTML Entities in Vietnamese text
 */
function cleanHtmlEntities(str: string): string {
  if (!str) return '';
  let text = str
    .replace(/&#(\d+);/g, (_, dec) => {
      try { return String.fromCharCode(parseInt(dec, 10)); } catch { return ''; }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try { return String.fromCodePoint(parseInt(hex, 16)); } catch { return ''; }
    })
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  const namedMap: Record<string, string> = {
    'aacute': 'á', 'agrave': 'à', 'acirc': 'â', 'atilde': 'ã', 'auml': 'ä',
    'eacute': 'é', 'egrave': 'è', 'ecirc': 'ê', 'euml': 'ë',
    'iacute': 'í', 'igrave': 'ì', 'icirc': 'î', 'iuml': 'ï',
    'oacute': 'ó', 'ograve': 'ò', 'ocirc': 'ô', 'otilde': 'õ', 'ouml': 'ö',
    'uacute': 'ú', 'ugrave': 'ù', 'ucirc': 'û', 'uuml': 'ü',
    'yacute': 'ý', 'ygrave': 'ỳ', 'Aacute': 'Á', 'Eacute': 'É', 'Iacute': 'Í',
    'Oacute': 'Ó', 'Uacute': 'Ú', 'Yacute': 'Ý', 'ndash': '–', 'mdash': '—'
  };

  text = text.replace(/&([a-zA-Z]+);/g, (match, entity) => namedMap[entity] || match);
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Scrape Product Details from URL using Regex & Clean HTML extraction
 */
export async function scrapeProductFromUrl(url: string): Promise<ScrapedProductData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[Product Scraper] HTTP ${response.status} for URL: ${url}`);
      return { scrapedTitle: '', scrapedParagraphs: [], scrapedImages: [], scrapedVideos: [], specifications: {}, rawText: '' };
    }

    const html = await response.text();

    // 1. Scrape Product Title
    let scrapedTitle = '';
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
      || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

    if (ogTitleMatch) {
      scrapedTitle = ogTitleMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    scrapedTitle = cleanHtmlEntities(scrapedTitle.replace(/\s*[|–—-]\s*.{0,60}$/, '').trim());

    // 2. Scrape Images
    const scrapedImages: string[] = [];
    const addImg = (src?: string | null) => {
      if (!src || src.startsWith('data:') || src.length < 10) return;
      if (/(?:logo|icon|avatar|pixel|\.gif|\.svg|banner|promo|quang-cao|discount)/i.test(src)) return;
      try {
        const absoluteUrl = new URL(src, url).href;
        if (!scrapedImages.includes(absoluteUrl) && scrapedImages.length < 15) {
          scrapedImages.push(absoluteUrl);
        }
      } catch {}
    };

    const ogImgMatches = html.matchAll(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/gi);
    for (const m of ogImgMatches) addImg(m[1]);

    const imgMatches = html.matchAll(/<img[^>]+(?:data-zoom-image|data-original|data-lazy-src|data-src|src)=["']([^"']+)["']/gi);
    for (const m of imgMatches) addImg(m[1]);

    // 3. Scrape Product Paragraphs & Specs Table
    const scrapedParagraphs: string[] = [];
    const specifications: { [key: string]: string } = {};

    const trMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const trMatch of trMatches) {
      const trContent = trMatch[1];
      const cellMatches = Array.from(trContent.matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi));
      if (cellMatches.length >= 2) {
        const key = cleanHtmlEntities(cellMatches[0][1].replace(/<[^>]+>/g, '').trim());
        const val = cleanHtmlEntities(cellMatches[1][1].replace(/<[^>]+>/g, '').trim());
        if (key && val && key.length < 50 && val.length < 200) {
          specifications[key] = val;
        }
      }
    }

    const cleanHtml = html
      .replace(/<(?:script|style|noscript|svg|header|footer|nav)[^>]*>[\s\S]*?<\/(?:script|style|noscript|svg|header|footer|nav)>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    const pMatches = cleanHtml.matchAll(/<(?:p|li|h2|h3|h4)[^>]*>([\s\S]*?)<\/(?:p|li|h2|h3|h4)>/gi);
    for (const pMatch of pMatches) {
      const text = cleanHtmlEntities(pMatch[1].replace(/<[^>]+>/g, '').trim());
      if (text.length > 25 && !scrapedParagraphs.includes(text)) {
        if (!/(?:bản quyền|copyright|cookie|liên hệ mua hàng|giỏ hàng|đặt hàng ngay)/i.test(text)) {
          scrapedParagraphs.push(text);
        }
      }
    }

    // 4. Scrape Videos
    const scrapedVideos: string[] = [];
    const iframeMatches = html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi);
    for (const iframeMatch of iframeMatches) {
      const src = iframeMatch[1];
      if (/youtube|vimeo/i.test(src) && scrapedVideos.length < 3) {
        let v = src.startsWith('//') ? 'https:' + src : src;
        v = v.replace(/youtu\.be\/([a-zA-Z0-9_-]+)/, 'youtube.com/embed/$1');
        v = v.replace(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/, 'youtube.com/embed/$1');
        scrapedVideos.push(v);
      }
    }

    return {
      scrapedTitle,
      scrapedParagraphs,
      scrapedImages,
      scrapedVideos,
      specifications,
      rawText: scrapedParagraphs.slice(0, 30).join('\n\n')
    };
  } catch (err: any) {
    console.error('[Product Scraper Error]:', err.message || err);
    return { scrapedTitle: '', scrapedParagraphs: [], scrapedImages: [], scrapedVideos: [], specifications: {}, rawText: '' };
  }
}

/**
 * Asynchronously download an external image and save to /uploads/scraped/
 */
async function localizeExternalImage(imageUrl: string): Promise<string> {
  if (!imageUrl || !imageUrl.startsWith('http')) return imageUrl;

  try {
    const scrapedDir = path.join(process.cwd(), 'uploads', 'scraped');
    if (!fs.existsSync(scrapedDir)) {
      fs.mkdirSync(scrapedDir, { recursive: true });
    }

    const extMatch = imageUrl.match(/\.(jpg|jpeg|png|webp|avif)(?:\?.*)?$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const filename = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(scrapedDir, filename);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return imageUrl;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/scraped/${filename}`;
  } catch (err: any) {
    console.warn(`[Localize Product Image Error]: Could not download ${imageUrl}:`, err.message || err);
    return imageUrl;
  }
}

async function localizeAllProductImages(htmlContent: string, images: string[]): Promise<{ content: string; images: string[] }> {
  let updatedContent = htmlContent;
  const updatedImages: string[] = [];

  for (const imgUrl of images) {
    if (!imgUrl || !imgUrl.startsWith('http')) {
      updatedImages.push(imgUrl);
      continue;
    }

    const localPath = await localizeExternalImage(imgUrl);
    updatedImages.push(localPath);

    if (localPath !== imgUrl) {
      const escapedUrl = imgUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      updatedContent = updatedContent.replace(new RegExp(escapedUrl, 'g'), localPath);
    }
  }

  return { content: updatedContent, images: updatedImages };
}

/**
 * 100/100 Readability Sentence & Paragraph Splitter
 */
function optimizeReadabilityScore(htmlContent: string): string {
  if (!htmlContent) return htmlContent;

  let result = htmlContent;

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
 * Product HTML Styling Enhancer
 */
function enhanceProductHtmlStyling(htmlContent: string): string {
  if (!htmlContent) return htmlContent;

  let result = htmlContent;

  result = result.replace(/<h2>(.*?)<\/h2>/gi, (match, headingText) => {
    if (headingText.includes('class=')) return match;
    return `<h2 class="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-4 pb-2.5 border-b-2 border-emerald-500/20 flex items-center gap-3">
  <span class="w-3 h-7 bg-gradient-to-b from-emerald-500 to-sky-600 rounded-full inline-block flex-shrink-0 shadow-xs"></span>
  <span>${headingText}</span>
</h2>`;
  });

  result = result.replace(/<p>(.*?)<\/p>/gis, (match, pText) => {
    if (pText.includes('class=') || pText.includes('<figure') || pText.includes('<div') || pText.includes('<table')) return match;
    return `<p class="text-slate-700 text-sm sm:text-base leading-relaxed mb-4 font-normal">${pText}</p>`;
  });

  result = result.replace(/<figure([^>]*)>(.*?)<\/figure>/gis, (match, attrs, inner) => {
    if (inner.includes('group')) return match;
    return `<figure class="my-7 group">
  <div class="overflow-hidden rounded-2xl border border-slate-200/80 shadow-md bg-slate-950">
    ${inner.replace(/<figcaption[\s\S]*?<\/figcaption>/gi, '').trim()}
  </div>
  ${inner.match(/<figcaption[\s\S]*?<\/figcaption>/gi)?.[0] || ''}
</figure>`;
  });

  result = result.replace(/(<table[^>]*>[\s\S]*?<\/table>)/gi, (match, tableHtml) => {
    if (result.includes('overflow-x-auto rounded-2xl')) return match;
    const cleanTable = tableHtml
      .replace(/<table[^>]*>/i, '<table class="w-full text-xs sm:text-sm text-left border-collapse">')
      .replace(/<thead[^>]*>/i, '<thead class="bg-slate-900 text-white uppercase text-[11px] font-black tracking-wider">')
      .replace(/<th([^>]*)>/gi, '<th class="p-3.5 border-b border-slate-800">')
      .replace(/<td([^>]*)>/gi, '<td class="p-3.5 border-b border-slate-100 font-medium">');

    return `<div class="my-7 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">${cleanTable}</div>`;
  });

  return result;
}

/**
 * 100% Content-Bound Tags Extractor for Products
 */
function extractProductTags(name: string, content: string, focusKeyword: string): string[] {
  const extracted = new Set<string>();

  if (focusKeyword && focusKeyword.trim().length >= 2) {
    extracted.add(focusKeyword.trim().toLowerCase());
  }

  const nameWords = name.split(/\s+/).filter(w => w.length >= 2);
  for (let i = 0; i < nameWords.length - 1; i++) {
    const word1 = nameWords[i].replace(/[^\w\u00C0-\u1EF9]/gi, '');
    const word2 = nameWords[i + 1].replace(/[^\w\u00C0-\u1EF9]/gi, '');
    if (word1.length >= 2 && word2.length >= 2) {
      const phrase = `${word1} ${word2}`;
      if (!/(?:chính hãng|giá rẻ|cao cấp|uy tín|tốt nhất|mới nhất)/i.test(phrase)) {
        extracted.add(phrase.toLowerCase());
      }
    }
  }

  for (let i = 0; i < nameWords.length - 2; i++) {
    const w1 = nameWords[i].replace(/[^\w\u00C0-\u1EF9]/gi, '');
    const w2 = nameWords[i + 1].replace(/[^\w\u00C0-\u1EF9]/gi, '');
    const w3 = nameWords[i + 2].replace(/[^\w\u00C0-\u1EF9]/gi, '');
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
 * LLM Query Helper
 */
async function queryAiLlmFromAdminSettings(prompt: string): Promise<string | null> {
  try {
    const settings = await db.settings.get();
    if (!settings || !settings.aiApiKey) return null;

    const apiKey = (settings.aiApiKey || '').trim();
    let provider = (settings.aiProvider || 'gemini').toLowerCase();

    // Auto-detect provider from key prefix if mismatched
    if (apiKey.startsWith('gsk_')) provider = 'groq';
    else if (apiKey.startsWith('AIza')) provider = 'gemini';
    else if (apiKey.startsWith('sk-proj-') && provider === 'groq') provider = 'openai';

    const DEFAULT_MODELS: Record<string, string> = {
      gemini: 'gemini-2.5-flash',
      groq: 'llama-3.3-70b-versatile',
      openai: 'gpt-4o-mini',
      deepseek: 'deepseek-chat',
      custom: 'llama-3.3-70b-versatile'
    };

    const PROVIDER_MODEL_CANDIDATES: Record<string, string[]> = {
      groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192', 'deepseek-r1-distill-llama-70b', 'mixtral-8x7b-32768'],
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
      if (prov === 'openai') {
        if (clean.startsWith('gpt-') || clean.startsWith('o1-') || clean.startsWith('o3-')) return clean;
        return 'gpt-4o-mini';
      }
      if (prov === 'deepseek') {
        if (clean.startsWith('deepseek-')) return clean;
        return 'deepseek-chat';
      }
      if (prov === 'groq') {
        if (clean.startsWith('gemini-') || clean.startsWith('gpt-')) return 'llama-3.3-70b-versatile';
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
        } catch (err: any) {
          console.warn(`[ProductWriter Query] Model ${currentModel} error:`, err.message);
        }
      }
      return null;
    } else {
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
          console.warn(`[ProductWriter Gemini Query] ${gemModel} error:`, e.message);
        }
      }
      return null;
    }
  } catch (err: any) {
    console.error('[Product AI LLM Query Error]:', err.message || err);
    return null;
  }
}

/**
 * Main Product AI Generator
 */
export async function generateAiProduct(
  userProductName: string,
  userProductCode?: string,
  userFocusKeyword?: string,
  style: ProductStyle = 'technical',
  targetLength: ProductLength = 'deep',
  sampleText?: string,
  productUrl?: string,
  selectedImages?: string[]
): Promise<AiGeneratedProduct> {
  let cleanName = userProductName.trim();
  let rawText = (sampleText || '').trim();
  let extractedImages: string[] = [];
  let extractedVideos: string[] = [];
  let scrapedSpecs: { [key: string]: string } = {};

  let scrapedUrlSuccess = false;
  let scrapedTitleFound = '';

  if (productUrl && productUrl.trim().startsWith('http')) {
    const scraped = await scrapeProductFromUrl(productUrl.trim());
    if (scraped.scrapedParagraphs.length > 0 || scraped.scrapedImages.length > 0 || scraped.scrapedTitle) {
      scrapedUrlSuccess = true;
      scrapedTitleFound = scraped.scrapedTitle;
      rawText = scraped.scrapedParagraphs.join('\n\n');
      extractedImages = scraped.scrapedImages;
      extractedVideos = scraped.scrapedVideos;
      scrapedSpecs = scraped.specifications;
    }
  }

  if (scrapedTitleFound && (!cleanName || cleanName.length < 5)) {
    cleanName = scrapedTitleFound;
  }

  if (!cleanName && !productUrl) {
    throw new Error('Vui lòng nhập Tên sản phẩm hoặc dán link sản phẩm mẫu');
  }

  if (selectedImages && Array.isArray(selectedImages) && selectedImages.length > 0) {
    extractedImages = selectedImages;
  }

  const focusKw = (userFocusKeyword || cleanName).trim().toLowerCase();
  const mainImage = extractedImages[0] || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1000&auto=format&fit=crop';
  const remainingImages = extractedImages.slice(1, 6);

  const imageListPrompt = extractedImages.length > 0
    ? `\n\nDANH SÁCH ẢNH SẢN PHẨM:\n${extractedImages.map((img, i) => `Ảnh ${i + 1}: ${img}`).join('\n')}`
    : '';

  const specsPrompt = Object.keys(scrapedSpecs).length > 0
    ? `\n\nTHÔNG SỐ KỸ THUẬT CÀO ĐƯỢC:\n${Object.entries(scrapedSpecs).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`
    : '';

  const llmPrompt = `Bạn là Chuyên gia Kỹ thuật & Biên tập viên Bán hàng SEO Top 1 của Công ty CTC.

NHIỆM VỤ: Viết bài giới thiệu sản phẩm "${cleanName}" giàu giá trị, bám sát 100% nội dung gốc, đạt chuẩn SEO 100/100 và Dễ Đọc 100/100.

TÊN SẢN PHẨM: "${cleanName}"
MÃ MODEL: "${userProductCode || 'CTC-' + Math.floor(1000 + Math.random() * 9000)}"
TỪ KHÓA CHÍNH: "${focusKw}"
PHONG CÁCH: ${style === 'technical' ? 'Kỹ thuật chuyên sâu B2B' : style === 'sales' ? 'Thúc đẩy mua hàng B2C' : 'So sánh ưu điểm'}
ĐỘ DÀI: 1.000 đến 1.200 từ

NỘI DUNG/THÔNG SỐ GỐC:
${(rawText || cleanName).substring(0, 5000)}
${specsPrompt}
${imageListPrompt}

YÊU CẦU ĐỊNH DẠNG BÀI VIẾT:
1. Sử dụng 4 thẻ <h2>:
   - <h2>1. Tổng quan & Ưu điểm vượt trội của ${cleanName}</h2>
   - <h2>2. Phân tích thông số kỹ thuật & Công nghệ tích hợp</h2>
   - <h2>3. Hướng dẫn lắp đặt, vận hành & Ứng dụng thực tế</h2>
   - <h2>4. Chính sách bảo hành & Đơn vị phân phối chính hãng CTC</h2>
2. Chèn 1 Khối Tóm Tắt Tính Năng Nổi Bật (<div class="my-6 p-5 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-2xl">) ở đầu bài.
3. Chèn 1 Bảng Thông Số Kỹ Thuật HTML (<table class="w-full border-collapse border border-slate-200 my-6 text-xs">).
4. Mỗi câu văn ngắn dưới 18 từ. Thường xuyên ngắt câu bằng dấu chấm (.).
5. Chèn thông tin liên hệ Công Ty Cổ Phần Xây Lắp Bưu Điện Miền Trung (CTC), Hotline: 0915 059 666 ở cuối bài.`;

  let descriptionHtml = await queryAiLlmFromAdminSettings(llmPrompt);

  if (!descriptionHtml || descriptionHtml.length < 200) {
    // Fallback Product Generator
    const specRowsHtml = Object.entries(scrapedSpecs).length > 0
      ? Object.entries(scrapedSpecs).map(([k, v]) => `<tr><td class="p-3 bg-slate-50 font-bold">${k}</td><td class="p-3">${v}</td></tr>`).join('\n')
      : `<tr><td class="p-3 bg-slate-50 font-bold">Thương danh</td><td class="p-3">${cleanName}</td></tr>
         <tr><td class="p-3 bg-slate-50 font-bold">Model / Mã SP</td><td class="p-3">${userProductCode || 'CTC-' + Math.floor(1000 + Math.random() * 9000)}</td></tr>
         <tr><td class="p-3 bg-slate-50 font-bold">Đơn vị phân phối</td><td class="p-3">Công Ty Cổ Phần Xây Lắp Bưu Điện Miền Trung (CTC)</td></tr>`;

    descriptionHtml = `
<div class="my-6 p-5 bg-emerald-50/90 border-l-4 border-emerald-600 rounded-r-2xl shadow-xs">
  <p class="font-black text-xs text-emerald-950 uppercase tracking-wider mb-2">⚡ TÍNH NĂNG NỔI BẬT CỦA SẢN PHẨM</p>
  <ul class="text-xs text-emerald-900 space-y-1.5 font-medium leading-relaxed">
    <li>📌 <strong>Sản phẩm chính hãng:</strong> ${cleanName} được kiểm định chất lượng nghiêm ngặt.</li>
    <li>🛡️ <strong>Bảo hành uy tín:</strong> Cam kết đầy đủ chứng nhận CO/CQ và bảo hành chính hãng từ CTC.</li>
    <li>💡 <strong>Ứng dụng đa dạng:</strong> Đáp ứng tối ưu các yêu cầu kỹ thuật và vận hành thực tế.</li>
  </ul>
</div>

<figure class="my-6">
  <img src="${mainImage}" alt="${cleanName}" class="w-full h-auto rounded-2xl shadow-md object-cover max-h-[500px]" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic">Hình ảnh thực tế sản phẩm ${cleanName}.</figcaption>
</figure>

<h2>1. Tổng quan & Ưu điểm vượt trội của ${cleanName}</h2>
<p>Sản phẩm <strong>${cleanName}</strong> là giải pháp công nghệ tiên tiến được phát triển nhằm đáp ứng các tiêu chuẩn kỹ thuật khắt khe. Với thiết kế tối ưu và hiệu suất vận hành bền bỉ, đây là lựa chọn hàng đầu cho các công trình và hệ thống chuyên nghiệp.</p>

<h2>2. Phân tích thông số kỹ thuật & Công nghệ tích hợp</h2>
<div class="my-6 overflow-x-auto">
  <table class="w-full text-xs text-left border-collapse border border-slate-200 rounded-xl overflow-hidden shadow-xs">
    <thead class="bg-slate-900 text-white uppercase text-[10px] font-black">
      <tr><th class="p-3 border border-slate-700">Thông số kỹ thuật</th><th class="p-3 border border-slate-700">Chi tiết sản phẩm</th></tr>
    </thead>
    <tbody class="divide-y divide-slate-200 bg-white font-medium text-slate-700">
      ${specRowsHtml}
    </tbody>
  </table>
</div>

<h2>3. Hướng dẫn lắp đặt, vận hành & Ứng dụng thực tế</h2>
<p>Quy trình lắp đặt và vận hành <strong>${cleanName}</strong> được chuẩn hóa giúp tiết kiệm thời gian và đảm bảo an toàn tuyệt đối. Đội ngũ kỹ sư CTC luôn sẵn sàng hỗ trợ kỹ thuật và tư vấn giải pháp trọn gói cho quý khách hàng.</p>

<h2>4. Chính sách bảo hành & Đơn vị phân phối chính hãng CTC</h2>
<p><strong>Công Ty Cổ Phần Xây Lắp Bưu Điện Miền Trung (CTC)</strong> là nhà phân phối chính thức sản phẩm <strong>${cleanName}</strong> tại Việt Nam:</p>
<ul>
  <li><strong>Hotline tư vấn 24/7:</strong> <a href="tel:0915059666" class="text-primary font-bold">0915 059 666</a></li>
  <li><strong>Trang liên hệ CTC:</strong> Đăng ký báo giá tại <a href="/contact" class="text-primary font-bold underline">Trang Liên Hệ CTC</a>.</li>
</ul>
`.trim();
  }

/**
 * Helper parsers to extract structured specs from scraped data
 */
function parsePower(text: string, specs: Record<string, string>): number | undefined {
  const combined = `${Object.entries(specs).flatMap(e => [e[0], e[1]]).join(' ')} ${text}`;
  
  const kwMatch = combined.match(/(?:công suất|power|output)?\s*:?\s*(\d+(?:\.\d+)?)\s*k[wW]\b/i);
  if (kwMatch) return parseFloat(kwMatch[1]);

  const wMatch = combined.match(/(?:công suất|power|pmax)?\s*:?\s*(\d{3,4})\s*[wW]\b/i);
  if (wMatch) return parseFloat((parseInt(wMatch[1], 10) / 1000).toFixed(2));

  return undefined;
}

function parseEfficiency(text: string, specs: Record<string, string>): number | undefined {
  const combined = `${Object.entries(specs).flatMap(e => [e[0], e[1]]).join(' ')} ${text}`;
  const effMatch = combined.match(/(?:hiệu suất|efficiency|eff)?\s*:?\s*(\d+(?:\.\d+)?)\s*%/i);
  if (effMatch) {
    const val = parseFloat(effMatch[1]);
    if (val > 0 && val <= 100) return val;
  }
  return undefined;
}

function parseWarranty(text: string, specs: Record<string, string>): string | undefined {
  const combined = `${Object.entries(specs).flatMap(e => [e[0], e[1]]).join(' ')} ${text}`;
  const wMatch = combined.match(/(?:bảo hành|warranty)\s*:?\s*(\d+\s*(?:năm|tháng|year|month)s?)/i);
  if (wMatch) return wMatch[1].trim();
  
  const yearMatch = combined.match(/(\d+)\s*năm\s*bảo hành/i);
  if (yearMatch) return `${yearMatch[1]} năm`;

  return undefined;
}

function extractProductFeatures(paragraphs: string[]): string[] {
  const features: string[] = [];
  for (const p of paragraphs) {
    const clean = p.replace(/<[^>]+>/g, '').trim();
    if (clean.length > 20 && clean.length < 150) {
      if (/(?:tích hợp|trang bị|tối ưu|công nghệ|thiết kế|bảo vệ|hiệu suất|tiết kiệm|chính hãng|chịu lực|tiêu chuẩn)/i.test(clean)) {
        if (!features.includes(clean) && features.length < 6) {
          features.push(clean);
        }
      }
    }
  }

  if (features.length === 0 && paragraphs.length > 0) {
    for (const p of paragraphs.slice(0, 4)) {
      const clean = p.replace(/<[^>]+>/g, '').trim();
      if (clean.length > 15 && clean.length < 120) features.push(clean);
    }
  }

  return features;
}

function extractTechnicalSpecsDict(specs: Record<string, string>, rawText: string): Record<string, string> {
  const dict: Record<string, string> = { ...specs };

  if (Object.keys(dict).length === 0 && rawText) {
    const lines = rawText.split(/\n+/);
    for (const line of lines) {
      const clean = line.replace(/<[^>]+>/g, '').trim();
      const parts = clean.split(':');
      if (parts.length === 2) {
        const k = parts[0].trim();
        const v = parts[1].trim();
        if (k.length > 2 && k.length < 40 && v.length > 1 && v.length < 100) {
          dict[k] = v;
        }
      }
    }
  }

  return dict;
}

  // Post processing
  descriptionHtml = optimizeReadabilityScore(descriptionHtml);
  descriptionHtml = enhanceProductHtmlStyling(descriptionHtml);

  // Localize images
  const imagesToLocalize = [mainImage, ...remainingImages];
  const localized = await localizeAllProductImages(descriptionHtml, imagesToLocalize);
  descriptionHtml = localized.content;
  const finalMainImage = localized.images[0] || mainImage;
  const finalImages = localized.images.slice(1);

  // Extract Short Description & Specifications Table
  const shortDescription = `${cleanName} chính hãng phân phối bởi CTC. Sản phẩm sở hữu thiết kế hiện đại, thông số kỹ thuật tối ưu và chính sách bảo hành dài hạn.`;
  const tags = extractProductTags(cleanName, descriptionHtml, focusKw);

  // Parse structured specifications directly from scraped data
  const parsedPower = parsePower(rawText, scrapedSpecs);
  const parsedEfficiency = parseEfficiency(rawText, scrapedSpecs);
  const parsedWarranty = parseWarranty(rawText, scrapedSpecs);
  const parsedFeatures = extractProductFeatures(rawText ? rawText.split(/\n\n+/) : []);
  const parsedTechnicalSpecs = extractTechnicalSpecsDict(scrapedSpecs, rawText);

  // Specifications HTML string
  const specificationsHtml = Object.entries(parsedTechnicalSpecs).length > 0
    ? Object.entries(parsedTechnicalSpecs).map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`).join('\n')
    : `<p><strong>Sản phẩm:</strong> ${cleanName}</p><p><strong>Đơn vị phân phối:</strong> CTC</p>`;

  return {
    name: cleanName,
    code: userProductCode || 'CTC-' + Math.floor(1000 + Math.random() * 9000),
    focusKeyword: focusKw,
    tags,
    shortDescription,
    description: descriptionHtml,
    specifications: specificationsHtml,
    power: parsedPower,
    efficiency: parsedEfficiency,
    warranty: parsedWarranty,
    features: parsedFeatures,
    technicalSpecs: parsedTechnicalSpecs,
    image: finalMainImage,
    images: finalImages,
    status: 'pending',
    sources: scrapedUrlSuccess
      ? [`Cào dữ liệu sản phẩm từ URL: ${productUrl}`, 'CTC Product Database']
      : ['CTC Product Database']
  };
}
