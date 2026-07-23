import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

class ApiCacheManager {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // Default 5 minutes TTL
      checkperiod: 60, // Check for expired keys every 1 minute
      useClones: false // Better performance by avoiding deep copy
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl !== undefined) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  delByPrefix(prefix: string): void {
    const keys = this.cache.keys().filter(k => k.startsWith(prefix));
    if (keys.length > 0) {
      this.cache.del(keys);
    }
  }

  flush(): void {
    this.cache.flushAll();
  }

  getStats() {
    return this.cache.getStats();
  }

  /**
   * Express middleware for caching GET responses
   * @param ttlSeconds Time-to-live in seconds
   * @param customPrefix Custom prefix for cache key
   */
  middleware(ttlSeconds: number = 300, customPrefix: string = '') {
    return (req: Request, res: Response, next: NextFunction) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const prefix = customPrefix || req.baseUrl || req.path;
      const lang = req.headers['accept-language'] || req.query.lang || 'vi';
      const cacheKey = `${prefix}:${req.originalUrl}:${lang}`;

      const cachedResponse = this.get<any>(cacheKey);

      if (cachedResponse) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedResponse);
      }

      // Monkey patch res.json to capture response body before sending
      const originalJson = res.json.bind(res);
      res.json = (body: any): Response => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(cacheKey, body, ttlSeconds);
          res.setHeader('X-Cache', 'MISS');
        }
        return originalJson(body);
      };

      next();
    };
  }
}

export const apiCache = new ApiCacheManager();
