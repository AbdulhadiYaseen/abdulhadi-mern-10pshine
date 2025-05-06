const { Sequelize } = require('sequelize');
const { logger } = require('../utils/logger');

const sequelize = new Sequelize(
     process.env.DB_NAME || 'notes-management',
     process.env.DB_USER || 'root',
     process.env.DB_PASS || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: (msg) => logger.info(msg),
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const resetDatabase = async () => {
    try {

        await sequelize.query(`SET FOREIGN_KEY_CHECKS = 0`);
        await sequelize.query(`DROP TABLE IF EXISTS Users`);
        await sequelize.query(`DROP TABLE IF EXISTS Notes`);
        await sequelize.query(`SET FOREIGN_KEY_CHECKS = 1`);
        logger.info('Database tables reset successfully');
        console.log('Database tables reset successfully');
    } catch (error) {
        logger.error('Error resetting database:', error);
        console.error('Error resetting database:', error);
    }
};

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection has been established successfully.');
        console.log('Database connection has been established successfully.');

        if (process.env.NODE_ENV !== 'production') {
            await resetDatabase();
        }

        const syncOptions = { 
            force: true  
        };
            
        await sequelize.sync(syncOptions);
        
        logger.info('All models were synchronized successfully.');
        console.log('All models were synchronized successfully.');
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB }; 