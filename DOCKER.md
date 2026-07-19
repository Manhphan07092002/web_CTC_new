# 🐳 Docker Deployment Guide — CTC Web

## Cấu trúc files Docker

```
├── Dockerfile          # Multi-stage build (Vite + Express)
├── docker-compose.yml  # 3 services: mongo, app, nginx
├── .dockerignore       # Loại trừ node_modules, .env, dist...
├── .env.docker         # Template biến môi trường cho Docker
└── nginx/
    └── nginx.conf      # Nginx reverse proxy config
```

---

## 🚀 Chạy lần đầu

### 1. Tạo file `.env` từ template
```bash
cp .env.docker .env
```
> Chỉnh sửa `.env`: đổi `JWT_SECRET`, `ADMIN_PASSWORD`, SMTP email, domain...

### 2. Build và khởi động toàn bộ
```bash
docker compose up -d --build
```

### 3. Kiểm tra trạng thái
```bash
docker compose ps
docker compose logs -f app
```

### 4. Mở trình duyệt
- **Website:** http://localhost
- **API:** http://localhost/api
- **MongoDB:** localhost:27017

---

## 📦 Kiến trúc

```
Internet
    │
  :80/:443
    │
[ Nginx ] ──── /api/*  ────► [ Express App :4000 ]
              /uploads/*              │
              /*  (SPA)              MongoDB :27017
```

| Service | Image | Port |
|---------|-------|------|
| `mongo` | mongo:7 | 27017 |
| `app` | (build local) | 4000 (internal) |
| `nginx` | nginx:alpine | 80, 443 |

---

## 🔧 Các lệnh thường dùng

```bash
# Khởi động (nền)
docker compose up -d

# Build lại sau khi sửa code
docker compose up -d --build

# Xem log realtime
docker compose logs -f

# Dừng tất cả
docker compose down

# Dừng + xóa volumes (⚠️ mất data MongoDB)
docker compose down -v

# Chạy lệnh trong container app
docker compose exec app sh

# Backup MongoDB
docker compose exec mongo mongodump \
  --uri="mongodb://admin:ctcadmin2024@localhost:27017/ctc_web_new?authSource=admin" \
  --out=/dump
```

---

## 🔒 HTTPS (Production)

1. Đặt cert vào `nginx/ssl/fullchain.pem` và `nginx/ssl/privkey.pem`
2. Bỏ comment block HTTPS trong `nginx/nginx.conf`
3. Đổi `FRONTEND_URL` và `CORS_ORIGIN` trong `.env` sang `https://yourdomain.com`
4. `docker compose up -d --build`

---

## ⚠️ Lưu ý

- `uploads/` được mount dưới dạng **named volume** — data không mất khi rebuild
- MongoDB data lưu trong volume `mongo_data` — không xóa với `docker compose down`
- File `.env` không được commit lên git (đã có trong `.gitignore`)
