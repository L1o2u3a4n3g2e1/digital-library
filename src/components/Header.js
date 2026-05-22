import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import '../styles/header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, language, accessibilityMode } = useApp();
  const t = translations[language];
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMenu(false);
  };

  return (
    <header className={`header ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="header-logo">
            📚 {t.appTitle}
          </Link>
        </div>

        <nav className="header-nav">
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <LanguageSelector />

          {user && (
            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => setShowMenu(!showMenu)}
              >
                👤 {user.username}
              </button>
              {showMenu && (
                <div className="user-dropdown">
                  <Link to="/profile" onClick={() => setShowMenu(false)}>
                    {t.myProfile}
                  </Link>
                  <button onClick={handleLogout}>
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-sm">{t.login}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t.register}</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
