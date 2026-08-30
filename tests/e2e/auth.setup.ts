/**
 * ================================================================
 * SETUP: AUTH STATE - Đăng nhập admin một lần, tái sử dụng session
 * ================================================================
 * File này chạy TRƯỚC tất cả test, lưu trạng thái đăng nhập
 * vào playwright/.auth/admin.json để các test không phải login lại.
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    || 'admin@ctcdn.vn';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Ctcdn.vn@123';
const AUTH_FILE      = 'playwright/.auth/admin.json';

setup('Authenticate as admin', async ({ page }) => {
  // Tạo thư mục auth nếu chưa có
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto('/admin/login');
  await page.waitForLoadState('networkidle');

  // Điền form đăng nhập — form dùng placeholder, không dùng <label for>
  const emailInput = page.locator('input[type="email"], input[placeholder*="admin"], input[placeholder*="email"], input[placeholder*="@"]').first();
  await emailInput.fill(ADMIN_EMAIL);

  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(ADMIN_PASSWORD);

  await page.getByRole('button', { name: /đăng nhập|login/i }).click();


  // Chờ redirect về dashboard
  await expect(page).toHaveURL(/admin/, { timeout: 15_000 });

  // Lưu auth state
  await page.context().storageState({ path: AUTH_FILE });
  console.log(`✅ Auth state saved → ${AUTH_FILE}`);
});
