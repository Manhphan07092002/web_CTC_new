
export interface Review {
  id: string;
  userName: string;
  userRole?: string;
  userPhone?: string; // Kept private in backend usually, but requested in form
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId?: string; // Reference to ProductCategory
  categoryLabel?: string; // Nhãn category hiển thị (VD: "INVERTER")
  code?: string; // Mã sản phẩm (VD: "TL-G5199a")
  description: string;
  shortDescription?: string; // Mô tả ngắn
  specifications?: string; // Chi tiết kỹ thuật
  price?: string;
  contactPrice?: boolean; // Liên hệ để biết giá
  image: string;
  images?: string[]; // Multiple images
  stock?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'contact'; // Còn hàng / Hết hàng / Liên hệ
  reviews?: Review[];
  rating?: number; // Đánh giá trung bình
  // Technical Specs
  power?: number; // Công suất (kW)
  efficiency?: number; // Hiệu suất (%)
  warranty?: string; // Bảo hành (VD: "25 năm")
  features?: string[]; // Các tính năng nổi bật
  technicalSpecs?: { [key: string]: string }; // Thông số kỹ thuật chi tiết
  isFeatured?: boolean; // Sản phẩm nổi bật
  featuredOrder?: number; // Thứ tự hiển thị
  isDeleted?: boolean; // Xóa mềm
  deletedAt?: string; // Thời gian xóa
  views?: number; // Lượt xem
  likes?: number; // Lượt thích
  shares?: number; // Lượt chia sẻ
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
  productCount?: number;
  newsCount?: number;
  projectCount?: number;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  capacity: string;
  completionDate: string;
  image: string;
  description: string;
  category?: string;
  categoryId?: string; // Reference to ProjectCategory
  client?: string;
  duration?: string;
  status?: 'completed' | 'in_progress' | 'planned';
  isFeatured?: boolean;
  featuredOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  content?: string;
  category?: string;
  categoryId?: string; // Reference to NewsCategory
  author?: string;
  tags?: string[];
  isFeatured?: boolean;
  featuredOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
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
