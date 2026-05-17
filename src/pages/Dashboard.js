import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import api from '../services/api';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import VoiceButton from '../components/VoiceButton';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { language, user } = useApp();
  const t = translations[language];

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = ['academic', 'agriculture', 'health', 'love', 'social'];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.getBooks();
      setBooks(response.data || []);
    } catch (err) {
      console.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const response = await api.search(query, language);
      setSearchResults(response.data || []);
    } catch (err) {
      console.error('Search failed');
    }
  };

  const handleVoiceSearch = (transcript) => {
    handleSearch(transcript);
  };

  const filteredBooks = selectedCategory
    ? (searchResults !== null ? searchResults : books).filter(book => book.category === selectedCategory)
    : (searchResults !== null ? searchResults : books);
  const displayBooks = filteredBooks;

  const handleUpload = () => {
    navigate('/upload');
  };

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>{user ? `${t.welcomeBack}, ${user.username}!` : t.appTitle}</h1>
          <p>{t.appSubtitle}</p>
        </div>

        <div className="dashboard-controls">
          <div className="dashboard-search">
            <SearchBar onSearch={handleSearch} />
            <VoiceButton onVoiceSearch={handleVoiceSearch} />
          </div>
          <button className="btn btn-primary" onClick={handleUpload}>
            📤 {t.uploadBook}
          </button>
        </div>

        <div className="categories-filter">
          <button
            className={`category-btn ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            {t.allCategories}
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {t[category]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">{t.loading}</div>
        ) : displayBooks.length === 0 ? (
          <div className="empty-state">
            <p>{searchResults !== null ? t.noResults : t.noBooks}</p>
          </div>
        ) : (
          <>
            <h2 className="section-title">
              {searchResults !== null ? t.searchBooks : t.recommendedBooks}
            </h2>
            <div className="books-grid">
              {displayBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
