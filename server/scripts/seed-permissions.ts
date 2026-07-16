/**
 * Seed Permissions & Roles
 * Tạo dữ liệu mẫu cho hệ thống phân quyền
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

// Import models từ file chính để đảm bảo schema nhất quán
import { Permission, Role, UserPermission } from '../../models/permissions';
import { User } from '../../models';

// Type aliases để tránh lỗi TypeScript
const PermissionModel = Permission as mongoose.Model<any>;
const RoleModel = Role as mongoose.Model<any>;
const UserPermissionModel = UserPermission as mongoose.Model<any>;
const UserModel = User as mongoose.Model<any>;

async function seedPermissions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await PermissionModel.deleteMany({});
    await RoleModel.deleteMany({});
    await UserPermissionModel.deleteMany({});
    console.log('🗑️ Cleared existing permission data');

    // ============================================
    // CREATE PERMISSIONS
    // ============================================
    const permissions = [
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

      // Commerce (if applicable)
      { name: 'view_orders', resource: 'orders', action: 'view', description: 'Xem đơn hàng', category: 'commerce', isActive: true },
      { name: 'manage_orders', resource: 'orders', action: 'manage', description: 'Quản lý đơn hàng', category: 'commerce', isActive: true },
      { name: 'view_customers', resource: 'customers', action: 'view', description: 'Xem khách hàng', category: 'commerce', isActive: true },
      { name: 'manage_customers', resource: 'customers', action: 'manage', description: 'Quản lý khách hàng', category: 'commerce', isActive: true },
    ];

    const createdPermissions = await PermissionModel.insertMany(permissions);
    console.log(`✅ Created ${createdPermissions.length} permissions`);

    // Create permission map for easy lookup
    const permissionMap = new Map();
    createdPermissions.forEach(perm => {
      permissionMap.set(perm.name, perm._id);
    });

    // ============================================
    // CREATE ROLES
    // ============================================
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Quyền cao nhất, có thể làm tất cả',
        level: 100,
        isSystem: true,
        isActive: true,
        color: '#DC2626',
        icon: 'Crown',
        permissions: Array.from(permissionMap.values()) // All permissions
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
          // Content management
          'view_content', 'create_content', 'edit_content', 'delete_content', 'publish_content',
          'view_products', 'create_products', 'edit_products', 'delete_products', 'manage_product_categories',
          'view_news', 'create_news', 'edit_news', 'delete_news', 'manage_news_categories',
          'view_projects', 'create_projects', 'edit_projects', 'delete_projects', 'manage_project_categories',
          // User management
          'view_users', 'create_users', 'edit_users', 'delete_users',
          'view_roles', 'view_permissions', 'view_user_permissions',
          // System
          'view_system_settings', 'manage_system_settings', 'manage_file_uploads',
          // Security
          'view_security_logs', 'view_audit_logs', 'manage_ip_blacklist',
          // Analytics
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
          // Content management
          'view_content', 'create_content', 'edit_content', 'publish_content',
          'view_products', 'create_products', 'edit_products',
          'view_news', 'create_news', 'edit_news',
          'view_projects', 'create_projects', 'edit_projects',
          // File management
          'manage_file_uploads',
          // Basic analytics
          'view_analytics', 'view_reports',
        ].map(name => permissionMap.get(name)).filter(Boolean)
      },
      {
        name: 'author',
        displayName: 'Author',
        description: 'Tác giả, có thể tạo nội dung nhưng cần duyệt',
        level: 30,
        isSystem: true,
        isActive: true,
        color: '#2563EB',
        icon: 'PenTool',
        permissions: [
          // Content creation only
          'view_content', 'create_content', 'edit_content',
          'view_products', 'create_products',
          'view_news', 'create_news',
          'view_projects', 'create_projects',
          // File uploads
          'manage_file_uploads',
        ].map(name => permissionMap.get(name)).filter(Boolean)
      },
      {
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Người xem, chỉ có thể xem nội dung',
        level: 10,
        isSystem: true,
        isActive: true,
        color: '#6B7280',
        icon: 'Eye',
        permissions: [
          // View only
          'view_content',
          'view_products',
          'view_news',
          'view_projects',
        ].map(name => permissionMap.get(name)).filter(Boolean)
      },
      {
        name: 'moderator',
        displayName: 'Moderator',
        description: 'Điều hành viên, quản lý nội dung và người dùng cơ bản',
        level: 40,
        isSystem: false,
        isActive: true,
        color: '#F59E0B',
        icon: 'Shield',
        permissions: [
          // Content management
          'view_content', 'edit_content', 'delete_content', 'publish_content',
          'view_products', 'edit_products', 'delete_products',
          'view_news', 'edit_news', 'delete_news',
          'view_projects', 'edit_projects', 'delete_projects',
          // User viewing
          'view_users',
          // Basic security
          'view_security_logs', 'view_audit_logs',
        ].map(name => permissionMap.get(name)).filter(Boolean)
      }
    ];

    const createdRoles = await RoleModel.insertMany(roles);
    console.log(`✅ Created ${createdRoles.length} roles`);

    // ============================================
    // ASSIGN ROLES TO EXISTING USERS
    // ============================================
    const users = await UserModel.find({});
    console.log(`Found ${users.length} existing users`);

    for (const user of users) {
      let roleToAssign;
      
      // Assign roles based on existing user role
      switch (user.role) {
        case 'admin':
          roleToAssign = createdRoles.find(r => r.name === 'super_admin');
          break;
        case 'editor':
          roleToAssign = createdRoles.find(r => r.name === 'editor');
          break;
        case 'viewer':
        default:
          roleToAssign = createdRoles.find(r => r.name === 'viewer');
          break;
      }

      if (roleToAssign) {
        const userPermission = new UserPermissionModel({
          userId: user._id,
          roleId: roleToAssign._id,
          assignedBy: user._id, // Self-assigned for initial setup
          notes: 'Tự động phân quyền khi khởi tạo hệ thống'
        });

        await userPermission.save();
        console.log(`✅ Assigned role ${roleToAssign.displayName} to user ${user.email}`);
      }
    }

    console.log('\n🎉 Permission system seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Permissions: ${createdPermissions.length}`);
    console.log(`   - Roles: ${createdRoles.length}`);
    console.log(`   - User assignments: ${users.length}`);
    console.log('\n📋 Created Roles:');
    createdRoles.forEach(role => {
      console.log(`   - ${role.displayName} (Level ${role.level}): ${role.permissions.length} permissions`);
    });

  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedPermissions();
