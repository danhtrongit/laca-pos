const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Customer = require('./Customer');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerId: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: Customer,
            key: 'phoneNumber'
        }
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    discountAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    pointsUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    pointsEarned: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    finalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

Customer.hasMany(Order, { foreignKey: 'customerId' });
Order.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = Order;
