// Script to capture funnel metrics
// Can be run manually or via cron job

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function captureMetrics(period = 'daily') {
  try {
    console.log(`📊 Capturing ${period} metrics...`);
    
    const response = await fetch(`${API_BASE}/funnel-metrics/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const snapshot = await response.json();
    
    console.log('\n✅ Metrics captured successfully!');
    console.log('\n📈 Funnel Metrics:');
    console.log(`   Khách truy cập: ${snapshot.metrics.pageViews}`);
    console.log(`   Xem sản phẩm: ${snapshot.metrics.productViews}`);
    console.log(`   Yêu cầu tư vấn: ${snapshot.metrics.contactRequests}`);
    console.log(`   Nhận báo giá: ${snapshot.metrics.quoteRequests}`);
    console.log(`   Mua hàng: ${snapshot.metrics.purchases}`);
    
    console.log('\n📊 Conversion Rates:');
    console.log(`   Khách → Lead: ${snapshot.conversionRates.visitorToLead}%`);
    console.log(`   Lead → KH: ${snapshot.conversionRates.leadToCustomer}%`);
    console.log(`   Tổng thể: ${snapshot.conversionRates.overallConversion}%`);
    
    console.log('\n📝 Content Metrics:');
    console.log(`   Sản phẩm: ${snapshot.contentMetrics.totalProducts}`);
    console.log(`   Dự án: ${snapshot.contentMetrics.totalProjects}`);
    console.log(`   Tin tức: ${snapshot.contentMetrics.totalNews}`);
    console.log(`   Đánh giá: ${snapshot.contentMetrics.totalReviews}`);
    
    if (snapshot.goalComparison) {
      console.log(`\n🎯 Goal Comparison: ${snapshot.goalComparison.goalName}`);
      const achievements = snapshot.goalComparison.achievements;
      
      Object.keys(achievements).forEach(key => {
        const { actual, target, percentage } = achievements[key];
        const status = percentage >= 100 ? '✅' : percentage >= 70 ? '⚠️' : '❌';
        console.log(`   ${status} ${key}: ${actual}/${target} (${percentage}%)`);
      });
    }
    
    return snapshot;
  } catch (error) {
    console.error('❌ Error capturing metrics:', error.message);
    process.exit(1);
  }
}

// Get period from command line args
const period = process.argv[2] || 'daily';

captureMetrics(period)
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
