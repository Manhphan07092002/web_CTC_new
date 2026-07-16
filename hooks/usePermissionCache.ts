/**
 * Permission Cache Hook
 * Tối ưu performance bằng cách cache permissions
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CachedPermissions {
  permissions: string[];
  role: any;
  roleLevel: number;
  timestamp: number;
  userId: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'user_permissions_cache';

export const usePermissionCache = () => {
  const { user } = useAuth();
  const [cache, setCache] = useState<CachedPermissions | null>(null);

  // Load cache from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache: CachedPermissions = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is valid and for current user
        if (
          parsedCache.timestamp + CACHE_DURATION > now &&
          parsedCache.userId === user?.email
        ) {
          setCache(parsedCache);
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading permission cache:', error);
      localStorage.removeItem(CACHE_KEY);
    }
  }, [user?.email]);

  // Save cache to localStorage
  const saveCache = useCallback((permissions: string[], role: any, roleLevel: number) => {
    if (!user?.email) return;

    const cacheData: CachedPermissions = {
      permissions,
      role,
      roleLevel,
      timestamp: Date.now(),
      userId: user.email
    };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setCache(cacheData);
    } catch (error) {
      console.error('Error saving permission cache:', error);
    }
  }, [user?.email]);

  // Clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setCache(null);
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    if (!cache || !user?.email) return false;
    
    const now = Date.now();
    return (
      cache.timestamp + CACHE_DURATION > now &&
      cache.userId === user.email
    );
  }, [cache, user?.email]);

  return {
    cache,
    saveCache,
    clearCache,
    isCacheValid
  };
};

export default usePermissionCache;
