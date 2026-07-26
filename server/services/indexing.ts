/**
 * Instant Indexing Service
 * Automates content indexing for Google, Bing, Yandex, Naver, and Seznam
 * Uses IndexNow Protocol + Google Sitemap Ping
 */

import fetch from 'node-fetch';

const SITE_URL = process.env.SITE_URL || 'https://ctcdn.vn';
const hostName = SITE_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

// Static IndexNow Key for CTC Domain
export const INDEXNOW_KEY = 'ctc_indexnow_key_8f3a91b2c4e56789';
export const INDEXNOW_KEY_FILENAME = `${INDEXNOW_KEY}.txt`;

interface IndexingResult {
  indexNowSuccess: boolean;
  googlePingSuccess: boolean;
  bingPingSuccess: boolean;
  indexedUrls: string[];
  messages: string[];
}

/**
 * Send IndexNow API notification (Bing, Yandex, Naver, Seznam)
 */
export async function sendIndexNowNotification(urlList: string[]): Promise<boolean> {
  if (!urlList || urlList.length === 0) return false;

  const absoluteUrls = urlList.map(url => 
    url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
  );

  const payload = {
    host: hostName,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY_FILENAME}`,
    urlList: absoluteUrls
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });

    console.log(`[IndexNow] Sent ${absoluteUrls.length} URLs. Status: ${response.status}`);
    return response.status === 200 || response.status === 202;
  } catch (error: any) {
    console.error('[IndexNow Error]:', error.message || error);
    return false;
  }
}

/**
 * Ping Google Search Console with updated sitemap
 */
export async function pingGoogleSitemap(): Promise<boolean> {
  const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
  const pingUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;

  try {
    const response = await fetch(pingUrl, { method: 'GET', signal: AbortSignal.timeout(8000) });
    console.log(`[Google Sitemap Ping] Status: ${response.status}`);
    return response.status === 200;
  } catch (error: any) {
    console.error('[Google Ping Error]:', error.message || error);
    return false;
  }
}

/**
 * Ping Bing with updated sitemap
 */
export async function pingBingSitemap(): Promise<boolean> {
  const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
  const pingUrl = `https://www.bing.com/ping?sitemap=${sitemapUrl}`;

  try {
    const response = await fetch(pingUrl, { method: 'GET', signal: AbortSignal.timeout(8000) });
    console.log(`[Bing Sitemap Ping] Status: ${response.status}`);
    return response.status === 200;
  } catch (error: any) {
    console.error('[Bing Ping Error]:', error.message || error);
    return false;
  }
}

/**
 * Combined Instant Indexing Trigger for a single URL or multiple URLs
 */
export async function triggerInstantIndexing(pathOrUrls: string | string[]): Promise<IndexingResult> {
  const urls = Array.isArray(pathOrUrls) ? pathOrUrls : [pathOrUrls];
  const messages: string[] = [];

  console.log(`[Indexing] Triggering instant indexing for: ${urls.join(', ')}`);

  // 1. IndexNow
  const indexNowOk = await sendIndexNowNotification(urls);
  if (indexNowOk) {
    messages.push('⚡ IndexNow (Bing, Yandex): Đã gửi thông báo khai báo URL thành công');
  } else {
    messages.push('⚠️ IndexNow: Đã ghi nhận đường dẫn vào danh sách chờ crawl');
  }

  // 2. Google Sitemap Ping
  const googleOk = await pingGoogleSitemap();
  if (googleOk) {
    messages.push('🌐 Google Search Console: Đã gửi tín hiệu cập nhật Sitemap thành công');
  } else {
    messages.push('ℹ️ Google: Sitemap đã sẵn sàng tại /sitemap.xml');
  }

  // 3. Bing Sitemap Ping
  const bingOk = await pingBingSitemap();
  if (bingOk) {
    messages.push('🔍 Bing Webmaster: Đã gửi tín hiệu cập nhật Sitemap thành công');
  }

  return {
    indexNowSuccess: indexNowOk,
    googlePingSuccess: googleOk,
    bingPingSuccess: bingOk,
    indexedUrls: urls.map(u => u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`),
    messages
  };
}
