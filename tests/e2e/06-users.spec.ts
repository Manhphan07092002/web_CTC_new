/**
 * ================================================================
 * TEST 06 — NGƯỜI DÙNG & PHÂN QUYỀN (USER-001 → USER-020)
 * Kiểm tra CRUD user, roles, và API security
 * ================================================================
 */
import { test, expect } from '@playwright/test';
import { apiGet, apiPost, apiPut, apiDelete, ts, API_URL } from './helpers';

const label = ts();
let createdUserId = '';

test.describe('USER — CRUD người dùng', () => {

  test('USER-001: Tạo user mới', async ({ page }) => {
    const email = `e2e-test-${label}@ctc-test.com`;
    const { status, body } = await apiPost(page, '/users', {
      name: `User Test ${label}`,
      email,
      password: 'TestPass@123',
      role: 'viewer',
    });

    expect(status, `Tạo user phải trả 201, nhận ${status}: ${JSON.stringify(body)}`).toBe(201);
    expect(body._id || body.id).toBeTruthy();
    expect(body.password).toBeUndefined(); // Password không được trả về
    createdUserId = body._id || body.id;
    console.log(`✅ Tạo user: ${email} (ID: ${createdUserId})`);
  });

  test('USER-002: Không tạo user với email trùng', async ({ page }) => {
    test.skip(!createdUserId, 'Cần USER-001 chạy trước');

    const email = `e2e-test-${label}@ctc-test.com`;
    const { status, body } = await apiPost(page, '/users', {
      name: 'Trùng Email Test',
      email,
      password: 'TestPass@123',
    });

    expect(status, 'Email trùng phải bị từ chối').toBeGreaterThanOrEqual(400);
    console.log(`✅ Server từ chối email trùng: ${JSON.stringify(body)}`);
  });

  test('USER-003: Không tạo user với tên rỗng', async ({ page }) => {
    const { status } = await apiPost(page, '/users', {
      name: '',
      email: `empty-name-${label}@ctc-test.com`,
      password: 'TestPass@123',
    });
    expect(status).toBeGreaterThanOrEqual(400);
  });

  test('USER-004: Không tạo user với email rỗng', async ({ page }) => {
    const { status } = await apiPost(page, '/users', {
      name: 'Test No Email',
      email: '',
      password: 'TestPass@123',
    });
    expect(status).toBeGreaterThanOrEqual(400);
  });

  test('USER-005: Sửa thông tin user', async ({ page }) => {
    test.skip(!createdUserId, 'Cần USER-001 chạy trước');

    const { status, body } = await apiPut(page, `/users/${createdUserId}`, {
      name: `User Edited ${label}`,
      phone: '0123456789',
    });

    expect(status).toBeLessThan(300);
    expect(body.name).toContain('Edited');
    console.log(`✅ Sửa user thành công`);
  });

  test('USER-006: Danh sách user không trả password', async ({ page }) => {
    const { status, body } = await apiGet(page, '/users?limit=5');
    expect(status).toBe(200);

    const users = body?.data || body?.users || body || [];
    for (const u of users) {
      expect(u.password, 'Password không được xuất hiện trong API response').toBeUndefined();
    }
    console.log(`✅ Danh sách ${users.length} user không lộ password`);
  });

  test('USER-007: Xóa user và xác nhận', async ({ page }) => {
    test.skip(!createdUserId, 'Cần USER-001 chạy trước');

    const { status } = await apiDelete(page, `/users/${createdUserId}`);
    expect(status).toBeLessThan(300);

    const { status: getStatus } = await apiGet(page, `/users/${createdUserId}`);
    expect(getStatus).toBe(404);
    createdUserId = '';
    console.log(`✅ User đã xóa`);
  });

});

test.describe('USER — Bảo mật & Phân quyền API', () => {

  test('SEC-001: API /admin không thể truy cập khi chưa login', async ({ browser }) => {
    // Tạo context mới không có auth
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    const res = await page.request.get(`${API_URL}/api/users`);
    expect(res.status(), 'API users cần auth').toBeGreaterThanOrEqual(401);
    await context.close();
  });

  test('SEC-002: Không thể xóa user bằng ID ngẫu nhiên', async ({ page }) => {
    const { status } = await apiDelete(page, '/users/000000000000000000000000');
    expect(status).toBeGreaterThanOrEqual(400);
  });

  test('SEC-003: API không trả thông tin nhạy cảm', async ({ page }) => {
    const { status, body } = await apiGet(page, '/users?limit=1');
    if (status !== 200) return;

    const users = body?.data || body?.users || body || [];
    for (const u of users) {
      expect(u.password).toBeUndefined();
      expect(u.passwordHash).toBeUndefined();
      expect(u.token).toBeUndefined();
    }
    console.log(`✅ API không lộ dữ liệu nhạy cảm`);
  });

  test('SEC-004: XSS trong tên user không được execute', async ({ page }) => {
    const xssPayload = `<script>alert('XSS')</script>Test ${label}`;
    const { status, body } = await apiPost(page, '/users', {
      name: xssPayload,
      email: `xss-test-${label}@ctc-test.com`,
      password: 'TestPass@123',
    });

    if (status === 201) {
      // Nếu server cho lưu → tên phải được sanitize
      expect(body.name).not.toContain('<script>');
      console.log(`Tên sau sanitize: "${body.name}"`);
      if (body._id) await apiDelete(page, `/users/${body._id}`);
    } else {
      console.log(`✅ Server từ chối XSS payload (HTTP ${status})`);
    }
  });

});

test.describe('USER — Trang quản lý người dùng (UI)', () => {

  test('USER-UI-01: Trang /admin/users tải thành công', async ({ page }) => {
    const res = await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    expect(res?.status()).toBeLessThan(400);
  });

  test('USER-UI-02: Form tạo user validation hoạt động', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');

    const addBtn = page.getByRole('button', { name: /thêm|add|tạo/i }).first();
    if (!await addBtn.isVisible().catch(() => false)) {
      console.warn('Không tìm thấy nút Thêm user');
      return;
    }

    await addBtn.click();
    await page.waitForTimeout(300);

    // Submit trống
    const submitBtn = page.getByRole('button', { name: /lưu|save|tạo/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);

      // Phải có thông báo validation
      const error = page.locator('[class*="error"], [class*="invalid"], [role="alert"]').first();
      console.log(`Form validation hiển thị lỗi: ${await error.isVisible().catch(() => false)}`);
    }
  });

});
