const db = require('../config/db')
const { DataTypes } = require('sequelize')


const Note = sequelize.define('Note', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE
    }
}, {
    tableName:'notes',
    timeSstamps:false
})