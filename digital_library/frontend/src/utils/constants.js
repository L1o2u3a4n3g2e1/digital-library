export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪', dir: 'ltr' },
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼', dir: 'ltr' },
];

export const CATEGORIES = [
  { id: 'fiction', label: 'Fiction', icon: '📖', color: '#D4A574' },
  { id: 'science', label: 'Science', icon: '🔬', color: '#7FB3D3' },
  { id: 'history', label: 'History', icon: '🏛️', color: '#A8C5A0' },
  { id: 'health', label: 'Health', icon: '❤️', color: '#F4A7A7' },
  { id: 'agriculture', label: 'Agriculture', icon: '🌾', color: '#B5CC8E' },
  { id: 'business', label: 'Business', icon: '💼', color: '#B8A9C9' },
  { id: 'education', label: 'Education', icon: '🎓', color: '#F7C59F' },
  { id: 'technology', label: 'Technology', icon: '💻', color: '#89C4CF' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧', color: '#F9D5A7' },
  { id: 'religion', label: 'Religion', icon: '✝️', color: '#C5A3C5' },
];

export const READING_SPEEDS = [
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
];

export const FONT_SIZES = [
  { value: 'sm', label: 'S', size: '0.9rem' },
  { value: 'md', label: 'M', size: '1.1rem' },
  { value: 'lg', label: 'L', size: '1.25rem' },
  { value: 'xl', label: 'XL', size: '1.4rem' },
];

export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
