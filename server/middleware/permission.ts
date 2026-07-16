/**
 * Permission Middleware
 * Middleware để kiểm tra quyền truy cập
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { PermissionLog } from '../../models/permissions';

// Import models để đảm bảo schemas được đăng ký
import '../../models/permissions';

// Helper functions để tránh lỗi TypeScript với Mongoose
const getPermission = () => mongoose.model('Permission');
const getRole = () => mongoose.model('Role');
const getUserPermission = () => mongoose.model('UserPermission');
const getPermissionLog = () => mongoose.model('PermissionLog');

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions?: string[];
        name?: string;
        avatar?: string;
      };
    }
  }
}

// Cache for user permissions
const permissionCache = new Map<string, { permissions: Set<string>; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load user permissions from database
 */
async function loadUserPermissions(userId: string): Promise<Set<string>> {
  try {
    // Check cache first
    const cached = permissionCache.get(userId);
    if (cached && Date.now() < cached.expiry) {
      return cached.permissions;
    }

    // Get user's role and permissions
    const userPermission = await getUserPermission()
      .findOne({ userId, isActive: true })
      .populate('roleId')
      .populate('additionalPermissions')
      .populate('deniedPermissions');

    if (!userPermission) {
      return new Set();
    }

    const permissions = new Set<string>();

    // Add role permissions
    if (userPermission.roleId?.permissions) {
      const rolePermissions = await getPermission()
        .find({ _id: { $in: userPermission.roleId.permissions }, isActive: true })
        .select('name');
      
      rolePermissions.forEach((perm: any) => permissions.add(perm.name));
    }

    // Add additional permissions
    if (userPermission.additionalPermissions) {
      userPermission.additionalPermissions.forEach((perm: any) => {
        if (perm.isActive) permissions.add(perm.name);
      });
    }

    // Remove denied permissions
    if (userPermission.deniedPermissions) {
      userPermission.deniedPermissions.forEach((perm: any) => {
        permissions.delete(perm.name);
      });
    }

    // Cache the result
    permissionCache.set(userId, {
      permissions,
      expiry: Date.now() + CACHE_DURATION
    });

    return permissions;
  } catch (error) {
    console.error('Error loading user permissions:', error);
    return new Set();
  }
}

/**
 * Log permission check
 */
async function logPermissionCheck(
  userId: string,
  action: string,
  resource: string,
  permission: string,
  result: 'granted' | 'denied',
  req: Request,
  reason?: string
) {
  try {
    await getPermissionLog().create({
      userId,
      action,
      resource,
      permission,
      result,
      reason,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    console.error('Error logging permission check:', error);
  }
}

/**
 * Check if user has permission
 */
export async function hasPermission(
  userId: string,
  permission: string,
  req: Request
): Promise<boolean> {
  try {
    const userPermissions = await loadUserPermissions(userId);
    const hasAccess = userPermissions.has(permission);

    // Log the permission check
    await logPermissionCheck(
      userId,
      req.method,
      req.path,
      permission,
      hasAccess ? 'granted' : 'denied',
      req,
      hasAccess ? undefined : 'Permission not found in user permissions'
    );

    return hasAccess;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Middleware to require specific permission
 */
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - No user found'
        });
      }

      const hasAccess = await hasPermission(req.user.id, permission, req);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden - Insufficient permissions',
          required: permission
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}

/**
 * Middleware to require any of the specified permissions
 */
export function requireAnyPermission(permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - No user found'
        });
      }

      for (const permission of permissions) {
        const hasAccess = await hasPermission(req.user.id, permission, req);
        if (hasAccess) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: 'Forbidden - Insufficient permissions',
        required: permissions
      });
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}

/**
 * Middleware to require role level
 */
export function requireRoleLevel(minLevel: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - No user found'
        });
      }

      const userPermission = await getUserPermission()
        .findOne({ userId: req.user.id, isActive: true })
        .populate('roleId');

      if (!userPermission || !userPermission.roleId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden - No role assigned'
        });
      }

      if (userPermission.roleId.level < minLevel) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden - Insufficient role level',
          required: minLevel,
          current: userPermission.roleId.level
        });
      }

      next();
    } catch (error) {
      console.error('Role level middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}

/**
 * Clear permission cache for user
 */
export function clearUserPermissionCache(userId: string) {
  permissionCache.delete(userId);
}

/**
 * Clear all permission cache
 */
export function clearAllPermissionCache() {
  permissionCache.clear();
}

/**
 * Get user permissions (for API response)
 */
export async function getUserPermissions(userId: string, req: Request): Promise<string[]> {
  const permissions = await loadUserPermissions(userId);
  return Array.from(permissions);
}
