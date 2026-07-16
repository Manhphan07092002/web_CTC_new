/**
 * News Categories API Routes
 */

import { Router } from 'express';
import { NewsCategory, generateSlug, applyTranslations, TRANSLATION_FIELDS, SupportedLanguage, SUPPORTED_LANGUAGES } from '../../models';
import { logger } from '../../utils/logger';
import { translateCategory } from '../services/translate';

const router = Router();

// Helper to get language from request
const getLanguage = (req: any): SupportedLanguage => {
  const lang = (req.query.lang as string) || 'vi';
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : 'vi';
};

// Get all news categories
router.get('/', async (req, res) => {
  try {
    const lang = getLanguage(req);
    const categories = await NewsCategory.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    // Transform _id to id and apply translations
    const transformed = categories.map(cat => {
      let obj = { ...cat.toObject({ flattenMaps: true }), id: cat._id.toString() };
      if (lang !== 'vi') {
        obj = applyTranslations(obj, [...TRANSLATION_FIELDS.category], lang);
      }
      return obj;
    });

    res.json(transformed);
  } catch (error) {
    logger.error('Error getting news categories', error);
    res.status(500).json({ message: 'Failed to get news categories' });
  }
});

// Get single news category
router.get('/:id', async (req, res) => {
  try {
    const category = await NewsCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'News category not found' });
    }
    res.json(category);
  } catch (error) {
    logger.error('Error getting news category', error);
    res.status(500).json({ message: 'Failed to get news category' });
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await NewsCategory.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'News category not found' });
    }
    res.json(category);
  } catch (error) {
    logger.error('Error getting news category by slug', error);
    res.status(500).json({ message: 'Failed to get news category' });
  }
});

// Create news category
router.post('/', async (req, res) => {
  try {
    const { name, description, icon, color, order } = req.body;

    const slug = generateSlug(name);

    const existing = await NewsCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    // Auto-translate category
    const translatedData = await translateCategory({ name, description });
    
    const category = new NewsCategory({
      name,
      slug,
      description,
      icon,
      color,
      order: order || 0,
      isActive: true,
      newsCount: 0,
      translations: translatedData.translations
    });

    await category.save();
    logger.info('News category created with translations:', category.id);
    res.status(201).json(category);
  } catch (error) {
    logger.error('Error creating news category', error);
    res.status(500).json({ message: 'Failed to create news category' });
  }
});

// Update news category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, icon, color, order, isActive } = req.body;

    const category = await NewsCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'News category not found' });
    }

    if (name && name !== category.name) {
      const newSlug = generateSlug(name);
      const existing = await NewsCategory.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
      category.slug = newSlug;
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    // Auto-translate if name or description changed
    if (name || description) {
      const translatedData = await translateCategory({ 
        name: category.name, 
        description: category.description 
      });
      if (translatedData.translations) {
        (category as any).translations = translatedData.translations;
      }
    }

    await category.save();
    logger.info('News category updated with translations:', category.id);
    res.json(category);
  } catch (error) {
    logger.error('Error updating news category', error);
    res.status(500).json({ message: 'Failed to update news category' });
  }
});

// Delete news category
router.delete('/:id', async (req, res) => {
  try {
    const category = await NewsCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'News category not found' });
    }

    if (category.newsCount && category.newsCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with news items. Please reassign news first.'
      });
    }

    await NewsCategory.findByIdAndDelete(req.params.id);
    logger.info('News category deleted:', req.params.id);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting news category', error);
    res.status(500).json({ message: 'Failed to delete news category' });
  }
});

export default router;
