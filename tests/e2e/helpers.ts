/**
 * ================================================================
 * TEST HELPERS - Các hàm tiện ích dùng chung trong toàn bộ test suite
 * ================================================================
 */
import { Page, expect } from '@playwright/test';

import fs from 'fs';
import path from 'path';

// ─── Constants ───────────────────────────────────────────────────
export const BASE_URL  = process.env.TEST_BASE_URL  || 'http://localhost:3000';
export const API_URL   = process.env.TEST_API_URL   || 'http://127.0.0.1:4000';
export const ADMIN_URL = `${BASE_URL}/admin`;

// ─── API Helpers ─────────────────────────────────────────────────

export function getAuthToken(): string {
  try {
    const tokenFile = path.resolve(process.cwd(), 'playwright/.auth/token.txt');
    if (fs.existsSync(tokenFile)) {
      const val = fs.readFileSync(tokenFile, 'utf-8').trim();
      if (val) return val;
    }
  } catch {}

  try {
    const adminJsonPath = path.resolve(process.cwd(), 'playwright/.auth/admin.json');
    if (fs.existsSync(adminJsonPath)) {
      const data = JSON.parse(fs.readFileSync(adminJsonPath, 'utf-8'));
      const ls = data.origins?.[0]?.localStorage || [];
      const item = ls.find((x: any) => x.name === 'token' || x.name === 'auth_token');
      if (item?.value) return item.value;
    }
  } catch {}

  return '';
}

function getHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-auth-token'] = token;
  }
  return headers;
}

/** Gọi API GET và trả về JSON */
export async function apiGet(page: Page, path: string) {
  const res = await page.request.get(`${API_URL}/api${path}`, {
    headers: getHeaders(),
  });
  return { status: res.status(), body: await res.json().catch(() => null) };
}

/** Gọi API POST */
export async function apiPost(page: Page, path: string, data: object) {
  const res = await page.request.post(`${API_URL}/api${path}`, {
    data,
    headers: getHeaders(),
  });
  return { status: res.status(), body: await res.json().catch(() => null) };
}

/** Gọi API PUT */
export async function apiPut(page: Page, path: string, data: object) {
  const res = await page.request.put(`${API_URL}/api${path}`, {
    data,
    headers: getHeaders(),
  });
  return { status: res.status(), body: await res.json().catch(() => null) };
}

/** Gọi API DELETE */
export async function apiDelete(page: Page, path: string) {
  const res = await page.request.delete(`${API_URL}/api${path}`, {
    headers: getHeaders(),
  });
  return { status: res.status(), body: await res.json().catch(() => null) };
}

// ─── UI Helpers ──────────────────────────────────────────────────

/** Chờ toast thông báo xuất hiện và kiểm tra nội dung */
export async function expectToast(page: Page, text: string | RegExp) {
  const toast = page.locator('[class*="toast"], [role="alert"], [class*="notification"]').first();
  await expect(toast).toBeVisible({ timeout: 8000 });
  if (text) await expect(toast).toContainText(text);
}

/** Mở modal xác nhận xóa và click nút đồng ý */
export async function confirmDelete(page: Page) {
  // Chờ modal xác nhận xuất hiện
  const modal = page.locator('[role="dialog"], [class*="modal"], [class*="confirm"]').first();
  await expect(modal).toBeVisible({ timeout: 5000 });
  // Click nút xóa/đồng ý trong modal
  await page.getByRole('button', { name: /xóa|xác nhận|đồng ý|ok|delete|confirm/i }).last().click();
}

/** Kiểm tra không có lỗi JS trên trang */
export async function checkNoJsErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

/** Kiểm tra không có request 4xx/5xx */
export async function checkNoApiErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('response', res => {
    if (res.status() >= 400) {
      errors.push(`${res.status()} ${res.url()}`);
    }
  });
  return errors;
}

/** Tạo slug từ tên tiếng Việt */
export function toSlug(name: string): string {
  const map: Record<string, string> = {
    à:'a', á:'a', ả:'a', ã:'a', ạ:'a',
    ă:'a', ắ:'a', ằ:'a', ẵ:'a', ặ:'a', ẳ:'a',
    â:'a', ấ:'a', ầ:'a', ẫ:'a', ậ:'a', ẩ:'a',
    đ:'d',
    è:'e', é:'e', ẻ:'e', ẽ:'e', ẹ:'e',
    ê:'e', ế:'e', ề:'e', ể:'e', ễ:'e', ệ:'e',
    ì:'i', í:'i', ỉ:'i', ĩ:'i', ị:'i',
    ò:'o', ó:'o', ỏ:'o', õ:'o', ọ:'o',
    ô:'o', ố:'o', ồ:'o', ổ:'o', ỗ:'o', ộ:'o',
    ơ:'o', ớ:'o', ờ:'o', ở:'o', ỡ:'o', ợ:'o',
    ù:'u', ú:'u', ủ:'u', ũ:'u', ụ:'u',
    ư:'u', ứ:'u', ừ:'u', ử:'u', ữ:'u', ự:'u',
    ỳ:'y', ý:'y', ỷ:'y', ỹ:'y', ỵ:'y',
  };
  return name
    .toLowerCase()
    .split('')
    .map(c => map[c] || c)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Timestamp ngắn để tạo dữ liệu test không bị trùng */
export function ts(): string {
  return Date.now().toString(36).toUpperCase();
}
