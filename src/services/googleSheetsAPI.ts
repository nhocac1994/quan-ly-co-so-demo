// Service Google Sheets API mới - sử dụng API Key thay vì Service Account
export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
}

class GoogleSheetsAPIService {
  private config: GoogleSheetsConfig | null = null;

  // Khởi tạo service với API Key
  async initialize(spreadsheetId: string, apiKey: string): Promise<boolean> {
    try {
      this.config = { spreadsheetId, apiKey };
      
      // Test connection ngay lập tức
      const isConnected = await this.testConnection();
      return isConnected;
    } catch (error) {
      console.error('Lỗi khởi tạo Google Sheets API:', error);
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

      return response.ok;
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
        throw new Error(`Lỗi đọc sheet: ${response.status}`);
      }

      const data = await response.json();
      return data.values || [];
    } catch (error) {
      throw new Error('Không thể đọc dữ liệu từ Google Sheets');
    }
  }

  // Ghi dữ liệu vào sheet (sử dụng Google Apps Script)
  async writeSheet(sheetName: string, values: any[][]): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Chưa khởi tạo service');
      }

      // Sử dụng Google Apps Script để ghi dữ liệu
      const scriptUrl = process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL;
      if (!scriptUrl) {
        throw new Error('Chưa cấu hình Google Apps Script URL');
      }

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'writeSheet',
          spreadsheetId: this.config.spreadsheetId,
          sheetName: sheetName,
          values: values
        })
      });

      if (!response.ok) {
        throw new Error(`Lỗi ghi sheet: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Lỗi ghi dữ liệu');
      }
    } catch (error) {
      throw new Error('Không thể ghi dữ liệu vào Google Sheets');
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
        // Delay nhỏ giữa các sheet
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      throw new Error('Lỗi đồng bộ dữ liệu');
    }
  }

  // Chuyển đổi dữ liệu sang format sheet
  private convertToSheetFormat(data: any[]): any[][] {
    if (data.length === 0) return [];
    
    const headers = Object.keys(data[0]);
    const sheetData = [headers];
    
    data.forEach(item => {
      const row = headers.map(header => item[header] || '');
      sheetData.push(row);
    });
    
    return sheetData;
  }
}

// Export service instance
export const googleSheetsAPIService = new GoogleSheetsAPIService();

// Helper functions
export const initializeGoogleSheetsAPI = async (
  spreadsheetId: string,
  apiKey: string
): Promise<boolean> => {
  return await googleSheetsAPIService.initialize(spreadsheetId, apiKey);
};

export const syncDataToGoogleSheetsAPI = async (data: any): Promise<void> => {
  await googleSheetsAPIService.syncAllData(data);
};

export const testGoogleSheetsAPIConnection = async (): Promise<boolean> => {
  return await googleSheetsAPIService.testConnection();
}; 