#!/usr/bin/env pwsh
# ================================================================
# RUN-TESTS.PS1 — Script chạy toàn bộ E2E test CTCDN.VN
# ================================================================
# Sử dụng:
#   .\run-tests.ps1               # Chạy tất cả test (headless)
#   .\run-tests.ps1 -Headed       # Chạy với browser hiển thị
#   .\run-tests.ps1 -Module nav   # Chỉ chạy test navigation
#   .\run-tests.ps1 -Report       # Mở báo cáo sau khi test
# ================================================================

param(
    [switch]$Headed,
    [switch]$Report,
    [switch]$Debug,
    [string]$Module = "all",
    [string]$BaseUrl = "http://localhost:3000",
    [string]$ApiUrl  = "http://localhost:4000"
)

# Màu sắc output
function Write-Header($text) { Write-Host "`n▶ $text" -ForegroundColor Cyan }
function Write-Success($text) { Write-Host "✅ $text" -ForegroundColor Green }
function Write-Warning($text) { Write-Host "⚠️  $text" -ForegroundColor Yellow }
function Write-Fail($text)    { Write-Host "❌ $text" -ForegroundColor Red }

Write-Header "CTCDN.VN — E2E Test Suite"
Write-Host "  Base URL : $BaseUrl" -ForegroundColor Gray
Write-Host "  API URL  : $ApiUrl" -ForegroundColor Gray
Write-Host "  Module   : $Module" -ForegroundColor Gray
Write-Host ""

# Kiểm tra server đang chạy
$serverOk = $false
try {
    $resp = Invoke-WebRequest -Uri "$BaseUrl" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    $serverOk = $resp.StatusCode -lt 400
} catch {}

if (-not $serverOk) {
    Write-Warning "Frontend server ($BaseUrl) không phản hồi!"
    Write-Warning "Hãy chạy: npm run dev  trước khi test"
    Write-Host ""
}

$apiOk = $false
try {
    $resp = Invoke-WebRequest -Uri "$ApiUrl/api/product-categories" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    $apiOk = $resp.StatusCode -lt 400
} catch {}

if (-not $apiOk) {
    Write-Warning "Backend API ($ApiUrl) không phản hồi!"
    Write-Warning "Hãy chạy: npm run dev:server  trước khi test"
    Write-Host ""
}

# Cài browser nếu cần
if (-not (Test-Path "$env:USERPROFILE\AppData\Local\ms-playwright")) {
    Write-Header "Cài đặt Playwright browsers..."
    npx playwright install chromium
}

# Biến môi trường
$env:TEST_BASE_URL = $BaseUrl
$env:TEST_API_URL  = $ApiUrl

# Chọn file test
$testFile = switch ($Module) {
    "nav"        { "tests/e2e/01-nav.spec.ts" }
    "categories" { "tests/e2e/02-categories.spec.ts" }
    "products"   { "tests/e2e/03-products.spec.ts" }
    "news"       { "tests/e2e/04-news.spec.ts" }
    "projects"   { "tests/e2e/05-projects.spec.ts" }
    "users"      { "tests/e2e/06-users.spec.ts" }
    "seo"        { "tests/e2e/07-seo.spec.ts" }
    "responsive" { "tests/e2e/08-responsive.spec.ts" }
    "data"       { "tests/e2e/09-data-integrity.spec.ts" }
    "search"     { "tests/e2e/10-search-filter-pagination.spec.ts" }
    "forms"      { "tests/e2e/11-form-validation.spec.ts" }
    "api"        { "tests/e2e/12-api-errors-performance.spec.ts" }
    default      { "tests/e2e/" }
}

# Build lệnh playwright
$args = @($testFile, "--project=chromium-desktop", "--reporter=html,list")
if ($Headed) { $args += "--headed" }
if ($Debug)  { $args += "--debug" }

Write-Header "Chạy tests: $testFile"
$startTime = Get-Date

npx playwright test @args

$exitCode  = $LASTEXITCODE
$duration  = (Get-Date) - $startTime
$durationStr = "{0:mm}m {0:ss}s" -f $duration

Write-Host ""
Write-Header "Kết quả"
Write-Host "  Thời gian: $durationStr" -ForegroundColor Gray
Write-Host "  Exit code: $exitCode" -ForegroundColor Gray

if ($exitCode -eq 0) {
    Write-Success "Tất cả tests PASSED!"
} else {
    Write-Fail "Có tests FAILED! Kiểm tra báo cáo."
}

# Mở báo cáo
if ($Report -or $exitCode -ne 0) {
    Write-Header "Mở báo cáo HTML..."
    npx playwright show-report
}

exit $exitCode
