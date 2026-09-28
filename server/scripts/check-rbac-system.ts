/**
 * RBAC System Health Check
 * Kiểm tra tình trạng hệ thống phân quyền
 */

import mongoose from 'mongoose';
import { Permission, Role, UserPermission } from '../../models/permissions';
import { User } from '../../models';
import { logger } from "../../utils/logger";

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

async function checkRBACSystem() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.log('✅ Connected to MongoDB');

    // Check Permissions
    const permissions = await Permission.find({});
    logger.log(`\n📋 PERMISSIONS: ${permissions.length} total`);
    
    const permissionsByCategory = permissions.reduce((acc, perm) => {
      acc[perm.category] = (acc[perm.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(permissionsByCategory).forEach(([category, count]) => {
      logger.log(`   - ${category}: ${count} permissions`);
    });

    // Check Roles
    const roles = await Role.find({}).populate('permissions');
    logger.log(`\n👑 ROLES: ${roles.length} total`);
    
    roles.forEach(role => {
      logger.log(`   - ${role.displayName} (${role.name}) Level ${role.level}: ${role.permissions.length} permissions`);
    });

    // Check User Permissions
    const userPermissions = await UserPermission.find({})
      .populate('userId', 'name email')
      .populate('roleId', 'name displayName level');
    
    logger.log(`\n🔐 USER PERMISSIONS: ${userPermissions.length} assignments`);
    
    userPermissions.forEach(up => {
      const user = up.userId as any;
      const role = up.roleId as any;
      logger.log(`   - ${user?.name} (${user?.email}): ${role?.displayName} (Level ${role?.level})`);
      
      if (up.additionalPermissions.length > 0) {
        logger.log(`     + ${up.additionalPermissions.length} additional permissions`);
      }
      
      if (up.deniedPermissions.length > 0) {
        logger.log(`     - ${up.deniedPermissions.length} denied permissions`);
      }
    });

    // Check Users without RBAC assignments
    const allUsers = await User.find({}, 'name email role');
    const usersWithRBAC = userPermissions.map(up => (up.userId as any)._id.toString());
    const usersWithoutRBAC = allUsers.filter(user => !usersWithRBAC.includes(user._id.toString()));

    if (usersWithoutRBAC.length > 0) {
      logger.log(`\n⚠️  USERS WITHOUT RBAC: ${usersWithoutRBAC.length}`);
      usersWithoutRBAC.forEach(user => {
        logger.log(`   - ${user.name} (${user.email}) - Legacy role: ${user.role}`);
      });
    }

    // System Health Summary
    logger.log(`\n🏥 SYSTEM HEALTH SUMMARY:`);
    logger.log(`   ✅ Permissions: ${permissions.length} defined`);
    logger.log(`   ✅ Roles: ${roles.length} configured`);
    logger.log(`   ✅ User assignments: ${userPermissions.length} active`);
    logger.log(`   ${usersWithoutRBAC.length > 0 ? '⚠️' : '✅'} Users without RBAC: ${usersWithoutRBAC.length}`);

    // API Endpoints Test
    logger.log(`\n🔗 API ENDPOINTS TO TEST:`);
    logger.log(`   GET  http://localhost:4000/api/permissions/permissions`);
    logger.log(`   GET  http://localhost:4000/api/permissions/roles`);
    logger.log(`   GET  http://localhost:4000/api/permissions/user-permissions`);
    logger.log(`   POST http://localhost:4000/api/permissions/users/{userId}/role`);

    // Frontend URLs
    logger.log(`\n🌐 FRONTEND URLS TO TEST:`);
    logger.log(`   Dashboard:     http://localhost:3001/admin/#/admin`);
    logger.log(`   Users:         http://localhost:3001/admin/#/admin/users`);
    logger.log(`   Content:       http://localhost:3001/admin/#/admin/content`);
    logger.log(`   Settings:      http://localhost:3001/admin/#/admin/settings`);
    logger.log(`   Security:      http://localhost:3001/admin/#/admin/security`);

    // Test Credentials
    logger.log(`\n🔑 TEST CREDENTIALS:`);
    logger.log(`   Super Admin:   superadmin@test.com / Test123!`);
    logger.log(`   Admin:         admin@test.com / Test123!`);
    logger.log(`   Editor:        editor@test.com / Test123!`);
    logger.log(`   Author:        author@test.com / Test123!`);
    logger.log(`   Moderator:     moderator@test.com / Test123!`);
    logger.log(`   Viewer:        viewer@test.com / Test123!`);

  } catch (error) {
    logger.error('❌ Error checking RBAC system:', error);
  } finally {
    await mongoose.disconnect();
    logger.log('\n👋 Disconnected from MongoDB');
  }
}

checkRBACSystem();
