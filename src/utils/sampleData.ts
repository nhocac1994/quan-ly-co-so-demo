import { ThietBi, CoSoVatChat, LichSuSuDung, BaoTri, ThongBao, NguoiDung } from '../types';

// Dữ liệu mẫu cho thiết bị
export const sampleThietBi: Omit<ThietBi, 'id' | 'ngayNhap' | 'ngayCapNhat'>[] = [
  {
    ten: 'Máy tính Dell OptiPlex 7090',
    loai: 'Máy tính',
    soLuong: 25,
    tinhTrang: 'suDung',
    moTa: 'Máy tính phòng lab CNTT',
    viTri: 'Phòng Lab 1',
    nhaCungCap: 'Dell Technologies',
    giaTri: 25000000
  },
  {
    ten: 'Máy chiếu Epson EB-X41',
    loai: 'Máy chiếu',
    soLuong: 15,
    tinhTrang: 'suDung',
    moTa: 'Máy chiếu phòng học',
    viTri: 'Các phòng học',
    nhaCungCap: 'Epson',
    giaTri: 15000000
  },
  {
    ten: 'Bàn ghế học sinh',
    loai: 'Bàn ghế',
    soLuong: 200,
    tinhTrang: 'suDung',
    moTa: 'Bàn ghế phòng học',
    viTri: 'Các phòng học',
    nhaCungCap: 'Nội thất Hòa Phát',
    giaTri: 8000000
  },
  {
    ten: 'Máy in HP LaserJet Pro',
    loai: 'Máy in',
    soLuong: 8,
    tinhTrang: 'baoTri',
    moTa: 'Máy in văn phòng',
    viTri: 'Văn phòng',
    nhaCungCap: 'HP',
    giaTri: 12000000
  },
  {
    ten: 'Điều hòa Daikin',
    loai: 'Điều hòa',
    soLuong: 12,
    tinhTrang: 'hongHoc',
    moTa: 'Điều hòa phòng học',
    viTri: 'Các phòng học',
    nhaCungCap: 'Daikin',
    giaTri: 18000000
  }
];

// Dữ liệu mẫu cho cơ sở vật chất
export const sampleCoSoVatChat: Omit<CoSoVatChat, 'id' | 'ngayTao' | 'ngayCapNhat'>[] = [
  {
    ten: 'Phòng Lab 1',
    loai: 'phongThiNghiem',
    sucChua: 30,
    tinhTrang: 'hoatDong',
    moTa: 'Phòng thí nghiệm Công nghệ thông tin',
    viTri: 'Tầng 2 - Tòa A',
    thietBiIds: []
  },
  {
    ten: 'Phòng Học 101',
    loai: 'phongHoc',
    sucChua: 45,
    tinhTrang: 'hoatDong',
    moTa: 'Phòng học chính',
    viTri: 'Tầng 1 - Tòa A',
    thietBiIds: []
  },
  {
    ten: 'Sân Bóng Đá',
    loai: 'sanBai',
    sucChua: 200,
    tinhTrang: 'hoatDong',
    moTa: 'Sân bóng đá chính',
    viTri: 'Khu vực thể thao',
    thietBiIds: []
  },
  {
    ten: 'Thư Viện',
    loai: 'thuVien',
    sucChua: 100,
    tinhTrang: 'hoatDong',
    moTa: 'Thư viện trường học',
    viTri: 'Tầng 1 - Tòa B',
    thietBiIds: []
  },
  {
    ten: 'Phòng Họp',
    loai: 'vanPhong',
    sucChua: 20,
    tinhTrang: 'baoTri',
    moTa: 'Phòng họp giáo viên',
    viTri: 'Tầng 2 - Tòa A',
    thietBiIds: []
  }
];

// Dữ liệu mẫu cho lịch sử sử dụng
export const sampleLichSuSuDung: Omit<LichSuSuDung, 'id'>[] = [
  {
    thietBiId: '1',
    coSoVatChatId: undefined,
    nguoiMuon: 'Nguyễn Văn An',
    vaiTro: 'hocSinh',
    ngayMuon: '2024-01-15T08:00:00.000Z',
    ngayTra: '2024-01-15T17:00:00.000Z',
    trangThai: 'daTra',
    lyDo: 'Học tập môn Tin học',
    ghiChu: 'Sử dụng tốt'
  },
  {
    thietBiId: '2',
    coSoVatChatId: undefined,
    nguoiMuon: 'Trần Thị Bình',
    vaiTro: 'giaoVien',
    ngayMuon: '2024-01-16T07:00:00.000Z',
    ngayTra: undefined,
    trangThai: 'dangMuon',
    lyDo: 'Giảng dạy môn Vật lý',
    ghiChu: 'Cần trả vào cuối tuần'
  },
  {
    thietBiId: undefined,
    coSoVatChatId: '1',
    nguoiMuon: 'Lê Văn Cường',
    vaiTro: 'hocSinh',
    ngayMuon: '2024-01-14T13:00:00.000Z',
    ngayTra: '2024-01-14T16:00:00.000Z',
    trangThai: 'daTra',
    lyDo: 'Thực hành lập trình',
    ghiChu: 'Hoàn thành bài tập'
  }
];

// Dữ liệu mẫu cho bảo trì
export const sampleBaoTri: Omit<BaoTri, 'id'>[] = [
  {
    thietBiId: '4',
    coSoVatChatId: undefined,
    loai: 'baoTri',
    moTa: 'Bảo trì định kỳ máy in',
    ngayBatDau: '2024-01-20T08:00:00.000Z',
    ngayKetThuc: undefined,
    trangThai: 'dangThucHien',
    chiPhi: 500000,
    nguoiThucHien: 'Nhân viên kỹ thuật',
    ghiChu: 'Thay mực và vệ sinh máy'
  },
  {
    thietBiId: undefined,
    coSoVatChatId: '5',
    loai: 'suaChua',
    moTa: 'Sửa chữa điều hòa phòng họp',
    ngayBatDau: '2024-01-18T09:00:00.000Z',
    ngayKetThuc: '2024-01-19T17:00:00.000Z',
    trangThai: 'hoanThanh',
    chiPhi: 2000000,
    nguoiThucHien: 'Công ty điện lạnh ABC',
    ghiChu: 'Thay block máy nén'
  }
];

// Dữ liệu mẫu cho thông báo
export const sampleThongBao: Omit<ThongBao, 'id' | 'ngayTao'>[] = [
  {
    tieuDe: 'Thông báo bảo trì hệ thống',
    noiDung: 'Hệ thống sẽ được bảo trì vào ngày 25/01/2024 từ 22:00 đến 02:00. Trong thời gian này, hệ thống có thể bị gián đoạn.',
    loai: 'baoTri',
    doUuTien: 'cao',
    ngayHetHan: '2024-01-25T02:00:00.000Z',
    trangThai: 'chuaDoc',
    nguoiNhan: []
  },
  {
    tieuDe: 'Thay thế thiết bị hỏng',
    noiDung: 'Máy điều hòa phòng 201 đã được thay thế mới. Vui lòng kiểm tra và báo cáo nếu có vấn đề.',
    loai: 'thayThe',
    doUuTien: 'trungBinh',
    ngayHetHan: undefined,
    trangThai: 'daDoc',
    nguoiNhan: []
  },
  {
    tieuDe: 'Cải tiến hệ thống quản lý',
    noiDung: 'Hệ thống quản lý cơ sở vật chất sẽ được nâng cấp lên phiên bản mới với nhiều tính năng hữu ích.',
    loai: 'caiTien',
    doUuTien: 'thap',
    ngayHetHan: undefined,
    trangThai: 'chuaDoc',
    nguoiNhan: []
  }
];

// Dữ liệu mẫu cho người dùng
export const sampleNguoiDung: Omit<NguoiDung, 'id' | 'ngayTao'>[] = [
  {
    hoTen: 'Admin',
    email: 'admin@school.com',
    vaiTro: 'quanTriVien',
    trangThai: 'hoatDong'
  },
  {
    hoTen: 'Nguyễn Văn Giáo',
    email: 'giao@school.com',
    vaiTro: 'giaoVien',
    lop: '10A1',
    khoa: 'Khoa Tự nhiên',
    trangThai: 'hoatDong'
  },
  {
    hoTen: 'Trần Thị Học',
    email: 'hoc@school.com',
    vaiTro: 'hocSinh',
    lop: '12A1',
    khoa: 'Khoa Tự nhiên',
    trangThai: 'hoatDong'
  }
];

// Hàm để tạo dữ liệu mẫu
export const createSampleData = () => {
  const { thietBiService, coSoVatChatService, lichSuSuDungService, baoTriService, thongBaoService, nguoiDungService } = require('../services/localStorage');

  // Tạo dữ liệu thiết bị
  sampleThietBi.forEach(thietBi => {
    thietBiService.add(thietBi);
  });

  // Tạo dữ liệu cơ sở vật chất
  sampleCoSoVatChat.forEach(coSoVatChat => {
    coSoVatChatService.add(coSoVatChat);
  });

  // Tạo dữ liệu lịch sử sử dụng
  sampleLichSuSuDung.forEach(lichSu => {
    lichSuSuDungService.add(lichSu);
  });

  // Tạo dữ liệu bảo trì
  sampleBaoTri.forEach(baoTri => {
    baoTriService.add(baoTri);
  });

  // Tạo dữ liệu thông báo
  sampleThongBao.forEach(thongBao => {
    thongBaoService.add(thongBao);
  });

  // Tạo dữ liệu người dùng
  sampleNguoiDung.forEach(nguoiDung => {
    nguoiDungService.add(nguoiDung);
  });

  console.log('Đã tạo dữ liệu mẫu thành công!');
}; 