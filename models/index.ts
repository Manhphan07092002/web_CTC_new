import mongoose, { Schema, Document } from 'mongoose';

// Supported languages
export const SUPPORTED_LANGUAGES = ['vi', 'en', 'ko', 'ja', 'zh', 'de'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Base interface for all MongoDB documents
export interface BaseDocument extends Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== TRANSLATION INTERFACES ====================

// Product Translation Fields
export interface ProductTranslation {
  name?: string;
  description?: string;
  shortDescription?: string;
  specifications?: string;
  warranty?: string;
  features?: string[];
}

// Project Translation Fields
export interface ProjectTranslation {
  title?: string;
  location?: string;
  description?: string;
}

// News Translation Fields
export interface NewsTranslation {
  title?: string;
  excerpt?: string;
  content?: string;
}

// Testimonial Translation Fields
export interface TestimonialTranslation {
  role?: string;
  content?: string;
}

// Category Translation Fields
export interface CategoryTranslation {
  name?: string;
  description?: string;
}

// Generic Translations Map
export type TranslationsMap<T> = {
  [key in SupportedLanguage]?: T;
};

// Translation Sub-Schema (reusable)
const createTranslationSchema = () => ({
  type: Map,
  of: Schema.Types.Mixed,
  default: {}
});

// Review Schema
export interface IReview extends BaseDocument {
  userName: string;
  userRole?: string;
  userPhone?: string;
  rating: number;
  comment: string;
  date: string;
}

const ReviewSchema = new Schema<IReview>({
  userName: { type: String, required: true },
  userRole: String,
  userPhone: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

// Product Schema
export interface IProduct extends BaseDocument {
  name: string;
  category: string; // Keep for backward compatibility
  categoryId?: mongoose.Types.ObjectId; // Reference to ProductCategory
  categoryLabel?: string; // Nhãn category hiển thị (VD: "INVERTER")
  code?: string; // Mã sản phẩm (VD: "TL-G5199a")
  description: string;
  shortDescription?: string; // Mô tả ngắn
  specifications?: string; // Chi tiết kỹ thuật
  price?: string;
  contactPrice?: boolean; // Liên hệ để biết giá
  image: string;
  images?: string[];
  stock?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'contact'; // Còn hàng / Hết hàng / Liên hệ
  reviews?: IReview[];
  rating?: number; // Đánh giá trung bình
  power?: number; // Công suất (kW)
  efficiency?: number; // Hiệu suất (%)
  warranty?: string; // Bảo hành (VD: "25 năm")
  features?: string[]; // Các tính năng nổi bật
  technicalSpecs?: { [key: string]: string }; // Thông số kỹ thuật chi tiết
  isFeatured?: boolean; // Sản phẩm nổi bật
  featuredOrder?: number; // Thứ tự hiển thị trong danh sách nổi bật
  isActive?: boolean; // Sản phẩm có hoạt động không
  isDeleted?: boolean; // Xóa mềm
  deletedAt?: Date; // Thời gian xóa
  views?: number; // Lượt xem
  likes?: number; // Lượt thích
  shares?: number; // Lượt chia sẻ
  // Multi-language translations
  translations?: TranslationsMap<ProductTranslation>;
}

const ReviewSubSchema = new Schema<IReview>({
  userName: { type: String, required: true },
  userRole: String,
  userPhone: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: String, required: true }
});

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'ProductCategory' }, // Reference to ProductCategory
  categoryLabel: String,
  code: String,
  description: { type: String, required: true },
  shortDescription: String,
  specifications: String,
  price: String,
  contactPrice: { type: Boolean, default: false },
  image: { type: String, required: false },
  images: [String],
  stock: Number,
  stockStatus: { type: String, enum: ['in_stock', 'out_of_stock', 'contact'], default: 'in_stock' },
  reviews: [ReviewSubSchema],
  rating: { type: Number, min: 0, max: 5, default: 0 },
  power: Number,
  efficiency: Number,
  warranty: String,
  features: [String],
  technicalSpecs: { type: Map, of: String },
  isFeatured: { type: Boolean, default: false },
  featuredOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  // Multi-language translations
  translations: createTranslationSchema()
}, { timestamps: true });

// Base Category Interface
export interface IBaseCategory extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
  translations?: TranslationsMap<CategoryTranslation>;
}

// Legacy Category Schema (for backward compatibility)
export interface ICategory extends BaseDocument {
  name: string;
  description: string;
  productCount: number;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  productCount: { type: Number, default: 0 }
}, { timestamps: true });

// Product Category
export interface IProductCategory extends IBaseCategory {
  productCount?: number;
  image?: string;
  parentId?: string; // For sub-categories
}

const ProductCategorySchema = new Schema<IProductCategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: String,
  color: String,
  image: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  productCount: { type: Number, default: 0 },
  parentId: String,
  translations: createTranslationSchema()
}, { timestamps: true });

// News Category
export interface INewsCategory extends IBaseCategory {
  newsCount?: number;
}

const NewsCategorySchema = new Schema<INewsCategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: String,
  color: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  newsCount: { type: Number, default: 0 },
  translations: createTranslationSchema()
}, { timestamps: true });

// Project Category
export interface IProjectCategory extends IBaseCategory {
  projectCount?: number;
}

const ProjectCategorySchema = new Schema<IProjectCategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: String,
  color: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  projectCount: { type: Number, default: 0 },
  translations: createTranslationSchema()
}, { timestamps: true });

// Project Schema
export interface IProject extends BaseDocument {
  title: string;
  location: string;
  capacity: string;
  completionDate: string;
  image: string;
  description: string;
  categoryId?: mongoose.Types.ObjectId; // Reference to ProjectCategory
  category?: string; // Category name for display
  translations?: TranslationsMap<ProjectTranslation>;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: String, required: true },
  completionDate: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'ProjectCategory' },
  category: { type: String },
  translations: createTranslationSchema()
}, { timestamps: true });

// News Schema
export interface INewsItem extends BaseDocument {
  title: string;
  excerpt: string;
  date: string;
  image: string;
  categoryId?: mongoose.Types.ObjectId; // Reference to NewsCategory
  category?: string; // Category name for display
  content?: string; // Full content
  author?: string; // Author name
  translations?: TranslationsMap<NewsTranslation>;
}

const NewsSchema = new Schema<INewsItem>({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  date: { type: String, required: true },
  image: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'NewsCategory' },
  category: { type: String },
  content: { type: String },
  author: { type: String },
  translations: createTranslationSchema()
}, { timestamps: true });

// Testimonial Schema
export interface ITestimonial extends BaseDocument {
  name: string;
  role: string;
  content: string;
  image: string;
  translations?: TranslationsMap<TestimonialTranslation>;
}

const TestimonialSchema = new Schema<ITestimonial>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  translations: createTranslationSchema()
}, { timestamps: true });

// Partner Schema
export interface IPartner extends BaseDocument {
  name: string;
  type: 'supplier' | 'financial';
  logo: string;
  website?: string;
}

const PartnerSchema = new Schema<IPartner>({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['supplier', 'financial'] },
  logo: { type: String, required: true },
  website: String
}, { timestamps: true });

// User Schema
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Should be hashed in production
  phone: { type: String },
  avatar: { type: String },
  role: { type: String, required: true, enum: ['admin', 'editor', 'viewer'] },
  lastLogin: { type: Date }
}, { timestamps: true });

// Team Member Schema
export interface ITeamMember extends BaseDocument {
  name: string;
  role: string;
  image: string;
  email: string;
  phone: string;
  linkedin?: string;
  order: number;
  isActive: boolean;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  linkedin: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Contact Schema (Yêu cầu tư vấn)
export interface IContact extends BaseDocument {
  name: string;
  phone: string;
  email: string;
  service: string;
  message?: string;
  status: 'new' | 'contacted' | 'completed' | 'cancelled';
  notes?: string;
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  service: { type: String, required: true },
  message: { type: String },
  status: { type: String, enum: ['new', 'contacted', 'completed', 'cancelled'], default: 'new' },
  notes: { type: String }
}, { timestamps: true });

// Notification Schema
export interface INotification extends BaseDocument {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  icon?: string;
  link?: string;
  isRead: boolean;
  userId?: string; // Optional: for user-specific notifications
}

const NotificationSchema = new Schema<INotification>({
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  icon: { type: String },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  userId: { type: String }
}, { timestamps: true });

// Settings Schema
export interface ISettings extends BaseDocument {
  siteName: string;
  siteDescription: string;
  logo: string;              // Logo chính (deprecated, dùng cho backward compatibility)
  logoHeader?: string;       // Logo Header riêng
  logoFooter?: string;       // Logo Footer riêng
  favicon?: string;          // Icon tab browser (32x32)
  appleTouchIcon?: string;   // Icon iOS (180x180)
  email: string;
  phone: string;
  address: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  maintenance: boolean;
  notifyEmail: boolean;
  twoFactorAuth: boolean;
  currency: string;
  taxRate: number;
}

export interface IMigrationLog extends BaseDocument {
  action: 'import' | 'export';
  status: 'success' | 'error';
  details: string;
  user: string;
  date: Date;
}

const SettingsSchema = new Schema<ISettings>({
  siteName: { type: String, required: true, default: 'CTC' },
  siteDescription: { type: String, required: true, default: 'Giải pháp EPC và Năng lượng tái tạo hàng đầu Việt Nam' },
  logo: { type: String, required: true, default: '/uploads/images/logo/logodo.png' },
  logoHeader: { type: String, default: '' },
  logoFooter: { type: String, default: '' },
  favicon: { type: String, default: '' },
  appleTouchIcon: { type: String, default: '' },
  email: { type: String, required: true, default: 'info@ctcdn.vn' },
  phone: { type: String, required: true, default: '0915 059 666' },
  address: { type: String, required: true, default: '50B Nguyễn Du, Hải Châu, Đà Nẵng' },
  facebook: String,
  instagram: String,
  youtube: String,
  linkedin: String,
  maintenance: { type: Boolean, default: false },
  notifyEmail: { type: Boolean, default: true },
  twoFactorAuth: { type: Boolean, default: false },
  currency: { type: String, default: 'VND' },
  taxRate: { type: Number, default: 10 }
}, { timestamps: true });

const MigrationLogSchema = new Schema({
  action: { type: String, enum: ['import', 'export'], required: true },
  status: { type: String, enum: ['success', 'error'], required: true },
  details: { type: String, required: true },
  user: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

// Helper function to generate slug
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Create and export models
export const Product = mongoose.model<IProduct>('Product', ProductSchema);
export const Category = mongoose.model<ICategory>('Category', CategorySchema); // Legacy
export const ProductCategory = mongoose.model<IProductCategory>('ProductCategory', ProductCategorySchema);
export const NewsCategory = mongoose.model<INewsCategory>('NewsCategory', NewsCategorySchema);
export const ProjectCategory = mongoose.model<IProjectCategory>('ProjectCategory', ProjectCategorySchema);
export const Project = mongoose.model<IProject>('Project', ProjectSchema);
export const News = mongoose.model<INewsItem>('News', NewsSchema);
export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
export const Partner = mongoose.model<IPartner>('Partner', PartnerSchema);
export const User = mongoose.model<IUser>('User', UserSchema);
export const TeamMember = mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
export const Contact = mongoose.model<IContact>('Contact', ContactSchema);
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
export const MigrationLog = mongoose.model<IMigrationLog>('MigrationLog', MigrationLogSchema);

// Export all schemas for potential use elsewhere
export {
  ReviewSchema,
  ProductSchema,
  CategorySchema, // Legacy
  ProductCategorySchema,
  NewsCategorySchema,
  ProjectCategorySchema,
  ProjectSchema,
  NewsSchema,
  TestimonialSchema,
  PartnerSchema,
  UserSchema,
  TeamMemberSchema,
  SettingsSchema
};

// Analytics & Conversion Tracking Schema
const AnalyticsEventSchema = new Schema({
  eventType: { 
    type: String, 
    required: true,
    enum: ['page_view', 'product_view', 'contact_request', 'quote_request', 'purchase']
  },
  userId: { type: String }, // Optional user ID if logged in
  sessionId: { type: String, required: true }, // Browser session
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data
  ipAddress: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export interface IAnalyticsEvent extends mongoose.Document {
  eventType: 'page_view' | 'product_view' | 'contact_request' | 'quote_request' | 'purchase';
  userId?: string;
  sessionId: string;
  productId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);

// Analytics Goals/Targets Schema
const AnalyticsGoalSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  period: { 
    type: String, 
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  targets: {
    pageViews: { type: Number, default: 0 },
    productViews: { type: Number, default: 0 },
    contactRequests: { type: Number, default: 0 },
    quoteRequests: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }, // Overall conversion rate target (%)
    totalProducts: { type: Number, default: 0 }, // Số sản phẩm mục tiêu
    totalProjects: { type: Number, default: 0 }, // Số dự án mục tiêu
    totalNews: { type: Number, default: 0 }, // Số tin tức mục tiêu
    totalReviews: { type: Number, default: 0 } // Số đánh giá mục tiêu
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String }
}, { timestamps: true });

export interface IAnalyticsGoal extends mongoose.Document {
  name: string;
  description?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  targets: {
    pageViews: number;
    productViews: number;
    contactRequests: number;
    quoteRequests: number;
    purchases: number;
    conversionRate: number;
    totalProducts: number;
    totalProjects: number;
    totalNews: number;
    totalReviews: number;
  };
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AnalyticsGoal = mongoose.model<IAnalyticsGoal>('AnalyticsGoal', AnalyticsGoalSchema);

// ============================================
// Funnel Metrics Tracking Schema
// ============================================
const FunnelMetricsSchema = new mongoose.Schema({
  // Timestamp for this snapshot
  timestamp: { type: Date, default: Date.now, required: true },
  
  // Period type (hourly, daily, weekly, monthly)
  period: { 
    type: String, 
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  
  // Funnel stage metrics
  metrics: {
    pageViews: { type: Number, default: 0 },           // Khách truy cập
    productViews: { type: Number, default: 0 },        // Xem sản phẩm
    contactRequests: { type: Number, default: 0 },     // Yêu cầu tư vấn
    quoteRequests: { type: Number, default: 0 },       // Nhận báo giá
    purchases: { type: Number, default: 0 }            // Mua hàng
  },
  
  // Conversion rates (calculated)
  conversionRates: {
    visitorToLead: { type: Number, default: 0 },       // Khách → Lead (%)
    leadToCustomer: { type: Number, default: 0 },      // Lead → KH (%)
    overallConversion: { type: Number, default: 0 }    // Tổng thể (%)
  },
  
  // Content metrics
  contentMetrics: {
    totalProducts: { type: Number, default: 0 },       // Tổng sản phẩm
    totalProjects: { type: Number, default: 0 },       // Tổng dự án
    totalNews: { type: Number, default: 0 },           // Tổng tin tức
    totalReviews: { type: Number, default: 0 }         // Tổng đánh giá
  },
  
  // Goal comparison (if goal exists)
  goalComparison: {
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'AnalyticsGoal' },
    goalName: String,
    achievements: {
      pageViews: { actual: Number, target: Number, percentage: Number },
      productViews: { actual: Number, target: Number, percentage: Number },
      contactRequests: { actual: Number, target: Number, percentage: Number },
      quoteRequests: { actual: Number, target: Number, percentage: Number },
      purchases: { actual: Number, target: Number, percentage: Number },
      conversionRate: { actual: Number, target: Number, percentage: Number },
      totalProducts: { actual: Number, target: Number, percentage: Number },
      totalProjects: { actual: Number, target: Number, percentage: Number },
      totalNews: { actual: Number, target: Number, percentage: Number },
      totalReviews: { actual: Number, target: Number, percentage: Number }
    }
  }
}, { timestamps: true });

// Index for efficient queries
FunnelMetricsSchema.index({ timestamp: -1 });
FunnelMetricsSchema.index({ period: 1, timestamp: -1 });

export interface IFunnelMetrics extends mongoose.Document {
  timestamp: Date;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metrics: {
    pageViews: number;
    productViews: number;
    contactRequests: number;
    quoteRequests: number;
    purchases: number;
  };
  conversionRates: {
    visitorToLead: number;
    leadToCustomer: number;
    overallConversion: number;
  };
  contentMetrics: {
    totalProducts: number;
    totalProjects: number;
    totalNews: number;
    totalReviews: number;
  };
  goalComparison?: {
    goalId: mongoose.Types.ObjectId;
    goalName: string;
    achievements: {
      [key: string]: {
        actual: number;
        target: number;
        percentage: number;
      };
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export const FunnelMetrics = mongoose.model<IFunnelMetrics>('FunnelMetrics', FunnelMetricsSchema);

// Import and export Translation model
export { Translation } from './Translation';
export type { ITranslation } from './Translation';

// ==================== TRANSLATION HELPER FUNCTIONS ====================

/**
 * Get translated field value with fallback
 * Priority: requested language → original value (Vietnamese)
 */
export function getTranslatedField<T extends Record<string, any>>(
  doc: { translations?: TranslationsMap<T>; [key: string]: any },
  field: keyof T,
  lang: SupportedLanguage
): string {
  // Vietnamese is the original language, return original field
  if (lang === 'vi') {
    return doc[field as string] || '';
  }
  
  // Try requested language in translations
  if (doc.translations && doc.translations[lang] && doc.translations[lang]![field as string]) {
    return doc.translations[lang]![field as string] as string;
  }
  
  // Fallback to original field value (Vietnamese)
  return doc[field as string] || '';
}

/**
 * Apply translations to a document based on language
 * Returns a new object with translated fields
 */
export function applyTranslations<T extends Record<string, any>>(
  doc: T & { translations?: TranslationsMap<any> },
  fields: string[],
  lang: SupportedLanguage
): T {
  if (!doc || lang === 'vi') return doc; // Vietnamese is default, no translation needed
  
  const result = { ...doc };
  
  for (const field of fields) {
    // Check if translation exists for this field
    if (doc.translations && doc.translations[lang] && doc.translations[lang]![field]) {
      const translatedValue = doc.translations[lang]![field];
      // Handle both string and array fields (like features)
      (result as any)[field] = translatedValue;
    }
  }
  
  return result;
}

/**
 * Apply translations to an array of documents
 */
export function applyTranslationsToArray<T extends Record<string, any>>(
  docs: (T & { translations?: TranslationsMap<any> })[],
  fields: string[],
  lang: SupportedLanguage
): T[] {
  return docs.map(doc => applyTranslations(doc, fields, lang));
}

// Translation field mappings for each model
export const TRANSLATION_FIELDS = {
  product: ['name', 'description', 'shortDescription', 'specifications', 'warranty', 'features'],
  project: ['title', 'location', 'description'],
  news: ['title', 'excerpt', 'content'],
  testimonial: ['role', 'content'],
  category: ['name', 'description']
} as const;
// Resource (Document) Schema
export interface IResource extends BaseDocument {
  title: string;
  description?: string;
  fileUrl: string;
  type: 'catalogue' | 'manual' | 'policy';
  size?: string;
  isActive: boolean;
}

const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  fileUrl: { type: String, required: true },
  type: { type: String, required: true, enum: ['catalogue', 'manual', 'policy'] },
  size: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
