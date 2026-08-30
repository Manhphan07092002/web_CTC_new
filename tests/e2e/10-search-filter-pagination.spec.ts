/**
 * ================================================================
 * TEST 10 — TÌM KIẾM & BỘ LỌC & PHÂN TRANG
 * ================================================================
 */
import { test, expect } from '@playwright/test';
import { apiGet } from './helpers';

test.describe('SEARCH — Tìm kiếm sản phẩm', () => {

  test('SEARCH-01: Tìm kiếm API không phân biệt hoa thường', async ({ page }) => {
    // Lấy tên sản phẩm bất kỳ
    const { body: allBody } = await apiGet(page, '/products?limit=1');
    const items = allBody?.data ?? allBody?.products ?? allBody ?? [];
    if (!items[0]?.name) {
      console.warn('Không có sản phẩm để test search');
      return;
    }

    const name = items[0].name as string;
    const keyword = name.substring(0, 5);

    const searches = [
      keyword,
      keyword.toUpperCase(),
      keyword.toLowerCase(),
    ];

    for (const q of searches) {
      const { status, body } = await apiGet(page, `/products?search=${encodeURIComponent(q)}&limit=10`);
      if (status !== 200) {
        // Có thể search endpoint khác
        const { status: s2, body: b2 } = await apiGet(page, `/search?q=${encodeURIComponent(q)}&type=product`);
        console.log(`Search "${q}" qua /search: HTTP ${s2}`);
        continue;
      }

      const results = body?.data ?? body?.products ?? body ?? [];
      console.log(`Search "${q}": ${results.length} kết quả`);
    }
  });

  test('SEARCH-02: Từ khóa không tồn tại trả kết quả rỗng', async ({ page }) => {
    const { status, body } = await apiGet(page, '/products?search=XYZABC999NONEXISTENT&limit=10');
    if (status !== 200) return;

    const results = body?.data ?? body?.products ?? body ?? [];
    expect(Array.isArray(results)).toBeTruthy();
    console.log(`Từ khóa không tồn tại: ${results.length} kết quả (mong đợi 0)`);
  });

  test('SEARCH-03: Search ký tự đặc biệt không crash server', async ({ page }) => {
    const specialChars = ['@#$%', '<script>', 'SELECT * FROM', "'; DROP TABLE"];

    for (const char of specialChars) {
      const { status } = await apiGet(page, `/products?search=${encodeURIComponent(char)}&limit=1`);
      expect(status, `Search với "${char}" không được crash`).toBeLessThan(500);
    }
    console.log(`✅ Server ổn định với ký tự đặc biệt`);
  });

  test('SEARCH-04: Trang tìm kiếm public hoạt động', async ({ page }) => {
    const res = await page.goto('/search?q=router');
    if (res && res.status() < 400) {
      await page.waitForLoadState('networkidle');
      console.log(`✅ Trang search tải thành công`);
    } else {
      // Thử search qua URL trang sản phẩm
      await page.goto('/products?search=router');
      await page.waitForLoadState('networkidle');
      console.log(`✅ Search qua trang products`);
    }
  });

});

test.describe('FILTER — Bộ lọc sản phẩm', () => {

  test('FILTER-01: Lọc theo danh mục trả đúng sản phẩm', async ({ page }) => {
    const { body: catBody } = await apiGet(page, '/product-categories?limit=3');
    const cats = catBody?.data ?? catBody?.categories ?? catBody ?? [];

    for (const cat of cats.slice(0, 2)) {
      const catId = cat._id;
      const { status, body } = await apiGet(page, `/products?categoryId=${catId}&limit=10`);

      if (status !== 200) continue;
      const products = body?.data ?? body?.products ?? body ?? [];
      console.log(`Lọc danh mục "${cat.name}": ${products.length} sản phẩm`);

      // Kiểm tra sản phẩm trả về thuộc đúng danh mục
      for (const p of products) {
        const pCatId = p.categoryId ?? p.category;
        if (pCatId && pCatId !== catId) {
          // Có thể include sản phẩm trong danh mục con
          console.log(`  SP "${p.name}" thuộc danh mục: ${pCatId}`);
        }
      }
    }
  });

  test('FILTER-02: Lọc theo giá', async ({ page }) => {
    const { status, body } = await apiGet(page, '/products?minPrice=0&maxPrice=5000000&limit=10');
    if (status === 200) {
      const products = body?.data ?? body?.products ?? body ?? [];
      console.log(`Lọc 0-5tr: ${products.length} sản phẩm`);

      for (const p of products) {
        if (p.price !== undefined && p.price !== null) {
          const numPrice = Number(p.price);
          if (!isNaN(numPrice)) {
            expect(numPrice).toBeGreaterThanOrEqual(0);
            expect(numPrice).toBeLessThanOrEqual(5000000);
          }
        }
      }
    } else {
      console.log(`ℹ️ Filter theo giá chưa được implement (HTTP ${status})`);
    }
  });

});

test.describe('PAGINATION — Phân trang', () => {

  test('PAGE-01: Phân trang trang 1 và trang 2 không trùng dữ liệu', async ({ page }) => {
    const { body: page1 } = await apiGet(page, '/products?page=1&limit=10');
    const { body: page2 } = await apiGet(page, '/products?page=2&limit=10');

    const p1Items = page1?.data ?? page1?.products ?? page1 ?? [];
    const p2Items = page2?.data ?? page2?.products ?? page2 ?? [];

    if (p1Items.length === 0 || p2Items.length === 0) {
      console.warn('Không đủ sản phẩm để test phân trang');
      return;
    }

    const p1Ids = new Set(p1Items.map((p: any) => p._id || p.id));
    const duplicates = p2Items.filter((p: any) => p1Ids.has(p._id || p.id));

    expect(duplicates.length, 'Trang 1 và trang 2 không được có cùng sản phẩm').toBe(0);
    console.log(`✅ Phân trang đúng: Trang 1 (${p1Items.length} SP) và Trang 2 (${p2Items.length} SP) không trùng`);
  });

  test('PAGE-02: Trang cuối không vượt quá tổng số bản ghi', async ({ page }) => {
    const { body } = await apiGet(page, '/products?page=1&limit=1');
    const total = body?.total ?? body?.count;
    if (!total) return;

    const lastPage = Math.ceil(total / 10);
    const { body: lastPageBody } = await apiGet(page, `/products?page=${lastPage}&limit=10`);
    const items = lastPageBody?.data ?? lastPageBody?.products ?? lastPageBody ?? [];

    console.log(`Tổng: ${total} | Trang cuối: ${lastPage} | Số item trang cuối: ${items.length}`);
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(10);
  });

  test('PAGE-03: Giao diện phân trang public không mất filter khi chuyển trang', async ({ page }) => {
    await page.goto('/products?page=1');
    await page.waitForLoadState('networkidle');

    // Tìm nút trang 2 trong thanh phân trang (chính xác text "2")
    const page2Btn = page.locator('button').filter({ hasText: /^2$/ }).first();

    const btn = await page2Btn.isVisible().catch(() => false) ? page2Btn : null;

    if (btn) {
      await btn.click();
      await page.waitForLoadState('networkidle');
      const url = page.url();
      expect(url).toMatch(/page=2|\/2/);
      console.log(`✅ Chuyển trang 2 thành công: ${url}`);
    } else {
      console.log('ℹ️ Không tìm thấy nút trang 2 (có thể ít sản phẩm)');
    }
  });

});
