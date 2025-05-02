const pino = require('pino');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const transport = pino.transport({
    target: 'pino/file',
    options: {
        destination: path.join(logDir, 'app.log'),
        mkdir: true
    }
});

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        }
    }
}, transport);

const httpLogger = logger.child({ module: 'http' });

const dbLogger = logger.child({ module: 'database' });

const authLogger = logger.child({ module: 'auth' });

module.exports = {
    logger,
    httpLogger,
    dbLogger,
    authLogger
}; 