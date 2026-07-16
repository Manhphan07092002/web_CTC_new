/**
 * Permission Alert Component
 * Hiển thị thông báo khi user không có đủ quyền
 */

import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';
import { usePermission } from '../contexts/PermissionContext';

interface PermissionAlertProps {
  requiredPermission?: string;
  requiredLevel?: number;
  message?: string;
  type?: 'info' | 'warning';
}

const PermissionAlert: React.FC<PermissionAlertProps> = ({
  requiredPermission,
  requiredLevel,
  message,
  type = 'info'
}) => {
  const { role, roleLevel } = usePermission();

  const defaultMessage = requiredPermission 
    ? `Bạn cần quyền "${requiredPermission}" để thực hiện hành động này`
    : requiredLevel 
    ? `Bạn cần vai trò level ${requiredLevel} trở lên để thực hiện hành động này`
    : 'Bạn không có quyền thực hiện hành động này';

  const displayMessage = message || defaultMessage;

  const bgColor = type === 'warning' ? 'bg-amber-50' : 'bg-blue-50';
  const textColor = type === 'warning' ? 'text-amber-700' : 'text-blue-700';
  const borderColor = type === 'warning' ? 'border-amber-200' : 'border-blue-200';
  const iconColor = type === 'warning' ? 'text-amber-500' : 'text-blue-500';

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <div className={`${iconColor} mt-0.5`}>
          {type === 'warning' ? <ShieldAlert size={20} /> : <Info size={20} />}
        </div>
        <div className="flex-1">
          <p className={`${textColor} text-sm font-medium mb-1`}>
            {displayMessage}
          </p>
          {role && (
            <div className="text-xs text-gray-600">
              Vai trò hiện tại: <span className="font-medium">{role.displayName}</span> (Level {roleLevel})
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionAlert;
