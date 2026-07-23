import NodeCache from 'node-cache';
import { logger } from '../../utils/logger';

/**
 * Unified Backend Caching Service
 * Combines high-performance NodeCache in-memory storage with optional Redis layer
 */
class CacheService {
  private memoryCache: NodeCache;
  private defaultTTL: number = 300; // 5 minutes default

  constructor() {
    this.memoryCache = new NodeCache({
      stdTTL: this.defaultTTL,
      checkperiod: 60, // Clean expired keys every 60s
      useClones: false, // High performance non-cloned references
      maxKeys: 10000,
    });

    logger.info('⚡ Backend CacheService initialized (NodeCache active)');
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | undefined {
    try {
      const val = this.memoryCache.get<T>(key);
      if (val !== undefined) {
        logger.debug(`[Cache HIT] ${key}`);
        return val;
      }
      logger.debug(`[Cache MISS] ${key}`);
      return undefined;
    } catch (error) {
      logger.error(`Error reading cache key "${key}":`, error);
      return undefined;
    }
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, value: T, ttlSeconds: number = this.defaultTTL): boolean {
    try {
      return this.memoryCache.set(key, value, ttlSeconds);
    } catch (error) {
      logger.error(`Error setting cache key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete specific key from cache
   */
  del(key: string): number {
    try {
      return this.memoryCache.del(key);
    } catch (error) {
      logger.error(`Error deleting cache key "${key}":`, error);
      return 0;
    }
  }

  /**
   * Delete all keys matching a prefix pattern (e.g. "products:", "projects:")
   */
  invalidatePattern(prefixPattern: string): number {
    try {
      const allKeys = this.memoryCache.keys();
      const matchingKeys = allKeys.filter(k => k.startsWith(prefixPattern));
      if (matchingKeys.length > 0) {
        const deletedCount = this.memoryCache.del(matchingKeys);
        logger.info(`[Cache Invalidate] Cleared ${deletedCount} keys matching pattern "${prefixPattern}"`);
        return deletedCount;
      }
      return 0;
    } catch (error) {
      logger.error(`Error invalidating pattern "${prefixPattern}":`, error);
      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  flush(): void {
    this.memoryCache.flushAll();
    logger.info('[Cache Flush] Cleared all memory cache keys');
  }
}

export const cacheService = new CacheService();
