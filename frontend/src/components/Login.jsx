import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import notesImage from '../../notes1.png';

function Login({ onLogin }) {
    const navigate = useNavigate();
    const { login, error: authError } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        try {
            await login(formData.email, formData.password);
            onLogin();
            navigate('/notes');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {}
            <div className="hidden md:flex md:w-1/2 bg-yellow-500 flex-col items-center justify-center p-12 text-white">
                <div className="flex items-center mb-8">
                    {}
                    <h1 className="text-4xl font-bold">NoteVault</h1>
                </div>
                
                <img src={notesImage} alt="NoteVault App" className="w-3/4 rounded-lg shadow-xl mb-8" />
                
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4">Your Personal Note Taking Solution</h2>
                    <p className="text-lg">Securely save and access your notes from anywhere</p>
                </div>
            </div>
            
            {}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
                <div className="max-w-md w-full">
                    {}
                    <div className="flex md:hidden items-center justify-center mb-8">
                        <img src={logo} alt="NoteVault Logo" className="w-12 h-12 mr-3" />
                        <h1 className="text-3xl font-bold text-yellow-500">NoteVault</h1>
                    </div>
                    
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
                        Sign in to your account
                    </h2>
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {(error || authError) && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error || authError}</span>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-medium text-yellow-600 hover:text-yellow-500">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login; 