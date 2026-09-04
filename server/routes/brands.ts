import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { Brand } from '../../models';

const router = Router();

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// GET /api/brands
router.get('/', async (req, res) => {
  try {
    const admin = req.query.admin === 'true';
    const filter = admin ? { isDeleted: { $ne: true } } : { isActive: true, isDeleted: { $ne: true } };
    const items = await db.brands.getAll(filter);
    res.json(items);
  } catch (error: any) {
    console.error('Error getting brands:', error);
    res.status(500).json({ message: 'Failed to get brands', error: error?.message });
  }
});

// GET /api/brands/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await db.brands.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Brand not found' });
    res.json(item);
  } catch (error: any) {
    console.error('Error getting brand:', error);
    res.status(500).json({ message: 'Failed to get brand', error: error?.message });
  }
});

// POST /api/brands
router.post('/', async (req, res) => {
  try {
    const { name, slug, logo, website, origin, description, isActive, sortOrder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Tên thương hiệu không được để trống' });
    }

    const brandSlug = slug ? slugify(slug) : slugify(name);
    
    // Check slug uniqueness
    const existing = await Brand.findOne({ slug: brandSlug, isDeleted: { $ne: true } });
    if (existing) {
      return res.status(400).json({ message: 'Thương hiệu với mã slug này đã tồn tại' });
    }

    const created = await db.brands.add({
      name: name.trim(),
      slug: brandSlug,
      logo: logo || '',
      website: website || '',
      origin: origin || '',
      description: description || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      sortOrder: Number(sortOrder) || 0,
      isDeleted: false
    });

    res.status(201).json(created);
  } catch (error: any) {
    console.error('Error creating brand:', error);
    res.status(500).json({ message: 'Failed to create brand', error: error?.message });
  }
});

// PUT /api/brands/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, logo, website, origin, description, isActive, sortOrder } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) updateData.slug = slugify(slug || name);
    if (logo !== undefined) updateData.logo = logo;
    if (website !== undefined) updateData.website = website;
    if (origin !== undefined) updateData.origin = origin;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const updated = await db.brands.update(req.params.id, updateData);
    if (!updated) return res.status(404).json({ message: 'Brand not found' });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating brand:', error);
    res.status(500).json({ message: 'Failed to update brand', error: error?.message });
  }
});

// PATCH /api/brands/:id/toggle-status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const updated = await db.brands.toggleStatus(req.params.id);
    if (!updated) return res.status(404).json({ message: 'Brand not found' });
    res.json(updated);
  } catch (error: any) {
    console.error('Error toggling brand status:', error);
    res.status(500).json({ message: 'Failed to toggle status', error: error?.message });
  }
});

// DELETE /api/brands/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await db.brands.delete(req.params.id, true);
    if (!ok) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ message: 'Failed to delete brand', error: error?.message });
  }
});

// PUT /api/brands/reorder
router.put('/reorder', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items array is required' });
    }
    await db.brands.reorder(items);
    res.json({ message: 'Brands reordered successfully' });
  } catch (error: any) {
    console.error('Error reordering brands:', error);
    res.status(500).json({ message: 'Failed to reorder brands', error: error?.message });
  }
});

export default router;
