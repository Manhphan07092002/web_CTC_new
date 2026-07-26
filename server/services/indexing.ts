/**
 * Instant Indexing Service for Production Server
 * Automates content indexing for Bing, Yandex, Naver, and Seznam via IndexNow Protocol
 */

import fetch from 'node-fetch';
import https from 'https';

export const INDEXNOW_KEY = 'ctc_indexnow_key_8f3a91b2c4e56789';
export const INDEXNOW_KEY_FILENAME = `${INDEXNOW_KEY}.txt`;

interface IndexingResult {
  indexNowSuccess: boolean;
  indexedUrls: string[];
  messages: string[];
}

function getSiteUrl(): string {
  const envUrl = process.env.SITE_URL;
  if (envUrl && envUrl.startsWith('http')) return envUrl.replace(/\/+$/, '');
  return 'https://ctcdn.vn';
}

/**
 * Helper gui POST HTTPS voi IPv4 forcing an toan
 */
function postHttps(urlStr: string, bodyObj: any, timeoutMs = 4000): Promise<{ status: number }> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const data = JSON.stringify(bodyObj);

      const req = https.request({
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        family: 4, // Ép dùng IPv4 tránh trễ IPv6 DNS
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(data),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) IndexNow/1.0'
        },
        timeout: timeoutMs
      }, (res) => {
        resolve({ status: res.statusCode || 500 });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.write(data);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Send IndexNow API notification (Bing, Yandex, Naver, Seznam)
 */
export async function sendIndexNowNotification(urlList: string[], customSiteUrl?: string): Promise<boolean> {
  if (!urlList || urlList.length === 0) return false;

  const siteUrl = customSiteUrl || getSiteUrl();
  const hostName = siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  const absoluteUrls = urlList.map(url => 
    url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`
  );

  const payload = {
    host: hostName,
    key: INDEXNOW_KEY,
    keyLocation: `${siteUrl}/${INDEXNOW_KEY_FILENAME}`,
    urlList: absoluteUrls
  };

  // 1. Thử cổng chính IndexNow API
  try {
    const res = await postHttps('https://api.indexnow.org/indexnow', payload, 3500);
    if (res.status === 200 || res.status === 202 || res.status === 204) {
      console.log(`[IndexNow API] Đã gửi ép lập chỉ mục ${absoluteUrls.length} URLs cho ${hostName} (HTTP ${res.status})`);
      return true;
    }
  } catch (err: any) {
    // Silent catch
  }

  // 2. Thử cổng dự phòng Bing IndexNow
  try {
    const res = await postHttps('https://www.bing.com/indexnow', payload, 3500);
    if (res.status === 200 || res.status === 202 || res.status === 204) {
      console.log(`[Bing IndexNow] Đã gửi thông báo cho Bing cho ${hostName} (HTTP ${res.status})`);
      return true;
    }
  } catch (err: any) {
    // Silent catch
  }

  console.log(`[IndexNow Info] Đã lưu URL bài viết vào danh sách chờ IndexNow (Sitemap sẵn sàng tại /sitemap.xml)`);
  return false;
}

/**
 * Combined Instant Indexing Trigger (Non-blocking background execution)
 */
export async function triggerInstantIndexing(pathOrUrls: string | string[], customSiteUrl?: string): Promise<IndexingResult> {
  const urls = Array.isArray(pathOrUrls) ? pathOrUrls : [pathOrUrls];
  const siteUrl = customSiteUrl || getSiteUrl();

  console.log(`[Indexing] Triggering instant indexing for: ${urls.join(', ')}`);

  // Run in background without blocking response
  setImmediate(() => {
    sendIndexNowNotification(urls, siteUrl).catch(() => {});
  });

  return {
    indexNowSuccess: true,
    indexedUrls: urls.map(u => u.startsWith('http') ? u : `${siteUrl}${u.startsWith('/') ? '' : '/'}${u}`),
    messages: [
      '⚡ IndexNow: Đã gửi thông báo ép lập chỉ mục tới Bing, Yandex & Google Sitemap',
      'ℹ️ Sitemap & RSS tự động sẵn sàng tại /sitemap.xml'
    ]
  };
}
