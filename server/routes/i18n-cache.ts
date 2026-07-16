import express from 'express';
import { enhancedBackend, translationCache } from '../i18n';

const router = express.Router();

// Get cache statistics
router.get('/stats', (req: any, res) => {
  try {
    const stats = enhancedBackend.getCacheStats();
    const detailedStats = translationCache.getStats();
    const keys = translationCache.getKeys();

    res.json({
      success: true,
      data: {
        overview: stats,
        detailed: detailedStats,
        keys: {
          fileCache: keys.fileCache.length,
          dbCache: keys.dbCache.length,
          total: keys.fileCache.length + keys.dbCache.length
        },
        performance: {
          hitRate: detailedStats.hitRate,
          totalRequests: detailedStats.hits + detailedStats.misses,
          cacheSize: detailedStats.size
        }
      },
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Clear cache (specific or all)
router.delete('/clear', (req: any, res) => {
  try {
    const { language, namespace, key } = req.query;

    if (key && namespace && language) {
      // Clear specific translation
      enhancedBackend.invalidateCache(language, namespace, key);
      res.json({
        success: true,
        message: `Cache cleared for ${language}:${namespace}:${key}`,
        data: { scope: 'key', language, namespace, key }
      });
    } else if (namespace && language) {
      // Clear namespace
      enhancedBackend.invalidateCache(language, namespace);
      res.json({
        success: true,
        message: `Cache cleared for ${language}:${namespace}`,
        data: { scope: 'namespace', language, namespace }
      });
    } else if (language) {
      // Clear language
      enhancedBackend.invalidateCache(language);
      res.json({
        success: true,
        message: `Cache cleared for language: ${language}`,
        data: { scope: 'language', language }
      });
    } else {
      // Clear all cache
      enhancedBackend.invalidateCache();
      res.json({
        success: true,
        message: 'All cache cleared',
        data: { scope: 'all' }
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Preload translations into cache
router.post('/preload', async (req: any, res) => {
  try {
    const { language, namespace } = req.body;

    await enhancedBackend.preload(language, namespace);

    res.json({
      success: true,
      message: 'Translations preloaded successfully',
      data: {
        language: language || 'all',
        namespace: namespace || 'all'
      }
    });
  } catch (error) {
    console.error('Error preloading cache:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Warm up cache
router.post('/warmup', async (req: any, res) => {
  try {
    // Warm up file-based translations
    await translationCache.warmUp();
    
    // Preload database translations
    await translationCache.preloadFromDatabase();

    const stats = translationCache.getStats();

    res.json({
      success: true,
      message: 'Cache warmed up successfully',
      data: {
        keysLoaded: stats.keys,
        cacheSize: stats.size,
        hitRate: stats.hitRate
      }
    });
  } catch (error) {
    console.error('Error warming up cache:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get cache keys for debugging
router.get('/keys', (req: any, res) => {
  try {
    const { type, filter } = req.query;
    const keys = translationCache.getKeys();

    let result = keys;

    // Filter by cache type
    if (type === 'file') {
      result = { fileCache: keys.fileCache, dbCache: [] };
    } else if (type === 'db') {
      result = { fileCache: [], dbCache: keys.dbCache };
    }

    // Filter by pattern
    if (filter) {
      result.fileCache = result.fileCache.filter(key => key.includes(filter));
      result.dbCache = result.dbCache.filter(key => key.includes(filter));
    }

    res.json({
      success: true,
      data: {
        keys: result,
        total: result.fileCache.length + result.dbCache.length,
        breakdown: {
          fileCache: result.fileCache.length,
          dbCache: result.dbCache.length
        }
      },
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    console.error('Error getting cache keys:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Reset cache statistics
router.post('/reset-stats', (req: any, res) => {
  try {
    translationCache.resetStats();

    res.json({
      success: true,
      message: 'Cache statistics reset successfully',
      data: translationCache.getStats()
    });
  } catch (error) {
    console.error('Error resetting cache stats:', error);
    res.status(500).json({
      success: false,
      message: req.i18n.formatError('error'),
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Health check for cache system
router.get('/health', (req: any, res) => {
  try {
    const stats = translationCache.getStats();
    const isHealthy = stats.hitRate > 50; // Consider healthy if hit rate > 50%

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      data: {
        status: isHealthy ? 'healthy' : 'degraded',
        hitRate: stats.hitRate,
        totalKeys: stats.keys,
        cacheSize: stats.size,
        recommendations: isHealthy ? [] : [
          'Consider warming up cache',
          'Check if translations are being loaded properly',
          'Verify database connectivity'
        ]
      },
      message: isHealthy ? 'Cache system is healthy' : 'Cache system performance is degraded'
    });
  } catch (error) {
    console.error('Error checking cache health:', error);
    res.status(500).json({
      success: false,
      message: 'Cache health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
