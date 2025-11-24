const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for QR image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads/qr'));
    },
    filename: (req, file, cb) => {
        const percentage = req.params.percentage;
        const ext = path.extname(file.originalname);
        cb(null, `qr-${percentage}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

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

// Upload QR code image
app.post('/api/settings/qr/:percentage', authenticateToken, upload.single('qrImage'), async (req, res) => {
    try {
        const percentage = req.params.percentage;
        const validPercentages = ['5', '10', '15', '20'];

        if (!validPercentages.includes(percentage)) {
            return res.status(400).json({ error: 'Invalid percentage. Must be 5, 10, 15, or 20' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Save the filename to settings
        const key = `qr_image_${percentage}`;
        await Setting.upsert({ key, value: req.file.filename });

        res.json({
            message: 'QR image uploaded successfully',
            filename: req.file.filename,
            url: `/uploads/qr/${req.file.filename}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get QR image info
app.get('/api/settings/qr/:percentage', async (req, res) => {
    try {
        const percentage = req.params.percentage;
        const key = `qr_image_${percentage}`;
        const setting = await Setting.findByPk(key);

        if (!setting) {
            return res.json({ exists: false });
        }

        res.json({
            exists: true,
            filename: setting.value,
            url: `/uploads/qr/${setting.value}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Public QR display page
app.get('/qr/:percentage', async (req, res) => {
    try {
        const percentage = req.params.percentage;
        const key = `qr_image_${percentage}`;
        const setting = await Setting.findByPk(key);

        if (!setting) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>QR Code - ${percentage}%</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            min-height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background: #f5f5f5;
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            padding: 20px;
                        }
                        .container {
                            background: white;
                            border-radius: 16px;
                            padding: 48px 40px;
                            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                            max-width: 480px;
                            width: 100%;
                            text-align: center;
                        }
                        .icon {
                            font-size: 4rem;
                            margin-bottom: 16px;
                        }
                        .title {
                            color: #014E27;
                            font-size: 1.75rem;
                            font-weight: 700;
                            margin-bottom: 12px;
                        }
                        .message {
                            color: #6b7280;
                            font-size: 1rem;
                            line-height: 1.6;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">⚠️</div>
                        <div class="title">QR Code Không Tồn Tại</div>
                        <div class="message">
                            Chưa có mã QR nào được tải lên cho giảm giá ${percentage}%.
                        </div>
                    </div>
                </body>
                </html>
            `);
        }

        const imageUrl = `/uploads/qr/${setting.value}`;

        res.send(`
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Laca POS - Giảm giá ${percentage}%</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: #f5f5f5;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        padding: 20px;
                    }
                    .container {
                        background: white;
                        border-radius: 16px;
                        padding: 48px 40px;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                        max-width: 480px;
                        width: 100%;
                        text-align: center;
                    }
                    .logo {
                        color: #014E27;
                        font-size: 1.75rem;
                        font-weight: 700;
                        letter-spacing: -0.5px;
                        margin-bottom: 8px;
                    }
                    .discount-badge {
                        display: inline-block;
                        background: #014E27;
                        color: white;
                        padding: 10px 24px;
                        border-radius: 8px;
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin: 16px 0 32px;
                        letter-spacing: 0.5px;
                    }
                    .qr-wrapper {
                        background: #ffffff;
                        padding: 24px;
                        border: 2px solid #014E27;
                        border-radius: 12px;
                        margin-bottom: 24px;
                        display: inline-block;
                    }
                    .qr-image {
                        display: block;
                        max-width: 280px;
                        width: 100%;
                        height: auto;
                    }
                    .description {
                        color: #374151;
                        font-size: 1rem;
                        line-height: 1.6;
                        margin-bottom: 24px;
                    }
                    .footer {
                        padding-top: 24px;
                        border-top: 1px solid #e5e7eb;
                        color: #9ca3af;
                        font-size: 0.875rem;
                    }
                    @media (max-width: 480px) {
                        .container {
                            padding: 32px 24px;
                        }
                        .logo {
                            font-size: 1.5rem;
                        }
                        .discount-badge {
                            font-size: 1.25rem;
                            padding: 8px 20px;
                        }
                        .qr-wrapper {
                            padding: 16px;
                        }
                        .qr-image {
                            max-width: 240px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">LACA POS</div>
                    <div class="discount-badge">GIẢM ${percentage}%</div>
                    <div class="qr-wrapper">
                        <img src="${imageUrl}" alt="QR Code ${percentage}%" class="qr-image" />
                    </div>
                    <div class="description">
                        Quét mã QR để nhận ưu đãi giảm giá ${percentage}%
                    </div>
                    <div class="footer">
                        Cảm ơn bạn đã sử dụng dịch vụ Laca POS
                    </div>
                </div>
            </body>
            </html>
        `);
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
