import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material';
import {
  Sync as SyncIcon,
  CloudSync as CloudSyncIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import AutoSyncManager from '../../components/AutoSyncManager/AutoSyncManager';
import SimpleSyncStatus from '../../components/SimpleSyncStatus/SimpleSyncStatus';

const QuanLyDongBo: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

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

      {/* Overview Cards */}
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
                <CloudSyncIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
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
                <SettingsIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="secondary">
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
                <AnalyticsIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    Stats
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thống kê hiệu suất
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
                <HistoryIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="info.main">
                    Log
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lịch sử đồng bộ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status & Configuration Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left Column - Status & Configuration */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              🔗 Kết Nối & Cấu Hình
            </Typography>
            <SimpleSyncStatus />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              📋 Hướng Dẫn Sử Dụng
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>💡 Mẹo:</strong> Cấu hình đồng bộ tự động để đảm bảo dữ liệu luôn được cập nhật
              </Typography>
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              • <strong>Chu kỳ đồng bộ:</strong> Điều chỉnh tần suất đồng bộ theo nhu cầu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              • <strong>Chế độ đồng bộ:</strong> Chọn cách thức đồng bộ phù hợp
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Thống kê:</strong> Theo dõi hiệu suất và độ tin cậy
            </Typography>
          </Paper>
        </Grid>

        {/* Right Column - Empty space for balance */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary" align="center">
              📊 Khu vực này có thể được sử dụng cho các tính năng bổ sung trong tương lai
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Auto Sync Manager - Full Width */}
      <Box sx={{ width: '100%' }}>
        <AutoSyncManager />
      </Box>

      {/* Footer Information */}
      <Box mt={4}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          🔒 Dữ liệu được bảo mật và đồng bộ an toàn với Google Sheets
        </Typography>
      </Box>
    </Container>
  );
};

export default QuanLyDongBo; 