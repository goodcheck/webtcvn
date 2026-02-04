# HƯỚNG DẪN DEPLOY SIÊU TỐC (GITHUB + RAILWAY + VERCEL)

Đây là cách NHANH NHẤT và MIỄN PHÍ để chạy được web ngay lập tức.

## Bước 1: Đẩy code lên GitHub

Bạn cần có tài khoản GitHub. Nếu chưa có, hãy tạo tại github.com.

1. **Tạo repository mới** trên GitHub (đặt tên là `webtcvn`).
2. **Chạy các lệnh sau** tại thư mục dự án `G:\webtcvn` trên máy của bạn:

```powershell
# Khởi tạo git
git init

# Thêm tất cả file
git add .

# Commit code
git commit -m "First commit"

# Đổi nhánh chính
git branch -M main

# Link với repository của bạn (Thay YOUR-USERNAME bằng tên nick GitHub của bạn)
git remote add origin https://github.com/YOUR-USERNAME/webtcvn.git

# Đẩy code lên
git push -u origin main
```

## Bước 2: Deploy Backend lên Railway (5 phút)

1. Truy cập [railway.app](https://railway.app/) và đăng nhập bằng GitHub.
2. Chọn **"New Project"** -> **"Deploy from GitHub repo"**.
3. Chọn repo `webtcvn` bạn vừa tạo.
4. Chọn **"Add Variables"** (Thêm biến môi trường):
   - Nhập các biến sau (giống hệt lúc làm cPanel):
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `MONGODB_URI`: (Copy từ MongoDB Atlas)
     - `JWT_SECRET`: (Nhập chuỗi bất kỳ)
     - `CLIENT_URL`: `https://webtcvn.vercel.app` (Link frontend, sẽ có ở bước 3, cứ điền tạm)
5. Vào **Settings** -> **Root Directory** -> Gõ `/backend`.
6. Bấm **Deploy**. Railway sẽ tự động cài và chạy backend.
7. Vào tab **Settings** -> **Domains** -> Generate Domain. Copy link này (VD: `https://web-production.up.railway.app`).

## Bước 3: Deploy Frontend lên Vercel (3 phút)

1. Truy cập [vercel.com](https://vercel.com/) và đăng nhập bằng GitHub.
2. Bấm **"Add New..."** -> **"Project"**.
3. Import repo `webtcvn`.
4. Ở phần **Framework Preset**, chọn **Create React App**.
5. Ở phần **Root Directory**, bấm Edit và chọn `frontend`.
6. Ở phần **Environment Variables**, thêm:
   - `REACT_APP_API_URL`: Dán link backend Railway vừa copy ở bước 2 vào (VD: `https://web-production.up.railway.app/api`)
7. Bấm **Deploy**.

## Bước 4: Hoàn tất

1. Chờ Vercel báo **Success**. Trang web của bạn đã chạy!
2. Copy link frontend (VD: `https://webtcvn.vercel.app`), quay lại Railway, update biến `CLIENT_URL` cho chính xác.

XONG! 🎉
