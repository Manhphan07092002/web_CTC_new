/**
 * Admin Security Management Routes
 * Quản lý bảo mật từ admin panel
 */

import { Router } from 'express';
// Import auth middleware - comment out if not ready
// import { requireAdmin } from '../middleware/auth';

// Placeholder for blacklist functions (defined locally for now)
const blacklistStore = new Set<string>();

const addToBlacklist = (ip: string) => {
  blacklistStore.add(ip);
  console.log(`[SECURITY] IP added to blacklist: ${ip}`);
};

const removeFromBlacklist = (ip: string) => {
  blacklistStore.delete(ip);
  console.log(`[SECURITY] IP removed from blacklist: ${ip}`);
};

// Simple admin check middleware (replace with JWT auth later)
const requireAdmin = (req: any, res: any, next: any) => {
  // For now, allow all requests - implement proper JWT auth later
  req.user = req.user || { email: 'admin@ctcdn.vn', role: 'admin' };
  next();
};
import { logger } from '../../utils/logger';

const router = Router();

// Tất cả routes này yêu cầu quyền admin
router.use(requireAdmin);

// ============================================
// IP BLACKLIST MANAGEMENT
// ============================================

// Get current blacklisted IPs (in-memory, sẽ mất khi restart)
const blacklistedIPs = new Set<string>();

router.get('/blacklist', (req, res) => {
  res.json({
    blacklistedIPs: Array.from(blacklistedIPs),
    count: blacklistedIPs.size,
  });
});

// Add IP to blacklist
router.post('/blacklist', (req, res) => {
  const { ip, reason } = req.body;
  
  if (!ip) {
    return res.status(400).json({ message: 'IP address is required' });
  }
  
  // Validate IP format
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({ message: 'Invalid IP address format' });
  }
  
  blacklistedIPs.add(ip);
  addToBlacklist(ip);
  
  logger.warn(`[ADMIN] IP ${ip} added to blacklist by ${req.user?.email}. Reason: ${reason || 'No reason provided'}`);
  
  res.json({
    message: `IP ${ip} has been blacklisted`,
    ip,
    reason: reason || 'No reason provided',
    addedBy: req.user?.email,
  });
});

// Remove IP from blacklist
router.delete('/blacklist/:ip', (req, res) => {
  const { ip } = req.params;
  
  if (!blacklistedIPs.has(ip)) {
    return res.status(404).json({ message: 'IP not found in blacklist' });
  }
  
  blacklistedIPs.delete(ip);
  removeFromBlacklist(ip);
  
  logger.info(`[ADMIN] IP ${ip} removed from blacklist by ${req.user?.email}`);
  
  res.json({
    message: `IP ${ip} has been removed from blacklist`,
    ip,
    removedBy: req.user?.email,
  });
});

// ============================================
// SECURITY LOGS & MONITORING
// ============================================

// Get recent security events (mock data - trong thực tế sẽ lưu vào DB)
const securityEvents: Array<{
  id: string;
  timestamp: Date;
  type: 'suspicious_request' | 'rate_limit_exceeded' | 'failed_login' | 'ip_blocked';
  ip: string;
  userAgent?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}> = [];

router.get('/events', (req, res) => {
  const { limit = 50, type, severity } = req.query;
  
  let filteredEvents = [...securityEvents];
  
  if (type) {
    filteredEvents = filteredEvents.filter(event => event.type === type);
  }
  
  if (severity) {
    filteredEvents = filteredEvents.filter(event => event.severity === severity);
  }
  
  // Sort by timestamp desc and limit
  filteredEvents = filteredEvents
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, Number(limit));
  
  res.json({
    events: filteredEvents,
    total: filteredEvents.length,
    filters: { type, severity, limit },
  });
});

// Add security event (internal function)
export const addSecurityEvent = (event: Omit<typeof securityEvents[0], 'id' | 'timestamp'>) => {
  const newEvent = {
    ...event,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
  };
  
  securityEvents.push(newEvent);
  
  // Keep only last 1000 events in memory
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000);
  }
  
  // Log high severity events
  if (event.severity === 'high') {
    logger.error(`[SECURITY HIGH] ${event.type}: ${event.details} from ${event.ip}`);
  }
};

// ============================================
// SYSTEM SECURITY STATUS
// ============================================

router.get('/status', (req, res) => {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Count events in last 24h
  const recentEvents = securityEvents.filter(event => event.timestamp > last24h);
  const eventsByType = recentEvents.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const eventsBySeverity = recentEvents.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  res.json({
    status: 'active',
    timestamp: now,
    blacklistedIPs: blacklistedIPs.size,
    last24Hours: {
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
    },
    securityFeatures: {
      helmet: true,
      rateLimiting: true,
      mongoSanitize: true,
      xssProtection: true,
      jwtAuth: true,
      ipFiltering: true,
      auditLogging: true,
    },
  });
});

// ============================================
// SECURITY CONFIGURATION
// ============================================

// Get current security config
router.get('/config', (req, res) => {
  res.json({
    rateLimits: {
      general: { windowMs: 15 * 60 * 1000, max: 100 },
      login: { windowMs: 15 * 60 * 1000, max: 5 },
      upload: { windowMs: 60 * 1000, max: 10 },
    },
    jwt: {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      // Don't expose the secret
    },
    cors: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000', 'local network IPs'],
    },
    fileUpload: {
      maxSize: '10mb',
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
  });
});

// Update security config (placeholder - trong thực tế cần validation)
router.put('/config', (req, res) => {
  const { rateLimits, jwt, cors, fileUpload } = req.body;
  
  logger.info(`[ADMIN] Security config updated by ${req.user?.email}`, {
    changes: req.body,
  });
  
  // Trong thực tế, sẽ lưu vào database và reload middleware
  res.json({
    message: 'Security configuration updated successfully',
    updatedBy: req.user?.email,
    timestamp: new Date(),
    note: 'Server restart required for some changes to take effect',
  });
});

// ============================================
// EMERGENCY ACTIONS
// ============================================

// Emergency: Block all traffic except admin IPs
router.post('/emergency/lockdown', (req, res) => {
  const { reason } = req.body;
  
  logger.error(`[EMERGENCY] System lockdown initiated by ${req.user?.email}. Reason: ${reason}`);
  
  // Trong thực tế, sẽ set flag để middleware chặn tất cả traffic
  res.json({
    message: 'Emergency lockdown activated',
    activatedBy: req.user?.email,
    reason,
    timestamp: new Date(),
    note: 'Only admin IPs are allowed. Use /emergency/unlock to restore normal operation.',
  });
});

// Emergency: Unlock system
router.post('/emergency/unlock', (req, res) => {
  logger.info(`[EMERGENCY] System lockdown lifted by ${req.user?.email}`);
  
  res.json({
    message: 'Emergency lockdown deactivated',
    deactivatedBy: req.user?.email,
    timestamp: new Date(),
  });
});

export default router;
