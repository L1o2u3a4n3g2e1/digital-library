const API_URL = 'http://localhost:5000/api';

const api = {
  // Auth endpoints
  async register(username, email, password, phoneNumber) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, phoneNumber })
    });
    return response.json();
  },

  async login(identifier, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return response.json();
  },

  async getCurrentUser(token) {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Books endpoints
  async getBooks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/books?${queryString}`);
    return response.json();
  },

  async getBook(id) {
    const response = await fetch(`${API_URL}/books/${id}`);
    return response.json();
  },

  async createBook(data, token) {
    const response = await fetch(`${API_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateBook(id, data, token) {
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteBook(id, token) {
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Categories endpoints
  async getCategories() {
    const response = await fetch(`${API_URL}/categories`);
    return response.json();
  },

  async createCategory(name, name_kin, token) {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, name_kin })
    });
    return response.json();
  },

  async deleteCategory(id, token) {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // User endpoints
  async getUsers(token) {
    const response = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async deleteUser(id, token) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Stats endpoints
  async getStats(token) {
    const response = await fetch(`${API_URL}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Search endpoint
  async search(query, language = 'en') {
    const response = await fetch(
      `${API_URL}/search?search=${query}&language=${language}`
    );
    return response.json();
  },

  // Activity endpoints
  async logActivity(activity, token) {
    const response = await fetch(`${API_URL}/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(activity)
    });
    return response.json();
  }
};

export default api;
