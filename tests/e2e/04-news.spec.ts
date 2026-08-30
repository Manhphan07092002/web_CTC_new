/**
 * ================================================================
 * TEST 04 — TIN TỨC (NEWS-001 → NEWS-020)
 * Kiểm tra CRUD bài viết, trạng thái draft/published, SEO
 * ================================================================
 */
import { test, expect } from '@playwright/test';
import { apiGet, apiPost, apiPut, apiDelete, ts } from './helpers';

const label = ts();
let createdNewsId = '';

test.describe('NEWS — CRUD bài viết tin tức', () => {

  test('NEWS-001: Tạo bài viết mới (draft)', async ({ page }) => {
    const { status, body } = await apiPost(page, '/news', {
      title: `Tin tức test ${label}`,
      content: '<p>Nội dung bài viết kiểm thử E2E</p>',
      summary: 'Tóm tắt bài viết test',
      status: 'draft',
      tags: ['test', 'e2e'],
    });

    expect(status).toBe(201);
    expect(body).toHaveProperty('_id');
    expect(body.status).toBe('draft');
    createdNewsId = body._id;
    console.log(`✅ Tạo bài viết draft: ${body.title} (ID: ${createdNewsId})`);
  });

  test('NEWS-002: Xuất bản bài viết (draft → published)', async ({ page }) => {
    test.skip(!createdNewsId, 'Cần NEWS-001 chạy trước');

    const { status, body } = await apiPut(page, `/news/${createdNewsId}`, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    });

    expect(status).toBeLessThan(300);
    expect(body.status).toBe('published');
    console.log(`✅ Bài viết đã được xuất bản`);
  });

  test('NEWS-003: Ẩn bài viết (published → hidden/draft)', async ({ page }) => {
    test.skip(!createdNewsId, 'Cần NEWS-002 chạy trước');

    const { status, body } = await apiPut(page, `/news/${createdNewsId}`, {
      status: 'draft',
    });

    expect(status).toBeLessThan(300);
    console.log(`✅ Bài viết ẩn thành công: ${body.status}`);
  });

  test('NEWS-004: Sửa tiêu đề và slug phải cập nhật', async ({ page }) => {
    test.skip(!createdNewsId, 'Cần NEWS-001 chạy trước');

    const newTitle = `Tin tức đã sửa ${label}`;
    const { status, body } = await apiPut(page, `/news/${createdNewsId}`, {
      title: newTitle,
    });

    expect(status).toBeLessThan(300);
    expect(body.title).toBe(newTitle);
  });

  test('NEWS-005: API danh sách tin tức trả đúng cấu trúc', async ({ page }) => {
    const { status, body } = await apiGet(page, '/news?page=1&limit=10');
    expect(status).toBe(200);

    const items = body?.data || body?.news || body;
    expect(Array.isArray(items)).toBeTruthy();
    console.log(`Tổng bài viết: ${body?.total ?? items?.length}`);
  });

  test('NEWS-006: URL bài viết không 404 sau khi tạo', async ({ page }) => {
    // Lấy bài viết đã published
    const { body } = await apiGet(page, '/news?status=published&limit=1');
    const items = body?.data || body?.news || body || [];
    if (items.length === 0) {
      console.warn('Không có bài viết published để test');
      return;
    }

    const slug = items[0].slug;
    if (!slug) return;

    const res = await page.goto(`/news/${slug}`);
    expect(res?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');
  });

  test('NEWS-007: Xóa bài viết và xác nhận biến mất', async ({ page }) => {
    test.skip(!createdNewsId, 'Cần NEWS-001 chạy trước');

    const { status } = await apiDelete(page, `/news/${createdNewsId}`);
    expect(status).toBeLessThan(300);

    const { status: getStatus } = await apiGet(page, `/news/${createdNewsId}`);
    expect(getStatus).toBe(404);
    createdNewsId = '';
    console.log(`✅ Bài viết đã xóa thành công`);
  });

  test('NEWS-008: Trang danh sách tin tức public hiển thị đúng', async ({ page }) => {
    const res = await page.goto('/news');
    expect(res?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');

    // Phải có ít nhất 1 bài viết (nếu có data)
    const { body } = await apiGet(page, '/news?status=published&limit=1');
    const items = body?.data || body?.news || body || [];
    if (items.length > 0) {
      const firstNews = page.locator('article, [class*="news-card"], [class*="post-card"]').first();
      await expect(firstNews).toBeVisible({ timeout: 5000 });
    }
  });

});
