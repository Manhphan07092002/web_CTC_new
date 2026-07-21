// Seed Analytics Events for Testing
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Define AnalyticsEvent schema
const AnalyticsEventSchema = new mongoose.Schema({
  eventType: { 
    type: String, 
    required: true,
    enum: ['page_view', 'product_view', 'contact_request', 'quote_request', 'purchase']
  },
  userId: { type: String },
  sessionId: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

// Generate random session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate random IP
const generateIP = () => {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

// User agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36'
];

// Referrers
const referrers = [
  'https://google.com',
  'https://facebook.com',
  'https://zalo.me',
  'direct',
  'https://youtube.com'
];

async function seedAnalytics() {
  try {
    console.log('🌱 Starting analytics seed...');

    // Clear existing analytics
    await AnalyticsEvent.deleteMany({});
    console.log('🗑️  Cleared existing analytics events');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);

    if (products.length === 0) {
      console.log('⚠️  No products found. Please seed products first.');
      process.exit(0);
    }

    const events = [];
    const sessions = [];

    // Generate 100 user sessions
    for (let i = 0; i < 100; i++) {
      const sessionId = generateSessionId();
      const ipAddress = generateIP();
      const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      const referrer = referrers[Math.floor(Math.random() * referrers.length)];
      
      sessions.push({ sessionId, ipAddress, userAgent, referrer });
    }

    console.log(`👥 Generated ${sessions.length} sessions`);

    // Simulate conversion funnel
    for (const session of sessions) {
      const baseTimestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      
      // 1. Page View (100% - everyone visits)
      events.push({
        eventType: 'page_view',
        sessionId: session.sessionId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        referrer: session.referrer,
        metadata: { page: '/', title: 'Home Page' },
        timestamp: new Date(baseTimestamp.getTime())
      });

      // 2. Product View (70% conversion)
      if (Math.random() < 0.70) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        events.push({
          eventType: 'product_view',
          sessionId: session.sessionId,
          productId: randomProduct._id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          metadata: { 
            productName: randomProduct.name,
            category: randomProduct.category 
          },
          timestamp: new Date(baseTimestamp.getTime() + 2 * 60 * 1000) // 2 minutes later
        });

        // 3. Contact Request (10% of product viewers)
        if (Math.random() < 0.10) {
          events.push({
            eventType: 'contact_request',
            sessionId: session.sessionId,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            metadata: { 
              service: 'Tư vấn hệ thống',
              name: `User ${Math.floor(Math.random() * 1000)}`
            },
            timestamp: new Date(baseTimestamp.getTime() + 5 * 60 * 1000) // 5 minutes later
          });

          // 4. Quote Request (80% of contact requesters)
          if (Math.random() < 0.80) {
            events.push({
              eventType: 'quote_request',
              sessionId: session.sessionId,
              productId: randomProduct._id,
              ipAddress: session.ipAddress,
              userAgent: session.userAgent,
              metadata: { 
                productName: randomProduct.name,
                estimatedValue: Math.floor(Math.random() * 500000000) + 100000000
              },
              timestamp: new Date(baseTimestamp.getTime() + 24 * 60 * 60 * 1000) // 1 day later
            });

            // 5. Purchase (40% of quote requesters)
            if (Math.random() < 0.40) {
              events.push({
                eventType: 'purchase',
                sessionId: session.sessionId,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                metadata: { 
                  orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
                  amount: Math.floor(Math.random() * 500000000) + 100000000,
                  products: [randomProduct.name]
                },
                timestamp: new Date(baseTimestamp.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days later
              });
            }
          }
        }
      }
    }

    // Insert all events
    await AnalyticsEvent.insertMany(events);
    console.log(`✅ Created ${events.length} analytics events`);

    // Show summary
    const summary = await AnalyticsEvent.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n📊 Analytics Summary:');
    summary.forEach(item => {
      console.log(`   ${item._id}: ${item.count} events`);
    });

    // Calculate conversion rates
    const pageViews = events.filter(e => e.eventType === 'page_view').length;
    const productViews = events.filter(e => e.eventType === 'product_view').length;
    const contactRequests = events.filter(e => e.eventType === 'contact_request').length;
    const quoteRequests = events.filter(e => e.eventType === 'quote_request').length;
    const purchases = events.filter(e => e.eventType === 'purchase').length;

    console.log('\n📈 Conversion Rates:');
    console.log(`   Page Views: ${pageViews} (100%)`);
    console.log(`   Product Views: ${productViews} (${Math.round((productViews/pageViews)*100)}%)`);
    console.log(`   Contact Requests: ${contactRequests} (${Math.round((contactRequests/pageViews)*100)}%)`);
    console.log(`   Quote Requests: ${quoteRequests} (${Math.round((quoteRequests/pageViews)*100)}%)`);
    console.log(`   Purchases: ${purchases} (${Math.round((purchases/pageViews)*100)}%)`);

    console.log('\n✅ Analytics seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding analytics:', error);
    process.exit(1);
  }
}

// Run seed
seedAnalytics();
