import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { apiCache } from '../utils/api-cache';

const router = Router();

// Apply cache middleware for GET requests (5 minutes)
router.use(apiCache.middleware(300, '/api/partners'));

router.get('/', async (req, res) => {
  try {
    const items = await db.partners.getAll();
    res.json(items);
  } catch (error) {
    console.error('Error getting partners', error);
    res.status(500).json({ message: 'Failed to get partners' });
  }
});

router.post('/', async (req, res) => {
  try {
    const created = await db.partners.add(req.body);
    apiCache.delByPrefix('/api/partners');
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating partner', error);
    res.status(500).json({ message: 'Failed to create partner' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await db.partners.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Partner not found' });
    apiCache.delByPrefix('/api/partners');
    res.json(updated);
  } catch (error) {
    console.error('Error updating partner', error);
    res.status(500).json({ message: 'Failed to update partner' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await db.partners.delete(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Partner not found' });
    apiCache.delByPrefix('/api/partners');
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting partner', error);
    res.status(500).json({ message: 'Failed to delete partner' });
  }
});

export default router;
