const express = require('express');
const cors = require('cors');
const { httpLogger } = require('./utils/logger');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();
console.log('Connected to database');

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

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

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use((req, res, next) => {
    res.status(404).json({
        message: 'Resource not found'
    });
});

app.use(errorHandler);

module.exports = app; 