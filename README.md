# Hệ Thống Quản Lý Cơ Sở Vật Chất

Hệ thống quản lý cơ sở vật chất và thiết bị trường học với giao diện web hiện đại, sử dụng localStorage để lưu trữ tạm thời và tích hợp Google Sheets để lưu trữ chính.

## 🚀 Tính Năng Chính

### 1. Quản Lý Thiết Bị
- ✅ Thêm, sửa, xóa thiết bị
- ✅ Quản lý tình trạng thiết bị (sử dụng, hỏng hóc, bảo trì, ngừng sử dụng)
- ✅ Theo dõi thông tin chi tiết: tên, loại, số lượng, vị trí, nhà cung cấp, giá trị
- ✅ Ghi giảm thiết bị

### 2. Quản Lý Cơ Sở Vật Chất
- ✅ Quản lý phòng học, phòng thí nghiệm, sân bãi, thư viện, văn phòng
- ✅ Theo dõi tình trạng và sức chứa
- ✅ Quản lý vị trí và mô tả chi tiết

### 3. Lịch Sử Sử Dụng
- ✅ Theo dõi việc mượn/trả thiết bị và cơ sở vật chất
- ✅ Quản lý người mượn (học sinh, giáo viên, nhân viên)
- ✅ Trạng thái mượn (đang mượn, đã trả, quá hạn)
- ✅ Lý do mượn và ghi chú

### 4. Báo Cáo và Thống Kê
- ✅ Dashboard tổng quan với thống kê real-time
- ✅ Báo cáo chi tiết về thiết bị và cơ sở vật chất
- ✅ Thống kê tình trạng sử dụng
- ✅ Biểu đồ và bảng dữ liệu trực quan

### 5. Quản Lý Thông Báo
- ✅ Tạo và quản lý thông báo hệ thống
- ✅ Phân loại thông báo (bảo trì, thay thế, cải tiến, thông báo chung)
- ✅ Độ ưu tiên thông báo
- ✅ Trạng thái đọc/xử lý

### 6. Bảo Trì
- ✅ Lập kế hoạch bảo trì thiết bị và cơ sở vật chất
- ✅ Theo dõi tiến độ bảo trì
- ✅ Quản lý chi phí và người thực hiện

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **State Management**: React Context + React Query
- **Routing**: React Router v6
- **Local Storage**: Browser localStorage API
- **Cloud Storage**: Google Sheets API
- **Build Tool**: Create React App

## 📦 Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Node.js 16+ 
- npm hoặc yarn

### Bước 1: Clone dự án
```bash
git clone <repository-url>
cd quan-ly-co-so-vat-chat
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Chạy ứng dụng
```bash
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 🔧 Cấu Hình Google Sheets

### Bước 1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Bật Google Sheets API

### Bước 2: Tạo Service Account
1. Vào "IAM & Admin" > "Service Accounts"
2. Tạo service account mới
3. Tải file JSON credentials

### Bước 3: Tạo Google Sheets
1. Tạo Google Sheets mới
2. Chia sẻ với email service account
3. Ghi lại Spreadsheet ID

### Bước 4: Cấu hình trong ứng dụng
```typescript
import { configureGoogleSheets } from './services/googleSheets';

const config = {
  apiKey: 'YOUR_API_KEY',
  spreadsheetId: 'YOUR_SPREADSHEET_ID',
  ranges: {
    thietBi: 'ThietBi!A:K',
    coSoVatChat: 'CoSoVatChat!A:J',
    lichSuSuDung: 'LichSuSuDung!A:J',
    baoTri: 'BaoTri!A:K',
    thongBao: 'ThongBao!A:I',
    nguoiDung: 'NguoiDung!A:H'
  }
};

configureGoogleSheets(config);
```

## 📱 Giao Diện Người Dùng

### Trang Chủ (Dashboard)
- Thống kê tổng quan về thiết bị và cơ sở vật chất
- Biểu đồ tình trạng sử dụng
- Lịch sử gần đây và bảo trì

### Quản Lý Thiết Bị
- Bảng danh sách thiết bị với tìm kiếm và lọc
- Form thêm/sửa thiết bị
- Quản lý tình trạng và thông tin chi tiết

### Quản Lý Cơ Sở Vật Chất
- Danh sách cơ sở vật chất
- Quản lý loại và sức chứa
- Theo dõi tình trạng hoạt động

### Lịch Sử Sử Dụng
- Theo dõi việc mượn/trả
- Quản lý người mượn và thời gian
- Trạng thái và ghi chú

### Báo Cáo
- Thống kê chi tiết
- Báo cáo xuất dữ liệu
- Biểu đồ phân tích

### Thông Báo
- Hệ thống thông báo nội bộ
- Phân loại và độ ưu tiên
- Quản lý trạng thái đọc

## 🔐 Phân Quyền Người Dùng

### Quản Trị Viên
- Quản lý tất cả chức năng
- Phân quyền người dùng
- Cấu hình hệ thống

### Giáo Viên
- Quản lý thiết bị trong phạm vi lớp học
- Mượn thiết bị và cơ sở vật chất
- Xem báo cáo

### Học Sinh
- Xem thiết bị và cơ sở vật chất có sẵn
- Mượn thiết bị (có phê duyệt)
- Xem lịch sử mượn cá nhân

## 💾 Lưu Trữ Dữ Liệu

### LocalStorage (Tạm thời)
- Lưu trữ dữ liệu trong trình duyệt
- Đồng bộ tự động khi có kết nối
- Backup dữ liệu offline

### Google Sheets (Chính)
- Lưu trữ dữ liệu chính trên cloud
- Đồng bộ real-time
- Backup và chia sẻ dễ dàng
- Xuất báo cáo Excel

## 🚀 Triển Khai

### Build Production
```bash
npm run build
```

### Deploy lên Netlify/Vercel
1. Push code lên GitHub
2. Kết nối với Netlify/Vercel
3. Cấu hình environment variables
4. Deploy tự động

## 📊 Cấu Trúc Dữ Liệu

### Thiết Bị (ThietBi)
```typescript
{
  id: string;
  ten: string;
  loai: string;
  soLuong: number;
  tinhTrang: 'suDung' | 'hongHoc' | 'baoTri' | 'ngungSuDung';
  moTa?: string;
  ngayNhap: string;
  ngayCapNhat: string;
  viTri: string;
  nhaCungCap?: string;
  giaTri?: number;
}
```

### Cơ Sở Vật Chất (CoSoVatChat)
```typescript
{
  id: string;
  ten: string;
  loai: 'phongHoc' | 'phongThiNghiem' | 'sanBai' | 'thuVien' | 'vanPhong' | 'khac';
  sucChua?: number;
  tinhTrang: 'hoatDong' | 'baoTri' | 'ngungSuDung';
  moTa?: string;
  viTri: string;
  ngayTao: string;
  ngayCapNhat: string;
  thietBiIds: string[];
}
```

## 🤝 Đóng Góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Dự án này được phát hành dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng:
- Tạo issue trên GitHub
- Liên hệ qua email: support@example.com
- Tham gia Discord community

## 🔄 Roadmap

### Phiên Bản 1.1
- [ ] Tích hợp barcode/QR code
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced reporting

### Phiên Bản 1.2
- [ ] AI-powered maintenance scheduling
- [ ] Integration with school management systems
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

**Lưu ý**: Đây là phiên bản demo. Để sử dụng trong môi trường production, vui lòng cấu hình đầy đủ Google Sheets API và các biện pháp bảo mật cần thiết. 