import { NguoiDung } from '../types';

export const sampleUsers: NguoiDung[] = [
  {
    id: '1',
    hoTen: 'Nguyễn Văn Admin',
    email: 'admin@school.com',
    vaiTro: 'quanTriVien',
    soDienThoai: '0901234567',
    ngayTao: '2024-01-01',
    trangThai: 'hoatDong'
  },
  {
    id: '2',
    hoTen: 'Trần Thị Giáo Viên',
    email: 'teacher@school.com',
    vaiTro: 'giaoVien',
    soDienThoai: '0901234568',
    ngayTao: '2024-01-02',
    trangThai: 'hoatDong'
  },
  {
    id: '3',
    hoTen: 'Lê Văn Học Sinh',
    email: 'student@school.com',
    vaiTro: 'hocSinh',
    lop: '12A1',
    khoa: '2022-2025',
    soDienThoai: '0901234569',
    ngayTao: '2024-01-03',
    trangThai: 'hoatDong'
  },
  {
    id: '4',
    hoTen: 'Phạm Thị Giáo Viên 2',
    email: 'teacher2@school.com',
    vaiTro: 'giaoVien',
    soDienThoai: '0901234570',
    ngayTao: '2024-01-04',
    trangThai: 'hoatDong'
  },
  {
    id: '5',
    hoTen: 'Hoàng Văn Học Sinh 2',
    email: 'student2@school.com',
    vaiTro: 'hocSinh',
    lop: '11B2',
    khoa: '2023-2026',
    soDienThoai: '0901234571',
    ngayTao: '2024-01-05',
    trangThai: 'hoatDong'
  },
  {
    id: '6',
    hoTen: 'Vũ Thị Quản Lý',
    email: 'manager@school.com',
    vaiTro: 'quanTriVien',
    soDienThoai: '0901234572',
    ngayTao: '2024-01-06',
    trangThai: 'hoatDong'
  }
];

// Hàm khởi tạo dữ liệu mẫu
export const initializeSampleUsers = () => {
  try {
    const existingUsers = localStorage.getItem('nguoiDung');
    if (!existingUsers) {
      localStorage.setItem('nguoiDung', JSON.stringify(sampleUsers));
      console.log('✅ Đã khởi tạo dữ liệu người dùng mẫu:', sampleUsers.length, 'người dùng');
    } else {
      console.log('ℹ️ Dữ liệu người dùng đã tồn tại');
    }
    
    // Debug: Kiểm tra dữ liệu đã lưu
    const savedUsers = localStorage.getItem('nguoiDung');
    console.log('📊 Dữ liệu trong localStorage:', savedUsers);
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo dữ liệu mẫu:', error);
    return false;
  }
};

// Hàm force khởi tạo lại dữ liệu mẫu
export const forceInitializeSampleUsers = () => {
  try {
    localStorage.setItem('nguoiDung', JSON.stringify(sampleUsers));
    console.log('🔄 Đã force khởi tạo lại dữ liệu người dùng mẫu');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi force khởi tạo dữ liệu mẫu:', error);
    return false;
  }
}; 