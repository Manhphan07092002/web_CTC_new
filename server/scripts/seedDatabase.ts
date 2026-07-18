import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import {
  Settings,
  ProductCategory,
  Product,
  NewsCategory,
  News,
  ProjectCategory,
  Project,
  Testimonial,
  Partner,
  User,
  TeamMember,
  Contact,
  Notification,
  DocumentCategory,
  Resource
} from '../models/index.js';
import { Permission, Role, UserPermission } from '../../models/permissions.js';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    console.log('Clearing old data...');
    await Promise.all([
      ProductCategory.deleteMany({}),
      Product.deleteMany({}),
      NewsCategory.deleteMany({}),
      News.deleteMany({}),
      ProjectCategory.deleteMany({}),
      Project.deleteMany({}),
      Testimonial.deleteMany({}),
      Partner.deleteMany({}),
      User.deleteMany({}),
      TeamMember.deleteMany({}),
      Settings.deleteMany({}),
      Contact.deleteMany({}),
      Notification.deleteMany({}),
      Permission.deleteMany({}),
      Role.deleteMany({}),
      UserPermission.deleteMany({}),
      DocumentCategory.deleteMany({}),
      Resource.deleteMany({})
    ]);

    console.log('Inserting Settings...');
    await Settings.create({
      siteName: 'CTC',
      siteDescription: 'Giải pháp EPC và Năng lượng tái tạo hàng đầu Việt Nam',
      logo: '/uploads/images/logo/logodo.png',
      email: 'info@ctcdn.vn',
      phone: '02363745555',
      address: '50B Nguyễn Du, Hải Châu, Đà Nẵng',
      maintenance: false,
      notifyEmail: true,
      twoFactorAuth: false,
      currency: 'VND',
      taxRate: 10
    });

    console.log('Inserting Users...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await User.create({
      name: 'Admin CTC',
      email: 'admin@ctcdn.vn',
      password: hashedPassword,
      role: 'admin',
      permissions: ['settings_manage', 'view_users'],
      status: 'active'
    });

    const sale = await User.create({
      name: 'Nhân viên Sale',
      email: 'sale@ctcdn.vn',
      password: hashedPassword,
      role: 'editor',
      permissions: [],
      status: 'active'
    });

    console.log('Inserting Permissions & Roles...');
    // Array of permissions
    const permissionsData = [
      // Content Management
      { name: 'view_content', resource: 'content', action: 'view', description: 'Xem nội dung', category: 'content', isActive: true },
      { name: 'create_content', resource: 'content', action: 'create', description: 'Tạo nội dung', category: 'content', isActive: true },
      { name: 'edit_content', resource: 'content', action: 'edit', description: 'Chỉnh sửa nội dung', category: 'content', isActive: true },
      { name: 'delete_content', resource: 'content', action: 'delete', description: 'Xóa nội dung', category: 'content', isActive: true },
      { name: 'publish_content', resource: 'content', action: 'publish', description: 'Xuất bản nội dung', category: 'content', isActive: true },

      // Product Management
      { name: 'view_products', resource: 'products', action: 'view', description: 'Xem sản phẩm', category: 'content', isActive: true },
      { name: 'create_products', resource: 'products', action: 'create', description: 'Tạo sản phẩm', category: 'content', isActive: true },
      { name: 'edit_products', resource: 'products', action: 'edit', description: 'Chỉnh sửa sản phẩm', category: 'content', isActive: true },
      { name: 'delete_products', resource: 'products', action: 'delete', description: 'Xóa sản phẩm', category: 'content', isActive: true },
      { name: 'manage_product_categories', resource: 'product_categories', action: 'manage', description: 'Quản lý danh mục sản phẩm', category: 'content', isActive: true },

      // News Management
      { name: 'view_news', resource: 'news', action: 'view', description: 'Xem tin tức', category: 'content', isActive: true },
      { name: 'create_news', resource: 'news', action: 'create', description: 'Tạo tin tức', category: 'content', isActive: true },
      { name: 'edit_news', resource: 'news', action: 'edit', description: 'Chỉnh sửa tin tức', category: 'content', isActive: true },
      { name: 'delete_news', resource: 'news', action: 'delete', description: 'Xóa tin tức', category: 'content', isActive: true },
      { name: 'manage_news_categories', resource: 'news_categories', action: 'manage', description: 'Quản lý danh mục tin tức', category: 'content', isActive: true },

      // Project Management
      { name: 'view_projects', resource: 'projects', action: 'view', description: 'Xem dự án', category: 'content', isActive: true },
      { name: 'create_projects', resource: 'projects', action: 'create', description: 'Tạo dự án', category: 'content', isActive: true },
      { name: 'edit_projects', resource: 'projects', action: 'edit', description: 'Chỉnh sửa dự án', category: 'content', isActive: true },
      { name: 'delete_projects', resource: 'projects', action: 'delete', description: 'Xóa dự án', category: 'content', isActive: true },
      { name: 'manage_project_categories', resource: 'project_categories', action: 'manage', description: 'Quản lý danh mục dự án', category: 'content', isActive: true },

      // User Management
      { name: 'view_users', resource: 'users', action: 'view', description: 'Xem người dùng', category: 'user', isActive: true },
      { name: 'create_users', resource: 'users', action: 'create', description: 'Tạo người dùng', category: 'user', isActive: true },
      { name: 'edit_users', resource: 'users', action: 'edit', description: 'Chỉnh sửa người dùng', category: 'user', isActive: true },
      { name: 'delete_users', resource: 'users', action: 'delete', description: 'Xóa người dùng', category: 'user', isActive: true },
      { name: 'manage_user_permissions', resource: 'user_permissions', action: 'manage', description: 'Quản lý phân quyền người dùng', category: 'user', isActive: true },

      // Role & Permission Management
      { name: 'view_roles', resource: 'roles', action: 'view', description: 'Xem vai trò', category: 'user', isActive: true },
      { name: 'manage_roles', resource: 'roles', action: 'manage', description: 'Quản lý vai trò', category: 'user', isActive: true },
      { name: 'view_permissions', resource: 'permissions', action: 'view', description: 'Xem quyền', category: 'user', isActive: true },
      { name: 'manage_permissions', resource: 'permissions', action: 'manage', description: 'Quản lý quyền', category: 'user', isActive: true },
      { name: 'view_user_permissions', resource: 'user_permissions', action: 'view', description: 'Xem phân quyền người dùng', category: 'user', isActive: true },
      { name: 'view_permission_logs', resource: 'permission_logs', action: 'view', description: 'Xem nhật ký phân quyền', category: 'user', isActive: true },

      // System Management
      { name: 'view_system_settings', resource: 'system_settings', action: 'view', description: 'Xem cài đặt hệ thống', category: 'system', isActive: true },
      { name: 'manage_system_settings', resource: 'system_settings', action: 'manage', description: 'Quản lý cài đặt hệ thống', category: 'system', isActive: true },
      { name: 'view_system_logs', resource: 'system_logs', action: 'view', description: 'Xem nhật ký hệ thống', category: 'system', isActive: true },
      { name: 'manage_file_uploads', resource: 'file_uploads', action: 'manage', description: 'Quản lý tải lên tệp', category: 'system', isActive: true },
      { name: 'view_database_backup', resource: 'database_backup', action: 'view', description: 'Xem sao lưu cơ sở dữ liệu', category: 'system', isActive: true },
      { name: 'manage_database_backup', resource: 'database_backup', action: 'manage', description: 'Quản lý sao lưu cơ sở dữ liệu', category: 'system', isActive: true },

      // Security Management
      { name: 'view_security_logs', resource: 'security_logs', action: 'view', description: 'Xem nhật ký bảo mật', category: 'security', isActive: true },
      { name: 'manage_security_settings', resource: 'security_settings', action: 'manage', description: 'Quản lý cài đặt bảo mật', category: 'security', isActive: true },
      { name: 'view_audit_logs', resource: 'audit_logs', action: 'view', description: 'Xem nhật ký kiểm toán', category: 'security', isActive: true },
      { name: 'manage_ip_blacklist', resource: 'ip_blacklist', action: 'manage', description: 'Quản lý danh sách IP chặn', category: 'security', isActive: true },

      // Analytics
      { name: 'view_analytics', resource: 'analytics', action: 'view', description: 'Xem thống kê', category: 'analytics', isActive: true },
      { name: 'view_reports', resource: 'reports', action: 'view', description: 'Xem báo cáo', category: 'analytics', isActive: true },
      { name: 'export_data', resource: 'data_export', action: 'export', description: 'Xuất dữ liệu', category: 'analytics', isActive: true },

      // Commerce
      { name: 'view_orders', resource: 'orders', action: 'view', description: 'Xem đơn hàng', category: 'commerce', isActive: true },
      { name: 'manage_orders', resource: 'orders', action: 'manage', description: 'Quản lý đơn hàng', category: 'commerce', isActive: true },
      { name: 'view_customers', resource: 'customers', action: 'view', description: 'Xem khách hàng', category: 'commerce', isActive: true },
      { name: 'manage_customers', resource: 'customers', action: 'manage', description: 'Quản lý khách hàng', category: 'commerce', isActive: true },
    ];

    const createdPermissions = await Permission.insertMany(permissionsData);
    const permissionMap = new Map();
    createdPermissions.forEach(perm => {
      permissionMap.set(perm.name, perm._id);
    });

    const rolesData = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Quyền cao nhất, có thể làm tất cả',
        level: 100,
        isSystem: true,
        isActive: true,
        color: '#DC2626',
        icon: 'Crown',
        permissions: Array.from(permissionMap.values())
      },
      {
        name: 'admin',
        displayName: 'Admin',
        description: 'Quản trị viên, có thể quản lý hầu hết chức năng',
        level: 90,
        isSystem: true,
        isActive: true,
        color: '#7C3AED',
        icon: 'Shield',
        permissions: [
          'view_content', 'create_content', 'edit_content', 'delete_content', 'publish_content',
          'view_products', 'create_products', 'edit_products', 'delete_products', 'manage_product_categories',
          'view_news', 'create_news', 'edit_news', 'delete_news', 'manage_news_categories',
          'view_projects', 'create_projects', 'edit_projects', 'delete_projects', 'manage_project_categories',
          'view_users', 'create_users', 'edit_users', 'delete_users',
          'view_roles', 'view_permissions', 'view_user_permissions',
          'view_system_settings', 'manage_system_settings', 'manage_file_uploads',
          'view_security_logs', 'view_audit_logs', 'manage_ip_blacklist',
          'view_analytics', 'view_reports', 'export_data',
        ].map(name => permissionMap.get(name)).filter(Boolean)
      },
      {
        name: 'editor',
        displayName: 'Editor',
        description: 'Biên tập viên, có thể tạo và chỉnh sửa nội dung',
        level: 50,
        isSystem: true,
        isActive: true,
        color: '#059669',
        icon: 'Edit',
        permissions: [
          'view_content', 'create_content', 'edit_content', 'publish_content',
          'view_products', 'create_products', 'edit_products',
          'view_news', 'create_news', 'edit_news',
          'view_projects', 'create_projects', 'edit_projects',
          'manage_file_uploads',
          'view_analytics', 'view_reports',
        ].map(name => permissionMap.get(name)).filter(Boolean)
      }
    ];

    const createdRoles = await Role.insertMany(rolesData);

    const superAdminRole = createdRoles.find(r => r.name === 'super_admin');
    if (superAdminRole && admin) {
      await UserPermission.create({
        userId: admin._id,
        roleId: superAdminRole._id,
        assignedBy: admin._id,
        notes: 'Khởi tạo quyền Super Admin'
      });
    }

    const editorRole = createdRoles.find(r => r.name === 'editor');
    if (editorRole && sale) {
      await UserPermission.create({
        userId: sale._id,
        roleId: editorRole._id,
        assignedBy: admin._id,
        notes: 'Khởi tạo quyền Editor cho nhân viên sale'
      });
    }

    console.log('Inserting Product Categories & Products...');
    const catSolar = await ProductCategory.create({ name: 'Tấm Pin Năng Lượng Mặt Trời', slug: 'tam-pin-mat-troi', description: 'Các loại pin mặt trời chất lượng cao', status: 'active', order: 1 });
    const catInverter = await ProductCategory.create({ name: 'Biến Tần (Inverter)', slug: 'bien-tan', description: 'Inverter hòa lưới và lưu trữ', status: 'active', order: 2 });
    
    await Product.insertMany([
      {
        name: 'Tấm Pin Jinko Solar 550W',
        categoryId: catSolar._id,
        category: 'Tấm Pin Năng Lượng Mặt Trời',
        code: 'JK-550W',
        description: 'Tấm pin Jinko Solar hiệu suất cao...',
        shortDescription: 'Hiệu suất 21.3%',
        price: '2.500.000',
        contactPrice: false,
        image: 'https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&q=80',
        stockStatus: 'in_stock'
      },
      {
        name: 'Biến tần Huawei 10kW',
        categoryId: catInverter._id,
        category: 'Biến Tần (Inverter)',
        code: 'HW-10K',
        description: 'Biến tần Huawei hòa lưới...',
        shortDescription: 'Hòa lưới 3 pha',
        price: '25.000.000',
        contactPrice: false,
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80',
        stockStatus: 'in_stock'
      }
    ]);

    console.log('Inserting Projects...');
    const pCatResidential = await ProjectCategory.create({ name: 'Điện Mặt Trời Áp Mái (Hộ Gia Đình)', slug: 'ap-mai-ho-gia-dinh', status: 'active', order: 1 });
    const pCatIndustrial = await ProjectCategory.create({ name: 'Điện Mặt Trời Công Nghiệp', slug: 'cong-nghiep', status: 'active', order: 2 });

    await Project.insertMany([
      {
        title: 'Dự án 5kWp tại Thủ Đức',
        categoryId: pCatResidential._id,
        category: 'Điện Mặt Trời Áp Mái (Hộ Gia Đình)',
        location: 'TP. Thủ Đức, HCM',
        capacity: '5kWp',
        completionDate: '2023-12-01',
        description: 'Lắp đặt 10 tấm pin 500W...',
        image: 'https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&q=80',
        featured: true
      },
      {
        title: 'Nhà máy dệt may 1MWp',
        categoryId: pCatIndustrial._id,
        category: 'Điện Mặt Trời Công Nghiệp',
        location: 'KCN Sóng Thần, Bình Dương',
        capacity: '1MWp',
        completionDate: '2023-10-15',
        description: 'Dự án áp mái nhà xưởng dệt may...',
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80',
        featured: true
      }
    ]);

    console.log('Inserting News...');
    const nCatTech = await NewsCategory.create({ name: 'Công Nghệ Điện Mặt Trời', slug: 'cong-nghe', status: 'active' });

    await News.insertMany([
      {
        title: 'Xu hướng điện mặt trời năm 2024',
        categoryId: nCatTech._id,
        category: 'Công Nghệ Điện Mặt Trời',
        slug: 'xu-huong-dien-mat-troi-2024',
        excerpt: 'Điện mặt trời lưu trữ đang trở thành xu hướng mới...',
        content: '<p>Chi tiết về xu hướng điện mặt trời năm 2024...</p>',
        image: 'https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&q=80',
        author: admin._id,
        date: new Date().toISOString(),
        featured: true,
        status: 'published'
      }
    ]);

    console.log('Inserting Team, Testimonials, Partners...');
    await TeamMember.insertMany([
      { name: 'Nguyễn Văn A', role: 'Giám đốc Điều hành', bio: 'Hơn 15 năm kinh nghiệm', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80', email: 'a@ctcdn.vn', phone: '0901234567', order: 1 },
      { name: 'Trần Thị B', role: 'Kỹ sư trưởng', bio: 'Chuyên gia thiết kế hệ thống', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80', email: 'b@ctcdn.vn', phone: '0909876543', order: 2 }
    ]);

    await Testimonial.insertMany([
      { name: 'Anh Hùng', role: 'Chủ hộ gia đình', content: 'Hệ thống điện mặt trời giúp gia đình tôi tiết kiệm 2 triệu tiền điện mỗi tháng. Rất cảm ơn đội ngũ!', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80', rating: 5 },
      { name: 'Chị Mai', role: 'Giám đốc Công ty TNHH', content: 'Thi công chuyên nghiệp, đúng tiến độ. Hệ thống chạy rất ổn định.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80', rating: 5 }
    ]);

    await Partner.insertMany([
      { name: 'Jinko Solar', logo: 'https://via.placeholder.com/150x80?text=Jinko', website: 'https://jinkosolar.com', tier: 'gold', type: 'supplier', status: 'active' },
      { name: 'Huawei', logo: 'https://via.placeholder.com/150x80?text=Huawei', website: 'https://huawei.com', tier: 'platinum', type: 'supplier', status: 'active' }
    ]);

    console.log('Inserting Document Categories...');
    const docCatCatalogue = await DocumentCategory.create({
      name: 'Catalogue',
      description: 'Danh mục sản phẩm',
      isActive: true
    });
    const docCatManual = await DocumentCategory.create({
      name: 'Hướng dẫn sử dụng',
      description: 'Tài liệu hướng dẫn',
      isActive: true
    });
    const docCatPolicy = await DocumentCategory.create({
      name: 'Chính sách bảo hành',
      description: 'Quy định bảo hành',
      isActive: true
    });

    console.log('Inserting Resources (Documents)...');
    await Resource.insertMany([
      {
        title: 'Catalogue Tấm Pin Jinko Solar 2024',
        description: 'Tài liệu thông số kỹ thuật chi tiết của các dòng pin Jinko Solar mới nhất.',
        fileUrl: '/uploads/documents/jinko-catalog-2024.pdf',
        type: 'catalogue',
        categoryId: docCatCatalogue._id,
        size: '4.2MB',
        isActive: true
      },
      {
        title: 'Hướng dẫn lắp đặt Biến tần Huawei',
        description: 'Quy trình và sơ đồ đấu nối chi tiết cho biến tần Huawei hòa lưới 3 pha.',
        fileUrl: '/uploads/documents/huawei-inverter-manual.pdf',
        type: 'manual',
        categoryId: docCatManual._id,
        size: '2.8MB',
        isActive: true
      },
      {
        title: 'Chính sách bảo hành pin năng lượng mặt trời CTC',
        description: 'Quy định và thủ tục bảo hành hiệu suất vật lý và hiệu suất phát điện của pin CTC.',
        fileUrl: '/uploads/documents/warranty-policy-ctc.pdf',
        type: 'policy',
        categoryId: docCatPolicy._id,
        size: '1.5MB',
        isActive: true
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
