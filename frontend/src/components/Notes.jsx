import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiMoreVertical, FiTrash2, FiEdit, FiCalendar } from "react-icons/fi";
import { noteService } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Notes({ onLogout }) {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("grid"); 

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedNotes = await noteService.getNotes();
            setNotes(fetchedNotes);
            
            if (fetchedNotes.length > 0 && !selectedNote) {
                setSelectedNote(fetchedNotes[0]);
            }
        } catch (err) {
            setError('Failed to fetch notes. Please try again.');
            console.error('Error fetching notes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (noteTitle.trim()) {
            setIsLoading(true);
            try {
                const newNote = {
                    title: noteTitle,
                    content: noteContent
                };
                
                const response = await noteService.createNote(newNote);
                setNotes([response.note, ...notes]);
                setIsModalOpen(false);
                setNoteTitle("");
                setNoteContent("");
            } catch (err) {
                setError('Failed to create note. Please try again.');
                console.error('Error creating note:', err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleNoteClick = async (note) => {
        setOpenMenuId(null); 
        
        setSelectedNote(note);
        setViewMode("detail");

        if (!note.content) {
            setIsLoading(true);
            try {
                const fullNote = await noteService.getNote(note.id);
                setSelectedNote(fullNote);
            } catch (err) {
                setError('Failed to fetch note details.');
                console.error('Error fetching note details:', err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeleteNote = async (noteId, event) => {
        if (event) event.stopPropagation();
        setIsLoading(true);
        try {
            await noteService.deleteNote(noteId);
            setNotes(notes.filter(note => note.id !== noteId));
            if (selectedNote?.id === noteId) {
                setSelectedNote(null);
                setViewMode("grid");
            }
            setOpenMenuId(null);
        } catch (err) {
            setError('Failed to delete note.');
            console.error('Error deleting note:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMenu = (noteId, event) => {
        event.stopPropagation(); 
        setOpenMenuId(openMenuId === noteId ? null : noteId);
    };

    const handleLogout = async () => {
        try {
            await logout();
            onLogout();
            navigate('/login');
        } catch (err) {
            console.error('Error logging out:', err);
        }
    };

    const goBackToGrid = () => {
        setViewMode("grid");
        setSelectedNote(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substr(-2)}`;
    };

    const getContentPreview = (content, maxLength = 80) => {
        return content ? content.substring(0, maxLength) + (content.length > maxLength ? '...' : '') : '';
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {}
            <aside className="w-48 bg-yellow-500 text-white p-4 min-h-screen">
                <div className="mb-8">
                    <h2 className="text-l font-bold">{user?.name || 'User'}</h2>
                    <p className="text-sm mt-2"></p>
                </div>
                <ul className="space-y-4">
                    <li>
                        <button 
                            className="w-full text-left px-4 py-2 rounded-md bg-yellow-600 font-medium transition-colors cursor-pointer"
                            onClick={() => navigate("/notes")}
                        >
                            Notes
                        </button>
                    </li>
                    <li>
                        <button 
                            className="w-full text-left px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
                            onClick={() => navigate("/profile")}
                        >
                            Profile
                        </button>
                    </li>
                    <li>
                        <button 
                            className="w-full text-left px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
                            onClick={() => navigate("/settings")}
                        >
                            Settings
                        </button>
                    </li>
                    <li>
                        <button 
                            className="w-full text-left px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </aside>

            {}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {viewMode === "grid" ? "All Notes" : "Note Details"}
                        </h1>
                        {viewMode === "detail" && (
                            <button 
                                onClick={goBackToGrid} 
                                className="text-yellow-600 hover:text-yellow-800 mt-1"
                            >
                                ← Back to all notes
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-md transition-colors"
                        title="Add New Note"
                    >
                        <FiPlus className="text-xl" />
                    </button>
                </div>
                
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {isLoading && !notes.length ? (
                    <div className="text-center text-gray-500 py-10">Loading notes...</div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {notes.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                No notes found. Create your first note!
                            </div>
                        ) : (
                            notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow p-4 border border-gray-200 relative"
                                    onClick={() => handleNoteClick(note)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800 text-lg truncate">{note.title}</h3>
                                        <div className="relative">
                                            <button
                                                onClick={(e) => toggleMenu(note.id, e)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                <FiMoreVertical />
                                            </button>
                                            {openMenuId === note.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                                    <button
                                                        onClick={(e) => handleDeleteNote(note.id, e)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                    >
                                                        <FiTrash2 className="mr-2" />
                                                        Delete Note
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {getContentPreview(note.content)}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500 mt-2">
                                        <FiCalendar className="mr-1" />
                                        {formatDate(note.createdAt)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <span className="text-gray-500">Loading note content...</span>
                            </div>
                        ) : selectedNote ? (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedNote.title}</h2>
                                    <button
                                        onClick={(e) => handleDeleteNote(selectedNote.id, e)}
                                        className="text-red-600 hover:text-red-800 p-2"
                                        title="Delete Note"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                                <p className="text-gray-500 mb-6">
                                    Created: {new Date(selectedNote.createdAt).toLocaleString()}
                                </p>
                                <div className="prose max-w-none">
                                    {selectedNote.content.split('\n').map((line, index) => (
                                        <p key={index} className="mb-2 text-gray-700">{line}</p>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                No note selected
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg w-full max-w-3xl shadow-xl transform transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800">Add a Note</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note Title
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Enter note title..."
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note Content
                                </label>
                                <textarea 
                                    id="noteContent"
                                    className="w-full h-64 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Enter your note content..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button 
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="px-4 py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition-colors cursor-pointer disabled:opacity-50"
                                    onClick={handleAddNote}
                                    disabled={isLoading || !noteTitle.trim()}
                                >
                                    {isLoading ? 'Adding...' : 'Add Note'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notes;
