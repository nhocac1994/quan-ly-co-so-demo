// Service Google Sheets đơn giản - chỉ sử dụng API Key và Google Sheets API v4
export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
}

class GoogleSheetsSimpleService {
  private config: GoogleSheetsConfig | null = null;

  // Khởi tạo service
  async initialize(spreadsheetId: string, apiKey: string): Promise<boolean> {
    try {
      this.config = { spreadsheetId, apiKey };
      
      // Test connection ngay lập tức
      const isConnected = await this.testConnection();
      return isConnected;
    } catch (error) {
      console.error('Lỗi khởi tạo Google Sheets:', error);
      return false;
    }
  }

  // Test kết nối
  async testConnection(): Promise<boolean> {
    try {
      if (!this.config?.spreadsheetId || !this.config?.apiKey) {
        return false;
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}?fields=properties.title&key=${this.config.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error('Lỗi test connection:', response.status, response.statusText);
        return false;
      }

      const data = await response.json();
      console.log('✅ Kết nối thành công với Google Sheets:', data.properties.title);
      return true;
    } catch (error) {
      console.error('Lỗi test connection:', error);
      return false;
    }
  }

  // Đọc dữ liệu từ sheet
  async readSheet(sheetName: string): Promise<any[][]> {
    try {
      if (!this.config) {
        throw new Error('Chưa khởi tạo service');
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${sheetName}!A:Z?key=${this.config.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi đọc sheet: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Đọc thành công sheet ${sheetName}:`, data.values?.length || 0, 'rows');
      return data.values || [];
    } catch (error) {
      console.error(`❌ Lỗi đọc sheet ${sheetName}:`, error);
      throw new Error(`Không thể đọc dữ liệu từ sheet ${sheetName}`);
    }
  }

  // Ghi dữ liệu vào sheet (sử dụng batchUpdate)
  async writeSheet(sheetName: string, values: any[][]): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Chưa khởi tạo service');
      }

      // Xóa dữ liệu cũ trước
      await this.clearSheet(sheetName);

      // Ghi dữ liệu mới
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${sheetName}!A1?valueInputOption=RAW&key=${this.config.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: values
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi ghi sheet: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log(`✅ Ghi thành công sheet ${sheetName}:`, values.length, 'rows');
    } catch (error) {
      console.error(`❌ Lỗi ghi sheet ${sheetName}:`, error);
      throw new Error(`Không thể ghi dữ liệu vào sheet ${sheetName}`);
    }
  }

  // Xóa dữ liệu trong sheet
  async clearSheet(sheetName: string): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Chưa khởi tạo service');
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${sheetName}!A:Z:clear?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.warn(`Cảnh báo: Không thể xóa sheet ${sheetName}:`, response.status);
      }
    } catch (error) {
      console.warn(`Cảnh báo: Lỗi xóa sheet ${sheetName}:`, error);
    }
  }

  // Đồng bộ tất cả dữ liệu
  async syncAllData(data: {
    thietBi: any[];
    coSoVatChat: any[];
    lichSuSuDung: any[];
    baoTri: any[];
    thongBao: any[];
    nguoiDung: any[];
  }): Promise<void> {
    try {
      console.log('🔄 Bắt đầu đồng bộ dữ liệu...');

      const sheets = [
        { name: 'ThietBi', data: data.thietBi },
        { name: 'CoSoVatChat', data: data.coSoVatChat },
        { name: 'LichSuSuDung', data: data.lichSuSuDung },
        { name: 'BaoTri', data: data.baoTri },
        { name: 'ThongBao', data: data.thongBao },
        { name: 'NguoiDung', data: data.nguoiDung }
      ];

      for (const sheet of sheets) {
        const sheetData = this.convertToSheetFormat(sheet.data);
        await this.writeSheet(sheet.name, sheetData);
        
        // Delay nhỏ giữa các sheet để tránh rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('✅ Đồng bộ tất cả dữ liệu thành công!');
    } catch (error) {
      console.error('❌ Lỗi đồng bộ dữ liệu:', error);
      throw new Error('Lỗi đồng bộ dữ liệu');
    }
  }

  // Chuyển đổi dữ liệu sang format sheet
  private convertToSheetFormat(data: any[]): any[][] {
    if (data.length === 0) return [];
    
    const headers = Object.keys(data[0]);
    const sheetData = [headers];
    
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        // Xử lý các giá trị đặc biệt
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      });
      sheetData.push(row);
    });
    
    return sheetData;
  }

  // Đọc tất cả dữ liệu từ Google Sheets
  async readAllData(): Promise<{
    thietBi: any[];
    coSoVatChat: any[];
    lichSuSuDung: any[];
    baoTri: any[];
    thongBao: any[];
    nguoiDung: any[];
  }> {
    try {
      console.log('📖 Bắt đầu đọc tất cả dữ liệu...');

      const [thietBi, coSoVatChat, lichSuSuDung, baoTri, thongBao, nguoiDung] = await Promise.all([
        this.readSheetData('ThietBi'),
        this.readSheetData('CoSoVatChat'),
        this.readSheetData('LichSuSuDung'),
        this.readSheetData('BaoTri'),
        this.readSheetData('ThongBao'),
        this.readSheetData('NguoiDung')
      ]);

      console.log('✅ Đọc tất cả dữ liệu thành công!');
      return { thietBi, coSoVatChat, lichSuSuDung, baoTri, thongBao, nguoiDung };
    } catch (error) {
      console.error('❌ Lỗi đọc tất cả dữ liệu:', error);
      throw error;
    }
  }

  // Đọc dữ liệu từ một sheet và chuyển đổi thành objects
  private async readSheetData(sheetName: string): Promise<any[]> {
    try {
      const rawData = await this.readSheet(sheetName);
      
      if (rawData.length < 2) {
        console.log(`📝 Sheet ${sheetName} trống hoặc chỉ có header`);
        return [];
      }

      const headers = rawData[0];
      const dataRows = rawData.slice(1);
      
      return dataRows.map(row => {
        const obj: any = {};
        headers.forEach((header: string, index: number) => {
          if (row[index] !== undefined && row[index] !== '') {
            obj[header] = row[index];
          }
        });
        return obj;
      });
    } catch (error) {
      console.error(`❌ Lỗi đọc sheet ${sheetName}:`, error);
      return [];
    }
  }
}

// Export service instance
export const googleSheetsSimpleService = new GoogleSheetsSimpleService();

// Helper functions
export const initializeGoogleSheetsWithAPIKey = async (
  apiKey: string
): Promise<boolean> => {
  const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) {
    console.error('❌ Chưa cấu hình REACT_APP_GOOGLE_SPREADSHEET_ID');
    return false;
  }
  return await googleSheetsSimpleService.initialize(spreadsheetId, apiKey);
};

export const syncDataToGoogleSheetsSimple = async (data: any): Promise<void> => {
  await googleSheetsSimpleService.syncAllData(data);
};

export const readDataFromGoogleSheetsSimple = async (): Promise<any> => {
  return await googleSheetsSimpleService.readAllData();
};

export const testGoogleSheetsSimpleConnection = async (): Promise<boolean> => {
  return await googleSheetsSimpleService.testConnection();
}; 