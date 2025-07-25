// Service sử dụng Service Account để truy cập Google Sheets
// Không cần OAuth flow, chỉ cần credentials.json

export interface ServiceAccountConfig {
  spreadsheetId: string;
  credentials: any; // Service account credentials
}

class GoogleServiceAccountService {
  private config: ServiceAccountConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  setConfig(config: ServiceAccountConfig) {
    this.config = config;
  }

  // Tạo JWT token từ service account credentials
  private async createJWT(): Promise<string> {
    if (!this.config?.credentials) {
      throw new Error('Chưa cấu hình Service Account credentials');
    }

    const { credentials } = this.config;
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // 1 giờ

    // Tạo JWT header
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    // Tạo JWT payload
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: expiry,
      iat: now
    };

    // Encode header và payload
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');

    // Tạo signature (sử dụng private key)
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = await this.signWithPrivateKey(signatureInput, credentials.private_key);

    return `${signatureInput}.${signature}`;
  }

  // Ký JWT với private key
  private async signWithPrivateKey(input: string, privateKey: string): Promise<string> {
    try {
      // Sử dụng Web Crypto API để ký
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      
      // Import private key
      const key = await crypto.subtle.importKey(
        'pkcs8',
        this.base64ToArrayBuffer(this.pemToBase64(privateKey)),
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        },
        false,
        ['sign']
      );

      // Ký dữ liệu
      const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, data);
      
      const uint8Array = new Uint8Array(signature);
      const charCodes = Array.from(uint8Array);
      return btoa(String.fromCharCode(...charCodes)) // eslint-disable-line no-undef
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch (error) {
      console.error('Lỗi khi ký JWT:', error);
      throw new Error('Không thể tạo JWT signature');
    }
  }

  // Chuyển đổi PEM sang Base64
  private pemToBase64(pem: string): string {
    return pem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');
  }

  // Chuyển đổi Base64 sang ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Lấy access token từ Google OAuth2
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
        const errorText = await response.text();
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
        throw new Error(`Lỗi khi test kết nối: ${response.status}`);
      }

      const data = await response.json();
      console.log('Kết nối thành công với Google Sheets:', data.properties.title);
      return true;
    } catch (error) {
      console.error('Lỗi test kết nối:', error);
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
          throw new Error(`Lỗi khi đọc dữ liệu: ${response.status}`);
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
          throw new Error(`Lỗi khi ghi dữ liệu: ${response.status}`);
        }

        console.log('Ghi dữ liệu thành công vào range:', range);
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
      
      console.log(`Đồng bộ thành công ${localData.length} bản ghi lên sheet ${sheetName}`);
    } catch (error) {
      console.error(`Lỗi khi đồng bộ sheet ${sheetName}:`, error);
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
      console.log('Bắt đầu đồng bộ tất cả dữ liệu...');

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

      console.log('Đồng bộ tất cả dữ liệu thành công!');
    } catch (error) {
      console.error('Lỗi khi đồng bộ tất cả dữ liệu:', error);
      throw error;
    }
  }

  // Helper function để delay
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Đồng bộ dữ liệu từ Google Sheets về localStorage
  async syncFromGoogleSheets(): Promise<{
    thietBi: any[];
    coSoVatChat: any[];
    lichSuSuDung: any[];
    baoTri: any[];
    thongBao: any[];
    nguoiDung: any[];
  }> {
    try {
      console.log('Bắt đầu đồng bộ dữ liệu từ Google Sheets...');
      
      const data = await this.readAllData();
      
      // Lưu vào localStorage
      localStorage.setItem('thietBi', JSON.stringify(data.thietBi));
      localStorage.setItem('coSoVatChat', JSON.stringify(data.coSoVatChat));
      localStorage.setItem('lichSuSuDung', JSON.stringify(data.lichSuSuDung));
      localStorage.setItem('baoTri', JSON.stringify(data.baoTri));
      localStorage.setItem('thongBao', JSON.stringify(data.thongBao));
      localStorage.setItem('nguoiDung', JSON.stringify(data.nguoiDung));
      
      console.log('Đồng bộ từ Google Sheets thành công!');
      return data;
    } catch (error) {
      console.error('Lỗi khi đồng bộ từ Google Sheets:', error);
      throw error;
    }
  }

  // Đồng bộ hai chiều (merge dữ liệu)
  async syncBidirectional(localStorageData: {
    thietBi: any[];
    coSoVatChat: any[];
    lichSuSuDung: any[];
    baoTri: any[];
    thongBao: any[];
    nguoiDung: any[];
  }): Promise<void> {
    try {
      console.log('Bắt đầu đồng bộ hai chiều...');
      
      // Đọc dữ liệu từ Google Sheets
      const sheetsData = await this.readAllData();
      
      // Merge dữ liệu (ưu tiên dữ liệu mới nhất)
      const mergedData = {
        thietBi: this.mergeData(localStorageData.thietBi, sheetsData.thietBi),
        coSoVatChat: this.mergeData(localStorageData.coSoVatChat, sheetsData.coSoVatChat),
        lichSuSuDung: this.mergeData(localStorageData.lichSuSuDung, sheetsData.lichSuSuDung),
        baoTri: this.mergeData(localStorageData.baoTri, sheetsData.baoTri),
        thongBao: this.mergeData(localStorageData.thongBao, sheetsData.thongBao),
        nguoiDung: this.mergeData(localStorageData.nguoiDung, sheetsData.nguoiDung)
      };
      
      // Lưu merged data vào localStorage
      localStorage.setItem('thietBi', JSON.stringify(mergedData.thietBi));
      localStorage.setItem('coSoVatChat', JSON.stringify(mergedData.coSoVatChat));
      localStorage.setItem('lichSuSuDung', JSON.stringify(mergedData.lichSuSuDung));
      localStorage.setItem('baoTri', JSON.stringify(mergedData.baoTri));
      localStorage.setItem('thongBao', JSON.stringify(mergedData.thongBao));
      localStorage.setItem('nguoiDung', JSON.stringify(mergedData.nguoiDung));
      
      // Đồng bộ merged data lên Google Sheets
      await this.syncAllData(mergedData);
      
      console.log('Đồng bộ hai chiều thành công!');
    } catch (error) {
      console.error('Lỗi khi đồng bộ hai chiều:', error);
      throw error;
    }
  }

  // Merge dữ liệu từ hai nguồn
  private mergeData(localData: any[], sheetsData: any[]): any[] {
    const merged = new Map();
    
    // Thêm dữ liệu từ localStorage
    localData.forEach(item => {
      if (item.id) {
        merged.set(item.id, item);
      }
    });
    
    // Thêm dữ liệu từ Google Sheets (ghi đè nếu cần)
    sheetsData.forEach(item => {
      if (item.id) {
        const existing = merged.get(item.id);
        if (!existing || this.isNewer(item, existing)) {
          merged.set(item.id, item);
        }
      }
    });
    
    return Array.from(merged.values());
  }

  // Kiểm tra item nào mới hơn
  private isNewer(item1: any, item2: any): boolean {
    const date1 = item1.ngayCapNhat || item1.ngayTao || item1.ngayNhap || '0';
    const date2 = item2.ngayCapNhat || item2.ngayTao || item2.ngayNhap || '0';
    return new Date(date1) > new Date(date2);
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
      console.log('Bắt đầu đọc tất cả dữ liệu từ Google Sheets...');

      const [thietBi, coSoVatChat, lichSuSuDung, baoTri, thongBao, nguoiDung] = await Promise.all([
        this.readSheetData('ThietBi'),
        this.readSheetData('CoSoVatChat'),
        this.readSheetData('LichSuSuDung'),
        this.readSheetData('BaoTri'),
        this.readSheetData('ThongBao'),
        this.readSheetData('NguoiDung')
      ]);

      console.log('Đọc tất cả dữ liệu thành công!');
      return { thietBi, coSoVatChat, lichSuSuDung, baoTri, thongBao, nguoiDung };
    } catch (error) {
      console.error('Lỗi khi đọc tất cả dữ liệu:', error);
      throw error;
    }
  }

  // Đọc dữ liệu từ một sheet và chuyển đổi thành objects
  private async readSheetData(sheetName: string): Promise<any[]> {
    try {
      const range = `${sheetName}!A:Z`;
      const rawData = await this.readRange(range);
      
      if (rawData.length < 2) {
        console.log(`Sheet ${sheetName} trống hoặc chỉ có header`);
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
      console.error(`Lỗi khi đọc sheet ${sheetName}:`, error);
      return [];
    }
  }

  // Xóa cấu hình
  clearConfig() {
    this.config = null;
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}

export const googleServiceAccountService = new GoogleServiceAccountService();

// Helper functions
export const initializeGoogleServiceAccount = async (
  spreadsheetId: string,
  credentials: any
): Promise<boolean> => {
  try {
    googleServiceAccountService.setConfig({ spreadsheetId, credentials });
    return await googleServiceAccountService.testConnection();
  } catch (error) {
    console.error('Lỗi khi khởi tạo Service Account:', error);
    return false;
  }
};

export const syncDataWithServiceAccount = async (localStorageData: any): Promise<void> => {
  await googleServiceAccountService.syncAllData(localStorageData);
};

export const syncFromGoogleSheetsWithServiceAccount = async (): Promise<any> => {
  return await googleServiceAccountService.syncFromGoogleSheets();
};

export const syncBidirectionalWithServiceAccount = async (localStorageData: any): Promise<void> => {
  await googleServiceAccountService.syncBidirectional(localStorageData);
};

export const readAllDataFromServiceAccount = async (): Promise<any> => {
  return await googleServiceAccountService.readAllData();
}; 