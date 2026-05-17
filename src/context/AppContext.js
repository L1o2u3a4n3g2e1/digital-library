import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../utils/storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState(storage.getLanguage() || 'en');
  const [theme, setTheme] = useState(storage.getTheme());
  const [accessibilityMode, setAccessibilityMode] = useState(storage.getAccessibilityMode());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    storage.setLanguage(language);
  }, [language]);

  useEffect(() => {
    storage.setTheme(theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  useEffect(() => {
    storage.setAccessibilityMode(accessibilityMode);
  }, [accessibilityMode]);

  const login = (userData, token) => {
    setUser(userData);
    storage.setUser(userData);
    storage.setToken(token);
  };

  const logout = () => {
    setUser(null);
    storage.removeUser();
    storage.removeToken();
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    language,
    setLanguage,
    theme,
    setTheme,
    accessibilityMode,
    setAccessibilityMode,
    loading,
    setLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
