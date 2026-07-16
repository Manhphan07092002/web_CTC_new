import { Router } from 'express';
import { db } from '../../services/db-mongodb';

const router = Router();

// Get all reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await db.reviews.getByProductId(req.params.productId);
    res.json(reviews);
  } catch (error) {
    console.error('Error getting product reviews', error);
    res.status(500).json({ message: 'Failed to get product reviews' });
  }
});

// Get all reviews across all products (for admin)
router.get('/', async (req, res) => {
  try {
    const reviews = await db.reviews.getAll();
    res.json(reviews);
  } catch (error) {
    console.error('Error getting all reviews', error);
    res.status(500).json({ message: 'Failed to get reviews' });
  }
});

// Add a new review to a product
router.post('/product/:productId', async (req, res) => {
  try {
    const { userName, userRole, userPhone, rating, comment, date } = req.body;
    
    // Validation
    if (!userName || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields: userName, rating, comment' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const review = await db.reviews.addToProduct(req.params.productId, {
      userName,
      userRole,
      userPhone,
      rating: Number(rating),
      comment,
      date: date || new Date().toISOString().split('T')[0]
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review', error);
    res.status(500).json({ message: 'Failed to add review' });
  }
});

// Delete a review from a product
router.delete('/product/:productId/review/:reviewIndex', async (req, res) => {
  try {
    const { productId, reviewIndex } = req.params;
    
    // Validate reviewIndex is a number
    const index = parseInt(reviewIndex);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ message: 'Invalid review index' });
    }
    
    const success = await db.reviews.deleteFromProduct(productId, index);
    
    if (!success) {
      return res.status(404).json({ message: 'Product or review not found' });
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

export default router;
