import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import {
  CloudSync as CloudSyncIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAutoSync } from '../../contexts/AutoSyncContext';
import AutoSyncManager from '../../components/AutoSyncManager/AutoSyncManager';
import AutoSyncStatus from '../../components/AutoSyncStatus/AutoSyncStatus';

const QuanLyDongBo: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { status } = useAutoSync();

  useEffect(() => {
    // Cập nhật thời gian mỗi giây
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          🔄 Quản Lý Đồng Bộ Dữ Liệu
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi việc đồng bộ dữ liệu với Google Sheets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Cập nhật lần cuối: {lastUpdate.toLocaleString('vi-VN')}
        </Typography>
      </Box>

      {/* Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CloudSyncIcon 
                  color={status.isConnected ? "success" : "error"} 
                  sx={{ fontSize: 40, mr: 2 }} 
                />
                <Box>
                  <Typography variant="h4" color={status.isConnected ? "success.main" : "error.main"}>
                    {status.isConnected ? "Online" : "Offline"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái kết nối
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SettingsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    Config
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cấu hình hệ thống
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    Auto
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đồng bộ tự động
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ErrorIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    Error
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lỗi kết nối
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            🔗 Trạng Thái Kết Nối
          </Typography>
          <AutoSyncStatus />
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            ⚙️ Cấu Hình Đồng Bộ
          </Typography>
          <AutoSyncManager />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            📖 Hướng Dẫn Sử Dụng
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>💡 Mẹo:</strong> Đảm bảo đã cấu hình đúng Service Account credentials trên Vercel
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • <strong>REACT_APP_GOOGLE_SPREADSHEET_ID:</strong> ID của Google Sheets
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • <strong>REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL:</strong> Email của Service Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>REACT_APP_GOOGLE_PRIVATE_KEY:</strong> Private key của Service Account
          </Typography>
        </CardContent>
      </Card>

      {/* Error Display */}
      {status.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1">
            <strong>Lỗi kết nối:</strong> {status.error}
          </Typography>
        </Alert>
      )}

      {/* Footer */}
      <Box mt={4}>
        <Typography variant="body2" color="text.secondary" align="center">
          🔒 Dữ liệu được bảo mật và đồng bộ an toàn với Google Sheets
        </Typography>
      </Box>
    </Container>
  );
};

export default QuanLyDongBo; 