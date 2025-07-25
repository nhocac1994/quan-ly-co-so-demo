// Service sử dụng Service Account để truy cập Google Sheets trên Vercel
// Sử dụng jose library tương thích với browser

import * as jose from 'jose';

export interface ServiceAccountConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
}

class GoogleServiceAccountVercelService {
  private config: ServiceAccountConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  setConfig(config: ServiceAccountConfig) {
    this.config = config;
  }

  // Tạo JWT token từ service account credentials
  private async createJWT(): Promise<string> {
    if (!this.config) {
      throw new Error('Chưa cấu hình Service Account');
    }

    const { clientEmail, privateKey } = this.config;
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // 1 giờ

    try {
      // Xử lý private key với nhiều format khác nhau
      const processedPrivateKey = this.normalizePrivateKey(privateKey);
      
      // Import private key
      const key = await jose.importPKCS8(processedPrivateKey, 'RS256');

      // Tạo JWT payload
      const payload = {
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: expiry,
        iat: now
      };

      // Ký JWT
      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime(expiry)
        .sign(key);

      return token;
    } catch (error) {
      console.error('Lỗi khi tạo JWT:', error);
      throw new Error('Không thể tạo JWT token');
    }
  }

  // Chuẩn hóa private key để đảm bảo đúng format PKCS#8
  private normalizePrivateKey(privateKey: string): string {
    try {
      // Loại bỏ tất cả whitespace và newlines
      let cleanKey = privateKey.replace(/\s/g, '');
      
      // Kiểm tra nếu đã là PKCS#8 format
      if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        return this.formatPEMKey(privateKey, 'PRIVATE KEY');
      }
      
      // Kiểm tra nếu là RSA private key format
      if (privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
        return this.convertRSAtoPKCS8(privateKey);
      }
      
      // Thử xử lý base64 đơn giản
      try {
        // Thử URL-safe base64 trước
        const urlSafeKey = cleanKey.replace(/-/g, '+').replace(/_/g, '/');
        const paddedKey = this.addBase64Padding(urlSafeKey);
        
        if (this.isValidBase64(paddedKey)) {
          return this.formatPEMKey(paddedKey, 'PRIVATE KEY');
        }
      } catch (error) {
        // Ignore error, try next method
      }
      
      // Fallback: thử với format gốc
      return this.formatPEMKey(privateKey, 'PRIVATE KEY');
      
    } catch (error) {
      throw new Error('Private key không đúng định dạng');
    }
  }

  // Thêm padding cho base64 nếu thiếu
  private addBase64Padding(str: string): string {
    const pad = str.length % 4;
    if (pad) {
      str += new Array(5 - pad).join('=');
    }
    return str;
  }

  // Kiểm tra string có phải là base64 hợp lệ không
  private isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }

  // Format key thành PEM format
  private formatPEMKey(keyContent: string, keyType: string): string {
    // Loại bỏ header và footer nếu có
    const cleanContent = keyContent
      .replace(/-----BEGIN [^-]+-----/, '')
      .replace(/-----END [^-]+-----/, '')
      .replace(/\s/g, '');
    
    // Format thành 64 ký tự mỗi dòng
    const formattedContent = cleanContent.match(/.{1,64}/g)?.join('\n') || cleanContent;
    
    return `-----BEGIN ${keyType}-----\n${formattedContent}\n-----END ${keyType}-----`;
  }

  // Chuyển đổi RSA private key sang PKCS#8 format
  private convertRSAtoPKCS8(rsaPrivateKey: string): string {
    try {
      // Loại bỏ header và footer RSA
      const keyContent = rsaPrivateKey
        .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
        .replace(/-----END RSA PRIVATE KEY-----/, '')
        .replace(/\s/g, '');

      // Thử decode base64 với nhiều cách
      let binaryString: string;
      try {
        binaryString = atob(keyContent);
      } catch (error) {
        // Thử với URL-safe base64
        const urlSafeKey = keyContent.replace(/-/g, '+').replace(/_/g, '/');
        const paddedKey = this.addBase64Padding(urlSafeKey);
        binaryString = atob(paddedKey);
      }
      
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Tạo PKCS#8 header
      const pkcs8Header = new Uint8Array([
        0x30, 0x82, 0x04, 0x22, 0x02, 0x01, 0x00, 0x30,
        0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7,
        0x0d, 0x01, 0x01, 0x01, 0x05, 0x00, 0x04, 0x82,
        0x04, 0x0c
      ]);

      // Kết hợp header và key content
      const pkcs8Key = new Uint8Array(pkcs8Header.length + bytes.length);
      pkcs8Key.set(pkcs8Header);
      pkcs8Key.set(bytes, pkcs8Header.length);

      // Encode base64 và format
      const base64Key = btoa(String.fromCharCode.apply(null, Array.from(pkcs8Key)));
      const formattedKey = base64Key.match(/.{1,64}/g)?.join('\n') || base64Key;

      return `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
    } catch (error) {
      // Fallback: thử với format gốc
      return this.formatPEMKey(rsaPrivateKey, 'PRIVATE KEY');
    }
  }

  // Lấy access token từ Google OAuth2
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const jwtToken = await this.createJWT();
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwtToken
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lỗi OAuth response:', errorText);
        throw new Error(`Lỗi khi lấy access token: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token || null;
      this.tokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000);

      return this.accessToken || '';
    } catch (error) {
      console.error('Lỗi khi lấy access token:', error);
      throw error;
    }
  }

  // Test kết nối
  async testConnection(): Promise<boolean> {
    try {
      if (!this.config?.spreadsheetId) {
        throw new Error('Chưa cấu hình Spreadsheet ID');
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
        const errorText = await response.text();
        console.error('Lỗi test connection:', errorText);
        throw new Error(`Lỗi khi test kết nối: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Kết nối thành công với Google Sheets:', data.properties.title);
      return true;
    } catch (error) {
      console.error('❌ Lỗi test kết nối:', error);
      return false;
    }
  }

  // Đọc dữ liệu từ Google Sheets với retry logic
  async readRange(range: string): Promise<any[][]> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const accessToken = await this.getAccessToken();
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.config?.spreadsheetId}/values/${range}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 429) {
          // Rate limiting - wait with exponential backoff
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`Rate limited (429), waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Lỗi khi đọc dữ liệu: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data.values || [];
      } catch (error) {
        lastError = error as Error;
        console.error(`Lỗi khi đọc range (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError || new Error('Tất cả các lần thử đều thất bại');
  }

  // Ghi dữ liệu vào Google Sheets với retry logic
  async writeRange(range: string, values: any[][]): Promise<void> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const accessToken = await this.getAccessToken();
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.config?.spreadsheetId}/values/${range}?valueInputOption=RAW`,
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

        if (response.status === 429) {
          // Rate limiting - wait with exponential backoff
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`Rate limited (429), waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Lỗi khi ghi dữ liệu: ${response.status} ${errorText}`);
        }

        console.log('✅ Ghi dữ liệu thành công vào range:', range);
        return;
      } catch (error) {
        lastError = error as Error;
        console.error(`Lỗi khi ghi range (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError || new Error('Tất cả các lần thử đều thất bại');
  }

  // Đồng bộ dữ liệu lên Google Sheets
  async syncToGoogleSheets(localData: any[], sheetName: string): Promise<void> {
    try {
      const sheetRange = `${sheetName}!A:Z`;
      const sheetData = this.convertDataToSheetFormat(localData);
      
      // Xóa dữ liệu cũ
      await this.writeRange(sheetRange, []);
      
      // Ghi dữ liệu mới
      if (sheetData.length > 0) {
        await this.writeRange(sheetRange, sheetData);
      }
      
      console.log(`✅ Đồng bộ thành công ${localData.length} bản ghi lên sheet ${sheetName}`);
    } catch (error) {
      console.error(`❌ Lỗi khi đồng bộ sheet ${sheetName}:`, error);
      throw error;
    }
  }

  // Chuyển đổi dữ liệu sang định dạng sheet
  private convertDataToSheetFormat(data: any[]): any[][] {
    if (data.length === 0) return [];

    // Lấy headers từ object đầu tiên
    const headers = Object.keys(data[0]);
    const sheetData = [headers];

    // Thêm dữ liệu
    data.forEach(item => {
      const row = headers.map(header => item[header] || '');
      sheetData.push(row);
    });

    return sheetData;
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
    try {
      console.log('🔄 Bắt đầu đồng bộ tất cả dữ liệu...');

      // Đồng bộ từng sheet với delay để tránh rate limiting
      await this.syncToGoogleSheets(localStorageData.thietBi, 'ThietBi');
      await this.delay(500); // Delay 500ms giữa các sheet
      
      await this.syncToGoogleSheets(localStorageData.coSoVatChat, 'CoSoVatChat');
      await this.delay(500);
      
      await this.syncToGoogleSheets(localStorageData.lichSuSuDung, 'LichSuSuDung');
      await this.delay(500);
      
      await this.syncToGoogleSheets(localStorageData.baoTri, 'BaoTri');
      await this.delay(500);
      
      await this.syncToGoogleSheets(localStorageData.thongBao, 'ThongBao');
      await this.delay(500);
      
      await this.syncToGoogleSheets(localStorageData.nguoiDung, 'NguoiDung');

      console.log('✅ Đồng bộ tất cả dữ liệu thành công!');
    } catch (error) {
      console.error('❌ Lỗi khi đồng bộ tất cả dữ liệu:', error);
      throw error;
    }
  }

  // Helper function để delay
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Xóa cấu hình
  clearConfig() {
    this.config = null;
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}

export const googleServiceAccountVercelService = new GoogleServiceAccountVercelService();

// Helper functions
export const initializeGoogleServiceAccountVercel = async (
  spreadsheetId: string,
  clientEmail: string,
  privateKey: string
): Promise<boolean> => {
  try {
    googleServiceAccountVercelService.setConfig({ 
      spreadsheetId, 
      clientEmail, 
      privateKey 
    });
    return await googleServiceAccountVercelService.testConnection();
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo Service Account Vercel:', error);
    return false;
  }
};

export const syncDataWithServiceAccountVercel = async (localStorageData: any): Promise<void> => {
  await googleServiceAccountVercelService.syncAllData(localStorageData);
};

export const testConnectionVercel = async (): Promise<boolean> => {
  return await googleServiceAccountVercelService.testConnection();
}; 