# HƯỚNG DẪN DEPLOY TRỰC TIẾP (KHÔNG CẦN GITHUB)

Do bạn không vào được GitHub, chúng ta sẽ đẩy code trực tiếp từ máy tính lên Server.

## ✅ Bước 1: Deploy Backend lên Railway

1. **Cài đặt Railway CLI**:
   Mở Terminal (PowerShell) tại `G:\webtcvn` và chạy:
   ```powershell
   npm install -g @railway/cli
   ```

2. **Đăng nhập Railway**:
   ```powershell
   railway login
   ```
   (Nó sẽ mở trình duyệt, bạn bấm xác nhận đăng nhập. Nếu không mở được trình duyệt, báo tôi để dùng cách khác).

3. **Deploy Backend**:
   ```powershell
   cd backend
   railway init
   # Chọn "Empty Project" -> Đặt tên tùy ý
   railway up
   ```
   Code sẽ được đẩy lên. Chờ vài phút.

4. **Cấu hình Biến môi trường (Environment Variables)**:
   - Truy cập dashboard [railway.app](https://railway.app).
   - Chọn dự án vừa tạo.
   - Vào tab **Variables**.
   - Thêm các biến (giống cPanel):
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `MONGODB_URI`: (Copy từ MongoDB Atlas)
     - `JWT_SECRET`: (Chuỗi bất kỳ)
   - Railway sẽ tự động restart server.

5. **Lấy Link Backend**:
   - Vào tab **Settings** -> **Domains**.
   - Bấm **Generate Domain**.
   - Copy domain đó (VD: `https://backend-production.up.railway.app`).

---

## ✅ Bước 2: Deploy Frontend lên Vercel

1. **Cài đặt Vercel CLI**:
   Mở Terminal mới tại `G:\webtcvn` và chạy:
   ```powershell
   npm install -g vercel
   ```

2. **Đăng nhập Vercel**:
   ```powershell
   vercel login
   ```
   (Chọn Email, nhập email của bạn, xác nhận qua mail).

3. **Deploy Frontend**:
   ```powershell
   cd frontend
   vercel --prod
   ```
   Khi được hỏi, cứ bấm **Enter** cho tất cả các câu hỏi mặc định.

4. **Cấu hình Biến môi trường Frontend**:
   - Vào [vercel.com](https://vercel.com) -> Chọn dự án vừa tạo -> **Settings** -> **Environment Variables**.
   - Thêm biến: `REACT_APP_API_URL`
   - Giá trị: Link Backend Railway bạn vừa copy ở Bước 1 + `/api` (VD: `https://backend-production.up.railway.app/api`).
   - Bấm **Save**.

5. **Redeploy (Để cập nhật biến môi trường)**:
   - Quay lại Terminal máy tính.
   - Chạy lại: `vercel --prod`

---

## 🎉 Hoàn tất

Sau khi lệnh `vercel --prod` chạy xong, nó sẽ hiện ra link trang web (VD: `https://webtcvn.vercel.app`).

- Vào Railway, cập nhật lại biến `CLIENT_URL` thành link frontend này.
- Xong! Bạn có thể vào web test thử.
