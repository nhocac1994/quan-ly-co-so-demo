// Service Google Sheets mới - đơn giản và hiệu quả
import * as jose from 'jose';

export interface ServiceAccountConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
}

class GoogleSheetsService {
  private config: ServiceAccountConfig | null = null;
  private accessToken: string = '';
  private tokenExpiry: number | null = null;

  // Khởi tạo service
  async initialize(spreadsheetId: string, clientEmail: string, privateKey: string): Promise<boolean> {
    try {
      this.config = { spreadsheetId, clientEmail, privateKey };
      
      // Test connection ngay lập tức
      const isConnected = await this.testConnection();
      return isConnected;
    } catch (error) {
      console.error('Lỗi khởi tạo Google Sheets:', error);
      return false;
    }
  }

  // Tạo JWT token đơn giản
  private async createJWT(): Promise<string> {
    if (!this.config) {
      throw new Error('Chưa khởi tạo service');
    }

    const { clientEmail, privateKey } = this.config;
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // 1 giờ

    try {
      // Xử lý private key đơn giản
      const cleanKey = privateKey
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '');

      // Thử decode base64
      let decodedKey: string;
      try {
        // Thử URL-safe base64
        const urlSafeKey = cleanKey.replace(/-/g, '+').replace(/_/g, '/');
        decodedKey = atob(urlSafeKey);
      } catch {
        // Thử raw base64
        decodedKey = atob(cleanKey);
      }

      // Import key
      const key = await jose.importPKCS8(
        `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`,
        'RS256'
      );

      // Tạo JWT
      const token = await new jose.SignJWT({
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: expiry,
        iat: now
      })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime(expiry)
        .sign(key);

      return token;
    } catch (error) {
      throw new Error('Không thể tạo JWT token');
    }
  }

  // Lấy access token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const jwt = await this.createJWT();
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt
        })
      });

      if (!response.ok) {
        throw new Error(`Lỗi OAuth: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token || '';
      this.tokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000);

      return this.accessToken;
    } catch (error) {
      throw new Error('Không thể lấy access token');
    }
  }

  // Test kết nối
  async testConnection(): Promise<boolean> {
    try {
      if (!this.config?.spreadsheetId) {
        return false;
      }

      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}?fields=properties.title`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Đọc dữ liệu từ sheet
  async readSheet(sheetName: string): Promise<any[][]> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config?.spreadsheetId}/values/${sheetName}!A:Z`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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

  // Ghi dữ liệu vào sheet
  async writeSheet(sheetName: string, values: any[][]): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config?.spreadsheetId}/values/${sheetName}!A:Z?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values })
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi ghi sheet: ${response.status}`);
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
export const googleSheetsService = new GoogleSheetsService();

// Helper functions
export const initializeGoogleSheets = async (
  spreadsheetId: string,
  clientEmail: string,
  privateKey: string
): Promise<boolean> => {
  return await googleSheetsService.initialize(spreadsheetId, clientEmail, privateKey);
};

export const syncDataToGoogleSheets = async (data: any): Promise<void> => {
  await googleSheetsService.syncAllData(data);
};

export const testGoogleSheetsConnection = async (): Promise<boolean> => {
  return await googleSheetsService.testConnection();
}; 