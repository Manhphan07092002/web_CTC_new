/**
 * User Permission Management Component
 * Quản lý phân quyền người dùng chi tiết
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Eye,
  Search,
  Filter,
  Plus,
  Minus,
  Clock,
  AlertTriangle,
  Check,
  X,
  Crown,
  Settings,
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCw,
} from 'lucide-react';

// Types
interface User {
  _id: string;
  id?: string; // Some APIs return id instead of _id
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
}

// Helper to get user ID
const getUserId = (user: User) => user._id || user.id || '';

interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  category: string;
}

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
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
  assignedBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedAt: string;
  notes?: string;
}

const UserPermissionManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<string, UserPermission>>({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modal state
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [additionalPermissions, setAdditionalPermissions] = useState<Set<string>>(new Set());
  const [deniedPermissions, setDeniedPermissions] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch data
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      // API returns array directly, not {success, data}
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/permissions/roles');
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions/permissions');
      const data = await response.json();
      if (data.success) {
        setPermissions(data.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const response = await fetch('/api/permissions/user-permissions');
      const data = await response.json();
      if (data.success) {
        // Convert array to map by userId
        const userPermsMap: Record<string, UserPermission> = {};
        data.data.forEach((perm: any) => {
          // Handle both populated object and string userId
          const userId = perm.userId?._id || perm.userId?.id || perm.userId;
          if (userId && typeof userId === 'string') {
            userPermsMap[userId] = perm;
          }
        });
        setUserPermissions(userPermsMap);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRoles(), fetchPermissions(), fetchUserPermissions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle assign role
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      const response = await fetch(`/api/permissions/users/${getUserId(selectedUser)}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: selectedRole,
          notes,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchUserPermissions();
        handleCloseModal();
        showNotification('success', 'Phân quyền thành công!');
      } else {
        showNotification('error', data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      showNotification('error', 'Lỗi khi phân quyền');
    }
  };

  // Handle add additional permissions
  const handleAddPermissions = async () => {
    if (!selectedUser || additionalPermissions.size === 0) return;

    try {
      const response = await fetch(`/api/permissions/users/${getUserId(selectedUser)}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissionIds: Array.from(additionalPermissions),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchUserPermissions();
        setAdditionalPermissions(new Set());
        showNotification('success', 'Thêm quyền thành công!');
      } else {
        showNotification('error', data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error adding permissions:', error);
      showNotification('error', 'Lỗi khi thêm quyền');
    }
  };

  // Handle edit user permissions
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    const userPerm = userPermissions[getUserId(user)];
    
    if (userPerm) {
      setSelectedRole(userPerm.roleId?._id || '');
      setAdditionalPermissions(new Set(userPerm.additionalPermissions?.map((p: any) => p._id) || []));
      setDeniedPermissions(new Set(userPerm.deniedPermissions?.map((p: any) => p._id) || []));
      setNotes(userPerm.notes || '');
    } else {
      setSelectedRole('');
      setAdditionalPermissions(new Set());
      setDeniedPermissions(new Set());
      setNotes('');
    }
    
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setSelectedRole('');
    setAdditionalPermissions(new Set());
    setDeniedPermissions(new Set());
    setNotes('');
    setExpandedCategories(new Set());
  };

  // Simple notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    alert(message);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    if (roleFilter !== 'all') {
      const userPerm = userPermissions[getUserId(user)];
      // Handle both populated object and string ID cases
      const roleName = userPerm?.roleId?.name || userPerm?.roleId;
      if (!roleName || roleName !== roleFilter) return false;
    }
    
    return true;
  });

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) acc[permission.category] = [];
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Get role icon
  const getRoleIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Crown: <Crown className="w-4 h-4" />,
      Shield: <Shield className="w-4 h-4" />,
      Edit: <Edit className="w-4 h-4" />,
      Eye: <Eye className="w-4 h-4" />,
      Users: <Users className="w-4 h-4" />,
      Settings: <Settings className="w-4 h-4" />,
    };
    return icons[iconName] || <Users className="w-4 h-4" />;
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân quyền Người dùng</h1>
          <p className="text-gray-600">Quản lý vai trò và quyền truy cập của từng người dùng</p>
        </div>
        <button
          onClick={() => fetchUserPermissions()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Tất cả vai trò</option>
            {roles.map(role => (
              <option key={role._id} value={role.name}>
                {role.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quyền bổ sung</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phân quyền bởi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày phân quyền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const userPerm = userPermissions[getUserId(user)];
                return (
                  <tr key={getUserId(user)} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {userPerm?.roleId ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="p-1 rounded"
                            style={{ backgroundColor: (userPerm.roleId.color || '#6B7280') + '20', color: userPerm.roleId.color || '#6B7280' }}
                          >
                            {getRoleIcon(userPerm.roleId.icon || 'User')}
                          </div>
                          <span className="font-medium">{userPerm.roleId.displayName || 'Unknown'}</span>
                          <span className="text-xs text-gray-500">
                            (Level {userPerm.roleId.level || 0})
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Chưa phân quyền</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {userPerm ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600">
                            +{userPerm.additionalPermissions?.length || 0}
                          </span>
                          {(userPerm.deniedPermissions?.length || 0) > 0 && (
                            <span className="text-sm text-red-600">
                              -{userPerm.deniedPermissions.length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {userPerm?.assignedBy ? (
                        <div className="text-sm">
                          <div className="text-gray-900">{userPerm.assignedBy.name || 'N/A'}</div>
                          <div className="text-gray-500">{userPerm.assignedBy.email || ''}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {userPerm ? (
                        <div className="text-sm text-gray-500">
                          {new Date(userPerm.assignedAt).toLocaleDateString('vi-VN')}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-3 h-3" />
                        Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy người dùng nào phù hợp
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                Phân quyền cho {selectedUser.name}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò chính *
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Chọn vai trò...</option>
                    {roles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.displayName} (Level {role.level})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Permissions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quyền bổ sung</h3>
                  <div className="space-y-2">
                    {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                      <div key={category} className="border rounded-lg">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                        >
                          <span className="font-medium capitalize">{category}</span>
                          {expandedCategories.has(category) ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          }
                        </button>
                        
                        {expandedCategories.has(category) && (
                          <div className="p-3 border-t bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(categoryPermissions as Permission[]).map((permission) => (
                                <label key={permission._id} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={additionalPermissions.has(permission._id)}
                                    onChange={(e) => {
                                      const newSelected = new Set(additionalPermissions);
                                      if (e.target.checked) {
                                        newSelected.add(permission._id);
                                        // Remove from denied if adding
                                        const newDenied = new Set(deniedPermissions);
                                        newDenied.delete(permission._id);
                                        setDeniedPermissions(newDenied);
                                      } else {
                                        newSelected.delete(permission._id);
                                      }
                                      setAdditionalPermissions(newSelected);
                                    }}
                                    className="rounded"
                                  />
                                  <span className="text-gray-700">
                                    {permission.description || permission.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Ghi chú về việc phân quyền..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAssignRole}
                  disabled={!selectedRole}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Lưu phân quyền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPermissionManagement;
