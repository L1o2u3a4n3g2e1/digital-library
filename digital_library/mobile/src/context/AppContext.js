import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { api } from '../api/client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [language, setLanguage] = useState('en');
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [userId, setUserId] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const response = await api.createUser(language);
      setUserId(response.data.user_id);
      setSessionToken(response.data.session_token);
    } catch (error) {
      console.error('Session initialization error:', error);
    }
  };

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'rw' : 'en';
    setLanguage(newLang);
    if (userId) {
      try {
        await api.updateLanguage(userId, newLang);
      } catch (e) {
        console.error('Failed to update language on server');
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const translations = {
    en: {
      library: 'Digital Library',
      search: 'Search Books',
      categories: 'Categories',
      recommended: 'Recommended',
      continue: 'Continue Reading',
      read: 'Read',
      translate: 'Translate',
      listen: 'Listen',
      next: 'Next',
      back: 'Back',
      language: 'Language',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      settings: 'Settings',
      voiceSpeed: 'Voice Speed',
    },
    rw: {
      library: 'Isomero rya Digital',
      search: 'Shakisha Ibitabo',
      categories: 'Ibyiciro',
      recommended: 'Ibyerekanwa',
      continue: 'Komeza Gusoma',
      read: 'Soma',
      translate: 'Hindura',
      listen: 'Umva',
      next: 'Ikurikira',
      back: 'Subira Inyuma',
      language: 'Ururimi',
      theme: 'Mbonezampinduramatwara',
      darkMode: 'Umwijima',
      lightMode: 'Umucyo',
      settings: 'Igenamiterere',
      voiceSpeed: 'Umuvuduko w\'Ijwi',
    },
  };

  const t = (key) => translations[language][key] || key;

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, toggleLanguage, 
      isDarkMode, toggleTheme,
      userId, sessionToken,
      t 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
