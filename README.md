# 🏢 Quản Lý Cơ Sở Vật Chất

Ứng dụng quản lý thiết bị và cơ sở vật chất được xây dựng với React, TypeScript và Material-UI.

## ✨ Tính năng chính

- 🔐 **Hệ thống đăng nhập** với phân quyền (Admin, Teacher, Student)
- 📱 **Quản lý thiết bị** với CRUD operations
- 🏗️ **Quản lý cơ sở vật chất** 
- 📊 **Báo cáo và thống kê**
- 🔄 **Đồng bộ dữ liệu** với Google Sheets
- 📱 **Tạo và in mã QR** cho thiết bị
- 🔍 **Bộ lọc tìm kiếm** thông minh
- 📱 **Responsive design** cho mọi thiết bị

## 🚀 Deploy trên Netlify

### Bước 1: Fork Repository
1. Vào [GitHub Repository](https://github.com/nhocac1994/quan-ly-co-so-demo)
2. Click "Fork" để tạo bản copy

### Bước 2: Deploy trên Netlify
1. Vào [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Chọn GitHub và chọn repository đã fork
4. Cấu hình build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
5. Click "Deploy site"

### Bước 3: Cấu hình Environment Variables (Tùy chọn)
Nếu muốn sử dụng Google OAuth, thêm các biến môi trường trong Netlify:
- `REACT_APP_GOOGLE_CLIENT_ID`
- `REACT_APP_GOOGLE_CLIENT_SECRET`

## 🛠️ Cài đặt local

```bash
# Clone repository
git clone https://github.com/nhocac1994/quan-ly-co-so-demo.git
cd quan-ly-co-so-demo

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

## 👥 Tài khoản demo

### Quản Trị Viên
- **Email:** admin@demo.com
- **Password:** admin@demo.com

### Giáo Viên
- **Email:** teacher@demo.com
- **Password:** teacher@demo.com

### Học Sinh
- **Email:** student@demo.com
- **Password:** student@demo.com

## 📱 Tính năng QR Code

- Click icon QR Code trong bảng thiết bị
- Xem thông tin chi tiết và mã QR
- In mã QR để dán lên thiết bị
- Quét mã QR để kiểm tra thông tin

## 🔍 Bộ lọc tìm kiếm

- **Tìm kiếm tổng hợp:** Tên, loại, vị trí, nhà cung cấp
- **Lọc theo tình trạng:** Đang sử dụng, Hỏng hóc, Bảo trì, Ngừng sử dụng
- **Lọc theo loại thiết bị:** Tự động từ dữ liệu
- **Lọc theo vị trí:** Tự động từ dữ liệu
- **Kết hợp nhiều bộ lọc**

## 🎨 Giao diện

- **Material-UI v5:** Thiết kế hiện đại
- **Responsive:** Hoạt động tốt trên mobile/tablet/desktop
- **Dark/Light theme:** Tự động theo hệ thống
- **Animations:** Chuyển đổi mượt mà

## 🔧 Công nghệ sử dụng

- **Frontend:** React 18 + TypeScript
- **UI Framework:** Material-UI v5
- **State Management:** React Context + React Query
- **Routing:** React Router v6
- **QR Code:** react-qr-code + qrcode
- **Storage:** localStorage + Google Sheets API
- **Build Tool:** Create React App

## 📁 Cấu trúc project

```
src/
├── components/          # React components
├── contexts/           # React contexts
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript types
├── data/               # Sample data
└── utils/              # Utility functions
```

## 🚀 Scripts

```bash
npm start          # Chạy development server
npm run build      # Build production
npm test           # Chạy tests
npm run eject      # Eject CRA (không khuyến khích)
```

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📞 Liên hệ

- **GitHub:** [@nhocac1994](https://github.com/nhocac1994)
- **Email:** [email protected]

---

⭐ Nếu project này hữu ích, hãy cho một star trên GitHub! 