/**
 * Document Categories API Routes
 */

import { Router } from 'express';
import { DocumentCategory, Resource } from '../../models/index.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Get all active document categories (public filter / dropdowns)
router.get('/', async (req, res) => {
  try {
    const categories = await DocumentCategory.find({ isActive: true }).sort({ name: 1 });
    const transformed = categories.map(cat => ({
      ...cat.toObject(),
      id: cat._id.toString()
    }));
    res.json(transformed);
  } catch (error) {
    logger.error('Error getting active document categories:', error);
    res.status(500).json({ message: 'Không thể tải danh sách thể loại tài liệu.' });
  }
});

// Get all document categories including inactive ones (admin table)
router.get('/admin', async (req, res) => {
  try {
    const categories = await DocumentCategory.find().sort({ createdAt: -1 });
    const transformed = await Promise.all(categories.map(async cat => {
      const resourceCount = await Resource.countDocuments({ categoryId: cat._id });
      return {
        ...cat.toObject(),
        id: cat._id.toString(),
        resourceCount
      };
    }));
    res.json(transformed);
  } catch (error) {
    logger.error('Error getting admin document categories:', error);
    res.status(500).json({ message: 'Không thể tải danh sách thể loại tài liệu.' });
  }
});

// Create new document category
router.post('/', async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Tên thể loại không được để trống.' });
    }

    if (name.length > 100) {
      return res.status(400).json({ message: 'Tên thể loại không được vượt quá 100 ký tự.' });
    }

    // Check unique name
    const existing = await DocumentCategory.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    if (existing) {
      return res.status(400).json({ message: 'Tên thể loại này đã tồn tại.' });
    }

    const category = new DocumentCategory({
      name: name.trim(),
      description: description?.trim(),
      isActive: isActive !== false
    });

    await category.save();
    logger.info(`Document category created: ${category.name} (${category._id})`);
    res.status(201).json(category);
  } catch (error) {
    logger.error('Error creating document category:', error);
    res.status(500).json({ message: 'Không thể thêm thể loại tài liệu mới.' });
  }
});

// Update document category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const categoryId = req.params.id;

    const category = await DocumentCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại tài liệu.' });
    }

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Tên thể loại không được để trống.' });
      }
      if (name.length > 100) {
        return res.status(400).json({ message: 'Tên thể loại không được vượt quá 100 ký tự.' });
      }

      // Check unique name excluding itself
      const existing = await DocumentCategory.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: categoryId }
      });
      if (existing) {
        return res.status(400).json({ message: 'Tên thể loại này đã tồn tại.' });
      }
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();
    logger.info(`Document category updated: ${category.name} (${category._id})`);
    res.json(category);
  } catch (error) {
    logger.error('Error updating document category:', error);
    res.status(500).json({ message: 'Không thể cập nhật thể loại tài liệu.' });
  }
});

// Delete document category
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await DocumentCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại tài liệu.' });
    }

    // Integrity Check: check if any Resource is using this categoryId
    const documentCount = await Resource.countDocuments({ categoryId });
    if (documentCount > 0) {
      return res.status(400).json({
        message: 'Không thể xóa vì thể loại đang được sử dụng bởi tài liệu. Vui lòng chuyển các tài liệu sang thể loại khác trước khi xóa.'
      });
    }

    await DocumentCategory.findByIdAndDelete(categoryId);
    logger.info(`Document category deleted: ${category.name} (${categoryId})`);
    res.json({ message: 'Xóa thể loại thành công.' });
  } catch (error) {
    logger.error('Error deleting document category:', error);
    res.status(500).json({ message: 'Không thể xóa thể loại tài liệu này.' });
  }
});

export default router;
