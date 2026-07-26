/**
 * Instant Indexing Service for Production Server
 * Automates content indexing for Bing, Yandex, Naver, and Seznam via IndexNow Protocol
 */

import fetch from 'node-fetch';

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

  // 1. Try primary IndexNow API endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'CTC-Indexer/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.status === 200 || response.status === 202 || response.status === 204) {
      console.log(`[IndexNow API] Successfully sent ${absoluteUrls.length} URLs for ${hostName} (HTTP ${response.status})`);
      return true;
    }
  } catch (err: any) {
    console.log(`[IndexNow API] Primary endpoint timeout/error: ${err.message}`);
  }

  // 2. Fallback to Bing IndexNow endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'CTC-Indexer/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.status === 200 || response.status === 202 || response.status === 204) {
      console.log(`[Bing IndexNow] Successfully notified Bing for ${hostName} (HTTP ${response.status})`);
      return true;
    }
  } catch (err: any) {
    console.log(`[Bing IndexNow] Fallback endpoint error: ${err.message}`);
  }

  return false;
}

/**
 * Combined Instant Indexing Trigger
 */
export async function triggerInstantIndexing(pathOrUrls: string | string[], customSiteUrl?: string): Promise<IndexingResult> {
  const urls = Array.isArray(pathOrUrls) ? pathOrUrls : [pathOrUrls];
  const siteUrl = customSiteUrl || getSiteUrl();
  const messages: string[] = [];

  console.log(`[Indexing] Triggering instant indexing for: ${urls.join(', ')}`);

  const indexNowOk = await sendIndexNowNotification(urls, siteUrl);

  if (indexNowOk) {
    messages.push('⚡ IndexNow (Bing, Yandex): Đã gửi thông báo ép lập chỉ mục URL thành công!');
  } else {
    messages.push('ℹ️ Sitemap & RSS đã được cập nhật tự động tại /sitemap.xml');
  }

  return {
    indexNowSuccess: indexNowOk,
    indexedUrls: urls.map(u => u.startsWith('http') ? u : `${siteUrl}${u.startsWith('/') ? '' : '/'}${u}`),
    messages
  };
}
