/**
 * Dark Mode Utility Functions
 * Provides helper functions and class mappings for dark mode theming
 */

// Dark mode color mappings
export const darkModeClasses = {
  // Background colors
  bgWhite: 'bg-white dark:bg-slate-800',
  bgGray50: 'bg-gray-50 dark:bg-slate-900',
  bgGray100: 'bg-gray-100 dark:bg-slate-800',
  bgGradientLight: 'bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800',
  bgGradientWhite: 'bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900',
  
  // Text colors
  textGray900: 'text-gray-900 dark:text-slate-100',
  textGray800: 'text-gray-800 dark:text-slate-200',
  textGray700: 'text-gray-700 dark:text-slate-300',
  textGray600: 'text-gray-600 dark:text-slate-400',
  textGray500: 'text-gray-500 dark:text-slate-500',
  textGray400: 'text-gray-400 dark:text-slate-600',
  
  // Border colors
  borderGray100: 'border-gray-100 dark:border-slate-700',
  borderGray200: 'border-gray-200 dark:border-slate-600',
  borderGray300: 'border-gray-300 dark:border-slate-500',
  
  // Card styles
  card: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700',
  cardHover: 'hover:bg-gray-50 dark:hover:bg-slate-700',
  
  // Shadow styles
  shadow: 'shadow-lg dark:shadow-slate-900/50',
  shadowXl: 'shadow-xl dark:shadow-slate-900/50',
  shadow2xl: 'shadow-2xl dark:shadow-slate-900/50',
  
  // Input styles
  input: 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500',
  
  // Button styles
  btnSecondary: 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600',
  btnOutline: 'border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:border-primary dark:hover:border-primary',
  
  // Section backgrounds
  sectionLight: 'bg-white dark:bg-slate-800',
  sectionAlt: 'bg-gray-50 dark:bg-slate-900',
  
  // Modal/Overlay
  modalBg: 'bg-white dark:bg-slate-800',
  overlay: 'bg-black/70 dark:bg-black/80',
  
  // Gradient text (works in both modes)
  gradientText: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent',
};

// Helper function to combine base classes with dark mode classes
export const withDarkMode = (baseClasses: string, darkClasses: string): string => {
  return `${baseClasses} ${darkClasses}`;
};

// Get appropriate background class
export const getBgClass = (type: 'white' | 'gray50' | 'gray100' = 'white'): string => {
  switch (type) {
    case 'white':
      return darkModeClasses.bgWhite;
    case 'gray50':
      return darkModeClasses.bgGray50;
    case 'gray100':
      return darkModeClasses.bgGray100;
    default:
      return darkModeClasses.bgWhite;
  }
};

// Get appropriate text class
export const getTextClass = (shade: 900 | 800 | 700 | 600 | 500 | 400 = 900): string => {
  switch (shade) {
    case 900:
      return darkModeClasses.textGray900;
    case 800:
      return darkModeClasses.textGray800;
    case 700:
      return darkModeClasses.textGray700;
    case 600:
      return darkModeClasses.textGray600;
    case 500:
      return darkModeClasses.textGray500;
    case 400:
      return darkModeClasses.textGray400;
    default:
      return darkModeClasses.textGray900;
  }
};

// Check if dark mode is active
export const isDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

// Toggle dark mode manually
export const toggleDarkMode = (): void => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  
  if (isDark) {
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};

// Set dark mode based on system preference
export const setSystemTheme = (): void => {
  if (typeof window === 'undefined') return;
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return;
  }
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export default darkModeClasses;
