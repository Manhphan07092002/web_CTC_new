
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;           // Actual theme being applied (light or dark)
  themeMode: ThemeMode;   // User preference (light, dark, or system)
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isSystemDark: boolean;  // Whether system prefers dark mode
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to get system preference
const getSystemTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme mode: what user selected (light, dark, or system)
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    // Default to system
    return 'system';
  });

  // Track system preference
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  // Actual theme being applied
  const [theme, setTheme] = useState<Theme>(() => {
    if (themeMode === 'system') {
      return getSystemTheme();
    }
    return themeMode;
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      // If user selected 'system', update the actual theme
      if (themeMode === 'system') {
        setTheme(newSystemTheme);
      }
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Update actual theme when themeMode changes
  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(systemTheme);
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, systemTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Add switching class for smooth transition
    root.classList.add('switching');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Remove switching class after transition
    setTimeout(() => {
      root.classList.remove('switching');
    }, 100);
    
    // Save preferences
    localStorage.setItem('theme', theme);
    localStorage.setItem('themeMode', themeMode);
  }, [theme, themeMode]);

  // Toggle between light and dark (cycles through: light -> dark -> system)
  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  // Set specific theme mode
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeMode, 
      toggleTheme, 
      setThemeMode,
      isSystemDark: systemTheme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
