# Laca POS - Mini Point of Sale System

Hệ thống quản lý điểm khách hàng (POS Loyalty System) cho Laca.

## 🚀 Cấu trúc dự án

```
mini-pos/
├── client/          # Frontend (Vue 3 + Vite + Element Plus)
└── server/          # Backend (Node.js + Express + Sequelize + SQLite)
```

## 📋 Yêu cầu hệ thống

- Node.js >= 16.x
- npm >= 8.x
- PM2 (cho production)

## 🛠️ Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/danhtrongit/laca-pos.git
cd laca-pos
```

### 2. Cài đặt dependencies

```bash
# Backend
cd server
npm install

# Frontend  
cd ../client
npm install
```

## 💻 Development

### Chạy Backend (Development)

```bash
cd server
npm run dev
```

Server sẽ chạy tại: `http://localhost:2018`

### Chạy Frontend (Development)

```bash
cd client
npm run dev
```

Client sẽ chạy tại: `http://localhost:5173`

## 🚢 Production Deployment

### 1. Build Frontend

```bash
cd client
npm run build
```

File build sẽ nằm trong thư mục `client/dist/`

### 2. Chạy Backend với PM2

PM2 là công cụ quản lý process Node.js cho production.

#### Cài đặt PM2 (nếu chưa có)

```bash
npm install -g pm2
```

#### Chạy server với PM2

```bash
cd server
pm2 start index.js --name "laca-pos-api"
```

#### Các lệnh PM2 quan trọng

```bash
# Xem danh sách process
pm2 list

# Xem logs
pm2 logs laca-pos-api

# Restart server
pm2 restart laca-pos-api

# Stop server
pm2 stop laca-pos-api

# Xóa process
pm2 delete laca-pos-api

# Lưu danh sách process (tự động khởi động lại sau reboot)
pm2 save
pm2 startup
```

#### File cấu hình PM2 (Tùy chọn)

Tạo file `ecosystem.config.js` trong thư mục `server/`:

```javascript
module.exports = {
  apps: [{
    name: 'laca-pos-api',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 2018
    }
  }]
}
```

Sau đó chạy:

```bash
pm2 start ecosystem.config.js
```

### 3. Deploy Frontend

Upload nội dung thư mục `client/dist/` lên web server hoặc CDN.

Đảm bảo server đã được cấu hình để trỏ API đến `https://api.laca.danhtrong.online`

## 🔑 Thông tin đăng nhập mặc định

- **Username:** admin
- **Password:** admin123

⚠️ **Lưu ý:** Đổi mật khẩu ngay sau lần đăng nhập đầu tiên!

## 📝 API Endpoints

Backend API: `https://api.laca.danhtrong.online`

### Public Endpoints
- `POST /api/login` - Đăng nhập admin

### Protected Endpoints (Cần token)
- `GET /api/settings` - Lấy cấu hình
- `PUT /api/settings` - Cập nhật cấu hình
- `POST /api/settings/qr/:percentage` - Upload QR code
- `GET /api/customers` - Danh sách khách hàng
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Lịch sử đơn hàng
- `GET /api/reports/dashboard` - Báo cáo thống kê

### Public QR Display
- `GET /qr/:percentage` - Hiển thị QR code giảm giá (5, 10, 15, 20)

## 🌐 Cấu hình môi trường

### Development
File: `client/.env.development`
```
VITE_API_URL=http://localhost:2018
```

### Production  
File: `client/.env.production`
```
VITE_API_URL=https://api.laca.danhtrong.online
```

## 📦 Database

Hệ thống sử dụng SQLite, database file: `server/database.sqlite`

### Backup database

```bash
# Backup
cp server/database.sqlite server/database.sqlite.backup

# Restore
cp server/database.sqlite.backup server/database.sqlite
```

## 🔧 Troubleshooting

### Port đã được sử dụng
Thay đổi PORT trong file `server/index.js`:
```javascript
const PORT = process.env.PORT || 2018;
```

### CORS Issues
Kiểm tra cấu hình CORS trong `server/index.js`

## 📄 License

MIT

## 👤 Author

**Danh Trong IT**
- GitHub: [@danhtrongit](https://github.com/danhtrongit)
