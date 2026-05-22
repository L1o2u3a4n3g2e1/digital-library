import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/api';

const AppContext = createContext();

const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const getRawLS = (k, fallback = null) => {
  try {
    if (!hasStorage()) return fallback;
    const v = window.localStorage.getItem(k);
    return v ?? fallback;
  } catch {
    return fallback;
  }
};
const setRawLS = (k, v) => {
  try {
    if (hasStorage()) window.localStorage.setItem(k, v);
  } catch {}
};
const removeRawLS = (k) => {
  try {
    if (hasStorage()) window.localStorage.removeItem(k);
  } catch {}
};
const getLS = (k, fallback) => {
  try {
    const v = getRawLS(k, null);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const setLS = (k, v) => {
  try {
    setRawLS(k, JSON.stringify(v));
  } catch {}
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => getLS('ml_user', null));
  const [token, setToken] = useState(() => getRawLS('ml_token', null));
  const [authReady, setAuthReady] = useState(false);
  const [language, setLanguage] = useState(() => getRawLS('ml_lang', 'en'));
  const [theme, setTheme] = useState(() => getRawLS('ml_theme', 'light'));
  const [lowLiteracy, setLowLiteracy] = useState(() => getLS('ml_low_literacy', false));
  const [highContrast, setHighContrast] = useState(() => getLS('ml_high_contrast', false));
  const [bookmarks, setBookmarks] = useState(() => getLS('ml_bookmarks', []));
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setRawLS('ml_lang', language); }, [language]);
  useEffect(() => { setRawLS('ml_theme', theme); document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  useEffect(() => { setLS('ml_low_literacy', lowLiteracy); document.body.classList.toggle('low-literacy', lowLiteracy); }, [lowLiteracy]);
  useEffect(() => { setLS('ml_high_contrast', highContrast); document.body.classList.toggle('high-contrast', highContrast); }, [highContrast]);
  useEffect(() => { setLS('ml_bookmarks', bookmarks); }, [bookmarks]);

  useEffect(() => {
    let active = true;

    const clearAuthState = () => {
      setUser(null);
      setToken(null);
      removeRawLS('ml_user');
      removeRawLS('ml_token');
    };

    const bootstrapAuth = async () => {
      if (!token) {
        if (user) {
          clearAuthState();
        }
        if (active) setAuthReady(true);
        return;
      }

      try {
        const response = await authService.me();
        if (!active) return;

        if (response?.success && response?.data) {
          setUser(response.data);
          setLS('ml_user', response.data);
        } else {
          clearAuthState();
        }
      } catch {
        if (active) {
          clearAuthState();
        }
      } finally {
        if (active) setAuthReady(true);
      }
    };

    bootstrapAuth();

    return () => {
      active = false;
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((userData, authToken) => {
    setUser(userData); setToken(authToken);
    setLS('ml_user', userData); setRawLS('ml_token', authToken);
    setAuthReady(true);
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {}).finally(() => {
      setUser(null);
      setToken(null);
      removeRawLS('ml_user');
      removeRawLS('ml_token');
      setAuthReady(true);
    });
  }, []);

  const toggleBookmark = useCallback((book) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === book.id);
      return exists ? prev.filter(b => b.id !== book.id) : [...prev, book];
    });
  }, []);

  const isBookmarked = useCallback((id) => bookmarks.some(b => b.id === id), [bookmarks]);

  const addNotification = useCallback((msg, type = 'info') => {
    const n = { id: Date.now(), message: msg, type, read: false, time: new Date() };
    setNotifications(prev => [n, ...prev].slice(0, 20));
  }, []);

  const speakHint = useCallback((text) => {
    if (!lowLiteracy || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }, [lowLiteracy]);

  return (
    <AppContext.Provider value={{
      user, setUser, login, logout, token,
      authReady,
      language, setLanguage,
      theme, setTheme,
      lowLiteracy, setLowLiteracy,
      highContrast, setHighContrast,
      bookmarks, toggleBookmark, isBookmarked,
      notifications, setNotifications, addNotification,
      sidebarOpen, setSidebarOpen,
      speakHint,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
