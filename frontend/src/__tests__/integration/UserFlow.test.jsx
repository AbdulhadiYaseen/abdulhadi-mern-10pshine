import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from '../../App';
import Login from '../../components/Login';
import Notes from '../../components/Notes';
import { AuthProvider } from '../../context/AuthContext';
import { authService, noteService } from '../../services/api';

// Mock API services
jest.mock('../../services/api', () => ({
  authService: {
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn()
  },
  noteService: {
    getNotes: jest.fn(),
    getNote: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn()
  }
}));

// Mock react-router-dom's navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockNavigate = jest.fn();

// Sample user and notes data
const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
const mockNotes = [
  {
    id: 1,
    title: 'Welcome Note',
    content: 'Welcome to NoteVault! This is your first note.',
    createdAt: '2023-05-01T10:00:00Z',
    updatedAt: '2023-05-01T10:00:00Z'
  }
];

// Setup test app with routing
const TestApp = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login onLogin={() => {}} />} />
        <Route path="/login" element={<Login onLogin={() => {}} />} />
        <Route path="/notes" element={<Notes onLogout={() => {}} />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    authService.login.mockResolvedValue({
      message: 'Login successful',
      user: mockUser,
      token: 'mock-token'
    });
    
    authService.getCurrentUser.mockReturnValue(mockUser);
    
    noteService.getNotes.mockResolvedValue(mockNotes);
    
    noteService.createNote.mockImplementation((noteData) => 
      Promise.resolve({
        message: 'Note created successfully',
        note: {
          id: Math.floor(Math.random() * 1000) + 10,
          ...noteData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    );
  });
  
  test('user can login and create a note', async () => {
    render(<TestApp />);
    
    // Step 1: Login
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill login form
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    // Submit login form
    fireEvent.click(loginButton);
    
    // Verify login API was called with correct credentials
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com', 
      password: 'password123'
    });
    
    // Mock navigation to /notes after login
    mockNavigate.mockImplementationOnce(() => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Notes onLogout={() => {}} />
          </AuthProvider>
        </BrowserRouter>
      );
    });
    
    // Should navigate to notes page
    expect(mockNavigate).toHaveBeenCalledWith('/notes');
    
    // Wait for notes page to load and fetch notes
    await waitFor(() => {
      expect(noteService.getNotes).toHaveBeenCalled();
    });
    
    // Should display existing notes
    await waitFor(() => {
      expect(screen.getByText('Welcome Note')).toBeInTheDocument();
    });
    
    // Step 2: Create a new note
    // Click add note button
    const addButton = screen.getByTestId('add-note-button') || 
                     screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    
    // Fill note form
    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/content/i);
    
    await userEvent.type(titleInput, 'Integration Test Note');
    await userEvent.type(contentInput, 'This note was created during integration testing');
    
    // Save the note
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Verify note creation API was called with correct data
    expect(noteService.createNote).toHaveBeenCalledWith({
      title: 'Integration Test Note',
      content: 'This note was created during integration testing'
    });
    
    // New note should appear in the list
    await waitFor(() => {
      expect(screen.getByText('Integration Test Note')).toBeInTheDocument();
    });
    
    // Step 3: Logout
    const logoutButton = screen.getByTestId('logout-button') || 
                         screen.getByText(/logout/i);
    fireEvent.click(logoutButton);
    
    // Verify logout API was called
    expect(authService.logout).toHaveBeenCalled();
  });
  
  test('error handling during login', async () => {
    // Mock failed login
    authService.login.mockRejectedValueOnce({
      response: {
        data: { message: 'Invalid credentials' }
      }
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login onLogin={() => {}} />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Fill login form
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(emailInput, 'wrong@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    
    // Submit login form
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(loginButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
    
    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('error handling when fetching notes', async () => {
    // Mock successful login but failed notes fetch
    authService.getCurrentUser.mockReturnValue(mockUser);
    noteService.getNotes.mockRejectedValueOnce(new Error('Failed to fetch notes'));
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Notes onLogout={() => {}} />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Should show error message after loading
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch notes/i)).toBeInTheDocument();
    });
  });
}); 