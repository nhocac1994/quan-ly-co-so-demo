# 🔐 Hướng Dẫn Sử Dụng Service Account

## 🎯 **Tại sao sử dụng Service Account?**

### **Ưu điểm:**
- ✅ **Không cần đăng nhập Google** - Truy cập trực tiếp với credentials
- ✅ **Không cần test users** - Hoạt động với mọi email
- ✅ **Cấu hình một lần duy nhất** - Không cần setup lại
- ✅ **Bảo mật cao** - Sử dụng JWT tokens
- ✅ **Ổn định** - Không bị gián đoạn bởi OAuth flow

### **So sánh với OAuth 2.0:**
| Tính năng | Service Account | OAuth 2.0 |
|-----------|----------------|-----------|
| Cấu hình | Một lần duy nhất | Cần setup mỗi lần |
| Test Users | Không cần | Cần thêm test users |
| Đăng nhập | Không cần | Cần đăng nhập Google |
| Bảo mật | JWT tokens | Access tokens |
| Ổn định | Cao | Có thể bị gián đoạn |

## 📋 **Các bước cấu hình Service Account**

### **Bước 1: Tạo Service Account trong Google Cloud Console**
1. Vào Google Cloud Console: https://console.cloud.google.com/
2. Chọn project của bạn
3. Vào **"IAM & Admin" > "Service Accounts"**
4. Click **"Create Service Account"**
5. Điền thông tin:
   - **Name:** `quan-ly-csv-service-account`
   - **Description:** `Service account cho ứng dụng quản lý cơ sở vật chất`
6. Click **"Create and Continue"**

### **Bước 2: Cấp quyền cho Service Account**
1. Trong phần **"Grant this service account access to project"**
2. Chọn role: **"Editor"** (hoặc **"Viewer"** nếu chỉ đọc)
3. Click **"Continue"**
4. Click **"Done"**

### **Bước 3: Tạo và tải credentials.json**
1. Click vào Service Account vừa tạo
2. Vào tab **"Keys"**
3. Click **"Add Key" > "Create new key"**
4. Chọn **"JSON"**
5. Click **"Create"**
6. File `credentials.json` sẽ được tải về

### **Bước 4: Chia sẻ Google Sheets**
1. Mở Google Sheets: https://docs.google.com/spreadsheets/d/1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No/edit
2. Click **"Share"** (Chia sẻ)
3. Thêm email của Service Account (có trong credentials.json)
4. Cấp quyền **"Editor"**
5. Click **"Done"**

## 🔧 **Cấu hình trong ứng dụng**

### **Bước 1: Mở Service Account Setup**
1. Vào Dashboard: http://localhost:3000
2. Tìm component "Đồng Bộ Google Sheets"
3. Click nút **"Service Account"** (màu cam)

### **Bước 2: Upload credentials.json**
1. Click **"Chọn File Credentials.json"**
2. Chọn file `credentials.json` đã tải về
3. Xác nhận file được tải thành công

### **Bước 3: Test kết nối**
1. Click **"Test Kết Nối"**
2. Đợi kết quả kiểm tra
3. Nếu thành công, sẽ hiển thị "Kết nối thành công với Google Sheets!"

### **Bước 4: Đồng bộ dữ liệu**
1. Click **"Đồng Bộ Dữ Liệu"**
2. Đợi quá trình đồng bộ hoàn tất
3. Kiểm tra Google Sheets có dữ liệu

## 📁 **Cấu trúc file credentials.json**

File `credentials.json` có cấu trúc như sau:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account-name@project-id.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account-name%40project-id.iam.gserviceaccount.com"
}
```

## 🔒 **Bảo mật**

### **Lưu ý quan trọng:**
- ⚠️ **Không chia sẻ** file `credentials.json` với người khác
- ⚠️ **Không commit** file này lên Git
- ⚠️ **Bảo vệ** file này như mật khẩu
- ⚠️ **Xóa** file cũ nếu tạo mới

### **Cách bảo vệ:**
1. Thêm `credentials.json` vào `.gitignore`
2. Lưu file ở vị trí an toàn
3. Chỉ sử dụng cho mục đích phát triển
4. Tạo Service Account riêng cho production

## 🚨 **Xử lý lỗi thường gặp**

### **Lỗi "File credentials.json không đúng định dạng"**
- **Nguyên nhân:** File không phải JSON hoặc thiếu trường bắt buộc
- **Cách sửa:** Kiểm tra file có đầy đủ `client_email` và `private_key`

### **Lỗi "Không thể kết nối với Google Sheets"**
- **Nguyên nhân:** Service Account chưa được chia sẻ Google Sheets
- **Cách sửa:** Chia sẻ Google Sheets với email Service Account

### **Lỗi "Access denied"**
- **Nguyên nhân:** Service Account không có quyền truy cập
- **Cách sửa:** Cấp quyền "Editor" cho Service Account

### **Lỗi "JWT signature"**
- **Nguyên nhân:** Private key không đúng định dạng
- **Cách sửa:** Tạo lại key mới trong Google Cloud Console

## 📊 **Kiểm tra hoạt động**

### **Trong ứng dụng:**
1. Sử dụng Debug tool (icon 🐛)
2. Kiểm tra trạng thái kết nối
3. Test đồng bộ dữ liệu

### **Trong Google Sheets:**
1. Mở Google Sheets
2. Kiểm tra có dữ liệu mới
3. Xem lịch sử chỉnh sửa

### **Trong Google Cloud Console:**
1. Vào Service Accounts
2. Kiểm tra quyền truy cập
3. Xem logs nếu có lỗi

## 🎯 **Kết quả mong đợi**

Sau khi hoàn thành cấu hình:
- ✅ Service Account được tạo và cấu hình
- ✅ Google Sheets được chia sẻ với Service Account
- ✅ Ứng dụng có thể kết nối và đồng bộ dữ liệu
- ✅ Không cần đăng nhập Google mỗi lần sử dụng
- ✅ Dữ liệu được đồng bộ tự động

## 🔗 **Links hữu ích**

- **Google Cloud Console:** https://console.cloud.google.com/
- **Service Accounts:** https://console.cloud.google.com/iam-admin/serviceaccounts
- **Google Sheets:** https://docs.google.com/spreadsheets/d/1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No/edit
- **Ứng dụng:** http://localhost:3000 