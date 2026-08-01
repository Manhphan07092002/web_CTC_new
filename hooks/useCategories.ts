/**
 * useCategories Hook
 * Custom hook để fetch và quản lý categories
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Category } from '../types';

type CategoryType = 'product' | 'news' | 'project';

export function useCategories(type: CategoryType) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [type]);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Category[] = [];
      switch (type) {
        case 'product':
          data = await api.productCategories.getAll();
          break;
        case 'news':
          data = await api.newsCategories.getAll();
          break;
        case 'project':
          data = await api.projectCategories.getAll();
          break;
      }
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = useCallback((id: string) => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const getCategoryBySlug = useCallback((slug: string) => {
    return categories.find(cat => cat.slug === slug);
  }, [categories]);

  const getActiveCategories = useCallback(() => {
    return categories.filter(cat => cat.isActive !== false);
  }, [categories]);

  return {
    categories,
    loading,
    error,
    reload: loadCategories,
    getCategoryById,
    getCategoryBySlug,
    getActiveCategories
  };
}

export function useProductCategories() {
  return useCategories('product');
}

export function useNewsCategories() {
  return useCategories('news');
}

export function useProjectCategories() {
  return useCategories('project');
}
