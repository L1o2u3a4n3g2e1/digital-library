import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookmark, FiBook, FiGlobe, FiHeadphones, FiStar } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';

const LANGUAGE_BADGES = {
  en: 'EN',
  rw: 'RW',
};

const PLACEHOLDER_COLORS = ['#7C3AED', '#0891B2', '#059669', '#DC2626', '#D97706', '#DB2777'];

const displayTitle = (book, language) => {
  if (language === 'en' && book.title_en) {
    return book.title_en;
  }
  return book.title;
};

const secondaryTitle = (book, language) => {
  if (language === 'rw' && book.title_en) {
    return book.title_en;
  }
  if (language === 'en' && book.title_en) {
    return book.title;
  }
  return null;
};

export default function BookCard({ book, layout = 'grid', index = 0 }) {
  const { language, toggleBookmark, isBookmarked } = useApp();
  const { t } = useTranslation(language);
  const bookmarked = isBookmarked(book.id);
  const bgColor = PLACEHOLDER_COLORS[book.id % PLACEHOLDER_COLORS.length];
  const title = displayTitle(book, language);
  const subtitle = secondaryTitle(book, language);
  const availableLanguages = book.available_languages || [book.language];

  if (layout === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="card group flex items-center gap-4 p-4 hover:shadow-card-hover"
      >
        <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-xl" style={{ background: bgColor }}>
          {book.cover ? (
            <img
              src={book.cover}
              alt={title}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-serif text-white">
              {title.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-brand-950 transition-colors group-hover:text-brand-600">
            {title}
          </h3>
          {subtitle && <p className="truncate text-xs text-brand-500">{subtitle}</p>}
          <p className="mt-0.5 text-xs text-gray-500">{book.author}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {availableLanguages.map((code) => (
              <span key={code} className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700">
                {LANGUAGE_BADGES[code] || code.toUpperCase()}
              </span>
            ))}
            <span className="flex items-center gap-1 text-xs text-brand-500">
              <FiStar size={10} className="fill-current" />
              {book.rating}
            </span>
            {book.hasAudio && (
              <span className="badge bg-audio-100 text-audio-600">
                <FiHeadphones size={10} />
                {t('audioBadge')}
              </span>
            )}
            {book.hasTranslation && (
              <span className="badge bg-lang-100 text-lang-700">
                <FiGlobe size={10} />
                EN/RW
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={() => toggleBookmark(book)}
            className={`rounded-xl p-2 transition-colors ${
              bookmarked ? 'bg-brand-100 text-brand-600' : 'text-gray-400 hover:bg-brand-50 hover:text-brand-600'
            }`}
          >
            <FiBookmark size={15} className={bookmarked ? 'fill-current' : ''} />
          </button>
          {book.hasAudio && (
            <Link to={`/read/${book.id}?mode=audio`} className="hidden items-center gap-1 px-3 py-1.5 text-xs sm:flex btn-secondary">
              <FiHeadphones size={12} />
              {t('listenNow')}
            </Link>
          )}
          <Link to={`/read/${book.id}`} className="btn-primary px-3 py-1.5 text-xs">
            {t('readNow')}
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="card group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[2/3] overflow-hidden" style={{ background: bgColor }}>
        {book.cover ? (
          <img
            src={book.cover}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(event) => {
              event.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-['Playfair_Display'] text-5xl font-bold text-white/80">{title.charAt(0)}</span>
            <span className="mt-2 line-clamp-2 px-4 text-center text-xs text-white/70">{title}</span>
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {book.hasAudio && (
            <span className="badge bg-audio-600/90 text-white backdrop-blur-sm">
              <FiHeadphones size={9} />
              {t('audioBadge')}
            </span>
          )}
          {book.hasTranslation && (
            <span className="badge bg-lang-600/90 text-white backdrop-blur-sm">
              <FiGlobe size={9} />
              EN/RW
            </span>
          )}
        </div>

        <button
          onClick={() => toggleBookmark(book)}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-sm transition-all duration-200 ${
            bookmarked ? 'bg-brand-600 text-white' : 'bg-white/70 text-brand-600 hover:bg-white'
          }`}
        >
          <FiBookmark size={13} className={bookmarked ? 'fill-current' : ''} />
        </button>

        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex w-full gap-2">
            <Link to={`/read/${book.id}`} className="btn-primary flex-1 py-2 text-center text-xs">
              {t('readNow')}
            </Link>
            {book.hasAudio && (
              <Link to={`/read/${book.id}?mode=audio`} className="btn-secondary px-3 py-2 text-xs">
                <FiHeadphones size={12} />
              </Link>
            )}
          </div>
        </div>

        {book.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div className="h-full bg-brand-500" style={{ width: `${book.progress}%` }} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-brand-950 transition-colors group-hover:text-brand-600">
          {title}
        </h3>
        {subtitle && <p className="truncate text-xs text-brand-500">{subtitle}</p>}
        <p className="truncate text-xs text-gray-500">{book.author}</p>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700">
              {availableLanguages.join('/').toUpperCase()}
            </span>
            <span className="flex items-center gap-0.5 text-xs font-medium text-brand-500">
              <FiStar size={10} className="fill-current" />
              {book.rating}
            </span>
          </div>
          {book.progress > 0 && book.progress < 100 && (
            <span className="text-xs font-medium text-brand-500">{book.progress}%</span>
          )}
          {book.progress === 100 && (
            <span className="badge bg-green-100 text-green-700">
              <FiBook size={9} />
              {t('doneBadge')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
