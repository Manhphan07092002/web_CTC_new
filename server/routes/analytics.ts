import express from 'express';
import { db } from '../../services/db-mongodb';

const router = express.Router();

// Track analytics event
router.post('/track', async (req, res) => {
  try {
    const { eventType, userId, sessionId, productId, metadata, ipAddress, userAgent, referrer } = req.body;
    
    if (!eventType || !sessionId) {
      return res.status(400).json({ error: 'eventType and sessionId are required' });
    }
    
    const isValidObjectId = (id: any) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
    const cleanProductId = isValidObjectId(productId) ? productId : undefined;

    const event = await db.analytics.trackEvent({
      eventType,
      userId,
      sessionId,
      productId: cleanProductId,
      metadata,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.headers['user-agent'],
      referrer: referrer || req.headers.referer,
      timestamp: new Date()
    } as any);
    
    res.json(event);
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Get funnel data
router.get('/funnel', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    const funnelData = await db.analytics.getFunnelData();
    res.json(funnelData);
  } catch (error) {
    console.error('Error getting funnel data:', error);
    res.status(500).json({ error: 'Failed to get funnel data' });
  }
});

// Get all events
router.get('/events', async (req, res) => {
  try {
    const events = await db.analytics.getEvents();
    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Get events by type
router.get('/events/:type', async (req, res) => {
  try {
    const events = await db.analytics.getEvents({ type: req.params.type });
    res.json(events);
  } catch (error) {
    console.error('Error getting events by type:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Get events by session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const events = await db.analytics.getEvents({ sessionId: req.params.sessionId });
    res.json(events);
  } catch (error) {
    console.error('Error getting session events:', error);
    res.status(500).json({ error: 'Failed to get session events' });
  }
});

// Clear old events
router.delete('/cleanup', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 90;
    const deletedCount = await db.analytics.clearOldEvents(days);
    res.json({ message: `Deleted ${deletedCount} old events`, deletedCount });
  } catch (error) {
    console.error('Error clearing old events:', error);
    res.status(500).json({ error: 'Failed to clear old events' });
  }
});

export default router;
