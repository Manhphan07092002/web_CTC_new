/**
 * @deprecated This file is DEPRECATED and should NOT be used anymore!
 * 
 * ⚠️ WARNING: This service uses localStorage which is NOT persistent and NOT scalable
 * 
 * ✅ USE INSTEAD: services/api.ts
 * 
 * All data is now stored in MongoDB and accessed via REST API endpoints.
 * See services/api.ts for the new implementation.
 * 
 * This file is kept only for backward compatibility.
 * TODO: Remove this file after migrating all components to use services/api.ts
 */

import { MOCK_PRODUCTS, MOCK_PROJECTS, MOCK_NEWS, MOCK_USERS, MOCK_TESTIMONIALS, MOCK_PARTNERS, MOCK_CATEGORIES, MOCK_PROJECT_CATEGORIES, MOCK_NEWS_CATEGORIES } from '../constants';
import { Product, Project, NewsItem, User, Testimonial, Partner, Category } from '../types';

// Helper to manage localStorage (DEPRECATED - use MongoDB instead)
const get = <T>(key: string, initial: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(stored);
  } catch (e) {
    return initial;
  }
};

const set = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to localStorage", e);
  }
};

// Database Service simulating backend controllers
export const db = {
  products: {
    getAll: () => get<Product[]>('products', MOCK_PRODUCTS),
    getById: (id: string) => {
        const items = get<Product[]>('products', MOCK_PRODUCTS);
        return items.find(p => p.id === id) || null;
    },
    add: (item: Omit<Product, 'id'>) => {
        const items = get<Product[]>('products', MOCK_PRODUCTS);
        const newItem = { ...item, id: Date.now().toString() };
        set('products', [newItem, ...items]);
        return newItem;
    },
    update: (id: string, data: Partial<Product>) => {
        const items = get<Product[]>('products', MOCK_PRODUCTS);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            set('products', items);
            return items[index];
        }
        return null;
    },
    delete: (id: string) => {
        const items = get<Product[]>('products', MOCK_PRODUCTS);
        set('products', items.filter(i => i.id !== id));
    }
  },
  categories: {
    getAll: () => get<Category[]>('categories', MOCK_CATEGORIES),
    add: (item: Omit<Category, 'id'>) => {
        const items = get<Category[]>('categories', MOCK_CATEGORIES);
        const newItem = { ...item, id: Date.now().toString() };
        set('categories', [newItem, ...items]);
        return newItem;
    },
    update: (id: string, data: Partial<Category>) => {
        const items = get<Category[]>('categories', MOCK_CATEGORIES);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            set('categories', items);
            return items[index];
        }
        return null;
    },
    delete: (id: string) => {
        const items = get<Category[]>('categories', MOCK_CATEGORIES);
        set('categories', items.filter(i => i.id !== id));
    }
  },
  projectCategories: {
    getAll: () => get<Category[]>('project_categories', MOCK_PROJECT_CATEGORIES),
    add: (item: Omit<Category, 'id'>) => {
        const items = get<Category[]>('project_categories', MOCK_PROJECT_CATEGORIES);
        const newItem = { ...item, id: Date.now().toString() };
        set('project_categories', [newItem, ...items]);
        return newItem;
    },
    update: (id: string, data: Partial<Category>) => {
        const items = get<Category[]>('project_categories', MOCK_PROJECT_CATEGORIES);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            set('project_categories', items);
            return items[index];
        }
        return null;
    },
    delete: (id: string) => {
        const items = get<Category[]>('project_categories', MOCK_PROJECT_CATEGORIES);
        set('project_categories', items.filter(i => i.id !== id));
    }
  },
  newsCategories: {
    getAll: () => get<Category[]>('news_categories', MOCK_NEWS_CATEGORIES),
    add: (item: Omit<Category, 'id'>) => {
        const items = get<Category[]>('news_categories', MOCK_NEWS_CATEGORIES);
        const newItem = { ...item, id: Date.now().toString() };
        set('news_categories', [newItem, ...items]);
        return newItem;
    },
    update: (id: string, data: Partial<Category>) => {
        const items = get<Category[]>('news_categories', MOCK_NEWS_CATEGORIES);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            set('news_categories', items);
            return items[index];
        }
        return null;
    },
    delete: (id: string) => {
        const items = get<Category[]>('news_categories', MOCK_NEWS_CATEGORIES);
        set('news_categories', items.filter(i => i.id !== id));
    }
  },
  projects: {
    getAll: () => get<Project[]>('projects', MOCK_PROJECTS),
    add: (item: Omit<Project, 'id'>) => {
        const items = get<Project[]>('projects', MOCK_PROJECTS);
        const newItem = { ...item, id: Date.now().toString() };
        set('projects', [newItem, ...items]);
        return newItem;
    },
    update: (id: string, data: Partial<Project>) => {
        const items = get<Project[]>('projects', MOCK_PROJECTS);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            set('projects', items);
            return items[index];
        }
        return null;
    },
    delete: (id: string) => {
        const items = get<Project[]>('projects', MOCK_PROJECTS);
        set('projects', items.filter(i => i.id !== id));
    }
  },
  news: {
    getAll: () => get<NewsItem[]>('news', MOCK_NEWS),
    add: (item: Omit<NewsItem, 'id'>) => {
        const items = get<NewsItem[]>('news', MOCK_NEWS);
        const newItem = { ...item, id: Date.now().toString() };
        set('news', [newItem, ...items]);
        return newItem;
    },
    update: (id: string, data: Partial<NewsItem>) => {
        const items = get<NewsItem[]>('news', MOCK_NEWS);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            set('news', items);
            return items[index];
        }
        return null;
    },
    delete: (id: string) => {
        const items = get<NewsItem[]>('news', MOCK_NEWS);
        set('news', items.filter(i => i.id !== id));
    }
  },
  testimonials: {
    getAll: () => get<Testimonial[]>('testimonials', MOCK_TESTIMONIALS),
    add: (item: Omit<Testimonial, 'id'>) => {
        const items = get<Testimonial[]>('testimonials', MOCK_TESTIMONIALS);
        const newItem = { ...item, id: Date.now().toString() };
        set('testimonials', [newItem, ...items]);
        return newItem;
    },
    update: (id: string, data: Partial<Testimonial>) => {
        const items = get<Testimonial[]>('testimonials', MOCK_TESTIMONIALS);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            set('testimonials', items);
            return items[index];
        }
        return null;
    },
    delete: (id: string) => {
        const items = get<Testimonial[]>('testimonials', MOCK_TESTIMONIALS);
        set('testimonials', items.filter(i => i.id !== id));
    }
  },
  partners: {
    getAll: () => get<Partner[]>('partners', MOCK_PARTNERS),
    add: (item: Omit<Partner, 'id'>) => {
        const items = get<Partner[]>('partners', MOCK_PARTNERS);
        const newItem = { ...item, id: Date.now().toString() };
        set('partners', [newItem, ...items]);
        return newItem;
    },
    update: (id: string, data: Partial<Partner>) => {
        const items = get<Partner[]>('partners', MOCK_PARTNERS);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            set('partners', items);
            return items[index];
        }
        return null;
    },
    delete: (id: string) => {
        const items = get<Partner[]>('partners', MOCK_PARTNERS);
        set('partners', items.filter(i => i.id !== id));
    }
  },
  users: {
    getAll: () => get<User[]>('users', MOCK_USERS),
    add: (item: Omit<User, 'id'>) => {
        const items = get<User[]>('users', MOCK_USERS);
        const newItem = { ...item, id: Date.now().toString() };
        set('users', [newItem, ...items]);
        return newItem;
    },
    update: (id: string, data: Partial<User>) => {
        const items = get<User[]>('users', MOCK_USERS);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            set('users', items);
            return items[index];
        }
        return null;
    },
    delete: (id: string) => {
        const items = get<User[]>('users', MOCK_USERS);
        set('users', items.filter(i => i.id !== id));
    }
  }
};
