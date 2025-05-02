import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Profile() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        
        navigate('/notes');
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user?.name || 'User Name'}</h2>
                        <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                            type="text" 
                            name="name"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" 
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            name="email"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" 
                            value={formData.email}
                            onChange={handleChange}
                            disabled
                        />
                    </div>
                    <button 
                        onClick={handleSave}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile; 