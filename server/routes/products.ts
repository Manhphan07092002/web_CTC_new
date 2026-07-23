import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { ProductCategory, applyTranslationsToArray, applyTranslations, TRANSLATION_FIELDS, SupportedLanguage, SUPPORTED_LANGUAGES } from '../../models';
import { logger } from '../../utils/logger';
import { translateProduct } from '../services/translate';
import { cacheService } from '../services/cacheService';

const router = Router();

// Helper to get language from request
const getLanguage = (req: any): SupportedLanguage => {
  const lang = (req.query.lang as string) || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'vi';
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : 'vi';
};

router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const lang = getLanguage(req);
    const cacheKey = `products:list:${categoryId || 'all'}:${lang}`;
    
    const cachedData = cacheService.get<any[]>(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let products = await db.products.getAll();
    
    // Filter by category if provided
    if (categoryId && typeof categoryId === 'string') {
      products = products.filter(p => p.categoryId?.toString() === categoryId);
    }
    
    // Apply translations if not Vietnamese
    if (lang !== 'vi') {
      products = applyTranslationsToArray(products, [...TRANSLATION_FIELDS.product], lang);
    }
    
    cacheService.set(cacheKey, products, 300); // 5 min TTL
    res.json(products);
  } catch (error) {
    logger.error('Error getting products', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get deleted products for trash
router.get('/deleted', async (req, res) => {
  try {
    console.log('Fetching deleted products...');
    const products = await db.products.getDeleted();
    console.log('Found deleted products:', products.length);
    res.json(products);
  } catch (error) {
    console.error('Error getting deleted products:', error);
    logger.error('Error getting deleted products', error);
    res.status(500).json({ 
      message: 'Failed to get deleted products',
      error: error.message 
    });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 4;
    const products = await db.products.getFeatured(limit);
    res.json(products);
  } catch (error) {
    console.error('Error getting featured products', error);
    res.status(500).json({ message: 'Failed to get featured products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lang = getLanguage(req);
    let product = await db.products.getById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Apply translations if not Vietnamese
    if (lang !== 'vi') {
      product = applyTranslations(product, [...TRANSLATION_FIELDS.product], lang);
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error getting product by id', error);
    res.status(500).json({ message: 'Failed to get product' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { categoryId, ...productData } = req.body;
    
    // Validate and get category if provided
    let categoryName = productData.category;
    if (categoryId) {
      const category = await ProductCategory.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }
      if (!category.isActive) {
        return res.status(400).json({ message: 'Category is inactive' });
      }
      categoryName = category.name;
      
      // Update category count
      category.productCount = (category.productCount || 0) + 1;
      await category.save();
    }
    
    // Auto-translate product to all languages
    const translatedData = await translateProduct({
      ...productData,
      categoryId,
      category: categoryName
    });
    
    const created = await db.products.add(translatedData);
    cacheService.invalidatePattern('products:');
    
    logger.info('Product created with translations:', created.id);
    res.status(201).json(created);
  } catch (error) {
    logger.error('Error creating product', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Auto-translate updated content
    const translatedData = await translateProduct(req.body);
    
    const updated = await db.products.update(req.params.id, translatedData);
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    
    cacheService.invalidatePattern('products:');
    logger.info('Product updated with translations:', req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating product', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Get product before deleting to update category count
    const product = await db.products.getById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const ok = await db.products.delete(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Product not found' });
    
    // Update category count
    if (product.categoryId) {
      const category = await ProductCategory.findById(product.categoryId);
      if (category) {
        category.productCount = Math.max(0, (category.productCount || 0) - 1);
        await category.save();
      }
    }
    
    cacheService.invalidatePattern('products:');
    logger.info('Product deleted:', req.params.id);
    res.json({ message: 'Product moved to trash' });
  } catch (error) {
    logger.error('Error deleting product', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Get deleted products (trash)
router.get('/trash/all', async (req, res) => {
  try {
    const products = await db.products.getDeleted();
    res.json(products);
  } catch (error) {
    console.error('Error getting deleted products', error);
    res.status(500).json({ message: 'Failed to get deleted products' });
  }
});

// Restore product from trash
router.post('/:id/restore', async (req, res) => {
  try {
    const ok = await db.products.restore(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product restored successfully' });
  } catch (error) {
    console.error('Error restoring product', error);
    res.status(500).json({ message: 'Failed to restore product' });
  }
});

// Permanent delete
router.delete('/:id/permanent', async (req, res) => {
  try {
    const ok = await db.products.permanentDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Product not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error permanently deleting product', error);
    res.status(500).json({ message: 'Failed to permanently delete product' });
  }
});

// Increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const product = await db.products.incrementView(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ views: product.views });
  } catch (error) {
    logger.error('Error incrementing view', error);
    res.status(500).json({ message: 'Failed to increment view' });
  }
});

// Increment like count
router.post('/:id/like', async (req, res) => {
  try {
    const product = await db.products.incrementLike(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ likes: product.likes });
  } catch (error) {
    logger.error('Error incrementing like', error);
    res.status(500).json({ message: 'Failed to increment like' });
  }
});

// Increment share count
router.post('/:id/share', async (req, res) => {
  try {
    const product = await db.products.incrementShare(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ shares: product.shares });
  } catch (error) {
    logger.error('Error incrementing share', error);
    res.status(500).json({ message: 'Failed to increment share' });
  }
});

export default router;
