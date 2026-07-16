import express from 'express';
import FunnelMetricsService from '../../services/funnel-metrics-service';

const router = express.Router();

// Capture current metrics snapshot
router.post('/capture', async (req, res) => {
  try {
    const { period } = req.body;
    const snapshot = await FunnelMetricsService.captureMetrics(period || 'daily');
    res.json(snapshot);
  } catch (error) {
    console.error('Error capturing metrics:', error);
    res.status(500).json({ error: 'Failed to capture metrics' });
  }
});

// Get latest metrics
router.get('/latest', async (req, res) => {
  try {
    const { period } = req.query;
    const metrics = await FunnelMetricsService.getLatest(period as string);
    res.json(metrics);
  } catch (error) {
    console.error('Error getting latest metrics:', error);
    res.status(500).json({ error: 'Failed to get latest metrics' });
  }
});

// Get metrics with goal comparison
router.get('/with-goal', async (req, res) => {
  try {
    const metrics = await FunnelMetricsService.getMetricsWithGoal();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting metrics with goal:', error);
    res.status(500).json({ error: 'Failed to get metrics with goal' });
  }
});

// Get metrics history
router.get('/history', async (req, res) => {
  try {
    const { period, startDate, endDate, limit } = req.query;
    
    const options: any = {};
    if (period) options.period = period;
    if (startDate) options.startDate = new Date(startDate as string);
    if (endDate) options.endDate = new Date(endDate as string);
    if (limit) options.limit = parseInt(limit as string);
    
    const history = await FunnelMetricsService.getHistory(options);
    res.json(history);
  } catch (error) {
    console.error('Error getting metrics history:', error);
    res.status(500).json({ error: 'Failed to get metrics history' });
  }
});

// Get achievement summary
router.get('/achievement-summary', async (req, res) => {
  try {
    const summary = await FunnelMetricsService.getAchievementSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting achievement summary:', error);
    res.status(500).json({ error: 'Failed to get achievement summary' });
  }
});

export default router;
