import resources from '../data/kinyarwandaResources.json';

const normalize = (text = '') => text.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ');

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const detectSpokenLanguage = (text = '') => {
  const normalized = normalize(text);
  if (!normalized.trim()) {
    return 'unknown';
  }

  const rwMarkers = resources.kinyarwanda_markers || [];
  const enMarkers = resources.english_markers || [];

  let rwScore = 0;
  for (const marker of rwMarkers) {
    if (marker && new RegExp(`\\b${escapeRegExp(marker)}\\b`, 'u').test(normalized)) {
      rwScore += 1;
    }
  }

  let enScore = 0;
  for (const marker of enMarkers) {
    if (marker && new RegExp(`\\b${escapeRegExp(marker)}\\b`, 'u').test(normalized)) {
      enScore += 1;
    }
  }

  if (rwScore > enScore + 1) {
    return 'rw';
  }

  if (enScore > rwScore + 1) {
    return 'en';
  }

  if (rwScore > 0 && enScore > 0) {
    return 'mixed';
  }

  return 'en';
};

export const recognitionCodeFor = (language) => {
  if (language === 'rw') {
    return 'rw-RW';
  }

  return 'en-US';
};

export const getBookTextForLanguage = (book, language) => {
  if (!book?.content) {
    return '';
  }

  if (book.content[language]) {
    return book.content[language];
  }

  if (book.language && book.content[book.language]) {
    return book.content[book.language];
  }

  const firstLanguage = Object.keys(book.content)[0];
  return firstLanguage ? book.content[firstLanguage] : '';
};

export const labelForLanguage = (code, uiLanguage = 'en') => {
  const labels = {
    en: uiLanguage === 'rw' ? 'Icyongereza' : 'English',
    rw: uiLanguage === 'rw' ? 'Ikinyarwanda' : 'Kinyarwanda',
    mixed: uiLanguage === 'rw' ? 'Byivanze' : 'Mixed',
    unknown: uiLanguage === 'rw' ? 'Bitazwi' : 'Unknown',
  };

  return labels[code] || code.toUpperCase();
};
