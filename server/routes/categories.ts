import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { logger } from "../../utils/logger";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const items = await db.categories.getAll();
    res.json(items);
  } catch (error) {
    logger.error('Error getting categories', error);
    res.status(500).json({ message: 'Failed to get categories' });
  }
});

router.post('/', async (req, res) => {
  try {
    const created = await db.categories.add(req.body);
    res.status(201).json(created);
  } catch (error) {
    logger.error('Error creating category', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await db.categories.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    res.json(updated);
  } catch (error) {
    logger.error('Error updating category', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await db.categories.delete(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Category not found' });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting category', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

export default router;
