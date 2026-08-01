import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { connectDB } from './db';
import { i18next, middleware as i18nMiddleware } from './i18n';
import { i18nHelpers } from './utils/i18n-helpers';

// Security Middleware (simplified)
import {
  generalRateLimiter,
  loginRateLimiter,
  uploadRateLimiter,
  securityHeaders,
  xssProtection,
  securityLogger,
  ipFilter,
  auditMiddleware,
} from './middleware/security-simple';

// Add error handler for uncaught exceptions during import
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception during startup:', error);
  process.exit(1);
});

// Route imports
import productsRouter from './routes/products';
import projectsRouter from './routes/projects';
import newsRouter from './routes/news';
import categoriesRouter from './routes/categories';
import productCategoriesRouter from './routes/product-categories';
import newsCategoriesRouter from './routes/news-categories';
import projectCategoriesRouter from './routes/project-categories';
import testimonialsRouter from './routes/testimonials';
import partnersRouter from './routes/partners';
import usersRouter from './routes/users';
import seedRouter from './routes/seed';
import uploadsRouter from './routes/uploads';
import teamRouter from './routes/team';
import settingsRouter from './routes/settings';
import statisticsRouter from './routes/statistics';
import notificationsRouter from './routes/notifications';
import seedNotificationsRouter from './routes/seed-notifications';
import contactRouter from './routes/contact';
import reviewsRouter from './routes/reviews';
import analyticsRouter from './routes/analytics';
import goalsRouter from './routes/goals';
import funnelMetricsRouter from './routes/funnel-metrics';
import securityMonitoringRouter from './routes/security-monitoring';
import securityRouter from './routes/security';
import permissionsRouter from './routes/permissions';
import i18nTestRouter from './routes/i18n-test';
import i18nRouter from './routes/i18n';
import translationsRouter from './routes/translations';
import i18nCacheRouter from './routes/i18n-cache';
import translationAdminRouter from './routes/translation';
import seoRouter from './routes/seo.js';
import slogansRouter from './routes/slogans.js';
import migrationRouter from './routes/migration.js';
import resourcesRouter from './routes/resources.js';
import documentCategoriesRouter from './routes/document-categories.js';
import ordersRouter from './routes/orders';
import searchRouter from './routes/search';
import aiWriterRouter from './routes/aiWriter';
import { startTranslationScheduler } from './services/translationScheduler.js';

// Load envs
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();

// ============================================
// SECURITY MIDDLEWARE (Thứ tự quan trọng!)
// ============================================

// 1. Trust proxy (chỉ tin tưởng loopback/Nginx local để tránh IP spoofing)
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');

// 2. Prerender for SEO - serve pre-rendered HTML to bots
// Only enable in production or when PRERENDER_TOKEN is set
if (process.env.PRERENDER_TOKEN || process.env.NODE_ENV === 'production') {
  try {
    const prerender = require('prerender-node');
    app.use(prerender
      .set('prerenderToken', process.env.PRERENDER_TOKEN || '')
      .set('protocol', 'https')
      .whitelisted([
        'googlebot',
        'bingbot', 
        'yandex',
        'baiduspider',
        'facebookexternalhit',
        'twitterbot',
        'rogerbot',
        'linkedinbot',
        'embedly',
        'quora link preview',
        'showyoubot',
        'outbrain',
        'pinterest',
        'slackbot',
        'vkShare',
        'W3C_Validator'
      ])
    );
    console.log('🤖 Prerender enabled for SEO bots');
  } catch (e) {
    console.log('⚠️ Prerender not configured (set PRERENDER_TOKEN for production)');
  }
}

// 3. IP Filter - chặn IP đen
app.use(ipFilter);

// 4. Security Headers
app.use(securityHeaders);

const corsOptionsDelegate = (req: express.Request, callback: (err: Error | null, options?: any) => void) => {
  const origin = req.header('Origin');
  const host = req.header('Host') || '';
  
  let isAllowed = false;
  
  if (!origin) {
    isAllowed = true;
  } else {
    // 1. Check if same-origin (same host, ignoring ports)
    let isSameHost = false;
    try {
      const originUrl = new URL(origin);
      isSameHost = originUrl.host.split(':')[0] === host.split(':')[0];
    } catch (e) {
      // Ignore URL parsing errors
    }
    
    // 2. Check whitelist configuration from env variables
    const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [];
    const envFrontend = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : [];

    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/, // Local network
      ...envOrigins,
      ...envFrontend
    ];
    
    const isWhitelisted = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });
    
    isAllowed = isSameHost || isWhitelisted;
  }

  const corsOptions = {
    origin: isAllowed || process.env.NODE_ENV !== 'production',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  };

  callback(null, corsOptions);
};
app.use('/api', cors(corsOptionsDelegate));

// 5. Rate Limiting - chống DDoS
app.use('/api/', generalRateLimiter);

// 6. Compression - tăng tốc độ tải (tốt cho SEO Core Web Vitals)
app.use(compression());

// 7. Body Parser với giới hạn kích thước
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. XSS Protection
app.use(xssProtection);

// 8. Security Logger - ghi log hoạt động đáng ngờ
app.use(securityLogger);

// 9. Audit Logger - ghi log tất cả hoạt động quan trọng
app.use(auditMiddleware);

// 10. i18n Middleware - đa ngôn ngữ
app.use(i18nMiddleware.handle(i18next));

// 11. i18n Helper Functions
app.use(i18nHelpers);

// ============================================
// STATIC FILES WITH 30-DAY BROWSER CACHING
// ============================================
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '30d',
  etag: true,
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
}));

const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath, {
  maxAge: '30d',
  etag: true,
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
}));

// ============================================
// ROUTES
// ============================================

app.get('/api', (req: any, res) => {
  const t = req.t;
  res.json({ 
    status: 'ok', 
    message: t ? t('greeting.welcome') : 'CTC Solar API server',
    security: 'enabled',
    language: req.language || 'vi',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/news', newsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/product-categories', productCategoriesRouter);
app.use('/api/news-categories', newsCategoriesRouter);
app.use('/api/project-categories', projectCategoriesRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/partners', partnersRouter);

// User routes with special rate limiting for login
// IMPORTANT: loginRateLimiter MUST be registered BEFORE the route handler
app.use('/api/users/login', loginRateLimiter);
app.use('/api/users', usersRouter);

// Other routes
app.use('/api/seed', seedRouter);
app.use('/api/uploads', uploadsRouter); // Remove rate limiting for uploads
app.use('/api/team', teamRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/seed-notifications', seedNotificationsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/funnel-metrics', funnelMetricsRouter);
app.use('/api/security-monitoring', securityMonitoringRouter);
app.use('/api/security', securityRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/i18n-test', i18nTestRouter);
app.use('/api/i18n', i18nRouter);
app.use('/api/translations', translationsRouter);
app.use('/api/i18n/cache', i18nCacheRouter);
app.use('/api/admin', translationAdminRouter);
app.use('/api/slogans', slogansRouter);
app.use('/api/migration', migrationRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/document-categories', documentCategoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/search', searchRouter);
app.use('/api/ai', aiWriterRouter);

// SEO Routes (sitemap.xml, robots.txt)
app.use('/', seoRouter);

// ============================================
// SERVE REACT FRONTEND IN PRODUCTION & SPA FALLBACK
// ============================================
const distPath = path.join(process.cwd(), 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(indexPath)) {
  app.use(express.static(distPath, {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Don't cache index.html (always fresh)
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  }));

  // SPA fallback – serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(indexPath);
  });
} else {
  // Fallback when dist/index.html is not built yet
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <title>CTC Web - Đang khởi động</title>
          <meta charset="utf-8">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; border: 1px solid #334155; padding: 2.5rem; border-radius: 1.5rem; max-width: 500px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            h1 { color: #38bdf8; margin-top: 0; font-size: 1.8rem; }
            p { color: #94a3b8; line-height: 1.6; }
            code { background: #0f172a; padding: 0.3rem 0.6rem; border-radius: 0.4rem; color: #f59e0b; font-weight: bold; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⚡ CTC Web Server</h1>
            <p>Máy chủ Backend Express API đã sẵn sàng!</p>
            <p>Vui lòng chạy lệnh biên dịch giao diện Frontend:</p>
            <p><code>npm run build</code></p>
          </div>
        </body>
      </html>
    `);
  });
}

// ============================================
// ERROR HANDLERS
// ============================================

// Simple upload error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File quá lớn' });
  }
  next(error);
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', error);
  
  if (res.headersSent) {
    return next(error);
  }
  
  res.status(error.status || 500).json({
    status: error.status || 500,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// ============================================
// START SERVER (PORT 4000 Dev / Port 80 & 443 Production)
// ============================================

const PORT = process.env.PORT || 4000;

// Auto-detect SSL certificates in 'chung chi' or 'ssl'
const defaultKeyPath = path.join(process.cwd(), 'chung chi', 'ctcdn_vn_private_key.key');
const defaultCertPath = path.join(process.cwd(), 'chung chi', 'ctcdn_vn_cert_inter_root.crt');

const sslKeyPath = process.env.SSL_KEY_PATH || (fs.existsSync(defaultKeyPath) ? defaultKeyPath : path.join(process.cwd(), 'ssl', 'server.key'));
const sslCertPath = process.env.SSL_CERT_PATH || (fs.existsSync(defaultCertPath) ? defaultCertPath : path.join(process.cwd(), 'ssl', 'server.crt'));
const hasSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

if (hasSSL) {
  console.log(`🔒 Found SSL Certificates in: ${path.dirname(sslKeyPath)}`);
  console.log(`   - Key: ${path.basename(sslKeyPath)}`);
  console.log(`   - Cert: ${path.basename(sslCertPath)}`);
}

console.log('⚡ Initializing CTC Web API server...');

// Primary Express Server on PORT (default 4000)
const server = app.listen(PORT, async () => {
  console.log(`🚀 API server listening on http://localhost:${PORT}`);
  console.log(`🔒 Security features enabled`);
  console.log(`📊 Audit logging active`);
  console.log(`🛡️  Rate limiting active`);

  try {
    await connectDB();
  } catch (err: any) {
    console.error('❌ DB Connection Warning:', err?.message || err);
    console.error('💡 Ensure MongoDB is running locally on port 27017 or start it via: net start MongoDB');
  }

  try {
    startTranslationScheduler();
    console.log(`🌐 Translation scheduler active (every 12h)`);
  } catch (e) {}

  // Optional: Start Port 80 & 443 direct listeners if SSL certs exist
  if (hasSSL) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
      };
      const httpsServer = https.createServer(httpsOptions, app);
      httpsServer.on('error', (err: any) => {
        console.warn('⚠️ Direct Port 443 bind skipped (IIS/Nginx reverse proxy or Admin mode recommended):', err?.message || err);
      });
      httpsServer.listen(443, () => {
        console.log('🔒 HTTPS Server listening on port 443 (https://ctcdn.vn)');
      });

      // HTTP Port 80 Redirect to HTTPS Port 443
      const httpServer = http.createServer((req, res) => {
        const host = req.headers.host || 'ctcdn.vn';
        res.writeHead(301, { Location: `https://${host}${req.url}` });
        res.end();
      });
      httpServer.on('error', (err: any) => {
        console.warn('⚠️ Direct Port 80 bind skipped (IIS/Nginx reverse proxy or Admin mode recommended):', err?.message || err);
      });
      httpServer.listen(80, () => {
        console.log('🌐 HTTP Port 80 listening (Redirects to HTTPS 443)');
      });
    } catch (sslErr: any) {
      console.warn('⚠️ Could not bind Port 80/443 directly (IIS/Nginx Reverse Proxy recommended):', sslErr?.message || sslErr);
    }
  }
});

// Configure Server Timeouts for Anti-Slowloris & Connection Reuse
server.keepAliveTimeout = 65000; // 65 seconds (slightly higher than Nginx 60s default)
server.headersTimeout = 66000; // Must be greater than keepAliveTimeout
(server as any).requestTimeout = 30000; // Max 30s per request

