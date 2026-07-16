/**
 * Permission Context
 * Quản lý quyền của user đang đăng nhập
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Types
interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  category: string;
}

interface Role {
  _id: string;
  name: string;
  displayName: string;
  level: number;
  color: string;
  icon: string;
  permissions: Permission[];
}

interface UserPermission {
  _id: string;
  userId: string;
  roleId: Role;
  additionalPermissions: Permission[];
  deniedPermissions: Permission[];
  isActive: boolean;
}

interface PermissionContextType {
  userPermission: UserPermission | null;
  permissions: string[];
  role: Role | null;
  roleLevel: number;
  loading: boolean;
  hasPermission: (permissionName: string) => boolean;
  hasAnyPermission: (permissionNames: string[]) => boolean;
  hasAllPermissions: (permissionNames: string[]) => boolean;
  hasMinRoleLevel: (minLevel: number) => boolean;
  canView: (resource: string) => boolean;
  canCreate: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  canManage: (resource: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userPermission, setUserPermission] = useState<UserPermission | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user permissions from API
  const fetchUserPermissions = async () => {
    if (!isAuthenticated || !user?.email) {
      setUserPermission(null);
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      // First get user by email
      const userResponse = await fetch(`/api/users/email/${encodeURIComponent(user.email)}`);
      const userData = await userResponse.json();
      
      if (!userData || !userData._id) {
        setLoading(false);
        return;
      }

      // Then get user permissions
      const permResponse = await fetch(`/api/permissions/users/${userData._id}/permissions`);
      const permData = await permResponse.json();

      if (permData.success && permData.data) {
        setUserPermission(permData.data);
        
        // Build permissions list
        const permList: string[] = [];
        
        // Add role permissions
        if (permData.data.roleId?.permissions) {
          permData.data.roleId.permissions.forEach((p: Permission) => {
            permList.push(p.name);
          });
        }
        
        // Add additional permissions
        if (permData.data.additionalPermissions) {
          permData.data.additionalPermissions.forEach((p: Permission) => {
            if (!permList.includes(p.name)) {
              permList.push(p.name);
            }
          });
        }
        
        // Remove denied permissions
        if (permData.data.deniedPermissions) {
          permData.data.deniedPermissions.forEach((p: Permission) => {
            const index = permList.indexOf(p.name);
            if (index > -1) {
              permList.splice(index, 1);
            }
          });
        }
        
        setPermissions(permList);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [isAuthenticated, user?.email]);

  // Permission check functions
  const hasPermission = (permissionName: string): boolean => {
    // Super admin has all permissions
    if (userPermission?.roleId?.name === 'super_admin') return true;
    return permissions.includes(permissionName);
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (userPermission?.roleId?.name === 'super_admin') return true;
    return permissionNames.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (userPermission?.roleId?.name === 'super_admin') return true;
    return permissionNames.every(p => permissions.includes(p));
  };

  const hasMinRoleLevel = (minLevel: number): boolean => {
    const currentLevel = userPermission?.roleId?.level || 0;
    return currentLevel >= minLevel;
  };

  // Resource-based permission checks
  const canView = (resource: string): boolean => {
    return hasPermission(`view_${resource}`);
  };

  const canCreate = (resource: string): boolean => {
    return hasPermission(`create_${resource}`);
  };

  const canEdit = (resource: string): boolean => {
    return hasPermission(`edit_${resource}`);
  };

  const canDelete = (resource: string): boolean => {
    return hasPermission(`delete_${resource}`);
  };

  const canManage = (resource: string): boolean => {
    return hasPermission(`manage_${resource}`);
  };

  const value: PermissionContextType = {
    userPermission,
    permissions,
    role: userPermission?.roleId || null,
    roleLevel: userPermission?.roleId?.level || 0,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasMinRoleLevel,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManage,
    refreshPermissions: fetchUserPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// Hook to use permissions
export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

// Permission Gate Component - renders children only if user has permission
interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  minRoleLevel?: number;
  fallback?: ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  minRoleLevel,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasMinRoleLevel, loading } = usePermission();

  if (loading) return null;

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  }

  if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions);
  }

  if (minRoleLevel !== undefined) {
    hasAccess = hasAccess && hasMinRoleLevel(minRoleLevel);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionContext;
