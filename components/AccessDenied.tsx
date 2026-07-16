/**
 * Access Denied Component
 * Hiển thị khi user không có quyền truy cập
 */

import React from 'react';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../contexts/PermissionContext';

interface AccessDeniedProps {
  message?: string;
  requiredPermission?: string;
  requiredLevel?: number;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  message = 'Bạn không có quyền truy cập trang này',
  requiredPermission,
  requiredLevel
}) => {
  const navigate = useNavigate();
  const { role, roleLevel } = usePermission();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Không có quyền truy cập
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Current role info */}
        {role && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="text-sm text-gray-500 mb-2">Vai trò hiện tại của bạn:</div>
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: role.color }}
              />
              <span className="font-medium">{role.displayName}</span>
              <span className="text-sm text-gray-500">(Level {roleLevel})</span>
            </div>
            
            {requiredLevel && roleLevel < requiredLevel && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm text-red-600">
                  Yêu cầu: Level {requiredLevel} trở lên
                </div>
              </div>
            )}
            
            {requiredPermission && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm text-red-600">
                  Quyền yêu cầu: <code className="bg-red-50 px-1 rounded">{requiredPermission}</code>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
          
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Home size={18} />
            Về Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
