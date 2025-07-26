import { ThietBi } from '../types';

export const sampleEquipment: ThietBi[] = [
  {
    id: '1',
    ten: 'Máy tính Dell OptiPlex',
    loai: 'Máy tính',
    soLuong: 5,
    tinhTrang: 'suDung',
    viTri: 'Phòng Lab 1',
    nhaCungCap: 'Dell Vietnam',
    giaTri: 15000000,
    ngayNhap: '2024-01-15T00:00:00.000Z',
    ngayCapNhat: '2024-01-15T00:00:00.000Z',
    moTa: 'Máy tính để bàn Dell OptiPlex 7090, Intel Core i5, 8GB RAM, 256GB SSD'
  },
  {
    id: '2',
    ten: 'Máy chiếu Epson',
    loai: 'Máy chiếu',
    soLuong: 3,
    tinhTrang: 'suDung',
    viTri: 'Phòng học A1',
    nhaCungCap: 'Epson Vietnam',
    giaTri: 12000000,
    ngayNhap: '2024-01-10T00:00:00.000Z',
    ngayCapNhat: '2024-01-10T00:00:00.000Z',
    moTa: 'Máy chiếu Epson EB-X41, độ phân giải XGA, độ sáng 3600 lumens'
  },
  {
    id: '3',
    ten: 'Máy in HP LaserJet',
    loai: 'Máy in',
    soLuong: 2,
    tinhTrang: 'hongHoc',
    viTri: 'Văn phòng',
    nhaCungCap: 'HP Vietnam',
    giaTri: 8000000,
    ngayNhap: '2023-12-20T00:00:00.000Z',
    ngayCapNhat: '2024-01-05T00:00:00.000Z',
    moTa: 'Máy in laser HP LaserJet Pro M404n, tốc độ in 38 trang/phút'
  },
  {
    id: '4',
    ten: 'Bàn ghế học sinh',
    loai: 'Bàn ghế',
    soLuong: 50,
    tinhTrang: 'suDung',
    viTri: 'Phòng học A2',
    nhaCungCap: 'Nội thất ABC',
    giaTri: 5000000,
    ngayNhap: '2024-01-20T00:00:00.000Z',
    ngayCapNhat: '2024-01-20T00:00:00.000Z',
    moTa: 'Bộ bàn ghế học sinh 2 chỗ ngồi, gỗ công nghiệp, màu nâu'
  },
  {
    id: '5',
    ten: 'Điều hòa Daikin',
    loai: 'Điều hòa',
    soLuong: 8,
    tinhTrang: 'baoTri',
    viTri: 'Phòng học A3',
    nhaCungCap: 'Daikin Vietnam',
    giaTri: 25000000,
    ngayNhap: '2023-11-15T00:00:00.000Z',
    ngayCapNhat: '2024-01-18T00:00:00.000Z',
    moTa: 'Điều hòa Daikin FTXM35R, công suất 1.5HP, inverter'
  },
  {
    id: '6',
    ten: 'Máy quạt công nghiệp',
    loai: 'Quạt',
    soLuong: 12,
    tinhTrang: 'ngungSuDung',
    viTri: 'Kho thiết bị',
    nhaCungCap: 'Panasonic Vietnam',
    giaTri: 3000000,
    ngayNhap: '2023-10-10T00:00:00.000Z',
    ngayCapNhat: '2024-01-10T00:00:00.000Z',
    moTa: 'Quạt công nghiệp Panasonic F-40X3, đường kính 40cm'
  }
];

export const initializeSampleEquipment = () => {
  const existingData = localStorage.getItem('thietBi');
  
  if (!existingData) {
    localStorage.setItem('thietBi', JSON.stringify(sampleEquipment));
    // console.log('✅ Đã khởi tạo dữ liệu mẫu thiết bị');
  } else {
    // console.log('ℹ️ Dữ liệu thiết bị đã tồn tại');
  }
};

export const forceInitializeSampleEquipment = () => {
  localStorage.setItem('thietBi', JSON.stringify(sampleEquipment));
  // console.log('✅ Đã force khởi tạo dữ liệu mẫu thiết bị');
}; 