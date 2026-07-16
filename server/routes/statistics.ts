import express from 'express';
import { db } from '../../services/db-mongodb';
import AIService from '../../services/ai-service';
import AnalyticsService from '../../services/analytics-service';

const router = express.Router();

// Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    // Get counts from database
    const [products, categories, projects, news, testimonials, reviews] = await Promise.all([
      db.products.getAll(),
      db.categories.getAll(),
      db.projects.getAll(),
      db.news.getAll(),
      db.testimonials.getAll(),
      db.reviews.getAll()
    ]);
    
    // Calculate engagement stats from real data
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = products.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalShares = products.reduce((sum, p) => sum + (p.shares || 0), 0);
    const totalReviews = reviews.length;

    // Products by category
    const productsByCategory = categories.map(cat => ({
      name: cat.name,
      value: products.filter(p => p.category === cat.name).length,
      color: getRandomColor()
    })).filter(item => item.value > 0);

    // Growth trend (last 6 months)
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('vi-VN', { month: 'short' });
      
      const monthProducts = products.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate.getMonth() === date.getMonth() && pDate.getFullYear() === date.getFullYear();
      }).length;
      
      const monthProjects = projects.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate.getMonth() === date.getMonth() && pDate.getFullYear() === date.getFullYear();
      }).length;
      
      monthlyData.push({
        name: monthName,
        products: monthProducts,
        projects: monthProjects
      });
    }

    // Top featured products
    const featuredProducts = products
      .filter(p => p.isFeatured)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image
      }));

    // Recent activities (combine all recent items)
    const recentActivities = [
      ...products.slice(0, 3).map(p => ({
        type: 'product',
        title: `Sản phẩm "${p.name}" được thêm`,
        time: p.createdAt,
        icon: 'package'
      })),
      ...projects.slice(0, 3).map(p => ({
        type: 'project',
        title: `Dự án "${p.title}" được tạo`,
        time: p.createdAt,
        icon: 'briefcase'
      })),
      ...news.slice(0, 3).map(n => ({
        type: 'news',
        title: `Tin tức "${n.title}" được đăng`,
        time: n.createdAt,
        icon: 'newspaper'
      }))
    ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

    // Comparison with last month
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const productsLastMonth = products.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate.getMonth() === lastMonth.getMonth() && pDate.getFullYear() === lastMonth.getFullYear();
    }).length;
    
    const projectsLastMonth = projects.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate.getMonth() === lastMonth.getMonth() && pDate.getFullYear() === lastMonth.getFullYear();
    }).length;
    
    const newsLastMonth = news.filter(n => {
      const nDate = new Date(n.createdAt);
      return nDate.getMonth() === lastMonth.getMonth() && nDate.getFullYear() === lastMonth.getFullYear();
    }).length;

    // Top performers (most recent and featured)
    const topProducts = products
      .filter(p => p.isFeatured)
      .slice(0, 3)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image,
        createdAt: p.createdAt
      }));

    const topProjects = projects
      .slice(0, 3)
      .map(p => ({
        id: p.id,
        title: p.title,
        location: p.location,
        capacity: p.capacity,
        image: p.image,
        createdAt: p.createdAt
      }));

    // Calculate statistics
    const stats: any = {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalProjects: projects.length,
      totalNews: news.length,
      totalTestimonials: testimonials.length,
      totalViews,
      totalLikes,
      totalShares,
      totalReviews,
      
      // Recent items (last 5)
      recentProducts: products.slice(0, 5),
      recentProjects: projects.slice(0, 5),
      recentNews: news.slice(0, 5),
      
      // Products by category
      productsByCategory,
      
      // Monthly growth trend
      monthlyGrowth: monthlyData,
      
      // Top featured products
      featuredProducts,
      
      // Recent activities
      recentActivities,
      
      // Quick stats
      quickStats: {
        productsThisMonth: products.filter(p => {
          const pDate = new Date(p.createdAt);
          return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
        }).length,
        projectsThisMonth: projects.filter(p => {
          const pDate = new Date(p.createdAt);
          return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
        }).length,
        newsThisMonth: news.filter(n => {
          const nDate = new Date(n.createdAt);
          return nDate.getMonth() === now.getMonth() && nDate.getFullYear() === now.getFullYear();
        }).length
      },
      
      // Comparison with last month
      comparison: {
        products: {
          current: products.filter(p => {
            const pDate = new Date(p.createdAt);
            return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
          }).length,
          previous: productsLastMonth,
          change: productsLastMonth > 0 
            ? Math.round(((products.filter(p => {
                const pDate = new Date(p.createdAt);
                return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
              }).length - productsLastMonth) / productsLastMonth) * 100)
            : 100
        },
        projects: {
          current: projects.filter(p => {
            const pDate = new Date(p.createdAt);
            return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
          }).length,
          previous: projectsLastMonth,
          change: projectsLastMonth > 0
            ? Math.round(((projects.filter(p => {
                const pDate = new Date(p.createdAt);
                return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
              }).length - projectsLastMonth) / projectsLastMonth) * 100)
            : 100
        },
        news: {
          current: news.filter(n => {
            const nDate = new Date(n.createdAt);
            return nDate.getMonth() === now.getMonth() && nDate.getFullYear() === now.getFullYear();
          }).length,
          previous: newsLastMonth,
          change: newsLastMonth > 0
            ? Math.round(((news.filter(n => {
                const nDate = new Date(n.createdAt);
                return nDate.getMonth() === now.getMonth() && nDate.getFullYear() === now.getFullYear();
              }).length - newsLastMonth) / newsLastMonth) * 100)
            : 100
        }
      },
      
      // Top performers
      topPerformers: {
        products: topProducts,
        projects: topProjects
      }
    };
    
    // Add AI-powered features after stats is created
    stats.ai = {
      recommendations: AIService.generateProductRecommendations(products, categories),
      insights: AIService.generateInsights(stats),
      prediction: AIService.predictRevenue(monthlyData)
    };
    
    // Get real funnel data from analytics events
    const funnelData = await db.analytics.getFunnelData();
    
    // Add Advanced Analytics
    stats.analytics = {
      conversionRates: AnalyticsService.calculateConversionRates(stats),
      revenueForecast: AnalyticsService.forecastRevenue(projects, 3),
      heatMap: AnalyticsService.generateHeatMap(products, projects),
      userBehavior: AnalyticsService.analyzeUserBehavior(stats),
      funnelData: funnelData, // Use real data from MongoDB
      performanceMetrics: AnalyticsService.calculatePerformanceMetrics(stats),
      radarData: AnalyticsService.generateRadarData(stats),
      treemapData: AnalyticsService.generateTreemapData(productsByCategory)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Helper function to generate colors
function getRandomColor() {
  const colors = [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get monthly revenue data (mock for now, can be extended)
router.get('/revenue', async (req, res) => {
  try {
    // This is mock data - you can extend this to calculate real revenue from orders
    const revenueData = [
      { name: 'Th 1', prev: 4000, current: 2400 },
      { name: 'Th 2', prev: 3000, current: 1398 },
      { name: 'Th 3', prev: 2000, current: 9800 },
      { name: 'Th 4', prev: 2780, current: 3908 },
      { name: 'Th 5', prev: 1890, current: 4800 },
      { name: 'Th 6', prev: 2390, current: 3800 },
      { name: 'Th 7', prev: 3490, current: 4300 },
    ];
    
    res.json(revenueData);
  } catch (error) {
    console.error('Error getting revenue data:', error);
    res.status(500).json({ error: 'Failed to get revenue data' });
  }
});

export default router;
