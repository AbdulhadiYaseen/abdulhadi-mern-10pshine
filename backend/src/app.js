const express = require('express');
const cors = require('cors');
const { httpLogger } = require('./utils/logger');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    httpLogger.info({
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params
    });
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Error handling
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

module.exports = app; 