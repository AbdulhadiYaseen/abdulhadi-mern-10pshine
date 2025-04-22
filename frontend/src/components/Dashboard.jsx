import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';

function Dashboard() {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);

    const handleNoteClick = (noteId) => {
        navigate(`/notes/${noteId}`);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <button 
                    onClick={() => navigate('/notes')}
                    className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
                >
                    <FiPlus className="mr-2" />
                    New Note
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                    <div 
                        key={note.id}
                        onClick={() => handleNoteClick(note.id)}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
                    >
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">{note.title}</h2>
                        <p className="text-gray-600 text-sm mb-4">Created: {note.createdAt}</p>
                        <div className="text-gray-600 line-clamp-3">
                            {note.content.split('\n').map((line, index) => {
                                if (line.startsWith('#')) {
                                    return <p key={index} className="font-semibold mb-1">{line.substring(2)}</p>;
                                }
                                if (line.startsWith('##')) {
                                    return <p key={index} className="font-semibold mb-1">{line.substring(3)}</p>;
                                }
                                if (line.startsWith('•')) {
                                    return <p key={index} className="ml-4 mb-1">{line.substring(2)}</p>;
                                }
                                return <p key={index} className="mb-1">{line}</p>;
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {notes.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No notes yet. Create your first note!</p>
                    <button 
                        onClick={() => navigate('/notes')}
                        className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
                    >
                        Create Note
                    </button>
                </div>
            )}
        </div>
    );
}

export default Dashboard; 