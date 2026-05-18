import axios from 'axios';

// IMPORTANT: Replace with your developer machine's local IP address
// to allow the mobile device/emulator to connect to the backend.
// You can find your IP using 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux).
const BASE_URL = 'http://127.0.0.1:8000'; // Change to 'http://192.168.x.x:8000' for physical devices

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // User endpoints
  createUser: (lang = 'en') => apiClient.post(`/api/user/create?preferred_language=${lang}`),
  getUser: (userId) => apiClient.get(`/api/user/${userId}`),
  updateLanguage: (userId, lang) => apiClient.post(`/api/user/${userId}/language?language=${lang}`),
  
  // Dashboard & Books
  getDashboard: (userId) => apiClient.get(`/api/dashboard/${userId}`),
  getBooks: (categoryId = null, search = '') => {
    let url = '/api/books';
    const params = [];
    if (categoryId) params.push(`category_id=${categoryId}`);
    if (search) params.push(`search=${search}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return apiClient.get(url);
  },
  getBook: (bookId) => apiClient.get(`/api/book/${bookId}`),
  getBookContent: (bookId, page = 1, lang = 'en') => 
    apiClient.get(`/api/book/${bookId}/content?page=${page}&language=${lang}`),
  
  // Audio & Translation
  textToSpeech: (text, lang = 'en') => apiClient.post('/api/text-to-speech', { text, language: lang }),
  translate: (text, targetLang = 'rw') => 
    apiClient.post(`/api/translate?text=${encodeURIComponent(text)}&target_lang=${targetLang}`),
};

export default apiClient;
