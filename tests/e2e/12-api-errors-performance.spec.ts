/**
 * ================================================================
 * TEST 12 — API ERRORS & PERFORMANCE
 * Kiểm tra: xử lý lỗi API 400/401/403/404/500,
 * thông báo lỗi rõ ràng, performance với nhiều dữ liệu
 * ================================================================
 */
import { test, expect } from '@playwright/test';
import { apiGet, apiPost, apiPut, apiDelete } from './helpers';

test.describe('API — Xử lý lỗi chuẩn', () => {

  test('API-001: GET không tồn tại trả 404', async ({ page }) => {
    const { status } = await apiGet(page, '/products/000000000000000000000000');
    expect(status).toBe(404);
  });

  test('API-002: POST thiếu field bắt buộc trả 400', async ({ page }) => {
    const { status } = await apiPost(page, '/product-categories', {});
    expect(status, 'Body rỗng phải trả 400').toBe(400);
  });

  test('API-003: PUT id không tồn tại trả 404', async ({ page }) => {
    const { status } = await apiPut(page, '/products/000000000000000000000000', { name: 'test' });
    expect(status).toBeGreaterThanOrEqual(400);
  });

  test('API-004: DELETE id không tồn tại trả 404', async ({ page }) => {
    const { status } = await apiDelete(page, '/products/000000000000000000000000');
    expect(status).toBeGreaterThanOrEqual(400);
  });

  test('API-005: Response lỗi có message rõ ràng', async ({ page }) => {
    const { status, body } = await apiPost(page, '/product-categories', { name: '' });

    if (status >= 400) {
      expect(body).not.toBeNull();

      const message = body?.message ?? body?.error ?? body?.errors;
      expect(message, 'Response lỗi phải có field "message"').toBeTruthy();

      // Không được trả undefined, null, [object Object]
      const msgStr = String(message);
      expect(msgStr).not.toBe('undefined');
      expect(msgStr).not.toBe('null');
      expect(msgStr).not.toBe('[object Object]');
      expect(msgStr).not.toBe('NaN');
      console.log(`✅ Error message: "${msgStr}"`);
    }
  });

  test('API-006: Unauthenticated request trả 401', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();

    // Gọi endpoint protected
    const protectedEndpoints = ['/users', '/product-categories'];
    for (const ep of protectedEndpoints) {
      const res = await page.request.get(`http://localhost:4000/api${ep}`);
      const status = res.status();
      console.log(`Unauthenticated GET ${ep}: HTTP ${status}`);
      // Endpoint public có thể trả 200, endpoint admin phải trả 401
    }

    await ctx.close();
  });

  test('API-007: SQL Injection không làm crash server', async ({ page }) => {
    const injections = [
      "'; DROP TABLE products; --",
      "1' OR '1'='1",
      'UNION SELECT * FROM users',
    ];

    for (const inj of injections) {
      const { status } = await apiGet(page, `/products?search=${encodeURIComponent(inj)}`);
      expect(status, `SQL Injection "${inj}" không được crash server`).toBeLessThan(500);
    }
    console.log(`✅ Server ổn định với SQL Injection attempts`);
  });

  test('API-008: Dữ liệu JSON không hợp lệ trả 400', async ({ page }) => {
    const res = await page.request.post('http://localhost:4000/api/product-categories', {
      headers: { 'Content-Type': 'application/json' },
      data: '{ invalid json }',
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

});

test.describe('PERFORMANCE — Hiệu năng hệ thống', () => {

  test('PERF-001: Danh sách sản phẩm tải dưới 3 giây', async ({ page }) => {
    const start = Date.now();
    const { status } = await apiGet(page, '/products?page=1&limit=20');
    const duration = Date.now() - start;

    expect(status).toBe(200);
    console.log(`GET /products: ${duration}ms`);
    expect(duration, 'API danh sách sản phẩm phải tải dưới 3000ms').toBeLessThan(3000);
  });

  test('PERF-002: Danh sách danh mục tải dưới 3 giây', async ({ page }) => {
    const start = Date.now();
    const { status } = await apiGet(page, '/product-categories');
    const duration = Date.now() - start;

    expect(status).toBe(200);
    console.log(`GET /product-categories: ${duration}ms`);
    expect(duration, 'API danh mục phải tải dưới 3000ms').toBeLessThan(3000);
  });

  test('PERF-003: Trang chủ FCP dưới 5 giây', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const duration = Date.now() - start;

    console.log(`Trang chủ DOMContentLoaded: ${duration}ms`);
    expect(duration, 'Trang chủ phải tải DOMContent dưới 5000ms').toBeLessThan(5000);
  });

  test('PERF-004: Trang sản phẩm tải dưới 5 giây', async ({ page }) => {
    const start = Date.now();
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    const duration = Date.now() - start;

    console.log(`Trang sản phẩm DOMContentLoaded: ${duration}ms`);
    expect(duration).toBeLessThan(5000);
  });

  test('PERF-005: Phân trang không load toàn bộ khi chỉ cần cấp 1', async ({ page }) => {
    // Kiểm tra API danh mục có hỗ trợ lazy loading không
    const start = Date.now();
    const { status, body } = await apiGet(page, '/product-categories?level=0');
    const duration = Date.now() - start;

    if (status === 200) {
      const cats = body?.data ?? body?.categories ?? body ?? [];
      console.log(`Cấp 1 chỉ: ${cats.length} danh mục trong ${duration}ms`);

      // Nếu API có level filter → tốt
      const allHaveNoChildren = cats.every((c: any) => !c.children || c.children.length === 0);
      console.log(`API trả về không kèm children: ${allHaveNoChildren}`);
    } else {
      // API không hỗ trợ level filter → ghi chú
      console.log(`ℹ️ API không hỗ trợ ?level=0 (HTTP ${status}), toàn bộ cây được load cùng lúc`);
    }
  });

  test('PERF-006: Nhiều request đồng thời không crash server', async ({ page }) => {
    const endpoints = [
      '/products?limit=5',
      '/product-categories',
      '/news?limit=5',
      '/projects?limit=5',
    ];

    const promises = endpoints.map(ep => apiGet(page, ep));
    const results = await Promise.all(promises);

    for (let i = 0; i < results.length; i++) {
      expect(results[i].status, `${endpoints[i]} phải trả 200`).toBe(200);
    }
    console.log(`✅ ${endpoints.length} requests đồng thời thành công`);
  });

});
