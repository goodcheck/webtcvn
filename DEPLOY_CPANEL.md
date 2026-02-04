# Deploy lên cPanel - Hướng dẫn chi tiết

## 📋 Chuẩn bị

### Bước 1: Tạo MongoDB Atlas (Database)
1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Đăng ký tài khoản FREE
3. Tạo cluster (chọn FREE tier M0)
4. Database Access → Add User:
   - Username: `tcvn_admin`
   - Password: Tạo password mạnh (lưu lại)
5. Network Access → Add IP: `0.0.0.0/0`
6. Connect → Connect your application → Copy connection string
   - Ví dụ: `mongodb+srv://tcvn_admin:PASSWORD@cluster0.xxxxx.mongodb.net/tcvn-system`

---

## 🔧 PHẦN 1: Deploy Backend (Node.js API)

### Bước 1: Upload code backend

**Cách 1: Qua File Manager**
1. Nén thư mục `backend` thành `backend.zip`
2. Đăng nhập cPanel → File Manager
3. Vào thư mục home (thường là `/home/username/`)
4. Upload `backend.zip`
5. Click chuột phải → Extract

**Cách 2: Qua FTP**
1. Dùng FileZilla kết nối FTP
2. Upload toàn bộ thư mục `backend`

### Bước 2: Setup Node.js App trong cPanel

1. **Vào "Setup Node.js App"** trong cPanel
2. Click **"Create Application"**
3. Điền thông tin:
   - **Node.js version**: 18.x (hoặc cao nhất)
   - **Application mode**: Production
   - **Application root**: `backend` (hoặc đường dẫn đến thư mục backend)
   - **Application URL**: Chọn domain hoặc subdomain
     - Ví dụ: `api.yourdomain.com` hoặc `yourdomain.com/api`
   - **Application startup file**: `server.js`
4. Click **"Create"**

### Bước 3: Cài đặt dependencies

1. Trong cùng trang "Setup Node.js App", tìm phần **"Run NPM Install"**
2. Click **"Run NPM Install"** → Đợi cài đặt xong

HOẶC qua Terminal:
```bash
cd ~/backend
npm install --production
```

### Bước 4: Cấu hình Environment Variables

Trong trang "Setup Node.js App":
1. Tìm phần **"Environment Variables"**
2. Thêm các biến sau:

```
NODE_ENV = production
PORT = 5000
MONGODB_URI = mongodb+srv://tcvn_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tcvn-system
JWT_SECRET = your-random-secret-key-min-32-characters
JWT_EXPIRE = 30d
CLIENT_URL = https://yourdomain.com
```

**Lưu ý**: Thay `YOUR_PASSWORD` và `yourdomain.com` bằng giá trị thực

### Bước 5: Seed Database

Qua Terminal trong cPanel:
```bash
cd ~/backend
npm run seed
```

Kết quả: Sẽ tạo sample data và admin user

### Bước 6: Start Application

1. Quay lại trang "Setup Node.js App"
2. Click **"Restart"** hoặc **"Start"**
3. Kiểm tra status: Phải là **"Running"**

### Bước 7: Test Backend

Mở trình duyệt, truy cập:
```
https://yourdomain.com/api/health
```

Kết quả mong đợi:
```json
{"status":"OK","message":"TCVN API is running"}
```

---

## 🎨 PHẦN 2: Deploy Frontend (React App)

### Option A: Deploy vào subfolder (Khuyến nghị)

#### Bước 1: Build frontend trên máy local

```bash
cd G:\webtcvn\frontend

# Tạo file .env.production
echo REACT_APP_API_URL=https://yourdomain.com/api > .env.production

# Build
npm run build
```

#### Bước 2: Upload build lên cPanel

1. Nén thư mục `build` thành `build.zip`
2. cPanel → File Manager
3. Vào `public_html`
4. Tạo thư mục mới: `tcvn`
5. Vào thư mục `tcvn`
6. Upload `build.zip`
7. Extract
8. Di chuyển tất cả file từ `build/*` ra ngoài `tcvn/`

Cấu trúc cuối cùng:
```
public_html/
├── tcvn/
│   ├── index.html
│   ├── static/
│   └── ...
└── (WordPress files nếu có)
```

#### Bước 3: Cấu hình .htaccess

Tạo file `.htaccess` trong `public_html/tcvn/`:

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

#### Bước 4: Truy cập

Frontend: `https://yourdomain.com/tcvn`

### Option B: Deploy vào subdomain

#### Bước 1: Tạo subdomain

1. cPanel → **Subdomains**
2. Tạo subdomain: `tcvn`
3. Document Root: `/home/username/public_html/tcvn`

#### Bước 2: Build và upload (giống Option A)

```bash
# Build với subdomain URL
echo REACT_APP_API_URL=https://yourdomain.com/api > .env.production
npm run build
```

Upload vào `/home/username/public_html/tcvn/`

#### Bước 3: Truy cập

Frontend: `https://tcvn.yourdomain.com`

---

## 🔄 PHẦN 3: Cấu hình Reverse Proxy (Quan trọng!)

Để API hoạt động tại `/api` thay vì port riêng:

### Bước 1: Tạo file .htaccess trong public_html

```apache
# API Proxy
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]

# WordPress (nếu có)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/tcvn
RewriteRule . /index.php [L]
```

**Lưu ý**: Thay `5000` bằng port Node.js app của bạn (xem trong Setup Node.js App)

---

## ✅ Checklist Deploy cPanel

### Backend
- [ ] Upload code backend
- [ ] Setup Node.js App trong cPanel
- [ ] Cài npm packages
- [ ] Thêm Environment Variables
- [ ] Seed database
- [ ] Start app
- [ ] Test: `yourdomain.com/api/health`

### Frontend
- [ ] Build production với đúng API_URL
- [ ] Upload vào public_html/tcvn
- [ ] Tạo .htaccess
- [ ] Test: `yourdomain.com/tcvn`

### Integration
- [ ] Cấu hình reverse proxy
- [ ] Test đăng nhập
- [ ] Test search
- [ ] Test export

---

## 🐛 Troubleshooting cPanel

### Node.js App không start

**Kiểm tra:**
1. cPanel → Setup Node.js App → View logs
2. Terminal: `cd ~/backend && npm start`
3. Xem error message

**Lỗi thường gặp:**
- Port đã được dùng → Đổi PORT trong env
- MongoDB connection failed → Kiểm tra MONGODB_URI
- Missing dependencies → Chạy lại `npm install`

### API trả về 404

**Giải pháp:**
1. Kiểm tra reverse proxy trong .htaccess
2. Kiểm tra Node.js app đang chạy
3. Kiểm tra port đúng

### Frontend blank page

**Kiểm tra:**
1. F12 → Console → Xem lỗi
2. Kiểm tra REACT_APP_API_URL đúng chưa
3. Rebuild với đúng env

### CORS Error

**Giải pháp:**
1. Kiểm tra CLIENT_URL trong backend env
2. Phải match chính xác với frontend URL
3. Restart Node.js app

---

## 📊 Cấu trúc cuối cùng

```
/home/username/
├── backend/                    # Node.js Backend
│   ├── server.js
│   ├── package.json
│   └── ...
├── public_html/
│   ├── tcvn/                  # React Frontend
│   │   ├── index.html
│   │   └── static/
│   ├── .htaccess              # Reverse proxy
│   └── (WordPress files)
```

### URLs

- **WordPress**: `https://yourdomain.com`
- **TCVN Frontend**: `https://yourdomain.com/tcvn`
- **TCVN API**: `https://yourdomain.com/api`

---

## 🎯 Lưu ý quan trọng

1. **Node.js App phải luôn chạy**: Kiểm tra trong cPanel
2. **Restart sau khi thay đổi env**: Setup Node.js App → Restart
3. **Backup trước khi deploy**: Backup WordPress và database
4. **SSL Certificate**: Đảm bảo có HTTPS (Let's Encrypt trong cPanel)

---

## 💡 Tips

### Auto-restart khi server reboot

Trong cPanel, Node.js app thường tự động restart. Nếu không:
1. Setup Node.js App → Enable "Start on boot"

### Monitor logs

```bash
# Via Terminal
cd ~/backend
tail -f logs/app.log
```

### Update code

1. Upload code mới
2. Setup Node.js App → Restart

---

## 🆘 Cần hỗ trợ thêm?

Nếu gặp vấn đề:
1. Screenshot error message
2. Check logs trong cPanel
3. Liên hệ support hosting nếu cần

**Chi phí**: $0 (dùng hosting hiện tại) + MongoDB Atlas FREE
