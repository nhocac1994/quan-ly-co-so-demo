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
  Portal
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
import GoogleSheetsDebug from '../../components/GoogleSheetsDebug/GoogleSheetsDebug';

const QuanLyDongBo: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
    <Box sx={{ p: { xs: 0, md: 3 }, pb: { xs: '100px', md: 3 } }}>
      {/* Mobile Header */}
      {isMobile && (
        <Portal>
          <Box
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

      {/* Spacer for mobile header */}
      {isMobile && <Box sx={{ height: '60px' }} />}

      {/* Desktop Header */}
      {!isMobile && (
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
      )}

      {/* Status Overview */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box display="flex" alignItems="center">
                <CloudSyncIcon 
                  color={status.isConnected ? "success" : "error"} 
                  sx={{ fontSize: isMobile ? 32 : 40, mr: 2 }} 
                />
                <Box>
                  <Typography variant={isMobile ? "h5" : "h4"} color={status.isConnected ? "success.main" : "error.main"} sx={{ fontWeight: 600 }}>
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

        <Grid item xs={12} sm={6} md={3}>
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
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box display="flex" alignItems="center">
                <SettingsIcon color="primary" sx={{ fontSize: isMobile ? 32 : 40, mr: 2 }} />
                <Box>
                  <Typography variant={isMobile ? "h5" : "h4"} color="primary" sx={{ fontWeight: 600 }}>
                    Config
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Cấu hình hệ thống
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon 
                  color={status.isRunning ? "success" : "disabled"} 
                  sx={{ fontSize: isMobile ? 32 : 40, mr: 2 }} 
                />
                <Box>
                  <Typography variant={isMobile ? "h5" : "h4"} color={status.isRunning ? "success.main" : "text.disabled"} sx={{ fontWeight: 600 }}>
                    {status.isRunning ? "Đang chạy" : "Dừng"}
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Trạng thái đồng bộ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box display="flex" alignItems="center">
                <ErrorIcon 
                  color={status.error ? "error" : "disabled"} 
                  sx={{ fontSize: isMobile ? 32 : 40, mr: 2 }} 
                />
                <Box>
                  <Typography variant={isMobile ? "h5" : "h4"} color={status.error ? "error.main" : "text.disabled"} sx={{ fontWeight: 600 }}>
                    {status.error ? "Lỗi" : "OK"}
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Trạng thái lỗi
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Auto Sync Manager */}
      <Card className="stagger-item hover-lift" sx={{ 
        mb: isMobile ? 2 : 4,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            ⚙️ Cấu Hình Đồng Bộ Tự Động
          </Typography>
          <AutoSyncManager />
        </CardContent>
      </Card>

      {/* Auto Sync Status */}
      <Card className="stagger-item hover-lift" sx={{ 
        mb: isMobile ? 2 : 4,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            📊 Trạng Thái Đồng Bộ
          </Typography>
          <AutoSyncStatus />
        </CardContent>
      </Card>

      {/* Google Sheets Debug */}
      <Card className="stagger-item hover-lift" sx={{ 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            🔧 Debug Google Sheets
          </Typography>
          <GoogleSheetsDebug />
        </CardContent>
      </Card>

      {/* Mobile Last Update Info */}
      {isMobile && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Cập nhật: {lastUpdate.toLocaleString('vi-VN')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default QuanLyDongBo; 