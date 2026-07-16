# 🧪 Test Hệ thống Phân quyền RBAC

## 📋 Test Users đã tạo:

| Role | Email | Password | Level | Quyền |
|------|-------|----------|-------|-------|
| **Super Admin** | superadmin@test.com | Test123! | 100 | Tất cả |
| **Admin** | admin@test.com | Test123! | 90 | Hầu hết |
| **Editor** | editor@test.com | Test123! | 50 | Tạo/sửa nội dung |
| **Author** | author@test.com | Test123! | 30 | Tạo nội dung |
| **Moderator** | moderator@test.com | Test123! | 40 | Sửa/xóa nội dung |
| **Viewer** | viewer@test.com | Test123! | 10 | Chỉ xem |

## 🎯 Test Cases:

### 1. **Test với Super Admin** (superadmin@test.com)
- ✅ Thấy tất cả menu trong sidebar
- ✅ Có nút Thêm/Sửa/Xóa ở mọi trang
- ✅ Truy cập được Settings và Security Monitoring
- ✅ Banner role hiển thị "Super Admin Level 100"

### 2. **Test với Admin** (admin@test.com)  
- ✅ Thấy hầu hết menu (trừ một số restricted)
- ✅ Có quyền quản lý users và roles
- ✅ Truy cập được Settings và Security
- ✅ Banner role hiển thị "Admin Level 90"

### 3. **Test với Editor** (editor@test.com)
- ✅ Thấy menu: Dashboard, Content, Categories
- ✅ Có nút Thêm/Sửa trong Content Management
- ❌ Không thấy menu Users, Settings, Security
- ✅ Banner role hiển thị "Editor Level 50"

### 4. **Test với Author** (author@test.com)
- ✅ Thấy menu: Dashboard, Content
- ✅ Có nút Thêm trong Content (tạo nội dung)
- ❌ Không có nút Sửa/Xóa
- ❌ Không thấy Categories, Users
- ✅ Banner role hiển thị "Author Level 30"

### 5. **Test với Moderator** (moderator@test.com)
- ✅ Thấy menu: Dashboard, Content, Contacts
- ✅ Có nút Sửa/Xóa trong Content
- ❌ Không thấy Users, Settings
- ✅ Banner role hiển thị "Moderator Level 40"

### 6. **Test với Viewer** (viewer@test.com)
- ✅ Chỉ thấy menu Dashboard
- ❌ Không có nút Thêm/Sửa/Xóa nào
- ❌ Truy cập Settings/Security sẽ hiện AccessDenied
- ✅ Banner role hiển thị "Viewer Level 10"

## 🔧 Test Steps:

### Bước 1: Login với từng role
```
URL: http://localhost:3001/admin/#/admin/login
```

### Bước 2: Kiểm tra Sidebar Menu
- Xem menu nào hiển thị
- Kiểm tra role badge

### Bước 3: Test Content Management  
```
URL: http://localhost:3001/admin/#/admin/content
```
- Kiểm tra nút "Thêm mới"
- Kiểm tra nút Edit/Delete trên từng item

### Bước 4: Test User Management
```
URL: http://localhost:3001/admin/#/admin/users
```
- Admin/Super Admin: Thấy tất cả
- Editor trở xuống: AccessDenied

### Bước 5: Test Settings
```
URL: http://localhost:3001/admin/#/admin/settings  
```
- Level 90+: Truy cập được
- Level <90: AccessDenied

### Bước 6: Test Security Monitoring
```
URL: http://localhost:3001/admin/#/admin/security
```
- Level 90+: Truy cập được  
- Level <90: AccessDenied

## ✅ Expected Results:

| Feature | Super Admin | Admin | Editor | Author | Moderator | Viewer |
|---------|-------------|-------|--------|--------|-----------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Content Menu | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Add Content | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Content | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Delete Content | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Categories | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Security | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🚀 Quick Test Command:
```bash
# Tạo test users (đã chạy)
npx tsx server/scripts/create-test-users.ts

# Test API endpoints
curl http://localhost:4000/api/permissions/roles
curl http://localhost:4000/api/permissions/user-permissions
```
