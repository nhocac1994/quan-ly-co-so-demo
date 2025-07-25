// Service để tích hợp với Google Sheets API
// Cấu hình cho Google Sheets: https://docs.google.com/spreadsheets/d/1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No/edit

export interface GoogleSheetsConfig {
  apiKey: string;
  spreadsheetId: string;
  ranges: {
    thietBi: string;
    coSoVatChat: string;
    lichSuSuDung: string;
    baoTri: string;
    thongBao: string;
    nguoiDung: string;
  };
}

// Cấu hình mặc định cho Google Sheets của bạn
export const DEFAULT_GOOGLE_SHEETS_CONFIG: GoogleSheetsConfig = {
  apiKey: 'YOUR_API_KEY_HERE', // Thay bằng API key của bạn
  spreadsheetId: '1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No',
  ranges: {
    thietBi: 'ThietBi!A:K',
    coSoVatChat: 'CoSoVatChat!A:J',
    lichSuSuDung: 'LichSuSuDung!A:J',
    baoTri: 'BaoTri!A:K',
    thongBao: 'ThongBao!A:I',
    nguoiDung: 'NguoiDung!A:H'
  }
};

class GoogleSheetsService {
  private config: GoogleSheetsConfig | null = null;

  setConfig(config: GoogleSheetsConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    if (!this.config) {
      throw new Error('Google Sheets chưa được cấu hình');
    }

    const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}${endpoint}`);
    url.searchParams.append('key', this.config.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Đọc dữ liệu từ Google Sheets
  async readRange(range: string) {
    return this.makeRequest('/values/' + range);
  }

  // Ghi dữ liệu vào Google Sheets
  async writeRange(range: string, values: any[][]) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config?.spreadsheetId}/values/${range}?valueInputOption=RAW&key=${this.config?.apiKey}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: values
      })
    });

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Đồng bộ dữ liệu từ localStorage lên Google Sheets
  async syncToGoogleSheets(localData: any, sheetName: string) {
    if (!this.config) return;

    try {
      // Chuyển đổi dữ liệu thành format phù hợp cho Google Sheets
      const values = this.convertDataToSheetFormat(localData);
      
      // Ghi dữ liệu lên Google Sheets
      await this.writeRange(sheetName, values);
      console.log(`Đã đồng bộ dữ liệu ${sheetName} lên Google Sheets`);
    } catch (error) {
      console.error(`Lỗi khi đồng bộ ${sheetName}:`, error);
      throw error;
    }
  }

  // Đồng bộ dữ liệu từ Google Sheets về localStorage
  async syncFromGoogleSheets(sheetName: string) {
    if (!this.config) return [];

    try {
      const response = await this.readRange(sheetName);
      const values = response.values || [];
      
      // Chuyển đổi dữ liệu từ Google Sheets về format phù hợp
      const data = this.convertSheetDataToLocalFormat(values, sheetName);
      return data;
    } catch (error) {
      console.error(`Lỗi khi đồng bộ từ ${sheetName}:`, error);
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
      const row = headers.map(header => item[header] || '');
      rows.push(row);
    });

    return rows;
  }

  // Chuyển đổi dữ liệu từ Google Sheets về format localStorage
  private convertSheetDataToLocalFormat(values: any[][], sheetName: string): any[] {
    if (values.length < 2) return [];

    const headers = values[0];
    const data = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const item: any = {};

      headers.forEach((header, index) => {
        item[header] = row[index] || '';
      });

      data.push(item);
    }

    return data;
  }

  // Đồng bộ tất cả dữ liệu
  async syncAllData(localStorageData: {
    thietBi: any[];
    coSoVatChat: any[];
    lichSuSuDung: any[];
    baoTri: any[];
    thongBao: any[];
    nguoiDung: any[];
  }) {
    if (!this.config) return;

    const syncPromises = [
      this.syncToGoogleSheets(localStorageData.thietBi, this.config.ranges.thietBi),
      this.syncToGoogleSheets(localStorageData.coSoVatChat, this.config.ranges.coSoVatChat),
      this.syncToGoogleSheets(localStorageData.lichSuSuDung, this.config.ranges.lichSuSuDung),
      this.syncToGoogleSheets(localStorageData.baoTri, this.config.ranges.baoTri),
      this.syncToGoogleSheets(localStorageData.thongBao, this.config.ranges.thongBao),
      this.syncToGoogleSheets(localStorageData.nguoiDung, this.config.ranges.nguoiDung)
    ];

    try {
      await Promise.all(syncPromises);
      console.log('Đã đồng bộ tất cả dữ liệu lên Google Sheets');
    } catch (error) {
      console.error('Lỗi khi đồng bộ dữ liệu:', error);
      throw error;
    }
  }

  // Tạo Google Sheets template
  async createTemplate() {
    if (!this.config) return;

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
      console.log('Đã tạo template Google Sheets');
    } catch (error) {
      console.error('Lỗi khi tạo template:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();

// Hàm helper để cấu hình Google Sheets
export const configureGoogleSheets = (config: GoogleSheetsConfig) => {
  googleSheetsService.setConfig(config);
};

// Hàm helper để đồng bộ dữ liệu
export const syncDataToGoogleSheets = async (localStorageData: any) => {
  await googleSheetsService.syncAllData(localStorageData);
};

// Hàm helper để tạo template
export const createGoogleSheetsTemplate = async () => {
  await googleSheetsService.createTemplate();
}; 