#!/bin/bash
# ============================================================
# run-tests-docker.sh  — Chạy E2E Test toàn bộ hệ thống CTDN.VN trên server
# ============================================================
# Cách chạy trên server:
#   chmod +x run-tests-docker.sh
#   ./run-tests-docker.sh
#
# Tùy chọn:
#   ./run-tests-docker.sh --module nav          # Chỉ chạy test Navigation
#   ./run-tests-docker.sh --module categories   # Chỉ chạy test Danh mục
#   ./run-tests-docker.sh --module api          # Chỉ chạy test API/Performance
#   ./run-tests-docker.sh --rebuild             # Build lại image trước khi test
# ============================================================

set -e

# ── Màu sắc ─────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()    { echo -e "${CYAN}▶ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn()    { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error()   { echo -e "${RED}❌ $1${NC}"; }

# ── Parse tham số ───────────────────────────────────────────
MODULE="all"
REBUILD=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --module|-m) MODULE="$2"; shift 2 ;;
    --rebuild|-r) REBUILD=true; shift ;;
    *) shift ;;
  esac
done

# ── Chọn file test theo module ───────────────────────────────
case "$MODULE" in
  nav)        TEST_FILE="tests/e2e/01-nav.spec.ts" ;;
  categories) TEST_FILE="tests/e2e/02-categories.spec.ts" ;;
  products)   TEST_FILE="tests/e2e/03-products.spec.ts" ;;
  news)       TEST_FILE="tests/e2e/04-news.spec.ts" ;;
  projects)   TEST_FILE="tests/e2e/05-projects.spec.ts" ;;
  users)      TEST_FILE="tests/e2e/06-users.spec.ts" ;;
  seo)        TEST_FILE="tests/e2e/07-seo.spec.ts" ;;
  responsive) TEST_FILE="tests/e2e/08-responsive.spec.ts" ;;
  data)       TEST_FILE="tests/e2e/09-data-integrity.spec.ts" ;;
  search)     TEST_FILE="tests/e2e/10-search-filter-pagination.spec.ts" ;;
  forms)      TEST_FILE="tests/e2e/11-form-validation.spec.ts" ;;
  api)        TEST_FILE="tests/e2e/12-api-errors-performance.spec.ts" ;;
  all|*)      TEST_FILE="" ;;
esac

# ── Header ──────────────────────────────────────────────────
echo ""
echo "=============================================="
echo "  CTCDN.VN — E2E Test Suite (Docker Mode)"
echo "=============================================="
echo "  Module   : $MODULE"
echo "  Test file: ${TEST_FILE:-'ALL'}"
echo "  Rebuild  : $REBUILD"
echo "  Time     : $(date '+%Y-%m-%d %H:%M:%S')"
echo "=============================================="
echo ""

# ── Kiểm tra Docker đang chạy ───────────────────────────────
if ! docker info >/dev/null 2>&1; then
  log_error "Docker không chạy! Hãy start Docker trước."
  exit 1
fi

# ── Kiểm tra network ctc_network tồn tại ───────────────────
if ! docker network ls | grep -q ctc_network; then
  log_warn "Network ctc_network chưa tồn tại."
  log_info "Hãy chắc chắn stack chính đang chạy: docker compose up -d"
  exit 1
fi

# ── Build image nếu cần ─────────────────────────────────────
if [ "$REBUILD" = true ] || ! docker image ls | grep -q "ctc-playwright"; then
  log_info "Build Docker image Playwright..."
  docker build -f Dockerfile.test -t ctc-playwright . --no-cache
  log_success "Build xong!"
fi

# ── Dọn container cũ nếu còn ────────────────────────────────
docker rm -f ctc_playwright 2>/dev/null || true

# ── Tạo thư mục output ──────────────────────────────────────
mkdir -p playwright-report test-results

# ── Build playwright command ────────────────────────────────
if [ -n "$TEST_FILE" ]; then
  PLAYWRIGHT_CMD="npx playwright test $TEST_FILE --project=chromium-desktop --reporter=html,list"
else
  PLAYWRIGHT_CMD="npx playwright test --project=chromium-desktop --reporter=html,list"
fi

log_info "Chờ app sẵn sàng và chạy tests..."
echo "Lệnh: $PLAYWRIGHT_CMD"
echo ""

# ── Chạy test container ─────────────────────────────────────
START_TIME=$(date +%s)

docker run --rm \
  --name ctc_playwright \
  --network ctc_network \
  -e TEST_BASE_URL="${TEST_BASE_URL:-http://nginx:80}" \
  -e TEST_API_URL="${TEST_API_URL:-http://app:4000}" \
  -e TEST_ADMIN_EMAIL="${TEST_ADMIN_EMAIL:-admin@ctcdn.vn}" \
  -e TEST_ADMIN_PASSWORD="${TEST_ADMIN_PASSWORD:-Ctcdn.vn@123}" \
  -e CI=true \
  -e PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
  -v "$(pwd)/playwright-report:/app/playwright-report" \
  -v "$(pwd)/test-results:/app/test-results" \
  ctc-playwright \
  sh -c "
    echo '⏳ Đợi app...' &&
    max=30; i=0
    until wget -q --spider http://app:4000/health 2>/dev/null || [ \$i -ge \$max ]; do
      sleep 3; i=\$((i+1));
      echo \"  Lần \$i/\$max: app chưa sẵn sàng...\";
    done &&
    if [ \$i -ge \$max ]; then echo '❌ App timeout!'; exit 1; fi &&
    echo '✅ App sẵn sàng!' &&
    $PLAYWRIGHT_CMD
  "

EXIT_CODE=$?
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "=============================================="
echo "  KẾT QUẢ"
echo "=============================================="
echo "  Thời gian: ${MINUTES}m ${SECONDS}s"
echo "  Exit code: $EXIT_CODE"

if [ $EXIT_CODE -eq 0 ]; then
  log_success "TẤT CẢ TESTS PASSED!"
else
  log_error "CÓ TESTS FAILED! Xem báo cáo:"
  echo "  📁 playwright-report/index.html"
fi
echo "=============================================="
echo ""

# ── Hiện đường dẫn báo cáo ──────────────────────────────────
if [ -f "playwright-report/index.html" ]; then
  log_info "Báo cáo HTML: $(pwd)/playwright-report/index.html"
  log_info "Mở trên máy tính: npx playwright show-report"
fi

exit $EXIT_CODE
