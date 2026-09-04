import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { requireAuth } from '../middleware/auth';
import { logger } from '../../utils/logger';

const router = Router();

// GET /api/company-profiles - Get list of company profiles
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    let profiles;
    if (isAdmin) {
      profiles = await db.companyProfiles.getAll({ isDeleted: { $ne: true } });
    } else {
      profiles = await db.companyProfiles.getActive();
    }
    res.json(profiles);
  } catch (error: any) {
    logger.error('Error fetching company profiles:', error);
    res.status(500).json({ message: 'Lỗi khi tải danh sách hồ sơ năng lực', error: error.message });
  }
});

// GET /api/company-profiles/active - Get single active profile for frontend hero/features
router.get('/active', async (req, res) => {
  try {
    const activeProfiles = await db.companyProfiles.getActive();
    const profile = activeProfiles.length > 0 ? activeProfiles[0] : null;
    res.json(profile);
  } catch (error: any) {
    logger.error('Error fetching active company profile:', error);
    res.status(500).json({ message: 'Lỗi khi tải hồ sơ năng lực', error: error.message });
  }
});

// GET /api/company-profiles/:id - Get single profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await db.companyProfiles.getById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ năng lực' });
    }
    res.json(profile);
  } catch (error: any) {
    logger.error('Error fetching company profile by id:', error);
    res.status(500).json({ message: 'Lỗi khi tải chi tiết hồ sơ năng lực', error: error.message });
  }
});

// POST /api/company-profiles - Create a new company profile (Admin)
router.post('/', requireAuth, async (req: any, res) => {
  try {
    const { title, subtitle, description, year, version, fileUrl, fileName, fileSize, thumbnail, tag, highlights, stats, status, sortOrder } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ message: 'Tiêu đề và đường dẫn File đính kèm là bắt buộc' });
    }

    const newProfile = await db.companyProfiles.add({
      title: title.trim(),
      subtitle: subtitle?.trim() || 'Năng Lực & Pháp Lý',
      description: description?.trim() || '',
      year: year || new Date().getFullYear().toString(),
      version: version?.trim() || 'v1.0',
      fileUrl: fileUrl.trim(),
      fileName: fileName?.trim() || '',
      fileSize: Number(fileSize) || 0,
      thumbnail: thumbnail?.trim() || '',
      tag: tag?.trim() || 'CTC-PROFILE-2026',
      highlights: Array.isArray(highlights) ? highlights.filter((h: any) => typeof h === 'string' && h.trim()) : [],
      stats: Array.isArray(stats) ? stats : [],
      status: status === 'inactive' ? 'inactive' : 'active',
      sortOrder: Number(sortOrder) || 0,
      publishedAt: new Date(),
      isDeleted: false,
      createdBy: req.user?.email || 'admin'
    });

    res.status(201).json(newProfile);
  } catch (error: any) {
    logger.error('Error creating company profile:', error);
    res.status(500).json({ message: 'Lỗi khi tạo mới hồ sơ năng lực', error: error.message });
  }
});

// PUT /api/company-profiles/reorder - Update sort orders
router.put('/reorder', requireAuth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Danh sách items không hợp lệ' });
    }
    await db.companyProfiles.reorder(items);
    res.json({ success: true, message: 'Cập nhật thứ tự thành công' });
  } catch (error: any) {
    logger.error('Error reordering company profiles:', error);
    res.status(500).json({ message: 'Lỗi khi sắp xếp thứ tự', error: error.message });
  }
});

// PUT /api/company-profiles/:id - Update company profile
router.put('/:id', requireAuth, async (req: any, res) => {
  try {
    const { title, subtitle, description, year, version, fileUrl, fileName, fileSize, thumbnail, tag, highlights, stats, status, sortOrder } = req.body;

    const existing = await db.companyProfiles.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ năng lực cần sửa' });
    }

    const updated = await db.companyProfiles.update(req.params.id, {
      ...(title && { title: title.trim() }),
      ...(subtitle !== undefined && { subtitle: subtitle.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(year !== undefined && { year }),
      ...(version !== undefined && { version: version.trim() }),
      ...(fileUrl && { fileUrl: fileUrl.trim() }),
      ...(fileName !== undefined && { fileName: fileName.trim() }),
      ...(fileSize !== undefined && { fileSize: Number(fileSize) }),
      ...(thumbnail !== undefined && { thumbnail: thumbnail.trim() }),
      ...(tag !== undefined && { tag: tag.trim() }),
      ...(highlights !== undefined && { highlights: Array.isArray(highlights) ? highlights : [] }),
      ...(stats !== undefined && { stats: Array.isArray(stats) ? stats : [] }),
      ...(status !== undefined && { status }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      updatedBy: req.user?.email || 'admin'
    });

    res.json(updated);
  } catch (error: any) {
    logger.error('Error updating company profile:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật hồ sơ năng lực', error: error.message });
  }
});

// PATCH /api/company-profiles/:id/toggle-status - Toggle active/inactive
router.patch('/:id/toggle-status', requireAuth, async (req, res) => {
  try {
    const updated = await db.companyProfiles.toggleStatus(req.params.id);
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ năng lực' });
    }
    res.json(updated);
  } catch (error: any) {
    logger.error('Error toggling company profile status:', error);
    res.status(500).json({ message: 'Lỗi khi đổi trạng thái', error: error.message });
  }
});

// DELETE /api/company-profiles/:id - Soft delete
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const success = await db.companyProfiles.delete(req.params.id, true);
    if (!success) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ năng lực cần xóa' });
    }
    res.json({ success: true, message: 'Đã xóa hồ sơ năng lực thành công' });
  } catch (error: any) {
    logger.error('Error deleting company profile:', error);
    res.status(500).json({ message: 'Lỗi khi xóa hồ sơ năng lực', error: error.message });
  }
});

export default router;
