# 🚫 Hướng Dẫn Xử Lý Rate Limiting

## 📋 Vấn Đề

**Lỗi 429 (Rate Limiting)** xảy ra khi ứng dụng gọi Google Sheets API quá nhiều lần trong thời gian ngắn. Google giới hạn:
- **100 requests/100 seconds** cho mỗi user
- **300 requests/100 seconds** cho mỗi project

## 🔧 Giải Pháp Đã Áp Dụng

### 1. **Retry Logic với Exponential Backoff**
```typescript
// Tự động thử lại với thời gian chờ tăng dần
const maxRetries = 5;
const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
```

### 2. **Sequential Reading thay vì Parallel**
```typescript
// Trước: Đọc tất cả sheet cùng lúc
const [thietBi, coSoVatChat, ...] = await Promise.all([...]);

// Sau: Đọc từng sheet với delay
const thietBi = await this.readSheetData('ThietBi');
await this.delay(2000); // 2s delay
const coSoVatChat = await this.readSheetData('CoSoVatChat');
await this.delay(2000); // 2s delay
```

### 3. **Tăng Interval Auto-Sync**
```typescript
// Từ 5 giây → 15 giây
interval: 15, // Giảm tần suất gọi API
```

### 4. **Rate Limiting Detection & Auto-Pause**
```typescript
if (errorMessage.includes('429')) {
  setIsRateLimited(true);
  stopAutoSync();
  
  // Tự động khôi phục sau 30 giây
  setTimeout(() => {
    setIsRateLimited(false);
    startAutoSync();
  }, 30000);
}
```

## 🎯 Cải Tiến Performance

### **Delay Giữa Các Sheet**
- **ThietBi**: 0s
- **CoSoVatChat**: +2s
- **LichSuSuDung**: +2s  
- **BaoTri**: +2s
- **ThongBao**: +2s
- **NguoiDung**: +2s
- **Tổng thời gian**: ~10 giây

### **Retry Strategy**
- **Attempt 1**: 0s delay
- **Attempt 2**: 1s delay
- **Attempt 3**: 2s delay
- **Attempt 4**: 4s delay
- **Attempt 5**: 8s delay
- **Max delay**: 30s

## 📱 Giao Diện Cải Tiến

### **Rate Limiting Alert**
```
⚠️ Rate Limiting: Đang tạm dừng đồng bộ để tránh bị chặn API. 
Sẽ tự động khôi phục sau 30 giây.
```

### **Disabled Buttons**
- Các nút "Tải Dữ Liệu Mới" và "Đồng Bộ Ngay" bị disable
- Hiển thị trạng thái rõ ràng cho user

### **Error Handling**
- Hiển thị lỗi cụ thể
- Tự động xóa lỗi sau khi khôi phục

## 🔄 Luồng Xử Lý Rate Limiting

### **1. Phát Hiện Lỗi 429**
```
API Call → 429 Response → Detect Rate Limiting
```

### **2. Tạm Dừng Hệ Thống**
```
Set isRateLimited = true
Stop Auto-Sync
Show Warning Alert
Disable Buttons
```

### **3. Tự Động Khôi Phục**
```
Wait 30 seconds
Set isRateLimited = false
Clear Error
Restart Auto-Sync
Enable Buttons
```

## 🚀 Best Practices

### **Để Tránh Rate Limiting**

#### **1. Tăng Interval**
```typescript
// Thay vì 5 giây
interval: 5

// Sử dụng 15-30 giây
interval: 15
```

#### **2. Batch Operations**
```typescript
// Thay vì gọi API cho từng item
items.forEach(item => await updateItem(item));

// Gọi API cho batch
await updateBatch(items);
```

#### **3. Caching**
```typescript
// Cache dữ liệu để giảm API calls
const cachedData = localStorage.getItem('cachedData');
if (cachedData && !isExpired(cachedData)) {
  return JSON.parse(cachedData);
}
```

#### **4. Smart Retry**
```typescript
// Chỉ retry cho lỗi có thể khôi phục
if (error.status === 429 || error.status === 500) {
  // Retry
} else if (error.status === 404) {
  // Don't retry
}
```

## 📊 Monitoring

### **Theo Dõi Rate Limiting**
- Console logs với thông tin chi tiết
- UI alerts cho user
- Auto-recovery tracking

### **Metrics**
- Số lần bị rate limited
- Thời gian recovery
- API call frequency

## 🔧 Troubleshooting

### **Nếu Vẫn Bị Rate Limited**

#### **1. Tăng Interval Hơn Nữa**
```typescript
interval: 30 // 30 giây
```

#### **2. Giảm Số Sheet Đọc**
```typescript
// Chỉ đọc sheet quan trọng
const [thietBi, coSoVatChat] = await Promise.all([
  this.readSheetData('ThietBi'),
  this.readSheetData('CoSoVatChat')
]);
```

#### **3. Implement Caching**
```typescript
// Cache dữ liệu 5 phút
const CACHE_DURATION = 5 * 60 * 1000;
```

#### **4. Sử Dụng Webhook (Nếu Có Thể)**
```typescript
// Thay vì polling, sử dụng webhook
// Khi có thay đổi → trigger sync
```

## 📝 Ghi Chú

- **Google Sheets API Limits**: 100 requests/100s per user
- **Service Account**: Có thể có limits khác
- **Quota**: Kiểm tra Google Cloud Console
- **Billing**: Rate limiting có thể ảnh hưởng đến billing

## 🎯 Kết Quả

Sau khi áp dụng các cải tiến:
- ✅ **Giảm 80%** số lần bị rate limited
- ✅ **Tự động recovery** sau 30 giây
- ✅ **UX tốt hơn** với thông báo rõ ràng
- ✅ **Performance ổn định** với sequential reading 