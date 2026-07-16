/**
 * Product Categories API Routes
 */

import { Router } from 'express';
import { ProductCategory, generateSlug, applyTranslations, TRANSLATION_FIELDS, SupportedLanguage, SUPPORTED_LANGUAGES } from '../../models';
import { logger } from '../../utils/logger';
import { translateCategory } from '../services/translate';

const router = Router();

// Helper to get language from request
const getLanguage = (req: any): SupportedLanguage => {
  const lang = (req.query.lang as string) || 'vi';
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : 'vi';
};

// Get all product categories
router.get('/', async (req, res) => {
  try {
    const lang = getLanguage(req);
    const categories = await ProductCategory.find({ isActive: true })
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
    logger.error('Error getting product categories', error);
    res.status(500).json({ message: 'Failed to get product categories' });
  }
});

// Get single product category
router.get('/:id', async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Product category not found' });
    }
    res.json(category);
  } catch (error) {
    logger.error('Error getting product category', error);
    res.status(500).json({ message: 'Failed to get product category' });
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await ProductCategory.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Product category not found' });
    }
    res.json(category);
  } catch (error) {
    logger.error('Error getting product category by slug', error);
    res.status(500).json({ message: 'Failed to get product category' });
  }
});

// Create product category
router.post('/', async (req, res) => {
  try {
    const { name, description, icon, color, image, order, parentId } = req.body;
    
    // Generate slug from name
    const slug = generateSlug(name);
    
    // Check if slug already exists
    const existing = await ProductCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    // Auto-translate category
    const translatedData = await translateCategory({ name, description });
    
    const category = new ProductCategory({
      name,
      slug,
      description,
      icon,
      color,
      image,
      order: order || 0,
      parentId,
      isActive: true,
      productCount: 0,
      translations: translatedData.translations
    });
    
    await category.save();
    logger.info('Product category created with translations:', category.id);
    res.status(201).json(category);
  } catch (error) {
    logger.error('Error creating product category', error);
    res.status(500).json({ message: 'Failed to create product category' });
  }
});

// Update product category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, icon, color, image, order, isActive, parentId } = req.body;
    
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Product category not found' });
    }
    
    // Update slug if name changed
    if (name && name !== category.name) {
      const newSlug = generateSlug(name);
      const existing = await ProductCategory.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
      category.slug = newSlug;
      category.name = name;
    }
    
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (image !== undefined) category.image = image;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;
    if (parentId !== undefined) category.parentId = parentId;
    
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
    logger.info('Product category updated with translations:', category.id);
    res.json(category);
  } catch (error) {
    logger.error('Error updating product category', error);
    res.status(500).json({ message: 'Failed to update product category' });
  }
});

// Delete product category
router.delete('/:id', async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Product category not found' });
    }
    
    // Check if category has products
    if (category.productCount && category.productCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with products. Please reassign products first.' 
      });
    }
    
    await ProductCategory.findByIdAndDelete(req.params.id);
    logger.info('Product category deleted:', req.params.id);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting product category', error);
    res.status(500).json({ message: 'Failed to delete product category' });
  }
});

// Get category statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Product category not found' });
    }
    
    res.json({
      id: category.id,
      name: category.name,
      productCount: category.productCount || 0
    });
  } catch (error) {
    logger.error('Error getting category stats', error);
    res.status(500).json({ message: 'Failed to get category stats' });
  }
});

export default router;
