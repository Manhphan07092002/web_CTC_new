/**
 * Frontend API Service
 * Provides methods to interact with the backend API
 */

// Tự động lấy API URL dựa trên hostname hiện tại
// Cho phép truy cập từ bất kỳ IP/domain nào mà không cần cấu hình lại
const getApiBaseUrl = () => {
  // Nếu có VITE_API_URL thì dùng (cho production với domain cố định)
  const viteEnv = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env;
  if (viteEnv?.VITE_API_URL) {
    return viteEnv.VITE_API_URL;
  }
  
  const hostname = window.location.hostname; // localhost, 192.168.1.169, hoặc domain
  const protocol = window.location.protocol; // http: hoặc https:
  const port = window.location.port;

  // Nếu chạy trên port chuẩn 80/443 (đã cấu hình qua Nginx proxy), dùng relative path để tránh CORS
  if (!port || port === '80' || port === '443') {
    return '/api';
  }
  
  // Môi trường phát triển local (Ví dụ frontend chạy port 3000, API chạy port 4000)
  return `${protocol}//${hostname}:4000/api`;
};

const API_BASE_URL = getApiBaseUrl();

// ============================================================
// Simple request cache (TTL: 30s) for repeated GET requests
// ============================================================
const requestCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

function getCached<T>(key: string): T | null {
  const entry = requestCache.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data as T;
  }
  requestCache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  requestCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Xóa toàn bộ cache (gọi sau khi tạo/sửa/xóa dữ liệu) */
export function clearApiCache(): void {
  requestCache.clear();
}

// Get current language from localStorage
const getCurrentLanguage = (): string => {
  try {
    return localStorage.getItem('app_language') || 'vi';
  } catch {
    return 'vi';
  }
};

// Get auth token from localStorage / session
const getAuthToken = (): string | null => {
  try {
    const directToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (directToken) return directToken;

    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      const parsed = JSON.parse(adminSession);
      if (parsed?.token) return parsed.token;
      if (parsed?.user?.token) return parsed.user.token;
    }
    return null;
  } catch {
    return null;
  }
};

// Helper function for API calls
async function fetchAPI<T>(endpoint: string, options?: RequestInit, useCache = false): Promise<T> {
  // Add language parameter for GET requests to translatable endpoints
  let url = `${API_BASE_URL}${endpoint}`;
  const lang = getCurrentLanguage();
  const isGet = !options?.method || options.method === 'GET';

  // Add lang parameter for content endpoints (GET requests only)
  if (isGet) {
    const translatableEndpoints = ['/products', '/projects', '/news', '/testimonials', '/team', '/product-categories', '/news-categories', '/project-categories'];
    const isTranslatable = translatableEndpoints.some(e => endpoint.startsWith(e));
    if (isTranslatable) {
      const separator = endpoint.includes('?') ? '&' : '?';
      url = `${url}${separator}lang=${lang}`;
    }
  }

  // Return cached response if available (GET only)
  if (isGet && useCache) {
    const cached = getCached<T>(url);
    if (cached) return cached;
  }

  // Auto-attach Authorization header if token exists
  const token = getAuthToken();
  const authHeader: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options?.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    // Any successful mutation invalidates cached public content immediately.
    if (!isGet) {
      requestCache.clear();
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    // Store in cache for GET requests
    if (isGet && useCache) {
      setCache(url, data);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export const api = {
  // Products
  products: {
    getAll: () => fetchAPI<any[]>('/products'),
    getDeleted: () => fetchAPI<any[]>('/products/deleted'),
    getById: (id: string) => fetchAPI<any>(`/products/${id}`),
    getFeatured: (limit?: number) => fetchAPI<any[]>(`/products/featured${limit ? `?limit=${limit}` : ''}`, undefined, true),
    create: (data: any) => fetchAPI<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/products/${id}`, {
      method: 'DELETE',
    }),
    permanentDelete: (id: string) => fetchAPI<void>(`/products/${id}/permanent`, {
      method: 'DELETE',
    }),
    incrementView: (id: string) => fetchAPI<any>(`/products/${id}/view`, {
      method: 'POST',
    }),
    incrementLike: (id: string) => fetchAPI<any>(`/products/${id}/like`, {
      method: 'POST',
    }),
    incrementShare: (id: string) => fetchAPI<any>(`/products/${id}/share`, {
      method: 'POST',
    }),
  },

  // Projects
  projects: {
    getAll: () => fetchAPI<any[]>('/projects'),
    getById: (id: string) => fetchAPI<any>(`/projects/${id}`),
    getFeatured: (limit?: number) => fetchAPI<any[]>(`/projects/featured${limit ? `?limit=${limit}` : ''}`, undefined, true),
    create: (data: any) => fetchAPI<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/projects/${id}`, {
      method: 'DELETE',
    }),
  },

  // News
  news: {
    getAll: () => fetchAPI<any[]>('/news'),
    getById: (id: string) => fetchAPI<any>(`/news/${id}`),
    getLatest: (limit?: number) => fetchAPI<any[]>(`/news?limit=${limit || 3}`, undefined, true),
    getFeatured: (limit?: number) => fetchAPI<any[]>(`/news/featured${limit ? `?limit=${limit}` : ''}`),
    create: (data: any) => fetchAPI<any>('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/news/${id}`, {
      method: 'DELETE',
    }),
  },

  // Categories (Legacy)
  categories: {
    getAll: () => fetchAPI<any[]>('/categories'),
    getById: (id: string) => fetchAPI<any>(`/categories/${id}`),
    create: (data: any) => fetchAPI<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/categories/${id}`, {
      method: 'DELETE',
    }),
  },

  // Product Categories
  productCategories: {
    getAll: () => fetchAPI<any[]>('/product-categories'),
    getById: (id: string) => fetchAPI<any>(`/product-categories/${id}`),
    create: (data: any) => fetchAPI<any>('/product-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/product-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/product-categories/${id}`, {
      method: 'DELETE',
    }),
  },

  // News Categories
  newsCategories: {
    getAll: () => fetchAPI<any[]>('/news-categories'),
    getById: (id: string) => fetchAPI<any>(`/news-categories/${id}`),
    create: (data: any) => fetchAPI<any>('/news-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/news-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/news-categories/${id}`, {
      method: 'DELETE',
    }),
  },

  // Project Categories
  projectCategories: {
    getAll: () => fetchAPI<any[]>('/project-categories'),
    getById: (id: string) => fetchAPI<any>(`/project-categories/${id}`),
    create: (data: any) => fetchAPI<any>('/project-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/project-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/project-categories/${id}`, {
      method: 'DELETE',
    }),
  },

  // Testimonials
  testimonials: {
    getAll: () => fetchAPI<any[]>('/testimonials', undefined, true),
    getById: (id: string) => fetchAPI<any>(`/testimonials/${id}`),
    create: (data: any) => fetchAPI<any>('/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/testimonials/${id}`, {
      method: 'DELETE',
    }),
  },

  // Partners
  partners: {
    getAll: () => fetchAPI<any[]>('/partners', undefined, true),
    getById: (id: string) => fetchAPI<any>(`/partners/${id}`),
    create: (data: any) => fetchAPI<any>('/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/partners/${id}`, {
      method: 'DELETE',
    }),
  },

  // Users
  users: {
    getAll: () => fetchAPI<any[]>('/users'),
    getById: (id: string) => fetchAPI<any>(`/users/${id}`),
    getByEmail: (email: string) => fetchAPI<any>(`/users/email/${email}`),
    create: (data: any) => fetchAPI<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    /** @deprecated Use `create` instead */
    add: (data: any) => fetchAPI<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
    login: (email: string, password: string) => fetchAPI<any>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    changePassword: (id: string, oldPassword: string, newPassword: string) => fetchAPI<any>(`/users/${id}/change-password`, {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
  },

  // Settings
  settings: {
    get: () => fetchAPI<any>('/settings'),
    update: (data: any) => fetchAPI<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  // Notifications
  notifications: {
    getAll: () => fetchAPI<any[]>('/notifications'),
    getById: (id: string) => fetchAPI<any>(`/notifications/${id}`),
    create: (data: any) => fetchAPI<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    markAsRead: (id: string) => fetchAPI<any>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
    markAllAsRead: () => fetchAPI<any>('/notifications/read-all', {
      method: 'PUT',
    }),
    deleteAll: () => fetchAPI<void>('/notifications/all', {
      method: 'DELETE',
    }),
    delete: (id: string) => fetchAPI<void>(`/notifications/${id}`, {
      method: 'DELETE',
    }),
  },

  // Contact
  contact: {
    submit: (data: any) => fetchAPI<any>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getAll: () => fetchAPI<any[]>('/contact'),
    getById: (id: string) => fetchAPI<any>(`/contact/${id}`),
    update: (id: string, data: any) => fetchAPI<any>(`/contact/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/contact/${id}`, {
      method: 'DELETE',
    }),
  },

  // Reviews
  reviews: {
    getAll: () => fetchAPI<any[]>('/reviews'),
    getByProductId: (productId: string) => fetchAPI<any[]>(`/reviews/product/${productId}`),
    addToProduct: (productId: string, data: any) => fetchAPI<any>(`/reviews/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    deleteFromProduct: (productId: string, reviewIndex: number) => fetchAPI<void>(`/reviews/product/${productId}/${reviewIndex}`, {
      method: 'DELETE',
    }),
    create: (data: any) => fetchAPI<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/reviews/${id}`, {
      method: 'DELETE',
    }),
  },

  // Statistics
  statistics: {
    get: () => fetchAPI<any>('/statistics'),
    getRevenue: () => fetchAPI<any>('/statistics/revenue'),
  },

  // Analytics
  analytics: {
    trackEvent: (data: any) => fetchAPI<any>('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getEvents: (filters?: any) => fetchAPI<any[]>('/analytics/events', {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    }),
  },

  // Goals
  goals: {
    getAll: () => fetchAPI<any[]>('/goals'),
    getById: (id: string) => fetchAPI<any>(`/goals/${id}`),
    create: (data: any) => fetchAPI<any>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/goals/${id}`, {
      method: 'DELETE',
    }),
  },

  // Funnel Metrics
  funnelMetrics: {
    getAll: () => fetchAPI<any[]>('/funnel-metrics'),
    getById: (id: string) => fetchAPI<any>(`/funnel-metrics/${id}`),
    create: (data: any) => fetchAPI<any>('/funnel-metrics', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Team Members
  team: {
    getAll: () => fetchAPI<any[]>('/team', undefined, true),
    getById: (id: string) => fetchAPI<any>(`/team/${id}`),
    create: (data: any) => fetchAPI<any>('/team', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/team/${id}`, {
      method: 'DELETE',
    }),
  },

  // Uploads
  uploads: {
    uploadImage: async (file: File, folder?: string): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append('image', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    },
  },

  // Document Categories
  documentCategories: {
    getAll: () => fetchAPI<any[]>('/document-categories'),
    getAdmin: () => fetchAPI<any[]>('/document-categories/admin'),
    create: (data: any) => fetchAPI<any>('/document-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchAPI<any>(`/document-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/document-categories/${id}`, {
      method: 'DELETE',
    }),
  },

  // Orders
  orders: {
    getAll: (status?: string, search?: string) => {
      let query = '';
      const params = [];
      if (status) params.push(`status=${status}`);
      if (search) params.push(`search=${search}`);
      if (params.length > 0) query = `?${params.join('&')}`;
      return fetchAPI<{ success: boolean; data: any[] }>(`/orders${query}`);
    },
    getStats: () => fetchAPI<{ success: boolean; data: any }>('/orders/stats'),
    getById: (id: string) => fetchAPI<any>(`/orders/${id}`),
    getPendingCount: () => fetchAPI<{ success: boolean; count: number }>('/orders/pending-count'),
    create: (data: any) => fetchAPI<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    adminCreate: (data: any) => fetchAPI<any>('/orders/admin-create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateStatus: (id: string, status: string, extraData?: any) => fetchAPI<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...extraData }),
    }),
    updateShipping: (id: string, shippingData: { shippingProvider?: string; trackingCode?: string; estimatedDeliveryDate?: string }) => fetchAPI<any>(`/orders/${id}/shipping`, {
      method: 'PATCH',
      body: JSON.stringify(shippingData),
    }),
    delete: (id: string) => fetchAPI<any>(`/orders/${id}`, {
      method: 'DELETE',
    }),
    track: (query: string) =>
      fetchAPI<any>(`/orders/track?query=${encodeURIComponent(query.trim())}`),
    resendEmail: (id: string) => fetchAPI<any>(`/orders/${id}/resend-email`, {
      method: 'POST',
    }),
  },
  search: {
    query: (q: string, type?: string, page?: number, limit?: number) => {
      let url = `/search?q=${encodeURIComponent(q.trim())}`;
      if (type) url += `&type=${type}`;
      if (page) url += `&page=${page}`;
      if (limit) url += `&limit=${limit}`;
      return fetchAPI<any>(url);
    },
    live: (q: string) => fetchAPI<any>(`/search/live?q=${encodeURIComponent(q.trim())}`),
  },
};
