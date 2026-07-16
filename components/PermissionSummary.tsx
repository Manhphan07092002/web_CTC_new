/**
 * Permission Summary Component
 * Hiển thị tóm tắt quyền của user hiện tại
 */

import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, Eye, Edit, Trash2, Plus, Settings, Users } from 'lucide-react';
import { usePermission } from '../contexts/PermissionContext';

const PermissionSummary: React.FC = () => {
  const { role, roleLevel, permissions, userPermission } = usePermission();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!role) return null;

  // Group permissions by category - filter out undefined/null values
  const groupedPermissions = (permissions || []).reduce((acc, permission) => {
    if (!permission || typeof permission !== 'string') return acc;
    
    const parts = permission.split('_');
    if (parts.length < 2) return acc;
    
    const action = parts[0]; // create, read, update, delete, view, manage
    const resource = parts.slice(1).join('_'); // products, users, etc.
    
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(action);
    return acc;
  }, {} as Record<string, string[]>);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus size={14} className="text-green-600" />;
      case 'read':
      case 'view': return <Eye size={14} className="text-blue-600" />;
      case 'update':
      case 'edit': return <Edit size={14} className="text-orange-600" />;
      case 'delete': return <Trash2 size={14} className="text-red-600" />;
      case 'manage': return <Settings size={14} className="text-purple-600" />;
      default: return <Shield size={14} className="text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Tạo',
      read: 'Đọc',
      view: 'Xem',
      update: 'Sửa',
      edit: 'Chỉnh sửa',
      delete: 'Xóa',
      manage: 'Quản lý'
    };
    return labels[action] || action;
  };

  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      products: 'Sản phẩm',
      projects: 'Dự án',
      news: 'Tin tức',
      users: 'Người dùng',
      categories: 'Danh mục',
      product_categories: 'Danh mục SP',
      content: 'Nội dung',
      customers: 'Khách hàng',
      security_logs: 'Nhật ký BM',
      system_settings: 'Cài đặt HT',
      analytics: 'Phân tích',
      reports: 'Báo cáo'
    };
    return labels[resource] || resource.replace(/_/g, ' ');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: role.color + '20', color: role.color }}
          >
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{role.displayName}</h3>
            <p className="text-sm text-gray-500">
              Level {roleLevel} • {permissions.length} quyền
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* Role Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Thông tin vai trò</div>
            <div className="text-sm">
              <div><strong>Tên:</strong> {role.name}</div>
              <div><strong>Cấp độ:</strong> {roleLevel}</div>
              <div><strong>Màu sắc:</strong> <span style={{ color: role.color }}>{role.color}</span></div>
            </div>
          </div>

          {/* Permissions by Resource */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Quyền theo tài nguyên:</div>
            {Object.entries(groupedPermissions).map(([resource, actions]) => (
              <div key={resource} className="border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-sm text-gray-800 mb-2">
                  {getResourceLabel(resource)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {actions.map(action => (
                    <div 
                      key={action}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs"
                    >
                      {getActionIcon(action)}
                      {getActionLabel(action)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Permissions */}
          {userPermission?.additionalPermissions && userPermission.additionalPermissions.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-2">
                Quyền bổ sung ({userPermission.additionalPermissions.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {userPermission.additionalPermissions.map((perm: any) => (
                  <span 
                    key={perm._id} 
                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                  >
                    {perm.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Denied Permissions */}
          {userPermission?.deniedPermissions && userPermission.deniedPermissions.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800 mb-2">
                Quyền bị từ chối ({userPermission.deniedPermissions.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {userPermission.deniedPermissions.map((perm: any) => (
                  <span 
                    key={perm._id} 
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                  >
                    {perm.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PermissionSummary;
