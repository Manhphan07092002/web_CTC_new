# 🧪 Bộ Kiểm Thử E2E — CTCDN.VN

Bộ test tự động toàn diện cho hệ thống **CTCDN.VN** sử dụng **Playwright Test**.

---

## 📁 Cấu Trúc

```
tests/e2e/
├── auth.setup.ts                     # Đăng nhập admin, lưu session
├── helpers.ts                        # Hàm tiện ích dùng chung
├── 01-nav.spec.ts                    # NAV-01→10: Menu chính & điều hướng
├── 02-categories.spec.ts             # CAT-001→032: Danh mục phân cấp CRUD
├── 03-products.spec.ts               # PROD-001→020: Sản phẩm CRUD, slug, upload
├── 04-news.spec.ts                   # NEWS-001→020: Tin tức CRUD, draft/publish
├── 05-projects.spec.ts               # PROJECT-001→020: Dự án CRUD
├── 06-users.spec.ts                  # USER-001→020: Người dùng, phân quyền, bảo mật
├── 07-seo.spec.ts                    # SEO: title, meta, H1, OG, sitemap, robots
├── 08-responsive.spec.ts             # RESP: 8 kích thước màn hình Desktop/Tablet/Mobile
├── 09-data-integrity.spec.ts         # DATA: tính toàn vẹn, quan hệ, trùng lặp
├── 10-search-filter-pagination.spec.ts # SEARCH/FILTER/PAGE: tìm kiếm, lọc, phân trang
├── 11-form-validation.spec.ts        # FORM: validation, edge cases, upload
└── 12-api-errors-performance.spec.ts # API: lỗi 4xx/5xx, SQL Injection, performance
```

---

## 🚀 Hướng Dẫn Sử Dụng

### Bước 1: Đảm bảo server đang chạy

```bash
# Terminal 1: Chạy Backend
npm run dev:server

# Terminal 2: Chạy Frontend
npm run dev:client
```

### Bước 2: Cài Playwright browsers (lần đầu)

```bash
npm run test:install
# hoặc
npx playwright install chromium firefox
```

### Bước 3: Chạy tests

```bash
# Chạy TẤT CẢ tests (headless - không hiển thị browser)
npm test

# Chạy với browser hiển thị (tiện debug)
npm run test:headed

# Chạy UI mode (giao diện đẹp, chọn test riêng)
npm run test:ui

# Xem báo cáo HTML sau khi test
npm run test:report
```

### Chạy từng nhóm test

```bash
npm run test:nav         # Menu & Navigation
npm run test:categories  # Danh mục sản phẩm
npm run test:products    # Sản phẩm
npm run test:news        # Tin tức
npm run test:projects    # Dự án
npm run test:users       # Người dùng & Phân quyền
npm run test:seo         # SEO & Meta tags
npm run test:responsive  # Responsive Mobile/Tablet
npm run test:data        # Tính toàn vẹn dữ liệu
npm run test:search      # Tìm kiếm & Phân trang
npm run test:forms       # Form Validation
npm run test:api         # API Errors & Performance
```

### Sử dụng script PowerShell (tiện hơn)

```powershell
# Chạy tất cả
.\run-tests.ps1

# Chỉ test danh mục, hiển thị browser
.\run-tests.ps1 -Module categories -Headed

# Test sản phẩm, tự mở báo cáo
.\run-tests.ps1 -Module products -Report

# Test với URL production
.\run-tests.ps1 -BaseUrl https://ctcdn.vn -ApiUrl https://ctcdn.vn
```

---

## ⚙️ Cấu Hình

### Biến môi trường

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `TEST_BASE_URL` | `http://localhost:3000` | URL frontend |
| `TEST_API_URL` | `http://localhost:4000` | URL backend API |
| `TEST_ADMIN_EMAIL` | `admin@ctcdn.vn` | Email admin để login |
| `TEST_ADMIN_PASSWORD` | `Admin@123` | Mật khẩu admin |

```bash
# Ví dụ: test trên VPS staging
TEST_BASE_URL=https://staging.ctcdn.vn TEST_API_URL=https://staging.ctcdn.vn npm test
```

### `playwright.config.ts`

- **Timeout**: 30 giây/test, 10 giây/action
- **Projects**: chromium-desktop, firefox-desktop, tablet (iPad), mobile (Pixel 7)
- **Auth**: Tự động login admin qua `auth.setup.ts`, tái sử dụng session

---

## 📊 Danh Sách Test Cases

### 🔗 NAV — Navigation (12 tests)
| ID | Nội dung |
|----|---------|
| NAV-01 | Website tải thành công |
| NAV-02..06 | Điều hướng 5 trang chính |
| NAV-07 | Logo về trang chủ |
| NAV-08 | Menu không vỡ mobile 375px |
| NAV-09 | Menu active state đúng |
| NAV-10 | Nhiều trang không vỡ layout |

### 📂 CAT — Danh mục (18 tests)
| ID | Nội dung |
|----|---------|
| CAT-001 | Mặc định chỉ hiện cấp 1 |
| CAT-002..004 | Accordion expand/collapse |
| CAT-010..015 | Tạo danh mục + validation |
| CAT-020..021 | Sửa danh mục |
| CAT-030..032 | Xóa có kiểm tra con/sản phẩm |
| CAT-UI-01..04 | Giao diện Admin UI |

### 📦 PROD — Sản phẩm (15 tests)
| ID | Nội dung |
|----|---------|
| PROD-001 | Tạo đầy đủ thông tin |
| PROD-002 | Tên rỗng bị từ chối |
| PROD-003 | Giá âm bị từ chối |
| PROD-004 | Giá = 0 → "Liên hệ" |
| PROD-020 | Xóa và xác nhận 404 |
| PROD-SLUG | Slug hợp lệ, URL không 404 |
| PROD-UI | Double-click không tạo 2 bản ghi |

### 📰 NEWS — Tin tức (8 tests)
| ID | Nội dung |
|----|---------|
| NEWS-001..003 | CRUD + draft/published/hidden |
| NEWS-006 | URL slug không 404 |

### 👤 USER — Người dùng (10 tests)
| ID | Nội dung |
|----|---------|
| USER-001..007 | CRUD, email trùng, tên rỗng |
| SEC-001..004 | Unauth 401, XSS, không lộ password |

### 🔍 SEO (7 tests)
- Title, Meta description, H1, OG tags, Canonical, robots.txt, sitemap.xml

### 📱 RESPONSIVE (5 tests)
- 8 viewport sizes từ 375px → 1920px
- Hamburger menu mobile
- Modal sizing, image overflow

### 🔒 DATA INTEGRITY (9 tests)
- Số lượng khớp API vs UI
- parentId hợp lệ
- Không mất sản phẩm khi chuyển danh mục
- Không tạo bản ghi trùng

### 🔎 SEARCH/FILTER/PAGINATION (8 tests)
- Case-insensitive search
- Ký tự đặc biệt không crash
- Lọc danh mục, giá
- Phân trang không trùng dữ liệu

### 📝 FORM VALIDATION (6 tests)
- Tên 1000 ký tự, HTML injection
- Tiếng Việt, Unicode
- Enter không gửi 2 lần
- Hủy không tạo dữ liệu
- Upload file độc hại bị từ chối

### ⚡ API & PERFORMANCE (12 tests)
- 404/400/401 responses
- Error message rõ ràng (không null/undefined)
- SQL Injection không crash
- Tải trang < 3 giây
- 6 requests đồng thời

---

## 🎯 Tổng Cộng: ~105 Test Cases

---

## 🏷️ Sau Khi Chạy

1. **Xem báo cáo**: `npm run test:report` → mở browser với báo cáo HTML đẹp
2. **Video lỗi**: Saved tại `playwright-report/` khi test fail
3. **Screenshots lỗi**: Tự động capture khi fail
4. **Kết quả JSON**: `playwright-report/results.json`

---

## 💡 Tips

- Chạy `npm run test:api` trước để đảm bảo backend hoạt động
- Dùng `--headed` để xem browser thực thi từng bước
- Dùng `--debug` để pause và inspect từng bước
- Tests có cleanup tự động sau khi chạy (xóa dữ liệu test)
