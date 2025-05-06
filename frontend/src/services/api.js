import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  signup: async (userData) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export const noteService = {
  getNotes: async () => {
    const response = await api.get('/api/notes');
    return response.data;
  },
  getNote: async (id) => {
    const response = await api.get(`/api/notes/${id}`);
    return response.data;
  },
  createNote: async (noteData) => {
    const response = await api.post('/api/notes', noteData);
    return response.data;
  },
  updateNote: async (id, noteData) => {
    const response = await api.put(`/api/notes/${id}`, noteData);
    return response.data;
  },
  deleteNote: async (id) => {
    const response = await api.delete(`/api/notes/${id}`);
    return response.data;
  }
};

export default api; 