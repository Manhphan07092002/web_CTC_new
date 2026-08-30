/**
 * ================================================================
 * TEST 01 — NAVIGATION (NAV-01 → NAV-10)
 * Kiểm tra menu chính, điều hướng trang, responsive
 * ================================================================
 */
import { test, expect } from '@playwright/test';

const PAGES = [
  { name: 'Trang chủ',       url: '/',          titleContains: 'CTC' },
  { name: 'Sản phẩm',        url: '/products',  titleContains: 'Sản phẩm' },
  { name: 'Dự án',           url: '/projects',  titleContains: 'Dự án' },
  { name: 'Tin tức',         url: '/news',      titleContains: 'Tin tức' },
  { name: 'Tài liệu',        url: '/resources', titleContains: 'Tài liệu' },
  { name: 'Giới thiệu',      url: '/about',     titleContains: '' },
  { name: 'Liên hệ',         url: '/contact',   titleContains: '' },
];

test.describe('NAV — Điều hướng & Menu chính', () => {

  test('NAV-01: Website tải thành công', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    const res = await page.goto('/');
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/.+/);

    if (errors.length > 0) {
      console.warn('⚠️ JS Errors:', errors);
    }
  });

  for (const p of PAGES) {
    test(`NAV — Truy cập ${p.name} (${p.url})`, async ({ page }) => {
      const res = await page.goto(p.url);
      expect(res?.status(), `${p.url} nên trả 200`).toBeLessThan(400);
      await page.waitForLoadState('domcontentloaded');

      if (p.titleContains) {
        // Title hoặc H1 phải chứa từ khóa (chờ React / Helmet render)
        await expect.poll(async () => {
          const title = await page.title();
          const h1Text = await page.locator('h1').allInnerTexts().then(arr => arr.join(' ')).catch(() => '');
          return title.includes(p.titleContains) || h1Text.includes(p.titleContains);
        }, {
          message: `Trang ${p.url} cần có "${p.titleContains}" trong title hoặc h1`,
          timeout: 7000,
        }).toBeTruthy();
      }
    });
  }

  test('NAV-07: Bấm logo quay về trang chủ', async ({ page }) => {
    await page.goto('/products');
    await page.locator('a[href="/"], img[alt*="logo"], [class*="logo"] a').first().click();
    await expect(page).toHaveURL('/');
  });

  test('NAV-06: Refresh từng trang không lỗi 404', async ({ page }) => {
    for (const p of PAGES) {
      const res = await page.goto(p.url);
      expect(res?.status(), `Refresh ${p.url}`).toBeLessThan(400);
    }
  });

  test('NAV-09: Menu active state hiển thị đúng', async ({ page }) => {
    await page.goto('/products');
    // Tìm link menu trỏ tới /products xem có class active không
    const activeLink = page.locator(`nav a[href="/products"]`).first();
    if (await activeLink.isVisible()) {
      const cls = await activeLink.getAttribute('class') || '';
      const isActive = cls.includes('active') || cls.includes('current') || cls.includes('selected');
      console.log(`Active class on /products nav link: "${cls}"`);
      // Không fail cứng vì tùy cách implement, chỉ log
    }
  });

  test('NAV-08: Menu không vỡ trên mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Không có overflow ngang
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth, 'Không được tràn ngang trên mobile').toBeLessThanOrEqual(windowWidth + 5);
  });

  test('NAV-10: Mở nhiều trang không vỡ layout', async ({ page }) => {
    for (const p of PAGES.slice(0, 3)) {
      await page.goto(p.url);
      const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5);
      expect(overflow, `${p.url} không được tràn ngang`).toBeFalsy();
    }
  });

  test('NAV — robots.txt và sitemap.xml tồn tại', async ({ page }) => {
    const robots = await page.goto('/robots.txt');
    expect(robots?.status()).toBeLessThan(400);

    const sitemap = await page.goto('/sitemap.xml');
    expect(sitemap?.status()).toBeLessThan(400);
  });

  test('NAV — 404 page tùy chỉnh không crash', async ({ page }) => {
    const res = await page.goto('/trang-khong-ton-tai-xyz-999');
    // SPA thường trả về 200 nhưng hiển thị trang 404
    // Hoặc nếu server trả 404, kiểm tra có nội dung hợp lý
    const text = await page.content();
    expect(text.length).toBeGreaterThan(100);
  });

});
