import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { ADMIN_MENU } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePermission } from '../../contexts/PermissionContext';

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  pendingOrdersCount: number;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  pendingOrdersCount,
  onLogout
}) => {
  const { t } = useLanguage();
  const location = useLocation();
  const { hasPermission, hasMinRoleLevel, role, roleLevel } = usePermission();

  // Filter menu items based on permissions
  const filteredMenu = React.useMemo(() => {
    return ADMIN_MENU.filter(item => {
      if (!item.permission && !item.minLevel) return true;
      if (item.minLevel && !hasMinRoleLevel(item.minLevel)) return false;
      if (item.permission && !hasPermission(item.permission)) return false;
      return true;
    });
  }, [hasPermission, hasMinRoleLevel, roleLevel]);

  // Group headings
  const GROUP_TITLES: Record<string, string> = {
    main: 'TỔNG QUAN',
    business: 'KINH DOANH & KHÁCH HÀNG',
    content: 'QUẢN LÝ NỘI DUNG',
    system: 'HỆ THỐNG & BẢO MẬT'
  };

  // Group menu items by category
  const groupedMenu = React.useMemo<Record<string, typeof filteredMenu>>(() => {
    const groups: Record<string, typeof filteredMenu> = {
      main: [],
      business: [],
      content: [],
      system: []
    };

    filteredMenu.forEach(item => {
      const groupKey = (item as any).group || 'main';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });

    return groups;
  }, [filteredMenu]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 lg:static w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all duration-300 transform border-r border-slate-800 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-cyan-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
              CTC
            </div>
            <span className="font-extrabold text-white text-base tracking-wider font-mono">ADMIN PANEL</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          {/* User Role Card */}
          {role && (
            <div className="px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl shadow-sm">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Vai trò của bạn</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full animate-pulse"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="text-sm font-bold text-white">{role.displayName}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                  Lv.{role.level}
                </span>
              </div>
            </div>
          )}
          
          {/* Grouped Menu Sections */}
          {Object.entries(groupedMenu).map(([groupKey, items]) => {
            const itemList = items as typeof filteredMenu;
            if (itemList.length === 0) return null;

            return (
              <div key={groupKey} className="space-y-1">
                <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                  {GROUP_TITLES[groupKey] || groupKey}
                </div>

                {itemList.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary text-white font-semibold shadow-md shadow-primary/20' 
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                        <span className="text-sm font-medium">
                          {t(`admin.${item.key}`) === item.key ? item.name : t(`admin.${item.key}`)}
                        </span>
                      </div>
                      {item.key === 'orders' && pendingOrdersCount > 0 && (
                        <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-5 text-center shadow-sm">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 rounded-xl transition-all text-sm py-2.5 font-medium"
          >
            <LogOut size={18} /> {t('admin.logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
