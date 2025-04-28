const jwt = require('jsonwebtoken');
const { authLogger } = require('../utils/logger');
const User = require('../models/User');

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            authLogger.warn(`Signup attempt with existing email: ${email}`);
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user
        const user = await User.create({ name, email, password });
        authLogger.info(`New user created: ${user.id}`);

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        authLogger.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            authLogger.warn(`Login attempt with non-existent email: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            authLogger.warn(`Invalid password attempt for user: ${user.id}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        authLogger.info(`User logged in: ${user.id}`);
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        authLogger.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        authLogger.info(`User logged out: ${req.user.id}`);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        authLogger.error('Logout error:', error);
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
}; 