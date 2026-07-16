/**
 * SEO Routes - Sitemap.xml & Robots.txt
 */

import express from 'express';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { Product, Project, News, ProductCategory } from '../../models';

const router = express.Router();

// Site configuration
const SITE_URL = process.env.SITE_URL || 'https://tranle.vn';

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
      const news = await News.find({ status: 'published' }).select('slug updatedAt').lean();
      for (const item of news) {
        links.push({
          url: `/news/${item._id}`,
          changefreq: 'weekly',
          priority: 0.6,
          lastmod: item.updatedAt?.toISOString()
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
 * GET /robots.txt
 * Robots.txt for search engines
 */
router.get('/robots.txt', (req, res) => {
  const robotsTxt = `# Robots.txt for Công ty Cổ phần Xây lắp Bưu điện Miền Trung
# Website: ${SITE_URL}
# Hotline: 0236 656 2020

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

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

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
