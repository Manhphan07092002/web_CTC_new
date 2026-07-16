/**
 * Slogans API Routes
 * GET /api/slogans - Get slogans for homepage
 * GET /api/slogans/random - Get random slogans
 * GET /api/slogans/categories - Get available categories
 */

import { Router, Request, Response } from 'express';
import { aiSloganService } from '../services/aiSloganService';

const router = Router();

/**
 * GET /api/slogans
 * Get slogans with optional filtering and language support
 * Query params: count, categories, shuffle, lang (vi|en|ko|ja|zh|de)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { count = 8, categories, shuffle = 'true', lang = 'vi' } = req.query;
    
    const options = {
      count: parseInt(count as string) || 8,
      categories: categories ? (categories as string).split(',') : undefined,
      shuffle: shuffle === 'true',
      language: lang as 'vi' | 'en' | 'ko' | 'ja' | 'zh' | 'de',
    };

    const slogans = aiSloganService.getSlogans(options);
    
    res.json({
      success: true,
      data: slogans,
      meta: {
        total: slogans.length,
        language: lang,
        generatedAt: new Date().toISOString(),
        source: 'ai-generated',
      },
    });
  } catch (error: any) {
    console.error('[Slogans API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch slogans',
    });
  }
});

/**
 * GET /api/slogans/random
 * Get random non-repeating slogans
 */
router.get('/random', async (req: Request, res: Response) => {
  try {
    const { count = 8 } = req.query;
    const slogans = aiSloganService.getRandomSlogans(parseInt(count as string) || 8);
    
    res.json({
      success: true,
      data: slogans,
    });
  } catch (error: any) {
    console.error('[Slogans API] Random error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random slogans',
    });
  }
});

/**
 * GET /api/slogans/categories
 * Get all available slogan categories
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = aiSloganService.getCategories();
    
    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error('[Slogans API] Categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
});

/**
 * GET /api/slogans/dynamic
 * Get dynamically generated slogan based on real data
 */
router.get('/dynamic', async (req: Request, res: Response) => {
  try {
    // In production, fetch real stats from database
    const slogan = aiSloganService.generateDynamicSlogan({
      projectCount: 500,
      savingsPercent: 90,
      yearsExperience: 5,
      co2Reduced: 100,
    });
    
    res.json({
      success: true,
      data: slogan,
    });
  } catch (error: any) {
    console.error('[Slogans API] Dynamic error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate dynamic slogan',
    });
  }
});

/**
 * POST /api/slogans/generate
 * Generate new slogans using AI (requires API key)
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const slogans = await aiSloganService.generateWithAI(prompt);
    
    res.json({
      success: true,
      data: slogans,
      meta: {
        source: process.env.OPENAI_API_KEY ? 'openai' : 'pre-generated',
      },
    });
  } catch (error: any) {
    console.error('[Slogans API] Generate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate slogans',
    });
  }
});

export default router;
