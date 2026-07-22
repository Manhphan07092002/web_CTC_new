
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface User {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface SessionData {
  user: User;
  token?: string;
  loginTime: number;
  lastActivity: number;
}

interface LoginResult {
  success: boolean;
  error?: string;
  lockedUntil?: number;
  remainingAttempts?: number;
  code?: 'ACCOUNT_LOCKED' | 'INVALID_CREDENTIALS' | 'ERROR';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout: 1 tiếng (60 phút)
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every 1 minute

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper functions defined first
  const clearSession = React.useCallback(() => {
    setUser(null);
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    console.log('Session cleared');
  }, []);

  const updateLastActivity = React.useCallback((sessionData: SessionData) => {
    const updatedSession: SessionData = {
      ...sessionData,
      lastActivity: Date.now()
    };
    localStorage.setItem('admin_session', JSON.stringify(updatedSession));
  }, []);

  // Check session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('admin_session');
    // Check stored session
    
    if (storedSession) {
      try {
        const sessionData: SessionData = JSON.parse(storedSession);
        const now = Date.now();
        const timeSinceLastActivity = now - sessionData.lastActivity;
        
        // Session validation
        
        // Check if session is still valid (within 1 hour)
        if (timeSinceLastActivity < SESSION_TIMEOUT) {
          // Session is valid, restore user
          setUser(sessionData.user);
          // Update last activity
          const updatedSession: SessionData = {
            ...sessionData,
            lastActivity: now
          };
          localStorage.setItem('admin_session', JSON.stringify(updatedSession));
        } else {
          // Session expired
          clearSession();
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        clearSession();
      }
    }
    
    setIsInitialized(true);
  }, [clearSession]);

  // Auto-logout after 1 hour of inactivity
  useEffect(() => {
    if (!user || !isInitialized) return;

    const checkSession = () => {
      const storedSession = localStorage.getItem('admin_session');
      if (storedSession) {
        try {
          const sessionData: SessionData = JSON.parse(storedSession);
          const now = Date.now();
          const timeSinceLastActivity = now - sessionData.lastActivity;
          
          if (timeSinceLastActivity >= SESSION_TIMEOUT) {
            console.log('Auto-logout: Session expired after 1 hour');
            clearSession();
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }
      }
    };

    // Check session every minute
    const intervalId = setInterval(checkSession, ACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [user, isInitialized, clearSession]);

  // Track user activity to refresh session
  useEffect(() => {
    if (!user || !isInitialized) return;

    const updateActivity = () => {
      const storedSession = localStorage.getItem('admin_session');
      if (storedSession) {
        try {
          const sessionData: SessionData = JSON.parse(storedSession);
          updateLastActivity(sessionData);
        } catch (error) {
          console.error('Error updating activity:', error);
        }
      }
    };

    // Update activity on user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [user, isInitialized, updateLastActivity]);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      // Get API base URL dynamically
      const getApiUrl = () => {
        const viteEnv = (import.meta as any).env;
        if (viteEnv?.VITE_API_URL) {
          return `${viteEnv.VITE_API_URL}/users/login`;
        }
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;

        if (!port || port === '80' || port === '443') {
          return '/api/users/login';
        }
        return `${protocol}//${hostname}:4000/api/users/login`;
      };
      const apiUrl = getApiUrl();
      
      // Call login API to verify credentials
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Login failed:', response.status, data);
        
        // Handle account locked (429)
        if (response.status === 429) {
          return {
            success: false,
            error: data.message,
            lockedUntil: data.lockedUntil,
            code: 'ACCOUNT_LOCKED'
          };
        }
        
        // Handle invalid credentials (401)
        if (response.status === 401) {
          return {
            success: false,
            error: data.message,
            remainingAttempts: data.remainingAttempts,
            code: 'INVALID_CREDENTIALS'
          };
        }
        
        return {
          success: false,
          error: data.message || 'Đăng nhập thất bại',
          code: 'ERROR'
        };
      }
      
      // Login successful
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('auth_token', data.token);
      }
      
      const loggedInUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: data.avatar || ''
      };
      
      // Create session data
      const now = Date.now();
      const sessionData: SessionData = {
        user: loggedInUser,
        token: data.token,
        loginTime: now,
        lastActivity: now
      };
      
      setUser(loggedInUser);
      localStorage.setItem('admin_session', JSON.stringify(sessionData));
      // Keep old key for backward compatibility
      localStorage.setItem('admin_user', JSON.stringify(loggedInUser));
      
      // Session created successfully
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Không thể kết nối đến server. Vui lòng thử lại.',
        code: 'ERROR'
      };
    }
  };

  const logout = () => {
    clearSession();
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
