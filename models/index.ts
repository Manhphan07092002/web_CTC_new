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

ReviewSchema.index({ rating: -1, createdAt: -1 });

// Product Sub-Interfaces
export interface IProductSpecification {
  name: string;
  value: any;
  unit?: string;
  type?: 'text' | 'number' | 'boolean' | 'select' | 'multi_select' | 'date';
  group?: string;
}

export interface IProductDocument {
  title: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

export interface IProductVariant {
  id?: string;
  name: string;
  sku?: string;
  price?: string;
  originalPrice?: string;
  stock?: number;
  image?: string;
  attributes?: { [key: string]: string };
}

export interface IProductWarehouse {
  name: string;
  quantity: number;
  location?: string;
}

export interface IProductWarrantyDetails {
  hasWarranty: boolean;
  period: number;
  unit: 'month' | 'year';
  provider?: string;
  conditions?: string;
}

// Product Schema
export interface IProduct extends Omit<BaseDocument, 'model'> {
  name: string;
  slug?: string;
  category: string; // Keep for backward compatibility
  categoryId?: mongoose.Types.ObjectId; // Reference to ProductCategory
  categoryLabel?: string; // Nhãn category hiển thị (VD: "INVERTER")
  code?: string; // Mã sản phẩm (VD: "TL-G5199a")
  sku?: string;
  model?: string; // Model thiết bị
  partNumber?: string; // Part Number / MPN
  origin?: string; // Xuất xứ
  unit?: string; // Đơn vị tính: Cái, Bộ, Chiếc, Mét, Cuộn, Thùng, Kg...
  description: string;
  shortDescription?: string; // Mô tả ngắn
  specifications?: string; // Chi tiết kỹ thuật dạng text cũ
  specificationsList?: IProductSpecification[]; // Danh sách thông số kỹ thuật động
  price?: string;
  originalPrice?: string; // Giá gốc (để tạo hiệu ứng giảm giá)
  vat?: number; // Thuế VAT (%) áp dụng cho sản phẩm (VD: 0, 8, 10)
  contactPrice?: boolean; // Liên hệ để biết giá
  brand?: string; // Thương hiệu (Hikvision, DrayTek, Cisco, TP-Link, Dell, etc.)
  brandId?: mongoose.Types.ObjectId;
  image: string;
  imageUrl?: string;
  images?: string[];
  videos?: Array<{ title?: string; url: string; type?: 'youtube' | 'direct' }>;
  documents?: IProductDocument[]; // Catalogue, Datasheet, Manual PDF
  stock?: number;
  minStockAlert?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'contact' | 'pre_order' | 'discontinued';
  warehouses?: IProductWarehouse[];
  hasVariants?: boolean;
  variants?: IProductVariant[];
  reviews?: IReview[];
  rating?: number; // Đánh giá trung bình
  power?: number; // Công suất (kW) - Legacy solar compatibility
  efficiency?: number; // Hiệu suất (%) - Legacy solar compatibility
  warranty?: string; // Bảo hành (VD: "25 năm")
  warrantyDetails?: IProductWarrantyDetails;
  features?: string[]; // Các tính năng nổi bật
  technicalSpecs?: { [key: string]: string }; // Thông số kỹ thuật chi tiết dạng Key-Value
  isFeatured?: boolean; // Sản phẩm nổi bật
  featuredOrder?: number; // Thứ tự hiển thị trong danh sách nổi bật
  isHot?: boolean; // Sản phẩm HOT
  badge?: string; // Nhãn tùy chỉnh: 'NEW' | 'HOT' | 'BEST_SELLER' | 'CHÍNH HÃNG'
  badges?: string[];
  status?: 'draft' | 'published' | 'hidden' | 'out_of_stock' | 'discontinued';
  isActive?: boolean; // Sản phẩm có hoạt động không
  isDeleted?: boolean; // Xóa mềm
  deletedAt?: Date; // Thời gian xóa
  views?: number; // Lượt xem
  likes?: number; // Lượt thích
  shares?: number; // Lượt chia sẻ
  focusKeyword?: string; // Từ khóa SEO Focus
  secondaryKeywords?: string[];
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  seo?: any;
  geo?: any;
  faq?: any;
  structuredData?: any;
  seedSource?: string;
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
  slug: { type: String, index: true },
  category: { type: String, required: true },
  categoryId: { type: Schema.Types.Mixed },
  categoryLabel: String,
  code: String,
  sku: String,
  model: String,
  partNumber: String,
  origin: String,
  unit: { type: String, default: 'Cái' },
  description: { type: String, required: true },
  shortDescription: String,
  specifications: String,
  specificationsList: [{
    name: { type: String, required: true },
    value: Schema.Types.Mixed,
    unit: String,
    type: { type: String, default: 'text' },
    group: String
  }],
  price: String,
  originalPrice: String,
  vat: { type: Number, default: 0 },
  contactPrice: { type: Boolean, default: false },
  brand: String,
  brandId: { type: Schema.Types.Mixed },
  image: { type: String, required: false },
  imageUrl: String,
  images: [String],
  videos: [{
    title: String,
    url: String,
    type: { type: String, default: 'youtube' }
  }],
  documents: [{
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: 'pdf' },
    fileSize: Number
  }],
  stock: { type: Number, default: 0 },
  minStockAlert: { type: Number, default: 5 },
  stockStatus: { 
    type: String, 
    enum: ['in_stock', 'out_of_stock', 'contact', 'pre_order', 'discontinued'], 
    default: 'in_stock' 
  },
  warehouses: [{
    name: String,
    quantity: Number,
    location: String
  }],
  hasVariants: { type: Boolean, default: false },
  variants: [{
    name: String,
    sku: String,
    price: String,
    originalPrice: String,
    stock: Number,
    image: String,
    attributes: { type: Map, of: String }
  }],
  reviews: [ReviewSubSchema],
  rating: { type: Number, min: 0, max: 5, default: 0 },
  power: Number,
  efficiency: Number,
  warranty: String,
  warrantyDetails: {
    hasWarranty: { type: Boolean, default: true },
    period: { type: Number, default: 12 },
    unit: { type: String, enum: ['month', 'year'], default: 'month' },
    provider: String,
    conditions: String
  },
  features: [String],
  technicalSpecs: { type: Map, of: String },
  isFeatured: { type: Boolean, default: false },
  featuredOrder: { type: Number, default: 0 },
  isHot: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  badge: { type: String, default: '' },
  badges: [{ type: String }],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'hidden', 'out_of_stock', 'discontinued'], 
    default: 'published' 
  },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  focusKeyword: { type: String, default: '' },
  secondaryKeywords: [String],
  seoTitle: String,
  metaDescription: String,
  canonicalUrl: String,
  seo: Schema.Types.Mixed,
  geo: Schema.Types.Mixed,
  faq: Schema.Types.Mixed,
  structuredData: Schema.Types.Mixed,
  seedSource: String,
  // Multi-language translations
  translations: createTranslationSchema()
}, { timestamps: true, strict: false });

// Product Indexes for fast querying & filtering
ProductSchema.index({ category: 1, isDeleted: 1 });
ProductSchema.index({ categoryId: 1, isDeleted: 1 });
ProductSchema.index({ brand: 1, isDeleted: 1 });
ProductSchema.index({ code: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ model: 1 });
ProductSchema.index({ isFeatured: 1, isDeleted: 1 });
ProductSchema.index({ isActive: 1, isDeleted: 1, createdAt: -1 });

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

// Category Indexes for fast ordering
ProductCategorySchema.index({ isActive: 1, order: 1 });

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

NewsCategorySchema.index({ isActive: 1, order: 1 });

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

ProjectCategorySchema.index({ isActive: 1, order: 1 });

// Project Schema
export interface IProject extends BaseDocument {
  title: string;
  slug?: string;
  location: string;
  capacity: string;
  completionDate: string;
  image: string;
  images?: string[];
  description: string;
  content?: string;
  excerpt?: string;
  categoryId?: mongoose.Types.ObjectId; // Reference to ProjectCategory
  category?: string; // Category name for display
  categorySlug?: string;
  featured?: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
  verified?: boolean;
  isPublished?: boolean;
  pageType?: string;
  geo?: any;
  seo?: any;
  source?: any;
  structuredData?: any;
  translations?: TranslationsMap<ProjectTranslation>;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  slug: { type: String, required: true, index: true },
  location: { type: String, required: true },
  capacity: { type: String, required: true },
  completionDate: { type: String, required: true },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  description: { type: String, required: true },
  content: String,
  excerpt: String,
  categoryId: { type: Schema.Types.ObjectId, ref: 'ProjectCategory' },
  category: { type: String },
  categorySlug: String,
  featured: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  featuredOrder: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  pageType: String,
  geo: Schema.Types.Mixed,
  seo: Schema.Types.Mixed,
  source: Schema.Types.Mixed,
  structuredData: Schema.Types.Mixed,
  translations: createTranslationSchema()
}, { timestamps: true, strict: false });

ProjectSchema.index({ categoryId: 1 });
ProjectSchema.index({ category: 1 });

// News Schema
export interface INewsItem extends BaseDocument {
  title: string;
  slug?: string;
  excerpt: string;
  date: string;
  image: string;
  categoryId?: mongoose.Types.ObjectId;
  category?: string;
  content?: string;
  author?: string;
  viewCount?: number;        // Lượt xem
  likes?: number;            // Lượt thích bài viết
  isFeatured?: boolean;      // Bài nổi bật
  featuredOrder?: number;    // Thứ tự nổi bật
  tags?: string[];           // Tags
  focusKeyword?: string;     // Từ khóa SEO chính
  status?: 'published' | 'pending' | 'draft'; // Trạng thái duyệt bài
  translations?: TranslationsMap<NewsTranslation>;
}

const NewsSchema = new Schema<INewsItem>({
  title: { type: String, required: true },
  slug: { type: String, index: true },
  excerpt: { type: String, required: true },
  date: { type: String, required: true },
  image: { type: String, required: true },
  categoryId: { type: Schema.Types.Mixed, ref: 'NewsCategory' },
  category: { type: String },
  content: { type: String },
  author: { type: String },
  viewCount: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  featuredOrder: { type: Number, default: 0 },
  tags: [{ type: String }],
  focusKeyword: { type: String, default: '' },
  status: { type: String, enum: ['published', 'pending', 'draft'], default: 'published' },
  translations: createTranslationSchema()
}, { timestamps: true, strict: false });

NewsSchema.index({ categoryId: 1 });
NewsSchema.index({ category: 1 });
NewsSchema.index({ viewCount: -1 });

// ==================== NEWS COMMENT MODEL ====================
export interface INewsComment extends BaseDocument {
  newsId: any;                        // Reference to News (ObjectId or String)
  parentId?: any;                     // ID của comment cha (null nếu là bình luận gốc)
  rootId?: any;                       // ID của bình luận gốc (để gom nhóm 2 tầng)
  replyToId?: any;                    // ID của comment/reply được bấm trả lời
  replyToName?: string;               // Tên người được trả lời (vd: Administrator, Mạnh)
  name: string;                       // Tên người bình luận (độc giả hoặc admin)
  email: string;                      // Email (bắt buộc, có validation)
  content: string;                    // Nội dung bình luận
  avatar?: string;                    // Avatar URL (tự tạo từ tên)
  likes: number;                      // Lượt thích bình luận
  isApproved: boolean;                // Admin duyệt bình luận
  isAdminReply?: boolean;             // True nếu là phản hồi từ Ban Biên Tập CTC
  replyTo?: any;                      // Legacy reference
  userId?: any;                       // Optional reference
  reply?: string;                     // Nội dung phản hồi từ Ban Biên Tập CTC (legacy)
  replyAuthor?: string;               // Tên người phản hồi (legacy)
  repliedAt?: Date;                   // Thời gian phản hồi
  repliedBy?: {                       // Thông tin tài khoản Admin phản hồi
    id?: any;
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
}

const NewsCommentSchema = new Schema<INewsComment>({
  newsId: { type: Schema.Types.Mixed, required: true },
  parentId: { type: Schema.Types.Mixed, default: null },
  rootId: { type: Schema.Types.Mixed, default: null },
  replyToId: { type: Schema.Types.Mixed },
  replyToName: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  content: { type: String, required: true },
  avatar: { type: String },
  likes: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true }, // auto-approve
  isAdminReply: { type: Boolean, default: false },
  replyTo: { type: Schema.Types.Mixed },
  userId: { type: Schema.Types.Mixed },
  reply: { type: String },
  replyAuthor: { type: String },
  repliedAt: { type: Date },
  repliedBy: { type: Schema.Types.Mixed },
}, { timestamps: true });

NewsCommentSchema.index({ newsId: 1, createdAt: -1 });
NewsCommentSchema.index({ newsId: 1, parentId: 1, createdAt: 1 });
NewsCommentSchema.index({ rootId: 1 });

// ==================== COMMENT LIKE MODEL ====================
export interface ICommentLike extends BaseDocument {
  commentId: any;
  identifier: string; // 'user:<id>' or 'email:<email>'
  userId?: any;
  email?: string;
}

const CommentLikeSchema = new Schema<ICommentLike>({
  commentId: { type: Schema.Types.Mixed, required: true },
  identifier: { type: String, required: true },
  userId: { type: Schema.Types.Mixed },
  email: { type: String },
}, { timestamps: true });

CommentLikeSchema.index({ commentId: 1, identifier: 1 }, { unique: true });

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
  department?: string;
  birthYear?: number;
  gender?: 'Nam' | 'Nữ';
  projectsCount?: number;
  specialization?: string;
  bio?: string;
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
  department: { type: String, default: '' },
  birthYear: Number,
  gender: String,
  projectsCount: { type: Number, default: 0 },
  specialization: { type: String, default: '' },
  bio: { type: String, default: '' },
  image: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  linkedin: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

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

ContactSchema.index({ status: 1, createdAt: -1 });

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
  // Cấu hình AI Chatbot
  aiEnabled?: boolean;
  aiProvider?: 'gemini' | 'groq' | 'openai' | 'deepseek' | 'custom';
  aiApiKey?: string;
  aiModel?: string;
  aiBaseUrl?: string;
  aiTemperature?: number;
  aiSystemInstruction?: string;
  // Cấu hình Header
  headerShowTopbar?: boolean;
  headerSlogan?: string;
  headerHotlineLabel?: string;
  headerHotlinePhone?: string;
  headerCtaText?: string;
  headerCtaLink?: string;
  headerNavLinks?: Array<{
    id: string;
    name: string;
    path: string;
    key?: string;
    order: number;
    submenu?: Array<{
      id: string;
      name: string;
      path: string;
    }>;
  }>;
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
  address: { type: String, required: true, default: '50B Nguyễn Du, Phường Hải Châu, TP Đà Nẵng, Việt Nam' },
  facebook: String,
  instagram: String,
  youtube: String,
  linkedin: String,
  maintenance: { type: Boolean, default: false },
  notifyEmail: { type: Boolean, default: true },
  twoFactorAuth: { type: Boolean, default: false },
  currency: { type: String, default: 'VND' },
  taxRate: { type: Number, default: 10 },
  // Cấu hình AI Chatbot
  aiEnabled: { type: Boolean, default: true },
  aiProvider: { type: String, default: 'gemini' },
  aiApiKey: { type: String, default: '' },
  aiModel: { type: String, default: 'gemini-2.5-flash' },
  aiBaseUrl: { type: String, default: '' },
  aiTemperature: { type: Number, default: 0.6 },
  aiSystemInstruction: { type: String, default: '' },
  // Cấu hình Header
  headerShowTopbar: { type: Boolean, default: true },
  headerSlogan: { type: String, default: '' },
  headerHotlineLabel: { type: String, default: 'Hotline' },
  headerHotlinePhone: { type: String, default: '' },
  headerCtaText: { type: String, default: 'LIÊN HỆ' },
  headerCtaLink: { type: String, default: '' },
  headerNavLinks: { type: Schema.Types.Mixed, default: [] }
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
export const NewsComment = mongoose.model<INewsComment>('NewsComment', NewsCommentSchema);
export const CommentLike = mongoose.model<ICommentLike>('CommentLike', CommentLikeSchema);
export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
export const Partner = mongoose.model<IPartner>('Partner', PartnerSchema);
export const User = mongoose.model<IUser>('User', UserSchema);
export const TeamMember = mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
export const Contact = mongoose.model<IContact>('Contact', ContactSchema);
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export const Review = mongoose.model<IReview>('Review', ReviewSchema);
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

AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });

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
// DocumentCategory Schema
export interface IDocumentCategory extends BaseDocument {
  name: string;
  description?: string;
  isActive: boolean;
}

const DocumentCategorySchema = new Schema<IDocumentCategory>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const DocumentCategory = mongoose.model<IDocumentCategory>('DocumentCategory', DocumentCategorySchema);

// Resource (Document) Schema
export interface IResource extends BaseDocument {
  title: string;
  description?: string;
  fileUrl: string;
  type?: string;
  categoryId: mongoose.Types.ObjectId | IDocumentCategory;
  size?: string;
  isActive: boolean;
}

const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  fileUrl: { type: String, required: true },
  type: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'DocumentCategory', required: true },
  size: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);

// ==================== ORDER INTERFACES & SCHEMAS ====================
export interface IStatusHistory {
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  updatedAt: Date;
  note?: string;
  updatedBy?: string;
}

export interface IOrder extends BaseDocument {
  orderCode: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  shippingProvider?: string;
  trackingCode?: string;
  estimatedDeliveryDate?: Date;
  cancelledReason?: string;
  statusHistory?: IStatusHistory[];
}

const OrderSchema = new Schema<IOrder>({
  orderCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  note: { type: String },
  totalAmount: { type: Number, required: true, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipping', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  shippingProvider: { type: String },
  trackingCode: { type: String },
  estimatedDeliveryDate: { type: Date },
  cancelledReason: { type: String },
  statusHistory: [{
    status: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    note: { type: String },
    updatedBy: { type: String }
  }]
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

export interface IOrderItem extends BaseDocument {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const OrderItemSchema = new Schema<IOrderItem>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true }
}, { timestamps: true });

export const OrderItem = mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);

// ==================== COMPANY PROFILE (HỒ SƠ NĂNG LỰC) ====================
export interface ICompanyProfileStat {
  value: string;
  label: string;
}

export interface ICompanyProfile extends BaseDocument {
  title: string;
  subtitle?: string;
  description?: string;
  year?: string;
  version?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  thumbnail?: string;
  tag?: string;
  highlights?: string[];
  stats?: ICompanyProfileStat[];
  status: 'active' | 'inactive';
  sortOrder: number;
  publishedAt?: Date;
  isDeleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

const CompanyProfileSchema = new Schema<ICompanyProfile>({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  year: { type: String },
  version: { type: String },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  fileSize: { type: Number },
  thumbnail: { type: String },
  tag: { type: String, default: 'CTC-PROFILE-2026' },
  highlights: [{ type: String }],
  stats: [{
    value: { type: String },
    label: { type: String }
  }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  sortOrder: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

CompanyProfileSchema.index({ status: 1, sortOrder: 1, isDeleted: 1 });

export const CompanyProfile = (mongoose.models.CompanyProfile as mongoose.Model<ICompanyProfile>) || 
  mongoose.model<ICompanyProfile>('CompanyProfile', CompanyProfileSchema);

// ==================== FINANCIAL REPORT (BÁO CÁO TÀI CHÍNH) ====================
export interface IFinancialReport extends BaseDocument {
  title: string;
  year: string;
  reportType: 'financial_statement' | 'annual_report' | 'audit_report' | 'tax_confirmation' | 'governance_report' | 'other';
  reportTypeName?: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  thumbnail?: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  publishedAt?: Date;
  isDeleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

const FinancialReportSchema = new Schema<IFinancialReport>({
  title: { type: String, required: true },
  year: { type: String, required: true },
  reportType: { 
    type: String, 
    enum: ['financial_statement', 'annual_report', 'audit_report', 'tax_confirmation', 'governance_report', 'other'],
    default: 'financial_statement' 
  },
  reportTypeName: { type: String },
  description: { type: String },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  fileSize: { type: Number },
  thumbnail: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  sortOrder: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

FinancialReportSchema.index({ year: -1, sortOrder: 1, status: 1, isDeleted: 1 });

export const FinancialReport = (mongoose.models.FinancialReport as mongoose.Model<IFinancialReport>) || 
  mongoose.model<IFinancialReport>('FinancialReport', FinancialReportSchema);

// ==================== BUSINESS SECTOR (LĨNH VỰC HOẠT ĐỘNG) ====================
export interface IBusinessSectorStat {
  value: string;
  label: string;
}

export interface IBusinessSector extends BaseDocument {
  name: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  icon?: string;
  image?: string;
  gallery?: string[];
  highlights?: string[];
  stats?: IBusinessSectorStat[];
  status: 'active' | 'inactive';
  sortOrder: number;
  isDeleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

const BusinessSectorSchema = new Schema<IBusinessSector>({
  name: { type: String, required: true },
  slug: { type: String },
  subtitle: { type: String },
  description: { type: String },
  content: { type: String },
  icon: { type: String, default: 'Handshake' },
  image: { type: String },
  gallery: [{ type: String }],
  highlights: [{ type: String }],
  stats: [{
    value: { type: String },
    label: { type: String }
  }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  sortOrder: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

export const BusinessSector = (mongoose.models.BusinessSector as mongoose.Model<IBusinessSector>) || 
  mongoose.model<IBusinessSector>('BusinessSector', BusinessSectorSchema);

// ==================== BRAND (THƯƠNG HIỆU) ====================
export interface IBrand extends BaseDocument {
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  origin?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  isDeleted?: boolean;
}

const BrandSchema = new Schema<IBrand>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  logo: { type: String, default: '' },
  website: { type: String, default: '' },
  origin: { type: String, default: '' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  productCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

BrandSchema.index({ isActive: 1, sortOrder: 1, isDeleted: 1 });
export const Brand = (mongoose.models.Brand as mongoose.Model<IBrand>) || 
  mongoose.model<IBrand>('Brand', BrandSchema);

// ==================== ATTRIBUTE TEMPLATE (BỘ THUỘC TÍNH DANH MỤC) ====================
export interface IAttributeField {
  name: string;
  key: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multi_select' | 'date';
  unit?: string;
  options?: string[];
  defaultValue?: any;
  required?: boolean;
  order: number;
  placeholder?: string;
}

export interface IAttributeTemplate extends BaseDocument {
  name: string;
  categoryId?: mongoose.Types.ObjectId;
  categorySlug?: string;
  categoryName?: string;
  description?: string;
  attributes: IAttributeField[];
  isActive: boolean;
  sortOrder: number;
  isDeleted?: boolean;
}

const AttributeFieldSchema = new Schema<IAttributeField>({
  name: { type: String, required: true },
  key: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'boolean', 'select', 'multi_select', 'date'], default: 'text' },
  unit: { type: String, default: '' },
  options: [{ type: String }],
  defaultValue: Schema.Types.Mixed,
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  placeholder: { type: String, default: '' }
}, { _id: false });

const AttributeTemplateSchema = new Schema<IAttributeTemplate>({
  name: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'ProductCategory' },
  categorySlug: { type: String, default: '' },
  categoryName: { type: String, default: '' },
  description: { type: String, default: '' },
  attributes: [AttributeFieldSchema],
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

AttributeTemplateSchema.index({ categoryId: 1, isActive: 1, isDeleted: 1 });
export const AttributeTemplate = (mongoose.models.AttributeTemplate as mongoose.Model<IAttributeTemplate>) || 
  mongoose.model<IAttributeTemplate>('AttributeTemplate', AttributeTemplateSchema);



