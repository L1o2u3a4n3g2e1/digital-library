import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:80/digital-library/backend';

const http = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 15000,
});

const unwrap = (request) => request.then((response) => response?.data ?? response);

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('ml_token');
  const language = localStorage.getItem('ml_lang') || 'en';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-App-Language'] = language;
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
