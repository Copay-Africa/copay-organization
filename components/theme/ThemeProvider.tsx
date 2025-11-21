"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Determine the effective theme (what actually gets applied)
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  // Load theme from cookie on mount
  useEffect(() => {
    const savedTheme = Cookies.get('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(effectiveTheme);
    
    // Also set data-theme attribute for explicit CSS targeting
    root.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    Cookies.set('theme', newTheme, { expires: 365 }); // Store for 1 year
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    // Return a basic wrapper during SSR to prevent hydration issues
    return (
      <ThemeContext.Provider
        value={{
          theme: 'system',
          setTheme: () => {},
          systemTheme: 'light',
          effectiveTheme: 'light',
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        systemTheme,
        effectiveTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}