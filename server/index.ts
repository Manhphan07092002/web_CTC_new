import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
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
// STATIC FILES
// ============================================
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

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

// SEO Routes (sitemap.xml, robots.txt)
app.use('/', seoRouter);

// ============================================
// SERVE REACT FRONTEND IN PRODUCTION
// ============================================
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
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
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
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
// START SERVER
// ============================================

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API server listening on http://localhost:${PORT}`);
      console.log(`🔒 Security features enabled`);
      console.log(`📊 Audit logging active`);
      console.log(`🛡️  Rate limiting active`);
      
      // Start translation scheduler (auto-translate every 12 hours)
      startTranslationScheduler();
      console.log(`🌐 Translation scheduler active (every 12h)`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to DB error', err);
    process.exit(1);
  });
