import { FunnelMetrics, AnalyticsGoal, AnalyticsEvent, Product, Project, News } from '../models/index';

/**
 * Funnel Metrics Service
 * Captures and calculates conversion funnel metrics with goal comparison
 */
class FunnelMetricsService {
  /**
   * Capture current metrics snapshot
   */
  async captureMetrics(period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily') {
    try {
      // 1. Get funnel metrics from analytics events
      const funnelMetrics = await this.getFunnelMetrics();
      
      // 2. Get content metrics
      const contentMetrics = await this.getContentMetrics();
      
      // 3. Calculate conversion rates
      const conversionRates = this.calculateConversionRates(funnelMetrics);
      
      // 4. Get current active goal
      const currentGoal = await AnalyticsGoal.findOne({ 
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }).sort({ createdAt: -1 });
      
      // 5. Compare with goal if exists
      let goalComparison = undefined;
      if (currentGoal) {
        goalComparison = this.compareWithGoal(
          funnelMetrics,
          contentMetrics,
          conversionRates,
          currentGoal
        );
      }
      
      // 6. Save snapshot
      const snapshot = await FunnelMetrics.create({
        timestamp: new Date(),
        period,
        metrics: funnelMetrics,
        conversionRates,
        contentMetrics,
        goalComparison
      });
      
      return snapshot;
    } catch (error) {
      console.error('Error capturing metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get funnel metrics from analytics events
   */
  private async getFunnelMetrics() {
    const events = await AnalyticsEvent.find({});
    
    const metrics = {
      pageViews: 0,
      productViews: 0,
      contactRequests: 0,
      quoteRequests: 0,
      purchases: 0
    };
    
    events.forEach(event => {
      switch(event.eventType) {
        case 'page_view':
          metrics.pageViews++;
          break;
        case 'product_view':
          metrics.productViews++;
          break;
        case 'contact_request':
          metrics.contactRequests++;
          break;
        case 'quote_request':
          metrics.quoteRequests++;
          break;
        case 'purchase':
          metrics.purchases++;
          break;
      }
    });
    
    return metrics;
  }
  
  /**
   * Get content metrics
   */
  private async getContentMetrics() {
    const [products, projects, news] = await Promise.all([
      Product.countDocuments({ isDeleted: { $ne: true } }),
      Project.countDocuments({}),
      News.countDocuments({})
    ]);
    
    // Count reviews embedded in products
    const productsWithReviews = await Product.find(
      { isDeleted: { $ne: true }, reviews: { $exists: true, $ne: [] } },
      { reviews: 1 }
    );
    const totalReviews = productsWithReviews.reduce((sum, product) => sum + (product.reviews?.length || 0), 0);
    
    return {
      totalProducts: products,
      totalProjects: projects,
      totalNews: news,
      totalReviews
    };
  }
  
  /**
   * Calculate conversion rates
   */
  private calculateConversionRates(metrics: any) {
    const { pageViews, contactRequests, purchases } = metrics;
    
    return {
      visitorToLead: pageViews > 0 ? Math.round((contactRequests / pageViews) * 100) : 0,
      leadToCustomer: contactRequests > 0 ? Math.round((purchases / contactRequests) * 100) : 0,
      overallConversion: pageViews > 0 ? Math.round((purchases / pageViews) * 100) : 0
    };
  }
  
  /**
   * Compare metrics with goal
   */
  private compareWithGoal(
    funnelMetrics: any,
    contentMetrics: any,
    conversionRates: any,
    goal: any
  ) {
    const calculateAchievement = (actual: number, target: number) => ({
      actual,
      target,
      percentage: target > 0 ? Math.round((actual / target) * 100) : 0
    });
    
    return {
      goalId: goal._id,
      goalName: goal.name,
      achievements: {
        pageViews: calculateAchievement(funnelMetrics.pageViews, goal.targets.pageViews),
        productViews: calculateAchievement(funnelMetrics.productViews, goal.targets.productViews),
        contactRequests: calculateAchievement(funnelMetrics.contactRequests, goal.targets.contactRequests),
        quoteRequests: calculateAchievement(funnelMetrics.quoteRequests, goal.targets.quoteRequests),
        purchases: calculateAchievement(funnelMetrics.purchases, goal.targets.purchases),
        conversionRate: calculateAchievement(conversionRates.overallConversion, goal.targets.conversionRate),
        totalProducts: calculateAchievement(contentMetrics.totalProducts, goal.targets.totalProducts),
        totalProjects: calculateAchievement(contentMetrics.totalProjects, goal.targets.totalProjects),
        totalNews: calculateAchievement(contentMetrics.totalNews, goal.targets.totalNews),
        totalReviews: calculateAchievement(contentMetrics.totalReviews, goal.targets.totalReviews)
      }
    };
  }
  
  /**
   * Get latest metrics
   */
  async getLatest(period?: string) {
    const query = period ? { period } : {};
    return await FunnelMetrics.findOne(query).sort({ timestamp: -1 });
  }
  
  /**
   * Get metrics history
   */
  async getHistory(options: {
    period?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}) {
    const { period, startDate, endDate, limit = 30 } = options;
    
    const query: any = {};
    if (period) query.period = period;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }
    
    return await FunnelMetrics.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);
  }
  
  /**
   * Get metrics with goal comparison
   */
  async getMetricsWithGoal() {
    const latest = await this.getLatest();
    if (!latest) {
      // If no metrics exist, capture now
      return await this.captureMetrics();
    }
    return latest;
  }
  
  /**
   * Get achievement summary
   */
  async getAchievementSummary() {
    const latest = await this.getLatest();
    if (!latest || !latest.goalComparison) {
      return null;
    }
    
    const { achievements } = latest.goalComparison;
    const metrics = Object.keys(achievements);
    
    const summary = {
      totalMetrics: metrics.length,
      achieved: 0,
      onTrack: 0,
      belowTarget: 0,
      averageAchievement: 0
    };
    
    let totalPercentage = 0;
    
    metrics.forEach(key => {
      const { percentage } = achievements[key];
      totalPercentage += percentage;
      
      if (percentage >= 100) summary.achieved++;
      else if (percentage >= 70) summary.onTrack++;
      else summary.belowTarget++;
    });
    
    summary.averageAchievement = Math.round(totalPercentage / metrics.length);
    
    return summary;
  }
}

export default new FunnelMetricsService();
