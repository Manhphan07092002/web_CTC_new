#!/usr/bin/env bash
# ==============================================================================
# Script tối ưu hóa Linux Kernel Sysctl cho Ubuntu 22.04 LTS (CTC Web Server)
# Cấu hình phần cứng: 4 Cores | 6GB RAM | 200Mbps Network
# ==============================================================================

set -e

echo "🚀 Đang tối ưu hóa Kernel Linux Sysctl trên Ubuntu 22.04..."

SYSCTL_CONF="/etc/sysctl.d/99-ctc-performance.conf"

cat << 'EOF' | sudo tee $SYSCTL_CONF > /dev/null
# --- Tăng số lượng kết nối tối đa chờ xử lý trong queue ---
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# --- Bật TCP SYN Cookies chống tấn công SYN Flood DDoS ---
net.ipv4.tcp_syncookies = 1

# --- Tái sử dụng nhanh kết nối TCP (TIME_WAIT socket reuse) ---
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# --- Tối ưu hóa Buffer mạng phù hợp với đường truyền 200Mbps ---
net.core.rmem_default = 262144
net.core.wmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# --- Tăng giới hạn số lượng mở File Descriptors (Open Files Limit) ---
fs.file-max = 2097152

# --- Tối ưu hóa Swap & Bộ nhớ RAM (Tối đa hóa RAM 6GB) ---
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

# Áp dụng cấu hình ngay lập tức
sudo sysctl --system

echo "✅ Đã tối ưu hóa Kernel Linux Ubuntu 22.04 thành công!"
