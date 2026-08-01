import http from 'http';
import https from 'https';

const BASE_URL = process.env.TEST_URL || 'http://localhost:4000';
const parsedUrl = new URL(BASE_URL);
const isHttps = parsedUrl.protocol === 'https:';
const httpModule = isHttps ? https : http;

/**
 * Run a load test scenario
 * @param {string} name - Name of the test
 * @param {string} path - URL path
 * @param {string} method - HTTP method
 * @param {object|null} body - Request payload for POST/PUT
 * @param {number} concurrency - Number of concurrent connections
 * @param {number} durationSec - Duration of test in seconds
 */
async function runScenario({ name, path, method = 'GET', body = null, concurrency = 50, durationSec = 5 }) {
  console.log(`\n==================================================`);
  console.log(`🚀 RUNNING LOAD TEST: [${name}]`);
  console.log(`📍 Endpoint: ${method} ${BASE_URL}${path}`);
  console.log(`⚙️  Concurrency: ${concurrency} connections | Duration: ${durationSec}s`);
  console.log(`==================================================`);

  const payloadData = body ? JSON.stringify(body) : null;
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'CTC-LoadTester/1.0',
    ...(payloadData ? {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payloadData)
    } : {})
  };

  const agent = new httpModule.Agent({
    keepAlive: true,
    maxSockets: concurrency * 2,
  });

  let totalRequests = 0;
  let successRequests = 0;
  let errorRequests = 0;
  let totalBytes = 0;
  const latencies = [];
  const statusCodes = {};

  const startTime = Date.now();
  const endTime = startTime + durationSec * 1000;
  let isRunning = true;

  const sendRequest = () => {
    return new Promise((resolve) => {
      if (!isRunning && Date.now() >= endTime) {
        return resolve();
      }

      const reqStart = Date.now();
      const req = httpModule.request(BASE_URL + path, {
        method,
        headers,
        agent,
        timeout: 5000,
      }, (res) => {
        let bodyLength = 0;
        res.on('data', (chunk) => {
          bodyLength += chunk.length;
        });

        res.on('end', () => {
          const reqDuration = Date.now() - reqStart;
          totalRequests++;
          totalBytes += bodyLength;
          latencies.push(reqDuration);
          statusCodes[res.statusCode] = (statusCodes[res.statusCode] || 0) + 1;

          if (res.statusCode >= 200 && res.statusCode < 400) {
            successRequests++;
          } else {
            errorRequests++;
          }
          resolve();
        });
      });

      req.on('error', (err) => {
        const reqDuration = Date.now() - reqStart;
        totalRequests++;
        errorRequests++;
        latencies.push(reqDuration);
        statusCodes['ERR'] = (statusCodes['ERR'] || 0) + 1;
        resolve();
      });

      req.on('timeout', () => {
        req.destroy(new Error('Timeout'));
      });

      if (payloadData) {
        req.write(payloadData);
      }
      req.end();
    });
  };

  // Worker loop for each concurrent virtual user
  const worker = async () => {
    while (Date.now() < endTime) {
      await sendRequest();
    }
  };

  // Launch workers
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  isRunning = false;

  const actualDuration = (Date.now() - startTime) / 1000;
  const rps = (totalRequests / actualDuration).toFixed(2);
  const throughputMB = (totalBytes / (1024 * 1024) / actualDuration).toFixed(2);

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avg = latencies.length ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2) : 0;
  const min = latencies[0] || 0;
  const max = latencies[latencies.length - 1] || 0;

  console.log(`\n📊 KẾT QUẢ KIỂM THỬ: ${name}`);
  console.log(`--------------------------------------------------`);
  console.log(`⏱️  Thời gian chạy thực tế : ${actualDuration.toFixed(2)} giây`);
  console.log(`📈 Tổng số Request        : ${totalRequests}`);
  console.log(`✅ Thành công (2xx/3xx)   : ${successRequests} (${((successRequests / totalRequests) * 100 || 0).toFixed(2)}%)`);
  console.log(`❌ Lỗi / Rate Limit (4xx+) : ${errorRequests} (${((errorRequests / totalRequests) * 100 || 0).toFixed(2)}%)`);
  console.log(`⚡ Tốc độ xử lý (RPS)    : ${rps} req/sec`);
  console.log(`📦 Băng thông             : ${throughputMB} MB/sec`);
  console.log(`\n⏱️  ĐỘ TRỄ (LATENCY):`);
  console.log(`   - Min    : ${min} ms`);
  console.log(`   - Average: ${avg} ms`);
  console.log(`   - P50    : ${p50} ms`);
  console.log(`   - P90    : ${p90} ms`);
  console.log(`   - P95    : ${p95} ms`);
  console.log(`   - P99    : ${p99} ms`);
  console.log(`   - Max    : ${max} ms`);
  console.log(`\n📋 Mã Trạng Thái HTTP (Status Codes):`, statusCodes);
  console.log(`--------------------------------------------------`);

  return {
    name,
    totalRequests,
    successRequests,
    errorRequests,
    rps: parseFloat(rps),
    throughputMB: parseFloat(throughputMB),
    avgLatency: parseFloat(avg),
    p50,
    p95,
    p99,
    statusCodes
  };
}

async function main() {
  console.log(`🔥 ĐANG KHỞI CHẠY CHƯƠNG TRÌNH PHÂN TÍCH ĐỘ CHỊU TẢI CTC WEB...`);
  console.log(`🎯 Server: ${BASE_URL}`);

  try {
    // 1. Health check
    await new Promise((resolve, reject) => {
      const req = httpModule.get(`${BASE_URL}/api`, (res) => {
        if (res.statusCode === 200) resolve();
        else reject(new Error(`Server returned status code ${res.statusCode}`));
      });
      req.on('error', reject);
    });
    console.log(`✅ Server đang hoạt động tốt trên ${BASE_URL}\n`);
  } catch (err) {
    console.error(`❌ Không thể kết nối tới server tại ${BASE_URL}. Vui lòng khởi động server bằng 'npm run dev' hoặc 'npm start'.`);
    console.error(`Lỗi:`, err.message);
    process.exit(1);
  }

  const report = [];

  // Kịch bản 1: Root / API Welcome (Tải Nhẹ / Health)
  report.push(await runScenario({
    name: '1. Root / API Welcome (Tải Nhẹ / Health)',
    path: '/api',
    concurrency: 50,
    durationSec: 5
  }));

  // Kịch bản 2: API Cached Endpoint (Products list)
  report.push(await runScenario({
    name: '2. GET /api/products (API có In-Memory Cache)',
    path: '/api/products',
    concurrency: 50,
    durationSec: 5
  }));

  // Kịch bản 3: Heavy DB Search Query
  report.push(await runScenario({
    name: '3. GET /api/products?search=pin (MongoDB Search Heavy)',
    path: '/api/products?search=pin',
    concurrency: 50,
    durationSec: 5
  }));

  // Kịch bản 4: Form Write Submission
  report.push(await runScenario({
    name: '4. POST /api/contact/submit (Write DB & Anti-Spam)',
    path: '/api/contact/submit',
    method: 'POST',
    body: {
      name: 'Load Test User',
      email: 'loadtest@example.com',
      phone: '0901234567',
      service: 'Tư vấn Pin mặt trời',
      message: 'Đây là tin nhắn tự động từ script load test CTC Web'
    },
    concurrency: 10,
    durationSec: 5
  }));

  // Kịch bản 5: High Concurrency Stress Test (150 Virtual Users on Cached Route)
  report.push(await runScenario({
    name: '5. STRESS TEST (150 Concurrency - High Load)',
    path: '/api/products',
    concurrency: 150,
    durationSec: 7
  }));

  console.log(`\n==================================================`);
  console.log(`🎉 TỔNG HỢP BÁO CÁO PHÂN TÍCH ĐỘ CHỊU TẢI CTC WEB`);
  console.log(`==================================================`);
  console.table(report.map(r => ({
    'Kịch Bản': r.name,
    'RPS (Req/s)': r.rps,
    'P50 (ms)': r.p50,
    'P95 (ms)': r.p95,
    'P99 (ms)': r.p99,
    'Thành Công (%)': ((r.successRequests / r.totalRequests) * 100).toFixed(1) + '%',
    'Lỗi': r.errorRequests
  })));
}

main().catch(err => {
  console.error('Lỗi khi chạy load test:', err);
});
