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
const API_URL        = process.env.TEST_API_URL || 'http://127.0.0.1:4000';

setup('Authenticate as admin', async ({ page, request }) => {
  // Tạo thư mục auth nếu chưa có
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // ── Bước 1: Lấy token trực tiếp qua API REST (đáng tin cậy nhất) ──
  let token = '';
  try {
    const loginRes = await request.post(`${API_URL}/api/users/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      headers: { 'Content-Type': 'application/json' },
    });
    if (loginRes.ok()) {
      const data = await loginRes.json();
      token = data.token || '';
      if (token) {
        fs.writeFileSync(path.join(authDir, 'token.txt'), token, 'utf-8');
        console.log(`✅ Auth token saved → ${path.join(authDir, 'token.txt')}`);
      }
    } else {
      console.warn(`⚠️ API login failed: HTTP ${loginRes.status()}`);
    }
  } catch (e) {
    console.warn('⚠️ API login error:', e);
  }

  // ── Bước 2: Đăng nhập qua UI để có browser session ──
  await page.goto('/admin/login');
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"], input[placeholder*="admin"], input[placeholder*="email"], input[placeholder*="@"]').first();
  await emailInput.fill(ADMIN_EMAIL);

  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(ADMIN_PASSWORD);

  await page.getByRole('button', { name: /đăng nhập|login/i }).click();

  // Chờ redirect thoát khỏi /admin/login sang dashboard
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 }).catch(() => {
    console.warn('⚠️ UI did not redirect away from /login');
  });

  await page.waitForLoadState('networkidle');

  // Đảm bảo token được ghi vào localStorage của browser context
  if (token) {
    await page.evaluate((tok) => {
      localStorage.setItem('token', tok);
      localStorage.setItem('auth_token', tok);
    }, token);
  }

  // Lưu auth state (bao gồm localStorage & cookies)
  await page.context().storageState({ path: AUTH_FILE });
  console.log(`✅ Auth state saved → ${AUTH_FILE}`);

  // ── Bước 3: Backup – thử lấy token từ localStorage nếu bước 1 thất bại ──
  if (!token) {
    token = await page.evaluate(() => {
      return localStorage.getItem('token') ||
             localStorage.getItem('auth_token') ||
             (JSON.parse(localStorage.getItem('admin_session') || 'null') || {}).token || '';
    });
    if (token) {
      fs.writeFileSync(path.join(authDir, 'token.txt'), token, 'utf-8');
      console.log(`✅ Auth token saved (from localStorage) → ${path.join(authDir, 'token.txt')}`);
    } else {
      console.warn('⚠️ Could not get auth token - API tests may fail');
    }
  }
});
