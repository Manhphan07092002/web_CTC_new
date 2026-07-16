import express from 'express';
import { runTranslationJob, getSchedulerStatus } from '../services/translationScheduler';

const router = express.Router();

/**
 * GET /api/admin/translation-status
 * Get scheduler status
 */
router.get('/translation-status', async (req, res) => {
  try {
    const status = getSchedulerStatus();
    res.json({
      success: true,
      ...status,
      message: status.isRunning 
        ? 'Translation job is currently running' 
        : 'Scheduler is idle'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get status' });
  }
});

/**
 * POST /api/admin/translate-all
 * Manually trigger translation job
 */
router.post('/translate-all', async (req, res) => {
  try {
    const status = getSchedulerStatus();
    
    if (status.isRunning) {
      return res.status(409).json({
        success: false,
        message: 'Translation job is already running'
      });
    }
    
    // Run in background
    res.json({
      success: true,
      message: 'Translation job started in background'
    });
    
    // Execute after response sent
    setImmediate(async () => {
      const stats = await runTranslationJob();
      console.log('Manual translation job completed:', stats);
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to start translation job' });
  }
});

export default router;
