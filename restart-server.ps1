# Script tự động restart server
Write-Host "🔄 Đang restart server..." -ForegroundColor Cyan

# Kill tất cả node processes
Write-Host "⏹️  Dừng server cũ..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Đợi 2 giây
Start-Sleep -Seconds 2

# Khởi động server mới
Write-Host "🚀 Khởi động server mới..." -ForegroundColor Green
Write-Host ""
Write-Host "Server sẽ chạy tại: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Nhấn Ctrl+C để dừng server" -ForegroundColor Gray
Write-Host ""

# Chạy server
npm run server
