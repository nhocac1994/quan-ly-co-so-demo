// Service để xử lý authentication với Google Sheets API
import { DEFAULT_GOOGLE_SHEETS_CONFIG, GoogleSheetsConfig } from './googleSheets';

export interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

class GoogleAuthService {
  private credentials: GoogleCredentials | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  // Đọc credentials từ file
  async loadCredentials(): Promise<GoogleCredentials> {
    try {
      // Trong môi trường development, đọc từ public folder
      const response = await fetch('/credentials.json');
      if (!response.ok) {
        throw new Error('Không thể đọc file credentials.json');
      }
      
      const credentials = await response.json();
      this.credentials = credentials;
      return credentials;
    } catch (error) {
      console.error('Lỗi khi đọc credentials:', error);
      throw error;
    }
  }

  // Tạo JWT token để authenticate với Google API
  private async createJWTToken(): Promise<string> {
    if (!this.credentials) {
      throw new Error('Credentials chưa được load');
    }

    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.credentials.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // Token hết hạn sau 1 giờ
      iat: now
    };

    // Encode header và payload
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));

    // Tạo signature (trong thực tế cần sử dụng thư viện crypto)
    const signature = await this.signJWT(`${encodedHeader}.${encodedPayload}`);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Sign JWT token (simplified version)
  private async signJWT(data: string): Promise<string> {
    // Trong thực tế, cần sử dụng thư viện như jsrsasign hoặc crypto
    // Đây là version đơn giản để demo
    return btoa(data);
  }

  // Lấy access token từ Google OAuth
  async getAccessToken(): Promise<string> {
    // Kiểm tra token hiện tại có còn hạn không
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const jwt = await this.createJWTToken();
      
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
        throw new Error('Không thể lấy access token');
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

      return this.accessToken || '';
    } catch (error) {
      console.error('Lỗi khi lấy access token:', error);
      throw error;
    }
  }

  // Cấu hình Google Sheets với credentials
  async configureGoogleSheets(): Promise<GoogleSheetsConfig> {
    try {
      await this.loadCredentials();
      const accessToken = await this.getAccessToken();
      
      return {
        ...DEFAULT_GOOGLE_SHEETS_CONFIG,
        apiKey: accessToken || '' // Sử dụng access token thay vì API key
      };
    } catch (error) {
      console.error('Lỗi khi cấu hình Google Sheets:', error);
      throw error;
    }
  }

  // Kiểm tra kết nối với Google Sheets
  async testConnection(): Promise<boolean> {
    try {
      const config = await this.configureGoogleSheets();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}?key=${config.apiKey}`
      );
      
      return response.ok;
    } catch (error) {
      console.error('Lỗi khi test kết nối:', error);
      return false;
    }
  }
}

export const googleAuthService = new GoogleAuthService();

// Hàm helper để khởi tạo Google Sheets
export const initializeGoogleSheets = async () => {
  try {
    const config = await googleAuthService.configureGoogleSheets();
    const isConnected = await googleAuthService.testConnection();
    
    if (isConnected) {
      console.log('✅ Kết nối Google Sheets thành công!');
      return config;
    } else {
      console.error('❌ Không thể kết nối với Google Sheets');
      return null;
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo Google Sheets:', error);
    return null;
  }
}; 