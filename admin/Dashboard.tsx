
import React, { useState, useMemo } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_MENU } from '../constants';
import { LogOut, Search, Bell, User as UserIcon, Lock, ChevronDown, X, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../contexts/PermissionContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import SEO from '../components/SEO';
import SessionTimer from '../components/SessionTimer';
import NotificationBell from '../components/NotificationBell';

// Sub Components
import Overview from './Overview';
import UserManagement from './UserManagement';
import ContentManagement from './ContentManagement';
import ProductForm from './ProductForm';
import ProductTrash from './ProductTrash';
import ProjectForm from './ProjectForm';
import NewsForm from './NewsForm';
import TeamManagement from './TeamManagement';
import FileManager from './FileManager';
import Settings from './Settings';
import ChatManagement from './ChatManagement';
import ContactsManagement from './ContactsManagement';
import CategoryManagement from './CategoryManagement';
import ReviewsManagement from './ReviewsManagement';
import EngagementManagement from './EngagementManagement';
import GoalsManagement from './GoalsManagement';
import SecurityMonitoring from './SecurityMonitoring';
import AccountSettings from './AccountSettings';

const SubHeader = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  // Check if we are in content section
  if (!location.pathname.includes('/admin/content') && !location.pathname.includes('/admin/files')) return null;

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'products';

  const contentTabs = [
    { id: 'products', label: t('admin.products') },
    { id: 'projects', label: t('admin.projects') },
    { id: 'news', label: t('admin.news') },
    { id: 'partners', label: t('admin.partners') },
    { id: 'testimonials', label: t('admin.testimonials') },
  ];

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-8 gap-6 text-sm font-medium overflow-x-auto scrollbar-hide flex-shrink-0">
       {contentTabs.map(tab => {
         const to = `/admin/content?tab=${tab.id}`;
         const isActive = currentTab === tab.id && location.pathname.includes('/admin/content');

         return (
           <Link
              key={tab.id}
              to={to}
              className={`flex items-center h-full border-b-2 px-1 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
           >
              {tab.label}
           </Link>
         );
       })}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { hasPermission, hasMinRoleLevel, role, roleLevel, loading: permissionLoading } = usePermission();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user ID from database when needed
  const [realUserId, setRealUserId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const loadUserFromDB = async () => {
      if (user?.email && !realUserId) {
        try {
          const dbUser = await api.users.getByEmail(user.email);
          setRealUserId(dbUser.id);
        } catch (error) {
          console.error('Error loading user from DB:', error);
        }
      }
    };
    
    loadUserFromDB();
  }, [user?.email, realUserId]);

  // Filter menu items based on permissions
  const filteredMenu = useMemo(() => {
    return ADMIN_MENU.filter(item => {
      // Always show if no permission required
      if (!item.permission && !item.minLevel) return true;
      
      // Check minimum role level first
      if (item.minLevel && !hasMinRoleLevel(item.minLevel)) return false;
      
      // Check specific permission if required
      if (item.permission && !hasPermission(item.permission)) return false;
      
      return true;
    });
  }, [hasPermission, hasMinRoleLevel, roleLevel]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      <SEO 
        title={t('admin.dashboard')} 
        description="Admin Dashboard"
        noindex={true}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-corporate text-white flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
           {/* Admin Logo */}
           <img 
              src="https://placehold.co/180x40/003B5C/ffffff?text=TRAN+LE+ADMIN&font=montserrat" 
              alt="Tran Le Admin" 
              className="h-8 w-auto object-contain" 
            />
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {/* Role Badge */}
          {role && (
            <div className="mb-4 px-4 py-2 bg-white/10 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Vai trò của bạn</div>
              <div className="flex items-center gap-2">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <span className="text-sm font-medium text-white">{role.displayName}</span>
                <span className="text-xs text-gray-400">(Lv.{role.level})</span>
              </div>
            </div>
          )}
          
          {filteredMenu.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{t(`admin.${item.key}`)}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm p-2">
            <LogOut size={18} /> {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Main Header */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 flex-shrink-0 z-10 border-b border-gray-100">
           <div className="relative text-gray-400 focus-within:text-gray-600">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} />
             <input 
               type="text" 
               placeholder={t('admin.search_placeholder')}
               className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
             />
           </div>
           
           <div className="flex items-center gap-4">
             {/* Session Timer */}
             <SessionTimer />
             
             {/* Notifications */}
             <NotificationBell />
             
             <div className="relative">
               <button 
                 onClick={() => setShowUserMenu(!showUserMenu)}
                 className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
               >
                 <div className="text-right hidden md:block">
                   <div className="text-sm font-bold text-gray-800">{user?.name || 'Admin'}</div>
                   <div className="text-xs text-gray-500">{user?.role || 'admin'}</div>
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
                 <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                   <div className="px-4 py-3 border-b border-gray-100">
                     <div className="font-bold text-gray-800">{user?.name}</div>
                     <div className="text-xs text-gray-500">{user?.email}</div>
                   </div>
                   <button
                     onClick={() => {
                       setShowUserMenu(false);
                       navigate('/admin/account');
                     }}
                     className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                   >
                     <UserIcon size={16} />
                     <span>Quản lý tài khoản</span>
                   </button>
                   <button
                     onClick={() => {
                       setShowUserMenu(false);
                       setShowChangePassword(true);
                     }}
                     className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                   >
                     <Lock size={16} />
                     <span>Đổi mật khẩu</span>
                   </button>
                   <div className="border-t border-gray-100 mt-2 pt-2">
                     <button
                       onClick={() => {
                         setShowUserMenu(false);
                         logout();
                       }}
                       className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
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

        {/* Sub Header (Contextual Navigation) */}
        <SubHeader />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/content" element={<ContentManagement />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
            <Route path="/products/trash" element={<ProductTrash />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/edit/:id" element={<ProjectForm />} />
            <Route path="/news/new" element={<NewsForm />} />
            <Route path="/news/edit/:id" element={<NewsForm />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/files" element={<FileManager />} />
            <Route path="/contacts" element={<ContactsManagement />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/reviews" element={<ReviewsManagement />} />
            <Route path="/engagement" element={<EngagementManagement />} />
            <Route path="/goals" element={<GoalsManagement />} />
            <Route path="/security" element={<SecurityMonitoring />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="*" element={<div className="p-8 text-center text-gray-500">Trang không tồn tại</div>} />
          </Routes>
        </div>
      </main>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowChangePassword(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Lock size={20} className="text-primary" />
                Đổi mật khẩu
              </h3>
              <button onClick={() => setShowChangePassword(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              
              const userId = realUserId || user?.id;
              if (!userId) {
                showToast('Không tìm thấy thông tin người dùng', 'error');
                return;
              }
              
              // Validate new password
              if (!passwordData.newPassword || passwordData.newPassword.trim().length === 0) {
                showToast('Vui lòng nhập mật khẩu mới', 'error');
                return;
              }
              
              if (passwordData.newPassword.length < 6) {
                showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
                return;
              }
              
              if (!/[A-Z]/.test(passwordData.newPassword)) {
                showToast('Mật khẩu phải có ít nhất 1 chữ hoa', 'error');
                return;
              }
              
              if (!/[a-z]/.test(passwordData.newPassword)) {
                showToast('Mật khẩu phải có ít nhất 1 chữ thường', 'error');
                return;
              }
              
              if (!/[0-9]/.test(passwordData.newPassword)) {
                showToast('Mật khẩu phải có ít nhất 1 số', 'error');
                return;
              }
              
              if (passwordData.newPassword !== passwordData.confirmPassword) {
                showToast('Mật khẩu xác nhận không khớp', 'error');
                return;
              }
              
              try {
                console.log('Changing password for user:', userId);
                console.log('User email:', user?.email);
                
                const result = await api.users.update(userId, { password: passwordData.newPassword });
                console.log('Update result:', result);
                
                showToast('Đổi mật khẩu thành công!', 'success');
                setShowChangePassword(false);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
              } catch (error) {
                console.error('Change password error:', error);
                const errorMessage = (error as Error).message || 'Đổi mật khẩu thất bại';
                showToast(errorMessage, 'error');
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu cũ</label>
                <div className="relative">
                  <input 
                    required
                    type={showOldPassword ? 'text' : 'password'}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <input 
                    required
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input 
                    required
                    type="password"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                  onClick={() => setShowChangePassword(false)} 
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
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
      )}
    </div>
  );
};

export default AdminDashboard;
