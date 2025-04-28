const pino = require('pino');
const path = require('path');

// Create a transport that writes to a file
const transport = pino.transport({
    target: 'pino/file',
    options: {
        destination: path.join(__dirname, '../logs/app.log'),
        mkdir: true
    }
});

// Create the logger instance
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        }
    }
}, transport);

// Create a child logger for HTTP requests
const httpLogger = logger.child({ module: 'http' });

// Create a child logger for database operations
const dbLogger = logger.child({ module: 'database' });

// Create a child logger for authentication
const authLogger = logger.child({ module: 'auth' });

module.exports = {
    logger,
    httpLogger,
    dbLogger,
    authLogger
}; 