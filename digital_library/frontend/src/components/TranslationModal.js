import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import '../styles/translation-modal.css';

const TranslationModal = ({ book, language, onLanguageChange, onClose }) => {
  const { language: currentLanguage } = useApp();
  const t = translations[currentLanguage];
  const [translatedContent, setTranslatedContent] = useState('');

  const languages = [
    { code: 'en', name: t.english },
    { code: 'rw', name: t.kinyarwanda }
  ];

  useEffect(() => {
    const apiKey = process.env.REACT_APP_TRANSLATION_API_KEY;
    if (!apiKey) {
      setTranslatedContent(book.content || book.description);
      return;
    }

    const translateContent = async () => {
      try {
        const response = await fetch('https://api.mymemory.translated.net/get', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.responseStatus === 200) {
          setTranslatedContent(data.responseData.translatedText);
        } else {
          setTranslatedContent(book.content || book.description);
        }
      } catch (err) {
        setTranslatedContent(book.content || book.description);
      }
    };

    translateContent();
  }, [book, language]);

  return (
    <div className="translation-modal-overlay" onClick={onClose}>
      <div className="translation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t.translate}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="language-options">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => onLanguageChange(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>

        <div className="modal-content">
          {translatedContent}
        </div>
      </div>
    </div>
  );
};

export default TranslationModal;
