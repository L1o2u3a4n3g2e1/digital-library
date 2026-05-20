import React from 'react';
import { useApp } from '../context/AppContext';
import '../styles/theme-toggle.css';

const ThemeToggle = () => {
  const { theme, setTheme, accessibilityMode } = useApp();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      className={`theme-toggle ${accessibilityMode ? 'accessibility-mode' : ''}`}
      onClick={toggleTheme}
      title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
