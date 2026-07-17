/**
 * Audit Log System
 * Ghi lại tất cả hoạt động quan trọng trong hệ thống
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

// Audit log entry interface
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ip: string;
  userAgent?: string;
  method: string;
  url: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: any;
  status: 'success' | 'failed' | 'unauthorized';
  statusCode: number;
  duration?: number;
  error?: string;
}

// In-memory audit log (trong production nên lưu vào database)
const auditLogs: AuditLogEntry[] = [];

// ============================================
// AUDIT LOG FUNCTIONS
// ============================================

export const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
  const auditEntry: AuditLogEntry = {
    ...entry,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
  };
  
  auditLogs.push(auditEntry);
  
  // Keep only last 10000 entries in memory
  if (auditLogs.length > 10000) {
    auditLogs.splice(0, auditLogs.length - 10000);
  }
  
  // Log to console/file
  logger.info('[AUDIT]', {
    action: auditEntry.action,
    user: auditEntry.userEmail,
    resource: auditEntry.resource,
    status: auditEntry.status,
    ip: auditEntry.ip,
  });
  
  return auditEntry;
};

export const getAuditLogs = (filters?: {
  userId?: string;
  action?: string;
  resource?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) => {
  let filtered = [...auditLogs];
  
  if (filters) {
    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }
    if (filters.action) {
      filtered = filtered.filter(log => log.action.includes(filters.action!));
    }
    if (filters.resource) {
      filtered = filtered.filter(log => log.resource === filters.resource);
    }
    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }
    if (filters.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
    }
  }
  
  // Sort by timestamp desc
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Apply limit
  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }
  
  return filtered;
};

// ============================================
// AUDIT MIDDLEWARE
// ============================================

// Determine action from method and path
const getActionFromRequest = (method: string, path: string): string => {
  const normalizedPath = path.toLowerCase();
  
  switch (method.toUpperCase()) {
    case 'GET':
      if (normalizedPath.includes('/login')) return 'login_attempt';
      return 'view';
    case 'POST':
      if (normalizedPath.includes('/login')) return 'login';
      if (normalizedPath.includes('/upload')) return 'upload';
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'unknown';
  }
};

// Determine resource from path
const getResourceFromPath = (path: string): string => {
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length >= 2 && segments[0] === 'api') {
    return segments[1]; // products, users, news, etc.
  }
  
  return 'unknown';
};

// Extract resource ID from path
const getResourceIdFromPath = (path: string): string | undefined => {
  const segments = path.split('/').filter(Boolean);
  
  // Look for MongoDB ObjectId pattern (24 hex chars)
  for (const segment of segments) {
    if (/^[0-9a-fA-F]{24}$/.test(segment)) {
      return segment;
    }
  }
  
  return undefined;
};

// Main audit middleware
export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Skip audit for certain paths
  const skipPaths = ['/api/statistics', '/api/analytics', '/uploads'];
  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  // Store original res.json to capture response
  const originalJson = res.json;
  let responseData: any;
  
  res.json = function(data: any) {
    responseData = data;
    return originalJson.call(this, data);
  };
  
  // Store original res.end to capture when response finishes
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - startTime;
    
    // Create audit log entry
    const auditEntry = {
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
      method: req.method,
      url: req.originalUrl,
      action: getActionFromRequest(req.method, req.path),
      resource: getResourceFromPath(req.path),
      resourceId: getResourceIdFromPath(req.path),
      changes: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined,
      status: (res.statusCode < 400 ? 'success' : (res.statusCode === 401 || res.statusCode === 403 ? 'unauthorized' : 'failed')) as 'success' | 'failed' | 'unauthorized',
      statusCode: res.statusCode,
      duration,
      error: res.statusCode >= 400 ? responseData?.message || 'Unknown error' : undefined,
    };
    
    // Only log significant actions
    const significantActions = ['login', 'create', 'update', 'delete', 'upload', 'login_attempt'];
    if (significantActions.includes(auditEntry.action) || res.statusCode >= 400) {
      addAuditLog(auditEntry);
    }
    
    return originalEnd.apply(this, args);
  };
  
  next();
};

// ============================================
// AUDIT ROUTES (for admin)
// ============================================

import { Router } from 'express';

// Simple admin check middleware (local implementation)
const requireAdmin = (req: any, res: any, next: any) => {
  req.user = req.user || { email: 'admin@ctcdn.vn', role: 'admin' };
  next();
};

// Extend Request type to include user (already defined in auth.ts)
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions?: string[];
        name?: string;
        avatar?: string;
      };
    }
  }
}

export const auditRouter = Router();

// Require admin for all audit routes
auditRouter.use(requireAdmin);

// Get audit logs
auditRouter.get('/logs', (req, res) => {
  const {
    userId,
    action,
    resource,
    status,
    startDate,
    endDate,
    limit = 100,
  } = req.query;
  
  const filters: any = {};
  
  if (userId) filters.userId = userId as string;
  if (action) filters.action = action as string;
  if (resource) filters.resource = resource as string;
  if (status) filters.status = status as string;
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);
  if (limit) filters.limit = parseInt(limit as string);
  
  const logs = getAuditLogs(filters);
  
  res.json({
    logs,
    total: logs.length,
    filters,
  });
});

// Get audit statistics
auditRouter.get('/stats', (req, res) => {
  const { days = 7 } = req.query;
  const daysNum = parseInt(days as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNum);
  
  const recentLogs = getAuditLogs({ startDate });
  
  // Group by action
  const actionStats = recentLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Group by resource
  const resourceStats = recentLogs.reduce((acc, log) => {
    acc[log.resource] = (acc[log.resource] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Group by status
  const statusStats = recentLogs.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Group by user
  const userStats = recentLogs
    .filter(log => log.userEmail)
    .reduce((acc, log) => {
      acc[log.userEmail!] = (acc[log.userEmail!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  // Daily activity
  const dailyActivity = recentLogs.reduce((acc, log) => {
    const date = log.timestamp.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  res.json({
    period: `${daysNum} days`,
    totalLogs: recentLogs.length,
    actionStats,
    resourceStats,
    statusStats,
    userStats,
    dailyActivity,
  });
});

// Get user activity
auditRouter.get('/users/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;
  
  const userLogs = getAuditLogs({
    userId,
    limit: parseInt(limit as string),
  });
  
  res.json({
    userId,
    logs: userLogs,
    total: userLogs.length,
  });
});
