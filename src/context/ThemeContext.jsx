import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

const ThemeContext = createContext(null);

const THEME_VARS = {
  light: {
    '--bg-main':    '#f4f6f8',
    '--bg-card':    '#ffffff',
    '--bg-sidebar': '#ffffff',
    '--text-main':  '#222222',
    '--text-muted': '#777777',
    '--border':     '#e8e8e8',
  },
  'dark-pro': {
    '--bg-main':    '#0f1a0f',
    '--bg-card':    '#1e2e1e',
    '--bg-sidebar': '#1a2a1a',
    '--text-main':  '#e0ffe0',
    '--text-muted': '#8fa88f',
    '--border':     '#2a3a2a',
  },
  'soft-green': {
    '--bg-main':    '#f9fbf4',
    '--bg-card':    '#ffffff',
    '--bg-sidebar': '#f0f9e0',
    '--text-main':  '#2d3d1a',
    '--text-muted': '#5a7a2d',
    '--border':     '#d8edd8',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('cartgo-theme') || 'light');

  useEffect(() => {
    localStorage.setItem('cartgo-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const vars = THEME_VARS[theme] || THEME_VARS.light;
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
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

export default ThemeContext;
