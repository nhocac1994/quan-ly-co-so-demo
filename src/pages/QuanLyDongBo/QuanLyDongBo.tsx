import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  useTheme,
  useMediaQuery,
  Portal,
  Button,
  Chip
} from '@mui/material';
import {
  CloudSync as CloudSyncIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useAutoSync } from '../../contexts/AutoSyncContext';
import AutoSyncManager from '../../components/AutoSyncManager/AutoSyncManager';
import AutoSyncStatus from '../../components/AutoSyncStatus/AutoSyncStatus';
import GoogleSheetsDebug from '../../components/GoogleSheetsDebug/GoogleSheetsDebug';

const QuanLyDongBo: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { status, refreshData, forceSync, forceDownloadFromSheets, isRateLimited } = useAutoSync();

  useEffect(() => {
    // Cập nhật thời gian mỗi giây
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefreshData = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Lỗi khi refresh dữ liệu:', error);
    }
  };

  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Lỗi khi force sync:', error);
    }
  };

  const handleForceDownload = async () => {
    try {
      await forceDownloadFromSheets();
    } catch (error) {
      console.error('Lỗi khi force download:', error);
    }
  };

  return (
    <Box sx={{ p: { xs: 0, md: 3 }, pb: { xs: '100px', md: 3 } }}>
      {/* Mobile Header */}
      {isMobile && (
        <Portal>
          <Box
            data-fixed-header
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              backgroundColor: 'white',
              borderBottom: '1px solid',
              borderColor: 'divider',
              pt: 2,
              pb: 2,
              px: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              🔄 Quản Lý Đồng Bộ
            </Typography>
          </Box>
        </Portal>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Box mb={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
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
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleForceDownload}
                disabled={status.isProcessing || isRateLimited}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Tải Dữ Liệu Mới
              </Button>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleForceSync}
                disabled={status.isProcessing || isRateLimited}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Đồng Bộ Ngay
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Status Cards */}
      <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: isMobile ? 2 : 4 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card className="stagger-item hover-lift" sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
              <Box display="flex" alignItems="center">
                <CloudSyncIcon 
                  color={status.isConnected ? "success" : "error"} 
                  sx={{ fontSize: isMobile ? 28 : 40, mr: isMobile ? 1 : 2 }} 
                />
                <Box>
                  <Typography variant={isMobile ? "h6" : "h4"} color={status.isConnected ? "success.main" : "error.main"} sx={{ fontWeight: 600 }}>
                    {status.isConnected ? "Online" : "Offline"}
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Trạng thái kết nối
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card className="stagger-item hover-lift" sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
              <Box display="flex" alignItems="center">
                <SettingsIcon color="primary" sx={{ fontSize: isMobile ? 28 : 40, mr: isMobile ? 1 : 2 }} />
                <Box>
                  <Typography variant={isMobile ? "h6" : "h4"} color="primary" sx={{ fontWeight: 600 }}>
                    {status.syncCount}
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Lần đồng bộ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card className="stagger-item hover-lift" sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ fontSize: isMobile ? 28 : 40, mr: isMobile ? 1 : 2 }} />
                <Box>
                  <Typography variant={isMobile ? "h6" : "h4"} color="success.main" sx={{ fontWeight: 600 }}>
                    {status.dataVersion}
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Phiên bản dữ liệu
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card className="stagger-item hover-lift" sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
              <Box display="flex" alignItems="center">
                <RefreshIcon color="info" sx={{ fontSize: isMobile ? 28 : 40, mr: isMobile ? 1 : 2 }} />
                <Box>
                  <Typography variant={isMobile ? "h6" : "h4"} color="info.main" sx={{ fontWeight: 600 }}>
                    {status.queueLength}
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Hàng chờ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons for Mobile */}
      {isMobile && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleForceDownload}
                disabled={status.isProcessing || isRateLimited}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 1.5
                }}
              >
                Tải Dữ Liệu Mới
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleForceSync}
                disabled={status.isProcessing || isRateLimited}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 1.5
                }}
              >
                Đồng Bộ Ngay
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Status Information */}
      {status.lastDataUpdate && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Dữ liệu cuối cập nhật:</strong> {status.lastDataUpdate}
          </Typography>
        </Alert>
      )}

      {isRateLimited && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>⚠️ Rate Limiting:</strong> Đang tạm dừng đồng bộ để tránh bị chặn API. Sẽ tự động khôi phục sau 30 giây.
          </Typography>
        </Alert>
      )}

      {status.error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Lỗi:</strong> {status.error}
          </Typography>
        </Alert>
      )}

      {/* Components */}
      <AutoSyncManager />
      <AutoSyncStatus />
      <GoogleSheetsDebug />
    </Box>
  );
};

export default QuanLyDongBo; 