# 🔧 Hướng Dẫn Xử Lý Lỗi OAuth 2.0

## 📋 Danh sách lỗi thường gặp

### 1. ❌ Lỗi "Chưa cấu hình OAuth"
**Triệu chứng:** Hiển thị "Chưa cấu hình OAuth. Vui lòng cấu hình OAuth 2.0."

**Nguyên nhân:** Chưa nhập Client ID và Client Secret

**Cách sửa:**
1. Click "Cấu Hình OAuth" trong ứng dụng
2. Nhập Client ID và Client Secret từ Google Cloud Console
3. Click "Lưu Cấu Hình"

### 2. ❌ Lỗi "Chưa đăng nhập Google"
**Triệu chứng:** Hiển thị "Chưa đăng nhập Google. Vui lòng đăng nhập."

**Nguyên nhân:** Chưa thực hiện quá trình xác thực OAuth

**Cách sửa:**
1. Click "Đăng Nhập Google"
2. Chọn tài khoản Google
3. Cấp quyền truy cập Google Sheets
4. Đợi chuyển hướng về ứng dụng

### 3. ❌ Lỗi "redirect_uri_mismatch"
**Triệu chứng:** Hiển thị "Error: redirect_uri_mismatch"

**Nguyên nhân:** Redirect URI không khớp với cấu hình

**Cách sửa:**
1. Click "Sửa Lỗi URI" trong ứng dụng
2. Làm theo hướng dẫn chi tiết
3. Cập nhật Authorized redirect URIs trong Google Cloud Console
4. Thêm chính xác: `http://localhost:3000/oauth-callback`

### 4. ❌ Lỗi "Chưa hoàn tất quy trình xác minh"
**Triệu chứng:** Hiển thị "bao-cao chưa hoàn tất quy trình xác minh của Google"

**Nguyên nhân:** OAuth app chưa được xác minh và đang ở chế độ testing

**Cách sửa:**
1. Click "Thêm Test User" trong ứng dụng
2. Làm theo hướng dẫn thêm test users
3. Thêm email `ncq.hct1109@gmail.com` vào test users
4. Đợi vài phút và thử lại

### 5. ❌ Lỗi "Token đã hết hạn"
**Triệu chứng:** Access token không còn hiệu lực

**Nguyên nhân:** Token OAuth đã hết hạn (thường sau 1 giờ)

**Cách sửa:**
1. Click "Đăng Nhập Google" lại
2. Thực hiện quá trình xác thực mới
3. Lấy token mới

### 6. ❌ Lỗi "Không thể kết nối Google Sheets"
**Triệu chứng:** Test connection thất bại

**Nguyên nhân:** 
- Google Sheets API chưa được bật
- Google Sheets chưa được chia sẻ
- Spreadsheet ID không đúng

**Cách sửa:**
1. Bật Google Sheets API trong Google Cloud Console
2. Chia sẻ Google Sheets với email của bạn
3. Kiểm tra Spreadsheet ID trong code

## 🔍 Cách sử dụng Debug Tool

### Bước 1: Mở Debug Tool
1. Vào Dashboard
2. Tìm component "Đồng Bộ Google Sheets"
3. Click icon 🐛 (Debug) ở góc phải

### Bước 2: Kiểm tra thông tin
Debug tool sẽ hiển thị:
- **Cấu hình OAuth:** Client ID, Client Secret, Redirect URI
- **Access Token:** Trạng thái token, thời gian hết hạn
- **Kết nối:** Kết quả test connection
- **Lỗi:** Thông tin lỗi chi tiết

### Bước 3: Làm theo hướng dẫn
Debug tool sẽ đưa ra hướng dẫn cụ thể dựa trên trạng thái hiện tại.

## 📞 Các bước khắc phục tổng quát

### Bước 1: Kiểm tra cấu hình Google Cloud Console
1. Vào https://console.cloud.google.com/apis/credentials
2. Kiểm tra OAuth 2.0 Client ID
3. Vào OAuth consent screen
4. Thêm test users nếu cần

### Bước 2: Kiểm tra Google Sheets
1. Mở Google Sheets: https://docs.google.com/spreadsheets/d/1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No/edit
2. Chia sẻ với email của bạn
3. Cấp quyền "Editor"

### Bước 3: Kiểm tra ứng dụng
1. Sử dụng Debug tool để kiểm tra
2. Xóa cache nếu cần: `localStorage.clear()`
3. Cấu hình lại OAuth

### Bước 4: Test lại
1. Click "Đăng Nhập Google"
2. Thực hiện quá trình xác thực
3. Kiểm tra kết nối

## ⚠️ Lưu ý quan trọng

### Về Test Users:
- Chỉ những email được thêm vào test users mới có thể sử dụng
- Có thể thêm tối đa 100 test users
- Thay đổi có hiệu lực sau vài phút

### Về Token:
- Access token có thời hạn 1 giờ
- Cần đăng nhập lại khi token hết hạn
- Token được lưu trong localStorage

### Về Quyền truy cập:
- Cần quyền "Editor" cho Google Sheets
- Google Sheets API phải được bật
- OAuth scope phải bao gồm Google Sheets

## 🚀 Nếu vẫn gặp lỗi

1. **Xóa cache trình duyệt:**
   - Mở Developer Tools (F12)
   - Vào Application > Storage
   - Clear localStorage

2. **Kiểm tra Console:**
   - Mở Developer Tools (F12)
   - Vào Console
   - Xem lỗi chi tiết

3. **Restart ứng dụng:**
   ```bash
   npm start
   ```

4. **Liên hệ hỗ trợ:**
   - Chụp màn hình lỗi
   - Ghi lại các bước đã thực hiện
   - Cung cấp thông tin từ Debug tool 