const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('./database');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Setting = require('./models/Setting');
const User = require('./models/User');
const { authenticateToken, SECRET_KEY } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 2018;

app.use(cors());
app.use(bodyParser.json());

// Initialize Default Settings & Admin User
const initData = async () => {
    try {
        await Setting.findOrCreate({ where: { key: 'moneyToPointRate' }, defaults: { value: '10000' } });
        await Setting.findOrCreate({ where: { key: 'pointToMoneyRate' }, defaults: { value: '1000' } });

        // Create Admin if not exists
        const adminExists = await User.findByPk('admin');
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({ username: 'admin', password: hashedPassword });
            console.log('Admin user created: admin / admin123');
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
};

// Sync Database
sequelize.sync().then(async () => {
    console.log('Database synced');
    await initData();
});

// --- API Endpoints ---

// 0. Auth
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findByPk(username);
        if (!user) return res.status(400).json({ error: 'User not found' });

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '24h' });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 1. Settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await Setting.findAll();
        const result = {};
        settings.forEach(s => result[s.key] = s.value);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/settings', async (req, res) => {
    const settings = req.body; // { key: value, ... }
    try {
        for (const [key, value] of Object.entries(settings)) {
            await Setting.upsert({ key, value: String(value) });
        }
        res.json({ message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Customers
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/customers/:phoneNumber', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.phoneNumber);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/customers/:phoneNumber', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.phoneNumber);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        await customer.update(req.body);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/customers/:phoneNumber', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.phoneNumber);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        await customer.destroy();
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Reports
app.get('/api/reports/dashboard', authenticateToken, async (req, res) => {
    const { type = 'day' } = req.query; // day, month

    try {
        // Summary Stats
        const totalRevenue = await Order.sum('finalAmount');
        const totalOrders = await Order.count();
        const totalPointsGiven = await Order.sum('pointsEarned');

        // Chart Data (Group by Date)
        // SQLite specific syntax for date grouping
        let groupFormat;
        if (type === 'month') {
            groupFormat = '%Y-%m';
        } else {
            groupFormat = '%Y-%m-%d';
        }

        const revenueData = await Order.findAll({
            attributes: [
                [sequelize.fn('strftime', groupFormat, sequelize.col('createdAt')), 'date'],
                [sequelize.fn('sum', sequelize.col('finalAmount')), 'revenue'],
                [sequelize.fn('count', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('strftime', groupFormat, sequelize.col('createdAt'))],
            order: [[sequelize.col('date'), 'ASC']],
            limit: 30 // Last 30 periods
        });

        res.json({
            summary: {
                totalRevenue: totalRevenue || 0,
                totalOrders: totalOrders || 0,
                totalPointsGiven: totalPointsGiven || 0
            },
            chart: revenueData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Orders (The Core Logic)
app.get('/api/orders', authenticateToken, async (req, res) => {
    const { page = 1, limit = 10, customerId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (customerId) where.customerId = customerId;

    try {
        const { count, rows } = await Order.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [{ model: Customer, attributes: ['name', 'phoneNumber'] }]
        });
        res.json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            orders: rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
    const { customerId, totalAmount, discountAmount, pointsUsed, finalAmount } = req.body;

    // Validate basic inputs
    if (finalAmount < 0) return res.status(400).json({ error: 'Invalid final amount' });

    const t = await sequelize.transaction();

    try {
        let pointsEarned = 0;
        let customer = null;

        // Get Settings
        const moneyToPointRate = parseInt((await Setting.findByPk('moneyToPointRate'))?.value || 10000);

        if (customerId) {
            customer = await Customer.findByPk(customerId, { transaction: t });
            if (!customer) throw new Error('Customer not found');

            // Deduct Points Used
            if (pointsUsed > 0) {
                if (customer.currentPoints < pointsUsed) {
                    throw new Error('Insufficient points');
                }
                customer.currentPoints -= pointsUsed;
            }

            // Calculate Points Earned (on Final Amount)
            pointsEarned = Math.floor(finalAmount / moneyToPointRate);
            customer.currentPoints += pointsEarned;
            customer.totalPoints += pointsEarned;

            await customer.save({ transaction: t });
        }

        // Create Order
        const order = await Order.create({
            customerId,
            totalAmount,
            discountAmount,
            pointsUsed,
            pointsEarned,
            finalAmount
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Order processed', order, customer });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
