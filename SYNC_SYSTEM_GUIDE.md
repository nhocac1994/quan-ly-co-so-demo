# 🔄 Hệ Thống Đồng Bộ Dữ Liệu

## 📋 Tổng Quan

Hệ thống đồng bộ đã được cải thiện để **luôn ưu tiên lấy dữ liệu mới nhất từ Google Sheets** thay vì chỉ dựa vào localStorage. Điều này đảm bảo dữ liệu luôn đồng bộ giữa các thiết bị.

## 🎯 Cải Tiến Chính

### 1. **Ưu Tiên Download từ Google Sheets**
- **Mặc định**: `syncDirection: 'download'` thay vì `'bidirectional'`
- **Interval**: Giảm xuống 5 giây để đồng bộ thường xuyên hơn
- **Khởi động**: Luôn tải dữ liệu từ Google Sheets khi khởi động ứng dụng

### 2. **Auto-Sync Thông Minh**
```typescript
// Luôn download trước, sau đó mới upload
const performBidirectionalSync = async () => {
  // 1. Tải dữ liệu từ Google Sheets (ưu tiên dữ liệu mới nhất)
  const downloadSuccess = await downloadDataFromSheets();
  
  // 2. Ghi dữ liệu lên Google Sheets (chỉ nếu download thành công)
  if (downloadSuccess) {
    await uploadDataToSheets();
  }
};
```

### 3. **Event System**
- **`dataRefreshed`**: Trigger khi dữ liệu được cập nhật từ Google Sheets
- **Tự động reload**: Các component tự động cập nhật khi nhận event
- **Thông báo**: Hiển thị thông báo khi dữ liệu được cập nhật

## 🔧 Cấu Hình

### Default Config
```typescript
{
  isEnabled: true,           // Bật auto sync
  interval: 5,              // 5 giây
  storageMode: 'hybrid',    // Kết hợp local + cloud
  syncDirection: 'download' // Ưu tiên download
}
```

### Các Chế Độ Đồng Bộ
- **`download`**: Chỉ tải dữ liệu từ Google Sheets
- **`upload`**: Chỉ ghi dữ liệu lên Google Sheets  
- **`bidirectional`**: Đồng bộ hai chiều (download trước, upload sau)

## 📱 Giao Diện

### Quản Lý Đồng Bộ
- **"Tải Dữ Liệu Mới"**: Force download từ Google Sheets
- **"Đồng Bộ Ngay"**: Thực hiện đồng bộ theo cấu hình
- **Thông báo**: Hiển thị khi dữ liệu được cập nhật

### Trạng Thái
- **Online/Offline**: Kết nối Google Sheets
- **Lần đồng bộ**: Số lần đồng bộ thành công
- **Phiên bản dữ liệu**: Version của dữ liệu hiện tại
- **Hàng chờ**: Số lượng operation đang chờ

## 🔄 Luồng Hoạt Động

### 1. Khởi Động Ứng Dụng
```
1. Kiểm tra kết nối Google Sheets
2. Tải dữ liệu từ Google Sheets → localStorage
3. Trigger 'dataRefreshed' event
4. Các component tự động reload dữ liệu
5. Bắt đầu auto-sync (5 giây/lần)
```

### 2. Auto-Sync
```
1. Tải dữ liệu từ Google Sheets
2. Cập nhật localStorage
3. Trigger 'dataRefreshed' event
4. Hiển thị thông báo cập nhật
5. Ghi dữ liệu lên Google Sheets (nếu cần)
```

### 3. Thao Tác CRUD
```
1. Thay đổi dữ liệu trong localStorage
2. Trigger sync event
3. Ghi lên Google Sheets
4. Các thiết bị khác sẽ nhận được cập nhật trong lần sync tiếp theo
```

## 🚀 Lợi Ích

### ✅ Đảm Bảo Dữ Liệu Mới Nhất
- Luôn lấy dữ liệu từ Google Sheets trước
- Không bị lỗi dữ liệu cũ khi chuyển thiết bị

### ✅ Đồng Bộ Đa Thiết Bị
- Dữ liệu luôn đồng bộ giữa các thiết bị
- Không cần thao tác thủ công

### ✅ Performance Tốt
- Cache dữ liệu trong localStorage
- Chỉ sync khi cần thiết
- Event-driven updates

### ✅ UX Tốt
- Thông báo khi dữ liệu được cập nhật
- Loading states rõ ràng
- Error handling tốt

## 🔧 Troubleshooting

### Lỗi Kết Nối
1. Kiểm tra environment variables
2. Kiểm tra quyền truy cập Google Sheets
3. Kiểm tra kết nối internet

### Dữ Liệu Không Đồng Bộ
1. Click "Tải Dữ Liệu Mới" để force download
2. Kiểm tra console logs
3. Restart ứng dụng

### Performance Issues
1. Tăng interval lên 10-15 giây
2. Kiểm tra kích thước dữ liệu
3. Tối ưu hóa queries

## 📝 Ghi Chú

- **Backup**: Dữ liệu được lưu cả trong localStorage và Google Sheets
- **Conflict Resolution**: Ưu tiên dữ liệu mới nhất dựa trên timestamp
- **Offline Support**: Ứng dụng vẫn hoạt động offline với dữ liệu local
- **Security**: Sử dụng Service Account với quyền hạn chế 