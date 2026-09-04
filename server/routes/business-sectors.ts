import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { requireAuth } from '../middleware/auth';
import { logger } from '../../utils/logger';

const router = Router();

// Helper to generate slug from Vietnamese string
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET /api/business-sectors - Get list of business sectors
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    let sectors;
    if (isAdmin) {
      sectors = await db.businessSectors.getAll({ isDeleted: { $ne: true } });
    } else {
      sectors = await db.businessSectors.getActive();
    }
    res.json(sectors);
  } catch (error: any) {
    logger.error('Error fetching business sectors:', error);
    res.status(500).json({ message: 'Lỗi khi tải danh sách lĩnh vực hoạt động', error: error.message });
  }
});

// GET /api/business-sectors/:id - Get single sector by ID
router.get('/:id', async (req, res) => {
  try {
    const sector = await db.businessSectors.getById(req.params.id);
    if (!sector) {
      return res.status(404).json({ message: 'Không tìm thấy lĩnh vực hoạt động' });
    }
    res.json(sector);
  } catch (error: any) {
    logger.error('Error fetching business sector by id:', error);
    res.status(500).json({ message: 'Lỗi khi tải chi tiết lĩnh vực hoạt động', error: error.message });
  }
});

// POST /api/business-sectors - Create a new business sector (Admin)
router.post('/', requireAuth, async (req: any, res) => {
  try {
    const { name, slug, subtitle, description, content, icon, image, gallery, highlights, stats, status, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Tên lĩnh vực hoạt động là bắt buộc' });
    }

    const finalSlug = (slug?.trim() || generateSlug(name)).replace(/^\/+|\/+$/g, '');

    const newSector = await db.businessSectors.add({
      name: name.trim(),
      slug: finalSlug,
      subtitle: subtitle?.trim() || '',
      description: description?.trim() || '',
      content: content?.trim() || '',
      icon: icon?.trim() || 'Handshake',
      image: image?.trim() || '',
      gallery: Array.isArray(gallery) ? gallery : [],
      highlights: Array.isArray(highlights) ? highlights.filter((h: any) => typeof h === 'string' && h.trim()) : [],
      stats: Array.isArray(stats) ? stats : [],
      status: status === 'inactive' ? 'inactive' : 'active',
      sortOrder: Number(sortOrder) || 0,
      isDeleted: false,
      createdBy: req.user?.email || 'admin'
    });

    res.status(201).json(newSector);
  } catch (error: any) {
    logger.error('Error creating business sector:', error);
    res.status(500).json({ message: 'Lỗi khi tạo mới lĩnh vực hoạt động', error: error.message });
  }
});

// PUT /api/business-sectors/reorder - Update sort orders
router.put('/reorder', requireAuth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Danh sách items không hợp lệ' });
    }
    await db.businessSectors.reorder(items);
    res.json({ success: true, message: 'Cập nhật thứ tự thành công' });
  } catch (error: any) {
    logger.error('Error reordering business sectors:', error);
    res.status(500).json({ message: 'Lỗi khi sắp xếp thứ tự', error: error.message });
  }
});

// PUT /api/business-sectors/:id - Update business sector
router.put('/:id', requireAuth, async (req: any, res) => {
  try {
    const { name, slug, subtitle, description, content, icon, image, gallery, highlights, stats, status, sortOrder } = req.body;

    const existing = await db.businessSectors.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy lĩnh vực hoạt động cần sửa' });
    }

    const finalSlug = slug !== undefined ? (slug.trim() || generateSlug(name || existing.name)) : existing.slug;

    const updated = await db.businessSectors.update(req.params.id, {
      ...(name && { name: name.trim() }),
      ...(slug !== undefined && { slug: finalSlug }),
      ...(subtitle !== undefined && { subtitle: subtitle.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(content !== undefined && { content: content.trim() }),
      ...(icon !== undefined && { icon: icon.trim() }),
      ...(image !== undefined && { image: image.trim() }),
      ...(gallery !== undefined && { gallery: Array.isArray(gallery) ? gallery : [] }),
      ...(highlights !== undefined && { highlights: Array.isArray(highlights) ? highlights.filter((h: any) => typeof h === 'string' && h.trim()) : [] }),
      ...(stats !== undefined && { stats: Array.isArray(stats) ? stats : [] }),
      ...(status !== undefined && { status }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      updatedBy: req.user?.email || 'admin'
    });

    res.json(updated);
  } catch (error: any) {
    logger.error('Error updating business sector:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật lĩnh vực hoạt động', error: error.message });
  }
});

// PATCH /api/business-sectors/:id/toggle-status - Toggle active/inactive
router.patch('/:id/toggle-status', requireAuth, async (req, res) => {
  try {
    const updated = await db.businessSectors.toggleStatus(req.params.id);
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy lĩnh vực hoạt động' });
    }
    res.json(updated);
  } catch (error: any) {
    logger.error('Error toggling business sector status:', error);
    res.status(500).json({ message: 'Lỗi khi đổi trạng thái', error: error.message });
  }
});

// DELETE /api/business-sectors/:id - Soft delete
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const success = await db.businessSectors.delete(req.params.id, true);
    if (!success) {
      return res.status(404).json({ message: 'Không tìm thấy lĩnh vực hoạt động cần xóa' });
    }
    res.json({ success: true, message: 'Đã xóa lĩnh vực hoạt động thành công' });
  } catch (error: any) {
    logger.error('Error deleting business sector:', error);
    res.status(500).json({ message: 'Lỗi khi xóa lĩnh vực hoạt động', error: error.message });
  }
});

export default router;
