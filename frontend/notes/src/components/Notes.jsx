import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiMoreVertical, FiTrash2 } from "react-icons/fi";
import { notesService, authService } from "../services/api";

function Notes({ onLogout }) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await notesService.getAllNotes();
            setNotes(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (noteTitle.trim()) {
            try {
                const response = await notesService.createNote({
                    title: noteTitle,
                    content: noteContent
                });
                setNotes([response.data.note, ...notes]);
                setIsModalOpen(false);
                setNoteTitle("");
                setNoteContent("");
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to create note');
            }
        }
    };

    const handleNoteClick = (note) => {
        setSelectedNote(note);
        setOpenMenuId(null);
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await notesService.deleteNote(noteId);
            setNotes(notes.filter(note => note.id !== noteId));
            if (selectedNote?.id === noteId) {
                setSelectedNote(null);
            }
            setOpenMenuId(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete note');
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            onLogout();
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to logout');
        }
    };

    const toggleMenu = (noteId, event) => {
        event.stopPropagation();
        setOpenMenuId(openMenuId === noteId ? null : noteId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <aside className="w-40 bg-yellow-500 text-white p-4">
                <h2 className="text-xl font-semibold">Profile</h2>
                <ul className="mt-12 space-y-4">
                    <li>
                        <button 
                            className="w-full text-left px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
                            onClick={() => navigate("/dashboard")}
                        >
                            Dashboard
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

            <aside className="w-67 bg-gray-600 text-white p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">All Notes</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 hover:bg-gray-500 rounded-full transition-colors hover:cursor-pointer"
                    >
                        <FiPlus className="text-2xl" />
                    </button>
                </div>
                {error && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <ul className="mt-8 space-y-2">
                    {notes.map((note) => (
                        <React.Fragment key={note.id}>
                            <hr className="border-solid border-gray-400 border-2 my-4" />
                            <li 
                                className={`truncate w-60 hover:bg-gray-500 p-2 rounded-md cursor-pointer transition-colors ${
                                    selectedNote?.id === note.id ? 'bg-gray-500' : ''
                                }`}
                                onClick={() => handleNoteClick(note)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="truncate flex-1 mr-2">{note.title}</span>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => toggleMenu(note.id, e)}
                                            className="p-1 hover:bg-gray-400 rounded-full transition-colors hover:cursor-pointer"
                                        >
                                            <FiMoreVertical className="text-xl" />
                                        </button>
                                        {openMenuId === note.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                                <button
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                >
                                                    <FiTrash2 className="mr-2" />
                                                    Delete Note
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        </React.Fragment>
                    ))}
                </ul>
            </aside>
            
            <div className="flex-1 p-4 bg-white">
                {selectedNote ? (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">{selectedNote.title}</h2>
                        <p className="text-gray-600 mb-4">Created: {new Date(selectedNote.createdAt).toLocaleString()}</p>
                        <div className="prose max-w-none">
                            {selectedNote.content.split('\n').map((line, index) => (
                                <p key={index} className="mb-2">{line}</p>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a note or create a new one
                    </div>
                )}
            </div>
            
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg w-[800px] shadow-xl transform transition-all">
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
                                    className="px-4 py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
                                    onClick={handleAddNote}
                                >
                                    Add Note
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