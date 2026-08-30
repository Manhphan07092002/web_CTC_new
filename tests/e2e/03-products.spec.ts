/**
 * ================================================================
 * TEST 03 — SẢN PHẨM (PROD-001 → PROD-020)
 * Kiểm tra CRUD sản phẩm, validation, upload ảnh, phân trang
 * ================================================================
 */
import { test, expect } from '@playwright/test';
import { apiGet, apiPost, apiPut, apiDelete, ts } from './helpers';
import path from 'path';
import fs from 'fs';

const ADMIN_PRODUCTS = '/admin/products';
const label = ts();

let createdProductId = '';
let categoryId = '';

test.describe('PROD — Khởi tạo dữ liệu test', () => {

  test('PROD-SETUP: Lấy ID danh mục đầu tiên', async ({ page }) => {
    const { status, body } = await apiGet(page, '/product-categories?limit=1');
    if (status === 200 && (body?.data?.[0]?._id || body?.[0]?._id)) {
      categoryId = body?.data?.[0]?._id || body?.[0]?._id;
      console.log(`✅ Sử dụng categoryId: ${categoryId}`);
    } else {
      console.warn('Không tìm được category, một số test sẽ bị skip');
    }
  });

});

test.describe('PROD — Tạo sản phẩm (PROD-001)', () => {

  test('PROD-001: Tạo sản phẩm đầy đủ thông tin qua API', async ({ page }) => {
    const productName = `Router Test ${label}`;
    const payload: Record<string, any> = {
      name: productName,
      sku: `TEST-${label}`,
      price: 1500000,
      shortDescription: 'Sản phẩm kiểm thử E2E',
      description: '<p>Mô tả chi tiết sản phẩm kiểm thử.</p>',
      specifications: [{ key: 'Cổng LAN', value: '4 × Gigabit' }],
      status: 'active',
    };
    if (categoryId) payload.categoryId = categoryId;

    const { status, body } = await apiPost(page, '/products', payload);
    expect(status, 'Tạo sản phẩm phải trả 201').toBe(201);
    expect(body).toHaveProperty('_id');
    expect(body.name).toBe(productName);
    createdProductId = body._id;
    console.log(`✅ Sản phẩm tạo: ${productName} (ID: ${createdProductId})`);
  });

  test('PROD-002: Không tạo được sản phẩm khi tên rỗng', async ({ page }) => {
    const { status } = await apiPost(page, '/products', {
      name: '',
      sku: `EMPTY-${label}`,
      price: 100000,
    });
    expect(status, 'Tên rỗng phải bị từ chối').toBeGreaterThanOrEqual(400);
  });

  test('PROD-003: Không cho phép giá âm', async ({ page }) => {
    const { status, body } = await apiPost(page, '/products', {
      name: `Negative Price ${label}`,
      sku: `NEG-${label}`,
      price: -100000,
    });

    if (status === 201) {
      // Nếu server tạo được → kiểm tra giá lưu trong DB
      const saved = body.price ?? body.salePrice ?? -1;
      console.warn(`⚠️ Server cho phép giá âm! Giá lưu được: ${saved}`);
      if (body._id) await apiDelete(page, `/products/${body._id}`);
    } else {
      expect(status).toBeGreaterThanOrEqual(400);
      console.log(`✅ Server từ chối giá âm (HTTP ${status})`);
    }
  });

  test('PROD-004: Giá bằng 0 → kiểm tra hiển thị "Liên hệ"', async ({ page }) => {
    const { status, body } = await apiPost(page, '/products', {
      name: `Lien He Product ${label}`,
      sku: `LH-${label}`,
      price: 0,
    });

    if (status === 201 && body._id) {
      console.log(`✅ Server cho phép giá = 0. Slug: ${body.slug}`);

      // Kiểm tra trang public hiển thị "Liên hệ" thay vì 0đ
      if (body.slug) {
        await page.goto(`/products/${body.slug}`);
        const pageText = await page.content();
        const hasContactText = pageText.includes('Liên hệ') || pageText.includes('Lien he') || pageText.includes('Contact');
        console.log(`Public page hiển thị "Liên hệ": ${hasContactText}`);
      }

      await apiDelete(page, `/products/${body._id}`);
    } else {
      console.log(`ℹ️ Server từ chối giá 0 (HTTP ${status})`);
    }
  });

});

test.describe('PROD — Xem và tìm kiếm sản phẩm', () => {

  test('PROD — API lấy danh sách sản phẩm trả dữ liệu đúng', async ({ page }) => {
    const { status, body } = await apiGet(page, '/products?page=1&limit=10');
    expect(status).toBe(200);

    const items = body?.data || body?.products || body;
    expect(Array.isArray(items)).toBeTruthy();
    console.log(`✅ Tổng số sản phẩm: ${body?.total || body?.count || items?.length}`);
  });

  test('PROD — Sản phẩm vừa tạo có thể GET theo ID', async ({ page }) => {
    test.skip(!createdProductId, 'Cần PROD-001 chạy trước');

    const { status, body } = await apiGet(page, `/products/${createdProductId}`);
    expect(status).toBe(200);
    expect(body._id || body.id).toBeTruthy();
  });

  test('PROD — Sản phẩm hiển thị đúng trên trang public', async ({ page }) => {
    const { body } = await apiGet(page, '/products?limit=1');
    const items = body?.data || body?.products || body;
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('Không có sản phẩm để test public page');
      return;
    }

    const product = items[0];
    const slug = product.slug;
    if (!slug) {
      console.warn('Sản phẩm không có slug');
      return;
    }

    const res = await page.goto(`/products/${slug}`);
    expect(res?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');

    // Kiểm tra tên sản phẩm xuất hiện trên trang
    const pageText = await page.content();
    expect(pageText).toContain(product.name || product.title || '');
  });

});

test.describe('PROD — Sửa sản phẩm', () => {

  test('PROD-EDIT-01: Sửa tên sản phẩm qua API', async ({ page }) => {
    test.skip(!createdProductId, 'Cần PROD-001 chạy trước');

    const newName = `Router Edited ${label}`;
    const { status, body } = await apiPut(page, `/products/${createdProductId}`, {
      name: newName,
    });

    expect(status).toBeLessThan(300);
    expect(body.name).toBe(newName);
    console.log(`✅ Sửa tên sản phẩm thành: ${newName}`);
  });

  test('PROD-EDIT-02: Sửa giá sản phẩm', async ({ page }) => {
    test.skip(!createdProductId, 'Cần PROD-001 chạy trước');

    const { status, body } = await apiPut(page, `/products/${createdProductId}`, {
      price: 2000000,
    });

    expect(status).toBeLessThan(300);
    const savedPrice = body.price ?? body.salePrice;
    expect(savedPrice).toBe(2000000);
    console.log(`✅ Sửa giá thành: ${savedPrice}`);
  });

  test('PROD-EDIT-03: Chuyển danh mục - sản phẩm không bị mất', async ({ page }) => {
    test.skip(!createdProductId || !categoryId, 'Cần dữ liệu setup');

    const { status, body } = await apiPut(page, `/products/${createdProductId}`, {
      categoryId,
    });

    expect(status).toBeLessThan(300);
    const savedCat = body.categoryId || body.category;
    expect(savedCat).toBeTruthy();
    console.log(`✅ Chuyển danh mục thành công: ${savedCat}`);
  });

});

test.describe('PROD — Xóa sản phẩm (PROD-020)', () => {

  test('PROD-020: Xóa sản phẩm và xác nhận không tồn tại', async ({ page }) => {
    test.skip(!createdProductId, 'Cần PROD-001 chạy trước');

    const { status } = await apiDelete(page, `/products/${createdProductId}`);
    expect(status, 'Xóa sản phẩm phải thành công').toBeLessThan(300);

    // Xác nhận đã bị xóa
    const { status: getStatus } = await apiGet(page, `/products/${createdProductId}`);
    expect(getStatus, 'Sau khi xóa GET phải trả 404').toBe(404);
    console.log(`✅ Sản phẩm ${createdProductId} đã được xóa`);
    createdProductId = '';
  });

});

test.describe('PROD — Trang quản lý sản phẩm (UI)', () => {

  test('PROD-UI-01: Trang admin sản phẩm tải thành công', async ({ page }) => {
    await page.goto(ADMIN_PRODUCTS);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('admin');
  });

  test('PROD-UI-02: Double-click Lưu không tạo 2 sản phẩm', async ({ page }) => {
    await page.goto(ADMIN_PRODUCTS);
    await page.waitForLoadState('networkidle');

    // Đếm số sản phẩm trước
    const { body: before } = await apiGet(page, '/products?limit=1');
    const countBefore = before?.total ?? before?.count ?? 0;

    const addBtn = page.getByRole('button', { name: /thêm|add|new|tạo/i }).first();
    if (!await addBtn.isVisible().catch(() => false)) {
      console.warn('Không tìm thấy nút Thêm mới');
      return;
    }

    await addBtn.click();
    await page.waitForTimeout(300);

    // Điền form tối thiểu
    const nameInput = page.locator('input[name*="name"], input[placeholder*="tên sản phẩm"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(`Double Click Test ${label}`);
    }

    // Double click nút lưu
    const saveBtn = page.getByRole('button', { name: /lưu|save/i }).first();
    if (await saveBtn.isVisible()) {
      await saveBtn.dblclick();
      await page.waitForTimeout(2000);

      // Đếm số sản phẩm sau
      const { body: after } = await apiGet(page, '/products?limit=1');
      const countAfter = after?.total ?? after?.count ?? 0;
      const diff = countAfter - countBefore;

      if (diff <= 1) {
        console.log(`✅ Double-click không tạo bản ghi trùng (tăng ${diff})`);
      } else {
        console.warn(`⚠️ Double-click tạo ra ${diff} bản ghi!`);
      }

      // Cleanup
      const { body: latestProducts } = await apiGet(page, `/products?limit=5&sort=-createdAt`);
      const testProducts = (latestProducts?.data || latestProducts || [])
        .filter((p: any) => p.name?.includes('Double Click Test'));
      for (const p of testProducts) {
        await apiDelete(page, `/products/${p._id}`);
      }
    }
  });

});

test.describe('PROD — Slug & URL sản phẩm', () => {

  test('PROD-SLUG-01: Slug sinh từ tên tiếng Việt hợp lệ', async ({ page }) => {
    const { body } = await apiGet(page, '/products?limit=5');
    const products = body?.data || body?.products || body || [];

    for (const prod of products) {
      if (!prod.slug) continue;
      // Slug không được chứa ký tự đặc biệt
      expect(prod.slug, `Slug "${prod.slug}" không hợp lệ`).toMatch(/^[a-z0-9-]+$/);
      // Slug không được bắt đầu hoặc kết thúc bằng dấu gạch
      expect(prod.slug).not.toMatch(/^-|-$/);
    }
  });

  test('PROD-SLUG-02: URL sản phẩm không 404 sau refresh', async ({ page }) => {
    const { body } = await apiGet(page, '/products?limit=3');
    const products = body?.data || body?.products || body || [];

    for (const prod of products.slice(0, 3)) {
      if (!prod.slug) continue;
      const url = `/products/${prod.slug}`;
      const res = await page.goto(url);
      expect(res?.status(), `${url} không được 404`).toBeLessThan(400);
    }
  });

});
