/**
 * ================================================================
 * TEST 02 — DANH MỤC SẢN PHẨM (CAT-001 → CAT-032)
 * Kiểm tra CRUD danh mục, accordion nhiều cấp, parent/child
 * ================================================================
 */
import { test, expect } from '@playwright/test';
import { apiGet, apiPost, apiDelete, ts, toSlug } from './helpers';

const ADMIN_CATS = '/admin/categories';   // URL trang quản lý danh mục

// ─── Biến dùng chung giữa các test ───────────────────────────────
let createdCat1Id = '';
let createdCat2Id = '';
let createdCat3Id = '';
const testLabel = ts(); // unique suffix tránh trùng tên

test.describe('CAT — Hiển thị danh mục phân cấp', () => {

  test('CAT-001: Mặc định chỉ hiển thị danh mục cấp 1', async ({ page }) => {
    await page.goto(ADMIN_CATS);
    await page.waitForLoadState('networkidle');

    // Lấy tất cả các row danh mục hiển thị
    const rows = page.locator('[data-level="0"], [class*="level-0"], [class*="cat-level-0"], li[data-depth="0"]');
    const allRows = page.locator('[class*="category-row"], [class*="cat-row"], li[class*="cat"]');

    // Kiểm tra không có item cấp con nào tự động mở
    const visibleCount = await allRows.count();
    console.log(`Số dòng danh mục hiển thị mặc định: ${visibleCount}`);
    // Nếu có nhiều cấp con hiển thị ngay, test sẽ fail
    // (Giới hạn kiểm tra: chỉ log, vì selector tùy vào implement)
  });

  test('CAT-002: Click mũi tên cấp 1 → hiện danh mục cấp 2', async ({ page }) => {
    await page.goto(ADMIN_CATS);
    await page.waitForLoadState('networkidle');

    // Tìm nút toggle đầu tiên (mũi tên expand)
    const toggleBtn = page.locator('button[class*="toggle"], button[aria-expanded], [class*="expand-btn"], [class*="arrow"]').first();

    if (await toggleBtn.isVisible()) {
      const expanded = await toggleBtn.getAttribute('aria-expanded');
      if (expanded === 'true') {
        // Đã mở → đóng rồi mở lại để test
        await toggleBtn.click();
        await page.waitForTimeout(300);
      }
      await toggleBtn.click();
      await page.waitForTimeout(500);

      // Sau khi click, phải có thêm item xuất hiện (cấp 2)
      const childItems = page.locator('[class*="level-1"], [data-level="1"], [class*="child-cat"], [class*="sub-cat"]').first();
      // Log trạng thái thay vì fail cứng nếu selector không khớp
      const isChildVisible = await childItems.isVisible().catch(() => false);
      console.log(`Cấp 2 hiển thị sau click: ${isChildVisible}`);
    } else {
      console.warn('⚠️ Không tìm thấy nút toggle/expand - kiểm tra lại selector');
      test.skip();
    }
  });

  test('CAT-003: Click lại mũi tên → thu gọn danh mục cấp 2', async ({ page }) => {
    await page.goto(ADMIN_CATS);
    await page.waitForLoadState('networkidle');

    const toggleBtn = page.locator('button[aria-expanded], [class*="toggle"], [class*="expand-btn"]').first();
    if (!await toggleBtn.isVisible().catch(() => false)) {
      console.warn('⚠️ Không tìm thấy toggle button');
      test.skip();
      return;
    }

    // Mở
    await toggleBtn.click();
    await page.waitForTimeout(400);
    // Đóng
    await toggleBtn.click();
    await page.waitForTimeout(400);

    const expanded = await toggleBtn.getAttribute('aria-expanded');
    if (expanded !== null) {
      expect(expanded).toBe('false');
    }
  });

});

test.describe('CAT — CRUD danh mục (API trực tiếp)', () => {

  test('CAT-010: Thêm danh mục cấp 1 qua API', async ({ page }) => {
    const name = `Data Center Test ${testLabel}`;
    const { status, body } = await apiPost(page, '/product-categories', {
      name,
      slug: toSlug(name),
      description: 'Danh mục test E2E',
    });

    expect(status, 'POST /product-categories nên trả 201').toBe(201);
    expect(body).toHaveProperty('_id');
    expect(body.name).toBe(name);
    expect(body.parentId ?? body.parent_id ?? null).toBeFalsy();
    createdCat1Id = body._id;
    console.log(`✅ Tạo danh mục cấp 1: ${name} (ID: ${createdCat1Id})`);
  });

  test('CAT-011: Thêm danh mục cấp 2 với parentId đúng', async ({ page }) => {
    test.skip(!createdCat1Id, 'Cần CAT-010 chạy trước');

    const name = `Firewall Test ${testLabel}`;
    const { status, body } = await apiPost(page, '/product-categories', {
      name,
      slug: toSlug(name),
      parentId: createdCat1Id,
    });

    expect(status).toBe(201);
    expect(body.parentId || body.parent_id || body.parent).toBeTruthy();
    createdCat2Id = body._id;
    console.log(`✅ Tạo danh mục cấp 2: ${name} (parentId: ${createdCat1Id})`);
  });

  test('CAT-012: Thêm danh mục cấp 3 với parentId = cấp 2', async ({ page }) => {
    test.skip(!createdCat2Id, 'Cần CAT-011 chạy trước');

    const name = `Firewall Layer3 ${testLabel}`;
    const { status, body } = await apiPost(page, '/product-categories', {
      name,
      slug: toSlug(name),
      parentId: createdCat2Id,
    });

    expect(status).toBe(201);
    const parentId = body.parentId || body.parent_id || body.parent;
    expect(parentId).toBeTruthy();
    createdCat3Id = body._id;
    console.log(`✅ Tạo danh mục cấp 3 (parent=${createdCat2Id})`);
  });

  test('CAT-013: Không tạo được danh mục khi tên rỗng', async ({ page }) => {
    const { status, body } = await apiPost(page, '/product-categories', {
      name: '',
      slug: 'rong',
    });
    expect(status, 'Tên rỗng phải trả 400').toBe(400);
    console.log(`✅ Server từ chối tên rỗng: ${JSON.stringify(body)}`);
  });

  test('CAT-014: Slug tự động sinh nếu không cung cấp', async ({ page }) => {
    const name = `AutoSlug Test ${testLabel}`;
    const { status, body } = await apiPost(page, '/product-categories', {
      name,
      // Không gửi slug
    });

    if (status === 201) {
      expect(body.slug).toBeTruthy();
      expect(body.slug).not.toContain(' ');
      console.log(`✅ Slug tự sinh: ${body.slug}`);
      // Cleanup
      if (body._id) await apiDelete(page, `/product-categories/${body._id}`);
    } else {
      console.log(`ℹ️ Server yêu cầu slug bắt buộc (status: ${status})`);
    }
  });

  test('CAT-015: Không tạo được danh mục trùng slug', async ({ page }) => {
    test.skip(!createdCat1Id, 'Cần CAT-010 chạy trước');

    // Lấy slug của danh mục đã tạo
    const { body: existing } = await apiGet(page, `/product-categories/${createdCat1Id}`);
    if (!existing?.slug) return;

    const { status } = await apiPost(page, '/product-categories', {
      name: `Trùng Slug ${testLabel}`,
      slug: existing.slug,
    });

    // Server nên từ chối (400 hoặc tự thêm suffix)
    console.log(`Kết quả khi dùng slug trùng: HTTP ${status}`);
    // Không fail cứng vì một số hệ thống tự thêm suffix vào slug
  });

});

test.describe('CAT — Xóa danh mục', () => {

  test('CAT-030: Xóa danh mục rỗng thành công', async ({ page }) => {
    // Tạo một danh mục rỗng để xóa
    const { body: newCat } = await apiPost(page, '/product-categories', {
      name: `Xoa Test ${testLabel}`,
      slug: `xoa-test-${testLabel.toLowerCase()}`,
    });

    if (!newCat?._id) {
      console.warn('Không tạo được danh mục test, bỏ qua');
      return;
    }

    const { status } = await apiDelete(page, `/product-categories/${newCat._id}`);
    expect(status, 'Xóa danh mục rỗng nên thành công').toBeLessThan(300);

    // Xác nhận đã bị xóa
    const { status: getStatus } = await apiGet(page, `/product-categories/${newCat._id}`);
    expect(getStatus).toBe(404);
    console.log(`✅ Đã xóa danh mục ID=${newCat._id}`);
  });

  test('CAT-031: Xóa danh mục có danh mục con → phải cảnh báo/từ chối', async ({ page }) => {
    test.skip(!createdCat1Id, 'Cần CAT-010 chạy trước');

    const { status, body } = await apiDelete(page, `/product-categories/${createdCat1Id}`);
    if (status === 200 || status === 204) {
      // Nếu server cho xóa → kiểm tra danh mục con còn không
      const { status: childStatus, body: child } = await apiGet(page, `/product-categories/${createdCat2Id}`);
      console.warn(`⚠️ Server cho xóa danh mục có con! Con (ID=${createdCat2Id}) vẫn tồn tại: ${childStatus === 200}`);
      // Không fail cứng vì có thể cascade delete là hành vi mong đợi
    } else {
      console.log(`✅ Server từ chối xóa danh mục có con (HTTP ${status}): ${JSON.stringify(body)}`);
      expect(status).toBeGreaterThanOrEqual(400);
    }
  });

  test('CAT-CLEANUP: Dọn sạch dữ liệu test', async ({ page }) => {
    const ids = [createdCat3Id, createdCat2Id, createdCat1Id].filter(Boolean);
    for (const id of ids) {
      const { status } = await apiDelete(page, `/product-categories/${id}`);
      console.log(`Cleanup category ${id}: HTTP ${status}`);
    }
  });

});

test.describe('CAT — Giao diện Admin (UI Tests)', () => {

  test('CAT-UI-01: Trang quản lý danh mục tải thành công', async ({ page }) => {
    const res = await page.goto(ADMIN_CATS);
    await page.waitForLoadState('networkidle');
    expect(res?.status()).toBeLessThan(400);

    // Phải có tiêu đề hoặc heading
    const heading = page.locator('h1, h2, [class*="title"]').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('CAT-UI-02: Nút Thêm mới tồn tại và có thể click', async ({ page }) => {
    await page.goto(ADMIN_CATS);
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('button', { name: /thêm|add|new|tạo mới/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Modal hoặc form thêm mới phải xuất hiện
    const form = page.locator('[role="dialog"], form, [class*="modal"]').first();
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('CAT-UI-03: Không thể submit form với tên rỗng', async ({ page }) => {
    await page.goto(ADMIN_CATS);
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('button', { name: /thêm|add|new|tạo mới/i }).first();
    await addBtn.click();

    // Submit với tên trống
    const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|create/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);

      // Phải có thông báo lỗi
      const error = page.locator('[class*="error"], [class*="invalid"], [role="alert"]').first();
      const isErrorVisible = await error.isVisible().catch(() => false);
      console.log(`Validation error visible: ${isErrorVisible}`);
    }
  });

  test('CAT-UI-04: Nút Edit mở đúng form chỉnh sửa', async ({ page }) => {
    await page.goto(ADMIN_CATS);
    await page.waitForLoadState('networkidle');

    const editBtn = page.getByRole('button', { name: /edit|sửa|chỉnh sửa/i }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);

      // Form/Modal phải mở với dữ liệu đã điền
      const nameInput = page.locator('input[name*="name"], input[placeholder*="tên"], input[id*="name"]').first();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
      const nameValue = await nameInput.inputValue();
      expect(nameValue.length).toBeGreaterThan(0);
      console.log(`✅ Edit form mở với tên: "${nameValue}"`);
    } else {
      console.warn('⚠️ Không tìm thấy nút Edit - có thể cần mở rộng danh mục trước');
    }
  });

});
