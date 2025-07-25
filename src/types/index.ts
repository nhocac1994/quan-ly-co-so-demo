// Định nghĩa các loại dữ liệu chính

export interface ThietBi {
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

export interface CoSoVatChat {
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

export interface LichSuSuDung {
  id: string;
  thietBiId?: string;
  coSoVatChatId?: string;
  nguoiMuon: string;
  vaiTro: 'hocSinh' | 'giaoVien' | 'nhanVien';
  ngayMuon: string;
  ngayTra?: string;
  trangThai: 'dangMuon' | 'daTra' | 'quaHan';
  lyDo: string;
  ghiChu?: string;
}

export interface BaoTri {
  id: string;
  thietBiId?: string;
  coSoVatChatId?: string;
  loai: 'baoTri' | 'suaChua' | 'thayThe';
  moTa: string;
  ngayBatDau: string;
  ngayKetThuc?: string;
  trangThai: 'chuaBatDau' | 'dangThucHien' | 'hoanThanh' | 'biHuy';
  chiPhi?: number;
  nguoiThucHien: string;
  ghiChu?: string;
}

export interface ThongBao {
  id: string;
  tieuDe: string;
  noiDung: string;
  loai: 'baoTri' | 'thayThe' | 'caiTien' | 'thongBaoChung';
  doUuTien: 'thap' | 'trungBinh' | 'cao' | 'khẩnCấp';
  ngayTao: string;
  ngayHetHan?: string;
  trangThai: 'chuaDoc' | 'daDoc' | 'daXuLy';
  nguoiNhan?: string[];
}

export interface NguoiDung {
  id: string;
  hoTen: string;
  email: string;
  vaiTro: 'quanTriVien' | 'giaoVien' | 'hocSinh';
  soDienThoai?: string;
  lop?: string;
  khoa?: string;
  ngayTao: string;
  trangThai: 'hoatDong' | 'khoa';
}

export interface PhanQuyen {
  nguoiDungId: string;
  quyen: string[];
}

// Enums
export enum TrangThaiThietBi {
  SU_DUNG = 'suDung',
  HONG_HOC = 'hongHoc',
  BAO_TRI = 'baoTri',
  NGUNG_SU_DUNG = 'ngungSuDung'
}

export enum TrangThaiCoSoVatChat {
  HOAT_DONG = 'hoatDong',
  BAO_TRI = 'baoTri',
  NGUNG_SU_DUNG = 'ngungSuDung'
}

export enum VaiTroNguoiDung {
  QUAN_TRI_VIEN = 'quanTriVien',
  GIAO_VIEN = 'giaoVien',
  HOC_SINH = 'hocSinh'
} 