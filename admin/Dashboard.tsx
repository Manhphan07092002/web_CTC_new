import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import SEO from '../components/SEO';
import AdminNotificationListener from '../components/AdminNotificationListener';

// Modular UI Components
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import AdminSubHeader from './components/AdminSubHeader';
import ChangePasswordModal from './components/ChangePasswordModal';

// Domain Modules
import { Overview } from './modules/dashboard';
import { OrdersManagement } from './modules/orders';
import {
  ContentManagement,
  ProductForm,
  ProductTrash,
  ProjectForm,
  NewsForm,
  CategoryManagement,
  ReviewsManagement,
  ResourceManagement
} from './modules/content';
import {
  UserManagement,
  RoleManagement,
  UserPermissionManagement,
  TeamManagement,
  AccountSettings
} from './modules/users';
import { ContactsManagement, ChatManagement } from './modules/contacts';
import {
  AdminSettings,
  SecurityMonitoring,
  MigrationManagement,
  GoalsManagement,
  EngagementManagement
} from './modules/system';
import FileManager from './FileManager';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [realUserId, setRealUserId] = useState<string | null>(null);

  // Fetch pending order notifications
  useEffect(() => {
    const fetchPendingCount = async () => {
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

        {/* Scrollable Main Views Router */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/orders" element={<OrdersManagement />} />
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
