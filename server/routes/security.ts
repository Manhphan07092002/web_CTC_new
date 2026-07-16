import { Router } from 'express';
import { logger } from '../../utils/logger';

const router = Router();

// Log 404 attempts for security monitoring
router.post('/404', async (req, res) => {
  try {
    const { path, search, userAgent, referrer, timestamp } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    const logData = {
      timestamp: timestamp || new Date().toISOString(),
      path,
      search,
      userAgent,
      referrer,
      ip: clientIP,
      headers: {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip']
      }
    };

    // Log to security log
    logger.warn('404 Security Log:', logData);
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /admin/i,
      /wp-admin/i,
      /phpmyadmin/i,
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i,
      /config/i,
      /backup/i,
      /database/i,
      /sql/i,
      /shell/i,
      /cmd/i,
      /exec/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(path) || pattern.test(search || '')
    );

    if (isSuspicious) {
      logger.error('SUSPICIOUS 404 ATTEMPT DETECTED:', {
        ...logData,
        severity: 'HIGH',
        reason: 'Suspicious path pattern detected'
      });
    }

    // In production, you might want to:
    // 1. Store in database for analysis
    // 2. Send alerts for suspicious patterns
    // 3. Implement rate limiting per IP
    // 4. Block IPs with too many suspicious attempts

    res.status(200).json({ logged: true });
  } catch (error) {
    logger.error('Error logging 404 attempt:', error);
    res.status(500).json({ error: 'Logging failed' });
  }
});

// Get 404 statistics (admin only)
router.get('/404/stats', async (req, res) => {
  try {
    // This would typically query a database
    // For now, return a placeholder response
    res.json({
      message: 'Security statistics endpoint - implement database queries here',
      note: 'Check server logs for 404 attempts'
    });
  } catch (error) {
    logger.error('Error getting 404 stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;
