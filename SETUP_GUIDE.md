# 📘 Hướng Dẫn Cài Đặt & Vận Hành Hệ Thống — CTC Web

Tài liệu này hướng dẫn cách thiết lập môi trường phát triển (Dev) và môi trường sản xuất (Docker Production) cho dự án website **Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)**.

---

## 🛠️ Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
1.  **Node.js**: Phiên bản `18.x` hoặc cao hơn (khuyên dùng `v20.x`).
2.  **MongoDB**: Phiên bản `6.x` hoặc `7.x` (đang chạy local tại cổng `27017`).
3.  *(Tùy chọn)* **Docker & Docker Compose**: Nếu bạn muốn deploy nhanh bằng container.

---

## 🚀 Cách 1: Cài Đặt và Chạy Local (Môi trường Phát triển)

### Bước 1: Cài đặt và Khởi tạo cấu hình lần đầu
Chạy script tự động thiết lập các thư mục cần thiết (`uploads`, `logs`), cài đặt thư viện (`node_modules`) và tạo file `.env.local`:
```bash
npm run setup-first-time
```
> 💡 *Sau bước này, một file `.env.local` sẽ được tạo ra ở thư mục gốc. Bạn có thể mở ra để chỉnh cấu hình MongoDB URI nếu cần.*

### Bước 2: Nạp dữ liệu mẫu (Seed Data) vào Database
Nạp tự động 253 bản ghi dữ liệu thực tế (dự án, sản phẩm, tin tức, đối tác, tài khoản admin...) từ thư mục `seed-data/`:
```bash
npm run import-data
```

### Bước 3: Khởi chạy ứng dụng
Chạy lệnh song song khởi động cả Front-end (Vite - cổng `3000`) và Back-end (Express - cổng `4000`):
```bash
npm run dev
```

*   **Website (Giao diện chính):** [http://localhost:3000](http://localhost:3000)
*   **Trang Quản trị (Admin Dashboard):** [http://localhost:3000/#/login](http://localhost:3000/#/login)
*   **Tài khoản Admin mặc định:**
    *   *Email:* `admin@tranle.com`
    *   *Mật khẩu:* `TranLe@2024`

---

## 🐳 Cách 2: Triển Khai Bằng Docker (Khuyên dùng khi chạy thật)

Kiến trúc Docker sử dụng **Nginx** làm reverse proxy bảo mật phía trước, định tuyến `/api` tới server Node.js và serve ứng dụng React đã build tĩnh.

### Bước 1: Khởi tạo biến môi trường
Tạo file `.env` cho docker từ template có sẵn:
```bash
cp .env.docker .env
```
> ⚠️ *Hãy mở file `.env` vừa tạo và đổi lại các mật khẩu an toàn như `JWT_SECRET`, `MONGO_ROOT_PASS`, `ADMIN_PASSWORD` trước khi chạy.*

### Bước 2: Build và chạy container
Khởi chạy ngầm toàn bộ 3 dịch vụ (`ctc_mongo` + `ctc_app` + `ctc_nginx`):
```bash
docker compose up -d --build
```

### Bước 3: Import dữ liệu mẫu vào Docker Database
Nạp dữ liệu vào container MongoDB đang chạy thông qua ứng dụng:
```bash
docker compose exec app npm run import-data
```

### Bước 4: Kiểm tra ứng dụng
*   **Website:** [http://localhost](http://localhost) (Cổng `80` hoặc `443` thông qua Nginx)
*   **Xem logs ứng dụng:** `docker compose logs -f app`
*   **Dừng hệ thống:** `docker compose down`

---

## 📋 Các Lệnh Tiện Ích Thường Dùng

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run export-data` | Xuất toàn bộ dữ liệu database hiện tại ra thư mục `exports/backup-<time>` để sao lưu |
| `npm run import-data` | Import dữ liệu mặc định từ thư mục `seed-data` |
| `npm run import-data <path>` | Import dữ liệu từ một thư mục backup cụ thể |
| `npm run seed-admin` | Tạo lại tài khoản quản trị Admin mặc định |
| `npm run build` | Biên dịch dự án (TypeScript + Vite build) để chuẩn bị chạy thật |
| `npm run server` | Chạy riêng API Server ở cổng `4000` (đã nạp file tĩnh từ thư mục `dist/`) |

---

## 📁 Cấu Trúc Các File Cấu Hình Docker & Script

*   [Dockerfile](file:///e:/web_CTC_new/Dockerfile): Cấu hình đóng gói ứng dụng (Multi-stage build tối ưu kích thước).
*   [docker-compose.yml](file:///e:/web_CTC_new/docker-compose.yml): Cấu hình chạy 3 container liên kết với nhau.
*   [nginx/nginx.conf](file:///e:/web_CTC_new/nginx/nginx.conf): Cấu hình định tuyến, nén Gzip, bảo mật HTTP Headers.
*   [seed-data/](file:///e:/web_CTC_new/seed-data): Thư mục chứa toàn bộ dữ liệu JSON được backup từ cơ sở dữ liệu gốc.
