/**
 * Seed Security Data
 * Tạo dữ liệu mẫu cho Security Monitoring
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

// Schemas
const SecurityEventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  ip: { type: String, required: true },
  userAgent: String,
  path: String,
  method: String,
  details: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  userId: String,
  userEmail: String,
  blocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const AuditLogSchema = new mongoose.Schema({
  userId: String,
  userEmail: String,
  userRole: String,
  ip: { type: String, required: true },
  userAgent: String,
  method: { type: String, required: true },
  path: { type: String, required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: String,
  changes: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['success', 'failed', 'unauthorized'] },
  statusCode: { type: Number, required: true },
  duration: Number,
  createdAt: { type: Date, default: Date.now },
});

const IPBlacklistSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: { type: String, required: true },
  blockedBy: String,
  blockedByEmail: String,
  permanent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

async function seedSecurityData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const SecurityEvent = mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', SecurityEventSchema);
    const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
    const IPBlacklist = mongoose.models.IPBlacklist || mongoose.model('IPBlacklist', IPBlacklistSchema);

    // Clear existing data
    await SecurityEvent.deleteMany({});
    await AuditLog.deleteMany({});
    await IPBlacklist.deleteMany({});
    console.log('🗑️ Cleared existing security data');

    // Generate random IPs
    const generateIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    // Sample event types
    const eventTypes = [
      { type: 'failed_login', severity: 'medium', details: 'Đăng nhập thất bại với email: user@example.com' },
      { type: 'rate_limit_exceeded', severity: 'low', details: 'Vượt quá giới hạn request (100/15 phút)' },
      { type: 'suspicious_request', severity: 'high', details: 'Phát hiện payload đáng ngờ trong request body' },
      { type: 'xss_attempt', severity: 'high', details: 'Phát hiện script tag trong input: <script>alert(1)</script>' },
      { type: 'ip_blocked', severity: 'high', details: 'IP bị chặn do hành vi bất thường', blocked: true },
      { type: 'unauthorized_access', severity: 'medium', details: 'Truy cập tài nguyên không có quyền: /api/admin/users' },
    ];

    // Create security events (last 7 days)
    const securityEvents = [];
    for (let i = 0; i < 50; i++) {
      const eventTemplate = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      
      securityEvents.push({
        ...eventTemplate,
        ip: generateIP(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        path: ['/api/users/login', '/api/admin/products', '/api/contact', '/api/news'][Math.floor(Math.random() * 4)],
        method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000),
      });
    }
    await SecurityEvent.insertMany(securityEvents);
    console.log(`✅ Created ${securityEvents.length} security events`);

    // Create audit logs
    const actions = ['login', 'create', 'update', 'delete', 'view'];
    const resources = ['products', 'news', 'users', 'projects', 'settings', 'categories'];
    const statuses = ['success', 'success', 'success', 'failed', 'unauthorized'];
    const emails = ['admin@ctcdn.vn', 'editor@tranle.com', 'user1@gmail.com', 'user2@gmail.com'];

    const auditLogs = [];
    for (let i = 0; i < 100; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resource = resources[Math.floor(Math.random() * resources.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      auditLogs.push({
        userId: `user_${Math.floor(Math.random() * 10)}`,
        userEmail: emails[Math.floor(Math.random() * emails.length)],
        userRole: Math.random() > 0.7 ? 'admin' : 'user',
        ip: generateIP(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        method: action === 'create' ? 'POST' : action === 'update' ? 'PUT' : action === 'delete' ? 'DELETE' : 'GET',
        path: `/api/${resource}`,
        action,
        resource,
        resourceId: Math.random() > 0.5 ? new mongoose.Types.ObjectId().toString() : undefined,
        status,
        statusCode: status === 'success' ? 200 : status === 'failed' ? 400 : 403,
        duration: Math.floor(Math.random() * 500) + 50,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000),
      });
    }
    await AuditLog.insertMany(auditLogs);
    console.log(`✅ Created ${auditLogs.length} audit logs`);

    // Create blacklisted IPs
    const blacklistedIPs = [
      { ip: '192.168.100.50', reason: 'Brute force attack detected', blockedByEmail: 'admin@ctcdn.vn', permanent: true },
      { ip: '10.0.0.99', reason: 'Spam requests', blockedByEmail: 'admin@ctcdn.vn', permanent: false },
      { ip: '172.16.0.15', reason: 'XSS injection attempts', blockedByEmail: 'system', permanent: true },
    ];
    
    for (const entry of blacklistedIPs) {
      try {
        await new IPBlacklist(entry).save();
      } catch (e) {
        // Ignore duplicate errors
      }
    }
    console.log(`✅ Created ${blacklistedIPs.length} blacklisted IPs`);

    console.log('\n🎉 Security data seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Security Events: ${securityEvents.length}`);
    console.log(`   - Audit Logs: ${auditLogs.length}`);
    console.log(`   - Blacklisted IPs: ${blacklistedIPs.length}`);

  } catch (error) {
    console.error('❌ Error seeding security data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedSecurityData();
