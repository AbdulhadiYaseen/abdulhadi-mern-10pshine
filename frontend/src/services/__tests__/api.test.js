import axios from 'axios';
import { authService, noteService } from '../api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

// Create a mock axios instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn()
    }
  }
};

describe('API Services', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    // Reset localStorage mock
    localStorage.clear();
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
  });

  describe('Auth Service', () => {
    test('signup should call the correct endpoint with user data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      const mockResponse = {
        data: {
          message: 'User created successfully',
          user: { id: 1, name: 'Test User', email: 'test@example.com' },
          token: 'mock-token'
        }
      };
      
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);
      
      const result = await authService.signup(userData);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/signup', userData);
      expect(result).toEqual(mockResponse.data);
    });

    test('login should call the correct endpoint and store token and user in localStorage', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const mockResponse = {
        data: {
          message: 'Login successful',
          user: mockUser,
          token: 'mock-token'
        }
      };
      
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);
      
      const result = await authService.login(credentials);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', credentials);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(result).toEqual(mockResponse.data);
    });

    test('logout should remove token and user from localStorage', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { message: 'Logout successful' }
      });
      
      await authService.logout();
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('logout should clear localStorage even if API call fails', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Network error'));
      
      await authService.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('getCurrentUser should return user from localStorage', () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
      
      const result = authService.getCurrentUser();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('user');
      expect(result).toEqual(mockUser);
    });

    test('getCurrentUser should return null if no user in localStorage', () => {
      localStorage.getItem.mockReturnValueOnce(null);
      
      const result = authService.getCurrentUser();
      
      expect(result).toBeNull();
    });
  });

  describe('Note Service', () => {
    test('getNotes should call the correct endpoint', async () => {
      const mockNotes = [
        { id: 1, title: 'Note 1', content: 'Content 1' },
        { id: 2, title: 'Note 2', content: 'Content 2' }
      ];
      const mockResponse = { data: mockNotes };
      
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);
      
      const result = await noteService.getNotes();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/notes');
      expect(result).toEqual(mockNotes);
    });

    test('getNote should call the correct endpoint with note ID', async () => {
      const noteId = 1;
      const mockNote = { id: noteId, title: 'Note 1', content: 'Content 1' };
      const mockResponse = { data: mockNote };
      
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);
      
      const result = await noteService.getNote(noteId);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/api/notes/${noteId}`);
      expect(result).toEqual(mockNote);
    });

    test('createNote should call the correct endpoint with note data', async () => {
      const noteData = { title: 'New Note', content: 'New Content' };
      const mockCreatedNote = { id: 1, ...noteData };
      const mockResponse = { 
        data: { 
          message: 'Note created successfully', 
          note: mockCreatedNote 
        } 
      };
      
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);
      
      const result = await noteService.createNote(noteData);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/notes', noteData);
      expect(result).toEqual(mockResponse.data);
    });

    test('updateNote should call the correct endpoint with note ID and data', async () => {
      const noteId = 1;
      const noteData = { title: 'Updated Note', content: 'Updated Content' };
      const mockUpdatedNote = { id: noteId, ...noteData };
      const mockResponse = { 
        data: { 
          message: 'Note updated successfully', 
          note: mockUpdatedNote 
        } 
      };
      
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);
      
      const result = await noteService.updateNote(noteId, noteData);
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/api/notes/${noteId}`, noteData);
      expect(result).toEqual(mockResponse.data);
    });

    test('deleteNote should call the correct endpoint with note ID', async () => {
      const noteId = 1;
      const mockResponse = { 
        data: { 
          message: 'Note deleted successfully' 
        } 
      };
      
      mockAxiosInstance.delete.mockResolvedValueOnce(mockResponse);
      
      const result = await noteService.deleteNote(noteId);
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/api/notes/${noteId}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('all service methods should handle API errors properly', async () => {
      const error = new Error('API Error');
      mockAxiosInstance.get.mockRejectedValueOnce(error);
      mockAxiosInstance.post.mockRejectedValueOnce(error);
      mockAxiosInstance.put.mockRejectedValueOnce(error);
      mockAxiosInstance.delete.mockRejectedValueOnce(error);
      
      await expect(noteService.getNotes()).rejects.toThrow('API Error');
      await expect(noteService.getNote(1)).rejects.toThrow('API Error');
      await expect(noteService.createNote({})).rejects.toThrow('API Error');
      await expect(noteService.updateNote(1, {})).rejects.toThrow('API Error');
      await expect(noteService.deleteNote(1)).rejects.toThrow('API Error');
    });
  });

  describe('API Interceptors', () => {
    test('request interceptor should add token to headers when available', () => {
      // Get the request interceptor callback
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      // Mock config object
      const config = { headers: {} };
      localStorage.getItem.mockReturnValueOnce('mock-token');
      
      // Call the interceptor
      const result = requestInterceptor(config);
      
      // Check that token was added
      expect(result.headers['Authorization']).toBe('Bearer mock-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('token');
    });

    test('request interceptor should not modify headers when no token', () => {
      // Get the request interceptor callback
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      // Mock config object
      const config = { headers: {} };
      localStorage.getItem.mockReturnValueOnce(null);
      
      // Call the interceptor
      const result = requestInterceptor(config);
      
      // Check that headers were not modified
      expect(result.headers['Authorization']).toBeUndefined();
    });

    test('request interceptor should handle errors', () => {
      // Get the error callback of the request interceptor
      const errorCallback = mockAxiosInstance.interceptors.request.use.mock.calls[0][1];
      
      // Create a mock error
      const error = new Error('Request failed');
      
      // Make sure the error is rethrown
      expect(() => errorCallback(error)).rejects.toThrow('Request failed');
    });
  });
}); 