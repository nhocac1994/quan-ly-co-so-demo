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

      // Xử lý private key - hỗ trợ nhiều format
      let pemKey = privateKey;

      // Nếu đã là PEM format, sử dụng trực tiếp
      if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.log('✅ Private key đã là PEM format');
        // Xử lý ký tự đặc biệt trong PEM
        pemKey = privateKey
          .replace(/\\n/g, '\n')  // Thay thế \n thành xuống dòng thật
          .replace(/\\"/g, '"')   // Thay thế \" thành "
          .replace(/^"/, '')      // Loại bỏ dấu ngoặc kép đầu
          .replace(/"$/, '');     // Loại bỏ dấu ngoặc kép cuối
      }
      // Nếu là RSA PEM format, chuyển đổi
      else if (privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
        console.log('✅ Chuyển đổi RSA PEM sang PKCS#8');
        pemKey = privateKey
          .replace(/-----BEGIN RSA PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----')
          .replace(/-----END RSA PRIVATE KEY-----/, '-----END PRIVATE KEY-----');
      }
      // Nếu là base64, chuyển đổi sang PEM
      else {
        console.log('✅ Chuyển đổi base64 sang PEM format');
        let cleanKey = privateKey.replace(/\s/g, '');
        
        // Thử decode base64 với nhiều cách
        try {
          // Thử URL-safe base64
          const urlSafeKey = cleanKey.replace(/-/g, '+').replace(/_/g, '/');
          atob(urlSafeKey); // Test decode
          cleanKey = urlSafeKey;
          console.log('✅ Success: URL-safe base64 decode');
        } catch (error) {
          console.log('❌ Failed: URL-safe base64 decode, trying raw base64');
          try {
            // Thử raw base64
            atob(cleanKey); // Test decode
            console.log('✅ Success: Raw base64 decode');
          } catch (error2) {
            console.log('❌ Failed: Raw base64 decode, trying with padding');
            // Thử thêm padding
            const paddedKey = cleanKey + '='.repeat((4 - cleanKey.length % 4) % 4);
            atob(paddedKey); // Test decode
            cleanKey = paddedKey;
            console.log('✅ Success: Padded base64 decode');
          }
        }
        
        pemKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`;
      }

      console.log('🔍 Debug: Final PEM key length:', pemKey.length);
      console.log('🔍 Debug: PEM key sample:', pemKey.substring(0, 100) + '...');
      
      // Import key
      let key;
      try {
        console.log('🔄 Đang import key...');
        key = await jose.importPKCS8(pemKey, 'RS256');
        console.log('✅ Success: Key imported');
      } catch (importError) {
        console.error('❌ Error importing key:', importError);
        throw new Error(`Không thể import private key: ${importError}`);
      }

      // Tạo JWT
      try {
        console.log('🔄 Đang tạo JWT...');
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
      } catch (jwtError) {
        console.error('❌ Error creating JWT:', jwtError);
        throw new Error(`Không thể tạo JWT: ${jwtError}`);
      }
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

  // Đọc dữ liệu từ Google Sheets với retry logic
  async readSheet(sheetName: string): Promise<any[][]> {
    const maxRetries = 5;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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

        if (response.status === 429) {
          // Rate limiting - wait with exponential backoff
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30s
          console.log(`Rate limited (429) reading ${sheetName}, waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          throw new Error(`Lỗi đọc sheet: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Đọc thành công sheet ${sheetName}:`, data.values?.length || 0, 'rows');
        return data.values || [];
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Lỗi đọc sheet ${sheetName} (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError || new Error(`Không thể đọc dữ liệu từ sheet ${sheetName}`);
  }

  // Ghi dữ liệu vào Google Sheets với retry logic
  async writeSheet(sheetName: string, data: any[]): Promise<void> {
    const maxRetries = 5;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const accessToken = await this.getAccessToken();
        
        // Xóa dữ liệu cũ
        const clearResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.config?.spreadsheetId}/values/${sheetName}!A:Z:clear`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (clearResponse.status === 429) {
          // Rate limiting - wait with exponential backoff
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30s
          console.log(`Rate limited (429) writing clear ${sheetName}, waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!clearResponse.ok) {
          throw new Error(`Lỗi xóa sheet: ${clearResponse.status}`);
        }

        // Nếu có dữ liệu, ghi dữ liệu mới
        if (data.length > 0) {
          // Chuyển đổi dữ liệu sang format sheet
          const sheetData = this.convertDataToSheetFormat(data);
          
          // Ghi dữ liệu theo batch để tránh rate limiting
          const batchSize = 10; // Ghi 10 rows mỗi lần
          for (let i = 0; i < sheetData.length; i += batchSize) {
            const batch = sheetData.slice(i, i + batchSize);
            const range = `${sheetName}!A${i + 1}:Z${i + batch.length}`;
            
            const writeResponse = await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${this.config?.spreadsheetId}/values/${range}?valueInputOption=RAW`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  values: batch
                })
              }
            );

            if (writeResponse.status === 429) {
              // Rate limiting - wait with exponential backoff
              const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
              console.log(`Rate limited (429) writing batch ${i}-${i + batch.length}, waiting ${waitTime}ms`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              i -= batchSize; // Retry batch này
              continue;
            }

            if (!writeResponse.ok) {
              throw new Error(`Lỗi ghi batch: ${writeResponse.status}`);
            }

            // Delay nhỏ giữa các batch để tránh rate limiting
            if (i + batchSize < sheetData.length) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
            }
          }
        }

        console.log(`✅ Ghi dữ liệu thành công vào sheet ${sheetName}`);
        return;
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Lỗi ghi sheet ${sheetName} (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry với exponential backoff
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw new Error(`Không thể ghi dữ liệu vào sheet ${sheetName}: ${lastError?.message}`);
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
      await this.writeSheet('ThietBi', localStorageData.thietBi);
      await this.delay(5000); // Delay 5s giữa các sheet
      
      await this.writeSheet('CoSoVatChat', localStorageData.coSoVatChat);
      await this.delay(5000);
      
      await this.writeSheet('LichSuSuDung', localStorageData.lichSuSuDung);
      await this.delay(5000);
      
      await this.writeSheet('BaoTri', localStorageData.baoTri);
      await this.delay(5000);
      
      await this.writeSheet('ThongBao', localStorageData.thongBao);
      await this.delay(5000);
      
      await this.writeSheet('NguoiDung', localStorageData.nguoiDung);

      console.log('✅ Đồng bộ tất cả dữ liệu thành công!');
    } catch (error) {
      console.error('❌ Lỗi đồng bộ dữ liệu:', error);
      throw error;
    }
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
      console.log('📥 Bắt đầu đọc tất cả dữ liệu từ Google Sheets...');

      // Đọc từng sheet với delay để tránh rate limiting
      const thietBi = await this.readSheetData('ThietBi');
      await this.delay(2000); // 2s delay

      const coSoVatChat = await this.readSheetData('CoSoVatChat');
      await this.delay(2000); // 2s delay

      const lichSuSuDung = await this.readSheetData('LichSuSuDung');
      await this.delay(2000); // 2s delay

      const baoTri = await this.readSheetData('BaoTri');
      await this.delay(2000); // 2s delay

      const thongBao = await this.readSheetData('ThongBao');
      await this.delay(2000); // 2s delay

      const nguoiDung = await this.readSheetData('NguoiDung');

      console.log('✅ Đọc tất cả dữ liệu thành công!');
      return { thietBi, coSoVatChat, lichSuSuDung, baoTri, thongBao, nguoiDung };
    } catch (error) {
      console.error('❌ Lỗi khi đọc tất cả dữ liệu:', error);
      throw error;
    }
  }

  // Đọc dữ liệu từ một sheet và chuyển đổi thành objects
  private async readSheetData(sheetName: string): Promise<any[]> {
    try {
      const rawData = await this.readSheet(sheetName);
      
      if (rawData.length < 2) {
        console.log(`📄 Sheet ${sheetName} trống hoặc chỉ có header`);
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
      console.error(`❌ Lỗi khi đọc sheet ${sheetName}:`, error);
      return [];
    }
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
      console.log('🔄 Bắt đầu đồng bộ dữ liệu từ Google Sheets...');
      
      const data = await this.readAllData();
      
      // Lưu vào localStorage
      localStorage.setItem('thietBi', JSON.stringify(data.thietBi));
      localStorage.setItem('coSoVatChat', JSON.stringify(data.coSoVatChat));
      localStorage.setItem('lichSuSuDung', JSON.stringify(data.lichSuSuDung));
      localStorage.setItem('baoTri', JSON.stringify(data.baoTri));
      localStorage.setItem('thongBao', JSON.stringify(data.thongBao));
      localStorage.setItem('nguoiDung', JSON.stringify(data.nguoiDung));
      
      console.log('✅ Đồng bộ từ Google Sheets thành công!');
      return data;
    } catch (error) {
      console.error('❌ Lỗi khi đồng bộ từ Google Sheets:', error);
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
      console.log('🔄 Bắt đầu đồng bộ hai chiều...');
      
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
      
      console.log('✅ Đồng bộ hai chiều thành công!');
    } catch (error) {
      console.error('❌ Lỗi khi đồng bộ hai chiều:', error);
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

  // Chuyển đổi dữ liệu sang format sheet (để ghi theo batch)
  private convertDataToSheetFormat(data: any[]): any[][] {
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

  // Helper function to add a delay
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

export const syncDataFromGoogleSheets = async (): Promise<{
  thietBi: any[];
  coSoVatChat: any[];
  lichSuSuDung: any[];
  baoTri: any[];
  thongBao: any[];
  nguoiDung: any[];
}> => {
  return await googleSheetsService.syncFromGoogleSheets();
};

export const testGoogleSheetsConnection = async (): Promise<boolean> => {
  return await googleSheetsService.testConnection();
}; 