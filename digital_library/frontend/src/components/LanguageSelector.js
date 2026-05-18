import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import '../styles/language-selector.css';

const LanguageSelector = () => {
  const { language, setLanguage, accessibilityMode } = useApp();
  const t = translations[language];

  const languages = [
    { code: 'en', name: t.english },
    { code: 'rw', name: t.kinyarwanda }
  ];

  return (
    <div className={`language-selector ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`language-btn ${language === lang.code ? 'active' : ''}`}
          onClick={() => setLanguage(lang.code)}
          aria-pressed={language === lang.code}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
