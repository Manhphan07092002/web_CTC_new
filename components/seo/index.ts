/**
 * SEO Components Export
 * Easy imports for all SEO-related components
 */

// Components
export { default as SEO } from '../SEO';
export { default as Breadcrumb } from '../Breadcrumb';
export { default as FAQ } from '../FAQ';

// Schema generators
export {
  generateLocalBusinessSchema,
  generateProductSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateArticleSchema,
  generateWebsiteSchema,
  generateHomePageSchema
} from '../../utils/seoSchemas';

// Types
export type {
  LocalBusinessData,
  ProductSchemaData,
  FAQItem,
  BreadcrumbItem,
  ArticleSchemaData
} from '../../utils/seoSchemas';
