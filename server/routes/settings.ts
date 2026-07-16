import { Router } from 'express';
import { db } from '../../services/db-mongodb';

const router = Router();

// GET /api/settings - Get site settings
router.get('/', async (req, res) => {
  try {
    const settings = await db.settings.get();
    res.json(settings);
  } catch (error) {
    console.error('Error getting settings', error);
    res.status(500).json({ message: 'Failed to get settings' });
  }
});

// GET /api/settings/maintenance - Check maintenance status (for mobile app)
router.get('/maintenance', async (req, res) => {
  try {
    const settings = await db.settings.get();
    res.json({
      maintenance: settings.maintenance || false,
      message: settings.maintenance 
        ? 'Hệ thống đang bảo trì. Vui lòng quay lại sau.'
        : 'Hệ thống hoạt động bình thường',
      siteName: settings.siteName,
      email: settings.email,
      phone: settings.phone
    });
  } catch (error) {
    console.error('Error checking maintenance status', error);
    res.status(500).json({ message: 'Failed to check maintenance status' });
  }
});

// PUT /api/settings - Update site settings
router.put('/', async (req, res) => {
  try {
    const updated = await db.settings.update(req.body);
    res.json(updated);
  } catch (error) {
    console.error('Error updating settings', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

export default router;
