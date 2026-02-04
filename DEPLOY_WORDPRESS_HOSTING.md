# Deploy lên Hosting WordPress hiện có

## 📋 Yêu cầu hosting

Hosting của bạn cần có:
- ✅ **Node.js** (version 14+)
- ✅ **MongoDB** hoặc khả năng kết nối MongoDB Atlas
- ✅ **SSH access** (để cài đặt)
- ✅ **Port** mở cho Node.js app (thường 3000, 5000)

> **Lưu ý**: Hầu hết shared hosting WordPress **KHÔNG** hỗ trợ Node.js. Bạn cần VPS hoặc hosting có hỗ trợ Node.js.

---

## 🔍 Kiểm tra hosting của bạn

### Cách 1: Qua cPanel/Hosting Panel
1. Đăng nhập cPanel
2. Tìm "Select Node.js Version" hoặc "Node.js Selector"
3. Nếu có → OK, tiếp tục
4. Nếu không → Xem Option 2 bên dưới

### Cách 2: Qua SSH
```bash
# SSH vào server
ssh username@your-domain.com

# Kiểm tra Node.js
node --version

# Kiểm tra npm
npm --version

# Kiểm tra MongoDB (nếu có)
mongod --version
```

---

## ✅ Option 1: Hosting HỖ TRỢ Node.js (VPS, Cloud Hosting)

### Bước 1: Upload code

```bash
# Trên máy local, nén code
cd G:\webtcvn
tar -czf tcvn-app.tar.gz backend frontend

# Upload lên server (qua FTP hoặc SCP)
scp tcvn-app.tar.gz username@your-domain.com:/home/username/
```

### Bước 2: Setup trên server

```bash
# SSH vào server
ssh username@your-domain.com

# Giải nén
cd /home/username
tar -xzf tcvn-app.tar.gz

# Tạo thư mục apps nếu chưa có
mkdir -p apps
mv backend apps/tcvn-backend
mv frontend apps/tcvn-frontend
```

### Bước 3: Setup Backend

```bash
cd /home/username/apps/tcvn-backend

# Cài đặt dependencies
npm install --production

# Tạo file .env
nano .env
```

Paste vào:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tcvn-system
JWT_SECRET=your-random-secret-key
JWT_EXPIRE=30d
CLIENT_URL=https://yourdomain.com
```

```bash
# Seed database
npm run seed

# Cài PM2 (process manager)
npm install -g pm2

# Chạy backend
pm2 start server.js --name tcvn-backend
pm2 save
pm2 startup
```

### Bước 4: Setup Frontend

```bash
cd /home/username/apps/tcvn-frontend

# Cài đặt dependencies
npm install

# Tạo .env.production
nano .env.production
```

Paste:
```
REACT_APP_API_URL=https://yourdomain.com:5000/api
```

```bash
# Build production
npm run build

# Copy build vào public_html
cp -r build/* /home/username/public_html/tcvn/
```

### Bước 5: Cấu hình Apache/Nginx

#### Nếu dùng Apache (cPanel)

Tạo file `.htaccess` trong `/public_html/tcvn/`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /tcvn/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /tcvn/index.html [L]
</IfModule>
```

#### Nếu dùng Nginx

Thêm vào config:
```nginx
# Backend API
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Frontend
location /tcvn {
    alias /home/username/public_html/tcvn;
    try_files $uri /tcvn/index.html;
}
```

### Bước 6: Truy cập

- Frontend: `https://yourdomain.com/tcvn`
- Backend API: `https://yourdomain.com/api`
- WordPress vẫn chạy bình thường tại: `https://yourdomain.com`

---

## ❌ Option 2: Hosting KHÔNG hỗ trợ Node.js (Shared Hosting)

Nếu hosting chỉ hỗ trợ PHP/WordPress, bạn có 2 lựa chọn:

### Lựa chọn A: Dùng Subdomain + Hosting riêng

1. **Giữ WordPress** tại: `yourdomain.com`
2. **Deploy TCVN** lên hosting khác:
   - Backend: Railway ($5/tháng)
   - Frontend: Vercel (FREE)
   - Truy cập tại: `tcvn.yourdomain.com` (point subdomain đến Vercel)

**Setup subdomain:**
```
# Trong DNS settings của domain
tcvn.yourdomain.com → CNAME → your-app.vercel.app
```

### Lựa chọn B: Nâng cấp Hosting

Nâng cấp lên VPS hoặc Cloud Hosting hỗ trợ Node.js:
- **DigitalOcean**: $6/tháng
- **Vultr**: $6/tháng  
- **Linode**: $5/tháng
- **AWS Lightsail**: $5/tháng

---

## 🎯 Khuyến nghị theo loại hosting

### Shared Hosting (cPanel, Hostinger, etc.)
❌ **Không khuyến nghị** - Không hỗ trợ Node.js

**Giải pháp**: 
- Giữ WordPress trên shared hosting
- Deploy TCVN lên Vercel + Railway (FREE/rẻ)
- Dùng subdomain: `tcvn.yourdomain.com`

### VPS (DigitalOcean, Vultr, AWS EC2)
✅ **Khuyến nghị** - Có full control

**Setup**:
- WordPress: Port 80/443
- TCVN Backend: Port 5000
- TCVN Frontend: Build vào subfolder

### Cloud Hosting (Cloudways, Kinsta)
✅ **Có thể** - Tùy gói

**Kiểm tra**: Liên hệ support xem có hỗ trợ Node.js không

---

## 📊 So sánh các phương án

| Phương án | Chi phí | Độ khó | Phù hợp |
|-----------|---------|--------|---------|
| **Cùng VPS** | $0 (nếu đã có VPS) | Trung bình | ✅ Nếu có VPS |
| **Subdomain + Railway/Vercel** | $5/tháng | Dễ | ✅ Shared hosting |
| **Nâng cấp VPS** | $5-10/tháng | Khó | ⚠️ Nếu muốn full control |

---

## 🔧 Cấu hình cụ thể cho WordPress + TCVN

### Cấu trúc thư mục đề xuất

```
/home/username/
├── public_html/              # WordPress
│   ├── wp-content/
│   ├── wp-admin/
│   └── tcvn/                 # TCVN Frontend (build)
│       ├── index.html
│       └── static/
├── apps/
│   └── tcvn-backend/         # TCVN Backend
│       ├── server.js
│       └── ...
```

### URLs

- WordPress: `https://yourdomain.com`
- TCVN: `https://yourdomain.com/tcvn`
- API: `https://yourdomain.com/api` (proxy đến port 5000)

---

## ✅ Checklist Deploy lên Hosting WordPress

### Kiểm tra trước
- [ ] Hosting có hỗ trợ Node.js?
- [ ] Có SSH access?
- [ ] Có thể mở port cho Node.js?

### Nếu CÓ Node.js
- [ ] Upload code
- [ ] Cài npm packages
- [ ] Setup PM2
- [ ] Cấu hình reverse proxy
- [ ] Build frontend vào subfolder

### Nếu KHÔNG có Node.js
- [ ] Tạo subdomain
- [ ] Deploy backend lên Railway
- [ ] Deploy frontend lên Vercel
- [ ] Point subdomain đến Vercel

---

## 🆘 Cần hỗ trợ?

**Cho tôi biết:**
1. Tên hosting provider của bạn (Hostinger, cPanel, etc.)
2. Loại hosting (Shared, VPS, Cloud)
3. Có SSH access không?

Tôi sẽ hướng dẫn cụ thể cho trường hợp của bạn!
