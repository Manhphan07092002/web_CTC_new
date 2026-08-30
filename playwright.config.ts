import { defineConfig, devices } from '@playwright/test';

/**
 * ================================================================
 * PLAYWRIGHT CONFIG - CTCDN.VN FULL SYSTEM TEST SUITE
 * ================================================================
 * Bộ kiểm thử toàn diện cho hệ thống quản trị và public website.
 *
 * Sử dụng:
 *   npx playwright test                         # Chạy tất cả test
 *   npx playwright test --headed                # Hiển thị browser
 *   npx playwright test tests/e2e/01-nav.spec.ts    # Chạy 1 file test
 *   npx playwright test --reporter=html         # Sinh báo cáo HTML
 *   npx playwright show-report                  # Mở báo cáo
 * ================================================================
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],

  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    // === Setup: Login một lần, lưu auth state ===
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // === Chrome Desktop (Primary) ===
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // === Firefox ===
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // === Tablet ===
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // === Mobile ===
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
  ],
});
