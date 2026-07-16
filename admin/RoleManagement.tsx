/**
 * Role Management Component
 * Quản lý vai trò và phân quyền
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Crown,
  Eye,
  PenTool,
  Settings,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Save,
  UserCheck,
} from 'lucide-react';

// Types
interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  category: string;
  isActive: boolean;
}

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
  level: number;
  isSystem: boolean;
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

interface UserPermission {
  _id: string;
  userId: string;
  roleId: Role;
  additionalPermissions: Permission[];
  deniedPermissions: Permission[];
  isActive: boolean;
  assignedBy: {
    name: string;
    email: string;
  };
  assignedAt: string;
  notes?: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    level: 10,
    color: '#6B7280',
    icon: 'User',
    selectedPermissions: new Set<string>(),
  });

  // API functions
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRoles(), fetchPermissions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        permissions: Array.from(formData.selectedPermissions),
      };

      const url = editingRole 
        ? `/api/permissions/roles/${editingRole._id}`
        : '/api/permissions/roles';
      
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchRoles();
        handleCloseModal();
        showNotification('success', editingRole ? 'Cập nhật vai trò thành công!' : 'Tạo vai trò thành công!');
      } else {
        showNotification('error', data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      showNotification('error', 'Lỗi khi lưu vai trò');
    }
  };

  // Handle delete role
  const handleDelete = async (role: Role) => {
    if (!confirm(`Bạn có chắc muốn xóa vai trò "${role.displayName}"?`)) return;

    try {
      const response = await fetch(`/api/permissions/roles/${role._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchRoles();
        showNotification('success', 'Xóa vai trò thành công!');
      } else {
        showNotification('error', data.message || 'Không thể xóa vai trò');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      showNotification('error', 'Lỗi khi xóa vai trò');
    }
  };

  // Handle edit role
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      level: role.level,
      color: role.color,
      icon: role.icon,
      selectedPermissions: new Set(role.permissions.map(p => p._id)),
    });
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setFormData({
      name: '',
      displayName: '',
      description: '',
      level: 10,
      color: '#6B7280',
      icon: 'User',
      selectedPermissions: new Set(),
    });
  };

  // Simple notification function
  const showNotification = (type: 'success' | 'error', message: string) => {
    // You can integrate with your existing notification system
    alert(message);
  };

  // Filter permissions by category
  const filteredPermissions = permissions.filter(permission => {
    if (selectedCategory !== 'all' && permission.category !== selectedCategory) return false;
    if (searchQuery && !permission.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !permission.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group permissions by category
  const permissionsByCategory = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) acc[permission.category] = [];
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Get role icon
  const getRoleIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Crown: <Crown className="w-5 h-5" />,
      Shield: <Shield className="w-5 h-5" />,
      Edit: <Edit className="w-5 h-5" />,
      PenTool: <PenTool className="w-5 h-5" />,
      Eye: <Eye className="w-5 h-5" />,
      Users: <Users className="w-5 h-5" />,
      Settings: <Settings className="w-5 h-5" />,
    };
    return icons[iconName] || <Users className="w-5 h-5" />;
  };

  // Get categories
  const categories = ['all', ...new Set(permissions.map(p => p.category))];

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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Vai trò</h1>
          <p className="text-gray-600">Quản lý vai trò và phân quyền trong hệ thống</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm vai trò
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vai trò..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Tất cả danh mục' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roles Grid */}
      {roles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có vai trò nào</h3>
          <p className="text-gray-500 mb-4">Hãy tạo vai trò đầu tiên hoặc chạy seed script</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm vai trò mới
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Role Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: role.color + '20', color: role.color }}
                  >
                    {getRoleIcon(role.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.displayName}</h3>
                    <p className="text-sm text-gray-500">Level {role.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {role.isSystem && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Hệ thống
                    </span>
                  )}
                  <button
                    onClick={() => setExpandedRole(expandedRole === role._id ? null : role._id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedRole === role._id ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Role Description */}
              {role.description && (
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
              )}

              {/* Permissions Count */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  {role.permissions.length} quyền
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {!role.isSystem && (
                    <button
                      onClick={() => handleDelete(role)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Permissions */}
              {expandedRole === role._id && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Quyền được phép:</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {role.permissions.map((permission) => (
                      <div key={permission._id} className="flex items-center gap-2 text-xs">
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="text-gray-600">{permission.description || permission.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên vai trò *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        displayName: e.target.value,
                        name: e.target.value.toLowerCase().replace(/\s+/g, '_')
                      }))}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Ví dụ: Content Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cấp độ (1-100) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formData.level}
                      onChange={(e) => setFormData(prev => ({ ...prev, level: Number(e.target.value) }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Mô tả vai trò và trách nhiệm..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Màu sắc
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-10 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon
                    </label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="Crown">Crown</option>
                      <option value="Shield">Shield</option>
                      <option value="Edit">Edit</option>
                      <option value="PenTool">PenTool</option>
                      <option value="Eye">Eye</option>
                      <option value="Users">Users</option>
                      <option value="Settings">Settings</option>
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quyền truy cập</h3>
                  <div className="space-y-4">
                    {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 capitalize">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(categoryPermissions as Permission[]).map((permission) => (
                            <label key={permission._id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={formData.selectedPermissions.has(permission._id)}
                                onChange={(e) => {
                                  const newSelected = new Set(formData.selectedPermissions);
                                  if (e.target.checked) {
                                    newSelected.add(permission._id);
                                  } else {
                                    newSelected.delete(permission._id);
                                  }
                                  setFormData(prev => ({ ...prev, selectedPermissions: newSelected }));
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
                    ))}
                  </div>
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
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <Save className="w-4 h-4" />
                  {editingRole ? 'Cập nhật' : 'Tạo vai trò'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
