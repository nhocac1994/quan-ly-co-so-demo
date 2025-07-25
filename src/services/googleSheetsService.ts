// Service Google Sheets sử dụng Service Account với JWT
import * as jose from 'jose';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig | null = null;
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

  // Tạo JWT token
  private async createJWT(): Promise<string> {
    if (!this.config) {
      throw new Error('Chưa khởi tạo service');
    }

    const { clientEmail, privateKey } = this.config;
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // 1 giờ

    try {
      // Debug: Kiểm tra private key
      console.log('🔍 Debug: Private key length:', privateKey.length);
      console.log('🔍 Debug: Private key starts with:', privateKey.substring(0, 50));
      console.log('🔍 Debug: Private key ends with:', privateKey.substring(privateKey.length - 50));

      // Xử lý private key - thử nhiều format
      let cleanKey = privateKey;

      // Loại bỏ PEM headers nếu có
      if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        cleanKey = privateKey
          .replace(/-----BEGIN PRIVATE KEY-----/, '')
          .replace(/-----END PRIVATE KEY-----/, '')
          .replace(/\s/g, '');
      }

      // Loại bỏ RSA headers nếu có
      if (privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
        cleanKey = privateKey
          .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
          .replace(/-----END RSA PRIVATE KEY-----/, '')
          .replace(/\s/g, '');
      }

      console.log('🔍 Debug: Clean key length:', cleanKey.length);

      // Thử decode base64 với nhiều cách
      let decodedKey: string;
      try {
        // Thử URL-safe base64
        const urlSafeKey = cleanKey.replace(/-/g, '+').replace(/_/g, '/');
        decodedKey = atob(urlSafeKey);
        console.log('✅ Success: URL-safe base64 decode');
      } catch (error) {
        console.log('❌ Failed: URL-safe base64 decode, trying raw base64');
        try {
          // Thử raw base64
          decodedKey = atob(cleanKey);
          console.log('✅ Success: Raw base64 decode');
        } catch (error2) {
          console.log('❌ Failed: Raw base64 decode, trying with padding');
          // Thử thêm padding
          const paddedKey = cleanKey + '='.repeat((4 - cleanKey.length % 4) % 4);
          decodedKey = atob(paddedKey);
          console.log('✅ Success: Padded base64 decode');
        }
      }

      // Tạo PEM key
      const pemKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`;
      console.log('🔍 Debug: PEM key length:', pemKey.length);
      
      // Import key
      const key = await jose.importPKCS8(pemKey, 'RS256');
      console.log('✅ Success: Key imported');

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

      console.log('✅ Success: JWT created');
      return token;
    } catch (error) {
      console.error('❌ Error creating JWT:', error);
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
        throw new Error(`Lỗi lấy access token: ${response.status}`);
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error('Không nhận được access token');
      }
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Lỗi lấy access token:', error);
      throw error;
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

      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${sheetName}!A:Z`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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

  // Ghi dữ liệu vào sheet
  async writeSheet(sheetName: string, values: any[][]): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Chưa khởi tạo service');
      }

      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${sheetName}!A1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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