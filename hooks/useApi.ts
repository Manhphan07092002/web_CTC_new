/**
 * useApi - Hook dùng chung để quản lý trạng thái API call
 *
 * Cung cấp loading, error, data states thống nhất cho toàn bộ app.
 * Thay thế pattern lặp đi lặp lại: useState(loading) + useState(error) + useEffect(fetch)
 *
 * @example
 * // Fetch tự động khi component mount
 * const { data: products, loading, error, refetch } = useApi(() => api.products.getAll());
 *
 * @example
 * // Mutation (POST/PUT/DELETE) - không tự động chạy
 * const { execute: createProduct, loading } = useApiMutation(
 *   (data) => api.products.create(data)
 * );
 * await createProduct(formData);
 */

import { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction, DependencyList } from 'react';

// ============================================================
// Types
// ============================================================

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  /** Gọi lại API để cập nhật dữ liệu mới nhất */
  refetch: () => void;
  /** Cập nhật data trực tiếp (optimistic update) */
  setData: Dispatch<SetStateAction<T | null>>;
}

interface UseApiMutationReturn<TData, TArgs extends any[]> {
  data: TData | null;
  loading: boolean;
  error: string | null;
  /** Gọi API mutation với arguments */
  execute: (...args: TArgs) => Promise<TData>;
  /** Reset về trạng thái ban đầu */
  reset: () => void;
}

// ============================================================
// useApi - For GET requests (auto-fetches on mount)
// ============================================================

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList = []
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Da xay ra loi khong xac dinh';
        setState(prev => ({ ...prev, loading: false, error: message }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setData: Dispatch<SetStateAction<T | null>> = useCallback(
    (action) => setState(prev => ({
      ...prev,
      data: typeof action === 'function'
        ? (action as (prev: T | null) => T | null)(prev.data)
        : action,
    })),
    []
  );

  return { ...state, refetch: fetchData, setData };
}

// ============================================================
// useApiMutation - For write operations (POST/PUT/DELETE)
// ============================================================

export function useApiMutation<TData, TArgs extends any[]>(
  mutator: (...args: TArgs) => Promise<TData>
): UseApiMutationReturn<TData, TArgs> {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutatorRef = useRef(mutator);
  mutatorRef.current = mutator;

  const execute = useCallback(async (...args: TArgs): Promise<TData> => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await mutatorRef.current(...args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Da xay ra loi khong xac dinh';
      setState(prev => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export default useApi;
