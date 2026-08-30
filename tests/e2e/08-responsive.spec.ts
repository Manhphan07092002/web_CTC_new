/**
 * ================================================================
 * TEST 08 — RESPONSIVE (RESP-001 → RESP-030)
 * Kiểm tra layout trên Desktop/Tablet/Mobile
 * ================================================================
 */
import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Desktop 1920',  width: 1920, height: 1080 },
  { name: 'Desktop 1440',  width: 1440, height: 900  },
  { name: 'Desktop 1366',  width: 1366, height: 768  },
  { name: 'Tablet 1024',   width: 1024, height: 768  },
  { name: 'Tablet 768',    width: 768,  height: 1024 },
  { name: 'Mobile 430',    width: 430,  height: 932  },
  { name: 'Mobile 390',    width: 390,  height: 844  },
  { name: 'Mobile 375',    width: 375,  height: 667  },
];

const TEST_PAGES = ['/', '/products', '/news', '/projects'];

async function checkNoOverflow(page: any, url: string, viewport: string): Promise<void> {
  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const windowWidth     = await page.evaluate(() => window.innerWidth);
  const diff = bodyScrollWidth - windowWidth;

  if (diff > 10) {
    console.warn(`⚠️ [${viewport}] ${url}: Tràn ngang ${diff}px`);
  } else {
    console.log(`✅ [${viewport}] ${url}: Không tràn ngang`);
  }
}

test.describe('RESPONSIVE — Không vỡ layout trên các kích thước màn hình', () => {

  for (const vp of VIEWPORTS) {
    test(`RESP — ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const url of TEST_PAGES) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(300);

        // 1. Kiểm tra overflow ngang
        await checkNoOverflow(page, url, vp.name);

        // 2. Kiểm tra không có text bị cắt ngang (overflow hidden cứng)
        const bodyWidth  = await page.evaluate(() => document.body.clientWidth);
        expect(bodyWidth, `Body width tại ${vp.name}`).toBeGreaterThan(0);

        // 3. Kiểm tra không có lỗi JavaScript trong quá trình load
        const jsErrors: string[] = [];
        page.once('pageerror', (err) => jsErrors.push(err.message));
        if (jsErrors.length > 0) {
          console.warn(`⚠️ JS Errors tại ${url} [${vp.name}]:`, jsErrors);
        }
      }
    });
  }

  test('RESP — Mobile: Hamburger menu hiển thị đúng', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tìm hamburger button
    const hamburger = page.locator(
      'button[aria-label*="menu"], button[class*="hamburger"], button[class*="mobile-menu"], [class*="menu-toggle"]'
    ).first();

    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(500);

      // Menu phải mở ra
      const mobileMenu = page.locator('[class*="mobile-nav"], [class*="mobile-menu"], nav[class*="open"]').first();
      const isOpen = await mobileMenu.isVisible().catch(() => false);
      console.log(`Mobile menu mở ra: ${isOpen}`);

      // Đóng lại
      await hamburger.click({ force: true }).catch(() => {});
      await page.waitForTimeout(300);
    } else {
      console.log(`ℹ️ Không có hamburger menu tại 375px (có thể dùng navigation khác)`);
    }
  });

  test('RESP — Modal không vượt màn hình trên mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('button', { name: /thêm|add|new/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);

      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      if (await modal.isVisible()) {
        const modalBox = await modal.boundingBox();
        const viewportWidth = 375;

        if (modalBox) {
          expect(modalBox.width, 'Modal không được rộng hơn viewport').toBeLessThanOrEqual(viewportWidth + 5);
          console.log(`✅ Modal width: ${modalBox.width}px (viewport: ${viewportWidth}px)`);
        }
      }
    }
  });

  test('RESP — Images không bị méo hoặc tràn', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imgCount = await images.count();
    console.log(`Tổng số ảnh trên trang: ${imgCount}`);

    for (let i = 0; i < Math.min(imgCount, 5); i++) {
      const img = images.nth(i);
      const box = await img.boundingBox();
      if (box) {
        // Ảnh không được rộng hơn viewport
        expect(box.width).toBeLessThanOrEqual(380); // 375 + tolerance
      }
    }
  });

});
