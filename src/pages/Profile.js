import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { storage } from '../utils/storage';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import '../styles/profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, language } = useApp();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState('profile');
  const [readingHistory, setReadingHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
    setReadingHistory(storage.getReadingHistory());
    setBookmarks(storage.getBookmarks());
    setDownloads(storage.getDownloads());
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h1>{user.username}</h1>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            {t.myProfile}
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            {t.readingHistory}
          </button>
          <button
            className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            {t.bookmarks}
          </button>
          <button
            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            {t.preferences}
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>{t.myProfile}</h2>
              <div className="profile-details">
                <div className="detail-item">
                  <span className="label">{t.username}</span>
                  <span>{user.username}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{t.email}</span>
                  <span>{user.email}</span>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleLogout}
              >
                {t.logout}
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="profile-section">
              <h2>{t.readingHistory}</h2>
              {readingHistory.length === 0 ? (
                <p className="empty-message">{t.noBooks}</p>
              ) : (
                <div className="books-grid">
                  {readingHistory.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="profile-section">
              <h2>{t.bookmarks}</h2>
              {bookmarks.length === 0 ? (
                <p className="empty-message">{t.noBooks}</p>
              ) : (
                <div className="books-grid">
                  {bookmarks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="profile-section">
              <h2>{t.preferences}</h2>
              <div className="preferences-group">
                <div className="preference-item">
                  <span>{t.language}</span>
                  <LanguageSelector />
                </div>
                <div className="preference-item">
                  <span>{t.darkMode}</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
