/**
 * ================================================================
 * TEST 05 — DỰ ÁN (PROJECT-001 → PROJECT-020)
 * Kiểm tra CRUD dự án, ảnh, trạng thái, URL
 * ================================================================
 */
import { test, expect } from '@playwright/test';
import { apiGet, apiPost, apiPut, apiDelete, ts } from './helpers';

const label = ts();
let createdProjectId = '';

test.describe('PROJECT — CRUD dự án', () => {

  test('PROJECT-001: Tạo dự án mới', async ({ page }) => {
    const { status, body } = await apiPost(page, '/projects', {
      title: `Dự án Test ${label}`,
      client: 'Khách hàng Test',
      location: 'Hà Nội',
      completedYear: 2024,
      description: 'Mô tả dự án kiểm thử E2E',
      status: 'completed',
    });

    expect(status).toBe(201);
    expect(body).toHaveProperty('_id');
    createdProjectId = body._id;
    console.log(`✅ Tạo dự án: ${body.title} (ID: ${createdProjectId})`);
  });

  test('PROJECT-002: Sửa thông tin dự án', async ({ page }) => {
    test.skip(!createdProjectId, 'Cần PROJECT-001 chạy trước');

    const newTitle = `Dự án Đã Sửa ${label}`;
    const { status, body } = await apiPut(page, `/projects/${createdProjectId}`, {
      title: newTitle,
      client: 'Khách hàng Mới',
    });

    expect(status).toBeLessThan(300);
    expect(body.title).toBe(newTitle);
    console.log(`✅ Sửa dự án thành: ${newTitle}`);
  });

  test('PROJECT-003: Danh sách dự án API trả đúng', async ({ page }) => {
    const { status, body } = await apiGet(page, '/projects?page=1&limit=10');
    expect(status).toBe(200);
    const items = body?.data || body?.projects || body;
    expect(Array.isArray(items)).toBeTruthy();
  });

  test('PROJECT-004: URL dự án không 404', async ({ page }) => {
    const { body } = await apiGet(page, '/projects?limit=1');
    const items = body?.data || body?.projects || body || [];
    if (items.length === 0) return;

    const slug = items[0].slug;
    if (!slug) return;

    const res = await page.goto(`/projects/${slug}`);
    expect(res?.status()).toBeLessThan(400);
  });

  test('PROJECT-005: Xóa dự án và xác nhận', async ({ page }) => {
    test.skip(!createdProjectId, 'Cần PROJECT-001 chạy trước');

    const { status } = await apiDelete(page, `/projects/${createdProjectId}`);
    expect(status).toBeLessThan(300);

    const { status: getStatus } = await apiGet(page, `/projects/${createdProjectId}`);
    expect(getStatus).toBe(404);
    createdProjectId = '';
    console.log(`✅ Xóa dự án thành công`);
  });

});
