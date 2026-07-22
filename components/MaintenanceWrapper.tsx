import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import Maintenance from '../pages/Maintenance';
import Loading from './Loading';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

const MaintenanceWrapper: React.FC<MaintenanceWrapperProps> = ({ children }) => {
  const { settings, loading } = useSettings();
  const { user } = useAuth();
  const location = useLocation();

  // Show loading while fetching settings
  if (loading) {
    return <Loading fullScreen={true} />;
  }

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // If maintenance mode is ON
  if (settings.maintenance) {
    // Always allow admin routes
    if (isAdminRoute) {
      return <>{children}</>;
    }
    
    // For public routes, show maintenance page
    // (even for admin users on public pages)
    return <Maintenance />;
  }

  // Otherwise, show normal content
  return <>{children}</>;
};

export default MaintenanceWrapper;
