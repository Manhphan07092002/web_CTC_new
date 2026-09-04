import { Product, Project, NewsItem, User, Testimonial, Partner, Category, TeamMember } from '../types';
import { Database, LayoutDashboard, Users, Layers, Settings, Handshake, Mail, Folder, FolderOpen, Star, Target, Shield, FileText, ShoppingCart, Sliders, MessageSquare, TrendingUp, Building2, Award, Package, SlidersHorizontal } from 'lucide-react';

export const NAV_LINKS = [
  { name: 'Trang chủ', path: '/', key: 'home' },
  { name: 'Giới thiệu', path: '/about', key: 'about' },
  { 
    name: 'Giải pháp', 
    path: '/solutions', 
    key: 'solutions',
    submenu: [
      { name: 'GIẢI PHÁP TOÀN DIỆN', path: '/solutions' },
      { name: 'HẠ TẦNG VIỄN THÔNG & CNTT', path: '/solutions/telecom' },
      { name: 'ĐIỆN MẶT TRỜI (SOLAR EPC)', path: '/solutions/rooftop' },
      { name: 'ĐIỆN GIÓ (WIND POWER EPC)', path: '/solutions/farm' },
      { name: 'ĐƯỜNG DÂY & TRẠM BIẾN ÁP 110KV', path: '/solutions/electrical' },
      { name: 'DATA CENTER & HẠ TẦNG SỐ', path: '/solutions/datacenter' },
      { name: 'XÂY DỰNG DÂN DỤNG & CÔNG NGHIỆP', path: '/solutions/construction' }
    ]
  },
  { 
    name: 'Sản phẩm', 
    path: '/products', 
    key: 'products',
    submenu: [
      { name: 'TẤM PIN NĂNG LƯỢNG MẶT TRỜI', path: '/products?cat=panels' },
      { name: 'BỘ HÒA LỚI (INVERTER)', path: '/products?cat=inverter' },
      { name: 'HỆ THỐNG LƯU TRỮ ĐIỆN', path: '/products?cat=storage' },
      { name: 'PHỤ KIỆN LẮP ĐẶT', path: '/products?cat=accessories' }
    ]
  },
  { name: 'Dự án', path: '/projects', key: 'projects' },
  { name: 'Tin tức', path: '/news', key: 'news' },
  { name: 'Tài liệu', path: '/resources', key: 'resources' },
  { name: 'Liên hệ', path: '/contact', key: 'contact' },
];

export const ADMIN_MENU = [
  // Group 1: Tổng quan (Main)
  { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard, key: 'dashboard', permission: null, minLevel: 10, group: 'main' },

  // Group 2: Quản lý sản phẩm (Product CMS)
  { name: 'Quản lý sản phẩm', path: '/admin/content?tab=products', icon: Package, key: 'products', permission: 'view_content', minLevel: 30, group: 'products' },
  { name: 'Thương hiệu & Hãng SX', path: '/admin/brands', icon: Award, key: 'brands', permission: 'view_content', minLevel: 30, group: 'products' },
  { name: 'Mẫu thông số kỹ thuật', path: '/admin/attribute-templates', icon: SlidersHorizontal, key: 'attribute_templates', permission: 'view_content', minLevel: 30, group: 'products' },
  { name: 'Danh mục sản phẩm', path: '/admin/categories', icon: Folder, key: 'categories', permission: 'manage_product_categories', minLevel: 50, group: 'products' },

  // Group 3: Kinh doanh & Khách hàng (Business & Customers)
  { name: 'Quản lý đơn hàng', path: '/admin/orders', icon: ShoppingCart, key: 'orders', permission: 'view_customers', minLevel: 40, group: 'business' },
  { name: 'Quản lý liên hệ', path: '/admin/contacts', icon: Mail, key: 'contacts', permission: 'view_customers', minLevel: 40, group: 'business' },
  { name: 'Đánh giá khách hàng', path: '/admin/reviews', icon: Star, key: 'reviews', permission: 'view_content', minLevel: 30, group: 'business' },
  { name: 'Quản lý mục tiêu', path: '/admin/goals', icon: Target, key: 'goals', permission: 'view_content', minLevel: 30, group: 'business' },

  // Group 4: Quản lý nội dung (Content)
  { name: 'Quản lý nội dung', path: '/admin/content', icon: Layers, key: 'content', permission: 'view_content', minLevel: 30, group: 'content' },
  { name: 'Quản lý File & Media', path: '/admin/files', icon: FolderOpen, key: 'files', permission: 'view_content', minLevel: 30, group: 'content' },
  { name: 'Quản lý bình luận', path: '/admin/comments', icon: MessageSquare, key: 'comments', permission: 'view_content', minLevel: 30, group: 'content' },
  { name: 'Quản lý Header', path: '/admin/header', icon: Sliders, key: 'header', permission: 'view_content', minLevel: 30, group: 'content' },

  // Group 5: Hồ sơ năng lực (Company Profile & Reports)
  { name: 'Hồ sơ năng lực', path: '/admin/company-profiles', icon: FileText, key: 'company_profiles', permission: 'view_content', minLevel: 30, group: 'profile' },
  { name: 'Báo cáo tài chính', path: '/admin/financial-reports', icon: TrendingUp, key: 'financial_reports', permission: 'view_content', minLevel: 30, group: 'profile' },
  { name: 'Lĩnh vực hoạt động', path: '/admin/business-sectors', icon: Building2, key: 'business_sectors', permission: 'view_content', minLevel: 30, group: 'profile' },

  // Group 6: Hệ thống & Bảo mật (System & Administration)
  { name: 'Quản lý tài khoản', path: '/admin/users', icon: Handshake, key: 'users', permission: 'view_users', minLevel: 90, group: 'system' },
  { name: 'Quản lý nhân sự', path: '/admin/team', icon: Users, key: 'team', permission: 'view_users', minLevel: 50, group: 'system' },
  { name: 'Giám sát bảo mật', path: '/admin/security', icon: Shield, key: 'security', permission: 'view_security_logs', minLevel: 90, group: 'system' },
  { name: 'Dữ liệu & Migration', path: '/admin/migration', icon: Database, key: 'migration', permission: 'settings_manage', minLevel: 90, group: 'system' },
  { name: 'Cấu hình hệ thống', path: '/admin/settings', icon: Settings, key: 'settings', permission: 'view_system_settings', minLevel: 90, group: 'system' },
];

// ============================================
// NOTE: All data below is now loaded from MongoDB via API
// See services/api.ts for API endpoints
// MOCK data kept for fallback/development only
// ============================================

export const MOCK_CATEGORIES: Category[] = [];
export const MOCK_PROJECT_CATEGORIES: Category[] = [];
export const MOCK_NEWS_CATEGORIES: Category[] = [];

export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_PROJECTS: Project[] = [];
export const MOCK_NEWS: NewsItem[] = [];
export const MOCK_TESTIMONIALS: Testimonial[] = [];
export const MOCK_PARTNERS: Partner[] = [];
export const MOCK_USERS: User[] = [];
export const MOCK_TEAM: TeamMember[] = [];
