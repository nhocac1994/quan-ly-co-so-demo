# 🔧 Hướng Dẫn Thêm Test User cho OAuth 2.0

## 📧 Email cần thêm: `nguyenthihue100796@gmail.com`

### **Bước 1: Truy cập Google Cloud Console**
1. Mở trình duyệt và vào: https://console.cloud.google.com/
2. Đăng nhập bằng tài khoản Google của bạn
3. Chọn project có chứa OAuth 2.0 Client ID

### **Bước 2: Vào OAuth consent screen**
1. Trong menu bên trái, click **"APIs & Services"**
2. Click **"OAuth consent screen"**
3. Hoặc vào: https://console.cloud.google.com/apis/credentials/consent

### **Bước 3: Thêm Test User**
1. Trong trang OAuth consent screen, tìm phần **"Test users"**
2. Click **"ADD USERS"** hoặc **"Thêm người dùng"**
3. Trong hộp thoại hiện ra, nhập email: `nguyenthihue100796@gmail.com`
4. Click **"SAVE"** hoặc **"Lưu"**

### **Bước 4: Xác nhận thêm thành công**
1. Email `nguyenthihue100796@gmail.com` sẽ xuất hiện trong danh sách Test users
2. Đợi khoảng 2-5 phút để thay đổi có hiệu lực

## 🔍 Kiểm tra cấu hình OAuth

### **Thông tin OAuth đã được cấu hình:**
- **Client ID:** `[ĐÃ ẨN - VUI LÒNG LIÊN HỆ ADMIN]`
- **Client Secret:** `[ĐÃ ẨN - VUI LÒNG LIÊN HỆ ADMIN]`
- **Redirect URI:** `http://localhost:3000/oauth-callback`

### **Các bước kiểm tra:**
1. **Trong ứng dụng:**
   - Click "Cấu Hình Nhanh" để tự động cấu hình
   - Click "Debug OAuth" (icon 🐛) để kiểm tra trạng thái
   - Click "Đăng Nhập Google" để test

2. **Trong Google Cloud Console:**
   - Kiểm tra OAuth consent screen có email test user
   - Kiểm tra Google Sheets API đã được bật
   - Kiểm tra Google Sheets đã được chia sẻ

## ⚠️ Lưu ý quan trọng

### **Về Test Users:**
- Chỉ những email trong danh sách test users mới có thể sử dụng
- Có thể thêm tối đa 100 test users
- Thay đổi có hiệu lực sau 2-5 phút

### **Về Google Sheets:**
- Google Sheets phải được chia sẻ với email `nguyenthihue100796@gmail.com`
- Cấp quyền "Editor" cho email này
- Spreadsheet ID: `1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No`

### **Về OAuth Scope:**
- Scope cần thiết: `https://www.googleapis.com/auth/spreadsheets`
- Điều này cho phép đọc và ghi Google Sheets

## 🚨 Xử lý lỗi thường gặp

### **Lỗi "User not in test users"**
- **Nguyên nhân:** Email chưa được thêm vào test users
- **Cách sửa:** Thêm email `nguyenthihue100796@gmail.com` vào test users

### **Lỗi "redirect_uri_mismatch"**
- **Nguyên nhân:** Redirect URI không khớp
- **Cách sửa:** Đảm bảo redirect URI là `http://localhost:3000/oauth-callback`

### **Lỗi "Access denied"**
- **Nguyên nhân:** OAuth app chưa được xác minh
- **Cách sửa:** Thêm test user và đợi vài phút

## 📞 Các bước test sau khi cấu hình

### **Bước 1: Cấu hình trong ứng dụng**
1. Vào Dashboard
2. Click "Cấu Hình Nhanh"
3. Xác nhận cấu hình thành công

### **Bước 2: Test đăng nhập**
1. Click "Đăng Nhập Google"
2. Chọn tài khoản `nguyenthihue100796@gmail.com`
3. Cấp quyền truy cập Google Sheets
4. Đợi chuyển hướng về ứng dụng

### **Bước 3: Kiểm tra kết nối**
1. Sử dụng Debug tool để kiểm tra
2. Test đồng bộ dữ liệu
3. Kiểm tra Google Sheets có dữ liệu

## 🎯 Kết quả mong đợi

Sau khi hoàn thành các bước trên:
- ✅ OAuth được cấu hình đúng
- ✅ Email được thêm vào test users
- ✅ Có thể đăng nhập Google thành công
- ✅ Có thể đồng bộ dữ liệu với Google Sheets
- ✅ Không còn lỗi "access_denied"

## 🔗 Links hữu ích

- **Google Cloud Console:** https://console.cloud.google.com/
- **OAuth Consent Screen:** https://console.cloud.google.com/apis/credentials/consent
- **Google Sheets:** https://docs.google.com/spreadsheets/d/1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No/edit
- **Ứng dụng:** http://localhost:3000 