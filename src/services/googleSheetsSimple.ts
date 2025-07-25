// Service đơn giản để tích hợp với Google Sheets API sử dụng API Key
import { DEFAULT_GOOGLE_SHEETS_CONFIG, GoogleSheetsConfig } from './googleSheets';

class GoogleSheetsSimpleService {
  private config: GoogleSheetsConfig | null = null;

  setConfig(config: GoogleSheetsConfig) {
    this.config = config;
  }

  // Kiểm tra kết nối với Google Sheets
  async testConnection(): Promise<boolean> {
    if (!this.config) {
      console.error('Chưa cấu hình Google Sheets');
      return false;
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}?key=${this.config.apiKey}`
      );
      
      if (response.ok) {
        console.log('✅ Kết nối Google Sheets thành công!');
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Lỗi kết nối Google Sheets:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Lỗi khi test kết nối:', error);
      return false;
    }
  }

  // Đọc dữ liệu từ Google Sheets
  async readRange(range: string): Promise<any[][]> {
    if (!this.config) {
      throw new Error('Chưa cấu hình Google Sheets');
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${range}?key=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error(`Lỗi khi đọc range ${range}:`, error);
      throw error;
    }
  }

  // Ghi dữ liệu vào Google Sheets
  async writeRange(range: string, values: any[][]): Promise<void> {
    if (!this.config) {
      throw new Error('Chưa cấu hình Google Sheets');
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${range}?valueInputOption=RAW&key=${this.config.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Sheets API error: ${JSON.stringify(errorData)}`);
      }

      console.log(`✅ Đã ghi dữ liệu vào range ${range}`);
    } catch (error) {
      console.error(`❌ Lỗi khi ghi range ${range}:`, error);
      throw error;
    }
  }

  // Đồng bộ dữ liệu từ localStorage lên Google Sheets
  async syncToGoogleSheets(localData: any, sheetName: string): Promise<void> {
    if (!this.config) {
      throw new Error('Chưa cấu hình Google Sheets');
    }

    try {
      // Chuyển đổi dữ liệu thành format phù hợp cho Google Sheets
      const values = this.convertDataToSheetFormat(localData);
      
      // Ghi dữ liệu lên Google Sheets
      const range = this.config.ranges[sheetName as keyof typeof this.config.ranges];
      await this.writeRange(range, values);
      console.log(`✅ Đã đồng bộ dữ liệu ${sheetName} lên Google Sheets`);
    } catch (error) {
      console.error(`❌ Lỗi khi đồng bộ ${sheetName}:`, error);
      throw error;
    }
  }

  // Chuyển đổi dữ liệu từ localStorage sang format Google Sheets
  private convertDataToSheetFormat(data: any[]): any[][] {
    if (data.length === 0) return [];

    // Lấy headers từ object đầu tiên
    const headers = Object.keys(data[0]);
    const rows = [headers];

    // Thêm dữ liệu
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      });
      rows.push(row);
    });

    return rows;
  }

  // Đồng bộ tất cả dữ liệu
  async syncAllData(localStorageData: {
    thietBi: any[];
    coSoVatChat: any[];
    lichSuSuDung: any[];
    baoTri: any[];
    thongBao: any[];
    nguoiDung: any[];
  }): Promise<void> {
    if (!this.config) {
      throw new Error('Chưa cấu hình Google Sheets');
    }

    const syncPromises = [
      this.syncToGoogleSheets(localStorageData.thietBi, 'thietBi'),
      this.syncToGoogleSheets(localStorageData.coSoVatChat, 'coSoVatChat'),
      this.syncToGoogleSheets(localStorageData.lichSuSuDung, 'lichSuSuDung'),
      this.syncToGoogleSheets(localStorageData.baoTri, 'baoTri'),
      this.syncToGoogleSheets(localStorageData.thongBao, 'thongBao'),
      this.syncToGoogleSheets(localStorageData.nguoiDung, 'nguoiDung')
    ];

    try {
      await Promise.all(syncPromises);
      console.log('✅ Đã đồng bộ tất cả dữ liệu lên Google Sheets');
    } catch (error) {
      console.error('❌ Lỗi khi đồng bộ dữ liệu:', error);
      throw error;
    }
  }

  // Tạo template Google Sheets
  async createTemplate(): Promise<void> {
    if (!this.config) {
      throw new Error('Chưa cấu hình Google Sheets');
    }

    const templateData = {
      thietBi: [
        ['id', 'ten', 'loai', 'soLuong', 'tinhTrang', 'moTa', 'ngayNhap', 'ngayCapNhat', 'viTri', 'nhaCungCap', 'giaTri'],
        ['', 'Máy tính Dell', 'Máy tính', '10', 'suDung', 'Máy tính phòng lab', '', '', 'Phòng Lab 1', 'Dell', '15000000']
      ],
      coSoVatChat: [
        ['id', 'ten', 'loai', 'sucChua', 'tinhTrang', 'moTa', 'viTri', 'ngayTao', 'ngayCapNhat', 'thietBiIds'],
        ['', 'Phòng Lab 1', 'phongThiNghiem', '30', 'hoatDong', 'Phòng thí nghiệm CNTT', 'Tầng 2', '', '', '']
      ],
      lichSuSuDung: [
        ['id', 'thietBiId', 'coSoVatChatId', 'nguoiMuon', 'vaiTro', 'ngayMuon', 'ngayTra', 'trangThai', 'lyDo', 'ghiChu'],
        ['', '', '', 'Nguyễn Văn A', 'hocSinh', '', '', 'dangMuon', 'Học tập', '']
      ],
      baoTri: [
        ['id', 'thietBiId', 'coSoVatChatId', 'loai', 'moTa', 'ngayBatDau', 'ngayKetThuc', 'trangThai', 'chiPhi', 'nguoiThucHien', 'ghiChu'],
        ['', '', '', 'baoTri', 'Bảo trì định kỳ', '', '', 'chuaBatDau', '0', 'Nhân viên kỹ thuật', '']
      ],
      thongBao: [
        ['id', 'tieuDe', 'noiDung', 'loai', 'doUuTien', 'ngayTao', 'ngayHetHan', 'trangThai', 'nguoiNhan'],
        ['', 'Thông báo bảo trì', 'Sẽ bảo trì hệ thống vào ngày mai', 'baoTri', 'trungBinh', '', '', 'chuaDoc', '']
      ],
      nguoiDung: [
        ['id', 'hoTen', 'email', 'vaiTro', 'lop', 'khoa', 'ngayTao', 'trangThai'],
        ['', 'Admin', 'admin@school.com', 'quanTriVien', '', '', '', 'hoatDong']
      ]
    };

    try {
      await this.syncAllData(templateData);
      console.log('✅ Đã tạo template Google Sheets');
    } catch (error) {
      console.error('❌ Lỗi khi tạo template:', error);
      throw error;
    }
  }
}

export const googleSheetsSimpleService = new GoogleSheetsSimpleService();

// Hàm helper để khởi tạo Google Sheets với API key
export const initializeGoogleSheetsWithAPIKey = async (apiKey: string): Promise<boolean> => {
  try {
    const config = {
      ...DEFAULT_GOOGLE_SHEETS_CONFIG,
      apiKey: apiKey
    };
    
    googleSheetsSimpleService.setConfig(config);
    const isConnected = await googleSheetsSimpleService.testConnection();
    
    if (isConnected) {
      console.log('✅ Kết nối Google Sheets thành công!');
      return true;
    } else {
      console.error('❌ Không thể kết nối với Google Sheets');
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo Google Sheets:', error);
    return false;
  }
};

// Hàm helper để đồng bộ dữ liệu
export const syncDataToGoogleSheetsSimple = async (localStorageData: any): Promise<void> => {
  await googleSheetsSimpleService.syncAllData(localStorageData);
}; 