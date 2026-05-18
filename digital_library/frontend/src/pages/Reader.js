import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { storage } from '../utils/storage';
import api from '../services/api';
import Header from '../components/Header';
import TranslationModal from '../components/TranslationModal';
import '../styles/reader.css';

const Reader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useApp();
  const t = translations[language];

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationLanguage, setTranslationLanguage] = useState('rw');

  useEffect(() => {
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (book) {
      const bookmarks = storage.getBookmarks();
      setIsBookmarked(bookmarks.some(b => b.id === book.id));
      storage.addToReadingHistory(book);
    }
  }, [book]);

  const fetchBook = async () => {
    try {
      const response = await api.getBook(id);
      setBook(response.data || response);
    } catch (err) {
      console.error('Failed to fetch book');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      storage.removeBookmark(book.id);
      setIsBookmarked(false);
    } else {
      storage.addBookmark(book);
      setIsBookmarked(true);
    }
  };

  const handleTextToSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(book.content || book.description);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDownload = async () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(book.content || ''));
    element.setAttribute('download', `${book.title}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) return <div className="loading">{t.loading}</div>;
  if (!book) return <div className="error">{t.error}</div>;

  return (
    <>
      <Header />
      <div className="reader-container">
        <div className="reader-header">
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
            ← {t.back}
          </button>
          <h1>{book.title}</h1>
          <p className="reader-author">{t.author}: {book.author}</p>
        </div>

        <div className="reader-toolbar">
          <button
            className={`btn btn-icon ${isSpeaking ? 'active' : ''}`}
            onClick={handleTextToSpeech}
            title={t.audioMode}
          >
            🔊
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowTranslation(true)}
            title={t.translate}
          >
            🌐
          </button>
          <button
            className={`btn btn-icon ${isBookmarked ? 'active' : ''}`}
            onClick={handleToggleBookmark}
            title={isBookmarked ? t.removeBookmark : t.addBookmark}
          >
            📌
          </button>
          <button
            className="btn btn-icon"
            onClick={handleDownload}
            title={t.download}
          >
            ⬇️
          </button>

          <div className="font-size-control">
            <label htmlFor="font-size">{t.fontSize}</label>
            <input
              id="font-size"
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
            <span>{fontSize}px</span>
          </div>
        </div>

        <div className="reader-content" style={{ fontSize: `${fontSize}px` }}>
          {book.content || book.description}
        </div>
      </div>

      {showTranslation && (
        <TranslationModal
          book={book}
          language={translationLanguage}
          onLanguageChange={setTranslationLanguage}
          onClose={() => setShowTranslation(false)}
        />
      )}
    </>
  );
};

export default Reader;
