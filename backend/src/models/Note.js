const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { dbLogger } = require('../utils/logger');

const Note = sequelize.define('Note', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    hooks: {
        afterCreate: (note) => {
            dbLogger.info(`Note created: ${note.id}`);
        },
        afterUpdate: (note) => {
            dbLogger.info(`Note updated: ${note.id}`);
        },
        afterDestroy: (note) => {
            dbLogger.info(`Note deleted: ${note.id}`);
        }
    }
});

module.exports = Note; 