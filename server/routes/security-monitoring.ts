/**
 * Security Monitoring API Routes
 */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

// Import models để đảm bảo schemas được đăng ký
import '../../models/security';

const router = Router();

// Helper functions để tránh lỗi TypeScript với Mongoose
const getSecurityEvent = () => mongoose.model('SecurityEvent');
const getAuditLog = () => mongoose.model('AuditLog');
const getIPBlacklist = () => mongoose.model('IPBlacklist');

// GET events
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { type, severity, ip, limit = 50, page = 1 } = req.query;
    const query: any = {};
    if (type && type !== 'all') query.type = type;
    if (severity && severity !== 'all') query.severity = severity;
    if (ip) query.ip = { $regex: ip, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      getSecurityEvent().find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      getSecurityEvent().countDocuments(query),
    ]);

    res.json({ events, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải sự kiện bảo mật' });
  }
});

// POST events
router.post('/events', async (req: Request, res: Response) => {
  try {
    const event = new (getSecurityEvent())(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo sự kiện' });
  }
});

// GET audit logs
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const { action, resource, status, userEmail, ip, limit = 50, page = 1 } = req.query;
    const query: any = {};
    if (action && action !== 'all') query.action = action;
    if (resource && resource !== 'all') query.resource = resource;
    if (status && status !== 'all') query.status = status;
    if (userEmail) query.userEmail = { $regex: userEmail, $options: 'i' };
    if (ip) query.ip = { $regex: ip, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      getAuditLog().find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      getAuditLog().countDocuments(query),
    ]);

    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải nhật ký hoạt động' });
  }
});

// POST audit logs
router.post('/audit-logs', async (req: Request, res: Response) => {
  try {
    const log = new (getAuditLog())(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo nhật ký' });
  }
});

// GET blacklist
router.get('/blacklist', async (req: Request, res: Response) => {
  try {
    const blacklist = await getIPBlacklist().find().sort({ createdAt: -1 }).lean();
    res.json({ blacklist, count: blacklist.length });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách chặn' });
  }
});

// POST blacklist
router.post('/blacklist', async (req: Request, res: Response) => {
  try {
    const { ip, reason, permanent = false } = req.body;
    if (!ip) return res.status(400).json({ message: 'Địa chỉ IP là bắt buộc' });

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) return res.status(400).json({ message: 'Địa chỉ IP không hợp lệ' });

    const existing = await getIPBlacklist().findOne({ ip });
    if (existing) return res.status(400).json({ message: 'IP này đã có trong danh sách chặn' });

    const entry = new (getIPBlacklist())({
      ip,
      reason: reason || 'Không có lý do',
      blockedBy: (req as any).user?.id || 'system',
      blockedByEmail: (req as any).user?.email || 'Admin',
      permanent,
    });
    await entry.save();

    await getSecurityEvent().create({
      type: 'ip_blocked',
      ip,
      details: `IP ${ip} đã bị chặn. Lý do: ${reason || 'Không có lý do'}`,
      severity: 'high',
      blocked: true,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm vào danh sách chặn' });
  }
});

// DELETE blacklist
router.delete('/blacklist/:ip', async (req: Request, res: Response) => {
  try {
    const { ip } = req.params;
    const result = await getIPBlacklist().findOneAndDelete({ ip });
    if (!result) return res.status(404).json({ message: 'Không tìm thấy IP trong danh sách chặn' });
    res.json({ message: `IP ${ip} đã được bỏ chặn` });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi bỏ chặn IP' });
  }
});

// GET stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const [totalEvents, blockedRequests, failedLogins, suspiciousActivities, blacklistedIPs, activeUsersArr] = await Promise.all([
      getSecurityEvent().countDocuments({ createdAt: { $gte: startDate } }),
      getSecurityEvent().countDocuments({ createdAt: { $gte: startDate }, $or: [{ type: 'ip_blocked' }, { blocked: true }] }),
      getSecurityEvent().countDocuments({ createdAt: { $gte: startDate }, type: 'failed_login' }),
      getSecurityEvent().countDocuments({ createdAt: { $gte: startDate }, $or: [{ type: 'suspicious_request' }, { type: 'xss_attempt' }] }),
      getIPBlacklist().countDocuments(),
      getAuditLog().distinct('userEmail', { createdAt: { $gte: startDate }, userEmail: { $ne: null } }),
    ]);

    res.json({
      period: `${days} ngày`,
      stats: { totalEvents, blockedRequests, failedLogins, suspiciousActivities, blacklistedIPs, activeUsers: activeUsersArr.length },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải thống kê' });
  }
});

// GET status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [events24h, highSeverityEvents, blacklistCount] = await Promise.all([
      getSecurityEvent().countDocuments({ createdAt: { $gte: last24h } }),
      getSecurityEvent().countDocuments({ createdAt: { $gte: last24h }, severity: 'high' }),
      getIPBlacklist().countDocuments(),
    ]);

    let threatLevel = 'low';
    if (highSeverityEvents > 10) threatLevel = 'critical';
    else if (highSeverityEvents > 5) threatLevel = 'high';
    else if (highSeverityEvents > 0) threatLevel = 'medium';

    res.json({
      status: 'active',
      timestamp: now,
      threatLevel,
      metrics: { events24h, highSeverityEvents, blacklistCount },
      securityFeatures: { rateLimiting: true, xssProtection: true, corsEnabled: true, jwtAuth: true, ipFiltering: true, auditLogging: true },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải trạng thái bảo mật' });
  }
});

export default router;
