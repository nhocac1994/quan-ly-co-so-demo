# 🔧 Hướng Dẫn Cấu Hình Environment Variables

## 📋 Tạo file .env

Tạo file `.env` trong thư mục gốc của project với nội dung sau:

```env
# Google Sheets Service Account Configuration
# Thay thế các giá trị bên dưới bằng thông tin thực từ Google Cloud Console

# Spreadsheet ID - ID của Google Sheets (lấy từ URL)
REACT_APP_GOOGLE_SPREADSHEET_ID=1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No

# Service Account Email - Email của Service Account
REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Private Key - Private key của Service Account (toàn bộ nội dung, bao gồm BEGIN và END)
REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
[Thay thế bằng private key thực của bạn]
-----END PRIVATE KEY-----"

# Các biến môi trường khác (tùy chọn)
NODE_ENV=production
REACT_APP_ENVIRONMENT=production
```

## 🚀 Cách Lấy Thông Tin Service Account

### 1. Tạo Service Account trên Google Cloud Console

1. Truy cập: https://console.cloud.google.com/
2. Chọn project của bạn
3. Vào **"APIs & Services"** > **"Credentials"**
4. Click **"Create Credentials"** > **"Service Account"**
5. Điền thông tin:
   - **Name:** `quan-ly-co-so-vat-chat`
   - **Description:** `Service account for Google Sheets integration`
6. Click **"Create and Continue"**
7. Bỏ qua phần **"Grant this service account access to project"**
8. Click **"Done"**

### 2. Tạo Key cho Service Account

1. Trong danh sách Service Accounts, click vào service account vừa tạo
2. Vào tab **"Keys"**
3. Click **"Add Key"** > **"Create new key"**
4. Chọn **"JSON"**
5. Click **"Create"**
6. File JSON sẽ được tải về

### 3. Lấy Thông Tin từ File JSON

Mở file JSON đã tải về và lấy các thông tin:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "quan-ly-co-so-vat-chat@your-project-id.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/quan-ly-co-so-vat-chat%40your-project-id.iam.gserviceaccount.com"
}
```

### 4. Cập Nhật file .env

Thay thế các giá trị trong file `.env`:

```env
REACT_APP_GOOGLE_SPREADSHEET_ID=1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No
REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL=quan-ly-co-so-vat-chat@your-project-id.iam.gserviceaccount.com
REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

## 🌐 Cấu Hình trên Vercel

### 1. Vào Vercel Dashboard

1. Truy cập: https://vercel.com/dashboard
2. Chọn project của bạn

### 2. Thêm Environment Variables

1. Vào **"Settings"** > **"Environment Variables"**
2. Thêm từng biến một:

#### Biến 1: REACT_APP_GOOGLE_SPREADSHEET_ID
- **Name:** `REACT_APP_GOOGLE_SPREADSHEET_ID`
- **Value:** `1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No`
- **Environment:** `Production`, `Preview`, `Development`

#### Biến 2: REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL
- **Name:** `REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **Value:** `quan-ly-co-so-vat-chat@your-project-id.iam.gserviceaccount.com`
- **Environment:** `Production`, `Preview`, `Development`

#### Biến 3: REACT_APP_GOOGLE_PRIVATE_KEY
- **Name:** `REACT_APP_GOOGLE_PRIVATE_KEY`
- **Value:** `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n`
- **Environment:** `Production`, `Preview`, `Development`

### 3. Redeploy

1. Vào tab **"Deployments"**
2. Click **"Redeploy"** trên deployment mới nhất

## 🔍 Test Kết Nối

### 1. Vào ứng dụng

1. Truy cập URL của ứng dụng trên Vercel
2. Đăng nhập với tài khoản demo:
   - **Admin:** admin@demo.com / admin@demo.com
   - **Teacher:** teacher@demo.com / teacher@demo.com
   - **Student:** student@demo.com / student@demo.com

### 2. Test Google Sheets

1. Vào trang **"Quản Lý Đồng Bộ Dữ Liệu"**
2. Tìm component **"Test Kết Nối Vercel - Google Sheets"**
3. Click **"Test Kết Nối"**
4. Kiểm tra kết quả:
   - ✅ **Đã kết nối** = Thành công
   - ❌ **Chưa kết nối** = Có lỗi, kiểm tra lại cấu hình

## 🚨 Lưu Ý Quan Trọng

### 1. Bảo Mật
- **KHÔNG** commit file `.env` lên Git
- **KHÔNG** chia sẻ private key với ai
- **XÓA** file JSON sau khi lấy thông tin

### 2. Quyền Truy Cập
- Service Account cần quyền **"Editor"** trên Google Sheets
- Chia sẻ Google Sheets với email của Service Account

### 3. Format Private Key
- Private key phải bao gồm `-----BEGIN PRIVATE KEY-----` và `-----END PRIVATE KEY-----`
- Thay `\n` bằng xuống dòng thực tế trong Vercel

## 🔧 Troubleshooting

### Lỗi "Thiếu cấu hình environment variables"
- Kiểm tra tên biến có đúng không (bắt đầu bằng `REACT_APP_`)
- Kiểm tra giá trị có được lưu đúng không
- Redeploy sau khi thêm environment variables

### Lỗi "Không thể kết nối với Google Sheets"
- Kiểm tra Spreadsheet ID có đúng không
- Kiểm tra Service Account có quyền truy cập không
- Kiểm tra Private Key có đúng format không

### Lỗi "Invalid JWT"
- Kiểm tra Private Key có đầy đủ không
- Kiểm tra Service Account Email có đúng không
- Kiểm tra Private Key có bị lỗi format không 