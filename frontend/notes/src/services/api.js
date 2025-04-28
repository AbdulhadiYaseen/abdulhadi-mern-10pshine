import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth services
export const authService = {
    signup: (userData) => api.post('/auth/signup', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout')
};

// Notes services
export const notesService = {
    getAllNotes: () => api.get('/notes'),
    getNote: (id) => api.get(`/notes/${id}`),
    createNote: (noteData) => api.post('/notes', noteData),
    updateNote: (id, noteData) => api.put(`/notes/${id}`, noteData),
    deleteNote: (id) => api.delete(`/notes/${id}`)
};

export default api; 