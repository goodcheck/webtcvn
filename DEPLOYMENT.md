# DEPLOYMENT GUIDE - Hệ thống TCVN/QCVN

## 🚀 Các bước chuẩn bị trước khi deploy

### 1. Chuẩn bị Backend

#### a. Cập nhật package.json
Đảm bảo có script `start` cho production:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

#### b. Cập nhật server.js
- Đã có CORS configuration
- Đã có error handling
- Đã có MongoDB connection

#### c. Environment Variables cần thiết
```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-secure-random-string>
JWT_EXPIRE=30d
CLIENT_URL=<your-frontend-url>
```

### 2. Chuẩn bị Frontend

#### a. Build production
```bash
cd frontend
npm run build
```

#### b. Cập nhật API URL
Tạo file `.env.production` trong frontend:
```
REACT_APP_API_URL=<your-backend-url>/api
```

---

## 🌐 Option 1: Deploy lên Vercel + Railway (Khuyến nghị)

### Backend trên Railway

1. **Tạo tài khoản Railway**: https://railway.app
2. **Tạo MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
   - Tạo free cluster
   - Lấy connection string
   - Whitelist IP: 0.0.0.0/0 (allow all)

3. **Deploy Backend**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize
   cd backend
   railway init
   
   # Add environment variables
   railway variables set MONGODB_URI="your-mongodb-uri"
   railway variables set JWT_SECRET="your-secret"
   railway variables set NODE_ENV="production"
   railway variables set CLIENT_URL="https://your-frontend.vercel.app"
   
   # Deploy
   railway up
   ```

4. **Lấy URL backend**: Ví dụ `https://your-app.railway.app`

### Frontend trên Vercel

1. **Tạo tài khoản Vercel**: https://vercel.com

2. **Deploy Frontend**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Deploy
   cd frontend
   vercel --prod
   ```

3. **Cấu hình Environment Variables trên Vercel**:
   - Vào project settings
   - Add: `REACT_APP_API_URL` = `https://your-backend.railway.app/api`

---

## 🌐 Option 2: Deploy lên Heroku (Cả backend + frontend)

### Backend

1. **Cài Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Deploy**:
   ```bash
   cd backend
   
   # Login
   heroku login
   
   # Create app
   heroku create tcvn-backend
   
   # Add MongoDB
   heroku addons:create mongolab:sandbox
   
   # Set environment variables
   heroku config:set JWT_SECRET="your-secret"
   heroku config:set NODE_ENV="production"
   heroku config:set CLIENT_URL="https://tcvn-frontend.herokuapp.com"
   
   # Deploy
   git init
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

### Frontend

1. **Thêm buildpack**:
   ```bash
   cd frontend
   
   # Create app
   heroku create tcvn-frontend
   
   # Add buildpack
   heroku buildpacks:set mars/create-react-app
   
   # Set API URL
   heroku config:set REACT_APP_API_URL="https://tcvn-backend.herokuapp.com/api"
   
   # Deploy
   git init
   git add .
   git commit -m "Deploy frontend"
   git push heroku main
   ```

---

## 🌐 Option 3: Deploy lên VPS (DigitalOcean, AWS, etc.)

### Yêu cầu
- Ubuntu 20.04+
- Node.js 14+
- MongoDB
- Nginx
- PM2

### Các bước

1. **Setup Server**:
   ```bash
   # Update
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Upload code**:
   ```bash
   # Trên local
   scp -r backend user@your-server-ip:/var/www/
   scp -r frontend user@your-server-ip:/var/www/
   ```

3. **Setup Backend**:
   ```bash
   cd /var/www/backend
   npm install --production
   
   # Create .env
   nano .env
   # Paste environment variables
   
   # Start with PM2
   pm2 start server.js --name tcvn-backend
   pm2 save
   pm2 startup
   ```

4. **Setup Frontend**:
   ```bash
   cd /var/www/frontend
   npm install
   npm run build
   ```

5. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/tcvn
   ```
   
   Paste:
   ```nginx
   # Backend
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   
   # Frontend
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       root /var/www/frontend/build;
       index index.html;
       
       location / {
           try_files $uri /index.html;
       }
   }
   ```
   
   Enable:
   ```bash
   sudo ln -s /etc/nginx/sites-available/tcvn /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL (Optional)**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## ✅ Checklist trước khi deploy

### Backend
- [ ] Cập nhật MONGODB_URI với production database
- [ ] Tạo JWT_SECRET mạnh (ít nhất 32 ký tự random)
- [ ] Set NODE_ENV=production
- [ ] Cập nhật CLIENT_URL với frontend URL
- [ ] Test API endpoints
- [ ] Seed database với production data

### Frontend
- [ ] Build production (`npm run build`)
- [ ] Cập nhật REACT_APP_API_URL
- [ ] Test trên local build
- [ ] Kiểm tra responsive
- [ ] Test authentication flow

### Database
- [ ] Backup database
- [ ] Setup MongoDB Atlas hoặc production MongoDB
- [ ] Whitelist IP addresses
- [ ] Create indexes cho performance

### Security
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Environment variables secured
- [ ] Rate limiting (optional)
- [ ] Input validation

---

## 🔧 Troubleshooting

### CORS errors
- Kiểm tra CLIENT_URL trong backend .env
- Kiểm tra CORS configuration trong server.js

### MongoDB connection failed
- Kiểm tra MONGODB_URI
- Kiểm tra IP whitelist
- Kiểm tra network access

### 404 on refresh (Frontend)
- Cấu hình server để redirect về index.html
- Nginx: `try_files $uri /index.html`
- Vercel: Tự động handle

### API calls failing
- Kiểm tra REACT_APP_API_URL
- Kiểm tra backend đang chạy
- Check browser console for errors

---

## 📊 Monitoring

### Backend
```bash
# PM2 logs
pm2 logs tcvn-backend

# PM2 status
pm2 status

# MongoDB status
sudo systemctl status mongod
```

### Frontend
- Vercel Dashboard: https://vercel.com/dashboard
- Railway Dashboard: https://railway.app/dashboard

---

## 💰 Chi phí ước tính

### Free Tier (Khuyến nghị cho bắt đầu)
- **Vercel**: Free (Frontend)
- **Railway**: $5/month (Backend)
- **MongoDB Atlas**: Free tier (512MB)
- **Total**: ~$5/month

### VPS
- **DigitalOcean Droplet**: $6-12/month
- **Domain**: $10-15/year
- **Total**: ~$10/month

---

## 🎯 Khuyến nghị

**Cho người mới bắt đầu**: Dùng Vercel + Railway + MongoDB Atlas
- Dễ setup
- Free tier tốt
- Auto-scaling
- Không cần quản lý server

**Cho production**: VPS hoặc AWS/GCP
- Kiểm soát hoàn toàn
- Tốt cho scale lớn
- Cần kiến thức DevOps
