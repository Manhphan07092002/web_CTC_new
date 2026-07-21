/**
 * RBAC System Health Check
 * Kiểm tra tình trạng hệ thống phân quyền
 */

import mongoose from 'mongoose';
import { Permission, Role, UserPermission } from '../../models/permissions';
import { User } from '../../models';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

async function checkRBACSystem() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check Permissions
    const permissions = await Permission.find({});
    console.log(`\n📋 PERMISSIONS: ${permissions.length} total`);
    
    const permissionsByCategory = permissions.reduce((acc, perm) => {
      acc[perm.category] = (acc[perm.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(permissionsByCategory).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} permissions`);
    });

    // Check Roles
    const roles = await Role.find({}).populate('permissions');
    console.log(`\n👑 ROLES: ${roles.length} total`);
    
    roles.forEach(role => {
      console.log(`   - ${role.displayName} (${role.name}) Level ${role.level}: ${role.permissions.length} permissions`);
    });

    // Check User Permissions
    const userPermissions = await UserPermission.find({})
      .populate('userId', 'name email')
      .populate('roleId', 'name displayName level');
    
    console.log(`\n🔐 USER PERMISSIONS: ${userPermissions.length} assignments`);
    
    userPermissions.forEach(up => {
      const user = up.userId as any;
      const role = up.roleId as any;
      console.log(`   - ${user?.name} (${user?.email}): ${role?.displayName} (Level ${role?.level})`);
      
      if (up.additionalPermissions.length > 0) {
        console.log(`     + ${up.additionalPermissions.length} additional permissions`);
      }
      
      if (up.deniedPermissions.length > 0) {
        console.log(`     - ${up.deniedPermissions.length} denied permissions`);
      }
    });

    // Check Users without RBAC assignments
    const allUsers = await User.find({}, 'name email role');
    const usersWithRBAC = userPermissions.map(up => (up.userId as any)._id.toString());
    const usersWithoutRBAC = allUsers.filter(user => !usersWithRBAC.includes(user._id.toString()));

    if (usersWithoutRBAC.length > 0) {
      console.log(`\n⚠️  USERS WITHOUT RBAC: ${usersWithoutRBAC.length}`);
      usersWithoutRBAC.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Legacy role: ${user.role}`);
      });
    }

    // System Health Summary
    console.log(`\n🏥 SYSTEM HEALTH SUMMARY:`);
    console.log(`   ✅ Permissions: ${permissions.length} defined`);
    console.log(`   ✅ Roles: ${roles.length} configured`);
    console.log(`   ✅ User assignments: ${userPermissions.length} active`);
    console.log(`   ${usersWithoutRBAC.length > 0 ? '⚠️' : '✅'} Users without RBAC: ${usersWithoutRBAC.length}`);

    // API Endpoints Test
    console.log(`\n🔗 API ENDPOINTS TO TEST:`);
    console.log(`   GET  http://localhost:4000/api/permissions/permissions`);
    console.log(`   GET  http://localhost:4000/api/permissions/roles`);
    console.log(`   GET  http://localhost:4000/api/permissions/user-permissions`);
    console.log(`   POST http://localhost:4000/api/permissions/users/{userId}/role`);

    // Frontend URLs
    console.log(`\n🌐 FRONTEND URLS TO TEST:`);
    console.log(`   Dashboard:     http://localhost:3001/admin/#/admin`);
    console.log(`   Users:         http://localhost:3001/admin/#/admin/users`);
    console.log(`   Content:       http://localhost:3001/admin/#/admin/content`);
    console.log(`   Settings:      http://localhost:3001/admin/#/admin/settings`);
    console.log(`   Security:      http://localhost:3001/admin/#/admin/security`);

    // Test Credentials
    console.log(`\n🔑 TEST CREDENTIALS:`);
    console.log(`   Super Admin:   superadmin@test.com / Test123!`);
    console.log(`   Admin:         admin@test.com / Test123!`);
    console.log(`   Editor:        editor@test.com / Test123!`);
    console.log(`   Author:        author@test.com / Test123!`);
    console.log(`   Moderator:     moderator@test.com / Test123!`);
    console.log(`   Viewer:        viewer@test.com / Test123!`);

  } catch (error) {
    console.error('❌ Error checking RBAC system:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

checkRBACSystem();
