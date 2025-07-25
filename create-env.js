#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Tạo file .env cho Google Sheets integration...\n');

// Template cho file .env
const envTemplate = `# Google Sheets Service Account Configuration
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
`;

// Kiểm tra xem file .env đã tồn tại chưa
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  File .env đã tồn tại!');
  console.log('Bạn có muốn ghi đè không? (y/N)');
  
  // Trong môi trường thực tế, bạn có thể sử dụng readline để nhận input
  console.log('Để tạo file .env mới, hãy:');
  console.log('1. Xóa file .env hiện tại');
  console.log('2. Chạy lại script này');
  console.log('3. Hoặc copy nội dung từ env-template.txt');
} else {
  // Tạo file .env
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Đã tạo file .env thành công!');
  console.log('');
  console.log('📋 Bước tiếp theo:');
  console.log('1. Mở file .env và thay thế các giá trị placeholder');
  console.log('2. Lấy thông tin từ Google Cloud Console Service Account');
  console.log('3. Cập nhật REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL');
  console.log('4. Cập nhật REACT_APP_GOOGLE_PRIVATE_KEY');
  console.log('5. Kiểm tra REACT_APP_GOOGLE_SPREADSHEET_ID');
  console.log('');
  console.log('📖 Xem hướng dẫn chi tiết trong file ENV_SETUP.md');
}

console.log('');
console.log('🚀 Để deploy lên Vercel:');
console.log('1. Vào Vercel Dashboard > Project Settings > Environment Variables');
console.log('2. Thêm 3 biến môi trường từ file .env');
console.log('3. Redeploy project'); 