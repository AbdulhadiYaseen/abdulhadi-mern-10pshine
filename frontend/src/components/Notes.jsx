import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiMoreVertical, FiTrash2 } from "react-icons/fi";

function Notes({ onLogout }) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    const handleAddNote = () => {
        if (noteTitle.trim()) {
            const newNote = {
                id: Date.now(),
                title: noteTitle,
                content: noteContent,
                createdAt: new Date().toLocaleString()
            };
            setNotes([newNote, ...notes]);
            setIsModalOpen(false);
            setNoteTitle("");
            setNoteContent("");
        }
    };

    const handleNoteClick = (note) => {
        setSelectedNote(note);
        setOpenMenuId(null); // Close menu when selecting a note
    };

    const handleDeleteNote = (noteId) => {
        setNotes(notes.filter(note => note.id !== noteId));
        if (selectedNote?.id === noteId) {
            setSelectedNote(null);
        }
        setOpenMenuId(null);
    };

    const toggleMenu = (noteId, event) => {
        event.stopPropagation(); // Prevent note selection when clicking menu
        setOpenMenuId(openMenuId === noteId ? null : noteId);
    };

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

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
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ">
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
                        <p className="text-gray-600 mb-4">Created: {selectedNote.createdAt}</p>
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
