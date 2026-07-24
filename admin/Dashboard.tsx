import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import SEO from '../components/SEO';
import AdminNotificationListener from '../components/AdminNotificationListener';
import Loading from '../components/Loading';

// Modular UI Components
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import AdminSubHeader from './components/AdminSubHeader';
import ChangePasswordModal from './components/ChangePasswordModal';

// Domain Modules (Lazy Loaded for minimal initial Admin bundle size)
const Overview = lazy(() => import('./modules/dashboard').then(m => ({ default: m.Overview })));
const OrdersManagement = lazy(() => import('./modules/orders').then(m => ({ default: m.OrdersManagement })));
const ContentManagement = lazy(() => import('./modules/content').then(m => ({ default: m.ContentManagement })));
const ProductForm = lazy(() => import('./modules/content').then(m => ({ default: m.ProductForm })));
const ProductTrash = lazy(() => import('./modules/content').then(m => ({ default: m.ProductTrash })));
const ProjectForm = lazy(() => import('./modules/content').then(m => ({ default: m.ProjectForm })));
const NewsForm = lazy(() => import('./modules/content').then(m => ({ default: m.NewsForm })));
const CategoryManagement = lazy(() => import('./modules/content').then(m => ({ default: m.CategoryManagement })));
const ReviewsManagement = lazy(() => import('./modules/content').then(m => ({ default: m.ReviewsManagement })));
const ResourceManagement = lazy(() => import('./modules/content').then(m => ({ default: m.ResourceManagement })));
const HeaderManagement = lazy(() => import('./modules/content').then(m => ({ default: m.HeaderManagement })));

const UserManagement = lazy(() => import('./modules/users').then(m => ({ default: m.UserManagement })));
const RoleManagement = lazy(() => import('./modules/users').then(m => ({ default: m.RoleManagement })));
const UserPermissionManagement = lazy(() => import('./modules/users').then(m => ({ default: m.UserPermissionManagement })));
const TeamManagement = lazy(() => import('./modules/users').then(m => ({ default: m.TeamManagement })));
const AccountSettings = lazy(() => import('./modules/users').then(m => ({ default: m.AccountSettings })));

const ContactsManagement = lazy(() => import('./modules/contacts').then(m => ({ default: m.ContactsManagement })));
const ChatManagement = lazy(() => import('./modules/contacts').then(m => ({ default: m.ChatManagement })));

const AdminSettings = lazy(() => import('./modules/system').then(m => ({ default: m.AdminSettings })));
const SecurityMonitoring = lazy(() => import('./modules/system').then(m => ({ default: m.SecurityMonitoring })));
const MigrationManagement = lazy(() => import('./modules/system').then(m => ({ default: m.MigrationManagement })));
const GoalsManagement = lazy(() => import('./modules/system').then(m => ({ default: m.GoalsManagement })));
const EngagementManagement = lazy(() => import('./modules/system').then(m => ({ default: m.EngagementManagement })));

const FileManager = lazy(() => import('./FileManager'));

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [realUserId, setRealUserId] = useState<string | null>(null);

  // Fetch pending order notifications with smart polling (pause on tab blur)
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (typeof document !== 'undefined' && document.hidden) return; // Save server resources when tab is hidden
      try {
        const response = await api.orders.getPendingCount();
        if (response?.success) {
          setPendingOrdersCount(response.count);
        }
      } catch (error) {
        console.error('Error fetching pending orders count:', error);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15_000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real User ID for password change
  useEffect(() => {
    const loadUserFromDB = async () => {
      if (user?.email && !realUserId) {
        try {
          const dbUser = await api.users.getByEmail(user.email);
          setRealUserId(dbUser?.id || null);
        } catch (error) {
          console.error('Error loading user from DB:', error);
        }
      }
    };

    loadUserFromDB();
  }, [user?.email, realUserId]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-200 overflow-hidden">
      <SEO 
        title={t('admin.dashboard')} 
        description="CTC Admin Dashboard"
        noindex={true}
      />
      <AdminNotificationListener />

      {/* Sidebar Component */}
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        pendingOrdersCount={pendingOrdersCount}
        onLogout={handleLogout}
      />

      {/* Main Content Layout */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header Component */}
        <AdminHeader 
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenChangePassword={() => setShowChangePassword(true)}
        />

        {/* Contextual SubHeader Component */}
        <AdminSubHeader />

        {/* Scrollable Main Views Router with Lazy Loading */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <Suspense fallback={<Loading fullScreen={false} />}>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/orders" element={<OrdersManagement />} />
              <Route path="/content" element={<ContentManagement />} />
              <Route path="/header" element={<HeaderManagement />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/edit/:id" element={<ProductForm />} />
              <Route path="/products/trash" element={<ProductTrash />} />
              <Route path="/projects/new" element={<ProjectForm />} />
              <Route path="/projects/edit/:id" element={<ProjectForm />} />
              <Route path="/news/new" element={<NewsForm />} />
              <Route path="/news/edit/:id" element={<NewsForm />} />
              <Route path="/team" element={<TeamManagement />} />
              <Route path="/files" element={<FileManager />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="/chat" element={<ChatManagement />} />
              <Route path="/contacts" element={<ContactsManagement />} />
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/reviews" element={<ReviewsManagement />} />
              <Route path="/resources" element={<ResourceManagement />} />
              <Route path="/engagement" element={<EngagementManagement />} />
              <Route path="/goals" element={<GoalsManagement />} />
              <Route path="/security" element={<SecurityMonitoring />} />
              <Route path="/roles" element={<RoleManagement />} />
              <Route path="/permissions" element={<UserPermissionManagement />} />
              <Route path="/migration" element={<MigrationManagement />} />
              <Route path="/account" element={<AccountSettings />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        userId={realUserId}
      />
    </div>
  );
};

export default AdminDashboard;
