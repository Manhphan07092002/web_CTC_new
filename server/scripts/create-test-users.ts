/**
 * Create Test Users Script
 * Tạo users test với các role khác nhau để test phân quyền
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../../models';
import { Permission, Role, UserPermission } from '../../models/permissions';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

async function createTestUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all roles
    const roles = await Role.find({});
    console.log(`Found ${roles.length} roles`);

    // Test users data
    const testUsers = [
      {
        name: 'Super Admin Test',
        email: 'superadmin@test.com',
        password: 'Test123!',
        role: 'admin',
        targetRole: 'super_admin'
      },
      {
        name: 'Admin Test',
        email: 'admin@test.com', 
        password: 'Test123!',
        role: 'admin',
        targetRole: 'admin'
      },
      {
        name: 'Editor Test',
        email: 'editor@test.com',
        password: 'Test123!', 
        role: 'editor',
        targetRole: 'editor'
      },
      {
        name: 'Author Test',
        email: 'author@test.com',
        password: 'Test123!',
        role: 'editor',
        targetRole: 'author'
      },
      {
        name: 'Moderator Test',
        email: 'moderator@test.com',
        password: 'Test123!',
        role: 'editor', 
        targetRole: 'moderator'
      },
      {
        name: 'Viewer Test',
        email: 'viewer@test.com',
        password: 'Test123!',
        role: 'viewer',
        targetRole: 'viewer'
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️ User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
      });

      console.log(`✅ Created user: ${userData.email}`);

      // Find target role
      const targetRole = roles.find(r => r.name === userData.targetRole);
      if (!targetRole) {
        console.log(`⚠️ Role ${userData.targetRole} not found for ${userData.email}`);
        continue;
      }

      // Create user permission
      await UserPermission.create({
        userId: user._id,
        roleId: targetRole._id,
        additionalPermissions: [],
        deniedPermissions: [],
        isActive: true,
        assignedBy: user._id, // Self-assigned for test
        assignedAt: new Date(),
        notes: `Test user created with ${targetRole.displayName} role`
      });

      console.log(`✅ Assigned role ${targetRole.displayName} to ${userData.email}`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login credentials:');
    testUsers.forEach(user => {
      console.log(`   ${user.targetRole.toUpperCase()}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

createTestUsers();
