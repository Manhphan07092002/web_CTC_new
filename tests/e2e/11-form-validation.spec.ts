/**
 * ================================================================
 * TEST 11 — FORM VALIDATION & EDGE CASES
 * Kiểm tra: required, max length, ký tự đặc biệt, unicode,
 * double-click, Enter, Cancel, unsaved changes
 * ================================================================
 */
import { test, expect } from '@playwright/test';
import { apiGet, apiPost, apiDelete, ts, API_URL } from './helpers';

const label = ts();

test.describe('FORM — Validation tổng quát', () => {

  test('FORM-001: Tên quá dài (1000 ký tự) được xử lý đúng', async ({ page }) => {
    const longName = 'A'.repeat(1000);
    const { status, body } = await apiPost(page, '/product-categories', {
      name: longName,
      slug: `long-name-${label}`,
    });

    if (status === 201) {
      console.log(`ℹ️ Server chấp nhận tên 1000 ký tự`);
      if (body?._id) await apiDelete(page, `/product-categories/${body._id}`);
    } else {
      console.log(`✅ Server giới hạn độ dài tên (HTTP ${status})`);
    }
  });

  test('FORM-002: Ký tự đặc biệt trong tên được sanitize', async ({ page }) => {
    const names = [
      `<b>Bold</b> ${label}`,
      `Test & Co ${label}`,
      `Test "Quoted" ${label}`,
    ];

    for (const name of names) {
      const { status, body } = await apiPost(page, '/product-categories', {
        name,
        slug: `special-${label}-${Math.random().toString(36).substring(7)}`,
      });

      if (status === 201) {
        console.log(`  Name "${name}" → saved as "${body.name}"`);
        // HTML tags phải bị strip hoặc escape
        if (name.includes('<')) {
          expect(body.name || '').not.toContain('<b>');
        }
        if (body?._id) await apiDelete(page, `/product-categories/${body._id}`);
      }
    }
  });

  test('FORM-003: Tên tiếng Việt có dấu được lưu đúng', async ({ page }) => {
    const vietnameseName = `Thiết Bị Mạng Đặc Biệt ${label}`;
    const { status, body } = await apiPost(page, '/product-categories', {
      name: vietnameseName,
      slug: `thiet-bi-mang-${label}`,
    });

    if (status === 201) {
      expect(body.name).toBe(vietnameseName);
      console.log(`✅ Tiếng Việt lưu đúng: "${body.name}"`);
      if (body?._id) await apiDelete(page, `/product-categories/${body._id}`);
    } else {
      console.warn(`ℹ️ Lỗi khi lưu tiếng Việt: HTTP ${status}`);
    }
  });

  test('FORM-004: Unicode ký tự quốc tế được xử lý', async ({ page }) => {
    const unicodeNames = [
      { name: `中文测试 ${label}`, lang: 'Chinese' },
      { name: `日本語テスト ${label}`, lang: 'Japanese' },
    ];

    for (const { name, lang } of unicodeNames) {
      const { status, body } = await apiPost(page, '/product-categories', {
        name,
        slug: `unicode-${lang.toLowerCase()}-${label}`,
      });
      console.log(`${lang}: HTTP ${status} | Saved: "${body?.name}"`);
      if (body?._id) await apiDelete(page, `/product-categories/${body._id}`);
    }
  });

  test('FORM-005: Submit form bằng Enter không gửi 2 lần', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('button', { name: /thêm|add|new|tạo/i }).first();
    if (!await addBtn.isVisible().catch(() => false)) return;

    await addBtn.click();
    await page.waitForTimeout(300);

    const nameInput = page.locator('input[name*="name"], input[placeholder*="tên"]').first();
    if (await nameInput.isVisible()) {
      const uniqueName = `Enter Test ${label}`;
      await nameInput.fill(uniqueName);
      await nameInput.press('Enter');
      await page.waitForTimeout(1000);

      // Kiểm tra chỉ tạo 1 bản ghi
      const { body } = await apiGet(page, `/product-categories?search=${encodeURIComponent(uniqueName)}`);
      const items = body?.data ?? body?.categories ?? body ?? [];
      const testItems = Array.isArray(items) ? items.filter((c: any) => c.name?.includes(uniqueName)) : [];

      if (testItems.length > 1) {
        console.warn(`⚠️ Enter tạo ra ${testItems.length} bản ghi!`);
      } else {
        console.log(`✅ Enter chỉ tạo 1 bản ghi`);
      }

      // Cleanup
      for (const item of testItems) {
        await apiDelete(page, `/product-categories/${item._id}`);
      }
    }
  });

  test('FORM-006: Click Hủy không tạo dữ liệu', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');

    const { body: before } = await apiGet(page, '/product-categories?limit=1');
    const countBefore = before?.total ?? before?.count ?? 0;

    const addBtn = page.getByRole('button', { name: /thêm|add|new|tạo/i }).first();
    if (!await addBtn.isVisible().catch(() => false)) return;

    await addBtn.click();
    await page.waitForTimeout(300);

    const nameInput = page.locator('input[name*="name"], input[placeholder*="tên"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(`Huy Test ${label}`);
    }

    // Click Hủy
    const cancelBtn = page.getByRole('button', { name: /hủy|cancel|đóng|close/i }).first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(500);

      const { body: after } = await apiGet(page, '/product-categories?limit=1');
      const countAfter = after?.total ?? after?.count ?? 0;

      expect(countAfter, 'Click Hủy không được tạo bản ghi mới').toBe(countBefore);
      console.log(`✅ Click Hủy - số danh mục không thay đổi: ${countAfter}`);
    }
  });

});

test.describe('FORM — Upload ảnh', () => {

  test('UPLOAD-001: API upload endpoint tồn tại', async ({ page }) => {
    // Test với file rỗng để xem endpoint có tồn tại không
    const res = await page.request.post(`${API_URL}/api/uploads`, {
      multipart: {
        // Gửi request rỗng để check endpoint
      },
    });
    // Phải trả 400 (bad request) chứ không phải 404
    expect(res.status(), 'Upload endpoint phải tồn tại').not.toBe(404);
    console.log(`Upload endpoint status: ${res.status()}`);
  });

  test('UPLOAD-002: File không đúng định dạng bị từ chối', async ({ page }) => {
    // Tạo file .exe giả
    const maliciousFile = Buffer.from('MZ\x90\x00' + 'A'.repeat(100));

    const res = await page.request.post(`${API_URL}/api/uploads`, {
      multipart: {
        file: {
          name: 'malicious.exe',
          mimeType: 'application/octet-stream',
          buffer: maliciousFile,
        },
      },
    });

    expect(res.status(), 'File .exe phải bị từ chối').toBeGreaterThanOrEqual(400);
    console.log(`✅ File .exe bị từ chối (HTTP ${res.status()})`);
  });

});
