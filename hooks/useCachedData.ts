import { useState, useEffect, useCallback } from 'react';
import { clientCache } from '../services/cacheClient';

interface UseCachedDataOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttlMs?: number;
  enabled?: boolean;
}

interface UseCachedDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isStale: boolean;
  refresh: () => Promise<void>;
}

/**
 * Custom React Hook implementing Stale-While-Revalidate (SWR) caching
 * Renders instantly from cache if available, while fetching fresh data in background.
 */
export function useCachedData<T>({
  key,
  fetcher,
  ttlMs = 5 * 60 * 1000,
  enabled = true
}: UseCachedDataOptions<T>): UseCachedDataResult<T> {
  const cached = clientCache.get<T>(key);
  
  const [data, setData] = useState<T | null>(cached ? cached.data : null);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState<boolean>(cached ? cached.isStale : true);

  const executeFetch = useCallback(async (showLoading: boolean = true) => {
    if (!enabled) return;
    if (showLoading && !data) setLoading(true);
    
    try {
      const result = await fetcher();
      clientCache.set(key, result, ttlMs);
      setData(result);
      setIsStale(false);
      setError(null);
    } catch (err: any) {
      console.error(`[useCachedData] Error fetching "${key}":`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttlMs, enabled, data]);

  useEffect(() => {
    if (!enabled) return;
    
    const cachedEntry = clientCache.get<T>(key);
    if (cachedEntry) {
      setData(cachedEntry.data);
      setIsStale(cachedEntry.isStale);
      if (cachedEntry.isStale) {
        // Background revalidation
        executeFetch(false);
      } else {
        setLoading(false);
      }
    } else {
      executeFetch(true);
    }
  }, [key, enabled]);

  return {
    data,
    loading,
    error,
    isStale,
    refresh: () => executeFetch(true)
  };
}
