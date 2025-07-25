import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  CloudSync as CloudSyncIcon
} from '@mui/icons-material';
import { initializeGoogleServiceAccount } from '../../services/googleServiceAccount';
import ServiceAccountSetup from '../ServiceAccountSetup/ServiceAccountSetup';

interface SyncStatus {
  isConnected: boolean;
  lastSync: string | null;
  error: string | null;
}

const SimpleSyncStatus: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    lastSync: null,
    error: null
  });
  const [showServiceAccount, setShowServiceAccount] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const serviceAccountCredentials = localStorage.getItem('serviceAccountCredentials');
      const serviceAccountSpreadsheetId = localStorage.getItem('serviceAccountSpreadsheetId');
      
      if (serviceAccountCredentials && serviceAccountSpreadsheetId) {
        const credentials = JSON.parse(serviceAccountCredentials);
        const isConnected = await initializeGoogleServiceAccount(serviceAccountSpreadsheetId, credentials);
        
        setSyncStatus(prev => ({ 
          ...prev, 
          isConnected,
          error: isConnected ? null : 'Không thể kết nối với Google Sheets'
        }));
      } else {
        setSyncStatus(prev => ({ 
          ...prev, 
          isConnected: false,
          error: 'Chưa cấu hình Service Account'
        }));
      }
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isConnected: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định'
      }));
    }
  };

  return (
    <>
      <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              📡 Kiểm Tra Kết Nối
            </Typography>
            <Tooltip title="Cấu hình Service Account">
              <IconButton onClick={() => setShowServiceAccount(true)}>
                <SettingsIcon />
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

          {/* Nút cấu hình */}
          {!syncStatus.isConnected && (
            <Button
              variant="contained"
              onClick={() => setShowServiceAccount(true)}
              startIcon={<CloudSyncIcon />}
              sx={{
                backgroundColor: '#ff9800',
                '&:hover': { backgroundColor: '#f57c00' }
              }}
            >
              Cấu Hình Service Account
            </Button>
          )}

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
              💡 <strong>Lưu ý:</strong> Đồng bộ tự động sẽ được quản lý ở phần bên dưới
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog cấu hình Service Account */}
      <ServiceAccountSetup
        open={showServiceAccount}
        onClose={() => {
          setShowServiceAccount(false);
          checkConnection(); // Kiểm tra lại kết nối sau khi cấu hình
        }}
        onSuccess={() => {
          setShowServiceAccount(false);
          checkConnection(); // Kiểm tra lại kết nối sau khi cấu hình thành công
        }}
      />
    </>
  );
};

export default SimpleSyncStatus; 