import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the navigation function
const mockNavigate = jest.fn();

// Mock the onLogin callback
const mockOnLogin = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Helper function to render the component with necessary providers
const renderLoginComponent = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login onLogin={mockOnLogin} />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  test('renders login form with all elements', () => {
    renderLoginComponent();
    
    // Check header text
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    
    // Check for form elements
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    
    // Check for signup link
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });
  
  test('shows validation error when form is submitted with empty fields', async () => {
    renderLoginComponent();
    
    // Get the submit button and click it
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // Check for validation error message
    expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
    
    // Verify that login function was not called
    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('allows user to input email and password', async () => {
    renderLoginComponent();
    
    // Get the input fields
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    // Type into input fields
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    // Verify input values
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });
  
  test('shows loading state during form submission', async () => {
    // Mock the login function to return a promise that resolves after a delay
    jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            json: () => Promise.resolve({ token: 'mock-token', user: { email: 'test@example.com' } }),
            ok: true
          }), 
          100
        )
      )
    );
    
    renderLoginComponent();
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify loading state
    expect(screen.getByRole('button', { name: /signing in.../i })).toBeInTheDocument();
  });
  
  // This test requires mocking the AuthContext's login function
  test('navigates to notes page on successful login', async () => {
    // Mock a successful login response
    const mockAuthResponse = { user: { email: 'test@example.com' } };
    const mockLoginFn = jest.fn().mockResolvedValue(mockAuthResponse);
    
    // Replace the actual login function with our mock
    jest.mock('../../context/AuthContext', () => ({
      ...jest.requireActual('../../context/AuthContext'),
      useAuth: () => ({
        login: mockLoginFn,
        error: null
      })
    }));
    
    renderLoginComponent();
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for the login process to complete
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/notes');
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });
  
  test('displays error message on login failure', async () => {
    // Mock the AuthContext to return an error
    jest.mock('../../context/AuthContext', () => ({
      ...jest.requireActual('../../context/AuthContext'),
      useAuth: () => ({
        login: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
        error: null
      })
    }));
    
    renderLoginComponent();
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-password');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
    
    // Verify navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });
}); 