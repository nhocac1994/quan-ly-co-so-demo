// Service OAuth 2.0 để tích hợp với Google Sheets API

// Cấu hình mặc định cho OAuth
const OAUTH_CONFIG = {
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

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

class GoogleOAuthService {
  private config: OAuthConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  setConfig(config: OAuthConfig) {
    this.config = config;
  }

  // Khởi tạo OAuth flow
  initializeOAuth(): void {
    if (!this.config) {
      throw new Error('Chưa cấu hình OAuth');
    }

    // Lưu trạng thái để tránh CSRF
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);

    // Tạo URL OAuth
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', this.config.clientId);
    authUrl.searchParams.append('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', this.config.scope);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');

    // Mở popup hoặc redirect
    window.open(authUrl.toString(), 'google_oauth', 'width=500,height=600');
  }

  // Xử lý callback từ OAuth
  async handleOAuthCallback(code: string, state: string): Promise<boolean> {
    if (!this.config) {
      throw new Error('Chưa cấu hình OAuth');
    }

    // Kiểm tra state để tránh CSRF
    const savedState = sessionStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }

    try {
      // Đổi code lấy access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

      // Lưu token vào localStorage
      localStorage.setItem('google_oauth_token', this.accessToken || '');
      localStorage.setItem('google_oauth_expiry', this.tokenExpiry.toString());

      return true;
    } catch (error) {
      console.error('OAuth callback error:', error);
      return false;
    }
  }

  // Lấy access token (từ localStorage hoặc refresh)
  async getAccessToken(): Promise<string> {
    // Kiểm tra token hiện tại
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Thử lấy từ localStorage
    const storedToken = localStorage.getItem('google_oauth_token');
    const storedExpiry = localStorage.getItem('google_oauth_expiry');

    if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry || '0')) {
      this.accessToken = storedToken;
      this.tokenExpiry = parseInt(storedExpiry || '0');
      return this.accessToken;
    }

    // Token hết hạn, cần refresh hoặc re-authenticate
    throw new Error('Access token expired. Please re-authenticate.');
  }

  // Kiểm tra kết nối với Google Sheets
  async testConnection(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${OAUTH_CONFIG.spreadsheetId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error('Test connection error:', error);
      return false;
    }
  }

  // Đọc dữ liệu từ Google Sheets
  async readRange(range: string): Promise<any[][]> {
    const accessToken = await this.getAccessToken();
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${OAUTH_CONFIG.spreadsheetId}/values/${range}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  }

  // Ghi dữ liệu vào Google Sheets
  async writeRange(range: string, values: any[][]): Promise<void> {
    const accessToken = await this.getAccessToken();
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${OAUTH_CONFIG.spreadsheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
  }

  // Đồng bộ dữ liệu lên Google Sheets
  async syncToGoogleSheets(localData: any, sheetName: string): Promise<void> {
    try {
      const values = this.convertDataToSheetFormat(localData);
      const range = OAUTH_CONFIG.ranges[sheetName as keyof typeof OAUTH_CONFIG.ranges];
      await this.writeRange(range, values);
      console.log(`✅ Đã đồng bộ dữ liệu ${sheetName} lên Google Sheets`);
    } catch (error) {
      console.error(`❌ Lỗi khi đồng bộ ${sheetName}:`, error);
      throw error;
    }
  }

  // Chuyển đổi dữ liệu sang format Google Sheets
  private convertDataToSheetFormat(data: any[]): any[][] {
    if (data.length === 0) return [];

    const headers = Object.keys(data[0]);
    const rows = [headers];

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

  // Đăng xuất
  logout(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('google_oauth_token');
    localStorage.removeItem('google_oauth_expiry');
    sessionStorage.removeItem('oauth_state');
  }
}

export const googleOAuthService = new GoogleOAuthService();

// Hàm helper để khởi tạo OAuth
export const initializeGoogleOAuth = (config: OAuthConfig): void => {
  googleOAuthService.setConfig(config);
};

// Hàm helper để đồng bộ dữ liệu
export const syncDataWithOAuth = async (localStorageData: any): Promise<void> => {
  await googleOAuthService.syncAllData(localStorageData);
}; 