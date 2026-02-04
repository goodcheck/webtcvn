# QUICK START GUIDE

## 🚀 Chạy Local (Development)

### Bước 1: Cài đặt MongoDB
- Download: https://www.mongodb.com/try/download/community
- Hoặc dùng Docker: `docker run -d -p 27017:27017 mongo`

### Bước 2: Backend
```bash
cd backend
npm install
npm run seed    # Tạo sample data
npm run dev     # Chạy server
```
✅ Backend chạy tại: http://localhost:5000

### Bước 3: Frontend
```bash
cd frontend
npm install
npm start       # Chạy React app
```
✅ Frontend chạy tại: http://localhost:3000

### Bước 4: Đăng nhập
- Email: `admin@tcvn.vn`
- Password: `admin123`

---

## 🌐 Deploy lên Internet (Production)

### Cách nhanh nhất (Khuyến nghị)

#### 1. MongoDB Atlas (Database)
1. Tạo tài khoản: https://www.mongodb.com/cloud/atlas
2. Tạo free cluster
3. Lấy connection string
4. Whitelist IP: `0.0.0.0/0`

#### 2. Railway (Backend)
```bash
npm install -g @railway/cli
cd backend
railway login
railway init
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set JWT_SECRET="random-secret-key-here"
railway variables set NODE_ENV="production"
railway up
```
✅ Lấy URL backend: `https://your-app.railway.app`

#### 3. Vercel (Frontend)
```bash
npm install -g vercel
cd frontend
vercel --prod
```
Trong Vercel dashboard, thêm environment variable:
- `REACT_APP_API_URL` = `https://your-backend.railway.app/api`

✅ Website live tại: `https://your-app.vercel.app`

---

## 📝 Checklist Deploy

### Trước khi deploy
- [ ] Test local: Backend + Frontend chạy OK
- [ ] Có MongoDB Atlas account
- [ ] Có Railway account  
- [ ] Có Vercel account

### Backend
- [ ] Update MONGODB_URI
- [ ] Tạo JWT_SECRET mạnh
- [ ] Set CLIENT_URL = frontend URL
- [ ] Deploy lên Railway
- [ ] Test API: `https://your-backend.railway.app/api/health`

### Frontend
- [ ] Update REACT_APP_API_URL
- [ ] Build test: `npm run build`
- [ ] Deploy lên Vercel
- [ ] Test website

### Sau deploy
- [ ] Đăng nhập thử
- [ ] Test search
- [ ] Test export
- [ ] Test trên mobile

---

## 🆘 Gặp vấn đề?

### Backend không kết nối MongoDB
- Kiểm tra MONGODB_URI
- Kiểm tra IP whitelist (phải có 0.0.0.0/0)

### Frontend không gọi được API
- Kiểm tra REACT_APP_API_URL
- Kiểm tra CORS trong backend (CLIENT_URL)

### 404 khi refresh trang
- Vercel tự động fix
- Nếu dùng hosting khác, cần config redirect về index.html

---

## 💰 Chi phí

- MongoDB Atlas: **FREE** (512MB)
- Railway: **$5/tháng** (có $5 free credit)
- Vercel: **FREE**

**Tổng: ~$5/tháng** (hoặc FREE nếu dùng Railway credit)

---

## 📚 Tài liệu đầy đủ

Xem file `DEPLOYMENT.md` để biết thêm chi tiết về:
- Deploy lên Heroku
- Deploy lên VPS
- Setup SSL
- Monitoring
- Troubleshooting
