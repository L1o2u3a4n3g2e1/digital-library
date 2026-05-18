import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import '../styles/search-bar.css';

const SearchBar = ({ onSearch }) => {
  const { language, accessibilityMode } = useApp();
  const t = translations[language];
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className={`search-bar ${accessibilityMode ? 'accessibility-mode' : ''}`} onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.searchBooks}
        className="search-input"
        aria-label={t.searchBooks}
      />
      <button type="submit" className="search-button">
        🔍
      </button>
    </form>
  );
};

export default SearchBar;
