import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import ThemeToggle from './ThemeToggle';
import AccessibilityToggle from './AccessibilityToggle';
import '../styles/navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, language } = useApp();
  const t = translations[language];
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link">
            <span className="brand-icon">📚</span>
            <span className="brand-text">{t.appTitle}</span>
          </Link>
        </div>

        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">
            {t.home}
          </Link>
          <Link to="/dashboard" className="nav-link">
            {t.library}
          </Link>
        </div>

        <div className="navbar-actions">
          <ThemeToggle />
          <AccessibilityToggle />

          <button
            className="nav-menu-toggle"
            onClick={() => setShowMenu(!showMenu)}
          >
            ☰
          </button>
        </div>

        {showMenu && (
          <div className="navbar-dropdown">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setShowMenu(false)}
                >
                  {t.myProfile}
                </Link>
                <button
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="dropdown-item"
                  onClick={() => setShowMenu(false)}
                >
                  {t.login}
                </Link>
                <Link
                  to="/register"
                  className="dropdown-item"
                  onClick={() => setShowMenu(false)}
                >
                  {t.register}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
