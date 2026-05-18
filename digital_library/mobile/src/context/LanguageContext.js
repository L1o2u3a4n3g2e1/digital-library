import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default to English

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'rw' : 'en'));
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
    },
  };

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
