/**
 * Permission Management API Routes
 * API để quản lý quyền và vai trò
 */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { requirePermission, requireRoleLevel, clearUserPermissionCache } from '../middleware/permission';

// Simple admin check middleware (temporary)
const requireAuth = (req: any, res: any, next: any) => {
  // For now, allow all requests - implement proper JWT auth later
  req.user = req.user || { 
    id: '691bd7fe159644a4936efee7',
    email: 'admin@ctcdn.vn', 
    role: 'super_admin',
    name: 'Super Admin'
  };
  next();
};

// Import models để đảm bảo schemas được đăng ký
import '../../models/permissions';

const router = Router();

// Helper functions để tránh lỗi TypeScript với Mongoose
const getPermission = () => mongoose.model('Permission');
const getRole = () => mongoose.model('Role');
const getUserPermission = () => mongoose.model('UserPermission');
const getPermissionLog = () => mongoose.model('PermissionLog');

// ============================================
// PERMISSION ROUTES
// ============================================

// GET all permissions
router.get('/permissions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { category, isActive = true } = req.query;
    const query: any = {};
    
    if (category && category !== 'all') query.category = category;
    if (isActive !== 'all') query.isActive = isActive === 'true';

    const permissions = await getPermission()
      .find(query)
      .sort({ category: 1, resource: 1, action: 1 })
      .lean();

    res.json({
      success: true,
      data: permissions,
      total: permissions.length
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách quyền'
    });
  }
});

// POST create permission
router.post('/permissions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, resource, action, description, category } = req.body;

    if (!name || !resource || !action || !category) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    const permission = new (getPermission())({
      name,
      resource,
      action,
      description,
      category
    });

    await permission.save();

    res.status(201).json({
      success: true,
      data: permission,
      message: 'Tạo quyền thành công'
    });
  } catch (error: any) {
    console.error('Error creating permission:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Quyền này đã tồn tại'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo quyền'
    });
  }
});

// PUT update permission
router.put('/permissions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const permission = await getPermission().findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quyền'
      });
    }

    res.json({
      success: true,
      data: permission,
      message: 'Cập nhật quyền thành công'
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật quyền'
    });
  }
});

// DELETE permission
router.delete('/permissions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const permission = await getPermission().findByIdAndDelete(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quyền'
      });
    }

    res.json({
      success: true,
      message: 'Xóa quyền thành công'
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa quyền'
    });
  }
});

// ============================================
// ROLE ROUTES
// ============================================

// GET all roles
router.get('/roles', requireAuth, async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;
    const query: any = {};
    
    // Only filter by isActive if explicitly specified
    if (isActive === 'true') query.isActive = true;
    else if (isActive === 'false') query.isActive = false;
    // If isActive is 'all' or not provided, don't filter

    const roles = await getRole()
      .find(query)
      .populate('permissions')
      .sort({ level: -1 })
      .lean();

    res.json({
      success: true,
      data: roles,
      total: roles.length
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách vai trò'
    });
  }
});

// POST create role
router.post('/roles', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, displayName, description, permissions, level, color, icon } = req.body;

    if (!name || !displayName || !level) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    const role = new (getRole())({
      name: name.toLowerCase(),
      displayName,
      description,
      permissions: permissions || [],
      level,
      color: color || '#6B7280',
      icon: icon || 'User'
    });

    await role.save();

    res.status(201).json({
      success: true,
      data: role,
      message: 'Tạo vai trò thành công'
    });
  } catch (error: any) {
    console.error('Error creating role:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò này đã tồn tại'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo vai trò'
    });
  }
});

// PUT update role
router.put('/roles/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const role = await getRole().findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('permissions');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò'
      });
    }

    // Clear cache for users with this role
    const usersWithRole = await getUserPermission().find({ roleId: id }).select('userId');
    usersWithRole.forEach((userPerm: any) => {
      clearUserPermissionCache(userPerm.userId.toString());
    });

    res.json({
      success: true,
      data: role,
      message: 'Cập nhật vai trò thành công'
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật vai trò'
    });
  }
});

// DELETE role
router.delete('/roles/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if role is in use
    const usersWithRole = await getUserPermission().countDocuments({ roleId: id, isActive: true });
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa vai trò đang được sử dụng bởi ${usersWithRole} người dùng`
      });
    }

    const role = await getRole().findByIdAndDelete(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò'
      });
    }

    res.json({
      success: true,
      message: 'Xóa vai trò thành công'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa vai trò'
    });
  }
});

// ============================================
// USER PERMISSION ROUTES
// ============================================

// GET all user permissions (for admin list)
router.get('/user-permissions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { roleId, isActive = true } = req.query;
    const query: any = {};
    
    if (roleId) query.roleId = roleId;
    if (isActive !== 'all') query.isActive = isActive === 'true';

    const userPermissions = await getUserPermission()
      .find(query)
      .populate('userId', 'name email avatar role')
      .populate('roleId', 'name displayName color icon level')
      .populate('additionalPermissions', 'name description')
      .populate('deniedPermissions', 'name description')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: userPermissions
    });
  } catch (error) {
    console.error('Error fetching all user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách phân quyền'
    });
  }
});

// GET user permissions for specific user
router.get('/users/:userId/permissions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userPermission = await getUserPermission()
      .findOne({ userId, isActive: true })
      .populate({
        path: 'roleId',
        populate: {
          path: 'permissions'  // Nested populate to get permissions inside role
        }
      })
      .populate('additionalPermissions')
      .populate('deniedPermissions')
      .populate('assignedBy', 'name email');

    if (!userPermission) {
      // No RBAC assigned - get default Viewer role for fallback
      const viewerRole = await getRole().findOne({ name: 'viewer' }).populate('permissions');
      if (viewerRole) {
        // Return a default permission object with Viewer role
        return res.json({
          success: true,
          data: {
            _id: null,
            userId: userId,
            roleId: viewerRole,
            additionalPermissions: [],
            deniedPermissions: [],
            isActive: true,
            isDefault: true // Flag to indicate this is a default assignment
          },
          message: 'Người dùng chưa được phân quyền - sử dụng quyền Viewer mặc định'
        });
      }
      
      return res.json({
        success: true,
        data: null,
        message: 'Không tìm thấy phân quyền cho người dùng'
      });
    }

    res.json({
      success: true,
      data: userPermission
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải phân quyền người dùng'
    });
  }
});

// POST assign role to user
router.post('/users/:userId/role', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { roleId, notes } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID vai trò'
      });
    }

    // Check if role exists
    const role = await getRole().findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò'
      });
    }

    // Deactivate existing permissions
    await getUserPermission().updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Create new permission assignment
    const userPermission = new (getUserPermission())({
      userId,
      roleId,
      assignedBy: req.user?.id,
      notes
    });

    await userPermission.save();

    // Clear user permission cache
    clearUserPermissionCache(userId);

    res.json({
      success: true,
      data: userPermission,
      message: 'Phân quyền thành công'
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phân quyền'
    });
  }
});

// POST add additional permission to user
router.post('/users/:userId/permissions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { permissionIds } = req.body;

    if (!permissionIds || !Array.isArray(permissionIds)) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu danh sách quyền'
      });
    }

    const userPermission = await getUserPermission().findOne({ userId, isActive: true });
    if (!userPermission) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phân quyền cho người dùng'
      });
    }

    // Add permissions
    permissionIds.forEach(permId => {
      if (!userPermission.additionalPermissions.includes(permId)) {
        userPermission.additionalPermissions.push(permId);
      }
    });

    await userPermission.save();

    // Clear user permission cache
    clearUserPermissionCache(userId);

    res.json({
      success: true,
      message: 'Thêm quyền thành công'
    });
  } catch (error) {
    console.error('Error adding permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm quyền'
    });
  }
});

// GET permission logs
router.get('/logs', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, resource, result, limit = 50, page = 1 } = req.query;
    const query: any = {};

    if (userId) query.userId = userId;
    if (resource) query.resource = resource;
    if (result) query.result = result;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      getPermissionLog()
        .find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      getPermissionLog().countDocuments(query)
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching permission logs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải nhật ký phân quyền'
    });
  }
});

export default router;
