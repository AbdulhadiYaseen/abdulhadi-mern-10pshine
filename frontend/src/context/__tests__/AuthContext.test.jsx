import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn()
  }
}));

// A test component that uses the auth context
const TestComponent = () => {
  const { user, loading, error, login, signup, logout } = useAuth();
  
  return (
    <div>
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : user ? (
        <div data-testid="user-info">
          <p>Logged in as: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div data-testid="logged-out">
          <p>{error ? `Error: ${error}` : 'Not logged in'}</p>
          <button onClick={() => login('test@example.com', 'password123')}>Login</button>
          <button onClick={() => signup({ name: 'Test User', email: 'test@example.com', password: 'password123' })}>Sign Up</button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('provides authentication state and functions', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially loading
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // After loading, should show logged out state
    waitFor(() => {
      expect(screen.getByTestId('logged-out')).toBeInTheDocument();
      expect(screen.getByText(/not logged in/i)).toBeInTheDocument();
    });
  });
  
  test('loads user from localStorage on initialization', async () => {
    // Mock the getCurrentUser to return a user
    authService.getCurrentUser.mockReturnValue({ id: '1', email: 'test@example.com' });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Should initially show loading
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Then should show the user info
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
      expect(screen.getByText(/logged in as: test@example.com/i)).toBeInTheDocument();
    });
    
    // Should have called getCurrentUser
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });
  
  test('login function works correctly', async () => {
    // Mock the login function to return user data
    const mockUser = { id: '1', email: 'test@example.com' };
    authService.login.mockResolvedValue({ user: mockUser });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Click the login button
    await act(async () => {
      userEvent.click(screen.getByText(/login/i));
    });
    
    // Should call login with correct params
    expect(authService.login).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password123' 
    });
    
    // Should show logged in state after login succeeds
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
      expect(screen.getByText(/logged in as: test@example.com/i)).toBeInTheDocument();
    });
  });
  
  test('signup function works correctly', async () => {
    // Mock the signup function to return success
    authService.signup.mockResolvedValue({ message: 'User created successfully' });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Click the signup button
    await act(async () => {
      userEvent.click(screen.getByText(/sign up/i));
    });
    
    // Should call signup with correct params
    expect(authService.signup).toHaveBeenCalledWith({ 
      name: 'Test User',
      email: 'test@example.com', 
      password: 'password123' 
    });
  });
  
  test('logout function works correctly', async () => {
    // Setup a logged in state
    authService.getCurrentUser.mockReturnValue({ id: '1', email: 'test@example.com' });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for user info to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
    });
    
    // Click the logout button
    await act(async () => {
      userEvent.click(screen.getByText(/logout/i));
    });
    
    // Should call logout
    expect(authService.logout).toHaveBeenCalled();
    
    // Should show logged out state after logout
    await waitFor(() => {
      expect(screen.getByTestId('logged-out')).toBeInTheDocument();
    });
  });
  
  test('handles login errors correctly', async () => {
    // Mock the login function to throw an error
    authService.login.mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Click the login button
    await act(async () => {
      userEvent.click(screen.getByText(/login/i));
    });
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error: invalid credentials/i)).toBeInTheDocument();
    });
  });
}); 