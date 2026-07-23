import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const { showToast } = useToast();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Mật khẩu mới không trùng khớp!', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    if (!userId) {
      showToast('Không tìm thấy thông tin tài khoản!', 'error');
      return;
    }

    try {
      await api.users.changePassword(userId, passwordData.oldPassword, passwordData.newPassword);
      showToast('Đổi mật khẩu thành công!', 'success');
      onClose();
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.message || 'Mật khẩu cũ không chính xác!', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-xl text-gray-900 dark:text-white flex items-center gap-2">
            <Lock size={20} className="text-primary" /> Đổi mật khẩu
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu cũ</label>
            <div className="relative">
              <input 
                required
                type={showOldPassword ? 'text' : 'password'}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={passwordData.oldPassword}
                onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                placeholder="Nhập mật khẩu cũ..."
              />
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu mới</label>
            <div className="relative">
              <input 
                required
                type={showNewPassword ? 'text' : 'password'}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={passwordData.newPassword}
                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                placeholder="Nhập mật khẩu mới..."
                minLength={6}
              />
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordData.newPassword && (
              <div className="text-xs mt-2 space-y-1">
                <p className={`flex items-center gap-1 ${passwordData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="font-bold">{passwordData.newPassword.length >= 6 ? '✓' : '○'}</span> Tối thiểu 6 ký tự
                </p>
                <p className={`flex items-center gap-1 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="font-bold">{/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'}</span> Có chữ hoa
                </p>
                <p className={`flex items-center gap-1 ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="font-bold">{/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'}</span> Có chữ thường
                </p>
                <p className={`flex items-center gap-1 ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="font-bold">{/[0-9]/.test(passwordData.newPassword) ? '✓' : '○'}</span> Có số
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input 
                required
                type="password"
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                placeholder="Nhập lại mật khẩu mới..."
              />
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-secondary shadow-md transition-all"
            >
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
