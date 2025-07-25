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
  CloudSync as CloudSyncIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { initializeGoogleSheetsWithAPIKey, syncDataToGoogleSheetsSimple } from '../../services/googleSheetsSimple';
import { 
  thietBiService, 
  coSoVatChatService, 
  lichSuSuDungService, 
  baoTriService, 
  thongBaoService, 
  nguoiDungService 
} from '../../services/localStorage';
import APIKeyInput from '../APIKeyInput/APIKeyInput';

interface SyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  error: string | null;
}

const GoogleSheetsSync: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSync: null,
    error: null
  });
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false);

  // Lấy API key từ localStorage
  const getStoredAPIKey = (): string => {
    return localStorage.getItem('googleSheetsAPIKey') || '';
  };

  // Lưu API key vào localStorage
  const saveAPIKey = (apiKey: string) => {
    localStorage.setItem('googleSheetsAPIKey', apiKey);
    checkConnection(); // Kiểm tra kết nối ngay sau khi lưu
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      
      const apiKey = getStoredAPIKey();
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        setSyncStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          isSyncing: false,
          error: 'Chưa cấu hình API key. Vui lòng nhập API key.' 
        }));
        return;
      }

      const isConnected = await initializeGoogleSheetsWithAPIKey(apiKey);
      
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
          error: 'Không thể kết nối với Google Sheets. Vui lòng kiểm tra API key.' 
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

      // Đồng bộ lên Google Sheets
      await syncDataToGoogleSheetsSimple(localStorageData);
      
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
      
      // TODO: Implement sync from Google Sheets to localStorage
      // Đây là tính năng nâng cao, cần thêm logic để merge dữ liệu
      
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

  return (
    <>
      <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              Đồng Bộ Google Sheets
            </Typography>
            <Tooltip title="Kiểm tra kết nối">
              <IconButton onClick={checkConnection} disabled={syncStatus.isSyncing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
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
              {syncStatus.error}
            </Alert>
          )}

          {/* Nút đồng bộ */}
          <Box display="flex" gap={2}>
            {!syncStatus.isConnected ? (
              <Button
                variant="contained"
                onClick={() => setShowAPIKeyDialog(true)}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                Cấu Hình API Key
              </Button>
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
                >
                  Đồng bộ từ Google Sheets
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
          </Box>
        </CardContent>
      </Card>

      {/* Dialog nhập API Key */}
      <APIKeyInput
        open={showAPIKeyDialog}
        onClose={() => setShowAPIKeyDialog(false)}
        onSave={saveAPIKey}
      />
    </>
  );
};

export default GoogleSheetsSync; 