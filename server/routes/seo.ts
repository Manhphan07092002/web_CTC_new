/**
 * SEO Routes - Sitemap.xml & Robots.txt
 */

import express from 'express';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { Product, Project, News, ProductCategory } from '../../models';
import { INDEXNOW_KEY, INDEXNOW_KEY_FILENAME, triggerInstantIndexing } from '../services/indexing';

const router = express.Router();

// Site configuration
const SITE_URL = process.env.SITE_URL || 'https://ctcdn.vn';

// IndexNow Key Verification File Route
router.get(`/${INDEXNOW_KEY_FILENAME}`, (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(INDEXNOW_KEY);
});

// Bing Webmaster Tools Verification Route
router.get('/BingSiteAuth.xml', (req, res) => {
  res.header('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0"?>
<users>
	<user>83836E53859E9433C6450A20F7053C0F</user>
</users>`);
});

// Manual Instant Indexing Trigger API
router.post('/api/indexing/ping', async (req, res) => {
  try {
    const { urls } = req.body;
    if (!urls || (Array.isArray(urls) && urls.length === 0)) {
      return res.status(400).json({ message: 'URLs are required' });
    }
    const result = await triggerInstantIndexing(urls);
    res.json(result);
  } catch (error: any) {
    console.error('Indexing API error:', error);
    res.status(500).json({ message: 'Failed to trigger indexing', error: error.message });
  }
});

/**
 * GET /sitemap.xml
 * Dynamic sitemap with all pages
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Static pages
    const links: any[] = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/about', changefreq: 'monthly', priority: 0.8 },
      { url: '/products', changefreq: 'weekly', priority: 0.9 },
      { url: '/projects', changefreq: 'weekly', priority: 0.8 },
      { url: '/news', changefreq: 'daily', priority: 0.8 },
      { url: '/contact', changefreq: 'monthly', priority: 0.7 },
      { url: '/resources', changefreq: 'weekly', priority: 0.6 },
    ];

    // Dynamic pages from database
    try {
      // Products
      const products = await Product.find({ isActive: true }).select('slug updatedAt').lean();
      for (const product of products) {
        links.push({
          url: `/products/${product._id}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: product.updatedAt?.toISOString()
        });
      }

      // Projects
      const projects = await Project.find({ isActive: true }).select('slug updatedAt').lean();
      for (const project of projects) {
        links.push({
          url: `/projects/${project._id}`,
          changefreq: 'monthly',
          priority: 0.6,
          lastmod: project.updatedAt?.toISOString()
        });
      }

      // News
      const news = await News.find({}).select('_id id title excerpt author date updatedAt').sort({ createdAt: -1 }).lean();
      for (const item of news) {
        const newsId = item._id ? item._id.toString() : item.id;
        links.push({
          url: `/news/${newsId}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
        });
      }

      // Product Categories
      const productCategories = await ProductCategory.find({ isActive: true }).select('slug').lean();
      for (const cat of productCategories) {
        links.push({
          url: `/products?cat=${cat.slug}`,
          changefreq: 'weekly',
          priority: 0.6
        });
      }

    } catch (dbError) {
      console.error('Sitemap DB error:', dbError);
      // Continue with static pages only
    }

    // Generate sitemap XML
    const stream = new SitemapStream({ hostname: SITE_URL });
    const xml = await streamToPromise(Readable.from(links).pipe(stream)).then(data => data.toString());

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache 1 hour
    res.send(xml);

  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * GET /rss.xml & /feed
 * RSS 2.0 Feed for News
 */
const handleRss = async (req: express.Request, res: express.Response) => {
  try {
    const news = await News.find({}).sort({ createdAt: -1 }).limit(50).lean();
    const buildDate = new Date().toUTCString();

    const itemsXml = news.map(item => {
      const newsId = item._id ? item._id.toString() : item.id;
      const link = `${SITE_URL}/news/${newsId}`;
      const title = (item.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const description = (item.excerpt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const author = item.author || 'CTC News';
      const pubDate = item.createdAt ? new Date(item.createdAt).toUTCString() : new Date().toUTCString();

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <author>${author}</author>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    }).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CTC News - Năng lượng tái tạo &amp; Hạ tầng số</title>
    <link>${SITE_URL}/news</link>
    <description>Cập nhật tin tức mới nhất về Năng lượng mặt trời, Điện gió, Viễn thông và Hạ tầng số từ Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC).</description>
    <language>vi-VN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=1800');
    res.send(rssXml);
  } catch (error) {
    console.error('RSS Feed error:', error);
    res.status(500).send('Error generating RSS feed');
  }
};

router.get('/rss.xml', handleRss);
router.get('/feed', handleRss);

/**
 * GET /robots.txt
 * Robots.txt for search engines
 */
router.get('/robots.txt', (req, res) => {
  const robotsTxt = `# Robots.txt for Công ty Cổ phần Xây lắp Bưu điện Miền Trung
# Website: ${SITE_URL}
# Hotline: 0915 059 666

User-agent: *
Allow: /

# Disallow admin and API
Disallow: /admin
Disallow: /admin/
Disallow: /api/

# Allow important pages
Allow: /products
Allow: /projects
Allow: /news
Allow: /contact
Allow: /about

# Sitemap & RSS
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/rss.xml

# Crawl-delay
Crawl-delay: 1

# Host
Host: ${SITE_URL}
`;

  res.header('Content-Type', 'text/plain');
  res.header('Cache-Control', 'public, max-age=86400'); // Cache 24 hours
  res.send(robotsTxt);
});

export default router;
