// AI Service for Smart Recommendations and Predictive Analytics
import { IProduct, IProject, INewsItem } from '../models';

export class AIService {
  // Smart Product Recommendations based on trends and data
  static generateProductRecommendations(products: IProduct[], categories: any[]): any[] {
    const recommendations = [];

    // 1. Recommend creating products in categories with few items
    const categoryStats = categories.map(cat => ({
      name: cat.name,
      count: products.filter(p => p.category === cat.name).length
    }));

    const lowStockCategories = categoryStats
      .filter(cat => cat.count < 3)
      .sort((a, b) => a.count - b.count);

    if (lowStockCategories.length > 0) {
      recommendations.push({
        type: 'product_gap',
        priority: 'high',
        title: `Thiếu sản phẩm trong danh mục "${lowStockCategories[0].name}"`,
        description: `Chỉ có ${lowStockCategories[0].count} sản phẩm. Nên thêm sản phẩm để đa dạng hóa.`,
        action: 'Thêm sản phẩm',
        icon: 'alert',
        color: 'orange'
      });
    }

    // 2. Recommend featuring products without featured status
    const unfeaturedCount = products.filter(p => !p.isFeatured).length;
    if (unfeaturedCount > 5) {
      recommendations.push({
        type: 'feature_products',
        priority: 'medium',
        title: 'Đánh dấu sản phẩm nổi bật',
        description: `Có ${unfeaturedCount} sản phẩm chưa được đánh dấu nổi bật. Điều này giúp tăng visibility.`,
        action: 'Xem sản phẩm',
        icon: 'star',
        color: 'blue'
      });
    }

    // 3. Recommend updating old products
    const now = new Date();
    const oldProducts = products.filter(p => {
      const createdDate = new Date(p.createdAt);
      const monthsOld = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsOld > 6;
    });

    if (oldProducts.length > 3) {
      recommendations.push({
        type: 'update_content',
        priority: 'low',
        title: 'Cập nhật sản phẩm cũ',
        description: `${oldProducts.length} sản phẩm đã lâu không cập nhật. Hãy làm mới nội dung.`,
        action: 'Xem danh sách',
        icon: 'refresh',
        color: 'green'
      });
    }

    return recommendations;
  }

  // Predictive Analytics - Revenue Forecast
  static predictRevenue(monthlyData: any[]): any {
    if (monthlyData.length < 3) {
      return {
        nextMonth: 0,
        confidence: 'low',
        trend: 'insufficient_data'
      };
    }

    // Simple linear regression for prediction
    const recentMonths = monthlyData.slice(-6);
    const values = recentMonths.map((m, i) => ({ x: i, y: m.products + m.projects }));
    
    // Calculate trend
    const n = values.length;
    const sumX = values.reduce((sum, v) => sum + v.x, 0);
    const sumY = values.reduce((sum, v) => sum + v.y, 0);
    const sumXY = values.reduce((sum, v) => sum + v.x * v.y, 0);
    const sumX2 = values.reduce((sum, v) => sum + v.x * v.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const prediction = slope * n + intercept;
    const avgValue = sumY / n;
    const growthRate = ((prediction - avgValue) / avgValue) * 100;

    return {
      nextMonth: Math.round(prediction),
      currentAverage: Math.round(avgValue),
      growthRate: Math.round(growthRate),
      confidence: Math.abs(growthRate) < 50 ? 'high' : 'medium',
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
    };
  }

  // Smart Insights based on data patterns
  static generateInsights(statistics: any): any[] {
    const insights = [];

    // 1. Growth Analysis
    if (statistics.comparison) {
      const productGrowth = statistics.comparison.products.change;
      const projectGrowth = statistics.comparison.projects.change;

      if (productGrowth > 20) {
        insights.push({
          type: 'growth',
          title: '🚀 Tăng trưởng mạnh về sản phẩm',
          description: `Sản phẩm tăng ${productGrowth}% so với tháng trước. Xu hướng tích cực!`,
          sentiment: 'positive'
        });
      } else if (productGrowth < -10) {
        insights.push({
          type: 'warning',
          title: '⚠️ Sản phẩm giảm',
          description: `Sản phẩm giảm ${Math.abs(productGrowth)}% so với tháng trước. Cần chú ý!`,
          sentiment: 'negative'
        });
      }

      if (projectGrowth > 15) {
        insights.push({
          type: 'growth',
          title: '📈 Dự án phát triển tốt',
          description: `Dự án tăng ${projectGrowth}% so với tháng trước. Tiếp tục duy trì!`,
          sentiment: 'positive'
        });
      }
    }

    // 2. Activity Pattern Analysis
    if (statistics.recentActivities) {
      const recentCount = statistics.recentActivities.length;
      if (recentCount > 8) {
        insights.push({
          type: 'activity',
          title: '💪 Hoạt động sôi nổi',
          description: `${recentCount} hoạt động gần đây. Team đang làm việc hiệu quả!`,
          sentiment: 'positive'
        });
      } else if (recentCount < 3) {
        insights.push({
          type: 'activity',
          title: '😴 Hoạt động chậm',
          description: 'Ít hoạt động gần đây. Hãy tăng cường content!',
          sentiment: 'neutral'
        });
      }
    }

    // 3. Balance Analysis
    const productCount = statistics.totalProducts || 0;
    const projectCount = statistics.totalProjects || 0;
    const ratio = projectCount > 0 ? productCount / projectCount : 0;

    if (ratio > 5) {
      insights.push({
        type: 'balance',
        title: '⚖️ Cân bằng nội dung',
        description: `Có nhiều sản phẩm (${productCount}) nhưng ít dự án (${projectCount}). Nên thêm case study!`,
        sentiment: 'neutral'
      });
    }

    return insights;
  }

  // Auto-categorization suggestion
  static suggestCategory(productName: string, description: string): string {
    const keywords = {
      'Tấm pin': ['panel', 'tấm', 'pin', 'solar panel', 'module'],
      'Inverter': ['inverter', 'biến tần', 'nghịch lưu'],
      'Pin lưu trữ': ['battery', 'pin', 'lưu trữ', 'storage', 'ắc quy'],
      'Phụ kiện': ['cable', 'dây', 'connector', 'phụ kiện', 'mounting'],
      'Hệ thống': ['system', 'hệ thống', 'combo', 'package']
    };

    const text = (productName + ' ' + description).toLowerCase();

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        return category;
      }
    }

    return 'Khác';
  }

  // Smart search suggestions
  static generateSearchSuggestions(query: string, products: IProduct[]): string[] {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    // Search in product names
    products.forEach(product => {
      const name = product.name.toLowerCase();
      if (name.includes(lowerQuery)) {
        suggestions.add(product.name);
      }
      
      // Add category suggestions
      if (product.category && product.category.toLowerCase().includes(lowerQuery)) {
        suggestions.add(product.category);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }
}

export default AIService;
