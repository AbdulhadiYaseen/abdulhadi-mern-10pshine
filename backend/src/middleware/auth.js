const jwt = require('jsonwebtoken');
const { authLogger } = require('../utils/logger');
const { User } = require('../models');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            authLogger.warn('No token provided');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            authLogger.warn(`Invalid token for user ID: ${decoded.userId}`);
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = user;
        req.token = token;
        authLogger.info(`User authenticated: ${user.id}`);
        next();
    } catch (error) {
        authLogger.error('Authentication error:', error);
        res.status(401).json({ message: 'Please authenticate' });
    }
};

module.exports = auth; 