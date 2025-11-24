# Hướng dẫn chạy Laca POS với PM2

## 📦 Cài đặt PM2 (nếu chưa có)

```bash
npm install -g pm2
```

## 🚀 Khởi chạy server

### Cách 1: Chạy trực tiếp với PM2

```bash
cd server
pm2 start index.js --name "laca-pos-api"
```

### Cách 2: Sử dụng file config (Khuyến nghị)

```bash
cd server
pm2 start ecosystem.config.js
```

## 📊 Quản lý PM2

### Xem danh sách process

```bash
pm2 list
```

hoặc

```bash
pm2 status
```

### Xem logs real-time

```bash
# Tất cả logs
pm2 logs laca-pos-api

# Chỉ errors
pm2 logs laca-pos-api --err

# Chỉ output
pm2 logs laca-pos-api --out

# Xem 100 dòng cuối
pm2 logs laca-pos-api --lines 100
```

### Quản lý process

```bash
# Restart
pm2 restart laca-pos-api

# Stop
pm2 stop laca-pos-api

# Delete (xóa khỏi PM2)
pm2 delete laca-pos-api

# Reload (zero-downtime restart)
pm2 reload laca-pos-api
```

### Monitoring

```bash
# Dashboard realtime
pm2 monit

# Thông tin chi tiết
pm2 show laca-pos-api
```

## 🔄 Tự động khởi động khi reboot

```bash
# Lưu danh sách process hiện tại
pm2 save

# Setup startup script
pm2 startup

# Copy và chạy lệnh mà PM2 hiển thị
```

## 🔧 Update code và restart

```bash
cd /path/to/mini-pos
git pull origin main
cd server
npm install
pm2 restart laca-pos-api
```

## 📝 File log locations

Logs được lưu tại: `server/logs/`
- `err.log` - Error logs
- `out.log` - Output logs
- `combined.log` - Combined logs

## 🛠️ Troubleshooting

### Port already in use

```bash
# Tìm process đang dùng port 2018
lsof -i :2018

# Kill process
kill -9 <PID>

# Restart PM2
pm2 restart laca-pos-api
```

### Memory issues

```bash
# Xem memory usage
pm2 monit

# Restart if memory high
pm2 restart laca-pos-api
```

### Clear logs

```bash
pm2 flush
```

## 📌 Quick Reference

```bash
# Start
pm2 start ecosystem.config.js

# Stop all
pm2 stop all

# Restart all  
pm2 restart all

# Delete all
pm2 delete all

# Logs
pm2 logs

# Monitor
pm2 monit
```

## 🌐 Production URLs

- **API Backend:** https://api.laca.danhtrong.online
- **QR Display:** https://api.laca.danhtrong.online/qr/:percentage
  - /qr/5 - Giảm 5%
  - /qr/10 - Giảm 10%
  - /qr/15 - Giảm 15%
  - /qr/20 - Giảm 20%

## 🔐 Security Notes

1. Đảm bảo file `database.sqlite` được backup thường xuyên
2. Không commit file `.env` lên Git
3. Đổi mật khẩu admin mặc định ngay lập tức
4. Sử dụng HTTPS cho production
5. Setup firewall để chỉ cho phép port cần thiết

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. PM2 logs: `pm2 logs laca-pos-api`
2. Server status: `pm2 show laca-pos-api`
3. Port availability: `lsof -i :2018`
