
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // Log unauthorized admin access attempts
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      const logData = {
        timestamp: new Date().toISOString(),
        attemptedPath: location.pathname,
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        type: 'UNAUTHORIZED_ADMIN_ACCESS'
      };

      console.warn('Unauthorized admin access attempt:', logData);
      
      // Send to security logging
      const getApiUrl = () => {
        const viteEnv = (import.meta as any).env;
        if (viteEnv?.VITE_API_URL) {
          return `${viteEnv.VITE_API_URL}/security/404`;
        }
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;

        if (!port || port === '80' || port === '443') {
          return '/api/security/404';
        }
        return `${protocol}//${hostname}:4000/api/security/404`;
      };
      const apiUrl = getApiUrl();
      
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...logData,
          path: location.pathname,
          search: location.search
        })
      }).catch(() => {
        console.error('Failed to log unauthorized admin access');
      });
    }
  }, [isInitialized, isAuthenticated, location]);

  // Đợi cho đến khi session được kiểm tra xong
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Sau khi đã kiểm tra session, nếu không authenticated thì redirect
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
