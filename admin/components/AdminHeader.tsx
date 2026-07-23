import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User as UserIcon, Lock, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import SessionTimer from '../../components/SessionTimer';
import NotificationBell from '../../components/NotificationBell';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  onOpenChangePassword: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenSidebar,
  onOpenChangePassword
}) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-900 h-16 shadow-sm flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10 border-b border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <div className="relative text-gray-400 focus-within:text-gray-600 hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} />
          <input 
            type="text" 
            placeholder={t('admin.search_placeholder')}
            className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800 dark:text-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48 md:w-64 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Session Timer */}
        <SessionTimer />
        
        {/* Notifications */}
        <NotificationBell />
        
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-gray-800 dark:text-white">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'admin'}</div>
            </div>
            {(user as any)?.avatar ? (
              <img src={(user as any).avatar} alt={user?.name} className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                <div className="font-bold text-gray-800 dark:text-white">{user?.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/admin/account');
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-gray-200"
              >
                <UserIcon size={16} />
                <span>Quản lý tài khoản</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenChangePassword();
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-gray-200"
              >
                <Lock size={16} />
                <span>Đổi mật khẩu</span>
              </button>
              <div className="border-t border-gray-100 dark:border-slate-800 mt-2 pt-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 text-red-600 dark:text-red-400"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
