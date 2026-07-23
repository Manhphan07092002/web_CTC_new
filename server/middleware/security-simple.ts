/**
 * Simplified Security Middleware
 * Basic security with MongoDB logging
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Get models (avoid type issues by using mongoose.model)
const getSecurityEvent = () => mongoose.models.SecurityEvent || mongoose.model('SecurityEvent');
const getAuditLog = () => mongoose.models.AuditLog || mongoose.model('AuditLog');
const getIPBlacklist = () => mongoose.models.IPBlacklist || mongoose.model('IPBlacklist');

// Simple rate limiting in memory
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// In-memory blacklist cache (synced with DB)
const blacklistCache = new Set<string>();
let blacklistLastSync = 0;

// Sync blacklist from DB every 5 minutes
const syncBlacklist = async () => {
  const now = Date.now();
  if (now - blacklistLastSync < 5 * 60 * 1000) return;
  
  try {
    const blacklist = await getIPBlacklist().find().select('ip').lean();
    blacklistCache.clear();
    blacklist.forEach((entry: any) => blacklistCache.add(entry.ip));
    blacklistLastSync = now;
  } catch (error) {
    console.error('[SECURITY] Failed to sync blacklist:', error);
  }
};

// Simple rate limiter
export const createRateLimit = (windowMs: number, max: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= max) {
      return res.status(429).json({
        status: 429,
        message: 'Too many requests, please try again later',
      });
    }
    
    record.count++;
    next();
  };
};

// Rate limiters (increased significantly for development/testing resilience)
export const generalRateLimiter = createRateLimit(15 * 60 * 1000, 100000); // 100,000 req/15min
export const loginRateLimiter = createRateLimit(15 * 60 * 1000, 10000); // 10,000 req/15min
export const uploadRateLimiter = createRateLimit(60 * 1000, 10000); // 10,000 req/min

// Security headers
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// XSS & NoSQL Query Injection Protection Middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (value && typeof value === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(value)) {
        // Prevent NoSQL Injection: drop keys starting with $ or containing .
        if (key.startsWith('$') || key.includes('.')) {
          console.warn(`[SECURITY] NoSQL Injection blocked key "${key}" from IP ${req.ip}`);
          continue;
        }
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);

  next();
};

// Security logger
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log suspicious activity
    if (res.statusCode >= 400 || duration > 5000) {
      console.warn(`[SECURITY] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);
    }
  });
  
  next();
};

// IP filter with blacklist check
export const ipFilter = async (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.socket.remoteAddress || '';
  
  // Sync blacklist from DB
  await syncBlacklist();
  
  // Check if IP is blacklisted
  if (blacklistCache.has(clientIP)) {
    console.warn(`[SECURITY] Blocked request from blacklisted IP: ${clientIP}`);
    
    // Log blocked request
    try {
      await getSecurityEvent().create({
        type: 'ip_blocked',
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        details: `Blocked access from blacklisted IP`,
        severity: 'high',
        blocked: true,
      });
    } catch (e) {
      console.error('[SECURITY] Failed to log blocked IP event:', e);
    }
    
    return res.status(403).json({
      status: 403,
      message: 'Access denied - IP is blacklisted',
    });
  }
  
  next();
};

// Audit middleware with MongoDB logging
export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Skip logging for certain paths
  const skipPaths = ['/api/security-monitoring/stats', '/uploads', '/api/statistics'];
  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  // Store original end function
  const originalEnd = res.end;
  
  res.end = function(...args: any[]) {
    const duration = Date.now() - startTime;
    
    // Only log significant actions
    const significantActions = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const isFailedRequest = res.statusCode >= 400;
    
    if (significantActions.includes(req.method) || isFailedRequest) {
      // Determine action from method
      const actionMap: Record<string, string> = {
        GET: 'view',
        POST: 'create',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete',
      };
      
      // Extract resource from path
      const pathParts = req.path.split('/').filter(Boolean);
      const resource = pathParts[1] || 'unknown';
      const resourceId = pathParts[2]?.match(/^[0-9a-fA-F]{24}$/) ? pathParts[2] : undefined;
      
      // Create audit log asynchronously
      getAuditLog().create({
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: req.path,
        action: actionMap[req.method] || 'unknown',
        resource,
        resourceId,
        changes: ['POST', 'PUT', 'PATCH'].includes(req.method) ? sanitizeBody(req.body) : undefined,
        status: res.statusCode < 400 ? 'success' : (res.statusCode === 401 || res.statusCode === 403 ? 'unauthorized' : 'failed'),
        statusCode: res.statusCode,
        duration,
      }).catch((err: any) => {
        console.error('[AUDIT] Failed to save log:', err.message);
      });
      
      // Log failed login attempts as security events
      if (req.path.includes('/login') && res.statusCode === 401) {
        getSecurityEvent().create({
          type: 'failed_login',
          ip: req.ip || 'unknown',
          userAgent: req.headers['user-agent'],
          path: req.path,
          method: req.method,
          details: `Failed login attempt for: ${req.body?.email || 'unknown'}`,
          severity: 'medium',
          blocked: false,
        }).catch((err: any) => {
          console.error('[SECURITY] Failed to log failed login:', err.message);
        });
      }
    }
    
    return originalEnd.apply(this, args);
  };
  
  next();
};

// Sanitize body to remove sensitive data
const sanitizeBody = (body: any): any => {
  if (!body) return undefined;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  return sanitized;
};
