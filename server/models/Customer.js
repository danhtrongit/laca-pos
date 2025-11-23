const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Customer = sequelize.define('Customer', {
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currentPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = Customer;
