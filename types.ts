
export interface Review {
  id: string;
  userName: string;
  userRole?: string;
  userPhone?: string; // Kept private in backend usually, but requested in form
  rating: number;
  comment: string;
  date: string;
}

export interface ProductSpecification {
  name: string;
  key?: string;
  value: any;
  unit?: string;
  type?: 'text' | 'number' | 'boolean' | 'select' | 'multi_select' | 'date';
  group?: string;
  isHighlight?: boolean;
}

export interface ProductDocument {
  id?: string;
  title: string;
  fileUrl?: string;
  url?: string;
  fileName?: string;
  fileType?: string; // 'pdf' | 'doc' | 'dwg' | 'other'
  fileSize?: number;
  version?: string;
}

export interface ProductVariant {
  id?: string;
  name: string; // VD: "550W / Đen", "RAM 16GB / SSD 512GB"
  sku?: string;
  price?: string | number;
  originalPrice?: string | number;
  stock?: number;
  image?: string;
  attributes?: { [key: string]: string };
}

export interface ProductWarehouse {
  name: string;
  quantity?: number;
  stock?: number;
  code?: string;
  location?: string;
}

export interface ProductWarrantyDetails {
  hasWarranty?: boolean;
  period?: number | string;
  unit?: 'month' | 'year' | string;
  provider?: string;
  conditions?: string;
  type?: 'hang' | 'ctc' | 'online';
  coverage?: string;
  policyUrl?: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  category: string;
  categoryId?: string; // Reference to ProductCategory
  categoryLabel?: string; // Nhãn category hiển thị (VD: "INVERTER")
  code?: string; // Mã sản phẩm (VD: "TL-G5199a")
  sku?: string;
  model?: string; // Model sản phẩm
  partNumber?: string; // Mã phụ tùng / MPN
  origin?: string; // Xuất xứ
  unit?: string; // Đơn vị tính: Cái, Bộ, Chiếc, Mét, Cuộn, Thùng, Kg...
  description: string;
  shortDescription?: string; // Mô tả ngắn
  specifications?: string; // Chi tiết kỹ thuật dạng text (backward compatibility)
  specificationsList?: ProductSpecification[]; // Danh sách thông số kỹ thuật động
  price?: string;
  originalPrice?: string;
  vat?: number;
  contactPrice?: boolean; // Liên hệ để biết giá
  brand?: string; // Thương hiệu
  brandId?: string;
  image: string;
  imageUrl?: string;
  images?: string[]; // Multiple images
  videos?: Array<{ title?: string; url: string; type?: 'youtube' | 'direct' }>;
  documents?: ProductDocument[]; // Catalogue, Datasheet, Manual PDF
  stock?: number;
  minStockAlert?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'contact' | 'pre_order' | 'discontinued';
  warehouses?: ProductWarehouse[];
  hasVariants?: boolean;
  variants?: ProductVariant[];
  reviews?: Review[];
  rating?: number; // Đánh giá trung bình
  // Legacy / Optional Technical Specs for Solar
  power?: number; // Công suất (kW)
  efficiency?: number; // Hiệu suất (%)
  warranty?: string; // Bảo hành (VD: "25 năm")
  warrantyDetails?: ProductWarrantyDetails;
  features?: string[]; // Các tính năng nổi bật
  technicalSpecs?: { [key: string]: string }; // Thông số kỹ thuật chi tiết
  isFeatured?: boolean; // Sản phẩm nổi bật
  featuredOrder?: number; // Thứ tự hiển thị
  isNew?: boolean; // Sản phẩm MỚI
  isHot?: boolean; // Sản phẩm HOT
  badge?: string; // Nhãn tùy chỉnh: 'NEW' | 'HOT' | 'BEST_SELLER' | 'CHÍNH HÃNG'
  badges?: string[];
  status?: 'draft' | 'published' | 'hidden' | 'out_of_stock' | 'discontinued';
  isDeleted?: boolean; // Xóa mềm
  deletedAt?: string; // Thời gian xóa
  views?: number; // Lượt xem
  likes?: number; // Lượt thích
  shares?: number; // Lượt chia sẻ
  focusKeyword?: string; // Từ khóa SEO Focus
  secondaryKeywords?: string[];
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  seo?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  origin?: string;
  country?: string;
  description?: string;
  featured?: boolean;
  isFeatured?: boolean;
  status?: 'active' | 'inactive';
  isActive?: boolean;
  sortOrder?: number;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttributeField {
  name: string;
  key: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multi_select' | 'date';
  unit?: string;
  options?: string[];
  defaultValue?: any;
  required?: boolean;
  order: number;
  placeholder?: string;
  isFilterable?: boolean;
  isHighlight?: boolean;
}

export interface AttributeTemplate {
  id?: string;
  _id?: string;
  name: string;
  category?: string;
  categoryId?: string;
  categorySlug?: string;
  categoryName?: string;
  description?: string;
  fields?: AttributeField[];
  attributes?: AttributeField[];
  status?: 'active' | 'inactive';
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
  parentId?: string; // ID của danh mục cha (nếu là danh mục con)
  productCount?: number;
  newsCount?: number;
  projectCount?: number;
  resourceCount?: number;
}

export interface Project {
  id: string;
  _id?: string;
  title: string;
  location: string;
  capacity: string;
  completionDate: string;
  date?: string;
  image: string;
  images?: string[];
  description: string;
  excerpt?: string;
  category?: string;
  categoryId?: string; // Reference to ProjectCategory
  client?: string;
  duration?: string;
  features?: string[];
  status?: 'completed' | 'in_progress' | 'planned';
  featured?: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsItem {
  id: string;
  _id?: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  content?: string;
  category?: string;
  categoryId?: string; // Reference to NewsCategory
  author?: string;
  tags?: string[];
  focusKeyword?: string;
  status?: 'published' | 'pending' | 'draft';
  isFeatured?: boolean;
  featuredOrder?: number;
  viewCount?: number;
  likes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  _id?: string;
  name: string;
  role: string;
  content: string;
  image: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'supplier' | 'financial'; // Loại đối tác: Cung cấp hoặc Tài chính
  logo: string;
  website?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only used when creating/updating
  phone?: string;
  avatar?: string; // User profile picture
  role: 'admin' | 'editor' | 'viewer';
  createdAt?: string;
  lastLogin?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  email: string;
  phone: string;
  linkedin?: string;
  order: number;
  isActive: boolean;
}

export enum PageRoute {
  HOME = '/',
  ABOUT = '/about',
  SOLUTIONS = '/solutions',
  PRODUCTS = '/products',
  PROJECTS = '/projects',
  NEWS = '/news',
  RESOURCES = '/resources',
  CONTACT = '/contact',
  ADMIN = '/admin',
}

// WebMCP Navigator Extensions for AI Agent Browsing
declare global {
  interface Navigator {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        description: string;
        inputSchema: Record<string, any>;
        execute: (args: any) => Promise<any>;
      }) => void;
      unregisterTool?: (name: string) => void;
    };
  }
}

// React JSX Extensions for WebMCP attributes
declare module 'react' {
  interface FormHTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
  }
  interface InputHTMLAttributes<T> {
    toolparamdescription?: string;
  }
  interface TextareaHTMLAttributes<T> {
    toolparamdescription?: string;
  }
}

