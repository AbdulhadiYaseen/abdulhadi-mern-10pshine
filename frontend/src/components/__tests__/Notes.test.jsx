import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Notes from '../Notes';
import { AuthProvider } from '../../context/AuthContext';
import { noteService } from '../../services/api';

// Mock the services
jest.mock('../../services/api', () => ({
  noteService: {
    getNotes: jest.fn(),
    getNote: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn()
  }
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock navigate function
const mockNavigate = jest.fn();

// Mock logout callback
const mockLogout = jest.fn();

// Sample notes data
const mockNotes = [
  {
    id: 1,
    title: 'First Note',
    content: 'This is the content of the first note',
    createdAt: '2023-05-15T10:00:00Z',
    updatedAt: '2023-05-15T10:00:00Z'
  },
  {
    id: 2,
    title: 'Second Note',
    content: 'This is the content of the second note',
    createdAt: '2023-05-16T11:00:00Z',
    updatedAt: '2023-05-16T11:00:00Z'
  },
  {
    id: 3,
    title: 'Shopping List',
    content: 'Milk, eggs, bread',
    createdAt: '2023-05-17T12:00:00Z',
    updatedAt: '2023-05-17T12:00:00Z'
  }
];

// Helper to render component with necessary providers
const renderNotesComponent = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Notes onLogout={mockLogout} />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Notes Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default implementation for getNotes
    noteService.getNotes.mockResolvedValue(mockNotes);
  });

  test('renders the notes component with loading state initially', async () => {
    renderNotesComponent();
    
    // Should show loading state initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // After loading, should show notes
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
      expect(screen.getByText('Shopping List')).toBeInTheDocument();
    });
    
    // Should have called getNotes
    expect(noteService.getNotes).toHaveBeenCalled();
  });

  test('displays error message when notes fetch fails', async () => {
    // Mock a failed API call
    noteService.getNotes.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    renderNotesComponent();
    
    // Should show error message after loading
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch notes/i)).toBeInTheDocument();
    });
  });

  test('allows searching for notes', async () => {
    renderNotesComponent();
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'Shopping');
    
    // Should filter notes
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
    expect(screen.queryByText('First Note')).not.toBeInTheDocument();
    expect(screen.queryByText('Second Note')).not.toBeInTheDocument();
    
    // Clear search
    await userEvent.clear(searchInput);
    
    // All notes should be visible again
    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.getByText('Second Note')).toBeInTheDocument();
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
  });

  test('opens add note modal when plus button is clicked', async () => {
    renderNotesComponent();
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
    
    // Click add note button
    const addButton = screen.getByTestId('add-note-button') || screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    
    // Check if modal is open
    await waitFor(() => {
      expect(screen.getByText(/add new note/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    });
    
    // Close the modal
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByText(/add new note/i)).not.toBeInTheDocument();
    });
  });

  test('creates a new note when form is submitted', async () => {
    // Mock successful note creation
    const newNote = {
      id: 4,
      title: 'New Test Note',
      content: 'This is a test note',
      createdAt: '2023-05-18T10:00:00Z',
      updatedAt: '2023-05-18T10:00:00Z'
    };
    
    noteService.createNote.mockResolvedValueOnce({ 
      message: 'Note created successfully',
      note: newNote
    });
    
    renderNotesComponent();
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
    
    // Click add note button
    const addButton = screen.getByTestId('add-note-button') || screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    
    // Fill out the form
    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/content/i);
    
    await userEvent.type(titleInput, 'New Test Note');
    await userEvent.type(contentInput, 'This is a test note');
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Check that the API was called with correct data
    expect(noteService.createNote).toHaveBeenCalledWith({
      title: 'New Test Note',
      content: 'This is a test note'
    });
    
    // Check that the new note appears in the list
    await waitFor(() => {
      expect(screen.getByText('New Test Note')).toBeInTheDocument();
    });
  });

  test('edits an existing note', async () => {
    // Mock successful note update
    noteService.updateNote.mockResolvedValueOnce({ 
      message: 'Note updated successfully',
      note: {
        ...mockNotes[0],
        title: 'Updated First Note',
        content: 'This note has been updated',
        updatedAt: '2023-05-19T10:00:00Z'
      }
    });
    
    renderNotesComponent();
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
    
    // Open menu for the first note
    const menuButton = screen.getAllByTestId('note-menu-button')[0] || screen.getAllByTestId('note-menu-button')[0];
    fireEvent.click(menuButton);
    
    // Click edit option
    const editButton = screen.getByTestId('edit-note-1') || screen.getByTestId('edit-note-button-1');
    fireEvent.click(editButton);
    
    // Check if edit modal is open
    await waitFor(() => {
      expect(screen.getByText(/edit note/i)).toBeInTheDocument();
      
      // Form should be pre-filled
      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput.value).toBe('First Note');
    });
    
    // Edit the note
    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/content/i);
    
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated First Note');
    
    await userEvent.clear(contentInput);
    await userEvent.type(contentInput, 'This note has been updated');
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Check that the API was called with correct data
    expect(noteService.updateNote).toHaveBeenCalledWith(1, {
      title: 'Updated First Note',
      content: 'This note has been updated'
    });
    
    // Check that the updated note appears in the list
    await waitFor(() => {
      expect(screen.getByText('Updated First Note')).toBeInTheDocument();
    });
  });

  test('deletes a note', async () => {
    // Mock successful note deletion
    noteService.deleteNote.mockResolvedValueOnce({ 
      message: 'Note deleted successfully' 
    });
    
    renderNotesComponent();
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
    
    // Open menu for the first note
    const menuButton = screen.getAllByTestId('note-menu-button')[0] || screen.getAllByTestId('note-menu-button')[0];
    fireEvent.click(menuButton);
    
    // Click delete option
    const deleteButton = screen.getByTestId('delete-note-1') || screen.getByTestId('delete-note-button-1');
    fireEvent.click(deleteButton);
    
    // Check that the API was called with correct ID
    expect(noteService.deleteNote).toHaveBeenCalledWith(1);
    
    // Check that the note was removed from the list
    await waitFor(() => {
      expect(screen.queryByText('First Note')).not.toBeInTheDocument();
    });
  });

  test('shows note details when a note is clicked', async () => {
    // Mock getting a single note
    noteService.getNote.mockResolvedValueOnce(mockNotes[0]);
    
    renderNotesComponent();
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
    
    // Click on a note
    const noteCard = screen.getByText('First Note').closest('[data-testid="note-card-1"]') || 
                     screen.getByText('First Note').closest('div');
    fireEvent.click(noteCard);
    
    // Should show the detail view
    await waitFor(() => {
      expect(screen.getByTestId('note-detail-view')).toBeInTheDocument();
      expect(screen.getByText('This is the content of the first note')).toBeInTheDocument();
    });
    
    // Go back to grid view
    const backButton = screen.getByTestId('back-to-grid') || screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    // Should show grid view again
    await waitFor(() => {
      expect(screen.queryByTestId('note-detail-view')).not.toBeInTheDocument();
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
  });

  test('handles logout', async () => {
    renderNotesComponent();
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });
    
    // Click logout button
    const logoutButton = screen.getByTestId('logout-button') || screen.getByText(/logout/i);
    fireEvent.click(logoutButton);
    
    // Should call the logout callback
    expect(mockLogout).toHaveBeenCalled();
  });
}); 