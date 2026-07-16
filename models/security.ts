/**
 * Security Models
 * Models for security events and audit logs
 */

import mongoose, { Schema, Document } from 'mongoose';

// ============================================
// SECURITY EVENT MODEL
// ============================================
export interface ISecurityEvent extends Document {
  type: 'suspicious_request' | 'rate_limit_exceeded' | 'failed_login' | 'ip_blocked' | 'xss_attempt' | 'sql_injection' | 'unauthorized_access';
  ip: string;
  userAgent?: string;
  path?: string;
  method?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  userId?: string;
  userEmail?: string;
  blocked: boolean;
  createdAt: Date;
}

const SecurityEventSchema = new Schema<ISecurityEvent>({
  type: {
    type: String,
    required: true,
    enum: ['suspicious_request', 'rate_limit_exceeded', 'failed_login', 'ip_blocked', 'xss_attempt', 'sql_injection', 'unauthorized_access'],
  },
  ip: {
    type: String,
    required: true,
    index: true,
  },
  userAgent: String,
  path: String,
  method: String,
  details: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  userId: String,
  userEmail: String,
  blocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Auto-delete old events after 30 days
SecurityEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const SecurityEvent = mongoose.models.SecurityEvent || mongoose.model<ISecurityEvent>('SecurityEvent', SecurityEventSchema);

// ============================================
// AUDIT LOG MODEL
// ============================================
export interface IAuditLog extends Document {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ip: string;
  userAgent?: string;
  method: string;
  path: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: any;
  status: 'success' | 'failed' | 'unauthorized';
  statusCode: number;
  duration?: number;
  error?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: String,
  userEmail: {
    type: String,
    index: true,
  },
  userRole: String,
  ip: {
    type: String,
    required: true,
    index: true,
  },
  userAgent: String,
  method: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  resource: {
    type: String,
    required: true,
    index: true,
  },
  resourceId: String,
  changes: Schema.Types.Mixed,
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed', 'unauthorized'],
    index: true,
  },
  statusCode: {
    type: Number,
    required: true,
  },
  duration: Number,
  error: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Auto-delete old logs after 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

// ============================================
// IP BLACKLIST MODEL
// ============================================
export interface IIPBlacklist extends Document {
  ip: string;
  reason: string;
  blockedBy: string;
  blockedByEmail: string;
  expiresAt?: Date;
  permanent: boolean;
  createdAt: Date;
}

const IPBlacklistSchema = new Schema<IIPBlacklist>({
  ip: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  reason: {
    type: String,
    required: true,
  },
  blockedBy: String,
  blockedByEmail: String,
  expiresAt: Date,
  permanent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const IPBlacklist = mongoose.models.IPBlacklist || mongoose.model<IIPBlacklist>('IPBlacklist', IPBlacklistSchema);

// ============================================
// SECURITY STATS MODEL (Daily aggregation)
// ============================================
export interface ISecurityStats extends Document {
  date: Date;
  totalRequests: number;
  blockedRequests: number;
  failedLogins: number;
  suspiciousActivities: number;
  uniqueIPs: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topBlockedIPs: Array<{ ip: string; count: number }>;
}

const SecurityStatsSchema = new Schema<ISecurityStats>({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true,
  },
  totalRequests: {
    type: Number,
    default: 0,
  },
  blockedRequests: {
    type: Number,
    default: 0,
  },
  failedLogins: {
    type: Number,
    default: 0,
  },
  suspiciousActivities: {
    type: Number,
    default: 0,
  },
  uniqueIPs: {
    type: Number,
    default: 0,
  },
  eventsByType: {
    type: Schema.Types.Mixed,
    default: {},
  },
  eventsBySeverity: {
    type: Schema.Types.Mixed,
    default: {},
  },
  topBlockedIPs: [{
    ip: String,
    count: Number,
  }],
});

export const SecurityStats = mongoose.models.SecurityStats || mongoose.model<ISecurityStats>('SecurityStats', SecurityStatsSchema);
