/**
 * Project Categories API Routes
 */

import { Router } from 'express';
import { ProjectCategory, generateSlug, applyTranslations, TRANSLATION_FIELDS, SupportedLanguage, SUPPORTED_LANGUAGES } from '../../models';
import { logger } from '../../utils/logger';
import { translateCategory } from '../services/translate';

const router = Router();

// Helper to get language from request
const getLanguage = (req: any): SupportedLanguage => {
  const lang = (req.query.lang as string) || 'vi';
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : 'vi';
};

// Get all project categories
router.get('/', async (req, res) => {
  try {
    const lang = getLanguage(req);
    const categories = await ProjectCategory.find({ isActive: true })
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
    logger.error('Error getting project categories', error);
    res.status(500).json({ message: 'Failed to get project categories' });
  }
});

// Get single project category
router.get('/:id', async (req, res) => {
  try {
    const category = await ProjectCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Project category not found' });
    }
    res.json(category);
  } catch (error) {
    logger.error('Error getting project category', error);
    res.status(500).json({ message: 'Failed to get project category' });
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await ProjectCategory.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Project category not found' });
    }
    res.json(category);
  } catch (error) {
    logger.error('Error getting project category by slug', error);
    res.status(500).json({ message: 'Failed to get project category' });
  }
});

// Create project category
router.post('/', async (req, res) => {
  try {
    const { name, description, icon, color, order } = req.body;
    
    const slug = generateSlug(name);
    
    const existing = await ProjectCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    // Auto-translate category
    const translatedData = await translateCategory({ name, description });
    
    const category = new ProjectCategory({
      name,
      slug,
      description,
      icon,
      color,
      order: order || 0,
      isActive: true,
      projectCount: 0,
      translations: translatedData.translations
    });
    
    await category.save();
    logger.info('Project category created with translations:', category.id);
    res.status(201).json(category);
  } catch (error) {
    logger.error('Error creating project category', error);
    res.status(500).json({ message: 'Failed to create project category' });
  }
});

// Update project category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, icon, color, order, isActive } = req.body;
    
    const category = await ProjectCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Project category not found' });
    }
    
    if (name && name !== category.name) {
      const newSlug = generateSlug(name);
      const existing = await ProjectCategory.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
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
    logger.info('Project category updated with translations:', category.id);
    res.json(category);
  } catch (error) {
    logger.error('Error updating project category', error);
    res.status(500).json({ message: 'Failed to update project category' });
  }
});

// Delete project category
router.delete('/:id', async (req, res) => {
  try {
    const category = await ProjectCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Project category not found' });
    }
    
    if (category.projectCount && category.projectCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with projects. Please reassign projects first.' 
      });
    }
    
    await ProjectCategory.findByIdAndDelete(req.params.id);
    logger.info('Project category deleted:', req.params.id);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting project category', error);
    res.status(500).json({ message: 'Failed to delete project category' });
  }
});

export default router;
