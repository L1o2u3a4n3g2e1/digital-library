import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { storage } from '../utils/storage';
import '../styles/book-card.css';

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const { accessibilityMode } = useApp();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bookmarks = storage.getBookmarks();
    setIsBookmarked(bookmarks.some(b => b.id === book.id));
  }, [book.id]);

  const handleToggleBookmark = (e) => {
    e.stopPropagation();
    if (isBookmarked) {
      storage.removeBookmark(book.id);
      setIsBookmarked(false);
    } else {
      storage.addBookmark(book);
      setIsBookmarked(true);
    }
  };

  return (
    <div
      className={`book-card ${accessibilityMode ? 'accessibility-mode' : ''}`}
      onClick={() => navigate(`/reader/${book.id}`)}
    >
      <div className="book-image">
        <img src={book.image || '📖'} alt={book.title} />
      </div>

      <div className="book-content">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        {!accessibilityMode && (
          <p className="book-description">{book.description}</p>
        )}

        <div className="book-meta">
          {book.pages && <span>📄 {book.pages}</span>}
          {book.category && <span>🏷️ {book.category}</span>}
        </div>
      </div>

      <button
        className={`btn-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
        onClick={handleToggleBookmark}
        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {isBookmarked ? '⭐' : '☆'}
      </button>
    </div>
  );
};

export default BookCard;
