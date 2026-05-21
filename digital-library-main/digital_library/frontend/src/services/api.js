import axios from 'axios';

const resolveApiBaseUrl = () => {
  const configured = (process.env.REACT_APP_API_URL || '').trim();

  if (configured) {
    const normalized = configured.replace(/\/+$/, '');
    if (normalized.endsWith('/api')) {
      return normalized;
    }
    if (normalized.endsWith('/backend')) {
      return `${normalized}/api`;
    }
    return `${normalized}/api`;
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      if (port === '3000') {
        return 'http://localhost:3001/api';
      }
      return `${origin}/api`;
    }

    return `${origin}/api`;
  }

  return 'http://localhost:3001/api';
};

const API_BASE_URL = resolveApiBaseUrl();

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

const unwrap = (request) => request.then((response) => response?.data ?? response);

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('ml_token');
  const language = localStorage.getItem('ml_lang') || 'en';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-App-Language'] = language;
  config.withCredentials = true;
  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  login: (email, password, rememberMe = false) => http.post('/auth/login', { email, password, remember_me: rememberMe }),
  register: (name, email, password, phone = null) =>
    http.post('/auth/register', { name, email, password, phone }),
  registerGuest: (phone) => http.post('/auth/register-guest', { phone }),
  verifyGuestPhone: (phone, code) => http.post('/auth/verify-guest-phone', { phone, code }),
  resendGuestVerification: (phone) => http.post('/auth/resend-guest-verification', { phone }),
  verifyEmail: (email, code) => http.post('/auth/verify-email', { email, code }),
  resendVerification: (email) => http.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => http.post('/auth/forgot-password', { email }),
  resetPassword: (email, resetCode, newPassword) =>
    http.post('/auth/reset-password', { email, reset_code: resetCode, new_password: newPassword }),
  me: () => http.get('/auth/me'),
  logout: () => http.post('/auth/logout'),
};

export const bookService = {
  list: (params) => unwrap(http.get('/books', { params })),
  get: (id) => unwrap(http.get(`/books/${id}`)),
  search: (q, params) => unwrap(http.get('/books/search', { params: { q, ...params } })),
  recommend: () => unwrap(http.get('/books/recommended')),
};

export const uploadService = {
  book: (formData, onProgress) =>
    unwrap(
      http.post('/upload/book', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) =>
          onProgress && onProgress(Math.round((event.loaded * 100) / event.total)),
      })
    ),
  cover: (formData) =>
    unwrap(
      http.post('/upload/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ),
};

export const translationService = {
  translate: (text, from, to, bookId = null) =>
    unwrap(http.post('/translate', { text, from, to, bookId })),
  languages: () => unwrap(http.get('/translate/languages')),
};

export const audioService = {
  generate: (bookId, lang) => unwrap(http.post('/audio/generate', { bookId, lang })),
  get: (bookId) => unwrap(http.get(`/audio/${bookId}`)),
};

export const statsService = {
  get: () => unwrap(http.get('/stats')),
  logRead: (bookId, minutes, progress, language, completed = false) =>
    unwrap(http.post('/stats/read', { bookId, minutes, progress, language, completed })),
  logAudio: (bookId, seconds, language) =>
    unwrap(http.post('/stats/audio', { bookId, seconds, language })),
  logVoice: (text, detectedLanguage) =>
    unwrap(http.post('/stats/voice', { text, detected_language: detectedLanguage })),
};

export default http;
