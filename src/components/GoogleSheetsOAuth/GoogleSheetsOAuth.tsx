import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  CloudSync as CloudSyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Login as LoginIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { googleOAuthService, initializeGoogleOAuth, syncDataWithOAuth } from '../../services/googleOAuth';
import { 
  initializeGoogleServiceAccount, 
  syncDataWithServiceAccount,
  syncFromGoogleSheetsWithServiceAccount,
  syncBidirectionalWithServiceAccount
} from '../../services/googleServiceAccount';
import { 
  thietBiService, 
  coSoVatChatService, 
  lichSuSuDungService, 
  baoTriService, 
  thongBaoService, 
  nguoiDungService 
} from '../../services/localStorage';
import OAuthConfig from '../OAuthConfig/OAuthConfig';
import OAuthSetupGuide from '../OAuthSetupGuide/OAuthSetupGuide';
import OAuthTestUsers from '../OAuthTestUsers/OAuthTestUsers';
import OAuthDebug from '../OAuthDebug/OAuthDebug';
import OAuthQuickSetup from '../OAuthQuickSetup/OAuthQuickSetup';
import ServiceAccountSetup from '../ServiceAccountSetup/ServiceAccountSetup';

interface SyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  error: string | null;
}

const GoogleSheetsOAuth: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSync: null,
    error: null
  });
  const [showOAuthDialog, setShowOAuthDialog] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [showServiceAccount, setShowServiceAccount] = useState(false);

  // Lấy OAuth config từ localStorage
  const getStoredOAuthConfig = () => {
    const clientId = localStorage.getItem('google_oauth_client_id') || '';
    const clientSecret = localStorage.getItem('google_oauth_client_secret') || '';
    const redirectUri = localStorage.getItem('google_oauth_redirect_uri') || window.location.origin + '/oauth-callback';
    
    return { clientId, clientSecret, redirectUri };
  };

  // Lưu OAuth config vào localStorage
  const saveOAuthConfig = (config: { clientId: string; clientSecret: string; redirectUri: string }) => {
    localStorage.setItem('google_oauth_client_id', config.clientId);
    localStorage.setItem('google_oauth_client_secret', config.clientSecret);
    localStorage.setItem('google_oauth_redirect_uri', config.redirectUri);
    
    // Khởi tạo OAuth service
    initializeGoogleOAuth({
      ...config,
      scope: 'https://www.googleapis.com/auth/spreadsheets'
    });
    
    checkConnection();
  };

  useEffect(() => {
    // Khởi tạo OAuth config nếu có
    const config = getStoredOAuthConfig();
    if (config.clientId && config.clientSecret) {
      initializeGoogleOAuth({
        ...config,
        scope: 'https://www.googleapis.com/auth/spreadsheets'
      });
    }
    
    checkConnection();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkConnection = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      
      // Kiểm tra Service Account trước
      const serviceAccountCredentials = localStorage.getItem('serviceAccountCredentials');
      const serviceAccountSpreadsheetId = localStorage.getItem('serviceAccountSpreadsheetId');
      
      if (serviceAccountCredentials && serviceAccountSpreadsheetId) {
        try {
          const credentials = JSON.parse(serviceAccountCredentials);
          const isConnected = await initializeGoogleServiceAccount(serviceAccountSpreadsheetId, credentials);
          
          if (isConnected) {
            setSyncStatus(prev => ({ 
              ...prev, 
              isConnected: true, 
              isSyncing: false,
              error: null 
            }));
            return;
          }
        } catch (error) {
          console.log('Service Account không khả dụng, thử OAuth...');
        }
      }
      
      // Fallback sang OAuth nếu Service Account không có
      const config = getStoredOAuthConfig();
      if (!config.clientId || !config.clientSecret) {
        setSyncStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          isSyncing: false,
          error: 'Chưa cấu hình kết nối. Vui lòng sử dụng Service Account hoặc OAuth.' 
        }));
        return;
      }

      const isConnected = await googleOAuthService.testConnection();
      
      if (isConnected) {
        setSyncStatus(prev => ({ 
          ...prev, 
          isConnected: true, 
          isSyncing: false,
          error: null 
        }));
      } else {
        setSyncStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          isSyncing: false,
          error: 'Chưa đăng nhập Google. Vui lòng đăng nhập.' 
        }));
      }
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      }));
    }
  };

  const handleLogin = () => {
    try {
      googleOAuthService.initializeOAuth();
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Lỗi khi khởi tạo OAuth' 
      }));
    }
  };

  const syncToGoogleSheets = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      
      // Lấy dữ liệu từ localStorage
      const localStorageData = {
        thietBi: thietBiService.getAll(),
        coSoVatChat: coSoVatChatService.getAll(),
        lichSuSuDung: lichSuSuDungService.getAll(),
        baoTri: baoTriService.getAll(),
        thongBao: thongBaoService.getAll(),
        nguoiDung: nguoiDungService.getAll()
      };

      // Kiểm tra Service Account trước
      const serviceAccountCredentials = localStorage.getItem('serviceAccountCredentials');
      const serviceAccountSpreadsheetId = localStorage.getItem('serviceAccountSpreadsheetId');
      
      if (serviceAccountCredentials && serviceAccountSpreadsheetId) {
        // Sử dụng Service Account
        await syncDataWithServiceAccount(localStorageData);
      } else {
        // Fallback sang OAuth
        await syncDataWithOAuth(localStorageData);
      }
      
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        lastSync: new Date().toLocaleString('vi-VN'),
        error: null 
      }));
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Lỗi khi đồng bộ' 
      }));
    }
  };

  const syncFromGoogleSheets = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      
      // Kiểm tra Service Account trước
      const serviceAccountCredentials = localStorage.getItem('serviceAccountCredentials');
      const serviceAccountSpreadsheetId = localStorage.getItem('serviceAccountSpreadsheetId');
      
      if (serviceAccountCredentials && serviceAccountSpreadsheetId) {
        // Sử dụng Service Account
        await syncFromGoogleSheetsWithServiceAccount();
      } else {
        // TODO: Implement OAuth sync from Google Sheets
        console.log('OAuth sync from Google Sheets chưa được implement');
      }
      
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        lastSync: new Date().toLocaleString('vi-VN'),
        error: null 
      }));
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Lỗi khi đồng bộ' 
      }));
    }
  };

  const syncBidirectional = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      
      // Lấy dữ liệu từ localStorage
      const localStorageData = {
        thietBi: thietBiService.getAll(),
        coSoVatChat: coSoVatChatService.getAll(),
        lichSuSuDung: lichSuSuDungService.getAll(),
        baoTri: baoTriService.getAll(),
        thongBao: thongBaoService.getAll(),
        nguoiDung: nguoiDungService.getAll()
      };

      // Kiểm tra Service Account trước
      const serviceAccountCredentials = localStorage.getItem('serviceAccountCredentials');
      const serviceAccountSpreadsheetId = localStorage.getItem('serviceAccountSpreadsheetId');
      
      if (serviceAccountCredentials && serviceAccountSpreadsheetId) {
        // Sử dụng Service Account
        await syncBidirectionalWithServiceAccount(localStorageData);
      } else {
        // TODO: Implement OAuth bidirectional sync
        console.log('OAuth bidirectional sync chưa được implement');
      }
      
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        lastSync: new Date().toLocaleString('vi-VN'),
        error: null 
      }));
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Lỗi khi đồng bộ hai chiều' 
      }));
    }
  };

  const handleLogout = () => {
    googleOAuthService.logout();
    setSyncStatus(prev => ({ 
      ...prev, 
      isConnected: false,
      error: null 
    }));
  };

  return (
    <>
      <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              Đồng Bộ Google Sheets
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Debug Kết Nối">
                <IconButton onClick={() => setShowDebug(true)}>
                  <BugReportIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Kiểm tra kết nối">
                <IconButton onClick={checkConnection} disabled={syncStatus.isSyncing}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Trạng thái kết nối */}
          <Box display="flex" alignItems="center" mb={2}>
            <Chip
              icon={syncStatus.isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
              label={syncStatus.isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
              color={syncStatus.isConnected ? 'success' : 'error'}
              variant="outlined"
              sx={{ mr: 2 }}
            />
            {syncStatus.lastSync && (
              <Typography variant="body2" color="text.secondary">
                Lần đồng bộ cuối: {syncStatus.lastSync}
              </Typography>
            )}
          </Box>

          {/* Thông báo lỗi */}
          {syncStatus.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>{syncStatus.error}</Typography>
                <Box display="flex" gap={1}>
                  {syncStatus.error.includes('redirect_uri_mismatch') && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setShowSetupGuide(true)}
                    >
                      Sửa Lỗi URI
                    </Button>
                  )}
                  {syncStatus.error.includes('chưa hoàn tất quy trình xác minh') && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setShowTestUsers(true)}
                    >
                      Thêm Test User
                    </Button>
                  )}
                </Box>
              </Box>
            </Alert>
          )}

          {/* Nút đồng bộ */}
          <Box display="flex" gap={2}>
            {!syncStatus.isConnected ? (
              <>
                <Button
                  variant="contained"
                  onClick={() => setShowServiceAccount(true)}
                  sx={{
                    backgroundColor: '#ff9800',
                    '&:hover': { backgroundColor: '#f57c00' },
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  🔐 Service Account (Khuyến nghị)
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowQuickSetup(true)}
                  sx={{
                    borderColor: '#4caf50',
                    color: '#4caf50',
                    '&:hover': { 
                      borderColor: '#45a049',
                      backgroundColor: '#f1f8e9'
                    }
                  }}
                >
                  OAuth Nhanh
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowOAuthDialog(true)}
                  sx={{
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': { 
                      borderColor: '#1565c0',
                      backgroundColor: '#e3f2fd'
                    }
                  }}
                >
                  OAuth Thủ Công
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={syncStatus.isSyncing ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  onClick={syncToGoogleSheets}
                  disabled={syncStatus.isSyncing}
                  sx={{
                    backgroundColor: '#4caf50',
                    '&:hover': { backgroundColor: '#45a049' },
                    '&:disabled': { backgroundColor: '#ccc' }
                  }}
                >
                  {syncStatus.isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ lên Google Sheets'}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<CloudDownloadIcon />}
                  onClick={syncFromGoogleSheets}
                  disabled={syncStatus.isSyncing}
                  sx={{
                    borderColor: '#2196f3',
                    color: '#2196f3',
                    '&:hover': { 
                      borderColor: '#1976d2',
                      backgroundColor: '#e3f2fd'
                    }
                  }}
                >
                  Đồng bộ từ Google Sheets
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloudSyncIcon />}
                  onClick={syncBidirectional}
                  disabled={syncStatus.isSyncing}
                  sx={{
                    borderColor: '#9c27b0',
                    color: '#9c27b0',
                    '&:hover': { 
                      borderColor: '#7b1fa2',
                      backgroundColor: '#f3e5f5'
                    }
                  }}
                >
                  Đồng bộ hai chiều
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                >
                  Đăng Xuất
                </Button>
              </>
            )}
          </Box>

          {/* Thông tin bổ sung */}
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              📊 Google Sheets: 
              <a 
                href="https://docs.google.com/spreadsheets/d/1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No/edit" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ marginLeft: '8px', color: '#1976d2' }}
              >
                Xem bảng tính
              </a>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              💡 <strong>Khuyến nghị:</strong> Sử dụng Service Account để có trải nghiệm đơn giản và ổn định nhất
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              🔄 <strong>Chức năng đồng bộ:</strong>
            </Typography>
            <Box sx={{ ml: 2, mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                • <strong>Đồng bộ lên:</strong> Ghi dữ liệu từ ứng dụng lên Google Sheets
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Đồng bộ từ:</strong> Đọc dữ liệu từ Google Sheets về ứng dụng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Đồng bộ hai chiều:</strong> Merge dữ liệu từ cả hai nguồn (ưu tiên dữ liệu mới nhất)
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog cấu hình OAuth */}
      <OAuthConfig
        open={showOAuthDialog}
        onClose={() => setShowOAuthDialog(false)}
        onSave={saveOAuthConfig}
      />

      {/* Dialog hướng dẫn cấu hình */}
      <OAuthSetupGuide
        open={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
      />

      {/* Dialog thêm test users */}
      <OAuthTestUsers
        open={showTestUsers}
        onClose={() => setShowTestUsers(false)}
      />

      {/* Dialog debug OAuth */}
      <OAuthDebug
        open={showDebug}
        onClose={() => setShowDebug(false)}
      />

      {/* Dialog cấu hình nhanh */}
      <OAuthQuickSetup
        open={showQuickSetup}
        onClose={() => setShowQuickSetup(false)}
        onSuccess={() => {
          checkConnection();
          setShowQuickSetup(false);
        }}
      />

      {/* Dialog Service Account */}
      <ServiceAccountSetup
        open={showServiceAccount}
        onClose={() => setShowServiceAccount(false)}
        onSuccess={() => {
          checkConnection();
          setShowServiceAccount(false);
        }}
      />
    </>
  );
};

export default GoogleSheetsOAuth; 