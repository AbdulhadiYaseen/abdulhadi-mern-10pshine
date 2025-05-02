import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Notes from './components/Notes';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Navbar from './components/Navbar';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { useAuth } from './context/AuthContext';

function App() {
    const { user, loading } = useAuth();

    const PrivateRoute = ({ children }) => {
        if (loading) {
            return <div className="flex justify-center items-center h-screen">Loading...</div>;
        }
        return user ? children : <Navigate to="/login" />;
    };

    const handleLogout = () => {
        
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={
                    user ? <Navigate to="/notes" /> : <Login onLogin={() => {}} />
                } />
                <Route path="/signup" element={
                    user ? <Navigate to="/notes" /> : <SignUp />
                } />

                <Route path="/" element={
                    <PrivateRoute>
                        <div className="flex flex-col h-screen">
                            <Navbar />
                            <div className="flex-1">
                                <Notes onLogout={handleLogout} />
                            </div>
                        </div>
                    </PrivateRoute>
                } />
                <Route path="/notes" element={
                    <PrivateRoute>
                        <div className="flex flex-col h-screen">
                            <Navbar />
                            <div className="flex-1">
                                <Notes onLogout={handleLogout} />
                            </div>
                        </div>
                    </PrivateRoute>
                } />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <div className="flex flex-col h-screen">
                            <Navbar />
                            <div className="flex-1">
                                <Dashboard />
                            </div>
                        </div>
                    </PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute>
                        <div className="flex flex-col h-screen">
                            <Navbar />
                            <div className="flex-1">
                                <Profile />
                            </div>
                        </div>
                    </PrivateRoute>
                } />
                <Route path="/settings" element={
                    <PrivateRoute>
                        <div className="flex flex-col h-screen">
                            <Navbar />
                            <div className="flex-1">
                                <Settings />
                            </div>
                        </div>
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;
