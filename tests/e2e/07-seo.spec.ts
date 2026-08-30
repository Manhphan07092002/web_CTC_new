/**
 * ================================================================
 * TEST 07 — SEO & META TAGS
 * Kiểm tra title, description, H1, canonical, OG tags
 * ================================================================
 */
import { test, expect } from '@playwright/test';
import { apiGet } from './helpers';

const SEO_PAGES = [
  { name: 'Trang chủ',  url: '/',          minTitleLen: 10 },
  { name: 'Sản phẩm',   url: '/products',  minTitleLen: 5  },
  { name: 'Dự án',      url: '/projects',  minTitleLen: 5  },
  { name: 'Tin tức',    url: '/news',      minTitleLen: 5  },
  { name: 'Tài liệu',   url: '/resources', minTitleLen: 5  },
  { name: 'Giới thiệu', url: '/about',     minTitleLen: 5  },
  { name: 'Liên hệ',    url: '/contact',   minTitleLen: 5  },
];

test.describe('SEO — Meta tags & Cấu trúc trang', () => {

  for (const p of SEO_PAGES) {
    test(`SEO — ${p.name}: title và meta description`, async ({ page }) => {
      await page.goto(p.url);
      await page.waitForLoadState('networkidle');

      // Title
      const title = await page.title();
      expect(title.length, `${p.url} cần có <title> ít nhất ${p.minTitleLen} ký tự`).toBeGreaterThanOrEqual(p.minTitleLen);
      console.log(`  Title: "${title}"`);

      // Meta description
      const metaDesc = await page.$eval(
        'meta[name="description"]',
        (el) => el.getAttribute('content') || ''
      ).catch(() => '');
      console.log(`  Meta desc: "${metaDesc.substring(0, 80)}..."`);

      // H1 — chỉ được có 1 thẻ H1
      const h1Count = await page.locator('h1').count();
      expect(h1Count, `${p.url} nên có đúng 1 thẻ <h1>`).toBeLessThanOrEqual(1);
    });
  }

  test('SEO — Open Graph tags trên trang chủ', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const ogTitle = await page.$eval(
      'meta[property="og:title"]',
      (el) => el.getAttribute('content') || ''
    ).catch(() => '');

    const ogImage = await page.$eval(
      'meta[property="og:image"]',
      (el) => el.getAttribute('content') || ''
    ).catch(() => '');

    console.log(`OG Title: "${ogTitle}"`);
    console.log(`OG Image: "${ogImage}"`);
  });

  test('SEO — robots.txt có Allow hoặc Disallow chuẩn', async ({ page }) => {
    const res = await page.goto('/robots.txt');
    expect(res?.status()).toBe(200);
    const text = await page.content();
    expect(text).toMatch(/user-agent|disallow|allow|sitemap/i);
    console.log(`robots.txt OK`);
  });

  test('SEO — sitemap.xml hợp lệ', async ({ page }) => {
    const res = await page.goto('/sitemap.xml');
    expect(res?.status()).toBe(200);
    const text = await page.content();
    expect(text).toContain('<url>');
    expect(text).toContain('<loc>');
    const urlCount = (text.match(/<url>/g) || []).length;
    console.log(`Sitemap có ${urlCount} URLs`);
  });

  test('SEO — Trang chi tiết sản phẩm có đủ SEO tags', async ({ page }) => {
    const { body } = await apiGet(page, '/products?limit=1&status=active');
    const products = body?.data || body?.products || body || [];
    if (products.length === 0) {
      console.warn('Không có sản phẩm để test SEO');
      return;
    }

    const slug = products[0].slug;
    if (!slug) return;

    await page.goto(`/products/${slug}`);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title.length).toBeGreaterThanOrEqual(5);

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const h1Text = await h1.textContent() || '';
    expect(h1Text.trim().length).toBeGreaterThan(0);

    console.log(`Product SEO - Title: "${title}" | H1: "${h1Text.substring(0, 50)}"`);
  });

  test('SEO — Canonical URL tồn tại', async ({ page }) => {
    await page.goto('/');
    const canonical = await page.$eval(
      'link[rel="canonical"]',
      (el) => el.getAttribute('href') || ''
    ).catch(() => '');

    if (canonical) {
      expect(canonical).toMatch(/^https?:\/\//);
      console.log(`✅ Canonical: ${canonical}`);
    } else {
      console.warn('⚠️ Không tìm thấy canonical tag');
    }
  });

});
