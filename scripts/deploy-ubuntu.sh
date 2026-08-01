#!/usr/bin/env bash
# ==============================================================================
# Script Triển Khai 1-Click Docker Production trên Ubuntu 22.04 LTS (CTC Web)
# IP: 222.255.215.122 | Cấu hình: 4 Cores | 6GB RAM | 200Mbps Network
# ==============================================================================

set -e

echo "======================================================================"
echo "⚡ ĐANG TRIỂN KHAI CTC WEB PRODUCTION TRÊN UBUNTU 22.04 LTS"
echo "======================================================================"

# 1. Kiểm tra quyền sudo & Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Chưa tìm thấy Docker! Đang cài đặt Docker Engine..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# 2. Tối ưu hóa Kernel Ubuntu 22.04
if [ -f "./scripts/setup-ubuntu-kernel.sh" ]; then
    chmod +x ./scripts/setup-ubuntu-kernel.sh
    ./scripts/setup-ubuntu-kernel.sh
fi

# 3. Tạo thư mục chứa dữ liệu nếu chưa có
mkdir -p uploads nginx/ssl

# 4. Build & Start Docker Stack
echo "📦 Đang biên dịch Docker Images & khởi chạy Docker Containers..."
docker compose build --parallel
docker compose up -d

echo "⌛ Đang chờ hệ thống khởi động & kiểm tra Healthcheck (20s)..."
sleep 20

# 5. Kiểm tra trạng thái containers
echo "📊 TRẠNG THÁI CONTAINER DOCKER:"
docker compose ps

echo "======================================================================"
echo "🎉 TRIỂN KHAI HOÀN TẤT THÀNH CÔNG TRÊN UBUNTU 22.04!"
echo "🌐 Website: https://ctcdn.vn hoặc http://222.255.215.122"
echo "======================================================================"
