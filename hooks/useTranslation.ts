/**
 * Custom hooks for optimized translation
 */

import { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getTranslatedProduct,
  getTranslatedProject,
  getTranslatedNews,
  getTranslatedList,
  TranslatableItem
} from '../utils/translation-helper';

/**
 * Hook để translate single product với memoization
 */
export function useTranslatedProduct(product: any) {
  const { language } = useLanguage();
  
  return useMemo(
    () => product ? getTranslatedProduct(product, language) : null,
    [product, language]
  );
}

/**
 * Hook để translate single project với memoization
 */
export function useTranslatedProject(project: any) {
  const { language } = useLanguage();
  
  return useMemo(
    () => project ? getTranslatedProject(project, language) : null,
    [project, language]
  );
}

/**
 * Hook để translate single news với memoization
 */
export function useTranslatedNews(news: any) {
  const { language } = useLanguage();
  
  return useMemo(
    () => news ? getTranslatedNews(news, language) : null,
    [news, language]
  );
}

/**
 * Hook để translate list of products với memoization
 */
export function useTranslatedProducts(products: any[]) {
  const { language } = useLanguage();
  
  return useMemo(
    () => getTranslatedList(
      products,
      language,
      ['name', 'description', 'shortDescription', 'features', 'categoryLabel']
    ),
    [products, language]
  );
}

/**
 * Hook để translate list of projects với memoization
 */
export function useTranslatedProjects(projects: any[]) {
  const { language } = useLanguage();
  
  return useMemo(
    () => getTranslatedList(
      projects,
      language,
      ['name', 'description', 'location', 'client']
    ),
    [projects, language]
  );
}

/**
 * Hook để translate list of news với memoization
 */
export function useTranslatedNewsList(newsList: any[]) {
  const { language } = useLanguage();
  
  return useMemo(
    () => getTranslatedList(
      newsList,
      language,
      ['title', 'content', 'excerpt']
    ),
    [newsList, language]
  );
}

/**
 * Generic hook để translate bất kỳ item nào
 */
export function useTranslatedItem<T extends TranslatableItem>(
  item: T | null,
  fields: (keyof T)[]
) {
  const { language } = useLanguage();
  
  return useMemo(() => {
    if (!item) return null;
    
    if (language === 'vi') return item;
    
    const translated = { ...item };
    fields.forEach(field => {
      const value = item[field];
      if (typeof value === 'string' && item.translations?.[language]?.[field as string]) {
        (translated[field] as any) = item.translations[language][field as string];
      }
    });
    
    return translated;
  }, [item, language, fields]);
}

/**
 * Example usage:
 * 
 * // In component
 * function ProductCard({ product }) {
 *   const translatedProduct = useTranslatedProduct(product);
 *   
 *   return (
 *     <div>
 *       <h3>{translatedProduct.name}</h3>
 *       <p>{translatedProduct.description}</p>
 *     </div>
 *   );
 * }
 * 
 * // For lists
 * function ProductList({ products }) {
 *   const translatedProducts = useTranslatedProducts(products);
 *   
 *   return (
 *     <div>
 *       {translatedProducts.map(product => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *     </div>
 *   );
 * }
 */
