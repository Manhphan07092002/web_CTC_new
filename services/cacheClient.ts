/**
 * Client-Side Memory & Local Storage Cache Layer
 * Provides Stale-While-Revalidate caching for client API requests
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // TTL in milliseconds
}

class ClientCacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Read item from client memory cache
   */
  get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.ttl;

    return {
      data: entry.data as T,
      isStale
    };
  }

  /**
   * Save item to client memory cache
   */
  set<T>(key: string, data: T, ttlMs: number = this.defaultTTL): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  /**
   * Delete item from client memory cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
  }

  /**
   * Invalidate matching keys
   */
  invalidatePattern(prefix: string): void {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Clear all client cache
   */
  clear(): void {
    this.memoryCache.clear();
  }
}

export const clientCache = new ClientCacheManager();
