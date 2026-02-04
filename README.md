# Hệ thống Tra cứu TCVN/QCVN - README

## 📋 Giới thiệu

Hệ thống tra cứu tiêu chuẩn TCVN/QCVN với khả năng tự động tạo hồ sơ công bố sản phẩm thực phẩm.

## 🚀 Công nghệ sử dụng

### Backend
- Node.js + Express
- MongoDB (Database)
- JWT (Authentication)
- docx, pdfkit, xlsx (Export documents)

### Frontend
- React.js
- React Router
- Axios
- CSS3

## 📦 Cài đặt

### Yêu cầu
- Node.js >= 14.x
- MongoDB >= 4.x

### Backend Setup

```bash
cd backend
npm install
```

Tạo file `.env`:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tcvn-system
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

Seed database:
```bash
npm run seed
```

Chạy server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## 🔑 Tài khoản Demo

- Email: `admin@tcvn.vn`
- Password: `admin123`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user

### Products
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/search?q=query` - Tìm kiếm
- `GET /api/products/:id` - Chi tiết sản phẩm

### Export
- `POST /api/export/tccs` - Xuất TCCS
- `POST /api/export/testing` - Xuất phiếu kiểm nghiệm
- `POST /api/export/declaration` - Xuất hồ sơ công bố
- `POST /api/export/label` - Xuất mẫu nhãn
- `POST /api/export/all` - Xuất tất cả

### History
- `GET /api/history` - Lịch sử tra cứu
- `POST /api/history` - Lưu lịch sử
- `DELETE /api/history/:id` - Xóa lịch sử

## 🎯 Tính năng

✅ Tra cứu sản phẩm với autocomplete
✅ Hiển thị tiêu chuẩn TCVN/QCVN
✅ Chỉ tiêu an toàn thực phẩm
✅ Yêu cầu kiểm nghiệm
✅ Bao bì & Nhãn mác
✅ Xuất hồ sơ (DOCX, PDF, XLSX)
✅ Đăng nhập/Đăng ký
✅ Lịch sử tra cứu
✅ Dashboard người dùng

## 📱 Responsive Design

Website hoạt động tốt trên:
- Desktop
- Tablet
- Mobile

## 🛠️ Development

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm start
```

## 📝 License

MIT
