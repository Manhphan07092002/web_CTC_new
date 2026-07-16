import express from 'express';
import { db } from '../../services/db-mongodb';

const router = express.Router();

// Get all goals
router.get('/', async (req, res) => {
  try {
    const goals = await db.goals.getAll();
    res.json(goals);
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({ error: 'Failed to get goals' });
  }
});

// Get active goals
router.get('/active', async (req, res) => {
  try {
    const goals = await db.goals.getActive();
    res.json(goals);
  } catch (error) {
    console.error('Error getting active goals:', error);
    res.status(500).json({ error: 'Failed to get active goals' });
  }
});

// Get current goal
router.get('/current', async (req, res) => {
  try {
    const goal = await db.goals.getCurrent();
    res.json(goal);
  } catch (error) {
    console.error('Error getting current goal:', error);
    res.status(500).json({ error: 'Failed to get current goal' });
  }
});

// Get goal by ID
router.get('/:id', async (req, res) => {
  try {
    const goal = await db.goals.getById(req.params.id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    console.error('Error getting goal:', error);
    res.status(500).json({ error: 'Failed to get goal' });
  }
});

// Create goal
router.post('/', async (req, res) => {
  try {
    const goalData = req.body;
    const goal = await db.goals.create(goalData);
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update goal
router.put('/:id', async (req, res) => {
  try {
    const goalData = req.body;
    const goal = await db.goals.update(req.params.id, goalData);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete goal
router.delete('/:id', async (req, res) => {
  try {
    const success = await db.goals.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
