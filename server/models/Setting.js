const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Setting = sequelize.define('Setting', {
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Setting;
