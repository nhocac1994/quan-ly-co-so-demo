# 🔧 Hướng Dẫn Cấu Hình Google Sheets API với OAuth 2.0

## 📋 Yêu cầu

1. **Google Cloud Project** với Google Sheets API được bật
2. **OAuth 2.0 Client ID** từ Google Cloud Console
3. **Google Sheets** đã được tạo và chia sẻ với quyền truy cập phù hợp

## 🚀 Các bước cấu hình

### 1. Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Bật Google Sheets API:
   - Vào "APIs & Services" > "Library"
   - Tìm "Google Sheets API" và bật

### 2. Tạo OAuth 2.0 Client ID

1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Chọn "Web application"
4. Điền thông tin:
   - **Name**: `Quan Ly CSV C OAuth Client`
   - **Authorized JavaScript origins**: `http://localhost:3000` (cho development)
   - **Authorized redirect URIs**: `http://localhost:3000/oauth-callback`
5. Click "Create"
6. Copy **Client ID** và **Client Secret**

### 3. Cấu hình Google Sheets

1. Tạo Google Sheets mới hoặc sử dụng sheet có sẵn
2. Chia sẻ sheet với email của bạn (hoặc email được cấu hình trong OAuth):
   - Click "Share" (Chia sẻ)
   - Thêm email của bạn
   - Cấp quyền "Editor" (Chỉnh sửa)
   - Click "Done" (Xong)
3. Tạo các sheet với tên:
   - `ThietBi` - Quản lý thiết bị
   - `CoSoVatChat` - Quản lý cơ sở vật chất
   - `LichSuSuDung` - Lịch sử sử dụng
   - `BaoTri` - Bảo trì
   - `ThongBao` - Thông báo
   - `NguoiDung` - Người dùng

### 4. Cập nhật Spreadsheet ID

1. Mở Google Sheets
2. Copy ID từ URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
3. Cập nhật trong file `src/services/googleSheets.ts`:
   ```typescript
   spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE'
   ```

## 📊 Cấu trúc Google Sheets

### Sheet: ThietBi
| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| id | ten | loai | soLuong | tinhTrang | moTa | ngayNhap | ngayCapNhat | viTri | nhaCungCap | giaTri |

### Sheet: CoSoVatChat
| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | ten | loai | sucChua | tinhTrang | moTa | viTri | ngayTao | ngayCapNhat | thietBiIds |

### Sheet: LichSuSuDung
| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | thietBiId | coSoVatChatId | nguoiMuon | vaiTro | ngayMuon | ngayTra | trangThai | lyDo | ghiChu |

### Sheet: BaoTri
| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| id | thietBiId | coSoVatChatId | loai | moTa | ngayBatDau | ngayKetThuc | trangThai | chiPhi | nguoiThucHien | ghiChu |

### Sheet: ThongBao
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| id | tieuDe | noiDung | loai | doUuTien | ngayTao | ngayHetHan | trangThai | nguoiNhan |

### Sheet: NguoiDung
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| id | hoTen | email | vaiTro | lop | khoa | ngayTao | trangThai |

## 🔒 Bảo mật

⚠️ **Lưu ý quan trọng:**
- File `credentials.json` chứa thông tin nhạy cảm
- Không commit file này lên Git
- Thêm `credentials.json` vào `.gitignore`
- Trong production, sử dụng environment variables

## 🧪 Test kết nối

1. Chạy ứng dụng: `npm start`
2. Vào Dashboard
3. Kiểm tra component "Đồng Bộ Google Sheets"
4. Click "Cấu Hình OAuth" và nhập Client ID, Client Secret
5. Click "Đăng nhập Google" để xác thực
6. Nếu thành công, sẽ hiển thị "Đã kết nối"

## 🚨 Xử lý lỗi

### Lỗi "Chưa cấu hình OAuth"
- Click "Cấu Hình OAuth" và nhập Client ID, Client Secret
- Kiểm tra thông tin có đúng không

### Lỗi "Không thể kết nối với Google Sheets"
- Kiểm tra Google Sheets API đã được bật
- Kiểm tra Google Sheets đã được chia sẻ với email của bạn
- Kiểm tra Spreadsheet ID đúng
- Kiểm tra OAuth scope có quyền truy cập Google Sheets API

### Lỗi "OAuth authentication failed"
- Kiểm tra Client ID và Client Secret có đúng không
- Kiểm tra Redirect URI có được cấu hình trong Google Cloud Console
- Kiểm tra Authorized JavaScript origins có đúng không

### Lỗi "redirect_uri_mismatch"
- **Nguyên nhân:** Redirect URI trong ứng dụng không khớp với URI đã đăng ký
- **Cách sửa:**
  1. Vào Google Cloud Console > APIs & Services > Credentials
  2. Click vào OAuth 2.0 Client ID của bạn
  3. Trong "Authorized redirect URIs", thêm chính xác: `http://localhost:3000/oauth-callback`
  4. Click "Save"
  5. Đợi vài phút để thay đổi có hiệu lực
  6. Thử đăng nhập lại

### Lỗi "Chưa hoàn tất quy trình xác minh của Google"
- **Nguyên nhân:** OAuth app chưa được Google xác minh và đang ở chế độ testing
- **Cách sửa:**
  1. Vào Google Cloud Console > APIs & Services > Credentials
  2. Click vào OAuth 2.0 Client ID của bạn
  3. Vào tab "OAuth consent screen" hoặc tìm link "OAuth consent screen"
  4. Trong phần "Test users", click "Add Users"
  5. Thêm email của bạn: `ncq.hct1109@gmail.com`
  6. Click "Save" và đợi vài phút
  7. Thử đăng nhập lại

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console browser để xem lỗi chi tiết
2. Network tab để xem API calls
3. Google Cloud Console để kiểm tra API usage 