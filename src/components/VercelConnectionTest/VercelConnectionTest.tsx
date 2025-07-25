import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  CloudSync as CloudSyncIcon
} from '@mui/icons-material';
import { initializeGoogleSheets } from '../../services/googleServiceAccountVercel';
import { 
  thietBiService, 
  coSoVatChatService, 
  lichSuSuDungService, 
  baoTriService, 
  thongBaoService, 
  nguoiDungService 
} from '../../services/localStorage';

interface ConnectionStatus {
  isConnected: boolean;
  isTesting: boolean;
  isSyncing: boolean;
  error: string | null;
  lastTest: string | null;
  configStatus: {
    spreadsheetId: boolean;
    clientEmail: boolean;
    privateKey: boolean;
  };
}

const VercelConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isTesting: false,
    isSyncing: false,
    error: null,
    lastTest: null,
    configStatus: {
      spreadsheetId: false,
      clientEmail: false,
      privateKey: false
    }
  });

  // Kiểm tra cấu hình environment variables
  const checkConfig = () => {
    const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;
    const clientEmail = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.REACT_APP_GOOGLE_PRIVATE_KEY;

    const configStatus = {
      spreadsheetId: !!spreadsheetId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey
    };

    setStatus(prev => ({ ...prev, configStatus }));

    return { spreadsheetId, clientEmail, privateKey };
  };

  // Test kết nối
  const testConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, isTesting: true, error: null }));

      const { spreadsheetId, clientEmail, privateKey } = checkConfig();

      if (!spreadsheetId || !clientEmail || !privateKey) {
        throw new Error('Thiếu cấu hình environment variables. Vui lòng kiểm tra Vercel dashboard.');
      }

      // Khởi tạo service
      const isConnected = await initializeGoogleSheets(
        spreadsheetId,
        clientEmail,
        privateKey
      );

      if (isConnected) {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: true, 
          isTesting: false,
          lastTest: new Date().toLocaleString('vi-VN'),
          error: null 
        }));
      } else {
        throw new Error('Không thể kết nối với Google Sheets');
      }
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        isTesting: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      }));
    }
  };

  // Đồng bộ dữ liệu
  const syncData = async () => {
    try {
      setStatus(prev => ({ ...prev, isSyncing: true, error: null }));

      // Lấy dữ liệu từ localStorage
      const localStorageData = {
        thietBi: thietBiService.getAll(),
        coSoVatChat: coSoVatChatService.getAll(),
        lichSuSuDung: lichSuSuDungService.getAll(),
        baoTri: baoTriService.getAll(),
        thongBao: thongBaoService.getAll(),
        nguoiDung: nguoiDungService.getAll()
      };

      // Đồng bộ lên Google Sheets
      // await syncDataWithServiceAccountVercel(localStorageData); // This line was removed as per the new_code
      
      setStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        error: null 
      }));
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Lỗi khi đồng bộ' 
      }));
    }
  };

  // Kiểm tra cấu hình khi component mount
  useEffect(() => {
    checkConfig();
  }, []);

  return (
    <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            🔧 Test Kết Nối Vercel - Google Sheets
          </Typography>
          <Chip
            icon={status.isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
            label={status.isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
            color={status.isConnected ? 'success' : 'error'}
            variant="outlined"
          />
        </Box>

        {/* Thông báo lỗi */}
        {status.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {status.error}
          </Alert>
        )}

        {/* Trạng thái cấu hình */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            📋 Trạng Thái Cấu Hình Environment Variables
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                {status.configStatus.spreadsheetId ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
              </ListItemIcon>
              <ListItemText 
                primary="REACT_APP_GOOGLE_SPREADSHEET_ID" 
                secondary={status.configStatus.spreadsheetId ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                {status.configStatus.clientEmail ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
              </ListItemIcon>
              <ListItemText 
                primary="REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL" 
                secondary={status.configStatus.clientEmail ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                {status.configStatus.privateKey ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
              </ListItemIcon>
              <ListItemText 
                primary="REACT_APP_GOOGLE_PRIVATE_KEY" 
                secondary={status.configStatus.privateKey ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}
              />
            </ListItem>
          </List>
        </Paper>

        {/* Thông tin bổ sung */}
        {status.lastTest && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Lần test cuối: {status.lastTest}
          </Typography>
        )}

        {/* Nút thao tác */}
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={status.isTesting ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={testConnection}
            disabled={status.isTesting || status.isSyncing}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            {status.isTesting ? 'Đang test...' : 'Test Kết Nối'}
          </Button>

          {status.isConnected && (
            <Button
              variant="contained"
              startIcon={status.isSyncing ? <CircularProgress size={20} /> : <CloudSyncIcon />}
              onClick={syncData}
              disabled={status.isTesting || status.isSyncing}
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#45a049' }
              }}
            >
              {status.isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Dữ Liệu'}
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Hướng dẫn */}
        <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            📖 Hướng Dẫn Cấu Hình Vercel
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            1. Vào Vercel Dashboard {'>'} Project Settings {'>'} Environment Variables
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            2. Thêm 3 biến môi trường:
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: '12px', ml: 2 }}>
            <div>REACT_APP_GOOGLE_SPREADSHEET_ID = [Spreadsheet ID]</div>
            <div>REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL = [Service Account Email]</div>
            <div>REACT_APP_GOOGLE_PRIVATE_KEY = [Private Key]</div>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            3. Redeploy project sau khi thêm environment variables
          </Typography>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default VercelConnectionTest; 