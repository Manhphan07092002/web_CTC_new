import express from 'express';
import { Resource } from '../../models/index.js';
import { requirePermission } from '../middleware/permission.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

// GET all resources (public)
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find({ isActive: true }).populate('categoryId').sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    logger.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET all resources including inactive (admin only)
router.get('/admin', async (req, res) => {
  try {
    const resources = await Resource.find().populate('categoryId').sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    logger.error('Error fetching admin resources:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST new resource
router.post('/', async (req, res) => {
  try {
    const newResource = new Resource(req.body);
    const savedResource = await newResource.save();
    const populated = await savedResource.populate('categoryId');
    res.status(201).json(populated);
  } catch (error) {
    logger.error('Error creating resource:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update resource
router.put('/:id', async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoryId');
    
    if (!updatedResource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(updatedResource);
  } catch (error) {
    logger.error('Error updating resource:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE resource
router.delete('/:id', async (req, res) => {
  try {
    const deletedResource = await Resource.findByIdAndDelete(req.params.id);
    
    if (!deletedResource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    logger.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
